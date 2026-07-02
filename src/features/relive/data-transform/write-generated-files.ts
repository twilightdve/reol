import { promises as fs } from "fs";
import path from "path";
import type { GeneratedTransformResult } from "./generated-types";

const writeJson = async (filePath: string, value: unknown) => {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
};

export const writeGeneratedFiles = async (
  outputDir: string,
  result: GeneratedTransformResult
) => {
  await fs.mkdir(outputDir, { recursive: true });
  await Promise.all([
    writeJson(path.join(outputDir, "manifest.json"), result.manifest),
    writeJson(path.join(outputDir, "tracks.json"), result.tracksJson),
    writeJson(path.join(outputDir, "venues.json"), result.venuesJson),
    writeJson(path.join(outputDir, "venue-layouts.json"), result.venueLayoutsJson),
    writeJson(path.join(outputDir, "setlists", "index.json"), result.setlistsIndexJson),
    writeJson(path.join(outputDir, "reports", "import-report.json"), result.importReport),
    writeJson(path.join(outputDir, "reports", "venue-layout-coverage.json"), result.venueLayoutCoverageJson),
    fs.mkdir(path.join(outputDir, "reports"), { recursive: true }).then(() =>
      Promise.all([
        fs.writeFile(path.join(outputDir, "reports", "venue-enrichment-tasks.csv"), result.venueTasksCsv, "utf8"),
        fs.writeFile(
          path.join(outputDir, "reports", "venue-layout-enrichment-tasks.csv"),
          result.venueLayoutTasksCsv,
          "utf8"
        ),
        fs.writeFile(path.join(outputDir, "reports", "unmatched-raw-titles.csv"), result.unmatchedRawTitlesCsv, "utf8"),
      ])
    ),
    ...result.setlists.map((setlist) =>
      writeJson(path.join(outputDir, "setlists", `${setlist.setlistId}.json`), setlist)
    ),
  ]);
};
