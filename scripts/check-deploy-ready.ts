// デプロイ前ガード。コミットされていない変更(未追跡ファイルを含む)がある状態で
// デプロイすると、本番がgitから再現できなくなるため中止する。
//
// ビルドのたびにシートやローカルデータから再生成される出力(static/data・
// static/relive/generated・static/og)は、ビルド自体が作り直すので対象外にする。

import { execSync } from "child_process";
import { existsSync, readdirSync, readFileSync } from "fs";
import path from "path";

// 楽曲記事のプレビュー(plan/29)は未公開原稿をビルドに含めるため、本番ビルドでは使わない
if (process.env.ARTICLES_PREVIEW) {
  console.error("ARTICLES_PREVIEW が設定されています。未公開記事を含むビルドはデプロイできません。");
  process.exit(1);
}

// 公開中の楽曲記事には、表紙を撮った OGP 画像(npm run articles:og)が要る
const articlesDir = "content/articles";
const missingOg = existsSync(articlesDir)
  ? readdirSync(articlesDir).flatMap((id) => {
      const file = path.join(articlesDir, id, "article.json");
      if (!existsSync(file)) return [];
      const a = JSON.parse(readFileSync(file, "utf8"));
      return (a.status === "published" || a.status === "unlisted") && a.slug && !existsSync(`static/articles-og/${a.slug}.jpg`) ? [`${id}(${a.slug})`] : [];
    })
  : [];
if (missingOg.length > 0) {
  console.error("公開中の記事に OGP 画像がないため、デプロイを中止します。");
  console.error("開発サーバーを起動して npm run articles:og を実行し、static/articles-og をコミットしてください。\n");
  console.error(missingOg.join("\n"));
  process.exit(1);
}

const GENERATED_PATHS = ["static/data", "static/relive/generated", "static/og"];

const pathspec = [".", ...GENERATED_PATHS.map((p) => `':!${p}'`)].join(" ");
const status = execSync(`git status --porcelain -- ${pathspec}`, { encoding: "utf8" }).trim();

if (status) {
  console.error("コミットされていない変更があるため、デプロイを中止します。");
  console.error("コミットしてから再実行してください(ビルド生成物は対象外)。\n");
  console.error(status);
  process.exit(1);
}

const branch = execSync("git rev-parse --abbrev-ref HEAD", { encoding: "utf8" }).trim();
const commit = execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim();
console.log(`[deploy] ${branch} @ ${commit} からデプロイします`);
