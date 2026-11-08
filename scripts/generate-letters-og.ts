/**
 * 誕生日企画(/letters/。plan/64)の OGP 画像(1200x630)を作る → static/og/letters.jpg
 * 入口と同じ見た目(大谷石の実写・Happy Birthday, Reol の #326B45・Cormorant Garamond / Noto Serif JP・小さな 4 つのアイコン)を
 * ブラウザ(Playwright)で描いて撮る。フォントは Google Fonts から読む(ネットワークが要る)。
 * 実行: npx ts-node --compiler-options '{"module":"commonjs","target":"es2020"}' scripts/generate-letters-og.ts
 */
import * as fs from "fs";
import * as path from "path";
import { chromium } from "playwright";
import { BIRTHDAY_ICON_DEFS, BIRTHDAY_ICONS } from "../src/components/letters/birthdayIcons";

const root = path.join(__dirname, "..");
const stone = fs.readFileSync(path.join(root, "static/letters/oya-stone.jpg")).toString("base64");
const out = path.join(root, "static/og/letters.jpg");

const html = `<!doctype html><html lang="ja"><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Noto+Sans+JP:wght@500;600&family=Noto+Serif+JP:wght@500;600&display=block" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;overflow:hidden;background:#e7eadd;color:#2d3932;font-family:'Noto Serif JP',serif}
.og{position:relative;width:1200px;height:630px;isolation:isolate;padding:58px 70px}
.stone{position:absolute;inset:0;z-index:-2;background:url(data:image/jpeg;base64,${stone}) 50% 46%/cover;filter:saturate(.38) contrast(.86) brightness(1.12);opacity:.9}
.og:before{content:'';position:absolute;inset:0;z-index:-1;background:linear-gradient(95deg,rgba(244,245,235,.97) 0%,rgba(244,245,235,.86) 38%,rgba(237,240,225,.32) 72%,rgba(231,233,216,.08) 100%),linear-gradient(0deg,rgba(236,239,226,.78),transparent 42%)}
.top{display:flex;justify-content:space-between;font:500 15px/1 'Noto Sans JP',sans-serif;letter-spacing:.16em}
.top .date{font:600 20px/1 'Cormorant Garamond',serif;letter-spacing:.14em;color:#95753e}
.eyebrow{display:flex;align-items:center;gap:14px;margin-top:44px;font:500 15px/1 'Noto Sans JP',sans-serif;letter-spacing:.16em;color:#6b745c}
.eyebrow:before{content:'';width:36px;height:1px;background:#95753e}
h1{color:#326b45;font:400 108px/.9 'Cormorant Garamond',serif;letter-spacing:-.025em;margin-top:64px}
h1 span{display:block}h1 em{font-style:italic}h1 .name{font-size:1.6em;line-height:.84;letter-spacing:-.04em;margin-top:6px}
.side{position:absolute;right:70px;bottom:62px;width:480px;padding:26px 28px 24px;background:rgba(244,244,237,.9);border:1px solid #b4bda3;box-shadow:0 18px 40px #3c493d22}
.side:before{content:'';position:absolute;inset:8px;border:1px solid #8c9c7a40;pointer-events:none}
.label{font:600 12px/1 'Noto Sans JP',sans-serif;letter-spacing:.2em;color:#95753e}
.title{font:500 33px/1.45 'Noto Serif JP',serif;letter-spacing:.05em;margin:14px 0 8px;white-space:nowrap}
.copy{font:500 17px/1.8 'Noto Serif JP',serif;color:#6c6250;letter-spacing:.04em}
.icons{display:flex;gap:12px;margin-top:16px}
.title .owl{width:40px;height:44px;margin-left:10px;vertical-align:-8px}
.icons svg{width:30px;height:30px}
.foot{position:absolute;left:70px;bottom:40px;font:500 14px/1.6 'Noto Sans JP',sans-serif;letter-spacing:.06em;color:#4f5a48}
.foot b{font:500 22px/1 'Cormorant Garamond',serif;letter-spacing:.01em;margin-right:12px;color:#2d3932}
.foot b i{font-style:normal;color:#95753e}
</style></head><body>
<svg width="0" height="0" style="position:absolute">${BIRTHDAY_ICON_DEFS}</svg>
<div class="og"><div class="stone"></div>
<div class="top"><span>Reol / 2026</span><span class="date">NOVEMBER 09</span></div>
<h1><span><em>Happy</em></span><span>Birthday,</span><span class="name">Reol</span></h1>
<div class="side"><div class="label">BIRTHDAY PROJECT</div><div class="title">件名のないふくろう便<svg class="owl" viewBox="0 0 48 52"><path d="M12 9 15 3 19 10C21 9 27 9 29 10L33 3 36 9C41 14 42 22 41 30 40 41 33 48 24 48 15 48 8 41 7 30 6 22 7 14 12 9Z" fill="#fffdf8" stroke="#576047" stroke-width="1.4" stroke-linejoin="round"/><circle cx="17.5" cy="20" r="6" fill="#fff" stroke="#576047" stroke-width="1.2"/><circle cx="30.5" cy="20" r="6" fill="#fff" stroke="#576047" stroke-width="1.2"/><circle cx="18" cy="20.5" r="2.4" fill="#2d3932"/><circle cx="30" cy="20.5" r="2.4" fill="#2d3932"/><path d="M22 25.5 24 29 26 25.5Z" fill="#c9a55a"/><path d="M14 31C17 34 19 37 19 42M34 31C31 34 29 37 29 42" fill="none" stroke="#919b89" stroke-width="1.1" stroke-linecap="round"/><path d="M19 48v2.5M22 48v2.5M26 48v2.5M29 48v2.5" stroke="#95753e" stroke-width="1.3" stroke-linecap="round"/></svg></div>
<div class="copy">この一年の思い出と、お祝いの言葉を。<br>手紙は一冊にまとめて贈ります</div>
<div class="icons">${BIRTHDAY_ICONS.map((id) => `<svg viewBox="0 0 64 64"><use href="#birthday-${id}"/></svg>`).join("")}</div></div>
<div class="foot"><b><i>!</i>Legit</b>による非公式バースデー企画</div>
</div></body></html>`;

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: "networkidle" });
  await page.evaluate(() => (document as any).fonts.ready);
  await page.waitForTimeout(500);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  await page.screenshot({ path: out, type: "jpeg", quality: 88 });
  await browser.close();
  console.log("wrote", path.relative(root, out), fs.statSync(out).size, "bytes");
})();
