// js/app.js

// ==========================================
// 🚨 老師設定區：請填寫你部署後的 Google Web App URL
// ==========================================
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw_h7rVev1VtAuPK4BFGR4i3lLMC2dGH_X6lkeB5IHZNHWPSBcQtFGNg0U9ZEteZMs/exec"; 

// --- 預設備用設定 (若網路不穩或未讀取到 Google Sheet 時使用) ---
const motivationalQuotes = [
    "未來的你，必定感激今天努力的自己。", "默默耕耘，總有收穫。", "答應自己，每天堅持多 1 分鐘。", "今天的累積，是明天的底氣。"
];

// 根據 Canvas 提供的「課題設定表.csv」建立預設邏輯
const fallbackConfigs = {
    'indices': { name: '指數定律', levels: [ { id: 'L1', title: '⭐ 程度 1', badge: 'S1', desc: '只有 1 個運算步驟<br>鞏固單一法則。' }, { id: 'L2', title: '⭐⭐ 程度 2', badge: 'S3', desc: '只有 2 個運算步驟<br>學習法則轉換。' }, { id: 'L3', title: '⭐⭐⭐ 程度 3', badge: 'S3、DSE', desc: '包含 2 個變數<br>嚴格只有 2 步。' } ] },
    'factorization': { name: '因式分解', levels: [ { id: 'L1', title: '⭐ 程度 1', badge: 'S2', desc: '提公因式<br>學習抽出共同因子。' }, { id: 'L2A', title: '⭐⭐ 程度 2A', badge: 'S2', desc: '一元二次公式分解<br>單一變數完全平方與平方差。' }, { id: 'L2B', title: '⭐⭐ 程度 2B', badge: 'S2', desc: '二元二次公式分解<br>雙變數完全平方與平方差。' }, { id: 'L3A', title: '⭐⭐⭐ 程度 3A', badge: 'S3、DSE', desc: '一元二次因式分解<br>單變數十字相乘法。' }, { id: 'L3B', title: '⭐⭐⭐ 程度 3B', badge: 'S3、DSE', desc: '二元二次因式分解<br>包含雙變數的十字相乘。' } ] },
    'rounding': { name: '近似值與捨入', levels: [ { id: 'L1', title: '⭐ 程度 1', badge: 'S1、DSE', desc: '基本捨入<br>小數點與有效數字的基本四捨五入。' }, { id: 'L2', title: '⭐⭐ 程度 2', badge: 'S1、DSE', desc: '上捨入與下捨入<br>進階要求：強制進位或捨去。' }, { id: 'L3', title: '⭐⭐⭐ 程度 3', badge: 'S1、DSE', desc: '綜合應用<br>包含前導零小數及大整數陷阱。' } ] },
    'identities': { name: '恆等式', levels: [ { id: 'L1', title: '⭐ 程度 1', badge: 'S2', desc: '展開與比較係數<br>基礎一元一次恆等式。' }, { id: 'L2', title: '⭐⭐ 程度 2', badge: 'S2、DSE', desc: '二次恆等式<br>進階代入與比較係數。' }, { id: 'L3', title: '⭐⭐⭐ 程度 3', badge: 'S2、DSE', desc: '比例問題<br>求取多個未知數的比例。' } ] },
    'fractions': { name: '通分母', levels: [ { id: 'L1', title: '⭐ 程度 1', badge: 'S2、DSE', desc: '分母為一元一次<br>分子為常數。' }, { id: 'L2', title: '⭐⭐ 程度 2', badge: 'S4', desc: '分母為一元二次<br>需先因式分解再通分母。' } ] },
    'binary': { name: '二進制', levels: [ { id: 'L1', title: '⭐ 程度 1', badge: 'S3、DSE', desc: '二進制轉十進制<br>只有加法。' }, { id: 'L2', title: '⭐⭐ 程度 2', badge: 'S3、DSE', desc: '十進制轉二進制<br>只有加法。' }, { id: 'L3', title: '⭐⭐⭐ 程度 3', badge: 'S3、DSE', desc: '綜合轉換<br>包含加法與減法。' } ] },
    'expansion': { name: '恆等式的展開', levels: [ { id: 'L1', title: '⭐ 程度 1', badge: 'S2', desc: '展開 (x+a)² 或 (x+a)(x-a)<br>基礎展開。' }, { id: 'L2', title: '⭐⭐ 程度 2', badge: 'S3、DSE', desc: '展開 (bx+a)² 或 (bx+a)(bx-a)<br>b 為正整數。' }, { id: 'L3', title: '⭐⭐⭐ 程度 3', badge: 'S3、DSE', desc: '展開 (bx+a)² 或 (bx+a)(bx-a)<br>a 與 b 皆可為負數。' } ] }
};

