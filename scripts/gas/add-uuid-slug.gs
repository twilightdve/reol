/**
 * Reol サイト用：スプレッドシートに UUIDv7 + slug + 親UUID 列を一括付与する GAS スクリプト
 *
 * 使い方:
 *   1. Google スプレッドシートを開く → 拡張機能 → Apps Script
 *   2. このファイルの内容を貼り付けて保存
 *   3. メニュー [UUID 移行] → [全シートに UUID/slug 列を付与] を実行
 *
 * 仕様:
 *   - 各シートの末尾に必要な列を追加（既に追加済みならスキップ）
 *   - 既存行で UUID 列が空のセルに UUIDv7 を一括生成
 *   - slug 列が空のセルは「名前列」から自動生成（手動編集は尊重）
 *   - 親UUID 列が空のセルは親シートから「整数ID」で lookup して埋める
 *   - 既存の整数ID列は**温存**（人間が見て同定できるように）
 *
 * 列レイアウト (各シートの末尾に追加):
 *   discography      : uuid, slug
 *   song             : uuid, slug, discographyUuid
 *   discography_repo : uuid, discographyUuid
 *   discography_post : uuid, discographyUuid
 *   live             : uuid, slug
 *   live_item        : uuid, slug, liveUuid
 *   live_item_song   : uuid, liveItemUuid, songUuid
 *   live_item_post   : uuid, liveItemUuid
 *   live_post        : uuid, liveUuid
 *   live_repo        : uuid, liveUuid
 *   place_index      : uuid, slug
 *   places           : uuid, slug, placeUuid
 *
 * メニュー（UI）は menu.gs に一本化している。このファイルは処理関数のみ提供する。
 */

// =====================================================
// シート定義
// =====================================================
// 各シートのプライマリ整数ID列（A列起点・0-index）、名前列、親シート情報
const SHEET_DEFS = [
  {
    name: 'discography',
    idCol: 0,                // A: discographyId
    nameCol: 1,              // B: title
    addCols: ['uuid', 'slug'],
    parent: null,
  },
  {
    name: 'song',
    idCol: 0,                // A: songId
    nameCol: 4,              // E: songName
    addCols: ['uuid', 'slug', 'discographyUuid'],
    // discography: A(0)=discographyId / song: B(1)=discographyId
    parent: { sheet: 'discography', parentIdCol: 0, childIdCol: 1, parentUuidColName: 'discographyUuid' },
  },
  {
    name: 'discography_repo',
    idCol: null,             // 連番なので uuid を主キーにする
    nameCol: 3,              // D: discographyReportName
    addCols: ['uuid', 'discographyUuid'],
    parent: { sheet: 'discography', parentIdCol: 0, parentUuidColName: 'discographyUuid' },
  },
  {
    name: 'discography_post',
    idCol: null,
    nameCol: 3,              // D: discographyPostId
    addCols: ['uuid', 'discographyUuid'],
    parent: { sheet: 'discography', parentIdCol: 0, parentUuidColName: 'discographyUuid' },
  },
  {
    name: 'live',
    idCol: 0,                // A: liveId
    nameCol: 2,              // C: title
    addCols: ['uuid', 'slug'],
    parent: null,
  },
  {
    name: 'live_item',
    idCol: null,             // 複合キー (liveId+liveItemNo) → uuid 主キー化
    nameCol: 4,              // E: liveItemName
    addCols: ['uuid', 'slug', 'liveUuid'],
    // live: A(0)=liveId / live_item: B(1)=liveId
    parent: { sheet: 'live', parentIdCol: 0, childIdCol: 1, parentUuidColName: 'liveUuid' },
  },
  {
    name: 'live_item_song',
    idCol: null,
    nameCol: 6,              // G: liveItemSongName
    addCols: ['uuid', 'liveItemUuid', 'songUuid'],
    // 親が live_item (複合キー liveId+liveItemNo)
    parent: {
      sheet: 'live_item',
      composite: true,
      parentIdCols: [1, 3],  // B: liveId, D: liveItemNo
      childIdCols: [1, 3],   // B: liveId, D: liveItemNo
      parentUuidColName: 'liveItemUuid',
    },
  },
  {
    name: 'live_item_post',
    idCol: null,
    nameCol: 6,              // G: liveItemPostId
    addCols: ['uuid', 'liveItemUuid'],
    parent: {
      sheet: 'live_item',
      composite: true,
      parentIdCols: [1, 3],
      childIdCols: [1, 3],
      parentUuidColName: 'liveItemUuid',
    },
  },
  {
    name: 'live_post',
    idCol: null,
    nameCol: 4,              // E: livePostId
    addCols: ['uuid', 'liveUuid'],
    parent: { sheet: 'live', parentIdCol: 0, parentUuidColName: 'liveUuid', childIdCol: 1 },
  },
  {
    name: 'live_repo',
    idCol: null,
    nameCol: 4,              // E: liveReportName
    addCols: ['uuid', 'liveUuid'],
    parent: { sheet: 'live', parentIdCol: 0, parentUuidColName: 'liveUuid', childIdCol: 1 },
  },
  {
    name: 'place_index',
    idCol: 0,                // A: placeId
    nameCol: 2,              // C: title
    addCols: ['uuid', 'slug'],
    parent: null,
  },
  {
    name: 'places',
    idCol: null,             // 複合キー
    nameCol: 5,              // F: name
    addCols: ['uuid', 'slug', 'placeUuid'],
    parent: { sheet: 'place_index', parentIdCol: 0, parentUuidColName: 'placeUuid', childIdCol: 1 },
  },
];

