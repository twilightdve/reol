/**
 * 宛先の曲・ライヴを選ぶ年表(plan/64)。選んだ時代の分だけ、今から過去へ。年の移動・検索・種類の絞り込み。
 * 時代そのもの(れをる / REOL / Reol)は、手紙づくりの最初の画面で選ぶ。
 */
import React, { useMemo, useState } from "react";
import { Link } from "gatsby";
import type { Era } from "../../utils/letters/constants";
import { LetterEvent } from "../../utils/letters/timeline";

type Kind = "song" | "live" | "release" | "cover";
const KINDS: { id: Kind; label: string; act: string }[] = [
  { id: "song", label: "曲", act: "この曲へ" },
  { id: "live", label: "ライヴ", act: "このライヴへ" },
  { id: "release", label: "作品", act: "この作品へ" },
  { id: "cover", label: "歌ってみた", act: "この曲へ" },
];

const PAGE = 60;

export const LetterTimeline: React.FC<{
  events: LetterEvent[];
  era: Era;
  selectedKey: string | null;
  counts: Record<string, number>;
  onChoose: (e: LetterEvent) => void;
}> = ({ events, era, selectedKey, counts, onChoose }) => {
  const [query, setQuery] = useState("");
  // 最初は選んである宛先の種類。無ければ曲(その時期に曲が無ければ、ある種類)
  const [kind, setKind] = useState<Kind>(
    () =>
      (events.find((e) => e.key === selectedKey)?.kind as Kind | undefined) ??
      KINDS.find((k) => k.id === "song" && events.some((e) => e.era === era && e.kind === "song"))?.id ??
      KINDS.find((k) => events.some((e) => e.era === era && e.kind === k.id))?.id ??
      "song"
  );
  const [limit, setLimit] = useState(PAGE);

  const inEra = useMemo(() => events.filter((e) => e.era === era), [events, era]);
  const kinds = KINDS.filter((k) => inEra.some((e) => e.kind === k.id));
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return inEra.filter((e) => e.kind === kind && (!q || e.searchText.includes(q)));
  }, [inEra, query, kind]);
  const act = KINDS.find((k) => k.id === kind)?.act ?? "これへ";
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
          {kinds.map((k) => (
            <button
              key={k.id}
              type="button"
              className="lp-chip"
              aria-pressed={kind === k.id}
              onClick={() => {
                setKind(k.id);
                setLimit(PAGE);
              }}
            >
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
          {shown.length === 0 && <p className="lp-note" style={{ padding: "20px 0" }}>見つかりませんでした。別の言葉で探すか、選ばずに次へ進んでください。</p>}
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
                    <button type="button" onClick={() => onChoose(e)} aria-pressed={selectedKey === e.key} aria-label={`${e.title}へ書く`}>
                      {selectedKey === e.key ? "選んでいます" : `${act}書く ↗`}
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
