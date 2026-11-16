// 画面写真を横に並べた 1 枚にする(見て判断する時と、ユーザーに見せる時に使う)。
// node sheet.js                 … 今回の shots/ を幅ごとに 8 枚ずつ並べて sheets/ に置く
// node sheet.js --pages /,/live/ --vp sp --out home-live.png   … 選んだページだけ
const path = require("path");
const fs = require("fs");
const { config, runDir, repoRequire, slug, args, pagesArg } = require("./lib");
const sharp = repoRequire("sharp");

const shotDir = path.join(runDir, "shots");
const sheetDir = path.join(runDir, "sheets");
fs.mkdirSync(sheetDir, { recursive: true });
const pages = pagesArg(config.samplePages);
const per = Number(args.per || 8);

const tile = async (files, out, H) => {
  const imgs = [];
  for (const f of files) { const b = await sharp(f).resize({ height: H }).toBuffer(); imgs.push({ b, w: (await sharp(b).metadata()).width }); }
  const gap = 12;
  let x = gap;
  const comp = imgs.map((i) => { const c = { input: i.b, left: x, top: gap }; x += i.w + gap; return c; });
  await sharp({ create: { width: x, height: H + gap * 2, channels: 3, background: "#777" } }).composite(comp).png().toFile(out);
};

(async () => {
  const vps = typeof args.vp === "string" ? [args.vp] : config.viewports.map((v) => v.name);
  for (const vp of vps) {
    const files = pages.map((p) => ({ p, f: path.join(shotDir, `${slug(p)}.${vp}.png`) })).filter((x) => fs.existsSync(x.f));
    if (!files.length) { console.log(`${vp}: 写真が無い(先に design.js)`); continue; }
    const H = vp === "sp" ? 700 : 500;
    const n = vp === "sp" ? per : Math.max(2, Math.floor(per / 2));
    if (typeof args.out === "string") { const out = path.join(sheetDir, args.out); await tile(files.map((x) => x.f), out, H); console.log(`${out}: ${files.map((x) => x.p).join(" ")}`); continue; }
    for (let i = 0; i < files.length; i += n) {
      const part = files.slice(i, i + n);
      const out = path.join(sheetDir, `${vp}-${String(i / n + 1).padStart(2, "0")}.png`);
      await tile(part.map((x) => x.f), out, H);
      console.log(`${out}: ${part.map((x) => x.p).join(" ")}`);
    }
  }
})();
