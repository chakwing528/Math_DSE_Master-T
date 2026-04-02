// js/app.js

// ==========================================
// 🚨 老師設定區：已整合專屬 Google Web App URL
// ==========================================
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw_h7rVev1VtAuPK4BFGR4i3lLMC2dGH_X6lkeB5IHZNHWPSBcQtFGNg0U9ZEteZMs/exec"; 

// --- 預設座右銘 (如果 Google Sheet 連線失敗或尚未設定時的備用題庫) ---
const motivationalQuotes = [
    "未來的你，必定感激今天努力的自己。", "默默耕耘，總有收穫。", "答應自己，每天堅持多 1 分鐘。", "今天的累積，是明天的底氣。", 
    "每天進步一點點，時間會看見。", "聚沙成塔，滴水穿石。", "腳踏實地，每一步都算數。", "成功沒有捷徑，只有每天的堅持。"
];

// --- 全局變數 ---
let questionBank = [];
let currentQuestionIndex = 0;
let score = 0;
let attemptsCount = 0; 
let currentLevelPref = 1; 
let currentTopic = 'indices'; 
let currentTopicName = '指數定律';
let totalQuestionsConfig = 3; 

// 線上動態載入的座右銘與獎勵清單
let dynamicQuotes = [];

// --- 動態從 Google Sheet 抓取座右銘與機率 (doGet) ---
async function fetchQuotes() {
    try {
        if (GOOGLE_SCRIPT_URL && !GOOGLE_SCRIPT_URL.includes("請在此貼上")) {
            // 使用 fetch 呼叫 Apps Script 的 doGet
            const response = await fetch(GOOGLE_SCRIPT_URL);
            const data = await response.json();
            if (Array.isArray(data) && data.length > 0) {
                dynamicQuotes = data;
                console.log("✅ 成功從 Google Sheet 載入座右銘與獎勵機制！");
            }
        }
    } catch (e) {
        console.warn("⚠️ 讀取線上座右銘失敗，將使用備用題庫。");
    }
}

// --- 設定題數 ---
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

// --- 畫面導航函數 ---
function showTopicScreen() {
    document.getElementById('topicScreen').classList.remove('hidden');
    document.getElementById('startScreen').classList.add('hidden');
    document.getElementById('appContainer').classList.add('hidden');
    document.getElementById('endScreen').classList.add('hidden');
}

function backToLevelSelection() {
    document.getElementById('appContainer').classList.add('hidden');
    document.getElementById('endScreen').classList.add('hidden');
    selectTopic(currentTopic);
}

function backToLevelSelectionFromQuiz() {
    document.getElementById('confirmModal').classList.remove('hidden');
}

function closeConfirmModal() {
    document.getElementById('confirmModal').classList.add('hidden');
}

function confirmBackToLevelSelection() {
    closeConfirmModal();
    backToLevelSelection();
}

