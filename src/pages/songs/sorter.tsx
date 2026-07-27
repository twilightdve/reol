/**
 * /songs/sorter/ — 新規コンテンツ案F「楽曲ソーター」(plan/legit-improvement-plan.md 5章)
 *
 * 2曲ずつ好きな方を選び続けるマージソート式のランキング作成。
 * この機能の本質は「演奏回数」という客観データしか無いサイトに、
 * 「ファンがどれだけ好きか」という主観データを足すこと。
 * 結果画面では、演奏回数は少ないのに個人ランキングでは上位という曲を
 * 「生で聴きたい曲」として強調する。
 *
 * 比較の一時停止/再開は src/utils/mergeSorter.ts のMergeSorterクラスが担う。
 * 集計は現状この端末のみ(localStorage)。複数ユーザーの投票を横断集計する
 * 「封印曲ランキング」化にはサーバー側の集計基盤が別途必要なため、
 * このバージョンでは個人結果の作成・保存・共有までを実装する。
 */
import React, { useEffect, useMemo, useRef, useState } from "react";
import { graphql, HeadFC, Link, PageProps } from "gatsby";
import Layout from "../../components/modules/layout";
import SEO from "../../components/SEO";
import { Kicker } from "../../components/redesign";
import { MergeSorter, estimateComparisons, shuffle } from "../../utils/mergeSorter";
import { buildBreadcrumbList } from "../../utils/jsonLd";

type SongRow = {
  songUuid: string;
  slug: string;
  songName: string;
  totalPlays: number;
};

type SorterPageData = {
  songStats: {
    songStats: SongRow[];
  };
};

type Phase = "select" | "sorting" | "result";

const SIZE_OPTIONS = [16, 32, 64] as const;

const STORAGE_KEY = "reol-song-sorter-result";

type SavedResult = {
  size: number;
  ranking: string[]; // songUuid の並び(上位が先頭)
  savedAt: string;
};

const loadSaved = (): SavedResult | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const saveResult = (r: SavedResult) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(r));
  } catch {
    // ignore
  }
};

