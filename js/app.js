// js/app.js

console.log("App.js V71 成功載入！已啟動強制登入認證系統、終極安全防護與今日次數顯示！(支援大小寫忽略)");

// ==========================================
// 🚨 老師設定區
// ==========================================
// 你的 Google Apps Script 網址 
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw_h7rVev1VtAuPK4BFGR4i3lLMC2dGH_X6lkeB5IHZNHWPSBcQtFGNg0U9ZEteZMs/exec"; 

// 🟢 開啟 AI 手寫與鍵盤雙模輸入功能
const ENABLE_AI_HANDWRITING = true; 

const motivationalQuotes = [
    "未來的你，必定感激今天努力的自己。", "默默耕耘，總有收穫。", "答應自己，每天堅持多 1 分鐘。", "今天的累積，是明天的底氣。"
];

const fallbackConfigs = {
    'indices': { name: '指數定律', levels: [ { id: 'L1', title: '⭐ 程度 1', badge: 'S1', desc: '只有 1 個運算步驟<br>鞏固單一法則。' }, { id: 'L2', title: '⭐⭐ 程度 2', badge: 'S3', desc: '只有 2 個運算步驟<br>學習法則轉換。' }, { id: 'L3', title: '⭐⭐⭐ 程度 3', badge: 'S3、DSE', desc: '包含 2 個變數<br>嚴格只有 2 步。' } ] },
    'factorization': { name: '因式分解', levels: [ { id: 'L1', title: '⭐ 程度 1', badge: 'S2', desc: '提公因式<br>學習抽出共同因子。' }, { id: 'L2A', title: '⭐⭐ 程度 2A', badge: 'S2', desc: '一元二次公式分解<br>單一變數完全平方與平方差。' }, { id: 'L2B', title: '⭐⭐ 程度 2B', badge: 'S2', desc: '二元二次公式分解<br>雙變數完全平方與平方差。' }, { id: 'L3A', title: '⭐⭐⭐ 程度 3A', badge: 'S3、DSE', desc: '一元二次因式分解<br>單變數十字相乘法。' }, { id: 'L3B', title: '⭐⭐⭐ 程度 3B', badge: 'S3、DSE', desc: '二元二次因式分解<br>包含雙變數的十字相乘。' } ] },
    'rounding': { name: '近似值與捨入', levels: [ { id: 'L1', title: '⭐ 程度 1', badge: 'S1、DSE', desc: '基本捨入<br>小數點與有效數字的基本四捨五入。' }, { id: 'L2', title: '⭐⭐ 程度 2', badge: 'S1、DSE', desc: '上捨入與下捨入<br>進階要求：強制進位或捨去。' }, { id: 'L3', title: '⭐⭐⭐ 程度 3', badge: 'S1、DSE', desc: '綜合應用<br>包含前導零小數及大整數陷阱。' } ] },
    'identities': { name: '恆等式', levels: [ { id: 'L1', title: '⭐ 程度 1', badge: 'S2', desc: '展開與比較係數<br>基礎一元一次恆等式。' }, { id: 'L2', title: '⭐⭐ 程度 2', badge: 'S2、DSE', desc: '二次恆等式<br>進階代入與比較係數。' }, { id: 'L3', title: '⭐⭐⭐ 程度 3', badge: 'S2、DSE', desc: '比例問題<br>求取多個未知數的比例。' } ] },
    'fractions': { name: '通分母', levels: [ { id: 'L1', title: '⭐ 程度 1', badge: 'S2、DSE', desc: '分母為一元一次<br>分子為常數。' }, { id: 'L2', title: '⭐⭐ 程度 2', badge: 'S4', desc: '分母為一元二次<br>需先因式分解再通分母。' } ] },
    'binary': { name: '二進制', levels: [ { id: 'L1', title: '⭐ 程度 1', badge: 'S3、DSE', desc: '二進制轉十進制<br>只有加法。' }, { id: 'L2', title: '⭐⭐ 程度 2', badge: 'S3、DSE', desc: '十進制轉二進制<br>只有加法。' }, { id: 'L3', title: '⭐⭐⭐ 程度 3', badge: 'S3、DSE', desc: '綜合轉換<br>包含加法與減法。' } ] },
    'expansion': { name: '恆等式的展開', levels: [ { id: 'L1', title: '⭐ 程度 1', badge: 'S2', desc: '展開 (x+a)² 或 (x+a)(x-a)<br>基礎展開。' }, { id: 'L2', title: '⭐⭐ 程度 2', badge: 'S3、DSE', desc: '展開 (bx+a)² 或 (bx+a)(bx-a)<br>b 為正整數。' }, { id: 'L3', title: '⭐⭐⭐ 程度 3', badge: 'S3、DSE', desc: '展開 (bx+a)² 或 (bx+a)(bx-a)<br>a 與 b 皆可為負數。' } ] },
    'alg_frac_mul_div': { name: '代數分式的乘除法', levels: [ { id: 'L1', title: '⭐ 程度 1', badge: 'S2', desc: '單項式乘除法<br>指數定律約簡' }, { id: 'L2', title: '⭐⭐ 程度 2', badge: 'S2', desc: '二項式乘除法<br>提公因式與變號' }, { id: 'L3', title: '⭐⭐⭐ 程度 3', badge: 'S3、DSE', desc: '進階因式分解<br>平方差與完全平方' }, { id: 'L4', title: '⭐⭐⭐⭐ 程度 4', badge: 'S3、DSE', desc: '進階因式分解<br>十字相乘法' } ] },
    'triangle_area': { name: '三角形面積', levels: [ { id: 'L1', title: '⭐ 程度 1', badge: 'S3、DSE', desc: '包含 1/2absinC 及 希羅公式<br>考驗公式判別與計算。' } ] }
};

let questionBank = [];
let currentQuestionIndex = 0;
let score = 0;
let attemptsCount = 0; 
let currentLevelPref = 1; 
let currentTopic = 'indices'; 
let currentTopicName = '指數定律';
let totalQuestionsConfig = 3; 
let dynamicQuotes = [];
let dynamicTopicConfig = [];
let globalLeaderboard = []; 
let currentLeaderboardHash = ""; 
let isFetchingLock = false; 

// 🌟 功課系統與追蹤器變數
let isHomeworkMode = false;
let currentHomeworkName = "";
let dynamicHomeworkConfig = [];
let topicScores = {}; // 追蹤各課題的分數明細

// 🛡️ 終極防護系統變數
let quizStartTime = 0;
let quizTimeTaken = 0;
let sessionNonce = "";
let quizIntegrity = { seed: "", chain: "", events: [] };

let currentRecognizedLaTeX = "";

function getStoredData(key) { try { return localStorage.getItem(key) || ''; } catch (e) { return ''; } }
function setStoredData(key, value) { try { localStorage.setItem(key, value); } catch (e) {} }

// ==========================================
// 🌟 核心：動態生成登入介面與強制登入邏輯
// ==========================================
function initLoginUI() {
    if (document.getElementById('loginScreen')) return;
    const mainWrapper = document.getElementById('main-wrapper') || document.body;
    const loginDiv = document.createElement('div');
    loginDiv.innerHTML = `
    <div id="loginScreen" class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-10 text-center max-w-lg mx-auto mt-8 z-50">
        <div class="flex justify-center items-center gap-3 mb-6">
            <div class="bg-indigo-100 text-indigo-500 p-3 rounded-full">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
            </div>
            <h1 class="text-3xl font-bold text-slate-800">修練所登入</h1>
        </div>
        <p class="text-slate-500 mb-8 font-medium">請輸入班別、學號與密碼以進行認證</p>
        <div class="space-y-4 text-left mb-8">
            <div><label class="block text-sm font-bold text-slate-600 mb-1">班別</label><input type="text" id="loginClass" class="w-full p-3 border border-slate-300 rounded-lg uppercase"></div>
            <div><label class="block text-sm font-bold text-slate-600 mb-1">學號</label><input type="number" id="loginNum" class="w-full p-3 border border-slate-300 rounded-lg"></div>
            <div><label class="block text-sm font-bold text-slate-600 mb-1">密碼</label><input type="password" id="loginPwd" class="w-full p-3 border border-slate-300 rounded-lg"></div>
        </div>
        <button id="loginSubmitBtn" onclick="loginApp()" class="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-md text-lg">進入修練所 ➡️</button>
    </div>`;
    mainWrapper.prepend(loginDiv.firstElementChild);

    const topicScreen = document.getElementById('topicScreen');
    if (topicScreen && !document.getElementById('logoutBtn')) {
        const logoutHTML = `<div class="flex justify-end mb-2"><button id="logoutBtn" onclick="logoutApp()" class="text-sm text-slate-400 hover:text-red-500 font-bold underline transition-colors">登出更換帳號</button></div>`;
        topicScreen.insertAdjacentHTML('afterbegin', logoutHTML);
    }
}

window.loginApp = async function() {
    const cClass = document.getElementById('loginClass')?.value.toUpperCase().trim();
    const cNum = document.getElementById('loginNum')?.value.trim();
    const cPwd = document.getElementById('loginPwd')?.value.trim() || "";

    if (!cClass || !cNum) {
        alert("請填寫班別與學號！");
        return;
    }

    const btn = document.getElementById('loginSubmitBtn');
    if (btn) { btn.disabled = true; btn.textContent = "驗證中..."; }

    try {
        const formData = new URLSearchParams();
        formData.append('action', 'verify_login');
        formData.append('className', cClass);
        formData.append('classNumber', cNum);
        formData.append('password', cPwd);

        const result = await fetch(GOOGLE_SCRIPT_URL, { method: 'POST', body: formData }).then(r => r.json());

        if (!result.success) {
            alert(result.message || "登入失敗，請再試。");
            if (btn) { btn.disabled = false; btn.textContent = "進入修練所 ➡️"; }
            return;
        }

        // 🌟 姓名直接從後端 Google Sheet 取得，不再需要學生輸入
        setStoredData('dse_className', cClass);
        setStoredData('dse_classNumber', cNum);
        setStoredData('dse_studentName', result.studentName || "");
        setStoredData('dse_password', cPwd);

        showTopicScreen();
        renderLeaderboards();
    } catch (err) {
        alert("網路連線失敗，請檢查網路後再試。");
        if (btn) { btn.disabled = false; btn.textContent = "進入修練所 ➡️"; }
    }
};

window.logoutApp = function() {
    if(confirm("確定要登出並清除目前的帳號資料嗎？")) {
        setStoredData('dse_className', '');
        setStoredData('dse_classNumber', '');
        setStoredData('dse_studentName', '');
        setStoredData('dse_password', '');
        location.reload();
    }
};

