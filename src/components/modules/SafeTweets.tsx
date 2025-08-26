import React, { useState, useEffect, useRef } from "react";
import { ColorPalette } from "../../utils/colorExtractor";

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
        }
      } catch (error) {
        console.warn("Twitter widgets loading failed, using fallback:", error);
        setHasError(true);
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
        <div className="text-center py-4">
          <div
            className="inline-block animate-spin rounded-full h-6 w-6 border-b-2"
            style={{ borderColor: colorPalette.primary }}
          ></div>
          <p className="text-sm text-gray-600 mt-2">ポストを読み込み中...</p>
        </div>
      )}
    </div>
  );
};

export default SafeTweets;
