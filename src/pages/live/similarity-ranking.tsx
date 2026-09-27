/**
 * /live/similarity-ranking/ — セトリ類似度ランキング(全体)
 *
 * plan/reol-setlist-compare-design の Phase 3。全公演を横断し、セトリが特に
 * 似ている公演ペアを類似度順にランキング表示する。データは gatsby-node.ts の
 * ビルド時集計(similarityRanking.json, liveItemUuid単位のJaccard係数)から取得。
 * 同一ツアー内の連日公演(セトリがほぼ同じで当然に類似度が高い)はビルド時点で
 * 除外済み。
 */
import React, { useEffect, useState } from "react";
import { HeadFC } from "gatsby";
import { ArrowLeft } from "lucide-react";
import SEO from "../../components/SEO";
import { buildBreadcrumbList } from "../../utils/jsonLd";
import { LangLink as Link, pageDictFor, useDict, usePageDict } from "../../i18n/site/SiteLangContext";
import { similarityRankingDict } from "../../i18n/site/pages/similarityRanking";
import { DEFAULT_LANG, isSiteLang } from "../../i18n/site/langs";
import { getDict } from "../../i18n/site/dict";
import { localizePath } from "../../utils/i18nRoutes";

type SidePerformance = {
  liveItemUuid: string;
  liveItemSlug: string;
  liveTitle: string;
  liveItemName: string | null;
  date: string;
  place: string | null;
};

type SimilarityPair = {
  a: SidePerformance;
  b: SidePerformance;
  sharedCount: number;
  score: number;
};

const fetchJson = async <T,>(url: string): Promise<T> => {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${url}: ${r.status}`);
  return r.json();
};

const performanceLabel = (p: SidePerformance): string =>
  `${p.liveTitle}${p.liveItemName ? ` ${p.liveItemName}` : ""} (${p.date}${p.place ? ` @ ${p.place}` : ""})`;

const SimilarityRankingPage: React.FC = () => {
  const t = usePageDict(similarityRankingDict);
  const { common } = useDict();
  const [pairs, setPairs] = useState<SimilarityPair[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchJson<SimilarityPair[]>("/static/data/similarityRanking.json")
      .then(setPairs)
      .catch((e) => setError(String(e)));
  }, []);

  return (
    <div className="min-h-screen bg-bx-bg">
      <header className="bg-bx-bg shadow-sm border-b border-bx-line">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-bx-blueLight hover:text-bx-blue font-medium"
          >
            <ArrowLeft className="h-5 w-5" />
            {common.backHome}
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-bx-ink">{t.title}</h1>
          <p className="mt-1 text-sm text-bx-ink3">
            {t.lead}
          </p>
        </div>

        {error && <p className="text-sm text-red-400">{common.loadError(error)}</p>}
        {!pairs && !error && <p className="text-sm text-bx-ink3">{common.loading}</p>}

        {pairs && pairs.length === 0 && (
          <p className="text-sm text-bx-ink3 py-8 text-center">
            {t.empty}
          </p>
        )}

        {pairs && pairs.length > 0 && (
          <ol className="space-y-2">
            {pairs.map((pair, i) => (
              <li
                key={`${pair.a.liveItemUuid}-${pair.b.liveItemUuid}`}
                className="bg-bx-bg border border-bx-line rounded-lg p-3"
              >
                <div className="flex items-start gap-3">
                  <span className="shrink-0 w-7 text-right font-mono text-bx-ink3 text-sm">
                    {i + 1}.
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-bx-ink">{performanceLabel(pair.a)}</p>
                    <p className="text-sm text-bx-ink">{performanceLabel(pair.b)}</p>
                    <div className="mt-1.5 flex items-center gap-3 text-xs text-bx-ink3">
                      <span>
                        {t.sharedBefore}
                        <span className="font-bold text-bx-ink">{pair.sharedCount}</span>
                        {t.sharedAfter}
                      </span>
                      <span>
                        {t.similarity}{" "}
                        <span className="font-bold text-emerald-400">
                          {Math.round(pair.score * 100)}%
                        </span>
                      </span>
                      <Link
                        to={`/live/compare/?from=${pair.a.liveItemSlug}&to=${pair.b.liveItemSlug}`}
                        className="text-bx-blueLight hover:underline"
                      >
                        {t.compare}
                      </Link>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}
      </main>
    </div>
  );
};

export default SimilarityRankingPage;

export const Head: HeadFC<object, { lang?: string }> = ({ pageContext }) => {
  const lang = isSiteLang(pageContext?.lang) ? pageContext.lang : DEFAULT_LANG;
  const t = pageDictFor(similarityRankingDict, lang);
  return (
    <SEO
      title={t.title}
      description={t.metaDescription}
      path="/live/similarity-ranking/"
      lang={lang}
      jsonLd={buildBreadcrumbList([
        { name: getDict(lang).site.breadcrumbHome, path: localizePath("/", lang) },
        { name: "LIVE", path: localizePath("/live/", lang) },
        { name: t.title, path: localizePath("/live/similarity-ranking/", lang) },
      ])}
    />
  );
};
