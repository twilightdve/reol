import React from "react";
import { Tweet } from "react-twitter-widgets";
import { Recommend } from "../../types/recommend";
import LazyComponent from "../modules/LazyComponent";

interface Props {
  data: Recommend[];
}

const RecommendList: React.FC<Props> = ({ data }) => {
  return (
    <div className="pb-4 px-2">
      <div className="overflow-y-hidden">
        <ul className="flex gap-x-3 overflow-x-scroll snap-x snap-mandatory will-change-scroll">
          {data.map((item) => {
            return (
              <LazyComponent
                key={`recommend-${item.id}`}
                className="w-72 h-112 shrink-0 snap-center snap-mandatory"
                threshold={0.1}
              >
                <blockquote>
                  <li>
                    <Tweet tweetId={item.id} />
                  </li>
                </blockquote>
              </LazyComponent>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default RecommendList;
