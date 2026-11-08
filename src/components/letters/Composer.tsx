/**
 * 手紙をつくる(plan/64)。時期 → 曲(任意)→ 宛名 → 差出人 → 絵柄 → 本文 → 公開範囲 → 確認して投函、を一画面ずつ。
 * 修正では宛先は変えられないので、宛名から。
 * 絵柄や表裏を切り替えても、書いた文章は消えない(状態は 1 か所で持つ)。
 * 本文がカードの枠に入らない時は投函できない(縮めたり切ったりしない)。
 */
import React, { Suspense, useEffect, useId, useMemo, useRef, useState } from "react";
import { CardBack, CardFront, ScaledCard, useBodyFits } from "./Postcard";
import { YearPicker } from "./YearPicker";
import { bodyHasText, bodyLength, emptyBody, LetterBody, stripInvisible, trimBody } from "../../utils/letters/body";
import { Era, LETTER_FONTS, LetterFont, LIMITS, Motif, MOTIFS, SNS_TYPES, snsLabel, SnsType, Visibility } from "../../utils/letters/constants";
import type { LetterContent } from "../../utils/letters/service";
import { ADDRESS_HONORIFICS, ADDRESS_NAMES, AddressParts, composeAddress, ERA_ADDRESS, LetterEvent, parseAddress } from "../../utils/letters/timeline";

const BodyEditor = React.lazy(() => import("./BodyEditor"));

export type ChosenEvent = { key: string; label: string; date: string | null; era: Era; defaultAddress: string };

export type ComposerValue = {
  address: string;
  sender: string;
  snsType: SnsType | "";
  snsId: string;
  motif: Motif;
  font: LetterFont;
  visibility: Visibility | null;
  body: LetterBody;
};

export const emptyComposer = (): ComposerValue => ({
  address: "",
  sender: "",
  snsType: "",
  snsId: "",
  motif: "color",
  font: "sans",
  visibility: null,
  body: emptyBody(),
});


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
  /** 下書き保存(この端末に)。新しく書く時だけ */
  onSaveDraft?: () => void;
  /** 宛先の候補(新しく書く時だけ。時期と曲の画面で使う) */
  counts?: Record<string, number>;
  onChoose?: (e: LetterEvent) => void;
  /** 本文を外から差し替えた時に変える(BodyEditor の resetKey) */
  bodyResetKey?: string | number;
};


/** 一画面に一つずつ */
const ALL_STEPS = [
  { id: "memory", label: "思い出", title: "この一年の、どの思い出を書く？" },
  { id: "motif", label: "絵柄", title: "カードの絵柄を選ぶ" },
  { id: "address", label: "宛名", title: "カードの表に書く、宛名" },
  { id: "sender", label: "差出人", title: "あなたの名前" },
  { id: "body", label: "本文", title: "お祝いの言葉を書く" },
  { id: "visibility", label: "公開", title: "本文を、どこまで見せる？" },
  { id: "confirm", label: "確認", title: "この内容で送ります" },
] as const;
type StepId = (typeof ALL_STEPS)[number]["id"];
const EDIT_STEPS = ALL_STEPS.filter((s) => s.id !== "memory");
type StepError = { step: StepId; message: string };
/** 前につける言葉の「その他」 */
const OTHER_PREFIX = "__other__";

