import React, { useEffect, useMemo, useState } from 'react'
import { MapContainer, TileLayer, GeoJSON, Marker, Tooltip, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { feature } from 'topojson-client'
import type { Topology, GeometryObject } from 'topojson-specification'
import type { Feature, FeatureCollection, Geometry } from 'geojson'
import { PREFECTURE_LIST, PrefectureName } from '../../utils/extractPrefecture'

export type PrefectureCountMap = Partial<Record<PrefectureName, number>>
export type OverseasCountMap = Record<string, number>

interface LiveHeatmapProps {
  counts: PrefectureCountMap
  /** 海外を「国」単位で集計したマップ (例: { 台湾: 3 }) */
  overseasCounts?: OverseasCountMap
  /** 海外を「県/市/州」単位で集計したマップ (例: { 新北市: 2 }) */
  overseasSubCounts?: OverseasCountMap
  heightClassName?: string
  selectedPrefecture?: PrefectureName | null
  selectedOverseasRegion?: string | null
  onSelectPrefecture?: (name: PrefectureName) => void
  onSelectOverseas?: (region: string) => void
  /** 会場ごとの公演数。マーカーをポップアップ表示するのに使う。 */
  venueCounts?: Record<string, number>
}

// 「国」 → world topojson 上の country.name 一覧。
// admin1 (県/市/州) データがそろっている国は world レイヤーでは不透明にせず、
// admin1 レイヤー (下) に描画を譲る。
const OVERSEAS_TO_COUNTRY_NAMES: Record<string, string[]> = {
  台湾: ['Taiwan'],
  韓国: ['South Korea'],
  中国: ['China'],
  アメリカ: ['United States of America'],
  インドネシア: ['Indonesia'],
  香港: [], // 110m world topojson には個別にない
}

// admin1 レイヤー定義: 国ごとに 1 エントリ。
// getName は GeoJSON Feature のプロパティから admin1 名 (overseasSubCounts のキー) を返す。
interface Admin1LayerSpec {
  region: string
  path: string
  getName: (props: Record<string, unknown>) => string | undefined
}
const ADMIN1_LAYERS: Admin1LayerSpec[] = [
  {
    region: '台湾',
    path: '/data/taiwan-counties.topojson',
    getName: (p) => (p.COUNTYNAME as string) ?? (p.name as string),
  },
  {
    region: '韓国',
    path: '/data/korea-provinces.topojson',
    getName: (p) => p.name_eng as string,
  },
  {
    region: '中国',
    path: '/data/china-provinces.topojson',
    getName: (p) => p.name as string,
  },
  {
    region: 'アメリカ',
    path: '/data/us-states.topojson',
    getName: (p) => p.name as string,
  },
  {
    region: 'インドネシア',
    path: '/data/indonesia-provinces.topojson',
    getName: (p) => p.Propinsi as string,
  },
]
const COUNTRIES_WITH_ADMIN1 = new Set<string>(ADMIN1_LAYERS.map((l) => l.region))

// 逆引き: country.name → 海外リージョン名
const COUNTRY_NAME_TO_OVERSEAS: Record<string, string> = Object.entries(
  OVERSEAS_TO_COUNTRY_NAMES
).reduce<Record<string, string>>((acc, [region, names]) => {
  for (const n of names) acc[n] = region
  return acc
}, {})

// 公演数 → カラーグラデーション (薄い → 濃い紫)
const COLOR_SCALE = [
  '#f5f5fa', // 0
  '#e7d8f7',
  '#d3b3f0',
  '#b685e3',
  '#9356cf',
  '#6b2cb5',
  '#4a1d8c',
]

function getColor(count: number, max: number): string {
  if (!count) return COLOR_SCALE[0]
  if (max <= 0) return COLOR_SCALE[0]
  // 公演数のレンジが偏るので対数スケールで分割
  const ratio = Math.log(count + 1) / Math.log(max + 1)
  const idx = Math.min(
    COLOR_SCALE.length - 1,
    Math.max(1, Math.round(ratio * (COLOR_SCALE.length - 1)))
  )
  return COLOR_SCALE[idx]
}

interface PrefectureProps {
  nam?: string
  nam_ja?: string
  id?: number
}

interface CountryProps {
  name?: string
}

type Admin1Props = Record<string, unknown>
type Admin1FC = FeatureCollection<Geometry, Admin1Props>

// 選択中の地域に応じて地図をパン/ズームする内部コンポーネント
interface MapPannerProps {
  selectedPrefecture?: PrefectureName | null
  selectedOverseasRegion?: string | null
  geoData: FeatureCollection<Geometry, PrefectureProps> | null
  worldData: FeatureCollection<Geometry, CountryProps> | null
  admin1Data: Record<string, Admin1FC>
  admin1Specs: Admin1LayerSpec[]
}
const MapPanner: React.FC<MapPannerProps> = ({
  selectedPrefecture,
  selectedOverseasRegion,
  geoData,
  worldData,
  admin1Data,
  admin1Specs,
}) => {
  const map = useMap()
  useEffect(() => {
    let target: Feature<Geometry, any> | undefined
    if (selectedPrefecture && geoData) {
      target = geoData.features.find(
        (f) => f.properties?.nam_ja === selectedPrefecture
      )
    } else if (selectedOverseasRegion) {
      // admin1 を優先
      for (const spec of admin1Specs) {
        const fc = admin1Data[spec.region]
        if (!fc) continue
        const f = fc.features.find(
          (ff) =>
            ff.properties && spec.getName(ff.properties) === selectedOverseasRegion
        )
        if (f) {
          target = f
          break
        }
      }
      // フォールバック: 世界レイヤーで国名検索
      if (!target && worldData) {
        const countryNames =
          OVERSEAS_TO_COUNTRY_NAMES[selectedOverseasRegion] ?? []
        target = worldData.features.find((f) =>
          countryNames.includes(f.properties?.name ?? '')
        )
      }
    }
    if (!target) return
    try {
      const bounds = L.geoJSON(target as any).getBounds()
      if (bounds.isValid()) {
        map.flyToBounds(bounds, { padding: [40, 40], maxZoom: 8, duration: 0.8 })
      }
    } catch {
      /* noop */
    }
  }, [selectedPrefecture, selectedOverseasRegion, geoData, worldData, admin1Data, admin1Specs, map])
  return null
}

/** 会場座標キャッシュ (`/static/data/venue-coords.json`) の型 */
type VenueCoord = { lat: number; lng: number; source?: string; country?: string }
type VenueCoordMap = Record<string, VenueCoord>

/**
 * 会場マーカー用の小さな丸ピンを生成。
 * Leaflet は SSR (Gatsby build の HTML 生成時) で window を要求するため、
 * 直接 module top-level で `L.divIcon` を呼ぶと落ちる。コンポーネント側で
 * 遅延初期化する。
 */
function createVenuePinIcon() {
  return L.divIcon({
    className: 'venue-pin-icon',
    html: '<span style="display:block;width:12px;height:12px;border-radius:50%;background:#7c3aed;border:2px solid #fff;box-shadow:0 0 2px rgba(0,0,0,0.6);"></span>',
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  })
}

const LiveHeatmap: React.FC<LiveHeatmapProps> = ({
  counts,
  overseasCounts,
  overseasSubCounts,
  heightClassName,
  selectedPrefecture,
  selectedOverseasRegion,
  onSelectPrefecture,
  onSelectOverseas,
  venueCounts,
}) => {
  const [geoData, setGeoData] = useState<FeatureCollection<Geometry, PrefectureProps> | null>(
    null
  )
  const [worldData, setWorldData] = useState<FeatureCollection<Geometry, CountryProps> | null>(
    null
  )
  const [admin1Data, setAdmin1Data] = useState<Record<string, Admin1FC>>({})
  const [venueCoords, setVenueCoords] = useState<VenueCoordMap>({})
  const [error, setError] = useState<string | null>(null)

  // Leaflet は SSR では使えないので、ブラウザ初回 render で 1 回だけ生成。
  const venuePinIcon = useMemo(
    () => (typeof window !== 'undefined' ? createVenuePinIcon() : null),
    []
  )

  // 会場座標キャッシュを取得 (scripts/geocode-venues.mjs で生成)
  useEffect(() => {
    let cancelled = false
    fetch('/data/venue-coords.json')
      .then((r) => (r.ok ? r.json() : {}))
      .then((data: VenueCoordMap) => {
        if (!cancelled && data && typeof data === 'object') setVenueCoords(data)
      })
      .catch(() => {
        /* マーカー表示は省略可能なので失敗しても無視 */
      })
    return () => {
      cancelled = true
    }
  }, [])

  // 表示する会場マーカー一覧 (座標が判明しているもののみ)
  const venueMarkers = useMemo(() => {
    if (!venueCounts) return []
    const list: Array<{ place: string; lat: number; lng: number; count: number }> = []
    for (const [place, count] of Object.entries(venueCounts)) {
      const c = venueCoords[place]
      if (!c) continue
      list.push({ place, lat: c.lat, lng: c.lng, count })
    }
    return list
  }, [venueCounts, venueCoords])

  useEffect(() => {
    let cancelled = false
    fetch('/data/japan-prefectures.topojson')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((topo: Topology) => {
        if (cancelled) return
        const key = Object.keys(topo.objects)[0]
        const fc = feature(
          topo,
          topo.objects[key] as GeometryObject
        ) as unknown as FeatureCollection<Geometry, PrefectureProps>
        setGeoData(fc)
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(String(e))
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    fetch('/data/world-countries-110m.topojson')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((topo: Topology) => {
        if (cancelled) return
        const key = Object.keys(topo.objects)[0]
        const fc = feature(
          topo,
          topo.objects[key] as GeometryObject
        ) as unknown as FeatureCollection<Geometry, CountryProps>
        setWorldData(fc)
      })
      .catch(() => {
        // 世界地図は色付けためだけなので読み込み失敗時は黙例外して主データを遮らない
      })
    return () => {
      cancelled = true
    }
  }, [])

  // 各国 admin1 データを、その国の公演が 1 件以上ある場合のみ遅延ロード
  useEffect(() => {
    let cancelled = false
    for (const spec of ADMIN1_LAYERS) {
      if ((overseasCounts?.[spec.region] ?? 0) <= 0) continue
      if (admin1Data[spec.region]) continue
      fetch(spec.path)
        .then((r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`)
          return r.json()
        })
        .then((topo: Topology) => {
          if (cancelled) return
          const key = Object.keys(topo.objects)[0]
          const fc = feature(
            topo,
            topo.objects[key] as GeometryObject
          ) as unknown as Admin1FC
          setAdmin1Data((prev) => ({ ...prev, [spec.region]: fc }))
        })
        .catch(() => {
          // admin1 読み込み失敗は黙例外
        })
    }
    return () => {
      cancelled = true
    }
    // overseasCounts が変わったら未ロードのものを取りに行く
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overseasCounts])

  // 都道府県の最大 / 海外サブ地域の最大を 1 本のスケールに揃える
  const max = useMemo(() => {
    const jp = Math.max(0, ...Object.values(counts).map((v) => v ?? 0))
    const sub = Math.max(
      0,
      ...Object.values(overseasSubCounts ?? {}).map((v) => v ?? 0)
    )
    const os = Math.max(
      0,
      ...Object.values(overseasCounts ?? {}).map((v) => v ?? 0)
    )
    return Math.max(jp, sub, os)
  }, [counts, overseasCounts, overseasSubCounts])

  const style = (f?: Feature<Geometry, PrefectureProps>) => {
    const name = f?.properties?.nam_ja as PrefectureName | undefined
    const c = (name && counts[name]) || 0
    const isSelected = !!name && selectedPrefecture === name
    return {
      fillColor: getColor(c, max),
      weight: isSelected ? 2 : 0.6,
      color: isSelected ? '#7c3aed' : '#888',
      fillOpacity: c > 0 ? 0.85 : 0.6,
    }
  }

  const onEachFeature = (
    f: Feature<Geometry, PrefectureProps>,
    layer: L.Layer
  ) => {
    const name = f.properties?.nam_ja
    const c = (name && counts[name as PrefectureName]) || 0
    layer.bindTooltip(
      `<div style="font-size:12px"><b>${name ?? ''}</b><br/>公演数: ${c}</div>`,
      { sticky: true }
    )
    if (onSelectPrefecture && name) {
      layer.on('click', () => onSelectPrefecture(name as PrefectureName))
    }
  }

  // 海外 (世界) レイヤー: 検出された国にマッチするものだけ色を掛ける。
  // ただし admin1 データを持つ国 (例: 台湾) は world 層では不透明にせず、admin1 層に譲る。
  const worldStyle = (f?: Feature<Geometry, CountryProps>) => {
    const name = f?.properties?.name
    const region = name ? COUNTRY_NAME_TO_OVERSEAS[name] : undefined
    const c = (region && overseasCounts?.[region]) || 0
    const isSelected = !!region && selectedOverseasRegion === region
    const hasAdmin1 = !!region && COUNTRIES_WITH_ADMIN1.has(region)
    if (!region || c <= 0 || hasAdmin1) {
      return {
        fillColor: '#ffffff',
        weight: 0.3,
        color: '#bbb',
        fillOpacity: 0,
      }
    }
    return {
      fillColor: getColor(c, max),
      weight: isSelected ? 2 : 0.6,
      color: isSelected ? '#1d4ed8' : '#666',
      fillOpacity: 0.85,
    }
  }

  const onEachWorldFeature = (
    f: Feature<Geometry, CountryProps>,
    layer: L.Layer
  ) => {
    const name = f.properties?.name
    const region = name ? COUNTRY_NAME_TO_OVERSEAS[name] : undefined
    if (!region) return
    if (COUNTRIES_WITH_ADMIN1.has(region)) return
    const c = overseasCounts?.[region] ?? 0
    if (c <= 0) return
    layer.bindTooltip(
      `<div style="font-size:12px"><b>${region}</b> (${name})<br/>公演数: ${c}</div>`,
      { sticky: true }
    )
    if (onSelectOverseas) {
      layer.on('click', () => onSelectOverseas(region))
    }
  }

  // 汎用 admin1 レイヤー: spec.getName で取り出した名前で overseasSubCounts を参照して着色
  const makeAdmin1Style =
    (spec: Admin1LayerSpec) => (f?: Feature<Geometry, Admin1Props>) => {
      const name = f?.properties ? spec.getName(f.properties) : undefined
      const c = (name && overseasSubCounts?.[name]) || 0
      const isSelected = !!name && selectedOverseasRegion === name
      return {
        fillColor: getColor(c, max),
        weight: isSelected ? 2 : 0.5,
        color: isSelected ? '#1d4ed8' : '#888',
        fillOpacity: c > 0 ? 0.85 : 0.5,
      }
    }

  const makeOnEachAdmin1 =
    (spec: Admin1LayerSpec) =>
    (f: Feature<Geometry, Admin1Props>, layer: L.Layer) => {
      const name = f.properties ? spec.getName(f.properties) : undefined
      if (!name) return
      const c = overseasSubCounts?.[name] ?? 0
      layer.bindTooltip(
        `<div style="font-size:12px"><b>${spec.region} ・ ${name}</b><br/>公演数: ${c}</div>`,
        { sticky: true }
      )
      if (onSelectOverseas) {
        layer.on('click', () => onSelectOverseas(name))
      }
    }

  return (
    <div
      className={`rounded-lg overflow-hidden border border-gray-200 relative ${
        heightClassName ?? 'h-[320px]'
      }`}
    >
      <MapContainer
        center={[37, 138]}
        zoom={4}
        minZoom={2}
        style={{ height: '100%', width: '100%', background: '#dbeafe' }}
        scrollWheelZoom={false}
        worldCopyJump={false}
        maxBounds={[[0, -180], [85, 180]]}
        maxBoundsViscosity={0.8}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          opacity={0.35}
          noWrap={true}
        />
        <MapPanner
          selectedPrefecture={selectedPrefecture}
          selectedOverseasRegion={selectedOverseasRegion}
          geoData={geoData}
          worldData={worldData}
          admin1Data={admin1Data}
          admin1Specs={ADMIN1_LAYERS}
        />
        {worldData && (
          <GeoJSON
            key={`world-${max}-${Object.keys(overseasCounts ?? {}).join(',')}-${selectedOverseasRegion ?? ''}`}
            data={worldData}
            style={worldStyle as any}
            onEachFeature={onEachWorldFeature as any}
          />
        )}
        {ADMIN1_LAYERS.map((spec) => {
          const fc = admin1Data[spec.region]
          if (!fc) return null
          return (
            <GeoJSON
              key={`admin1-${spec.region}-${max}-${Object.keys(overseasSubCounts ?? {}).join(',')}-${selectedOverseasRegion ?? ''}`}
              data={fc}
              style={makeAdmin1Style(spec) as any}
              onEachFeature={makeOnEachAdmin1(spec) as any}
            />
          )
        })}
        {geoData && (
          <GeoJSON
            key={`heatmap-${max}-${Object.keys(counts).length}-${selectedPrefecture ?? ''}`}
            data={geoData}
            style={style as any}
            onEachFeature={onEachFeature as any}
          />
        )}
        {venueMarkers.map((v) => (
          <Marker key={v.place} position={[v.lat, v.lng]} icon={venuePinIcon ?? undefined}>
            <Tooltip direction="top" offset={[0, -6]} opacity={1} sticky>
              <div className="text-[11px]">
                <div className="font-bold">{v.place}</div>
                <div>公演数: {v.count}</div>
              </div>
            </Tooltip>
          </Marker>
        ))}
      </MapContainer>
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 text-sm text-red-600">
          地図データを読み込めませんでした: {error}
        </div>
      )}
      {/* 凡例 */}
      <div className="absolute bottom-2 right-2 bg-white/90 rounded-md shadow px-3 py-2 text-[10px] leading-tight z-[400]">
        <div className="font-bold mb-1">公演数</div>
        <div className="flex items-center gap-1">
          {COLOR_SCALE.map((c, i) => (
            <span
              key={c}
              className="inline-block w-4 h-3 border border-gray-300"
              style={{ background: c }}
              title={i === 0 ? '0' : ''}
            />
          ))}
        </div>
        <div className="flex justify-between mt-0.5">
          <span>少</span>
          <span>多 ({max})</span>
        </div>
      </div>
    </div>
  )
}

export default LiveHeatmap
