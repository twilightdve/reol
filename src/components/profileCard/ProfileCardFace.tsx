/**
 * プロフィールカード(plan/48)の見た目。作る画面のプレビュー・「見せる」画面・受け取った人のページで同じものを使う。
 * 中身は文字としてだけ出す(受け取った中身は確かめていない文字。codec の sanitizePayload を通したもの)。
 */
import React from "react";
import { reolTypes, TypeCode } from "../../data/reol-type/types";
import { CardPayload, SNS } from "../../utils/profileCard/codec";

const DEFAULT_ACCENT = "#5b8def";

export const cardAccent = (p: CardPayload): string => (p.t ? reolTypes[p.t as TypeCode]?.color ?? DEFAULT_ACCENT : DEFAULT_ACCENT);

/** 名前の頭文字(アイコンの代わり) */
export const cardInitial = (name: string): string => Array.from(name.trim())[0]?.toUpperCase() ?? "?";

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-[10px] font-extrabold tracking-[0.22em] text-white/50">{children}</p>
);

export const ProfileCardFace: React.FC<{
  payload: CardPayload;
  /** SNS をリンクにする(受け取った人のページ) */
  linkSns?: boolean;
  className?: string;
}> = ({ payload: p, linkSns = false, className = "" }) => {
  const accent = cardAccent(p);
  const type = p.t ? reolTypes[p.t as TypeCode] : null;
  const sns = SNS.filter((s) => p.x?.[s.key]);
  return (
    <article
      className={`relative overflow-hidden rounded-2xl border border-white/15 bg-[#101014] text-white shadow-2xl ${className}`}
      aria-label={`${p.n} のプロフィールカード`}
    >
      <div aria-hidden className="absolute inset-x-0 top-0 h-1.5" style={{ background: accent }} />
      <div className="p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[10px] font-extrabold tracking-[0.3em] text-white/60">PROFILE CARD</p>
          {p.e && (
            <p className="min-w-0 truncate rounded-full border border-white/25 px-2.5 py-0.5 text-[11px] font-bold text-white/85">
              {p.e}
            </p>
          )}
        </div>

        <div className="mt-4 flex items-center gap-4">
          <div
            aria-hidden
            className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full text-[28px] font-extrabold text-white"
            style={{ background: accent }}
          >
            {cardInitial(p.n)}
          </div>
          <h2 className="min-w-0 text-[26px] font-extrabold leading-tight [overflow-wrap:anywhere]">{p.n}</h2>
        </div>

        {p.b && <p className="mt-4 text-[15px] leading-relaxed text-white/90 [overflow-wrap:anywhere]">{p.b}</p>}

        <div className="mt-5 space-y-4">
          {type && (
            <div>
              <Label>REOL TYPE</Label>
              <p className="mt-1 text-[15px] font-bold">
                <span aria-hidden className="mr-1.5">
                  {type.emoji}
                </span>
                {type.name}
                <span className="ml-2 text-[12px] font-normal text-white/60">{type.songLabel}</span>
              </p>
            </div>
          )}

          {p.s && p.s.length > 0 && (
            <div>
              <Label>FAVORITE SONGS</Label>
              <ul className="mt-1 space-y-0.5 text-[15px] font-bold">
                {p.s.map((s, i) => (
                  <li key={i} className="[overflow-wrap:anywhere]">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {p.a && (
            <div>
              <Label>LIVE</Label>
              <p className="mt-1 text-[15px] font-bold">
                参戦 <span className="text-[22px] tabular-nums">{p.a.c}</span> 公演
              </p>
              {(p.a.f || p.a.l) && (
                <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-[12px] text-white/75">
                  {p.a.f && (
                    <>
                      <dt className="text-white/50">はじめて</dt>
                      <dd className="[overflow-wrap:anywhere]">{p.a.f}</dd>
                    </>
                  )}
                  {p.a.l && p.a.l !== p.a.f && (
                    <>
                      <dt className="text-white/50">直近</dt>
                      <dd className="[overflow-wrap:anywhere]">{p.a.l}</dd>
                    </>
                  )}
                </dl>
              )}
            </div>
          )}

          {sns.length > 0 && (
            <div>
              <Label>SNS</Label>
              <ul className="mt-1 space-y-0.5 text-[14px]">
                {sns.map((s) => {
                  const id = p.x![s.key]!;
                  return (
                    <li key={s.key} className="flex gap-2">
                      <span className="w-[74px] flex-shrink-0 text-white/50">{s.label}</span>
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

        <p className="mt-6 text-right text-[10px] font-bold tracking-[0.2em] text-white/35">!Legit — reol.twilightea.com</p>
      </div>
    </article>
  );
};
