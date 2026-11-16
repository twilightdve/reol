// Lighthouse を1本ずつ順に回す(同時実行はしない)。node lh-run.js <origin> <outdir> <runs> <preset:mobile|desktop> <path...>
const { spawnSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const [origin, outdir, runs, preset, ...paths] = process.argv.slice(2);
fs.mkdirSync(outdir, { recursive: true });
const bin = path.join(__dirname, "../evaltools/node_modules/.bin/lighthouse");
for (const p of paths) {
  const slug = p.replace(/^\/|\/$/g, "").replace(/[^a-z0-9.-]+/gi, "_") || "home";
  for (let i = 1; i <= Number(runs); i++) {
    const out = path.join(outdir, `${slug}.${preset}.${i}.json`);
    if (fs.existsSync(out)) continue;
    const args = [origin + p, "--output=json", `--output-path=${out}`, "--chrome-flags=--headless=new", "--quiet"];
    if (preset === "desktop") args.push("--preset=desktop");
    const t = Date.now();
    const r = spawnSync(bin, args, { encoding: "utf8", timeout: 180000 });
    console.log(`${p} ${preset} #${i} exit=${r.status} ${Math.round((Date.now() - t) / 1000)}s`);
  }
}
console.log("DONE");
