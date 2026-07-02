# 07. Output Schema

## manifest.json

```json
{
  "schemaVersion": 1,
  "generatedAt": "2026-05-17T00:00:00+09:00",
  "source": {
    "liveJsonPath": "static/data/live.json",
    "discographyJsonPath": "static/data/discography.json",
    "liveJsonHash": "...",
    "discographyJsonHash": "..."
  },
  "counts": {
    "tracks": 156,
    "venues": 104,
    "setlists": 122,
    "setlistEntries": 1233
  },
  "paths": {
    "tracks": "/zankyo/generated/tracks.json",
    "venues": "/zankyo/generated/venues.json",
    "setlistsIndex": "/zankyo/generated/setlists/index.json"
  }
}
```

## tracks.json

```json
{
  "schemaVersion": 1,
  "source": {
    "type": "fansite-discography-json",
    "path": "static/data/discography.json"
  },
  "tracks": []
}
```

## venues.json

```json
{
  "schemaVersion": 1,
  "source": {
    "type": "fansite-live-json",
    "path": "static/data/live.json"
  },
  "venues": []
}
```

## setlists/index.json

```json
{
  "schemaVersion": 1,
  "source": {
    "type": "fansite-live-json",
    "path": "static/data/live.json"
  },
  "setlists": []
}
```

## setlists/<setlistId>.json

```json
{
  "schemaVersion": 1,
  "setlistId": "live_55_item_1",
  "source": {
    "liveId": 55,
    "liveItemNo": 1
  },
  "tourName": "Reol Oneman Live「No title」",
  "liveTitle": "Reol Oneman Live「No title」",
  "date": "2024-08-17",
  "venueId": "venue_nippon_budokan",
  "venueName": "日本武道館",
  "entries": []
}
```

## import-report.json

```json
{
  "schemaVersion": 1,
  "generatedAt": "...",
  "counts": {
    "sourceLives": 0,
    "sourceLiveItems": 0,
    "sourceSetlistEntries": 0,
    "sourceDiscographies": 0,
    "sourceSongs": 0,
    "generatedTracks": 0,
    "generatedSetlists": 0,
    "generatedVenues": 0,
    "matchedEntries": 0,
    "specialEntries": 0,
    "unmatchedEntries": 0
  },
  "warnings": []
}
```