function showTopicScreen() {
    initLoginUI(); // 確保登入介面已生成
    
    const savedClass = getStoredData('dse_className');
    const savedNum = getStoredData('dse_classNumber');
    const savedName = getStoredData('dse_studentName');
    
    document.getElementById('startScreen')?.classList.add('hidden');
    document.getElementById('appContainer')?.classList.add('hidden');
    document.getElementById('endScreen')?.classList.add('hidden');
    
    const topicScreen = document.getElementById('topicScreen');
    
    // 🌟 只要有班別與學號，就允許進入選單
    if (!savedClass || !savedNum) {
        // 未登入：強制顯示登入畫面，隱藏主畫面
        document.getElementById('loginScreen')?.classList.remove('hidden');
        topicScreen?.classList.add('hidden');
    } else {
        // 已登入：隱藏登入畫面，顯示主畫面
        document.getElementById('loginScreen')?.classList.add('hidden');
        topicScreen?.classList.remove('hidden');
        
        // 🌟 新增：在主選單左上角動態加入學生資訊 Badge
        if (topicScreen) {
            topicScreen.classList.add('relative'); // 確保可以絕對定位
            let infoBadge = document.getElementById('student-info-badge');
            if (!infoBadge) {
                infoBadge = document.createElement('div');
                infoBadge.id = 'student-info-badge';
                // 使用 Tailwind CSS 設定左上角絕對定位與樣式
                infoBadge.className = 'absolute top-4 left-4 sm:top-6 sm:left-6 bg-indigo-50 border border-indigo-200 text-indigo-800 px-3 py-1.5 rounded-lg text-sm sm:text-base font-bold shadow-sm flex items-center gap-2 z-10';
                topicScreen.appendChild(infoBadge);
            }
            // 寫入學生資料
            infoBadge.innerHTML = `<span>🎓 ${savedClass} 班 - ${savedNum} 號 (${savedName})</span>`;
        }
        
        // 更新結算畫面顯示身分
        const identityEl = document.getElementById('submitIdentityInfo');
        if (identityEl) identityEl.textContent = `${savedClass} 班 - ${savedNum} 號 (${savedName})`;
    }
}

async function fetchConfig(isSilent = false) {
    if (isFetchingLock) return; 
    try {
        if (GOOGLE_SCRIPT_URL && !GOOGLE_SCRIPT_URL.includes("請在此貼上")) {
            const cacheBusterUrl = GOOGLE_SCRIPT_URL + (GOOGLE_SCRIPT_URL.includes('?') ? '&' : '?') + 't=' + new Date().getTime();
            const response = await fetch(cacheBusterUrl);
            const data = await response.json();
            
            if (!isSilent) console.log("📥 從伺服器收到的 JSON 資料：", data);
            
            if (data && data.leaderboard) {
                const newHash = JSON.stringify(data.leaderboard);
                if (newHash !== currentLeaderboardHash) {
                    globalLeaderboard = data.leaderboard;
                    currentLeaderboardHash = newHash;
                    renderLeaderboards(); 
                }
            } else if (currentLeaderboardHash !== "empty") {
                globalLeaderboard = [];
                currentLeaderboardHash = "empty";
                renderLeaderboards();
            }
            if (data.topicConfig) dynamicTopicConfig = data.topicConfig;
            if (data.quotes) dynamicQuotes = data.quotes;
            
            if (data.homeworkConfig) {
                dynamicHomeworkConfig = data.homeworkConfig;
            } else {
                dynamicHomeworkConfig = [];
            }
            renderHomeworkButtons();
        }
    } catch (e) {
        if (!isSilent) console.warn("⚠️ 讀取設定失敗", e);
        if (currentLeaderboardHash === "") {
            globalLeaderboard = [];
            currentLeaderboardHash = "error";
            renderLeaderboards();
        }
        dynamicHomeworkConfig = [];
        renderHomeworkButtons();
    }
}

function renderHomeworkButtons() {
    const hwSection = document.getElementById('homeworkSection');
    const hwGrid = document.getElementById('homeworkGrid');
    
    let d = new Date();
    let dateString = d.getFullYear() + "年" + (d.getMonth()+1) + "月" + d.getDate() + "日";

    if (hwSection) {
        hwSection.classList.remove('hidden'); 
        
        let dateSpan = document.getElementById('hw-date-display');
        if (dateSpan) {
            dateSpan.innerHTML = `📅 今日日期：${dateString}`;
        } else {
            let pTag = hwSection.querySelector('p');
            if (pTag && !pTag.innerHTML.includes('hw-date-display')) {
                pTag.innerHTML = `老師已派發專屬功課！完成將會記錄明細成績（每份功課限交 2 次）<br><span id="hw-date-display" class="inline-block mt-3 font-bold text-amber-800 bg-amber-200 px-4 py-1.5 rounded-full shadow-sm">📅 今日日期：${dateString}</span>`;
            }
        }
    }
    
    if (!dynamicHomeworkConfig || dynamicHomeworkConfig.length === 0) {
        if (hwGrid) {
            hwGrid.innerHTML = `<div class="col-span-full text-center py-6 text-amber-700 font-bold bg-amber-100/50 rounded-xl border border-amber-200 border-dashed">🎉 今天暫無功課，好好休息或進行下方自主練習吧！</div>`;
        }
        return;
    }
    
    let uniqueHwNames = [...new Set(dynamicHomeworkConfig.map(c => c.hwName))];
    
    if (hwGrid) {
        hwGrid.innerHTML = '';
        uniqueHwNames.forEach(hwName => {
            let totalQs = dynamicHomeworkConfig.filter(c => c.hwName === hwName).reduce((sum, c) => sum + (c.qCount || 1), 0);
            
            hwGrid.innerHTML += `
            <button onclick="startHomework('${hwName}')" class="py-4 px-2 border border-amber-300 rounded-xl hover:border-amber-400 hover:shadow-md hover:bg-amber-100 transition-all bg-white shadow-sm flex flex-col items-center justify-center group">
                <span class="text-amber-800 font-bold text-sm sm:text-base">${hwName}</span>
                <span class="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md mt-1 border border-amber-100">共 ${totalQs} 題 (每題 10 分)</span>
            </button>
            `;
        });
    }
}

function renderLeaderboards(overrideClass = null, overrideNum = null) {
    const homeContainer = document.getElementById('leaderboard-home-container');
    const endContainer = document.getElementById('leaderboard-end-container');
    const myRankHome = document.getElementById('my-rank-home');
    const myRankEnd = document.getElementById('my-rank-end');

    if (!globalLeaderboard || globalLeaderboard.length === 0) {
        const emptyHtml = `<div class="col-span-full text-center py-6 text-slate-500 font-bold">目前尚無排名數據，或網路連線異常。</div>`;
        if (homeContainer) homeContainer.innerHTML = emptyHtml;
        if (endContainer) endContainer.innerHTML = emptyHtml;
        
        const myRankHtml = `<div class="bg-slate-50 border border-slate-200 p-3 rounded-lg text-center text-sm text-slate-500 shadow-sm mb-4">💡 遞交成績後，即可顯示專屬排名狀態。</div>`;
        if (myRankHome) myRankHome.innerHTML = myRankHtml;
        if (myRankEnd) myRankEnd.innerHTML = myRankHtml;
        return;
    }
    
    const currentUserClass = String(overrideClass || getStoredData('dse_className')).toUpperCase().trim();
    const currentUserNum = String(overrideNum || getStoredData('dse_classNumber')).trim();

    let userRank = -1;
    let userScore = 0;
    let userPlayCount = 0;
    let userMatched = false;

    globalLeaderboard.forEach((student, index) => {
        const sClass = String(student.className).toUpperCase().trim();
        const sNum = String(student.classNum).trim();
        
        let isMatch = (sClass === currentUserClass && sNum === currentUserNum);
        
        // 🌟 核心防呆修正：後端傳來的空值若對應到學號 0，直接比對班別與學號即可
        if (!isMatch && sClass === currentUserClass && sNum === "" && currentUserNum === "0") {
            isMatch = true;
        }

        if (isMatch && !userMatched) {
            userRank = index + 1;
            userScore = student.totalScore;
            userPlayCount = student.playCountToday || 0;
            userMatched = true;
        }
    });

    let html = '<div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2">';
    globalLeaderboard.slice(0, 20).forEach((student, index) => {
        let rankIcon = index === 0 ? '🥇' : (index === 1 ? '🥈' : (index === 2 ? '🥉' : `<span class="inline-block w-6 text-center text-slate-400 font-bold text-sm">${index + 1}.</span>`));
        
        html += `<div class="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm transition-all hover:shadow-md"><div class="flex items-center gap-3">${rankIcon}<span class="font-bold text-slate-700 text-base">${student.className} (${student.classNum}) ${student.studentName}</span></div><div class="text-right flex flex-col justify-center"><span class="text-indigo-600 font-bold text-base">${student.totalScore} 分</span><span class="text-slate-400 font-bold text-[11px] mt-0.5">今日: ${student.playCountToday || 0} 次</span></div></div>`;
    });
    html += '</div>';

    if (homeContainer) homeContainer.innerHTML = html;
    
    let endHtml = '<div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2">';
    globalLeaderboard.slice(0, 20).forEach((student, index) => {
        let rankIcon = index === 0 ? '🥇' : (index === 1 ? '🥈' : (index === 2 ? '🥉' : `<span class="inline-block w-6 text-center text-slate-400 font-bold text-sm">${index + 1}.</span>`));
        
        endHtml += `<div class="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100 shadow-sm transition-all hover:shadow-md"><div class="flex items-center gap-2">${rankIcon}<span class="font-bold text-slate-700 text-sm sm:text-base">${student.className} (${student.classNum}) ${student.studentName}</span></div><div class="text-right flex flex-col justify-center"><span class="text-indigo-600 font-bold text-sm sm:text-base">${student.totalScore} 分</span><span class="text-slate-400 font-bold text-[10px] mt-0.5">今日: ${student.playCountToday || 0} 次</span></div></div>`;
    });
    endHtml += '</div>';
    if (endContainer) endContainer.innerHTML = endHtml;

    let myRankHtml = '';
    if (currentUserClass && currentUserNum) {
        if (userRank !== -1) {
            myRankHtml = `<div class="bg-[#FFF3C4] border border-[#FDE68A] p-4 rounded-xl flex justify-between items-center shadow-sm mb-6">
                <span class="font-bold text-amber-800 text-base flex items-center gap-2"><span class="text-xl">👉</span> 你的目前排名：第 ${userRank} 名</span>
                <div class="text-right flex flex-col justify-center">
                    <span class="text-amber-800 font-bold text-lg">${userScore} 分</span>
                    <span class="text-amber-600 font-bold text-xs mt-0.5">今日已交: ${userPlayCount} 次</span>
                </div>
            </div>`;
        } else {
            myRankHtml = `<div class="bg-slate-100 border border-slate-300 p-3 rounded-lg flex justify-between items-center shadow-sm mb-6"><span class="font-bold text-slate-600">👉 你的目前排名：未上榜</span><span class="text-slate-500 font-bold text-sm">繼續刷題累積積分吧！</span></div>`;
        }
    }
    if (myRankHome) myRankHome.innerHTML = myRankHtml;
    if (myRankEnd) myRankEnd.innerHTML = myRankHtml;
}

