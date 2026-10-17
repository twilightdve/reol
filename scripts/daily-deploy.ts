// 毎日の自動デプロイ(plan/47)。launchd が1時間ごとに起こし、その日まだなら1回だけ動く。
//
// 出すのは「最後に手動でデプロイした版」だけ(2026-10-18 ユーザー決定)。コードの公開は今までどおり頼まれた時だけで、
// 毎日変わるのは表示回数(GA4)・シートのデータ・予約公開の反映だけ。
// - main の HEAD が、最後にデプロイした版(.deploy-local/deployed-commit。npm run deploy の後に書く)と違えば出さない。
// - 作業中のコピーには触らない(git fetch・merge・checkout はしない)。条件がそろわない時は出さずに次の機会を待つ。
// - 重い処理(gatsby develop・build・jest・playwright)が動いている時は出さない(メモリ不足で PC が落ちたことがある)。
// - ビルドが止まった時(シートの認証切れでブラウザ待ちになる等)は 40分で打ち切る。
//
// 使い方: scripts/daily-deploy.sh(launchd から)。--check は条件と GitHub への接続だけ確かめて、デプロイしない。

import { execSync, spawn } from "child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";

const STATE_DIR = ".deploy-local";
const DEPLOYED_COMMIT = `${STATE_DIR}/deployed-commit`;
const LAST_RUN = `${STATE_DIR}/last-run`; // デプロイを試みた日(成功・失敗とも。同じ日に2回は試みない)
const LAST_SKIP_NOTICE = `${STATE_DIR}/last-skip-notice`; // 出せなかったことを知らせた日(1日1回まで)
const PAGEVIEWS_FILE = ".analytics-local/article-pageviews.json";
const EARLIEST_HOUR = 4; // 日本時間でこの時刻より前は動かない
const SKIP_NOTICE_HOUR = 21; // この時刻を過ぎても出せていなければ知らせる
const TIMEOUT_MS = 40 * 60 * 1000;
const GENERATED_PATHS = ["static/data", "static/relive/generated", "static/og"];

const check = process.argv.includes("--check");
const jst = new Date(Date.now() + 9 * 60 * 60 * 1000);
const today = jst.toISOString().slice(0, 10);
const hour = jst.getUTCHours();

const log = (msg: string) => console.log(`[${new Date().toISOString()}] ${msg}`);
const read = (file: string) => (existsSync(file) ? readFileSync(file, "utf8").trim() : "");
const write = (file: string, value: string) => {
  mkdirSync(STATE_DIR, { recursive: true });
  writeFileSync(file, `${value}\n`);
};
const sh = (cmd: string) => execSync(cmd, { encoding: "utf8" }).trim();
const notify = (msg: string) => {
  log(`通知: ${msg}`);
  try {
    execSync(`osascript -e ${JSON.stringify(`display notification ${JSON.stringify(msg)} with title "!Legit 自動デプロイ"`)}`);
  } catch {
    // 通知が出せなくてもログには残る
  }
};

/** 出せない理由。出せる時は null */
const blocker = (): string | null => {
  const branch = sh("git branch --show-current");
  if (branch !== "main") return `作業中のブランチが main ではない(${branch || "detached"})`;
  const deployed = read(DEPLOYED_COMMIT);
  if (!deployed) return "最後にデプロイした版の記録が無い(一度 npm run deploy を手動で)";
  const head = sh("git rev-parse HEAD");
  if (head !== deployed) return "main に未デプロイの変更がある(手動でデプロイするまで自動では出さない)";
  const pathspec = [".", ...GENERATED_PATHS.map((p) => `':!${p}'`)].join(" ");
  if (sh(`git status --porcelain -- ${pathspec}`)) return "コミットされていない変更がある";
  const busy = sh("ps -axo command")
    .split("\n")
    .filter((c) => /gatsby (develop|build|serve)|jest|playwright|gh-pages -d/.test(c) && !c.includes("daily-deploy"));
  if (busy.length > 0) return `重い処理が動いている(${busy[0].slice(0, 60)})`;
  return null;
};

const runDeploy = () =>
  new Promise<number>((resolve) => {
    // 自分のプロセスグループで動かし、打ち切る時は子(gatsby など)ごと止める
    const child = spawn("npm", ["run", "deploy"], { stdio: "inherit", detached: true });
    const timer = setTimeout(() => {
      log("40分を過ぎたので打ち切ります");
      try {
        process.kill(-child.pid!, "SIGTERM");
      } catch {
        // すでに終わっている
      }
    }, TIMEOUT_MS);
    child.on("exit", (code, signal) => {
      clearTimeout(timer);
      resolve(code ?? (signal ? 1 : 0));
    });
  });

const main = async () => {
  if (check) {
    log(`確認: 今日 ${today} ${hour}時 / 最後に試みた日 ${read(LAST_RUN) || "なし"}`);
    log(`確認: 出せない理由 ${blocker() ?? "なし(出せる)"}`);
    log(`確認: GitHub への接続 ${sh("git ls-remote origin refs/heads/gh-pages").slice(0, 12)}…`);
    log(`確認: GA の認証ファイル ${existsSync(`${process.env.HOME}/.config/gcloud/application_default_credentials.json`) ? "あり" : "なし"}`);
    return;
  }
  if (read(LAST_RUN) === today) return;
  if (hour < EARLIEST_HOUR) return;

  const reason = blocker();
  if (reason) {
    log(`出しません: ${reason}`);
    if (hour >= SKIP_NOTICE_HOUR && read(LAST_SKIP_NOTICE) !== today) {
      write(LAST_SKIP_NOTICE, today);
      notify(`今日の自動デプロイはできませんでした: ${reason}`);
    }
    return;
  }

  write(LAST_RUN, today);
  notify("自動デプロイを始めます(10分ほど)。終わるまで開発サーバーを起動しないでください");
  const started = Date.now();
  const code = await runDeploy();
  if (code !== 0) {
    notify(`自動デプロイに失敗しました(終了コード ${code})。~/Library/Logs/reol-daily-deploy.log を確認してください`);
    return;
  }
  // 表示回数の取得は失敗してもデプロイを止めないので、ここで取れたかを確かめる
  const fetchedAt = existsSync(PAGEVIEWS_FILE) ? Date.parse(JSON.parse(readFileSync(PAGEVIEWS_FILE, "utf8")).fetchedAt) : 0;
  if (!(fetchedAt >= started)) {
    notify("デプロイはしましたが、GA から表示回数を取れませんでした(認証切れの可能性)。数は前回のままです");
    return;
  }
  log("自動デプロイ完了");
};

main().catch((e) => notify(`自動デプロイが途中で止まりました: ${e?.message ?? e}`));
