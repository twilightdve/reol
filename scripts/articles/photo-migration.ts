// 旧 PHOTO(src/components/index/photography/posts.ts)を、読みものの記録(kind: "record")へ移すための道具(plan/72)。
//
// 台帳は .articles-local/photo-migration/ledger.json(git に入らない)。旧 PHOTO の1件ごとに、
// どの記事のまとまり(グループ)に入れるか・どの記録に移したかを持つ。
// posts.ts と index.ts は TypeScript として実行せず、構文木から値だけを読む。
//
// 使い方:
//   npm run articles:photo -- init --inventory <photo-inventory.json>   台帳を棚卸しの結果から作る(初回だけ。上書きしない)
//   npm run articles:photo -- check                                     台帳と旧 PHOTO・移した記録の対応を検査する
//   npm run articles:photo -- generate --group <グループID>             記録の原稿の雛形を表示する(書き込まない)
//   npm run articles:photo -- generate --group <グループID> --write     .articles-local/records/<記事ID>/ に書く(既にあれば書かない)
//
// generate が作るのは雛形まで。写真の代替テキスト(alt)は空のまま出すので、写真を実際に見て書くまで取込(articles:record)は通らない。
// 文章は旧 PHOTO の題名と説明をそのまま写すだけで、足さない。

import * as fs from "fs";
import * as path from "path";
import * as ts from "typescript";
import { LOCAL_DIR, PUBLISHED_DIR } from "../../src/utils/songArticles/load";
import { RecordMediaFile, RecordMediaItem, RecordRelatedLink } from "../../src/utils/songArticles/types";

const POSTS_FILE = "src/components/index/photography/posts.ts";
const INDEX_FILE = "src/components/index/photography/index.ts";
const LEDGER_FILE = `${LOCAL_DIR}/photo-migration/ledger.json`;
const RECORD_SOURCE_DIR = `${LOCAL_DIR}/records`;

/** 旧 PHOTO の種類(posts.ts の TYPES) */
type LegacyType = "photo" | "photo_tate" | "photo_wide" | "youtube" | "youtube_tate" | "post";
type LegacyItem =
  | { type: "photo" | "photo_tate" | "photo_wide"; imageSymbol: string; sourcePath: string | null }
  | { type: "youtube" | "youtube_tate" | "post"; videoId: string };
type LegacyPost = {
  sourceId: string;
  sourceIndex: number;
  date: string;
  title: string;
  description: string;
  items: LegacyItem[];
  links: { title: string; url: string }[];
  relatedPosts: string[];
};

type LedgerPost = LegacyPost & {
  /** 棚卸しの時のハッシュ(計算方法の記載が無いので、照合には使わず控えとして残す) */
  inventorySourceHash: string | null;
  issues: unknown[];
  groupId: string;
};
type LedgerGroup = {
  groupId: string;
  label: string;
  category: string;
  sourceIds: string[];
  /** 移した先の記録の記事ID。まだなら null */
  recordId: string | null;
  status: "unstarted" | "draft" | "published";
  /**
   * この記録に写さなかった写真・動画・リンク(理由を添える)。例: { ref: "photo-001#link0", reason: "…" }
   * 別の記録へ移した写真・動画は movedTo に移した先の記事IDを書く(移した先に在るかも検査する)
   */
  omitted: { ref: string; reason: string; movedTo?: string }[];
};
type Ledger = {
  inventorySourceCommit: string | null;
  expected: { posts: number; photos: number; videos: number; links: number; relatedPosts: number };
  posts: LedgerPost[];
  groups: LedgerGroup[];
};

/** グループの分類 → シリーズ(series.ts)。hold は記事にしない */
const SERIES_BY_CATEGORY: Record<string, string> = {
  live: "live-to-ensei-no-kiroku",
  travel: "live-to-ensei-no-kiroku",
  place: "seichi-wo-aruku",
  event: "event-to-seisaku-no-kiroku",
};

const root = process.cwd();
const args = process.argv.slice(2);
const argValue = (name: string): string | null => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] ?? null : null;
};
const fail = (message: string): never => {
  console.error(`[articles:photo] ${message}`);
  process.exit(1);
};
const readJson = <T>(file: string): T => JSON.parse(fs.readFileSync(file, "utf8")) as T;

const isPhoto = (item: LegacyItem): item is Extract<LegacyItem, { imageSymbol: string }> => "imageSymbol" in item;