// --- 選擇課題與難度設定 ---
function selectTopic(topic) {
    currentTopic = topic;
    document.getElementById('topicScreen').classList.add('hidden');
    document.getElementById('startScreen').classList.remove('hidden');
    
    const btnL1 = document.getElementById('btnL1');
    const btnL2 = document.getElementById('btnL2');
    const btnL3 = document.getElementById('btnL3');
    const btnL2A = document.getElementById('btnL2A');
    const btnL2B = document.getElementById('btnL2B');
    const btnL3A = document.getElementById('btnL3A');
    const btnL3B = document.getElementById('btnL3B');

    // 隱藏所有按鈕
    [btnL1, btnL2, btnL3, btnL2A, btnL2B, btnL3A, btnL3B].forEach(b => { if(b) b.classList.add('hidden'); });

    const badges = {
        'L1_S1': '<div class="mt-1"><span class="inline-block px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-md font-bold">S1</span></div>',
        'L1_S2': '<div class="mt-1"><span class="inline-block px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-md font-bold">S2</span></div>',
        'L1_S1DSE': '<div class="mt-1"><span class="inline-block px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-md font-bold">S1、DSE</span></div>',
        'L1_S3DSE': '<div class="mt-1"><span class="inline-block px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-md font-bold">S3、DSE</span></div>',
        'L2_S2': '<div class="mt-1"><span class="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-md font-bold">S2</span></div>',
        'L2_S3': '<div class="mt-1"><span class="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-md font-bold">S3</span></div>',
        'L2_S4': '<div class="mt-1"><span class="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-md font-bold">S4</span></div>',
        'L2_S1DSE': '<div class="mt-1"><span class="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-md font-bold">S1、DSE</span></div>',
        'L2_S2DSE': '<div class="mt-1"><span class="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-md font-bold">S2、DSE</span></div>',
        'L2_S3DSE': '<div class="mt-1"><span class="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-md font-bold">S3、DSE</span></div>',
        'L3_S1DSE': '<div class="mt-1"><span class="inline-block px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-md font-bold">S1、DSE</span></div>',
        'L3_S2DSE': '<div class="mt-1"><span class="inline-block px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-md font-bold">S2、DSE</span></div>',
        'L3_S3DSE': '<div class="mt-1"><span class="inline-block px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-md font-bold">S3、DSE</span></div>'
    };

    if (topic === 'indices') {
        currentTopicName = '指數定律'; document.getElementById('levelTitle').textContent = '指數定律 - 請選擇難度';
        btnL1.classList.remove('hidden'); btnL1.querySelector('.font-bold').innerHTML = '⭐ 程度 1' + badges['L1_S1']; document.getElementById('descL1').innerHTML = '只有 1 個運算步驟<br>鞏固單一法則。';
        btnL2.classList.remove('hidden'); btnL2.querySelector('.font-bold').innerHTML = '⭐⭐ 程度 2' + badges['L2_S3']; document.getElementById('descL2').innerHTML = '只有 2 個運算步驟<br>學習法則轉換。';
        btnL3.classList.remove('hidden'); btnL3.querySelector('.font-bold').innerHTML = '⭐⭐⭐ 程度 3' + badges['L3_S3DSE']; document.getElementById('descL3').innerHTML = '包含 2 個變數<br>嚴格只有 2 步。';
    } else if (topic === 'factorization') {
        currentTopicName = '因式分解'; document.getElementById('levelTitle').textContent = '因式分解 - 請選擇難度';
        btnL1.classList.remove('hidden'); btnL1.querySelector('.font-bold').innerHTML = '⭐ 程度 1' + badges['L1_S2']; document.getElementById('descL1').innerHTML = '提公因式<br>學習抽出共同因子。';
        btnL2A.classList.remove('hidden'); btnL2A.querySelector('.font-bold').innerHTML = '⭐⭐ 程度 2A' + badges['L2_S2']; btnL2A.lastElementChild.innerHTML = '一元二次公式分解<br>單一變數完全平方與平方差。';
        btnL2B.classList.remove('hidden'); btnL2B.querySelector('.font-bold').innerHTML = '⭐⭐ 程度 2B' + badges['L2_S2']; btnL2B.lastElementChild.innerHTML = '二元二次公式分解<br>雙變數完全平方與平方差。';
        btnL3A.classList.remove('hidden'); btnL3A.querySelector('.font-bold').innerHTML = '⭐⭐⭐ 程度 3A' + badges['L3_S3DSE']; btnL3A.lastElementChild.innerHTML = '一元二次因式分解<br>單變數十字相乘法。';
        btnL3B.classList.remove('hidden'); btnL3B.querySelector('.font-bold').innerHTML = '⭐⭐⭐ 程度 3B' + badges['L3_S3DSE']; btnL3B.lastElementChild.innerHTML = '二元二次因式分解<br>包含雙變數的十字相乘。';
    } else if (topic === 'rounding') {
        currentTopicName = '近似值與捨入'; document.getElementById('levelTitle').textContent = '近似值與捨入 - 請選擇難度';
        btnL1.classList.remove('hidden'); btnL1.querySelector('.font-bold').innerHTML = '⭐ 程度 1' + badges['L1_S1DSE']; document.getElementById('descL1').innerHTML = '基本捨入<br>小數點與有效數字的基本四捨五入。';
        btnL2.classList.remove('hidden'); btnL2.querySelector('.font-bold').innerHTML = '⭐⭐ 程度 2' + badges['L2_S1DSE']; document.getElementById('descL2').innerHTML = '上捨入與下捨入<br>進階要求：強制進位或捨去。';
        btnL3.classList.remove('hidden'); btnL3.querySelector('.font-bold').innerHTML = '⭐⭐⭐ 程度 3' + badges['L3_S1DSE']; document.getElementById('descL3').innerHTML = '綜合應用<br>包含前導零小數及大整數陷阱。';
    } else if (topic === 'identities') {
        currentTopicName = '恆等式'; document.getElementById('levelTitle').textContent = '恆等式 - 請選擇難度';
        btnL1.classList.remove('hidden'); btnL1.querySelector('.font-bold').innerHTML = '⭐ 程度 1' + badges['L1_S2']; document.getElementById('descL1').innerHTML = '展開與比較係數<br>基礎一元一次恆等式。';
        btnL2.classList.remove('hidden'); btnL2.querySelector('.font-bold').innerHTML = '⭐⭐ 程度 2' + badges['L2_S2DSE']; document.getElementById('descL2').innerHTML = '二次恆等式<br>進階代入與比較係數。';
        btnL3.classList.remove('hidden'); btnL3.querySelector('.font-bold').innerHTML = '⭐⭐⭐ 程度 3' + badges['L3_S2DSE']; document.getElementById('descL3').innerHTML = '比例問題<br>求取多個未知數的比例。';
    } else if (topic === 'fractions') {
        currentTopicName = '通分母'; document.getElementById('levelTitle').textContent = '通分母 - 請選擇難度';
        btnL1.classList.remove('hidden'); btnL1.querySelector('.font-bold').innerHTML = '⭐ 程度 1' + badges['L1_S2DSE']; document.getElementById('descL1').innerHTML = '分母為一元一次<br>分子為常數。';
        btnL2.classList.remove('hidden'); btnL2.querySelector('.font-bold').innerHTML = '⭐⭐ 程度 2' + badges['L2_S4']; document.getElementById('descL2').innerHTML = '分母為一元二次<br>需先因式分解再通分母。';
    } else if (topic === 'binary') {
        currentTopicName = '二進制'; document.getElementById('levelTitle').textContent = '二進制 - 請選擇難度';
        btnL1.classList.remove('hidden'); btnL1.querySelector('.font-bold').innerHTML = '⭐ 程度 1' + badges['L1_S3DSE']; document.getElementById('descL1').innerHTML = '二進制轉十進制<br>只有加法。';
        btnL2.classList.remove('hidden'); btnL2.querySelector('.font-bold').innerHTML = '⭐⭐ 程度 2' + badges['L2_S3DSE']; document.getElementById('descL2').innerHTML = '十進制轉二進制<br>只有加法。';
        btnL3.classList.remove('hidden'); btnL3.querySelector('.font-bold').innerHTML = '⭐⭐⭐ 程度 3' + badges['L3_S3DSE']; document.getElementById('descL3').innerHTML = '綜合轉換<br>包含加法與減法。';
    }
}