// =====================================================
// メイン
// =====================================================
function runAllMigrations() {
  // 2 パスで実行: 1 パス目に親 uuid が埋まると、
  // それを参照する孫子シートが 2 パス目で解決される。
  for (let pass = 1; pass <= 2; pass++) {
    Logger.log('=== pass ' + pass + ' start ===');
    ensureAllAddedColumns();
    SpreadsheetApp.flush();
    fillAllUuidsOnly();
    SpreadsheetApp.flush();
    fillAllParentUuidsOnly();
    SpreadsheetApp.flush();
    fillSongUuidInLiveItemSong();
    SpreadsheetApp.flush();
    fillAllSlugsOnly();
    SpreadsheetApp.flush();
  }
  const report = collectEmptyReport_();
  Logger.log('=== empty cell report ===\n' + report);
  SpreadsheetApp.getUi().alert(
    '完了: 全シートに UUID/slug を付与しました\n\n' +
      '【空セルレポート】\n' + report
  );
}

// =====================================================
// 再発行（クリア → 再生成）
// =====================================================
/** 指定したヘッダー名の列を、データ行すべて空にする */
function clearColumns_(sh, colNames) {
  const lastRow = sh.getLastRow();
  if (lastRow < 2) return;
  colNames.forEach((cn) => {
    const idx = findColIndex_(sh, cn);
    if (idx < 0) return;
    sh.getRange(2, idx + 1, lastRow - 1, 1).clearContent();
  });
}

/**
 * 派生列（slug / 親UUID / songUuid）だけを全クリアして再生成する。
 * uuid 本体は温存するので、Supabase 等の外部参照は壊れない。
 * ノイズ（誤割当の songUuid 等）を一掃したいときに使う。
 * 注意: 手動編集した slug も消えて自動生成に上書きされる。
 */
function regenerateDerived() {
  const ui = SpreadsheetApp.getUi();
  const res = ui.alert(
    '派生列の再発行',
    'slug / 親UUID / songUuid を全行クリアして再生成します。\n' +
      'uuid 本体は温存されます（外部参照は壊れません）。\n' +
      '手動編集した slug も自動生成に上書きされます。\n\n実行しますか？',
    ui.ButtonSet.OK_CANCEL
  );
  if (res !== ui.Button.OK) return;

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  SHEET_DEFS.forEach((def) => {
    const sh = ss.getSheetByName(def.name);
    if (!sh) return;
    ensureColumns_(sh, def.addCols);
    // uuid 以外（slug, *Uuid）をクリア
    const derived = def.addCols.filter((c) => c !== 'uuid');
    clearColumns_(sh, derived);
  });
  SpreadsheetApp.flush();

  // 2 パスで再解決（親 uuid → 孫子の順に埋まる）
  for (let pass = 1; pass <= 2; pass++) {
    fillAllParentUuidsOnly();
    SpreadsheetApp.flush();
    fillSongUuidInLiveItemSong();
    SpreadsheetApp.flush();
    fillAllSlugsOnly();
    SpreadsheetApp.flush();
  }
  const report = collectEmptyReport_();
  Logger.log('=== regenerateDerived report ===\n' + report);
  ui.alert('完了: 派生列を再発行しました\n\n【空セルレポート】\n' + report);
}

/**
 * uuid 末尾12文字のフォールバック slug **だけ** を再生成する。
 * - 手動編集済み・可読な slug は一切触らない(regenerateDerived と違い安全)
 * - 改善された makeSlugFromName_(括弧英題/かな→ローマ字)で再挑戦し、
 *   それでも生成できない曲(漢字のみ等)はフォールバックのまま残して
 *   「手動整備リスト」としてレポート表示する
 * 使い方: Apps Script エディタからこの関数を直接実行(またはメニューに追加)
 */
function regenerateFallbackSlugs() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const lines = [];
  SHEET_DEFS.forEach((def) => {
    if (!def.addCols.includes('slug')) return;
    const sh = ss.getSheetByName(def.name);
    if (!sh) return;
    const slugIdx = findColIndex_(sh, 'slug');
    const uuidIdx = findColIndex_(sh, 'uuid');
    if (slugIdx < 0 || uuidIdx < 0) return;
    const lastRow = sh.getLastRow();
    if (lastRow < 2) return;

    const allValues = sh.getRange(2, 1, lastRow - 1, sh.getLastColumn()).getValues();
    // 既存slug一覧(重複防止)。フォールバックslugは再生成対象なので除外して構築
    const usedSlugs = new Set();
    const isFallback = (slug, uuid) =>
      slug !== '' && uuid !== '' && slug === uuid.replace(/-/g, '').slice(-12);
    allValues.forEach((row) => {
      const slug = normCell_(row[slugIdx]);
      const uuid = normCell_(row[uuidIdx]);
      if (slug && !isFallback(slug, uuid)) usedSlugs.add(slug);
    });

    const out = [];
    let regenerated = 0;
    const remaining = [];
    for (let i = 0; i < allValues.length; i++) {
      const slug = normCell_(allValues[i][slugIdx]);
      const uuid = normCell_(allValues[i][uuidIdx]);
      if (!rowHasContent_(allValues[i]) || !isFallback(slug, uuid)) {
        out.push([slug]);
        continue;
      }
      const name = normCell_(allValues[i][def.nameCol]);
      let base = makeSlugFromName_(name);
      if (!base) {
        // 依然として生成不可 → フォールバック温存し、手動整備リストへ
        out.push([slug]);
        remaining.push('  row ' + (i + 2) + ': ' + name);
        continue;
      }
      let candidate = base;
      let n = 2;
      while (usedSlugs.has(candidate)) {
        candidate = base + '-' + n;
        n += 1;
      }
      usedSlugs.add(candidate);
      out.push([candidate]);
      regenerated += 1;
    }
    sh.getRange(2, slugIdx + 1, lastRow - 1, 1).setValues(out);
    lines.push(
      '[' + def.name + '] 再生成 ' + regenerated + ' 件 / 要手動 ' + remaining.length + ' 件' +
        (remaining.length ? '\n' + remaining.join('\n') : '')
    );
  });
  const report = lines.join('\n');
  Logger.log('=== regenerateFallbackSlugs ===\n' + report);
  SpreadsheetApp.getUi().alert(
    'フォールバックslugの再生成が完了しました\n\n' + report +
      '\n\n※「要手動」の行は slug セルに公式ローマ字を直接入力してください(次回実行時も上書きされません)'
  );
}

