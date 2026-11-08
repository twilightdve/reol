/**
 * 手紙のカード(plan/64)。実寸 100×148mm で組み、画面では ScaledCard で縮めて見せる。
 * 本文・宛名・名前は文字としてだけ出す(HTML として解釈しない)。
 */
import React, { useLayoutEffect, useRef, useState } from "react";
import type { LetterBody } from "../../utils/letters/body";
import { Motif, snsLabel, textColorValue } from "../../utils/letters/constants";
import { splitAddress } from "../../utils/letters/timeline";

/** 100mm / 148mm を CSS の px に(1mm = 96/25.4px) */
export const CARD_W = (100 * 96) / 25.4;
export const CARD_H = (148 * 96) / 25.4;

/** 親の幅に合わせてカードを縮める */
export const ScaledCard: React.FC<{ children: React.ReactNode; maxWidth?: number; shadow?: boolean; label?: string }> = ({
  children,
  maxWidth = 340,
  shadow = true,
  label,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.8);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const w = el.clientWidth;
      if (w > 0) setScale(w / CARD_W);
    };
    update();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={`lp-scale${shadow ? " lp-shadow" : ""}`}
      style={{ maxWidth, height: CARD_H * scale, margin: "0 auto" }}
      role={label ? "img" : undefined}
      aria-label={label}
    >
      <div style={{ transform: `scale(${scale})`, width: CARD_W, height: CARD_H }}>{children}</div>
    </div>
  );
};

export type CardFace = {
  address: string;
  sender: string;
  snsType?: string | null;
  snsId?: string | null;
  motif: Motif;
};

const addressClass = (address: string) => (address.length > 22 ? " is-longer" : address.length > 14 ? " is-long" : "");

export const CardFront: React.FC<{ face: CardFace }> = ({ face }) => {
  const lines = splitAddress(face.address || "宛名");
  return (
    <div className={`lp-card ${face.motif}`}>
      <div className="motif" />
      {face.motif === "color" && <div className="line" />}
      <div className="top">
        <span className="tiny">
          FAN LETTER
          <br />
          FOR YOUR BIRTHDAY
        </span>
        <div className="mark" aria-hidden>
          UNTITLED POST<strong>11.09</strong>2026
        </div>
      </div>
      <div className={`to${addressClass(face.address)}`}>
        <small>あの日のあなたへ</small>
        {lines.map((l, i) => (
          <span key={i}>{l}</span>
        ))}
      </div>
      <div className="from">
        <small>FROM</small>
        <span>{face.sender || "差出人"}</span>
        {face.snsType && face.snsId && (
          <small>
            {snsLabel(face.snsType)} @{face.snsId}
          </small>
        )}
      </div>
    </div>
  );
};

export const LetterBodyView: React.FC<{ body: LetterBody }> = ({ body }) => (
  <>
    {body.map((p, i) => (
      <p key={i} className={p.a === "c" || p.a === "r" ? p.a : undefined}>
        {p.r.map((r, j) => {
          const style = r.c ? { color: textColorValue(r.c) } : undefined;
          const cls = r.s === "s" ? "rs" : r.s === "l" ? "rl" : undefined;
          const text = r.b ? <b>{r.t}</b> : r.t;
          return (
            <span key={j} className={cls} style={style}>
              {text}
            </span>
          );
        })}
      </p>
    ))}
  </>
);

/**
 * 裏面。body が null なら「本文は贈る本だけ」の札を出す。
 * msgRef を渡すと本文の枠の要素を返す(枠に収まっているかを測る用)
 */
export const CardBack: React.FC<{
  motif: Motif;
  sender: string;
  body: LetterBody | null;
  hiddenNote?: string;
  over?: boolean;
  msgRef?: React.Ref<HTMLDivElement>;
  /** 運営の印刷画面で、どのカードかを測るための番号 */
  position?: number;
}> = ({ motif, sender, body, hiddenNote, over, msgRef, position }) => (
  <div className={`lp-card ${motif} is-back`}>
    <div className="motif" />
    <div className="back-label">
      <span>DEAR YOU,</span>
      <span>WITH LOVE.</span>
    </div>
    {body ? (
      <div className={`msg${over ? " is-over" : ""}`} ref={msgRef} data-position={position}>
        <LetterBodyView body={body} />
      </div>
    ) : (
      <div className="msg-hidden">
        <span>{hiddenNote ?? "この手紙の本文は、\n贈る本だけに載せています。"}</span>
      </div>
    )}
    <div className="sign">{sender}</div>
  </div>
);

/** 本文がカードの枠に入るか(実際の書体で組んで測る)。書体の読み込みを待ってから測る */
export const useBodyFits = (body: LetterBody, motif: Motif): { fits: boolean; measureNode: React.ReactNode } => {
  const ref = useRef<HTMLDivElement>(null);
  const [fits, setFits] = useState(true);
  const key = JSON.stringify(body);
  useLayoutEffect(() => {
    let cancelled = false;
    const measure = () => {
      const el = ref.current;
      if (!el || cancelled) return;
      setFits(el.scrollHeight <= el.clientHeight + 1);
    };
    measure();
    const fonts = (document as Document & { fonts?: { ready: Promise<unknown> } }).fonts;
    fonts?.ready.then(measure).catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [key, motif]);
  const measureNode = (
    <div className="lp-measure" aria-hidden>
      <CardBack motif={motif} sender="" body={body} msgRef={ref} />
    </div>
  );
  return { fits, measureNode };
};