/** リンクから計測用のパラメータを外す(utm_*、地図・SNS の共有で付くもの) */
export const stripTracking = (url: string): string => {
  try {
    const u = new URL(url);
    for (const key of [...u.searchParams.keys()]) {
      if (/^(utm_[a-z_]+|g_st|igsh|igshid|fbclid|si)$/i.test(key)) u.searchParams.delete(key);
    }
    return u.toString();
  } catch {
    return url;
  }
};

/** index.ts の `export { default as 名前 } from "…/images/…"` を、名前 → リポジトリの中のパスにする */
const parseImageIndex = (): Map<string, string> => {
  const file = path.join(root, INDEX_FILE);
  const source = ts.createSourceFile(file, fs.readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true);
  const map = new Map<string, string>();
  for (const st of source.statements) {
    if (!ts.isExportDeclaration(st) || !st.moduleSpecifier || !ts.isStringLiteral(st.moduleSpecifier)) continue;
    if (!st.exportClause || !ts.isNamedExports(st.exportClause)) continue;
    const resolved = path.relative(root, path.resolve(path.dirname(file), st.moduleSpecifier.text));
    for (const el of st.exportClause.elements) map.set(el.name.text, resolved);
  }
  return map;
};

/** posts.ts の posts 配列を、値として読む(実行しない) */
export const parseLegacyPosts = (): LegacyPost[] => {
  const images = parseImageIndex();
  const file = path.join(root, POSTS_FILE);
  const source = ts.createSourceFile(file, fs.readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true);
  let array: ts.ArrayLiteralExpression | null = null;
  for (const st of source.statements) {
    if (!ts.isVariableStatement(st)) continue;
    for (const d of st.declarationList.declarations) {
      if (ts.isIdentifier(d.name) && d.name.text === "posts" && d.initializer && ts.isArrayLiteralExpression(d.initializer)) array = d.initializer;
    }
  }
  if (!array) return fail(`${POSTS_FILE} に posts の配列が見つかりません`);

  const text = (node: ts.Expression, where: string): string =>
    ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node) ? node.text : fail(`${where}: 文字列ではありません(${node.getText().slice(0, 40)})`);
  const props = (node: ts.Expression, where: string): Map<string, ts.Expression> => {
    if (!ts.isObjectLiteralExpression(node)) return fail(`${where}: オブジェクトではありません`);
    const m = new Map<string, ts.Expression>();
    for (const p of node.properties) {
      if (!ts.isPropertyAssignment(p) || !(ts.isIdentifier(p.name) || ts.isStringLiteral(p.name))) return fail(`${where}: 読めない書き方の項目があります`);
      m.set(p.name.text, p.initializer);
    }
    return m;
  };
  const list = (node: ts.Expression | undefined, where: string): ts.Expression[] => {
    if (!node) return [];
    return ts.isArrayLiteralExpression(node) ? [...node.elements] : fail(`${where}: 配列ではありません`);
  };

  return array.elements.map((el, sourceIndex) => {
    const sourceId = `photo-${String(sourceIndex + 1).padStart(3, "0")}`;
    const p = props(el, sourceId);
    const need = (key: string): ts.Expression => p.get(key) ?? fail(`${sourceId}: ${key} がありません`);
    const items = list(p.get("items"), `${sourceId}.items`).map((itemNode, i): LegacyItem => {
      const where = `${sourceId}#${i}`;
      const item = props(itemNode, where);
      const typeNode = item.get("type");
      const srcNode = item.get("src");
      if (!typeNode || !srcNode || !ts.isPropertyAccessExpression(typeNode)) return fail(`${where}: type か src が読めません`);
      const type = typeNode.name.text as LegacyType;
      if (type === "photo" || type === "photo_tate" || type === "photo_wide") {
        if (!ts.isPropertyAccessExpression(srcNode)) return fail(`${where}: 写真の src が images.名前 の形ではありません`);
        const imageSymbol = srcNode.name.text;
        return { type, imageSymbol, sourcePath: images.get(imageSymbol) ?? null };
      }
      if (type === "youtube" || type === "youtube_tate" || type === "post") return { type, videoId: text(srcNode, where) };
      return fail(`${where}: 知らない種類です: ${String(type)}`);
    });
    return {
      sourceId,
      sourceIndex,
      date: text(need("date"), `${sourceId}.date`),
      title: text(need("title"), `${sourceId}.title`),
      description: p.has("description") ? text(need("description"), `${sourceId}.description`) : "",
      items,
      links: list(p.get("links"), `${sourceId}.links`).map((l, i) => {
        const link = props(l, `${sourceId}.links[${i}]`);
        const get = (key: string) => text(link.get(key) ?? fail(`${sourceId}.links[${i}]: ${key} がありません`), `${sourceId}.links[${i}].${key}`);
        return { title: get("title"), url: get("url") };
      }),
      relatedPosts: list(p.get("relatedPosts"), `${sourceId}.relatedPosts`).map((n, i) => text(n, `${sourceId}.relatedPosts[${i}]`)),
    };
  });
};