/**
 * uuid を含む全 ID/slug 列を全クリアして完全再生成する。
 * ⚠ 既存 uuid がすべて新規発行され、Supabase 等の外部参照は壊れる。
 */
function regenerateAll() {
  const ui = SpreadsheetApp.getUi();
  const res = ui.alert(
    '全列の再発行',
    'uuid を含む全 ID/slug 列を全行クリアして完全再生成します。\n' +
      '⚠ 既存の uuid がすべて新しくなり、Supabase 等の外部参照は壊れます。\n\n' +
      '本当に実行しますか？',
    ui.ButtonSet.OK_CANCEL
  );
  if (res !== ui.Button.OK) return;

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  SHEET_DEFS.forEach((def) => {
    const sh = ss.getSheetByName(def.name);
    if (!sh) return;
    ensureColumns_(sh, def.addCols);
    clearColumns_(sh, def.addCols);
  });
  SpreadsheetApp.flush();

  // フル再生成（uuid → 親UUID → songUuid → slug、2 パス＋空セルレポート）
  runAllMigrations();
}

// =====================================================
// 診断: 空セルを集計
// =====================================================
function diagnoseEmptyCells() {
  const report = collectEmptyReport_(/* verbose */ true);
  Logger.log(report);
  SpreadsheetApp.getUi().alert(report);
}

function collectEmptyReport_(verbose) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const lines = [];
  SHEET_DEFS.forEach((def) => {
    const sh = ss.getSheetByName(def.name);
    if (!sh) {
      lines.push('[' + def.name + '] (sheet not found)');
      return;
    }
    const lastRow = sh.getLastRow();
    if (lastRow < 2) {
      lines.push('[' + def.name + '] no data rows');
      return;
    }
    const lastCol = sh.getLastColumn();
    const allValues = sh.getRange(2, 1, lastRow - 1, lastCol).getValues();
    // 空行除外
    const dataRows = [];
    allValues.forEach((row, i) => {
      if (rowHasContent_(row)) dataRows.push({ row: row, lineNo: i + 2 });
    });
    const counts = {};
    const missRows = {};
    def.addCols.forEach((cn) => {
      const idx = findColIndex_(sh, cn);
      if (idx < 0) {
        counts[cn] = '(no column)';
        return;
      }
      let empties = 0;
      const emptyLineNos = [];
      dataRows.forEach((r) => {
        if (isBlank_(r.row[idx])) {
          empties += 1;
          if (emptyLineNos.length < 5) emptyLineNos.push(r.lineNo);
        }
      });
      counts[cn] = empties + '/' + dataRows.length;
      if (empties > 0) missRows[cn] = emptyLineNos;
    });
    let line = '[' + def.name + '] ' + def.addCols.map((cn) => cn + '=' + counts[cn]).join(', ');
    if (verbose) {
      Object.keys(missRows).forEach((cn) => {
        line += '\n    ' + cn + ' empty rows (first 5): ' + missRows[cn].join(', ');
      });
    }
    lines.push(line);
  });
  return lines.join('\n');
}

function ensureAllAddedColumns() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  SHEET_DEFS.forEach((def) => {
    const sh = ss.getSheetByName(def.name);
    if (!sh) {
      Logger.log('skip (sheet not found): ' + def.name);
      return;
    }
    ensureColumns_(sh, def.addCols);
  });
}

function fillAllUuidsOnly() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  SHEET_DEFS.forEach((def) => {
    const sh = ss.getSheetByName(def.name);
    if (!sh) return;
    ensureColumns_(sh, def.addCols);
    fillUuidColumn_(sh, 'uuid');
  });
}

function fillAllSlugsOnly() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  SHEET_DEFS.forEach((def) => {
    const sh = ss.getSheetByName(def.name);
    if (!sh) return;
    if (!def.addCols.includes('slug')) return;
    ensureColumns_(sh, def.addCols);
    fillSlugColumn_(sh, 'slug', def.nameCol);
  });
}

function fillAllParentUuidsOnly() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  SHEET_DEFS.forEach((def) => {
    if (!def.parent) return;
    const sh = ss.getSheetByName(def.name);
    if (!sh) return;
    ensureColumns_(sh, def.addCols);
    fillParentUuidColumn_(ss, sh, def);
  });
}

// =====================================================
// 列追加
// =====================================================
function ensureColumns_(sh, addCols) {
  const lastCol = sh.getLastColumn();
  const headerRange = sh.getRange(1, 1, 1, Math.max(lastCol, 1));
  const headers = headerRange.getValues()[0];
  const existing = new Set(headers.map((h) => String(h || '').trim()));
  let appendAt = lastCol + 1;
  addCols.forEach((name) => {
    if (existing.has(name)) return;
    sh.getRange(1, appendAt).setValue(name);
    appendAt += 1;
  });
}

function findColIndex_(sh, headerName) {
  const lastCol = sh.getLastColumn();
  if (lastCol === 0) return -1;
  const headers = sh.getRange(1, 1, 1, lastCol).getValues()[0];
  for (let i = 0; i < headers.length; i++) {
    if (String(headers[i]).trim() === headerName) return i; // 0-index
  }
  return -1;
}

