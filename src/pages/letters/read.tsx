/**
 * /letters/read/ — 届いた手紙(plan/64)。運営が確認したカードの宛名面を、年表の上に並べる(手紙のある所だけ光らせる)。
 * 本文は 1 枚のページで(公開を選んだ手紙だけ)。「届いた順」の一覧にも切り替えられる。人気順やランキングは出さない。
 * 運営がログインしている時は、確認前の手紙も出せる(中身を返すかどうかは DB が決める)。
 */
import React, { useEffect, useState } from "react";
import { HeadFC, Link } from "gatsby";
import { LettersHead, LettersShell } from "../../components/letters/LettersShell";
import { CardFront, ScaledCard } from "../../components/letters/Postcard";
import { useLetterEvents } from "../../components/letters/useLetterEvents";
import { ChronoLetter, LetterChrono } from "../../components/letters/LetterChrono";
import { useAuth } from "../../contexts/AuthContext";
import { Era, ERA_LABELS } from "../../utils/letters/constants";
import { adminListLetters, AdminLetter, fetchPublicLetters, LettersError, PublicLetter } from "../../utils/letters/service";

const PAGE = 48;
const ERAS: (Era | null)[] = [null, "reol", "unit", "anyo", "reoru", "sherry", "other"];

/** 年表に置くため、公開の手紙は全部読む(1 回 100 通まで) */
const fetchAllPublic = async (): Promise<PublicLetter[]> => {
  const all: PublicLetter[] = [];
  for (let offset = 0; offset < 5000; offset += 100) {
    const list = await fetchPublicLetters({ order: "timeline", limit: 100, offset });
    all.push(...list);
    if (list.length < 100) break;
  }
  return all;
};

/** 運営の一覧を、年表に置く形に(取り下げた手紙は出さない) */
const fromAdmin = (ls: AdminLetter[]): ChronoLetter[] =>
  ls
    .filter((l) => !l.withdrawnAt)
    .map((l) => ({
      ...l.content,
      id: l.id,
      createdAt: l.createdAt,
      body: null,
      status: l.reviewedVersion !== l.currentVersion ? ("pending" as const) : l.webHidden ? ("hidden" as const) : undefined,
    }));

