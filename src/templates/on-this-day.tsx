import React, { useEffect, useState } from "react";
import { Link, HeadFC, PageProps } from "gatsby";
import Layout from "../components/modules/layout";
import SEO from "../components/SEO";
import { GlassCard, Kicker } from "../components/redesign";

type OnThisDayEvent = {
  kind: "release" | "live";
  year: number;
  label: string;
  suffix: string;
  to: string;
  meta: string | null;
};

type OnThisDayPageContext = {
  monthDay: string; // "MM-DD"
  events: OnThisDayEvent[];
};

const DAY_MS = 86400000;

/** "MM-DD" を閏年の影響を受けない基準年(2001年)での通日に変換して前後にずらし、"MM-DD" へ戻す。 */
const shiftMonthDay = (monthDay: string, deltaDays: number): string => {
  const [mo, d] = monthDay.split("-").map((v) => parseInt(v, 10));
  const base = Date.UTC(2001, mo - 1, d);
  const shifted = new Date(base + deltaDays * DAY_MS);
  const nextMo = String(shifted.getUTCMonth() + 1).padStart(2, "0");
  const nextD = String(shifted.getUTCDate()).padStart(2, "0");
  return `${nextMo}-${nextD}`;
};

const formatMonthDayLabel = (monthDay: string): string => {
  const [mo, d] = monthDay.split("-").map((v) => parseInt(v, 10));
  return `${mo}月${d}日`;
};

const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];
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
          aria-label="前の月"
          className="w-7 h-7 rounded-full text-bx-ink2 hover:text-bx-blue transition-colors"
        >
          ◀
        </button>
        <div className="text-sm font-bold text-bx-ink">{month}月</div>
        <button
          type="button"
          onClick={onNextMonth}
          aria-label="次の月"
          className="w-7 h-7 rounded-full text-bx-ink2 hover:text-bx-blue transition-colors"
        >
          ▶
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAY_LABELS.map((w) => (
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
              title={count > 0 ? `${count}件のできごと` : undefined}
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
  const { monthDay, events } = pageContext;
  const prevMonthDay = shiftMonthDay(monthDay, -1);
  const nextMonthDay = shiftMonthDay(monthDay, 1);
  const label = formatMonthDayLabel(monthDay);

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

  return (
    <Layout title={`${label}は何の日`}>
      <main className="container mx-auto px-3 sm:px-4 py-4 max-w-2xl text-bx-ink">
        <header className="mb-6">
          <Kicker color="text-bx-yellow">ON THIS DAY</Kicker>
          <h1 className="text-2xl sm:text-3xl font-bold mb-1 tracking-tight text-bx-ink">
            {label}は何の日
          </h1>
          <p className="text-xs text-bx-ink3">
            Reolのリリース・ライブ公演から、{label}に起きた出来事を年代順にまとめています。
          </p>
        </header>

        <nav className="flex items-center justify-between mb-6 text-sm">
          <Link
            to={`/on-this-day/${prevMonthDay}/`}
            className="text-bx-blueLight hover:text-bx-blue font-medium"
          >
            ← {formatMonthDayLabel(prevMonthDay)}
          </Link>
          <Link
            to={`/on-this-day/${nextMonthDay}/`}
            className="text-bx-blueLight hover:text-bx-blue font-medium"
          >
            {formatMonthDayLabel(nextMonthDay)} →
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
          <p className="text-sm text-bx-ink3 border-t border-bx-line pt-6">
            {label}の記録はまだありません。
          </p>
        ) : (
          <ul className="space-y-3 border-t border-bx-line pt-6">
            {events.map((ev, i) => (
              <li key={`otd-${i}`}>
                <GlassCard
                  to={ev.to}
                  accent={ev.kind === "release" ? "blueLight" : "yellow"}
                  className="flex items-center gap-3 p-3"
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
                      {ev.year}年
                      {currentYear !== null && currentYear > ev.year && (
                        <span className="ml-1 text-bx-ink3 font-medium">
                          ({currentYear - ev.year}年前)
                        </span>
                      )}
                    </span>
                    <div className="text-[13px] text-bx-ink group-hover:text-bx-blue transition-colors truncate">
                      {ev.label}
                      {ev.suffix}
                    </div>
                    {ev.meta && (
                      <div className="text-[11px] text-bx-ink3 mt-0.5 truncate">
                        {ev.meta}
                      </div>
                    )}
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
  const label = formatMonthDayLabel(pageContext.monthDay);
  return (
    <SEO
      title={`${label}は何の日`}
      description={`Reolのリリース・ライブ公演から、${label}に起きた出来事を年代順にまとめています。`}
      path={`/on-this-day/${pageContext.monthDay}/`}
    />
  );
};
