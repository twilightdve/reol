# 04. Transform Flow Changes

## 既存フロー

```txt
live.json
discography.json
  ↓
tracks
venues
setlists
reports
```

## 追加後フロー

```txt
live.json
discography.json
venue-layout-overrides.json
  ↓
tracks
base venues
base venue layout candidates
setlists
  ↓
merge layout overrides
  ↓
venues.json
venue-layouts.json
layout reports
```

## 追加関数

```txt
loadVenueLayoutOverrides()
createBaseVenueLayouts()
mergeVenueLayoutOverrides()
inferDefaultLayoutFromVenueType()
createVenueLayoutReports()
writeVenueLayoutsJson()
writeVenueLayoutEnrichmentTasks()
writeVenueLayoutCoverageReport()
```

## createBaseVenueLayouts

live.jsonから抽出した会場に対して、最低限のlayoutを作る。

```txt
live_house:
  audienceMode = standing
  layoutShape = rectangle
  stage.position = front
  zones = front/middle/rear + left/center/right

hall:
  audienceMode = seated
  layoutShape = fan or rectangle
  stage.position = front
  zones = front/middle/rear/left/center/right

arena:
  audienceMode = seated or mixed
  layoutShape = arena_bowl
  stage.position = end_stage or unknown

outdoor_festival:
  audienceMode = festival
  layoutShape = outdoor_field
  stage.position = front

virtual:
  audienceMode = virtual
  layoutShape = unknown
```

## default listener presets

```txt
front_center:
  x=0, z=0.18

front_left:
  x=-0.55, z=0.2

front_right:
  x=0.55, z=0.2

middle_center:
  x=0, z=0.5

rear_center:
  x=0, z=0.82

balcony_center:
  x=0, z=0.65, y=1
```

## reports追加

### venue-layout-enrichment-tasks.csv

```csv
venueId,venueName,typeGuess,layoutStatus,capacityStatus,hasOfficialSite,siteUrl,address,sourceLiveIds,neededFields
```

### venue-layout-coverage.json

```json
{
  "schemaVersion": 1,
  "generatedAt": "...",
  "counts": {
    "venues": 104,
    "layouts": 104,
    "verified": 0,
    "partiallyVerified": 0,
    "estimated": 0,
    "needsVerification": 104
  }
}
```
