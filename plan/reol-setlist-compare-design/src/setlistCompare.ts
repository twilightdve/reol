import type { SetlistSong, ComparedSong, CompareSummary } from "./types"

export const normalizeSongName = (name: string) =>
  name.normalize("NFKC").trim().replace(/\s+/g, " ").toLowerCase()

export const compareSetlists = (a: SetlistSong[], b: SetlistSong[]) => {
  const normalize = (songs: SetlistSong[]) => songs
    .filter(s => s.liveItemSongName?.trim() && s.liveItemSongName.trim() !== "-")
    .map(s => ({
      ...s,
      key: s.songId != null ? `song:${s.songId}` : `name:${normalizeSongName(s.liveItemSongName)}`,
      position: s.liveItemSongNo,
    }))

  const na = normalize(a)
  const nb = normalize(b)
  const ma = new Map(na.map(s => [s.key, s]))
  const mb = new Map(nb.map(s => [s.key, s]))
  const keys = Array.from(new Set([...ma.keys(), ...mb.keys()]))

  const songs: ComparedSong[] = keys.map(key => {
    const sa = ma.get(key), sb = mb.get(key)
    if (sa && sb) {
      const diff = sb.position - sa.position
      return { key, songId: sa.songId ?? sb.songId, songName: sa.liveItemSongName, aPosition: sa.position, bPosition: sb.position, status: "common", positionDiff: diff, samePosition: diff === 0 }
    }
    if (sa) return { key, songId: sa.songId, songName: sa.liveItemSongName, aPosition: sa.position, status: "onlyA" }
    return { key, songId: sb!.songId, songName: sb!.liveItemSongName, bPosition: sb!.position, status: "onlyB" }
  })

  const common = songs.filter(s => s.status === "common")
  const unionCount = songs.length
  const minCount = Math.min(na.length, nb.length)
  const summary: CompareSummary = {
    aCount: na.length, bCount: nb.length, commonCount: common.length,
    onlyACount: songs.filter(s => s.status === "onlyA").length,
    onlyBCount: songs.filter(s => s.status === "onlyB").length,
    unionCount,
    jaccardSimilarity: unionCount === 0 ? 1 : common.length / unionCount,
    commonRate: minCount === 0 ? (na.length === nb.length ? 1 : 0) : common.length / minCount,
    maxPositionDiff: common.reduce((m,s) => Math.max(m, Math.abs(s.positionDiff ?? 0)), 0),
  }
  return { songs, summary }
}
