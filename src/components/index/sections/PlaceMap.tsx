import React, { useCallback, useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { GoLinkExternal } from "react-icons/go";
import { TbFocusCentered, TbList, TbX } from "react-icons/tb";
import { Place, PlaceItem } from "../../../types/places";
import { usePageDict } from "../../../i18n/site/SiteLangContext";
import { placeDict } from "../../../i18n/site/pages/place";

export type PlaceMarker = {
  /** 一覧と地図で同じスポットを指すためのキー(作品とスポットの組) */
  key: string;
  place: Place;
  item: PlaceItem;
};

interface PlaceMapProps {
  markers: PlaceMarker[];
  heightClassName?: string;
  /** 選んでいるスポット(一覧の「地図で見る」か、ピンを押して決まる) */
  selectedKey: string | null;
  onSelect: (key: string | null) => void;
  /** 一覧の「地図で見る」が押されるたびに増える。増えたら選んでいるスポットへ地図を寄せる */
  focusNonce: number;
  /** 「一覧で見る」 */
  onShowInList: (marker: PlaceMarker) => void;
  /** 巡礼済みの作品(Place 単位)。ピンの色を変える */
  visitedPlaceIds: ReadonlySet<string>;
}

// ピンはサイトの色の丸(global.scss の .place-pin)。Leaflet 既定の画像ピンは使わない
const pinIcon = (visited: boolean, selected: boolean) =>
  L.divIcon({
    className: "place-pin-wrap",
    html: `<span class="place-pin${visited ? " place-pin--visited" : ""}${
      selected ? " place-pin--selected" : ""
    }"></span>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

const PIN_ICONS = {
  normal: pinIcon(false, false),
  visited: pinIcon(true, false),
  selected: pinIcon(false, true),
  visitedSelected: pinIcon(true, true),
};

const FOCUS_ZOOM = 15;

const PlaceMap: React.FC<PlaceMapProps> = ({
  markers,
  heightClassName,
  selectedKey,
  onSelect,
  focusNonce,
  onShowInList,
  visitedPlaceIds,
}) => {
  const t = usePageDict(placeDict);
  const [map, setMap] = useState<L.Map | null>(null);

  // 指で操作する端末では、1本指は画面のスクロールに使う(地図の上で指が止まって下へ進めなくなるのを防ぐ)。
  // 地図は2本指で動かす・広げる
  const coarsePointer = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches,
    []
  );

  // 中心: 日本のおおよそ中央
  const center: [number, number] = markers.length
    ? [markers[0].item.lat, markers[0].item.lng]
    : [36.2048, 138.2529];

  // 全マーカーを内包するように地図をフィット(絞り込みが変わるたび)
  const fitAll = useCallback(() => {
    if (!map || markers.length === 0) return;
    const bounds = L.latLngBounds(
      markers.map((m) => [m.item.lat, m.item.lng] as [number, number])
    );
    map.fitBounds(bounds, { padding: [30, 30], maxZoom: 12 });
  }, [map, markers]);

  useEffect(() => {
    fitAll();
  }, [fitAll]);

  const selected = useMemo(
    () => markers.find((m) => m.key === selectedKey) ?? null,
    [markers, selectedKey]
  );

  // 一覧から選ばれた時は、そのスポットへ寄せる
  useEffect(() => {
    if (!map || !selected || focusNonce === 0) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const zoom = Math.max(map.getZoom(), FOCUS_ZOOM);
    // 狭い画面では下にスポットのカードが重なるので、ピンが上寄りに来るよう中心を下へずらす
    const offsetY = window.innerWidth < 640 ? Math.round(map.getSize().y * 0.18) : 0;
    const target = map.unproject(
      map.project([selected.item.lat, selected.item.lng], zoom).add([0, offsetY]),
      zoom
    );
    map.flyTo(target, zoom, {
      animate: !reduceMotion,
      duration: 0.8,
    });
    // focusNonce が増えた時だけ動かす(ピンを押して選んだ時は地図を動かさない)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, focusNonce]);

  // ピンを押して選んだ時。狭い画面では、下に出るカードにピンが隠れない位置まで地図を送る
  const selectFromPin = useCallback(
    (m: PlaceMarker) => {
      onSelect(m.key);
      if (!map || window.innerWidth >= 640) return;
      const height = map.getSize().y;
      const y = map.latLngToContainerPoint([m.item.lat, m.item.lng]).y;
      if (y <= height * 0.4) return;
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      map.panBy([0, Math.round(y - height * 0.32)], { animate: !reduceMotion });
    },
    [map, onSelect]
  );

  // 地図の何もない所を押したら選択を外す
  useEffect(() => {
    if (!map) return;
    const clear = () => onSelect(null);
    map.on("click", clear);
    return () => {
      map.off("click", clear);
    };
  }, [map, onSelect]);

  const resetView = useCallback(() => {
    onSelect(null);
    fitAll();
  }, [onSelect, fitAll]);

  const controlButtonCls =
    "inline-flex items-center gap-1 min-h-[36px] rounded-lg border border-bx-line bg-bx-bg/90 px-2.5 text-[11px] font-bold text-bx-ink backdrop-blur transition-colors hover:border-bx-blue hover:text-bx-blue focus:outline-none focus-visible:ring-2 focus-visible:ring-bx-yellow";

  return (
    <div
      className={`place-map relative isolate overflow-hidden rounded-xl border border-bx-line ${
        heightClassName ?? "h-[420px]"
      }`}
    >
      <MapContainer
        center={center}
        zoom={5}
        style={{ height: "100%", width: "100%" }}
        ref={setMap}
        scrollWheelZoom={false}
        dragging={!coarsePointer}
      >
        {/* CARTO のベースマップは API キー必須になり「API KEY REQUIRED」の画像しか返らなくなったため、
            開催地マップと同じ OpenStreetMap のタイルにする。ダークテーマでは同じ CSS フィルタで暗くする */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="relive-map-tiles-dark"
        />
        {markers.map((m) => {
          const isSelected = m.key === selectedKey;
          const isVisited = visitedPlaceIds.has(m.place.placeUuid);
          const icon = isSelected
            ? isVisited
              ? PIN_ICONS.visitedSelected
              : PIN_ICONS.selected
            : isVisited
              ? PIN_ICONS.visited
              : PIN_ICONS.normal;
          return (
            <Marker
              key={`pm-${m.key}`}
              position={[m.item.lat, m.item.lng]}
              icon={icon}
              title={m.item.name}
              alt={m.item.name}
              zIndexOffset={isSelected ? 1000 : 0}
              eventHandlers={{ click: () => selectFromPin(m) }}
            />
          );
        })}
      </MapContainer>

      <button
        type="button"
        onClick={resetView}
        className={`absolute right-2 top-2 z-[1000] ${controlButtonCls}`}
      >
        <TbFocusCentered className="text-sm" aria-hidden="true" />
        {t.resetMap}
      </button>

      {/* 選んだスポット。地図の下の端に重ねる(Leaflet の吹き出しは使わない) */}
      {selected && (
        <div
          role="region"
          aria-label={t.selectedSpotAria}
          className="absolute inset-x-2 bottom-6 z-[1000] rounded-xl border border-bx-line bg-bx-bg/95 p-3 shadow-lg backdrop-blur sm:left-auto sm:w-[340px]"
        >
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] text-bx-ink3">
                {selected.place.type ? `${selected.place.type}・` : ""}
                {selected.place.title}
              </p>
              <p className="mt-0.5 text-sm font-bold leading-snug text-bx-ink">
                {selected.item.name}
              </p>
              {selected.item.address && (
                <p className="mt-0.5 text-[11px] leading-snug text-bx-ink3">
                  {selected.item.address}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => onSelect(null)}
              aria-label={t.close}
              className="-mr-1 -mt-1 inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-bx-ink3 transition-colors hover:text-bx-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-bx-yellow"
            >
              <TbX aria-hidden="true" />
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => onShowInList(selected)}
              className="inline-flex min-h-[36px] items-center gap-1 rounded-full bg-bx-yellow px-3 text-xs font-bold text-bx-bg transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-bx-yellow focus-visible:ring-offset-2 focus-visible:ring-offset-bx-bg"
            >
              <TbList aria-hidden="true" />
              {t.showInList}
            </button>
            {(selected.item.mapsUrl || selected.item.mapsEmbedUrl) && (
              <a
                href={selected.item.mapsUrl || selected.item.mapsEmbedUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t.openInGoogleMaps}
                className="inline-flex min-h-[36px] items-center gap-1 rounded-full border border-bx-line px-3 text-xs font-bold text-bx-ink transition-colors hover:border-bx-blue hover:text-bx-blue focus:outline-none focus-visible:ring-2 focus-visible:ring-bx-yellow"
              >
                Google Maps
                <GoLinkExternal className="text-[10px]" aria-hidden="true" />
              </a>
            )}
          </div>
        </div>
      )}

      {coarsePointer && !selected && (
        <p className="pointer-events-none absolute bottom-6 left-2 z-[1000] rounded-full border border-bx-line bg-bx-bg/85 px-2.5 py-1 text-[10px] text-bx-ink3 backdrop-blur">
          {t.twoFingerHint}
        </p>
      )}
    </div>
  );
};

export default PlaceMap;
