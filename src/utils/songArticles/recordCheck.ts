/**
 * 記録(kind: "record")の検査と、内容のハッシュ(plan/72)。Node 専用(fs を使う)。
 *
 * 取込(scripts/articles/import-record-article.ts)・公開コマンド・ビルド(load.ts)が同じ関数を使う。
 * 「確認した版」と「公開する版」が同じかは contentSha256 で見る。本文・写真と動画の定義・使っている画像の中身の
 * どれかが変わればハッシュが変わり、取込し直して版を上げるまで公開もビルドもできない。
 */
import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";
import { ParsedRecord, YOUTUBE_ID, recordMediaRefs } from "./markdown";
import { seriesBySlug } from "./series";
import { RECORD_LINK_QUOTE_MAX, RecordArticleData, RecordMediaFile } from "./types";

/** 記録の記事ID。いいねの article_id(^[a-z0-9-]{1,64}$)にそのまま使える形にする */
export const RECORD_ID = /^record-[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MEDIA_ID = /^[a-z0-9][a-z0-9-]*$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const IMAGE_ROOT = "src/images/";
const IMAGE_EXT = /\.(webp|jpe?g|png)$/i;
/** リンクに付けない計測用のパラメータ(utm_*、地図・SNS の共有で付くもの) */
const TRACKING_PARAM = /[?&](utm_[a-z_]+|g_st|igsh|igshid|fbclid|si)=/i;

const sha256 = (data: Buffer | string): string => crypto.createHash("sha256").update(data).digest("hex");

/** キーの順と、null・未指定の違いに依らない形にする */
const normalize = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(normalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, v]) => v !== null && v !== undefined)
        .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
        .map(([k, v]) => [k, normalize(v)])
    );
  }
  return value;
};

/** 画像のパスがリポジトリの src/images/ の中を指しているか(外や上の階層を指さない) */
const safeImagePath = (src: string): boolean =>
  src.startsWith(IMAGE_ROOT) && !src.split("/").includes("..") && !path.isAbsolute(src) && IMAGE_EXT.test(src);

export type RecordHashedFields = Pick<
  RecordArticleData,
  "seriesSlug" | "eventDate" | "eventDateEnd" | "songRefs" | "relatedLinks" | "legacyPublishedAt"
>;

const hashedFields = (data: RecordHashedFields): RecordHashedFields => ({
  seriesSlug: data.seriesSlug,
  eventDate: data.eventDate,
  eventDateEnd: data.eventDateEnd ?? null,
  songRefs: data.songRefs,
  // quote(リンク先の投稿の書き出し)は表示のための引用で、本文もリンク先も変えないので、版には数えない。
  // 足しても「更新」の日付は動かない(2026-11-14。公開済みの 11 本に後から足した)
  relatedLinks: (data.relatedLinks ?? []).map(({ quote: _quote, ...rest }) => rest),
  legacyPublishedAt: data.legacyPublishedAt,
});

/** 本文・写真と動画の定義・使っている画像の中身・記事の項目をまとめたハッシュ */
export const recordContentHash = (input: {
  rootDir: string;
  body: Buffer | string;
  media: RecordMediaFile;
  data: RecordHashedFields;
}): string => {
  const images = input.media.items
    .filter((m) => m.type === "photo")
    .map((m) => {
      const src = (m as { src: string }).src;
      const file = path.join(input.rootDir, src);
      return { id: m.id, sha256: safeImagePath(src) && fs.existsSync(file) ? sha256(fs.readFileSync(file)) : null };
    });
  return sha256(
    JSON.stringify(
      normalize({
        body: sha256(input.body),
        media: input.media,
        images,
        data: hashedFields(input.data),
      })
    )
  );
};

