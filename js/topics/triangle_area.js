// js/topics/triangle_area.js

// ==========================================
// 三角形面積專用錯誤提示訊息
// ==========================================
const msgTriSAS = `<div class="text-red-600 font-bold text-lg mb-1">❗ 錯誤：已知兩邊及夾角，應使用 \\(\\frac{1}{2}ab\\sin C\\)</div>`;
const msgTriSSS = `<div class="text-red-600 font-bold text-lg mb-1">❗ 錯誤：已知三邊，應使用希羅公式 (Heron's formula)</div>`;
const msgTriCalc = `<div class="text-red-600 font-bold text-lg mb-1">❗ 計算錯誤：忘記乘以 \\(\\frac{1}{2}\\) 或忘記開根號</div>`;

// ==========================================
// 動態 SVG 三角形幾何繪圖引擎
// ==========================================
function drawTriangleSVG(type, a, b, val3) {
    let C_deg, C_rad, c;
    
    // 根據題型推算第三邊及夾角
    if (type === 'SAS') {
        C_deg = val3;
        C_rad = C_deg * Math.PI / 180;
        c = Math.sqrt(a*a + b*b - 2*a*b*Math.cos(C_rad));
    } else {
        c = val3;
        C_rad = Math.acos((a*a + b*b - c*c) / (2*a*b));
        C_deg = Math.round(C_rad * 180 / Math.PI);
    }

    // 建立數學座標系點位 (C 點在原點，B 點在 x 軸)
    let ptC = { x: 0, y: 0 };
    let ptB = { x: a, y: 0 };
    let ptA = { x: b * Math.cos(C_rad), y: b * Math.sin(C_rad) };

    // 計算邊界以利於縮放
    let minX = Math.min(ptC.x, ptB.x, ptA.x);
    let maxX = Math.max(ptC.x, ptB.x, ptA.x);
    let minY = Math.min(ptC.y, ptB.y, ptA.y); 
    let maxY = Math.max(ptC.y, ptB.y, ptA.y);

    let pad = 40; // 預留給文字標籤的空間
    let svgW = 280;
    let svgH = 180;
    
    // 取得縮放比例，使三角形完美適應畫布
    let scale = Math.min((svgW - pad*2) / (maxX - minX), (svgH - pad*2) / (maxY - minY));
    let cx = (minX + maxX) / 2;
    let cy = (minY + maxY) / 2;
    
    // 數學座標轉 SVG 座標 (注意 Y 軸反轉)
    function getSVG(pt) {
        return {
            x: svgW/2 + (pt.x - cx) * scale,
            y: svgH/2 - (pt.y - cy) * scale
        };
    }

    let sC = getSVG(ptC);
    let sB = getSVG(ptB);
    let sA = getSVG(ptA);

    let svgHtml = `<svg width="100%" height="100%" viewBox="0 0 ${svgW} ${svgH}" class="max-w-[320px] mx-auto my-2 drop-shadow-sm" style="overflow: visible;">`;
    
    // 繪製三角形本體
    svgHtml += `<polygon points="${sC.x},${sC.y} ${sB.x},${sB.y} ${sA.x},${sA.y}" fill="#EEF2FF" stroke="#4F46E5" stroke-width="2.5" stroke-linejoin="round" />`;

    // 標註頂點名稱 (A, B, C)
    function getDir(pt, other1, other2) {
        let mx = (other1.x + other2.x)/2;
        let my = (other1.y + other2.y)/2;
        let dx = pt.x - mx;
        let dy = pt.y - my;
        let len = Math.sqrt(dx*dx + dy*dy);
        return { x: dx/len, y: dy/len };
    }
    
    let dirC = getDir(sC, sA, sB);
    let dirB = getDir(sB, sA, sC);
    let dirA = getDir(sA, sC, sB);

    svgHtml += `<text x="${sC.x + dirC.x*18}" y="${sC.y + dirC.y*18 + 5}" text-anchor="middle" class="fill-slate-400 font-bold text-sm">C</text>`;
    svgHtml += `<text x="${sB.x + dirB.x*18}" y="${sB.y + dirB.y*18 + 5}" text-anchor="middle" class="fill-slate-400 font-bold text-sm">B</text>`;
    svgHtml += `<text x="${sA.x + dirA.x*18}" y="${sA.y + dirA.y*18 + 5}" text-anchor="middle" class="fill-slate-400 font-bold text-sm">A</text>`;

    // 標註邊長數字
    function drawSideLabel(pt1, pt2, label) {
        let mx = (pt1.x + pt2.x) / 2;
        let my = (pt1.y + pt2.y) / 2;
        let cx_svg = (sA.x + sB.x + sC.x) / 3;
        let cy_svg = (sA.y + sB.y + sC.y) / 3;
        let dx = mx - cx_svg;
        let dy = my - cy_svg;
        let len = Math.sqrt(dx*dx + dy*dy);
        let offX = (dx/len) * 20;
        let offY = (dy/len) * 20;
        svgHtml += `<text x="${mx + offX}" y="${my + offY + 5}" text-anchor="middle" class="fill-slate-800 font-bold text-base">${label}</text>`;
    }

    drawSideLabel(sC, sB, `${a}`); 
    drawSideLabel(sC, sA, `${b}`); 
    if (type === 'SSS') {
        drawSideLabel(sA, sB, `${c}`); 
    }

    // 若為 SAS，畫出夾角弧線與角度
    if (type === 'SAS') {
        let r = 25;
        let ang1 = Math.atan2(sB.y - sC.y, sB.x - sC.x);
        let ang2 = Math.atan2(sA.y - sC.y, sA.x - sC.x);
        
        let startX = sC.x + r * Math.cos(ang1);
        let startY = sC.y + r * Math.sin(ang1);
        let endX = sC.x + r * Math.cos(ang2);
        let endY = sC.y + r * Math.sin(ang2);

        let sweep = (ang2 < ang1) ? 0 : 1; 

        svgHtml += `<path d="M ${startX} ${startY} A ${r} ${r} 0 0 ${sweep} ${endX} ${endY}" fill="none" stroke="#4F46E5" stroke-width="1.5" />`;

        let midAng = (ang1 + ang2) / 2;
        if (Math.abs(ang1 - ang2) > Math.PI) { midAng += Math.PI; }

        let tx = sC.x + (r + 18) * Math.cos(midAng);
        let ty = sC.y + (r + 18) * Math.sin(midAng);
        svgHtml += `<text x="${tx}" y="${ty + 4}" text-anchor="middle" class="fill-indigo-700 font-bold text-xs">${C_deg}°</text>`;
    }

    svgHtml += `</svg>`;
    return svgHtml;
}

