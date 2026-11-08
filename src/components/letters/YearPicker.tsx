/**
 * 手紙の宛先を、この一年の思い出(ライヴ・作品の発売・MV の公開)から選ぶ(plan/64)。
 * 種類で切り替え、月ごとに並べる。ここに無い思い出(昔の曲など)は「選ばずに書く」で、この一年の Reol へ。
 */
import React, { useState } from "react";
import { Link } from "gatsby";
import { MONTH_NAMES, YEAR_ERA_EVENT, YEAR_EVENTS, YearEvent, YearTab, yearMonths } from "../../utils/letters/yearEvents";

const TABS: { id: YearTab; label: string; act: string }[] = [
  { id: "live", label: "ライヴ", act: "このライヴの" },
  { id: "release", label: "作品", act: "この作品の" },
  { id: "mv", label: "MV", act: "このMVの" },
];

export const YearPicker: React.FC<{ selectedKey: string | null; counts: Record<string, number>; onChoose: (e: YearEvent) => void }> = ({
  selectedKey,
  counts,
  onChoose,
}) => {
  const selectedTab = YEAR_EVENTS.find((e) => e.key === selectedKey)?.tab ?? null;
  const [tab, setTab] = useState<YearTab>(selectedTab ?? "live");
  const act = TABS.find((t) => t.id === tab)?.act ?? "";
  const months = yearMonths(YEAR_EVENTS.filter((e) => e.tab === tab));

  return (
    <div className="lp-year-picker">
      <div className="lp-song-skip">
        <p className="lp-note">
          去年の誕生日から今年の誕生日まで(2025.11.09 — 2026.11.09)の、ライヴ・作品・MV から選べます。昔の曲など、ここに無い思い出は「選ばずに書く」で。
        </p>
        <button type="button" className="lp-secondary" aria-pressed={selectedKey === YEAR_ERA_EVENT.key} onClick={() => onChoose(YEAR_ERA_EVENT)}>
          選ばずに書く(この一年のReolへ) <span aria-hidden>→</span>
        </button>
      </div>
      <div className="lp-chips lp-year-tabs" role="group" aria-label="思い出の種類">
        {TABS.map((t) => (
          <button key={t.id} type="button" className="lp-chip" aria-pressed={tab === t.id} onClick={() => setTab(t.id)}>
            {t.label} <small>{YEAR_EVENTS.filter((e) => e.tab === t.id).length}</small>
          </button>
        ))}
      </div>
      <div className="lp-tl">
        {months.map((m) => (
          <React.Fragment key={m.key}>
            <div className="lp-tl-year">
              {m.year} <small>{MONTH_NAMES[m.month - 1]}</small>
            </div>
            {m.items.map((e) => {
              const n = counts[e.key] ?? 0;
              const selected = selectedKey === e.key;
              return (
                <article key={e.key} className={`lp-row${selected ? " is-selected" : ""}`}>
                  <div className="lp-row-date">{e.date.slice(5).replace("-", ".")}</div>
                  <div>
                    <h3>{e.title}</h3>
                    <p>{e.sub}</p>
                  </div>
                  <div className="lp-row-act">
                    <button type="button" onClick={() => onChoose(e)} aria-pressed={selected} aria-label={`${e.title}の思い出を書く`}>
                      {selected ? "選んでいます" : `${act}思い出を書く ↗`}
                    </button>
                    {n > 0 && (
                      <Link className="lp-row-count" to={`/letters/read/?event=${encodeURIComponent(e.key)}`}>
                        届いた手紙 {n}通
                      </Link>
                    )}
                  </div>
                </article>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
