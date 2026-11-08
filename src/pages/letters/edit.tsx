/**
 * /letters/edit/#<id>.<鍵> — 書いた手紙を直す・取り下げる(plan/64)。
 * 鍵は URL の # の後ろだけにある(サーバーにもアクセス解析にも渡らない)。読んだらすぐ URL から消し、
 * このタブの sessionStorage と、この端末の「送った手紙」に残す。GA のページ表示も送らない(gatsby-config)。
 */
import React, { useEffect, useState } from "react";
import { HeadFC, Link } from "gatsby";
import { LettersHead, LettersShell } from "../../components/letters/LettersShell";
import { Composer, ComposerValue, SubmitState } from "../../components/letters/Composer";
import { CardFront, ScaledCard } from "../../components/letters/Postcard";
import { LETTERS_DEADLINE_LABEL } from "../../utils/letters/constants";
import { errorMessage, fetchOwnLetter, LetterContent, LettersError, OwnLetter, updateOwnLetter, withdrawOwnLetter } from "../../utils/letters/service";
import { forgetMyLetter, loadMyLetters, MyLetter, rememberMyLetter } from "../../utils/letters/local";

const SESSION_KEY = "legit-letters-edit";
const HASH = /^#?([0-9a-f-]{36})\.([0-9a-f]{64})$/i;

const toValue = (c: LetterContent): ComposerValue => ({
  address: c.address,
  sender: c.sender,
  snsType: c.snsType ?? "",
  snsId: c.snsId ?? "",
  motif: c.motif,
  visibility: c.visibility,
  body: c.body,
});

