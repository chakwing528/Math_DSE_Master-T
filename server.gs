/**
 * DSE 修練所 - 後端核心程式 (V72.2: 恆定時間比較、環境變數阻斷、完整無省略版)
 */

const BACKEND_VERSION = "V72.2_Robust_Secure";
const ENABLE_V1_FALLBACK = true; // 預定 2026-06-01 改為 false
const TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 60 分鐘
const SECURITY_SALT = "DseMath@2026_HK_Secure!"; // 僅供 V1 過渡期使用

// ==========================================
// ⚙️ 環境變數與防護阻斷 (Script Properties)
// ==========================================
const scriptProperties = PropertiesService.getScriptProperties();
const GEMINI_API_KEY = scriptProperties.getProperty("GEMINI_API_KEY");
const SERVER_SECRET = scriptProperties.getProperty("SERVER_SECRET");

// 安全的恆定時間字串比較 (防禦 Timing Attack)
function constantTimeCompare(val1, val2) {
  if (typeof val1 !== 'string' || typeof val2 !== 'string') return false;
  if (val1.length !== val2.length) return false;
  let result = 0;
  for (let i = 0; i < val1.length; i++) {
    result |= val1.charCodeAt(i) ^ val2.charCodeAt(i);
  }
  return result === 0;
}

