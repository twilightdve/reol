/**
 * /letters/card/?id= — 届いた手紙 1 枚(plan/64)。表と、公開を選んだ手紙だけ本文。
 * 手紙はブラウザーで読む(ビルドにも OG にも入れない)。検索には出さない。
 */
import React, { useEffect, useState } from "react";
import { HeadFC, Link } from "gatsby";
import { LettersHead, LettersShell } from "../../components/letters/LettersShell";
import { CardBack, CardFront, ScaledCard } from "../../components/letters/Postcard";
import { fetchPublicLetter, LettersError, PublicLetter } from "../../utils/letters/service";
import { YEAR_EVENT_BY_KEY } from "../../utils/letters/yearEvents";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const CardPage: React.FC = () => {
  const [state, setState] = useState<{ s: "loading" } | { s: "ok"; letter: PublicLetter } | { s: "missing" } | { s: "error" }>({ s: "loading" });
  const [side, setSide] = useState<"front" | "back">("front");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("id") ?? "";
    if (!UUID.test(id)) {
      setState({ s: "missing" });
      return;
    }
    fetchPublicLetter(id)
      .then((l) => setState(l ? { s: "ok", letter: l } : { s: "missing" }))
      .catch((e) => setState(e instanceof LettersError && e.code === "unavailable" ? { s: "missing" } : { s: "error" }));
  }, []);

  return (
    <LettersShell current="read">
      <section className="lp-section">
        {state.s === "loading" && <p className="lp-note">読み込んでいます…</p>}
        {state.s === "missing" && (
          <p className="lp-alert">
            この手紙は見つかりませんでした(確認中か、取り下げられた手紙かもしれません)。<Link to="/letters/read/">届いた手紙の一覧へ</Link>
          </p>
        )}
        {state.s === "error" && <p className="lp-alert">読み込めませんでした。通信を確かめて、ページを読み込み直してください。</p>}
        {state.s === "ok" && (
          <>
            <div className="lp-section-head">
              <div>
                <div className="lp-eyebrow">A LETTER TO {state.letter.eventLabel}</div>
                <h2>{state.letter.address}</h2>
              </div>
              <p className="lp-intro">
                {state.letter.sender}より
                {state.letter.visibility === "book" && <> · 本文は贈る本だけに載せています</>}
                {state.letter.bodyPending && <> · 本文は修正の確認中です</>}
              </p>
            </div>
            <div className="lp-sides" role="group" aria-label="カードの表裏">
              <button type="button" aria-pressed={side === "front"} onClick={() => setSide("front")}>
                表 · 宛名
              </button>
              <button type="button" aria-pressed={side === "back"} onClick={() => setSide("back")}>
                裏 · メッセージ
              </button>
            </div>
            <div className={`lp-pair${side === "back" ? " show-back" : ""}`} style={{ maxWidth: 720, margin: "0 auto" }}>
              <div data-side="front">
                <ScaledCard maxWidth={340} label="カードの表(宛名面)">
                  <CardFront face={state.letter} />
                </ScaledCard>
              </div>
              <div data-side="back">
                <ScaledCard maxWidth={340} label="カードの裏">
                  <CardBack
                    motif={state.letter.motif}
                    sender={state.letter.sender}
                    body={state.letter.body}
                    hiddenNote={state.letter.bodyPending ? "この手紙の本文は、\n修正の確認中です。" : undefined}
                  />
                </ScaledCard>
              </div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center", marginTop: 28 }}>
              <button
                type="button"
                className="lp-secondary"
                onClick={() => {
                  navigator.clipboard
                    ?.writeText(window.location.href)
                    .then(() => setCopied(true))
                    .catch(() => undefined);
                }}
              >
                {copied ? "リンクをコピーしました" : "このカードのリンクをコピー"}
              </button>
              <Link className="lp-secondary" to={`/letters/read/?event=${encodeURIComponent(state.letter.eventKey)}`}>
                同じ宛先の手紙
              </Link>
              <Link
                className="lp-primary"
                to={YEAR_EVENT_BY_KEY.has(state.letter.eventKey) ? `/letters/write/?event=${encodeURIComponent(state.letter.eventKey)}` : "/letters/write/"}
              >
                あなたも書く <span aria-hidden>↗</span>
              </Link>
            </div>
            <p className="lp-note" style={{ textAlign: "center", marginTop: 18 }}>
              手紙の内容は書いた人のものです。!Legit では名前や SNS ID が本人のものかを確かめていません。
            </p>
          </>
        )}
      </section>
    </LettersShell>
  );
};

export default CardPage;

export const Head: HeadFC = () => (
  <LettersHead title="届いた手紙" description="Reolの誕生日に届いた手紙の一枚。" path="/letters/card/" noindex />
);
