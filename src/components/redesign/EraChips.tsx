import React from "react";
import { Link } from "gatsby";
import Kicker from "./Kicker";
import { GlassCardAccent } from "./GlassCard";

/**
 * B案「BLACKBOX / CHRONICLE」の CHRONICLE セクション。
 * design-preview/b.tsx の ERAS + YEAR_TICKS(年代チップ3枚+年表レール)と同構成。
 * 遷移先はすべて /timeline/。
 */
interface Era {
  color: GlassCardAccent;
  years: string;
  name: string;
  desc: string;
}

const ERAS: Era[] = [
  {
    color: "blue",
    years: "2012–2014",
    name: "れをる時代",
    desc: "ニコニコ動画・歌ってみた",
  },
  {
    color: "yellow",
    years: "2015–2016",
    name: "REOL",
    desc: "ユニット期・ΣMPATHY〜Σ",
  },
  {
    color: "ink",
    years: "2017–NOW",
    name: "Reol",
    desc: "ソロ期・事変〜BLACK BOX〜現在",
  },
];

const TEXT_COLOR: Record<GlassCardAccent, string> = {
  blue: "text-bx-blue",
  blueDeep: "text-bx-blueDeep",
  blueLight: "text-bx-blueLight",
  yellow: "text-bx-yellow",
  ink: "text-bx-ink",
};

const BORDER_HOVER: Record<GlassCardAccent, string> = {
  blue: "hover:border-bx-blue",
  blueDeep: "hover:border-bx-blueDeep",
  blueLight: "hover:border-bx-blueLight",
  yellow: "hover:border-bx-yellow",
  ink: "hover:border-bx-ink",
};

interface YearTick {
  year: number;
  left: string;
  now?: boolean;
}

const YEAR_TICKS: YearTick[] = [
  { year: 2012, left: "0%" },
  { year: 2015, left: "21.5%" },
  { year: 2018, left: "43%" },
  { year: 2021, left: "64.5%" },
  { year: 2024, left: "86%" },
  { year: 2026, left: "100%", now: true },
];

const EraChips: React.FC = () => (
  <section>
    <Kicker>CHRONICLE — 年代から遡る</Kicker>
    <div className="flex gap-2.5 overflow-x-auto pb-1.5 mt-3.5">
      {ERAS.map((era) => (
        <Link
          key={era.name}
          to="/timeline/"
          className={`flex-shrink-0 min-w-[168px] rounded-lg px-4 py-3 border border-bx-line bg-white/[0.035] transition-colors ${BORDER_HOVER[era.color]}`}
        >
          <p
            className={`text-[10.5px] font-extrabold tracking-[0.14em] ${TEXT_COLOR[era.color]}`}
          >
            {era.years}
          </p>
          <p className="mt-1 text-sm font-bold text-bx-ink">{era.name}</p>
          <p className="text-[11px] text-bx-ink3">{era.desc}</p>
        </Link>
      ))}
    </div>
    <div aria-hidden className="relative h-7 mt-3.5">
      <span className="absolute left-0 right-0 top-3 h-px bg-bx-line" />
      {YEAR_TICKS.map((tick) => (
        <span
          key={tick.year}
          className={`absolute top-0 -translate-x-1/2 text-[9px] tracking-wider tabular-nums ${
            tick.now ? "font-extrabold text-bx-yellow" : "text-bx-ink3"
          }`}
          style={{ left: tick.left }}
        >
          {tick.year}
          <span
            className={`absolute left-1/2 top-[14px] ${
              tick.now ? "h-2 w-0.5 bg-bx-yellow" : "h-[5px] w-px bg-bx-ink3"
            }`}
          />
        </span>
      ))}
    </div>
  </section>
);

export default EraChips;
