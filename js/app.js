// js/app.js

// ==========================================
// 🚨 老師設定區：請填寫你最新部署的 Google Web App URL
// ==========================================
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw_h7rVev1VtAuPK4BFGR4i3lLMC2dGH_X6lkeB5IHZNHWPSBcQtFGNg0U9ZEteZMs/exec"; 

// 🛑 終極大絕招版：前端不需要設定任何 API 金鑰，由後台全權代理！
const ENABLE_AI_HANDWRITING = false; 

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

// 🌟 兩階段辨識所需的全域變數
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

    let html = '';
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

    globalLeaderboard.slice(0, 20).forEach((student, index) => {
        let rankIcon = index === 0 ? '🥇' : (index === 1 ? '🥈' : (index === 2 ? '🥉' : `<span class="inline-block w-6 text-center text-slate-400 font-bold text-sm">${index + 1}.</span>`));
        const isHighestMe = (String(student.className).toUpperCase().trim() === currentUserClass && String(student.classNum).trim() === currentUserNum) && (index + 1 === userRank);

        const bgClass = isHighestMe ? 'bg-amber-100 border-amber-400 ring-2 ring-amber-300' : 'bg-white border-slate-100';
        const textClass = isHighestMe ? 'text-amber-800' : 'text-slate-700';
        const scoreClass = isHighestMe ? 'text-amber-700' : 'text-indigo-600';
        const highlightBadge = isHighestMe ? `<span class="ml-2 text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full">你</span>` : '';

        html += `<div class="flex justify-between items-center ${bgClass} p-3 rounded-lg border shadow-sm transition-all"><div class="flex items-center gap-2">${rankIcon}<span class="font-bold ${textClass}">${student.className} (${student.classNum}) ${student.studentName}${highlightBadge}</span></div><div class="${scoreClass} font-bold">${student.totalScore} 分</div></div>`;
    });

    if (homeContainer) homeContainer.innerHTML = html;
    if (endContainer) endContainer.innerHTML = html;

    let myRankHtml = '';
    if (currentUserClass && currentUserNum) {
        if (userRank !== -1) {
            myRankHtml = `<div class="bg-amber-100 border border-amber-400 p-3 rounded-lg flex justify-between items-center shadow-sm mb-4"><span class="font-bold text-amber-800">👉 你的目前排名：第 ${userRank} 名</span><span class="text-amber-700 font-bold">${userScore} 分</span></div>`;
        } else {
            myRankHtml = `<div class="bg-slate-100 border border-slate-300 p-3 rounded-lg flex justify-between items-center shadow-sm mb-4"><span class="font-bold text-slate-600">👉 你的目前排名：未上榜</span><span class="text-slate-500 font-bold text-sm">繼續刷題累積積分吧！</span></div>`;
        }
    }
    if (myRankHome) myRankHome.innerHTML = myRankHtml;
    if (myRankEnd) myRankEnd.innerHTML = myRankHtml;
}

function setQuestionNum(num) {
    totalQuestionsConfig = num;
    document.querySelectorAll('.num-btn').forEach(btn => {
        btn.classList.remove('bg-indigo-600', 'text-white', 'shadow-md');
        btn.classList.add('bg-transparent', 'text-slate-600');
    });
    const activeBtn = document.getElementById('btn-num-' + num);
    if (activeBtn) { activeBtn.classList.remove('bg-transparent', 'text-slate-600'); activeBtn.classList.add('bg-indigo-600', 'text-white', 'shadow-md'); }
    if (document.getElementById('displayQNum')) document.getElementById('displayQNum').textContent = num;
}

function showTopicScreen() {
    document.getElementById('topicScreen').classList.remove('hidden');
    document.getElementById('startScreen').classList.add('hidden');
    document.getElementById('appContainer').classList.add('hidden');
    document.getElementById('endScreen').classList.add('hidden');
}

function backToLevelSelection() {
    document.getElementById('appContainer').classList.add('hidden');
    document.getElementById('endScreen').classList.add('hidden');
    if (currentTopic === 'global_mixed') showTopicScreen(); else selectTopic(currentTopic);
}