// 不可視文字（NBSP / ゼロ幅スペース / BOM 等）も含めて「空」とみなす
function normCell_(v) {
  if (v == null) return '';
  return String(v)
    .replace(/[\u00A0\u200B\u200C\u200D\uFEFF]/g, '') // NBSP, ZWSP, ZWNJ, ZWJ, BOM
    .trim();
}
function isBlank_(v) {
  return normCell_(v) === '';
}
function rowHasContent_(row) {
  return row.some((v) => !isBlank_(v));
}

// =====================================================
// UUIDv7 生成
// =====================================================
/**
 * UUIDv7 を生成する（RFC 9562）
 * 48bit unix_ts_ms + 4bit ver(7) + 12bit rand + 2bit var(10) + 62bit rand
 */
function uuidv7_() {
  const ts = Date.now(); // ms
  const tsHex = ts.toString(16).padStart(12, '0'); // 12 hex (48bit)

  // ランダム 10 byte (80bit)
  const rand = [];
  for (let i = 0; i < 10; i++) rand.push(Math.floor(Math.random() * 256));

  // ver: byte6 の上位 4bit を 0111
  rand[0] = (rand[0] & 0x0f) | 0x70;
  // var: byte8 の上位 2bit を 10
  rand[2] = (rand[2] & 0x3f) | 0x80;

  const randHex = rand.map((b) => b.toString(16).padStart(2, '0')).join('');
  // 構築: 8-4-4-4-12
  const hex = tsHex + randHex; // 12 + 20 = 32 hex
  return (
    hex.substr(0, 8) +
    '-' +
    hex.substr(8, 4) +
    '-' +
    hex.substr(12, 4) +
    '-' +
    hex.substr(16, 4) +
    '-' +
    hex.substr(20, 12)
  );
}

// =====================================================
// 列埋め込み: UUID
// =====================================================
function fillUuidColumn_(sh, headerName) {
  const colIdx = findColIndex_(sh, headerName);
  if (colIdx < 0) return;
  const lastRow = sh.getLastRow();
  if (lastRow < 2) return;

  const range = sh.getRange(2, colIdx + 1, lastRow - 1, 1);
  const values = range.getValues();
  let filled = 0;
  for (let i = 0; i < values.length; i++) {
    if (isBlank_(values[i][0])) {
      // 行全体が空のスキップ判定（A列が空＆名前列が空なら本当の空行）
      const rowVals = sh.getRange(i + 2, 1, 1, sh.getLastColumn()).getValues()[0];
      if (!rowHasContent_(rowVals)) continue;
      values[i][0] = uuidv7_();
      filled += 1;
      // UUIDv7 はミリ秒で単調増加するが、ループ内では同一 ms 内で生成されるためランダム部のみで識別される
    }
  }
  range.setValues(values);
  Logger.log('uuid filled in ' + sh.getName() + ': ' + filled);
}

// =====================================================
// 列埋め込み: slug
// =====================================================
function fillSlugColumn_(sh, headerName, nameCol /* 0-index */) {
  const colIdx = findColIndex_(sh, headerName);
  if (colIdx < 0) return;
  const uuidIdx = findColIndex_(sh, 'uuid');
  const lastRow = sh.getLastRow();
  if (lastRow < 2) return;

  const allValues = sh.getRange(2, 1, lastRow - 1, sh.getLastColumn()).getValues();
  const slugCol = [];
  const usedSlugs = new Set();
  // 既存 slug を usedSlugs に反映（重複防止）
  for (let i = 0; i < allValues.length; i++) {
    const cur = allValues[i][colIdx];
    if (!isBlank_(cur)) usedSlugs.add(normCell_(cur));
  }
  let filled = 0;
  let skipped = 0;
  for (let i = 0; i < allValues.length; i++) {
    const cur = allValues[i][colIdx];
    if (!isBlank_(cur)) {
      slugCol.push([normCell_(cur)]);
      continue;
    }
    // 行が完全に空ならスキップ（空行を slug で汚さない）
    if (!rowHasContent_(allValues[i])) {
      slugCol.push(['']);
      skipped += 1;
      continue;
    }
    const name = normCell_(allValues[i][nameCol]);
    let base = makeSlugFromName_(name);
    if (!base) {
      // 名前が空 or 変換パイプラインで残らない（例: 漢字のみで読みが不明）
      // → uuid 末尾 12 文字を fallback slug にして必ず埋める
      // (後から regenerateFallbackSlugs() で再生成 or 手動編集で置き換え可能)
      const uuid = uuidIdx >= 0 ? normCell_(allValues[i][uuidIdx]) : '';
      if (uuid) {
        base = uuid.replace(/-/g, '').slice(-12);
      } else {
        base = 'item-' + (i + 2); // 行番号フォールバック
      }
    }
    let slug = base;
    let n = 2;
    while (usedSlugs.has(slug)) {
      slug = base + '-' + n;
      n += 1;
    }
    usedSlugs.add(slug);
    slugCol.push([slug]);
    filled += 1;
  }
  sh.getRange(2, colIdx + 1, lastRow - 1, 1).setValues(slugCol);
  Logger.log('slug filled in ' + sh.getName() + ': ' + filled + ' (skipped empty rows: ' + skipped + ')');
}

/**
 * 名前 → slug 変換パイプライン（優先順）
 *   1. 括弧内に英字の公式英題があればそれを使う（例: 「うつくしじごく (Utsukushi Jigoku)」→ utsukushi-jigoku）
 *   2. 名前全体を ASCII slug 化して残ればそれ（英数タイトル）
 *   3. かな のみのタイトルはヘボン式ローマ字に変換（例: 「ヒビカセ」→ hibikase）
 *   4. どれも不可（漢字のみ等）なら空を返す → 呼び出し側で uuid フォールバック
 * 漢字の読みは機械推測しない（誤読を恒久URLにしないため。手動編集 or 括弧英題の追記で対応）
 */
