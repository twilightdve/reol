// 楽曲記事の OGP 画像(1200x630)を、記事の表紙(記事別デザイン)を撮って作る。
//
//   npm run articles:og            … 公開中の記事すべて
//   npm run articles:og -- boy     … 指定した slug だけ
//
// - 開発サーバー(npm run develop / articles:preview。既定 http://localhost:8000)が動いている状態で実行する。
//   ビルド(gatsby build)の中では撮らない(デプロイの手順にブラウザを持ち込まないため)。
// - 書き出し先は static/articles-og/<slug>.jpg。リポジトリにコミットする(ビルドでは作り直さない)。
//   表紙のデザインや題名を変えたら撮り直す。公開中の記事に画像が無いとデプロイ前チェックで止まる。
// - 表紙のうち各記事の data-og-cover を付けた要素だけを残し、サイトの枠・パンくず・リンクは隠す。
//   MVのサムネイルやジャケットなど公式の画像は、画像として焼き込まない(サイトでは公式の埋め込み・リンクだけを使うため)。
// - プレビューのサーバーでは未公開の原稿が表示されることがあるので、表紙の題名が公開中の題名と一致しない時は撮らずに止める。

import { promises as fs } from "fs";
import path from "path";
import { webkit, type Page } from "playwright";

const ROOT = process.cwd();
const BASE_URL = process.env.ARTICLES_OG_BASE_URL || "http://localhost:8000";
const OUT_DIR = path.join(ROOT, "static/articles-og");
const WIDTH = 1200;
const HEIGHT = 630;

type Published = { id: string; slug: string; title: string };

