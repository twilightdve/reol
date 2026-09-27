import React, { useEffect, useState } from "react";
import { graphql, useStaticQuery } from "gatsby";
import { Kicker } from "../redesign";
import { LangLink, useDict } from "../../i18n/site/SiteLangContext";
import type { SiteDict } from "../../i18n/site/dict";

/**
 * 「今日は何の日」ウィジェット(トップページ用)。
 *
 * リリース日(discography)と公演日(live items)から、今日と同じ月日の
 * 過去の出来事を「N年前の今日」として表示する。
 * 完全一致がない日は段階フォールバック(±2日以内 → 同月 → 直近の未来の記念日)で
 * 何らかの表示を維持し、空表示になる日をなくす。
 *
 * サイトはSSG(ビルド時静的生成)のため「今日」をHTMLに焼き込めない。
 * 全イベントをビルド時にクエリしておき、マウント後にクライアント側で
 * 当日分を抽出する(SSR/初回描画ではnullを返しhydration mismatchを回避)。
 */

type RawEvent = {
  year: number;
  monthDay: string;
  label: string;
  suffix: string;
  to: string;
};

type DisplayMode = "exact" | "near" | "month" | "upcoming";

type DisplayEvent = RawEvent & {
  forward: number; // 今年/来年、次にその月日が来るまでの日数(0=今日)
  backward: number; // 直近にその月日が来てから何日経過したか(0=今日)
};

// "2016-6-6" のようなゼロ埋めなし・範囲表記("A〜B")混在の日付文字列から
// 先頭の日付を { year, monthDay } に正規化する。解釈できなければ null
const parseDate = (
  value: string | null | undefined
): { year: number; monthDay: string } | null => {
  if (!value) return null;
  const m = value.trim().match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (!m) return null;
  return {
    year: parseInt(m[1], 10),
    monthDay: `${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`,
  };
};

const DAY_MS = 86400000;

// "MM-DD" を閏年の影響を受けない基準年での通日(0-364)に変換
const monthDayToDoy = (monthDay: string): number => {
  const [mo, d] = monthDay.split("-").map((v) => parseInt(v, 10));
  return Math.round(
    (Date.UTC(2001, mo - 1, d) - Date.UTC(2001, 0, 1)) / DAY_MS
  );
};

const relativeDayLabel = (
  n: number,
  direction: "past" | "future",
  t: SiteDict["otd"]
): string => {
  if (direction === "past") {
    if (n === 1) return t.yesterday;
    if (n === 2) return t.dayBeforeYesterday;
    return t.daysAgo(n);
  }
  if (n === 1) return t.tomorrow;
  if (n === 2) return t.dayAfterTomorrow;
  return t.daysLater(n);
};

