/**
 * Web UIコンポーネント辞典 — データローダー
 * data/_index.json を読み込み、有効なカテゴリのJSONを全て取得する
 */
const DataLoader = (() => {
    const BASE_PATH = 'data/';

    /**
     * _index.json を読み込んで有効カテゴリの一覧を取得
     */
    async function loadIndex() {
        const res = await fetch(BASE_PATH + '_index.json');
        if (!res.ok) throw new Error(`Failed to load _index.json: ${res.status}`);
        return res.json();
    }

    /**
     * 個別のカテゴリJSONを読み込み
     */
    async function loadCategory(filename) {
        const res = await fetch(BASE_PATH + filename);
        if (!res.ok) throw new Error(`Failed to load ${filename}: ${res.status}`);
        return res.json();
    }

    /**
     * 全有効カテゴリを並列読み込みして返す
     * @returns {Promise<Array>} カテゴリデータの配列
     */
    async function loadAll() {
        const index = await loadIndex();
        const enabled = index.categories.filter(c => c.enabled);

        const results = await Promise.allSettled(
            enabled.map(c => loadCategory(c.file))
        );

        const data = [];
        results.forEach((result, i) => {
            if (result.status === 'fulfilled') {
                data.push(result.value);
            } else {
                console.warn(`⚠ ${enabled[i].file} の読み込みに失敗:`, result.reason);
            }
        });

        return data;
    }

    /**
     * フォールバック: インラインデータが渡された場合そのまま返す
     * （ローカルファイル環境でfetchが使えない場合用）
     */
    async function loadWithFallback(inlineData) {
        try {
            const data = await loadAll();
            if (data.length > 0) return data;
        } catch (e) {
            console.warn('⚠ JSON読み込み失敗。インラインデータを使用します:', e);
        }
        return inlineData || [];
    }

    return { loadAll, loadWithFallback };
})();
