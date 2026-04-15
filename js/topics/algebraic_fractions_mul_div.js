// js/topics/algebraic_fractions_mul_div.js

// ==========================================
// 專屬錯誤提示訊息
// ==========================================
const msgFracMulDiv1 = `<div class="text-red-600 font-bold text-lg mb-1">❗ 乘除法則混淆 (除法需將後方分式倒轉)</div>`;
const msgFracMulDiv2 = `<div class="text-red-600 font-bold text-lg mb-1">❗ 指數定律或約簡計算錯誤</div>`;
const msgFracMulDiv3 = `<div class="text-red-600 font-bold text-lg mb-1">❗ 忘記變號：(x-y) 與 (y-x) 約簡應為 -1</div>`;
const msgFracMulDiv4 = `<div class="text-red-600 font-bold text-lg mb-1">❗ 因式分解未完全或錯誤</div>`;

// ==========================================
// 🌟 仿教師紅筆批改系統 (強大視覺化跨項約簡)
// 完全重現老師手寫批改：加粗紅線劃掉、標記剩餘數字與次方
// ==========================================

// 1. 處理數字的約簡畫線
function getNumCancel(oldN, newN, pos) {
    if (oldN === newN) return oldN === 1 ? "" : oldN.toString();
    if (newN === 1) return `\\color{red}{\\cancel{\\color{black}{${oldN}}}}`;
    if (newN === -1) {
        return pos === 'top' 
            ? `\\overset{\\color{red}{-1}}{\\color{red}{\\cancel{\\color{black}{${oldN}}}}}` 
            : `\\underset{\\color{red}{-1}}{\\color{red}{\\cancel{\\color{black}{${oldN}}}}}`;
    }
    return pos === 'top' 
        ? `\\overset{\\color{red}{${newN}}}{\\color{red}{\\cancel{\\color{black}{${oldN}}}}}`
        : `\\underset{\\color{red}{${newN}}}{\\color{red}{\\cancel{\\color{black}{${oldN}}}}}`;
}

// 2. 處理變數與次方的約簡畫線
function getVarCancel(v, oldP, newP, pos) {
    if (oldP === newP) return oldP === 0 ? "" : (oldP === 1 ? v : `${v}^{${oldP}}`);
    if (newP === 0) {
        let oldStr = oldP === 1 ? v : `${v}^{${oldP}}`;
        return `\\color{red}{\\cancel{\\color{black}{${oldStr}}}}`;
    }
    if (newP === 1) {
        return `${v}^{\\color{red}{\\cancel{\\color{black}{${oldP}}}}}`;
    }
    let posCmd = pos === 'top' ? `\\overset{\\color{red}{${newP}}}` : `\\underset{\\color{red}{${newP}}}`;
    return `${v}^{${posCmd}{\\color{red}{\\cancel{\\color{black}{${oldP}}}}}}`;
}

// 3. 處理括號因式的約簡畫線
function getPolyCancel(polyStr, oldP, newP, pos) {
    if (oldP === newP) return oldP === 0 ? "" : (oldP === 1 ? polyStr : `${polyStr}^{${oldP}}`);
    if (newP === 0) {
        let oldStr = oldP === 1 ? polyStr : `${polyStr}^{${oldP}}`;
        return `\\color{red}{\\cancel{\\color{black}{${oldStr}}}}`;
    }
    if (newP === 1) {
        return `${polyStr}^{\\color{red}{\\cancel{\\color{black}{${oldP}}}}}`;
    }
    let posCmd = pos === 'top' ? `\\overset{\\color{red}{${newP}}}` : `\\underset{\\color{red}{${newP}}}`;
    return `${polyStr}^{${posCmd}{\\color{red}{\\cancel{\\color{black}{${oldP}}}}}}`;
}

// 4. 合併畫掉的項 (隱藏多餘的 1)
function joinNum(...strs) {
    let res = strs.filter(s => s !== "").join("");
    return res === "" ? "1" : res;
}

// ==========================================
// 專用強大分數排版工具 (用於最終答案顯示)
// ==========================================
function formatFracAll(numC, denC, v1, p1, v2, p2, bStr, pb) {
    let g = gcd(numC, denC);
    let nC = numC / g;
    let dC = denC / g;
    let isNeg = (nC * dC < 0);
    nC = Math.abs(nC);
    dC = Math.abs(dC);

    let numTerms = [];
    let denTerms = [];

    if (nC !== 1) numTerms.push(nC);
    if (dC !== 1) denTerms.push(dC);

    if (p1 > 0) numTerms.push(p1 === 1 ? v1 : `${v1}^{${p1}}`);
    if (p1 < 0) denTerms.push(p1 === -1 ? v1 : `${v1}^{${-p1}}`);

    if (p2 > 0) numTerms.push(p2 === 1 ? v2 : `${v2}^{${p2}}`);
    if (p2 < 0) denTerms.push(p2 === -1 ? v2 : `${v2}^{${-p2}}`);

    if (pb > 0) numTerms.push(pb === 1 ? bStr : `${bStr}^{${pb}}`);
    if (pb < 0) denTerms.push(pb === -1 ? bStr : `${bStr}^{${-pb}}`);

    let numStr = numTerms.join('') || "1";
    let denStr = denTerms.join('');

    if (denStr === "" || denStr === "1") return (isNeg ? "-" : "") + numStr;
    return (isNeg ? "-" : "") + `\\frac{${numStr}}{${denStr}}`;
}

