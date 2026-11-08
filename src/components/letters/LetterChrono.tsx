/**
 * 届いた手紙を「この一年」の年表の上に並べる(plan/64)。入口の年表と同じ出来事(ライヴ・作品の発売・MV の公開)を月ごとに。
 * 手紙のある出来事だけを金色で光らせ、その下にカードの束を出す。手紙の無い出来事は控えめな 1 行。
 * 選ばずに書いた手紙(この一年の Reol へ)は最初に。前の宛先(時代・昔の曲。ボツになった案のテスト用の手紙)は年表に出さない。
 */
import React, { useMemo } from "react";
import { Link } from "gatsby";
import { CardFront, ScaledCard } from "./Postcard";
import { MONTH_NAMES, YEAR_ERA_EVENT, YEAR_EVENT_BY_KEY, YEAR_EVENTS, YearEvent, yearMonths } from "../../utils/letters/yearEvents";
import { PublicLetter } from "../../utils/letters/service";

/** 運営だけに見える状態(まだ読んでいない・Web に出さない)。一般の手紙は undefined */
export type ChronoLetter = PublicLetter & { status?: "unchecked" | "hidden" };
export const STATUS_LABELS = { unchecked: "未チェック", hidden: "Webに出さない" } as const;

const TAB_LABELS = { live: "LIVE", release: "RELEASE", mv: "MUSIC VIDEO" } as const;
const fmt = (d: string) => (d ? d.replace(/-/g, ".") : "");
const MONTHS = yearMonths(YEAR_EVENTS);

export const LetterChrono: React.FC<{ letters: ChronoLetter[] }> = ({ letters }) => {
  const byKey = useMemo(() => {
    const m = new Map<string, ChronoLetter[]>();
    for (const l of letters) if (YEAR_EVENT_BY_KEY.has(l.eventKey)) m.set(l.eventKey, [...(m.get(l.eventKey) ?? []), l]);
    return m;
  }, [letters]);

  const eraLetters = byKey.get(YEAR_ERA_EVENT.key) ?? [];
  const countIn = (items: YearEvent[]) => items.reduce((n, e) => n + (byKey.get(e.key)?.length ?? 0), 0);

  return (
    <div className="lp-chrono">
      <nav className="lp-chrono-nav" aria-label="月へ移動">
        {MONTHS.map((m) => {
          const n = countIn(m.items);
          return (
            <a key={m.key} href={`#lp-month-${m.key}`} className={n ? "has" : undefined}>
              {m.key.replace("-", ".")}
              {n > 0 && <b>{n}</b>}
            </a>
          );
        })}
      </nav>

      {eraLetters.length > 0 && (
        <section className="lp-chrono-month has">
          <ClusterView title="この一年のReolへ" kind="THIS YEAR" date="" eventKey={YEAR_ERA_EVENT.key} letters={eraLetters} />
        </section>
      )}

      {MONTHS.map((m) => {
        const n = countIn(m.items);
        return (
          <section key={m.key} id={`lp-month-${m.key}`} className={`lp-chrono-month${n ? " has" : ""}`}>
            <header className="lp-chrono-month-head">
              <span className="yr">{m.year}</span>
              <h3>{MONTH_NAMES[m.month - 1]}</h3>
              <span className="count">{n ? `${n}通` : ""}</span>
            </header>
            <ul className="lp-chrono-rows">
              {m.items.map((e) => {
                const ls = byKey.get(e.key) ?? [];
                const kind = e.tab ? TAB_LABELS[e.tab] : "";
                return ls.length ? (
                  <li key={e.key}>
                    <ClusterView title={e.title} sub={e.sub} kind={kind} date={e.date} eventKey={e.key} letters={ls} />
                  </li>
                ) : (
                  <li key={e.key} className="lp-chrono-row">
                    <time dateTime={e.date}>{e.date.slice(5).replace("-", ".")}</time>
                    <span className="kind">{kind}</span>
                    <span className="title">{e.title}</span>
                    <Link className="write" to={`/letters/write/?event=${encodeURIComponent(e.key)}`} aria-label={`${e.title}の思い出を書く`}>
                      書く
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}

    </div>
  );
};

const ClusterView: React.FC<{ title: string; sub?: string; kind: string; date: string; eventKey: string | null; letters: ChronoLetter[] }> = ({
  title,
  sub,
  kind,
  date,
  eventKey,
  letters,
}) => (
  <div className="lp-cluster" id={eventKey ? `lp-ev-${eventKey}` : undefined}>
    <div className="lp-cluster-head">
      {kind && <span className="kind">{kind}</span>}
      {date && <time dateTime={date}>{fmt(date)}</time>}
      <h4>{title}</h4>
      <span className="n">{letters.length}通</span>
      {eventKey && (
        <Link className="write" to={`/letters/write/?event=${encodeURIComponent(eventKey)}`}>
          ここへ書く
        </Link>
      )}
    </div>
    {sub && <p className="lp-cluster-sub">{sub}</p>}
    <div className="lp-cluster-cards">
      {letters.map((l) => (
        <Link
          key={l.id}
          to={l.status === "hidden" ? "/letters/admin/" : `/letters/card/?id=${l.id}`}
          className={l.status ? `is-${l.status}` : undefined}
          aria-label={`${l.address}(${l.sender}より)${l.status ? `・${STATUS_LABELS[l.status]}` : ""}`}
        >
          <ScaledCard maxWidth={200}>
            <CardFront face={l} />
          </ScaledCard>
          {l.status && <span className="status">{STATUS_LABELS[l.status]}</span>}
          {!l.status && l.visibility === "book" && <span className="meta">本文は贈る本だけ</span>}
        </Link>
      ))}
    </div>
  </div>
);