function backToLevelSelectionFromQuiz() { document.getElementById('confirmModal').classList.remove('hidden'); }
function closeConfirmModal() { document.getElementById('confirmModal').classList.add('hidden'); }
function confirmBackToLevelSelection() { closeConfirmModal(); backToLevelSelection(); }

function selectTopic(topic) {
    currentTopic = topic;
    document.getElementById('topicScreen').classList.add('hidden');
    document.getElementById('startScreen').classList.remove('hidden');
    
    ['btnL1', 'btnL2', 'btnL3', 'btnL4', 'btnL2A', 'btnL2B', 'btnL3A', 'btnL3B'].forEach(id => {
        if (document.getElementById(id)) document.getElementById(id).classList.add('hidden');
    });

    let config = fallbackConfigs[topic];
    if (!config) return;
    currentTopicName = config.name;
    document.getElementById('levelTitle').textContent = config.name + ' - 請選擇難度';

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
        
        const btn = document.getElementById('btn' + lvl.id.toUpperCase());
        if (btn) {
            btn.classList.remove('hidden');
            let colorClass = lvl.id.includes('1') ? 'bg-green-100 text-green-700' : (lvl.id.includes('2') ? 'bg-blue-100 text-blue-700' : (lvl.id.includes('3') ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'));
            btn.querySelector('.font-bold').innerHTML = title + `<div class="mt-1"><span class="inline-block px-2 py-0.5 ${colorClass} text-xs rounded-md font-bold">${badge}</span></div>`;
            btn.lastElementChild.innerHTML = desc;
        }
    });
}

// 🌟 手寫題比例分配演算法
function assignHandwriting(bank) {
    if (!ENABLE_AI_HANDWRITING) return; 

    let hwCount = 0;
    if (bank.length === 3) hwCount = 1;
    else if (bank.length === 5) hwCount = 2;
    else if (bank.length === 10) hwCount = 5;
    else if (bank.length > 0) hwCount = Math.floor(bank.length / 2);

    let indices = Array.from({length: bank.length}, (_, i) => i);
    indices = shuffleArray(indices).slice(0, hwCount);
    
    for (let i of indices) {
        if(bank[i]) {
            bank[i].isHandwriting = true;
        }
    }
}

function startGlobalMixed(level) {
    try {
        currentTopic = 'global_mixed';
        currentTopicName = '跨課題綜合挑戰';
        currentLevelPref = level;
        document.getElementById('questionInstruction').classList.add('hidden');

        let topicsList = ['indices', 'factorization', 'rounding', 'identities', 'fractions', 'binary', 'expansion', 'alg_frac_mul_div', 'triangle_area'];
        let numQ = Math.max(totalQuestionsConfig, topicsList.length);
        let selectedTopics = [...topicsList];
        while (selectedTopics.length < numQ) selectedTopics.push(topicsList[Math.floor(Math.random() * topicsList.length)]);
        selectedTopics = shuffleArray(selectedTopics);

        questionBank = [];
        selectedTopics.forEach((t, idx) => {
            let qArr = [];
            let lvl = String(level);
            let supportedIds = fallbackConfigs[t].levels.map(l => l.id);
            let maxSupported = supportedIds.some(id => id.includes('4')) ? 4 : (supportedIds.some(id => id.includes('3')) ? 3 : 2);
            if (parseInt(lvl) > maxSupported) lvl = String(maxSupported);
            
            if (t === 'indices') qArr = generateIndicesQuestions(1, lvl);
            else if (t === 'factorization') qArr = generateFactorizationQuestions(1, lvl);
            else if (t === 'rounding') qArr = generateRoundingQuestions(1, lvl);
            else if (t === 'identities') qArr = generateIdentitiesQuestions(1, lvl);
            else if (t === 'fractions') qArr = generateFractionsQuestions(1, lvl);
            else if (t === 'binary') qArr = generateBinaryQuestions(1, lvl);
            else if (t === 'expansion') qArr = generateExpansionQuestions(1, lvl);
            else if (t === 'alg_frac_mul_div') qArr = generateAlgFracMulDivQuestions(1, lvl);
            else if (t === 'triangle_area') qArr = generateTriangleAreaQuestions(1, lvl);

            if (qArr && qArr.length > 0) { qArr[0].id = idx + 1; questionBank.push(qArr[0]); }
        });

        assignHandwriting(questionBank);
        startQuizSession();
    } catch (error) { alert("🚨 系統錯誤！無法讀取跨課題題庫。\n原因：" + error.message); }
}

