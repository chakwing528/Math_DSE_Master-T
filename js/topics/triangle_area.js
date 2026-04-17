// js/topics/triangle_area.js

// ==========================================
// 三角形面積專用錯誤提示訊息
// ==========================================
const msgTriSAS = `<div class="text-red-600 font-bold text-lg mb-1">❗ 錯誤：已知兩邊及夾角，應使用 \\(\\frac{1}{2}ab\\sin C\\)</div>`;
const msgTriSSS = `<div class="text-red-600 font-bold text-lg mb-1">❗ 錯誤：已知三邊，應使用希羅公式 (Heron's formula)</div>`;
const msgTriCalc = `<div class="text-red-600 font-bold text-lg mb-1">❗ 計算錯誤：忘記乘以 \\(\\frac{1}{2}\\) 或忘記開根號</div>`;

// ==========================================
// 題目生成器：三角形的面積 (Area of Triangle)
// ==========================================
function generateTriangleAreaQuestions(num, levelPref) {
    const bank = [];

    for (let i = 0; i < num; i++) {
        // 按照老師要求，只有一個程度，單純計算面積
        let qObj = { id: i + 1, topic: "三角形面積 (Area of Triangle)", level: "⭐ 程度 1" };
        let questionMathStr = "";
        let options = [];
        let correctStr, w1, w2, w3;

        // 隨機決定題型：50% 機率出 SAS，50% 機率出 SSS
        let isSAS = Math.random() > 0.5;

        if (isSAS) {
            // ---------------------------------------------
            // 題型 A：SAS (使用 1/2 ab sinC)
            // ---------------------------------------------
            let a = getRandomInt(4, 16);
            let b = getRandomInt(4, 16);
            let angle = getRandomInt(3, 15) * 10; // 產生 30, 40, ..., 140 度的角
            if (angle === 90) angle = 85; // 刻意避開 90 度，強迫使用 sin
            let rad = angle * Math.PI / 180;

            let area = 0.5 * a * b * Math.sin(rad);
            correctStr = area.toPrecision(3);

            questionMathStr = `\\text{已知 } \\triangle ABC \\text{ 中，} a = ${a} \\text{ cm}, b = ${b} \\text{ cm}, \\angle C = ${angle}^\\circ \\text{。}`;

            let steps = [
                { text: `\\text{已知兩邊及其夾角，使用面積公式：} \\frac{1}{2}ab\\sin C`, hide: false },
                { text: `\\text{面積} = \\frac{1}{2}(${a})(${b})\\sin ${angle}^\\circ`, hide: false },
                { text: `\\approx ${correctStr} \\text{ cm}^2`, hide: false }
            ];
            let eqCorrectHtml = wrapHint(msgCorrect, buildEq(steps));

            // 產生誘答項 (Distractors)
            w1 = (a * b * Math.sin(rad)).toPrecision(3); // 忘記乘 1/2
            w2 = (0.5 * a * b * Math.abs(Math.cos(rad))).toPrecision(3); // 錯用 cos
            w3 = (0.5 * a * b).toPrecision(3); // 忘記乘 sin C (當成直角三角形)

            options.push({ text: `\\( \\displaystyle ${correctStr} \\text{ cm}^2 \\)`, isCorrect: true, hint: eqCorrectHtml });
            options.push({ text: `\\( \\displaystyle ${w1} \\text{ cm}^2 \\)`, isCorrect: false, hint: wrapHint(msgTriCalc + "<div class='text-sm text-slate-500 mb-2'>(提示：公式前面要乘以 1/2)</div>", buildEq(steps)) });
            options.push({ text: `\\( \\displaystyle ${w2} \\text{ cm}^2 \\)`, isCorrect: false, hint: wrapHint(msgTriSAS + "<div class='text-sm text-slate-500 mb-2'>(提示：夾角的三角比是 sin，不是 cos 喔)</div>", buildEq(steps)) });
            options.push({ text: `\\( \\displaystyle ${w3} \\text{ cm}^2 \\)`, isCorrect: false, hint: wrapHint(msgTriSAS + "<div class='text-sm text-slate-500 mb-2'>(提示：這不是直角三角形，不要忘記乘以 sin C)</div>", buildEq(steps)) });

        } else {
            // ---------------------------------------------
            // 題型 B：SSS (使用希羅公式 Heron's Formula)
            // ---------------------------------------------
            let a = getRandomInt(5, 15);
            let b = getRandomInt(5, 15);
            let c;
            // 確保符合三角形不等式 (任意兩邊之和大於第三邊)
            do {
                c = getRandomInt(5, 15);
            } while (a + b <= c || a + c <= b || b + c <= a);

            let s = (a + b + c) / 2;
            let area2 = s * (s - a) * (s - b) * (s - c);
            let area = Math.sqrt(area2);
            correctStr = area.toPrecision(3);

            questionMathStr = `\\text{已知 } \\triangle PQR \\text{ 中，} p = ${a} \\text{ cm}, q = ${b} \\text{ cm}, r = ${c} \\text{ cm}\\text{。}`;

            let steps = [
                { text: `\\text{已知三邊長度，使用希羅公式 (Heron's Formula)}`, hide: false },
                { text: `s = \\frac{${a} + ${b} + ${c}}{2} = ${s}`, hide: false },
                { text: `\\text{面積} = \\sqrt{${s}(${s}-${a})(${s}-${b})(${s}-${c})}`, hide: false },
                { text: `\\approx ${correctStr} \\text{ cm}^2`, hide: false }
            ];
            let eqCorrectHtml = wrapHint(msgCorrect, buildEq(steps));

            // 產生誘答項 (Distractors)
            w1 = area2.toPrecision(3); // 忘記開根號
            let s_wrong = a + b + c; // 誤將周界當作半周界 s
            w2 = Math.sqrt(Math.abs(s_wrong * (s_wrong - a) * (s_wrong - b) * (s_wrong - c))).toPrecision(3);
            w3 = (0.5 * a * b).toPrecision(3); // 盲目使用 1/2 ab，亂抓兩條邊

            options.push({ text: `\\( \\displaystyle ${correctStr} \\text{ cm}^2 \\)`, isCorrect: true, hint: eqCorrectHtml });
            options.push({ text: `\\( \\displaystyle ${w1} \\text{ cm}^2 \\)`, isCorrect: false, hint: wrapHint(msgTriCalc + "<div class='text-sm text-slate-500 mb-2'>(提示：公式的最後一步記得要開根號 \\(\\sqrt{\\phantom{x}}\\) )</div>", buildEq(steps)) });
            options.push({ text: `\\( \\displaystyle ${w2} \\text{ cm}^2 \\)`, isCorrect: false, hint: wrapHint(msgTriSSS + "<div class='text-sm text-slate-500 mb-2'>(提示：s 代表「半周界」，即是周界除以 2)</div>", buildEq(steps)) });
            options.push({ text: `\\( \\displaystyle ${w3} \\text{ cm}^2 \\)`, isCorrect: false, hint: wrapHint(msgTriSAS + "<div class='text-sm text-slate-500 mb-2'>(提示：因為沒有提供角度，所以不能使用 \\(\\frac{1}{2}ab\\sin C\\)，必須使用希羅公式)</div>", buildEq(steps)) });
        }

        // 確保 4 個選項完全不重複，如果運氣不好重複了，則動態生成干擾項
        let texts = [];
        let finalOptions = [];
        options.forEach(opt => {
            if (!texts.includes(opt.text)) {
                texts.push(opt.text);
                finalOptions.push(opt);
            }
        });
        let fallback = 1;
        while(finalOptions.length < 4) {
            let fakeArea = (parseFloat(correctStr) + fallback * 2.5).toPrecision(3);
            let altText = `\\( \\displaystyle ${fakeArea} \\text{ cm}^2 \\)`;
            if (!texts.includes(altText)) {
                texts.push(altText);
                // 統一隨機塞入計算錯誤的提示
                finalOptions.push({ text: altText, isCorrect: false, hint: wrapHint(msgTriCalc, buildEq(steps)) });
            }
            fallback++;
        }

        // 打亂順序並指派 A, B, C, D
        qObj.options = shuffleArray(finalOptions).map((opt, idx) => ({...opt, id: String.fromCharCode(65 + idx)}));
        
        qObj.question = `
        <div class="mb-4 text-base sm:text-lg text-slate-600">求以下三角形的面積 (準確至三位有效數字)：</div>
        <div class="text-xl sm:text-2xl font-bold text-indigo-700 py-4 overflow-x-auto math-scroll whitespace-nowrap w-full">
            \\( \\displaystyle ${questionMathStr} \\)
        </div>`;

        bank.push(qObj);
    }
    return bank;
}