function makeSlugFromName_(name) {
  const raw = String(name);
  // 1. 括弧内の英題（最初に英字を含む括弧を採用）
  const parenMatches = raw.match(/[(（][^)）]*[)）]/g) || [];
  for (let i = 0; i < parenMatches.length; i++) {
    const inner = parenMatches[i].replace(/^[(（]|[)）]$/g, '');
    if (/[a-zA-Z]/.test(inner)) {
      const s = slugify_(inner);
      if (s) return s;
    }
  }
  // 2. 全体を ASCII slug 化（括弧は除いた本体で試す）
  const body = raw.replace(/[(（][^)）]*[)）]/g, '').trim();
  const ascii = slugify_(body || raw);
  if (ascii) return ascii;
  // 3. かな のみならローマ字化
  const target = body || raw;
  if (isKanaOnly_(target)) {
    const s = slugify_(kanaToRomaji_(target));
    if (s) return s;
  }
  return '';
}

/** かな（ひらがな/カタカナ/長音/記号・空白のみ）で構成されているか */
function isKanaOnly_(s) {
  const stripped = String(s).replace(/[\s　・、。，．,.!?！？~〜…「」『』ー]/g, '');
  if (!stripped) return false;
  return /^[ぁ-ゖァ-ヺ]+$/.test(stripped);
}

/**
 * かな → ヘボン式ローマ字（slug 用の簡易版）
 * - カタカナはひらがなへ寄せてから変換
 * - 拗音（きゃ等）・促音（っ→次の子音を重ねる）・ん(n) に対応
 * - 長音「ー」は無視（例: トーキョー → tokyo）
 */
function kanaToRomaji_(s) {
  // カタカナ → ひらがな
  let kana = String(s).replace(/[ァ-ヶ]/g, function (ch) {
    return String.fromCharCode(ch.charCodeAt(0) - 0x60);
  });
  const DIGRAPHS = {
    'きゃ': 'kya', 'きゅ': 'kyu', 'きょ': 'kyo',
    'しゃ': 'sha', 'しゅ': 'shu', 'しょ': 'sho',
    'ちゃ': 'cha', 'ちゅ': 'chu', 'ちょ': 'cho',
    'にゃ': 'nya', 'にゅ': 'nyu', 'にょ': 'nyo',
    'ひゃ': 'hya', 'ひゅ': 'hyu', 'ひょ': 'hyo',
    'みゃ': 'mya', 'みゅ': 'myu', 'みょ': 'myo',
    'りゃ': 'rya', 'りゅ': 'ryu', 'りょ': 'ryo',
    'ぎゃ': 'gya', 'ぎゅ': 'gyu', 'ぎょ': 'gyo',
    'じゃ': 'ja', 'じゅ': 'ju', 'じょ': 'jo',
    'ぢゃ': 'ja', 'ぢゅ': 'ju', 'ぢょ': 'jo',
    'びゃ': 'bya', 'びゅ': 'byu', 'びょ': 'byo',
    'ぴゃ': 'pya', 'ぴゅ': 'pyu', 'ぴょ': 'pyo',
    'ふぁ': 'fa', 'ふぃ': 'fi', 'ふぇ': 'fe', 'ふぉ': 'fo',
    'てぃ': 'ti', 'でぃ': 'di', 'とぅ': 'tu', 'どぅ': 'du',
    'うぃ': 'wi', 'うぇ': 'we', 'うぉ': 'wo',
    'ちぇ': 'che', 'しぇ': 'she', 'じぇ': 'je',
  };
  const SINGLES = {
    'あ': 'a', 'い': 'i', 'う': 'u', 'え': 'e', 'お': 'o',
    'か': 'ka', 'き': 'ki', 'く': 'ku', 'け': 'ke', 'こ': 'ko',
    'さ': 'sa', 'し': 'shi', 'す': 'su', 'せ': 'se', 'そ': 'so',
    'た': 'ta', 'ち': 'chi', 'つ': 'tsu', 'て': 'te', 'と': 'to',
    'な': 'na', 'に': 'ni', 'ぬ': 'nu', 'ね': 'ne', 'の': 'no',
    'は': 'ha', 'ひ': 'hi', 'ふ': 'fu', 'へ': 'he', 'ほ': 'ho',
    'ま': 'ma', 'み': 'mi', 'む': 'mu', 'め': 'me', 'も': 'mo',
    'や': 'ya', 'ゆ': 'yu', 'よ': 'yo',
    'ら': 'ra', 'り': 'ri', 'る': 'ru', 'れ': 're', 'ろ': 'ro',
    'わ': 'wa', 'ゐ': 'i', 'ゑ': 'e', 'を': 'o', 'ん': 'n',
    'が': 'ga', 'ぎ': 'gi', 'ぐ': 'gu', 'げ': 'ge', 'ご': 'go',
    'ざ': 'za', 'じ': 'ji', 'ず': 'zu', 'ぜ': 'ze', 'ぞ': 'zo',
    'だ': 'da', 'ぢ': 'ji', 'づ': 'zu', 'で': 'de', 'ど': 'do',
    'ば': 'ba', 'び': 'bi', 'ぶ': 'bu', 'べ': 'be', 'ぼ': 'bo',
    'ぱ': 'pa', 'ぴ': 'pi', 'ぷ': 'pu', 'ぺ': 'pe', 'ぽ': 'po',
    'ぁ': 'a', 'ぃ': 'i', 'ぅ': 'u', 'ぇ': 'e', 'ぉ': 'o',
    'ゃ': 'ya', 'ゅ': 'yu', 'ょ': 'yo', 'ゎ': 'wa',
    'ゔ': 'vu',
  };
  let out = '';
  let sokuon = false;
  for (let i = 0; i < kana.length; i++) {
    const two = kana.substr(i, 2);
    const one = kana[i];
    if (one === 'っ') {
      sokuon = true;
      continue;
    }
    if (one === 'ー') {
      continue; // 長音は無視
    }
    let roma = '';
    if (DIGRAPHS[two]) {
      roma = DIGRAPHS[two];
      i += 1;
    } else if (SINGLES[one]) {
      roma = SINGLES[one];
    } else {
      // かな以外（空白・記号）は区切りとして残す
      out += one;
      sokuon = false;
      continue;
    }
    if (sokuon && roma) {
      // 促音: 次の子音を重ねる（chi 系は t を付ける慣例）
      out += roma.charAt(0) === 'c' ? 't' : roma.charAt(0);
      sokuon = false;
    }
    out += roma;
  }
  return out;
}

