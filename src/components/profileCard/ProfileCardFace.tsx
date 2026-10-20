/**
 * プロフィールカード(plan/48)の見た目。作る画面のプレビュー・「見せる」画面・受け取った人のページで同じものを使う。
 * 中身は文字としてだけ出す(受け取った中身は確かめていない文字。codec の sanitizePayload を通したもの)。
 */
import React from "react";
import { reolTypes, TypeCode } from "../../data/reol-type/types";
import { CardPayload, SNS, liveSummary } from "../../utils/profileCard/codec";
import { cardStyleOf } from "./cardStyles";

const DEFAULT_ACCENT = "#5b8def";

export const cardAccent = (p: CardPayload): string => (p.t ? reolTypes[p.t as TypeCode]?.color ?? DEFAULT_ACCENT : DEFAULT_ACCENT);

/** 名前の頭文字(アイコンの代わり) */
export const cardInitial = (name: string): string => Array.from(name.trim())[0]?.toUpperCase() ?? "?";

const Label: React.FC<{ color: string; children: React.ReactNode }> = ({ color, children }) => (
  <p className="text-[10px] font-extrabold tracking-[0.22em]" style={{ color }}>
    {children}
  </p>
);

export const ProfileCardFace: React.FC<{
  payload: CardPayload;
  /** SNS をリンクにする(受け取った人のページ) */
  linkSns?: boolean;
  /** アイコン画像(この端末だけ。カードの中身には入らないので、受け取った人のページでは無し) */
  iconSrc?: string | null;
  className?: string;
}> = ({ payload: p, linkSns = false, iconSrc = null, className = "" }) => {
  const accent = cardAccent(p);
  const st = cardStyleOf(p.y);
  const [bgTop, bgBottom] = st.bg(accent);
  const type = p.t ? reolTypes[p.t as TypeCode] : null;
  const sns = SNS.filter((s) => p.x?.[s.key]);
  return (
    <article
      className={`relative overflow-hidden rounded-2xl border shadow-2xl ${className}`}
      style={{ background: `linear-gradient(180deg, ${bgTop}, ${bgBottom})`, color: st.ink, borderColor: st.line }}
      aria-label={`${p.n} のプロフィールカード`}
    >
      <div aria-hidden className="absolute inset-x-0 top-0 h-1.5" style={{ background: st.bar(accent) }} />
      <div className="p-5 sm:p-6">
        <p className="text-[10px] font-extrabold tracking-[0.3em]" style={{ color: st.muted }}>
          PROFILE CARD
        </p>

        <div className="mt-4 flex items-center gap-4">
          <div
            aria-hidden
            className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-full text-[28px] font-extrabold"
            style={{ background: st.avatarBg(accent), color: st.avatarInk }}
          >
            {iconSrc ? <img src={iconSrc} alt="" className="h-full w-full object-cover" /> : cardInitial(p.n)}
          </div>
          <h2 className="min-w-0 text-[26px] font-extrabold leading-tight [overflow-wrap:anywhere]">{p.n}</h2>
        </div>

        {p.b && (
          <p className="mt-4 text-[15px] leading-relaxed [overflow-wrap:anywhere]" style={{ color: st.ink2 }}>
            {p.b}
          </p>
        )}

        <div className="mt-5 space-y-4">
          {type && (
            <div>
              <Label color={st.muted}>REOL TYPE</Label>
              <p className="mt-1 text-[15px] font-bold">
                <span aria-hidden className="mr-1.5">
                  {type.emoji}
                </span>
                {type.name}
                <span className="ml-2 text-[12px] font-normal" style={{ color: st.muted }}>
                  {type.songLabel}
                </span>
              </p>
            </div>
          )}

          {[
            { label: "FAVORITE SONGS", songs: p.s },
            { label: "FAVORITE COVERS", songs: p.c },
          ].map(
            ({ label, songs }) =>
              songs &&
              songs.length > 0 && (
                <div key={label}>
                  <Label color={st.muted}>{label}</Label>
                  <ul className="mt-1 space-y-0.5 text-[15px] font-bold">
                    {songs.map((s, i) => (
                      <li key={i} className="[overflow-wrap:anywhere]">
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )
          )}

          {p.e && (
            <div>
              <Label color={st.muted}>MEMORABLE LIVE</Label>
              <p className="mt-1 text-[15px] font-bold [overflow-wrap:anywhere]">{p.e}</p>
            </div>
          )}

          {p.a && (
            <div>
              <Label color={st.muted}>LIVE参戦</Label>
              <p className="mt-1 text-[15px] font-bold [overflow-wrap:anywhere]">{liveSummary(p.a)}</p>
            </div>
          )}

          {sns.length > 0 && (
            <div>
              <Label color={st.muted}>SNS</Label>
              <ul className="mt-1 space-y-0.5 text-[14px]">
                {sns.map((s) => {
                  const id = p.x![s.key]!;
                  return (
                    <li key={s.key} className="flex gap-2">
                      <span className="w-[74px] flex-shrink-0" style={{ color: st.muted }}>
                        {s.label}
                      </span>
                      {linkSns ? (
                        <a
                          href={s.url(id)}
                          target="_blank"
                          rel="noopener noreferrer nofollow"
                          className="min-w-0 font-bold underline underline-offset-4 [overflow-wrap:anywhere]"
                        >
                          @{id}
                        </a>
                      ) : (
                        <span className="min-w-0 font-bold [overflow-wrap:anywhere]">@{id}</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        <p className="mt-6 text-right text-[10px] font-bold tracking-[0.2em]" style={{ color: st.faint }}>
          !Legit — reol.twilightea.com
        </p>
      </div>
    </article>
  );
};
