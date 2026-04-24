/**
 * DSE 修練所 - 後端核心程式 (V65: 雙軌制功課 + LockService 防連點 + 分數合理性查核)
 * 運行於 Google 美國資料中心
 */

// 🚨 請在這裡直接貼上你的 API 金鑰！
const GEMINI_API_KEY = "請在這裡直接貼上你的API金鑰"; 
const BACKEND_VERSION = "V65";

// 🔐 系統最高機密金鑰 (Salt) - 用來產生數位簽章，絕對不可讓學生知道
const SECURITY_SALT = "DseMath@2026_HK_Secure!";

function doGet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. 讀取座右銘
  let quoteSheet = ss.getSheetByName("座右銘") || ss.getSheetByName("座右銘與機率表") || ss.getSheetByName("Quotes");
  if (!quoteSheet) {
    for (let s of ss.getSheets()) {
      if (s.getRange("A1").getValue() === "座右銘") { quoteSheet = s; break; }
    }
  }
  const quotes = [];
  if (quoteSheet) {
    const quoteData = quoteSheet.getDataRange().getValues();
    for (let i = 1; i < quoteData.length; i++) {
      if (String(quoteData[i][0]).trim() !== "") {
        quotes.push({ text: String(quoteData[i][0]), weight: parseFloat(quoteData[i][1]) || 1, reward: String(quoteData[i][2] || "") });
      }
    }
  }

  // 2. 讀取課題動態設定
  const configSheet = ss.getSheetByName("TopicConfig") || ss.getSheetByName("課題設定表");
  let topicConfig = [];
  if (configSheet) {
    const configData = configSheet.getDataRange().getValues();
    for (let i = 1; i < configData.length; i++) {
      if (String(configData[i][0]).trim() !== "") {
        topicConfig.push({ topic: String(configData[i][0]), levelId: String(configData[i][1]), title: String(configData[i][2]), badge: String(configData[i][3]), desc: String(configData[i][4]) });
      }
    }
  }

  // 3. 讀取勤學排行榜 (日常練習)
  const leaderSheet = ss.getSheetByName("LeaderBoard");
  let leaderboard = [];
  if (leaderSheet) {
    const leaderData = leaderSheet.getDataRange().getValues();
    for (let i = 1; i < leaderData.length; i++) {
      const className = leaderData[i][0];   
      const classNum = leaderData[i][1];    
      const studentName = leaderData[i][2]; 
      const score = parseInt(leaderData[i][3]) || 0; 
      if (String(className).trim() !== "" && String(studentName).trim() !== "") {
        leaderboard.push({ className: String(className).trim(), classNum: String(classNum).trim(), studentName: String(studentName).trim(), totalScore: score });
      }
    }
    leaderboard.sort((a, b) => b.totalScore - a.totalScore);
    leaderboard = leaderboard.slice(0, 100);
  }

  // 4. 讀取「功課設定表」
  const hwConfigSheet = ss.getSheetByName("功課設定表");
  let homeworkConfig = [];
  if (hwConfigSheet) {
    const hwData = hwConfigSheet.getDataRange().getValues();
    for (let i = 1; i < hwData.length; i++) {
      const hwName = String(hwData[i][0]).trim();
      if (hwName !== "") {
        homeworkConfig.push({
          hwName: hwName,
          topic: String(hwData[i][1]).trim(),
          levelId: String(hwData[i][2]).trim(),
          qCount: parseInt(hwData[i][3]) || 1
        });
      }
    }
  }

  return ContentService.createTextOutput(JSON.stringify({ 
    quotes: quotes, 
    topicConfig: topicConfig, 
    leaderboard: leaderboard,
    homeworkConfig: homeworkConfig
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  // 🌟 新增防連點與腳本轟炸閘門 (LockService)
  // 強迫同一時間發來的請求排隊，最長等候 8 秒
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(8000); 
  } catch (e) {
    return jsonResponse({success: false, message: "❌ 系統繁忙中，請稍後再試。"});
  }

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const p = e.parameter;
    const action = p.action || "submit_score";

    // AI 路由處理
    if (action === "ai_ocr") { return handleAIOcr(p.image); }
    if (action === "ai_text_to_latex") { return handleAITextToLatex(p.text); }
    if (action === "ai_grade") { return handleAIGrade(p.studentLatex, p.standardAns); }

    const cleanClassName = String(p.className || "").trim().toUpperCase();
    const cleanClassNum = String(p.classNumber || "").trim();
    const cleanStudentName = String(p.studentName || "").trim();
    const levelStr = String(p.level || "").trim().toUpperCase(); // 例如：程度 3B
    
    // 強制將分數鎖定為字串進行加密驗證
    const rawScoreStr = String(p.score !== undefined ? p.score : "0").trim();
    const rawTotalScoreStr = String(p.totalScore !== undefined ? p.totalScore : "100").trim();
    const providedSignature = String(p.sig || "").trim();
    
    // 功課標籤與明細
    const isHomework = p.isHomework === "true";
    const homeworkName = String(p.homeworkName || "").trim();
    const topicDetails = String(p.topicDetails || "").trim();
    
    // ====================================================================
    // 🛡️ 防禦閘門 1：數位簽章驗證 (Digital Signature Validation)
    // ====================================================================
    const rawString = cleanClassName + "|" + cleanClassNum + "|" + rawScoreStr + "|" + rawTotalScoreStr + "|" + SECURITY_SALT;
    let hash = 0;
    for (let i = 0; i < rawString.length; i++) {
        hash = ((hash << 5) - hash) + rawString.charCodeAt(i);
        hash = hash & hash; 
    }
    const expectedSignature = (hash >>> 0).toString(16);

    if (providedSignature !== expectedSignature) {
        return jsonResponse({success: false, message: "❌ 傳送失敗，資料驗證未通過 (Code: 400)"});
    }

    const score = parseInt(rawScoreStr, 10);
    const totalScore = parseInt(rawTotalScoreStr, 10);

    // ====================================================================
    // 🛡️ 防禦閘門 2：極限值對比 (Sanity Check)
    // ====================================================================
    if (cleanClassName.length > 5 || cleanClassNum.length > 4 || cleanStudentName.length > 20 || String(p.topic || "").length > 30) {
         return jsonResponse({success: false, message: "❌ 傳送失敗，資料驗證未通過 (Code: 400)"});
    }
    if (totalScore <= 0 || totalScore > 300 || score < 0 || score > 300 || score > totalScore * 1.2) {
        return jsonResponse({success: false, message: "❌ 傳送失敗，資料驗證未通過 (Code: 400)"});
    }

    // ====================================================================
    // 🛡️ 防禦閘門 3：分數倍數合理性查驗 (Modulo Check)
    // ====================================================================
    let isValidScore = false;
    if (isHomework) {
        // 功課：必須是 10 的倍數
        if (score % 10 === 0) isValidScore = true;
    } else {
        // 綜合挑戰或是常規練習
        if (levelStr.includes('綜合挑戰') || levelStr === '綜合挑戰') {
           // 綜合挑戰會混搭，只要能被 1 整除就算過（可不檢查，或設定總分為合理組合）
           isValidScore = true; 
        } else if (levelStr.includes('4')) {
            if (score % 15 === 0) isValidScore = true;
        } else if (levelStr.includes('3')) {
            if (score % 12 === 0) isValidScore = true;
        } else if (levelStr.includes('2')) {
            if (score % 8 === 0) isValidScore = true;
        } else if (levelStr.includes('1')) {
            if (score % 5 === 0) isValidScore = true;
        } else {
            isValidScore = true; // 預防例外狀況
        }
    }

    if (!isValidScore) {
        return jsonResponse({success: false, message: "❌ 傳送失敗，資料驗證未通過 (Code: 400)"});
    }

    // ====================================================================
    // 🛡️ 功課次數查核閘門 (限制 2 次)
    // ====================================================================
    let submitCountForHomework = 0;
    let hwRowIndex = -1;
    let hwLeaderSheet = null;
    let hwData = null;

    if (isHomework) {
        hwLeaderSheet = ss.getSheetByName("功課榜") || ss.insertSheet("功課榜");
        if (hwLeaderSheet.getLastRow() === 0) hwLeaderSheet.appendRow(["班別", "學號", "姓名", "功課名稱", "提交次數", "最佳分數"]);
        
        hwData = hwLeaderSheet.getDataRange().getValues();
        for (let i = 1; i < hwData.length; i++) {
            if (String(hwData[i][0]).toUpperCase() === cleanClassName && String(hwData[i][1]) === cleanClassNum && String(hwData[i][3]) === homeworkName) {
                submitCountForHomework = parseInt(hwData[i][4]) || 0;
                hwRowIndex = i + 1;
                break;
            }
        }
        
        // 拒絕寫入：已經提交達到 2 次
        if (submitCountForHomework >= 2) {
            return jsonResponse({success: false, message: "⚠️ 拒絕寫入：此份功課你已提交達到 2 次上限！"});
        }
    }

    // ====================================================================
    // 總分累積與日常獎勵邏輯
    // ====================================================================
    const leaderSheet = ss.getSheetByName("LeaderBoard");
    if (!leaderSheet) return jsonResponse({success: false, message: "⚠️ 找不到 LeaderBoard 分頁。"});
    
    const leaderData = leaderSheet.getDataRange().getValues();
    let foundInRoster = false, rowIndex = -1, currentTotalScore = 0;
    let officialStudentName = "", lastSubmitKey = "", todayCountRecord = 0;
    
    for (let i = 1; i < leaderData.length; i++) {
      if (String(leaderData[i][0]).trim().toUpperCase() === cleanClassName && String(leaderData[i][1]).trim() === cleanClassNum) {
        foundInRoster = true; rowIndex = i + 1; 
        currentTotalScore = parseInt(leaderData[i][3]) || 0;
        officialStudentName = String(leaderData[i][2]).trim(); 
        lastSubmitKey = String(leaderData[i][4] || "").trim();
        todayCountRecord = parseInt(leaderData[i][5]) || 0;
        break;
      }
    }
    if (!foundInRoster) return jsonResponse({success: false, message: "🛑 找不到此學生資料，請確認班別與學號。"});
    
    const now = new Date();
    const timeZone = "Asia/Hong_Kong"; 
    const todayStr = Utilities.formatDate(now, timeZone, "yyyy/MM/dd");
    const formattedTime = Utilities.formatDate(now, timeZone, "HH:mm:ss");
    const todayKey = "D_" + Utilities.formatDate(now, timeZone, "yyyyMMdd");
    
    let playCountToday = (lastSubmitKey === todayKey) ? todayCountRecord + 1 : 1;

    // 每日防刷分限制 (60次)
    if (playCountToday > 60) {
        return jsonResponse({success: false, message: "⚠️ 每日提交次數已達上限，請明天再繼續挑戰！(防刷分機制啟動)"});
    }

    let newTotalScore = currentTotalScore + score;
    let crossedThreshold = Math.floor(newTotalScore / 100) > Math.floor(currentTotalScore / 100);

    let reward = "無";
    if (crossedThreshold) {
      let quoteSheet = ss.getSheetByName("座右銘") || ss.getSheetByName("座右銘與機率表") || ss.getSheetByName("Quotes");
      if (quoteSheet) {
        const quoteData = quoteSheet.getDataRange().getValues();
        let totalWeight = 0, pool = [];
        for (let i = 1; i < quoteData.length; i++) {
          if (String(quoteData[i][0]).trim() !== "") {
            let w = parseFloat(quoteData[i][1]) || 1;
            totalWeight += w; pool.push({ weight: w, reward: String(quoteData[i][2] || "") });
          }
        }
        let rand = Math.random() * totalWeight, selectedReward = "再接再厲！";
        for (let q of pool) {
          if (rand < q.weight) { if (q.reward && q.reward.trim() !== "") selectedReward = q.reward; break; }
          rand -= q.weight;
        }
        reward = selectedReward;
      }
    }
    
    // 更新日常積分榜
    leaderSheet.getRange(rowIndex, 4).setValue(newTotalScore);
    leaderSheet.getRange(rowIndex, 5).setValue(todayKey);
    leaderSheet.getRange(rowIndex, 6).setValue(playCountToday);

    // ====================================================================
    // 雙軌寫入：判斷是功課還是日常練習
    // ====================================================================
    if (isHomework) {
        submitCountForHomework++;
        let newBestScore = score;
        if (hwRowIndex !== -1) {
            let oldBest = parseInt(hwData[hwRowIndex-1][5]) || 0;
            newBestScore = Math.max(oldBest, score);
            hwLeaderSheet.getRange(hwRowIndex, 5).setValue(submitCountForHomework);
            hwLeaderSheet.getRange(hwRowIndex, 6).setValue(newBestScore);
        } else {
            hwLeaderSheet.appendRow([cleanClassName, cleanClassNum, officialStudentName, homeworkName, submitCountForHomework, score]);
        }

        const hwRecordSheet = ss.getSheetByName("學生功課紀錄") || ss.insertSheet("學生功課紀錄");
        if (hwRecordSheet.getLastRow() === 0) {
            hwRecordSheet.appendRow(["提交日期", "提交時間", "班別", "學號", "姓名", "功課名稱", "得分", "總分", "百分比", "課題明細", "獲得獎勵"]);
        }
        hwRecordSheet.appendRow([todayStr, formattedTime, cleanClassName, cleanClassNum, officialStudentName, homeworkName, score, totalScore, p.percentage || "", topicDetails, reward]);
        
        return jsonResponse({ success: true, message: `✅ 功課傳送成功！(第 ${submitCountForHomework}/2 次)`, playCountToday: playCountToday, newTotalScore: newTotalScore, crossedThreshold: crossedThreshold, reward: reward, officialName: officialStudentName });
        
    } else {
        const recordSheet = ss.getSheetByName("學生紀錄") || ss.insertSheet("學生紀錄");
        if (recordSheet.getLastRow() === 0) recordSheet.appendRow(["提交日期", "提交時間", "班別", "學號", "姓名", "課題", "程度", "得分", "總分", "百分比", "獲得獎勵"]);
        recordSheet.appendRow([todayStr, formattedTime, cleanClassName, cleanClassNum, officialStudentName, p.topic || "", p.level || "", score, totalScore, p.percentage || "", reward ]);

        return jsonResponse({ success: true, message: "✅ 傳送成功！", playCountToday: playCountToday, newTotalScore: newTotalScore, crossedThreshold: crossedThreshold, reward: reward, officialName: officialStudentName });
    }

  } catch (error) {
    return jsonResponse({success: false, message: `系統錯誤：` + error.toString()});
  } finally {
    // 🌟 確保無論執行成功或發生錯誤，最後都會釋放排隊鎖
    lock.releaseLock();
  }
}

