import { generateReliveData } from "../src/features/relive/data-transform";

/**
 * 環境変数の解決。新名 RELIVE_* を優先し、旧名 ZANKYO_* は後方互換として残す。
 * 旧名が使われた場合は警告を出す (将来削除予定)。
 */
const readEnv = (newKey: string, legacyKey: string): string | undefined => {
  const newValue = process.env[newKey];
  if (newValue) return newValue;
  const legacyValue = process.env[legacyKey];
  if (legacyValue) {
    console.warn(
      `[relive] WARN: environment variable ${legacyKey} is deprecated; please rename to ${newKey}.`
    );
    return legacyValue;
  }
  return undefined;
};

const main = async () => {
  const result = await generateReliveData({
    liveJsonPath:
      readEnv("RELIVE_LIVE_JSON_PATH", "ZANKYO_LIVE_JSON_PATH") || "static/data/live.json",
    discographyJsonPath:
      readEnv("RELIVE_DISCOGRAPHY_JSON_PATH", "ZANKYO_DISCOGRAPHY_JSON_PATH") ||
      "static/data/discography.json",
    liveJsonFallbackPath:
      readEnv("RELIVE_LIVE_JSON_FALLBACK_PATH", "ZANKYO_LIVE_JSON_FALLBACK_PATH") ||
      "public/static/data/live.json",
    discographyJsonFallbackPath:
      readEnv(
        "RELIVE_DISCOGRAPHY_JSON_FALLBACK_PATH",
        "ZANKYO_DISCOGRAPHY_JSON_FALLBACK_PATH"
      ) || "public/static/data/discography.json",
    venueEnrichmentPath:
      readEnv("RELIVE_VENUE_ENRICHMENT_PATH", "ZANKYO_VENUE_ENRICHMENT_PATH") ||
      "static/data/relive-venue-enrichment.json",
    venueEnrichmentFallbackPath:
      readEnv(
        "RELIVE_VENUE_ENRICHMENT_FALLBACK_PATH",
        "ZANKYO_VENUE_ENRICHMENT_FALLBACK_PATH"
      ) || "public/static/data/relive-venue-enrichment.json",
    venueLayoutOverridesPath:
      readEnv(
        "RELIVE_VENUE_LAYOUT_OVERRIDES_PATH",
        "ZANKYO_VENUE_LAYOUT_OVERRIDES_PATH"
      ) || "src/data/relive/venue-layout-overrides.json",
    outputDir:
      readEnv("RELIVE_GENERATED_OUTPUT_DIR", "ZANKYO_GENERATED_OUTPUT_DIR") ||
      "static/relive/generated",
  });

  const report = result.importReport;
  console.log("[relive] generated static/relive/generated");
  console.log(
    `[relive] tracks=${result.manifest.counts.tracks}, venues=${result.manifest.counts.venues}, setlists=${result.manifest.counts.setlists}, entries=${result.manifest.counts.setlistEntries}`
  );
  console.log(
    `[relive] unmatched=${report.counts.unmatchedEntries}, venueTasks=${result.venuesJson.venues.length}`
  );
  console.log(`[relive] live source=${result.manifest.source.liveJsonPath}`);
  console.log(`[relive] discography source=${result.manifest.source.discographyJsonPath}`);
  console.log(`[relive] venue enrichment source=${result.manifest.source.venueEnrichmentPath || "none"}`);
  console.log(`[relive] venue layout override source=${result.manifest.source.venueLayoutOverridesPath || "none"}`);
  console.log(
    `[relive] venue layouts=${result.venueLayoutsJson.layouts.length}, layoutTasks=${result.venueLayoutCoverageJson.counts.enrichmentTasks}`
  );
};

main().catch((error) => {
  console.error("[relive] generation failed");
  console.error(error);
  process.exit(1);
});
