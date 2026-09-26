export type CompareTarget = { liveId: number; liveItemNo: number }

export const encodeTarget = (t: CompareTarget) => `${t.liveId}-${t.liveItemNo}`

export const decodeTarget = (value: string | null): CompareTarget | undefined => {
  if (!value) return undefined
  const m = value.match(/^(\d+)-(\d+)$/)
  if (!m) return undefined
  return { liveId: Number(m[1]), liveItemNo: Number(m[2]) }
}
