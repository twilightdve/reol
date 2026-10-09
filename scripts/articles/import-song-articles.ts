// 楽曲記事の取込(plan/29 3章)。
//
// 入力(手渡しファイル。git管理外):
//   .articles-local/inbox/記事.csv       … 制作管理表「記事」シートのCSV書き出し
//   .articles-local/inbox/song対応.csv   … 同「song対応」シートのCSV書き出し
//   .articles-local/inbox/*.md           … 掲載用Markdown(Driveのファイル名のまま)
// 出力(git管理外):
//   .articles-local/staging/<article_id>/{body.md, article.json, record.json, editorial.json}
//   .articles-local/reports/<run_id>.json
//
// 使い方:
//   npm run articles:import -- --ids reol-song-080,reol-song-006 --dry-run
//   npm run articles:import -- --ids reol-song-080,reol-song-006
//
// 管理表・元song表・Google Docs には書き戻さない。本文は取得したバイト列をそのまま保存する。

import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";
import {
  eligibilityProblems,
  extractPublicationArtifact,
  parseCsv,
  rowsToRecords,
  toRevision,
  toTriState,
} from "../../src/utils/songArticles/importModel";
import { parseArticleMarkdown } from "../../src/utils/songArticles/markdown";
import { LOCAL_DIR, STAGING_DIR } from "../../src/utils/songArticles/load";
import {
  PublicationArtifact,
  SongArticleData,
  SongArticleEditorial,
  SongArticleMedia,
  SongArticleRecord,
} from "../../src/utils/songArticles/types";

type Outcome = "added" | "changed" | "unchanged" | "held";

type ReportEntry = {
  articleId: string;
  songTitle: string | null;
  outcome: Outcome;
  reasons: string[];
  notes: string[];
  bodyRevision?: number | null;
  formatRevision?: number | null;
  sha256?: string;
};

const args = process.argv.slice(2);
const argValue = (name: string): string | null => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] ?? null : null;
};
const dryRun = args.includes("--dry-run");
const ids = (argValue("--ids") ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const root = process.cwd();
const inboxDir = path.resolve(root, argValue("--inbox") ?? `${LOCAL_DIR}/inbox`);
const stagingDir = path.resolve(root, STAGING_DIR);
const reportsDir = path.resolve(root, `${LOCAL_DIR}/reports`);

if (ids.length === 0) {
  console.error("--ids で対象の article_id をカンマ区切りで指定してください(全件一括は行いません)");
  process.exit(1);
}

const sha256 = (buf: Buffer): string => crypto.createHash("sha256").update(buf).digest("hex");

/** 管理シートの「作成日」(2026/10/01 や 2026-10-01、または ISO 日時)を ISO 8601 にする。読めなければ null */
const toCreatedAt = (value: string | undefined): string | null => {
  const v = (value ?? "").trim();
  if (!v) return null;
  const m = v.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/);
  if (m) return `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}T00:00:00+09:00`;
  return Number.isNaN(new Date(v).getTime()) ? null : v;
};

const readCsv = (name: string, required: string[]): Record<string, string>[] => {
  const file = path.join(inboxDir, name);
  if (!fs.existsSync(file)) {
    throw new Error(`${file} がありません。管理表の該当シートをCSVで書き出して置いてください`);
  }
  return rowsToRecords(parseCsv(fs.readFileSync(file, "utf8")), required);
};

const inboxMarkdown = (): { file: string; buf: Buffer; sha: string }[] =>
  fs
    .readdirSync(inboxDir)
    .filter((f) => f.toLowerCase().endsWith(".md"))
    .map((f) => {
      const buf = fs.readFileSync(path.join(inboxDir, f));
      return { file: f, buf, sha: sha256(buf) };
    });

/** 掲載記録が指すMarkdownを inbox から探す。ファイル名 → ファイルID → 記録済みsha256 の順 */
const findMarkdown = (
  artifact: PublicationArtifact,
  files: ReturnType<typeof inboxMarkdown>
): { file: string; buf: Buffer; sha: string } | null => {
  if (artifact.fileName) {
    const hit = files.find((f) => f.file === artifact.fileName);
    if (hit) return hit;
  }
  if (artifact.fileId) {
    const hit = files.find((f) => f.file.includes(artifact.fileId as string));
    if (hit) return hit;
  }
  if (artifact.sha256) {
    const hit = files.find((f) => f.sha === artifact.sha256);
    if (hit) return hit;
  }
  return null;
};

const readJsonIfExists = <T>(file: string): T | null =>
  fs.existsSync(file) ? (JSON.parse(fs.readFileSync(file, "utf8")) as T) : null;

