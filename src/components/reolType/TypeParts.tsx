// Reolファンタイプ診断の結果・タイプ詳細・トップで共用する部品(plan/75)。
// 見た目はサイト全体と同じ(罫線で区切った行、bx トークン)。タイプの色は小さな色見本にだけ使う。
import React from "react";
import { getQuizGroup, getQuizType, useQuizT } from "../../data/reol-type/i18n";
import type { GroupCode, TypeCode } from "../../data/reol-type/types";
import { LangLink } from "../../i18n/site/SiteLangContext";
import { Kicker, LinkRow } from "../redesign";

export const MAIN = "container mx-auto max-w-3xl px-3 py-4 text-bx-ink sm:px-4";
const ARROW = "flex-shrink-0 text-bx-ink3 transition-colors group-hover:text-bx-blueLight";

const typePath = (code: TypeCode) => `/quiz/reol-type/types/${code.toLowerCase()}/`;

/** タイプの色見本。暗い色のタイプも黒地で見分けられるよう、細い枠を付ける */
export const TypeSwatch: React.FC<{ color: string }> = ({ color }) => (
  <span
    aria-hidden="true"
    className="block h-3 w-3 flex-shrink-0 rounded-sm border border-bx-ink3/40"
    style={{ backgroundColor: color }}
  />
);

export const SectionHeading: React.FC<{ id?: string; note?: React.ReactNode; children: React.ReactNode }> = ({
  id,
  note,
  children,
}) => (
  <h2 id={id} className="flex items-baseline justify-between gap-3 border-b border-bx-line pb-2">
    <span className="text-[17px] font-extrabold tracking-[0.04em] text-bx-ink">{children}</span>
    {note && <span className="text-xs font-normal tabular-nums text-bx-ink3">{note}</span>}
  </h2>
);

/** ページ先頭の、型名・曲名の型・グループ・コード */
export const TypeHeading: React.FC<{ kicker: string; typeCode: TypeCode }> = ({ kicker, typeCode }) => {
  const { lang } = useQuizT();
  const typeInfo = getQuizType(typeCode, lang);
  const group = getQuizGroup(typeInfo.group, lang);
  return (
    <header className="mb-6">
      <Kicker color="text-bx-blue" className="mb-2 uppercase">
        {kicker}
      </Kicker>
      <h1 className="text-3xl font-bold tracking-tight text-bx-ink sm:text-4xl">{typeInfo.name}</h1>
      <p className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm text-bx-ink3">
        <TypeSwatch color={typeInfo.color} />
        <span className="font-bold text-bx-ink">{typeInfo.songLabel}</span>
        <span>{group.name}</span>
        <span className="tracking-[0.12em]">{typeCode}</span>
      </p>
    </header>
  );
};

/** 歌詞の一節と概要 */
export const TypeIntro: React.FC<{ typeCode: TypeCode }> = ({ typeCode }) => {
  const { lang } = useQuizT();
  const typeInfo = getQuizType(typeCode, lang);
  return (
    <>
      <blockquote className="border-l-2 border-bx-ink3/50 pl-4">
        <p className="text-[15px] leading-relaxed text-bx-ink">「{typeInfo.quote}」</p>
        <footer className="mt-1 text-xs text-bx-ink3">— {typeInfo.song}</footer>
      </blockquote>
      <p className="mt-5 text-[15px] leading-loose text-bx-ink2">{typeInfo.summary}</p>
    </>
  );
};

/** 相性のいいタイプ(タイプ詳細への行) */
export const CompatibilityRows: React.FC<{ typeCode: TypeCode }> = ({ typeCode }) => {
  const { t, lang } = useQuizT();
  const { compatibility } = getQuizType(typeCode, lang);
  const rows = [
    { label: t("reolType.bestMatch"), code: compatibility.bestMatch },
    { label: t("reolType.inspires"), code: compatibility.inspire },
    { label: t("reolType.complements"), code: compatibility.complement },
  ];
  return (
    <section className="mt-10" aria-labelledby="reol-type-compat">
      <SectionHeading id="reol-type-compat">{t("reolType.compatibleTypes")}</SectionHeading>
      <ul className="grid grid-cols-1 sm:grid-cols-3 sm:gap-x-8">
        {rows.map(({ label, code }) => {
          const other = getQuizType(code, lang);
          return <LinkRow key={label} to={typePath(code)} kicker={label} title={other.name} desc={other.songLabel} />;
        })}
      </ul>
    </section>
  );
};