// ==========================================
// 🛡️ Token 認證模組 (Hardened)
// ==========================================
function generateSessionToken(className, classNum) {
  const header = Utilities.base64EncodeWebSafe(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payloadData = {
    c: String(className).toUpperCase().trim(),
    n: String(classNum).trim(),
    iat: Date.now(),
    exp: Date.now() + TOKEN_EXPIRY_MS,
    jti: Utilities.getUuid()
  };
  const payload = Utilities.base64EncodeWebSafe(JSON.stringify(payloadData));
  
  const signatureInput = header + "." + payload;
  const signatureRaw = Utilities.computeHmacSha256Signature(signatureInput, SERVER_SECRET);
  const signature = Utilities.base64EncodeWebSafe(signatureRaw);
  
  return signatureInput + "." + signature;
}

function verifySessionToken(token) {
  if (!token) return { valid: false, reason: "遺失認證 Token" };
  const parts = token.split('.');
  if (parts.length !== 3) return { valid: false, reason: "Token 格式錯誤" };
  
  const signatureInput = parts[0] + "." + parts[1];
  const expectedSignatureRaw = Utilities.computeHmacSha256Signature(signatureInput, SERVER_SECRET);
  const expectedSignature = Utilities.base64EncodeWebSafe(expectedSignatureRaw);
  
  // 導入恆定時間比較
  if (!constantTimeCompare(parts[2], expectedSignature)) {
    return { valid: false, reason: "Token 簽章不符 (疑似遭篡改)" };
  }
  
  try {
    const payloadJson = Utilities.newBlob(Utilities.base64DecodeWebSafe(parts[1])).getDataAsString();
    const payload = JSON.parse(payloadJson);
    
    if (!payload.exp || !payload.iat || !payload.jti || !payload.c || !payload.n) {
      return { valid: false, reason: "Token 內容缺失必要欄位" };
    }
    if (Date.now() > payload.exp) return { valid: false, reason: "Token 已逾時，請重新登入" };
    
    return { valid: true, payload: payload };
  } catch (err) {
    return { valid: false, reason: "Token 解析崩潰 (Malformed Token)" };
  }
}

// ==========================================
// 🌐 路由入口點
// ==========================================
function doGet() {
  if (!SERVER_SECRET || !GEMINI_API_KEY) {
    return jsonResponse({ success: false, message: "❌ 系統維護中：伺服器遺失環境變數配置。" });
  }

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    const quoteSheet = ss.getSheetByName("座右銘") || ss.getSheetByName("座右銘與機率表") || ss.getSheetByName("Quotes");
    const quotes = [];
    if (quoteSheet) {
      const quoteData = quoteSheet.getDataRange().getValues();
      for (let i = 1; i < quoteData.length; i++) {
        if (String(quoteData[i][0]).trim() !== "") {
          quotes.push({ text: String(quoteData[i][0]).trim(), weight: parseFloat(quoteData[i][1]) || 1, reward: String(quoteData[i][2] || "").trim() });
        }
      }
    }

    const configSheet = ss.getSheetByName("TopicConfig") || ss.getSheetByName("課題設定表");
    const topicConfig = [];
    if (configSheet) {
      const configData = configSheet.getDataRange().getValues();
      for (let i = 1; i < configData.length; i++) {
        if (String(configData[i][0]).trim() !== "") {
          topicConfig.push({ topic: String(configData[i][0]).trim(), levelId: String(configData[i][1]).trim(), title: String(configData[i][2]).trim(), badge: String(configData[i][3]).trim(), desc: String(configData[i][4]).trim() });
        }
      }
    }

    const leaderSheet = ss.getSheetByName("LeaderBoard");
    let leaderboard = [];
    if (leaderSheet) {
      const leaderData = leaderSheet.getDataRange().getValues();
      const todayKey = "D_" + Utilities.formatDate(new Date(), "Asia/Hong_Kong", "yyyyMMdd");

      for (let i = 1; i < leaderData.length; i++) {
        const className = String(leaderData[i][0] || "").trim().toUpperCase();
        const classNum = String(leaderData[i][1] || "").trim();
        const rawName = String(leaderData[i][2] || "").trim();
        const nickname = String(leaderData[i][3] || "").trim();
        const studentName = nickname !== "" ? nickname : rawName;

        if (className !== "" && studentName !== "") {
          const score = parseInt(leaderData[i][4]) || 0;
          const lastSubmitKey = String(leaderData[i][5] || "").trim();
          const playCountToday = (lastSubmitKey === todayKey) ? (parseInt(leaderData[i][6]) || 0) : 0;
          leaderboard.push({ className: className, classNum: classNum, studentName: studentName, totalScore: score, playCountToday: playCountToday });
        }
      }
      leaderboard.sort((a, b) => b.totalScore - a.totalScore);
      leaderboard = leaderboard.slice(0, 100);
    }

    const hwConfigSheet = ss.getSheetByName("功課設定表");
    const homeworkConfig = [];
    if (hwConfigSheet) {
      const hwData = hwConfigSheet.getDataRange().getValues();
      for (let i = 1; i < hwData.length; i++) {
        const hwName = String(hwData[i][0]).trim();
        if (hwName !== "") {
          homeworkConfig.push({ hwName: hwName, topic: String(hwData[i][1]).trim(), levelId: String(hwData[i][2]).trim(), qCount: parseInt(hwData[i][3]) || 1 });
        }
      }
    }

    return jsonResponse({ success: true, quotes: quotes, topicConfig: topicConfig, leaderboard: leaderboard, homeworkConfig: homeworkConfig });
  } catch (error) {
    return jsonResponse({ success: false, message: "資料讀取失敗：" + error.toString() });
  }
}

