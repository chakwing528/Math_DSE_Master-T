// js/topics/identities.js

// ==========================================
// 恆等式專屬錯誤提示訊息
// ==========================================
const msgIden = `<div class="text-red-600 font-bold text-lg mb-1">❗ 恆等式概念錯誤</div>`;
const msgRatio = `<div class="text-red-600 font-bold text-lg mb-1">❗ 比例計算錯誤</div>`;

// ==========================================
// 題目生成器：恆等式 (Identities) 
// ==========================================
function generateIdentitiesQuestions(num, levelPref) {
    const bank = [];
    for (let i = 0; i < num; i++) {
        let levelType = levelPref;
        if (levelPref === 'mixed') {
            const types = ['1', '2', '3'];
            levelType = types[getRandomInt(0, types.length)];
        } else {
            levelType = String(levelPref);
        }
        
        let qObj = { id: i + 1, topic: "恆等式 (Identities)" };
        
        if (levelType === '1') {
            qObj.level = "⭐ 程度 1";
            let d = getRandomInt(2, 7);
            let b = getRandomInt(-6, 7); if(b === 0) b = 2;
            let c = getRandomInt(-8, 9); if(c === 0) c = 3;
            let e = d * b + c;
            
            let bStr = fmtC(b);
            let eStr = fmtC(e);
            
            qObj.question = `
                <div class="mb-4 text-base sm:text-lg text-slate-600 leading-relaxed whitespace-normal">若 \\( a \\) 及 \\( c \\) 均為常數使得：</div>
                <div class="text-xl sm:text-2xl font-bold text-indigo-700 py-4 overflow-x-auto math-scroll whitespace-nowrap w-full">
                    \\( \\displaystyle a(x ${bStr}) + c \\equiv ${d}x ${eStr} \\)
                </div>
                <div class="mt-4 text-base sm:text-lg text-slate-600">則 \\( c = \\) ？</div>
            `;
            
            let correctStr = `${c}`;
            let w1 = `${e + d * b}`;
            let w2 = `${d * b}`;
            let w3 = `${e}`;
            
            let eqCorrectHtml = `
                <div class="text-left w-full text-base sm:text-lg">
                    <div class="my-2 font-bold text-indigo-600 border-b border-indigo-200 pb-1">方法一：代入法 (Substitution)</div>
                    <div class="my-2">為快速消除含括號的 \\( a \\)，我們可以代入 \\( x = ${-b} \\)。</div>
                    <div class="my-2">
                        左方：\\( a(${-b} ${b > 0 ? '+' : '-'} ${Math.abs(b)}) + c = a(0) + c = c \\)
                    </div>
                    <div class="my-2">
                        右方：\\( ${d}(${-b}) ${e > 0 ? '+' : '-'} ${Math.abs(e)} = ${d * (-b)} ${e > 0 ? '+' : '-'} ${Math.abs(e)} = ${e - d * b} \\)
                    </div>
                    <div class="my-3 font-bold text-indigo-700">因此，\\( c = ${c} \\)</div>

                    <div class="mt-5 mb-2 font-bold text-indigo-600 border-b border-indigo-200 pb-1">方法二：比較係數法 (Comparing Coefficients)</div>
                    <div class="my-2">展開左方：\\( ax ${b > 0 ? '+' : '-'} ${Math.abs(b)}a + c \\)</div>
                    <div class="my-2">比較 \\( x \\) 的係數：\\( a = ${d} \\)</div>
                    <div class="my-2">比較常數項：\\( ${b}a + c = ${e} \\)</div>
                    <div class="my-2">代入 \\( a=${d} \\)：\\( ${b}(${d}) + c = ${e} \\implies ${b*d} + c = ${e} \\)</div>
                    <div class="my-3 font-bold text-indigo-700">得出：\\( c = ${c} \\)</div>
                </div>
            `;
            
            let options = [
                { text: `\\( \\displaystyle ${correctStr} \\)`, isCorrect: true, hint: wrapHint(msgCorrect, eqCorrectHtml) },
                { text: `\\( \\displaystyle ${w1} \\)`, isCorrect: false, hint: wrapHint(msgIden + "<div class='text-sm text-slate-500 mb-2'>(提示：試試代入特定的 \\( x \\) 數值來消除 \\( a \\))</div>", eqCorrectHtml) },
                { text: `\\( \\displaystyle ${w2} \\)`, isCorrect: false, hint: wrapHint(msgIden + "<div class='text-sm text-slate-500 mb-2'>(提示：試試代入特定的 \\( x \\) 數值來消除 \\( a \\))</div>", eqCorrectHtml) },
                { text: `\\( \\displaystyle ${w3} \\)`, isCorrect: false, hint: wrapHint(msgIden + "<div class='text-sm text-slate-500 mb-2'>(提示：常數項包含了展開括號後的數字，不僅僅是 \\( c \\))</div>", eqCorrectHtml) }
            ];
            qObj.options = shuffleArray(options).map((opt, idx) => ({...opt, id: String.fromCharCode(65 + idx)}));
            
        } else if (levelType === '2') {
            qObj.level = "⭐⭐ 程度 2";
            let a_val = getRandomInt(-4, 5); if (a_val === 0) a_val = 2;
            let K2 = getRandomInt(2, 6);
            let K1 = a_val * (K2 - 1);
            let K3 = getRandomInt(-5, 6); if (K3 === 0) K3 = 3;
            let b_val = (K1 * K1) + K2 * a_val * (-K1 + K3);
            
            qObj.question = `
                <div class="mb-4 text-base sm:text-lg text-slate-600 leading-relaxed whitespace-normal">若 \\( a \\) 及 \\( b \\) 均為常數使得：</div>
                <div class="text-xl sm:text-2xl font-bold text-indigo-700 py-4 overflow-x-auto math-scroll whitespace-nowrap w-full">
                    \\( \\displaystyle (x ${fmtC(K1)})(x + a) + b \\equiv x^2 ${fmtB(K2, 'a')}(x ${fmtC(K3)}) \\)
                </div>
                <div class="mt-4 text-base sm:text-lg text-slate-600">則 \\( b = \\) ？</div>
            `;
            
            let correctStr = `${b_val}`;
            let w1 = `${-b_val}`;
            let w2 = `${b_val + a_val}`;
            let w3 = `${b_val - K1}`;
            if(w1 === correctStr) w1 = `${b_val + 1}`;
            if(w2 === correctStr || w2 === w1) w2 = `${b_val - 2}`;
            if(w3 === correctStr || w3 === w1 || w3 === w2) w3 = `${b_val + K2}`;
            
            let eqCorrectHtml = `
                <div class="text-left w-full text-base sm:text-lg">
                    <div class="my-2 font-bold text-indigo-600 border-b border-indigo-200 pb-1">方法一：混合法 (比較係數 + 代入法)</div>
                    <div class="my-2">1. 先比較兩邊 \\( x \\) 的係數找出 \\( a \\)：</div>
                    <div class="my-2 pl-4">左方 \\( x \\) 係數 = \\( ${K1} + a \\)<br>右方 \\( x \\) 係數 = \\( ${K2}a \\)</div>
                    <div class="my-2 pl-4">\\( ${K1} + a = ${K2}a \\implies ${K2-1}a = ${K1} \\implies a = ${a_val} \\)</div>
                    
                    <div class="my-2 mt-3">2. 代入數值求 \\( b \\)：</div>
                    <div class="my-2 pl-4">為消除左邊含有 \\( (x ${fmtC(K1)}) \\) 的複雜項，代入 \\( x = ${-K1} \\)。</div>
                    <div class="my-2 pl-4">左方：\\( 0 + b = b \\)</div>
                    <div class="my-2 pl-4">
                        右方：代入 \\( x = ${-K1} \\) 及 \\( a = ${a_val} \\)<br>
                        \\( (${-K1})^2 ${fmtB(K2, '(' + a_val + ')')} (${-K1} ${fmtC(K3)}) \\)<br>
                        \\( = ${K1*K1} + (${K2 * a_val})(${K3 - K1}) = ${b_val} \\)
                    </div>
                    <div class="my-3 font-bold text-indigo-700">得出：\\( b = ${b_val} \\)</div>

                    <div class="mt-5 mb-2 font-bold text-indigo-600 border-b border-indigo-200 pb-1">方法二：純比較係數法 (展開)</div>
                    <div class="my-2">展開左方：\\( x^2 + (${K1} + a)x + ${K1}a + b \\)</div>
                    <div class="my-2">展開右方：\\( x^2 + ${K2}ax + ${K2*K3}a \\)</div>
                    <div class="my-2">比較 \\( x \\) 的係數：\\( ${K1} + a = ${K2}a \\implies a = ${a_val} \\)</div>
                    <div class="my-2">比較常數項：\\( ${K1}a + b = ${K2*K3}a \\)</div>
                    <div class="my-2">代入 \\( a = ${a_val} \\)：\\( ${K1}(${a_val}) + b = ${K2*K3}(${a_val}) \\)</div>
                    <div class="my-2">\\( ${K1*a_val} + b = ${K2*K3*a_val} \\)</div>
                    <div class="my-3 font-bold text-indigo-700">得出：\\( b = ${b_val} \\)</div>
                </div>
            `;
            
            let options = [
                { text: `\\( \\displaystyle ${correctStr} \\)`, isCorrect: true, hint: wrapHint(msgCorrect, eqCorrectHtml) },
                { text: `\\( \\displaystyle ${w1} \\)`, isCorrect: false, hint: wrapHint(msgIden + "<div class='text-sm text-slate-500 mb-2'>(提示：試試用代入法 (Substitution) 消除多餘變數)</div>", eqCorrectHtml) },
                { text: `\\( \\displaystyle ${w2} \\)`, isCorrect: false, hint: wrapHint(msgIden + "<div class='text-sm text-slate-500 mb-2'>(提示：小心比較係數時忽略了常數項的展開)</div>", eqCorrectHtml) },
                { text: `\\( \\displaystyle ${w3} \\)`, isCorrect: false, hint: wrapHint(msgIden + "<div class='text-sm text-slate-500 mb-2'>(提示：先找出 \\( a \\)，再代入適合的 \\( x \\) 值)</div>", eqCorrectHtml) }
            ];
            qObj.options = shuffleArray(options).map((opt, idx) => ({...opt, id: String.fromCharCode(65 + idx)}));

        } else {
            qObj.level = "⭐⭐⭐ 程度 3";
            let P = getRandomInt(2, 6);
            let K1 = getRandomInt(2, 6);
            let K2 = getRandomInt(2, 7);
            let K3 = getRandomInt(2, 7);
            if (K2 === K3) K2++;
            
            let a_ratio = K3;
            let b_ratio = K1 * K3;
            let c_ratio = K2;
            
            let g = gcd3(a_ratio, b_ratio, c_ratio);
            let A = a_ratio / g;
            let B = b_ratio / g;
            let C = c_ratio / g;
            
            qObj.question = `
                <div class="mb-4 text-base sm:text-lg text-slate-600 leading-relaxed whitespace-normal">若 \\( a \\)、\\( b \\) 及 \\( c \\) 均為非零的常數使得：</div>
                <div class="text-xl sm:text-2xl font-bold text-indigo-700 py-4 overflow-x-auto math-scroll whitespace-nowrap w-full">
                    \\( \\displaystyle ${P}x^2 ${fmtB(K1, 'ax')} ${fmtB(K2, 'a')} \\equiv x(${P}x + b) ${fmtB(K3, 'c')} \\)
                </div>
                <div class="mt-4 text-base sm:text-lg text-slate-600">則 \\( a : b : c = \\) ？</div>
            `;
            
            let correctStr = `${A} : ${B} : ${C}`;
            
            let optionsList = [correctStr];
            let attempts = 0;
            while(optionsList.length < 4 && attempts < 20) {
                attempts++;
                let r = getRandomInt(0, 5);
                let opt = "";
                if (r === 0) opt = `${B} : ${A} : ${C}`;
                else if (r === 1) opt = `${A} : ${C} : ${B}`;
                else if (r === 2) opt = `${C} : ${B} : ${A}`;
                else if (r === 3) opt = `${A*2} : ${B} : ${C}`;
                else opt = `${A} : ${B*2} : ${C}`;
                if (!optionsList.includes(opt)) optionsList.push(opt);
            }
            let fallback = 1;
            while(optionsList.length < 4) {
                let opt = `${A+fallback} : ${B} : ${C}`;
                if (!optionsList.includes(opt)) optionsList.push(opt);
                fallback++;
            }

            let eqCorrectHtml = `
                <div class="text-left w-full text-base sm:text-lg">
                    <div class="my-2 font-bold text-indigo-600 border-b border-indigo-200 pb-1">方法一：代入法 + 比較係數</div>
                    <div class="my-2">1. 尋找 \\( a \\) 與 \\( c \\) 的關係：</div>
                    <div class="my-2 pl-4">為了消除含 \\( x \\) 的項，我們直接代入 \\( x = 0 \\)。</div>
                    <div class="my-2 pl-4">左方：\\( ${K2}a \\) <br> 右方：\\( ${K3}c \\)</div>
                    <div class="my-2 pl-4">\\( ${K2}a = ${K3}c \\implies \\frac{a}{c} = \\frac{${K3}}{${K2}} \\implies a : c = ${K3} : ${K2} \\)</div>
                    
                    <div class="my-2 mt-3">2. 尋找 \\( a \\) 與 \\( b \\) 的關係：</div>
                    <div class="my-2 pl-4">比較兩邊 \\( x \\) 的係數。</div>
                    <div class="my-2 pl-4">左方 \\( x \\) 係數 = \\( ${K1}a \\) <br> 右方 \\( x \\) 係數 = \\( b \\)</div>
                    <div class="my-2 pl-4">\\( b = ${K1}a \\implies \\frac{a}{b} = \\frac{1}{${K1}} \\implies a : b = 1 : ${K1} = ${K3} : ${K1*K3} \\)</div>
                    
                    <div class="my-3 font-bold text-indigo-700">組合比例：\\( a : b : c = ${K3} : ${K1*K3} : ${K2} = ${A} : ${B} : ${C} \\)</div>

                    <div class="mt-5 mb-2 font-bold text-indigo-600 border-b border-indigo-200 pb-1">方法二：純比較係數法 (展開)</div>
                    <div class="my-2">展開右方：\\( ${P}x^2 + bx + ${K3}c \\)</div>
                    <div class="my-2">比較 \\( x \\) 的係數：\\( ${K1}a = b \\implies b = ${K1}a \\)</div>
                    <div class="my-2">比較常數項：\\( ${K2}a = ${K3}c \\implies c = \\frac{${K2}}{${K3}}a \\)</div>
                    <div class="my-2">\\( a : b : c = a : ${K1}a : \\frac{${K2}}{${K3}}a \\)</div>
                    <div class="my-2">約去 \\( a \\) 並同乘 \\( ${K3} \\)：\\( ${K3} : ${K1*K3} : ${K2} \\)</div>
                    <div class="my-3 font-bold text-indigo-700">化簡得：\\( ${A} : ${B} : ${C} \\)</div>
                </div>
            `;
            
            let options = [
                { text: `\\( \\displaystyle ${optionsList[0]} \\)`, isCorrect: true, hint: wrapHint(msgCorrect, eqCorrectHtml) },
                { text: `\\( \\displaystyle ${optionsList[1]} \\)`, isCorrect: false, hint: wrapHint(msgRatio + "<div class='text-sm text-slate-500 mb-2'>(提示：將 \\( b \\) 和 \\( c \\) 都用 \\( a \\) 表示，再尋找公倍數)</div>", eqCorrectHtml) },
                { text: `\\( \\displaystyle ${optionsList[2]} \\)`, isCorrect: false, hint: wrapHint(msgRatio + "<div class='text-sm text-slate-500 mb-2'>(提示：將 \\( b \\) 和 \\( c \\) 都用 \\( a \\) 表示，再尋找公倍數)</div>", eqCorrectHtml) },
                { text: `\\( \\displaystyle ${optionsList[3]} \\)`, isCorrect: false, hint: wrapHint(msgRatio + "<div class='text-sm text-slate-500 mb-2'>(提示：代入 \\( x=0 \\) 可以立即找出 \\( a \\) 和 \\( c \\) 的關係)</div>", eqCorrectHtml) }
            ];
            qObj.options = shuffleArray(options).map((opt, idx) => ({...opt, id: String.fromCharCode(65 + idx)}));
        }
        bank.push(qObj);
    }
    return bank;
}
