// js/app.js

console.log("App.js V63.2 成功載入！已啟動雙軌制功課派發系統與進階偵錯雷達！");

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

// 🌟 V62 新增：功課系統與追蹤器變數
let isHomeworkMode = false;
let currentHomeworkName = "";
let dynamicHomeworkConfig = [];
let topicScores = {}; // 追蹤各課題的分數明細

let currentRecognizedLaTeX = "";

function getStoredData(key) { try { return localStorage.getItem(key) || ''; } catch (e) { return ''; } }
function setStoredData(key, value) { try { localStorage.setItem(key, value); } catch (e) {} }

async function fetchConfig(isSilent = false) {
    if (isFetchingLock) return; 
    try {
        if (GOOGLE_SCRIPT_URL && !GOOGLE_SCRIPT_URL.includes("請在此貼上")) {
            const cacheBusterUrl = GOOGLE_SCRIPT_URL + (GOOGLE_SCRIPT_URL.includes('?') ? '&' : '?') + 't=' + new Date().getTime();
            const response = await fetch(cacheBusterUrl);
            const data = await response.json();
            
            console.log("📥 從伺服器收到的 JSON 資料：", data); // 🌟 協助排錯用
            
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
            
            // 🌟 接收並渲染功課清單
            if (data.homeworkConfig && data.homeworkConfig.length > 0) {
                console.log("✅ 成功獲取功課設定：", data.homeworkConfig);
                dynamicHomeworkConfig = data.homeworkConfig;
                renderHomeworkButtons();
            } else {
                console.warn("⚠️ 伺服器回傳的功課清單為空！請檢查：\n1. Google Apps Script 是否已部署「新版本」。\n2. Google Sheet 是否有名為「功課設定表」的分頁，且裡面有資料。");
                dynamicHomeworkConfig = [];
                renderHomeworkButtons();
            }
        }
    } catch (e) {
        if (!isSilent) console.warn("⚠️ 讀取設定失敗", e);
        if (currentLeaderboardHash === "") {
            globalLeaderboard = [];
            currentLeaderboardHash = "error";
            renderLeaderboards();
        }
    }
}

