/**
 * メニュー定義（UI 層）
 *
 * GAS は同一プロジェクトの全 .gs を 1 つのグローバルスコープで共有するため、
 * onOpen を複数ファイルに置くと衝突してメニューが出なくなる。
 * UI の入口はこのファイルに一本化し、各機能ファイル
 * (add-uuid-slug.gs / fetch-x-posts.gs) は処理関数だけを提供する。
 */
function onOpen() {
  var ui = SpreadsheetApp.getUi();

  // --- UUID 移行（add-uuid-slug.gs） ---
  ui.createMenu('UUID 移行')
    .addItem('全シートに UUID/slug 列を付与', 'runAllMigrations')
    .addItem('UUID 列のみ生成（既存空セル）', 'fillAllUuidsOnly')
    .addItem('slug 列のみ再生成（既存空セル）', 'fillAllSlugsOnly')
    .addItem('親UUID 列のみ解決（既存空セル）', 'fillAllParentUuidsOnly')
    .addSeparator()
    .addItem('♻ 派生列を再発行（slug/親UUID/songUuid をクリア→再生成）', 'regenerateDerived')
    .addItem('⚠ 全列を再発行（uuid 含め全クリア→完全再生成）', 'regenerateAll')
    .addSeparator()
    .addItem('slug: フォールバックのみ再生成（かな→ローマ字等）', 'regenerateFallbackSlugs')
    .addItem('slug: 候補を生成（全シート・ローマ字読み/公式MV題 → slug_suggestions）', 'suggestSlugCandidates')
    .addItem('slug: 採用slugを反映（slug_suggestions → 各シート）', 'applySlugSuggestions')
    .addSeparator()
    .addItem('診断: 空セルを集計して表示', 'diagnoseEmptyCells')
    .addToUi();

  // --- X ポスト取得（fetch-x-posts.gs） ---
  ui.createMenu('X ポスト取得')
    .addItem('全ポストを取得', 'getPosts')
    .addSeparator()
    .addItem('discography_post のみ取得', 'getDiscographyPosts')
    .addItem('live_post のみ取得', 'getLivePosts')
    .addItem('live_item_post のみ取得', 'getLiveItemPosts')
    .addToUi();
}