const totals = (posts: LegacyPost[]) => ({
  posts: posts.length,
  photos: posts.reduce((n, p) => n + p.items.filter(isPhoto).length, 0),
  videos: posts.reduce((n, p) => n + p.items.filter((i) => !isPhoto(i)).length, 0),
  links: posts.reduce((n, p) => n + p.links.length, 0),
  relatedPosts: posts.reduce((n, p) => n + p.relatedPosts.length, 0),
});

const loadLedger = (): Ledger => {
  const file = path.join(root, LEDGER_FILE);
  if (!fs.existsSync(file)) return fail(`${LEDGER_FILE} がありません。先に init --inventory <photo-inventory.json> で作ってください`);
  return readJson<Ledger>(file);
};

// ----- init: 棚卸しの結果(photo-inventory.json)から台帳を作る -----

type Inventory = {
  summary: { sourceCommit?: string; postCount: number; photoReferenceCount: number; videoReferenceCount: number; externalLinkReferences: number; relatedPostReferences: number };
  posts: { sourceId: string; sourceHash?: string; issues?: unknown[]; candidateGroupId: string }[];
  candidateGroups: { candidateGroupId: string; proposedLabel: string; proposedCategory: string; sourceIds: string[] }[];
};

const init = () => {
  const file = path.join(root, LEDGER_FILE);
  if (fs.existsSync(file)) fail(`${LEDGER_FILE} は既にあります(上書きしません)`);
  const inventoryFile = argValue("--inventory") ?? fail("--inventory <photo-inventory.json> を指定してください");
  const inventory = readJson<Inventory>(path.resolve(inventoryFile));
  const current = new Map(parseLegacyPosts().map((p) => [p.sourceId, p]));
  const ledger: Ledger = {
    inventorySourceCommit: inventory.summary.sourceCommit ?? null,
    expected: {
      posts: inventory.summary.postCount,
      photos: inventory.summary.photoReferenceCount,
      videos: inventory.summary.videoReferenceCount,
      links: inventory.summary.externalLinkReferences,
      relatedPosts: inventory.summary.relatedPostReferences,
    },
    // 中身は今の posts.ts から読む(棚卸しの JSON の文章は写さない)。まとまりと未確認の点だけ棚卸しから引き継ぐ
    posts: inventory.posts.map((p) => {
      const post = current.get(p.sourceId) ?? fail(`棚卸しの ${p.sourceId} が posts.ts にありません`);
      return { ...post, inventorySourceHash: p.sourceHash ?? null, issues: p.issues ?? [], groupId: p.candidateGroupId };
    }),
    groups: inventory.candidateGroups.map((g) => ({
      groupId: g.candidateGroupId,
      label: g.proposedLabel,
      category: g.proposedCategory,
      sourceIds: g.sourceIds,
      recordId: null,
      status: "unstarted",
      omitted: [],
    })),
  };
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(ledger, null, 2) + "\n");
  console.log(`[articles:photo] ${LEDGER_FILE} を作りました(${ledger.posts.length}件・${ledger.groups.length}グループ)。続けて check を実行してください`);
};

// ----- check: 台帳 ↔ 旧 PHOTO ↔ 移した記録 -----

/** 移した記録の原稿。公開済み(content/articles)があればそちら、無ければ下書き(.articles-local/records) */
const readRecord = (recordId: string): { where: string; body: string; media: RecordMediaFile; relatedLinks: RecordRelatedLink[] } | null => {
  const published = path.join(root, PUBLISHED_DIR, recordId);
  if (fs.existsSync(path.join(published, "article.json"))) {
    return {
      where: path.relative(root, published),
      body: fs.readFileSync(path.join(published, "body.md"), "utf8"),
      media: readJson<RecordMediaFile>(path.join(published, "media.json")),
      relatedLinks: readJson<{ relatedLinks?: RecordRelatedLink[] }>(path.join(published, "article.json")).relatedLinks ?? [],
    };
  }
  const draft = path.join(root, RECORD_SOURCE_DIR, recordId);
  if (fs.existsSync(path.join(draft, "meta.json"))) {
    return {
      where: path.relative(root, draft),
      body: fs.readFileSync(path.join(draft, "body.md"), "utf8"),
      media: readJson<RecordMediaFile>(path.join(draft, "media.json")),
      relatedLinks: readJson<{ relatedLinks?: RecordRelatedLink[] }>(path.join(draft, "meta.json")).relatedLinks ?? [],
    };
  }
  return null;
};

