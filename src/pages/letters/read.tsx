/**
 * /letters/read/ — 届いた手紙(plan/64)。カードの宛名面を、年表の上に並べる(手紙のある所だけ光らせる)。運営の確認は待たずに載せ、運営があとから取り下げる。
 * 本文は 1 枚のページで(公開を選んだ手紙だけ)。「届いた順」の一覧にも切り替えられる。人気順やランキングは出さない。
 * 運営がログインしている時は、Web に出さないことにした手紙も出し、まだ読んでいない手紙に印をつける(中身を返すかどうかは DB が決める)。
 */
import React, { useEffect, useState } from "react";
import { HeadFC, Link } from "gatsby";
import { LettersHead, LettersShell } from "../../components/letters/LettersShell";
import { CardFront, ScaledCard } from "../../components/letters/Postcard";
import { YEAR_EVENT_BY_KEY } from "../../utils/letters/yearEvents";
import { ChronoLetter, LetterChrono, STATUS_LABELS } from "../../components/letters/LetterChrono";
import { useAuth } from "../../contexts/AuthContext";
import { ScrollTopButton } from "../../components/letters/ScrollTopButton";
import { adminListLetters, AdminLetter, fetchPublicLetters, LettersError, PublicLetter } from "../../utils/letters/service";

const PAGE = 48;

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
/** 宛先がこの一年の出来事の手紙だけを出す(前の宛先はボツになった案のテスト用。DB には残す) */
const isThisYear = (l: { eventKey: string }) => YEAR_EVENT_BY_KEY.has(l.eventKey);

const fromAdmin = (ls: AdminLetter[]): ChronoLetter[] =>
  ls
    .filter((l) => !l.withdrawnAt && isThisYear(l.content))
    .map((l) => ({
      ...l.content,
      id: l.id,
      createdAt: l.createdAt,
      body: null,
      status: l.webHidden ? ("hidden" as const) : l.reviewedVersion !== l.currentVersion ? ("unchecked" as const) : undefined,
    }));