// --- 全局狀態 ---
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

// --- 動態從 Google Sheet 抓取設定 (doGet) ---
async function fetchConfig() {
    try {
        if (GOOGLE_SCRIPT_URL && !GOOGLE_SCRIPT_URL.includes("請在此貼上")) {
            const response = await fetch(GOOGLE_SCRIPT_URL);
            const data = await response.json();
            if (data && typeof data === 'object') {
                if (data.quotes) dynamicQuotes = data.quotes;
                if (data.topicConfig) dynamicTopicConfig = data.topicConfig;
                console.log("✅ 成功從統一 Google Sheet 載入座右銘與課題設定！");
            }
        }
    } catch (e) {
        console.warn("⚠️ 讀取設定失敗，將使用系統備用設定。");
    }
}

// --- UI 控制與導航 ---
function setQuestionNum(num) {
    totalQuestionsConfig = num;
    document.querySelectorAll('.num-btn').forEach(btn => {
        btn.classList.remove('bg-indigo-600', 'text-white', 'shadow-md');
        btn.classList.add('bg-transparent', 'text-slate-600');
    });
    const activeBtn = document.getElementById('btn-num-' + num);
    if (activeBtn) {
        activeBtn.classList.remove('bg-transparent', 'text-slate-600');
        activeBtn.classList.add('bg-indigo-600', 'text-white', 'shadow-md');
    }
    const displayQ = document.getElementById('displayQNum');
    if (displayQ) displayQ.textContent = num;
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
    
    if (currentTopic === 'global_mixed') {
        showTopicScreen();
    } else {
        selectTopic(currentTopic);
    }
}

function backToLevelSelectionFromQuiz() { document.getElementById('confirmModal').classList.remove('hidden'); }
function closeConfirmModal() { document.getElementById('confirmModal').classList.add('hidden'); }
function confirmBackToLevelSelection() { closeConfirmModal(); backToLevelSelection(); }

