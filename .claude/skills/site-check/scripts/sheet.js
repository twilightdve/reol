// 複数のスクリーンショットを横に並べた1枚にする: node sheet.js out.png h file...
const sharp = require(process.env.REPO + "/node_modules/sharp");
(async () => {
  const [out, h, ...files] = process.argv.slice(2); const H = Number(h);
  const imgs = []; for (const f of files) { const b = await sharp(f).resize({ height: H }).toBuffer(); const m = await sharp(b).metadata(); imgs.push({ b, w: m.width }); }
  const gap = 12; const W = imgs.reduce((a, i) => a + i.w + gap, gap);
  let x = gap; const comp = imgs.map((i) => { const c = { input: i.b, left: x, top: gap }; x += i.w + gap; return c; });
  await sharp({ create: { width: W, height: H + gap * 2, channels: 3, background: "#777" } }).composite(comp).png().toFile(out);
})();