function startGame(levelPref) {
    try {
        if (currentTopic === 'global_mixed') return startGlobalMixed(levelPref);

        currentLevelPref = levelPref;
        document.getElementById('questionInstruction').classList.add('hidden');
        
        if (currentTopic === 'indices') questionBank = generateIndicesQuestions(totalQuestionsConfig, currentLevelPref); 
        else if (currentTopic === 'factorization') questionBank = generateFactorizationQuestions(totalQuestionsConfig, currentLevelPref); 
        else if (currentTopic === 'rounding') questionBank = generateRoundingQuestions(totalQuestionsConfig, currentLevelPref);
        else if (currentTopic === 'identities') questionBank = generateIdentitiesQuestions(totalQuestionsConfig, currentLevelPref);
        else if (currentTopic === 'fractions') questionBank = generateFractionsQuestions(totalQuestionsConfig, currentLevelPref);
        else if (currentTopic === 'binary') questionBank = generateBinaryQuestions(totalQuestionsConfig, currentLevelPref);
        else if (currentTopic === 'expansion') questionBank = generateExpansionQuestions(totalQuestionsConfig, currentLevelPref);
        else if (currentTopic === 'alg_frac_mul_div') questionBank = generateAlgFracMulDivQuestions(totalQuestionsConfig, currentLevelPref);
        else if (currentTopic === 'triangle_area') questionBank = generateTriangleAreaQuestions(totalQuestionsConfig, currentLevelPref);
        
        assignHandwriting(questionBank);
        startQuizSession();
    } catch (error) { alert("🚨 系統錯誤！無法讀取題庫。\n原因：" + error.message); }
}

function startQuizSession() {
    currentQuestionIndex = 0; score = 0; updateScoreDisplay();
    document.getElementById('topicScreen').classList.add('hidden');
    document.getElementById('startScreen').classList.add('hidden');
    document.getElementById('endScreen').classList.add('hidden'); 
    document.getElementById('appContainer').classList.remove('hidden');
    
    const btn = document.getElementById('submitRecordBtn');
    btn.disabled = false; btn.textContent = "傳送成績";
    btn.classList.remove('bg-slate-400'); btn.classList.add('bg-green-600');
    document.getElementById('submitStatus').classList.add('hidden');

    loadQuestion();
}

