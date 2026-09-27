/**
 * /live/tour-heatmap/ — ツアー全公演ヒートマップ
 *
 * plan/reol-setlist-compare-design の Phase 2。1ツアー(同一liveUuid配下の
 * 複数公演)を選び、楽曲 × 公演のマトリクスで演奏有無・曲順を一覧できる。
 * セトリ比較(/live/compare/)と同じ正規化基準(setlistCompare.ts)を使う。
 */
import React, { useEffect, useMemo, useState } from "react";
import { graphql, HeadFC, PageProps, navigate } from "gatsby";
import { ArrowLeft } from "lucide-react";
import SEO from "../../components/SEO";
import { buildTourHeatmap, type TourHeatmapRow } from "../../utils/tourHeatmap";
import { extractPrefecture } from "../../utils/extractPrefecture";
import { buildBreadcrumbList } from "../../utils/jsonLd";
import {
  LangLink as Link,
  pageDictFor,
  useDict,
  usePageDict,
  useSiteLang,
} from "../../i18n/site/SiteLangContext";
import { tourHeatmapDict } from "../../i18n/site/pages/tourHeatmap";
import { DEFAULT_LANG, isSiteLang, type SiteLang } from "../../i18n/site/langs";
import { getDict } from "../../i18n/site/dict";
import { regionLabel, shortPrefectureLabel } from "../../i18n/site/regions";
import { localizePath } from "../../utils/i18nRoutes";

type SetListSongQuery = {
  liveItemSongUuid: string;
  liveItemSongName: string;
  songUuid: string | null;
  type: string | null;
};

type LiveItemQuery = {
  liveItemUuid: string;
  slug: string;
  liveItemName: string | null;
  date: string;
  place: string | null;
  address: string | null;
  setList: SetListSongQuery[];
};

type LiveQuery = {
  liveUuid: string;
  title: string;
  type: string;
  items: LiveItemQuery[];
};

interface TourHeatmapQuery {
  live: {
    liveInfos: LiveQuery[];
  };
}

// 列見出しは「大阪」「東京」のように接尾辞(都道府県)を省いた短縮表記にする
// (shortPrefectureLabel)。都道府県が特定できない(海外公演等)場合はフォールバック表示。
const columnLabel = (p: Pick<LiveItemQuery, "place" | "address">, lang: SiteLang): string => {
  const { prefecture, overseasRegion, overseasSubRegion } = extractPrefecture(
    p.address,
    p.place
  );
  if (prefecture) return shortPrefectureLabel(prefecture, lang);
  const region = overseasSubRegion ?? overseasRegion;
  return region ? regionLabel(region, lang) : p.place ?? "?";
};

const RowBadgeList: React.FC<{ rows: TourHeatmapRow[]; emptyLabel: string }> = ({
  rows,
  emptyLabel,
}) =>
  rows.length === 0 ? (
    <p className="text-xs text-bx-ink3">{emptyLabel}</p>
  ) : (
    <ul className="flex flex-wrap gap-1.5">
      {rows.map((r) => (
        <li
          key={r.key}
          className="px-2 py-0.5 rounded-full text-[11px] bg-bx-surface/10 text-bx-ink2 border border-bx-line"
        >
          {r.songName}
        </li>
      ))}
    </ul>
  );