const ReadPage: React.FC = () => {
  const { events, byKey } = useLetterEvents();
  const { user } = useAuth();
  const [view, setView] = useState<"chrono" | "list">("chrono");
  const [chrono, setChrono] = useState<PublicLetter[] | null>(null);
  const [adminLetters, setAdminLetters] = useState<ChronoLetter[] | null>(null);
  const [showPending, setShowPending] = useState(true);
  const [eventKey, setEventKey] = useState<string | null>(null);
  const [era, setEra] = useState<Era | null>(null);
  const [order, setOrder] = useState<"new" | "timeline">("new");
  const [items, setItems] = useState<PublicLetter[]>([]);
  const [state, setState] = useState<"loading" | "ok" | "unavailable" | "error">("loading");
  const [hasMore, setHasMore] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setEventKey(p.get("event"));
    setReady(true);
  }, []);

  const load = async (offset: number) => {
    try {
      const list = await fetchPublicLetters({ eventKey, era, order, limit: PAGE, offset });
      setItems((prev) => (offset === 0 ? list : [...prev, ...list]));
      setHasMore(list.length === PAGE);
      setState("ok");
    } catch (e) {
      setState(e instanceof LettersError && e.code === "unavailable" ? "unavailable" : "error");
    }
  };

  useEffect(() => {
    if (!ready || (view === "chrono" && !eventKey)) return;
    setState("loading");
    load(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, eventKey, era, order, view]);

  useEffect(() => {
    if (!ready || view !== "chrono" || eventKey || chrono) return;
    setState("loading");
    fetchAllPublic()
      .then((ls) => {
        setChrono(ls);
        setState("ok");
      })
      .catch((e) => setState(e instanceof LettersError && e.code === "unavailable" ? "unavailable" : "error"));
  }, [ready, view, eventKey, chrono]);

  // ログインしていれば、運営かどうかを DB に聞く(運営でなければ何も変えない)
  useEffect(() => {
    if (!user) {
      setAdminLetters(null);
      return;
    }
    adminListLetters()
      .then((ls) => setAdminLetters(fromAdmin(ls)))
      .catch(() => setAdminLetters(null));
  }, [user]);

  const chronoLetters: ChronoLetter[] = adminLetters && showPending ? adminLetters : chrono ?? [];
  const pendingCount = adminLetters?.filter((l) => l.status === "pending").length ?? 0;

  const ev = eventKey ? byKey.get(eventKey) : null;

  return (
    <LettersShell current="read">
      <section className="lp-section">
        <div className="lp-section-head">
          <div>
            <div className="lp-eyebrow">LETTERS / 届いた手紙</div>
            <h2>{ev ? `${ev.title}へ届いた手紙` : "届いた手紙"}</h2>
          </div>
          <p className="lp-intro">
            運営が確認した手紙から載せています。本文を「贈る本だけ」にした手紙は、宛名面だけを載せています。
          </p>
        </div>
        {!eventKey && (
          <div className="lp-filter">
            <div className="lp-chips" role="group" aria-label="見せ方">
              <button type="button" className="lp-chip" aria-pressed={view === "chrono"} onClick={() => setView("chrono")}>
                年表で見る
              </button>
              <button type="button" className="lp-chip" aria-pressed={view === "list"} onClick={() => setView("list")}>
                一覧で見る
              </button>
            </div>
            {adminLetters && (
              <label className="lp-admin-toggle">
                <input type="checkbox" checked={showPending} onChange={(e) => setShowPending(e.target.checked)} />
                確認前の手紙も表示する(運営だけ{pendingCount ? `・確認待ち ${pendingCount}通` : ""})
              </label>
            )}
          </div>
        )}
        {view === "chrono" && !eventKey ? (
          <>
            {state === "loading" && <p className="lp-note">読み込んでいます…</p>}
            {state === "unavailable" && <p className="lp-alert">届いた手紙は、受付の準備が整ってから載せます。</p>}
            {state === "error" && <p className="lp-alert">読み込めませんでした。通信を確かめて、ページを読み込み直してください。</p>}
            {state === "ok" && chronoLetters.length === 0 && (
              <p className="lp-note">
                まだ載せている手紙はありません。届いた手紙は、運営が内容を確認してから、ここに載せます。<Link to="/letters/write/">手紙を書く</Link>
              </p>
            )}
            {(state === "ok" || adminLetters) && <LetterChrono events={events} byKey={byKey} letters={chronoLetters} />}
          </>
        ) : (
          <>
        <div className="lp-filter">
          {eventKey ? (
            <>
              <span className="lp-badge is-ink">宛先: {ev?.title ?? "選んだ宛先"}</span>
              <button
                type="button"
                className="lp-text-link"
                onClick={() => {
                  setEventKey(null);
                  window.history.replaceState(null, "", "/letters/read/");
                }}
              >
                すべての宛先に戻す
              </button>
              <Link className="lp-text-link" to={`/letters/write/?event=${encodeURIComponent(eventKey)}`}>
                この宛先に手紙を書く
              </Link>
            </>
          ) : (
            <div className="lp-chips" role="group" aria-label="時代で絞り込む">
              {ERAS.map((e) => (
                <button key={e ?? "all"} type="button" className="lp-chip" aria-pressed={era === e} onClick={() => setEra(e)}>
                  {e ? ERA_LABELS[e] : "すべての時代"}
                </button>
              ))}
            </div>
          )}
          <div className="lp-chips" role="group" aria-label="並び順">
            <button type="button" className="lp-chip" aria-pressed={order === "new"} onClick={() => setOrder("new")}>
              届いた順
            </button>
            <button type="button" className="lp-chip" aria-pressed={order === "timeline"} onClick={() => setOrder("timeline")}>
              宛先の年代順
            </button>
          </div>
        </div>

        {state === "loading" && <p className="lp-note">読み込んでいます…</p>}
        {state === "unavailable" && <p className="lp-alert">届いた手紙は、受付の準備が整ってから載せます。</p>}
        {state === "error" && <p className="lp-alert">読み込めませんでした。通信を確かめて、ページを読み込み直してください。</p>}
        {state === "ok" && items.length === 0 && (
          <p className="lp-note">
            まだ載せている手紙はありません。届いた手紙は、運営が内容を確認してから、ここに載せます。<Link to="/letters/write/">手紙を書く</Link>
          </p>
        )}
        <div className="lp-grid">
          {items.map((l) => (
            <Link key={l.id} to={`/letters/card/?id=${l.id}`} aria-label={`${l.address}(${l.sender}より)`}>
              <ScaledCard maxWidth={260}>
                <CardFront face={l} />
              </ScaledCard>
              <div className="meta">
                {l.eventLabel}
                {l.visibility === "book" ? " · 本文は贈る本だけ" : ""}
              </div>
            </Link>
          ))}
        </div>
        {state === "ok" && hasMore && (
          <div className="lp-more">
            <button type="button" className="lp-secondary" onClick={() => load(items.length)}>
              もっと見る
            </button>
          </div>
        )}
          </>
        )}
      </section>
    </LettersShell>
  );
};

export default ReadPage;

export const Head: HeadFC = () => (
  <LettersHead title="届いた手紙" description="Reolの誕生日に、ファンから届いた手紙(宛名面と、公開を選んだ本文)。" path="/letters/read/" />
);
