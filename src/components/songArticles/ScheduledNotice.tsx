import React from "react";
import { isReleased, useNow } from "../../utils/songArticles/schedule";

/**
 * 予約公開(plan/43)の記事を、公開日時の前に URL から開いた時の注記。公開日時を過ぎたら出さない。
 * 静的HTMLはビルド時刻で判定するので、ビルド時点で予約中ならHTMLにも出る(JS が動いた後に今の時刻で消える)
 */
const ScheduledNotice: React.FC<{ publishedAt?: string | null; builtAt?: number; unlisted?: boolean }> = ({
  publishedAt,
  builtAt,
  unlisted,
}) => {
  const now = useNow(builtAt);
  if (unlisted) {
    return (
      <p role="status" className="bg-bx-yellow text-bx-bg px-4 py-2 text-center text-[13px] font-bold">
        限定公開のプレビューです。URL を知っている人だけが見られます(読みもの一覧などには出ていません)。
      </p>
    );
  }
  if (!publishedAt || isReleased(publishedAt, now)) return null;
  const at = new Date(publishedAt).toLocaleString("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  return (
    <p role="status" className="bg-bx-yellow text-bx-bg px-4 py-2 text-center text-[13px] font-bold">
      公開前のプレビューです(公開予定: {at})。読みもの一覧などには、公開日時を過ぎるまで表示されません。
    </p>
  );
};

export default ScheduledNotice;
