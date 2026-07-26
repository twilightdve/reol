import React, { useState, useCallback, useMemo, useEffect } from "react";
import { TbMapPinHeart } from "react-icons/tb";
import { GoLinkExternal, GoChevronUp, GoChevronDown } from "react-icons/go";
import { Badge } from "flowbite-react";
import YouTube from "react-youtube";
import LazyComponent from "../../modules/LazyComponent";
import UtilityService from "../../../services/UtilityService";
import { Place, PlaceItem } from "../../../types/places";
import type { PlaceMarker } from "./PlaceMap";
import LoadingSkeleton from "../../common/LoadingSkeleton";
import ErrorRetry from "../../common/ErrorRetry";
import EmptyState from "../../common/EmptyState";
import { useUrlQueryState } from "../../../hooks/useUrlQueryState";
import { trackFilterChange, trackEvent } from "../../../utils/analytics";
import { Kicker } from "../../redesign";

// Leaflet は SSR で動かないので動的読み込み
// React.lazy/Suspense はチャンク読み込み失敗時の再試行が難しいため、
// import() を手動で行い、失敗時は ErrorRetry から明示的に再試行できるようにする
type PlaceMapComponent = React.ComponentType<{
  markers: PlaceMarker[];
  heightClassName?: string;
}>;

interface PlaceSectionProps {
  places: Place[];
}

type TypeFilter = "ALL" | "MV" | "CM" | "TV" | "XFD" | "OTHER";
type ViewMode = "type" | "prefecture";

const TYPE_FILTERS: { key: TypeFilter; label: string }[] = [
  { key: "ALL", label: "ALL" },
  { key: "MV", label: "MV" },
  { key: "CM", label: "CM" },
  { key: "TV", label: "TV" },
  { key: "XFD", label: "XFD" },
  { key: "OTHER", label: "その他" },
];

const VIEW_MODES: { key: ViewMode; label: string }[] = [
  { key: "type", label: "タイプ別" },
  { key: "prefecture", label: "都道府県別" },
];

const getBadgeColor = (type: string) => {
  if (type === "MV") return "warning";
  if (type === "CM") return "purple";
  if (type === "TV") return "pink";
  if (type === "XFD") return "info";
  return "gray";
};

// 住所から都道府県名を抽出
const extractPrefecture = (address: string): string | null => {
  if (!address) return null;
  const stripped = address.replace(/^〒\s*\d{3}-?\d{4}\s*/, "");
  const m = stripped.match(/^(.+?[都道府県])/);
  return m ? m[1] : null;
};

// YouTube URL → サムネイル URL
const getYoutubeThumb = (url: string): string | null => {
  if (!url) return null;
  const m = url.match(/youtu\.be\/([\w-]+)/) || url.match(/v=([\w-]+)/);
  return m ? `https://i.ytimg.com/vi/${m[1]}/hqdefault.jpg` : null;
};

// スポットの静的地図サムネイル用。外部staticmap APIには依存せず、
// ヒートマップ等でも使っている公式OSMタイルサーバーから該当地点のタイルを1枚だけ取得する
// (Slippy map tilenamesの標準計算式)。ピン等は乗らないが軽量なプレビューとして十分。
const OSM_TILE_ZOOM = 15;
const latLngToTileUrl = (lat: number, lng: number): string => {
  const n = Math.pow(2, OSM_TILE_ZOOM);
  const x = Math.floor(((lng + 180) / 360) * n);
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n
  );
  return `https://tile.openstreetmap.org/${OSM_TILE_ZOOM}/${x}/${y}.png`;
};

// 都道府県の並び順（北から南へ）
const PREFECTURE_ORDER = [
  "北海道","青森県","岩手県","宮城県","秋田県","山形県","福島県",
  "茨城県","栃木県","群馬県","埼玉県","千葉県","東京都","神奈川県",
  "新潟県","富山県","石川県","福井県","山梨県","長野県",
  "岐阜県","静岡県","愛知県","三重県",
  "滋賀県","京都府","大阪府","兵庫県","奈良県","和歌山県",
  "鳥取県","島根県","岡山県","広島県","山口県",
  "徳島県","香川県","愛媛県","高知県",
  "福岡県","佐賀県","長崎県","熊本県","大分県","宮崎県","鹿児島県","沖縄県",
];

