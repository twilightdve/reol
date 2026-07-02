import React from "react";
import type { HeadFC } from "gatsby";
import RelivePlayerApp from "../../features/relive/RelivePlayerApp";
import "../../features/relive/relive.css";

const RelivePage = () => <RelivePlayerApp />;

export default RelivePage;

export const Head: HeadFC = () => (
  <>
    <html lang="ja" />
    <title>Relive Player | !Legit Reol Unofficial Fansite</title>
    <meta
      name="description"
      content="ローカル音源だけで動作する、非公式ファンサイト内の私的再生室です。音源は含まれず、アップロードもされません。"
    />
    {/* ローカルファイル前提の私的再生室なので検索インデックスから除外する。
        SNS 等で偶然辿り着いてもユーザーは音源を持っていないと何もできないため。 */}
    <meta name="robots" content="noindex, nofollow" />
    <meta name="googlebot" content="noindex, nofollow" />
  </>
);