function setQuestionNum(num) {
    totalQuestionsConfig = num;
    if (typeof window !== 'undefined') window.totalQuestionsConfig = num; 
    
    document.querySelectorAll('.num-btn').forEach(btn => {
        if (btn) {
            btn.classList.remove('bg-indigo-600', 'text-white', 'shadow-md');
            btn.classList.add('bg-transparent', 'text-slate-600');
        }
    });
    const activeBtn = document.getElementById('btn-num-' + num);
    if (activeBtn) { 
        activeBtn.classList.remove('bg-transparent', 'text-slate-600'); 
        activeBtn.classList.add('bg-indigo-600', 'text-white', 'shadow-md'); 
    }
}

function backToLevelSelection() {
    document.getElementById('appContainer')?.classList.add('hidden');
    document.getElementById('endScreen')?.classList.add('hidden');
    if (isHomeworkMode) showTopicScreen(); 
    else if (currentTopic === 'global_mixed') showTopicScreen(); 
    else selectTopic(currentTopic);
}

window.restartLevel = function() {
    if (isHomeworkMode) startHomework(currentHomeworkName);
    else startGame(currentLevelPref);
};

function backToLevelSelectionFromQuiz() { document.getElementById('confirmModal')?.classList.remove('hidden'); }
function closeConfirmModal() { document.getElementById('confirmModal')?.classList.add('hidden'); }
function confirmBackToLevelSelection() { closeConfirmModal(); backToLevelSelection(); }

function assignQuestionScores() {
    if (!questionBank) return;
    questionBank.forEach(q => {
        if (!q) return;
        let lvlStr = q.level || "";
        if (lvlStr.includes('4')) q.scoreVal = 15;
        else if (lvlStr.includes('3')) q.scoreVal = 12;
        else if (lvlStr.includes('2')) q.scoreVal = 8;
        else if (lvlStr.includes('1')) q.scoreVal = 5;
        else q.scoreVal = 10; 
    });
}

function selectTopic(topic) {
    currentTopic = topic;
    document.getElementById('topicScreen')?.classList.add('hidden');
    document.getElementById('startScreen')?.classList.remove('hidden');
    
    ['btnL1', 'btnL2', 'btnL3', 'btnL4', 'btnL2A', 'btnL2B', 'btnL3A', 'btnL3B'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });

    let config = fallbackConfigs[topic];
    if (!config) return;
    currentTopicName = config.name;
    const lTitle = document.getElementById('levelTitle');
    if (lTitle) lTitle.textContent = config.name + ' - 請選擇難度';

    config.levels.forEach(lvl => {
        let title = lvl.title, badge = lvl.badge, desc = lvl.desc;
        
        if (typeof dynamicTopicConfig !== 'undefined' && dynamicTopicConfig.length > 0) {
            let custom = dynamicTopicConfig.find(c => c.topic === topic && c.levelId === lvl.id);
            if (custom) {
                if (custom.title) title = custom.title;
                if (custom.badge) badge = custom.badge;
                if (custom.desc) desc = custom.desc;
            }
        }
        
        let scoreVal = 5;
        if (lvl.id.includes('2')) scoreVal = 8;
        if (lvl.id.includes('3')) scoreVal = 12;
        if (lvl.id.includes('4')) scoreVal = 15;

        const btn = document.getElementById('btn' + lvl.id.toUpperCase());
        if (btn) {
            btn.classList.remove('hidden');
            let colorClass = lvl.id.includes('1') ? 'bg-green-100 text-green-700' : (lvl.id.includes('2') ? 'bg-blue-100 text-blue-700' : (lvl.id.includes('3') ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'));
            
            let btnFont = btn.querySelector('.font-bold');
            if(btnFont) btnFont.innerHTML = title + `<div class="mt-1"><span class="inline-block px-2 py-0.5 ${colorClass} text-xs rounded-md font-bold">${badge}</span></div>`;
            
            if(btn.lastElementChild) btn.lastElementChild.innerHTML = desc + `<div class="mt-3 text-indigo-600 font-bold text-sm bg-indigo-50 inline-block px-3 py-1 rounded-full shadow-sm border border-indigo-100">🎯 答對得 ${scoreVal} 分</div>`;
        }
    });
}

function assignHandwriting(bank) {
    if (!ENABLE_AI_HANDWRITING || !bank) return; 
    let hwCount = 0;
    
    if (bank.length === 3) hwCount = 1;
    else if (bank.length === 5) hwCount = 2;
    else if (bank.length === 10) hwCount = 3;
    else if (bank.length > 0) hwCount = Math.floor(bank.length / 3);

    let indices = Array.from({length: bank.length}, (_, i) => i);
    indices = shuffleArray(indices).slice(0, hwCount);
    
    for (let i of indices) {
        if(bank[i]) { bank[i].isHandwriting = true; }
    }
}

// 🌟 啟動功課專屬生成器
window.startHomework = function(hwName) {
    try {
        isHomeworkMode = true;
        currentHomeworkName = hwName;
        currentTopicName = hwName; 
        
        let configs = dynamicHomeworkConfig.filter(c => c.hwName === hwName);
        if (configs.length === 0) return alert("找不到此功課的設定！");

        questionBank = [];
        let qIdCounter = 1;
        
        configs.forEach(cfg => {
            let qArr = [];
            try {
                if (cfg.topic === 'indices') qArr = generateIndicesQuestions(cfg.qCount, String(cfg.levelId));
                else if (cfg.topic === 'factorization') qArr = generateFactorizationQuestions(cfg.qCount, String(cfg.levelId).toLowerCase());
                else if (cfg.topic === 'rounding') qArr = generateRoundingQuestions(cfg.qCount, String(cfg.levelId));
                else if (cfg.topic === 'identities') qArr = generateIdentitiesQuestions(cfg.qCount, String(cfg.levelId));
                else if (cfg.topic === 'fractions') qArr = generateFractionsQuestions(cfg.qCount, String(cfg.levelId));
                else if (cfg.topic === 'binary') qArr = generateBinaryQuestions(cfg.qCount, String(cfg.levelId));
                else if (cfg.topic === 'expansion') qArr = generateExpansionQuestions(cfg.qCount, String(cfg.levelId));
                else if (cfg.topic === 'alg_frac_mul_div') qArr = generateAlgFracMulDivQuestions(cfg.qCount, String(cfg.levelId));
                else if (cfg.topic === 'triangle_area') qArr = generateTriangleAreaQuestions(cfg.qCount, String(cfg.levelId));
            } catch(e) {
                console.error(`Error generating ${cfg.topic}:`, e);
            }

            qArr.forEach(q => {
                q.id = qIdCounter++;
                questionBank.push(q);
            });
        });

        if (questionBank.length === 0) return alert("功課題庫生成失敗，請檢查設定表！");

        assignQuestionScores();

        // 🌟 功課模式中，所有題目不論難度皆強制設為 10 分
        questionBank.forEach(q => {
            q.scoreVal = 10;
        });

        assignHandwriting(questionBank);

        topicScores = {};
        questionBank.forEach(q => {
            let t = q.topic;
            if (!topicScores[t]) topicScores[t] = { earned: 0, total: 0 };
            topicScores[t].total += (q.scoreVal || 10);
        });

        startQuizSession();
    } catch (error) { 
        alert(`🚨 系統錯誤！無法讀取功課題庫。\n原因：${error.message}`); 
    }
};

function startGlobalMixed(level) {
    try {
        isHomeworkMode = false;
        currentHomeworkName = "";
        currentTopic = 'global_mixed';
        currentTopicName = '跨課題綜合挑戰';
        currentLevelPref = level;

        let topicsList = ['indices', 'factorization', 'rounding', 'identities', 'fractions', 'binary', 'expansion', 'alg_frac_mul_div', 'triangle_area'];
        
        let numQ = typeof window !== 'undefined' && window.totalQuestionsConfig ? window.totalQuestionsConfig : totalQuestionsConfig;
        let selectedTopics = [];
        
        while (selectedTopics.length < numQ) {
            selectedTopics.push(topicsList[Math.floor(Math.random() * topicsList.length)]);
        }
        selectedTopics = shuffleArray(selectedTopics);

        questionBank = [];
        selectedTopics.forEach((t, idx) => {
            let qArr = [];
            let lvl = String(level);
            
            let supportedIds = fallbackConfigs[t].levels.map(l => l.id.toLowerCase());
            let maxSupported = supportedIds.some(id => id.includes('4')) ? 4 : (supportedIds.some(id => id.includes('3')) ? 3 : 2);
            
            if (lvl !== 'mixed' && parseInt(lvl) > maxSupported) lvl = String(maxSupported);
            
            try {
                if (t === 'indices') qArr = generateIndicesQuestions(1, lvl);
                else if (t === 'factorization') {
                    let fLvl = lvl;
                    if (lvl === '2') fLvl = Math.random() > 0.5 ? '2a' : '2b';
                    else if (lvl === '3' || lvl === '4') fLvl = Math.random() > 0.5 ? '3a' : '3b';
                    else if (lvl === 'mixed') fLvl = 'mixed';
                    qArr = generateFactorizationQuestions(1, fLvl);
                }
                else if (t === 'rounding') qArr = generateRoundingQuestions(1, lvl);
                else if (t === 'identities') qArr = generateIdentitiesQuestions(1, lvl);
                else if (t === 'fractions') qArr = generateFractionsQuestions(1, lvl);
                else if (t === 'binary') qArr = generateBinaryQuestions(1, lvl);
                else if (t === 'expansion') qArr = generateExpansionQuestions(1, lvl);
                else if (t === 'alg_frac_mul_div') qArr = generateAlgFracMulDivQuestions(1, lvl);
                else if (t === 'triangle_area') qArr = generateTriangleAreaQuestions(1, lvl);
            } catch(e) {
                console.error(`Error generating ${t}:`, e);
            }

            if (qArr && qArr.length > 0 && qArr[0]) { 
                qArr[0].id = idx + 1; 
                if (level !== 'mixed') qArr[0].level = `程度 ${level}`;
                questionBank.push(qArr[0]); 
            } else {
                qArr = generateIndicesQuestions(1, "1");
                if (qArr && qArr.length > 0 && qArr[0]) {
                    qArr[0].id = idx + 1;
                    qArr[0].topic = fallbackConfigs[t]?.name + " (替代)" || "替代題目";
                    if (level !== 'mixed') qArr[0].level = `程度 ${level}`;
                    questionBank.push(qArr[0]);
                }
            }
        });

        assignQuestionScores();
        assignHandwriting(questionBank);

        topicScores = {};
        questionBank.forEach(q => {
            let t = q.topic;
            if (!topicScores[t]) topicScores[t] = { earned: 0, total: 0 };
            topicScores[t].total += (q.scoreVal || 10);
        });

        startQuizSession();
    } catch (error) { alert(`🚨 系統錯誤！無法讀取跨課題題庫。\n原因：${error.message}`); }
}

function startGame(levelPref) {
    try {
        isHomeworkMode = false;
        currentHomeworkName = "";
        if (currentTopic === 'global_mixed') return startGlobalMixed(levelPref);

        currentLevelPref = levelPref;
        
        let numQ = typeof window !== 'undefined' && window.totalQuestionsConfig ? window.totalQuestionsConfig : totalQuestionsConfig;
        
        if (currentTopic === 'indices') questionBank = generateIndicesQuestions(numQ, currentLevelPref); 
        else if (currentTopic === 'factorization') questionBank = generateFactorizationQuestions(numQ, currentLevelPref); 
        else if (currentTopic === 'rounding') questionBank = generateRoundingQuestions(numQ, currentLevelPref);
        else if (currentTopic === 'identities') questionBank = generateIdentitiesQuestions(numQ, currentLevelPref);
        else if (currentTopic === 'fractions') questionBank = generateFractionsQuestions(numQ, currentLevelPref);
        else if (currentTopic === 'binary') questionBank = generateBinaryQuestions(numQ, currentLevelPref);
        else if (currentTopic === 'expansion') questionBank = generateExpansionQuestions(numQ, currentLevelPref);
        else if (currentTopic === 'alg_frac_mul_div') questionBank = generateAlgFracMulDivQuestions(numQ, currentLevelPref);
        else if (currentTopic === 'triangle_area') questionBank = generateTriangleAreaQuestions(numQ, currentLevelPref);
        
        assignQuestionScores();
        assignHandwriting(questionBank);

        topicScores = {};
        questionBank.forEach(q => {
            let t = q.topic;
            if (!topicScores[t]) topicScores[t] = { earned: 0, total: 0 };
            topicScores[t].total += (q.scoreVal || 10);
        });

        startQuizSession();
    } catch (error) { alert(`🚨 系統錯誤！無法讀取題庫。\n原因：${error.message}`); }
}

function startQuizSession() {
    currentQuestionIndex = 0; score = 0; updateScoreDisplay();
    
    // 🌟 啟動防護紀錄：記錄開始時間與產生一次性隨機碼 (UUID)
    quizStartTime = Date.now();
    sessionNonce = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36);

    document.getElementById('topicScreen')?.classList.add('hidden');
    document.getElementById('startScreen')?.classList.add('hidden');
    document.getElementById('endScreen')?.classList.add('hidden'); 
    document.getElementById('appContainer')?.classList.remove('hidden');
    
    const btn = document.getElementById('submitRecordBtn');
    if (btn) {
        btn.disabled = false; btn.textContent = "傳送成績";
        btn.classList.replace('bg-slate-400', 'bg-[#44994d]');
    }
    document.getElementById('submitStatus')?.classList.add('hidden');

    loadQuestion();
}