const EditPage: React.FC = () => {
  const [cred, setCred] = useState<{ id: string; key: string } | null>(null);
  const [mine, setMine] = useState<MyLetter[]>([]);
  const [letter, setLetter] = useState<OwnLetter | null>(null);
  const [value, setValue] = useState<ComposerValue | null>(null);
  const [state, setState] = useState<"init" | "loading" | "ok" | "missing" | "unavailable" | "error" | "list">("init");
  const [submitState, setSubmitState] = useState<SubmitState>({ kind: "idle" });
  const [saved, setSaved] = useState(false);
  const [confirmWithdraw, setConfirmWithdraw] = useState(false);

  useEffect(() => {
    let found: { id: string; key: string } | null = null;
    const m = window.location.hash.match(HASH);
    if (m) {
      found = { id: m[1].toLowerCase(), key: m[2].toLowerCase() };
      window.history.replaceState(window.history.state, "", window.location.pathname);
      try {
        window.sessionStorage.setItem(SESSION_KEY, `${found.id}.${found.key}`);
      } catch {
        // 保存できなくても直せる
      }
    } else {
      try {
        const s = window.sessionStorage.getItem(SESSION_KEY)?.match(HASH);
        if (s) found = { id: s[1], key: s[2] };
      } catch {
        found = null;
      }
    }
    setMine(loadMyLetters());
    if (found) setCred(found);
    else setState("list");
  }, []);

  const load = async (c: { id: string; key: string }) => {
    setState("loading");
    try {
      const r = await fetchOwnLetter(c.id, c.key);
      if (!r.ok) {
        setState("missing");
        return;
      }
      setLetter(r);
      setValue(toValue(r.content));
      setState("ok");
      if (!loadMyLetters().some((x) => x.id === r.id)) rememberMyLetter({ id: r.id, key: c.key, address: r.content.address, createdAt: r.createdAt });
    } catch (e) {
      setState(e instanceof LettersError && e.code === "unavailable" ? "unavailable" : "error");
    }
  };

  useEffect(() => {
    if (cred) load(cred);
  }, [cred]);

  const save = async (content: LetterContent & { consent: true }) => {
    if (!cred || !letter) return;
    setSubmitState({ kind: "sending" });
    setSaved(false);
    try {
      const r = await updateOwnLetter(cred.id, cred.key, letter.version, content);
      if (!r.ok) {
        setSubmitState({ kind: "error", message: errorMessage(r.error) });
        return;
      }
      setSubmitState({ kind: "idle" });
      setSaved(true);
      await load(cred);
    } catch {
      setSubmitState({ kind: "error", message: "直せたかどうか確かめられませんでした。通信を確かめて、もう一度押してください。" });
    }
  };

  const withdraw = async () => {
    if (!cred) return;
    try {
      const r = await withdrawOwnLetter(cred.id, cred.key);
      if (!r.ok) {
        setSubmitState({ kind: "error", message: errorMessage(r.error) });
        return;
      }
      setConfirmWithdraw(false);
      await load(cred);
    } catch {
      setSubmitState({ kind: "error", message: "取り下げられたかどうか確かめられませんでした。通信を確かめて、もう一度お試しください。" });
    }
  };

  return (
    <LettersShell current="edit">
      <section className="lp-section">
        <div className="lp-section-head">
          <div>
            <div className="lp-eyebrow">EDIT YOUR LETTER</div>
            <h2>書いた手紙を直す</h2>
          </div>
          <p className="lp-intro">直したり取り下げたりできるのは {LETTERS_DEADLINE_LABEL} です。直した内容は、すぐWebに反映します。</p>
        </div>

        {state === "list" && (
          <>
            {mine.length ? (
              <>
                <p className="lp-note" style={{ marginBottom: 14 }}>
                  この端末から送った手紙
                </p>
                <div className="lp-grid">
                  {mine.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      className="lp-panel"
                      style={{ textAlign: "left" }}
                      onClick={() => {
                        try {
                          window.sessionStorage.setItem(SESSION_KEY, `${m.id}.${m.key}`);
                        } catch {
                          // ignore
                        }
                        setCred({ id: m.id, key: m.key });
                      }}
                    >
                      <b style={{ fontFamily: "var(--serif)", fontWeight: 500 }}>{m.address}</b>
                      <br />
                      <small className="lp-note">{new Date(m.createdAt).toLocaleDateString("ja-JP")} に送った手紙</small>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <p className="lp-note">
                この端末から送った手紙は見つかりませんでした。投函したあとにお渡しした「修正用のURL」を開いてください。URLをなくした時は、運営の X(@twilightplc)までご連絡ください。
              </p>
            )}
          </>
        )}
        {state === "loading" && <p className="lp-note">読み込んでいます…</p>}
        {state === "missing" && (
          <p className="lp-alert">
            手紙が見つかりませんでした。修正用のURLを、最後まで正しく開いているか確かめてください。
            {cred && mine.some((m) => m.id === cred.id) && (
              <>
                {" "}
                <button
                  type="button"
                  className="lp-text-link"
                  onClick={() => {
                    forgetMyLetter(cred.id);
                    try {
                      window.sessionStorage.removeItem(SESSION_KEY);
                    } catch {
                      // 消せなくても続ける
                    }
                    setMine(loadMyLetters());
                    setState("list");
                  }}
                >
                  この端末の記録から消す
                </button>
              </>
            )}
          </p>
        )}
        {state === "unavailable" && <p className="lp-alert">いまは受付の準備中です。</p>}
        {state === "error" && <p className="lp-alert">読み込めませんでした。通信を確かめて、ページを読み込み直してください。</p>}

        {state === "ok" && letter && value && (
          <>
            <div className="lp-panel" style={{ marginBottom: 22, fontSize: 13, lineHeight: 1.9 }}>
              {letter.withdrawn ? (
                <b>この手紙は取り下げ済みです。Webにも贈る本にも載りません。</b>
              ) : (
                <>
                  {letter.onWeb ? "Webの「届いた手紙」に載っています" : "運営の判断で、Webには載せていません(贈る本には載ります)"}。
                  {letter.onWeb && (
                    <>
                      {" "}
                      <Link to={`/letters/card/?id=${letter.id}`}>載っているカードを見る</Link>
                    </>
                  )}
                </>
              )}
              {saved && <p style={{ margin: "6px 0 0", color: "var(--accent)" }}>直しました。</p>}
            </div>

            {letter.withdrawn ? (
              <div style={{ maxWidth: 300 }}>
                <ScaledCard maxWidth={300}>
                  <CardFront face={letter.content} />
                </ScaledCard>
              </div>
            ) : (
              <>
                <Composer
                  mode="edit"
                  event={{
                    key: letter.content.eventKey,
                    label: letter.content.eventLabel,
                    date: letter.content.eventDate,
                    era: letter.content.era,
                    defaultAddress: letter.content.address,
                  }}
                  value={value}
                  onChange={setValue}
                  availability={letter.editable ? "open" : "closed"}
                  submitState={submitState}
                  onSubmit={save}
                  bodyResetKey={`${letter.id}:${letter.version}`}
                />
                {letter.editable && (
                  <div className="lp-panel" style={{ marginTop: 36 }}>
                    <p style={{ margin: 0, fontSize: 14 }}>この手紙を取り下げる</p>
                    <p className="lp-note">取り下げると、Webにも贈る本にも載りません。もとに戻すことはできません(書き直す時は、新しく投函してください)。</p>
                    {confirmWithdraw ? (
                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
                        <button type="button" className="lp-primary" onClick={withdraw}>
                          取り下げる
                        </button>
                        <button type="button" className="lp-secondary" onClick={() => setConfirmWithdraw(false)}>
                          やめる
                        </button>
                      </div>
                    ) : (
                      <button type="button" className="lp-secondary" style={{ marginTop: 10 }} onClick={() => setConfirmWithdraw(true)}>
                        取り下げる…
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </section>
    </LettersShell>
  );
};

export default EditPage;

export const Head: HeadFC = () => (
  <LettersHead title="書いた手紙を直す" description="投函した手紙を直す・取り下げる。" path="/letters/edit/" noindex />
);
