/**
 * /letters/write/ — 手紙を書く(件名のないふくろう便。plan/64)。
 * /letters/ の「お祝いの手紙を書く」から来る。時期 → 曲 → 宛名 … → 投函を一画面ずつ(Composer)。
 * 手紙はビルドに入れない。投函は Supabase の関数(letters_submit)へ。保存が確かめられてから「受け付けました」と出す。
 */
import React, { useCallback, useEffect, useRef, useState } from "react";
import { HeadFC, Link } from "gatsby";
import { LettersHead, LettersShell } from "../../components/letters/LettersShell";
import { ChosenEvent, Composer, ComposerValue, emptyComposer, SubmitState } from "../../components/letters/Composer";
import { YEAR_EVENT_BY_KEY } from "../../utils/letters/yearEvents";
import { LETTERS_DEADLINE_LABEL, LETTERS_MAX_PER_PERSON, LETTERS_MEMORY_PERIOD_LABEL } from "../../utils/letters/constants";
import { LetterEvent } from "../../utils/letters/timeline";
import { errorMessage, fetchLettersStatus, fetchPublicCounts, LetterContent, LettersError, submitLetter, updateOwnLetter } from "../../utils/letters/service";
import { editUrl, loadDraft, loadMyLetters, newEditKey, newRequestId, rememberMyLetter, saveDraft, writerKey } from "../../utils/letters/local";

const toChosen = (e: LetterEvent): ChosenEvent => ({ key: e.key, label: e.title, date: e.date || null, era: e.era, defaultAddress: e.defaultAddress });

const LettersWritePage: React.FC = () => {
  // 宛先はこの一年の出来事だけ(前の宛先の書きかけ・?event= は、選び直してもらう)
  const byKey = YEAR_EVENT_BY_KEY;
  const [event, setEvent] = useState<ChosenEvent | null>(null);
  const [value, setValue] = useState<ComposerValue>(emptyComposer);
  const [availability, setAvailability] = useState<"loading" | "open" | "closed" | "unavailable" | "paused">("loading");
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [submitState, setSubmitState] = useState<SubmitState>({ kind: "idle" });
  const [done, setDone] = useState<{ id: string; url: string; synced: boolean } | null>(null);
  const [bodyResetKey, setBodyResetKey] = useState(0);
  const pending = useRef<{ requestId: string; editKey: string } | null>(null);
  const loaded = useRef(false);
  /** 前回の書きかけを開いた時の知らせ(下書き保存した日時があれば添える) */
  const [restored, setRestored] = useState<{ savedAt: string | null } | null>(null);
  /** この端末から投函した手紙の数(上限の目安を先に伝える。数えるのは DB) */
  const [sentHere, setSentHere] = useState(0);
  useEffect(() => setSentHere(loadMyLetters().length), [done]);
  /** 「新しく書き始める」で手順を最初から(Composer を作り直す) */
  const [round, setRound] = useState(0);
  const savedAt = useRef<string | null>(null);

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
        font: d.font ?? v.font,
        visibility: d.visibility ?? null,
        body: Array.isArray(d.body) && d.body.length ? d.body : v.body,
      }));
      pending.current = d.pending ?? null;
      savedAt.current = d.savedAt ?? null;
      setBodyResetKey((k) => k + 1);
      const hasText = !!(d.sender || (Array.isArray(d.body) && JSON.stringify(d.body).includes('"t":"')));
      if (hasText || d.savedAt) setRestored({ savedAt: d.savedAt ?? null });
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
      font: value.font,
      visibility: value.visibility ?? undefined,
      body: value.body,
      savedAt: savedAt.current,
      pending: pending.current,
    });
  }, [event, value, done]);

  /** 下書き保存(この端末に。自動で残す書きかけに、保存した日時を添える) */
  const saveNow = () => {
    savedAt.current = new Date().toISOString();
    saveDraft({ ...(loadDraft() ?? {}), eventKey: event?.key ?? null, ...value, snsType: value.snsType || null, visibility: value.visibility ?? undefined, savedAt: savedAt.current, pending: pending.current });
  };

  const startOver = () => {
    saveDraft(null);
    savedAt.current = null;
    pending.current = null;
    setRestored(null);
    setEvent(null);
    setValue(emptyComposer());
    setBodyResetKey((k) => k + 1);
    setRound((r) => r + 1);
  };

  useEffect(() => {
    fetchLettersStatus()
      .then((s) => setAvailability(!s.open ? "closed" : s.accepting === false ? "paused" : "open"))
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
      const r = await submitLetter(p.requestId, p.editKey, { ...content, writer: writerKey() });
      if (!r.ok) {
        setSubmitState({ kind: "error", message: errorMessage(r.error) });
        if (r.error === "closed") setAvailability("closed");
        if (r.error === "paused") setAvailability("paused");
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
        <div className="lp-section-head is-stone">
          <div>
            <div className="lp-eyebrow">01 / MAKE YOUR LETTER</div>
            <h2>
              <span style={{ display: "inline-block" }}>この一年の思い出と、</span>
              <span style={{ display: "inline-block" }}>お祝いの言葉を。</span>
            </h2>
          </div>
          <p className="lp-intro">
            思い出の期間は <strong>{LETTERS_MEMORY_PERIOD_LABEL}</strong>(去年の誕生日から今年の誕生日の前日まで)。この一年に聴いた音楽、心に残ったライヴ、忘れられない言葉を、お祝いと一緒に。昔の曲でも、この一年の思い出なら大歓迎です。思い出ごとに書けて、お一人{LETTERS_MAX_PER_PERSON}通までです。
            <br />
            お祝いの手紙は <strong>{LETTERS_DEADLINE_LABEL}</strong>受け付けます(日本時間)。
          </p>
        </div>
        {done ? (
          <div className="lp-done" role="status">
            <h3>お手紙を受け付けました</h3>
            <p className="lp-note" style={{ marginTop: 8 }}>
              ありがとうございます。Webの「届いた手紙」に載りました(本文を「贈る本だけ」にした手紙は、宛名面だけが載ります)。運営が読んで、ふさわしくないと判断した時は取り下げます。ほかの思い出も書けます(お一人{LETTERS_MAX_PER_PERSON}通まで)。
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
          <>
          {sentHere >= LETTERS_MAX_PER_PERSON && (
            <p className="lp-draft-note" role="status">
              この端末から{sentHere}通投函しています。お一人{LETTERS_MAX_PER_PERSON}通までなので、取り下げた分だけ新しく書けます(
              <Link to="/letters/edit/">書いた手紙を直す・取り下げる</Link>)。
            </p>
          )}
          {restored && (
            <div className="lp-draft-note" role="status">
              <span>
                前回の書きかけを開きました
                {restored.savedAt
                  ? `(${new Date(restored.savedAt).toLocaleString("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })} に下書き保存)`
                  : ""}
                。
              </span>
              <button type="button" className="lp-text-link" onClick={startOver}>
                消して新しく書き始める
              </button>
            </div>
          )}
          <Composer
            key={round}
            onSaveDraft={saveNow}
            mode="new"
            event={event}
            value={value}
            onChange={setValue}
            availability={availability}
            submitState={submitState}
            onSubmit={send}
            bodyResetKey={bodyResetKey}
            counts={counts}
            onChoose={choose}
          />
          </>
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