// --- 開始遊戲與題目載入 ---
function startGame(levelPref) {
    try {
        currentLevelPref = levelPref;
        document.getElementById('questionInstruction').classList.add('hidden');
        
        if (currentTopic === 'indices') questionBank = generateIndicesQuestions(totalQuestionsConfig, currentLevelPref); 
        else if (currentTopic === 'factorization') questionBank = generateFactorizationQuestions(totalQuestionsConfig, currentLevelPref); 
        else if (currentTopic === 'rounding') questionBank = generateRoundingQuestions(totalQuestionsConfig, currentLevelPref);
        else if (currentTopic === 'identities') questionBank = generateIdentitiesQuestions(totalQuestionsConfig, currentLevelPref);
        else if (currentTopic === 'fractions') questionBank = generateFractionsQuestions(totalQuestionsConfig, currentLevelPref);
        else if (currentTopic === 'binary') questionBank = generateBinaryQuestions(totalQuestionsConfig, currentLevelPref);
        
        currentQuestionIndex = 0;
        score = 0;
        updateScoreDisplay();
        
        document.getElementById('startScreen').classList.add('hidden');
        document.getElementById('endScreen').classList.add('hidden');
        document.getElementById('appContainer').classList.remove('hidden');
        
        const btn = document.getElementById('submitRecordBtn');
        btn.disabled = false;
        btn.textContent = "傳送成績";
        btn.classList.remove('opacity-50', 'cursor-not-allowed', 'bg-slate-400');
        btn.classList.add('bg-green-600', 'hover:bg-green-700');
        document.getElementById('submitStatus').classList.add('hidden');
        
        loadQuestion();
    } catch (error) {
        alert("🚨 系統錯誤！\n\n無法讀取題庫。\n錯誤原因：" + error.message);
        console.error(error);
    }
}

