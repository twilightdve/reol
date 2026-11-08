/**
 * 誕生日企画の「この一年のライヴ」(src/utils/letters/live-year.json。plan/64)に、サイトのライヴのデータ(static/data/live.json)から
 * 同じ公演の当時のポストを足す。handoff のデータは選んだ数件だけだったため(横浜アリーナは 2 件、サイトには 21 件)。
 *
 * 足すもの: サイトのデータで、その公演と同じ日の公演(またはその日の会場)にひも付いたポストのうち、
 *   投稿が公演の前日〜3 日後(日本時間)のもの。開催決定の告知など、公演から離れた時期のポストは足さない。
 * 足さないもの: handoff のデータで別の公演に割り当て直したポスト(既存データの誤り。例: 新潟の 2 件)、すでにあるポスト。
 * 投稿の日時は、ポストの ID(Snowflake)から求める。ID や URL を作ったり推測したりはしない(サイトのデータにある埋め込みからだけ取る)。
 *
 * 実行: npx ts-node --compiler-options '{"module":"commonjs"}' scripts/merge-letters-live-posts.ts
 * 何度実行しても同じ結果(足したポストは from: "site" で、再実行の時は一度外してから足し直す)。
 */
import * as fs from "fs";
import * as path from "path";

type Post = { id: string; url: string; author: string; posted_at: string; posted_date: string; kind: string; from?: "site" };
type Live = { id: string; date: string; city: string; venue: string; title: string; kind: string; sources: string[]; posts: Post[] };

const root = path.join(__dirname, "..");
const yearPath = path.join(root, "src/utils/letters/live-year.json");
const sitePath = path.join(root, "static/data/live.json");

const year: Live[] = JSON.parse(fs.readFileSync(yearPath, "utf8"));
const site: any[] = JSON.parse(fs.readFileSync(sitePath, "utf8"));

const jst = (id: string) => new Date(Number((BigInt(id) >> 22n) + 1288834974657n) + 9 * 3600_000);
const pad = (n: number) => String(n).padStart(2, "0");
const isoJst = (d: Date) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}T${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}+09:00`;
const dayDiff = (a: string, b: string) => Math.round((Date.parse(`${a}T00:00:00Z`) - Date.parse(`${b}T00:00:00Z`)) / 86_400_000);

// サイトのデータのポスト(日付ごと)。著者は埋め込みの HTML の status URL から
const byDate = new Map<string, { id: string; author: string }[]>();
const add = (date: string | undefined, id: string | undefined, html: string | undefined) => {
  if (!date || !id || !/^\d{5,25}$/.test(String(id))) return;
  const m = (html ?? "").match(/(?:x|twitter)\.com\/([A-Za-z0-9_]{1,15})\/status\/(\d+)/);
  if (!m || m[2] !== String(id)) return; // 埋め込みの URL と ID が合うものだけ
  const list = byDate.get(date.slice(0, 10)) ?? [];
  list.push({ id: String(id), author: m[1] });
  byDate.set(date.slice(0, 10), list);
};
for (const l of site) {
  for (const p of l.posts ?? []) add(l.date, p.livePostId, p.livePostHTML);
  for (const it of l.items ?? []) for (const p of it.posts ?? []) add(it.date, p.liveItemPostId, p.liveItemPostHTML);
}

// handoff のポスト(足し直す前の状態)。別の公演に割り当てたものは、ほかの公演へ足さない
for (const l of year) l.posts = l.posts.filter((p) => p.from !== "site");
const assigned = new Set(year.flatMap((l) => l.posts.map((p) => p.id)));

let added = 0;
for (const l of year) {
  const seen = new Set(l.posts.map((p) => p.id));
  for (const c of byDate.get(l.date) ?? []) {
    if (seen.has(c.id) || assigned.has(c.id)) continue;
    const at = jst(c.id);
    const day = isoJst(at).slice(0, 10);
    const diff = dayDiff(day, l.date);
    if (diff < -1 || diff > 3) continue;
    seen.add(c.id);
    l.posts.push({ id: c.id, url: `https://x.com/${c.author}/status/${c.id}`, author: `@${c.author}`, posted_at: isoJst(at), posted_date: day, kind: "ポスト", from: "site" });
    added++;
  }
  l.posts.sort((a, b) => a.posted_at.localeCompare(b.posted_at));
}

fs.writeFileSync(yearPath, JSON.stringify(year, null, 2) + "\n");
console.log(`足したポスト: ${added} / 全体: ${year.reduce((n, l) => n + l.posts.length, 0)}`);
for (const l of year) console.log(`${l.date} ${l.city}: ${l.posts.length}`);