function loadQuestion() {
    attemptsCount = 0; 
    currentRecognizedLaTeX = ""; // 重置 AI 辨識字串
    
    const q = questionBank[currentQuestionIndex];
    document.getElementById('topicBadge').textContent = q.topic;
    document.getElementById('levelBadge').innerHTML = currentTopic === 'global_mixed' ? `綜合挑戰 (難度: ${currentLevelPref})` : `難度: ${q.level}`;
    document.getElementById('progressText').textContent = `完成 ${currentQuestionIndex}/${questionBank.length}`;
    hideFeedback();
    
    // 隱藏可能殘留的確認介面
    if (document.getElementById('hw-confirm-ui')) {
        document.getElementById('hw-confirm-ui').classList.add('hidden');
    }
    
    // UI 標記提示是否為手寫題
    let typeLabel = q.isHandwriting ? `<span class="inline-block bg-amber-100 text-amber-700 px-3 py-1 rounded-md text-sm font-bold align-middle mt-2 sm:mt-0 shadow-sm border border-amber-200">✍️ AI 手寫題</span>` : "";
    document.getElementById('questionText').innerHTML = q.question + `<div class="mt-2 text-center">${typeLabel}</div>`;

    const optionsGrid = document.getElementById('optionsGrid');
    const hwArea = document.getElementById('handwritingArea');
    
    // 🌟 智能切換：手寫區 vs 選擇題區
    if (q.isHandwriting) {
        optionsGrid.classList.add('hidden');
        if (hwArea) {
            hwArea.classList.remove('hidden');
            hwArea.classList.remove('border-4', 'border-green-500', 'border-red-400');
            document.getElementById('clear-btn').disabled = false;
            document.getElementById('recognize-btn').disabled = false;
            
            // 延遲初始化畫布，確保 CSS 已經顯示正確的尺寸
            setTimeout(() => {
                resizeCanvas();
                initCanvas();
            }, 50);
        }
    } else {
        optionsGrid.classList.remove('hidden');
        if (hwArea) hwArea.classList.add('hidden');
        
        optionsGrid.innerHTML = ''; 
        q.options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'option-btn relative p-3 sm:p-4 bg-white border-2 border-slate-200 rounded-xl text-base sm:text-lg text-slate-700 font-medium hover:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-100 flex items-center gap-3 text-left w-full overflow-hidden';
            btn.onclick = () => handleAnswer(opt, btn);
            btn.innerHTML = `<span class="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-sm shrink-0">${opt.id}</span><span class="overflow-x-auto math-scroll max-w-full flex-1 py-1">${opt.text}</span>`;
            optionsGrid.appendChild(btn);
        });
    }
    renderMath();
}

// 選擇題答題邏輯
function handleAnswer(selectedOption, buttonElement) {
    attemptsCount++;
    if (selectedOption.isCorrect) {
        buttonElement.classList.add('border-green-500', 'bg-green-50');
        buttonElement.querySelector('span').classList.replace('bg-slate-100', 'bg-green-500');
        buttonElement.querySelector('span').classList.replace('text-slate-500', 'text-white');
        if (attemptsCount === 1) { score += 10; updateScoreDisplay(); }
        showFeedback('correct', selectedOption.hint, true);
        disableAllButtons();
    } else {
        buttonElement.classList.add('border-red-300', 'bg-red-50');
        buttonElement.disabled = true;
        showFeedback('incorrect', selectedOption.hint, false);
    }
}

function showFeedback(type, message, showNextBtn) {
    const fbArea = document.getElementById('feedbackArea');
    const fbBox = document.getElementById('feedbackBox');
    fbArea.classList.remove('hidden');
    fbBox.className = type === 'correct' ? 'p-4 rounded-xl border bg-green-50 border-green-200 w-full overflow-hidden shadow-sm' : 'p-4 rounded-xl border bg-orange-50 border-orange-200 w-full overflow-hidden shadow-sm';
    document.getElementById('feedbackMessage').innerHTML = message;
    
    const nextBtn = document.getElementById('nextBtn');
    if (showNextBtn) { nextBtn.classList.remove('hidden'); nextBtn.onclick = goToNext; } else { nextBtn.classList.add('hidden'); }
    renderMath();
}

function hideFeedback() { document.getElementById('feedbackArea').classList.add('hidden'); }
function disableAllButtons() { document.querySelectorAll('.option-btn').forEach(btn => { if (!btn.classList.contains('border-green-500')) btn.disabled = true; }); }
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
    tempCanvas.width = canvas.width; 
    tempCanvas.height = canvas.height;
    if (canvas.width > 0 && canvas.height > 0) {
        tempCtx.drawImage(canvas, 0, 0);
    }
    
    canvas.width = rect.width; 
    canvas.height = rect.height;
    initCanvas();
    if (tempCanvas.width > 0 && tempCanvas.height > 0) {
        canvas.getContext('2d').drawImage(tempCanvas, 0, 0, canvas.width, canvas.height);
    }
}

