import React from "react";
import { FaCirclePlay } from "react-icons/fa6";
import { GoListUnordered } from "react-icons/go";
import { BiCommentDetail } from "react-icons/bi";
import Discography from "../discography/discography";
import { DiscographyWithSongs } from "../../../types/discography";
import { useCollectionOwned } from "../../../hooks/useCollectionOwned";
import { useDict } from "../../../i18n/site/SiteLangContext";

interface DiscographySectionProps {
  discographies: DiscographyWithSongs[];
}

const DiscographySection: React.FC<DiscographySectionProps> = ({
  discographies,
}) => {
  // 新規コンテンツ案C「コレクション台帳」。個別の所有/視聴済みチェックは各カード
  // (enhanced-timeline-item.tsx)側、ここでは全体のコンプ率だけをまとめて表示する。
  const { owned, mounted } = useCollectionOwned();
  const t = useDict().discography;
  const ownedCount = mounted
    ? discographies.filter((d) => owned.has(d.discographyUuid)).length
    : 0;
  const totalCount = discographies.length;
  const rate = totalCount > 0 ? Math.round((ownedCount / totalCount) * 100) : 0;

  return (
    <section id="DISCOGRAPHY" style={{ contentVisibility: "auto" }} className="mx-auto w-full max-w-4xl px-2 sm:px-4 py-8 sm:py-12">
      {/* 枠で囲まず、見出し・説明・罫線で区切る(plan/71) */}
      <div className="pb-4">
        <h2 className="text-[28px] sm:text-[36px] font-extrabold leading-tight tracking-[0.04em] text-bx-ink">DISCOGRAPHY</h2>
        <div className="mt-3 max-w-2xl break-words text-[14px] sm:text-[15px] leading-[1.9] text-bx-ink2">{t.intro}</div>
        <div className="mt-6 border-y border-bx-line py-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-bx-ink3">
              {t.collectionLabel}
            </span>
            <span className="text-sm font-bold text-bx-blue tabular-nums">
              {ownedCount} / {totalCount} ・ {rate}%
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-bx-line/50 overflow-hidden">
            <div
              className="h-full bg-bx-blue transition-all"
              style={{ width: `${rate}%` }}
            />
          </div>
          <p className="mt-1.5 text-[11px] text-bx-ink3">
            {t.collectionHint}
          </p>
        </div>
      </div>
      <Discography data={discographies} />
      <div className="mt-12 border-t border-bx-line pt-5">
        <ul className="list-disc space-y-1 pl-5 text-[12px] leading-relaxed text-bx-ink3">
          <li>
            {t.helpFilter}
            <br />
            {t.helpFilterExample}
          </li>
          <li>
            {t.helpPlayBefore}
            <FaCirclePlay className="inline" />
            {t.helpPlayAfter}
          </li>
          <li>
            {t.helpOpenBefore}
            <GoListUnordered className="inline" />
            {t.helpOpenAfter}
          </li>
          <li>
            {t.helpCommentBefore}
            <BiCommentDetail className="inline" />
            {t.helpCommentAfter}
          </li>
        </ul>
      </div>
    </section>
  );
};

export default DiscographySection;
