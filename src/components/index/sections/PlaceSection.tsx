import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import {
  TbArrowRight,
  TbCheck,
  TbMapPinHeart,
  TbMapPin,
  TbMapPinOff,
  TbRoute,
  TbSearch,
  TbSearchOff,
} from "react-icons/tb";
import { GoLinkExternal, GoChevronDown } from "react-icons/go";
import PlayerSlot from "../../player/PlayerSlot";
import MapEmbed from "../../common/MapEmbed";
import UtilityService from "../../../services/UtilityService";
import { Place, PlaceItem } from "../../../types/places";
import type { PlaceMarker } from "./PlaceMap";
import ErrorRetry from "../../common/ErrorRetry";
import EmptyState from "../../common/EmptyState";
import { useUrlQueryState } from "../../../hooks/useUrlQueryState";
import { trackFilterChange, trackEvent } from "../../../utils/analytics";
import { Kicker, StatCounter } from "../../redesign";
import { useCollectionOwned } from "../../../hooks/useCollectionOwned";
import { LangLink, usePageDict } from "../../../i18n/site/SiteLangContext";
import { placeDict } from "../../../i18n/site/pages/place";
import { checkCircleClass } from "../../collection/checkCircle";
import { SHIBUYA_GUIDE, guidePath } from "../../../utils/songArticles/guides";

