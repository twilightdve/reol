import React from "react";
import { FaCompactDisc, FaCirclePlay } from "react-icons/fa6";
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
    <section id="DISCOGRAPHY" style={{ contentVisibility: "auto" }} className="bg-bx-surface/5 border border-bx-line rounded-xl mx-2 sm:mx-4 my-4 sm:my-6 p-2 sm:p-3">
      <div className="pt-6 pb-2 px-2 sm:pt-12">
        <h2 className="flex items-center font-bold text-lg text-bx-ink">
          <FaCompactDisc className="text-lg mr-2" />
          <span className="underline underline-offset-4 decoration-dashed decoration-1">
            DISCOGRAPHY
          </span>
        </h2>
        <div className="pt-2 text-xs sm:text-base break-words leading-relaxed tracking-widest text-bx-ink2">
          {t.intro}
        </div>
        <div className="mt-3 rounded-lg border border-bx-line bg-bx-bg/40 p-3">
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
          <p className="mt-1.5 text-[10px] text-bx-ink3">
            {t.collectionHint}
          </p>
        </div>
      </div>
      <Discography data={discographies} />
      <div className="pt-1 pb-4 px-1 mx-2 my-2 bg-bx-surface/5 rounded-lg border border-bx-line">
        <ul className="pl-2 pt-1 list-disc list-inside text-xs leading-loose tracking-wide text-bx-ink2">
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