const loadPublished = async (): Promise<Published[]> => {
  const dir = path.join(ROOT, "content/articles");
  const out: Published[] = [];
  for (const id of (await fs.readdir(dir)).sort()) {
    const json = JSON.parse(await fs.readFile(path.join(dir, id, "article.json"), "utf8"));
    if ((json.status !== "published" && json.status !== "unlisted") || !json.slug) continue;
    const body = await fs.readFile(path.join(dir, id, "body.md"), "utf8");
    const title = body.match(/^# (.+)$/m)?.[1]?.trim();
    if (!title) throw new Error(`${id}: body.md に題名(# …)がありません`);
    out.push({ id, slug: json.slug, title });
  }
  return out;
};

// どの記事にも共通: 表紙を 1200x630 ちょうどにし、公式の画像・サイトの枠・リンクを隠す
const COMMON_CSS = `
html, body { margin: 0 !important; padding: 0 !important; overflow: hidden !important; }
[data-og-cover] {
  width: ${WIDTH}px !important; height: ${HEIGHT}px !important;
  min-height: 0 !important; max-height: none !important; margin: 0 !important;
  box-sizing: border-box !important; overflow: hidden !important; position: relative !important;
}
[data-og-cover] .sa-media,
[data-og-cover] nav[aria-label="パンくず"],
[data-og-cover] [class*="__media"],
[data-og-cover] [class*="__link"] { display: none !important; }
.og-brand {
  position: absolute; right: 40px; bottom: 30px; z-index: 50;
  font: 700 18px/1 "Hiragino Sans", "Hiragino Kaku Gothic ProN", sans-serif;
  letter-spacing: 0.08em; color: rgb(255 255 255 / 0.78);
  text-shadow: 0 0 12px rgb(0 0 0 / 0.6);
}
`;

// 記事ごとの調整(公式の画像を外して空いた場所の詰め直しなど)。キーは記事 ID
const PER_ARTICLE_CSS: Record<string, string> = {
  // No title: MVを外すと表紙全体が余白になる。縦書きの題名を大きくして右寄りに置き、波紋の中心を左に残る余白の中心へ
  "reol-song-006": `
    .a006-cover { --title-size: 62px; --cover-wave-x: 420px; --cover-wave-y: 50%; padding-bottom: 0 !important; }
    .a006-cover__top { display: none !important; }
    .a006-cover__body {
      width: auto !important; height: ${HEIGHT}px; margin: 0 !important; padding: 0 150px 0 0 !important;
      grid-template-columns: 1fr !important; align-content: center !important;
    }
    .a006-cover__title { grid-column: 1 !important; }
    .a006-cover__vertical { height: max-content !important; }
    .a006-title__line { white-space: nowrap; }
  `,
  // Boy: MVの画面を外し、題名を縦の中央へ
  "reol-song-080": `
    .a080-screen { display: none !important; }
    .a080-opening { display: flex !important; flex-direction: column !important; justify-content: center !important; padding: 0 96px !important; }
    .a080-hero { margin: 0 !important; padding: 0 !important; }
  `,
  // ミュータント: 630px に収まるよう、上の段(夜の湾の絵)の高さを固定し、題名を1行にして映り込みと日付まで入れる
  "reol-song-082": `
    .a082-cover__art { flex: none !important; height: 372px !important; }
    .a082-cover__body { padding: 30px 0 0 !important; width: auto !important; margin: 0 80px !important; }
    .a082-title { max-width: none !important; font-size: 50px !important; white-space: nowrap; }
  `,
  // 真空オールドローズ: 明るい紙の地なので、右下のサイト名は白ではなく濃いワイン色に
  // あ可よろし: 右下が明るい生成りなので、サイト名を濃い茶に
  "reol-song-049": `
    .og-brand { color: #5a3f22 !important; text-shadow: none !important; }
  `,
  "reol-song-057": `
    .og-brand { color: #6b5258 !important; text-shadow: none !important; }
    .a057-cover__body { align-items: center !important; padding: 0 0 56px !important; }
  `,
  // SCORPION: MVを外して空いた下側を詰め、題名を縦の中央へ
  "reol-song-087": `
    .a087-cover__top { display: none !important; }
    .a087-cover { display: flex !important; flex-direction: column !important; justify-content: center !important; padding-top: 0 !important; padding-bottom: 0 !important; }
    .a087-cover__body { margin-top: 0 !important; margin-bottom: 0 !important; padding-top: 0 !important; padding-bottom: 0 !important; }
  `,
};

const isolateCover = async (page: Page) => {
  await page.evaluate(() => {
    const cover = document.querySelector<HTMLElement>("[data-og-cover]");
    if (!cover) throw new Error("data-og-cover の要素がありません");
    // 表紙から body までの各段で、表紙を含まない兄弟要素(サイトの枠・本文・下部ナビなど)を隠す
    for (let el: HTMLElement = cover; el.parentElement && el !== document.body; el = el.parentElement) {
      for (const sib of Array.from(el.parentElement.children)) {
        if (sib !== el && sib instanceof HTMLElement) sib.style.setProperty("display", "none", "important");
      }
      const parent = el.parentElement;
      if (parent !== document.body) {
        for (const prop of ["margin", "padding", "min-height", "border"]) parent.style.setProperty(prop, "0", "important");
      }
    }
    const brand = document.createElement("div");
    brand.className = "og-brand";
    brand.textContent = "!Legit — Reol 非公式ファンサイト";
    cover.appendChild(brand);
    window.scrollTo(0, 0);
  });
};

const capture = async (page: Page, a: Published) => {
  await page.goto(`${BASE_URL}/articles/${a.slug}/`, { waitUntil: "load" });
  await page.waitForSelector("[data-og-cover] h1", { timeout: 30000 });
  // 読み上げ対象外の飾り(平面鏡の反転した題名など)は題名に含めない
  const h1 = (
    await page.locator("[data-og-cover] h1").first().evaluate((el) => {
      const c = el.cloneNode(true) as HTMLElement;
      c.querySelectorAll('[aria-hidden="true"]').forEach((n) => n.remove());
      return c.textContent ?? "";
    })
  ).replace(/\s+/g, "");
  if (h1 !== a.title.replace(/\s+/g, "")) {
    throw new Error(`${a.id}: 表紙の題名「${h1}」が公開中の題名「${a.title}」と違います(未公開の原稿を表示していませんか)`);
  }
  await page.addStyleTag({ content: COMMON_CSS + (PER_ARTICLE_CSS[a.id] ?? "") });
  await isolateCover(page);
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(
      Array.from(document.images).map((img) => (img.complete ? null : new Promise((r) => img.addEventListener("load", r, { once: true }))))
    );
  });
  await page.waitForTimeout(800);
  const file = path.join(OUT_DIR, `${a.slug}.jpg`);
  await page.screenshot({ path: file, type: "jpeg", quality: 88, clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT } });
  return file;
};

const main = async () => {
  const only = process.argv.slice(2);
  const targets = (await loadPublished()).filter((a) => only.length === 0 || only.includes(a.slug) || only.includes(a.id));
  if (targets.length === 0) throw new Error("撮る記事がありません");
  await fs.mkdir(OUT_DIR, { recursive: true });
  const browser = await webkit.launch();
  try {
    for (const a of targets) {
      const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT }, deviceScaleFactor: 1, reducedMotion: "reduce" });
      const file = await capture(page, a);
      const { size } = await fs.stat(file);
      console.log(`[articles-og] ${a.id} → ${path.relative(ROOT, file)} (${Math.round(size / 1024)}KB)`);
      await page.close();
    }
  } finally {
    await browser.close();
  }
};

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
