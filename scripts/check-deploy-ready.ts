// デプロイ前ガード。コミットされていない変更(未追跡ファイルを含む)がある状態で
// デプロイすると、本番がgitから再現できなくなるため中止する。
//
// ビルドのたびにシートやローカルデータから再生成される出力(static/data・
// static/relive/generated・static/og)は、ビルド自体が作り直すので対象外にする。

import { execSync } from "child_process";

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
