/**
 * 手紙をつくる(plan/64)。表面(宛名・差出人・SNS・絵柄)→ 本文 → 公開範囲と完成形の確認 → 投函。
 * 絵柄や表裏を切り替えても、書いた文章は消えない(状態は 1 か所で持つ)。
 * 本文がカードの枠に入らない時は投函できない(縮めたり切ったりしない)。
 */
import React, { Suspense, useEffect, useId, useMemo, useState } from "react";
import { CardBack, CardFront, ScaledCard, useBodyFits } from "./Postcard";
import { bodyHasText, bodyLength, emptyBody, LetterBody, trimBody } from "../../utils/letters/body";
import { Era, LIMITS, Motif, MOTIFS, SNS_TYPES, SnsType, Visibility } from "../../utils/letters/constants";
import type { LetterContent } from "../../utils/letters/service";

const BodyEditor = React.lazy(() => import("./BodyEditor"));

export type ChosenEvent = { key: string; label: string; date: string | null; era: Era; defaultAddress: string };

export type ComposerValue = {
  address: string;
  sender: string;
  snsType: SnsType | "";
  snsId: string;
  motif: Motif;
  visibility: Visibility | null;
  body: LetterBody;
};

export const emptyComposer = (): ComposerValue => ({
  address: "",
  sender: "",
  snsType: "",
  snsId: "",
  motif: "color",
  visibility: null,
  body: emptyBody(),
});

const NAME_SUFFIXES = ["れをる様へ", "REOLへ", "Reolへ"];
const SUFFIX_RE = /(れをる様へ|れをるへ|REOLへ|Reolへ|あなたへ)$/;

export type SubmitState = { kind: "idle" } | { kind: "sending" } | { kind: "error"; message: string };

type Props = {
  mode: "new" | "edit";
  event: ChosenEvent | null;
  value: ComposerValue;
  onChange: (v: ComposerValue) => void;
  /** 受付の状態(DB の時計で判定したもの) */
  availability: "loading" | "open" | "closed" | "unavailable";
  submitState: SubmitState;
  onSubmit: (content: LetterContent & { consent: true }) => void;
  onChooseAgain?: () => void;
  /** 本文を外から差し替えた時に変える(BodyEditor の resetKey) */
  bodyResetKey?: string | number;
};

