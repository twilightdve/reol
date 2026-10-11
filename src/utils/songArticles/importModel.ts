/**
 * 楽曲記事の取込(plan/29 3章)で使う純粋関数。
 * 管理表CSVの読み取り・3状態の変換・掲載記録キーの正規化・公開候補の判定を行う。
 * ファイル入出力は scripts/articles/import-song-articles.ts 側に置く。
 */
import { PublicationArtifact, TriState } from "./types";

/** RFC 4180 形式のCSV(Google スプレッドシートのCSV書き出し)を行の配列にする */
export const parseCsv = (text: string): string[][] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  const src = text.replace(/^﻿/, "");
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && src[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += ch;
    }
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
};

/**
 * 1行目を列名として、列名→値のレコード配列にする。列の位置は固定しない。
 * 必須列が無ければ例外にする(列名変更に気づかず空データで進めないため)。
 */
export const rowsToRecords = (
  rows: string[][],
  requiredColumns: string[]
): Record<string, string>[] => {
  const [header, ...body] = rows;
  if (!header) throw new Error("CSVが空です");
  const names = header.map((h) => h.trim());
  const missing = requiredColumns.filter((c) => !names.includes(c));
  if (missing.length > 0) {
    throw new Error(`必須列がありません: ${missing.join(", ")}`);
  }
  return body
    .filter((r) => r.some((v) => v.trim() !== ""))
    .map((r) => Object.fromEntries(names.map((n, i) => [n, r[i] ?? ""])));
};

/**
 * TRUE / FALSE / 空欄 を true / false / null にする。
 * 文字列 "FALSE" を truthy として扱わないこと、空欄を不合格にも合格にもしないことが目的。
 * 想定外の値は推測せず例外にする。
 */
export const toTriState = (value: unknown): TriState => {
  if (value === true || value === false) return value;
  if (value === null || value === undefined) return null;
  const s = String(value).trim();
  if (s === "") return null;
  if (s.toUpperCase() === "TRUE") return true;
  if (s.toUpperCase() === "FALSE") return false;
  throw new Error(`TRUE/FALSE/空欄以外の値です: ${JSON.stringify(value)}`);
};

/** 版番号。空欄は null、整数でなければ例外("7.0" のような表計算の書き出しは許容) */
export const toRevision = (value: unknown): number | null => {
  if (value === null || value === undefined) return null;
  const s = String(value).trim();
  if (s === "") return null;
  const n = Number(s);
  if (!Number.isInteger(n) || n < 0) {
    throw new Error(`版番号として解釈できません: ${JSON.stringify(value)}`);
  }
  return n;
};

/** 掲載用Markdownの記録に使われているキー(設計書7章) */
export const PUBLICATION_KEYS = [
  "publication_markdown",
  "markdown_publication",
  "markdown_export",
  "publication_format",
] as const;

/** 正規化先 → 入力で見つかっているキーの候補 */
const FIELD_ALIASES: Record<Exclude<keyof PublicationArtifact, "sourceKey">, string[]> = {
  fileId: ["file_id", "drive_file_id", "markdown_file_id"],
  url: ["url", "file_url", "drive_url", "markdown_url"],
  fileName: ["file_name"],
  documentId: ["source_document_id", "canonical_document_id", "document_id"],
  approvedRevision: ["source_approved_revision", "approved_revision"],
  sourceRevision: ["source_revision"],
  formatRevision: ["format_revision"],
  sha256: ["sha256", "content_sha256"],
  libraryFileId: ["library_file_id"],
  sourceDocumentRevisionId: ["source_document_revision_id"],
};

const REVISION_FIELDS = new Set(["approvedRevision", "sourceRevision", "formatRevision"]);

export type NormalizeResult =
  | { ok: true; artifact: PublicationArtifact }
  | { ok: false; reason: string };

/**
 * 1つの掲載記録オブジェクトを正規化する。
 * 同じ意味のキーが複数あり値が違う場合は先勝ちにせず保留理由を返す。
 * source_revision が無くても approved_revision から補完しない。
 */