function formatVar(v, p) { return p === 0 ? "1" : (p === 1 ? v : `${v}^{${p}}`); }

// ==========================================
// 題目生成器：代數分式的乘除法
// ==========================================
function generateAlgFracMulDivQuestions(num, levelPref) {
    const bank = [];
    const singleVars = ['x', 'y', 'a', 'b', 'm', 'n']; 
    
    for (let i = 0; i < num; i++) {
        let levelType = levelPref;
        if (levelPref === 'mixed') {
            const types = ['1', '2', '3', '4'];
            levelType = types[getRandomInt(0, types.length)];
        } else {
            levelType = String(levelPref).toLowerCase();
        }
        
        let qObj = { id: i + 1, topic: "5.2A 代數分式的乘除法" };
        let questionMathStr = "";
        let isDiv = Math.random() > 0.5; 
        let opStr = isDiv ? "\\div" : "\\times";

        // =====================================
        // 程度 1：單項式乘除 (指數定律與跨項約簡)
        // =====================================
        if (levelType === '1') {
            qObj.level = "⭐ 程度 1";
            let v1 = singleVars[getRandomInt(0, 3)]; 
            let v2 = singleVars[getRandomInt(3, 6)]; 
            
            let A = getRandomInt(2, 8), B = getRandomInt(2, 8);
            let C = getRandomInt(2, 8), D = getRandomInt(2, 8);
            let p1 = getRandomInt(1, 5), q1 = getRandomInt(1, 5);
            let p2 = getRandomInt(1, 5), q2 = getRandomInt(1, 5);

            let n1Str = joinNum(A === 1 ? "" : A.toString(), formatVar(v1, p1));
            let d1Str = joinNum(B === 1 ? "" : B.toString(), formatVar(v2, q1));
            let multN2Str = joinNum(C === 1 ? "" : C.toString(), formatVar(v2, q2));
            let multD2Str = joinNum(D === 1 ? "" : D.toString(), formatVar(v1, p2));
            
            let n2Str = isDiv ? multD2Str : multN2Str;
            let d2Str = isDiv ? multN2Str : multD2Str;

            questionMathStr = `\\frac{${n1Str}}{${d1Str}} ${opStr} \\frac{${n2Str}}{${d2Str}}`;
            
            // 約簡計算邏輯 (跨分數獨立約簡)
            let a_val = A, b_val = B, c_val = C, d_val = D;
            let g1 = gcd(a_val, b_val); a_val /= g1; b_val /= g1;
            let g2 = gcd(c_val, d_val); c_val /= g2; d_val /= g2;
            let g3 = gcd(a_val, d_val); a_val /= g3; d_val /= g3;
            let g4 = gcd(c_val, b_val); c_val /= g4; b_val /= g4;
            
            let strA = getNumCancel(A, a_val, 'top');
            let strB = getNumCancel(B, b_val, 'bottom');
            let strC = getNumCancel(C, c_val, 'top');
            let strD = getNumCancel(D, d_val, 'bottom');

            let newP1 = p1, newP2 = p2;
            if (p1 > p2) { newP1 = p1 - p2; newP2 = 0; }
            else if (p1 < p2) { newP1 = 0; newP2 = p2 - p1; }
            else { newP1 = 0; newP2 = 0; }
            let strV1_N = getVarCancel(v1, p1, newP1, 'top');
            let strV1_D = getVarCancel(v1, p2, newP2, 'bottom');

            let newQ1 = q1, newQ2 = q2;
            if (q2 > q1) { newQ2 = q2 - q1; newQ1 = 0; }
            else if (q2 < q1) { newQ2 = 0; newQ1 = q1 - q2; }
            else { newQ2 = 0; newQ1 = 0; }
            let strV2_N = getVarCancel(v2, q2, newQ2, 'top');
            let strV2_D = getVarCancel(v2, q1, newQ1, 'bottom');

            // 組合約簡後的分式 (保留兩個獨立分數)
            let stepN1 = joinNum(strA, strV1_N);
            let stepD1 = joinNum(strB, strV2_D);
            let stepN2 = joinNum(strC, strV2_N);
            let stepD2 = joinNum(strD, strV1_D);
            
            let correctStr = formatFracAll(A*C, B*D, v1, p1-p2, v2, q2-q1, "", 0);

            let steps = [{text: questionMathStr, hide: false}];
            if (isDiv) steps.push({text: `\\frac{${n1Str}}{${d1Str}} \\times \\frac{${multN2Str}}{${multD2Str}}`, hide: false});
            
            // 🌟 核心：先約簡，不相乘！
            steps.push({text: `\\frac{${stepN1}}{${stepD1}} \\times \\frac{${stepN2}}{${stepD2}}`, hide: false});
            steps.push({text: correctStr, hide: false});

            let eqCorrectHtml = wrapHint(msgCorrect, buildEq(steps));

            let w1 = formatFracAll(A*D, B*C, v1, isDiv? p1+p2 : p1-p2, v2, isDiv? q1+q2 : q2-q1, "", 0); 
            let w2 = formatFracAll(A*C, B*D, v1, p1+p2, v2, q1+q2, "", 0); 
            let w3 = formatFracAll(A+C, B+D, v1, p1-p2, v2, q2-q1, "", 0); 

            let options = [
                { text: `\\( \\displaystyle ${correctStr} \\)`, isCorrect: true, hint: eqCorrectHtml },
                { text: `\\( \\displaystyle ${w1} \\)`, isCorrect: false, hint: wrapHint(msgFracMulDiv1, buildEq(steps)) },
                { text: `\\( \\displaystyle ${w2} \\)`, isCorrect: false, hint: wrapHint(msgFracMulDiv2, buildEq(steps)) },
                { text: `\\( \\displaystyle ${w3} \\)`, isCorrect: false, hint: wrapHint(msgFracMulDiv2, buildEq(steps)) }
            ];
            
            let texts = []; let finalOptions = [];
            options.forEach(opt => { if (!texts.includes(opt.text)) { texts.push(opt.text); finalOptions.push(opt); } });
            while(finalOptions.length < 4) {
                let fakeP = (p1-p2) + getRandomInt(1, 3) * (Math.random() > 0.5 ? 1 : -1);
                let altText = `\\( \\displaystyle ${formatFracAll(A*C, B*D, v1, fakeP, v2, q2-q1, "", 0)} \\)`;
                if (!texts.includes(altText)) { texts.push(altText); finalOptions.push({ text: altText, isCorrect: false, hint: wrapHint(msgFracMulDiv2, buildEq(steps)) }); }
            }
            qObj.options = shuffleArray(finalOptions).map((opt, idx) => ({...opt, id: String.fromCharCode(65 + idx)}));

        // =====================================
        // 程度 2：二項式提公因式 / 相反數括號
        // =====================================
        } else if (levelType === '2') {
            qObj.level = "⭐⭐ 程度 2";
            let type = getRandomInt(0, 2); 
            let v = singleVars[getRandomInt(0, 3)];
            let v2 = singleVars[getRandomInt(3, 6)];
            let b = getRandomInt(2, 6), c = getRandomInt(2, 6);
            let q1 = getRandomInt(1, 4), q2 = getRandomInt(1, 4);
            let k = getRandomInt(1, 6);

            let steps = []; let correctStr = "";
            let options = [];

            if (type === 0) { // 提公因式約簡
                let a = getRandomInt(2, 5), d = getRandomInt(2, 5);
                let sign = Math.random() > 0.5 ? 1 : -1;
                
                let bStr = `(${v} ${sign > 0 ? '+' : '-'} ${k})`;
                
                let n1Str = `${a}${v} ${sign > 0 ? '+' : '-'} ${a*k}`; 
                let d1Str = joinNum(b.toString(), formatVar(v2, q1));
                let multN2Str = joinNum(c.toString(), formatVar(v2, q2));
                let multD2Str = `${d}${v} ${sign > 0 ? '+' : '-'} ${d*k}`; 
                
                let n2Str = isDiv ? multD2Str : multN2Str;
                let d2Str = isDiv ? multN2Str : multD2Str;
                questionMathStr = `\\frac{${n1Str}}{${d1Str}} ${opStr} \\frac{${n2Str}}{${d2Str}}`;

                let factoredN1 = `${a}${bStr}`;
                let factoredD1 = d1Str;
                let factoredN2 = multN2Str;
                let factoredD2 = `${d}${bStr}`;

                let a_val = a, b_val = b, c_val = c, d_val = d;
                let g1 = gcd(a_val, b_val); a_val /= g1; b_val /= g1;
                let g2 = gcd(c_val, d_val); c_val /= g2; d_val /= g2;
                let g3 = gcd(a_val, d_val); a_val /= g3; d_val /= g3;
                let g4 = gcd(c_val, b_val); c_val /= g4; b_val /= g4;

                let strA = getNumCancel(a, a_val, 'top');
                let strB = getNumCancel(b, b_val, 'bottom');
                let strC = getNumCancel(c, c_val, 'top');
                let strD = getNumCancel(d, d_val, 'bottom');

                let newQ1 = q1, newQ2 = q2;
                if (q2 > q1) { newQ2 = q2 - q1; newQ1 = 0; }
                else if (q2 < q1) { newQ2 = 0; newQ1 = q1 - q2; }
                else { newQ2 = 0; newQ1 = 0; }
                let strV2_N = getVarCancel(v2, q2, newQ2, 'top');
                let strV2_D = getVarCancel(v2, q1, newQ1, 'bottom');

                let strBStr_N = getPolyCancel(bStr, 1, 0, 'top');
                let strBStr_D = getPolyCancel(bStr, 1, 0, 'bottom');

                let stepN1 = joinNum(strA, strBStr_N);
                let stepD1 = joinNum(strB, strV2_D);
                let stepN2 = joinNum(strC, strV2_N);
                let stepD2 = joinNum(strD, strBStr_D);

                correctStr = formatFracAll(a*c, b*d, v, 0, v2, q2-q1, "", 0);

                steps.push({text: questionMathStr, hide: false});
                if (isDiv) steps.push({text: `\\frac{${n1Str}}{${d1Str}} \\times \\frac{${multN2Str}}{${multD2Str}}`, hide: false});
                steps.push({text: `\\frac{${factoredN1}}{${factoredD1}} \\times \\frac{${factoredN2}}{${factoredD2}}`, hide: false});
                
                // 🌟 核心：先約簡，不相乘！
                steps.push({text: `\\frac{${stepN1}}{${stepD1}} \\times \\frac{${stepN2}}{${stepD2}}`, hide: false});
                steps.push({text: correctStr, hide: false});

                let w1 = formatFracAll(a*c, b*d, v, 0, v2, q1+q2, "", 0);
                let w2 = formatFracAll(a*d, b*c, v, 0, v2, q2-q1, "", 0); 
                let w3 = formatFracAll(c, b*d, v, 0, v2, q2-q1, "", 0); 
                
                let eqCorrectHtml = wrapHint(msgCorrect, buildEq(steps));
                options.push({text: `\\( \\displaystyle ${correctStr} \\)`, isCorrect: true, hint: eqCorrectHtml});
                options.push({text: `\\( \\displaystyle ${w1} \\)`, isCorrect: false, hint: wrapHint(msgFracMulDiv2, buildEq(steps))});
                options.push({text: `\\( \\displaystyle ${w2} \\)`, isCorrect: false, hint: wrapHint(msgFracMulDiv1, buildEq(steps))});
                options.push({text: `\\( \\displaystyle ${w3} \\)`, isCorrect: false, hint: wrapHint(msgFracMulDiv4, buildEq(steps))});

            } else { // 負號陷阱：(x-y) / (y-x) = -1
                let n1Str = `${v} - ${k}`;
                let d1Str = joinNum(b.toString(), formatVar(v2, q1));
                let multN2Str = joinNum(c.toString(), formatVar(v2, q2));
                let multD2Str = `${k} - ${v}`; 
                
                let n2Str = isDiv ? multD2Str : multN2Str;
                let d2Str = isDiv ? multN2Str : multD2Str;
                questionMathStr = `\\frac{${n1Str}}{${d1Str}} ${opStr} \\frac{${n2Str}}{${d2Str}}`;

                let bStr = `(${v} - ${k})`;
                
                let factoredN1 = bStr;
                let factoredD1 = d1Str;
                let factoredN2 = multN2Str;
                let factoredD2 = `-(${v} - ${k})`;

                let b_val = b, c_val = c;
                let g = gcd(b_val, c_val); b_val /= g; c_val /= g;

                let strC = getNumCancel(c, c_val, 'top');
                let strB = getNumCancel(b, b_val, 'bottom');

                let newQ1 = q1, newQ2 = q2;
                if (q2 > q1) { newQ2 = q2 - q1; newQ1 = 0; }
                else if (q2 < q1) { newQ2 = 0; newQ1 = q1 - q2; }
                else { newQ2 = 0; newQ1 = 0; }
                let strV2_N = getVarCancel(v2, q2, newQ2, 'top');
                let strV2_D = getVarCancel(v2, q1, newQ1, 'bottom');

                let strBStr_N = getPolyCancel(bStr, 1, 0, 'top');
                let strBStr_D = getPolyCancel(bStr, 1, 0, 'bottom');

                let stepN1 = strBStr_N;
                let stepD1 = joinNum(strB, strV2_D);
                let stepN2 = joinNum(strC, strV2_N);
                let stepD2 = `-${strBStr_D}`; // 保留負號在括號外

                correctStr = formatFracAll(-c, b, v, 0, v2, q2-q1, "", 0);

                steps.push({text: questionMathStr, hide: false});
                if (isDiv) steps.push({text: `\\frac{${n1Str}}{${d1Str}} \\times \\frac{${multN2Str}}{${multD2Str}}`, hide: false});
                steps.push({text: `\\frac{${factoredN1}}{${factoredD1}} \\times \\frac{${factoredN2}}{${factoredD2}}`, hide: false});
                steps.push({text: `\\frac{${stepN1}}{${stepD1}} \\times \\frac{${stepN2}}{${stepD2}}`, hide: false});
                steps.push({text: correctStr, hide: false});

                let w1 = formatFracAll(c, b, v, 0, v2, q2-q1, "", 0); 
                let w2 = formatFracAll(-c, b, v, 0, v2, q1+q2, "", 0); 
                let w3 = formatFracAll(c, b, v, 0, v2, q1+q2, "", 0);
                
                let eqCorrectHtml = wrapHint(msgCorrect + `<div class='text-sm text-slate-500 mb-2 font-bold'>💡 技巧：${k} - ${v} 可以抽出負號變成 -(${v} - ${k})，然後互相約簡！</div>`, buildEq(steps));
                options.push({text: `\\( \\displaystyle ${correctStr} \\)`, isCorrect: true, hint: eqCorrectHtml});
                options.push({text: `\\( \\displaystyle ${w1} \\)`, isCorrect: false, hint: wrapHint(msgFracMulDiv3, buildEq(steps))});
                options.push({text: `\\( \\displaystyle ${w2} \\)`, isCorrect: false, hint: wrapHint(msgFracMulDiv2, buildEq(steps))});
                options.push({text: `\\( \\displaystyle ${w3} \\)`, isCorrect: false, hint: wrapHint(msgFracMulDiv3, buildEq(steps))});
            }

            let texts = []; let finalOptions = [];
            options.forEach(opt => { if (!texts.includes(opt.text)) { texts.push(opt.text); finalOptions.push(opt); } });
            while(finalOptions.length < 4) {
                let fakeC = c + getRandomInt(1, 4);
                let altText = `\\( \\displaystyle ${formatFracAll(fakeC, b, v, 0, v2, q2-q1, "", 0)} \\)`;
                if (!texts.includes(altText)) { texts.push(altText); finalOptions.push({ text: altText, isCorrect: false, hint: wrapHint(msgFracMulDiv4, buildEq(steps)) }); }
            }
            qObj.options = shuffleArray(finalOptions).map((opt, idx) => ({...opt, id: String.fromCharCode(65 + idx)}));

        // =====================================
        // 程度 3：二次多項式因式分解 (平方差、完全平方公式)
        // =====================================
        } else if (levelType === '3') {
            qObj.level = "⭐⭐⭐ 程度 3";
            let type = getRandomInt(0, 2); 
            let v = singleVars[getRandomInt(0, 3)];
            let v2 = singleVars[getRandomInt(3, 6)];
            let b = getRandomInt(2, 6), c = getRandomInt(2, 6);
            let q1 = getRandomInt(1, 4), q2 = getRandomInt(1, 4);
            
            let steps = []; let correctStr = ""; let options = [];

            if (type === 0) { // 平方差
                let k = getRandomInt(2, 6);
                let sign = Math.random() > 0.5 ? 1 : -1;
                
                let n1Str = `${v}^2 - ${k*k}`;
                let d1Str = joinNum(b.toString(), formatVar(v2, q1));
                let multN2Str = joinNum(c.toString(), formatVar(v2, q2));
                let multD2Str = `${v} ${sign > 0 ? '+' : '-'} ${k}`;
                
                let n2Str = isDiv ? multD2Str : multN2Str;
                let d2Str = isDiv ? multN2Str : multD2Str;

                questionMathStr = `\\frac{${n1Str}}{${d1Str}} ${opStr} \\frac{${n2Str}}{${d2Str}}`;

                let keptSign = sign > 0 ? '-' : '+';
                let keepStr = `(${v} ${keptSign} ${k})`;
                let cancelStr = `(${v} ${sign > 0 ? '+' : '-'} ${k})`;

                let factoredN1 = sign > 0 ? `${cancelStr}${keepStr}` : `${keepStr}${cancelStr}`;
                let factoredD1 = d1Str;
                let factoredN2 = multN2Str;
                let factoredD2 = cancelStr;

                let b_val = b, c_val = c;
                let g = gcd(b_val, c_val); b_val /= g; c_val /= g;

                let strC = getNumCancel(c, c_val, 'top');
                let strB = getNumCancel(b, b_val, 'bottom');

                let newQ1 = q1, newQ2 = q2;
                if (q2 > q1) { newQ2 = q2 - q1; newQ1 = 0; }
                else if (q2 < q1) { newQ2 = 0; newQ1 = q1 - q2; }
                else { newQ2 = 0; newQ1 = 0; }
                let strV2_N = getVarCancel(v2, q2, newQ2, 'top');
                let strV2_D = getVarCancel(v2, q1, newQ1, 'bottom');

                let strCancel_N = getPolyCancel(cancelStr, 1, 0, 'top');
                let strCancel_D = getPolyCancel(cancelStr, 1, 0, 'bottom');

                let stepN1;
                if (sign > 0) {
                    stepN1 = joinNum(strCancel_N, keepStr); 
                } else {
                    stepN1 = joinNum(keepStr, strCancel_N); 
                }
                
                let stepD1 = joinNum(strB, strV2_D);
                let stepN2 = joinNum(strC, strV2_N);
                let stepD2 = strCancel_D;

                correctStr = formatFracAll(c, b, v, 0, v2, q2-q1, keepStr, 1);

                steps.push({text: questionMathStr, hide: false});
                if (isDiv) steps.push({text: `\\frac{${n1Str}}{${d1Str}} \\times \\frac{${multN2Str}}{${multD2Str}}`, hide: false});
                steps.push({text: `\\frac{(${v}-${k})(${v}+${k})}{${factoredD1}} \\times \\frac{${factoredN2}}{${factoredD2}}`, hide: false});
                steps.push({text: `\\frac{${stepN1}}{${stepD1}} \\times \\frac{${stepN2}}{${stepD2}}`, hide: false});
                steps.push({text: correctStr, hide: false});

                let w1 = formatFracAll(c, b, v, 0, v2, q2-q1, `(${v} ${sign > 0 ? '+' : '-'} ${k})`, 1); 
                let w2 = formatFracAll(c, b, v, 0, v2, q1+q2, keepStr, 1);
                let w3 = formatFracAll(c, b, v, 0, v2, q2-q1, "", 0); 

                let eqCorrectHtml = wrapHint(msgCorrect, buildEq(steps));
                options.push({text: `\\( \\displaystyle ${correctStr} \\)`, isCorrect: true, hint: eqCorrectHtml});
                options.push({text: `\\( \\displaystyle ${w1} \\)`, isCorrect: false, hint: wrapHint(msgFracMulDiv4, buildEq(steps))});
                options.push({text: `\\( \\displaystyle ${w2} \\)`, isCorrect: false, hint: wrapHint(msgFracMulDiv2, buildEq(steps))});
                options.push({text: `\\( \\displaystyle ${w3} \\)`, isCorrect: false, hint: wrapHint(msgFracMulDiv4, buildEq(steps))});

            } else { // 完全平方公式
                let k = getRandomInt(2, 6);
                let sign = Math.random() > 0.5 ? 1 : -1;
                let midCoef = 2 * k * sign;
                let constTerm = k * k;

                let n1Str = `${v}^2 ${midCoef > 0 ? '+' : '-'} ${Math.abs(midCoef)}${v} + ${constTerm}`;
                let d1Str = joinNum(b.toString(), formatVar(v2, q1));
                let multN2Str = joinNum(c.toString(), formatVar(v2, q2));
                let multD2Str = `${v} ${sign > 0 ? '+' : '-'} ${k}`;

                let n2Str = isDiv ? multD2Str : multN2Str;
                let d2Str = isDiv ? multN2Str : multD2Str;

                questionMathStr = `\\frac{${n1Str}}{${d1Str}} ${opStr} \\frac{${n2Str}}{${d2Str}}`;

                let bStr = `(${v} ${sign > 0 ? '+' : '-'} ${k})`;

                let factoredN1 = `${bStr}^2`;
                let factoredD1 = d1Str;
                let factoredN2 = multN2Str;
                let factoredD2 = bStr;

                let b_val = b, c_val = c;
                let g = gcd(b_val, c_val); b_val /= g; c_val /= g;

                let strC = getNumCancel(c, c_val, 'top');
                let strB = getNumCancel(b, b_val, 'bottom');

                let newQ1 = q1, newQ2 = q2;
                if (q2 > q1) { newQ2 = q2 - q1; newQ1 = 0; }
                else if (q2 < q1) { newQ2 = 0; newQ1 = q1 - q2; }
                else { newQ2 = 0; newQ1 = 0; }
                let strV2_N = getVarCancel(v2, q2, newQ2, 'top');
                let strV2_D = getVarCancel(v2, q1, newQ1, 'bottom');

                let strBStr_N = getPolyCancel(bStr, 2, 1, 'top'); // 畫掉 2 次方
                let strBStr_D = getPolyCancel(bStr, 1, 0, 'bottom'); // 畫掉整個底數

                let stepN1 = strBStr_N;
                let stepD1 = joinNum(strB, strV2_D);
                let stepN2 = joinNum(strC, strV2_N);
                let stepD2 = strBStr_D;

                correctStr = formatFracAll(c, b, v, 0, v2, q2-q1, bStr, 1);

                steps.push({text: questionMathStr, hide: false});
                if (isDiv) steps.push({text: `\\frac{${n1Str}}{${d1Str}} \\times \\frac{${multN2Str}}{${multD2Str}}`, hide: false});
                steps.push({text: `\\frac{${factoredN1}}{${factoredD1}} \\times \\frac{${factoredN2}}{${factoredD2}}`, hide: false});
                steps.push({text: `\\frac{${stepN1}}{${stepD1}} \\times \\frac{${stepN2}}{${stepD2}}`, hide: false});
                steps.push({text: correctStr, hide: false});

                let w1 = formatFracAll(c, b, v, 0, v2, q2-q1, `(${v} ${sign > 0 ? '-' : '+'} ${k})`, 1); 
                let w2 = formatFracAll(c, b, v, 0, v2, q1+q2, bStr, 1);
                let w3 = formatFracAll(-c, b, v, 0, v2, q2-q1, bStr, 1); 

                let eqCorrectHtml = wrapHint(msgCorrect, buildEq(steps));
                options.push({text: `\\( \\displaystyle ${correctStr} \\)`, isCorrect: true, hint: eqCorrectHtml});
                options.push({text: `\\( \\displaystyle ${w1} \\)`, isCorrect: false, hint: wrapHint(msgFracMulDiv4, buildEq(steps))});
                options.push({text: `\\( \\displaystyle ${w2} \\)`, isCorrect: false, hint: wrapHint(msgFracMulDiv2, buildEq(steps))});
                options.push({text: `\\( \\displaystyle ${w3} \\)`, isCorrect: false, hint: wrapHint(msgFracMulDiv2, buildEq(steps))});
            }

            let texts = []; let finalOptions = [];
            options.forEach(opt => { if (!texts.includes(opt.text)) { texts.push(opt.text); finalOptions.push(opt); } });
            while(finalOptions.length < 4) {
                let fakeC = c + getRandomInt(1, 4);
                let altText = `\\( \\displaystyle ${formatFracAll(fakeC, b, v, 0, v2, q2-q1, "", 0)} \\)`;
                if (!texts.includes(altText)) { texts.push(altText); finalOptions.push({ text: altText, isCorrect: false, hint: wrapHint(msgFracMulDiv4, buildEq(steps)) }); }
            }
            qObj.options = shuffleArray(finalOptions).map((opt, idx) => ({...opt, id: String.fromCharCode(65 + idx)}));

        // =====================================
        // 程度 4：二次多項式因式分解 (十字相乘法)
        // =====================================
        } else {
            qObj.level = "⭐⭐⭐⭐ 程度 4";
            let v = singleVars[getRandomInt(0, 3)];
            let v2 = singleVars[getRandomInt(3, 6)];
            let b = getRandomInt(2, 6), c = getRandomInt(2, 6);
            let q1 = getRandomInt(1, 4), q2 = getRandomInt(1, 4);
            
            let steps = []; let correctStr = ""; let options = [];

            let m = getRandomInt(1, 5), n = getRandomInt(1, 5);
            while (m === n) n = getRandomInt(1, 5);

            let signM = Math.random() > 0.5 ? 1 : -1;
            let signN = Math.random() > 0.5 ? 1 : -1;
            m *= signM; n *= signN;

            let midCoef = m + n;
            let constTerm = m * n;

            let n1Str = `${v}^2`;
            if (midCoef === 1) n1Str += ` + ${v}`;
            else if (midCoef === -1) n1Str += ` - ${v}`;
            else if (midCoef > 0) n1Str += ` + ${midCoef}${v}`;
            else if (midCoef < 0) n1Str += ` - ${Math.abs(midCoef)}${v}`;
            if (constTerm > 0) n1Str += ` + ${constTerm}`;
            else if (constTerm < 0) n1Str += ` - ${Math.abs(constTerm)}`;

            let d1Str = joinNum(b.toString(), formatVar(v2, q1));
            let multN2Str = joinNum(c.toString(), formatVar(v2, q2));
            let multD2Str = `${v} ${m > 0 ? '+' : '-'} ${Math.abs(m)}`; 

            let n2Str = isDiv ? multD2Str : multN2Str;
            let d2Str = isDiv ? multN2Str : multD2Str;

            questionMathStr = `\\frac{${n1Str}}{${d1Str}} ${opStr} \\frac{${n2Str}}{${d2Str}}`;

            let cancelStr = `(${v} ${m > 0 ? '+' : '-'} ${Math.abs(m)})`;
            let keepStr = `(${v} ${n > 0 ? '+' : '-'} ${Math.abs(n)})`;

            let factoredN1 = `${cancelStr}${keepStr}`;
            let factoredD1 = d1Str;
            let factoredN2 = multN2Str;
            let factoredD2 = cancelStr;

            let b_val = b, c_val = c;
            let g = gcd(b_val, c_val); b_val /= g; c_val /= g;

            let strC = getNumCancel(c, c_val, 'top');
            let strB = getNumCancel(b, b_val, 'bottom');

            let newQ1 = q1, newQ2 = q2;
            if (q2 > q1) { newQ2 = q2 - q1; newQ1 = 0; }
            else if (q2 < q1) { newQ2 = 0; newQ1 = q1 - q2; }
            else { newQ2 = 0; newQ1 = 0; }
            let strV2_N = getVarCancel(v2, q2, newQ2, 'top');
            let strV2_D = getVarCancel(v2, q1, newQ1, 'bottom');

            let strCancel_N = getPolyCancel(cancelStr, 1, 0, 'top');
            let strCancel_D = getPolyCancel(cancelStr, 1, 0, 'bottom');

            let stepN1 = joinNum(strCancel_N, keepStr); 
            let stepD1 = joinNum(strB, strV2_D);
            let stepN2 = joinNum(strC, strV2_N);
            let stepD2 = strCancel_D;

            correctStr = formatFracAll(c, b, v, 0, v2, q2-q1, keepStr, 1);

            steps.push({text: questionMathStr, hide: false});
            if (isDiv) steps.push({text: `\\frac{${n1Str}}{${d1Str}} \\times \\frac{${multN2Str}}{${multD2Str}}`, hide: false});
            steps.push({text: `\\frac{${factoredN1}}{${factoredD1}} \\times \\frac{${factoredN2}}{${factoredD2}}`, hide: false});
            steps.push({text: `\\frac{${stepN1}}{${stepD1}} \\times \\frac{${stepN2}}{${stepD2}}`, hide: false});
            steps.push({text: correctStr, hide: false});

            let w1 = formatFracAll(c, b, v, 0, v2, q2-q1, `(${v} ${m > 0 ? '+' : '-'} ${Math.abs(m)})`, 1); 
            let w2 = formatFracAll(c, b, v, 0, v2, q1+q2, keepStr, 1);
            let w3 = formatFracAll(-c, b, v, 0, v2, q2-q1, keepStr, 1); 

            let eqCorrectHtml = wrapHint(msgCorrect, buildEq(steps));
            options.push({text: `\\( \\displaystyle ${correctStr} \\)`, isCorrect: true, hint: eqCorrectHtml});
            options.push({text: `\\( \\displaystyle ${w1} \\)`, isCorrect: false, hint: wrapHint(msgFracMulDiv4, buildEq(steps))});
            options.push({text: `\\( \\displaystyle ${w2} \\)`, isCorrect: false, hint: wrapHint(msgFracMulDiv2, buildEq(steps))});
            options.push({text: `\\( \\displaystyle ${w3} \\)`, isCorrect: false, hint: wrapHint(msgFracMulDiv2, buildEq(steps))});
            
            let texts = []; let finalOptions = [];
            options.forEach(opt => { if (!texts.includes(opt.text)) { texts.push(opt.text); finalOptions.push(opt); } });
            while(finalOptions.length < 4) {
                let fakeC = c + getRandomInt(1, 4);
                let altText = `\\( \\displaystyle ${formatFracAll(fakeC, b, v, 0, v2, q2-q1, "", 0)} \\)`;
                if (!texts.includes(altText)) { texts.push(altText); finalOptions.push({ text: altText, isCorrect: false, hint: wrapHint(msgFracMulDiv4, buildEq(steps)) }); }
            }
            qObj.options = shuffleArray(finalOptions).map((opt, idx) => ({...opt, id: String.fromCharCode(65 + idx)}));
        }

        qObj.question = `
        <div class="mb-4 text-base sm:text-lg text-slate-600">化簡以下代數分式：</div>
        <div class="text-xl sm:text-2xl font-bold text-indigo-700 py-4 overflow-x-auto math-scroll whitespace-nowrap w-full">
            \\( \\displaystyle ${questionMathStr} \\)
        </div>`;
        
        bank.push(qObj);
    }
    return bank;
}
