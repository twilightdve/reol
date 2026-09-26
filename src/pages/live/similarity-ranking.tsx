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
import { HeadFC, Link } from "gatsby";
import { ArrowLeft } from "lucide-react";
import SEO from "../../components/SEO";
import { buildBreadcrumbList } from "../../utils/jsonLd";

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
            HOMEへ戻る
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-bx-ink">セトリ類似度ランキング</h1>
          <p className="mt-1 text-sm text-bx-ink3">
            異なるツアー・イベントの公演同士で、セットリストが特に似ているペアを類似度順に並べています。
            同一ツアー内の連日公演(セトリがほぼ同じで当然に似る)は除外しています。
          </p>
        </div>

        {error && <p className="text-sm text-red-400">読み込みに失敗しました: {error}</p>}
        {!pairs && !error && <p className="text-sm text-bx-ink3">読み込み中...</p>}

        {pairs && pairs.length === 0 && (
          <p className="text-sm text-bx-ink3 py-8 text-center">
            ツアーをまたいで似ている公演ペアが見つかりませんでした。
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
                        共通曲 <span className="font-bold text-bx-ink">{pair.sharedCount}</span> 曲
                      </span>
                      <span>
                        類似度{" "}
                        <span className="font-bold text-emerald-400">
                          {Math.round(pair.score * 100)}%
                        </span>
                      </span>
                      <Link
                        to={`/live/compare/?from=${pair.a.liveItemSlug}&to=${pair.b.liveItemSlug}`}
                        className="text-bx-blueLight hover:underline"
                      >
                        セトリ比較で見る →
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

export const Head: HeadFC = () => (
  <SEO
    title="セトリ類似度ランキング"
    description="Reolの全公演を横断し、セットリストが特に似ている公演ペアを類似度順にランキング表示します。"
    path="/live/similarity-ranking/"
    jsonLd={buildBreadcrumbList([
      { name: "ホーム", path: "/" },
      { name: "LIVE", path: "/live/" },
      { name: "セトリ類似度ランキング", path: "/live/similarity-ranking/" },
    ])}
  />
);