/**
 * 名前 → slug 変換（ASCII 化の最終工程）
 * - 日本語/全角/フリガナ記号を除去
 * - 英数とハイフンのみ残す
 * - lowercase
 * - 連続ハイフン圧縮
 */
function slugify_(name) {
  let s = String(name);
  // 半角化
  s = s.normalize('NFKC');
  // lowercase
  s = s.toLowerCase();
  // 空白系をハイフンに
  s = s.replace(/[\s\u3000]+/g, '-');
  // 英数とハイフン以外を削除
  s = s.replace(/[^a-z0-9\-]+/g, '');
  // 連続ハイフン圧縮
  s = s.replace(/-+/g, '-');
  // 前後ハイフン削除
  s = s.replace(/^-+|-+$/g, '');
  return s;
}

// =====================================================
// 列埋め込み: 親UUID
// =====================================================
function fillParentUuidColumn_(ss, sh, def) {
  const parent = def.parent;
  const colIdx = findColIndex_(sh, parent.parentUuidColName);
  if (colIdx < 0) return;
  const parentSh = ss.getSheetByName(parent.sheet);
  if (!parentSh) {
    Logger.log('parent sheet not found: ' + parent.sheet);
    return;
  }
  const parentUuidIdx = findColIndex_(parentSh, 'uuid');
  if (parentUuidIdx < 0) {
    Logger.log('parent sheet has no uuid column: ' + parent.sheet);
    return;
  }

  const parentLastRow = parentSh.getLastRow();
  if (parentLastRow < 2) return;
  const parentValues = parentSh.getRange(2, 1, parentLastRow - 1, parentSh.getLastColumn()).getValues();

  // 親の lookup key を構築（uuid が空の親行は無視）
  const parentMap = new Map();
  if (parent.composite) {
    parentValues.forEach((row) => {
      const uuid = row[parentUuidIdx];
      if (isBlank_(uuid)) return;
      const parts = parent.parentIdCols.map((c) => normCell_(row[c]));
      if (parts.some((p) => p === '')) return;
      const key = parts.join('|');
      if (parentMap.has(key)) return;
      parentMap.set(key, normCell_(uuid));
    });
  } else {
    parentValues.forEach((row) => {
      const uuid = row[parentUuidIdx];
      if (isBlank_(uuid)) return;
      const key = normCell_(row[parent.parentIdCol]);
      if (key === '') return;
      if (parentMap.has(key)) return;
      parentMap.set(key, normCell_(uuid));
    });
  }

  const childLastRow = sh.getLastRow();
  if (childLastRow < 2) return;
  const childValues = sh.getRange(2, 1, childLastRow - 1, sh.getLastColumn()).getValues();
  const out = [];
  let filled = 0;
  let missing = 0;
  for (let i = 0; i < childValues.length; i++) {
    const cur = childValues[i][colIdx];
    if (!isBlank_(cur)) {
      out.push([normCell_(cur)]);
      continue;
    }
    // 行が完全に空ならスキップ
    if (!rowHasContent_(childValues[i])) {
      out.push(['']);
      continue;
    }
    let key;
    if (parent.composite) {
      const parts = parent.childIdCols.map((c) => normCell_(childValues[i][c]));
      key = parts.some((p) => p === '') ? '' : parts.join('|');
    } else {
      const childIdCol = parent.childIdCol != null ? parent.childIdCol : parent.parentIdCol;
      key = normCell_(childValues[i][childIdCol]);
    }
    if (key === '') {
      Logger.log('[' + sh.getName() + '] row ' + (i + 2) + ': child id key is empty, skip');
      out.push(['']);
      missing += 1;
      continue;
    }
    const resolved = parentMap.get(key);
    if (!resolved) {
      Logger.log('[' + sh.getName() + '] row ' + (i + 2) + ': parent uuid not found for key=' + key);
      out.push(['']);
      missing += 1;
      continue;
    }
    out.push([resolved]);
    filled += 1;
  }
  sh.getRange(2, colIdx + 1, childLastRow - 1, 1).setValues(out);
  Logger.log(parent.parentUuidColName + ' filled in ' + sh.getName() + ': ' + filled + ' (missing: ' + missing + ')');
}

// =====================================================
// オプション: live_item_song.songUuid を曲名から解決して埋める
// =====================================================
/**
 * live_item_song.songUuid を song シートから曲名一致で解決して埋める。
 *   - liveItemSongName (G=6) と song.songName (E=4) の完全一致で lookup
 *   - 曲名が空の行（セトリ未登録）は songUuid を必ず空にする（誤割当を除去）
 *   - 曲名ありで songUuid が既に入っている行は手動編集とみなして尊重
 * 注意: live_item_song に songId 列は存在しない（F=### は連番）。
 *       かつて F を songId と誤認して整数 lookup していたが、連番が song.songId と
 *       偶然一致して空セトリ行へ曲が割り当たるバグの原因だったため廃止した。
 */