// --- 選擇課題並動態生成難度按鈕 ---
function selectTopic(topic) {
    currentTopic = topic;
    document.getElementById('topicScreen').classList.add('hidden');
    document.getElementById('startScreen').classList.remove('hidden');
    
    // 先隱藏所有難度按鈕 ID
    const allBtnIds = ['btnL1', 'btnL2', 'btnL3', 'btnL2A', 'btnL2B', 'btnL3A', 'btnL3B'];
    allBtnIds.forEach(id => {
        const b = document.getElementById(id);
        if (b) b.classList.add('hidden');
    });

    let config = fallbackConfigs[topic];
    if (!config) return;

    currentTopicName = config.name;
    document.getElementById('levelTitle').textContent = config.name + ' - 請選擇難度';

    config.levels.forEach(lvl => {
        let title = lvl.title, badge = lvl.badge, desc = lvl.desc;
        
        // 優先套用 Google Sheet 的自定義內容
        if (dynamicTopicConfig && dynamicTopicConfig.length > 0) {
            let custom = dynamicTopicConfig.find(c => c.topic === topic && c.levelId === lvl.id);
            if (custom) {
                if (custom.title) title = custom.title;
                if (custom.badge) badge = custom.badge;
                if (custom.desc) desc = custom.desc;
            }
        }

        const btn = document.getElementById('btn' + lvl.id);
        if (btn) {
            btn.classList.remove('hidden');
            let colorClass = lvl.id.includes('1') ? 'bg-green-100 text-green-700' : (lvl.id.includes('2') ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700');
            btn.querySelector('.font-bold').innerHTML = title + `<div class="mt-1"><span class="inline-block px-2 py-0.5 ${colorClass} text-xs rounded-md font-bold">${badge}</span></div>`;
            btn.lastElementChild.innerHTML = desc;
        }
    });
}

// --- 跨課題綜合挑戰生成引擎 ---
function startGlobalMixed(level) {
    try {
        currentTopic = 'global_mixed';
        currentTopicName = '跨課題綜合挑戰';
        currentLevelPref = level;
        document.getElementById('questionInstruction').classList.add('hidden');

        // 定義所有課題庫清單
        let topicsList = ['indices', 'factorization', 'rounding', 'identities', 'fractions', 'binary', 'expansion'];
        
        // 保證每一個課題都能最少出現一次，自動將題數提升至課題數之上 (最少7題)
        let numQ = Math.max(totalQuestionsConfig, topicsList.length);

        // 1. 保證每個課題至少出題一次
        let selectedTopics = [...topicsList];

        // 2. 如果設定題數大於課題數 (如選 10 題)，剩餘的題數則隨機填充
        while (selectedTopics.length < numQ) {
            selectedTopics.push(topicsList[Math.floor(Math.random() * topicsList.length)]);
        }

        // 3. 隨機打亂所有選中的課題順序
        selectedTopics = shuffleArray(selectedTopics);

        questionBank = [];
        selectedTopics.forEach((t, idx) => {
            let qArr = [];
            let lvl = String(level);
            
            // 🌟 修正：通用降階保護機制 (防呆設計)
            // 自動判斷該課題支援的最高難度。若要求的難度大於支援範圍，自動向下降階
            let supportedIds = fallbackConfigs[t].levels.map(l => l.id);
            let maxSupported = 1;
            if (supportedIds.some(id => id.includes('3'))) maxSupported = 3;
            else if (supportedIds.some(id => id.includes('2'))) maxSupported = 2;

            if (parseInt(lvl) > maxSupported) {
                lvl = String(maxSupported);
            }
            
            // 特別處理因式分解的 A/B 分支設定 (隨機抽籤)
            if (t === 'factorization') {
                if (lvl === '2') lvl = Math.random() > 0.5 ? '2a' : '2b';
                if (lvl === '3') lvl = Math.random() > 0.5 ? '3a' : '3b';
            }
            
            // 每次生成一題對應難度的題目
            if (t === 'indices') qArr = generateIndicesQuestions(1, lvl);
            else if (t === 'factorization') qArr = generateFactorizationQuestions(1, lvl);
            else if (t === 'rounding') qArr = generateRoundingQuestions(1, lvl);
            else if (t === 'identities') qArr = generateIdentitiesQuestions(1, lvl);
            else if (t === 'fractions') qArr = generateFractionsQuestions(1, lvl);
            else if (t === 'binary') qArr = generateBinaryQuestions(1, lvl);
            else if (t === 'expansion') qArr = generateExpansionQuestions(1, lvl);

            if (qArr && qArr.length > 0) {
                qArr[0].id = idx + 1; // 連續修正題號
                questionBank.push(qArr[0]);
            }
        });

        // 設定好題目後切換畫面
        currentQuestionIndex = 0; score = 0; updateScoreDisplay();
        document.getElementById('topicScreen').classList.add('hidden');
        document.getElementById('startScreen').classList.add('hidden');
        document.getElementById('endScreen').classList.add('hidden');
        document.getElementById('appContainer').classList.remove('hidden');

        const btn = document.getElementById('submitRecordBtn');
        if (btn) {
            btn.disabled = false; btn.textContent = "傳送成績";
            btn.classList.remove('bg-slate-400'); btn.classList.add('bg-green-600');
        }
        const statusText = document.getElementById('submitStatus');
        if (statusText) statusText.classList.add('hidden');

        loadQuestion();
    } catch (error) {
        alert("🚨 系統錯誤！無法讀取跨課題題庫。\n原因：" + error.message);
        console.error(error);
    }
}

// --- 單一課題開始遊戲與題目載入 ---
function startGame(levelPref) {
    try {
        if (currentTopic === 'global_mixed') {
            startGlobalMixed(levelPref);
            return;
        }

        currentLevelPref = levelPref;
        document.getElementById('questionInstruction').classList.add('hidden');
        
        // 分流至各題庫生成器
        if (currentTopic === 'indices') questionBank = generateIndicesQuestions(totalQuestionsConfig, currentLevelPref); 
        else if (currentTopic === 'factorization') questionBank = generateFactorizationQuestions(totalQuestionsConfig, currentLevelPref); 
        else if (currentTopic === 'rounding') questionBank = generateRoundingQuestions(totalQuestionsConfig, currentLevelPref);
        else if (currentTopic === 'identities') questionBank = generateIdentitiesQuestions(totalQuestionsConfig, currentLevelPref);
        else if (currentTopic === 'fractions') questionBank = generateFractionsQuestions(totalQuestionsConfig, currentLevelPref);
        else if (currentTopic === 'binary') questionBank = generateBinaryQuestions(totalQuestionsConfig, currentLevelPref);
        else if (currentTopic === 'expansion') questionBank = generateExpansionQuestions(totalQuestionsConfig, currentLevelPref);
        
        currentQuestionIndex = 0; score = 0; updateScoreDisplay();
        document.getElementById('startScreen').classList.add('hidden');
        document.getElementById('appContainer').classList.remove('hidden');
        
        const btn = document.getElementById('submitRecordBtn');
        btn.disabled = false; btn.textContent = "傳送成績";
        btn.classList.remove('bg-slate-400'); btn.classList.add('bg-green-600');
        document.getElementById('submitStatus').classList.add('hidden');
        
        loadQuestion();
    } catch (error) {
        alert("🚨 系統錯誤！無法讀取題庫。\n原因：" + error.message);
    }
}

function loadQuestion() {
    attemptsCount = 0; 
    const q = questionBank[currentQuestionIndex];
    document.getElementById('topicBadge').textContent = q.topic;
    
    // 若為跨課題綜合挑戰，修改難度徽章的文字顯示
    if (currentTopic === 'global_mixed') {
        document.getElementById('levelBadge').innerHTML = `綜合挑戰 (難度: ${currentLevelPref})`;
    } else {
        document.getElementById('levelBadge').innerHTML = `難度: ${q.level}`;
    }
    
    document.getElementById('progressText').textContent = `完成 ${currentQuestionIndex}/${questionBank.length}`;
    hideFeedback();
    document.getElementById('questionText').innerHTML = q.question;

    const optionsGrid = document.getElementById('optionsGrid');
    optionsGrid.innerHTML = ''; 
    q.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'option-btn relative p-3 sm:p-4 bg-white border-2 border-slate-200 rounded-xl text-base sm:text-lg text-slate-700 font-medium hover:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-100 flex items-center gap-3 text-left w-full overflow-hidden';
        btn.onclick = () => handleAnswer(opt, btn);
        btn.innerHTML = `<span class="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-sm shrink-0">${opt.id}</span><span class="overflow-x-auto math-scroll max-w-full flex-1 py-1">${opt.text}</span>`;
        optionsGrid.appendChild(btn);
    });
    renderMath();
}

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
    fbBox.className = type === 'correct' ? 'p-4 rounded-xl border bg-green-50 border-green-200 w-full overflow-hidden' : 'p-4 rounded-xl border bg-orange-50 border-orange-200 w-full overflow-hidden';
    document.getElementById('feedbackMessage').innerHTML = message;
    
    const nextBtn = document.getElementById('nextBtn');
    if (showNextBtn) { nextBtn.classList.remove('hidden'); nextBtn.onclick = goToNext; } 
    else { nextBtn.classList.add('hidden'); }
    renderMath();
}