window.switchInputMode = function(mode) {
    const drawZone = document.getElementById('draw-input-zone');
    const kbZone = document.getElementById('keyboard-input-zone');
    const tabDraw = document.getElementById('tab-draw');
    const tabKb = document.getElementById('tab-keyboard');
    
    if (mode === 'draw') {
        drawZone?.classList.remove('hidden');
        kbZone?.classList.add('hidden');
        if (tabDraw) tabDraw.className = "flex-1 py-2 text-sm font-bold rounded-md bg-white text-indigo-600 shadow-sm transition-all";
        if (tabKb) tabKb.className = "flex-1 py-2 text-sm font-bold rounded-md text-slate-500 hover:text-slate-700 transition-all";
        setTimeout(() => { resizeCanvas(); }, 50); 
    } else {
        drawZone?.classList.add('hidden');
        kbZone?.classList.remove('hidden');
        if (tabKb) tabKb.className = "flex-1 py-2 text-sm font-bold rounded-md bg-white text-indigo-600 shadow-sm transition-all";
        if (tabDraw) tabDraw.className = "flex-1 py-2 text-sm font-bold rounded-md text-slate-500 hover:text-slate-700 transition-all";
    }
};

window.skipQuestion = function() {
    let q = questionBank[currentQuestionIndex];
    if(!q) return;
    
    attemptsCount = 2; 
    addIntegrityEvent('skip', q, false); 
    
    showFeedback('incorrect', `<div class="mb-4 text-orange-600 font-bold text-lg sm:text-xl bg-orange-50 p-3 rounded-lg border border-orange-200 shadow-sm">⏭️ 你已選擇跳過本題 (獲得 0 分)</div>`, true); 
    
    disableAllButtons();
    
    const skipBtns = document.querySelectorAll('.skip-action-btn');
    skipBtns.forEach(btn => {
        btn.disabled = true;
        btn.classList.add('opacity-50', 'cursor-not-allowed');
    });

    if (q.isHandwriting) {
        ['undo-btn', 'clear-btn', 'recognize-btn', 'kb-recognize-btn', 'kb-clear-btn'].forEach(id => {
            const el = document.getElementById(id);
            if(el) el.disabled = true;
        });
        document.getElementById('draw-container')?.classList.add('border-slate-300');
        document.getElementById('kb-container')?.classList.add('border-slate-300');
    }
};

function loadQuestion() {
    attemptsCount = 0; 
    currentRecognizedLaTeX = ""; 
    
    const q = questionBank[currentQuestionIndex];
    if(!q) return;
    
    const tBadge = document.getElementById('topicBadge');
    if (tBadge) {
        tBadge.textContent = isHomeworkMode ? currentHomeworkName : q.topic;
    }
    
    const lBadge = document.getElementById('levelBadge');
    if (lBadge) {
        if (isHomeworkMode) lBadge.innerHTML = "專屬功課";
        else lBadge.innerHTML = currentTopic === 'global_mixed' ? `綜合挑戰 (難度: ${currentLevelPref})` : `難度: ${q.level}`;
    }
    
    const pText = document.getElementById('progressText');
    if (pText) pText.textContent = `完成 ${currentQuestionIndex}/${questionBank.length}`;
    
    hideFeedback();
    
    const skipBtns = document.querySelectorAll('.skip-action-btn');
    skipBtns.forEach(btn => {
        btn.disabled = false;
        btn.classList.remove('opacity-50', 'cursor-not-allowed');
    });
    
    document.getElementById('hw-confirm-ui')?.classList.add('hidden');
    
    let typeLabel = q.isHandwriting ? `<span class="inline-block bg-amber-100 text-amber-700 px-3 py-1 rounded-md text-sm font-bold align-middle mt-2 sm:mt-0 shadow-sm border border-amber-200">🤖 AI 輔助作答</span>` : "";
    const qText = document.getElementById('questionText');
    if (qText) qText.innerHTML = q.question + `<div class="mt-2 text-center">${typeLabel}</div>`;

    const optionsGrid = document.getElementById('optionsGrid');
    const hwArea = document.getElementById('handwritingArea');
    const skipBtnMC = document.getElementById('skip-btn-mc');
    
    if (q.isHandwriting) {
        optionsGrid?.classList.add('hidden');
        if (skipBtnMC) skipBtnMC.classList.add('hidden'); 
        
        if (hwArea) {
            hwArea.classList.remove('hidden');
            
            document.getElementById('draw-container')?.classList.remove('border-green-500', 'border-red-400');
            document.getElementById('kb-container')?.classList.remove('border-green-500', 'border-red-400');
            
            ['undo-btn', 'clear-btn', 'recognize-btn', 'kb-recognize-btn', 'kb-clear-btn'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.disabled = false;
            });
            
            const kbInput = document.getElementById('keyboard-math-input');
            if (kbInput) kbInput.value = ""; 

            switchInputMode('draw');
            setTimeout(() => { resizeCanvas(); initCanvas(); }, 50);
        }
    } else {
        optionsGrid?.classList.remove('hidden');
        if (skipBtnMC) skipBtnMC.classList.remove('hidden'); 
        
        if (hwArea) hwArea.classList.add('hidden');
        if (optionsGrid) {
            optionsGrid.innerHTML = ''; 
            if(q.options) {
                q.options.forEach(opt => {
                    const btn = document.createElement('button');
                    btn.className = 'option-btn relative p-3 sm:p-4 bg-white border-2 border-slate-200 rounded-xl text-base sm:text-lg text-slate-700 font-medium hover:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-100 flex items-center gap-3 text-left w-full overflow-hidden';
                    btn.onclick = () => handleAnswer(opt, btn);
                    btn.innerHTML = `<span class="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-sm shrink-0">${opt.id}</span><span class="overflow-x-auto math-scroll max-w-full flex-1 py-1">${opt.text}</span>`;
                    optionsGrid.appendChild(btn);
                });
            }
        }
    }
    renderMath();
}

function handleAnswer(selectedOption, buttonElement) {
    attemptsCount++;
    
    let q = questionBank[currentQuestionIndex];

    if (selectedOption.isCorrect) {
        addIntegrityEvent('mcq', q, true);
        const skipBtns = document.querySelectorAll('.skip-action-btn');
        skipBtns.forEach(btn => {
            btn.disabled = true;
            btn.classList.add('opacity-50', 'cursor-not-allowed');
        });

        if(buttonElement) {
            buttonElement.classList.add('border-green-500', 'bg-green-50');
            const spanEl = buttonElement.querySelector('span');
            if (spanEl) {
                spanEl.classList.replace('bg-slate-100', 'bg-green-500');
                spanEl.classList.replace('text-slate-500', 'text-white');
            }
        }
        
        if (attemptsCount === 1) { 
            score += (q.scoreVal || 10); 
            if (topicScores[q.topic]) {
                topicScores[q.topic].earned += (q.scoreVal || 10);
            }
            updateScoreDisplay(); 
        }
        
        showFeedback('correct', selectedOption.hint, true);
        disableAllButtons();
    } else {
        addIntegrityEvent('mcq', q, false);
        const skipBtns = document.querySelectorAll('.skip-action-btn');
        skipBtns.forEach(btn => {
            btn.disabled = false;
            btn.classList.remove('opacity-50', 'cursor-not-allowed');
        });

        if(buttonElement) {
            buttonElement.classList.add('border-red-300', 'bg-red-50');
            buttonElement.disabled = true; 
        }
        showFeedback('incorrect', selectedOption.hint, false);
    }
}

