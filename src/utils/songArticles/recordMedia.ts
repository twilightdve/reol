/**
 * 記録(kind: "record")の写真を、ページに出す大きさに作り直す(plan/72)。Node 専用(ビルドの時に gatsby-node から呼ぶ)。
 *
 * - 元の画像は src/images/ に置いたまま。ここで幅 800 と 1600 の WebP を作り(元より大きくはしない)、
 *   public/articles-media/<slug>/ に置く。ファイル名は写真のIDと中身のハッシュから作り、元のファイル名やパスは出さない。
 * - 表紙(一覧のカード 800×420・OGP 1200×630)は、media.json の cover の写真から切り出す(縦の位置は coverFocusY)。
 * - 作った画像は node_modules/.cache/record-media/ に取っておき、元の画像が変わらなければ作り直さない。
 * - ページ情報に渡すのは、ここで返す公開用の値だけ(リポジトリの中のパスは渡さない)。
 */
import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";
import sharp from "sharp";
import { RecordMediaAsset, RecordMediaFile } from "./types";

export const RECORD_MEDIA_PATH = "/articles-media";
const WIDTHS = [800, 1600] as const;
const COVER = { width: 800, height: 420 };
const OG = { width: 1200, height: 630 };
const CACHE_DIR = "node_modules/.cache/record-media";

const sha8 = (value: string): string => value.slice(0, 8);
const hashFile = (file: string): string => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");

/**
 * 表紙と OGP 画像の URL。ビルドの前でも決まる(HOME の欄を作る時に使う)。
 * 表紙の写真が無く動画がある記録は、一覧のカードに動画のサムネイル(YouTube)を出す(横の動画を先に選ぶ。OGP 画像は作らない)。
 * どちらも無ければ null
 */
export const recordCoverPaths = (
  slug: string,
  contentSha256: string,
  media: Pick<RecordMediaFile, "cover" | "items">
): { cover: string | null; ogImage: string | null } => {
  if (media.cover) {
    return {
      cover: `${RECORD_MEDIA_PATH}/${slug}/cover-${sha8(contentSha256)}.jpg`,
      ogImage: `${RECORD_MEDIA_PATH}/${slug}/og-${sha8(contentSha256)}.jpg`,
    };
  }
  const videos = media.items.filter((m): m is Extract<RecordMediaFile["items"][number], { type: "youtube" }> => m.type === "youtube");
  const video = videos.find((m) => m.vertical !== true) ?? videos[0];
  // 縦の動画のサムネイルは、どの動画にもある sddefault にする(中央に縦の画、左右はぼかし)
  return { cover: video ? `https://i.ytimg.com/vi/${video.videoId}/${video.vertical === true ? "sddefault" : "hqdefault"}.jpg` : null, ogImage: null };
};

/**
 * 公開先(public/articles-media)を空にする。ビルドのたびに最初に呼ぶ。
 * 前のビルド(プレビューを含む)で置いた画像が、次のデプロイに混ざらないようにするため
 */
export const resetRecordMediaDir = (rootDir: string): void => {
  fs.rmSync(path.join(rootDir, "public", RECORD_MEDIA_PATH), { recursive: true, force: true });
};

/** キャッシュに無ければ作って、公開先へ写す */
const emit = async (cacheFile: string, outFile: string, make: () => Promise<Buffer>): Promise<void> => {
  if (!fs.existsSync(cacheFile)) {
    fs.mkdirSync(path.dirname(cacheFile), { recursive: true });
    const tmp = `${cacheFile}.tmp`;
    fs.writeFileSync(tmp, await make());
    fs.renameSync(tmp, cacheFile);
  }
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.copyFileSync(cacheFile, outFile);
};

/** 幅と高さを決めて切り出す。横は中央、縦は focusY(0 = 上端、1 = 下端) */
const crop = async (file: string, size: { width: number; height: number }, focusY: number): Promise<Buffer> => {
  const meta = await sharp(file).rotate().toBuffer({ resolveWithObject: true });
  const scale = Math.max(size.width / meta.info.width, size.height / meta.info.height);
  const width = Math.max(size.width, Math.round(meta.info.width * scale));
  const height = Math.max(size.height, Math.round(meta.info.height * scale));
  return sharp(meta.data)
    .resize(width, height)
    .extract({
      left: Math.round((width - size.width) / 2),
      top: Math.round((height - size.height) * Math.min(1, Math.max(0, focusY))),
      width: size.width,
      height: size.height,
    })
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();
};

/**
 * 1つの記録の写真・表紙を作って public に置き、ページに渡す値を返す。
 * media の中身は recordProblems で検査済みのものを渡す。
 */
export const buildRecordMedia = async (input: {
  rootDir: string;
  slug: string;
  contentSha256: string;
  media: RecordMediaFile;
}): Promise<{ assets: Record<string, RecordMediaAsset>; cover: string | null; ogImage: string | null }> => {
  const { rootDir, slug, media } = input;
  const cacheDir = path.join(rootDir, CACHE_DIR);
  const outDir = path.join(rootDir, "public", RECORD_MEDIA_PATH, slug);
  const assets: Record<string, RecordMediaAsset> = {};

  for (const item of media.items) {
    if (item.type === "youtube") {
      assets[item.id] = {
        type: "youtube",
        id: item.id,
        videoId: item.videoId,
        vertical: item.vertical === true,
        title: item.title,
        caption: item.caption ?? null,
      };
      continue;
    }
    const file = path.join(rootDir, item.src);
    const hash = hashFile(file);
    // 向き(EXIF)を直した後の大きさで比率を決める
    const original = await sharp(file).rotate().toBuffer({ resolveWithObject: true });
    const widths = [...new Set(WIDTHS.map((w) => Math.min(w, original.info.width)))];
    const variants: { url: string; width: number }[] = [];
    for (const width of widths) {
      const name = `${item.id}-${sha8(hash)}-${width}.webp`;
      await emit(path.join(cacheDir, `${hash}-${width}.webp`), path.join(outDir, name), () =>
        sharp(original.data).resize({ width, withoutEnlargement: true }).webp({ quality: 80 }).toBuffer()
      );
      variants.push({ url: `${RECORD_MEDIA_PATH}/${slug}/${name}`, width });
    }
    const largest = variants[variants.length - 1];
    assets[item.id] = {
      type: "photo",
      id: item.id,
      src: largest.url,
      srcSet: variants.map((v) => `${v.url} ${v.width}w`).join(", "),
      width: largest.width,
      height: Math.round((largest.width * original.info.height) / original.info.width),
      alt: item.alt,
      caption: item.caption ?? null,
    };
  }

  const paths = recordCoverPaths(slug, input.contentSha256, media);
  const coverItem = media.items.find((m) => m.id === media.cover);
  if (paths.cover && paths.ogImage && coverItem && coverItem.type === "photo") {
    const file = path.join(rootDir, coverItem.src);
    const hash = hashFile(file);
    const focusY = media.coverFocusY ?? 0.5;
    for (const [url, size, label] of [
      [paths.cover, COVER, "cover"],
      [paths.ogImage, OG, "og"],
    ] as const) {
      await emit(
        path.join(cacheDir, `${hash}-${label}-${Math.round(focusY * 1000)}.jpg`),
        path.join(rootDir, "public", url),
        () => crop(file, size, focusY)
      );
    }
  }
  return { assets, ...paths };
};
