/**
 * /live/setlist-grammar/ — 新規コンテンツ案H「セトリの文法解析」
 * (plan/legit-improvement-plan.md 5章)
 *
 * 演奏統計ページが「辞書」なら、これは「文法書」。曲の隣接関係・出現ポジション・
 * 年別のオープニング傾向・ツアー内の変化を、gatsby-node.ts の事前集計
 * (static/data/setlist-grammar.json)から表示する。
 *
 * 「アンコール専用曲」は元プランの想定だったが、実データにアンコールを示す
 * 明示的なマーカーが無いため、「オープニング/クロージング専任(中盤には出ない)」
 * という位置ベースの定義に置き換えている。
 */
import React, { useEffect, useState } from "react";
import { HeadFC } from "gatsby";
import Layout from "../../components/modules/layout";
import SEO from "../../components/SEO";
import { Kicker } from "../../components/redesign";
import { buildBreadcrumbList } from "../../utils/jsonLd";
import { LangLink as Link, pageDictFor, useDict, usePageDict } from "../../i18n/site/SiteLangContext";
import { setlistGrammarDict } from "../../i18n/site/pages/setlistGrammar";
import { DEFAULT_LANG, isSiteLang } from "../../i18n/site/langs";
import { getDict } from "../../i18n/site/dict";
import { localizePath } from "../../utils/i18nRoutes";

type Source = { liveTitle: string; liveSlug: string; date: string };
type PairRow = {
  from: string;
  to: string;
  count: number;
  total: number;
  rate: number;
  sources: Source[];
};
type NamedCount = { name: string; count: number; sources: Source[] };
type YearlyOpener = {
  year: string;
  topSong: string | null;
  count: number;
  sources: Source[];
};
type TourDiff = {
  liveTitle: string;
  liveSlug: string;
  firstDate: string;
  lastDate: string;
  added: string[];
  removed: string[];
};
type WorkTrend = {
  discographyUuid: string;
  discographyTitle: string;
  discographySlug: string;
  releaseDate: string | null;
  songCount: number;
  playedSongCount: number;
  totalPlays: number;
  firstPlayedDate: string | null;
  lastPlayedDate: string | null;
  coverageRate: number;
};

type GrammarData = {
  topPairs: PairRow[];
  topOpeners: NamedCount[];
  topClosers: NamedCount[];
  openerSpecialists: NamedCount[];
  closerSpecialists: NamedCount[];
  yearlyOpenerTop: YearlyOpener[];
  tourDiffs: TourDiff[];
  workTrends: WorkTrend[];
};

const fetchJson = async <T,>(url: string): Promise<T> => {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${url}: ${r.status}`);
  return r.json();
};

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className="text-sm font-bold text-bx-ink mb-2">{children}</h2>
);

/** クリックした行の「何を数えたか」の内訳(対象ツアー一覧)を表示する */
const SourceList: React.FC<{ sources: Source[] }> = ({ sources }) => {
  const t = usePageDict(setlistGrammarDict);
  if (sources.length === 0) {
    return (
      <p className="mt-1.5 text-[11px] text-bx-ink3">{t.noSources}</p>
    );
  }
  return (
    <ul className="mt-1.5 pt-1.5 border-t border-bx-line space-y-1">
      {sources.map((s, i) => (
        <li key={i} className="text-[11px]">
          <Link
            to={`/live/#live-${s.liveSlug}`}
            onClick={(e) => e.stopPropagation()}
            className="text-bx-blueLight hover:text-bx-blue"
          >
            {s.liveTitle}
          </Link>
          <span className="text-bx-ink3 ml-1.5">
            {s.date.replaceAll("-", "/")}
          </span>
        </li>
      ))}
    </ul>
  );
};