const SongSorterPage: React.FC<PageProps<SorterPageData>> = ({ data }) => {
  const allSongs = data.songStats.songStats;

  // サイト全体の演奏回数ランキング(降順)。結果画面で「演奏回数のわりに人気」を
  // 判定する基準は、このサンプル抽出前の全曲プールで計算する。
  const globalPlayRank = useMemo(() => {
    const sorted = [...allSongs].sort((a, b) => b.totalPlays - a.totalPlays);
    const map = new Map<string, number>();
    sorted.forEach((s, i) => map.set(s.songUuid, i));
    return map;
  }, [allSongs]);

  // SSRのHTMLとクライアント初回描画を一致させるため、localStorageの読み込みは
  // useStateの初期値ではなくマウント後のuseEffectで行う(hydration mismatch回避)。
  const [phase, setPhase] = useState<Phase>("select");
  const [size, setSize] = useState<number>(32);
  const sorterRef = useRef<MergeSorter<SongRow> | null>(null);
  const [, forceRerender] = useState(0);
  const [ranking, setRanking] = useState<SongRow[] | null>(null);

  useEffect(() => {
    const saved = loadSaved();
    if (!saved) return;
    const byUuid = new Map(allSongs.map((s) => [s.songUuid, s]));
    const restored = saved.ranking
      .map((uuid) => byUuid.get(uuid))
      .filter((s): s is SongRow => !!s);
    if (restored.length > 0) {
      setRanking(restored);
      setPhase("result");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const start = (n: number) => {
    const pool = allSongs.filter((s) => s.songName);
    const sample = shuffle(pool).slice(0, Math.min(n, pool.length));
    sorterRef.current = new MergeSorter(sample);
    setSize(sample.length);
    setPhase("sorting");
    forceRerender((v) => v + 1);
  };

  const choose = (pickLeft: boolean) => {
    const sorter = sorterRef.current;
    if (!sorter) return;
    sorter.choose(pickLeft);
    if (sorter.isDone() && sorter.result) {
      setRanking(sorter.result);
      saveResult({
        size: sorter.result.length,
        ranking: sorter.result.map((s) => s.songUuid),
        savedAt: new Date().toISOString(),
      });
      setPhase("result");
    } else {
      forceRerender((v) => v + 1);
    }
  };

  const [copied, setCopied] = useState(false);
  const handleShare = () => {
    if (!ranking) return;
    const top5 = ranking
      .slice(0, 5)
      .map((s, i) => `${i + 1}. ${s.songName}`)
      .join("\n");
    const text = `私の楽曲ランキング(全${ranking.length}曲中)\n${top5}\n\nhttps://reol.twilightea.com/songs/sorter/`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const restart = () => {
    sorterRef.current = null;
    setRanking(null);
    setPhase("select");
  };

  const pair = sorterRef.current?.getCurrentPair() ?? null;
  const comparisons = sorterRef.current?.comparisons ?? 0;
  const estimatedTotal = estimateComparisons(size);

  return (
    <Layout title="楽曲ソーター">
      <main className="container mx-auto px-3 sm:px-4 py-4 max-w-2xl text-bx-ink">
        <header className="mb-6">
          <Kicker color="text-bx-blue">SONG SORTER</Kicker>
          <h1 className="text-2xl sm:text-3xl font-bold mb-1 tracking-tight text-bx-ink">
            楽曲ソーター
          </h1>
          <p className="text-xs text-bx-ink3">
            2曲ずつ好きな方を選び続けるだけで、あなただけの楽曲ランキングが完成します。
          </p>
        </header>

        {phase === "select" && (
          <section className="space-y-2">
            {SIZE_OPTIONS.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => start(n)}
                className="w-full text-left rounded-lg border border-bx-line bg-bx-surface/5 hover:border-bx-blue transition-colors p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-bx-ink">
                    {n}曲でランキング
                  </span>
                  <span className="text-xs text-bx-ink3 tabular-nums">
                    比較 約{estimateComparisons(n)}回
                  </span>
                </div>
              </button>
            ))}
            <button
              type="button"
              onClick={() => start(allSongs.length)}
              className="w-full text-left rounded-lg border border-bx-line bg-bx-surface/5 hover:border-bx-blue transition-colors p-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-bx-ink">
                  全{allSongs.length}曲でランキング
                </span>
                <span className="text-xs text-bx-ink3 tabular-nums">
                  比較 約{estimateComparisons(allSongs.length)}回(かなり長丁場です)
                </span>
              </div>
            </button>
          </section>
        )}

        {phase === "sorting" && pair && (
          <section>
            <div className="flex items-center justify-between mb-3 text-xs text-bx-ink3">
              <span>好きな方をタップ</span>
              <span className="tabular-nums">
                {comparisons} / 約{estimatedTotal}回
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[pair[0], pair[1]].map((song, i) => (
                <button
                  key={song.songUuid}
                  type="button"
                  onClick={() => choose(i === 0)}
                  className="rounded-lg border border-bx-line bg-bx-surface/5 hover:border-bx-blue transition-colors p-6 text-center"
                >
                  <p className="text-lg font-bold text-bx-ink">
                    {song.songName}
                  </p>
                </button>
              ))}
            </div>
          </section>
        )}

        {phase === "result" && ranking && (
          <section className="space-y-4">
            <div className="rounded-lg border border-bx-line bg-bx-surface/5 p-4 text-center">
              <p className="text-sm text-bx-ink2">
                全{ranking.length}曲中のあなたのランキングが完成しました
              </p>
            </div>

            <ol className="space-y-1.5">
              {ranking.map((song, i) => {
                const globalRank = globalPlayRank.get(song.songUuid) ?? 0;
                const globalPercentile = globalRank / (allSongs.length - 1 || 1);
                const personalPercentile = i / (ranking.length - 1 || 1);
                // 個人ランキングは上位(小さい)なのに演奏回数ランキングは下位(大きい)
                const isHiddenGem =
                  personalPercentile <= 0.3 && globalPercentile >= 0.6;
                return (
                  <li
                    key={song.songUuid}
                    className={`flex items-center gap-3 rounded-lg border p-2.5 ${
                      isHiddenGem
                        ? "border-bx-yellow bg-bx-yellow/5"
                        : "border-bx-line bg-bx-surface/5"
                    }`}
                  >
                    <span className="w-8 flex-shrink-0 text-center text-sm font-bold text-bx-ink3 tabular-nums">
                      {i + 1}
                    </span>
                    <span className="flex-1 min-w-0 truncate text-sm font-medium text-bx-ink">
                      {song.songName}
                    </span>
                    {isHiddenGem && (
                      <span className="flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-bx-yellow text-bx-bg whitespace-nowrap">
                        生で聴きたい
                      </span>
                    )}
                    <span className="flex-shrink-0 text-[10px] text-bx-ink3 tabular-nums whitespace-nowrap">
                      演奏{song.totalPlays}回
                    </span>
                  </li>
                );
              })}
            </ol>

            <button
              type="button"
              onClick={handleShare}
              className="w-full px-4 py-2 text-sm font-bold rounded-lg border border-bx-blue text-bx-blue hover:bg-bx-blue hover:text-bx-bg transition-colors"
            >
              {copied ? "コピーしました！" : "上位5曲をコピーして共有"}
            </button>

            <button
              type="button"
              onClick={restart}
              className="w-full px-4 py-2 text-sm font-bold rounded-lg border border-bx-line hover:border-bx-blue transition-colors"
            >
              もう一度作る
            </button>
          </section>
        )}

        <p className="mt-6 text-xs text-bx-ink2">
          <Link
            to="/songs/stats/"
            className="underline underline-offset-2 hover:text-bx-blue"
          >
            楽曲統計(演奏回数)を見る →
          </Link>
        </p>
      </main>
    </Layout>
  );
};

export default SongSorterPage;

export const query = graphql`
  query SongSorterData {
    songStats {
      songStats {
        songUuid
        slug
        songName
        totalPlays
      }
    }
  }
`;

export const Head: HeadFC = () => (
  <SEO
    title="楽曲ソーター"
    description="2曲ずつ好きな方を選び続けるだけで作れる、あなただけの楽曲ランキング。演奏回数と人気の意外なギャップも見つかります。"
    path="/songs/sorter/"
    jsonLd={buildBreadcrumbList([
      { name: "ホーム", path: "/" },
      { name: "楽曲ソーター", path: "/songs/sorter/" },
    ])}
  />
);