function loadQuestion() {
    attemptsCount = 0; 
    const q = questionBank[currentQuestionIndex];
    
    document.getElementById('topicBadge').textContent = q.topic;
    document.getElementById('levelBadge').innerHTML = `難度: ${q.level}`;
    document.getElementById('progressText').textContent = `完成 ${currentQuestionIndex}/${questionBank.length}`;

    hideFeedback();

    const questionContainer = document.getElementById('questionText');
    questionContainer.innerHTML = q.question;

    const optionsGrid = document.getElementById('optionsGrid');
    optionsGrid.innerHTML = ''; 
    
    q.options.forEach((opt, index) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn relative p-3 sm:p-4 bg-white border-2 border-slate-200 rounded-xl text-base sm:text-lg text-slate-700 font-medium hover:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-100 flex items-center gap-3 text-left w-full overflow-hidden';
        btn.onclick = () => handleAnswer(opt, btn);
        
        const label = document.createElement('span');
        label.className = 'w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-sm shrink-0';
        label.textContent = opt.id;
        
        const mathContent = document.createElement('span');
        mathContent.className = 'overflow-x-auto math-scroll max-w-full flex-1 py-1';
        mathContent.innerHTML = opt.text;

        btn.appendChild(label);
        btn.appendChild(mathContent);
        optionsGrid.appendChild(btn);
    });

    renderMath();
}

function handleAnswer(selectedOption, buttonElement) {
    attemptsCount++;
    const isCorrect = selectedOption.isCorrect === true;

    if (isCorrect) {
        buttonElement.classList.remove('border-slate-200', 'hover:border-indigo-400');
        buttonElement.classList.add('border-green-500', 'bg-green-50');
        buttonElement.querySelector('span').classList.replace('bg-slate-100', 'bg-green-500');
        buttonElement.querySelector('span').classList.replace('text-slate-500', 'text-white');
        
        document.getElementById('progressText').textContent = `完成 ${currentQuestionIndex + 1}/${questionBank.length}`;
        
        if (attemptsCount === 1) {
            score += 10;
            updateScoreDisplay();
        }

        showFeedback('correct', selectedOption.hint, true);
        disableAllButtons();
        
    } else {
        buttonElement.classList.remove('border-slate-200');
        buttonElement.classList.add('border-red-300', 'bg-red-50');
        buttonElement.disabled = true;

        showFeedback('incorrect', selectedOption.hint, false);
    }
}

function showFeedback(type, message, showNextBtn) {
    const feedbackArea = document.getElementById('feedbackArea');
    const feedbackBox = document.getElementById('feedbackBox');
    const messageEl = document.getElementById('feedbackMessage');
    const nextBtn = document.getElementById('nextBtn');

    feedbackArea.classList.remove('hidden');
    feedbackBox.className = type === 'correct' ? 'p-4 rounded-xl border bg-green-50 border-green-200 w-full overflow-hidden' : 'p-4 rounded-xl border bg-orange-50 border-orange-200 w-full overflow-hidden';
    messageEl.innerHTML = message;

    if (showNextBtn) {
        nextBtn.classList.remove('hidden');
        nextBtn.onclick = goToNext;
    } else {
        nextBtn.classList.add('hidden');
    }
    renderMath();
}

function hideFeedback() {
    document.getElementById('feedbackArea').classList.add('hidden');
}

function disableAllButtons() {
    document.querySelectorAll('.option-btn').forEach(btn => {
        if (!btn.classList.contains('border-green-500')) btn.disabled = true;
    });
}

function goToNext() {
    currentQuestionIndex++;
    if (currentQuestionIndex < questionBank.length) loadQuestion();
    else showEndScreen();
}

