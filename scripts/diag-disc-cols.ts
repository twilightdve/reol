/**
 * 一時診断: discography / song シートの生の列構成とサンプル行を出力。
 *   export $(grep SPREADSHEET_ID .env.production | xargs) && \
 *   npx ts-node --compiler-options '{"module":"commonjs"}' scripts/diag-disc-cols.ts
 */
import { SheetService } from "../src/services/SpreadsheetService";

const AZ = (i: number) => String.fromCharCode(65 + i);

async function dump(sheet: SheetService, range: string, label: string, sampleN = 3) {
  console.log(`\n===== ${label} (${range}) =====`);
  const rows = await (sheet as any).getValues(range);
  // ヘッダ行 (1行目)
  const header = rows[0] ?? [];
  header.forEach((h: string, i: number) =>
    console.log(`  ${AZ(i)}[${i}]: ${JSON.stringify(h)}`)
  );
  console.log("  --- sample rows ---");
  rows.slice(1, 1 + sampleN).forEach((r: string[], n: number) => {
    console.log(`  [row ${n + 2}]`);
    r.forEach((c, i) => {
      if (c !== "" && c != null) console.log(`     ${AZ(i)}: ${JSON.stringify(c)}`);
    });
  });
}

async function main() {
  const sheet = new SheetService();
  await sheet.initialize();
  await dump(sheet, "discography!A1:L6", "discography");
  await dump(sheet, "song!A1:T8", "song");
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
