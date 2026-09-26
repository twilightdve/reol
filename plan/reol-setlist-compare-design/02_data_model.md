# 02. データモデル

## 現行 live.json
```ts
type Live = {
  liveId: number
  type: string
  title: string
  date: string
  items: LiveItem[]
}

type LiveItem = {
  liveId: number
  liveItemNo: number
  liveItemName: string
  date: string
  place: string
  setList: LiveSetlistSong[]
}

type LiveSetlistSong = {
  liveId: number
  liveItemNo: number
  liveItemSongNo: number
  liveItemSongName: string
}
```

## discography.json
```ts
type DiscographySong = {
  songId: number
  discographyId: number
  songNo: number
  songName: string
  spotifyTrackId?: string
}
```

## 推奨変更
将来的にセトリ側へ `songId?: number` を追加。

比較キー優先順位:
1. songId
2. 正規化済み曲名

曲名だけでは feat. / Remix / メドレー / 記号差などで誤判定しうる。