function doPost(e) {
  if (!SERVER_SECRET || !GEMINI_API_KEY) {
    return jsonResponse({ success: false, message: "❌ 系統維護中：伺服器遺失環境變數配置。" });
  }

  const p = e.parameter;
  const action = p.action || "submit_score";

  if (action === "ai_ocr") return handleAIOcr(p.image);
  if (action === "ai_text_to_latex") return handleAITextToLatex(p.text);
  if (action === "ai_grade") return handleAIGrade(p.studentLatex, p.standardAns);
  if (action === "verify_login") return handleVerifyLogin(p);

  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(8000);
  } catch (err) {
    return jsonResponse({ success: false, message: "❌ 系統繁忙中，請稍後再試。" });
  }

  try {
    if (action === "submit_quiz_v2") {
      return handleSubmitV2(p);
    } else {
      if (!ENABLE_V1_FALLBACK) {
        return jsonResponse({ success: false, message: "❌ 此版本的 App 已停用，請清除快取重新載入最新系統。" });
      }
      return handleSubmitV1(p);
    }
  } catch (error) {
    return jsonResponse({ success: false, message: "系統錯誤：" + error.toString() });
  } finally {
    lock.releaseLock();
  }
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// ==========================================
// 🔑 登入與 Token 簽發 (完整恢復)
// ==========================================
function handleVerifyLogin(p) {
  try {
    const cleanClassName = String(p.className || "").trim().toUpperCase();
    const cleanClassNum = String(p.classNumber || "").trim();
    const password = String(p.password || "").trim();

    if (!cleanClassName || !cleanClassNum) return jsonResponse({ success: false, message: "❌ 請填寫班別與學號。" });

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const leaderSheet = ss.getSheetByName("LeaderBoard");
    if (!leaderSheet) return jsonResponse({ success: false, message: "⚠️ 找不到學生名單，請聯絡老師。" });

    const leaderData = leaderSheet.getDataRange().getValues();
    for (let i = 1; i < leaderData.length; i++) {
      let sClass = String(leaderData[i][0]).trim().toUpperCase();
      let sNum = String(leaderData[i][1]).trim();
      let isMatch = (sClass === cleanClassName && sNum === cleanClassNum);
      if (!isMatch && sClass === cleanClassName && sNum === "" && cleanClassNum === "0") isMatch = true;

      if (isMatch) {
        let officialName = String(leaderData[i][2] || "").trim();
        let nickname = String(leaderData[i][3] || "").trim();
        let displayName = nickname !== "" ? nickname : officialName;
        let dbPassword = String(leaderData[i][7] || "").trim();

        if (dbPassword !== "" && password !== dbPassword) {
          return jsonResponse({ success: false, message: "❌ 密碼錯誤！請確認後重試。" });
        }
        
        const sessionToken = generateSessionToken(cleanClassName, cleanClassNum);
        return jsonResponse({ success: true, studentName: displayName, sessionToken: sessionToken });
      }
    }
    return jsonResponse({ success: false, message: "🛑 找不到此學生資料，請確認班別與學號是否正確。" });
  } catch (err) { 
    return jsonResponse({ success: false, message: "系統錯誤：" + err.toString() }); 
  }
}

