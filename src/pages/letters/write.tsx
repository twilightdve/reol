/**
 * /letters/write/ — 手紙を書く(件名のないふくろう便。plan/64)。
 * /letters/ の「お祝いの手紙を書く」から来る。時期 → 曲 → 宛名 … → 投函を一画面ずつ(Composer)。
 * 手紙はビルドに入れない。投函は Supabase の関数(letters_submit)へ。保存が確かめられてから「受け付けました」と出す。
 */
import React, { useCallback, useEffect, useRef, useState } from "react";
import { HeadFC, Link } from "gatsby";
import { LettersHead, LettersShell } from "../../components/letters/LettersShell";
import { ChosenEvent, Composer, ComposerValue, emptyComposer, SubmitState } from "../../components/letters/Composer";
import { useLetterEvents } from "../../components/letters/useLetterEvents";
import { LETTERS_DEADLINE_LABEL, LETTERS_MEMORY_PERIOD_LABEL } from "../../utils/letters/constants";
import { LetterEvent } from "../../utils/letters/timeline";
import { errorMessage, fetchLettersStatus, fetchPublicCounts, LetterContent, LettersError, submitLetter, updateOwnLetter } from "../../utils/letters/service";
import { editUrl, loadDraft, newEditKey, newRequestId, rememberMyLetter, saveDraft } from "../../utils/letters/local";

const toChosen = (e: LetterEvent): ChosenEvent => ({ key: e.key, label: e.title, date: e.date || null, era: e.era, defaultAddress: e.defaultAddress });