function showFeedback(type, message, showNextBtn) {
    document.getElementById('feedbackArea')?.classList.remove('hidden');
    const fbBox = document.getElementById('feedbackBox');
    if (fbBox) {
        fbBox.className = type === 'correct' ? 'p-4 rounded-xl border bg-green-50 border-green-200 w-full overflow-hidden shadow-sm' : 'p-4 rounded-xl border bg-orange-50 border-orange-200 w-full overflow-hidden shadow-sm';
    }
    
    const fbMsg = document.getElementById('feedbackMessage');
    if (fbMsg) fbMsg.innerHTML = message;
    
    const nextBtn = document.getElementById('nextBtn');
    if (nextBtn) {
        if (showNextBtn) { nextBtn.classList.remove('hidden'); nextBtn.onclick = goToNext; } 
        else { nextBtn.classList.add('hidden'); }
    }
    renderMath();
}

function hideFeedback() { document.getElementById('feedbackArea')?.classList.add('hidden'); }
function disableAllButtons() { document.querySelectorAll('.option-btn').forEach(btn => { if (btn && !btn.classList.contains('border-green-500')) btn.disabled = true; }); }
function goToNext() { currentQuestionIndex++; if (currentQuestionIndex < questionBank.length) loadQuestion(); else showEndScreen(); }

// ==========================================
// 🖌️ 畫布繪圖核心邏輯 (Canvas)
// ==========================================
let isDrawing = false;
let lastX = 0;
let lastY = 0;
let strokeHistory = [];   // 🌟 儲存所有筆劃，用於「上一步」
let currentStroke = [];   // 🌟 當前正在繪製的筆劃

function initCanvas() {
    const canvas = document.getElementById('draw-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    strokeHistory = [];
    currentStroke = [];
    updateUndoBtn();
}

function updateUndoBtn() {
    const btn = document.getElementById('undo-btn');
    if (!btn) return;
    if (strokeHistory.length === 0) {
        btn.disabled = true;
        btn.classList.add('opacity-40', 'cursor-not-allowed');
    } else {
        btn.disabled = false;
        btn.classList.remove('opacity-40', 'cursor-not-allowed');
    }
}

function undoStroke() {
    if (strokeHistory.length === 0) return;
    strokeHistory.pop();
    redrawCanvasFromHistory();
    updateUndoBtn();
}

function redrawCanvasFromHistory() {
    const canvas = document.getElementById('draw-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    strokeHistory.forEach(stroke => {
        if (stroke.length < 2) return;
        ctx.beginPath();
        ctx.moveTo(stroke[0].x, stroke[0].y);
        for (let i = 1; i < stroke.length; i++) {
            ctx.lineTo(stroke[i].x, stroke[i].y);
        }
        ctx.stroke();
    });
}

function resizeCanvas() {
    const canvas = document.getElementById('draw-canvas');
    if (!canvas || !canvas.parentElement) return;
    const rect = canvas.parentElement.getBoundingClientRect();
    
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = canvas.width; tempCanvas.height = canvas.height;
    if (canvas.width > 0 && canvas.height > 0) { tempCtx.drawImage(canvas, 0, 0); }
    
    canvas.width = rect.width; canvas.height = rect.height;
    initCanvas();
    if (tempCanvas.width > 0 && tempCanvas.height > 0) { canvas.getContext('2d').drawImage(tempCanvas, 0, 0, canvas.width, canvas.height); }
}

function getPos(e) {
    const canvas = document.getElementById('draw-canvas');
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
}

function startDrawing(e) {
    e.preventDefault();
    isDrawing = true;
    const pos = getPos(e);
    lastX = pos.x;
    lastY = pos.y;
    currentStroke = [{ x: pos.x, y: pos.y }];
}
function draw(e) {
    if (!isDrawing) return;
    e.preventDefault();
    const pos = getPos(e);
    const ctx = document.getElementById('draw-canvas').getContext('2d');
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastX = pos.x;
    lastY = pos.y;
    currentStroke.push({ x: pos.x, y: pos.y });
}
function stopDrawing() {
    if (isDrawing && currentStroke.length > 1) {
        strokeHistory.push(currentStroke);
        updateUndoBtn();
    }
    currentStroke = [];
    isDrawing = false;
}

function setupCanvasEvents() {
    const canvas = document.getElementById('draw-canvas');
    if (!canvas) return;
    canvas.addEventListener('mousedown', startDrawing); canvas.addEventListener('mousemove', draw); canvas.addEventListener('mouseup', stopDrawing); canvas.addEventListener('mouseout', stopDrawing);
    canvas.addEventListener('touchstart', startDrawing, { passive: false }); canvas.addEventListener('touchmove', draw, { passive: false }); canvas.addEventListener('touchend', stopDrawing); canvas.addEventListener('touchcancel', stopDrawing);
    
    document.getElementById('clear-btn')?.addEventListener('click', () => {
        initCanvas();
        document.getElementById('draw-container')?.classList.remove('border-green-500', 'border-red-400');
    });
    document.getElementById('undo-btn')?.addEventListener('click', () => {
        undoStroke();
        document.getElementById('draw-container')?.classList.remove('border-green-500', 'border-red-400');
    });
    document.getElementById('recognize-btn')?.addEventListener('click', startRecognitionPhase);
    
    document.getElementById('kb-clear-btn')?.addEventListener('click', () => {
        const kbInput = document.getElementById('keyboard-math-input');
        if (kbInput) kbInput.value = "";
        document.getElementById('kb-container')?.classList.remove('border-green-500', 'border-red-400');
    });
    document.getElementById('kb-recognize-btn')?.addEventListener('click', startKeyboardRecognitionPhase);

    window.addEventListener('resize', resizeCanvas);
}

// ==========================================
// 🤖 全新連線架構：使用 Google Apps Script (美國伺服器)
// ==========================================
async function fetchWithRetry(url, options, maxRetries = 3) {
    let delays = [1000, 2000, 4000];
    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await fetch(url, options);
            if (!response.ok) throw new Error(`HTTP 錯誤: ${response.status}`);
            return await response.json();
        } catch (error) {
            if (i === maxRetries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, delays[i]));
        }
    }
}

// 🌟 處理「手寫圖片」上傳
async function startRecognitionPhase() {
    const canvas = document.getElementById('draw-canvas');
    if (!canvas) return;

    const MAX_WIDTH = 800; 
    let scale = 1;
    if (canvas.width > MAX_WIDTH) scale = MAX_WIDTH / canvas.width;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width * scale;
    tempCanvas.height = canvas.height * scale;
    const ctx = tempCanvas.getContext('2d');

    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    ctx.drawImage(canvas, 0, 0, tempCanvas.width, tempCanvas.height);

    const dataURL = tempCanvas.toDataURL('image/jpeg', 0.8);
    const base64Image = dataURL.split(',')[1];
    
    const loadingDiv = document.getElementById('global-loading');
    const loadingText = document.getElementById('global-loading-text');
    if (loadingText) loadingText.innerHTML = "AI 正在將你的手寫筆跡轉換為數式...<br><span class='text-sm font-normal text-slate-500'>傳送至 Google 雲端處理中</span>";
    if (loadingDiv) loadingDiv.classList.remove('hidden');
    
    const recBtn = document.getElementById('recognize-btn');
    if (recBtn) recBtn.disabled = true;
    const clrBtn = document.getElementById('clear-btn');
    if (clrBtn) clrBtn.disabled = true;
    const undoBtn = document.getElementById('undo-btn');
    if (undoBtn) undoBtn.disabled = true;
    document.getElementById('draw-container')?.classList.remove('border-green-500', 'border-red-400');
    
    try {
        const formData = new URLSearchParams();
        formData.append('action', 'ai_ocr');
        formData.append('image', base64Image);

        const result = await fetchWithRetry(GOOGLE_SCRIPT_URL, { method: 'POST', body: formData });
        if (!result.success) throw new Error(result.message);

        if (result.latex === undefined) {
            throw new Error("後台未回傳數式！請確認您的 Google Apps Script 已部署了最新代碼，並且部署時有選擇「建立新版本」。");
        }
        
        currentRecognizedLaTeX = result.latex;
        if (loadingDiv) loadingDiv.classList.add('hidden');
        
        const confirmUI = document.getElementById('hw-confirm-ui');
        const mathDiv = document.getElementById('hw-confirm-math');

        let existingWarning = document.getElementById('model-warning-ocr');
        if (existingWarning) existingWarning.remove();

// 🌟 更新：將 mathpix-v3 加入白名單，成功使用時不再顯示降級警告
        if (result.usedModel && result.usedModel !== "gemini-2.5-pro" && result.usedModel !== "mathpix-v3") {
            const debugText = result.debugInfo ? `<br><span class="text-xs font-normal text-red-500 text-left block mt-1">🔍 偵錯紀錄: ${result.debugInfo}</span>` : "";
            const warningHtml = `<div id="model-warning-ocr" class="w-full max-w-sm bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-3 text-sm font-bold shadow-sm">⚠️ 注意：AI 呼叫失敗，已降級使用「${result.usedModel}」。${debugText}</div>`;
            if (mathDiv) mathDiv.insertAdjacentHTML('beforebegin', warningHtml);
        }

        if (mathDiv) mathDiv.innerHTML = `\\( \\displaystyle ${currentRecognizedLaTeX} \\)`;
        if (confirmUI) confirmUI.classList.remove('hidden');
        renderMath();
        
    } catch (err) {
        console.error(err);
        alert(`⚠️ 辨識失敗！\n\n詳細錯誤：${err.message}`);
        if (loadingDiv) loadingDiv.classList.add('hidden');
        if (recBtn) recBtn.disabled = false;
        if (clrBtn) clrBtn.disabled = false;
    }
}