// ==========================================
// 🛡️ V2 安全提交邏輯 (完整恢復)
// ==========================================
function handleSubmitV2(p) {
  const token = p.sessionToken;
  const nonce = p.nonce;
  const answersJson = p.answers; 
  const isHomework = p.isHomework === "true";
  const homeworkName = String(p.homeworkName || "").trim();
  const topicDetails = String(p.topicDetails || "").trim();

  const tokenCheck = verifySessionToken(token);
  if (!tokenCheck.valid) return jsonResponse({ success: false, message: `❌ 認證失敗: ${tokenCheck.reason}` });
  
  const cleanClassName = tokenCheck.payload.c;
  const cleanClassNum = tokenCheck.payload.n;
  const tokenJti = tokenCheck.payload.jti;

  let cache;
  try {
    cache = CacheService.getScriptCache();
    const strictNonceKey = `nonce_${cleanClassName}_${cleanClassNum}_${tokenJti}_${nonce}`;
    if (!nonce || cache.get(strictNonceKey)) {
      return jsonResponse({ success: false, message: "❌ 傳送失敗，此成績封包已被使用過 (Replay Attack Blocked)" });
    }
    cache.put(strictNonceKey, "used", 3600);
  } catch (err) {}

  let calculatedScore = 0;
  let totalPossibleScore = 0;
  try {
    const answers = JSON.parse(answersJson || "[]");
    answers.forEach(ans => {
      if (!ans.qId) return; 
      
      let qScore = parseInt(ans.scoreVal) || 10;
      totalPossibleScore += qScore;
      
      let std = String(ans.standardAns || "").toLowerCase().trim();
      let stu = String(ans.studentAns || "").toLowerCase().trim();
      
      // 注意：過渡期仍需仰賴前端傳來的 standardAns，直到 V3 將題庫生成移至後端
      if (std !== "" && stu !== "" && std === stu) {
        calculatedScore += qScore;
      } else if (ans.gradingSig) {
        // 預留給未來 AI 批改防護的簽章驗證接口
        // const expectedSig = Utilities.computeHmacSha256Signature(`${ans.qId}|${ans.studentAns}|true`, SERVER_SECRET);
        // if (constantTimeCompare(ans.gradingSig, expectedSig)) calculatedScore += qScore;
      }
    });
  } catch (err) {
    return jsonResponse({ success: false, message: "❌ 作答紀錄解析失敗" });
  }

  if (totalPossibleScore <= 0 || totalPossibleScore > 150 || calculatedScore < 0 || calculatedScore > totalPossibleScore) {
    return jsonResponse({ success: false, message: "❌ 傳送失敗，計算後分數異常 (Code: 405)" });
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const leaderSheet = ss.getSheetByName("LeaderBoard");
  if (!leaderSheet) return jsonResponse({ success: false, message: "⚠️ 找不到 LeaderBoard 分頁。" });

  const leaderData = leaderSheet.getDataRange().getValues();
  let foundInRoster = false, rowIndex = -1, currentTotalScore = 0;
  let officialStudentName = "", lastSubmitKey = "", todayCountRecord = 0;

  for (let i = 1; i < leaderData.length; i++) {
    let sClass = String(leaderData[i][0]).trim().toUpperCase();
    let sNum = String(leaderData[i][1]).trim();
    let isMatch = (sClass === cleanClassName && sNum === cleanClassNum);
    if (!isMatch && sClass === cleanClassName && sNum === "" && cleanClassNum === "0") isMatch = true;
    
    if (isMatch) {
      foundInRoster = true;
      rowIndex = i + 1;
      currentTotalScore = parseInt(leaderData[i][4]) || 0;
      officialStudentName = String(leaderData[i][2]).trim();
      lastSubmitKey = String(leaderData[i][5] || "").trim();
      todayCountRecord = parseInt(leaderData[i][6]) || 0;
      break;
    }
  }
  
  if (!foundInRoster) return jsonResponse({ success: false, message: "🛑 找不到此學生資料。" });

  const now = new Date();
  const timeZone = "Asia/Hong_Kong";
  const todayStr = Utilities.formatDate(now, timeZone, "yyyy/MM/dd");
  const formattedTime = Utilities.formatDate(now, timeZone, "HH:mm:ss");
  const todayKey = "D_" + Utilities.formatDate(now, timeZone, "yyyyMMdd");
  let playCountToday = (lastSubmitKey === todayKey) ? todayCountRecord + 1 : 1;
  let percentageStr = ((calculatedScore / totalPossibleScore) * 100).toFixed(0) + "%";

  if (isHomework) {
    const hwRecordSheet = ss.getSheetByName("學生功課紀錄") || ss.insertSheet("學生功課紀錄");
    const hwRecordData = hwRecordSheet.getDataRange().getValues();
    let submitCountForHomework = 0;

    for (let i = 1; i < hwRecordData.length; i++) {
      if (String(hwRecordData[i][2]).toUpperCase() === cleanClassName && String(hwRecordData[i][3]) === cleanClassNum && String(hwRecordData[i][5]) === homeworkName) {
        submitCountForHomework++;
      }
    }
    if (submitCountForHomework >= 2) return jsonResponse({ success: false, message: "⚠️ 拒絕寫入：此份功課你已提交達到 2 次上限！" });
    if (hwRecordSheet.getLastRow() === 0) hwRecordSheet.appendRow(["提交日期", "提交時間", "班別", "學號", "姓名", "功課名稱", "得分", "總分", "百分比", "課題明細", "獲得獎勵", "API 版本"]);
    
    hwRecordSheet.appendRow([todayStr, formattedTime, cleanClassName, cleanClassNum, officialStudentName, homeworkName, calculatedScore, totalPossibleScore, percentageStr, topicDetails, "功課紀錄", "V2"]);

    return jsonResponse({ success: true, message: `✅ 功課傳送成功！(第 ${submitCountForHomework + 1}/2 次)`, playCountToday: playCountToday, newTotalScore: currentTotalScore, crossedThreshold: false, reward: "無", officialName: officialStudentName });
  } else {
    if (playCountToday > 60) return jsonResponse({ success: false, message: "⚠️ 每日提交次數已達上限，請明天再繼續挑戰！" });

    let newTotalScore = currentTotalScore + calculatedScore;
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
            totalWeight += w;
            pool.push({ weight: w, reward: String(quoteData[i][2] || "") });
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

    leaderSheet.getRange(rowIndex, 5).setValue(newTotalScore);
    leaderSheet.getRange(rowIndex, 6).setValue(todayKey);
    leaderSheet.getRange(rowIndex, 7).setValue(playCountToday);

    const recordSheet = ss.getSheetByName("學生紀錄") || ss.insertSheet("學生紀錄");
    if (recordSheet.getLastRow() === 0) recordSheet.appendRow(["提交日期", "提交時間", "班別", "學號", "姓名", "課題", "程度", "得分", "總分", "百分比", "獲得獎勵", "API 版本"]);
    recordSheet.appendRow([todayStr, formattedTime, cleanClassName, cleanClassNum, officialStudentName, p.topic || "", p.level || "", calculatedScore, totalPossibleScore, percentageStr, reward, "V2"]);

    return jsonResponse({ success: true, message: "✅ 傳送成功！", playCountToday: playCountToday, newTotalScore: newTotalScore, crossedThreshold: crossedThreshold, reward: reward, officialName: officialStudentName });
  }
}

// ==========================================
// ⚠️ V1 舊版安全提交邏輯 (完整恢復)
// ==========================================
function handleSubmitV1(p) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const cleanClassName = String(p.className || "").trim().toUpperCase();
  const cleanClassNum = String(p.classNumber || "").trim();
  const cleanStudentName = String(p.studentName || "").trim();
  const levelStr = String(p.level || "").trim().toUpperCase();

  const rawScoreStr = String(p.score !== undefined ? p.score : "0").trim();
  const rawTotalScoreStr = String(p.totalScore !== undefined ? p.totalScore : "100").trim();
  const providedSignature = String(p.sig || "").trim();

  const nonce = String(p.nonce || "").trim();
  const timestampStr = String(p.timestamp || "").trim();
  const timeTakenStr = String(p.timeTaken || "0").trim();
  const password = String(p.password || "").trim();

  const isHomework = p.isHomework === "true";
  const homeworkName = String(p.homeworkName || "").trim();
  const topicDetails = String(p.topicDetails || "").trim();

  const timeTaken = parseInt(timeTakenStr, 10);
  if (isNaN(timeTaken) || timeTaken < 5) return jsonResponse({ success: false, message: "❌ 傳送失敗，作答時間異常 (Code: 401)" });

  const clientTime = parseInt(timestampStr, 10);
  const serverTime = Date.now();
  if (isNaN(clientTime) || Math.abs(serverTime - clientTime) > 600000) return jsonResponse({ success: false, message: "❌ 傳送失敗，資料時效過期 (Code: 402)" });

  let cache;
  try {
    cache = CacheService.getScriptCache();
    if (nonce === "" || cache.get(nonce)) return jsonResponse({ success: false, message: "❌ 傳送失敗，請勿重複提交 (Code: 403)" });
    const studentRateKey = `RateLimit_${cleanClassName}_${cleanClassNum}`;
    let reqCount = cache.get(studentRateKey);
    if (reqCount && parseInt(reqCount) >= 3) return jsonResponse({ success: false, message: "❌ 提交過於頻繁，系統保護機制已啟動，請 1 分鐘後再試！(Code: 429)" });
  } catch (err) {}

  const rawString = cleanClassName + "|" + cleanClassNum + "|" + rawScoreStr + "|" + rawTotalScoreStr + "|" + nonce + "|" + timestampStr + "|" + timeTakenStr + "|" + password + "|" + SECURITY_SALT;
  let hash = 0;
  for (let i = 0; i < rawString.length; i++) {
    hash = ((hash << 5) - hash) + rawString.charCodeAt(i);
    hash = hash & hash;
  }
  const expectedSignature = (hash >>> 0).toString(16);

  if (!constantTimeCompare(providedSignature, expectedSignature)) return jsonResponse({ success: false, message: "❌ 傳送失敗，資料驗證未通過 (Code: 400)" });

  if (cache) {
    if (nonce !== "") cache.put(nonce, "used", 3600);
    const studentRateKey = `RateLimit_${cleanClassName}_${cleanClassNum}`;
    let currentCount = parseInt(cache.get(studentRateKey) || "0", 10);
    cache.put(studentRateKey, (currentCount + 1).toString(), 60);
  }

  const score = parseInt(rawScoreStr, 10);
  const totalScore = parseInt(rawTotalScoreStr, 10);

  if (totalScore <= 0 || totalScore > 150 || score < 0 || score > 150 || score > totalScore * 1.2) return jsonResponse({ success: false, message: "❌ 傳送失敗，偵測到異常分數封包 (Code: 405)" });

  let isValidScore = false;
  if (isHomework) {
    if (score % 10 === 0) isValidScore = true;
  } else {
    if (levelStr.includes('綜合挑戰')) {
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
      isValidScore = true;
    }
  }
  if (!isValidScore) return jsonResponse({ success: false, message: "❌ 傳送失敗，資料驗證未通過 (Code: 406)" });

  const leaderSheet = ss.getSheetByName("LeaderBoard");
  if (!leaderSheet) return jsonResponse({ success: false, message: "⚠️ 找不到 LeaderBoard 分頁。" });
  const leaderData = leaderSheet.getDataRange().getValues();
  let foundInRoster = false, rowIndex = -1, currentTotalScore = 0, officialStudentName = "", lastSubmitKey = "", todayCountRecord = 0, dbPassword = "";
  
  for (let i = 1; i < leaderData.length; i++) {
    let sClass = String(leaderData[i][0]).trim().toUpperCase();
    let sNum = String(leaderData[i][1]).trim();
    let isMatch = (sClass === cleanClassName && sNum === cleanClassNum);
    if (!isMatch && sClass === cleanClassName && sNum === "" && cleanClassNum === "0") isMatch = true;
    if (isMatch) {
      foundInRoster = true; rowIndex = i + 1; currentTotalScore = parseInt(leaderData[i][4]) || 0;
      officialStudentName = String(leaderData[i][2]).trim(); lastSubmitKey = String(leaderData[i][5] || "").trim();
      todayCountRecord = parseInt(leaderData[i][6]) || 0; dbPassword = String(leaderData[i][7] || "").trim(); break;
    }
  }
  
  if (!foundInRoster) return jsonResponse({ success: false, message: "🛑 找不到此學生資料，請確認班別與學號。" });
  if (dbPassword !== "" && password !== dbPassword) return jsonResponse({ success: false, message: "❌ 密碼錯誤，請確認你使用的是自己的帳號！(Code: 407)" });

  const now = new Date();
  const timeZone = "Asia/Hong_Kong";
  const todayStr = Utilities.formatDate(now, timeZone, "yyyy/MM/dd");
  const formattedTime = Utilities.formatDate(now, timeZone, "HH:mm:ss");
  const todayKey = "D_" + Utilities.formatDate(now, timeZone, "yyyyMMdd");
  let playCountToday = (lastSubmitKey === todayKey) ? todayCountRecord + 1 : 1;

  if (isHomework) {
    const hwRecordSheet = ss.getSheetByName("學生功課紀錄") || ss.insertSheet("學生功課紀錄");
    const hwRecordData = hwRecordSheet.getDataRange().getValues();
    let submitCountForHomework = 0;
    for (let i = 1; i < hwRecordData.length; i++) {
      if (String(hwRecordData[i][2]).toUpperCase() === cleanClassName && String(hwRecordData[i][3]) === cleanClassNum && String(hwRecordData[i][5]) === homeworkName) submitCountForHomework++;
    }
    if (submitCountForHomework >= 2) return jsonResponse({ success: false, message: "⚠️ 拒絕寫入：此份功課你已提交達到 2 次上限！" });
    if (hwRecordSheet.getLastRow() === 0) hwRecordSheet.appendRow(["提交日期", "提交時間", "班別", "學號", "姓名", "功課名稱", "得分", "總分", "百分比", "課題明細", "獲得獎勵", "API 版本"]);
    
    hwRecordSheet.appendRow([todayStr, formattedTime, cleanClassName, cleanClassNum, officialStudentName, homeworkName, score, totalScore, p.percentage || "", topicDetails, "功課紀錄", "V1"]);
    return jsonResponse({ success: true, message: `✅ 功課傳送成功！(第 ${submitCountForHomework + 1}/2 次)`, playCountToday: playCountToday, newTotalScore: currentTotalScore, crossedThreshold: false, reward: "無", officialName: officialStudentName });
  } else {
    if (playCountToday > 60) return jsonResponse({ success: false, message: "⚠️ 每日提交次數已達上限，請明天再繼續挑戰！" });
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
            let w = parseFloat(quoteData[i][1]) || 1; totalWeight += w; pool.push({ weight: w, reward: String(quoteData[i][2] || "") });
          }
        }
        let rand = Math.random() * totalWeight, selectedReward = "再接再厲！";
        for (let q of pool) { if (rand < q.weight) { if (q.reward && q.reward.trim() !== "") selectedReward = q.reward; break; } rand -= q.weight; }
        reward = selectedReward;
      }
    }
    leaderSheet.getRange(rowIndex, 5).setValue(newTotalScore); leaderSheet.getRange(rowIndex, 6).setValue(todayKey); leaderSheet.getRange(rowIndex, 7).setValue(playCountToday);
    const recordSheet = ss.getSheetByName("學生紀錄") || ss.insertSheet("學生紀錄");
    if (recordSheet.getLastRow() === 0) recordSheet.appendRow(["提交日期", "提交時間", "班別", "學號", "姓名", "課題", "程度", "得分", "總分", "百分比", "獲得獎勵", "API 版本"]);
    recordSheet.appendRow([todayStr, formattedTime, cleanClassName, cleanClassNum, officialStudentName, p.topic || "", p.level || "", score, totalScore, p.percentage || "", reward, "V1"]);

    return jsonResponse({ success: true, message: "✅ 傳送成功！", playCountToday: playCountToday, newTotalScore: newTotalScore, crossedThreshold: crossedThreshold, reward: reward, officialName: officialStudentName });
  }
}

