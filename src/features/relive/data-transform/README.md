# Relive Data Transform

This Node-side transform builds the static JSON used by `/relive/`.

Input is read from the existing fan-site exports at
`static/data/live.json` and `static/data/discography.json`.
`public/static/data/` remains supported as a local fallback only for older
worktrees.

Venue enrichment is read from `static/data/relive-venue-enrichment.json`.
This file is a checked-in verification snapshot. The generator never fetches
venue websites during build; new capacity/address values must be externally
checked first, then added to the snapshot with source URLs.

Output is always written to `static/relive/generated/` so Gatsby can copy it to
`public/relive/generated/` during `npm run build`.

The transform is intentionally local and metadata-only:

- It does not read or write audio files.
- It does not output lyrics, jacket images, official logos, or live video.
- It does not fetch network resources.
- Venue capacity is never guessed. Unverified capacity stays `null` with
  `capacityStatus: "needs_web_verification"`.
- Venue layout metadata is generated locally from venue type defaults and can be
  overridden by `src/data/relive/venue-layout-overrides.json`.
- Venue layout overrides must contain only hand-entered or verified metadata and
  reference URLs. Official floor map images, seating chart images, downloaded
  HTML, and base64 images are not bundled.

Environment overrides:

- `RELIVE_LIVE_JSON_PATH`
- `RELIVE_DISCOGRAPHY_JSON_PATH`
- `RELIVE_LIVE_JSON_FALLBACK_PATH`
- `RELIVE_DISCOGRAPHY_JSON_FALLBACK_PATH`
- `RELIVE_VENUE_ENRICHMENT_PATH`
- `RELIVE_VENUE_ENRICHMENT_FALLBACK_PATH`
- `RELIVE_VENUE_LAYOUT_OVERRIDES_PATH`
- `RELIVE_GENERATED_OUTPUT_DIR`

旧名 `ZANKYO_*` も後方互換のため当面読み取り対象に残しています (使用時は警告が出ます)。将来削除予定なので新名への移行を推奨します。

Run:

```sh
npm run generate:relive
```