function hideFeedback() { document.getElementById('feedbackArea').classList.add('hidden'); }
function disableAllButtons() { document.querySelectorAll('.option-btn').forEach(btn => { if (!btn.classList.contains('border-green-500')) btn.disabled = true; }); }
function goToNext() { currentQuestionIndex++; if (currentQuestionIndex < questionBank.length) loadQuestion(); else showEndScreen(); }

// --- 結算畫面與刮刮卡機制 ---
function showEndScreen() {
    document.getElementById('appContainer').classList.add('hidden');
    document.getElementById('endScreen').classList.remove('hidden');
    document.getElementById('finalScore').textContent = score;
    document.getElementById('totalQuestions').textContent = questionBank.length * 10;
    
    // 建立權重隨機池
    let selectedQuote = { text: "今天的累積，是明天的底氣。", reward: "" };
    let pool = dynamicQuotes.length > 0 ? dynamicQuotes : motivationalQuotes.map(q => ({text: q, weight: 1, reward: ""}));
    
    let totalWeight = pool.reduce((sum, q) => sum + (parseFloat(q.weight) || 1), 0);
    let randomNum = Math.random() * totalWeight;
    for (let q of pool) {
        let w = parseFloat(q.weight) || 1;
        if (randomNum < w) { selectedQuote = q; break; }
        randomNum -= w;
    }
    
    document.getElementById('motivationalQuote').textContent = selectedQuote.text;
    
    // 刮刮卡渲染
    let rewardContainer = document.getElementById('rewardContainer');
    if (!rewardContainer) {
        rewardContainer = document.createElement('div');
        rewardContainer.id = 'rewardContainer';
        rewardContainer.className = 'mt-6 w-full max-w-sm mx-auto hidden';
        document.getElementById('motivationalQuote').parentElement.parentElement.parentElement.appendChild(rewardContainer);
    }
    
    if (selectedQuote.reward && selectedQuote.reward.trim() !== "") {
        rewardContainer.classList.remove('hidden');
        rewardContainer.innerHTML = `
            <div class="relative w-full h-20 sm:h-24 rounded-xl overflow-hidden border-2 border-slate-200 shadow-sm" style="touch-action:none;">
                <div class="absolute inset-0 flex items-center justify-center bg-pink-50 text-pink-600 font-bold px-4 text-center text-sm sm:text-base">🎁 ${selectedQuote.reward}</div>
                <canvas id="scratchCanvas" class="absolute inset-0 w-full h-full z-10 cursor-pointer"></canvas>
            </div>
            <div class="text-xs text-slate-400 mt-2 text-center">💡 刮開塗層看獎勵</div>
        `;
        
        setTimeout(() => {
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
        }, 100);
    } else {
        rewardContainer.classList.add('hidden');
    }
}