// ==========================================
// 🤖 關閉安全審查與 AI 模組 (完整恢復)
// ==========================================
const safeSettings = [
  { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
  { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
  { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
  { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
];

function handleAIOcr(base64Image) {
  try {
    const apiKey = GEMINI_API_KEY.trim();
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

    let geminiResult = null, isSuccess = false, usedModelStr = "", errorLogs = [], retryCount = 0;
    for (let i = 0; i < models.length; i++) {
      let model = models[i];
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = UrlFetchApp.fetch(geminiUrl, { method: 'post', contentType: 'application/json', payload: JSON.stringify(payload), muteHttpExceptions: true });
      
      try { geminiResult = JSON.parse(response.getContentText()); } catch (e) { errorLogs.push(`[${model}] JSON 解析失敗`); continue; }
      if (response.getResponseCode() === 429 && retryCount < 1) { Utilities.sleep(1500); retryCount++; i--; continue; }
      retryCount = 0;
      if (response.getResponseCode() !== 200) { errorLogs.push(`[${model}] 錯誤代碼 ${response.getResponseCode()}`); continue; }
      if (!geminiResult.candidates?.[0]?.content?.parts?.[0]?.text) { errorLogs.push(`[${model}] 回傳內容為空`); continue; }
      isSuccess = true; usedModelStr = model; break;
    }
    if (!isSuccess) return jsonResponse({ success: false, message: `辨識失敗`, debugInfo: errorLogs.join(" | ") });

    let latexRes = geminiResult.candidates[0].content.parts[0].text.replace(/^```(latex|tex)?\n?/i, '').replace(/\n?```$/i, '').trim();
    return jsonResponse({ success: true, latex: latexRes, usedModel: usedModelStr, debugInfo: errorLogs.join(" | ") });
  } catch (err) { return jsonResponse({ success: false, message: `GAS 崩潰: ` + err.toString() }); }
}

function handleAITextToLatex(rawText) {
  try {
    const apiKey = GEMINI_API_KEY.trim();
    const models = ["gemini-2.5-pro", "gemini-2.5-flash"];
    const payload = {
      contents: [{
        role: "user",
        parts: [{ text: `你是一個世界頂級的數學 OCR 系統。請將學生鍵盤輸入的文字轉換為標準 LaTeX。\n輸入為：\n${rawText}\n\n【規則】：\n1. 絕對忠實，嚴禁計算或補全。\n2. 只回傳純粹的 LaTeX。` }]
      }],
      generationConfig: { temperature: 0.0, maxOutputTokens: 2048 },
      safetySettings: safeSettings
    };

    let geminiResult = null, isSuccess = false, usedModelStr = "", errorLogs = [], retryCount = 0;
    for (let i = 0; i < models.length; i++) {
      let model = models[i];
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = UrlFetchApp.fetch(geminiUrl, { method: 'post', contentType: 'application/json', payload: JSON.stringify(payload), muteHttpExceptions: true });
      
      try { geminiResult = JSON.parse(response.getContentText()); } catch (e) { errorLogs.push(`[${model}] JSON 解析失敗`); continue; }
      if (response.getResponseCode() === 429 && retryCount < 1) { Utilities.sleep(1500); retryCount++; i--; continue; }
      retryCount = 0;
      if (response.getResponseCode() !== 200) { errorLogs.push(`[${model}] 錯誤代碼 ${response.getResponseCode()}`); continue; }
      if (!geminiResult.candidates?.[0]?.content?.parts?.[0]?.text) { errorLogs.push(`[${model}] 回傳內容為空`); continue; }
      isSuccess = true; usedModelStr = model; break;
    }
    if (!isSuccess) return jsonResponse({ success: false, message: `轉換失敗`, debugInfo: errorLogs.join(" | ") });

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

    let geminiResult = null, isSuccess = false, usedModelStr = "", errorLogs = [], retryCount = 0;
    for (let i = 0; i < models.length; i++) {
      let model = models[i];
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = UrlFetchApp.fetch(geminiUrl, { method: 'post', contentType: 'application/json', payload: JSON.stringify(payload), muteHttpExceptions: true });
      
      try { geminiResult = JSON.parse(response.getContentText()); } catch (e) { errorLogs.push(`[${model}] JSON 解析失敗`); continue; }
      if (response.getResponseCode() === 429 && retryCount < 1) { Utilities.sleep(1500); retryCount++; i--; continue; }
      retryCount = 0;
      if (response.getResponseCode() !== 200) { errorLogs.push(`[${model}] 錯誤代碼 ${response.getResponseCode()}`); continue; }
      if (!geminiResult.candidates?.[0]?.content?.parts?.[0]?.text) { errorLogs.push(`[${model}] 回傳內容為空`); continue; }
      isSuccess = true; usedModelStr = model; break;
    }
    if (!isSuccess) return jsonResponse({ success: false, message: `批改失敗`, debugInfo: errorLogs.join(" | ") });

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
