# Sample Static Data Contract

## static/tracks.json

```json
{
  "schemaVersion": 1,
  "updatedAt": "2026-05-17T12:00:00+09:00",
  "tracks": [
    {
      "schemaVersion": 1,
      "trackId": "track_404",
      "canonicalTitle": "404 not found",
      "aliases": ["404", "404 NOT FOUND"],
      "artistNames": ["Reol", "REOL"],
      "kind": "original",
      "expectedDurationSec": 244,
      "matchHints": ["404"]
    }
  ]
}
```

## static/setlists/*.json

```json
{
  "schemaVersion": 1,
  "setlistId": "sample_bijigaku_2026_asahikawa",
  "tourName": "美辞学",
  "liveTitle": "美辞学 Sample Night",
  "date": "2026-05-09",
  "venueName": "旭川 CASINO DRIVE",
  "venueId": "venue_livehouse_default",
  "entries": [
    {
      "schemaVersion": 1,
      "entryId": "entry_001",
      "order": 1,
      "trackId": "track_404",
      "displayTitle": "404 not found",
      "aliases": ["404"],
      "policy": "required",
      "expectedDurationSec": 244,
      "afterglowTailSec": 10
    }
  ],
  "source": {
    "type": "site_db",
    "sourceId": "bijigaku-2026",
    "updatedAt": "2026-05-17T12:00:00+09:00"
  }
}
```

## static/venues.json

```json
{
  "schemaVersion": 1,
  "updatedAt": "2026-05-17T12:00:00+09:00",
  "venuePresets": [
    {
      "schemaVersion": 1,
      "venueId": "venue_livehouse_default",
      "name": "Live House Default",
      "type": "live_house",
      "acoustic": {
        "eq": {
          "bands": [
            { "type": "lowshelf", "frequencyHz": 80, "gainDb": 3.0 },
            { "type": "highshelf", "frequencyHz": 8000, "gainDb": -1.5 }
          ]
        },
        "reverb": {
          "amount": 0.22,
          "decaySec": 0.6,
          "preDelayMs": 8,
          "damping": 0.7
        },
        "reflections": {
          "earlyReflectionAmount": 0.35,
          "slapDelayMs": 28,
          "sideReflectionMs": 42
        },
        "spatial": {
          "stageWidth": 7,
          "depth": 18,
          "height": 3,
          "leftPaPosition": { "x": -3.2, "y": 2.1, "z": 0 },
          "rightPaPosition": { "x": 3.2, "y": 2.1, "z": 0 },
          "defaultListenerPosition": { "x": -0.8, "y": 1.5, "z": 6.5 },
          "paSpread": 5.5
        },
        "dynamics": {
          "limiterEnabled": true,
          "compressorEnabled": true,
          "outputGainDb": -3
        }
      }
    }
  ]
}
```

## DB/スプレッドシート連携方針

アプリ側は最終的にJSONを読む。  
スプレッドシートや既存サイトDBを直接読ませる必要はない。

推奨:

```txt
site DB / spreadsheet
  ↓ build script or API
static JSON
  ↓
残響座標
```