// 🌟 處理「鍵盤文字」上傳
async function startKeyboardRecognitionPhase() {
    const kbInputElement = document.getElementById('keyboard-math-input');
    if (!kbInputElement) return;
    const kbInput = kbInputElement.value.trim();
    if (!kbInput) {
        alert("請先輸入數學算式！");
        return;
    }
    
    const loadingDiv = document.getElementById('global-loading');
    const loadingText = document.getElementById('global-loading-text');
    if (loadingText) loadingText.innerHTML = "AI 正在將文字轉換為標準數式...<br><span class='text-sm font-normal text-slate-500'>傳送至 Google 雲端處理中</span>";
    if (loadingDiv) loadingDiv.classList.remove('hidden');
    
    const kbRecBtn = document.getElementById('kb-recognize-btn');
    if (kbRecBtn) kbRecBtn.disabled = true;
    const kbClrBtn = document.getElementById('kb-clear-btn');
    if (kbClrBtn) kbClrBtn.disabled = true;
    document.getElementById('kb-container')?.classList.remove('border-green-500', 'border-red-400');
    
    try {
        const formData = new URLSearchParams();
        formData.append('action', 'ai_text_to_latex');
        formData.append('text', kbInput);

        const result = await fetchWithRetry(GOOGLE_SCRIPT_URL, { method: 'POST', body: formData });
        if (!result.success) throw new Error(result.message);

        if (!result.latex || String(result.latex).trim() === "undefined") {
            throw new Error("系統無法識別該數式。請確保輸入了正確的數學符號，或檢查 Google Apps Script 後台是否已更新。");
        }
        
        currentRecognizedLaTeX = result.latex;
        if (loadingDiv) loadingDiv.classList.add('hidden');
        
        const confirmUI = document.getElementById('hw-confirm-ui');
        const mathDiv = document.getElementById('hw-confirm-math');

        let existingWarning = document.getElementById('model-warning-ocr');
        if (existingWarning) existingWarning.remove();

        if (result.usedModel && result.usedModel !== "gemini-2.5-pro") {
            const debugText = result.debugInfo ? `<br><span class="text-xs font-normal text-red-500 text-left block mt-1">🔍 偵錯紀錄: ${result.debugInfo}</span>` : "";
            const warningHtml = `<div id="model-warning-ocr" class="w-full max-w-sm bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-3 text-sm font-bold shadow-sm">⚠️ 注意：Gemini 2.5 Pro 呼叫失敗，已降級使用「${result.usedModel}」。${debugText}</div>`;
            if (mathDiv) mathDiv.insertAdjacentHTML('beforebegin', warningHtml);
        }

        if (mathDiv) mathDiv.innerHTML = `\\( \\displaystyle ${currentRecognizedLaTeX} \\)`;
        if (confirmUI) confirmUI.classList.remove('hidden');
        renderMath();
        
    } catch (err) {
        console.error(err);
        alert(`⚠️ 轉換失敗！\n\n詳細錯誤：${err.message}`);
        if (loadingDiv) loadingDiv.classList.add('hidden');
        if (kbRecBtn) kbRecBtn.disabled = false;
        if (kbClrBtn) kbClrBtn.disabled = false;
    }
}

window.rewriteHandwriting = function() {
    document.getElementById('hw-confirm-ui')?.classList.add('hidden');
    initCanvas(); 
    const btns = ['recognize-btn', 'clear-btn', 'undo-btn', 'kb-recognize-btn', 'kb-clear-btn'];
    btns.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.disabled = false;
    });
};

window.confirmAndGrade = async function() {
    document.getElementById('hw-confirm-ui')?.classList.add('hidden');
    
    const skipBtns = document.querySelectorAll('.skip-action-btn');
    skipBtns.forEach(btn => {
        btn.disabled = true;
        btn.classList.add('opacity-50', 'cursor-not-allowed');
    });
    
    const loadingDiv = document.getElementById('global-loading');
    const loadingText = document.getElementById('global-loading-text');
    if (loadingText) loadingText.innerHTML = "AI 老師正在進行邏輯批改...<br><span class='text-sm font-normal text-slate-500'>比對等價性中</span>";
    if (loadingDiv) loadingDiv.classList.remove('hidden');

    try {
        let q = questionBank[currentQuestionIndex];
        let correctOpt = q.options.find(o => o.isCorrect);
        
        let tempDiv = document.createElement('div');
        tempDiv.innerHTML = correctOpt.text;
        let standardAns = tempDiv.textContent || tempDiv.innerText;
        
        // 🌟 核心修改：將學生答案與標準答案全部轉為小寫，確保英文字母大小寫一致即視為正確
        let studentLatexForGrading = currentRecognizedLaTeX.toLowerCase();
        let standardAnsForGrading = standardAns.toLowerCase();
        
        const formData = new URLSearchParams(); 
        formData.append('action', 'ai_grade');
        formData.append('studentLatex', studentLatexForGrading);
        formData.append('standardAns', standardAnsForGrading);

        const result = await fetchWithRetry(GOOGLE_SCRIPT_URL, { method: 'POST', body: formData });
        if (!result.success) throw new Error(result.message);
        
        if (loadingDiv) loadingDiv.classList.add('hidden');
        attemptsCount++;
        
        let warningHtml = "";
        if (result.usedModel && result.usedModel !== "gemini-2.5-pro") {
            const debugText = result.debugInfo ? `<br><span class="text-xs font-normal text-red-500 mt-1 block text-left">🔍 偵錯紀錄: ${result.debugInfo}</span>` : "";
            warningHtml = `<div class="mt-3 text-red-700 font-bold border-t border-red-200 pt-3 bg-red-50 p-3 rounded-lg shadow-inner text-sm text-center">⚠️ 批改降級警告：Gemini 2.5 Pro 呼叫失敗，已降級使用「${result.usedModel}」。${debugText}</div>`;
        }

        let feedbackHtml = `<div class="mb-3 p-4 bg-indigo-50 border border-indigo-200 rounded-xl text-slate-800 shadow-sm">
            <div class="font-bold text-indigo-700 mb-2">🤖 你的作答 (AI 辨識)：</div>
            <div class="text-xl sm:text-2xl font-bold text-indigo-700 overflow-x-auto math-scroll py-4 bg-white rounded-lg border border-white text-center whitespace-nowrap shadow-inner">\\( \\displaystyle ${currentRecognizedLaTeX} \\)</div>
            ${result.reason ? `<div class="mt-3 text-red-600 font-bold border-t border-indigo-100 pt-2">💡 老師點評：${result.reason}</div>` : ''}
            ${warningHtml}
        </div>`;
        
        let finalHint = feedbackHtml + correctOpt.hint;

        if (result.isCorrect) {
            addIntegrityEvent('hw', q, true);
            if (attemptsCount === 1) { 
                score += (q.scoreVal || 10); 
                if (topicScores[q.topic]) {
                    topicScores[q.topic].earned += (q.scoreVal || 10);
                }
                updateScoreDisplay(); 
            }
            showFeedback('correct', finalHint, true);
            document.getElementById('draw-container')?.classList.add('border-green-500');
            document.getElementById('kb-container')?.classList.add('border-green-500');
        } else {
            addIntegrityEvent('hw', q, false);
            skipBtns.forEach(btn => {
                btn.disabled = false;
                btn.classList.remove('opacity-50', 'cursor-not-allowed');
            });

            showFeedback('incorrect', finalHint, false);
            document.getElementById('draw-container')?.classList.add('border-red-400');
            document.getElementById('kb-container')?.classList.add('border-red-400');
            
            ['undo-btn', 'clear-btn', 'recognize-btn', 'kb-recognize-btn', 'kb-clear-btn'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.disabled = false;
            });
            
            if (attemptsCount >= 2) {
                let giveUpHtml = `<div class="mt-4 text-center"><button onclick="giveUpHandwriting()" class="px-5 py-2 bg-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-300 transition-colors shadow-sm">放棄作答並看正確步驟</button></div>`;
                const fbMsg = document.getElementById('feedbackMessage');
                if (fbMsg) fbMsg.innerHTML += giveUpHtml;
            }
        }
        
    } catch (err) {
        console.error(err);
        alert(`⚠️ 批改失敗！\n\n詳細錯誤：${err.message}\n\n(若顯示 GAS 崩潰，請確認已部署最新版 server.gs)`);
        if (loadingDiv) loadingDiv.classList.add('hidden');
        document.getElementById('hw-confirm-ui')?.classList.remove('hidden');
    }
};

window.giveUpHandwriting = function() {
    let q = questionBank[currentQuestionIndex];
    let correctOpt = q.options.find(o => o.isCorrect);
    showFeedback('incorrect', correctOpt.hint, true); 
    
    ['undo-btn', 'clear-btn', 'recognize-btn', 'kb-recognize-btn', 'kb-clear-btn'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.disabled = true;
    });

    const skipBtns = document.querySelectorAll('.skip-action-btn');
    skipBtns.forEach(btn => {
        btn.disabled = true;
        btn.classList.add('opacity-50', 'cursor-not-allowed');
    });
};