const check = () => {
  const ledger = loadLedger();
  const current = parseLegacyPosts();
  const problems: string[] = [];

  // 1. 台帳の中身が、今の posts.ts と同じか(棚卸しの後で旧 PHOTO が変わっていないか)
  const byId = new Map(current.map((p) => [p.sourceId, p]));
  if (current.length !== ledger.posts.length) problems.push(`件数が違います: posts.ts ${current.length}件 / 台帳 ${ledger.posts.length}件`);
  for (const lp of ledger.posts) {
    const cp = byId.get(lp.sourceId);
    if (!cp) {
      problems.push(`${lp.sourceId}: posts.ts にありません`);
      continue;
    }
    for (const key of ["date", "title", "description", "items", "links", "relatedPosts"] as const) {
      if (JSON.stringify(cp[key]) !== JSON.stringify(lp[key])) problems.push(`${lp.sourceId}: ${key} が台帳と違います(旧 PHOTO が変わっています)`);
    }
    for (const [i, item] of cp.items.entries()) {
      if (isPhoto(item) && (!item.sourcePath || !fs.existsSync(path.join(root, item.sourcePath)))) problems.push(`${lp.sourceId}#${i}: 画像がありません(${item.imageSymbol})`);
    }
  }

  // 2. 数(棚卸しの時の数と同じか)
  const now = totals(current);
  for (const key of Object.keys(ledger.expected) as (keyof Ledger["expected"])[]) {
    if (now[key] !== ledger.expected[key]) problems.push(`数が違います(${key}): いま ${now[key]} / 棚卸し ${ledger.expected[key]}`);
  }

  // 3. どの1件も、ちょうど1つのグループに入っているか
  const groupOf = new Map<string, string[]>();
  for (const g of ledger.groups) for (const id of g.sourceIds) groupOf.set(id, [...(groupOf.get(id) ?? []), g.groupId]);
  for (const lp of ledger.posts) {
    const groups = groupOf.get(lp.sourceId) ?? [];
    if (groups.length !== 1) problems.push(`${lp.sourceId}: 入っているグループが ${groups.length} 個です(${groups.join(", ") || "なし"})`);
    else if (groups[0] !== lp.groupId) problems.push(`${lp.sourceId}: groupId(${lp.groupId})とグループの sourceIds(${groups[0]})が違います`);
  }
  for (const id of groupOf.keys()) if (!ledger.posts.some((p) => p.sourceId === id)) problems.push(`グループが、台帳に無い ${id} を指しています`);

  // 4. 移した記録: 写真・動画・リンク・関連投稿を、記録の中まで追えるか
  const recordIds = new Map<string, string>();
  let migrated = 0;
  for (const g of ledger.groups) {
    if (!g.recordId) continue;
    const dup = recordIds.get(g.recordId);
    if (dup) problems.push(`${g.groupId}: 記録 ${g.recordId} が ${dup} と重なっています(1グループ = 1記事)`);
    recordIds.set(g.recordId, g.groupId);
    const record = readRecord(g.recordId);
    if (!record) {
      problems.push(`${g.groupId}: 記録 ${g.recordId} の原稿が見つかりません`);
      continue;
    }
    migrated += 1;
    const omitted = new Set(g.omitted.map((o) => o.ref));
    const from = new Map(record.media.items.filter((m) => m.from).map((m) => [m.from as string, m]));
    const urls = [...record.relatedLinks.map((l) => l.href), ...[...record.body.matchAll(/\]\((https?:\/\/[^)\s]+)\)/g)].map((m) => m[1])];
    for (const sourceId of g.sourceIds) {
      const post = byId.get(sourceId);
      if (!post) continue;
      for (const [i, item] of post.items.entries()) {
        const ref = `${sourceId}#${i}`;
        const movedTo = g.omitted.find((o) => o.ref === ref)?.movedTo;
        if (omitted.has(ref) && !movedTo) continue;
        // 別の記録へ移したものは、移した先で確かめる
        const target = movedTo ? readRecord(movedTo) : record;
        const where = movedTo ?? g.recordId;
        if (!target) {
          problems.push(`${g.recordId}: ${ref} の移した先 ${where} の原稿が見つかりません`);
          continue;
        }
        const m = movedTo ? target.media.items.find((x) => x.from === ref) : from.get(ref);
        if (!m) problems.push(`${where}: ${ref} の写真・動画が記録にありません(media.json の from)`);
        else if (isPhoto(item) ? m.type !== "photo" || m.src !== item.sourcePath : m.type !== "youtube" || m.videoId !== item.videoId) {
          problems.push(`${where}: ${ref} の中身が旧 PHOTO と違います`);
        }
      }
      for (const [i, link] of post.links.entries()) {
        const ref = `${sourceId}#link${i}`;
        if (!omitted.has(ref) && !urls.includes(stripTracking(link.url))) problems.push(`${g.recordId}: ${ref} のリンクが記録にありません(${stripTracking(link.url)})`);
      }
      for (const [i, postId] of post.relatedPosts.entries()) {
        const ref = `${sourceId}#post${i}`;
        if (!omitted.has(ref) && !urls.some((u) => u.includes(`/status/${postId}`))) problems.push(`${g.recordId}: ${ref} の関連投稿が記録にありません(${postId})`);
      }
    }
    // 記録にあるのに「写さなかった」と書いてあるもの(台帳の書き忘れ・消し忘れ)
    for (const o of g.omitted) if (!o.movedTo && from.has(o.ref)) problems.push(`${g.recordId}: ${o.ref} は「写さなかった」とあるのに記録にあります`);
    // 旧 PHOTO に無い写真・動画が混ざっていないか(足した時は from を付けないので、ここでは数だけ知らせる)
    const added = record.media.items.filter((m) => !m.from).length;
    if (added > 0) console.log(`[articles:photo] ${g.recordId}: 旧 PHOTO に無い写真・動画が ${added} 件あります(${record.where})`);
  }

  console.log(
    `[articles:photo] 旧 PHOTO ${now.posts}件(写真 ${now.photos}・動画 ${now.videos}・リンク ${now.links}・関連投稿 ${now.relatedPosts})/ ${ledger.groups.length}グループ / 記録に移したグループ ${migrated}`
  );
  if (problems.length > 0) {
    console.error(`[articles:photo] 問題が ${problems.length} 件あります`);
    for (const p of problems) console.error(`  - ${p}`);
    process.exit(1);
  }
  console.log("[articles:photo] 問題はありません");
};

