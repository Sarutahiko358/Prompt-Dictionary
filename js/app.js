/**
 * Web UIコンポーネント辞典 — メインアプリケーション v2.1
 * サイドバーナビゲーション修正版
 */
const App = (() => {
    let DATA = [];
    let allCards = [];
    let activeCategory = 'all';
    let activeLabel = 'all';

    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);

    async function init() {
        showLoading(true);
        initTheme();
        try {
            DATA = await DataLoader.loadWithFallback(window.INLINE_DATA);
        } catch (e) {
            console.error('データ読み込みエラー:', e);
            DATA = window.INLINE_DATA || [];
        }
        buildSidebar();
        buildLabelFilter();
        buildStats();
        buildCards();
        setupSearch();
        setupScrollTop();
        setupKeyboardShortcuts();
        setupSidebarToggle();
        setupDeepLink();
        showLoading(false);
        runPostRenderSetup();
        handleInitialHash();
    }

    function showLoading(show) {
        const el = $('#loadingIndicator');
        if (el) el.style.display = show ? 'flex' : 'none';
    }

    // ===== テーマ =====
    function initTheme() {
        const saved = localStorage.getItem('ui-dict-theme');
        const preferDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        applyTheme(saved || (preferDark ? 'dark' : 'light'));

        const btn = $('#themeToggle');
        if (btn) {
            btn.addEventListener('click', () => {
                const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
                applyTheme(next);
                localStorage.setItem('ui-dict-theme', next);
            });
        }
    }

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        const btn = $('#themeToggle');
        if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
    }

    // ===== サイドバー構築 =====
    function buildSidebar() {
        const nav = $('#sidebarNav');
        if (!nav) return;

        const total = DATA.reduce((s, c) => s + (c.items ? c.items.length : 0), 0);
        let html = `<a href="#" class="sidebar-link active" data-cat="all">
            <span>📚</span> すべて
            <span class="cat-count">${total}</span>
        </a>`;

        DATA.forEach((c, idx) => {
            const count = c.items ? c.items.length : 0;
            html += `<a href="#cat-${idx}" class="sidebar-link" data-cat="${esc(c.cat)}">
                <span>${c.catIcon}</span> ${esc(c.cat)}
                <span class="cat-count">${count}</span>
            </a>`;
        });

        nav.innerHTML = html;

        nav.addEventListener('click', (e) => {
            const link = e.target.closest('.sidebar-link');
            if (!link) return;
            e.preventDefault();

            // アクティブ更新
            nav.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            activeCategory = link.dataset.cat;

            // まずサイドバーを閉じる（モバイル）
            closeSidebar();

            // フィルタ実行
            filterCards();

            // スクロール（フィルタ後に少し待ってから）
            if (activeCategory !== 'all') {
                const href = link.getAttribute('href');
                if (href && href !== '#') {
                    // requestAnimationFrame で DOM更新後にスクロール
                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                            const section = $(href);
                            if (section) {
                                const y = section.getBoundingClientRect().top + window.scrollY - 180;
                                window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
                            }
                        });
                    });
                }
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }

            // URLハッシュ更新
            const idx = DATA.findIndex(c => c.cat === activeCategory);
            const hash = activeCategory === 'all' ? '' : `cat-${idx}`;
            history.replaceState(null, '', hash ? `#${hash}` : window.location.pathname);
        });
    }

    // ===== サイドバー開閉 =====
    function setupSidebarToggle() {
        const toggle = $('#sidebarToggle');
        const close = $('#sidebarClose');
        const overlay = $('#sidebarOverlay');

        if (toggle) toggle.addEventListener('click', openSidebar);
        if (close) close.addEventListener('click', closeSidebar);
        if (overlay) overlay.addEventListener('click', closeSidebar);

        window.addEventListener('resize', () => {
            if (window.innerWidth > 1024) {
                $('#sidebar')?.classList.remove('open');
                $('#sidebarOverlay')?.classList.remove('open');
                document.body.style.overflow = '';
            }
        });
    }

    function openSidebar() {
        $('#sidebar')?.classList.add('open');
        $('#sidebarOverlay')?.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeSidebar() {
        $('#sidebar')?.classList.remove('open');
        $('#sidebarOverlay')?.classList.remove('open');
        document.body.style.overflow = '';
    }

    // ===== スクロールスパイ =====
    function setupScrollSpy() {
        const sections = $$('.category-section');
        if (!sections.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && activeCategory === 'all') {
                    const catName = entry.target.dataset.cat;
                    const links = $$('.sidebar-link');
                    links.forEach(l => l.classList.remove('active'));
                    const target = Array.from(links).find(l => l.dataset.cat === catName);
                    if (target) {
                        target.classList.add('active');
                        target.scrollIntoView({ block: 'nearest' });
                    }
                }
            });
        }, { rootMargin: '-20% 0px -70% 0px', threshold: 0 });

        sections.forEach(s => observer.observe(s));
    }

    // ===== ラベルフィルタ =====
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
            (c.items || []).forEach(item => {
                totalItems++;
                if (item.label === 'HTML') htmlCount++;
                else if (item.label === 'CSS') cssCount++;
                else if (item.label === 'JS') jsCount++;
            });
        });
        const el = $('#statsBar');
        if (el) {
            el.innerHTML = `
                <div class="stat-item">総数: <span class="stat-num">&nbsp;${totalItems}</span></div>
                <div class="stat-item">HTML: <span class="stat-num">&nbsp;${htmlCount}</span></div>
                <div class="stat-item">CSS: <span class="stat-num">&nbsp;${cssCount}</span></div>
                <div class="stat-item">JS: <span class="stat-num">&nbsp;${jsCount}</span></div>
                <div class="stat-item">カテゴリ: <span class="stat-num">&nbsp;${DATA.length}</span></div>
            `;
        }
    }

    // ===== カード構築 =====
    function buildCards() {
        const main = $('#mainContent');
        if (!main) return;
        let html = '';
        DATA.forEach((cat, catIdx) => {
            const count = cat.items ? cat.items.length : 0;
            html += `<div class="category-section" data-cat="${esc(cat.cat)}" id="cat-${catIdx}">`;
            html += `<div class="category-title">
                <span class="icon">${cat.catIcon}</span>${esc(cat.cat)}
                <span class="cat-item-count">${count}項目</span>
            </div>`;
            html += `<div class="category-desc">${esc(cat.catDesc)}</div>`;
            html += `<div class="cards-grid">`;
            (cat.items || []).forEach((item, idx) => {
                html += buildCardHTML(item, `card-${catIdx}-${idx}`);
            });
            html += `</div></div>`;
        });
        main.innerHTML = html;
        allCards = Array.from($$('.component-card'));

        // アコーディオン

        $$('.card-header').forEach(header => {
            header.addEventListener('click', (e) => {
                if (e.target.closest('.mdn-link') || e.target.closest('.card-label')) return;
                header.closest('.component-card').classList.toggle('open');
            });
        });

        setupScrollSpy();
    }

    function buildCardHTML(item, cardId) {
        const tagsHTML = (item.tags || []).map(t =>
            `<span class="item-tag">${esc(t)}</span>`
        ).join('');

        const browserHTML = item.browser
            ? `<span class="browser-badge">${esc(item.browser)}</span>` : '';

        const mdnHTML = item.mdn
            ? `<a href="${esc(item.mdn)}" target="_blank" rel="noopener" class="mdn-link" onclick="event.stopPropagation()">MDN ↗</a>` : '';

        const propsContent = item.props && item.props.length
            ? '<h4>プロパティ / 属性</h4><div class="prop-list">' +
            item.props.map(p =>
                `<div class="prop-item"><span class="prop-name">${esc(p.name)}</span><span class="prop-desc">${esc(p.desc)}</span></div>`
            ).join('') + '</div>'
            : '<p style="color:var(--text-muted);font-size:0.8rem">特筆すべきプロパティはありません。</p>';

        return `
        <div class="component-card" data-label="${esc(item.label)}"
             data-search="${esc(item.name)} ${esc(item.desc)} ${esc(item.label)} ${(item.tags || []).join(' ')}"
             id="${cardId}">
            <div class="card-header">
                <div class="card-header-left">
                    <span class="card-expand-icon">▶</span>
                    <span class="card-tag-name">${item.name}</span>
                </div>
                <div class="card-header-right">
                    ${mdnHTML}
                    <span class="card-label ${item.labelClass || ''}">${esc(item.label)}</span>
                </div>
            </div>
            <div class="card-summary">
                <div class="card-desc">${item.desc}</div>
                ${tagsHTML ? `<div class="card-tags">${tagsHTML}</div>` : ''}
                ${browserHTML ? `<div class="card-browser">${browserHTML}</div>` : ''}
            </div>
            <div class="card-detail">
                <div class="card-demo">${item.demo || ''}</div>
                <div class="card-toggle">
                    <button onclick="event.stopPropagation();App.toggleCode('${cardId}')" class="active">コード</button>
                    <button onclick="event.stopPropagation();App.toggleProps('${cardId}')">プロパティ</button>
                </div>
                <div class="card-code" id="${cardId}-code">
                    <pre>${escHTML(item.code || '')}</pre>
                    <button class="copy-btn" onclick="event.stopPropagation();App.copyCode(this)">📋 コピー</button>
                </div>
                <div class="card-properties" id="${cardId}-props">
                    ${propsContent}
                </div>
            </div>
        </div>`;
    }

    // ===== トグル =====
    function toggleCode(cardId) {
        const codeEl = $(`#${cardId}-code`);
        const propsEl = $(`#${cardId}-props`);
        if (!codeEl || !propsEl) return;
        codeEl.classList.remove('hidden');
        propsEl.classList.remove('show');
        const card = codeEl.closest('.component-card');
        if (card) {
            const btns = card.querySelectorAll('.card-toggle button');
            if (btns[0]) btns[0].classList.add('active');
            if (btns[1]) btns[1].classList.remove('active');
        }
    }

    function toggleProps(cardId) {
        const codeEl = $(`#${cardId}-code`);
        const propsEl = $(`#${cardId}-props`);
        if (!codeEl || !propsEl) return;
        codeEl.classList.add('hidden');
        propsEl.classList.add('show');
        const card = codeEl.closest('.component-card');
        if (card) {
            const btns = card.querySelectorAll('.card-toggle button');
            if (btns[0]) btns[0].classList.remove('active');
            if (btns[1]) btns[1].classList.add('active');
        }
    }

    // ===== コピー =====
    function copyCode(btn) {
        const pre = btn.closest('.card-code')?.querySelector('pre');
        if (!pre) return;
        const text = pre.textContent;
        navigator.clipboard.writeText(text).then(() => {
            btn.textContent = '✅ コピー完了';
            btn.style.background = '#16a34a';
            setTimeout(() => { btn.textContent = '📋 コピー'; btn.style.background = ''; }, 2000);
        }).catch(() => {
            const ta = document.createElement('textarea');
            ta.value = text;
            ta.style.cssText = 'position:fixed;opacity:0';
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            btn.textContent = '✅ コピー完了';
            setTimeout(() => { btn.textContent = '📋 コピー'; }, 2000);
        });
    }

    // ===== 検索 =====
    function setupSearch() {
        const input = $('#searchInput');
        if (!input) return;
        let timer;
        input.addEventListener('input', () => {
            clearTimeout(timer);
            timer = setTimeout(() => {
                filterCards();
                const query = input.value.trim();
                if (query) {
                    allCards.forEach(card => {
                        if (card.style.display !== 'none') card.classList.add('open');
                    });
                } else {
                    allCards.forEach(card => card.classList.remove('open'));
                }
            }, 150);
        });
    }

    // ===== フィルター =====
    function filterCards() {
        const query = ($('#searchInput')?.value || '').toLowerCase().trim();
        const sections = $$('.category-section');
        let visibleCount = 0;

        sections.forEach(section => {
            const sectionCat = section.dataset.cat;

            // カテゴリフィルタ: 該当しないセクションを隠す
            if (activeCategory !== 'all' && sectionCat !== activeCategory) {
                section.classList.add('hidden');
                section.style.display = 'none';
                return;
            }
            section.classList.remove('hidden');
            section.style.display = '';

            let sectionVisible = false;
            const cards = section.querySelectorAll('.component-card');
            cards.forEach(card => {
                const searchText = (card.dataset.search || '').toLowerCase();
                const label = card.dataset.label;
                const matchLabel = activeLabel === 'all' || label === activeLabel;
                const matchSearch = !query || searchText.includes(query);
                const visible = matchLabel && matchSearch;
                card.style.display = visible ? '' : 'none';
                if (visible) { sectionVisible = true; visibleCount++; }
            });

            if (!sectionVisible) {
                section.style.display = 'none';
            }
        });

        const noResult = $('#noResult');
        if (noResult) noResult.style.display = visibleCount === 0 ? 'block' : 'none';
    }

    // ===== スクロールトップ =====
    function setupScrollTop() {
        const btn = $('#scrollTop');
        if (!btn) return;
        btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
        window.addEventListener('scroll', () => {
            btn.classList.toggle('visible', window.scrollY > 400);
        }, { passive: true });
    }

    // ===== ディープリンク =====
    function setupDeepLink() {
        window.addEventListener('hashchange', handleHash);
    }

    function handleInitialHash() {
        if (window.location.hash) setTimeout(() => handleHash(), 300);
    }

    function handleHash() {
        const hash = window.location.hash;
        if (!hash) return;
        const target = $(hash);
        if (!target) return;

        if (target.classList.contains('category-section')) {
            activeCategory = target.dataset.cat;

            $$('.sidebar-link').forEach(l => l.classList.remove('active'));
            const link = Array.from($$('.sidebar-link')).find(l => l.dataset.cat === activeCategory);
            if (link) link.classList.add('active');
            filterCards();
        }

        if (target.classList.contains('component-card')) target.classList.add('open');

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                const y = target.getBoundingClientRect().top + window.scrollY - 180;
                window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
            });
        });
    }

    // ===== キーボード =====
    function setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey && e.key === 'k') || (e.key === '/' && !isInputFocused())) {
                e.preventDefault();
                $('#searchInput')?.focus();
            }
            if (e.key === 'Escape') {
                const input = $('#searchInput');
                if (document.activeElement === input) {
                    input.value = '';
                    input.blur();
                    allCards.forEach(card => card.classList.remove('open'));
                    filterCards();
                }
                closeSidebar();
            }
        });
    }

    function isInputFocused() {
        const tag = document.activeElement?.tagName;
        return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' ||
            document.activeElement?.contentEditable === 'true';
    }

    // ===== デモ後処理 =====
    function runPostRenderSetup() {
        const canvas = document.getElementById('demoCanvas');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#2563eb'; ctx.fillRect(10, 15, 60, 50);
            ctx.fillStyle = '#7c3aed'; ctx.beginPath(); ctx.arc(130, 40, 30, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#16a34a'; ctx.beginPath(); ctx.moveTo(75, 15); ctx.lineTo(105, 60); ctx.lineTo(75, 60); ctx.closePath(); ctx.fill();
        }
        const evtBtn = document.getElementById('evtBtn');
        if (evtBtn) {
            let count = 0;
            evtBtn.addEventListener('click', () => { count++; evtBtn.textContent = `クリックカウント: ${count}`; });
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

    return { init, toggleCode, toggleProps, copyCode, filterCards };
})();

document.addEventListener('DOMContentLoaded', () => App.init());
