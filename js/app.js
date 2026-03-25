/**
 * Web UIコンポーネント辞典 — メインアプリケーション
 */
const App = (() => {
    // ===== 状態管理 =====
    let DATA = [];
    let allCards = [];
    let activeCategory = 'all';
    let activeLabel = 'all'; // HTML/CSS/JS フィルタ

    // ===== DOM参照 =====
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);

    // ===== 初期化 =====
    async function init() {
        showLoading(true);
        try {
            DATA = await DataLoader.loadWithFallback(window.INLINE_DATA);
        } catch (e) {
            console.error('データ読み込みエラー:', e);
            DATA = window.INLINE_DATA || [];
        }
        buildCategoryTabs();
        buildLabelFilter();
        buildStats();
        buildCards();
        setupSearch();
        setupScrollTop();
        setupKeyboardShortcuts();
        setupSidebar();
        setupThemeToggle();
        showLoading(false);
        runPostRenderSetup();
    }

    // ===== ローディング表示 =====
    function showLoading(show) {
        const el = $('#loadingIndicator');
        if (el) el.style.display = show ? 'flex' : 'none';
    }

    // ===== カテゴリメニュー構築 =====
    function buildCategoryTabs() {
        // HTML構造変更対応: id="sidebarNav" を優先
        const container = $('#sidebarNav') || $('#categoryTabs');
        if (!container) return;
        
        let html = `<a href="#" class="cat-tab active" data-cat="all"><span>🌟</span> 全体表示</a>`;
        DATA.forEach(c => {
            const count = c.items ? c.items.length : 0;
            html += `<a href="#" class="cat-tab" data-cat="${esc(c.cat)}"><span>${c.catIcon}</span> ${esc(c.cat)} <span class="cat-count">${count}</span></a>`;
        });
        container.innerHTML = html;
        container.addEventListener('click', (e) => {
            const tab = e.target.closest('.cat-tab');
            if (!tab) return;
            e.preventDefault();
            
            container.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            activeCategory = tab.dataset.cat;
            filterCards();
            
            // カテゴリ先頭にスクロール
            if (activeCategory !== 'all') {
                const section = $(`[data-cat="${CSS.escape(activeCategory)}"]`);
                if (section) {
                    const y = section.getBoundingClientRect().top + window.scrollY - 180;
                    window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
                }
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
            
            // モバイル時はサイドバーを閉じる
            if (window.innerWidth <= 768) {
                const sidebar = $('#sidebar');
                const overlay = $('#sidebarOverlay');
                if (sidebar) sidebar.style.transform = 'translateX(-100%)';
                if (overlay) overlay.style.display = 'none';
            }
        });
    }

    // ===== テーマ切り替え =====
    function setupThemeToggle() {
        const btn = $('#themeToggle');
        if (!btn) return;
        
        const savedTheme = localStorage.getItem('ui-dict-theme');
        if (savedTheme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
            btn.textContent = '🌙';
        }
        
        btn.addEventListener('click', () => {
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            if (isDark) {
                document.documentElement.removeAttribute('data-theme');
                localStorage.setItem('ui-dict-theme', 'light');
                btn.textContent = '☀️';
            } else {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('ui-dict-theme', 'dark');
                btn.textContent = '🌙';
            }
        });
    }

    // ===== サイドバー設定 =====
    function setupSidebar() {
        const toggleBtn = $('#sidebarToggle');
        const closeBtn = $('#sidebarClose');
        const sidebar = $('#sidebar');
        const overlay = $('#sidebarOverlay');

        if (!sidebar || !toggleBtn) return;

        function openSidebar() {
            sidebar.style.transform = 'translateX(0)';
            if (overlay) overlay.style.display = 'block';
        }

        function closeSidebar() {
            if (window.innerWidth <= 768) {
                sidebar.style.transform = 'translateX(-100%)';
                if (overlay) overlay.style.display = 'none';
            }
        }

        toggleBtn.addEventListener('click', openSidebar);
        if (closeBtn) closeBtn.addEventListener('click', closeSidebar);
        if (overlay) overlay.addEventListener('click', closeSidebar);
        
        // リサイズ時のリセット
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                sidebar.style.transform = '';
                if (overlay) overlay.style.display = 'none';
            } else {
                sidebar.style.transform = 'translateX(-100%)';
            }
        });
        
        // 初期状態の適用
        if (window.innerWidth <= 768) {
            sidebar.style.transform = 'translateX(-100%)';
        }
    }

    // ===== ラベルフィルタ (HTML/CSS/JS) =====
    function buildLabelFilter() {
        const container = $('#labelFilter');
        if (!container) return;
        const labels = ['all', 'HTML', 'CSS', 'JS'];
        const labelNames = { all: 'すべて', HTML: 'HTML', CSS: 'CSS', JS: 'JS' };
        const labelColors = { all: '', HTML: 'label-html', CSS: 'label-css', JS: 'label-js' };

        container.innerHTML = labels.map(l =>
            `<button class="label-filter-btn ${l === 'all' ? 'active' : ''} ${labelColors[l]}" data-label="${l}">${labelNames[l]}</button>`
        ).join('');

        container.addEventListener('click', (e) => {
            const btn = e.target.closest('.label-filter-btn');
            if (!btn) return;
            container.querySelectorAll('.label-filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeLabel = btn.dataset.label;
            filterCards();
        });
    }

    // ===== 統計バー =====
    function buildStats() {
        let totalItems = 0, htmlCount = 0, cssCount = 0, jsCount = 0;
        DATA.forEach(c => {
            c.items.forEach(item => {
                totalItems++;
                if (item.label === 'HTML') htmlCount++;
                else if (item.label === 'CSS') cssCount++;
                else if (item.label === 'JS') jsCount++;
            });
        });
        $('#statsBar').innerHTML = `
      <div class="stat-item">総コンポーネント: <span class="stat-num">&nbsp;${totalItems}</span></div>
      <div class="stat-item">HTML: <span class="stat-num">&nbsp;${htmlCount}</span></div>
      <div class="stat-item">CSS: <span class="stat-num">&nbsp;${cssCount}</span></div>
      <div class="stat-item">JS: <span class="stat-num">&nbsp;${jsCount}</span></div>
      <div class="stat-item">カテゴリ: <span class="stat-num">&nbsp;${DATA.length}</span></div>
    `;
    }

    // ===== カード構築 =====
    function buildCards() {
        const main = $('#mainContent');
        let html = '';
        DATA.forEach((cat, catIdx) => {
            html += `<div class="category-section" data-cat="${esc(cat.cat)}" id="cat-${catIdx}">`;
            html += `<div class="category-title"><span class="icon">${cat.catIcon}</span>${esc(cat.cat)}</div>`;
            html += `<div class="category-desc">${esc(cat.catDesc)}</div>`;
            html += `<div class="cards-grid">`;
            cat.items.forEach((item, idx) => {
                const cardId = `card-${catIdx}-${idx}`;
                html += buildCardHTML(item, cardId);
            });
            html += `</div></div>`;
        });
        main.innerHTML = html;
        allCards = Array.from($$('.component-card'));
    }

    // ===== 個別カードHTML生成 =====
    function buildCardHTML(item, cardId) {
        const tagsHTML = (item.tags || []).map(t =>
            `<span class="item-tag">${esc(t)}</span>`
        ).join('');

        const browserHTML = item.browser
            ? `<span class="browser-badge">${esc(item.browser)}</span>`
            : '';

        const mdnHTML = item.mdn
            ? `<a href="${esc(item.mdn)}" target="_blank" rel="noopener" class="mdn-link" onclick="event.stopPropagation()">MDN ↗</a>`
            : '';

        const propsContent = item.props && item.props.length
            ? '<h4>プロパティ / 属性</h4><div class="prop-list">' +
            item.props.map(p =>
                `<div class="prop-item"><span class="prop-name">${esc(p.name)}</span><span class="prop-desc">${esc(p.desc)}</span></div>`
            ).join('') + '</div>'
            : '<p style="color:#9ca3af;font-size:0.8rem">特筆すべきプロパティはありません。</p>';

        return `
      <div class="component-card" data-cat="${esc(item.label)}" data-label="${esc(item.label)}"
           data-search="${esc(item.name)} ${esc(item.desc)} ${esc(item.label)} ${(item.tags || []).join(' ')}"
           id="${cardId}">
        <div class="card-header">
          <span class="card-tag-name">${item.name}</span>
          <div class="card-header-right">
            ${mdnHTML}
            <span class="card-label ${item.labelClass}">${esc(item.label)}</span>
          </div>
        </div>
        <div class="card-desc">${item.desc}</div>
        ${tagsHTML ? `<div class="card-tags">${tagsHTML}</div>` : ''}
        ${browserHTML ? `<div class="card-browser">${browserHTML}</div>` : ''}
        <div class="card-demo">${item.demo}</div>
        <div class="card-toggle">
          <button onclick="event.stopPropagation();App.toggleCode('${cardId}')" class="active">コード</button>
          <button onclick="event.stopPropagation();App.toggleProps('${cardId}')">プロパティ</button>
        </div>
        <div class="card-code" id="${cardId}-code">
          <pre>${escHTML(item.code)}</pre>
          <button class="copy-btn" onclick="event.stopPropagation();App.copyCode(this)">コピー</button>
        </div>
        <div class="card-properties" id="${cardId}-props">
          ${propsContent}
        </div>
      </div>
    `;
    }

    // ===== コード表示トグル =====
    function toggleCode(cardId) {
        const codeEl = $(`#${cardId}-code`);
        const propsEl = $(`#${cardId}-props`);
        if (!codeEl || !propsEl) return;
        codeEl.classList.remove('hidden');
        propsEl.classList.remove('show');
        const btns = codeEl.closest('.component-card').querySelectorAll('.card-toggle button');
        btns[0].classList.add('active');
        btns[1].classList.remove('active');
    }

    // ===== プロパティ表示トグル =====
    function toggleProps(cardId) {
        const codeEl = $(`#${cardId}-code`);
        const propsEl = $(`#${cardId}-props`);
        if (!codeEl || !propsEl) return;
        codeEl.classList.add('hidden');
        propsEl.classList.add('show');
        const btns = codeEl.closest('.component-card').querySelectorAll('.card-toggle button');
        btns[0].classList.remove('active');
        btns[1].classList.add('active');
    }

    // ===== コピー =====
    function copyCode(btn) {
        const pre = btn.closest('.card-code').querySelector('pre');
        if (!pre) return;
        const text = pre.textContent;
        navigator.clipboard.writeText(text).then(() => {
            const orig = btn.textContent;
            btn.textContent = 'コピー済み!';
            btn.style.background = '#16a34a';
            setTimeout(() => { btn.textContent = orig; btn.style.background = ''; }, 1500);
        });
    }

    // ===== 検索 =====
    function setupSearch() {
        const input = $('#searchInput');
        let debounceTimer;
        input.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => filterCards(), 150);
        });
    }

    // ===== フィルター（カテゴリ + ラベル + 検索を統合） =====
    function filterCards() {
        const query = ($('#searchInput').value || '').toLowerCase();
        const sections = $$('.category-section');
        let visibleCount = 0;

        sections.forEach(section => {
            const sectionCat = section.dataset.cat;
            let sectionVisible = false;

            // カテゴリフィルタ
            if (activeCategory !== 'all' && sectionCat !== activeCategory) {
                section.classList.add('hidden');
                return;
            }
            section.classList.remove('hidden');

            const cards = section.querySelectorAll('.component-card');
            cards.forEach(card => {
                const searchText = card.dataset.search.toLowerCase();
                const label = card.dataset.label;

                const matchCategory = true; // 既にセクションレベルでフィルタ済み
                const matchLabel = activeLabel === 'all' || label === activeLabel;
                const matchSearch = !query || searchText.includes(query);

                const visible = matchCategory && matchLabel && matchSearch;
                card.style.display = visible ? '' : 'none';
                if (visible) {
                    sectionVisible = true;
                    visibleCount++;
                }
            });

            section.style.display = sectionVisible ? '' : 'none';
        });

        // 検索結果なし表示
        const noResult = $('#noResult');
        if (noResult) {
            noResult.style.display = visibleCount === 0 ? 'block' : 'none';
        }
    }

    // ===== スクロールトップ =====
    function setupScrollTop() {
        const btn = $('#scrollTop');
        window.addEventListener('scroll', () => {
            btn.style.display = window.scrollY > 400 ? 'block' : 'none';
        }, { passive: true });
    }

    // ===== キーボードショートカット =====
    function setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+K or / で検索にフォーカス
            if ((e.ctrlKey && e.key === 'k') || (e.key === '/' && !isInputFocused())) {
                e.preventDefault();
                $('#searchInput').focus();
            }
            // Escape で検索クリア
            if (e.key === 'Escape') {
                const input = $('#searchInput');
                if (document.activeElement === input) {
                    input.value = '';
                    input.blur();
                    filterCards();
                }
            }
        });
    }

    function isInputFocused() {
        const tag = document.activeElement?.tagName;
        return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' ||
            document.activeElement?.contentEditable === 'true';
    }

    // ===== デモ後処理（Canvas等） =====
    function runPostRenderSetup() {
        // Canvas デモ
        const canvas = document.getElementById('demoCanvas');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#2563eb';
            ctx.fillRect(10, 15, 60, 50);
            ctx.fillStyle = '#7c3aed';
            ctx.beginPath();
            ctx.arc(130, 40, 30, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#16a34a';
            ctx.beginPath();
            ctx.moveTo(75, 15);
            ctx.lineTo(105, 60);
            ctx.lineTo(75, 60);
            ctx.closePath();
            ctx.fill();
        }

        // イベントカウンター デモ
        const evtBtn = document.getElementById('evtBtn');
        if (evtBtn) {
            let count = 0;
            evtBtn.addEventListener('click', () => {
                count++;
                evtBtn.textContent = `クリックカウント: ${count}`;
            });
        }
    }

    // ===== ユーティリティ =====
    function esc(str) {
        if (!str) return '';
        const d = document.createElement('div');
        d.textContent = str;
        return d.innerHTML;
    }

    function escHTML(str) {
        if (!str) return '';
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    // ===== 公開API =====
    return {
        init,
        toggleCode,
        toggleProps,
        copyCode,
        filterCards
    };
})();

// 起動
document.addEventListener('DOMContentLoaded', () => App.init());
