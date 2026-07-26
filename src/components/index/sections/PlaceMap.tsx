import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Place, PlaceItem } from "../../../types/places";
import { useTheme } from "../../../hooks/useTheme";

// Webpack 環境下の Leaflet デフォルトアイコンパスを修正
// https://github.com/PaulLeCam/react-leaflet/issues/453
// 動的 import で SSR を回避済みの前提
type IconDefault = L.Icon.Default & { _getIconUrl?: unknown };
delete (L.Icon.Default.prototype as IconDefault)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export type PlaceMarker = {
  place: Place;
  item: PlaceItem;
};

interface PlaceMapProps {
  markers: PlaceMarker[];
  heightClassName?: string;
}

// 全マーカーを内包するように地図をフィット
const FitBounds: React.FC<{ markers: PlaceMarker[]; map: L.Map | null }> = ({
  markers,
  map,
}) => {
  useEffect(() => {
    if (!map || markers.length === 0) return;
    const bounds = L.latLngBounds(
      markers.map((m) => [m.item.lat, m.item.lng] as [number, number])
    );
    map.fitBounds(bounds, { padding: [30, 30], maxZoom: 12 });
  }, [markers, map]);
  return null;
};

const PlaceMap: React.FC<PlaceMapProps> = ({ markers, heightClassName }) => {
  const [map, setMap] = React.useState<L.Map | null>(null);
  const { theme } = useTheme();

  // 中心: 日本のおおよそ中央
  const center: [number, number] = markers.length
    ? [markers[0].item.lat, markers[0].item.lng]
    : [36.2048, 138.2529];

  return (
    <div className={`rounded-lg overflow-hidden border border-bx-line ${heightClassName ?? "h-[420px]"}`}>
      <MapContainer
        center={center}
        zoom={5}
        style={{ height: "100%", width: "100%" }}
        ref={setMap}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url={`https://{s}.basemaps.cartocdn.com/${theme === "light" ? "light_all" : "dark_all"}/{z}/{x}/{y}{r}.png`}
        />
        <FitBounds markers={markers} map={map} />
        {markers.map((m) => (
          <Marker
            key={`pm-${m.place.placeUuid}-${m.item.placeItemUuid}`}
            position={[m.item.lat, m.item.lng]}
          >
            <Popup>
              <div className="text-xs leading-relaxed">
                <div className="font-bold mb-1">
                  {m.place.type ? `[${m.place.type}] ` : ""}
                  {m.place.title}
                </div>
                <div className="mb-1">{m.item.name}</div>
                {m.item.address && (
                  <div className="text-gray-500 mb-1">{m.item.address}</div>
                )}
                {m.item.mapsUrl && (
                  <a
                    href={m.item.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    Google Maps で開く
                  </a>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default PlaceMap;
