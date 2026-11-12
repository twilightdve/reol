import React, { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export type RoutePoint = { id: string; name: string; lat: number; lng: number };

interface ShibuyaRouteMapProps {
  /** 歩いて回る順に並んだ場所。番号は並びの順(1から) */
  spots: RoutePoint[];
  /** 番号のピンが押された時(その場所の説明へ送る) */
  onPick: (id: string) => void;
}

// 番号つきのピン(global.scss の .route-pin)。一覧・見出しの番号と同じ数字を載せる
const numberIcon = (n: number) =>
  L.divIcon({
    className: "place-pin-wrap",
    html: `<span class="route-pin">${n}</span>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });

/**
 * 聖地巡礼ガイド 渋谷編の「歩いて回る」地図。
 * Leaflet はビルド時(Node)には動かないので、ページ側で import() して使う。
 * 線は順番の目安(直線)で、道順ではない。
 */
const ShibuyaRouteMap: React.FC<ShibuyaRouteMapProps> = ({ spots, onPick }) => {
  // 指で操作する端末では、1本指は画面のスクロールに使う。地図は2本指で動かす・広げる(PLACE の地図と同じ)
  const coarsePointer = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches,
    []
  );
  const positions = useMemo(() => spots.map((s) => [s.lat, s.lng] as [number, number]), [spots]);
  const bounds = useMemo(() => L.latLngBounds(positions), [positions]);
  const icons = useMemo(() => spots.map((_, i) => numberIcon(i + 1)), [spots]);

  return (
    <div className="place-map relative isolate h-full w-full">
      <MapContainer
        bounds={bounds}
        boundsOptions={{ padding: [32, 32] }}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
        dragging={!coarsePointer}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="relive-map-tiles-dark"
        />
        <Polyline
          positions={positions}
          interactive={false}
          // className は作る時にしか付かないので、pathOptions ではなく直に渡す
          className="route-line"
          pathOptions={{ weight: 2, dashArray: "2 7", lineCap: "round" }}
        />
        {spots.map((s, i) => (
          <Marker
            key={s.id}
            position={[s.lat, s.lng]}
            icon={icons[i]}
            title={`${i + 1}. ${s.name}`}
            alt={`${i + 1}. ${s.name}`}
            eventHandlers={{ click: () => onPick(s.id) }}
          />
        ))}
      </MapContainer>
      {coarsePointer && (
        <p className="pointer-events-none absolute bottom-6 left-2 z-[1000] rounded-md border border-bx-line bg-bx-bg px-2 py-1 text-xs leading-4 text-bx-ink3">
          地図は2本指で動かせます
        </p>
      )}
    </div>
  );
};

export default ShibuyaRouteMap;