const LettersWritePage: React.FC = () => {
  const { events, byKey } = useLetterEvents();
  const [event, setEvent] = useState<ChosenEvent | null>(null);
  const [value, setValue] = useState<ComposerValue>(emptyComposer);
  const [availability, setAvailability] = useState<"loading" | "open" | "closed" | "unavailable">("loading");
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [submitState, setSubmitState] = useState<SubmitState>({ kind: "idle" });
  const [done, setDone] = useState<{ id: string; url: string; synced: boolean } | null>(null);
  const [bodyResetKey, setBodyResetKey] = useState(0);
  const pending = useRef<{ requestId: string; editKey: string } | null>(null);
  const loaded = useRef(false);

  // 書きかけを戻す。?event= があればその宛先に
  useEffect(() => {
    const d = loadDraft();
    const fromUrl = new URLSearchParams(window.location.search).get("event");
    const ev = (fromUrl && byKey.get(fromUrl)) || (d?.eventKey && byKey.get(d.eventKey)) || null;
    if (d) {
      setValue((v) => ({
        ...v,
        address: d.address ?? v.address,
        sender: d.sender ?? v.sender,
        snsType: (d.snsType as ComposerValue["snsType"]) ?? "",
        snsId: d.snsId ?? "",
        motif: d.motif ?? v.motif,
        visibility: d.visibility ?? null,
        body: Array.isArray(d.body) && d.body.length ? d.body : v.body,
      }));
      pending.current = d.pending ?? null;
      setBodyResetKey((k) => k + 1);
    }
    if (ev) {
      setEvent(toChosen(ev));
      if (fromUrl && fromUrl !== d?.eventKey) setValue((v) => ({ ...v, address: ev.defaultAddress }));
    }
    loaded.current = true;
  }, [byKey]);

  useEffect(() => {
    if (!loaded.current || done) return;
    saveDraft({
      eventKey: event?.key ?? null,
      address: value.address,
      sender: value.sender,
      snsType: value.snsType || null,
      snsId: value.snsId,
      motif: value.motif,
      visibility: value.visibility ?? undefined,
      body: value.body,
      pending: pending.current,
    });
  }, [event, value, done]);

  useEffect(() => {
    fetchLettersStatus()
      .then((s) => setAvailability(s.open ? "open" : "closed"))
      .catch((e) => setAvailability(e instanceof LettersError && e.code === "unavailable" ? "unavailable" : "open"));
    fetchPublicCounts()
      .then(setCounts)
      .catch(() => undefined);
  }, []);

  const choose = useCallback((e: LetterEvent) => {
    setEvent(toChosen(e));
    setValue((v) => ({ ...v, address: e.defaultAddress }));
  }, []);

  const send = async (content: LetterContent & { consent: true }) => {
    setSubmitState({ kind: "sending" });
    const retry = !!pending.current;
    if (!pending.current) pending.current = { requestId: newRequestId(), editKey: newEditKey() };
    const p = pending.current;
    // 送る前に、同じ 1 通として送り直すための値を残す(通信が切れても二重にならない)
    saveDraft({ ...(loadDraft() ?? {}), pending: p });
    try {
      const r = await submitLetter(p.requestId, p.editKey, content);
      if (!r.ok) {
        setSubmitState({ kind: "error", message: errorMessage(r.error) });
        if (r.error === "closed") setAvailability("closed");
        return;
      }
      // 受け付けられた(ここから先で失敗しても、受付は取り消さない)
      // 前回の送信が実は届いていた場合は、いま画面にある内容に直しておく。直せなかった時は、そのことを完了画面で伝える
      let synced = true;
      if (retry) {
        try {
          const u = await updateOwnLetter(r.id, p.editKey, r.version, content);
          synced = u.ok;
        } catch {
          synced = false;
        }
      }
      rememberMyLetter({ id: r.id, key: p.editKey, address: content.address, createdAt: new Date().toISOString() });
      pending.current = null;
      saveDraft(null);
      setDone({ id: r.id, url: editUrl(r.id, p.editKey), synced });
      setSubmitState({ kind: "idle" });
      window.requestAnimationFrame(() => document.getElementById("letter")?.scrollIntoView({ block: "start" }));
    } catch (e) {
      if (e instanceof LettersError && e.code === "unavailable") {
        setAvailability("unavailable");
        setSubmitState({ kind: "error", message: "いまは受付の準備中です。書いた手紙はこの端末に残っています。" });
      } else {
        setSubmitState({
          kind: "error",
          message: "送れたかどうか確かめられませんでした。通信を確かめて、もう一度「投函する」を押してください(同じ手紙が二通届くことはありません)。",
        });
      }
    }
  };

  const restart = () => {
    setDone(null);
    setEvent(null);
    setValue(emptyComposer());
    setBodyResetKey((k) => k + 1);
    window.requestAnimationFrame(() => document.getElementById("letter")?.scrollIntoView({ block: "start" }));
  };

  return (
    <LettersShell current="write">
      <section className="lp-section" id="letter">
        <div className="lp-section-head">
          <div>
            <div className="lp-eyebrow">01 / MAKE YOUR LETTER</div>
            <h2>
              <span style={{ display: "inline-block" }}>この一年の思い出と、</span>
              <span style={{ display: "inline-block" }}>お祝いの言葉を。</span>
            </h2>
          </div>
          <p className="lp-intro">
            思い出の期間は <strong>{LETTERS_MEMORY_PERIOD_LABEL}</strong>(去年の誕生日から今年の誕生日まで)。この一年に聴いた音楽、心に残ったライヴ、忘れられない言葉を、お祝いと一緒に。昔の曲でも、この一年の思い出なら大歓迎です。
            <br />
            お祝いメッセージは <strong>{LETTERS_DEADLINE_LABEL}</strong>受け付けます(日本時間)。
          </p>
        </div>
        {done ? (
          <div className="lp-done" role="status">
            <h3>お手紙を受け付けました</h3>
            <p className="lp-note" style={{ marginTop: 8 }}>
              ありがとうございます。Webの「届いた手紙」に載りました(本文を「贈る本だけ」にした手紙は、宛名面だけが載ります)。運営が読んで、ふさわしくないと判断した時は取り下げます。
            </p>
            {!done.synced && (
              <p className="lp-alert">
                通信が切れる前に送った内容で受け付けています。そのあと書き足した内容は、下の修正用のURLから直してください。
              </p>
            )}
            <p style={{ marginTop: 16, fontSize: 14 }}>この手紙を直す・取り下げるためのURL</p>
            <div className="lp-copy">
              <input readOnly value={done.url} onFocus={(e) => e.currentTarget.select()} aria-label="修正用のURL" />
              <button
                type="button"
                className="lp-secondary"
                onClick={() => {
                  navigator.clipboard?.writeText(done.url).catch(() => undefined);
                }}
              >
                コピー
              </button>
            </div>
            <p className="lp-note">
              このURLを知っている人は、この手紙を直したり取り下げたりできます。人には見せず、メモなどに残してください(この端末にも覚えておきます)。
              直せるのは {LETTERS_DEADLINE_LABEL} です。
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 18 }}>
              <button type="button" className="lp-primary" onClick={restart}>
                もう一通書く <span aria-hidden>↗</span>
              </button>
              <Link className="lp-secondary" to="/letters/read/">
                届いた手紙を読む
              </Link>
            </div>
          </div>
        ) : (
          <Composer
            mode="new"
            event={event}
            value={value}
            onChange={setValue}
            availability={availability}
            submitState={submitState}
            onSubmit={send}
            bodyResetKey={bodyResetKey}
            events={events}
            counts={counts}
            onChoose={choose}
          />
        )}
      </section>
    </LettersShell>
  );
};

export default LettersWritePage;

export const Head: HeadFC = () => (
  <LettersHead
    title="手紙を書く"
    description="Reolの誕生日に、この一年の思い出とお祝いの言葉を手紙に。カードを一冊にまとめて贈ります。"
    path="/letters/write/"
  />
);
