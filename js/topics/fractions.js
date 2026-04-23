// js/topics/fractions.js

// ==========================================
// 通分母專屬錯誤提示訊息
// ==========================================
var msgFracSign = `<div class="text-red-600 font-bold text-lg mb-1">❗ 正負號或展開錯誤</div>`;

// ==========================================
// 題目生成器：通分母 (Algebraic Fractions) 
// ==========================================
function generateFractionsQuestions(num, levelPref) {
    const bank = [];
    const singleVars = ['x', 'y', 'k', 'n']; 
    
    for (let i = 0; i < num; i++) {
        let levelType = levelPref;
        if (levelPref === 'mixed') {
            const types = ['1', '2'];
            levelType = types[getRandomInt(0, types.length)];
        } else {
            levelType = String(levelPref);
        }
        
        let qObj = { id: i + 1, topic: "通分母 (Algebraic Fractions)" };
        const v = singleVars[getRandomInt(0, singleVars.length)];
        let questionMathStr = "";
        
        if (levelType === '1') {
            qObj.level = "⭐ 程度 1";
            let type = getRandomInt(0, 2); 
            
            if (type === 0) {
                let a = getRandomInt(1, 5);
                let b = getRandomInt(1, 8);
                while(gcd(a, b) !== 1) b++;
                let A = getRandomInt(1, 7);
                let B = getRandomInt(1, 7);
                let op = Math.random() > 0.5 ? 1 : -1;
                let opStr = op === 1 ? '+' : '-';
                
                // 修正 1y 的顯示問題，改為 y
                let aStr = a === 1 ? "" : a;
                let firstTermV = A*a === 1 ? v : `${A*a}${v}`;
                let secondTermV = op*B*a === 1 ? `+ ${v}` : (op*B*a === -1 ? `- ${v}` : `${fmtC(op*B*a)}${v}`);
                
                let term1, term2;
                if (Math.random() > 0.5) {
                    term1 = `\\frac{${A}}{${aStr}${v} + ${b}}`;
                    term2 = `\\frac{${B}}{${aStr}${v} - ${b}}`;
                    questionMathStr = `${term1} ${opStr} ${term2}`;
                    
                    // 🌟 重大修復：A(ax-b) + B(ax+b) -> 常數項為 -Ab + Bb
                    let vCoef = A*a + op*B*a;
                    let cTerm = -A*b + op*B*b; 
                    
                    let vCoefW1 = A*a - op*B*a;
                    let cTermW1 = A*b + op*B*b;
                    
                    let numCorrect = fmtPoly1(vCoef, cTerm, v);
                    let denom = a === 1 ? `${v}^2 - ${b*b}` : `${a*a}${v}^2 - ${b*b}`;
                    let correctStr = `\\frac{${numCorrect}}{${denom}}`;
                    
                    let steps = [
                        { text: `${term1} ${opStr} ${term2}`, hide: false },
                        { text: `\\frac{${A}(${aStr}${v} - ${b})}{(${aStr}${v} + ${b})(${aStr}${v} - ${b})} ${opStr} \\frac{${B}(${aStr}${v} + ${b})}{(${aStr}${v} + ${b})(${aStr}${v} - ${b})}`, hide: false },
                        { text: `\\frac{${A}(${aStr}${v} - ${b}) ${opStr} ${B}(${aStr}${v} + ${b})}{(${aStr}${v} + ${b})(${aStr}${v} - ${b})}`, hide: false },
                        { text: `\\frac{${firstTermV} - ${A*b} ${secondTermV} ${fmtC(op*B*b)}}{${denom}}`, hide: false },
                        { text: correctStr, hide: false }
                    ];
                    let eqCorrectHtml = wrapHint(msgCorrect, buildEq(steps));
                    
                    let numW1 = fmtPoly1(vCoefW1, cTermW1, v);
                    let numW2 = fmtPoly1(vCoef, -cTerm, v);
                    let numW3 = fmtPoly1(vCoefW1, -cTermW1, v);
                    
                    let options = [
                        { text: `\\( \\displaystyle ${correctStr} \\)`, isCorrect: true, hint: eqCorrectHtml },
                        { text: `\\( \\displaystyle \\frac{${numW1}}{${denom}} \\)`, isCorrect: false, hint: wrapHint(msgFracSign + "<div class='text-sm text-slate-500 mb-2'>(提示：小心展開括號時的符號變化)</div>", buildEq(steps)) },
                        { text: `\\( \\displaystyle \\frac{${numW2}}{${denom}} \\)`, isCorrect: false, hint: wrapHint(msgFracSign + "<div class='text-sm text-slate-500 mb-2'>(提示：留意常數項的加減)</div>", buildEq(steps)) },
                        { text: `\\( \\displaystyle \\frac{${numW3}}{${denom}} \\)`, isCorrect: false, hint: wrapHint(msgFracSign + "<div class='text-sm text-slate-500 mb-2'>(提示：分子展開計算錯誤)</div>", buildEq(steps)) }
                    ];
                    
                    let texts = [];
                    let finalOptions = [];
                    options.forEach(opt => {
                        if (!texts.includes(opt.text)) {
                            texts.push(opt.text);
                            finalOptions.push(opt);
                        }
                    });
                    while(finalOptions.length < 4) {
                        let cTermAlt = cTerm + getRandomInt(1, 5) * (Math.random() > 0.5 ? 1 : -1);
                        let altText = `\\( \\displaystyle \\frac{${fmtPoly1(vCoef, cTermAlt, v)}}{${denom}} \\)`;
                        if (!texts.includes(altText)) {
                            texts.push(altText);
                            finalOptions.push({ text: altText, isCorrect: false, hint: wrapHint(msgFracSign, buildEq(steps)) });
                        }
                    }
                    
                    qObj.options = shuffleArray(finalOptions).map((opt, idx) => ({...opt, id: String.fromCharCode(65 + idx)}));
                } else {
                    term1 = `\\frac{${A}}{${aStr}${v} - ${b}}`;
                    term2 = `\\frac{${B}}{${aStr}${v} + ${b}}`;
                    questionMathStr = `${term1} ${opStr} ${term2}`;
                    
                    let vCoef = A*a + op*B*a;
                    let cTerm = A*b - op*B*b; 
                    
                    let vCoefW1 = A*a - op*B*a;
                    let cTermW1 = A*b + op*B*b;
                    
                    let numCorrect = fmtPoly1(vCoef, cTerm, v);
                    let denom = a === 1 ? `${v}^2 - ${b*b}` : `${a*a}${v}^2 - ${b*b}`;
                    let correctStr = `\\frac{${numCorrect}}{${denom}}`;
                    
                    let steps = [
                        { text: `${term1} ${opStr} ${term2}`, hide: false },
                        { text: `\\frac{${A}(${aStr}${v} + ${b})}{(${aStr}${v} - ${b})(${aStr}${v} + ${b})} ${opStr} \\frac{${B}(${aStr}${v} - ${b})}{(${aStr}${v} - ${b})(${aStr}${v} + ${b})}`, hide: false },
                        { text: `\\frac{${A}(${aStr}${v} + ${b}) ${opStr} ${B}(${aStr}${v} - ${b})}{(${aStr}${v} - ${b})(${aStr}${v} + ${b})}`, hide: false },
                        { text: `\\frac{${firstTermV} + ${A*b} ${secondTermV} ${fmtC(-op*B*b)}}{${denom}}`, hide: false },
                        { text: correctStr, hide: false }
                    ];
                    let eqCorrectHtml = wrapHint(msgCorrect, buildEq(steps));

                    let numW1 = fmtPoly1(vCoefW1, cTermW1, v);
                    let numW2 = fmtPoly1(vCoef, -cTerm, v);
                    let numW3 = fmtPoly1(vCoefW1, -cTermW1, v);
                    
                    let options = [
                        { text: `\\( \\displaystyle ${correctStr} \\)`, isCorrect: true, hint: eqCorrectHtml },
                        { text: `\\( \\displaystyle \\frac{${numW1}}{${denom}} \\)`, isCorrect: false, hint: wrapHint(msgFracSign + "<div class='text-sm text-slate-500 mb-2'>(提示：小心展開括號時的符號變化)</div>", buildEq(steps)) },
                        { text: `\\( \\displaystyle \\frac{${numW2}}{${denom}} \\)`, isCorrect: false, hint: wrapHint(msgFracSign + "<div class='text-sm text-slate-500 mb-2'>(提示：留意常數項的加減)</div>", buildEq(steps)) },
                        { text: `\\( \\displaystyle \\frac{${numW3}}{${denom}} \\)`, isCorrect: false, hint: wrapHint(msgFracSign + "<div class='text-sm text-slate-500 mb-2'>(提示：分子展開計算錯誤)</div>", buildEq(steps)) }
                    ];
                    
                    let texts = [];
                    let finalOptions = [];
                    options.forEach(opt => {
                        if (!texts.includes(opt.text)) { texts.push(opt.text); finalOptions.push(opt); }
                    });
                    while(finalOptions.length < 4) {
                        let cTermAlt = cTerm + getRandomInt(1, 5) * (Math.random() > 0.5 ? 1 : -1);
                        let altText = `\\( \\displaystyle \\frac{${fmtPoly1(vCoef, cTermAlt, v)}}{${denom}} \\)`;
                        if (!texts.includes(altText)) { texts.push(altText); finalOptions.push({ text: altText, isCorrect: false, hint: wrapHint(msgFracSign, buildEq(steps)) }); }
                    }
                    
                    qObj.options = shuffleArray(finalOptions).map((opt, idx) => ({...opt, id: String.fromCharCode(65 + idx)}));
                }
                
            } else {
                let A = getRandomInt(2, 9);
                let B = getRandomInt(2, 9);
                while(A === B) B = getRandomInt(2, 9);
                
                questionMathStr = `\\frac{${A}}{${v} - ${A}} - \\frac{${B}}{${v} - ${B}}`;
                
                let vCoef = A - B;
                let cTerm = -A*B + B*A; // 總是 0
                
                let numCorrect = fmtPoly1(vCoef, cTerm, v); // 例如 "2n"
                let denomCorrect = `(${v} - ${A})(${v} - ${B})`;
                
                let correctStr = `\\frac{${numCorrect}}{${denomCorrect}}`;
                
                let steps = [
                    { text: `\\frac{${A}}{${v} - ${A}} - \\frac{${B}}{${v} - ${B}}`, hide: false },
                    { text: `\\frac{${A}(${v} - ${B})}{(${v} - ${A})(${v} - ${B})} - \\frac{${B}(${v} - ${A})}{(${v} - ${A})(${v} - ${B})}`, hide: false },
                    { text: `\\frac{${A}(${v} - ${B}) - ${B}(${v} - ${A})}{(${v} - ${A})(${v} - ${B})}`, hide: false },
                    { text: `\\frac{${A}${v} - ${A*B} - ${B}${v} + ${A*B}}{(${v} - ${A})(${v} - ${B})}`, hide: false }
                ];
                
                if (vCoef < 0) {
                    let unsimplifiedStr = `\\frac{${A-B}${v}}{(${v} - ${A})(${v} - ${B})}`;
                    steps.push({ text: unsimplifiedStr, hide: false });
                    correctStr = `\\frac{${-vCoef}${v}}{(${v} - ${A})(${B} - ${v})}`;
                    steps.push({ text: correctStr, hide: false });
                } else {
                    steps.push({ text: correctStr, hide: false });
                }
                
                let eqCorrectHtml = wrapHint(msgCorrect, buildEq(steps));
                
                let w1 = `\\frac{${fmtPoly1(A+B, 0, v)}}{(${v} - ${A})(${v} - ${B})}`;
                let w2 = `\\frac{${fmtPoly1(-vCoef, 0, v)}}{(${v} - ${A})(${v} - ${B})}`; 
                let w3 = `\\frac{${fmtPoly1(A-B, -2*A*B, v)}}{(${v} - ${A})(${v} - ${B})}`;
                if (vCoef < 0) {
                    w1 = `\\frac{${fmtPoly1(A+B, 0, v)}}{(${v} - ${A})(${B} - ${v})}`;
                    w2 = `\\frac{${fmtPoly1(vCoef, 0, v)}}{(${v} - ${A})(${B} - ${v})}`;
                    w3 = `\\frac{${fmtPoly1(A-B, -2*A*B, v)}}{(${v} - ${A})(${B} - ${v})}`;
                }
                
                let options = [
                    { text: `\\( \\displaystyle ${correctStr} \\)`, isCorrect: true, hint: eqCorrectHtml },
                    { text: `\\( \\displaystyle ${w1} \\)`, isCorrect: false, hint: wrapHint(msgFracSign + "<div class='text-sm text-slate-500 mb-2'>(提示：負負得正喔)</div>", buildEq(steps)) },
                    { text: `\\( \\displaystyle ${w2} \\)`, isCorrect: false, hint: wrapHint(msgFracSign + "<div class='text-sm text-slate-500 mb-2'>(提示：小心分子相減的正負號)</div>", buildEq(steps)) },
                    { text: `\\( \\displaystyle ${w3} \\)`, isCorrect: false, hint: wrapHint(msgFracSign + "<div class='text-sm text-slate-500 mb-2'>(提示：常數項抵銷了喔)</div>", buildEq(steps)) }
                ];
                
                let texts = [];
                let finalOptions = [];
                options.forEach(opt => {
                    if (!texts.includes(opt.text)) { texts.push(opt.text); finalOptions.push(opt); }
                });
                while(finalOptions.length < 4) {
                    let vCoefAlt = vCoef + getRandomInt(1, 5) * (Math.random() > 0.5 ? 1 : -1);
                    let altText = `\\( \\displaystyle \\frac{${vCoefAlt}${v}}{(${v} - ${A})(${v} - ${B})} \\)`;
                    if (!texts.includes(altText)) { texts.push(altText); finalOptions.push({ text: altText, isCorrect: false, hint: wrapHint(msgFracSign, buildEq(steps)) }); }
                }
                
                qObj.options = shuffleArray(finalOptions).map((opt, idx) => ({...opt, id: String.fromCharCode(65 + idx)}));
            }
            
        } else if (levelType === '2') {
            qObj.level = "⭐⭐ 程度 2";
            const v = singleVars[getRandomInt(0, singleVars.length)];
            let a = getRandomInt(1, 6);
            let A = getRandomInt(1, 5);
            let B = getRandomInt(1, 5);
            let op = Math.random() > 0.5 ? 1 : -1;
            let opStr = op === 1 ? '+' : '-';
            
            let aSq = a*a;
            let denom1 = `${v}^2 - ${aSq}`;
            let denom2 = `${v}^2 ${fmtC(-2*a)}${v} + ${aSq}`;
            
            questionMathStr = `\\frac{${A}}{${denom1}} ${opStr} \\frac{${B}}{${denom2}}`;
            
            // 🌟 重大修復：A(v-a) + opB(v+a) = (A+opB)v + (-Aa+opBa)
            let vCoef = A + op*B; 
            let cTerm = -A*a + op*B*a; 
            let numCorrect = fmtPoly1(vCoef, cTerm, v);
            let denomCorrect = `(${v} - ${a})^2(${v} + ${a})`;
            let correctStr = `\\frac{${numCorrect}}{${denomCorrect}}`;
            
            let firstTermV = A === 1 ? v : `${A}${v}`;
            let secondTermV = op*B === 1 ? `+ ${v}` : (op*B === -1 ? `- ${v}` : `${fmtC(op*B)}${v}`);

            let steps = [
                { text: `\\frac{${A}}{${denom1}} ${opStr} \\frac{${B}}{${denom2}}`, hide: false },
                { text: `\\frac{${A}}{(${v} - ${a})(${v} + ${a})} ${opStr} \\frac{${B}}{(${v} - ${a})^2}`, hide: false },
                { text: `\\frac{${A}(${v} - ${a})}{(${v} - ${a})^2(${v} + ${a})} ${opStr} \\frac{${B}(${v} + ${a})}{(${v} - ${a})^2(${v} + ${a})}`, hide: false },
                { text: `\\frac{${A}(${v} - ${a}) ${opStr} ${B}(${v} + ${a})}{(${v} - ${a})^2(${v} + ${a})}`, hide: false },
                { text: `\\frac{${firstTermV} - ${A*a} ${secondTermV} ${fmtC(op*B*a)}}{(${v} - ${a})^2(${v} + ${a})}`, hide: false },
                { text: correctStr, hide: false }
            ];
            let eqCorrectHtml = wrapHint(msgCorrect, buildEq(steps));
            
            // 同步修正干擾項的正負號變化
            let numW1 = fmtPoly1(A - op*B, -A*a - op*B*a, v);
            let numW2 = fmtPoly1(A + op*B, A*a + op*B*a, v);
            let numW3 = fmtPoly1(A - op*B, A*a - op*B*a, v);
            
            let options = [
                { text: `\\( \\displaystyle ${correctStr} \\)`, isCorrect: true, hint: eqCorrectHtml },
                { text: `\\( \\displaystyle \\frac{${numW1}}{${denomCorrect}} \\)`, isCorrect: false, hint: wrapHint(msgFracSign + "<div class='text-sm text-slate-500 mb-2'>(提示：通分母時小心補乘的項和符號)</div>", buildEq(steps)) },
                { text: `\\( \\displaystyle \\frac{${numW2}}{${denomCorrect}} \\)`, isCorrect: false, hint: wrapHint(msgFracSign + "<div class='text-sm text-slate-500 mb-2'>(提示：分子展開時常數項計算錯誤)</div>", buildEq(steps)) },
                { text: `\\( \\displaystyle \\frac{${numW3}}{${denomCorrect}} \\)`, isCorrect: false, hint: wrapHint(msgFracSign + "<div class='text-sm text-slate-500 mb-2'>(提示：分子展開計算錯誤)</div>", buildEq(steps)) }
            ];
            
            let texts = [];
            let finalOptions = [];
            options.forEach(opt => {
                if (!texts.includes(opt.text)) { texts.push(opt.text); finalOptions.push(opt); }
            });
            while(finalOptions.length < 4) {
                let cTermAlt = cTerm + getRandomInt(1, 5) * (Math.random() > 0.5 ? a : -a);
                let altText = `\\( \\displaystyle \\frac{${fmtPoly1(vCoef, cTermAlt, v)}}{${denomCorrect}} \\)`;
                if (!texts.includes(altText)) { texts.push(altText); finalOptions.push({ text: altText, isCorrect: false, hint: wrapHint(msgFracSign, buildEq(steps)) }); }
            }
            
            qObj.options = shuffleArray(finalOptions).map((opt, idx) => ({...opt, id: String.fromCharCode(65 + idx)}));
        }
        
        qObj.question = `
        <div class="mb-4 text-base sm:text-lg text-slate-600">化簡以下數式：</div>
        <div class="text-xl sm:text-2xl font-bold text-indigo-700 py-4 overflow-x-auto math-scroll whitespace-nowrap w-full">
            \\( \\displaystyle ${questionMathStr} \\)
        </div>`;
        
        bank.push(qObj);
    }
    return bank;
}
