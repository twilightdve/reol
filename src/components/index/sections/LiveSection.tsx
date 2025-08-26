import React from "react";
import { BsSpeakerFill } from "react-icons/bs";
import { GoListUnordered } from "react-icons/go";
import Live from "../live/live";
import { LiveInfo } from "../../../types/live";

interface LiveSectionProps {
  liveInfos: LiveInfo[];
}

const LiveSection: React.FC<LiveSectionProps> = ({ liveInfos }) => {
  return (
    <div id="LIVE">
      <div className="pt-6 pb-2 px-2 sm:pt-12">
        <h2 className="flex items-center font-bold text-lg text-shadow">
          <BsSpeakerFill className="text-lg mr-2" />
          <span className="underline underline-offset-4 decoration-dashed decoration-1">
            LIVE
          </span>
        </h2>
        <div className="pt-2 text-xs sm:text-base break-words leading-relaxed tracking-widest">
          LIVEでは過去に出演したワンマンライヴやツアー、フェスなどの情報を掲載しています。
          <br />
          ライヴごとのセトリや関連ポスト、ライヴレポートなどを載せていますので、参加できなかったライヴもどんな雰囲気だったのか少しでも感じ取れる様な情報を掲載しています。
        </div>
      </div>
      <Live data={liveInfos} key="live" />
      <div className="pt-1 pb-4 px-1 mx-2 my-2 bg-gray-200">
        <ul className="pl-2 pt-1 list-disc list-inside text-xs leading-loose tracking-wide">
          <li>
            上部に表示されたハッシュタグを押すと一覧を簡易的にフィルタすることができます
            <br />
            例）「#れをる」を押下すると「れをる」名義の情報のみが表示されます
          </li>
          <li>
            「
            <GoListUnordered className="inline" />
            &nbsp;詳細」を押すとライヴレポートや開催場所、セトリ、関連ポストなどの情報が表示されます
          </li>
        </ul>
      </div>
    </div>
  );
};

export default LiveSection;
