// live.json の googleMapsUrl (Google Maps embed URL) から座標を抽出して
// venue-coords.json を生成する。
// embed URL には `!2d<lng>!3d<lat>` の形で座標が含まれている。
//
// シート側のgoogleMapsUrlが誤った座標を含んでいるケース(例: BIG CAT / 広島クラブ
// クアトロで住所とは無関係な座標が埋め込まれていた)があり、過去に手動で座標を
// 補正した実績がある。再生成のたびにその補正が失われないよう、既存ファイルで
// source:"manual" のエントリは上書きせず保持する。
//
//   node scripts/extract-venue-coords.mjs
import { readFileSync, writeFileSync, existsSync } from 'fs'

const LIVE_JSON = 'static/data/live.json'
const OUT_JSON = 'static/data/venue-coords.json'

const live = JSON.parse(readFileSync(LIVE_JSON, 'utf8'))
const existing = existsSync(OUT_JSON)
  ? JSON.parse(readFileSync(OUT_JSON, 'utf8'))
  : {}

/** embed URL から [lat, lng] を抽出。失敗時 null。 */
function parseEmbed(url) {
  if (!url || typeof url !== 'string') return null
  const m = url.match(/!2d(-?\d+\.\d+)!3d(-?\d+\.\d+)/)
  if (!m) return null
  return { lat: parseFloat(m[2]), lng: parseFloat(m[1]) }
}

const out = {}
// 既存の手動補正エントリを先に引き継ぐ(シート側データより優先)
for (const [place, entry] of Object.entries(existing)) {
  if (entry?.source === 'manual') out[place] = entry
}

let extracted = 0
let skippedNoUrl = 0
let skippedNoMatch = 0
let skippedManual = 0
const seen = new Set()
for (const l of live) {
  for (const i of l.items || []) {
    if (!i.place) continue
    if (seen.has(i.place)) continue
    seen.add(i.place)
    if (out[i.place]?.source === 'manual') {
      skippedManual++
      continue
    }
    if (!i.googleMapsUrl) {
      skippedNoUrl++
      continue
    }
    const c = parseEmbed(i.googleMapsUrl)
    if (!c) {
      skippedNoMatch++
      console.log(`- no coords in url: ${i.place}`)
      continue
    }
    out[i.place] = { lat: c.lat, lng: c.lng, source: 'googleMapsUrl' }
    extracted++
  }
}

writeFileSync(OUT_JSON, JSON.stringify(out, null, 2))
console.log(
  `\nextracted=${extracted}, skipped(noUrl)=${skippedNoUrl}, skipped(parseFail)=${skippedNoMatch}, skipped(manual override kept)=${skippedManual}`
)