// 🌟 新增：將功課按鈕渲染到首頁
function renderHomeworkButtons() {
    const hwSection = document.getElementById('homeworkSection');
    const hwGrid = document.getElementById('homeworkGrid');
    
    if (!dynamicHomeworkConfig || dynamicHomeworkConfig.length === 0) {
        console.log("📭 功課清單為空，隱藏功課區塊。");
        if (hwSection) hwSection.classList.add('hidden');
        return;
    }
    
    // 提取不重複的功課名稱
    let uniqueHwNames = [...new Set(dynamicHomeworkConfig.map(c => c.hwName))];
    
    if (hwSection) hwSection.classList.remove('hidden');
    if (hwGrid) {
        hwGrid.innerHTML = '';
        uniqueHwNames.forEach(hwName => {
            // 計算這份功課的總題數
            let totalQs = dynamicHomeworkConfig.filter(c => c.hwName === hwName).reduce((sum, c) => sum + (c.qCount || 1), 0);
            
            hwGrid.innerHTML += `
            <button onclick="startHomework('${hwName}')" class="py-5 px-3 bg-white border-2 border-amber-300 rounded-xl hover:shadow-md hover:bg-amber-100 transition-all flex flex-col items-center justify-center text-center group shadow-sm">
                <span class="text-3xl mb-2 group-hover:scale-110 transition-transform">📚</span>
                <span class="text-amber-800 font-bold text-lg">${hwName}</span>
                <span class="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-1 rounded-md mt-2 border border-amber-200">共 ${totalQs} 題</span>
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
    let userMatched = false;

    globalLeaderboard.forEach((student, index) => {
        const sClass = String(student.className).toUpperCase().trim();
        const sNum = String(student.classNum).trim();
        if (sClass === currentUserClass && sNum === currentUserNum && !userMatched) {
            userRank = index + 1;
            userScore = student.totalScore;
            userMatched = true;
        }
    });

    let html = '<div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2">';
    globalLeaderboard.slice(0, 20).forEach((student, index) => {
        let rankIcon = index === 0 ? '🥇' : (index === 1 ? '🥈' : (index === 2 ? '🥉' : `<span class="inline-block w-6 text-center text-slate-400 font-bold text-sm">${index + 1}.</span>`));
        
        html += `<div class="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm transition-all hover:shadow-md"><div class="flex items-center gap-3">${rankIcon}<span class="font-bold text-slate-700 text-base">${student.className} (${student.classNum}) ${student.studentName}</span></div><div class="text-indigo-600 font-bold text-base">${student.totalScore} 分</div></div>`;
    });
    html += '</div>';

    if (homeContainer) homeContainer.innerHTML = html;
    
    let endHtml = '<div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2">';
    globalLeaderboard.slice(0, 20).forEach((student, index) => {
        let rankIcon = index === 0 ? '🥇' : (index === 1 ? '🥈' : (index === 2 ? '🥉' : `<span class="inline-block w-6 text-center text-slate-400 font-bold text-sm">${index + 1}.</span>`));
        
        endHtml += `<div class="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100 shadow-sm transition-all hover:shadow-md"><div class="flex items-center gap-2">${rankIcon}<span class="font-bold text-slate-700 text-sm sm:text-base">${student.className} (${student.classNum}) ${student.studentName}</span></div><div class="text-indigo-600 font-bold text-sm sm:text-base">${student.totalScore} 分</div></div>`;
    });
    endHtml += '</div>';
    if (endContainer) endContainer.innerHTML = endHtml;

    let myRankHtml = '';
    if (currentUserClass && currentUserNum) {
        if (userRank !== -1) {
            myRankHtml = `<div class="bg-[#FFF3C4] border border-[#FDE68A] p-4 rounded-xl flex justify-between items-center shadow-sm mb-6"><span class="font-bold text-amber-800 text-base flex items-center gap-2"><span class="text-xl">👉</span> 你的目前排名：第 ${userRank} 名</span><span class="text-amber-800 font-bold text-lg">${userScore} 分</span></div>`;
        } else {
            myRankHtml = `<div class="bg-slate-100 border border-slate-300 p-3 rounded-lg flex justify-between items-center shadow-sm mb-6"><span class="font-bold text-slate-600">👉 你的目前排名：未上榜</span><span class="text-slate-500 font-bold text-sm">繼續刷題累積積分吧！</span></div>`;
        }
    }
    if (myRankHome) myRankHome.innerHTML = myRankHtml;
    if (myRankEnd) myRankEnd.innerHTML = myRankHtml;
}

// 🌟 核心修復：統一同步全域變數 window.totalQuestionsConfig，避免因非同步載入報錯
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

function showTopicScreen() {
    document.getElementById('topicScreen')?.classList.remove('hidden');
    document.getElementById('startScreen')?.classList.add('hidden');
    document.getElementById('appContainer')?.classList.add('hidden');
    document.getElementById('endScreen')?.classList.add('hidden');
}

function backToLevelSelection() {
    document.getElementById('appContainer')?.classList.add('hidden');
    document.getElementById('endScreen')?.classList.add('hidden');
    if (isHomeworkMode) showTopicScreen(); // 功課做完直接回首頁
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

// 🌟 新增：啟動功課專屬生成器
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
        assignHandwriting(questionBank);

        // 初始化「各課題明細追蹤器」
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
        
        // 獲取最新設定的題數
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

        // 初始化「各課題明細追蹤器」
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
        
        // 獲取最新設定的題數
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

        // 初始化「各課題明細追蹤器」
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
    
    showFeedback('incorrect', `<div class="mb-4 text-orange-600 font-bold text-lg sm:text-xl bg-orange-50 p-3 rounded-lg border border-orange-200 shadow-sm">⏭️ 你已選擇跳過本題 (獲得 0 分)</div>`, true); 
    
    disableAllButtons();
    
    const skipBtns = document.querySelectorAll('.skip-action-btn');
    skipBtns.forEach(btn => {
        btn.disabled = true;
        btn.classList.add('opacity-50', 'cursor-not-allowed');
    });

    if (q.isHandwriting) {
        ['clear-btn', 'recognize-btn', 'kb-recognize-btn', 'kb-clear-btn'].forEach(id => {
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
            
            ['clear-btn', 'recognize-btn', 'kb-recognize-btn', 'kb-clear-btn'].forEach(id => {
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
    
    const skipBtns = document.querySelectorAll('.skip-action-btn');
    skipBtns.forEach(btn => {
        btn.disabled = true;
        btn.classList.add('opacity-50', 'cursor-not-allowed');
    });

    let q = questionBank[currentQuestionIndex];

    if (selectedOption.isCorrect) {
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

function startDrawing(e) { e.preventDefault(); isDrawing = true; const pos = getPos(e); lastX = pos.x; lastY = pos.y; }
function draw(e) { if (!isDrawing) return; e.preventDefault(); const pos = getPos(e); const ctx = document.getElementById('draw-canvas').getContext('2d'); ctx.beginPath(); ctx.moveTo(lastX, lastY); ctx.lineTo(pos.x, pos.y); ctx.stroke(); lastX = pos.x; lastY = pos.y; }
function stopDrawing() { isDrawing = false; }

function setupCanvasEvents() {
    const canvas = document.getElementById('draw-canvas');
    if (!canvas) return;
    canvas.addEventListener('mousedown', startDrawing); canvas.addEventListener('mousemove', draw); canvas.addEventListener('mouseup', stopDrawing); canvas.addEventListener('mouseout', stopDrawing);
    canvas.addEventListener('touchstart', startDrawing, { passive: false }); canvas.addEventListener('touchmove', draw, { passive: false }); canvas.addEventListener('touchend', stopDrawing); canvas.addEventListener('touchcancel', stopDrawing);
    
    document.getElementById('clear-btn')?.addEventListener('click', () => { 
        initCanvas(); 
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
    const btns = ['recognize-btn', 'clear-btn', 'kb-recognize-btn', 'kb-clear-btn'];
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
        
        const formData = new URLSearchParams(); 
        formData.append('action', 'ai_grade');
        formData.append('studentLatex', currentRecognizedLaTeX);
        formData.append('standardAns', standardAns);

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
            showFeedback('incorrect', finalHint, false);
            document.getElementById('draw-container')?.classList.add('border-red-400');
            document.getElementById('kb-container')?.classList.add('border-red-400');
            
            ['clear-btn', 'recognize-btn', 'kb-recognize-btn', 'kb-clear-btn'].forEach(id => {
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
    
    ['clear-btn', 'recognize-btn', 'kb-recognize-btn', 'kb-clear-btn'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.disabled = true;
    });
};

// ==========================================
// 結算畫面與成績儲存
// ==========================================
function showEndScreen() {
    document.getElementById('appContainer')?.classList.add('hidden');
    document.getElementById('endScreen')?.classList.remove('hidden');
    
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

    // 🌟 渲染各課題表現明細表
    const trackerUI = document.getElementById('topicDetailsTracker');
    const listUI = document.getElementById('topicDetailsList');
    if (trackerUI && listUI) {
        // 如果不是綜合挑戰也不是功課模式，只有一個單元時，隱藏明細以保持簡潔
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
}

function updateScoreDisplay() { 
    const sd = document.getElementById('scoreDisplay');
    if (sd) sd.textContent = score; 
}

function submitToGoogleSheet() {
    const btn = document.getElementById('submitRecordBtn');
    const statusText = document.getElementById('submitStatus');
    const classNameEl = document.getElementById('className');
    const classNumberEl = document.getElementById('classNumber');
    const studentNameEl = document.getElementById('studentName');
    
    if (!classNameEl || !classNumberEl || !studentNameEl || !statusText || !btn) return;

    const className = classNameEl.value.trim().toUpperCase();
    const classNumber = classNumberEl.value.trim();
    const studentName = studentNameEl.value.trim();

    if (!className || !classNumber || !studentName) {
        statusText.textContent = "⚠️ 請填寫所有資料"; statusText.className = "text-center text-sm font-bold mt-3 text-red-500 block"; statusText.classList.remove('hidden'); return;
    }

    setStoredData('dse_className', className); setStoredData('dse_classNumber', classNumber); setStoredData('dse_studentName', studentName);

    btn.disabled = true; btn.textContent = "傳送中..."; btn.classList.add('opacity-50'); statusText.classList.add('hidden');
    
    let displayLevel = currentLevelPref === 'mixed' ? '綜合挑戰' : currentLevelPref.toString().toUpperCase();
    
    let totalScoreVal = questionBank.reduce((sum, q) => sum + (q.scoreVal || 10), 0);
    let percentageVal = ((score / totalScoreVal) * 100).toFixed(0) + "%";

    // 🌟 打包課題明細資料準備傳送給後端
    let detailsArr = [];
    for (let t in topicScores) {
        let s = topicScores[t];
        let pct = s.total > 0 ? Math.round((s.earned / s.total) * 100) : 0;
        detailsArr.push(`${t}: ${s.earned}/${s.total} (${pct}%)`);
    }
    let topicDetailsString = detailsArr.join(" | ");

    // ====================================================================
    // 🔐 V61 終極加密防禦：強制將分數轉為字串進行加密，消滅型別錯誤
    // ====================================================================
    const rawScoreStr = String(score).trim();
    const rawTotalScoreStr = String(totalScoreVal).trim();
    const saltKey = "DseMath@2026_HK_Secure!";
    
    const rawString = className + "|" + classNumber + "|" + rawScoreStr + "|" + rawTotalScoreStr + "|" + saltKey;
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
    // 🌟 V62 功課追蹤欄位
    formData.append('isHomework', isHomeworkMode);
    formData.append('homeworkName', currentHomeworkName);
    formData.append('topicDetails', topicDetailsString);

    fetch(GOOGLE_SCRIPT_URL, { method: 'POST', body: formData })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                let backendNewTotal = parseInt(data.newTotalScore) || 0;
                let backendPlayCount = parseInt(data.playCountToday) || 1;
                let isCrossed = data.crossedThreshold;
                let officialName = data.officialName || studentName; 
                
                let student = globalLeaderboard.find(s => String(s.className).toUpperCase().trim() === className && String(s.classNum).trim() === classNumber);
                if (student) { student.totalScore = backendNewTotal; } 
                else { globalLeaderboard.push({className: className, classNum: classNumber, studentName: officialName, totalScore: backendNewTotal}); }
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

                if (isCrossed) {
                    if (hint) hint.innerHTML = `<span class="text-amber-600 font-bold">🎉 恭喜達成滿百目標！正在解鎖刮刮卡...</span>`;
                    statusText.innerHTML = `${data.message}<br>🎉 目前總分：${backendNewTotal} 分。邁向下一抽還差 <span class="text-indigo-600 font-bold">${100 - (backendNewTotal % 100)} 分</span>！`;
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
                    statusText.innerHTML = `${data.message}<br>📊 目前總分：${backendNewTotal} 分。`;
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
                // ⚠️ 如果是超過次數等伺服器攔截，會在這裡顯示紅色警告
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
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight;
    ctx.fillStyle = '#cbd5e1'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = 'bold 16px sans-serif'; ctx.fillStyle = '#64748b'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('✨ 刮開看獎勵 ✨', canvas.width / 2, canvas.height / 2);
    ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.lineWidth = 25; ctx.globalCompositeOperation = 'destination-out';
    let isDrawing = false;
    function getPos(e) { const rect = canvas.getBoundingClientRect(); const evt = e.touches ? e.touches[0] : e; return { x: evt.clientX - rect.left, y: evt.clientY - rect.top }; }
    canvas.onmousedown = (e) => { isDrawing = true; const p = getPos(e); ctx.beginPath(); ctx.moveTo(p.x, p.y); };
    canvas.onmousemove = (e) => { if (!isDrawing) return; const p = getPos(e); ctx.lineTo(p.x, p.y); ctx.stroke(); };
    window.onmouseup = () => isDrawing = false;
    canvas.ontouchstart = (e) => { e.preventDefault(); isDrawing = true; const p = getPos(e); ctx.beginPath(); ctx.moveTo(p.x, p.y); };
    canvas.ontouchmove = (e) => { e.preventDefault(); if (!isDrawing) return; const p = getPos(e); ctx.lineTo(p.x, p.y); ctx.stroke(); };
    canvas.ontouchend = () => isDrawing = false;
}

function renderMath() {
    if (typeof renderMathInElement !== 'undefined') {
        const wrap = document.getElementById('main-wrapper');
        if (wrap) renderMathInElement(wrap, { delimiters: [ {left: '$$', right: '$$', display: true}, {left: '\\[', right: '\\]', display: true}, {left: '\\(', right: '\\)', display: false} ], throwOnError: false });
    }
}

// 🌟 核心修復：將所有外部全域函數掛載到 window，確保 HTML 能順利調用
window.setQuestionNum = setQuestionNum; 
window.showTopicScreen = showTopicScreen; 
window.backToLevelSelection = backToLevelSelection; 
window.backToLevelSelectionFromQuiz = backToLevelSelectionFromQuiz; 
window.closeConfirmModal = closeConfirmModal; 
window.confirmBackToLevelSelection = confirmBackToLevelSelection; 
window.selectTopic = selectTopic; 
window.startGame = startGame; 
window.startGlobalMixed = startGlobalMixed; 
window.submitToGoogleSheet = submitToGoogleSheet;
window.startHomework = startHomework;
window.restartLevel = restartLevel;

document.addEventListener('DOMContentLoaded', () => { 
    console.log("🚀 App.js V63.2 初始化執行... DOM 載入完成，已同步 HTML 按鈕修復方案並增強偵錯日誌！");
    showTopicScreen(); fetchConfig(); setInterval(() => fetchConfig(true), 5000); 
    const savedClass = getStoredData('dse_className'); const savedNum = getStoredData('dse_classNumber'); const savedName = getStoredData('dse_studentName');
    const classNameEl = document.getElementById('className'); if (classNameEl && savedClass) classNameEl.value = savedClass; 
    const classNumEl = document.getElementById('classNumber'); if (classNumEl && savedNum) classNumEl.value = savedNum; 
    const studentNameEl = document.getElementById('studentName'); if (studentNameEl && savedName) studentNameEl.value = savedName;
    setupCanvasEvents();
});