function fillSongUuidInLiveItemSong() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName('live_item_song');
  const songSh = ss.getSheetByName('song');
  if (!sh || !songSh) return;
  ensureColumns_(sh, ['uuid', 'liveItemUuid', 'songUuid']);
  const songUuidIdx = findColIndex_(sh, 'songUuid');
  if (songUuidIdx < 0) return;

  const songUuidCol = findColIndex_(songSh, 'uuid');
  if (songUuidCol < 0) return;
  const songNameCol = 4;   // E: songName
  const songLast = songSh.getLastRow();
  if (songLast < 2) return;
  const songRows = songSh.getRange(2, 1, songLast - 1, songSh.getLastColumn()).getValues();

  const byName = new Map();
  songRows.forEach((r) => {
    const uuid = r[songUuidCol];
    if (isBlank_(uuid)) return;
    const nm = normCell_(r[songNameCol]);
    if (nm && !byName.has(nm)) byName.set(nm, normCell_(uuid));
  });

  const last = sh.getLastRow();
  if (last < 2) return;
  const liveItemSongNameCol = 6;   // G: liveItemSongName
  const rows = sh.getRange(2, 1, last - 1, sh.getLastColumn()).getValues();
  let filledByName = 0;
  let cleared = 0;
  let missing = 0;
  const out = rows.map((r, i) => {
    const nm = normCell_(r[liveItemSongNameCol]);
    // 曲名が空 = セトリ未登録行 → songUuid は必ず空（誤割当を除去）
    if (nm === '') {
      if (!isBlank_(r[songUuidIdx])) cleared += 1;
      return [''];
    }
    // 曲名あり & 既存 songUuid は尊重（手動編集）
    if (!isBlank_(r[songUuidIdx])) return [normCell_(r[songUuidIdx])];
    const u = byName.get(nm);
    if (u) { filledByName += 1; return [u]; }
    missing += 1;
    if (missing <= 5) {
      Logger.log('[live_item_song] row ' + (i + 2) + ': songUuid not resolved (name="' + nm + '")');
    }
    return [''];
  });
  sh.getRange(2, songUuidIdx + 1, last - 1, 1).setValues(out);
  Logger.log('songUuid in live_item_song: byName=' + filledByName + ', cleared=' + cleared + ', missing=' + missing);
}

// =====================================================
// slug候補の自動生成(英訳/公式MVタイトル) → 人が選んで確定
// =====================================================
/**
 * 背景: 漢字を含む曲名は読みを機械推測できず、フォールバックslugが残る。
 * 一方で Reol 曲の公式表記は「英訳型(第六感→THE SIXTH SENSE)」と
 * 「読みローマ字型(劣等上等→RETTOU JOUTOU)」が混在しており、
 * どちらが正かは機械では判定できない。
 * → 候補を自動生成して人が選ぶ2段階方式にする(誤った恒久URLを防ぐ)。
 *
 * 使い方:
 *   1. suggestSongSlugCandidates() を実行
 *      → slug_suggestions シートにフォールバック曲の候補一覧が出る
 *        候補1: 曲名の英訳(LanguageApp、APIキー不要)
 *        候補2: 公式MVタイトルの英字部分(musicVideoUrl がある曲のみ、YouTube oEmbed)
 *   2. 「採用slug」列に確定値を入力(候補のコピーでも自由入力でもよい)
 *   3. applySongSlugSuggestions() を実行 → song シートの slug に反映
 */
const SLUG_SUGGESTION_SHEET = 'slug_suggestions';
const SLUG_SUGGESTION_HEADERS = ['songRow', '曲名', '現slug', '候補1: 英訳', '候補2: 公式MV英題', '採用slug(ここに入力)', '結果'];

function suggestSongSlugCandidates() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();
  const sh = ss.getSheetByName('song');
  if (!sh) { ui.alert('song シートがありません'); return; }
  const slugIdx = findColIndex_(sh, 'slug');
  const uuidIdx = findColIndex_(sh, 'uuid');
  const mvIdx = findColIndex_(sh, 'musicVideoUrl');
  const nameCol = 4; // E: songName
  if (slugIdx < 0 || uuidIdx < 0) { ui.alert('song シートに slug/uuid 列がありません'); return; }
  const lastRow = sh.getLastRow();
  if (lastRow < 2) return;

  const values = sh.getRange(2, 1, lastRow - 1, sh.getLastColumn()).getValues();
  const isFallback = (slug, uuid) =>
    slug !== '' && uuid !== '' && slug === uuid.replace(/-/g, '').slice(-12);

  const rows = [];
  let mvHit = 0;
  for (let i = 0; i < values.length; i++) {
    const slug = normCell_(values[i][slugIdx]);
    const uuid = normCell_(values[i][uuidIdx]);
    if (!rowHasContent_(values[i]) || !isFallback(slug, uuid)) continue;
    const name = normCell_(values[i][nameCol]);
    const trCandidate = tryTranslateToEn_(name);
    let mvCandidate = '';
    if (mvIdx >= 0) {
      const mvUrl = normCell_(values[i][mvIdx]);
      if (mvUrl) {
        mvCandidate = fetchMvTitleCandidate_(mvUrl);
        if (mvCandidate) mvHit += 1;
        Utilities.sleep(300); // oEmbed 連続アクセスの抑制
      }
    }
    rows.push([i + 2, name, slug, trCandidate, mvCandidate, '', '']);
  }

  // 候補シートを作り直す(前回の「採用slug」入力は消えるので反映後に実行し直すこと)
  let out = ss.getSheetByName(SLUG_SUGGESTION_SHEET);
  if (out) out.clear();
  else out = ss.insertSheet(SLUG_SUGGESTION_SHEET);
  out.getRange(1, 1, 1, SLUG_SUGGESTION_HEADERS.length).setValues([SLUG_SUGGESTION_HEADERS]);
  if (rows.length) {
    out.getRange(2, 1, rows.length, SLUG_SUGGESTION_HEADERS.length).setValues(rows);
  }
  ui.alert(
    'slug候補を生成しました: ' + rows.length + ' 曲(うち公式MV題候補あり ' + mvHit + ' 曲)\n\n' +
      '「' + SLUG_SUGGESTION_SHEET + '」シートの採用slug列に確定値を入力し、\n' +
      'applySongSlugSuggestions() で反映してください。\n' +
      '※候補は機械生成です。公式表記(MV題・配信表記)と照合してから採用してください'
  );
}