const OnThisDay: React.FC = () => {
  const t = useDict().otd;
  const data = useStaticQuery(graphql`
    query OnThisDayEvents {
      discography {
        discographyWithSongs {
          title
          slug
          releaseDate
        }
      }
      live {
        liveInfos {
          title
          items {
            slug
            date
            place
          }
        }
      }
    }
  `);

  // マウント後に「今日」を確定させる(SSGのHTMLには当日情報を含めない)
  const [today, setToday] = useState<{
    monthDay: string;
    year: number;
  } | null>(null);

  useEffect(() => {
    const now = new Date();
    setToday({
      monthDay: `${String(now.getMonth() + 1).padStart(2, "0")}-${String(
        now.getDate()
      ).padStart(2, "0")}`,
      year: now.getFullYear(),
    });
  }, []);

  if (!today) return null;

  const allEvents: RawEvent[] = [];

  for (const disc of data?.discography?.discographyWithSongs ?? []) {
    const d = parseDate(disc?.releaseDate);
    if (d && d.year < today.year) {
      allEvents.push({
        year: d.year,
        monthDay: d.monthDay,
        label: t.releaseTitle(disc.title),
        suffix: t.releaseSuffix,
        to: `/discography/#disc-${disc.slug}`,
      });
    }
  }

  for (const live of data?.live?.liveInfos ?? []) {
    for (const item of live?.items ?? []) {
      const d = parseDate(item?.date);
      if (d && d.year < today.year) {
        allEvents.push({
          year: d.year,
          monthDay: d.monthDay,
          label: live.title,
          suffix: item.place ? ` @ ${item.place}` : "",
          to: `/live/#live-item-${item.slug}`,
        });
      }
    }
  }

  if (allEvents.length === 0) return null;

  const todayDoy = monthDayToDoy(today.monthDay);
  const withDelta: DisplayEvent[] = allEvents.map((ev) => {
    const doy = monthDayToDoy(ev.monthDay);
    const forward = (doy - todayDoy + 365) % 365;
    const backward = (365 - forward) % 365;
    return { ...ev, forward, backward };
  });

  let mode: DisplayMode = "exact";
  let displayEvents = withDelta.filter((e) => e.forward === 0);

  if (displayEvents.length === 0) {
    const near = withDelta.filter(
      (e) => (e.forward > 0 && e.forward <= 2) || (e.backward > 0 && e.backward <= 2)
    );
    if (near.length > 0) {
      mode = "near";
      displayEvents = near.sort(
        (a, b) => Math.min(a.forward || 99, a.backward || 99) - Math.min(b.forward || 99, b.backward || 99)
      );
    } else {
      const todayMonth = today.monthDay.slice(0, 2);
      const sameMonth = withDelta.filter((e) => e.monthDay.slice(0, 2) === todayMonth);
      if (sameMonth.length > 0) {
        mode = "month";
        displayEvents = sameMonth.sort((a, b) => monthDayToDoy(a.monthDay) - monthDayToDoy(b.monthDay));
      } else {
        mode = "upcoming";
        const minForward = Math.min(...withDelta.map((e) => e.forward));
        displayEvents = withDelta.filter((e) => e.forward === minForward);
      }
    }
  }

  if (displayEvents.length === 0) return null;

  displayEvents = [...displayEvents].sort((a, b) => a.year - b.year);

  const kickerLabel =
    mode === "month" ? t.kickerMonth : t.kickerDay;

  return (
    <section className="px-2 sm:px-4 pt-12">
      <Kicker color="text-bx-yellow">{kickerLabel}</Kicker>
      <ul className="mt-3.5 space-y-2">
        {displayEvents.map((ev, i) => {
          const anniversary = today.year - ev.year;
          let headline: string;
          if (mode === "exact") {
            headline = t.yearsAgoToday(anniversary);
          } else if (mode === "near") {
            headline =
              ev.forward > 0 && ev.forward <= 2
                ? t.anniversaryIn(relativeDayLabel(ev.forward, "future", t), anniversary)
                : t.anniversaryWas(relativeDayLabel(ev.backward, "past", t), anniversary);
          } else if (mode === "month") {
            headline = t.monthEntry(ev.monthDay.replace("-", "/"), anniversary);
          } else {
            headline = t.upcoming(ev.forward, anniversary);
          }

          return (
            <li key={`otd-${i}`}>
              <LangLink
                to={ev.to}
                className="group flex flex-wrap items-baseline gap-x-3 gap-y-0.5"
              >
                <span className="text-sm font-extrabold text-bx-yellow tabular-nums whitespace-nowrap">
                  {headline}
                </span>
                <span className="text-[13px] text-bx-ink group-hover:text-bx-blue transition-colors">
                  {ev.label}
                  {ev.suffix}
                  <span className="ml-2 text-[11px] text-bx-ink3 tabular-nums">
                    ({ev.year})
                  </span>
                </span>
              </LangLink>
            </li>
          );
        })}
      </ul>
      <LangLink
        to={`/on-this-day/${today.monthDay}/`}
        className="mt-3 inline-block text-[11px] text-bx-ink3 hover:text-bx-blueLight transition-colors"
      >
        {t.seeAll}
      </LangLink>
    </section>
  );
};

export default OnThisDay;
