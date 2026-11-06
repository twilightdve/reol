/**
 * /letters/ — Legitの件名のない郵便やさん(Reol 誕生日の手紙企画。plan/64)。
 * 入口(Happy Birthday, Reol)→ 年表で宛先を選ぶ → 手紙をつくる → 投函。
 * 手紙はビルドに入れない。投函は Supabase の関数(letters_submit)へ。保存が確かめられてから「受け付けました」と出す。
 */
import React, { useCallback, useEffect, useRef, useState } from "react";
import { HeadFC, Link } from "gatsby";
import { LettersHead, LettersShell } from "../../components/letters/LettersShell";
import { LetterTimeline } from "../../components/letters/LetterTimeline";
import { ChosenEvent, Composer, ComposerValue, emptyComposer, SubmitState } from "../../components/letters/Composer";
import { useLetterEvents } from "../../components/letters/useLetterEvents";
import {
  LETTERS_COPY,
  LETTERS_DEADLINE_LABEL,
  LETTERS_ORGANIZER,
  LETTERS_SHIPPING_NOTE,
} from "../../utils/letters/constants";
import { LetterEvent } from "../../utils/letters/timeline";
import { errorMessage, fetchLettersStatus, fetchPublicCounts, LetterContent, LettersError, submitLetter, updateOwnLetter } from "../../utils/letters/service";
import { editUrl, loadDraft, newEditKey, newRequestId, rememberMyLetter, saveDraft } from "../../utils/letters/local";

const toChosen = (e: LetterEvent): ChosenEvent => ({ key: e.key, label: e.title, date: e.date || null, era: e.era, defaultAddress: e.defaultAddress });