// Leaflet はビルド時(Node)には動かないので、ブラウザで動的に読み込む
// React.lazy/Suspense はチャンク読み込み失敗時の再試行が難しいため、
// import() を手動で行い、失敗時は ErrorRetry から明示的に再試行できるようにする
type PlaceMapComponent = React.ComponentType<{
  markers: PlaceMarker[];
  heightClassName?: string;
  selectedKey: string | null;
  onSelect: (key: string | null) => void;
  focusNonce: number;
  onShowInList: (marker: PlaceMarker) => void;
  visitedPlaceIds: ReadonlySet<string>;
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

const VIEW_MODES: ViewMode[] = ["type", "prefecture"];

const NAMED_TYPES = ["MV", "CM", "TV", "XFD"];

const matchesType = (place: Place, filter: TypeFilter): boolean => {
  if (filter === "ALL") return true;
  if (filter === "OTHER") return !NAMED_TYPES.includes(place.type);
  return place.type === filter;
};

// 小さな札(作品の種類・要費用など)。色は付けない。黄は「選んでいるもの」、青は「巡礼済み」だけに使う
const tagCls =
  "inline-flex flex-shrink-0 items-center rounded border border-bx-line px-1.5 text-[11px] leading-5 text-bx-ink3";

const TypeTag: React.FC<{ type: string }> = ({ type }) =>
  type ? <span className={tagCls}>{type}</span> : null;

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

// 住所から都道府県名を抽出。「都道府県」の1文字で切ると「京都府」が「京都」になるので、
// 都道府県名の一覧と照らし、いちばん手前に出てくるものを取る
const extractPrefecture = (address: string): string | null => {
  if (!address) return null;
  const stripped = address.replace(/^〒\s*\d{3}-?\d{4}\s*/, "");
  let best: string | null = null;
  let bestIndex = Infinity;
  for (const pref of PREFECTURE_ORDER) {
    const i = stripped.indexOf(pref);
    if (i !== -1 && i < bestIndex) {
      best = pref;
      bestIndex = i;
    }
  }
  return best;
};

// YouTube URL → サムネイル URL(mqdefault は 16:9 で、上下の黒帯が入らない)
const getYoutubeThumb = (url: string): string | null => {
  if (!url) return null;
  const m = url.match(/youtu\.be\/([\w-]+)/) || url.match(/v=([\w-]+)/);
  return m ? `https://i.ytimg.com/vi/${m[1]}/mqdefault.jpg` : null;
};

const markerKeyOf = (place: Place, item: PlaceItem) =>
  `${place.placeUuid}:${item.placeItemUuid}`;

const hasLatLng = (item: PlaceItem) =>
  typeof item.lat === "number" && typeof item.lng === "number";

const scrollBehavior = (): ScrollBehavior =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";

const EMPTY_SET: ReadonlySet<string> = new Set();

// iOS フォーカス時の自動ズーム抑制（フォントサイズを 16px に固定）
const NO_ZOOM_STYLE: React.CSSProperties = { fontSize: 16 };

const TYPE_KEYS = ["ALL", "MV", "CM", "TV", "XFD", "OTHER"] as const;
const VIEW_KEYS = ["type", "prefecture"] as const;

const PlaceSection: React.FC<PlaceSectionProps> = ({ places }) => {
  const t = usePageDict(placeDict);
  const [expandedPlaceIds, setExpandedPlaceIds] = useState<Set<string>>(
    new Set()
  );

  // 新規コンテンツ案I「聖地スタンプラリー」。DISCOGRAPHY/LIVEと同じ仕組み
  // (namespace="visited")。巡礼済みはPlace単位(全16箇所)で記録する。
  const { owned: visited, mounted: visitedMounted, toggle: toggleVisited } =
    useCollectionOwned("visited");
  const visitedCount = visitedMounted
    ? places.filter((p) => visited.has(p.placeUuid)).length
    : 0;
  const totalPlaceCount = places.length;
  const visitedRate =
    totalPlaceCount > 0 ? Math.round((visitedCount / totalPlaceCount) * 100) : 0;
  const [showStampBook, setShowStampBook] = useState(false);

  // 見出しの数字(作品・スポット・都道府県)
  const stats = useMemo(() => {
    const items = places.flatMap((p) => p.items ?? []);
    const prefectures = new Set(
      items.map((it) => extractPrefecture(it.address)).filter((p): p is string => !!p)
    );
    return [
      { value: places.length, label: t.statWorks },
      { value: items.length, label: t.statSpots },
      { value: prefectures.size, label: t.statPrefectures },
    ];
  }, [places, t]);

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

  // 検索などからの #place-<slug> で来た時は、その作品を開いておく(スクロールは useDeepLinkScroll)
  useEffect(() => {
    const raw = window.location.hash.replace("#", "");
    if (!raw.startsWith("place-")) return;
    const target = places.find((p) => `place-${p.slug}` === raw);
    if (target) setExpandedPlaceIds((prev) => new Set(prev).add(target.placeUuid));
  }, [places]);

  const queryMatched = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return places;
    return places.filter((place) =>
      [
        place.title,
        ...(place.items ?? []).flatMap((it) => [it.name, it.address, it.memo]),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [places, query]);

  const filteredPlaces = useMemo(
    () => queryMatched.filter((place) => matchesType(place, typeFilter)),
    [queryMatched, typeFilter]
  );

  // 都道府県別グルーピング: 各 item を都道府県ごとに集める
  const prefectureGroups = useMemo(() => {
    const groups = new Map<
      string,
      { place: Place; item: PlaceItem }[]
    >();
    for (const place of filteredPlaces) {
      for (const item of place.items ?? []) {
        const pref = extractPrefecture(item.address) ?? t.otherPrefecture;
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
  }, [filteredPlaces, t]);

  // マップ用マーカー（フィルタ適用後の全アイテム）
  const markers = useMemo<PlaceMarker[]>(
    () =>
      filteredPlaces.flatMap((place) =>
        (place.items ?? [])
          .filter(hasLatLng)
          .map((item) => ({ key: markerKeyOf(place, item), place, item }))
      ),
    [filteredPlaces]
  );

  // 一覧と地図の行き来。選んだスポットは、地図ではピンを大きくし、一覧では枠の色を変える
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [focusNonce, setFocusNonce] = useState(0);
  const mapWrapRef = useRef<HTMLDivElement | null>(null);

  const showOnMap = useCallback((place: Place, item: PlaceItem) => {
    setSelectedKey(markerKeyOf(place, item));
    setFocusNonce((n) => n + 1);
    trackEvent("place_show_on_map", { category: "navigation", label: item.slug });
    // 地図が画面にあまり入っていない時(スマホで一覧を読んでいる時)だけ、地図まで戻る
    const el = mapWrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const visible = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
    if (visible < rect.height * 0.6) {
      el.scrollIntoView({ behavior: scrollBehavior(), block: "start" });
    }
  }, []);

  const showInList = useCallback(
    (marker: PlaceMarker) => {
      setSelectedKey(marker.key);
      if (viewMode === "type") {
        setExpandedPlaceIds((prev) =>
          prev.has(marker.place.placeUuid) ? prev : new Set(prev).add(marker.place.placeUuid)
        );
      }
      trackEvent("place_show_in_list", { category: "navigation", label: marker.item.slug });
      // 作品を開いた後の描画を待ってから、そのスポットの行へ
      window.setTimeout(() => {
        document
          .getElementById(`spot-${marker.item.placeItemUuid}`)
          ?.scrollIntoView({ behavior: scrollBehavior(), block: "center" });
      }, 80);
    },
    [viewMode]
  );

  // 行の中のボタン・リンク。3つとも同じ静かな形(色が付くのは、選んでいる行と、絞り込みで選んでいる札だけ)
  const actionCls =
    "inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-bx-line px-3 text-xs font-bold text-bx-ink transition-colors hover:border-bx-ink3 focus:outline-none focus-visible:ring-2 focus-visible:ring-bx-yellow";

  // スポット1件。タイプ別(作品の中)と都道府県別で同じ形を使う。
  // 枠で囲まず罫線で区切る行にして、選んでいる行だけ左端に黄の線を引く
  const renderSpot = (
    place: Place,
    item: PlaceItem,
    opts: { index?: number; showWork?: boolean }
  ) => {
    const isSelected = selectedKey === markerKeyOf(place, item);
    const mapsHref = item.mapsUrl || item.mapsEmbedUrl;
    return (
      <li
        key={`spot-${place.placeUuid}-${item.placeItemUuid}`}
        id={`spot-${item.placeItemUuid}`}
        data-selected={isSelected ? "true" : undefined}
        className={`scroll-mt-20 border-t border-bx-line px-3 py-4 transition-colors first:border-t-0 motion-reduce:transition-none sm:px-4 ${
          isSelected ? "bg-bx-yellow/[0.07] shadow-[inset_2px_0_0_rgb(var(--bx-yellow))]" : ""
        }`}
      >
        <div className="flex items-start gap-2">
          <span
            className="flex h-5 w-5 flex-shrink-0 items-center justify-center text-xs tabular-nums text-bx-ink3"
            aria-hidden="true"
          >
            {opts.index !== undefined ? opts.index + 1 : <TbMapPin className="text-base" />}
          </span>
          <div className="min-w-0 flex-1">
            {opts.showWork && (
              <p className="mb-1 flex items-center gap-2 text-xs text-bx-ink3">
                <TypeTag type={place.type} />
                <span className="truncate">{place.title}</span>
              </p>
            )}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <h4 className="text-sm font-bold leading-5 text-bx-ink">{item.name}</h4>
              {item.needsCost && <span className={tagCls}>{t.needsCost}</span>}
              {item.needsPermission && <span className={tagCls}>{t.needsPermission}</span>}
            </div>
            {item.address && (
              <p className="mt-1 text-xs leading-5 text-bx-ink3">{item.address}</p>
            )}
            {item.memo && (
              <p
                className="mt-2 break-words text-[13px] leading-relaxed text-bx-ink [&_a]:break-all [&_a]:text-bx-blue [&_a]:underline"
                dangerouslySetInnerHTML={{
                  __html: UtilityService.sanitizeHTMLWithAllowedTags(item.memo),
                }}
              />
            )}
          </div>
        </div>
        {/* その場所の Google マップ。上の大きな地図は全体の位置、こちらは建物や通りが読める近さ */}
        {item.mapsEmbedUrl && (
          <MapEmbed
            src={item.mapsEmbedUrl}
            title={t.mapOf(item.name)}
            className="mt-3 h-44 sm:h-52"
          />
        )}
        <div className="mt-3 flex flex-wrap gap-2">
          {hasLatLng(item) && (
            <button type="button" onClick={() => showOnMap(place, item)} className={actionCls}>
              <TbMapPin className="text-sm text-bx-ink3" aria-hidden="true" />
              {t.showOnMap}
            </button>
          )}
          {mapsHref && (
            <a
              href={mapsHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${item.name} ${t.openInGoogleMaps}`}
              className={actionCls}
            >
              Google Maps
              <GoLinkExternal className="text-xs text-bx-ink3" aria-hidden="true" />
            </a>
          )}
          {item.placeUrl && (
            <a href={item.placeUrl} target="_blank" rel="noopener noreferrer" className={actionCls}>
              {t.website}
              <GoLinkExternal className="text-xs text-bx-ink3" aria-hidden="true" />
            </a>
          )}
        </div>
      </li>
    );
  };

  const mapHeightCls = "h-[46vh] min-h-[320px] lg:h-[min(calc(100vh_-_1.5rem),760px)]";

  return (
    <section
      id="PLACE"
      className="bg-bx-surface/5 border border-bx-line rounded-xl mx-2 sm:mx-4 my-4 sm:my-6 p-3 sm:p-5"
    >
      <div className="pt-3 sm:pt-5 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:items-end lg:gap-8">
        <div>
          <Kicker color="text-bx-blue" className="mb-2">PLACE</Kicker>
          <h2 className="flex items-center gap-2 text-2xl sm:text-3xl font-extrabold text-bx-ink">
            <TbMapPinHeart className="text-bx-yellow" aria-hidden="true" />
            <span>{t.heading}</span>
          </h2>
          <p className="mt-3 max-w-2xl break-words text-[13px] sm:text-sm leading-relaxed text-bx-ink3">
            {t.intro1}
            <br />
            {t.intro2}
          </p>
          <dl className="mt-4 flex">
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className={`flex flex-col-reverse pr-5 sm:pr-7 ${
                  i > 0 ? "border-l border-bx-line pl-5 sm:pl-7" : ""
                }`}
              >
                <dt className="mt-2 text-xs leading-4 text-bx-ink3">{stat.label}</dt>
                <dd className="text-2xl sm:text-4xl font-bold leading-none tabular-nums text-bx-ink">
                  <StatCounter value={stat.value} />
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="mt-4 space-y-2 lg:mt-0">
          {/* 地域ごとのガイド(読みもののシリーズ「聖地を歩く」。日本語だけのページで、各言語からも同じ URL へ) */}
          <LangLink
            to={guidePath(SHIBUYA_GUIDE)}
            onClick={() => trackEvent("place_guide_click", { category: "navigation", label: "shibuya" })}
            className="group flex items-center gap-3 rounded-xl border border-bx-line bg-bx-bg/40 p-3 transition-colors hover:border-bx-ink3 focus:outline-none focus-visible:ring-2 focus-visible:ring-bx-yellow"
          >
            <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-bx-surface/10 text-xl text-bx-ink">
              <TbRoute aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold leading-5 text-bx-ink">
                {t.shibuyaGuide}
              </span>
              <span className="mt-1 block text-xs leading-4 text-bx-ink3">
                {t.shibuyaGuideDesc}
              </span>
            </span>
            <TbArrowRight
              className="flex-shrink-0 text-lg text-bx-yellow transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
              aria-hidden="true"
            />
          </LangLink>

          <div className="rounded-xl border border-bx-line bg-bx-bg/40 p-3">
            <button
              type="button"
              onClick={() => setShowStampBook((v) => !v)}
              aria-expanded={showStampBook}
              aria-controls="place-stamp-book-grid"
              className="flex w-full items-center gap-3 rounded text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-bx-yellow"
            >
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline justify-between gap-2">
                  <span className="text-xs font-bold text-bx-ink">{t.stampBook}</span>
                  <span className="text-sm font-bold text-bx-blue tabular-nums">
                    {visitedCount} / {totalPlaceCount}
                  </span>
                </span>
                <span className="mt-2 block h-1 overflow-hidden rounded-full bg-bx-line">
                  <span
                    className="block h-full origin-left bg-bx-blue transition-transform duration-300 motion-reduce:transition-none"
                    style={{ transform: `scaleX(${visitedRate / 100})` }}
                  />
                </span>
              </span>
              <GoChevronDown
                className={`flex-shrink-0 text-bx-ink3 transition-transform motion-reduce:transition-none ${
                  showStampBook ? "rotate-180" : ""
                }`}
                aria-hidden="true"
              />
            </button>
            {showStampBook && (
              <div
                id="place-stamp-book-grid"
                className="mt-3 grid grid-cols-4 gap-x-2 gap-y-3 sm:grid-cols-8 lg:grid-cols-4"
              >
                {places.map((p) => {
                  const isVisited = visitedMounted && visited.has(p.placeUuid);
                  const thumb = getYoutubeThumb(p.url);
                  return (
                    <div
                      key={p.placeUuid}
                      title={p.title}
                      className="flex flex-col items-center gap-1 text-center"
                    >
                      <span className="relative">
                        <span
                          className={`flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border-2 ${
                            isVisited ? "border-bx-blue" : "border-bx-line"
                          }`}
                        >
                          {thumb ? (
                            <img
                              src={thumb}
                              alt=""
                              loading="lazy"
                              className={`h-full w-full object-cover ${
                                isVisited ? "" : "opacity-40 grayscale"
                              }`}
                            />
                          ) : (
                            <TbMapPinHeart
                              className={`text-xl ${isVisited ? "text-bx-blue" : "text-bx-ink3/60"}`}
                              aria-hidden="true"
                            />
                          )}
                        </span>
                        {isVisited && (
                          <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-bx-blue text-xs text-bx-bg">
                            <TbCheck aria-hidden="true" />
                          </span>
                        )}
                      </span>
                      <span className="w-full text-[11px] leading-4 text-bx-ink3 line-clamp-2">
                        {p.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
            {visitedRate >= 100 && totalPlaceCount > 0 && (
              <p className="mt-3 text-xs font-bold leading-4 text-bx-blue">
                {t.allComplete(totalPlaceCount)}
              </p>
            )}
            <p className="mt-2 text-xs leading-4 text-bx-ink3">{t.stampHint}</p>
          </div>
        </div>
      </div>

      {/* 地図と一覧。スマホは地図→一覧の縦並び、広い画面は左に一覧・右に地図(地図は付いてくる) */}
      <div className="mt-4 lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-start lg:gap-4">
        <div
          ref={mapWrapRef}
          role="region"
          aria-label={t.mapAria}
          className="scroll-mt-3 lg:sticky lg:top-3 lg:order-2"
        >
          {markers.length === 0 ? (
            <EmptyState
              icon={<TbMapPinOff className="inline text-bx-ink3" aria-hidden="true" />}
              title={t.noMarkersTitle}
              description={t.noMarkersDesc}
              actionLabel={t.clear}
              onAction={clearFilters}
              tone="dark"
            />
          ) : mapLoadError ? (
            <ErrorRetry
              title={t.mapErrorTitle}
              description={t.mapErrorDesc}
              onRetry={retryMapLoad}
              tone="dark"
            />
          ) : !MapComponent ? (
            <div
              role="status"
              aria-live="polite"
              aria-busy="true"
              className={`rounded-xl border border-bx-line bg-bx-surface/5 ${mapHeightCls}`}
            >
              <span className="sr-only">{t.mapLoading}</span>
            </div>
          ) : (
            <MapComponent
              markers={markers}
              heightClassName={mapHeightCls}
              selectedKey={selectedKey}
              onSelect={setSelectedKey}
              focusNonce={focusNonce}
              onShowInList={showInList}
              visitedPlaceIds={visitedMounted ? visited : EMPTY_SET}
            />
          )}
          {visitedCount > 0 && (
            <p className="mt-2 flex items-center justify-end gap-2 text-xs leading-4 text-bx-ink3">
              <span className="inline-block h-2 w-2 rounded-full bg-bx-blue" aria-hidden="true" />
              {t.visited}
            </p>
          )}
        </div>

        <div className="mt-3 min-w-0 lg:order-1 lg:mt-0">
          {/* 検索と並べ方 */}
          <div className="flex flex-wrap items-center gap-2">
            <label className="relative block min-w-0 flex-1 basis-full sm:basis-0">
              <span className="sr-only">{t.searchLabel}</span>
              <TbSearch
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-bx-ink3"
                aria-hidden="true"
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                style={NO_ZOOM_STYLE}
                className="block w-full min-h-[44px] rounded-lg border border-bx-line bg-bx-bg/40 py-2 pl-9 pr-3 text-bx-ink placeholder:text-bx-ink3/70 focus:border-bx-ink3 focus:outline-none focus:ring-0 focus-visible:ring-2 focus-visible:ring-bx-yellow"
              />
            </label>
            <div
              className="inline-flex flex-shrink-0 rounded-lg border border-bx-line bg-bx-bg/40 p-1"
              role="radiogroup"
              aria-label={t.viewModeAria}
            >
              {VIEW_MODES.map((mode) => {
                const active = viewMode === mode;
                return (
                  <button
                    key={mode}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setViewMode(mode)}
                    className={`min-h-[36px] rounded px-3 text-xs font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-bx-yellow ${
                      active ? "bg-bx-surface/10 text-bx-ink" : "text-bx-ink3 hover:text-bx-ink"
                    }`}
                  >
                    {mode === "type" ? t.viewType : t.viewPrefecture}
                  </button>
                );
              })}
            </div>
            <span className="ml-auto text-xs tabular-nums text-bx-ink3">
              {t.count(filteredPlaces.length, places.length)}
            </span>
          </div>

          {/* タイプの絞り込み(一覧を読んでいる間も上に残る。1行で、はみ出す分は横に送る) */}
          <div
            role="region"
            aria-label={t.filterAria}
            className="sticky top-0 z-20 -mx-3 mt-2 flex items-center gap-2 border-b border-bx-line bg-bx-bg px-3 py-2 sm:-mx-5 sm:px-5 lg:mx-0 lg:rounded-xl lg:border lg:px-2"
          >
            <div
              className="flex min-w-0 flex-1 gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              role="radiogroup"
              aria-label={t.typeFilterAria}
            >
              {TYPE_FILTERS.map((f) => {
                const active = typeFilter === f.key;
                const n = queryMatched.filter((p) => matchesType(p, f.key)).length;
                return (
                  <button
                    key={f.key}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setTypeFilter(f.key)}
                    className={`inline-flex min-h-[40px] flex-shrink-0 items-center gap-2 rounded-lg border px-3 text-xs font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-bx-yellow ${
                      active
                        ? "border-bx-yellow bg-bx-yellow text-bx-bg"
                        : "border-bx-line text-bx-ink hover:border-bx-ink3"
                    }`}
                  >
                    {f.key === "OTHER" ? t.typeOther : f.label}
                    <span
                      className={`text-xs font-normal tabular-nums ${
                        active ? "text-bx-bg/80" : "text-bx-ink3"
                      }`}
                    >
                      {n}
                    </span>
                  </button>
                );
              })}
            </div>
            {(typeFilter !== "ALL" || query.length > 0) && (
              <button
                type="button"
                onClick={clearFilters}
                className="min-h-[40px] flex-shrink-0 rounded-lg px-2 text-xs text-bx-ink3 transition-colors hover:text-bx-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-bx-yellow"
              >
                {t.clear}
              </button>
            )}
          </div>

          <div className="pt-3">
            {/* ===== タイプ別ビュー ===== */}
            {viewMode === "type" && (
              <div className="space-y-2">
                {filteredPlaces.length === 0 ? (
                  <EmptyState
                    icon={<TbSearchOff className="inline text-bx-ink3" aria-hidden="true" />}
                    title={t.noMatchTitle}
                    description={t.noMatchDesc}
                    actionLabel={t.clear}
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
                    const isVisited = visitedMounted && visited.has(place.placeUuid);

                    return (
                      <div
                        key={`place-${place.placeUuid}`}
                        id={`place-${place.slug}`}
                        className={`scroll-mt-20 overflow-hidden rounded-xl border transition-colors motion-reduce:transition-none ${
                          isExpanded
                            ? "border-bx-ink3/60 bg-bx-surface/[0.06]"
                            : "border-bx-line bg-bx-surface/[0.03] hover:border-bx-ink3/60"
                        }`}
                      >
                        <div className="flex items-center gap-1 p-2 sm:p-3">
                          <button
                            type="button"
                            onClick={() => toggleVisited(place.placeUuid)}
                            aria-pressed={isVisited}
                            aria-label={`${place.title} ${isVisited ? t.unmarkVisited : t.markVisited}`}
                            title={isVisited ? t.visited : t.markVisited}
                            className="group/check flex h-10 w-9 flex-shrink-0 items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-bx-yellow"
                          >
                            <span
                              className={`flex h-6 w-6 items-center justify-center rounded-full border-2 text-[10px] font-bold transition-colors ${
                                checkCircleClass(isVisited)
                              }`}
                            >
                              ✓
                            </span>
                          </button>
                          <h3 className="min-w-0 flex-1">
                            <button
                              type="button"
                              onClick={() => toggleExpand(place.placeUuid)}
                              aria-expanded={isExpanded}
                              aria-controls={`place-panel-${place.slug}`}
                              className="flex w-full items-center gap-3 rounded-lg text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-bx-yellow"
                            >
                              {thumb ? (
                                <img
                                  src={thumb}
                                  alt=""
                                  width={96}
                                  height={56}
                                  loading="lazy"
                                  className="h-14 w-24 flex-shrink-0 rounded-md bg-bx-surface/5 object-cover sm:h-[72px] sm:w-32"
                                />
                              ) : (
                                <span className="flex h-14 w-24 flex-shrink-0 items-center justify-center rounded-md bg-bx-surface/10 text-bx-ink3 sm:h-[72px] sm:w-32">
                                  <TbMapPinHeart className="text-xl" aria-hidden="true" />
                                </span>
                              )}
                              <span className="min-w-0 flex-1">
                                <span
                                  className={`block text-[15px] font-bold leading-snug text-bx-ink ${
                                    isExpanded ? "" : "line-clamp-2"
                                  }`}
                                >
                                  {place.title}
                                </span>
                                <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-normal text-bx-ink3">
                                  <TypeTag type={place.type} />
                                  <span>{t.spots(itemCount)}</span>
                                  {prefectures.length > 0 && (
                                    <span className="truncate">
                                      {prefectures.slice(0, 3).join(t.prefectureSeparator)}
                                      {prefectures.length > 3 ? t.morePrefectures(prefectures.length - 3) : ""}
                                    </span>
                                  )}
                                </span>
                              </span>
                              <GoChevronDown
                                className={`mr-1 flex-shrink-0 text-bx-ink3 transition-transform motion-reduce:transition-none ${
                                  isExpanded ? "rotate-180" : ""
                                }`}
                                aria-hidden="true"
                              />
                            </button>
                          </h3>
                        </div>

                        {isExpanded && (
                          <div
                            id={`place-panel-${place.slug}`}
                            className="border-t border-bx-line"
                          >
                            {place.url && place.url.indexOf("youtu.be") !== -1 && (
                              <div className="border-b border-bx-line p-3 sm:p-4">
                                <PlayerSlot
                                  videoId={place.url.replace("https://youtu.be/", "").split("?")[0]}
                                  title={place.title}
                                  className="rounded-lg"
                                />
                              </div>
                            )}
                            <ol>
                              {place.items?.map((item, itemIdx) =>
                                renderSpot(place, item, { index: itemIdx })
                              )}
                            </ol>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* ===== 都道府県別ビュー ===== */}
            {viewMode === "prefecture" && (
              <div className="space-y-6">
                {prefectureGroups.length === 0 ? (
                  <EmptyState
                    icon={<TbSearchOff className="inline text-bx-ink3" aria-hidden="true" />}
                    title={t.noMatchTitle}
                    description={t.noMatchDesc}
                    actionLabel={t.clear}
                    onAction={clearFilters}
                    tone="dark"
                  />
                ) : (
                  prefectureGroups.map(([pref, list]) => (
                    <div key={`pref-${pref}`}>
                      <h3 className="flex items-baseline gap-2 px-1 text-sm font-bold text-bx-ink">
                        <span>{pref}</span>
                        <span className="text-xs font-normal tabular-nums text-bx-ink3">
                          {list.length}
                        </span>
                      </h3>
                      <ul className="mt-2 overflow-hidden rounded-xl border border-bx-line bg-bx-surface/[0.03]">
                        {list.map(({ place, item }) =>
                          renderSpot(place, item, { showWork: true })
                        )}
                      </ul>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <p className="pt-4 pb-1 text-xs text-bx-ink3">
            {t.footerNote}
          </p>
        </div>
      </div>
    </section>
  );
};

export default PlaceSection;