/** 記録として公開できない点を並べる(空なら問題なし) */
export const recordProblems = (input: {
  rootDir: string;
  article: Pick<RecordArticleData, "id" | "kind" | "bodySha256" | "contentSha256"> & RecordHashedFields;
  body: Buffer | string;
  parsed: ParsedRecord;
  media: RecordMediaFile;
}): string[] => {
  const { article, media, parsed } = input;
  const problems: string[] = [...parsed.problems];

  if (article.kind !== "record") problems.push(`kind が record ではありません: ${String(article.kind)}`);
  if (!RECORD_ID.test(article.id) || article.id.length > 64) {
    problems.push(`記事IDの形が違います(record- で始まる英小文字・数字・ハイフン、64文字まで): ${article.id}`);
  }
  if (!parsed.title.trim()) problems.push("題名(先頭の H1)がありません");
  if (!seriesBySlug(article.seriesSlug)) problems.push(`登録されていないシリーズです: ${article.seriesSlug}`);

  const validDate = (d: string) => DATE.test(d) && !Number.isNaN(Date.parse(`${d}T00:00:00Z`));
  if (article.eventDate !== null && !validDate(article.eventDate)) problems.push(`eventDate の形が違います(YYYY-MM-DD): ${article.eventDate}`);
  if (article.eventDateEnd != null) {
    if (!validDate(article.eventDateEnd)) problems.push(`eventDateEnd の形が違います(YYYY-MM-DD): ${article.eventDateEnd}`);
    else if (!article.eventDate || article.eventDateEnd < article.eventDate) problems.push("eventDateEnd が eventDate より前です");
  }
  if (article.legacyPublishedAt !== null && Number.isNaN(Date.parse(article.legacyPublishedAt))) {
    problems.push(`legacyPublishedAt が日時として読めません: ${article.legacyPublishedAt}`);
  }

  // 写真・動画の定義
  const items = Array.isArray(media.items) ? media.items : [];
  const ids = new Set<string>();
  for (const m of items) {
    if (typeof m.id !== "string" || !MEDIA_ID.test(m.id)) {
      problems.push(`写真・動画の ID の形が違います: ${String(m.id)}`);
      continue;
    }
    if (ids.has(m.id)) problems.push(`写真・動画の ID が重複しています: ${m.id}`);
    ids.add(m.id);
    if (m.type === "photo") {
      if (typeof m.src !== "string" || !safeImagePath(m.src)) problems.push(`${m.id}: 画像は src/images/ の中の webp・jpg・png だけです: ${String(m.src)}`);
      else if (!fs.existsSync(path.join(input.rootDir, m.src))) problems.push(`${m.id}: 画像がありません: ${m.src}`);
      if (typeof m.alt !== "string" || !m.alt.trim()) problems.push(`${m.id}: 代替テキスト(alt)がありません`);
    } else if (m.type === "youtube") {
      if (typeof m.videoId !== "string" || !YOUTUBE_ID.test(m.videoId)) problems.push(`${m.id}: YouTube の動画IDの形が違います: ${String(m.videoId)}`);
      if (typeof m.title !== "string" || !m.title.trim()) problems.push(`${m.id}: 動画の題(title)がありません`);
    } else {
      problems.push(`${(m as { id: string }).id}: 種類は photo か youtube です`);
    }
  }

  // 本文からの参照。定義した写真・動画は、本文のどこか1か所に置く
  const refs = recordMediaRefs(parsed.blocks);
  const counts = new Map<string, number>();
  for (const id of refs) counts.set(id, (counts.get(id) ?? 0) + 1);
  for (const [id, n] of counts) {
    if (!ids.has(id)) problems.push(`本文が、定義の無い写真・動画を参照しています: ${id}`);
    else if (n > 1) problems.push(`本文が同じ写真・動画を ${n} 回参照しています: ${id}`);
  }
  for (const id of ids) if (!counts.has(id)) problems.push(`本文に置かれていない写真・動画があります: ${id}`);
  const typeOf = new Map(items.map((m) => [m.id, m.type]));
  for (const b of parsed.blocks) {
    if (b.t !== "media" || b.media.type === "gallery") continue;
    const actual = typeOf.get(b.media.id);
    if (actual && actual !== b.media.type) problems.push(`media ブロックの type(${b.media.type})が定義(${actual})と違います: ${b.media.id}`);
  }

  // 表紙
  if (media.cover !== null && media.cover !== undefined && typeOf.get(media.cover) !== "photo") {
    problems.push(`表紙(cover)は記事の中の写真の ID で指定します: ${String(media.cover)}`);
  }
  if (media.coverFocusY != null && !(typeof media.coverFocusY === "number" && media.coverFocusY >= 0 && media.coverFocusY <= 1)) {
    problems.push("coverFocusY は 0〜1 の数です");
  }

  // 関連リンクと本文のリンク
  for (const l of article.relatedLinks ?? []) {
    if (typeof l.label !== "string" || !l.label.trim()) problems.push(`関連リンクの表示文言がありません: ${String(l.href)}`);
    const internal = typeof l.href === "string" && /^\/(?!\/)/.test(l.href);
    const external = typeof l.href === "string" && /^https?:\/\//i.test(l.href);
    if (!internal && !external) problems.push(`関連リンクの行き先が違います(サイト内は / から、外部は http(s) から): ${String(l.href)}`);
    if (typeof l.href === "string" && TRACKING_PARAM.test(l.href)) problems.push(`関連リンクに計測用のパラメータが付いています: ${l.href}`);
    if (l.quote != null) {
      if (typeof l.quote !== "string" || !l.quote.trim() || /[\r\n]/.test(l.quote)) {
        problems.push(`関連リンクの書き出し(quote)は改行のない文字で書きます: ${String(l.href)}`);
      } else if ([...l.quote].length > RECORD_LINK_QUOTE_MAX) {
        problems.push(`関連リンクの書き出し(quote)は ${RECORD_LINK_QUOTE_MAX} 文字までです(長い時は「…」で切る): ${String(l.href)}`);
      }
    }
  }
  const bodyText = typeof input.body === "string" ? input.body : input.body.toString("utf8");
  for (const m of bodyText.matchAll(/\]\((https?:\/\/[^)\s]+)\)/g)) {
    if (TRACKING_PARAM.test(m[1])) problems.push(`本文のリンクに計測用のパラメータが付いています: ${m[1]}`);
  }

  // 確認した版と同じ内容か
  if (sha256(input.body) !== article.bodySha256) problems.push("本文が取込時の sha256 と一致しません(取込し直してください)");
  const actual = recordContentHash({ rootDir: input.rootDir, body: input.body, media, data: article });
  if (actual !== article.contentSha256) {
    problems.push("本文・写真と動画の定義・画像のどれかが取込時から変わっています(取込し直して、版を確認してください)");
  }
  return problems;
};