// --- 結算畫面與權重隨機抽取座右銘 ---
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
        if (randomNum < w) {
            selectedQuote = q;
            break;
        }
        randomNum -= w;
    }
    
    document.getElementById('motivationalQuote').textContent = selectedQuote.text;
    
    // 處理獎勵顯示
    let rewardEl = document.getElementById('rewardDisplay');
    if (!rewardEl) {
        rewardEl = document.createElement('div');
        rewardEl.id = 'rewardDisplay';
        rewardEl.className = 'mt-4 text-sm sm:text-base font-bold text-pink-600 bg-pink-50 p-3 rounded-lg border border-pink-200 hidden inline-block';
        const quoteContainer = document.getElementById('motivationalQuote').parentElement.parentElement;
        quoteContainer.appendChild(rewardEl);
    }
    
    if (selectedQuote.reward && selectedQuote.reward.trim() !== "") {
        rewardEl.innerHTML = "🎁 <strong>恭喜獲得獎勵：</strong>" + selectedQuote.reward;
        rewardEl.classList.remove('hidden');
    } else {
        rewardEl.classList.add('hidden');
    }
}

function updateScoreDisplay() {
    document.getElementById('scoreDisplay').textContent = score;
}

// --- 提交成績至 Google Sheet ---
function submitToGoogleSheet() {
    const btn = document.getElementById('submitRecordBtn');
    const statusText = document.getElementById('submitStatus');
    const className = document.getElementById('className').value.trim();
    const classNumber = document.getElementById('classNumber').value.trim();
    const studentName = document.getElementById('studentName').value.trim();

    if (!className || !classNumber || !studentName) {
        statusText.textContent = "⚠️ 請填寫所有資料";
        statusText.className = "text-center text-sm font-bold mt-3 text-red-500 block";
        return;
    }

    btn.disabled = true;
    btn.textContent = "傳送中...";
    btn.classList.add('opacity-50', 'cursor-not-allowed');
    statusText.classList.add('hidden');
    
    let displayLevel = currentLevelPref === 'mixed' ? '綜合挑戰' : currentLevelPref.toString().toUpperCase();
    let totalScoreVal = totalQuestionsConfig * 10;
    let percentageVal = ((score / totalScoreVal) * 100).toFixed(0) + "%";

    document.getElementById('form_className').value = className;
    document.getElementById('form_classNumber').value = classNumber;
    document.getElementById('form_studentName').value = studentName;
    document.getElementById('form_topic').value = currentTopicName; 
    document.getElementById('form_level').value = `程度 ${displayLevel}`;
    document.getElementById('form_score').value = score;
    document.getElementById('form_totalScore').value = totalScoreVal;
    document.getElementById('form_percentage').value = percentageVal;

    document.getElementById('googleForm').action = GOOGLE_SCRIPT_URL; 
    document.getElementById('googleForm').submit();

    setTimeout(() => {
        btn.textContent = "✅ 已成功傳送！";
        btn.classList.remove('bg-green-600', 'hover:bg-green-700');
        btn.classList.add('bg-slate-400');
        statusText.textContent = "成績已成功傳送給老師，謝謝！";
        statusText.className = "text-center text-sm font-bold mt-3 text-green-600 block";
    }, 1500);
}

// --- 渲染數學公式 ---
function renderMath() {
    if (typeof renderMathInElement !== 'undefined') {
        const config = {
            delimiters: [
                {left: '$$', right: '$$', display: true},
                {left: '\\[', right: '\\]', display: true},
                {left: '\\(', right: '\\)', display: false}
            ],
            throwOnError: false
        };
        const qText = document.getElementById('questionText');
        const optGrid = document.getElementById('optionsGrid');
        const fbArea = document.getElementById('feedbackArea');
        if (qText) renderMathInElement(qText, config);
        if (optGrid) renderMathInElement(optGrid, config);
        if (fbArea) renderMathInElement(fbArea, config);
    }
}

// --- 綁定全域函數修復 onclick 錯誤 ---
window.setQuestionNum = setQuestionNum;
window.showTopicScreen = showTopicScreen;
window.backToLevelSelection = backToLevelSelection;
window.backToLevelSelectionFromQuiz = backToLevelSelectionFromQuiz;
window.closeConfirmModal = closeConfirmModal;
window.confirmBackToLevelSelection = confirmBackToLevelSelection;
window.selectTopic = selectTopic;
window.startGame = startGame;
window.submitToGoogleSheet = submitToGoogleSheet;

window.onload = () => {
    showTopicScreen();
    fetchQuotes(); 
};