function updateScoreDisplay() { document.getElementById('scoreDisplay').textContent = score; }

function submitToGoogleSheet() {
    const btn = document.getElementById('submitRecordBtn');
    const statusText = document.getElementById('submitStatus');
    const className = document.getElementById('className').value.trim();
    const classNumber = document.getElementById('classNumber').value.trim();
    const studentName = document.getElementById('studentName').value.trim();

    if (!className || !classNumber || !studentName) {
        statusText.textContent = "⚠️ 請填寫所有資料"; statusText.className = "text-center text-sm font-bold mt-3 text-red-500 block"; return;
    }

    btn.disabled = true; btn.textContent = "傳送中..."; btn.classList.add('opacity-50');
    
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

    fetch(GOOGLE_SCRIPT_URL, { method: 'POST', body: formData, mode: 'no-cors' })
        .then(() => {
            btn.textContent = "✅ 已成功傳送！"; btn.classList.replace('bg-green-600', 'bg-slate-400');
            statusText.textContent = "成績已傳送給老師！"; statusText.className = "text-center text-sm font-bold mt-3 text-green-600 block";
        })
        .catch(err => {
            btn.disabled = false; btn.textContent = "傳送成績"; btn.classList.remove('opacity-50');
            statusText.textContent = "❌ 傳送失敗，請檢查網路。"; statusText.className = "text-center text-sm font-bold mt-3 text-red-500 block";
        });
}

function renderMath() {
    if (typeof renderMathInElement !== 'undefined') {
        renderMathInElement(document.getElementById('main-wrapper'), { 
            delimiters: [ {left: '$$', right: '$$', display: true}, {left: '\\[', right: '\\]', display: true}, {left: '\\(', right: '\\)', display: false} ], 
            throwOnError: false 
        });
    }
}

// --- 全域函數綁定 (修復 onclick 報錯) ---
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

// --- 初始化載入 ---
window.onload = () => { showTopicScreen(); fetchConfig(); };
