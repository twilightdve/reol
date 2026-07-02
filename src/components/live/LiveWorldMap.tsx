import React, { useEffect, useMemo, useState } from 'react'
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { feature } from 'topojson-client'
import type { Topology, GeometryObject } from 'topojson-specification'
import type { Feature, FeatureCollection, Geometry } from 'geojson'

export type OverseasCountMap = Record<string, number>

interface LiveWorldMapProps {
  /** 海外地域名 → 公演数 */
  counts: OverseasCountMap
  heightClassName?: string
  selectedRegion?: string | null
  onSelectRegion?: (region: string) => void
}

// 海外地域名 → ISO 3166-1 numeric country id (world-atlas 110m に合わせて文字列)
// 110m データには香港が含まれていないため、視覚上は中国の一部として描画される。
const REGION_TO_ISO: Record<string, string[]> = {
  台湾: ['158'],
  韓国: ['410'],
  中国: ['156'],
  アメリカ: ['840'],
  香港: ['344'],
}

const ISO_TO_REGION: Record<string, string> = (() => {
  const m: Record<string, string> = {}
  for (const [region, ids] of Object.entries(REGION_TO_ISO)) {
    for (const id of ids) m[id] = region
  }
  return m
})()

const COLOR_SCALE = [
  '#f5f5fa',
  '#cfe3f7',
  '#9bc7ee',
  '#5fa4dd',
  '#2a78c2',
  '#194a80',
]

function getColor(count: number, max: number): string {
  if (!count) return COLOR_SCALE[0]
  if (max <= 0) return COLOR_SCALE[0]
  const ratio = Math.log(count + 1) / Math.log(max + 1)
  const idx = Math.min(
    COLOR_SCALE.length - 1,
    Math.max(1, Math.round(ratio * (COLOR_SCALE.length - 1)))
  )
  return COLOR_SCALE[idx]
}

interface CountryProps {
  name?: string
}

const LiveWorldMap: React.FC<LiveWorldMapProps> = ({
  counts,
  heightClassName,
  selectedRegion,
  onSelectRegion,
}) => {
  const [geoData, setGeoData] = useState<FeatureCollection<
    Geometry,
    CountryProps
  > | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch('/data/world-countries-110m.topojson')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((topo: Topology) => {
        if (cancelled) return
        const obj = (topo.objects as any).countries ?? topo.objects[Object.keys(topo.objects)[0]]
        const fc = feature(
          topo,
          obj as GeometryObject
        ) as unknown as FeatureCollection<Geometry, CountryProps>
        setGeoData(fc)
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(String(e))
      })
    return () => {
      cancelled = true
    }
  }, [])

  const max = useMemo(
    () => Math.max(0, ...Object.values(counts)),
    [counts]
  )

  const style = (f?: Feature<Geometry, CountryProps>) => {
    const iso = f?.id != null ? String(f.id) : ''
    const region = ISO_TO_REGION[iso]
    const c = region ? counts[region] ?? 0 : 0
    const isSelected = !!region && selectedRegion === region
    return {
      fillColor: getColor(c, max),
      weight: isSelected ? 2 : 0.4,
      color: isSelected ? '#1d4ed8' : '#888',
      fillOpacity: c > 0 ? 0.85 : 0.35,
    }
  }

  const onEachFeature = (
    f: Feature<Geometry, CountryProps>,
    layer: L.Layer
  ) => {
    const iso = f.id != null ? String(f.id) : ''
    const region = ISO_TO_REGION[iso]
    const c = region ? counts[region] ?? 0 : 0
    const label = region ?? f.properties?.name ?? ''
    layer.bindTooltip(
      `<div style="font-size:12px"><b>${label}</b>${
        region ? `<br/>公演数: ${c}` : ''
      }</div>`,
      { sticky: true }
    )
    if (onSelectRegion && region) {
      layer.on('click', () => onSelectRegion(region))
    }
  }

  return (
    <div
      className={`rounded-lg overflow-hidden border border-gray-200 relative ${
        heightClassName ?? 'h-[420px]'
      }`}
    >
      <MapContainer
        center={[25, 130]}
        zoom={3}
        style={{ height: '100%', width: '100%', background: '#dbeafe' }}
        scrollWheelZoom={false}
        worldCopyJump
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          opacity={0.3}
        />
        {geoData && (
          <GeoJSON
            key={`worldmap-${max}-${Object.keys(counts).length}-${selectedRegion ?? ''}`}
            data={geoData}
            style={style as any}
            onEachFeature={onEachFeature as any}
          />
        )}
      </MapContainer>
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 text-sm text-red-600">
          地図データを読み込めませんでした: {error}
        </div>
      )}
      <div className="absolute bottom-2 right-2 bg-white/90 rounded-md shadow px-3 py-2 text-[10px] leading-tight z-[400]">
        <div className="font-bold mb-1">海外公演数</div>
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

export default LiveWorldMap