export const normalizePublicationArtifact = (
  sourceKey: string,
  raw: Record<string, unknown>
): NormalizeResult => {
  const out: Record<string, unknown> = { sourceKey };
  for (const [field, aliases] of Object.entries(FIELD_ALIASES)) {
    const present = aliases.filter((k) => raw[k] !== undefined && raw[k] !== null && raw[k] !== "");
    const values = [...new Set(present.map((k) => String(raw[k])))];
    if (values.length > 1) {
      return {
        ok: false,
        reason: `${sourceKey} の ${present.join(" / ")} の値が一致しません`,
      };
    }
    const v = present.length > 0 ? raw[present[0]] : null;
    if (REVISION_FIELDS.has(field)) {
      try {
        out[field] = toRevision(v);
      } catch (e) {
        return { ok: false, reason: `${sourceKey}.${present[0]}: ${(e as Error).message}` };
      }
    } else {
      out[field] = v === null ? null : String(v);
    }
  }
  return { ok: true, artifact: out as PublicationArtifact };
};

/**
 * 制作データJSONから掲載記録を1つ取り出す。
 * 0件なら「記録なし」、複数キーがあって内容が食い違えば保留。
 */
export const extractPublicationArtifact = (
  data: Record<string, unknown>
): NormalizeResult => {
  const found = PUBLICATION_KEYS.filter(
    (k) => data[k] !== undefined && data[k] !== null && typeof data[k] === "object"
  );
  if (found.length === 0) {
    return { ok: false, reason: "掲載用Markdownの記録がありません" };
  }
  const normalized = found.map((k) =>
    normalizePublicationArtifact(k, data[k] as Record<string, unknown>)
  );
  const failed = normalized.find((n) => !n.ok);
  if (failed) return failed;
  const artifacts = normalized.map((n) => (n as { artifact: PublicationArtifact }).artifact);
  if (artifacts.length > 1) {
    const comparable = artifacts.map(({ sourceKey: _k, ...rest }) => JSON.stringify(rest));
    if (new Set(comparable).size > 1) {
      return {
        ok: false,
        reason: `掲載記録が複数あり内容が違います: ${found.join(", ")}`,
      };
    }
  }
  return { ok: true, artifact: artifacts[0] };
};

export type EligibilityInput = {
  userApproval: TriState;
  qaPass: TriState;
  bodyRevision: number | null;
  approvedRevision: number | null;
  publication: PublicationArtifact;
  /** 管理表の「状態」列(要改稿・統合済み等の判定に使う) */
  stateLabel: string;
};

/**
 * 公開候補(staging に置いてよいか)の判定。保留理由の配列を返す(空なら候補)。
 * 自動合格だけの記事は候補にしない。本人合格で自動判定が空欄(null)の記事は除外しない。
 */
export const eligibilityProblems = (input: EligibilityInput): string[] => {
  const problems: string[] = [];
  const { userApproval, qaPass, bodyRevision, approvedRevision, publication } = input;
  if (userApproval !== true) {
    problems.push(
      userApproval === false ? "本人合格が FALSE" : "本人合格が未判定(自動合格のみでは候補にしない)"
    );
  }
  if (qaPass === false) {
    problems.push("自動合格が FALSE のまま。対応状況の確認が必要");
  }
  if (/統合済み/.test(input.stateLabel)) problems.push("統合済みの管理行");
  if (/要改稿|資料確認待ち/.test(input.stateLabel)) problems.push(`状態が「${input.stateLabel}」`);
  if (bodyRevision === null) problems.push("本文版(版)が空欄");
  if (approvedRevision === null) problems.push("承認版が空欄");
  if (bodyRevision !== null && approvedRevision !== null && bodyRevision !== approvedRevision) {
    problems.push(`本文版 ${bodyRevision} と承認版 ${approvedRevision} が一致しない`);
  }
  if (publication.sourceRevision === null) {
    problems.push("掲載記録に source_revision がない");
  } else if (bodyRevision !== null && publication.sourceRevision !== bodyRevision) {
    problems.push(`掲載記録の元版 ${publication.sourceRevision} が本文版 ${bodyRevision} と一致しない`);
  }
  if (
    publication.approvedRevision !== null &&
    approvedRevision !== null &&
    publication.approvedRevision !== approvedRevision
  ) {
    problems.push(
      `掲載記録の承認版 ${publication.approvedRevision} が管理表の承認版 ${approvedRevision} と一致しない`
    );
  }
  return problems;
};