// 🌟 關閉安全審查
const safeSettings = [
  { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
  { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
  { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
  { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
];

// ==========================================
// 🤖 AI 功能區 (保持不變)
// ==========================================
function handleAIOcr(base64Image) {
  try {
    const apiKey = GEMINI_API_KEY.trim();
    if (!apiKey || apiKey.includes("請在這裡")) return jsonResponse({ success: false, message: "⚠️ 尚未填寫 API 金鑰" });

    const models = ["gemini-2.5-pro", "gemini-2.5-flash"];
    const payload = {
      contents: [{
        role: "user",
        parts: [
          { text: "你是一個世界頂級的數學 OCR 系統。請仔細辨識圖片中學生手寫的數學公式，並將其轉換為標準的 LaTeX 格式。\n\n【極度重要規則】：\n1. 務必「完整辨識」！即使學生寫的算式不完整，也請「絕對忠實」轉換，嚴禁自行補全！\n2. 只回傳純粹的 LaTeX 語法。\n3. 必須只包含英文字母、數字、括號 () 及基本數學運算符號。\n4. 絕對禁止包含任何中文、解說或無關符號。\n5. 不要使用 \\text{} 等指令。" },
          { inlineData: { mimeType: "image/jpeg", data: base64Image } }
        ]
      }],
      generationConfig: { temperature: 0.0, maxOutputTokens: 2048 },
      safetySettings: safeSettings
    };

    let lastError = "", geminiResult = null, isSuccess = false, usedModelStr = "", errorLogs = [], retryCount = 0;
    for (let i = 0; i < models.length; i++) {
      let model = models[i];
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const options = { method: 'post', contentType: 'application/json', payload: JSON.stringify(payload), muteHttpExceptions: true };
      const response = UrlFetchApp.fetch(geminiUrl, options);
      const rawText = response.getContentText();
      const statusCode = response.getResponseCode();

      try { geminiResult = JSON.parse(rawText); } catch (e) { errorLogs.push(`[${model}] 解析失敗`); continue; }
      if (statusCode === 429 && retryCount < 1) { Utilities.sleep(1500); retryCount++; i--; continue; }
      retryCount = 0; 
      if (statusCode !== 200) { errorLogs.push(`[${model}] 錯誤代碼 ${statusCode}`); continue; }
      if (!geminiResult.candidates?.[0]?.content?.parts?.[0]?.text) { continue; }
      isSuccess = true; usedModelStr = model; break; 
    }
    if (!isSuccess) return jsonResponse({ success: false, message: `辨識失敗` });
    
    let latexRes = geminiResult.candidates[0].content.parts[0].text.replace(/^```(latex|tex)?\n?/i, '').replace(/\n?```$/i, '').trim();
    return jsonResponse({ success: true, latex: latexRes, usedModel: usedModelStr, debugInfo: errorLogs.join(" | ") });
  } catch (err) { return jsonResponse({ success: false, message: `GAS 崩潰: ` + err.toString() }); }
}

function handleAITextToLatex(rawText) {
  try {
    const apiKey = GEMINI_API_KEY.trim();
    if (!apiKey || apiKey.includes("請在這裡")) return jsonResponse({ success: false, message: "⚠️ 尚未填寫 API 金鑰" });

    const models = ["gemini-2.5-pro", "gemini-2.5-flash"];
    const payload = {
      contents: [{
        role: "user",
        parts: [{ text: `你是一個世界頂級的數學 OCR 系統。請將學生鍵盤輸入的文字轉換為標準 LaTeX。\n輸入為：\n${rawText}\n\n【規則】：\n1. 絕對忠實，嚴禁計算或補全。\n2. 只回傳純粹的 LaTeX。` }]
      }],
      generationConfig: { temperature: 0.0, maxOutputTokens: 2048 },
      safetySettings: safeSettings
    };

    let lastError = "", geminiResult = null, isSuccess = false, usedModelStr = "", errorLogs = [], retryCount = 0;
    for (let i = 0; i < models.length; i++) {
      let model = models[i];
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const options = { method: 'post', contentType: 'application/json', payload: JSON.stringify(payload), muteHttpExceptions: true };
      const response = UrlFetchApp.fetch(geminiUrl, options);
      const rawTextResp = response.getContentText();
      const statusCode = response.getResponseCode();

      try { geminiResult = JSON.parse(rawTextResp); } catch (e) { continue; }
      if (statusCode === 429 && retryCount < 1) { Utilities.sleep(1500); retryCount++; i--; continue; }
      retryCount = 0; 
      if (statusCode !== 200) { continue; }
      if (!geminiResult.candidates?.[0]?.content?.parts?.[0]?.text) { continue; }
      isSuccess = true; usedModelStr = model; break; 
    }
    if (!isSuccess) return jsonResponse({ success: false, message: `轉換失敗` });
    
    let latexRes = geminiResult.candidates[0].content.parts[0].text.replace(/^```(latex|tex)?\n?/i, '').replace(/\n?```$/i, '').trim();
    return jsonResponse({ success: true, latex: latexRes, usedModel: usedModelStr, debugInfo: errorLogs.join(" | ") });
  } catch (err) { return jsonResponse({ success: false, message: `GAS 崩潰: ` + err.toString() }); }
}

function handleAIGrade(studentLatex, standardAns) {
  try {
    const apiKey = GEMINI_API_KEY.trim();
    const models = ["gemini-2.5-pro", "gemini-2.5-flash"];
    const payload = {
      contents: [{
        role: "user",
        parts: [{ text: `你是一位香港中學數學老師。請判斷學生的作答是否與標準答案等價。\n標準答案：${standardAns}\n學生答案：${studentLatex}\n\n1. 等價必須判為 true。\n2. 答對時 reason 必須為空字串 ""。\n3. 答錯時 reason 限 20 字以內點破錯誤。\n4. 回傳純 JSON。格式：{"isCorrect": true, "reason": ""}` }]
      }],
      generationConfig: { responseMimeType: "application/json", temperature: 0.0, maxOutputTokens: 2048 },
      safetySettings: safeSettings
    };

    let lastError = "", geminiResult = null, isSuccess = false, usedModelStr = "", errorLogs = [], retryCount = 0;
    for (let i = 0; i < models.length; i++) {
      let model = models[i];
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const options = { method: 'post', contentType: 'application/json', payload: JSON.stringify(payload), muteHttpExceptions: true };
      const response = UrlFetchApp.fetch(geminiUrl, options);
      const rawText = response.getContentText();
      const statusCode = response.getResponseCode();

      try { geminiResult = JSON.parse(rawText); } catch (e) { continue; }
      if (statusCode === 429 && retryCount < 1) { Utilities.sleep(1500); retryCount++; i--; continue; }
      retryCount = 0;
      if (statusCode !== 200) { continue; }
      if (!geminiResult.candidates?.[0]?.content?.parts?.[0]?.text) { continue; }
      isSuccess = true; usedModelStr = model; break; 
    }
    if (!isSuccess) return jsonResponse({ success: false, message: `批改失敗` });
    
    let textRes = geminiResult.candidates[0].content.parts[0].text.replace(/^```json\n?/i, '').replace(/\n?```$/i, '').trim();
    let aiResult = {};
    try {
        aiResult = JSON.parse(textRes.replace(/[\r\n]+/g, ' '));
    } catch (parseError) {
        let isCorr = textRes.includes('"isCorrect": true') || textRes.includes('true');
        let rMatch = textRes.match(/"reason"\s*:\s*"?([^"]*)"?/);
        aiResult = { isCorrect: isCorr, reason: rMatch ? rMatch[1] : "" };
    }
    return jsonResponse({ success: true, isCorrect: !!aiResult.isCorrect, reason: aiResult.reason || "", usedModel: usedModelStr, debugInfo: errorLogs.join(" | ") });
  } catch (err) { return jsonResponse({ success: false, message: `GAS 批改崩潰: ` + err.toString() }); }
}

function jsonResponse(obj) { return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }
