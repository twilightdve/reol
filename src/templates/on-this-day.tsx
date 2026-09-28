import React, { useEffect, useState } from "react";
import { HeadFC, PageProps } from "gatsby";
import YouTube from "react-youtube";
import Layout from "../components/modules/layout";
import SEO from "../components/SEO";
import { GlassCard, Kicker } from "../components/redesign";
import { shiftMonthDay } from "../utils/monthDay";
import { LangLink as Link, pageDictFor, useDict, usePageDict } from "../i18n/site/SiteLangContext";
import { onThisDayDict } from "../i18n/site/pages/onThisDay";
import { DEFAULT_LANG, isSiteLang } from "../i18n/site/langs";
import { formatLabel } from "../i18n/site/dict";

type OnThisDayDict = (typeof onThisDayDict)["ja"];

/** "MM-DD" を表示言語の「月日」表記にする */
const dayLabelOf = (monthDay: string, t: OnThisDayDict): string => {
  const [mo, d] = monthDay.split("-").map((v) => parseInt(v, 10));
  return t.dayLabel(mo, d);
};

/** "https://youtu.be/xxxx" / "https://www.youtube.com/watch?v=xxxx" からvideoIdを抽出 */
const getYouTubeVideoId = (url: string): string | null => {
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (shortMatch) return shortMatch[1];
  const longMatch = url.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/);
  if (longMatch) return longMatch[1];
  return null;
};

type OnThisDayEvent = {
  kind: "release" | "live";
  year: number;
  label: string;
  suffix: string;
  to: string;
  format: string | null;
  liveType: string | null;
  songCount: number;
  mcCount: number;
  musicVideos: { name: string; slug: string; url: string }[];
  setlist: { name: string; slug: string | null }[];
};

/** 出来事が無い日に表示する「近い日の出来事」(前後7日以内) */
type NearbyEvent = {
  monthDay: string; // "MM-DD"
  kind: "release" | "live";
  year: number;
  label: string;
  suffix: string;
  to: string;
};

type OnThisDayPageContext = {
  monthDay: string; // "MM-DD"
  events: OnThisDayEvent[];
  /** 出来事が無い日は検索結果に出さない(サイトマップからも除外) */
  noindex: boolean;
  nearbyEvents: NearbyEvent[];
  lang?: string;
};

const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
// 曜日レイアウト計算のためだけの固定基準年(実在の年月とは無関係な「MM-DD」の
// 巡回カレンダーなので、閲覧時の実年とはあえて連動させない=ハイドレーション
// ミスマッチも起きない)。
const CALENDAR_LAYOUT_REF_YEAR = 2025;

/** その月の1日が何曜日か(0=日)を、閲覧年に依存しない固定基準年で求める。 */
const firstWeekdayOfMonth = (month: number): number =>
  new Date(Date.UTC(CALENDAR_LAYOUT_REF_YEAR, month - 1, 1)).getUTCDay();

