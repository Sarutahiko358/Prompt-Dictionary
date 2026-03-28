{
  "cat": "テキスト・見出し",
  "catIcon": "📝",
  "catDesc": "文章の構造を定義するHTML要素。見出し、段落、引用、コードブロックなど。",
  "items": [
    {
      "name": "&lt;h1&gt; ～ &lt;h6&gt;",
      "label": "HTML",
      "labelClass": "label-html",
      "desc": "見出しを表す。h1が最も重要度が高く、h6が最も低い。SEOやアクセシビリティにおいて文書構造を示す重要な要素。",
      "demo": "<h1 style=\"font-size:1.4rem\">h1 見出し</h1><h2 style=\"font-size:1.2rem\">h2 見出し</h2><h3 style=\"font-size:1rem\">h3 見出し</h3>",
      "code": "<h1>メインタイトル</h1>\n<h2>サブタイトル</h2>\n<h3>セクション見出し</h3>",
      "props": [
        { "name": "レベル (1-6)", "desc": "文書のアウトライン階層を示す" },
        { "name": "id", "desc": "ページ内リンクのアンカーに使用可能" }
      ],
      "tags": ["基本", "セマンティック", "SEO"],
      "browser": "全ブラウザ対応",
      "mdn": "https://developer.mozilla.org/ja/docs/Web/HTML/Element/Heading_Elements"
    }
  ]
}
