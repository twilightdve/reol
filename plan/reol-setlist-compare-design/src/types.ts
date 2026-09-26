export type SetlistSong = {
  liveId: number
  liveItemNo: number
  liveItemSongNo: number
  liveItemSongName: string
  songId?: number
}

export type ComparedSong = {
  key: string
  songId?: number
  songName: string
  aPosition?: number
  bPosition?: number
  status: "common" | "onlyA" | "onlyB"
  positionDiff?: number
  samePosition?: boolean
}

export type CompareSummary = {
  aCount: number
  bCount: number
  commonCount: number
  onlyACount: number
  onlyBCount: number
  unionCount: number
  jaccardSimilarity: number
  commonRate: number
  maxPositionDiff: number
}