// ==========================================
// 題目生成器：三角形的面積 (Area of Triangle)
// ==========================================
function generateTriangleAreaQuestions(num, levelPref) {
    const bank = [];

    for (let i = 0; i < num; i++) {
        let qObj = { id: i + 1, topic: "三角形面積 (Area of Triangle)", level: "⭐ 程度 1" };
        let svgHtml = "";
        let options = [];
        let correctStr, w1, w2, w3;

        let isSAS = Math.random() > 0.5;

        if (isSAS) {
            let a = getRandomInt(4, 16);
            let b = getRandomInt(4, 16);
            let angle = getRandomInt(3, 15) * 10; 
            if (angle === 90) angle = 85; 
            let rad = angle * Math.PI / 180;

            let area = 0.5 * a * b * Math.sin(rad);
            correctStr = area.toPrecision(3);

            // 🌟 呼叫繪圖引擎畫出 SAS 三角形
            svgHtml = drawTriangleSVG('SAS', a, b, angle);

            let steps = [
                { text: `\\text{已知兩邊及其夾角，使用面積公式：} \\frac{1}{2}ab\\sin C`, hide: false },
                { text: `\\text{面積} = \\frac{1}{2}(${a})(${b})\\sin ${angle}^\\circ`, hide: false },
                { text: `\\approx ${correctStr}`, hide: false }
            ];
            let eqCorrectHtml = wrapHint(msgCorrect, buildEq(steps));

            w1 = (a * b * Math.sin(rad)).toPrecision(3); 
            w2 = (0.5 * a * b * Math.abs(Math.cos(rad))).toPrecision(3); 
            w3 = (0.5 * a * b).toPrecision(3); 

            options.push({ text: `\\( \\displaystyle ${correctStr} \\text{ cm}^2 \\)`, isCorrect: true, hint: eqCorrectHtml });
            options.push({ text: `\\( \\displaystyle ${w1} \\text{ cm}^2 \\)`, isCorrect: false, hint: wrapHint(msgTriCalc + "<div class='text-sm text-slate-500 mb-2'>(提示：公式前面要乘以 1/2)</div>", buildEq(steps)) });
            options.push({ text: `\\( \\displaystyle ${w2} \\text{ cm}^2 \\)`, isCorrect: false, hint: wrapHint(msgTriSAS + "<div class='text-sm text-slate-500 mb-2'>(提示：夾角的三角比是 sin，不是 cos 喔)</div>", buildEq(steps)) });
            options.push({ text: `\\( \\displaystyle ${w3} \\text{ cm}^2 \\)`, isCorrect: false, hint: wrapHint(msgTriSAS + "<div class='text-sm text-slate-500 mb-2'>(提示：這不是直角三角形，不要忘記乘以 sin C)</div>", buildEq(steps)) });

        } else {
            let a = getRandomInt(5, 15);
            let b = getRandomInt(5, 15);
            let c;
            do {
                c = getRandomInt(5, 15);
            } while (a + b <= c || a + c <= b || b + c <= a);

            let s = (a + b + c) / 2;
            let area2 = s * (s - a) * (s - b) * (s - c);
            let area = Math.sqrt(area2);
            correctStr = area.toPrecision(3);

            // 🌟 呼叫繪圖引擎畫出 SSS 三角形
            svgHtml = drawTriangleSVG('SSS', a, b, c);

            let steps = [
                { text: `\\text{已知三邊長度，使用希羅公式 (Heron's Formula)}`, hide: false },
                { text: `s = \\frac{${a} + ${b} + ${c}}{2} = ${s}`, hide: false },
                { text: `\\text{面積} = \\sqrt{${s}(${s}-${a})(${s}-${b})(${s}-${c})}`, hide: false },
                { text: `\\approx ${correctStr}`, hide: false }
            ];
            let eqCorrectHtml = wrapHint(msgCorrect, buildEq(steps));

            w1 = area2.toPrecision(3); 
            let s_wrong = a + b + c; 
            w2 = Math.sqrt(Math.abs(s_wrong * (s_wrong - a) * (s_wrong - b) * (s_wrong - c))).toPrecision(3);
            w3 = (0.5 * a * b).toPrecision(3); 

            options.push({ text: `\\( \\displaystyle ${correctStr} \\text{ cm}^2 \\)`, isCorrect: true, hint: eqCorrectHtml });
            options.push({ text: `\\( \\displaystyle ${w1} \\text{ cm}^2 \\)`, isCorrect: false, hint: wrapHint(msgTriCalc + "<div class='text-sm text-slate-500 mb-2'>(提示：公式的最後一步記得要開根號 \\(\\sqrt{\\phantom{x}}\\) )</div>", buildEq(steps)) });
            options.push({ text: `\\( \\displaystyle ${w2} \\text{ cm}^2 \\)`, isCorrect: false, hint: wrapHint(msgTriSSS + "<div class='text-sm text-slate-500 mb-2'>(提示：s 代表「半周界」，即是周界除以 2)</div>", buildEq(steps)) });
            options.push({ text: `\\( \\displaystyle ${w3} \\text{ cm}^2 \\)`, isCorrect: false, hint: wrapHint(msgTriSAS + "<div class='text-sm text-slate-500 mb-2'>(提示：因為沒有提供角度，所以不能使用 \\(\\frac{1}{2}ab\\sin C\\)，必須使用希羅公式)</div>", buildEq(steps)) });
        }

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
                finalOptions.push({ text: altText, isCorrect: false, hint: wrapHint(msgTriCalc, buildEq([{ text: `\\text{面積} \\approx ${fakeArea}`, hide: false }])) });
            }
            fallback++;
        }

        qObj.options = shuffleArray(finalOptions).map((opt, idx) => ({...opt, id: String.fromCharCode(65 + idx)}));
        
        // 🌟 更新排版：將原本的純文字數式，替換為動態 SVG 圖形
        qObj.question = `
        <div class="mb-4 text-base sm:text-lg text-slate-600">求以下三角形的面積 (準確至三位有效數字)：</div>
        <div class="w-full flex justify-center py-2 relative">
            ${svgHtml}
        </div>
        <div class="text-xs text-slate-400 text-center mb-4">(圖形不按比例繪製)</div>
        `;

        bank.push(qObj);
    }
    return bank;
}
