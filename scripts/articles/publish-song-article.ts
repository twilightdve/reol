// 楽曲記事の公開スナップショット作成(plan/29 2章)。
//
// .articles-local/staging/<article_id>/ の検証済み本文を content/articles/<article_id>/ へ写す。
// content/articles はgitに入り公開されるため、明示的に記事IDと本文版を指定したときだけ動く。
// slug が仮置きのまま・作成日が未記録なら拒否する。公開日時は初回公開時に自動で記録する(2026-10-10 ユーザー決定)。
// 記事別デザイン(src/utils/songArticles/designManifest.ts)がいまの本文に対して無ければ拒否する。
//
// 予約公開(plan/43): --at に公開日時(日本時間)を渡すと、その日時を公開日時として記録する。
// 記事ページはデプロイすれば URL で読めるが、一覧・関連記事・曲ページ・HOME・サイトマップには公開日時を過ぎるまで出ない。
// 予約中の記事は --at で日時を変えられ、--at now で今すぐ公開に切り替えられる。公開済みの記事の公開日時は変えない。
// 限定公開(plan/43): --unlisted を付けると、記事ページだけをデプロイして URL で確認できる状態にする
// (一覧・関連・曲ページ・HOME・サイトマップに出さず、noindex。公開日時は記録しない)。
// 確認が済んだら --unlisted なしで出し直す(公開日時は今、または --at の日時)。
//
// 使い方:
//   npm run articles:publish -- --id reol-song-080 --revision 1
//   npm run articles:publish -- --id reol-song-047 --revision 4 --at "2026-10-15 20:00"   (日本時間)
//   npm run articles:publish -- --id reol-song-047 --revision 4 --unlisted                (限定公開)

import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";
import { PUBLISHED_DIR, STAGING_DIR } from "../../src/utils/songArticles/load";
import { parseArticleMarkdown } from "../../src/utils/songArticles/markdown";
import { designProblems } from "../../src/utils/songArticles/designCheck";
import {
  SongArticleData,
  SongArticleEditorial,
  SongArticleFile,
} from "../../src/utils/songArticles/types";

const args = process.argv.slice(2);
const argValue = (name: string): string | null => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] ?? null : null;
};

const fail = (message: string): never => {
  console.error(`[articles:publish] ${message}`);
  process.exit(1);
};

/** --at の日時(日本時間。「2026-10-15 20:00」「2026-10-15T20:00」、またはタイムゾーン付きのISO形式)をISO(UTC)にする */
const parseAt = (value: string): string => {
  if (value === "now") return new Date().toISOString();
  const local = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})$/);
  const t = local ? Date.parse(`${local[1]}-${local[2]}-${local[3]}T${local[4]}:${local[5]}:00+09:00`) : Date.parse(value);
  if (Number.isNaN(t) || (!local && !/(Z|[+-]\d{2}:?\d{2})$/.test(value.trim()))) {
    return fail(`--at の日時が読めません: ${value}(例: "2026-10-15 20:00" 日本時間)`);
  }
  return new Date(t).toISOString();
};

const id = argValue("--id") ?? fail("--id を指定してください");
const revision = Number(argValue("--revision") ?? fail("--revision(公開する本文版)を指定してください"));

const root = process.cwd();
const src = path.join(root, STAGING_DIR, id);
const dest = path.join(root, PUBLISHED_DIR, id);
if (!fs.existsSync(src)) fail(`${path.relative(root, src)} がありません。先に articles:import を実行してください`);

const data = JSON.parse(fs.readFileSync(path.join(src, "article.json"), "utf8")) as SongArticleData;
const editorial = JSON.parse(fs.readFileSync(path.join(src, "editorial.json"), "utf8")) as SongArticleEditorial;
const body = fs.readFileSync(path.join(src, "body.md"));

if (data.bodyRevision !== revision) {
  fail(`staging の本文版は ${data.bodyRevision} です(指定 ${revision})`);
}
if (crypto.createHash("sha256").update(body).digest("hex") !== data.bodySha256) {
  fail("staging の本文が取込時のsha256と一致しません。取込し直してください");
}
if (!editorial.slug || editorial.slugProposed) {
  fail("slug が未確定です。editorial.json の slug を決めて slugProposed を false にしてください");
}
if (!editorial.createdAt) {
  fail("createdAt が未記録です(記事に表示する作成日 = 原稿の Google ドキュメントの作成日)");
}
const parsed = parseArticleMarkdown(body.toString("utf8"));
if (parsed.problems.length > 0) fail(`本文に未対応の要素があります: ${parsed.problems.join(" / ")}`);
// 楽曲記事は記事ごとの独自デザインが要件(plan/29 9章)。いまの本文に対して作られたデザインが無ければ公開しない
const designIssues = designProblems(id, {
  bodyRevision: data.bodyRevision,
  bodySha256: data.bodySha256,
  blocks: parsed.blocks,
});
if (designIssues.length > 0) fail(`記事別デザインがありません: ${designIssues.join(" / ")}`);

// 公開日時: 公開済みなら初回の値を引き継ぎ、初回なら今。本文を差し替えた再公開では更新日時を記録する
const previous = fs.existsSync(path.join(dest, "article.json"))
  ? (JSON.parse(fs.readFileSync(path.join(dest, "article.json"), "utf8")) as SongArticleFile)
  : null;
const now = new Date().toISOString();
const atArg = argValue("--at");
const unlisted = args.includes("--unlisted");
if (unlisted && atArg) fail("--unlisted と --at は一緒に使えません");
const previousIsLive = previous?.publishedAt != null && Date.parse(previous.publishedAt) <= Date.now();
if (unlisted && previousIsLive) {
  fail(`${id} は ${previous?.publishedAt} に公開済みです。公開済みの記事を限定公開に戻すことはしません`);
}
if (atArg && previousIsLive) {
  fail(`${id} は ${previous?.publishedAt} に公開済みです。公開済みの記事の公開日時は変えません`);
}
// 予約公開(--at)なら指定の日時。予約中の記事を --at なしで出し直す時は、予約の日時を引き継ぐ
const publishedAt = atArg ? parseAt(atArg) : previous?.publishedAt ?? now;
// 更新日時は、公開済みの記事の本文を差し替えた時だけ(予約中の差し替えは更新に数えない)
const updatedAt =
  previous && previousIsLive && previous.bodySha256 !== data.bodySha256 ? now : previous?.updatedAt ?? null;
const published: SongArticleFile = unlisted
  ? { ...data, ...editorial, publishedAt: null, updatedAt: null, status: "unlisted" }
  : { ...data, ...editorial, publishedAt, updatedAt, status: "published" };
const tmp = `${dest}.tmp`;
fs.rmSync(tmp, { recursive: true, force: true });
fs.mkdirSync(tmp, { recursive: true });
fs.writeFileSync(path.join(tmp, "body.md"), body);
fs.writeFileSync(path.join(tmp, "article.json"), JSON.stringify(published, null, 2) + "\n");
fs.rmSync(dest, { recursive: true, force: true });
fs.renameSync(tmp, dest);
console.log(`[articles:publish] ${id} 本文版${revision} を ${path.relative(root, dest)} に置きました。差分を確認してコミットしてください`);
if (unlisted) {
  console.log(`[articles:publish] 限定公開: 記事ページだけを置きます(一覧などには出ません)。公開する時は --unlisted なしで出し直してください`);
} else if (Date.parse(publishedAt) > Date.now()) {
  const jst = new Date(publishedAt).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
  console.log(`[articles:publish] 予約公開: ${jst}(日本時間)まで、一覧などには出ません。記事ページは URL で読めます`);
}
