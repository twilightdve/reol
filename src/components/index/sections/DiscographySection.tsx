import React from "react";
import { FaCompactDisc, FaCirclePlay } from "react-icons/fa6";
import { GoListUnordered } from "react-icons/go";
import { BiCommentDetail } from "react-icons/bi";
import Discography from "../discography/discography";
import { DiscographyWithSongs } from "../../../types/discography";

interface DiscographySectionProps {
  discographies: DiscographyWithSongs[];
}

const DiscographySection: React.FC<DiscographySectionProps> = ({
  discographies,
}) => {
  return (
    <section id="DISCOGRAPHY" style={{ contentVisibility: "auto" }}>
      <div className="pt-6 pb-2 px-2 sm:pt-12">
        <h2 className="flex items-center font-bold text-lg text-shadow">
          <FaCompactDisc className="text-lg mr-2" />
          <span className="underline underline-offset-4 decoration-dashed decoration-1">
            DISCOGRAPHY
          </span>
        </h2>
        <div className="pt-2 text-xs sm:text-base break-words leading-relaxed tracking-widest">
          DISCOGRAPHYではこれまでのリリース情報や歌ってみた動画などの一覧を時間軸で掲載しています。
        </div>
      </div>
      <Discography data={discographies} />
      <div className="pt-1 pb-4 px-1 mx-2 my-2 bg-gray-200">
        <ul className="pl-2 pt-1 list-disc list-inside text-xs leading-loose tracking-wide">
          <li>
            上部に表示されたハッシュタグを押すと一覧を簡易的にフィルタすることができます
            <br />
            例）「#れをる」を押下すると「れをる」名義の情報のみが表示されます
          </li>
          <li>
            タイトル左の
            <FaCirclePlay className="inline" />
            をタップすると画面上部のプレイヤーで動画を再生します
          </li>
          <li>
            「
            <GoListUnordered className="inline" />
            開く」を押すと収録曲一覧や楽曲ごとの各種リンクが表示されます
          </li>
          <li>
            曲名の右隣に「
            <BiCommentDetail className="inline" />
            」が表示されている場合、クリックするとSpotifyのリンクや楽曲の解析情報が表示されます
          </li>
        </ul>
      </div>
    </section>
  );
};

export default DiscographySection;
