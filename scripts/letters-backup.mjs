// 手紙企画のバックアップ(plan/64)。scripts/letters-backup.sh から呼ぶ。
// Supabase の letters_backup_export(バックアップ専用の鍵で読み出すだけ)を呼び、
// ~/Backups/reol-letters/letters-YYYYMMDD-HHMM.json.gz に保存する。新しい 60 個(6 時間ごとで 15 日分)を残す。
// 鍵・接続の設定は表示しない。
//   node scripts/letters-backup.mjs                       1 回バックアップする
//   node scripts/letters-backup.mjs restore-sql <file>    バックアップから戻す SQL を <file>.restore.sql に書く(SQL Editor で実行。
//                                                         今ある行は上書きせず、無くなった行だけを足す)
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import zlib from "node:zlib";

const repo = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const KEY_FILE = path.join(os.homedir(), ".config/reol/letters-backup.key");
const OUT_DIR = path.join(os.homedir(), "Backups/reol-letters");
const KEEP = 60;

const readEnv = (file) =>
  Object.fromEntries(
    fs
      .readFileSync(file, "utf8")
      .split("\n")
      .map((l) => l.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"\n]*)"?\s*$/))
      .filter(Boolean)
      .map((m) => [m[1], m[2]])
  );

const stamp = (d) => {
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`;
};

const main = async () => {
  const env = readEnv(path.join(repo, ".env"));
  const url = env.GATSBY_SUPABASE_URL;
  const anon = env.GATSBY_SUPABASE_ANON_KEY;
  if (!url || !anon) throw new Error(".env に Supabase の接続先がありません");
  if (!fs.existsSync(KEY_FILE)) throw new Error(`バックアップ専用の鍵がありません(scripts/letters-backup.sh setup を実行してください): ${KEY_FILE}`);
  const key = fs.readFileSync(KEY_FILE, "utf8").trim();

  const res = await fetch(`${url}/rest/v1/rpc/letters_backup_export`, {
    method: "POST",
    headers: { apikey: anon, Authorization: `Bearer ${anon}`, "Content-Type": "application/json" },
    body: JSON.stringify({ p_key: key }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`読み出せませんでした(HTTP ${res.status})${/forbidden/.test(text) ? ": 鍵が登録されていません" : ""}`);
  const data = JSON.parse(text);
  if (data?.format !== "reol-letters-backup-v1" || !Array.isArray(data.letters) || !Array.isArray(data.versions)) throw new Error("思った形のデータではありませんでした");

  fs.mkdirSync(OUT_DIR, { recursive: true, mode: 0o700 });
  const file = path.join(OUT_DIR, `letters-${stamp(new Date())}.json.gz`);
  fs.writeFileSync(file, zlib.gzipSync(Buffer.from(JSON.stringify(data, null, 1))), { mode: 0o600 });

  // 古いものを消す(新しい KEEP 個を残す)
  const all = fs.readdirSync(OUT_DIR).filter((f) => /^letters-\d{8}-\d{4}\.json\.gz$/.test(f)).sort();
  for (const f of all.slice(0, Math.max(0, all.length - KEEP))) fs.unlinkSync(path.join(OUT_DIR, f));

  const active = data.letters.filter((l) => !l.withdrawn_at).length;
  console.log(`${new Date().toISOString()} 保存しました: ${path.basename(file)}(手紙 ${data.letters.length} 通・取り下げていない ${active} 通・版 ${data.versions.length}・保存 ${Math.min(all.length, KEEP)} 個)`);
};

// 戻す SQL。jsonb_populate_recordset で列名どおりに入れ、今ある行(主キー・一意が重なるもの)は触らない
export const restoreSql = (data) => {
  if (data?.format !== "reol-letters-backup-v1") throw new Error("手紙のバックアップではありません");
  const tag = `bk${Math.random().toString(36).slice(2, 10)}`;
  const json = (v) => {
    const t = JSON.stringify(v ?? []);
    if (t.includes(`$${tag}$`)) throw new Error("区切りが本文と重なりました。もう一度実行してください");
    return `$${tag}$${t}$${tag}$::jsonb`;
  };
  const put = (table, rows) =>
    `INSERT INTO public.${table} SELECT * FROM jsonb_populate_recordset(NULL::public.${table}, ${json(rows)}) ON CONFLICT DO NOTHING;`;
  return [
    `-- 手紙のバックアップ(${data.exportedAt})から戻す。今ある行はそのまま、無くなった行だけを足す。`,
    `-- 手紙 ${data.letters.length} 通・版 ${data.versions.length}・印刷の束 ${data.printBatches?.length ?? 0}・印刷の記録 ${data.printItems?.length ?? 0}`,
    "BEGIN;",
    put("birthday_letters", data.letters),
    put("birthday_letter_versions", data.versions),
    put("birthday_letter_print_batches", data.printBatches),
    put("birthday_letter_print_items", data.printItems),
    "COMMIT;",
    "SELECT (SELECT count(*) FROM public.birthday_letters) AS letters, (SELECT count(*) FROM public.birthday_letter_versions) AS versions;",
    "",
  ].join("\n");
};

const restoreMain = (file) => {
  if (!file) throw new Error("戻すバックアップのファイルを指定してください");
  const raw = fs.readFileSync(file);
  const data = JSON.parse((file.endsWith(".gz") ? zlib.gunzipSync(raw) : raw).toString("utf8"));
  const out = `${file.replace(/\.json(\.gz)?$/, "")}.restore.sql`;
  fs.writeFileSync(out, restoreSql(data), { mode: 0o600 });
  console.log(`戻す SQL を書きました: ${out}(手紙 ${data.letters.length} 通。中身は手紙の本文を含むので、人に渡さないでください)`);
};

const isCli = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname);
if (isCli) {
  const job = process.argv[2] === "restore-sql" ? Promise.resolve().then(() => restoreMain(process.argv[3])) : main();
  job.catch((e) => {
    console.error(`${new Date().toISOString()} バックアップに失敗: ${e.message}`);
    process.exit(1);
  });
}
