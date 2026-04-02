// js/topics/binary.js

// ==========================================
// 二進制專用錯誤提示訊息
// ==========================================
const msgBin1 = `<div class="text-red-600 font-bold text-lg mb-1">❗ 留意二進制展開的位值對應</div>`;
const msgBin2 = `<div class="text-red-600 font-bold text-lg mb-1">❗ 展開時指數計算錯誤</div>`;
const msgBin3 = `<div class="text-red-600 font-bold text-lg mb-1">❗ 處理減法借位時出錯</div>`;

// ==========================================
// 題目生成器：二進制 (Binary System)
// ==========================================
function generateBinaryQuestions(num, levelPref) {
    const bank = [];
    
    for (let i = 0; i < num; i++) {
        let levelType = levelPref;
        if (levelPref === 'mixed') {
            const types = ['1', '2', '3'];
            levelType = types[getRandomInt(0, types.length)];
        } else {
            levelType = String(levelPref);
        }
        
        let qObj = { id: i + 1, topic: "二進制 (Binary System)" };
        let questionMathStr = "";

        if (levelType === '1') {
            qObj.level = "⭐ 程度 1";
            // 題型：二進制 轉 十進制 (A * 2^n + B)
            let A = getRandomInt(1, 8) * 2 + 1; // 產生 3 到 15 的單數
            let B = getRandomInt(1, 16) * 2 + 1; // 產生 3 到 31 的單數
            let n = getRandomInt(8, 14); // 指數介於 8 到 13 之間
            
            let val = A * Math.pow(2, n) + B;
            let binStr = val.toString(2);
            questionMathStr = `${binStr}_2`;
            
            let correctStr = `${A} \\times 2^{${n}} + ${B}`;
            
            let binA = A.toString(2);
            let binB = B.toString(2);
            let zeros = n;
            
            let steps = [
                { text: `${binStr}_2`, hide: false },
                { text: `${binA + '0'.repeat(zeros)}_2 + ${binB}_2`, hide: true },
                { text: `${binA}_2 \\times 2^{${n}} + ${B}`, hide: false },
                { text: correctStr, hide: false }
            ];
            let eqCorrectHtml = wrapHint(msgCorrect, buildEq(steps));
            
            let w1 = `${A} \\times 2^{${n-1}} + ${B}`;
            let w2 = `${A} \\times 2^{${n+1}} + ${B}`;
            let w3 = `${A+1} \\times 2^{${n}} + ${B}`;
            
            let options = [
                { text: `\\( \\displaystyle ${correctStr} \\)`, isCorrect: true, hint: eqCorrectHtml },
                { text: `\\( \\displaystyle ${w1} \\)`, isCorrect: false, hint: wrapHint(msgBin1 + "<div class='text-sm text-slate-500 mb-2'>(提示：數數看中間隔了多少個 0)</div>", buildEq(steps)) },
                { text: `\\( \\displaystyle ${w2} \\)`, isCorrect: false, hint: wrapHint(msgBin1 + "<div class='text-sm text-slate-500 mb-2'>(提示：數數看中間隔了多少個 0)</div>", buildEq(steps)) },
                { text: `\\( \\displaystyle ${w3} \\)`, isCorrect: false, hint: wrapHint(msgBin1 + "<div class='text-sm text-slate-500 mb-2'>(提示：前面的位數組合錯誤了)</div>", buildEq(steps)) }
            ];
            
            qObj.options = shuffleArray(options).map((opt, idx) => ({...opt, id: String.fromCharCode(65 + idx)}));
            
        } else if (levelType === '2') {
            qObj.level = "⭐⭐ 程度 2";
            // 題型：十進制 轉 二進制 (A * 2^n + 2^m + B)
            let A = getRandomInt(1, 8) * 2 + 1; // 產生 3 到 15 的單數
            let n = getRandomInt(9, 13);
            let m = getRandomInt(4, 7);
            let B = getRandomInt(1, 4) * 2 + 1; // 產生 3 到 7 的單數
            
            let val = A * Math.pow(2, n) + Math.pow(2, m) + B;
            let correctStr = val.toString(2) + "_2";
            
            questionMathStr = `${A} \\times 2^{${n}} + 2^{${m}} + ${B}`;
            
            let binA = A.toString(2);
            let binB = B.toString(2);
            
            let steps = [
                { text: `${A} \\times 2^{${n}} + 2^{${m}} + ${B}`, hide: false },
                { text: `${binA}_2 \\times 2^{${n}} + 1${'0'.repeat(m)}_2 + ${binB}_2`, hide: true },
                { text: `${binA}${'0'.repeat(n)}_2 + 1${'0'.repeat(m)}_2 + ${binB}_2`, hide: true },
                { text: correctStr, hide: false }
            ];
            let eqCorrectHtml = wrapHint(msgCorrect, buildEq(steps));
            
            let valW1 = A * Math.pow(2, n-1) + Math.pow(2, m) + B;
            let valW2 = A * Math.pow(2, n) + Math.pow(2, m+1) + B;
            let valW3 = (A+1) * Math.pow(2, n) + Math.pow(2, m) + B;
            
            let options = [
                { text: `\\( \\displaystyle ${correctStr} \\)`, isCorrect: true, hint: eqCorrectHtml },
                { text: `\\( \\displaystyle ${valW1.toString(2)}_2 \\)`, isCorrect: false, hint: wrapHint(msgBin2 + "<div class='text-sm text-slate-500 mb-2'>(提示：留意第一項的指數展開後應有多少個 0)</div>", buildEq(steps)) },
                { text: `\\( \\displaystyle ${valW2.toString(2)}_2 \\)`, isCorrect: false, hint: wrapHint(msgBin2 + "<div class='text-sm text-slate-500 mb-2'>(提示：中間項的位值展開錯誤)</div>", buildEq(steps)) },
                { text: `\\( \\displaystyle ${valW3.toString(2)}_2 \\)`, isCorrect: false, hint: wrapHint(msgBin2 + "<div class='text-sm text-slate-500 mb-2'>(提示：前端的數字轉換出錯)</div>", buildEq(steps)) }
            ];
            
            qObj.options = shuffleArray(options).map((opt, idx) => ({...opt, id: String.fromCharCode(65 + idx)}));
            
        } else {
            qObj.level = "⭐⭐⭐ 程度 3";
            // 題型：十進制 轉 二進制，包含減法借位 (A * 2^n + B * 2^m - 2^k)
            let A = getRandomInt(1, 4) * 2 + 1; // 3 到 7
            let n = getRandomInt(11, 15);
            let B = getRandomInt(2, 6); // 2 到 5
            let m = getRandomInt(6, 9);
            let k = getRandomInt(2, 5); // 2 到 4
            
            let val = A * Math.pow(2, n) + B * Math.pow(2, m) - Math.pow(2, k);
            let correctStr = val.toString(2) + "_2";
            
            questionMathStr = `${A} \\times 2^{${n}} + ${B === 1 ? '' : B + ' \\times '} 2^{${m}} - 2^{${k}}`;
            
            let binA = A.toString(2);
            let subPart = B * Math.pow(2, m) - Math.pow(2, k);
            let subBin = subPart.toString(2);
            
            let steps = [
                { text: `${A} \\times 2^{${n}} + ${B === 1 ? '' : B + ' \\times '} 2^{${m}} - 2^{${k}}`, hide: false },
                { text: `${binA}${'0'.repeat(n)}_2 + ${B * Math.pow(2, m)} - ${Math.pow(2, k)}`, hide: true },
                { text: `${binA}${'0'.repeat(n)}_2 + ${subPart}`, hide: true },
                { text: `${binA}${'0'.repeat(n)}_2 + ${subBin}_2`, hide: true },
                { text: correctStr, hide: false }
            ];
            let eqCorrectHtml = wrapHint(msgCorrect, buildEq(steps));
            
            let valW1 = A * Math.pow(2, n) + B * Math.pow(2, m) + Math.pow(2, k); // 將減法錯看成加法
            let valW2 = A * Math.pow(2, n-1) + B * Math.pow(2, m) - Math.pow(2, k); // 首項移位錯誤
            let valW3 = val + Math.pow(2, k+1); // 經典的借位錯誤陷阱
            
            let options = [
                { text: `\\( \\displaystyle ${correctStr} \\)`, isCorrect: true, hint: eqCorrectHtml },
                { text: `\\( \\displaystyle ${valW1.toString(2)}_2 \\)`, isCorrect: false, hint: wrapHint(msgBin3 + "<div class='text-sm text-slate-500 mb-2'>(提示：這是減法，不是加法喔)</div>", buildEq(steps)) },
                { text: `\\( \\displaystyle ${valW2.toString(2)}_2 \\)`, isCorrect: false, hint: wrapHint(msgBin2 + "<div class='text-sm text-slate-500 mb-2'>(提示：最高位的展開移位錯誤)</div>", buildEq(steps)) },
                { text: `\\( \\displaystyle ${valW3.toString(2)}_2 \\)`, isCorrect: false, hint: wrapHint(msgBin3 + "<div class='text-sm text-slate-500 mb-2'>(提示：處理減法連續借位時出錯了)</div>", buildEq(steps)) }
            ];
            
            qObj.options = shuffleArray(options).map((opt, idx) => ({...opt, id: String.fromCharCode(65 + idx)}));
        }
        
        qObj.question = `
        <div class="mb-4 text-base sm:text-lg text-slate-600">化簡或轉換以下數式：</div>
        <div class="text-xl sm:text-2xl font-bold text-indigo-700 py-4 overflow-x-auto math-scroll whitespace-nowrap w-full">
            \\( \\displaystyle ${questionMathStr} \\)
        </div>`;
        
        bank.push(qObj);
    }
    return bank;
}
