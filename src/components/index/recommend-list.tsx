import React, { useState, useCallback } from "react";
import { Tweet } from "react-twitter-widgets";
import { Spinner } from "flowbite-react";
import { Recommend } from "../../types/recommend";
import LazyComponent from "../modules/LazyComponent";

interface Props {
  data: Recommend[];
}

const RecommendList: React.FC<Props> = ({ data }) => {
  // ポストIDごとに読み込み完了を判定する(1件でも読み込めないポストがあると
  // 全スケルトンが残り続けるのを防ぐ。tweets.tsxと同じ方式)
  const [loadedIds, setLoadedIds] = useState<Set<string>>(new Set());

  const handleTweetLoad = useCallback((postId: string) => {
    setLoadedIds((prev) => {
      if (prev.has(postId)) return prev;
      const next = new Set(prev);
      next.add(postId);
      return next;
    });
  }, []);

  return (
    <div className="pb-4 px-2">
      <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {data.map((item) => {
          return (
            <LazyComponent
              key={`recommend-${item.id}`}
              threshold={0.1}
            >
              <li>
                <div className={loadedIds.has(item.id) ? "hidden" : ""}>
                  <div className="relative border border-bx-line rounded-lg p-5 bg-white/5 overflow-hidden">
                    {/* スケルトン */}
                    <div className="animate-pulse space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="rounded-full bg-white/10 h-12 w-12"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-3 bg-white/10 rounded w-1/4"></div>
                          <div className="h-3 bg-white/10 rounded w-1/3"></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 bg-white/10 rounded"></div>
                        <div className="h-3 bg-white/10 rounded w-5/6"></div>
                        <div className="h-3 bg-white/10 rounded w-4/6"></div>
                      </div>
                    </div>
                    {/* ローディングスピナー */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <Spinner aria-label="post" color="info" size="xl" />
                    </div>
                  </div>
                </div>
                <blockquote>
                  <Tweet
                    tweetId={item.id}
                    options={{ theme: "dark" }}
                    onLoad={() => handleTweetLoad(item.id)}
                  />
                </blockquote>
              </li>
            </LazyComponent>
          );
        })}
      </ul>
    </div>
  );
};

export default RecommendList;
