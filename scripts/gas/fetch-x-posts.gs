/**
 * Reol サイト用：X(Twitter) のポスト本文 (blockquote) を取得して
 * スプレッドシートに書き込む GAS スクリプト。
 *
 * 各シートには「ポストID 列」と、その右隣に「blockquote HTML 列」がある前提。
 *   discography_post : D=ID, E=HTML
 *   live_post        : E=ID, F=HTML
 *   live_item_post   : G=ID, H=HTML
 *
 * 既に HTML が入っている行はスキップ（取得済みを尊重）。
 * publish.twitter.com の oembed API で取得し、widgets.js の <script> を除去して保存する。
 *
 * 使い方:
 *   メニュー [X ポスト取得] → [全ポストを取得] など
 *
 * メニュー（UI）は menu.gs に一本化している。このファイルは処理関数のみ提供する。
 */

// =====================================================
// 取得対象シート定義（1-index の列番号）
// =====================================================
// idColumn: ポストID が入っている列。HTML はその右隣 (idColumn + 1) に書き込む。
var POST_TARGETS = [
  { sheetName: 'discography_post', idColumn: 4 }, // D=ID, E=HTML
  { sheetName: 'live_post', idColumn: 5 },        // E=ID, F=HTML
  { sheetName: 'live_item_post', idColumn: 7 },   // G=ID, H=HTML
];

// =====================================================
// エントリポイント
// =====================================================
function getPosts() {
  var summary = POST_TARGETS.map(function (t) {
    return fetchPostsIntoSheet_(t.sheetName, t.idColumn);
  });
  SpreadsheetApp.getUi().alert(
    'X ポスト取得 完了\n\n' + summary.join('\n')
  );
}

function getDiscographyPosts() {
  alertResult_(fetchPostsIntoSheet_('discography_post', 4));
}

function getLivePosts() {
  alertResult_(fetchPostsIntoSheet_('live_post', 5));
}

function getLiveItemPosts() {
  alertResult_(fetchPostsIntoSheet_('live_item_post', 7));
}

function alertResult_(line) {
  SpreadsheetApp.getUi().alert('X ポスト取得 完了\n\n' + line);
}

// =====================================================
// 共通処理
// =====================================================
/**
 * 指定シートの idColumn からポストID を読み、HTML 列 (idColumn+1) を埋める。
 *   - HTML が既に入っている行はスキップ（取得済みを尊重）
 *   - ID が空の行は空のまま
 *   - 取得失敗時はその行だけ空にしてログに残し、処理は継続する
 * @return {string} 結果サマリ
 */
function fetchPostsIntoSheet_(sheetName, idColumn) {
  var sheet = SpreadsheetApp.getActive().getSheetByName(sheetName);
  if (!sheet) {
    Logger.log('sheet not found: ' + sheetName);
    return '[' + sheetName + '] シートが見つかりません';
  }

  var startRow = 2;
  var lastRow = sheet.getLastRow();
  var numRows = lastRow - startRow + 1;
  if (numRows < 1) {
    return '[' + sheetName + '] データ行なし';
  }

  // ID 列と HTML 列をまとめて読む
  var values = sheet.getRange(startRow, idColumn, numRows, 2).getValues();

  var fetched = 0;
  var skipped = 0;
  var failed = 0;
  var out = values.map(function (row, i) {
    var id = normId_(row[0]);
    var existingHtml = String(row[1] == null ? '' : row[1]).trim();

    // ID なし → 空のまま
    if (id === '') return [existingHtml];
    // 取得済み → 尊重
    if (existingHtml.length > 0) {
      skipped += 1;
      return [existingHtml];
    }

    var html = fetchPostHtml_(id);
    if (html === null) {
      failed += 1;
      Logger.log('[' + sheetName + '] row ' + (startRow + i) + ': fetch failed (id=' + id + ')');
      return [''];
    }
    fetched += 1;
    return [html];
  });

  // HTML 列 (idColumn + 1) に書き戻す
  sheet.getRange(startRow, idColumn + 1, numRows, 1).setValues(out);

  var line =
    '[' + sheetName + '] 取得=' + fetched +
    ', スキップ=' + skipped +
    ', 失敗=' + failed;
  Logger.log(line);
  return line;
}

/**
 * ポストID 1 件分の blockquote HTML を取得する。
 * @return {string|null} 成功時は HTML、失敗時は null
 */
function fetchPostHtml_(id) {
  var url =
    'https://publish.twitter.com/oembed?url=' +
    encodeURIComponent('https://twitter.com/RRReol/status/' + id);
  try {
    var res = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    if (res.getResponseCode() !== 200) {
      Logger.log('oembed HTTP ' + res.getResponseCode() + ' for id=' + id);
      return null;
    }
    var content = JSON.parse(res.getContentText('UTF-8'));
    if (!content || !content.html) return null;
    return content.html
      .replace(
        '<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>',
        ''
      )
      .trim();
  } catch (e) {
    Logger.log('fetch error for id=' + id + ': ' + e);
    return null;
  }
}

/** セル値をポストID 文字列に正規化（数値ID でも安全に扱う） */
function normId_(v) {
  if (v == null) return '';
  // 数値で読み込まれた場合の指数表記/小数点を避けるため、整数なら桁を保持
  if (typeof v === 'number') {
    return Math.trunc(v).toFixed(0);
  }
  return String(v).trim();
}
