import React, { useEffect, useState } from "react";
import { Link, graphql, useStaticQuery } from "gatsby";
import { Kicker } from "../redesign";

/**
 * 「今日は何の日」ウィジェット(トップページ用)。
 *
 * リリース日(discography)と公演日(live items)から、今日と同じ月日の
 * 過去の出来事を「N年前の今日」として表示する。
 *
 * サイトはSSG(ビルド時静的生成)のため「今日」をHTMLに焼き込めない。
 * 全イベントをビルド時にクエリしておき、マウント後にクライアント側で
 * 当日分を抽出する(SSR/初回描画ではnullを返しhydration mismatchを回避)。
 */

type OnThisDayEvent = {
  year: number;
  label: string;
  suffix: string;
  to: string;
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

const OnThisDay: React.FC = () => {
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

  const events: OnThisDayEvent[] = [];

  for (const disc of data?.discography?.discographyWithSongs ?? []) {
    const d = parseDate(disc?.releaseDate);
    if (d && d.monthDay === today.monthDay && d.year < today.year) {
      events.push({
        year: d.year,
        label: `『${disc.title}』`,
        suffix: "リリース",
        to: `/discography/#disc-${disc.slug}`,
      });
    }
  }

  for (const live of data?.live?.liveInfos ?? []) {
    for (const item of live?.items ?? []) {
      const d = parseDate(item?.date);
      if (d && d.monthDay === today.monthDay && d.year < today.year) {
        events.push({
          year: d.year,
          label: live.title,
          suffix: item.place ? ` @ ${item.place}` : "",
          to: `/live/#live-item-${item.slug}`,
        });
      }
    }
  }

  if (events.length === 0) return null;

  events.sort((a, b) => a.year - b.year);

  return (
    <section className="px-2 sm:px-4 pt-12">
      <Kicker color="text-bx-yellow">ON THIS DAY — 今日は何の日</Kicker>
      <ul className="mt-3.5 space-y-2">
        {events.map((ev, i) => (
          <li key={`otd-${i}`}>
            <Link
              to={ev.to}
              className="group flex flex-wrap items-baseline gap-x-3 gap-y-0.5"
            >
              <span className="text-sm font-extrabold text-bx-yellow tabular-nums whitespace-nowrap">
                {today.year - ev.year}年前の今日
              </span>
              <span className="text-[13px] text-bx-ink group-hover:text-bx-blue transition-colors">
                {ev.label}
                {ev.suffix}
                <span className="ml-2 text-[11px] text-bx-ink3 tabular-nums">
                  ({ev.year})
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default OnThisDay;