// iOS フォーカス時の自動ズーム抑制（フォントサイズを 16px に固定）
const NO_ZOOM_STYLE: React.CSSProperties = { fontSize: 16 };

const TYPE_KEYS = ["ALL", "MV", "CM", "TV", "XFD", "OTHER"] as const;
const VIEW_KEYS = ["type", "prefecture"] as const;

const PlaceSection: React.FC<PlaceSectionProps> = ({ places }) => {
  const [expandedPlaceIds, setExpandedPlaceIds] = useState<Set<string>>(
    new Set()
  );
  // URLクエリと同期: ?type=MV&view=prefecture&q=武道館
  const [typeFilter, setTypeFilterRaw] = useUrlQueryState<TypeFilter>(
    "type",
    "ALL",
    TYPE_KEYS
  );
  const [viewMode, setViewModeRaw] = useUrlQueryState<ViewMode>(
    "view",
    "type",
    VIEW_KEYS
  );
  // 検索クエリは任意文字列
  const [query, setQueryRaw] = useUrlQueryState<string>("q", "");

  const setTypeFilter = useCallback(
    (v: TypeFilter) => {
      setTypeFilterRaw(v);
      trackFilterChange("place", "type", v);
    },
    [setTypeFilterRaw]
  );
  const setViewMode = useCallback(
    (v: ViewMode) => {
      setViewModeRaw(v);
      trackFilterChange("place", "view", v);
    },
    [setViewModeRaw]
  );
  const setQuery = useCallback(
    (v: string) => {
      setQueryRaw(v);
    },
    [setQueryRaw]
  );

  const clearFilters = useCallback(() => {
    setTypeFilter("ALL");
    setQuery("");
  }, [setTypeFilter, setQuery]);

  // スクロール下方向で sticky バーをコンパクト化
  const [compactBar, setCompactBar] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    let lastY = window.scrollY;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const dy = y - lastY;
        if (y < 80) setCompactBar(false);
        else if (dy > 6) setCompactBar(true);
        else if (dy < -6) setCompactBar(false);
        lastY = y;
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // マップコンポーネントの動的読み込み（失敗時は ErrorRetry から再試行できるよう手動管理）
  const [MapComponent, setMapComponent] = useState<PlaceMapComponent | null>(null);
  const [mapLoadError, setMapLoadError] = useState(false);
  const [mapLoadAttempt, setMapLoadAttempt] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;
    setMapLoadError(false);
    import("./PlaceMap")
      .then((mod) => {
        if (!cancelled) setMapComponent(() => mod.default);
      })
      .catch(() => {
        if (!cancelled) {
          setMapLoadError(true);
          trackEvent("data_load_error", { category: "data", label: "place_map" });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [mapLoadAttempt]);

  const retryMapLoad = useCallback(() => {
    setMapLoadAttempt((v) => v + 1);
  }, []);

  const toggleExpand = useCallback((placeUuid: string) => {
    setExpandedPlaceIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(placeUuid)) {
        newSet.delete(placeUuid);
      } else {
        newSet.add(placeUuid);
      }
      return newSet;
    });
  }, []);

  const matchTypeAndQuery = useCallback(
    (place: Place) => {
      if (typeFilter !== "ALL") {
        if (typeFilter === "OTHER") {
          if (
            place.type === "MV" ||
            place.type === "CM" ||
            place.type === "TV" ||
            place.type === "XFD"
          )
            return false;
        } else if (place.type !== typeFilter) {
          return false;
        }
      }
      const q = query.trim().toLowerCase();
      if (q) {
        const hay = [
          place.title,
          ...(place.items ?? []).flatMap((it) => [it.name, it.address, it.memo]),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    },
    [typeFilter, query]
  );

  const filteredPlaces = useMemo(
    () => places.filter(matchTypeAndQuery),
    [places, matchTypeAndQuery]
  );

  // 都道府県別グルーピング: 各 item を都道府県ごとに集める
  const prefectureGroups = useMemo(() => {
    const groups = new Map<
      string,
      { place: Place; item: PlaceItem }[]
    >();
    for (const place of filteredPlaces) {
      for (const item of place.items ?? []) {
        const pref = extractPrefecture(item.address) ?? "その他";
        if (!groups.has(pref)) groups.set(pref, []);
        groups.get(pref)!.push({ place, item });
      }
    }
    // 並び順: 北→南、未収録は末尾
    const sorted = Array.from(groups.entries()).sort(([a], [b]) => {
      const ai = PREFECTURE_ORDER.indexOf(a);
      const bi = PREFECTURE_ORDER.indexOf(b);
      if (ai === -1 && bi === -1) return a.localeCompare(b);
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });
    return sorted;
  }, [filteredPlaces]);

  // マップ用マーカー（フィルタ適用後の全アイテム）
  const markers = useMemo(
    () =>
      filteredPlaces.flatMap((place) =>
        (place.items ?? [])
          .filter((it) => typeof it.lat === "number" && typeof it.lng === "number")
          .map((item) => ({ place, item }))
      ),
    [filteredPlaces]
  );

  // 都道府県別ビューの 1 アイテム
  const renderPrefectureItem = (place: Place, item: PlaceItem) => (
    <li
      key={`pref-item-${place.placeUuid}-${item.placeItemUuid}`}
      className="bg-white/5 rounded-md border border-bx-line p-3"
    >
      <div className="flex items-center gap-2 mb-1 flex-wrap">
        {place.type && (
          <Badge color={getBadgeColor(place.type)} className="flex-shrink-0">
            {place.type}
          </Badge>
        )}
        <span className="text-xs text-bx-ink2">{place.title}</span>
      </div>
      <div className="flex items-start justify-between gap-2">
        {item.placeUrl ? (
          <a
            href={item.placeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-bold tracking-wide text-bx-ink hover:text-bx-blue hover:underline inline-flex items-center min-h-[44px]"
          >
            {item.name}
            <GoLinkExternal className="ml-1 text-xs" aria-hidden="true" />
          </a>
        ) : (
          <span className="text-sm font-bold tracking-wide text-bx-ink">{item.name}</span>
        )}
        <div className="flex gap-1 flex-shrink-0">
          {item.needsCost && (
            <span className="px-1.5 py-0.5 text-[10px] rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
              要費用
            </span>
          )}
          {item.needsPermission && (
            <span className="px-1.5 py-0.5 text-[10px] rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
              要許可
            </span>
          )}
        </div>
      </div>
      {item.address && (
        <p className="text-xs text-bx-ink2 mt-1">{item.address}</p>
      )}
      {item.mapsUrl && (
        <a
          href={item.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center mt-1 text-xs text-bx-blue hover:underline min-h-[36px]"
        >
          Google Maps で開く
          <GoLinkExternal className="ml-1" aria-hidden="true" />
        </a>
      )}
    </li>
  );

  return (
    <section id="PLACE" style={{ contentVisibility: "auto" }} className="bg-white/5 border border-bx-line rounded-xl mx-2 sm:mx-4 my-4 sm:my-6 p-2 sm:p-3">
      <div className="pt-6 pb-2 px-2 sm:pt-12">
        <Kicker color="text-bx-blue" className="mb-1">PLACE</Kicker>
        <h2 className="flex items-center font-bold text-lg text-bx-ink">
          <TbMapPinHeart className="text-lg mr-2" />
          <span>聖地</span>
        </h2>
        <div className="pt-2 text-xs sm:text-base break-words leading-relaxed tracking-widest text-bx-ink2">
          PLACEではReolが過去にMV撮影やTV番組の収録等で訪れたことのあるいわゆる「聖地」の情報を掲載しております。
          <br />
          聖地巡礼の参考情報としてご覧ください（掲載されていない情報があればぜひ教えていただけますと幸いです）。
        </div>
      </div>

      {/* マップ: 見出し直下に横長で常時表示 */}
      <div className="px-2 pb-3" aria-label="聖地マップ">
        {typeof window === "undefined" ? null : markers.length === 0 ? (
          <EmptyState
            icon="📍"
            title="表示できるマーカーがありません"
            description="タイプ・検索条件をクリアしてもう一度お試しください。"
            actionLabel="条件をクリア"
            onAction={clearFilters}
            tone="dark"
          />
        ) : mapLoadError ? (
          <ErrorRetry
            title="マップの読み込みに失敗しました"
            description="通信状況をご確認のうえ、再試行してください。"
            onRetry={retryMapLoad}
            tone="dark"
          />
        ) : !MapComponent ? (
          <LoadingSkeleton
            rows={1}
            rowHeightClassName="h-48 sm:h-56"
            gapClassName=""
            rowClassName="border border-bx-line bg-white/5"
            label="マップを読み込み中..."
          />
        ) : (
          <div className="rounded-lg overflow-hidden">
            <MapComponent markers={markers} heightClassName="h-48 sm:h-56" />
          </div>
        )}
        <p className="mt-1 text-[10px] text-bx-ink3 text-right">
          © OpenStreetMap contributors
        </p>
      </div>

      {/* 絞り込みバー（sticky / 下方向スクロールでコンパクト化） */}
      <div
        role="region"
        aria-label="聖地の絞り込み"
        className="sticky top-0 z-30 -mx-2 px-2 py-2 bg-bx-bg/90 backdrop-blur border-b border-bx-line space-y-2 transition-[padding] duration-200 motion-reduce:transition-none"
      >
        {/* 1行目: ビューモード（コンパクト時は隠す） */}
        {!compactBar && (
          <div className="flex flex-wrap gap-1" role="radiogroup" aria-label="表示モード">
            {VIEW_MODES.map((m) => {
              const active = viewMode === m.key;
              return (
                <button
                  key={m.key}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setViewMode(m.key)}
                  className={`min-h-[44px] px-4 py-2 text-xs rounded-full border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-bx-yellow focus-visible:ring-offset-1 ${
                    active
                      ? "bg-bx-blue text-bx-bg border-bx-blue"
                      : "bg-white/5 text-bx-ink border-bx-line hover:border-bx-blue"
                  }`}
                >
                  {m.label}
                </button>
              );
            })}
          </div>
        )}

        {/* 2行目: タイプフィルタ（常に表示） */}
        <div className="flex flex-wrap gap-1" role="radiogroup" aria-label="タイプで絞り込み">
          {TYPE_FILTERS.map((f) => {
            const active = typeFilter === f.key;
            return (
              <button
                key={f.key}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setTypeFilter(f.key)}
                className={`min-h-[44px] px-4 py-2 text-xs rounded-full border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-bx-yellow focus-visible:ring-offset-1 ${
                  active
                    ? "bg-bx-yellow text-bx-bg border-bx-yellow"
                    : "bg-white/5 text-bx-ink border-bx-line hover:border-bx-blue"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* 3行目: 検索入力（コンパクト時は隠す） */}
        {!compactBar && (
          <label className="block">
            <span className="sr-only">聖地を検索</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="例: 武道館 / 東京 / 第六感"
              style={NO_ZOOM_STYLE}
              className="block w-full min-h-[44px] px-3 py-2 bg-white/5 border border-bx-line text-bx-ink rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-bx-yellow focus-visible:ring-offset-1"
            />
          </label>
        )}

        <div className="flex items-center justify-between text-[11px] text-bx-ink2">
          <span>
            {filteredPlaces.length} / {places.length} 件
          </span>
          {(typeFilter !== "ALL" || query.length > 0) && (
            <button
              type="button"
              onClick={clearFilters}
              className="min-h-[32px] px-3 py-1 rounded-full text-[11px] border border-bx-line bg-white/5 hover:border-bx-blue transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-bx-yellow"
            >
              条件をクリア
            </button>
          )}
        </div>
      </div>

      <div className="space-y-8 px-2">
        <div className="pt-2">
          {/* ===== タイプ別ビュー（既存） ===== */}
          {viewMode === "type" && (
            <div className="space-y-2">
              {filteredPlaces.length === 0 ? (
                <EmptyState
                  title="該当する聖地が見つかりませんでした"
                  description="タイプを ALL にしたり、検索キーワードを短くしてみてください。"
                  actionLabel="条件をクリア"
                  onAction={clearFilters}
                  tone="dark"
                />
              ) : (
                filteredPlaces.map((place) => {
                  const isExpanded = expandedPlaceIds.has(place.placeUuid);
                  const itemCount = place.items?.length ?? 0;
                  const prefectures = Array.from(
                    new Set(
                      (place.items ?? [])
                        .map((it) => extractPrefecture(it.address))
                        .filter((p): p is string => !!p)
                    )
                  );
                  const thumb = getYoutubeThumb(place.url);

                  return (
                    <div
                      key={`place-${place.placeUuid}`}
                      id={`place-${place.slug}`}
                      className="mb-2 scroll-mt-24"
                    >
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => toggleExpand(place.placeUuid)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            toggleExpand(place.placeUuid);
                          }
                        }}
                        aria-expanded={isExpanded}
                        aria-controls={`place-panel-${place.slug}`}
                        className={`relative w-full text-left cursor-pointer rounded-lg transition-colors motion-reduce:transition-none overflow-hidden text-bx-ink bg-white/5 border border-bx-line hover:border-bx-blue focus:outline-none focus-visible:ring-2 focus-visible:ring-bx-yellow focus-visible:ring-offset-2`}
                      >
                        {!isExpanded && (
                          <div className="min-h-[64px] p-3 flex items-center gap-3">
                            {thumb ? (
                              <img
                                src={thumb}
                                alt=""
                                loading="lazy"
                                className="w-16 h-12 sm:w-20 sm:h-14 object-cover rounded flex-shrink-0 bg-white/5"
                              />
                            ) : (
                              <div className="w-16 h-12 sm:w-20 sm:h-14 rounded flex-shrink-0 bg-white/5 flex items-center justify-center text-bx-ink3">
                                <TbMapPinHeart className="text-xl" aria-hidden="true" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                {place.type && (
                                  <Badge color={getBadgeColor(place.type)} className="flex-shrink-0">
                                    {place.type}
                                  </Badge>
                                )}
                                <span className="text-sm font-medium tracking-wide truncate">
                                  {place.title}
                                </span>
                              </div>
                              <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 text-[11px] text-bx-ink2">
                                <span>{itemCount} スポット</span>
                                {prefectures.length > 0 && (
                                  <span className="truncate">
                                    {prefectures.slice(0, 3).join("・")}
                                    {prefectures.length > 3 ? ` 他${prefectures.length - 3}` : ""}
                                  </span>
                                )}
                              </div>
                            </div>
                            <GoChevronDown className="flex-shrink-0 ml-1 text-bx-ink3" aria-hidden="true" />
                          </div>
                        )}

                        {isExpanded && (
                          <div id={`place-panel-${place.slug}`} className="p-4">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                {place.type && (
                                  <Badge color={getBadgeColor(place.type)} className="flex-shrink-0">
                                    {place.type}
                                  </Badge>
                                )}
                                <span className="text-base font-bold tracking-wide">
                                  {place.title}
                                </span>
                                <span className="text-[11px] text-bx-ink2 flex-shrink-0">
                                  {itemCount} スポット
                                </span>
                              </div>
                              <GoChevronUp className="flex-shrink-0 ml-2 text-bx-ink3" aria-hidden="true" />
                            </div>

                            {place.url && place.url.indexOf("youtu.be") !== -1 && (
                              <div className="mb-4" onClick={(e) => e.stopPropagation()}>
                                <LazyComponent>
                                  <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                                    <YouTube
                                      videoId={place.url.replace("https://youtu.be/", "")}
                                      opts={{
                                        playerVars: {
                                          autoplay: 0,
                                          enablejsapi: 1,
                                          playsinline: 1,
                                          loop: 1,
                                          rel: 0,
                                          color: "white",
                                        },
                                      }}
                                      className="absolute top-0 left-0 w-full h-full"
                                      iframeClassName="w-full h-full rounded"
                                    />
                                  </div>
                                </LazyComponent>
                              </div>
                            )}

                            {place.items?.map((item, itemIdx) => (
                              <div
                                key={`place-${place.placeUuid}-${item.placeItemUuid}`}
                                className="mb-3 last:mb-0 bg-white/5 border border-bx-line rounded-lg p-4"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  {item.placeUrl ? (
                                    <a
                                      href={item.placeUrl}
                                      className="block min-h-[44px]"
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      <h3 className="flex items-center text-sm font-bold tracking-wide hover:underline">
                                        {itemIdx + 1}.&nbsp;{item.name}
                                        <GoLinkExternal className="ml-1 text-xs" aria-hidden="true" />
                                      </h3>
                                    </a>
                                  ) : (
                                    <h3 className="text-sm font-bold tracking-wide">
                                      {itemIdx + 1}.&nbsp;{item.name}
                                    </h3>
                                  )}
                                  <div className="flex flex-wrap gap-1 flex-shrink-0">
                                    {item.needsCost && (
                                      <span className="px-1.5 py-0.5 text-[10px] rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                        要費用
                                      </span>
                                    )}
                                    {item.needsPermission && (
                                      <span className="px-1.5 py-0.5 text-[10px] rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
                                        要許可
                                      </span>
                                    )}
                                  </div>
                                </div>
                                {item.memo && (
                                  <p
                                    className="text-sm mb-2"
                                    dangerouslySetInnerHTML={{
                                      __html: UtilityService.sanitizeHTMLWithAllowedTags(item.memo),
                                    }}
                                  />
                                )}
                                <a
                                  href={item.mapsUrl || item.mapsEmbedUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="group/map relative block w-full h-32 rounded mb-2 overflow-hidden bg-white/5 border border-bx-line"
                                >
                                  {item.lat && item.lng ? (
                                    <img
                                      src={latLngToTileUrl(item.lat, item.lng)}
                                      alt=""
                                      loading="lazy"
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-bx-ink3 text-xs">
                                      地図データなし
                                    </div>
                                  )}
                                  <span className="absolute bottom-1 right-1 px-2 py-1 text-[11px] font-bold rounded bg-bx-bg/90 text-bx-yellow border border-bx-line group-hover/map:bg-bx-yellow group-hover/map:text-bx-bg transition-colors">
                                    地図で開く ↗
                                  </span>
                                </a>
                                <p className="text-xs text-bx-ink2">{item.address}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* ===== 都道府県別ビュー ===== */}
          {viewMode === "prefecture" && (
            <div className="space-y-4">
              {prefectureGroups.length === 0 ? (
                <EmptyState
                  title="該当する聖地が見つかりませんでした"
                  description="タイプを ALL にしたり、検索キーワードを短くしてみてください。"
                  actionLabel="条件をクリア"
                  onAction={clearFilters}
                  tone="dark"
                />
              ) : (
                prefectureGroups.map(([pref, list]) => (
                  <div key={`pref-${pref}`} className="space-y-2">
                    <h3 className="sticky top-[136px] z-10 bg-bx-blue text-bx-bg px-3 py-1 rounded-md font-bold text-sm tracking-wider">
                      {pref}{" "}
                      <span className="text-xs font-normal opacity-80">
                        ({list.length})
                      </span>
                    </h3>
                    <ul className="space-y-2">
                      {list.map(({ place, item }) => renderPrefectureItem(place, item))}
                    </ul>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <p className="text-xs py-2 text-bx-ink3">
          ※ここに載っていない聖地情報いつでもお待ちしております
        </p>
      </div>
    </section>
  );
};

export default PlaceSection;
