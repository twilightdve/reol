/**
 * /letters/read/ — 届いた手紙(plan/64)。運営が確認したカードの宛名面を並べる。本文は 1 枚のページで(公開を選んだ手紙だけ)。
 * 並びは届いた順と、宛先の年代順。人気順やランキングは出さない。
 */
import React, { useEffect, useState } from "react";
import { HeadFC, Link } from "gatsby";
import { LettersHead, LettersShell } from "../../components/letters/LettersShell";
import { CardFront, ScaledCard } from "../../components/letters/Postcard";
import { useLetterEvents } from "../../components/letters/useLetterEvents";
import { Era, ERA_LABELS } from "../../utils/letters/constants";
import { fetchPublicLetters, LettersError, PublicLetter } from "../../utils/letters/service";

const PAGE = 48;
const ERAS: (Era | null)[] = [null, "reol", "unit", "reoru", "other"];

const ReadPage: React.FC = () => {
  const { byKey } = useLetterEvents();
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
    if (!ready) return;
    setState("loading");
    load(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, eventKey, era, order]);

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
              <Link className="lp-text-link" to={`/letters/?event=${encodeURIComponent(eventKey)}#letter`}>
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
            まだ載せている手紙はありません。<Link to="/letters/">最初の一通を書く</Link>
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
      </section>
    </LettersShell>
  );
};

export default ReadPage;

export const Head: HeadFC = () => (
  <LettersHead title="届いた手紙" description="Reolの誕生日に、ファンから届いた手紙(宛名面と、公開を選んだ本文)。" path="/letters/read/" />
);