/** シェアカードの画像と、シェア・保存・コピーのボタン */
export const ShareBlock: React.FC<{
  shareImage: string | null;
  copied: boolean;
  /** X でシェアを主な操作(黄)にする。結果の画面で使う */
  primary?: boolean;
  /** 画像の縦横比。タイプ詳細のカード(600x360)は true */
  tall?: boolean;
  onShareX: () => void;
  onSave: () => void;
  onCopy: () => void;
}> = ({ shareImage, copied, primary = false, tall = false, onShareX, onSave, onCopy }) => {
  const { t } = useQuizT();
  const plain =
    "rounded-lg border border-bx-line px-3 py-3 text-sm font-bold text-bx-ink transition-colors hover:border-bx-ink3";
  return (
    <section className="mt-10" aria-labelledby="reol-type-share">
      <SectionHeading id="reol-type-share">{t("reolType.shareCard")}</SectionHeading>
      <div className="pt-4 sm:grid sm:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] sm:items-start sm:gap-6">
        {/* 画像が出来るまで同じ高さを空けておく(下の節が動かないように) */}
        <div
          className={`w-full overflow-hidden rounded-lg border border-bx-line ${tall ? "aspect-[5/3]" : "aspect-[40/21]"}`}
        >
          {shareImage && <img src={shareImage} alt={t("reolType.shareCard")} className="block h-full w-full" />}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:mt-0 sm:grid-cols-1">
          <button
            type="button"
            onClick={onShareX}
            className={`col-span-2 flex items-center justify-center gap-2 sm:col-span-1 ${
              primary
                ? "rounded-lg bg-bx-yellow px-3 py-3 text-sm font-extrabold text-bx-bg transition-opacity hover:opacity-90"
                : plain
            }`}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            <span>{t("reolType.shareOnX")}</span>
          </button>
          <button type="button" onClick={onSave} disabled={!shareImage} className={`${plain} disabled:opacity-40`}>
            {t("reolType.saveImage")}
          </button>
          <button type="button" onClick={onCopy} className={plain}>
            <span aria-live="polite">{copied ? t("reolType.copied") : t("reolType.copyText")}</span>
          </button>
        </div>
      </div>
    </section>
  );
};

const GROUPS: { group: GroupCode; codes: TypeCode[] }[] = [
  { group: "FG", codes: ["FGSA", "FGSI", "FGQA", "FGQI"] },
  { group: "FE", codes: ["FESA", "FESI", "FEQA", "FEQI"] },
  { group: "BG", codes: ["BGSA", "BGSI", "BGQA", "BGQI"] },
  { group: "BE", codes: ["BESA", "BESI", "BEQA", "BEQI"] },
];

/**
 * 全16タイプの一覧。4つのグループごとに、罫線で区切った行で並べる。
 * distribution と total を渡すと、行の右に診断済みの人の中での割合を出す(診断トップ)。
 */
export const TypeList: React.FC<{
  /** いま見ているタイプ・自分のタイプ(黄で示す) */
  current?: TypeCode | null;
  distribution?: Record<string, number>;
  total?: number;
}> = ({ current, distribution, total = 0 }) => {
  const { lang } = useQuizT();
  return (
    <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
      {GROUPS.map(({ group, codes }) => {
        const g = getQuizGroup(group, lang);
        return (
          <div key={group} className="pt-5">
            <h3 className="text-[13px] font-extrabold tracking-[0.08em] text-bx-ink">{g.name}</h3>
            <p className="mt-0.5 text-[12px] leading-relaxed text-bx-ink3">{g.description}</p>
            <ul className="mt-2 border-t border-bx-line">
              {codes.map((code) => {
                const typeInfo = getQuizType(code, lang);
                const isCurrent = code === current;
                const count = distribution?.[code] ?? 0;
                return (
                  <li key={code} className="border-b border-bx-line">
                    <LangLink
                      to={typePath(code)}
                      aria-current={isCurrent ? "true" : undefined}
                      className="group flex items-center gap-3 py-2.5"
                    >
                      <TypeSwatch color={typeInfo.color} />
                      <span className="min-w-0 flex-1">
                        <span
                          className={`block text-[15px] font-bold transition-colors ${
                            isCurrent ? "text-bx-yellow" : "text-bx-ink group-hover:text-bx-blueLight"
                          }`}
                        >
                          {typeInfo.name}
                        </span>
                        <span className="block truncate text-[12px] text-bx-ink3">{typeInfo.songLabel}</span>
                      </span>
                      {total > 0 && (
                        <span className="flex-shrink-0 text-[13px] font-bold tabular-nums text-bx-ink2">
                          {count > 0 ? `${Math.round((count / total) * 100)}%` : "—"}
                        </span>
                      )}
                      <span aria-hidden="true" className={ARROW}>
                        →
                      </span>
                    </LangLink>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
};
