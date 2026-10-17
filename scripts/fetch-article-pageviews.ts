// 楽曲記事の表示回数を GA4 から取り、一覧に出すためのファイルに書く(plan/46)。
// npm run deploy の前(predeploy)に動く。ビルドはこのファイルを読んで一覧に数を入れる。
//
// - 認証はこの PC の Application Default Credentials(GA の読み取り権限。analytics-mcp と同じもの)。
//   秘密情報はビルドの出力にもリポジトリにも入れない。書くのは記事ごと・日ごとの表示回数だけ。
// - 本番のホスト(reol.twilightea.com)の /articles/<slug>/ だけを数える(開発サーバーの表示は入れない)。
// - 公開前(限定公開の確認中)の表示を数えないよう、日ごとに残す。公開日より前の日はビルド側で捨てる。
// - 取れなかった時は前回のファイルを残して警告だけ出す(デプロイは止めない。数が古くなるだけ)。

import { mkdirSync, writeFileSync } from "fs";
import path from "path";
import { google } from "googleapis";

const PROPERTY = "properties/414261169"; // reol-fansite(別サイトのプロパティと取り違えない)
const HOST = "reol.twilightea.com";
const START_DATE = "2026-10-01"; // 記事の公開が始まった月
const PAGEVIEWS_FILE = ".analytics-local/article-pageviews.json";

const main = async () => {
  const auth = new google.auth.GoogleAuth({ scopes: ["https://www.googleapis.com/auth/analytics.readonly"] });
  const data = google.analyticsdata({ version: "v1beta", auth });

  const views: Record<string, Record<string, number>> = {};
  const pageSize = 10000;
  for (let offset = 0; ; offset += pageSize) {
    const res = await data.properties.runReport({
      property: PROPERTY,
      requestBody: {
        dateRanges: [{ startDate: START_DATE, endDate: "today" }],
        dimensions: [{ name: "pagePath" }, { name: "date" }],
        metrics: [{ name: "screenPageViews" }],
        dimensionFilter: {
          andGroup: {
            expressions: [
              { filter: { fieldName: "hostName", stringFilter: { matchType: "EXACT", value: HOST } } },
              { filter: { fieldName: "pagePath", stringFilter: { matchType: "BEGINS_WITH", value: "/articles/" } } },
            ],
          },
        },
        limit: String(pageSize),
        offset: String(offset),
      },
    });
    const rows = res.data.rows ?? [];
    for (const row of rows) {
      const [pagePath, date] = (row.dimensionValues ?? []).map((v) => v.value ?? "");
      // /articles/<slug>/ だけ(一覧・シリーズのページは除く)
      const m = /^\/articles\/([a-z0-9-]+)\/?$/.exec(pagePath);
      if (!m || m[1] === "series") continue;
      const n = Number(row.metricValues?.[0]?.value ?? 0);
      const day = `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;
      const bySlug = (views[m[1]] ??= {});
      bySlug[day] = (bySlug[day] ?? 0) + n;
    }
    if (rows.length < pageSize) break;
  }

  mkdirSync(path.dirname(PAGEVIEWS_FILE), { recursive: true });
  writeFileSync(PAGEVIEWS_FILE, JSON.stringify({ fetchedAt: new Date().toISOString(), views }, null, 2) + "\n");
  const total = Object.values(views).reduce((s, d) => s + Object.values(d).reduce((a, b) => a + b, 0), 0);
  console.log(`[pageviews] ${Object.keys(views).length} 記事・合計 ${total} 回を ${PAGEVIEWS_FILE} に書きました`);
};

main().catch((e) => {
  // 認証の中身は出さない。エラーの種類と文だけ
  console.warn(`[pageviews] GA から表示回数を取れませんでした(前回のファイルのまま続けます): ${e?.message ?? e}`);
});
