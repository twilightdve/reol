/**
 * 宛先を選ぶ年表(plan/64)。今から過去へ。年の移動・検索・種類の絞り込み。
 * 時代そのもの(れをる / REOL / Reol)にも宛てられる。
 */
import React, { useMemo, useState } from "react";
import { Link } from "gatsby";
import { ERA_EVENTS, LetterEvent } from "../../utils/letters/timeline";

type Kind = "all" | "release" | "live" | "cover";
const KINDS: { id: Kind; label: string }[] = [
  { id: "all", label: "すべて" },
  { id: "release", label: "作品" },
  { id: "live", label: "ライヴ" },
  { id: "cover", label: "歌ってみた" },
];

const PAGE = 60;

export const LetterTimeline: React.FC<{
  events: LetterEvent[];
  selectedKey: string | null;
  counts: Record<string, number>;
  onChoose: (e: LetterEvent) => void;
}> = ({ events, selectedKey, counts, onChoose }) => {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<Kind>("all");
  const [limit, setLimit] = useState(PAGE);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return events.filter((e) => (kind === "all" || e.kind === kind) && (!q || e.searchText.includes(q)));
  }, [events, query, kind]);
  const shown = query.trim() ? filtered : filtered.slice(0, limit);
  const allYears = useMemo(() => Array.from(new Set(filtered.map((e) => e.date.slice(0, 4)))), [filtered]);

  // 年の移動で、まだ出していない年へ飛ぶ時は、その年まで出す
  const jumpTo = (year: string) => {
    const idx = filtered.findIndex((e) => e.date.startsWith(year));
    if (idx >= limit) setLimit(Math.ceil((idx + 1) / PAGE) * PAGE + PAGE);
    window.requestAnimationFrame(() => document.getElementById(`lp-year-${year}`)?.scrollIntoView({ block: "start" }));
  };

  let lastYear = "";
  return (
    <>
      <div className="lp-eras" role="group" aria-label="時代へ宛てる">
        {ERA_EVENTS.map((e) => (
          <button key={e.key} type="button" className="lp-era" aria-pressed={selectedKey === e.key} onClick={() => onChoose(e)}>
            <b>{e.title}へ</b>
            <small>{e.key === "era:reol" ? "いまの活動と、これからに" : e.key === "era:unit" ? "ユニット REOL の日々に" : "れをるとして歌っていた頃に"}</small>
          </button>
        ))}
      </div>
      <div className="lp-tl-tools">
        <label className="lp-search">
          <span className="sr-only">曲名・作品名・ライヴ名で探す</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="曲名・作品名・ライヴ名で探す"
            enterKeyHint="search"
          />
        </label>
        <div className="lp-chips" role="group" aria-label="種類">
          {KINDS.map((k) => (
            <button key={k.id} type="button" className="lp-chip" aria-pressed={kind === k.id} onClick={() => setKind(k.id)}>
              {k.label}
            </button>
          ))}
        </div>
      </div>
      <div className="lp-tl-layout">
        <nav className="lp-years" aria-label="年へ移動">
          {allYears.map((y) => (
            <a
              key={y}
              href={`#lp-year-${y}`}
              onClick={(ev) => {
                ev.preventDefault();
                jumpTo(y);
              }}
            >
              {y}
            </a>
          ))}
        </nav>
        <div className="lp-tl">
          {shown.length === 0 && <p className="lp-note" style={{ padding: "20px 0" }}>見つかりませんでした。別の言葉で探すか、上の「時代へ」から選んでください。</p>}
          {shown.map((e) => {
            const year = e.date.slice(0, 4);
            const head = year !== lastYear;
            lastYear = year;
            const n = counts[e.key] ?? 0;
            return (
              <React.Fragment key={e.key}>
                {head && (
                  <div className="lp-tl-year" id={`lp-year-${year}`}>
                    {year}
                  </div>
                )}
                <article className={`lp-row${selectedKey === e.key ? " is-selected" : ""}`}>
                  <div className="lp-row-date">{e.date.slice(5).replace("-", ".")}</div>
                  <div>
                    <h3>{e.title}</h3>
                    <p>
                      {e.sub}
                      {e.href && (
                        <>
                          {" · "}
                          <Link to={e.href}>詳しく</Link>
                        </>
                      )}
                    </p>
                  </div>
                  <div className="lp-row-act">
                    <button type="button" onClick={() => onChoose(e)} aria-label={`${e.title}の頃のあなたへ書く`}>
                      この頃のあなたへ書く ↗
                    </button>
                    {n > 0 && (
                      <Link className="lp-row-count" to={`/letters/read/?event=${encodeURIComponent(e.key)}`}>
                        届いた手紙 {n}通
                      </Link>
                    )}
                  </div>
                </article>
              </React.Fragment>
            );
          })}
          {!query.trim() && filtered.length > limit && (
            <div className="lp-more">
              <button type="button" className="lp-secondary" onClick={() => setLimit((l) => l + PAGE)}>
                もっと前へ(あと {filtered.length - limit} 件)
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
