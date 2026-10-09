// 楽曲記事の公開スナップショット作成(plan/29 2章)。
//
// .articles-local/staging/<article_id>/ の検証済み本文を content/articles/<article_id>/ へ写す。
// content/articles はgitに入り公開されるため、明示的に記事IDと本文版を指定したときだけ動く。
// slug が仮置きのまま・作成日が未記録なら拒否する。公開日時は初回公開時に自動で記録する(2026-10-10 ユーザー決定)。
// 記事別デザイン(src/utils/songArticles/designManifest.ts)がいまの本文に対して無ければ拒否する。
//
// 使い方:
//   npm run articles:publish -- --id reol-song-080 --revision 1

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
const publishedAt = previous?.publishedAt ?? now;
const updatedAt =
  previous && previous.bodySha256 !== data.bodySha256 ? now : previous?.updatedAt ?? null;
const published: SongArticleFile = { ...data, ...editorial, publishedAt, updatedAt, status: "published" };
const tmp = `${dest}.tmp`;
fs.rmSync(tmp, { recursive: true, force: true });
fs.mkdirSync(tmp, { recursive: true });
fs.writeFileSync(path.join(tmp, "body.md"), body);
fs.writeFileSync(path.join(tmp, "article.json"), JSON.stringify(published, null, 2) + "\n");
fs.rmSync(dest, { recursive: true, force: true });
fs.renameSync(tmp, dest);
console.log(`[articles:publish] ${id} 本文版${revision} を ${path.relative(root, dest)} に置きました。差分を確認してコミットしてください`);