// ----- generate: 記録の原稿の雛形 -----

const isoDate = (legacy: string): string | null => {
  const m = legacy.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
  return m ? `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}` : null;
};

const generate = () => {
  const ledger = loadLedger();
  const groupId = argValue("--group") ?? fail("--group <グループID> を指定してください");
  const group = ledger.groups.find((g) => g.groupId === groupId) ?? fail(`台帳に無いグループです: ${groupId}`);
  const seriesSlug = SERIES_BY_CATEGORY[group.category] ?? fail(`分類「${group.category}」のグループは記事にしません(台帳の category を確かめてください)`);
  const current = new Map(parseLegacyPosts().map((p) => [p.sourceId, p]));
  const posts = group.sourceIds.map((id) => current.get(id) ?? fail(`${id} が posts.ts にありません`));

  const dates = posts.map((p) => isoDate(p.date)).filter((d): d is string => Boolean(d)).sort();
  const eventDate = dates[0] ?? null;
  const eventDateEnd = dates.length > 0 && dates[dates.length - 1] !== eventDate ? dates[dates.length - 1] : null;
  const recordId = argValue("--id") ?? group.recordId ?? `record-${groupId}`;
  const single = posts.length === 1;

  const items: RecordMediaItem[] = [];
  const relatedLinks: RecordRelatedLink[] = [];
  // 題名は、1件だけなら旧 PHOTO の題名のまま。複数をまとめる時はグループの名前(案)で、元の題名は見出しにする
  const body: string[] = [`# ${single ? posts[0].title : group.label}`, ""];
  for (const post of posts) {
    if (!single) body.push(`## ${post.title}`, "");
    if (post.description.trim()) body.push(post.description.trim(), "");
    // 元の順のまま、写真の続き・動画の続きごとに1つのブロックにする
    const runs: { id: string; type: "photo" | "youtube" }[][] = [];
    for (const [i, item] of post.items.entries()) {
      const id = `s${post.sourceId.replace("photo-", "")}-${String(i + 1).padStart(2, "0")}`;
      const from = `${post.sourceId}#${i}`;
      if (isPhoto(item)) items.push({ id, type: "photo", src: item.sourcePath ?? "", alt: "", from });
      else items.push({ id, type: "youtube", videoId: item.videoId, ...(item.type === "youtube_tate" ? { vertical: true } : {}), title: post.title, from });
      const type = isPhoto(item) ? "photo" : "youtube";
      const last = runs[runs.length - 1];
      if (last && last[0].type === type) last.push({ id, type });
      else runs.push([{ id, type }]);
    }
    for (const run of runs) {
      const json = run.length === 1 ? { type: run[0].type, id: run[0].id } : { type: "gallery", ids: run.map((r) => r.id) };
      body.push("```media", JSON.stringify(json), "```", "");
    }
    for (const link of post.links) {
      const href = stripTracking(link.url);
      if (!relatedLinks.some((l) => l.href === href)) relatedLinks.push({ label: link.title, href, ...(single ? {} : { note: post.title }) });
    }
    for (const postId of post.relatedPosts) {
      // 誰の投稿かはここでは分からないので、表示文言は仮のもの(投稿を確かめて書き直す)
      const href = `https://x.com/i/status/${postId}`;
      if (!relatedLinks.some((l) => l.href === href)) relatedLinks.push({ label: "関連する X の投稿", href, ...(single ? {} : { note: post.title }) });
    }
  }
  const media: RecordMediaFile = { cover: items.find((m) => m.type === "photo")?.id ?? null, items };
  const meta = {
    seriesSlug,
    eventDate,
    ...(eventDateEnd ? { eventDateEnd } : {}),
    songRefs: [],
    relatedLinks,
    // 旧 PHOTO に載せた日。git の履歴からは分からない(2025-04-29 にまとめて入ったコミットより前を追えない)ので、
    // 分かる時だけ手で入れる
    legacyPublishedAt: null,
    // 移した過去の記録は、HOME の新着と RSS に出さない
    initial: { slug: recordId.replace(/^record-/, ""), announce: false, summary: null, tags: [] },
  };
  const files: [string, string][] = [
    ["body.md", body.join("\n")],
    ["media.json", JSON.stringify(media, null, 2) + "\n"],
    ["meta.json", JSON.stringify(meta, null, 2) + "\n"],
  ];

  const dir = path.join(root, RECORD_SOURCE_DIR, recordId);
  const issues = ledger.posts.filter((p) => group.sourceIds.includes(p.sourceId) && p.issues.length > 0);
  for (const p of issues) console.log(`[articles:photo] 未確認の点(${p.sourceId}): ${JSON.stringify(p.issues)}`);
  if (!args.includes("--write")) {
    for (const [name, content] of files) console.log(`\n----- ${path.join(RECORD_SOURCE_DIR, recordId, name)}${fs.existsSync(path.join(dir, name)) ? "(既にあります。書きません)" : ""} -----\n${content}`);
    console.log(`[articles:photo] 表示だけ行いました。書く時は --write を付けてください(既にあるファイルは書きません)`);
    return;
  }
  fs.mkdirSync(dir, { recursive: true });
  for (const [name, content] of files) {
    const file = path.join(dir, name);
    if (fs.existsSync(file)) {
      console.log(`[articles:photo] ${path.relative(root, file)} は既にあるので書きません`);
      continue;
    }
    fs.writeFileSync(file, content);
    console.log(`[articles:photo] ${path.relative(root, file)} を書きました`);
  }
  // 台帳には、移す先の記事IDと状態だけを書く(まとまり・元の中身は変えない)
  if (group.recordId !== recordId || group.status === "unstarted") {
    group.recordId = recordId;
    if (group.status === "unstarted") group.status = "draft";
    fs.writeFileSync(path.join(root, LEDGER_FILE), JSON.stringify(ledger, null, 2) + "\n");
    console.log(`[articles:photo] 台帳の ${groupId} を ${recordId}(${group.status})にしました`);
  }
  console.log("[articles:photo] 写真を見て alt を書き、題名・リンクの表示文言・表紙を確かめてから npm run articles:record で取り込んでください");
};

const main = () => {
  const command = args[0];
  if (command === "init") init();
  else if (command === "check") check();
  else if (command === "generate") generate();
  else fail("init / check / generate のどれかを指定してください");
};

if (require.main === module) main();