const MonthCalendar: React.FC<{
  month: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  index: Record<string, number> | null;
  currentMonthDay: string;
}> = ({ month, onPrevMonth, onNextMonth, index, currentMonthDay }) => {
  const t = usePageDict(onThisDayDict);
  const daysInMonth = DAYS_IN_MONTH[month - 1];
  const leadingBlanks = firstWeekdayOfMonth(month);
  const cells: (number | null)[] = [
    ...Array(leadingBlanks).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="mb-6 rounded-lg border border-bx-line p-3">
      <div className="flex items-center justify-between mb-2">
        <button
          type="button"
          onClick={onPrevMonth}
          aria-label={t.prevMonth}
          className="w-7 h-7 rounded-full text-bx-ink2 hover:text-bx-blue transition-colors"
        >
          ◀
        </button>
        <div className="text-sm font-bold text-bx-ink">{t.monthLabel(month)}</div>
        <button
          type="button"
          onClick={onNextMonth}
          aria-label={t.nextMonth}
          className="w-7 h-7 rounded-full text-bx-ink2 hover:text-bx-blue transition-colors"
        >
          ▶
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {t.weekdays.map((w) => (
          <div key={w} className="text-[10px] text-bx-ink3 py-1">
            {w}
          </div>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <div key={`blank-${i}`} />;
          const monthDayStr = `${String(month).padStart(2, "0")}-${String(
            day
          ).padStart(2, "0")}`;
          const count = index?.[monthDayStr] ?? 0;
          const isCurrent = monthDayStr === currentMonthDay;
          return (
            <Link
              key={monthDayStr}
              to={`/on-this-day/${monthDayStr}/`}
              title={count > 0 ? t.eventCount(count) : undefined}
              className={`flex items-center justify-center rounded py-1.5 text-xs font-bold border-2 transition-colors ${
                isCurrent
                  ? "bg-bx-yellow border-bx-yellow text-bx-bg"
                  : count > 0
                  ? "border-bx-yellow text-bx-ink hover:bg-bx-yellow/15"
                  : "border-transparent text-bx-ink3 hover:bg-bx-surface/10 font-medium"
              }`}
            >
              {day}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

const OnThisDayPage: React.FC<PageProps<object, OnThisDayPageContext>> = ({
  pageContext,
}) => {
  const { monthDay, events, nearbyEvents } = pageContext;
  const t = usePageDict(onThisDayDict);
  const dict = useDict();
  const metaOf = (ev: OnThisDayEvent): string | null => {
    const parts =
      ev.kind === "release"
        ? [ev.format ? formatLabel(dict, ev.format) : null, t.tracks(ev.songCount)]
        : [
            ev.liveType ? t.liveTypes[ev.liveType] ?? ev.liveType : null,
            ev.songCount > 0 ? t.liveSongs(ev.songCount, ev.mcCount) : null,
          ];
    const filtered = parts.filter((v): v is string => !!v);
    return filtered.length > 0 ? filtered.join(t.metaSeparator) : null;
  };
  // リリースは「『作品名』リリース」、ライブは「公演名 @ 会場名」
  const suffixOf = (ev: { kind: "release" | "live"; suffix: string }) =>
    ev.kind === "release" ? t.released : ev.suffix;
  const prevMonthDay = shiftMonthDay(monthDay, -1);
  const nextMonthDay = shiftMonthDay(monthDay, 1);
  const label = dayLabelOf(monthDay, t);

  // 「N年前」の相対表示はビルド日ではなく閲覧時の年を基準にしたいため、
  // マウント後にのみ計算する(イベント一覧自体はSSRの時点から出す)。
  const [currentYear, setCurrentYear] = useState<number | null>(null);
  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  // カレンダーの「どの日にマークが付くか」用インデックス。365ページそれぞれに
  // 埋め込むと重複が大きいため、別ファイルとして1回だけ取得する。
  const [calendarIndex, setCalendarIndex] = useState<Record<
    string,
    number
  > | null>(null);
  useEffect(() => {
    fetch("/static/data/on-this-day-index.json")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setCalendarIndex(data))
      .catch(() => {
        /* カレンダーのマークが出ないだけなので握りつぶす */
      });
  }, []);

  const [calendarMonth, setCalendarMonth] = useState(
    parseInt(monthDay.slice(0, 2), 10)
  );

  // タップされたMVだけ実際のiframeに差し替える(mainVideo.tsxと同じファサード方式)。
  // サムネイル(静的画像)は常時表示し、ネットワーク負荷や意図しない自動再生を避ける。
  const [activatedMv, setActivatedMv] = useState<Set<string>>(new Set());
  const activateMv = (key: string) =>
    setActivatedMv((prev) => new Set(prev).add(key));

  return (
    <Layout title={t.title(label)}>
      <main className="container mx-auto px-3 sm:px-4 py-4 max-w-2xl text-bx-ink">
        <header className="mb-6">
          <Kicker color="text-bx-yellow">ON THIS DAY</Kicker>
          <h1 className="text-2xl sm:text-3xl font-bold mb-1 tracking-tight text-bx-ink">
            {t.title(label)}
          </h1>
          <p className="text-xs text-bx-ink3">
            {t.lead(label)}
          </p>
        </header>

        <nav className="flex items-center justify-between mb-6 text-sm">
          <Link
            to={`/on-this-day/${prevMonthDay}/`}
            className="text-bx-blueLight hover:text-bx-blue font-medium"
          >
            ← {dayLabelOf(prevMonthDay, t)}
          </Link>
          <Link
            to={`/on-this-day/${nextMonthDay}/`}
            className="text-bx-blueLight hover:text-bx-blue font-medium"
          >
            {dayLabelOf(nextMonthDay, t)} →
          </Link>
        </nav>

        <MonthCalendar
          month={calendarMonth}
          onPrevMonth={() =>
            setCalendarMonth((m) => (m === 1 ? 12 : m - 1))
          }
          onNextMonth={() =>
            setCalendarMonth((m) => (m === 12 ? 1 : m + 1))
          }
          index={calendarIndex}
          currentMonthDay={monthDay}
        />

        {events.length === 0 ? (
          <div className="border-t border-bx-line pt-6">
            <p className="text-sm text-bx-ink3">{t.empty(label)}</p>
            {nearbyEvents.length > 0 && (
              <section className="mt-6">
                <h2 className="text-sm font-bold text-bx-ink mb-3">{t.nearbyHeading}</h2>
                <ul className="space-y-2">
                  {nearbyEvents.map((ev, i) => (
                    <li key={`nearby-${i}`}>
                      <GlassCard
                        accent={ev.kind === "release" ? "blueLight" : "yellow"}
                        className="p-3"
                      >
                        <Link
                          to={`/on-this-day/${ev.monthDay}/`}
                          className="text-xs font-bold text-bx-blueLight hover:text-bx-blue"
                        >
                          {dayLabelOf(ev.monthDay, t)}
                        </Link>
                        <span className="ml-2 text-xs text-bx-ink3 tabular-nums">{t.year(ev.year)}</span>
                        <Link
                          to={ev.to}
                          className="block mt-0.5 text-[13px] text-bx-ink hover:text-bx-blue transition-colors truncate"
                        >
                          {ev.kind === "release" ? "♪ " : "🎤 "}
                          {ev.label}
                          {suffixOf(ev)}
                        </Link>
                      </GlassCard>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        ) : (
          <ul className="space-y-3 border-t border-bx-line pt-6">
            {events.map((ev, i) => (
              <li key={`otd-${i}`}>
                <GlassCard
                  accent={ev.kind === "release" ? "blueLight" : "yellow"}
                  className="p-3"
                >
                  <Link
                    to={ev.to}
                    className="group flex items-center gap-3"
                  >
                    <div
                      aria-hidden
                      className={`w-14 h-14 flex-shrink-0 rounded flex items-center justify-center text-lg font-extrabold ${
                        ev.kind === "release"
                          ? "bg-bx-blueLight/15 text-bx-blueLight"
                          : "bg-bx-yellow/15 text-bx-yellow"
                      }`}
                    >
                      {ev.kind === "release" ? "♪" : "🎤"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-sm font-extrabold text-bx-yellow tabular-nums whitespace-nowrap">
                        {t.year(ev.year)}
                        {currentYear !== null && currentYear > ev.year && (
                          <span className="ml-1 text-bx-ink3 font-medium">
                            {t.yearsAgo(currentYear - ev.year)}
                          </span>
                        )}
                      </span>
                      <div className="text-[13px] text-bx-ink group-hover:text-bx-blue transition-colors truncate">
                        {ev.label}
                        {suffixOf(ev)}
                      </div>
                      {metaOf(ev) && (
                        <div className="text-[11px] text-bx-ink3 mt-0.5 truncate">
                          {metaOf(ev)}
                        </div>
                      )}
                    </div>
                  </Link>

                  {ev.musicVideos.length > 0 && (
                    <div className="mt-2.5 pt-2.5 border-t border-bx-line space-y-3">
                      {ev.musicVideos.map((mv) => {
                        const key = `${i}-${mv.slug}`;
                        const videoId = getYouTubeVideoId(mv.url);
                        if (!videoId) return null;
                        const isActive = activatedMv.has(key);
                        return (
                          <div key={mv.slug}>
                            <div className="text-[11px] text-bx-ink3 mb-1">
                              {t.mv(mv.name)}
                            </div>
                            <div
                              className="relative rounded-lg overflow-hidden border border-bx-line bg-black"
                              style={{ paddingBottom: "56.25%", height: 0 }}
                            >
                              {isActive ? (
                                <YouTube
                                  videoId={videoId}
                                  opts={{
                                    width: "100%",
                                    height: "100%",
                                    playerVars: { autoplay: 1 },
                                  }}
                                  style={{
                                    position: "absolute",
                                    inset: 0,
                                    width: "100%",
                                    height: "100%",
                                  }}
                                />
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => activateMv(key)}
                                  aria-label={t.playMv(mv.name)}
                                  className="group absolute inset-0 w-full h-full"
                                >
                                  <img
                                    src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                                    alt=""
                                    loading="lazy"
                                    className="absolute inset-0 w-full h-full object-cover"
                                  />
                                  <span className="absolute inset-0 flex items-center justify-center bg-black/25 group-hover:bg-black/15 transition-colors">
                                    <span className="w-12 h-12 rounded-full bg-bx-yellow/90 flex items-center justify-center text-bx-bg text-xl shadow-lg">
                                      ▶
                                    </span>
                                  </span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {ev.setlist.length > 0 && (
                    <div className="mt-2.5 pt-2.5 border-t border-bx-line">
                      <div className="text-[11px] text-bx-ink3 mb-1.5">
                        {t.setlist(ev.setlist.length)}
                      </div>
                      <ol className="space-y-1 text-[12px] text-bx-ink2">
                        {ev.setlist.map((s, si) =>
                          s.slug ? (
                            <li key={si}>
                              <Link
                                to={`/songs/${s.slug}/`}
                                className="hover:text-bx-blue transition-colors"
                              >
                                {si + 1}. {s.name}
                              </Link>
                            </li>
                          ) : (
                            <li key={si}>
                              {si + 1}. {s.name}
                            </li>
                          )
                        )}
                      </ol>
                    </div>
                  )}

                  <div className="mt-2.5 pt-2.5 border-t border-bx-line text-right">
                    <Link
                      to={ev.to}
                      className={`inline-flex items-center gap-1 text-[11px] font-bold ${
                        ev.kind === "release"
                          ? "text-bx-blueLight hover:text-bx-blue"
                          : "text-bx-yellow hover:text-bx-blue"
                      } transition-colors`}
                    >
                      {t.details}
                    </Link>
                  </div>
                </GlassCard>
              </li>
            ))}
          </ul>
        )}
      </main>
    </Layout>
  );
};

export default OnThisDayPage;

export const Head: HeadFC<object, OnThisDayPageContext> = ({
  pageContext,
}) => {
  const lang = isSiteLang(pageContext.lang) ? pageContext.lang : DEFAULT_LANG;
  const t = pageDictFor(onThisDayDict, lang);
  const label = dayLabelOf(pageContext.monthDay, t);
  return (
    <>
      <SEO
        title={t.title(label)}
        description={t.lead(label)}
        path={`/on-this-day/${pageContext.monthDay}/`}
        lang={lang}
        image={
          pageContext.events.length > 0
            ? `https://reol.twilightea.com/og/on-this-day/${pageContext.monthDay}.jpg`
            : undefined
        }
      />
      {pageContext.noindex && <meta name="robots" content="noindex,follow" />}
    </>
  );
};