// ==========================================
// 結算畫面與成績儲存
// ==========================================
function showEndScreen() {
    document.getElementById('appContainer')?.classList.add('hidden');
    document.getElementById('endScreen')?.classList.remove('hidden');
    
    // 🌟 結算作答時間 (秒)
    quizTimeTaken = Math.floor((Date.now() - quizStartTime) / 1000);
    
    let totalPossibleScore = questionBank.reduce((sum, q) => sum + (q.scoreVal || 10), 0);
    
    const fScore = document.getElementById('finalScore');
    if (fScore) fScore.textContent = score;
    const tQs = document.getElementById('totalQuestions');
    if (tQs) tQs.textContent = totalPossibleScore;
    
    const subtitle = document.getElementById('endSubtitle');
    if (subtitle) {
        let ratio = score / totalPossibleScore;
        if (ratio >= 0.8) subtitle.textContent = "AI 分析顯示你對這個單元的概念掌握得非常出色！";
        else if (ratio >= 0.5) subtitle.textContent = "AI 分析顯示你對這個單元的概念掌握得不錯！";
        else subtitle.textContent = "AI 分析顯示你還需要多加練習，不要灰心，繼續努力！";
    }

    const trackerUI = document.getElementById('topicDetailsTracker');
    const listUI = document.getElementById('topicDetailsList');
    if (trackerUI && listUI) {
        if (!isHomeworkMode && currentTopic !== 'global_mixed') {
            trackerUI.classList.add('hidden');
        } else {
            trackerUI.classList.remove('hidden');
            let trackerHtml = '';
            for (let t in topicScores) {
                let s = topicScores[t];
                let pct = s.total > 0 ? Math.round((s.earned / s.total) * 100) : 0;
                let barColor = pct >= 80 ? 'bg-green-500' : (pct >= 50 ? 'bg-amber-400' : 'bg-red-500');
                let icon = pct >= 80 ? '✅' : (pct >= 50 ? '⚠️' : '❌');
                
                trackerHtml += `
                <div>
                    <div class="flex justify-between text-sm sm:text-base font-bold text-slate-600 mb-1">
                        <span>${t}</span>
                        <span>${s.earned} / ${s.total} (${pct}%) ${icon}</span>
                    </div>
                    <div class="w-full bg-slate-200 rounded-full h-2.5 shadow-inner">
                        <div class="${barColor} h-2.5 rounded-full transition-all" style="width: ${pct}%"></div>
                    </div>
                </div>`;
            }
            listUI.innerHTML = trackerHtml;
        }
    }
    
    let selectedQuote = { text: "今天的累積，是明天的底氣。" };
    let pool = dynamicQuotes.length > 0 ? dynamicQuotes : motivationalQuotes.map(q => ({text: q, weight: 1}));
    
    let totalWeight = pool.reduce((sum, q) => sum + (parseFloat(q.weight) || 1), 0);
    let randomNum = Math.random() * totalWeight;
    for (let q of pool) {
        let w = parseFloat(q.weight) || 1;
        if (randomNum < w) { selectedQuote = q; break; }
        randomNum -= w;
    }
    const mQuote = document.getElementById('motivationalQuote');
    if (mQuote) mQuote.textContent = selectedQuote.text;
    
    const savedClass = String(getStoredData('dse_className')).toUpperCase().trim();
    const savedNum = String(getStoredData('dse_classNumber')).trim();
    let oldScore = 0;
    if (savedClass && savedNum && globalLeaderboard && globalLeaderboard.length > 0) {
        let student = globalLeaderboard.find(s => String(s.className).toUpperCase().trim() === savedClass && String(s.classNum).trim() === savedNum);
        if (student) oldScore = student.totalScore;
    }
    
    let currentProgress = oldScore % 100;
    let nextThresholdDist = 100 - currentProgress;

    let rewardContainer = document.getElementById('rewardContainer');
    if (rewardContainer) {
        rewardContainer.classList.remove('hidden');
        rewardContainer.innerHTML = `
            <div id="rewardZone" class="w-full bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-sm relative overflow-hidden transition-all duration-500 text-left">
                <div id="progressUI" class="block transition-opacity duration-500">
                    <div class="flex justify-between items-center mb-4">
                        <span class="font-bold text-slate-700 text-lg flex items-center gap-2">🎁 刮刮卡解鎖進度</span>
                        <span class="text-sm font-bold text-indigo-800 bg-indigo-100 px-3 py-1 rounded-lg" id="progressTextUI">${currentProgress} / 100</span>
                    </div>
                    <div class="w-full bg-slate-100 rounded-full h-4 mb-3 overflow-hidden shadow-inner relative">
                        <div id="progressBarFill" class="bg-indigo-500 h-4 rounded-full transition-all duration-1000 ease-out relative" style="width: ${currentProgress}%"></div>
                    </div>
                    <div class="text-sm text-slate-500 text-center font-medium" id="progressHint">
                        還差 <span class="text-indigo-600 font-bold">${nextThresholdDist} 分</span> 即可獲得抽獎機會！傳送成績後更新進度。
                    </div>
                </div>

                <div id="scratchUI" class="hidden opacity-0 transition-opacity duration-500">
                    <div class="relative w-full h-20 sm:h-24 rounded-xl overflow-hidden border-2 border-amber-200 shadow-sm" style="touch-action:none;">
                        <div class="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-amber-50 to-orange-50 text-orange-600 font-bold px-4 text-center text-sm sm:text-base">🎁 <span id="rewardTextDisplay"></span></div>
                        <canvas id="scratchCanvas" class="absolute inset-0 w-full h-full z-10 cursor-pointer"></canvas>
                    </div>
                    <div class="text-xs sm:text-sm text-amber-600 mt-3 text-center font-bold animate-pulse">✨ 恭喜達成滿百目標，快刮開上方塗層看看！✨</div>
                </div>
            </div>
        `;
    }

    // 🌟 自動傳送成績 (無需手動按鈕)
    setTimeout(() => {
        const submitBtn = document.getElementById('submitRecordBtn');
        if (submitBtn && !submitBtn.disabled) {
            submitBtn.textContent = "正在自動傳送...";
            submitToGoogleSheet();
        }
    }, 800);
}

function updateScoreDisplay() {
    const sd = document.getElementById('scoreDisplay');
    if (sd) sd.textContent = score; 
}

function resetIntegrityState() {
    quizIntegrity.seed = (typeof crypto !== 'undefined' && crypto.randomUUID)
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2) + Date.now().toString(36);
    quizIntegrity.chain = quizIntegrity.seed;
    quizIntegrity.events = [];
}

function addIntegrityEvent(eventType, q, isCorrect = false) {
    const payload = {
        t: Date.now(), e: eventType, i: currentQuestionIndex,
        topic: q?.topic || "", level: q?.level || "",
        sv: q?.scoreVal || 0, c: !!isCorrect
    };
    quizIntegrity.events.push(payload);
    const raw = `${quizIntegrity.chain}|${JSON.stringify(payload)}`;
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
        hash = ((hash << 5) - hash) + raw.charCodeAt(i);
        hash = hash & hash;
    }
    quizIntegrity.chain = (hash >>> 0).toString(16);
}

function submitToGoogleSheet() {
    const btn = document.getElementById('submitRecordBtn');
    const statusText = document.getElementById('submitStatus');
    
    // 🌟 從暫存取得登入資訊
    const className = getStoredData('dse_className');
    const classNumber = getStoredData('dse_classNumber');
    const studentName = getStoredData('dse_studentName');
    const studentPwd = getStoredData('dse_password');
    
    if (!className || !classNumber || !studentName || !statusText || !btn) return;

    // 🛑 防連點機制：若按鈕已鎖定，直接阻擋
    if (btn.disabled) return;

    btn.disabled = true; btn.textContent = "傳送中..."; btn.classList.add('opacity-50'); statusText.classList.add('hidden');
    
    let displayLevel = currentLevelPref === 'mixed' ? '綜合挑戰' : currentLevelPref.toString().toUpperCase();
    
    let totalScoreVal = questionBank.reduce((sum, q) => sum + (q.scoreVal || 10), 0);
    let percentageVal = ((score / totalScoreVal) * 100).toFixed(0) + "%";

    let detailsArr = [];
    for (let t in topicScores) {
        let s = topicScores[t];
        let pct = s.total > 0 ? Math.round((s.earned / s.total) * 100) : 0;
        detailsArr.push(`${t}: ${s.earned}/${s.total} (${pct}%)`);
    }
    let topicDetailsString = detailsArr.join(" | ");

    // 🌟 準備終極防護參數
    const timestampStr = Date.now().toString();
    const timeTakenStr = quizTimeTaken.toString();
    const integritySeed = quizIntegrity.seed;
    const integrityChain = quizIntegrity.chain;
    const integrityPayload = JSON.stringify(quizIntegrity.events);
    
    // ====================================================================
    // 🔐 終極加密防禦：加入 UUID、時間戳、作答時間 與 密碼 進行混合加密
    // ====================================================================
    const rawScoreStr = String(score).trim();
    const rawTotalScoreStr = String(totalScoreVal).trim();
    const saltKey = "DseMath@2026_HK_Secure!";
    
    const rawString = className + "|" + classNumber + "|" + rawScoreStr + "|" + rawTotalScoreStr + "|" + sessionNonce + "|" + timestampStr + "|" + timeTakenStr + "|" + studentPwd + "|" + saltKey;
    let hashVal = 0;
    for (let i = 0; i < rawString.length; i++) {
        hashVal = ((hashVal << 5) - hashVal) + rawString.charCodeAt(i);
        hashVal = hashVal & hashVal; 
    }
    const signature = (hashVal >>> 0).toString(16);
    // ====================================================================

    const formData = new URLSearchParams();
    formData.append('className', className); 
    formData.append('classNumber', classNumber); 
    formData.append('studentName', studentName);
    formData.append('topic', currentTopicName); 
    formData.append('level', `程度 ${displayLevel}`); 
    formData.append('score', score);
    formData.append('totalScore', totalScoreVal); 
    formData.append('percentage', percentageVal);
    formData.append('sig', signature); 
    formData.append('isHomework', isHomeworkMode);
    formData.append('homeworkName', currentHomeworkName);
    formData.append('topicDetails', topicDetailsString);
    // 🛡️ 終極防護欄位
    formData.append('nonce', sessionNonce);
    formData.append('timestamp', timestampStr);
    formData.append('timeTaken', timeTakenStr);
    formData.append('password', studentPwd); // 加入密碼
    formData.append('integritySeed', integritySeed);
    formData.append('integrityChain', integrityChain);
    formData.append('integrityPayload', integrityPayload);
    
    fetch(GOOGLE_SCRIPT_URL, { method: 'POST', body: formData })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                let backendNewTotal = parseInt(data.newTotalScore) || 0;
                let backendPlayCount = parseInt(data.playCountToday) || 1;
                let isCrossed = data.crossedThreshold;
                let officialName = data.officialName || studentName; 
                
                // 🌟 前端防呆匹配機制更新，解決伺服器空值 0 問題
                let student = globalLeaderboard.find(s => {
                    let sClass = String(s.className).toUpperCase().trim();
                    let sNum = String(s.classNum).trim();
                    let isMatch = (sClass === className && sNum === classNumber);
                    if (!isMatch && sClass === className && sNum === "" && classNumber === "0") {
                        isMatch = true;
                    }
                    return isMatch;
                });
                
                if (student) { 
                    student.totalScore = backendNewTotal; 
                    student.playCountToday = backendPlayCount; 
                } 
                else { 
                    globalLeaderboard.push({
                        className: className, 
                        classNum: classNumber, 
                        studentName: officialName, 
                        totalScore: backendNewTotal,
                        playCountToday: backendPlayCount
                    }); 
                }
                renderLeaderboards();

                let pointsNeeded = 100 - (backendNewTotal % 100);
                if (pointsNeeded === 0) pointsNeeded = 100;
                
                let targetProgress = backendNewTotal % 100;
                if (isCrossed) targetProgress = 100; 
                
                const fill = document.getElementById('progressBarFill');
                const textUI = document.getElementById('progressTextUI');
                const hint = document.getElementById('progressHint');
                
                if (fill) fill.style.width = targetProgress + '%';
                if (textUI) textUI.textContent = isCrossed ? '100 / 100' : `${backendNewTotal % 100} / 100`;

                // 🌟 更新：在成功提示訊息中，將「今天的提交次數」顯示在總分旁邊
                if (isCrossed) {
                    if (hint) hint.innerHTML = `<span class="text-amber-600 font-bold">🎉 恭喜達成滿百目標！正在解鎖刮刮卡...</span>`;
                    statusText.innerHTML = `${data.message}<br>🎉 目前總分：${backendNewTotal} 分 (今日已交：${backendPlayCount} 次)。邁向下一抽還差 <span class="text-indigo-600 font-bold">${100 - (backendNewTotal % 100)} 分</span>！`;
                    setTimeout(() => {
                        const progUI = document.getElementById('progressUI'); const scratchUI = document.getElementById('scratchUI'); const rewardZone = document.getElementById('rewardZone');
                        if (progUI && scratchUI && rewardZone) {
                            progUI.classList.add('opacity-0');
                            setTimeout(() => {
                                progUI.classList.add('hidden'); scratchUI.classList.remove('hidden'); void scratchUI.offsetWidth; scratchUI.classList.remove('opacity-0');
                                rewardZone.classList.replace('border-slate-200', 'border-amber-300'); rewardZone.classList.replace('bg-white', 'bg-amber-50');
                                const rewardDisp = document.getElementById('rewardTextDisplay');
                                if (rewardDisp) rewardDisp.textContent = data.reward && data.reward !== "無" ? data.reward : "再接再厲！";
                                renderScratchCard();
                            }, 500);
                        }
                    }, 1500);
                } else {
                    if (hint) hint.innerHTML = `還差 <span class="text-indigo-600 font-bold">${pointsNeeded} 分</span> 即可獲得抽獎機會！傳送成績後更新進度。`;
                    statusText.innerHTML = `${data.message}<br>📊 目前總分：${backendNewTotal} 分 (今日已交：${backendPlayCount} 次)。`;
                }
                
                statusText.className = "text-center text-sm font-bold mt-3 text-green-600 block leading-relaxed"; statusText.classList.remove('hidden');
                if (btn) {
                    btn.textContent = "✅ 已成功傳送！"; 
                    btn.classList.replace('bg-[#44994d]', 'bg-slate-400');
                }
                setTimeout(() => { fetchConfig(true); }, 2000);
            } else {
                if (btn) {
                    btn.disabled = false; btn.textContent = "重新傳送"; btn.classList.remove('opacity-50');
                }
                statusText.textContent = data.message; statusText.className = "text-center text-sm font-bold mt-3 text-red-500 block"; statusText.classList.remove('hidden');
            }
        })
        .catch(err => {
            if (btn) {
                btn.disabled = false; btn.textContent = "重新傳送"; btn.classList.remove('opacity-50');
            }
            statusText.textContent = "❌ 傳送失敗，請檢查網路連線。"; statusText.className = "text-center text-sm font-bold mt-3 text-red-500 block"; statusText.classList.remove('hidden');
        });
}

