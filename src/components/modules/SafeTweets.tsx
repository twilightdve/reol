import React, { useState, useEffect, useRef } from "react";
import { ColorPalette } from "../../utils/colorExtractor";
import LoadingSkeleton from "../common/LoadingSkeleton";
import { trackEvent } from "../../utils/analytics";

// Twitter Widget の型定義
declare global {
  interface Window {
    twttr?: {
      widgets: {
        load: () => Promise<void>;
      };
    };
  }
}

interface Post {
  id: string;
  html: string;
}

interface SafeTweetsProps {
  parentId: string;
  posts: Post[];
  colorPalette: ColorPalette;
}

const SafeTweets: React.FC<SafeTweetsProps> = ({
  parentId,
  posts,
  colorPalette,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 安全にTwitterウィジェットを読み込む
    const loadTweets = async () => {
      try {
        if (typeof window !== "undefined" && window.twttr) {
          await window.twttr.widgets.load();
          setIsLoaded(true);
        } else {
          // Twitter script が利用できない場合はフォールバック
          setHasError(true);
          trackEvent("data_load_error", { category: "data", label: "twitter_widget" });
        }
      } catch (error) {
        console.warn("Twitter widgets loading failed, using fallback:", error);
        setHasError(true);
        trackEvent("data_load_error", { category: "data", label: "twitter_widget" });
      }
    };

    const timer = setTimeout(loadTweets, 100);
    return () => clearTimeout(timer);
  }, []);

  if (hasError || !posts.length) {
    return (
      <div className="space-y-3">
        {posts.map((post, index) => (
          <div
            key={`fallback-${post.id}`}
            className="p-4 rounded-lg border-l-4 bg-gray-50"
            style={{ borderLeftColor: colorPalette.primary }}
          >
            <div className="text-sm text-gray-600 mb-2">
              <strong style={{ color: colorPalette.primary }}>
                関連ポスト #{index + 1}
              </strong>
            </div>
            <div
              className="text-sm prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{
                __html: post.html.replace(/<script[^>]*>.*?<\/script>/gi, ""),
              }}
            />
            <div className="mt-2 text-xs text-gray-500">
              Twitter埋め込みの代替表示
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="space-y-4">
      {posts.map((post) => (
        <div
          key={`tweet-${post.id}`}
          className="tweet-container"
          dangerouslySetInnerHTML={{ __html: post.html }}
        />
      ))}
      {!isLoaded && (
        <div className="py-2">
          <LoadingSkeleton
            rows={2}
            rowHeightClassName="h-20"
            label="ポストを読み込み中..."
          />
        </div>
      )}
    </div>
  );
};

export default SafeTweets;
