/**
 * Web UIコンポーネント辞典 — アニメーションデモ定義
 * 特定の項目のデモプレビューをアニメーション付きに差し替える
 */
const AnimatedDemos = (() => {

    /**
     * 項目名 → アニメーション付きデモHTML のマッピング
     * キーは item.name のHTMLエスケープ前の値
     */
    const demos = {

        // ===== CSS transition =====
        "CSS transition": `
            <style>
                .ademo-transition-box {
                    width: 60px; height: 60px;
                    background: #3b82f6; border-radius: 8px;
                    transition: all 0.6s cubic-bezier(.4,0,.2,1);
                    cursor: pointer;
                    display: flex; align-items: center; justify-content: center;
                    color: #fff; font-size: 0.65rem; font-weight: 700;
                }
                .ademo-transition-wrap:hover .ademo-transition-box {
                    background: #8b5cf6;
                    border-radius: 50%;
                    transform: scale(1.3) rotate(15deg);
                    box-shadow: 0 8px 25px rgba(139,92,246,0.4);
                }
            </style>
            <div class="ademo-transition-wrap" style="display:flex;align-items:center;gap:12px;font-size:0.8rem;padding:4px">
                <div class="ademo-transition-box">Hover!</div>
                <span style="color:var(--text-muted)">← ホバーで変化</span>
            </div>
        `,

        // ===== CSS @keyframes / animation =====
        "CSS @keyframes / animation": `
            <style>
                @keyframes ademo-bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
                @keyframes ademo-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.9)} }
                @keyframes ademo-spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
                @keyframes ademo-swing { 0%,100%{transform:rotate(0deg)} 25%{transform:rotate(12deg)} 75%{transform:rotate(-12deg)} }
            </style>
            <div style="display:flex;gap:14px;align-items:center;padding:4px">
                <div style="width:36px;height:36px;background:#3b82f6;border-radius:8px;animation:ademo-bounce 1s ease infinite;display:flex;align-items:center;justify-content:center;color:#fff;font-size:0.55rem;font-weight:700">弾む</div>
                <div style="width:36px;height:36px;background:#8b5cf6;border-radius:50%;animation:ademo-spin 2s linear infinite;display:flex;align-items:center;justify-content:center;color:#fff;font-size:0.55rem;font-weight:700">回転</div>
                <div style="width:36px;height:36px;background:#ec4899;border-radius:8px;animation:ademo-pulse 1.5s ease-in-out infinite;display:flex;align-items:center;justify-content:center;color:#fff;font-size:0.55rem;font-weight:700">点滅</div>
                <div style="width:36px;height:36px;background:#f97316;border-radius:8px;animation:ademo-swing 1.2s ease-in-out infinite;display:flex;align-items:center;justify-content:center;color:#fff;font-size:0.55rem;font-weight:700">揺れ</div>
            </div>
        `,

        // ===== transform =====
        "transform": `
            <style>
                @keyframes ademo-tf-float { 0%,100%{transform:translateY(0) rotate(0deg)} 25%{transform:translateY(-8px) rotate(5deg)} 50%{transform:translateY(0) rotate(0deg)} 75%{transform:translateY(-4px) rotate(-3deg)} }
                @keyframes ademo-tf-spin3d { from{transform:perspective(200px) rotateY(0deg)} to{transform:perspective(200px) rotateY(360deg)} }
            </style>
            <div style="display:flex;gap:16px;align-items:center;padding:8px">
                <div style="width:44px;height:44px;background:linear-gradient(135deg,#3b82f6,#8b5cf6);border-radius:8px;animation:ademo-tf-float 3s ease-in-out infinite"></div>
                <div style="width:44px;height:44px;background:linear-gradient(135deg,#ec4899,#f97316);border-radius:8px;animation:ademo-tf-spin3d 4s linear infinite"></div>
                <span style="font-size:0.7rem;color:var(--text-muted)">浮遊 & 3D回転</span>
            </div>
        `,

        // ===== box-shadow (CSSデコレーション) =====
        "box-shadow": `
            <style>
                @keyframes ademo-shadow-pulse {
                    0%,100% { box-shadow: 0 4px 12px rgba(59,130,246,0.2); }
                    50% { box-shadow: 0 8px 30px rgba(59,130,246,0.5), 0 0 0 4px rgba(59,130,246,0.1); }
                }
            </style>
            <div style="display:flex;gap:16px;align-items:center;padding:8px">
                <div style="width:64px;height:64px;background:#fff;border-radius:12px;animation:ademo-shadow-pulse 2s ease-in-out infinite;display:flex;align-items:center;justify-content:center;font-size:0.7rem;font-weight:700;color:#3b82f6">影</div>
                <span style="font-size:0.7rem;color:var(--text-muted)">影が脈動</span>
            </div>
        `,

        // ===== filter =====
        "filter": `
            <style>
                @keyframes ademo-filter-cycle {
                    0%   { filter: none; }
                    20%  { filter: blur(2px); }
                    40%  { filter: grayscale(100%); }
                    60%  { filter: sepia(100%); }
                    80%  { filter: hue-rotate(180deg); }
                    100% { filter: none; }
                }
            </style>
            <div style="display:flex;gap:12px;align-items:center;padding:4px">
                <div style="width:70px;height:50px;background:linear-gradient(135deg,#3b82f6,#ec4899);border-radius:8px;animation:ademo-filter-cycle 5s ease-in-out infinite"></div>
                <span style="font-size:0.7rem;color:var(--text-muted)">フィルタが自動で切り替わります</span>
            </div>
        `,

        // ===== backdrop-filter =====
        "backdrop-filter": `
            <style>
                @keyframes ademo-glass-slide { 0%,100%{left:10%} 50%{left:55%} }
            </style>
            <div style="position:relative;border-radius:10px;overflow:hidden;height:70px;background:linear-gradient(135deg,#3b82f6,#ec4899,#f97316)">
                <div style="position:absolute;top:8px;width:42%;height:54px;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);background:rgba(255,255,255,0.2);border:1px solid rgba(255,255,255,0.3);border-radius:8px;animation:ademo-glass-slide 4s ease-in-out infinite;display:flex;align-items:center;justify-content:center">
                    <span style="color:#fff;font-weight:700;font-size:0.7rem;text-shadow:0 1px 4px rgba(0,0,0,0.3)">Glass</span>
                </div>
            </div>
        `,

        // ===== clip-path =====
        "clip-path": `
            <style>
                @keyframes ademo-morph {
                    0%   { clip-path: circle(40% at 50% 50%); }
                    25%  { clip-path: polygon(50% 0%,100% 38%,82% 100%,18% 100%,0% 38%); }
                    50%  { clip-path: polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%); }
                    75%  { clip-path: polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%); }
                    100% { clip-path: circle(40% at 50% 50%); }
                }
            </style>
            <div style="display:flex;gap:12px;align-items:center;padding:4px">
                <div style="width:70px;height:70px;background:linear-gradient(135deg,#3b82f6,#8b5cf6,#ec4899);animation:ademo-morph 6s ease-in-out infinite"></div>
                <span style="font-size:0.7rem;color:var(--text-muted)">形状が変化</span>
            </div>
        `,

        // ===== opacity =====
        "opacity": `
            <style>
                @keyframes ademo-fade { 0%,100%{opacity:1} 50%{opacity:0.15} }
            </style>
            <div style="display:flex;gap:8px;align-items:center;padding:4px">
                <div style="width:50px;height:50px;background:#3b82f6;border-radius:8px;animation:ademo-fade 2s ease-in-out infinite"></div>
                <div style="width:50px;height:50px;background:#8b5cf6;border-radius:8px;animation:ademo-fade 2s 0.5s ease-in-out infinite"></div>
                <div style="width:50px;height:50px;background:#ec4899;border-radius:8px;animation:ademo-fade 2s 1s ease-in-out infinite"></div>
            </div>
        `,

        // ===== linear-gradient / radial-gradient =====
        "linear-gradient / radial-gradient": `
            <style>
                @keyframes ademo-gradient-shift {
                    0%   { background-position: 0% 50%; }
                    50%  { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
            </style>
            <div style="display:flex;gap:10px;padding:4px">
                <div style="width:100px;height:60px;border-radius:8px;background:linear-gradient(270deg,#3b82f6,#8b5cf6,#ec4899,#f97316);background-size:600% 600%;animation:ademo-gradient-shift 4s ease infinite"></div>
                <div style="width:60px;height:60px;border-radius:50%;background:radial-gradient(circle,#fbbf24,#f97316);animation:ademo-fade 3s ease-in-out infinite"></div>
            </div>
        `,

        // ===== border-radius =====
        "border-radius": `
            <style>
                @keyframes ademo-blob {
                    0%,100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
                    25%     { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
                    50%     { border-radius: 50% 60% 30% 60% / 30% 50% 70% 50%; }
                    75%     { border-radius: 60% 30% 50% 40% / 70% 40% 60% 30%; }
                }
            </style>
            <div style="display:flex;gap:12px;align-items:center;padding:4px">
                <div style="width:64px;height:64px;background:linear-gradient(135deg,#3b82f6,#8b5cf6);animation:ademo-blob 5s ease-in-out infinite"></div>
                <span style="font-size:0.7rem;color:var(--text-muted)">有機的な形状変化</span>
            </div>
        `,

        // ===== mix-blend-mode =====
        "mix-blend-mode": `
            <style>
                @keyframes ademo-blend-move { 0%,100%{transform:translateX(0)} 50%{transform:translateX(25px)} }
            </style>
            <div style="position:relative;width:120px;height:60px;padding:4px">
                <div style="position:absolute;width:50px;height:50px;background:#3b82f6;border-radius:50%;top:5px;left:10px;animation:ademo-blend-move 3s ease-in-out infinite"></div>
                <div style="position:absolute;width:50px;height:50px;background:#ef4444;border-radius:50%;top:5px;left:40px;mix-blend-mode:screen;animation:ademo-blend-move 3s 1.5s ease-in-out infinite"></div>
            </div>
        `,

        // ===== CSS ボタンスタイル =====
        "CSS ボタンスタイル": `
            <style>
                .ademo-btn { padding:8px 18px;border:none;border-radius:8px;color:#fff;cursor:pointer;font-size:0.8rem;font-weight:600;transition:all 0.2s }
                .ademo-btn:hover { transform:translateY(-2px);box-shadow:0 4px 12px rgba(0,0,0,0.2) }
                .ademo-btn:active { transform:translateY(0);box-shadow:none }
            </style>
            <div style="display:flex;gap:8px;padding:4px;flex-wrap:wrap">
                <button class="ademo-btn" style="background:#3b82f6">Primary</button>
                <button class="ademo-btn" style="background:#10b981">Success</button>
                <button class="ademo-btn" style="background:transparent;color:#3b82f6;border:2px solid #3b82f6">Outline</button>
            </div>
        `,

        // ===== CSS :hover / :focus / :active 状態 =====
        "CSS :hover / :focus / :active 状態": `
            <style>
                .ademo-interact {
                    padding:10px 22px; background:#3b82f6; color:#fff;
                    border:none; border-radius:8px; cursor:pointer;
                    font-size:0.85rem; font-weight:600;
                    transition:all 0.2s ease; outline:none;
                }
                .ademo-interact:hover { background:#2563eb;transform:scale(1.05);box-shadow:0 6px 20px rgba(37,99,235,0.4) }
                .ademo-interact:active { background:#1d4ed8;transform:scale(0.97);box-shadow:none }
                .ademo-interact:focus-visible { outline:3px solid #93c5fd;outline-offset:3px }
            </style>
            <div style="padding:4px">
                <button class="ademo-interact">ホバー / クリック / Tab</button>
            </div>
        `,

        // ===== CSS ローディングボタン =====
        "CSS ローディングボタン": `
            <style>
                @keyframes ademo-btn-spin { to{transform:rotate(360deg)} }
            </style>
            <div style="display:flex;gap:10px;align-items:center;padding:4px">
                <button disabled style="padding:8px 18px;background:#3b82f6;color:#fff;border:none;border-radius:8px;cursor:not-allowed;font-size:0.8rem;display:inline-flex;align-items:center;gap:6px;opacity:0.85">
                    <span style="display:inline-block;width:14px;height:14px;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:ademo-btn-spin 0.6s linear infinite"></span>
                    送信中...
                </button>
                <button style="padding:8px 18px;background:#3b82f6;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:0.8rem">送信</button>
            </div>
        `,

        // ===== ローディングスピナー =====
        "ローディングスピナー": `
            <style>
                @keyframes ademo-spin2 { to{transform:rotate(360deg)} }
                @keyframes ademo-dots { to{opacity:0.2;transform:translateY(-8px)} }
                @keyframes ademo-bar {
                    0%{transform:scaleY(0.4)} 20%{transform:scaleY(1)} 40%{transform:scaleY(0.4)}
                }
            </style>
            <div style="display:flex;gap:20px;align-items:center;padding:8px">
                <div style="width:28px;height:28px;border:3px solid #e5e7eb;border-top-color:#3b82f6;border-radius:50%;animation:ademo-spin2 0.8s linear infinite"></div>
                <div style="display:flex;gap:4px;align-items:end">
                    <div style="width:4px;height:20px;background:#8b5cf6;border-radius:2px;animation:ademo-bar 1s ease-in-out infinite"></div>
                    <div style="width:4px;height:20px;background:#8b5cf6;border-radius:2px;animation:ademo-bar 1s 0.15s ease-in-out infinite"></div>
                    <div style="width:4px;height:20px;background:#8b5cf6;border-radius:2px;animation:ademo-bar 1s 0.3s ease-in-out infinite"></div>
                    <div style="width:4px;height:20px;background:#8b5cf6;border-radius:2px;animation:ademo-bar 1s 0.45s ease-in-out infinite"></div>
                </div>
                <div style="display:flex;gap:5px">
                    <div style="width:8px;height:8px;background:#ec4899;border-radius:50%;animation:ademo-dots 0.6s infinite alternate"></div>
                    <div style="width:8px;height:8px;background:#ec4899;border-radius:50%;animation:ademo-dots 0.6s 0.2s infinite alternate"></div>
                    <div style="width:8px;height:8px;background:#ec4899;border-radius:50%;animation:ademo-dots 0.6s 0.4s infinite alternate"></div>
                </div>
            </div>
        `,

        // ===== スケルトンスクリーン =====
        "スケルトンスクリーン": `
            <style>
                @keyframes ademo-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
                .ademo-skel {
                    background: linear-gradient(90deg,#e5e7eb 25%,#f3f4f6 50%,#e5e7eb 75%);
                    background-size: 200% 100%;
                    animation: ademo-shimmer 1.5s infinite;
                    border-radius: 4px;
                }
            </style>
            <div style="max-width:180px;padding:10px;border-radius:8px;border:1px solid var(--border)">
                <div class="ademo-skel" style="width:100%;height:50px;margin-bottom:8px"></div>
                <div class="ademo-skel" style="width:75%;height:10px;margin-bottom:6px"></div>
                <div class="ademo-skel" style="width:100%;height:10px;margin-bottom:6px"></div>
                <div class="ademo-skel" style="width:45%;height:10px"></div>
            </div>
        `,

        // ===== scroll-snap =====
        "scroll-snap (CSSスクロールスナップ)": `
            <div style="display:flex;overflow-x:auto;scroll-snap-type:x mandatory;gap:8px;padding:6px;border-radius:8px;background:var(--bg-primary);max-width:100%;-webkit-overflow-scrolling:touch">
                <div style="scroll-snap-align:start;min-width:140px;height:65px;background:linear-gradient(135deg,#3b82f6,#8b5cf6);border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:0.8rem;flex-shrink:0">スライド 1</div>
                <div style="scroll-snap-align:start;min-width:140px;height:65px;background:linear-gradient(135deg,#8b5cf6,#ec4899);border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:0.8rem;flex-shrink:0">スライド 2</div>
                <div style="scroll-snap-align:start;min-width:140px;height:65px;background:linear-gradient(135deg,#ec4899,#f97316);border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:0.8rem;flex-shrink:0">スライド 3</div>
                <div style="scroll-snap-align:start;min-width:140px;height:65px;background:linear-gradient(135deg,#f97316,#eab308);border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:0.8rem;flex-shrink:0">スライド 4</div>
            </div>
        `,

        // ===== text-shadow =====
        "text-shadow": `
            <style>
                @keyframes ademo-neon-flicker {
                    0%,100% { text-shadow:0 0 7px #3b82f6,0 0 15px #3b82f6,0 0 30px #3b82f6; opacity:1; }
                    50% { text-shadow:0 0 4px #3b82f6,0 0 10px #3b82f6; opacity:0.85; }
                }
            </style>
            <div style="background:#0f172a;padding:12px;border-radius:8px;text-align:center">
                <span style="font-size:1.3rem;font-weight:900;color:#fff;animation:ademo-neon-flicker 2s ease-in-out infinite">NEON TEXT</span>
            </div>
        `,

        // ===== background-clip =====
        "background-clip": `
            <style>
                @keyframes ademo-bg-shift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
            </style>
            <p style="font-size:1.5rem;font-weight:900;background:linear-gradient(270deg,#3b82f6,#ec4899,#f97316,#3b82f6);background-size:300% 300%;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent;animation:ademo-bg-shift 4s ease infinite;margin:0;padding:4px">
                グラデーション文字
            </p>
        `,

        // ===== CSS カスタムプロパティ（変数） =====
        "CSS カスタムプロパティ（変数）": `
            <style>
                @keyframes ademo-var-hue { 0%{--ademo-hue:220} 33%{--ademo-hue:280} 66%{--ademo-hue:340} 100%{--ademo-hue:220} }
                @property --ademo-hue { syntax:'<number>'; inherits:false; initial-value:220; }
                .ademo-var-box { animation:ademo-var-hue 4s linear infinite; background:hsl(var(--ademo-hue) 80% 55%); }
            </style>
            <div style="display:flex;gap:10px;align-items:center;padding:4px">
                <div class="ademo-var-box" style="width:60px;height:60px;border-radius:10px;transition:background 0.3s"></div>
                <span style="font-size:0.7rem;color:var(--text-muted)">@property で<br>色相をアニメーション</span>
            </div>
        `,

        // ===== color-mix() =====
        "color-mix()": `
            <style>
                @keyframes ademo-mix-shift { 0%,100%{background:color-mix(in oklch,#3b82f6 90%,white)} 50%{background:color-mix(in oklch,#3b82f6 30%,white)} }
            </style>
            <div style="display:flex;gap:4px;padding:4px">
                <div style="width:40px;height:40px;background:color-mix(in srgb,#3b82f6 100%,white);border-radius:6px;animation:ademo-mix-shift 3s ease-in-out infinite"></div>
                <div style="width:40px;height:40px;background:color-mix(in srgb,#3b82f6 75%,white);border-radius:6px;animation:ademo-mix-shift 3s 0.5s ease-in-out infinite"></div>
                <div style="width:40px;height:40px;background:color-mix(in srgb,#3b82f6 50%,white);border-radius:6px;animation:ademo-mix-shift 3s 1s ease-in-out infinite"></div>
                <div style="width:40px;height:40px;background:color-mix(in srgb,#3b82f6 25%,white);border-radius:6px;animation:ademo-mix-shift 3s 1.5s ease-in-out infinite"></div>
            </div>
        `,

        // ===== プログレスバー =====
        "プログレスバー": `
            <style>
                @keyframes ademo-progress-fill { 0%{width:0%} 100%{width:85%} }
                @keyframes ademo-progress-glow { 0%,100%{box-shadow:none} 50%{box-shadow:0 0 8px rgba(59,130,246,0.6)} }
            </style>
            <div style="padding:6px">
                <div style="font-size:0.75rem;margin-bottom:4px;color:var(--text-secondary)">アップロード中... 85%</div>
                <div style="background:#e5e7eb;border-radius:9999px;height:10px;overflow:hidden">
                    <div style="height:100%;background:linear-gradient(90deg,#3b82f6,#8b5cf6);border-radius:9999px;animation:ademo-progress-fill 2s ease-out forwards,ademo-progress-glow 2s ease-in-out infinite"></div>
                </div>
            </div>
        `,

        // ===== conic-gradient() =====
        "conic-gradient()": `
            <style>
                @keyframes ademo-pie-grow {
                    0%   { background:conic-gradient(#3b82f6 0% 0%,#e5e7eb 0% 100%); }
                    100% { background:conic-gradient(#3b82f6 0% 75%,#e5e7eb 75% 100%); }
                }
                @keyframes ademo-hue-wheel { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
            </style>
            <div style="display:flex;gap:14px;align-items:center;padding:4px">
                <div style="width:60px;height:60px;border-radius:50%;animation:ademo-pie-grow 2s ease-out forwards"></div>
                <div style="width:60px;height:60px;border-radius:50%;background:conic-gradient(from 0deg,red,yellow,lime,aqua,blue,magenta,red);animation:ademo-hue-wheel 6s linear infinite"></div>
            </div>
        `,

        // ===== アバター / プロフィール画像 =====
        "アバター / プロフィール画像": `
            <style>
                @keyframes ademo-status-blink { 0%,100%{opacity:1} 50%{opacity:0.4} }
            </style>
            <div style="display:flex;gap:8px;align-items:end;padding:4px">
                <div style="width:32px;height:32px;border-radius:50%;background:#3b82f6;display:flex;align-items:center;justify-content:center;color:#fff;font-size:0.7rem;font-weight:700">S</div>
                <div style="width:40px;height:40px;border-radius:50%;background:#8b5cf6;display:flex;align-items:center;justify-content:center;color:#fff;font-size:0.8rem;font-weight:700">M</div>
                <div style="position:relative;width:48px;height:48px">
                    <div style="width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,#ec4899,#f97316);display:flex;align-items:center;justify-content:center;color:#fff;font-size:0.9rem;font-weight:700">L</div>
                    <span style="position:absolute;bottom:0;right:0;width:14px;height:14px;background:#22c55e;border:2px solid #fff;border-radius:50%;animation:ademo-status-blink 2s ease-in-out infinite"></span>
                </div>
            </div>
        `,

        // ===== View Transitions API =====
        "View Transitions API": `
            <style>
                @keyframes ademo-vt-old { from{opacity:1;transform:scale(1)} to{opacity:0;transform:scale(0.9)} }
                @keyframes ademo-vt-new { from{opacity:0;transform:scale(1.1)} to{opacity:1;transform:scale(1)} }
                .ademo-vt-box { width:80px;height:50px;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:0.65rem;font-weight:700 }
            </style>
            <div style="display:flex;gap:8px;align-items:center;padding:4px">
                <div class="ademo-vt-box" style="background:#ef4444;animation:ademo-vt-old 1.5s ease-in-out infinite alternate">Old</div>
                <span style="font-size:1.2rem;color:var(--text-muted)">→</span>
                <div class="ademo-vt-box" style="background:#22c55e;animation:ademo-vt-new 1.5s ease-in-out infinite alternate">New</div>
            </div>
        `,
    };

    /**
     * 指定の項目名に対してアニメーションデモがあれば返す
     * @param {string} itemName - item.name（HTMLエスケープ前）
     * @returns {string|null} アニメーションデモHTML、なければnull
     */
    function get(itemName) {
        // 完全一致
        if (demos[itemName]) return demos[itemName];

        // HTMLエスケープ済みの名前での照合
        const decoded = itemName
            .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&').replace(/&quot;/g, '"');
        if (demos[decoded]) return demos[decoded];

        return null;
    }

    /**
     * アニメーションデモが存在するか
     */
    function has(itemName) {
        return get(itemName) !== null;
    }

    return { get, has };
})();