function renderScratchCard() {
    const canvas = document.getElementById('scratchCanvas');
    if (!canvas) return;

    // 重置可見性
    canvas.style.opacity = '1';
    canvas.style.display = 'block';
    canvas.style.transition = '';

    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // 🌟 漸變金箔覆蓋層
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#fde68a');
    gradient.addColorStop(0.35, '#f59e0b');
    gradient.addColorStop(0.7, '#d97706');
    gradient.addColorStop(1, '#92400e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 金箔光澤紋理
    for (let i = 0; i < 45; i++) {
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.18})`;
        ctx.beginPath();
        ctx.arc(
            Math.random() * canvas.width,
            Math.random() * canvas.height,
            Math.random() * 6 + 1,
            0, Math.PI * 2
        );
        ctx.fill();
    }

    // 中央提示文字
    ctx.font = 'bold 17px sans-serif';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(120, 53, 15, 0.6)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 1;
    ctx.fillText('✨ 用手指刮開驚喜 ✨', canvas.width / 2, canvas.height / 2);
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // 設置刮除模式
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.lineWidth = 38;
    ctx.globalCompositeOperation = 'destination-out';

    let isDrawing = false;
    let revealed = false;
    let strokeCount = 0;

    function getPos(e) {
        const rect = canvas.getBoundingClientRect();
        const evt = e.touches ? e.touches[0] : e;
        return { x: evt.clientX - rect.left, y: evt.clientY - rect.top };
    }

    function checkReveal() {
        if (revealed) return;
        strokeCount++;
        if (strokeCount % 4 !== 0) return;
        try {
            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            let transparent = 0, total = 0;
            for (let i = 3; i < imgData.data.length; i += 40) {
                total++;
                if (imgData.data[i] < 128) transparent++;
            }
            if (total > 0 && (transparent / total) > 0.4) {
                revealed = true;
                triggerReveal();
            }
        } catch (err) {}
    }

    function triggerReveal() {
        if (navigator.vibrate) {
            try { navigator.vibrate([80, 40, 80, 40, 200]); } catch (e) {}
        }
        canvas.style.transition = 'opacity 0.7s ease-out';
        canvas.style.opacity = '0';
        spawnConfetti();
        const rewardZone = document.getElementById('rewardZone');
        if (rewardZone) {
            rewardZone.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
            rewardZone.style.transform = 'scale(1.04)';
            setTimeout(() => { rewardZone.style.transform = 'scale(1)'; }, 450);
        }
        setTimeout(() => { canvas.style.display = 'none'; }, 800);
    }

    canvas.onmousedown = (e) => {
        isDrawing = true;
        const p = getPos(e);
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
    };
    canvas.onmousemove = (e) => {
        if (!isDrawing) return;
        const p = getPos(e);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        checkReveal();
    };
    window.addEventListener('mouseup', () => {
        if (isDrawing) { isDrawing = false; checkReveal(); }
    });
    canvas.ontouchstart = (e) => {
        e.preventDefault();
        isDrawing = true;
        const p = getPos(e);
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
    };
    canvas.ontouchmove = (e) => {
        e.preventDefault();
        if (!isDrawing) return;
        const p = getPos(e);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        checkReveal();
    };
    canvas.ontouchend = () => {
        if (isDrawing) { isDrawing = false; checkReveal(); }
    };
}

// 🎉 刮刮卡完全揭開時的彩屑爆發效果
function spawnConfetti() {
    const container = document.getElementById('rewardZone');
    if (!container) return;
    const colors = ['#fbbf24', '#f59e0b', '#ef4444', '#3b82f6', '#10b981', '#a855f7', '#ec4899', '#facc15'];
    const scratchUI = document.getElementById('scratchUI');
    const containerRect = container.getBoundingClientRect();
    let originX = container.offsetWidth / 2;
    let originY = container.offsetHeight / 2;
    if (scratchUI) {
        const sRect = scratchUI.getBoundingClientRect();
        originX = sRect.left - containerRect.left + sRect.width / 2;
        originY = sRect.top - containerRect.top + sRect.height / 2;
    }
    for (let i = 0; i < 45; i++) {
        const piece = document.createElement('div');
        const w = 6 + Math.random() * 6;
        piece.style.cssText = `
            position: absolute;
            width: ${w}px;
            height: ${w * 0.4}px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            top: ${originY}px;
            left: ${originX}px;
            border-radius: 1px;
            pointer-events: none;
            z-index: 50;
            transform: translate(-50%, -50%);
        `;
        container.appendChild(piece);
        const angle = Math.random() * Math.PI * 2;
        const distance = 70 + Math.random() * 200;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance + 60;
        const rotation = (Math.random() - 0.5) * 1080;
        piece.animate([
            { transform: 'translate(-50%, -50%) rotate(0deg)', opacity: 1 },
            { transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) rotate(${rotation}deg)`, opacity: 0 }
        ], {
            duration: 1400 + Math.random() * 700,
            easing: 'cubic-bezier(0.15, 0.55, 0.35, 1)',
            fill: 'forwards'
        });
        setTimeout(() => piece.remove(), 2300);
    }
}

function renderMath() {
    if (typeof renderMathInElement !== 'undefined') {
        const wrap = document.getElementById('main-wrapper');
        if (wrap) renderMathInElement(wrap, { delimiters: [ {left: '$$', right: '$$', display: true}, {left: '\\[', right: '\\]', display: true}, {left: '\\(', right: '\\)', display: false} ], throwOnError: false });
    }
}

window.setQuestionNum = setQuestionNum; 
window.showTopicScreen = showTopicScreen; 
window.backToLevelSelection = backToLevelSelection; 
window.backToLevelSelectionFromQuiz = backToLevelSelectionFromQuiz; 
window.closeConfirmModal = closeConfirmModal; 
window.confirmBackToLevelSelection = confirmBackToLevelSelection; 
window.selectTopic = selectTopic; 
window.startGame = startGame; 
window.startGlobalMixed = startGlobalMixed; 
window.startHomework = startHomework;
window.restartLevel = restartLevel;
window.loginApp = loginApp;
window.logoutApp = logoutApp;

// ==========================================
// 🌟 初始化邏輯，一啟動就檢查登入狀態
// ==========================================
document.addEventListener('DOMContentLoaded', () => { 
    console.log("🚀 App.js V71 初始化執行... 強制登入鎖定系統啟動！");
    
    const globalBtns = document.querySelectorAll("button[onclick*='startGlobalMixed']");
    globalBtns.forEach(btn => {
        if (btn.innerHTML.includes('答對得')) return; 
        let levelMatch = btn.getAttribute('onclick').match(/startGlobalMixed\((\d)\)/);
        if (levelMatch) {
            let lvl = parseInt(levelMatch[1]);
            let pts = 10;
            if (lvl === 1) pts = 5;
            else if (lvl === 2) pts = 8;
            else if (lvl === 3) pts = 12;
            else if (lvl === 4) pts = 15;
            
            let colorClass = lvl === 1 ? 'text-green-600 border-green-200' : (lvl === 2 ? 'text-blue-600 border-blue-200' : (lvl === 3 ? 'text-purple-600 border-purple-200' : 'text-orange-600 border-orange-200'));
            
            btn.innerHTML += `<div class="mt-2 text-xs font-bold bg-white px-2 py-0.5 rounded-md border shadow-sm ${colorClass}">🎯 答對得 ${pts} 分</div>`;
        }
    });

    // 🌟 一載入立刻觸發登入驗證，未登入者會被攔截並動態生成登入畫面
    showTopicScreen(); 
    fetchConfig(); 
    setInterval(() => fetchConfig(true), 30000);
    
    // 將 localStorage 暫存資料預填到登入框 (僅班別與學號，密碼為求安全不預填)
    setTimeout(() => {
        const savedClass = getStoredData('dse_className');
        const savedNum = getStoredData('dse_classNumber');

        const loginClassEl = document.getElementById('loginClass'); if (loginClassEl && savedClass) loginClassEl.value = savedClass;
        const loginNumEl = document.getElementById('loginNum'); if (loginNumEl && savedNum) loginNumEl.value = savedNum;
    }, 100);

    setupCanvasEvents();
});
