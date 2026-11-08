/**
 * 届いた手紙を年表の上に並べる(plan/64)。時代 → 年 → 出来事(曲・ライヴ・作品)。
 * 出来事はすべて点で置き、手紙のある所だけを光らせて、その下にカードの束を出す。
 */
import React, { useMemo } from "react";
import { Link } from "gatsby";
import { CardFront, ScaledCard } from "./Postcard";
import { Era } from "../../utils/letters/constants";
import { ERA_EVENTS, LetterEvent } from "../../utils/letters/timeline";
import { PublicLetter } from "../../utils/letters/service";

/** 運営だけに見える状態(確認待ちなど)。一般の手紙は undefined */
export type ChronoLetter = PublicLetter & { status?: "pending" | "hidden" };

const KIND_LABELS: Record<string, string> = { song: "曲", live: "ライヴ", release: "作品", cover: "歌ってみた", era: "時代" };
const ERA_COLORS: Record<Era, string> = {
  reol: "#e8869a",
  unit: "#6fb7bb",
  anyo: "#d9b45a",
  reoru: "#94a2e6",
  sherry: "#c7a6e3",
  other: "#e8869a",
};

type Cluster = { key: string; title: string; kind: string; date: string; letters: ChronoLetter[] };

const fmtDate = (d: string) => (d ? d.replace(/-/g, ".") : "");

export const LetterChrono: React.FC<{ events: LetterEvent[]; byKey: Map<string, LetterEvent>; letters: ChronoLetter[] }> = ({ events, byKey, letters }) => {
  const eras = useMemo(() => {
    // 宛先ごとに束ねる(宛先が年表から消えていても、手紙に残る名前と日付で置く)
    const byEvent = new Map<string, Cluster & { era: Era }>();
    for (const l of letters) {
      const ev = byKey.get(l.eventKey);
      const c = byEvent.get(l.eventKey) ?? {
        key: l.eventKey,
        title: ev?.title ?? l.eventLabel,
        kind: ev?.kind ?? (l.eventKey.startsWith("era:") ? "era" : "release"),
        date: ev?.date ?? l.eventDate ?? "",
        era: ev?.era ?? l.era,
        letters: [],
      };
      c.letters.push(l);
      byEvent.set(l.eventKey, c);
    }
    return ERA_EVENTS.map((eraEv) => {
      const era = eraEv.era;
      const inEra = events.filter((e) => e.era === era);
      const clusters = Array.from(byEvent.values()).filter((c) => c.era === era);
      const eraCluster = clusters.find((c) => c.kind === "era") ?? null;
      const years = Array.from(new Set([...inEra.map((e) => e.date.slice(0, 4)), ...clusters.filter((c) => c.date).map((c) => c.date.slice(0, 4))]))
        .filter(Boolean)
        .sort((a, b) => b.localeCompare(a))
        .map((year) => {
          const yearEvents = inEra.filter((e) => e.date.startsWith(year));
          const yearClusters = clusters
            .filter((c) => c.kind !== "era" && c.date.startsWith(year))
            .sort((a, b) => b.date.localeCompare(a.date) || b.letters.length - a.letters.length);
          // 年表から消えた宛先の手紙も点として置く
          const orphan = yearClusters.filter((c) => !yearEvents.some((e) => e.key === c.key));
          return { year, yearEvents, yearClusters, orphan };
        });
      const total = clusters.reduce((n, c) => n + c.letters.length, 0);
      return { eraEv, era, eraCluster, years, total };
    });
  }, [events, byKey, letters]);

  const jump = (key: string) => document.getElementById(`lp-ev-${key}`)?.scrollIntoView({ behavior: "smooth", block: "center" });

  return (
    <div className="lp-chrono">
      <nav className="lp-chrono-nav" aria-label="時代へ移動">
        {eras.map(({ eraEv, era, total }) => (
          <a key={era} href={`#lp-era-${era}`} className={total ? "has" : undefined} style={{ ["--era" as string]: ERA_COLORS[era] }}>
            {eraEv.sub.replace("(ユニット)", "")}
            {total > 0 && <b>{total}</b>}
          </a>
        ))}
      </nav>
      {eras.map(({ eraEv, era, eraCluster, years, total }, i) => (
        <section key={era} id={`lp-era-${era}`} className={`lp-chrono-era${total ? " has" : ""}`} style={{ ["--era" as string]: ERA_COLORS[era] }}>
          <header className="lp-chrono-era-head">
            <span className="num">{String(i + 1).padStart(2, "0")}</span>
            <h3>{eraEv.title}</h3>
            <span className="count">{total ? `${total}通` : "まだ手紙はありません"}</span>
          </header>
          {eraCluster && <ClusterView cluster={{ ...eraCluster, title: `${eraEv.title}へ` }} />}
          {years.length > 0 ? (
            <ol className="lp-chrono-years">
              {years.map(({ year, yearEvents, yearClusters, orphan }) => (
                <li key={year} className={yearClusters.length ? "has" : undefined}>
                  <div className="yr">{year}</div>
                  <div className="yr-body">
                    <ul className="lp-beads" aria-label={`${year}年の出来事`}>
                      {[...yearEvents, ...orphan.map((c) => ({ key: c.key, title: c.title, kind: c.kind, date: c.date }))].map((e) => {
                        const c = yearClusters.find((x) => x.key === e.key);
                        return c ? (
                          <li key={e.key}>
                            <button type="button" className="lp-bead has" onClick={() => jump(e.key)}>
                              {e.title}
                              <b>{c.letters.length}</b>
                            </button>
                          </li>
                        ) : (
                          <li key={e.key}>
                            <span className="lp-bead" title={`${e.title}(${KIND_LABELS[e.kind] ?? ""})`}>
                              <span className="sr-only">{e.title}</span>
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                    {yearClusters.map((c) => (
                      <ClusterView key={c.key} cluster={c} />
                    ))}
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            !eraCluster && <p className="lp-chrono-empty">この頃の曲・作品・ライヴは、このサイトの記録にありません。</p>
          )}
        </section>
      ))}
    </div>
  );
};

const ClusterView: React.FC<{ cluster: Cluster }> = ({ cluster }) => (
  <div className="lp-cluster" id={`lp-ev-${cluster.key}`}>
    <div className="lp-cluster-head">
      <span className="kind">{KIND_LABELS[cluster.kind] ?? ""}</span>
      <h4>{cluster.title}</h4>
      {cluster.date && <time dateTime={cluster.date}>{fmtDate(cluster.date)}</time>}
      <span className="n">{cluster.letters.length}通</span>
      <Link className="write" to={`/letters/write/?event=${encodeURIComponent(cluster.key)}`}>
        ここへ書く
      </Link>
    </div>
    <div className="lp-cluster-cards">
      {cluster.letters.map((l) => (
        <Link
          key={l.id}
          to={l.status ? "/letters/admin/" : `/letters/card/?id=${l.id}`}
          className={l.status ? `is-${l.status}` : undefined}
          aria-label={`${l.address}(${l.sender}より)${l.status === "pending" ? "・確認待ち" : l.status === "hidden" ? "・Webに出さない" : ""}`}
        >
          <ScaledCard maxWidth={200}>
            <CardFront face={l} />
          </ScaledCard>
          {l.status && <span className="status">{l.status === "pending" ? "確認待ち" : "Webに出さない"}</span>}
          {!l.status && l.visibility === "book" && <span className="meta">本文は贈る本だけ</span>}
        </Link>
      ))}
    </div>
  </div>
);