const LettersPage: React.FC = () => {
  const { events, byKey } = useLetterEvents();
  const [event, setEvent] = useState<ChosenEvent | null>(null);
  const [value, setValue] = useState<ComposerValue>(emptyComposer);
  const [availability, setAvailability] = useState<"loading" | "open" | "closed" | "unavailable">("loading");
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [submitState, setSubmitState] = useState<SubmitState>({ kind: "idle" });
  const [done, setDone] = useState<{ id: string; url: string } | null>(null);
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
    window.requestAnimationFrame(() => document.getElementById("letter")?.scrollIntoView({ block: "start" }));
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
      // 前回の送信が実は届いていた場合は、いま画面にある内容に直しておく
      if (retry) {
        const u = await updateOwnLetter(r.id, p.editKey, r.version, content);
        if (!u.ok) {
          setSubmitState({ kind: "error", message: errorMessage(u.error) });
          return;
        }
      }
      rememberMyLetter({ id: r.id, key: p.editKey, address: content.address, createdAt: new Date().toISOString() });
      pending.current = null;
      saveDraft(null);
      setDone({ id: r.id, url: editUrl(r.id, p.editKey) });
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
    document.getElementById("timeline")?.scrollIntoView({ block: "start" });
  };

  return (
    <LettersShell current="write" dock>
      <section className="lp-hero">
        <div className="lp-greeting">
          <p className="lp-kicker">
            <b>2026.11.09</b> &nbsp; / &nbsp; {LETTERS_ORGANIZER}
          </p>
          <h1 className="lp-birthday">
            <span className="wish">Happy Birthday,</span>
            <span className="artist">Reol</span>
          </h1>
        </div>
        <div className="lp-art" role="img" aria-label="三つの時代へ宛てた、お祝いのカードのデザイン見本">
          <div className="lp-confetti" aria-hidden>
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
          </div>
          <div className="lp-gift left" aria-hidden>
            <span className="gl">A LETTER TO YOU</span>
            <div className="ga">
              <small>あの日のあなたへ</small>エンドレスラインの
              <br />
              REOLへ
            </div>
            <div className="gd" />
            <span className="gf">DESIGN SAMPLE</span>
          </div>
          <div className="lp-gift right" aria-hidden>
            <span className="gl">A LETTER TO YOU</span>
            <div className="ga">
              <small>あの日のあなたへ</small>白夜の
              <br />
              Reolへ
            </div>
            <div className="gd" />
            <span className="gf">DESIGN SAMPLE</span>
          </div>
          <div className="lp-gift center" aria-hidden>
            <span className="gl">
              FOR YOUR
              <br />
              BIRTHDAY
            </span>
            <div className="lp-stamp">
              <span>MATSUMOTO</span>
              <svg viewBox="0 0 60 40" aria-hidden>
                <path d="M0 34 11 20 17 26 29 8 41 24 48 16 60 34M17 26 29 8 35 21 29 18 25 24" fill="none" stroke="currentColor" strokeWidth="1.2" />
                <path d="M0 36H60" stroke="currentColor" />
                <circle cx="47" cy="8" r="3" fill="currentColor" />
              </svg>
              <strong>11.09</strong>
            </div>
            <div className="ga">
              <small>あの日のあなたへ</small>極彩色の
              <br />
              れをる様へ
            </div>
            <span className="gf">DESIGN SAMPLE</span>
          </div>
          <div className="lp-ribbon" aria-hidden>
            WITH LOVE, FROM ALL OF US
          </div>
          <div className="lp-art-caption" aria-hidden>
            カードのデザイン見本
          </div>
        </div>
        <div className="lp-project">
          <h2>
            <span className="small">Legitの</span>
            <span>件名のない郵便やさん</span>
          </h2>
          <p className="lp-tagline">{LETTERS_COPY}</p>
        </div>
        <div className="lp-actions">
          <p className="lp-deadline">
            <span>メッセージ受付締切 · 2026年</span>
            <strong>
              <time dateTime="2026-12-20T23:59:59+09:00">12月20日（日）23:59まで</time>
            </strong>
            <small>日本時間</small>
          </p>
          <a className="lp-primary" href="#timeline">
            お祝いの手紙を書く <span aria-hidden>↗</span>
          </a>
          <Link className="lp-text-link" to="/letters/read/">
            届いた手紙を読む
          </Link>
        </div>
        <p className="lp-hero-intro">
          <span>好きな曲、忘れられないライヴ。</span>
          <span>あの頃のあなたへ、今日の「おめでとう」を。</span>
        </p>
      </section>

      <div className="lp-bridge">
        <div className="lp-bridge-label">今度は、私たちから。</div>
        <p>
          思い出を届けてくれた「あにょの件名のない郵便やさん」へ、ファンからの返事を。
          <br />
          あの企画を知らなくても。あなたが音楽を受け取った、その日から参加できます。
        </p>
        <div className="lp-route">
          <span>あの日の思い</span>
          <i />
          <b>今日の手紙</b>
        </div>
      </div>

      <section className="lp-section" id="timeline">
        <div className="lp-section-head">
          <div>
            <div className="lp-eyebrow">01 / FIND YOUR MOMENT</div>
            <h2>どの頃のあなたへ、書こう。</h2>
          </div>
          <p className="lp-intro">
            出会った日も、あとから好きになった曲も。
            <br />
            あなたの思いが向かう場所を、宛先に。
          </p>
        </div>
        <LetterTimeline events={events} selectedKey={event?.key ?? null} counts={counts} onChoose={choose} />
      </section>

      <section className="lp-section" id="letter" style={{ borderTop: "1px solid var(--line)" }}>
        <div className="lp-section-head">
          <div>
            <div className="lp-eyebrow">02 / MAKE YOUR LETTER</div>
            <h2>
              <span style={{ display: "inline-block" }}>好きな一枚に、</span>
              <span style={{ display: "inline-block" }}>あなたの言葉を。</span>
            </h2>
          </div>
          <p className="lp-intro">
            お祝いメッセージは <strong>{LETTERS_DEADLINE_LABEL}</strong>受け付けます(日本時間)。
          </p>
        </div>
        {done ? (
          <div className="lp-done" role="status">
            <h3>お手紙を受け付けました</h3>
            <p className="lp-note" style={{ marginTop: 8 }}>
              ありがとうございます。運営が内容を確認してから、Webの「届いた手紙」に載ります(本文を「贈る本だけ」にした手紙は、宛名面だけが載ります)。
            </p>
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
            onChooseAgain={() => document.getElementById("timeline")?.scrollIntoView({ block: "start" })}
          />
        )}
      </section>

      <section className="lp-book">
        <div className="lp-book-pic" aria-hidden>
          <div className="lp-leaf">
            <div>
              白夜の
              <br />
              Reolへ<small>FROM A LISTENER<br />2026.11.09</small>
            </div>
          </div>
          <div className="lp-leaf second">
            <div>
              エンドレスラインの
              <br />
              REOLへ<small>FROM A LISTENER<br />2026.11.09</small>
            </div>
          </div>
        </div>
        <div>
          <div className="lp-eyebrow">03 / FROM US, TO YOU</div>
          <h2>おめでとうを、一冊に。</h2>
          <p>
            11月9日のお祝いに、いろんな時代へ宛てた言葉を。一枚ずつ印刷して、ファンレターブックとしてReolへ贈ります。
            Webでのお祝いの先にも、手に取れるかたちで残せるように。
          </p>
          <p className="ship">
            届いたメッセージから順に内容を確認・印刷し、締切後に一冊にまとめて、<strong>年内の発送</strong>を目指します。
          </p>
          <p className="lp-note">
            <Link to="/letters/edit/">書いた手紙を直す・取り下げる</Link>
          </p>
        </div>
      </section>
    </LettersShell>
  );
};

export default LettersPage;

export const Head: HeadFC = () => (
  <LettersHead
    description={`Reolの誕生日に、活動の年表から好きな曲・ライヴ・時代へ宛てて手紙を。カードを一冊にまとめて贈ります。${LETTERS_SHIPPING_NOTE}`}
    path="/letters/"
  />
);