const SetlistGrammarPage: React.FC = () => {
  const t = usePageDict(setlistGrammarDict);
  const { common } = useDict();
  const [data, setData] = useState<GrammarData | null>(null);
  const [error, setError] = useState<string | null>(null);
  // クリックで内訳を開閉する行のキー("pair-0" 等)。開けるのは常に1つだけ。
  const [expanded, setExpanded] = useState<string | null>(null);
  const toggle = (key: string) =>
    setExpanded((cur) => (cur === key ? null : key));

  useEffect(() => {
    fetchJson<GrammarData>("/static/data/setlist-grammar.json")
      .then(setData)
      .catch((e) => setError(String(e)));
  }, []);

  return (
    <Layout title={t.title}>
      <main className="container mx-auto px-3 sm:px-4 py-4 max-w-2xl text-bx-ink">
        <header className="mb-6">
          <Kicker color="text-bx-blue">SETLIST GRAMMAR</Kicker>
          <h1 className="text-2xl sm:text-3xl font-bold mb-1 tracking-tight text-bx-ink">
            {t.title}
          </h1>
          <p className="text-xs text-bx-ink3">
            {t.lead}
          </p>
        </header>

        {error && <p className="text-sm text-red-400">{common.loadError(error)}</p>}
        {!data && !error && (
          <p className="text-sm text-bx-ink3">{common.loading}</p>
        )}

        {data && (
          <div className="space-y-8">
            <section>
              <SectionTitle>{t.pairsHeading}</SectionTitle>
              <p className="text-xs text-bx-ink3 mb-3">
                {t.pairsLead}
              </p>
              <ul className="space-y-1.5">
                {data.topPairs.map((p, i) => {
                  const key = `pair-${i}`;
                  const isOpen = expanded === key;
                  return (
                    <li
                      key={i}
                      className="rounded-lg border border-bx-line bg-bx-surface/5 px-3 py-2 text-sm cursor-pointer"
                      onClick={() => toggle(key)}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="min-w-0 truncate">
                          <span className="font-medium text-bx-ink">{p.from}</span>
                          <span className="text-bx-ink3 mx-1.5">→</span>
                          <span className="font-medium text-bx-ink">{p.to}</span>
                        </span>
                        <span className="flex-shrink-0 text-[11px] text-bx-blue font-bold tabular-nums whitespace-nowrap">
                          {t.ratio(p.count, p.total, Math.round(p.rate * 100))}
                        </span>
                      </div>
                      {isOpen && <SourceList sources={p.sources} />}
                    </li>
                  );
                })}
              </ul>
            </section>

            <section>
              <SectionTitle>{t.positionsHeading}</SectionTitle>
              <p className="text-xs text-bx-ink3 mb-3">
                {t.positionsLead}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-[11px] font-bold text-bx-ink3 mb-1.5">
                    OPENING
                  </div>
                  <ul className="space-y-1">
                    {data.topOpeners.map((s, i) => {
                      const isSpecialist = data.openerSpecialists.some(
                        (o) => o.name === s.name
                      );
                      const key = `opener-${i}`;
                      const isOpen = expanded === key;
                      return (
                        <li
                          key={i}
                          className="text-sm rounded-lg border border-bx-line bg-bx-surface/5 px-3 py-1.5 cursor-pointer"
                          onClick={() => toggle(key)}
                        >
                          <div className="flex items-center justify-between">
                            <span className="min-w-0 truncate">
                              {isSpecialist && (
                                <span className="text-bx-yellow mr-1">★</span>
                              )}
                              {s.name}
                            </span>
                            <span className="flex-shrink-0 text-[11px] text-bx-ink3 tabular-nums">
                              {t.times(s.count)}
                            </span>
                          </div>
                          {isOpen && <SourceList sources={s.sources} />}
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <div>
                  <div className="text-[11px] font-bold text-bx-ink3 mb-1.5">
                    CLOSING
                  </div>
                  <ul className="space-y-1">
                    {data.topClosers.map((s, i) => {
                      const isSpecialist = data.closerSpecialists.some(
                        (o) => o.name === s.name
                      );
                      const key = `closer-${i}`;
                      const isOpen = expanded === key;
                      return (
                        <li
                          key={i}
                          className="text-sm rounded-lg border border-bx-line bg-bx-surface/5 px-3 py-1.5 cursor-pointer"
                          onClick={() => toggle(key)}
                        >
                          <div className="flex items-center justify-between">
                            <span className="min-w-0 truncate">
                              {isSpecialist && (
                                <span className="text-bx-yellow mr-1">★</span>
                              )}
                              {s.name}
                            </span>
                            <span className="flex-shrink-0 text-[11px] text-bx-ink3 tabular-nums">
                              {t.times(s.count)}
                            </span>
                          </div>
                          {isOpen && <SourceList sources={s.sources} />}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <SectionTitle>{t.yearlyHeading}</SectionTitle>
              <p className="text-xs text-bx-ink3 mb-3">
                {t.yearlyLead}
              </p>
              <ol className="space-y-1">
                {data.yearlyOpenerTop.map((y) => {
                  const key = `year-${y.year}`;
                  const isOpen = expanded === key;
                  return (
                    <li
                      key={y.year}
                      className="text-sm rounded-lg border border-bx-line bg-bx-surface/5 px-3 py-1.5 cursor-pointer"
                      onClick={() => toggle(key)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-12 flex-shrink-0 font-bold text-bx-ink3 tabular-nums">
                          {y.year}
                        </span>
                        <span className="flex-1 min-w-0 truncate text-bx-ink">
                          {y.topSong ?? "-"}
                        </span>
                        <span className="flex-shrink-0 text-[11px] text-bx-ink3 tabular-nums">
                          {t.times(y.count)}
                        </span>
                      </div>
                      {isOpen && <SourceList sources={y.sources} />}
                    </li>
                  );
                })}
              </ol>
            </section>

            <section>
              <SectionTitle>{t.diffsHeading}</SectionTitle>
              <p className="text-xs text-bx-ink3 mb-3">
                {t.diffsLead}
              </p>
              <ul className="space-y-3">
                {data.tourDiffs.map((d, i) => (
                  <li
                    key={i}
                    className="rounded-lg border border-bx-line bg-bx-surface/5 p-3"
                  >
                    <Link
                      to={`/live/#live-${d.liveSlug}`}
                      className="text-sm font-bold text-bx-blueLight hover:text-bx-blue"
                    >
                      {d.liveTitle}
                    </Link>
                    <div className="text-[10px] text-bx-ink3 mb-2">
                      {d.firstDate.replaceAll("-", "/")} → {d.lastDate.replaceAll("-", "/")}
                    </div>
                    {d.added.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-1">
                        {d.added.map((n) => (
                          <span
                            key={n}
                            className="text-[11px] px-2 py-0.5 rounded-full bg-bx-blue/15 text-bx-blue"
                          >
                            +{n}
                          </span>
                        ))}
                      </div>
                    )}
                    {d.removed.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {d.removed.map((n) => (
                          <span
                            key={n}
                            className="text-[11px] px-2 py-0.5 rounded-full bg-bx-ink3/15 text-bx-ink3 line-through"
                          >
                            {n}
                          </span>
                        ))}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <SectionTitle>{t.worksHeading}</SectionTitle>
              <p className="text-xs text-bx-ink3 mb-3">
                {t.worksLead}
              </p>
              <div className="overflow-x-auto overflow-y-auto max-h-[480px] border border-bx-line rounded-lg">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-bx-bg text-bx-ink3">
                      <th className="px-3 py-2 text-left border-b border-bx-line">{t.colWork}</th>
                      <th className="px-2 py-2 text-right w-20 border-b border-bx-line">{t.colCoverage}</th>
                      <th className="px-2 py-2 text-right w-16 border-b border-bx-line">{t.colTotal}</th>
                      <th className="px-2 py-2 text-right w-20 border-b border-bx-line">{t.colFirst}</th>
                      <th className="px-2 py-2 text-right w-20 border-b border-bx-line">{t.colLast}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-bx-line">
                    {data.workTrends.map((w) => (
                      <tr key={w.discographyUuid} className="hover:bg-bx-surface/5">
                        <td className="px-3 py-1.5">
                          <Link
                            to={`/discography/#disc-${w.discographySlug}`}
                            className="text-bx-blueLight hover:text-bx-blue"
                          >
                            {w.discographyTitle}
                          </Link>
                          <span className="ml-1.5 text-bx-ink3">
                            {t.playedOf(w.playedSongCount, w.songCount)}
                          </span>
                        </td>
                        <td className="px-2 py-1.5 text-right font-mono text-bx-ink">
                          {Math.round(w.coverageRate * 100)}%
                        </td>
                        <td className="px-2 py-1.5 text-right font-mono text-bx-ink">
                          {w.totalPlays}
                        </td>
                        <td className="px-2 py-1.5 text-right text-bx-ink3">
                          {w.firstPlayedDate ?? "-"}
                        </td>
                        <td className="px-2 py-1.5 text-right text-bx-ink3">
                          {w.lastPlayedDate ?? "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        <p className="mt-8 text-xs text-bx-ink2">
          <Link
            to="/songs/stats/"
            className="underline underline-offset-2 hover:text-bx-blue"
          >
            {t.statsLink}
          </Link>
        </p>
      </main>
    </Layout>
  );
};

export default SetlistGrammarPage;

export const Head: HeadFC<object, { lang?: string }> = ({ pageContext }) => {
  const lang = isSiteLang(pageContext?.lang) ? pageContext.lang : DEFAULT_LANG;
  const t = pageDictFor(setlistGrammarDict, lang);
  return (
    <SEO
      title={t.title}
      description={t.metaDescription}
      path="/live/setlist-grammar/"
      lang={lang}
      jsonLd={buildBreadcrumbList([
        { name: getDict(lang).site.breadcrumbHome, path: localizePath("/", lang) },
        { name: t.title, path: localizePath("/live/setlist-grammar/", lang) },
      ])}
    />
  );
};