export const Composer: React.FC<Props> = ({
  mode,
  event,
  value,
  onChange,
  availability,
  submitState,
  onSubmit,
  counts = {},
  onChoose,
  bodyResetKey = 0,
  onSaveDraft,
}) => {
  const [savedNote, setSavedNote] = useState<string | null>(null);
  /** 押した直後だけ、ボタンの文字を「保存しました」に(押したことがその場で分かるように) */
  const [justSaved, setJustSaved] = useState(false);
  const savedTimer = useRef<number | null>(null);
  useEffect(() => () => {
    if (savedTimer.current) window.clearTimeout(savedTimer.current);
  }, []);
  const saveNow = () => {
    onSaveDraft?.();
    const t = new Date();
    setSavedNote(`下書きを保存しました(${t.getHours()}:${String(t.getMinutes()).padStart(2, "0")}・この端末に)。あとで「手紙を書く」を開くと続きから書けます。`);
    setJustSaved(true);
    if (savedTimer.current) window.clearTimeout(savedTimer.current);
    savedTimer.current = window.setTimeout(() => setJustSaved(false), 2500);
  };
  const STEPS = mode === "new" ? ALL_STEPS : EDIT_STEPS;
  const [step, setStep] = useState(0);
  const [side, setSide] = useState<"front" | "back">("front");
  const [consent, setConsent] = useState(false);
  /** すぐに公開され、運営があとから取り下げることがあると承知した */
  const [consentPublic, setConsentPublic] = useState(false);
  /** 「次へ」「投函する」を押したあとだけ、その画面のエラーを出す */
  const [showErrors, setShowErrors] = useState(false);
  const editorLabel = useId();
  const topRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLHeadingElement>(null);
  const moved = useRef(false);
  const set = (patch: Partial<ComposerValue>) => onChange({ ...value, ...patch });

  const { fits, measureNode } = useBodyFits(value.body, value.motif, value.font);
  const length = bodyLength(value.body);

  const errors = useMemo(() => {
    const e: StepError[] = [];
    const add = (step: StepId, message: string) => e.push({ step, message });
    if (!event) add(mode === "new" ? "memory" : "address", "どの思い出を書くか選んでください(選ばずにも書けます)。");
    if (!value.address.trim()) add("address", "宛名を選んでください。");
    if (value.address.trim().length > LIMITS.address) add("address", `宛名は${LIMITS.address}字までです。`);
    if (!value.sender.trim()) add("sender", "差出人の名前を入れてください(ペンネームでかまいません)。");
    if (value.sender.trim().length > LIMITS.sender) add("sender", `差出人は${LIMITS.sender}字までです。`);
    if (value.snsType && !/^[A-Za-z0-9_.-]{1,40}$/.test(value.snsId.replace(/^@/, "").trim()))
      add("sender", "SNS ID は英数字と _ . - の40字までで入れてください(載せない時は「載せない」に)。");
    if (!bodyHasText(value.body)) add("body", "本文を書いてください。");
    if (length > LIMITS.bodyChars) add("body", `本文は${LIMITS.bodyChars.toLocaleString()}字までです。`);
    if (!fits) add("body", "本文がカードに入りきりません。文を短くするか、文字を小さくしてください。");
    if (!value.visibility) add("visibility", "本文をWebでも公開するか、贈る本だけに載せるかを選んでください。");
    if (!consent || !consentPublic) add("confirm", "投函の前の確認と、印刷への同意の両方にチェックを入れてください。");
    return e;
  }, [mode, event, value, length, fits, consent, consentPublic]);

  const current = STEPS[step];
  /** 時期と曲の画面は、カードの見本を出さずに一覧を広く */
  const picking = current.id === "memory";
  /** 宛名・差出人の画面は、カードの表だけを見せる(裏の本文はまだ関係ない) */
  const frontOnly = current.id === "address" || current.id === "sender";
  const stepErrors = current.id === "confirm" ? errors : errors.filter((e) => e.step === current.id);
  /** その画面より前が全部埋まっていれば、上の段から飛べる */
  const firstInvalid = STEPS.findIndex((s) => s.id !== "confirm" && errors.some((e) => e.step === s.id));
  const reachable = (i: number) => firstInvalid === -1 || i <= firstInvalid;

  // 画面を替えたら、その画面の頭から。読み上げにも見出しを伝える
  useEffect(() => {
    if (!moved.current) return;
    moved.current = false;
    setSide(STEPS[step].id === "body" ? "back" : "front");
    const top = topRef.current;
    if (top && top.getBoundingClientRect().top < 0) top.scrollIntoView({ block: "start" });
    headRef.current?.focus({ preventScroll: true });
  }, [step]);

  const goTo = (i: number) => {
    if (i < 0 || i >= STEPS.length) return;
    moved.current = true;
    setShowErrors(false);
    setStep(i);
  };

  const next = () => {
    if (stepErrors.length) {
      setShowErrors(true);
      return;
    }
    goTo(step + 1);
  };

  /** 入力欄で Enter を押したら次へ(変換の確定の Enter は除く) */
  const enterToNext = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.nativeEvent.isComposing && e.keyCode !== 229) {
      e.preventDefault();
      next();
    }
  };

  const canSend = availability === "open" && submitState.kind !== "sending";

  const handleSubmit = () => {
    setShowErrors(true);
    if (errors.length || !event || !value.visibility || !canSend) return;
    onSubmit({
      eventKey: event.key,
      eventLabel: event.label,
      eventDate: event.date || null,
      era: event.era,
      address: stripInvisible(value.address).trim(),
      sender: stripInvisible(value.sender).trim(),
      snsType: value.snsType || null,
      snsId: value.snsType ? value.snsId.replace(/^@/, "").trim() : null,
      motif: value.motif,
      font: value.font,
      visibility: value.visibility,
      body: trimBody(value.body),
      consent: true,
    });
  };

  // 宛名は選んで作る(前につける言葉 / 名義 / 呼び方)。前に自由に書いた宛名は、選び直すまでそのまま
  const parsedAddress = parseAddress(value.address);
  const eventPrefix = event ? parseAddress(event.defaultAddress)?.prefix : undefined;
  const addressParts: AddressParts = parsedAddress ?? {
    prefix: eventPrefix ?? "",
    name: ERA_ADDRESS[event?.era ?? "reol"].name,
    honorific: ERA_ADDRESS[event?.era ?? "reol"].honorific,
  };
  const prefixOptions = Array.from(new Set([eventPrefix, "あの頃の", "あの日の", ""].filter((x): x is string => x !== undefined)));
  // 「その他」を選ぶと、前につける言葉を自由に書ける(前に書いた言葉が選択肢に無い時も)
  const [otherPrefix, setOtherPrefix] = useState(false);
  const isOtherPrefix = otherPrefix || !prefixOptions.includes(addressParts.prefix);
  const prefixRoom = LIMITS.address - composeAddress({ ...addressParts, prefix: "" }).length;
  const setAddressPart = (patch: Partial<AddressParts>) => set({ address: composeAddress({ ...addressParts, ...patch }) });
  const fitsAddress = (patch: Partial<AddressParts>) => composeAddress({ ...addressParts, ...patch }).length <= LIMITS.address;
  // 宛名が空のまま(書きかけの復元など)なら、選んだ宛先の既定で埋める
  useEffect(() => {
    if (event && !value.address) set({ address: composeAddress(addressParts) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event, value.address]);

  const face = { address: value.address, sender: value.sender, snsType: value.snsType || null, snsId: value.snsId.replace(/^@/, ""), motif: value.motif, font: value.font };
  const stepIndex = (id: StepId) => STEPS.findIndex((s) => s.id === id);
  const fix = (id: StepId) => (
    <button type="button" className="lp-text-link" onClick={() => goTo(stepIndex(id))}>
      直す
    </button>
  );

  const chooseMemory = (e: LetterEvent) => {
    if (e.key !== event?.key) onChoose?.(e);
    goTo(step + 1);
  };

  const fields = (() => {
    switch (current.id) {
      case "memory":
        return <YearPicker selectedKey={event?.key ?? null} counts={counts} onChoose={chooseMemory} />;
      case "address":
        return (
          <div>
            <div className="lp-address-parts">
              <label>
                <span className="lp-label">前につける言葉</span>
                <select
                  className="lp-select"
                  value={isOtherPrefix ? OTHER_PREFIX : addressParts.prefix}
                  onChange={(e) => {
                    const v = e.target.value;
                    setOtherPrefix(v === OTHER_PREFIX);
                    if (v !== OTHER_PREFIX) setAddressPart({ prefix: v });
                  }}
                >
                  {prefixOptions.map((p) => (
                    <option key={p || "none"} value={p} disabled={!fitsAddress({ prefix: p })}>
                      {p || "(つけない)"}
                    </option>
                  ))}
                  <option value={OTHER_PREFIX}>その他(自由に書く)</option>
                </select>
              </label>
              {isOtherPrefix && (
                <label className="lp-address-other">
                  <span className="lp-label">
                    前につける言葉(自由に) <small>{addressParts.prefix.length}/{prefixRoom}</small>
                  </span>
                  <input
                    className="lp-input"
                    value={addressParts.prefix}
                    maxLength={prefixRoom}
                    onChange={(e) => setAddressPart({ prefix: e.target.value.replace(/[\r\n]/g, "") })}
                    onKeyDown={enterToNext}
                    placeholder="例: 初めて聴いた日の"
                    autoComplete="off"
                    enterKeyHint="next"
                  />
                </label>
              )}
              <label>
                <span className="lp-label">名義</span>
                <select className="lp-select" value={addressParts.name} onChange={(e) => setAddressPart({ name: e.target.value })}>
                  {ADDRESS_NAMES.map((n) => (
                    <option key={n} value={n} disabled={!fitsAddress({ name: n })}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className="lp-label">呼び方</span>
                <select className="lp-select" value={addressParts.honorific} onChange={(e) => setAddressPart({ honorific: e.target.value })}>
                  {ADDRESS_HONORIFICS.map((h) => (
                    <option key={h || "none"} value={h} disabled={!fitsAddress({ honorific: h })}>
                      {h || "呼称なし"}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <p className="lp-address-result" aria-live="polite">
              <span>宛名</span>
              <b>{value.address}</b>
            </p>
            {!parsedAddress && value.address && (
              <p className="lp-note">前に書いた宛名「{value.address}」のままです。選び直すと、上の宛名に置き換わります。</p>
            )}
            <p className="lp-note" style={{ marginTop: 10 }}>
              選んだ宛先から入れてあります。
            </p>
          </div>
        );
      case "sender":
        return (
          <>
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
                onKeyDown={enterToNext}
                placeholder="ペンネームでかまいません"
                autoComplete="nickname"
                enterKeyHint="next"
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
                  onKeyDown={enterToNext}
                  placeholder="@ID"
                  autoCapitalize="none"
                  autoCorrect="off"
                  inputMode="email"
                  enterKeyHint="next"
                />
              </div>
            </div>
          </>
        );
      case "motif":
        return (
          <div>
            <div className="lp-motifs" role="group" aria-label="カードの絵柄">
              {MOTIFS.map((m) => (
                <button key={m.id} type="button" aria-pressed={value.motif === m.id} onClick={() => set({ motif: m.id })}>
                  <span className="lp-swatch" aria-hidden>
                    <span className={`lp-card ${m.id}`}>
                      <span className="motif" />
                    </span>
                  </span>
                  <b>{m.label}</b>
                </button>
              ))}
            </div>
            <p className="lp-note" style={{ marginTop: 10 }}>
              曲のモチーフから起こした絵柄です。表と裏の両方に使います。あとから変えても、書いた文章は消えません。
            </p>
          </div>
        );
      case "body":
        return (
          <div className={`lp-body-step f-${value.font}`}>
            <div className="lp-fonts" role="group" aria-label="手紙の書体">
              <span className="lp-label">書体</span>
              {LETTER_FONTS.map((f) => (
                <button key={f.id} type="button" className="lp-font" aria-pressed={value.font === f.id} onClick={() => set({ font: f.id })}>
                  <span style={{ fontFamily: f.family }}>{f.sample}</span>
                  <small>{f.label}</small>
                </button>
              ))}
            </div>
            <span className="lp-label" id={editorLabel}>
              手紙の本文(裏に載ります)
            </span>
            <Suspense fallback={<div className="lp-editor" style={{ minHeight: 280 }} />}>
              <BodyEditor value={value.body} resetKey={bodyResetKey} onChange={(body) => set({ body })} length={length} fits={fits} labelId={editorLabel} />
            </Suspense>
            <p className="lp-note" style={{ marginTop: 8 }}>
              装飾は太字・文字の色・大きさ・寄せ(左・中央・右)だけです。カードは実寸(100×148mm)で組んでいて、入りきらない時は投函できません。
            </p>
          </div>
        );
      case "visibility":
        return (
          <div>
            <p className="lp-note" style={{ marginBottom: 12 }}>
              どちらも、贈る本には全文を載せます。
            </p>
            <div className="lp-privacy single" role="group" aria-label="本文の公開範囲">
              <button type="button" aria-pressed={value.visibility === "public"} onClick={() => set({ visibility: "public" })}>
                Webでも公開する<small>投函するとすぐ、だれでも表裏を読めます。</small>
              </button>
              <button type="button" aria-pressed={value.visibility === "book"} onClick={() => set({ visibility: "book" })}>
                贈る本だけに掲載する<small>Webには宛名面だけを出します。本文は運営が読み、本に印刷します。</small>
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
        );
      case "confirm":
        return (
          <>
            <dl className="lp-summary">
              <div>
                <dt>宛名</dt>
                <dd>{value.address}</dd>
                {fix("address")}
              </div>
              <div>
                <dt>差出人</dt>
                <dd>
                  {value.sender}
                  {value.snsType && value.snsId && (
                    <small>
                      {snsLabel(value.snsType)} @{value.snsId.replace(/^@/, "")}
                    </small>
                  )}
                </dd>
                {fix("sender")}
              </div>
              <div>
                <dt>絵柄</dt>
                <dd>{MOTIFS.find((m) => m.id === value.motif)?.label}</dd>
                {fix("motif")}
              </div>
              <div>
                <dt>本文</dt>
                <dd>{length.toLocaleString()}字</dd>
                {fix("body")}
              </div>
              <div>
                <dt>公開</dt>
                <dd>{value.visibility === "public" ? "Webでも公開する" : value.visibility === "book" ? "贈る本だけに掲載する" : "まだ選んでいません"}</dd>
                {fix("visibility")}
              </div>
            </dl>
            <div className="lp-rules" role="note" aria-labelledby="lp-rules-title">
              <h4 id="lp-rules-title">投函する前に、確かめてください</h4>
              <ul>
                <li>
                  <b>投函すると、すぐに「届いた手紙」に載ります。</b>運営の確認は待ちません。載るのは宛名・差出人・SNS ID・絵柄と、「Webでも公開」を選んだ時の本文です。
                </li>
                <li>
                  運営が届いた手紙を定期的に読み、ふさわしくないと判断した手紙は、<b>予告なく取り下げます</b>(Webからも贈る本からも外します)。
                </li>
                <li>
                  書かないでください: 人を傷つける言葉・差別、本名・住所・連絡先などの個人情報、宣伝・勧誘、Reolさんや関係者・ほかのファンへの悪口、なりすまし、歌詞などの長い書き写し。
                </li>
                <li>投函したあとに渡すURLから、締切まで何度でも直したり取り下げたりできます。</li>
              </ul>
            </div>
            <label className="lp-consent">
              <input type="checkbox" checked={consentPublic} onChange={(e) => setConsentPublic(e.target.checked)} />
              <span>上のことを読みました。投函するとすぐに公開され、運営が取り下げることがあると承知しています。</span>
            </label>
            <label className="lp-consent">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
              <span>
                運営(!Legit)が内容を読み、カードに印刷してファンレターブックにまとめ、Reolさん宛てに贈ることに同意します。
                本文を「贈る本だけ」にしても、運営は本文を読みます。届いた本は、先方のスタッフの方も確認します。
              </span>
            </label>
          </>
        );
    }
  })();

  return (
    <div ref={topRef} className={`lp-composer${current.id === "confirm" ? " is-confirm" : ""}`}>
      {!picking && event && (
        <div className="lp-chosen">
          <span className="lp-note">宛先</span>
          <b>{event.label}</b>
          {event.date && <span className="lp-note">{event.date.replace(/-/g, ".")}</span>}
          {mode === "new" && (
            <button type="button" className="lp-text-link" onClick={() => goTo(0)}>
              宛先を選び直す
            </button>
          )}
        </div>
      )}

      {availability === "unavailable" && <p className="lp-alert">いまは受付の準備中です。書いた手紙はこの端末に残しておけます。</p>}
      {availability === "closed" && (
        <p className="lp-alert">{mode === "new" ? "受付は終了しました(2026年12月20日 23:59まで)。" : "修正の受付は終了しました。直したい時は運営の X(@twilightplc)までご連絡ください。"}</p>
      )}

      <ol className="lp-steps" aria-label="手紙をつくる手順" style={{ gridTemplateColumns: `repeat(${STEPS.length},minmax(0,1fr))` }}>
        {STEPS.map((s, i) => (
          <li key={s.id}>
            <button
              type="button"
              aria-current={i === step ? "step" : undefined}
              className={i < step ? "is-done" : undefined}
              disabled={!reachable(i)}
              onClick={() => goTo(i)}
            >
              <span aria-hidden>{i + 1}</span>
              {s.label}
            </button>
          </li>
        ))}
      </ol>

      <div className={`lp-atelier${picking ? " is-picking" : ""}`}>
        <div className="lp-fields">
          <div className="lp-step-head">
            <span className="lp-eyebrow">
              STEP {step + 1} / {STEPS.length}
            </span>
            <h3 ref={headRef} tabIndex={-1}>
              {current.id === "confirm" && mode === "edit" ? "この内容に直します" : current.title}
            </h3>
          </div>
          {fields}
          {showErrors && stepErrors.length > 0 && (
            <ul className="lp-errors" role="alert">
              {stepErrors.map((e) => (
                <li key={e.message}>
                  {e.message}
                  {current.id === "confirm" && e.step !== "confirm" && <> {fix(e.step)}</>}
                </li>
              ))}
            </ul>
          )}
          {current.id === "confirm" && submitState.kind === "error" && (
            <p className="lp-alert" role="alert">
              {submitState.message}
            </p>
          )}
        </div>

        <div className="lp-preview">
          <div className="lp-sides" role="group" aria-label="カードの表裏" hidden={frontOnly}>
            <button type="button" aria-pressed={side === "front"} onClick={() => setSide("front")}>
              表 · 宛名
            </button>
            <button type="button" aria-pressed={side === "back"} onClick={() => setSide("back")}>
              裏 · メッセージ
            </button>
          </div>
          <div className={`lp-pair${frontOnly ? " single" : side === "back" ? " show-back" : ""}`}>
            <div data-side="front">
              <ScaledCard label="カードの表(宛名面)のプレビュー">
                <CardFront face={face} />
              </ScaledCard>
              <p className="lp-caption">
                <span>FRONT</span>宛名と差出人
              </p>
            </div>
            <div data-side="back" hidden={frontOnly}>
              <ScaledCard label="カードの裏(本文)のプレビュー">
                <CardBack motif={value.motif} font={value.font} sender={value.sender} body={value.body} over={!fits} />
              </ScaledCard>
              <p className="lp-caption">
                <span>BACK</span>あなたからのメッセージ
              </p>
            </div>
          </div>
          <p className="lp-note" style={{ marginTop: 14 }}>
            ポストカードの表裏 · 100 × 148 mm(仮の寸法)。上のカードは、あなた自身の確認用プレビューです。
          </p>
        </div>
      </div>
      {measureNode}

      <div className="lp-step-nav">
        {step > 0 ? (
          <button type="button" className="lp-secondary" onClick={() => goTo(step - 1)}>
            <span aria-hidden>←</span> 戻る
          </button>
        ) : (
          <span />
        )}
        {mode === "new" && onSaveDraft && (
          <button type="button" className={`lp-secondary lp-draft${justSaved ? " is-saved" : ""}`} onClick={saveNow} aria-live="polite">
            {justSaved ? "✓ 保存しました" : "下書き保存"}
          </button>
        )}
        {current.id === "confirm" ? (
          <button type="button" className="lp-primary" onClick={handleSubmit} disabled={!canSend}>
            {submitState.kind === "sending" ? "送っています…" : mode === "new" ? "この手紙を投函する" : "この内容に直す"}
            <span aria-hidden>↗</span>
          </button>
        ) : (
          <button type="button" className="lp-primary" onClick={next}>
            次へ · {STEPS[step + 1].label}
            <span aria-hidden>→</span>
          </button>
        )}
        {savedNote && (
          <p className="lp-saved" role="status">
            {savedNote}
          </p>
        )}
      </div>
      {current.id === "confirm" && (
        <p className="lp-note lp-step-after" style={{ marginTop: 12 }}>
          {mode === "new" ? "投函するとすぐ、Webの「届いた手紙」に載ります。投函したあと、この手紙を直すためのURLをお渡しします。" : "直した内容は、すぐWebの「届いた手紙」に反映します。"}
        </p>
      )}
    </div>
  );
};