const TourHeatmapPage: React.FC<PageProps<TourHeatmapQuery>> = ({ data, location }) => {
  const t = usePageDict(tourHeatmapDict);
  const { common } = useDict();
  const lang = useSiteLang();
  // ビルド時点の日付を基準にする(静的サイトのため、次回ビルドまでは
  // このスナップショットのまま = ACTIVITY_YEARS 等、他の箇所と同じ既知の制約)。
  const todayIso = useMemo(() => new Date().toISOString().slice(0, 10), []);

  // ヒートマップの意味を持つのは、複数公演があるワンマンライヴ(ツアー)のみ。
  // イベント出演(type: "event")は他アーティストと共演の1公演単位のため、
  // 同じ liveUuid にフェス複数日等が紐づいていてもツアーとしては扱わない。
  // さらに、全公演が未来日(=まだ1公演もセトリが確定していない)のツアーは
  // ヒートマップとして意味を持たないため除外する。
  const tours = useMemo(
    () =>
      data.live.liveInfos.filter(
        (l) =>
          l.type === "oneman" &&
          l.items.length >= 2 &&
          l.items.some((it) => it.date.split("〜")[0].trim() <= todayIso)
      ),
    [data, todayIso]
  );

  const [selectedLiveUuid, setSelectedLiveUuid] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const sp = new URLSearchParams(location.search);
    const liveUuidParam = sp.get("live");
    if (liveUuidParam && tours.some((tour) => tour.liveUuid === liveUuidParam)) {
      setSelectedLiveUuid(liveUuidParam);
    } else if (tours.length > 0) {
      setSelectedLiveUuid(tours[0].liveUuid);
    }
    setInitialized(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tours]);

  useEffect(() => {
    if (!initialized) return;
    const sp = new URLSearchParams();
    if (selectedLiveUuid) sp.set("live", selectedLiveUuid);
    const next = localizePath(
      sp.toString() ? `/live/tour-heatmap/?${sp.toString()}` : "/live/tour-heatmap/",
      lang
    );
    if (next !== `${location.pathname}${location.search}`) {
      navigate(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLiveUuid, initialized]);

  const selectedTour = selectedLiveUuid
    ? tours.find((tour) => tour.liveUuid === selectedLiveUuid)
    : undefined;

  const heatmap = useMemo(() => {
    if (!selectedTour) return null;
    return buildTourHeatmap(
      selectedTour.items.map((item) => ({
        liveItemUuid: item.liveItemUuid,
        slug: item.slug,
        date: item.date,
        liveItemName: item.liveItemName,
        place: item.place,
        address: item.address,
        setList: item.setList,
      }))
    );
  }, [selectedTour]);

  return (
    <div className="min-h-screen bg-bx-bg">
      <header className="bg-bx-bg shadow-sm border-b border-bx-line">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-bx-blueLight hover:text-bx-blue font-medium"
          >
            <ArrowLeft className="h-5 w-5" />
            {common.backHome}
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-bx-ink">{t.title}</h1>
          <p className="mt-1 text-sm text-bx-ink3">
            {t.leadBefore}
            <Link to="/live/compare/" className="text-bx-blueLight hover:underline">
              {t.compare}
            </Link>
            {t.leadAfter}
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-bold text-bx-blueLight mb-1">{t.tour}</label>
          <select
            value={selectedLiveUuid ?? ""}
            onChange={(e) => setSelectedLiveUuid(e.target.value || null)}
            className="w-full sm:w-auto bg-bx-bg border border-bx-line rounded-lg px-3 py-2 text-sm text-bx-ink"
          >
            {tours.map((tour) => (
              <option key={tour.liveUuid} value={tour.liveUuid}>
                {tour.title} {t.showCount(tour.items.length)}
              </option>
            ))}
          </select>
        </div>

        {!heatmap || heatmap.rows.length === 0 ? (
          <p className="text-sm text-bx-ink3 py-8 text-center">
            {t.noSetlist}
          </p>
        ) : (
          <>
            {/* サマリー */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-center text-xs mb-4">
              <div className="bg-bx-bg border border-bx-line rounded p-2">
                <div className="text-bx-ink3">{t.shows}</div>
                <div className="text-lg font-bold text-bx-blueLight">
                  {heatmap.summary.performanceCount}
                </div>
              </div>
              <div className="bg-bx-bg border border-bx-line rounded p-2">
                <div className="text-bx-ink3">{t.songs}</div>
                <div className="text-lg font-bold text-bx-yellow">{heatmap.summary.songCount}</div>
              </div>
              <div className="bg-bx-bg border border-bx-line rounded p-2">
                <div className="text-bx-ink3">{t.everyShow}</div>
                <div className="text-lg font-bold text-emerald-400">
                  {heatmap.summary.fullHouseSongs.length}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
              <section className="bg-bx-bg border border-bx-line rounded-lg p-3">
                <h2 className="text-xs font-bold text-emerald-400 mb-2">
                  {t.everyShowHeading}
                </h2>
                <RowBadgeList rows={heatmap.summary.fullHouseSongs} emptyLabel={t.none} />
              </section>
              <section className="bg-bx-bg border border-bx-line rounded-lg p-3">
                <h2 className="text-xs font-bold text-bx-yellow mb-2">
                  {t.oneOff}
                </h2>
                <RowBadgeList rows={heatmap.summary.oneOffSongs} emptyLabel={t.none} />
              </section>
              <section className="bg-bx-bg border border-bx-line rounded-lg p-3">
                <h2 className="text-xs font-bold text-bx-blueLight mb-2">
                  {t.volatile}
                </h2>
                <RowBadgeList
                  rows={heatmap.summary.mostVolatileSongs}
                  emptyLabel={t.noVolatile}
                />
              </section>
            </div>

            {/* マトリクス */}
            <div className="overflow-x-auto border border-bx-line rounded-lg">
              <table className="text-xs border-collapse">
                <thead>
                  <tr>
                    <th className="sticky left-0 z-10 bg-bx-surface/10 px-3 py-2 text-left text-bx-ink3 border-b border-r border-bx-line min-w-[10rem]">
                      {t.songName}
                    </th>
                    {heatmap.performances.map((p) => (
                      <th
                        key={p.liveItemUuid}
                        className="px-2 py-2 text-center text-bx-ink3 border-b border-bx-line whitespace-nowrap font-normal"
                        title={`${p.date}${p.liveItemName ? ` ${p.liveItemName}` : ""}${p.place ? ` @ ${p.place}` : ""}`}
                      >
                        {columnLabel(p, lang)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-bx-line">
                  {heatmap.rows.map((row) => (
                    <tr key={row.key} className="hover:bg-bx-surface/5">
                      <td className="sticky left-0 z-10 bg-bx-bg px-3 py-1.5 text-bx-ink border-r border-bx-line whitespace-nowrap">
                        {row.songName}
                      </td>
                      {row.positions.map((pos, i) => (
                        <td
                          key={heatmap.performances[i].liveItemUuid}
                          className={`px-2 py-1.5 text-center font-mono ${
                            pos !== null ? "bg-emerald-500/10 text-emerald-400" : "text-bx-ink3"
                          }`}
                        >
                          {pos ?? "-"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export const query = graphql`
  query TourHeatmapQuery {
    live {
      liveInfos {
        liveUuid
        title
        type
        items {
          liveItemUuid
          slug
          liveItemName
          date
          place
          address
          setList {
            liveItemSongUuid
            liveItemSongName
            songUuid
            type
          }
        }
      }
    }
  }
`;

export default TourHeatmapPage;

export const Head: HeadFC<TourHeatmapQuery, { lang?: string }> = ({ pageContext }) => {
  const lang = isSiteLang(pageContext?.lang) ? pageContext.lang : DEFAULT_LANG;
  const t = pageDictFor(tourHeatmapDict, lang);
  return (
    <SEO
      title={t.title}
      description={t.metaDescription}
      path="/live/tour-heatmap/"
      lang={lang}
      jsonLd={buildBreadcrumbList([
        { name: getDict(lang).site.breadcrumbHome, path: localizePath("/", lang) },
        { name: "LIVE", path: localizePath("/live/", lang) },
        { name: t.title, path: localizePath("/live/tour-heatmap/", lang) },
      ])}
    />
  );
};