/** slug_suggestions の「採用slug」入力を song シートに反映する */
function applySongSlugSuggestions() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();
  const sug = ss.getSheetByName(SLUG_SUGGESTION_SHEET);
  const sh = ss.getSheetByName('song');
  if (!sug || !sh) { ui.alert(SLUG_SUGGESTION_SHEET + ' または song シートがありません'); return; }
  const slugIdx = findColIndex_(sh, 'slug');
  if (slugIdx < 0) return;
  const lastRow = sh.getLastRow();
  const songSlugs = sh.getRange(2, slugIdx + 1, lastRow - 1, 1).getValues();

  const sugLast = sug.getLastRow();
  if (sugLast < 2) { ui.alert('候補行がありません'); return; }
  const sugValues = sug.getRange(2, 1, sugLast - 1, SLUG_SUGGESTION_HEADERS.length).getValues();

  // 既存slug全体(重複防止)。反映対象行の現slugは置き換わるので除外はしない
  // (フォールバックslugと衝突する新slugは実質あり得ないため単純化)
  const usedSlugs = new Set();
  songSlugs.forEach((r) => { const v = normCell_(r[0]); if (v) usedSlugs.add(v); });

  let applied = 0;
  let skipped = 0;
  const results = [];
  for (let i = 0; i < sugValues.length; i++) {
    const songRow = Number(sugValues[i][0]);
    const adopted = normCell_(sugValues[i][5]);
    if (!adopted) { results.push(['']); skipped += 1; continue; }
    const normalized = slugify_(adopted);
    if (!normalized) { results.push(['無効(英数になりません)']); continue; }
    if (!(songRow >= 2 && songRow <= lastRow)) { results.push(['行番号不正']); continue; }
    // 同一曲の複数収録行などで重複する場合は既存規約どおり -2, -3… を自動連番
    let candidate = normalized;
    let n = 2;
    while (usedSlugs.has(candidate)) {
      candidate = normalized + '-' + n;
      n += 1;
    }
    sh.getRange(songRow, slugIdx + 1).setValue(candidate);
    usedSlugs.add(candidate);
    applied += 1;
    results.push(['反映済み → ' + candidate + (candidate !== normalized ? ' (自動連番)' : '')]);
  }
  sug.getRange(2, SLUG_SUGGESTION_HEADERS.length, sugValues.length, 1).setValues(results);
  ui.alert('採用slugを反映しました: ' + applied + ' 件(未入力スキップ ' + skipped + ' 件)\n結果列を確認してください');
}

/** 曲名を英訳して slug 候補にする(失敗時は空)。LanguageApp は Apps Script 組み込みでAPIキー不要 */
function tryTranslateToEn_(name) {
  try {
    const tr = LanguageApp.translate(String(name), 'ja', 'en');
    return slugify_(tr);
  } catch (e) {
    Logger.log('translate failed for "' + name + '": ' + e);
    return '';
  }
}

/**
 * 公式MVのタイトルから英字部分の slug 候補を作る(取得失敗・英字なしは空)。
 * ※取得するのは動画タイトル文字列のみ。チャンネルの同定等には使わない
 *   (公式リンクは oEmbed から推定しない方針のため)。
 */
function fetchMvTitleCandidate_(mvUrl) {
  try {
    const endpoint = 'https://www.youtube.com/oembed?url=' + encodeURIComponent(mvUrl) + '&format=json';
    const res = UrlFetchApp.fetch(endpoint, { muteHttpExceptions: true });
    if (res.getResponseCode() !== 200) return '';
    const title = JSON.parse(res.getContentText()).title;
    return extractLatinFromTitle_(title);
  } catch (e) {
    Logger.log('oEmbed fetch failed for ' + mvUrl + ': ' + e);
    return '';
  }
}

/**
 * MVタイトル文字列から公式英題らしき部分を抽出して slug 化する。
 * 例: 'Reol - 宵々古今 / YoiYoi Kokon Music Video' → 'yoiyoi-kokon'
 *     'Reol - 極彩色 GOKUSAISHIKI Music Video'    → 'gokusaishiki'
 */
function extractLatinFromTitle_(title) {
  let t = String(title || '').replace(/Music Video|Official Video|Lyric Video|MV|M\/V/gi, ' ');
  const clean = function (seg) {
    seg = seg.replace(/^Reol\b[\s:\-–—]*/i, '').replace(/["“”'’「」『』]/g, '');
    const s = slugify_(seg);
    return (!s || s === 'reol') ? '' : s;
  };
  // 1. '/'区切りで日本語を含まない英字セグメント(最後を優先)
  const segs = t.split(/[\/|｜]/).map(function (s) { return s.trim(); });
  let best = '';
  for (let i = 0; i < segs.length; i++) {
    if (/[a-zA-Z]/.test(segs[i]) && !/[぀-ヿ一-鿿]/.test(segs[i])) best = segs[i];
  }
  if (best) {
    const s = clean(best);
    if (s) return s;
  }
  // 2. フォールバック: タイトル全体からかな/漢字を除去して残る英字
  const latinOnly = t.replace(/[぀-ヿ一-鿿]+/g, ' ');
  return clean(latinOnly);
}
