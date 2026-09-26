# 06. コンポーネント構成

```txt
src/
  components/setlistCompare/
    ComparePage.tsx
    CompareSelector.tsx
    LiveSelector.tsx
    LiveItemSelector.tsx
    CompareSummary.tsx
    CompareFilterTabs.tsx
    CompareTable.tsx
    CompareSongRow.tsx
    CompareSongCard.tsx
    TourHeatmap.tsx
  domain/setlist/
    normalizeSetlist.ts
    compareSetlists.ts
    similarity.ts
    types.ts
  hooks/
    useCompareQuery.ts
```

比較ロジックはReactコンポーネントから分離し、pure functionにする。