export const Composer: React.FC<Props> = ({ mode, event, value, onChange, availability, submitState, onSubmit, onChooseAgain, bodyResetKey = 0 }) => {
  const [side, setSide] = useState<"front" | "back">("front");
  const [consent, setConsent] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const editorLabel = useId();
  const set = (patch: Partial<ComposerValue>) => onChange({ ...value, ...patch });

  const { fits, measureNode } = useBodyFits(value.body, value.motif);
  const length = bodyLength(value.body);

  const errors = useMemo(() => {
    const e: string[] = [];
    if (!event) e.push("宛先を年表から選んでください。");
    if (!value.address.trim()) e.push("宛名を入れてください。");
    if (value.address.trim().length > LIMITS.address) e.push(`宛名は${LIMITS.address}字までです。`);
    if (!value.sender.trim()) e.push("差出人の名前を入れてください(ペンネームでかまいません)。");
    if (value.sender.trim().length > LIMITS.sender) e.push(`差出人は${LIMITS.sender}字までです。`);
    if (value.snsType && !/^[A-Za-z0-9_.-]{1,40}$/.test(value.snsId.replace(/^@/, "").trim()))
      e.push("SNS ID は英数字と _ . - の40字までで入れてください(載せない時は「載せない」に)。");
    if (!bodyHasText(value.body)) e.push("本文を書いてください。");
    if (length > LIMITS.bodyChars) e.push(`本文は${LIMITS.bodyChars.toLocaleString()}字までです。`);
    if (!fits) e.push("本文がカードに入りきりません。文を短くするか、文字を小さくしてください。");
    if (!value.visibility) e.push("本文をWebでも公開するか、贈る本だけに載せるかを選んでください。");
    if (!consent) e.push("運営による確認・印刷への同意にチェックを入れてください。");
    return e;
  }, [event, value, length, fits, consent]);

  const canSend = availability === "open" && submitState.kind !== "sending";

  const handleSubmit = () => {
    setShowErrors(true);
    if (errors.length || !event || !value.visibility || !canSend) return;
    onSubmit({
      eventKey: event.key,
      eventLabel: event.label,
      eventDate: event.date || null,
      era: event.era,
      address: value.address.trim(),
      sender: value.sender.trim(),
      snsType: value.snsType || null,
      snsId: value.snsType ? value.snsId.replace(/^@/, "").trim() : null,
      motif: value.motif,
      visibility: value.visibility,
      body: trimBody(value.body),
      consent: true,
    });
  };

  const switchName = (suffix: string) => {
    const base = value.address.replace(SUFFIX_RE, "");
    set({ address: `${base}${suffix}`.slice(0, LIMITS.address) });
  };

  const face = { address: value.address, sender: value.sender, snsType: value.snsType || null, snsId: value.snsId.replace(/^@/, ""), motif: value.motif };

  return (
    <>
      <div className="lp-chosen">
        {event ? (
          <>
            <span className="lp-note">宛先</span>
            <b>{event.label}</b>
            {event.date && <span className="lp-note">{event.date.replace(/-/g, ".")}</span>}
            {mode === "new" && onChooseAgain && (
              <button type="button" className="lp-text-link" onClick={onChooseAgain}>
                宛先を選び直す
              </button>
            )}
          </>
        ) : (
          <>
            <span>まだ宛先を選んでいません。</span>
            {onChooseAgain && (
              <button type="button" className="lp-text-link" onClick={onChooseAgain}>
                年表から選ぶ ↑
              </button>
            )}
          </>
        )}
      </div>

      <div className="lp-atelier">
        <div className="lp-fields">
          <div>
            <label className="lp-label" htmlFor="lp-address">
              宛名 <small>{value.address.length}/{LIMITS.address}</small>
            </label>
            <input
              id="lp-address"
              className="lp-input"
              value={value.address}
              maxLength={LIMITS.address}
              onChange={(e) => set({ address: e.target.value })}
              placeholder="極彩色のれをる様へ"
              autoComplete="off"
            />
            <div className="lp-name-chips" role="group" aria-label="呼びかけを変える">
              {NAME_SUFFIXES.map((s) => (
                <button key={s} type="button" className="lp-chip" onClick={() => switchName(s)}>
                  …{s}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="lp-label" htmlFor="lp-sender">
              差出人(表に載ります) <small>{value.sender.length}/{LIMITS.sender}</small>
            </label>
            <input
              id="lp-sender"
              className="lp-input"
              value={value.sender}
              maxLength={LIMITS.sender}
              onChange={(e) => set({ sender: e.target.value })}
              placeholder="ペンネームでかまいません"
              autoComplete="nickname"
            />
          </div>
          <div>
            <span className="lp-label" id="lp-sns-label">
              SNS(任意・表に載ります)
            </span>
            <div className="lp-sns">
              <select
                className="lp-select"
                aria-labelledby="lp-sns-label"
                value={value.snsType}
                onChange={(e) => set({ snsType: e.target.value as SnsType | "", ...(e.target.value ? {} : { snsId: "" }) })}
              >
                <option value="">載せない</option>
                {SNS_TYPES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
              <input
                className="lp-input"
                aria-label="SNS ID"
                value={value.snsId}
                maxLength={LIMITS.snsId + 1}
                disabled={!value.snsType}
                onChange={(e) => set({ snsId: e.target.value })}
                placeholder="@ID"
                autoCapitalize="none"
                autoCorrect="off"
                inputMode="email"
              />
            </div>
          </div>
          <div>
            <span className="lp-label">カードの絵柄</span>
            <div className="lp-motifs" role="group" aria-label="カードの絵柄">
              {MOTIFS.map((m) => (
                <button key={m.id} type="button" aria-pressed={value.motif === m.id} onClick={() => set({ motif: m.id })}>
                  <span className={`lp-swatch ${m.id}`} aria-hidden />
                  {m.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className="lp-label" id={editorLabel}>
              手紙の本文(裏に載ります)
            </span>
            {hydrated ? (
              <Suspense fallback={<div className="lp-editor" style={{ minHeight: 280 }} />}>
                <BodyEditor value={value.body} resetKey={bodyResetKey} onChange={(body) => set({ body })} length={length} fits={fits} labelId={editorLabel} />
              </Suspense>
            ) : (
              <div className="lp-editor" style={{ minHeight: 280 }} />
            )}
            <p className="lp-note" style={{ marginTop: 8 }}>
              装飾は太字・文字の色・大きさ・中央寄せだけです。カードは実寸(100×148mm)で組んでいて、入りきらない時は投函できません。
            </p>
          </div>
        </div>

        <div className="lp-preview">
          <div className="lp-sides" role="group" aria-label="カードの表裏">
            <button type="button" aria-pressed={side === "front"} onClick={() => setSide("front")}>
              表 · 宛名
            </button>
            <button type="button" aria-pressed={side === "back"} onClick={() => setSide("back")}>
              裏 · メッセージ
            </button>
          </div>
          <div className={`lp-pair${side === "back" ? " show-back" : ""}`}>
            <div data-side="front">
              <ScaledCard label="カードの表(宛名面)のプレビュー">
                <CardFront face={face} />
              </ScaledCard>
              <p className="lp-caption">
                <span>FRONT</span>宛名と差出人
              </p>
            </div>
            <div data-side="back">
              <ScaledCard label="カードの裏(本文)のプレビュー">
                <CardBack motif={value.motif} sender={value.sender} body={value.body} over={!fits} />
              </ScaledCard>
              <p className="lp-caption">
                <span>BACK</span>あなたからのメッセージ
              </p>
            </div>
          </div>
          <p className="lp-note" style={{ marginTop: 14 }}>
            ポストカードの表裏 · 100 × 148 mm(仮の寸法)。上のカードは、あなた自身の確認用プレビューです。
          </p>
          {measureNode}
        </div>
      </div>

      <div className="lp-section" style={{ paddingBottom: 0 }}>
        <p className="lp-label" style={{ fontSize: 15 }}>
          手紙の本文を、どこまで見せる？
        </p>
        <p className="lp-note" style={{ marginBottom: 12 }}>
          どちらも、贈る本には全文を載せます。
        </p>
        <div className="lp-privacy" role="group" aria-label="本文の公開範囲">
          <button type="button" aria-pressed={value.visibility === "public"} onClick={() => set({ visibility: "public" })}>
            Webでも公開する<small>運営が確認したあと、だれでも表裏を読めます。</small>
          </button>
          <button type="button" aria-pressed={value.visibility === "book"} onClick={() => set({ visibility: "book" })}>
            贈る本だけに掲載する<small>Webには宛名面だけを出します。本文は運営が確認し、本に印刷します。</small>
          </button>
        </div>
        <p className="lp-note" style={{ marginTop: 12 }} aria-live="polite">
          {value.visibility === "book"
            ? "Webに出るのは宛名面(宛名・差出人・SNS ID・絵柄)だけです。本文は運営が読み、贈る本に印刷します。"
            : value.visibility === "public"
              ? "Webに出る内容：宛名・差出人・SNS ID・絵柄・本文。"
              : "本文をどちらにしても、表面の宛名・差出人・SNS ID・絵柄はWebに公開されます。"}
        </p>
      </div>

      <div className="lp-submit">
        <label className="lp-consent">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
          <span>
            運営(!Legit)が内容を確認し、カードに印刷してファンレターブックにまとめ、Reolさん宛てに贈ることに同意します。
            本文を「贈る本だけ」にしても、運営は本文を読みます。届いた本は、先方のスタッフの方も確認します。
          </span>
        </label>
        {showErrors && errors.length > 0 && (
          <ul className="lp-errors" role="alert">
            {errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        )}
        {submitState.kind === "error" && (
          <p className="lp-alert" role="alert">
            {submitState.message}
          </p>
        )}
        {availability === "unavailable" && <p className="lp-alert">いまは受付の準備中です。書いた手紙はこの端末に残しておけます。</p>}
        {availability === "closed" && (
          <p className="lp-alert">{mode === "new" ? "受付は終了しました(2026年12月20日 23:59まで)。" : "修正の受付は終了しました。直したい時は運営の X(@twilightplc)までご連絡ください。"}</p>
        )}
        <div>
          <button type="button" className="lp-primary" onClick={handleSubmit} disabled={!canSend}>
            {submitState.kind === "sending" ? "送っています…" : mode === "new" ? "この手紙を投函する" : "この内容に直す"}
            <span aria-hidden>↗</span>
          </button>
        </div>
        <p className="lp-note">
          運営が確認してから、Webの「届いた手紙」に載ります。{mode === "new" ? "投函したあと、この手紙を直すためのURLをお渡しします。" : ""}
        </p>
      </div>
    </>
  );
};