const main = () => {
  const runId = new Date().toISOString().replace(/[:.]/g, "-");
  const articleRows = readCsv("記事.csv", [
    "曲番号",
    "曲名",
    "状態",
    "本人合格",
    "自動合格",
    "版",
    "article_id",
    "document_id",
    "承認版",
    "制作データJSON",
  ]);
  const songMapRows = readCsv("song対応.csv", ["source_song_uuid", "article_id"]);
  const files = inboxMarkdown();

  // song対応: uuid → 記事。1つのuuidが複数の記事に割り当てられていれば競合として扱う
  const articlesByUuid = new Map<string, Set<string>>();
  for (const r of songMapRows) {
    const set = articlesByUuid.get(r.source_song_uuid) ?? new Set<string>();
    set.add(r.article_id);
    articlesByUuid.set(r.source_song_uuid, set);
  }

  const report: ReportEntry[] = [];

  for (const articleId of ids) {
    const rows = articleRows.filter((r) => r.article_id === articleId);
    const entry: ReportEntry = { articleId, songTitle: null, outcome: "held", reasons: [], notes: [] };
    report.push(entry);
    if (rows.length !== 1) {
      entry.reasons.push(`管理表「記事」で ${rows.length} 行見つかりました(1行である必要があります)`);
      continue;
    }
    const row = rows[0];
    entry.songTitle = row["曲名"];

    let data: Record<string, unknown>;
    try {
      data = JSON.parse(row["制作データJSON"]);
    } catch {
      entry.reasons.push("制作データJSONを読めません");
      continue;
    }
    if (data.article_id !== articleId) {
      entry.reasons.push(`制作データJSONの article_id(${String(data.article_id)})が行と一致しません`);
      continue;
    }

    const extracted = extractPublicationArtifact(data);
    if (!extracted.ok) {
      entry.reasons.push(extracted.reason);
      continue;
    }
    const publication = extracted.artifact;

    let userApproval, qaPass, bodyRevision, approvedRevision;
    try {
      // 判定と版は管理表の表示列を正とする(JSON内の古い値で上書きしない)
      userApproval = toTriState(row["本人合格"]);
      qaPass = toTriState(row["自動合格"]);
      bodyRevision = toRevision(row["版"]);
      approvedRevision = toRevision(row["承認版"]);
    } catch (e) {
      entry.reasons.push((e as Error).message);
      continue;
    }
    entry.bodyRevision = bodyRevision;
    entry.formatRevision = publication.formatRevision;

    entry.reasons.push(
      ...eligibilityProblems({
        userApproval,
        qaPass,
        bodyRevision,
        approvedRevision,
        publication,
        stateLabel: row["状態"],
      })
    );
    if (publication.documentId && publication.documentId !== row["document_id"]) {
      entry.reasons.push("掲載記録の文書IDが管理表の document_id と一致しません");
    }

    const md = findMarkdown(publication, files);
    if (!md) {
      entry.reasons.push(
        `掲載用Markdownが inbox にありません(必要なファイル: ${publication.fileName ?? "名前未記録"} / Drive ID ${publication.fileId ?? "未記録"})`
      );
      continue;
    }
    entry.sha256 = md.sha;
    entry.notes.push(`入力ファイル: ${md.file}`);
    if (publication.sha256) {
      if (publication.sha256 !== md.sha) {
        entry.reasons.push("取得したMarkdownのsha256が掲載記録と一致しません");
      } else {
        entry.notes.push("sha256 は掲載記録と一致");
      }
    } else {
      entry.notes.push("掲載記録に sha256 がないため、算出値を記録のみ(照合なし)");
    }

    const markdown = md.buf.toString("utf8");
    const parsed = parseArticleMarkdown(markdown);
    entry.reasons.push(...parsed.problems);
    if (!parsed.title) entry.reasons.push("記事タイトル(H1)が空です");
    if (typeof data.article_title === "string" && data.article_title !== parsed.title) {
      entry.notes.push(`H1「${parsed.title}」と制作データの article_title「${data.article_title}」が異なる(H1を採用)`);
    }

    // 曲との対応は「song対応」シートを正とし、JSONとの差は報告のみ
    const mappedUuids = songMapRows.filter((r) => r.article_id === articleId).map((r) => r.source_song_uuid);
    if (mappedUuids.length === 0) entry.reasons.push("song対応に対応する source_song_uuid がありません");
    for (const uuid of mappedUuids) {
      const owners = articlesByUuid.get(uuid) ?? new Set();
      if (owners.size > 1) {
        entry.reasons.push(`source_song_uuid ${uuid} が複数の記事に割り当てられています: ${[...owners].join(", ")}`);
      }
    }
    const jsonUuids = Array.isArray(data.source_song_uuids) ? (data.source_song_uuids as string[]) : [];
    const onlyInJson = jsonUuids.filter((u) => !mappedUuids.includes(u));
    const onlyInMap = mappedUuids.filter((u) => !jsonUuids.includes(u));
    if (onlyInJson.length || onlyInMap.length) {
      entry.notes.push(
        `song対応と制作データJSONの uuid に差があります(JSONのみ: ${onlyInJson.join(", ") || "なし"} / song対応のみ: ${onlyInMap.join(", ") || "なし"})`
      );
    }

    // 取得中に入力が変わっていないか(読取終了時の再確認)
    const reread = sha256(fs.readFileSync(path.join(inboxDir, md.file)));
    if (reread !== md.sha) entry.reasons.push("取込中に入力Markdownが変更されました");

    if (entry.reasons.length > 0) continue;

    const media: SongArticleMedia[] = (Array.isArray(data.media) ? data.media : [])
      .filter((m: { url?: unknown }) => typeof m?.url === "string" && /youtu/.test(m.url as string))
      .map((m: { url: string; type?: unknown }) => ({
        kind: "youtube" as const,
        url: m.url,
        role: typeof m.type === "string" ? m.type : null,
      }));

    const articleData: SongArticleData = {
      id: articleId,
      kind: "song",
      songTitle: row["曲名"],
      bodyRevision: bodyRevision as number,
      formatRevision: publication.formatRevision,
      bodySha256: md.sha,
      songRefs: mappedUuids,
      media,
    };
    const record: SongArticleRecord = {
      articleId,
      songNumber: row["曲番号"] || null,
      songTitle: row["曲名"],
      documentId: row["document_id"] || null,
      bodyRevision,
      approvedRevision,
      userApproval,
      qaPass,
      publication,
      computedSha256: md.sha,
      sourceSongUuids: mappedUuids,
      importRunId: runId,
      importedAt: new Date().toISOString(),
    };

    const targetDir = path.join(stagingDir, articleId);
    const existing = readJsonIfExists<SongArticleData>(path.join(targetDir, "article.json"));
    if (!existing) {
      entry.outcome = "added";
    } else {
      const { media: _m1, ...a } = existing;
      const { media: _m2, ...b } = articleData;
      entry.outcome =
        JSON.stringify(a) === JSON.stringify(b) && JSON.stringify(existing.media) === JSON.stringify(articleData.media)
          ? "unchanged"
          : "changed";
    }
    if (dryRun || entry.outcome === "unchanged") continue;

    // 一時ディレクトリに書いてから差し替える。失敗しても既存スナップショットは残る
    const editorial: SongArticleEditorial = readJsonIfExists<SongArticleEditorial>(
      path.join(targetDir, "editorial.json")
    ) ?? {
      // slug は曲名から毎回作らない。初回だけ article_id を仮置きし、確定はユーザーが行う
      slug: articleId,
      slugProposed: true,
      status: "review",
      summary: null,
      versionLabel: null,
      createdAt: null,
      publishedAt: null,
      updatedAt: null,
      relatedArticleIds: [],
    };
    // 表示する作成日(原稿の作成日)。管理シートに「作成日」列があり、まだ記録が無い時だけ入れる(手で記録した値は上書きしない)
    if (!editorial.createdAt) editorial.createdAt = toCreatedAt(row["作成日"]);
    const tmpDir = `${targetDir}.tmp-${runId}`;
    fs.mkdirSync(tmpDir, { recursive: true });
    fs.writeFileSync(path.join(tmpDir, "body.md"), md.buf);
    fs.writeFileSync(path.join(tmpDir, "article.json"), JSON.stringify(articleData, null, 2) + "\n");
    fs.writeFileSync(path.join(tmpDir, "record.json"), JSON.stringify(record, null, 2) + "\n");
    fs.writeFileSync(path.join(tmpDir, "editorial.json"), JSON.stringify(editorial, null, 2) + "\n");
    const written = sha256(fs.readFileSync(path.join(tmpDir, "body.md")));
    if (written !== md.sha) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
      entry.outcome = "held";
      entry.reasons.push("書き込んだ本文のsha256が一致しません");
      continue;
    }
    if (fs.existsSync(targetDir)) fs.rmSync(targetDir, { recursive: true, force: true });
    fs.renameSync(tmpDir, targetDir);
  }

  // 一覧から消えた記事も自動削除しない(削除候補として報告するだけ)
  const knownIds = new Set(articleRows.map((r) => r.article_id));
  const orphanCandidates = fs.existsSync(stagingDir)
    ? fs.readdirSync(stagingDir).filter((d) => !d.includes(".tmp-") && !knownIds.has(d))
    : [];

  fs.mkdirSync(reportsDir, { recursive: true });
  const reportFile = path.join(reportsDir, `${runId}${dryRun ? "-dry-run" : ""}.json`);
  fs.writeFileSync(reportFile, JSON.stringify({ runId, dryRun, report, orphanCandidates }, null, 2) + "\n");

  const label: Record<Outcome, string> = { added: "追加", changed: "変更", unchanged: "変更なし", held: "保留" };
  console.log(`[articles:import] ${dryRun ? "dry-run" : "実行"} run=${runId}`);
  for (const e of report) {
    console.log(`- ${e.articleId} ${e.songTitle ?? ""}: ${label[e.outcome]}${dryRun && e.outcome !== "held" ? "(予定)" : ""}`);
    for (const r of e.reasons) console.log(`    保留理由: ${r}`);
    for (const n of e.notes) console.log(`    メモ: ${n}`);
  }
  if (orphanCandidates.length) console.log(`削除候補(管理表に無い staging): ${orphanCandidates.join(", ")}`);
  console.log(`レポート: ${path.relative(root, reportFile)}`);
};

main();
