/**
 * /timemachine/ — 新規コンテンツ案E「タイムマシン」(plan/legit-improvement-plan.md 5章)
 *
 * 日付(月単位)スライダーで、その時点までの楽曲数・ライブ数・演奏数・最新リリース・
 * 次のライブを再構築する。数値は gatsby-node.ts が SiteStats/SongStats と同じ
 * 集計対象(名寄せ済みsongStats、segment除外済みliveItemSongs)を月末カットオフで
 * 絞り込んで事前計算した static/data/timemachine.json を読むだけで、
 * ここでは別ロジックの再集計をしない(「サイト内の数字が一致しない」問題の再発防止)。
 *
 * 楽曲数・ライブ数は「その時点までに演奏/開催済み」のみをカウントするため、
 * 最新(今月)のスナップショットでも TOP の全期間カウント(未演奏曲や未来の予定公演を
 * 含む)とは意図的に一致しない。
 */
import React, { useEffect, useMemo, useState } from "react";
import { Link, HeadFC } from "gatsby";
import SEO from "../components/SEO";
import { buildBreadcrumbList } from "../utils/jsonLd";
import { GlassCard, Kicker } from "../components/redesign";
import { trackEvent } from "../utils/analytics";

type Snapshot = {
  month: string; // "2016-08"
  songCount: number;
  liveItemCount: number;
  performanceCount: number;
  latestRelease: { title: string; slug: string; releaseDate: string } | null;
  nextLive: {
    title: string | null;
    itemName: string | null;
    date: string | null;
    place: string | null;
    liveSlug: string | null;
  } | null;
};

const formatMonth = (month: string): string => {
  const m = month.match(/^(\d{4})-(\d{2})$/);
  if (!m) return month;
  return `${m[1]}年${parseInt(m[2], 10)}月`;
};

const formatDate = (iso: string | null): string => {
  if (!iso) return "";
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[1]}.${m[2]}.${m[3]}` : iso;
};

const fetchJson = async <T,>(url: string): Promise<T> => {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${url}: ${r.status}`);
  return r.json();
};