const ReadPage: React.FC = () => {
  const { user } = useAuth();
  const [view, setView] = useState<"chrono" | "list">("chrono");
  const [chrono, setChrono] = useState<PublicLetter[] | null>(null);
  const [adminLetters, setAdminLetters] = useState<ChronoLetter[] | null>(null);
  const [showPending, setShowPending] = useState(true);
  const [eventKey, setEventKey] = useState<string | null>(null);
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
      const list = await fetchPublicLetters({ eventKey, order, limit: PAGE, offset });
      setItems((prev) => (offset === 0 ? list : [...prev, ...list]).filter(isThisYear));
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
  }, [ready, eventKey, order, view]);

  useEffect(() => {
    if (!ready || view !== "chrono" || eventKey || chrono) return;
    setState("loading");
    fetchAllPublic()
      .then((ls) => {
        setChrono(ls.filter(isThisYear));
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

  const adminView = !!adminLetters && showPending;
  const chronoLetters: ChronoLetter[] = adminView && adminLetters ? adminLetters : chrono ?? [];
  const uncheckedCount = adminLetters?.filter((l) => l.status === "unchecked").length ?? 0;
  // 一覧で見る: 運営は運営の一覧から(絞り込み・並びはこの画面で)
  const listItems: ChronoLetter[] =
    adminView && adminLetters
      ? adminLetters
          .filter((l) => !eventKey || l.eventKey === eventKey)
          .sort((a, b) =>
            order === "timeline" ? (b.eventDate ?? "").localeCompare(a.eventDate ?? "") || b.createdAt.localeCompare(a.createdAt) : b.createdAt.localeCompare(a.createdAt)
          )
      : items;

  // 宛先の名前: この一年の出来事から。前の宛先なら、届いた手紙に残っている名前
  const ev = eventKey ? YEAR_EVENT_BY_KEY.get(eventKey) ?? (items[0] ? { title: items[0].eventLabel } : null) : null;
  const canWrite = !!eventKey && YEAR_EVENT_BY_KEY.has(eventKey);

  return (
    <LettersShell current="read">
      <section className="lp-section">
        <div className="lp-section-head is-stone">
          <div>
            <div className="lp-eyebrow">LETTERS / 届いた手紙</div>
            <h2>{ev ? `${ev.title}の思い出の手紙` : "届いた手紙"}</h2>
          </div>
          <p className="lp-intro">
            投函された手紙を、そのまま載せています(運営があとから読み、ふさわしくないものは取り下げます)。本文を「贈る本だけ」にした手紙は、宛名面だけを載せています。
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
                運営の表示にする(Webに出さない手紙も出し、まだ読んでいない手紙に印{uncheckedCount ? `・未チェック ${uncheckedCount}通` : ""})
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
                まだ届いた手紙はありません。投函された手紙は、すぐここに載ります。<Link to="/letters/write/">手紙を書く</Link>
              </p>
            )}
            {(state === "ok" || adminLetters) && <LetterChrono letters={chronoLetters} />}
          </>
        ) : (
          <>
        <div className="lp-filter">
          {eventKey ? (
            <>
              <span className="lp-badge is-ink">思い出: {ev?.title ?? "選んだ思い出"}</span>
              <button
                type="button"
                className="lp-text-link"
                onClick={() => {
                  setEventKey(null);
                  window.history.replaceState(null, "", "/letters/read/");
                }}
              >
                すべての手紙に戻す
              </button>
              {canWrite && (
                <Link className="lp-text-link" to={`/letters/write/?event=${encodeURIComponent(eventKey)}`}>
                  この思い出の手紙を書く
                </Link>
              )}
            </>
          ) : null}
          <div className="lp-chips" role="group" aria-label="並び順">
            <button type="button" className="lp-chip" aria-pressed={order === "new"} onClick={() => setOrder("new")}>
              届いた順
            </button>
            <button type="button" className="lp-chip" aria-pressed={order === "timeline"} onClick={() => setOrder("timeline")}>
              思い出の日付順
            </button>
          </div>
        </div>

        {state === "loading" && <p className="lp-note">読み込んでいます…</p>}
        {state === "unavailable" && <p className="lp-alert">届いた手紙は、受付の準備が整ってから載せます。</p>}
        {state === "error" && <p className="lp-alert">読み込めませんでした。通信を確かめて、ページを読み込み直してください。</p>}
        {state === "ok" && listItems.length === 0 && (
          <p className="lp-note">
            まだ届いた手紙はありません。投函された手紙は、すぐここに載ります。<Link to="/letters/write/">手紙を書く</Link>
          </p>
        )}
        <div className="lp-grid">
          {listItems.map((l) => (
            <Link
              key={l.id}
              to={l.status === "hidden" ? "/letters/admin/" : `/letters/card/?id=${l.id}`}
              className={l.status ? `is-${l.status}` : undefined}
              aria-label={`${l.address}(${l.sender}より)${l.status ? `・${STATUS_LABELS[l.status]}` : ""}`}
            >
              <ScaledCard maxWidth={260}>
                <CardFront face={l} />
              </ScaledCard>
              <div className="meta">
                {l.status && <span className="lp-status">{STATUS_LABELS[l.status]}</span>}
                {l.eventLabel}
                {l.visibility === "book" ? " · 本文は贈る本だけ" : ""}
              </div>
            </Link>
          ))}
        </div>
        {state === "ok" && hasMore && !adminView && (
          <div className="lp-more">
            <button type="button" className="lp-secondary" onClick={() => load(items.length)}>
              もっと見る
            </button>
          </div>
        )}
          </>
        )}
      </section>
      <ScrollTopButton className="lp-totop" />
    </LettersShell>
  );
};

export default ReadPage;

export const Head: HeadFC = () => (
  <LettersHead title="届いた手紙" description="Reolの誕生日に、ファンから届いた手紙(宛名面と、公開を選んだ本文)。" path="/letters/read/" />
);