function getPos(e) {
    const canvas = document.getElementById('draw-canvas');
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return { 
        x: (clientX - rect.left) * scaleX, 
        y: (clientY - rect.top) * scaleY 
    };
}

function startDrawing(e) {
    e.preventDefault(); 
    isDrawing = true;
    const pos = getPos(e); 
    lastX = pos.x; 
    lastY = pos.y;
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
}

function stopDrawing() { 
    isDrawing = false; 
}

function setupCanvasEvents() {
    const canvas = document.getElementById('draw-canvas');
    if (!canvas) return;
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    canvas.addEventListener('touchstart', startDrawing, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', stopDrawing);
    canvas.addEventListener('touchcancel', stopDrawing);
    
    document.getElementById('clear-btn').addEventListener('click', () => {
        initCanvas();
        document.getElementById('handwritingArea').classList.remove('border-4', 'border-green-500', 'border-red-400');
    });
    
    // 綁定兩階段的「階段一：影像辨識 OCR」
    document.getElementById('recognize-btn').addEventListener('click', startRecognitionPhase);
    window.addEventListener('resize', resizeCanvas);
    
    // 動態生成確認介面 (Confirmation UI)
    const hwArea = document.getElementById('handwritingArea');
    const canvasContainer = hwArea.querySelector('.relative'); 
    if (!document.getElementById('hw-confirm-ui')) {
        const confirmUI = document.createElement('div');
        confirmUI.id = 'hw-confirm-ui';
        confirmUI.className = 'hidden absolute inset-0 bg-white/95 z-20 flex flex-col items-center justify-center p-4 backdrop-blur-sm transition-all';
        confirmUI.innerHTML = `
            <h3 class="text-lg sm:text-xl font-bold text-indigo-700 mb-2">🤖 AI 辨識結果</h3>
            <div id="hw-confirm-math" class="text-xl sm:text-2xl overflow-x-auto math-scroll py-4 px-2 w-full bg-white rounded-lg border-2 border-indigo-200 mb-4 min-h-[80px] flex items-center justify-center shadow-inner text-slate-800"></div>
            <p class="text-sm sm:text-base text-slate-600 font-bold mb-4">請問這是你寫的公式嗎？</p>
            <div class="flex gap-3 w-full max-w-sm">
                <button onclick="rewriteHandwriting()" class="flex-1 py-3 bg-slate-100 text-slate-700 border border-slate-300 font-bold rounded-xl hover:bg-slate-200 transition-colors shadow-sm text-sm sm:text-base">❌ 辨識錯了</button>
                <button onclick="confirmAndGrade()" class="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-md text-sm sm:text-base">✅ 正確，去批改</button>
            </div>
        `;
        canvasContainer.appendChild(confirmUI);
    }
}

// ==========================================
// 🤖 終極大絕招：透過 Google Apps Script 後台代理呼叫 Gemini AI
// ==========================================
async function fetchWithRetry(url, options, maxRetries = 5) {
    let delays = [1000, 2000, 4000, 8000, 16000];
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

// 👉 階段一：辨識圖像為 LaTeX (傳送給 server.gs 處理)
async function startRecognitionPhase() {
    const canvas = document.getElementById('draw-canvas');
    const dataURL = canvas.toDataURL('image/png');
    const base64Image = dataURL.split(',')[1];
    
    const loadingDiv = document.getElementById('ai-loading');
    loadingDiv.querySelector('p').innerHTML = "AI 老師正在努力看懂你的筆跡...<br><span class='text-sm font-normal text-slate-500'>由伺服器代理中，請稍候</span>";
    loadingDiv.classList.remove('hidden');
    
    document.getElementById('recognize-btn').disabled = true;
    document.getElementById('clear-btn').disabled = true;
    document.getElementById('handwritingArea').classList.remove('border-4', 'border-green-500', 'border-red-400');
    
    try {
        const formData = new URLSearchParams();
        formData.append('action', 'ai_ocr');
        formData.append('image', base64Image);

        // 將圖片發送給 Google Apps Script，由它去呼叫 Google AI
        const result = await fetchWithRetry(GOOGLE_SCRIPT_URL, { method: 'POST', body: formData });
        
        if (!result.success) throw new Error(result.message);
        
        currentRecognizedLaTeX = result.latex;
        loadingDiv.classList.add('hidden');
        
        const confirmUI = document.getElementById('hw-confirm-ui');
        const mathDiv = document.getElementById('hw-confirm-math');
        mathDiv.innerHTML = `\\( \\displaystyle ${currentRecognizedLaTeX} \\)`;
        confirmUI.classList.remove('hidden');
        renderMath();
        
    } catch (err) {
        console.error(err);
        alert(`⚠️ 辨識失敗！\n\n詳細錯誤：${err.message}\n\n請聯絡老師確認後台設定。`);
        loadingDiv.classList.add('hidden');
        document.getElementById('recognize-btn').disabled = false;
        document.getElementById('clear-btn').disabled = false;
    }
}

window.rewriteHandwriting = function() {
    document.getElementById('hw-confirm-ui').classList.add('hidden');
    initCanvas(); 
    document.getElementById('recognize-btn').disabled = false;
    document.getElementById('clear-btn').disabled = false;
};

// 👉 階段二：學生確認後，丟給 server.gs 進行邏輯批改
window.confirmAndGrade = async function() {
    document.getElementById('hw-confirm-ui').classList.add('hidden');
    
    const loadingDiv = document.getElementById('ai-loading');
    loadingDiv.querySelector('p').innerHTML = "AI 老師正在進行數學邏輯批改...<br><span class='text-sm font-normal text-slate-500'>比對等價性中</span>";
    loadingDiv.classList.remove('hidden');

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

        // 將文字發送給 Google Apps Script，由它去呼叫 Google AI
        const result = await fetchWithRetry(GOOGLE_SCRIPT_URL, { method: 'POST', body: formData });
        
        if (!result.success) throw new Error(result.message);
        
        loadingDiv.classList.add('hidden');
        attemptsCount++;
        
        let feedbackHtml = `<div class="mb-3 p-4 bg-indigo-50 border border-indigo-200 rounded-xl text-slate-800 shadow-sm">
            <div class="font-bold text-indigo-700 mb-2">🤖 你的作答 (AI 辨識)：</div>
            <div class="text-xl overflow-x-auto math-scroll py-2 bg-white rounded-lg border border-white text-center">\\( \\displaystyle ${currentRecognizedLaTeX} \\)</div>
            ${result.reason ? `<div class="mt-3 text-red-600 font-bold border-t border-indigo-100 pt-2">💡 老師點評：${result.reason}</div>` : ''}
        </div>`;
        
        let finalHint = feedbackHtml + correctOpt.hint;

        if (result.isCorrect) {
            if (attemptsCount === 1) { score += 10; updateScoreDisplay(); }
            showFeedback('correct', finalHint, true);
            document.getElementById('handwritingArea').classList.add('border-4', 'border-green-500');
        } else {
            showFeedback('incorrect', finalHint, false);
            document.getElementById('handwritingArea').classList.add('border-4', 'border-red-400');
            document.getElementById('recognize-btn').disabled = false;
            document.getElementById('clear-btn').disabled = false;
            
            if (attemptsCount >= 2) {
                let giveUpHtml = `<div class="mt-4 text-center"><button onclick="giveUpHandwriting()" class="px-5 py-2 bg-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-300 transition-colors shadow-sm">放棄作答並看正確步驟</button></div>`;
                document.getElementById('feedbackMessage').innerHTML += giveUpHtml;
            }
        }
        
    } catch (err) {
        console.error(err);
        alert(`⚠️ 批改失敗！\n\n詳細錯誤：${err.message}`);
        loadingDiv.classList.add('hidden');
        document.getElementById('hw-confirm-ui').classList.remove('hidden');
    }
};

window.giveUpHandwriting = function() {
    let q = questionBank[currentQuestionIndex];
    let correctOpt = q.options.find(o => o.isCorrect);
    showFeedback('incorrect', correctOpt.hint, true); 
    document.getElementById('clear-btn').disabled = true;
    document.getElementById('recognize-btn').disabled = true;
};

// ==========================================
// 結算畫面與動態進度條生成
// ==========================================
function showEndScreen() {
    document.getElementById('appContainer').classList.add('hidden');
    document.getElementById('endScreen').classList.remove('hidden');
    document.getElementById('finalScore').textContent = score;
    document.getElementById('totalQuestions').textContent = questionBank.length * 10;
    
    let selectedQuote = { text: "今天的累積，是明天的底氣。" };
    let pool = dynamicQuotes.length > 0 ? dynamicQuotes : motivationalQuotes.map(q => ({text: q, weight: 1}));
    
    let totalWeight = pool.reduce((sum, q) => sum + (parseFloat(q.weight) || 1), 0);
    let randomNum = Math.random() * totalWeight;
    for (let q of pool) {
        let w = parseFloat(q.weight) || 1;
        if (randomNum < w) { selectedQuote = q; break; }
        randomNum -= w;
    }
    document.getElementById('motivationalQuote').textContent = selectedQuote.text;
    
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
            <div id="rewardZone" class="w-full bg-white border-2 border-indigo-100 rounded-xl p-5 shadow-sm relative overflow-hidden transition-all duration-500">
                <div id="progressUI" class="block transition-opacity duration-500">
                    <div class="flex justify-between items-end mb-3">
                        <span class="font-bold text-slate-700 text-lg">🎁 刮刮卡解鎖進度</span>
                        <span class="text-sm font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md" id="progressTextUI">${currentProgress} / 100</span>
                    </div>
                    <div class="w-full bg-slate-100 rounded-full h-5 mb-2 overflow-hidden border border-slate-200 shadow-inner relative">
                        <div id="progressBarFill" class="bg-gradient-to-r from-indigo-400 to-indigo-600 h-5 rounded-full transition-all duration-1000 ease-out relative" style="width: ${currentProgress}%">
                            <div class="absolute inset-0 bg-white/20 w-full h-full animate-[pulse_2s_infinite]"></div>
                        </div>
                    </div>
                    <div class="text-sm text-slate-500 text-center mt-3 font-medium" id="progressHint">
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

function updateScoreDisplay() { document.getElementById('scoreDisplay').textContent = score; }

// ==========================================
// 安全嚴謹的傳送成績
// ==========================================
function submitToGoogleSheet() {
    const btn = document.getElementById('submitRecordBtn');
    const statusText = document.getElementById('submitStatus');
    const className = document.getElementById('className').value.trim();
    const classNumber = document.getElementById('classNumber').value.trim();
    const studentName = document.getElementById('studentName').value.trim();

    if (!className || !classNumber || !studentName) {
        statusText.textContent = "⚠️ 請填寫所有資料"; 
        statusText.className = "text-center text-sm font-bold mt-3 text-red-500 block"; 
        statusText.classList.remove('hidden'); 
        return;
    }

    setStoredData('dse_className', className);
    setStoredData('dse_classNumber', classNumber);
    setStoredData('dse_studentName', studentName);

    btn.disabled = true; btn.textContent = "傳送中..."; btn.classList.add('opacity-50');
    statusText.classList.add('hidden');
    
    let displayLevel = currentLevelPref === 'mixed' ? '綜合挑戰' : currentLevelPref.toString().toUpperCase();
    let totalScoreVal = questionBank.length * 10;
    let percentageVal = ((score / totalScoreVal) * 100).toFixed(0) + "%";

    const formData = new URLSearchParams();
    formData.append('className', className);
    formData.append('classNumber', classNumber);
    formData.append('studentName', studentName);
    formData.append('topic', currentTopicName); 
    formData.append('level', `程度 ${displayLevel}`);
    formData.append('score', score);
    formData.append('totalScore', totalScoreVal);
    formData.append('percentage', percentageVal);

    fetch(GOOGLE_SCRIPT_URL, { method: 'POST', body: formData })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                let backendNewTotal = parseInt(data.newTotalScore) || 0;
                let backendPlayCount = parseInt(data.playCountToday) || 1;
                let isCrossed = data.crossedThreshold;
                let officialName = data.officialName || studentName; 
                
                let student = globalLeaderboard.find(s => String(s.className).toUpperCase().trim() === className.toUpperCase() && String(s.classNum).trim() === classNumber);
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
                    statusText.innerHTML = `✅ 成績傳送成功！(今日第 ${backendPlayCount} 次)<br>🎉 目前總分：${backendNewTotal} 分。邁向下一抽還差 <span class="text-indigo-600 font-bold">${100 - (backendNewTotal % 100)} 分</span>！`;
                    
                    setTimeout(() => {
                        const progUI = document.getElementById('progressUI');
                        const scratchUI = document.getElementById('scratchUI');
                        const rewardZone = document.getElementById('rewardZone');
                        
                        if (progUI && scratchUI && rewardZone) {
                            progUI.classList.add('opacity-0');
                            setTimeout(() => {
                                progUI.classList.add('hidden');
                                scratchUI.classList.remove('hidden');
                                void scratchUI.offsetWidth; 
                                scratchUI.classList.remove('opacity-0');
                                rewardZone.classList.replace('border-indigo-100', 'border-amber-300');
                                rewardZone.classList.replace('bg-white', 'bg-amber-50');
                                
                                let finalReward = data.reward && data.reward !== "無" ? data.reward : "再接再厲！";
                                document.getElementById('rewardTextDisplay').textContent = finalReward;
                                renderScratchCard();
                            }, 500);
                        }
                    }, 1500);
                } else {
                    if (hint) hint.innerHTML = `還差 <span class="text-indigo-600 font-bold">${pointsNeeded} 分</span> 即可獲得抽獎機會！傳送成績後更新進度。`;
                    statusText.innerHTML = `✅ 成績傳送成功！(今日第 ${backendPlayCount} 次)<br>📊 目前總分：${backendNewTotal} 分。`;
                }
                
                statusText.className = "text-center text-sm font-bold mt-3 text-green-600 block leading-relaxed";
                statusText.classList.remove('hidden');
                btn.textContent = "✅ 已成功傳送！"; 
                btn.classList.replace('bg-green-600', 'bg-slate-400');
                
                setTimeout(() => { fetchConfig(true); }, 2000);
            } else {
                btn.disabled = false; btn.textContent = "重新傳送"; btn.classList.remove('opacity-50');
                statusText.textContent = data.message; statusText.className = "text-center text-sm font-bold mt-3 text-red-500 block";
                statusText.classList.remove('hidden');
            }
        })
        .catch(err => {
            btn.disabled = false; btn.textContent = "重新傳送"; btn.classList.remove('opacity-50');
            statusText.textContent = "❌ 傳送失敗，請檢查網路連線。"; statusText.className = "text-center text-sm font-bold mt-3 text-red-500 block";
            statusText.classList.remove('hidden');
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
        renderMathInElement(document.getElementById('main-wrapper'), { 
            delimiters: [ {left: '$$', right: '$$', display: true}, {left: '\\[', right: '\\]', display: true}, {left: '\\(', right: '\\)', display: false} ], 
            throwOnError: false 
        });
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
window.submitToGoogleSheet = submitToGoogleSheet;

window.onload = () => { 
    showTopicScreen(); 
    fetchConfig(); 
    setInterval(() => fetchConfig(true), 5000); 

    const savedClass = getStoredData('dse_className');
    const savedNum = getStoredData('dse_classNumber');
    const savedName = getStoredData('dse_studentName');
    if(savedClass) document.getElementById('className').value = savedClass;
    if(savedNum) document.getElementById('classNumber').value = savedNum;
    if(savedName) document.getElementById('studentName').value = savedName;
    
    setupCanvasEvents();
};