const TimeMachinePage: React.FC = () => {
  const [snapshots, setSnapshots] = useState<Snapshot[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [index, setIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchJson<{ snapshots: Snapshot[] }>("/static/data/timemachine.json")
      .then((data) => {
        setSnapshots(data.snapshots);
        setIndex(data.snapshots.length - 1);
      })
      .catch((e) => setError(String(e)));
  }, []);

  useEffect(() => {
    trackEvent("section_view", { category: "navigation", label: "timemachine" });
  }, []);

  const current = useMemo(
    () => (snapshots && index !== null ? snapshots[index] : null),
    [snapshots, index]
  );

  const goTo = (next: number) => {
    if (!snapshots) return;
    const clamped = Math.max(0, Math.min(snapshots.length - 1, next));
    setIndex(clamped);
    trackEvent("timemachine_scrub", {
      category: "engagement",
      label: snapshots[clamped]?.month,
    });
  };

  if (error) {
    return (
      <main className="relative container mx-auto w-full max-w-2xl px-3 sm:px-4 py-6 text-bx-ink">
        <p className="text-sm text-bx-ink2">読み込みに失敗しました: {error}</p>
      </main>
    );
  }

  return (
    <main className="relative container mx-auto w-full max-w-2xl px-3 sm:px-4 py-6 text-bx-ink space-y-5">
      <section>
        <Kicker color="text-bx-blue">TIME MACHINE</Kicker>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-bx-ink mt-1 mb-2">
          タイムマシン
        </h1>
        <p className="text-sm leading-relaxed text-bx-ink2">
          スライダーで年月を選ぶと、その時点までのReolの歩みを再現します。
          今と同じ「楽曲数・ライブ数・演奏数」が、当時はどれだけだったかを辿れます。
        </p>
      </section>

      {!current ? (
        <div className="rounded-lg border border-bx-line bg-bx-surface/5 p-6 text-center text-sm text-bx-ink3">
          読み込み中...
        </div>
      ) : (
        <>
          <section className="rounded-lg border border-bx-line bg-bx-surface/5 p-4 sm:p-5">
            <div className="flex items-center justify-center gap-3 sm:gap-5">
              <button
                type="button"
                onClick={() => goTo((index ?? 0) - 1)}
                disabled={index === 0}
                aria-label="前の月"
                className="flex-shrink-0 w-9 h-9 rounded-full border border-bx-line text-bx-ink2 hover:text-bx-blue hover:border-bx-blue disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                ◀
              </button>
              <div className="text-xl sm:text-2xl font-extrabold tracking-wide text-bx-ink tabular-nums">
                {formatMonth(current.month)}
              </div>
              <button
                type="button"
                onClick={() => goTo((index ?? 0) + 1)}
                disabled={!!snapshots && index === snapshots.length - 1}
                aria-label="次の月"
                className="flex-shrink-0 w-9 h-9 rounded-full border border-bx-line text-bx-ink2 hover:text-bx-blue hover:border-bx-blue disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                ▶
              </button>
            </div>

            <input
              type="range"
              min={0}
              max={(snapshots?.length ?? 1) - 1}
              value={index ?? 0}
              onChange={(e) => goTo(Number(e.target.value))}
              aria-label="年月を選択"
              className="w-full mt-4 accent-bx-yellow"
            />
            <div className="flex justify-between text-[10px] text-bx-ink3 mt-1">
              <span>{snapshots && formatMonth(snapshots[0].month)}</span>
              <span>{snapshots && formatMonth(snapshots[snapshots.length - 1].month)}</span>
            </div>
          </section>

          <section className="grid grid-cols-3 gap-2 sm:gap-3">
            {[
              { label: "演奏済み楽曲", value: current.songCount },
              { label: "開催済みライブ", value: current.liveItemCount },
              { label: "延べ演奏回数", value: current.performanceCount },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-lg border border-bx-line bg-bx-surface/5 p-3 text-center"
              >
                <div className="text-xl sm:text-2xl font-extrabold text-bx-yellow tabular-nums">
                  {stat.value.toLocaleString()}
                </div>
                <div className="mt-1 text-[10px] font-bold tracking-wide text-bx-ink3">
                  {stat.label}
                </div>
              </div>
            ))}
          </section>

          <section className="space-y-3">
            {current.latestRelease ? (
              <GlassCard
                to={`/discography/#disc-${current.latestRelease.slug}`}
                accent="blue"
                className="p-4"
              >
                <div className="text-[10px] font-bold tracking-wide text-bx-ink3 mb-1">
                  最新リリース ({formatDate(current.latestRelease.releaseDate)})
                </div>
                <div className="text-base font-bold text-bx-ink">
                  {current.latestRelease.title}
                </div>
              </GlassCard>
            ) : (
              <div className="rounded-lg border border-bx-line bg-bx-surface/5 p-4 text-sm text-bx-ink3">
                この時点ではまだリリースがありません。
              </div>
            )}

            {current.nextLive ? (
              <GlassCard
                to={
                  current.nextLive.liveSlug
                    ? `/live/#live-${current.nextLive.liveSlug}`
                    : "/live/"
                }
                accent="yellow"
                className="p-4"
              >
                <div className="text-[10px] font-bold tracking-wide text-bx-ink3 mb-1">
                  この時点での次のライブ ({formatDate(current.nextLive.date)})
                </div>
                <div className="text-base font-bold text-bx-ink">
                  {current.nextLive.title}
                  {current.nextLive.itemName ? ` ${current.nextLive.itemName}` : ""}
                </div>
                {current.nextLive.place && (
                  <div className="text-xs text-bx-ink2 mt-0.5">
                    {current.nextLive.place}
                  </div>
                )}
              </GlassCard>
            ) : (
              <div className="rounded-lg border border-bx-line bg-bx-surface/5 p-4 text-sm text-bx-ink3">
                これ以降のライブ予定はまだ登録されていません。
              </div>
            )}
          </section>
        </>
      )}

      <p className="text-xs text-bx-ink2">
        <Link to="/about/data/" className="underline underline-offset-2 hover:text-bx-blue">
          集計ルールについて →
        </Link>
      </p>
    </main>
  );
};

export default TimeMachinePage;

export const Head: HeadFC = () => (
  <SEO
    title="タイムマシン"
    description="年月スライダーで、その時点までのReolの楽曲数・ライブ数・演奏数・最新リリース・次のライブを辿れます。"
    path="/timemachine/"
    jsonLd={buildBreadcrumbList([
      { name: "ホーム", path: "/" },
      { name: "タイムマシン", path: "/timemachine/" },
    ])}
  />
);
