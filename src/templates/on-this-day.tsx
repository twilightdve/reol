import React, { useEffect, useState } from "react";
import { Link, HeadFC, PageProps } from "gatsby";
import Layout from "../components/modules/layout";
import SEO from "../components/SEO";
import { Kicker } from "../components/redesign";

type OnThisDayEvent = {
  year: number;
  label: string;
  suffix: string;
  to: string;
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

        {events.length === 0 ? (
          <p className="text-sm text-bx-ink3 border-t border-bx-line pt-6">
            {label}の記録はまだありません。
          </p>
        ) : (
          <ul className="space-y-3 border-t border-bx-line pt-6">
            {events.map((ev, i) => (
              <li key={`otd-${i}`}>
                <Link
                  to={ev.to}
                  className="group flex flex-wrap items-baseline gap-x-3 gap-y-0.5"
                >
                  <span className="text-sm font-extrabold text-bx-yellow tabular-nums whitespace-nowrap">
                    {ev.year}年
                    {currentYear !== null && currentYear > ev.year && (
                      <span className="ml-1 text-bx-ink3 font-medium">
                        ({currentYear - ev.year}年前)
                      </span>
                    )}
                  </span>
                  <span className="text-[13px] text-bx-ink group-hover:text-bx-blue transition-colors">
                    {ev.label}
                    {ev.suffix}
                  </span>
                </Link>
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
