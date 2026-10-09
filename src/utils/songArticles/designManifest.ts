/**
 * 記事別デザイン(plan/30)の登録表。React を含まない純データなので、gatsby-node と公開スクリプトから読む。
 *
 * デザインは本文の特定の段落の前後に帯や装飾を置くため、作ったときの本文版に結びつける。
 * 本文が改稿されたら(sha256 か段落が変わったら)ビルドは警告して共通テンプレートに戻し、公開は拒否する。
 * 未公開の本文を公開リポジトリに入れないよう、段落は文字列ではなく本文テキストのハッシュ(先頭16桁)で確かめる。
 */
export type DesignAnchor = {
  /** 本文の描画用ツリー(blocks)での位置 */
  block: number;
  /** その段落のテキスト(inlineText)の sha256 先頭16桁 */
  textHash: string;
};

export type DesignManifestEntry = {
  bodyRevision: number;
  bodySha256: string;
  blockCount: number;
  anchors: DesignAnchor[];
  /** デザインが注記等に使う公演(live_item の uuid)。ビルド時に公演名・日付・会場・セットリストを記事ページへ渡す */
  liveItemUuids?: string[];
};

export const DESIGN_MANIFEST: Record<string, DesignManifestEntry> = {
  // Boy(plan/30)。一言(1)・欄外の注記(2: 収録作、5: 演奏記録)・帯(5の前、8の前)・結び(8)
  "reol-song-080": {
    bodyRevision: 1,
    bodySha256: "afbffe0ce12f5eea9ea23772460e4f298cce7f5ce52b41687dfb491d4d61f21c",
    blockCount: 9,
    anchors: [
      { block: 0, textHash: "793a2b7077106c11" },
      { block: 1, textHash: "c11703ff35a5d5e2" },
      { block: 2, textHash: "12c1e01e5b55b463" },
      { block: 5, textHash: "f345e08f6a924b09" },
      { block: 8, textHash: "f69320f083d6f8e3" },
    ],
  },
  // No title(plan/31)。冒頭(0)・一言(1)・注記(2: 収録作、4: 公演、5: セットリスト)・見出し(3, 7)・結び(9)
  // 本文は版2に、表記の修正(2014年の曲の文脈の「Reol」を当時の名義「れをる」に。2か所)を加えたもの(2026-10-09 ユーザー指示)
  "reol-song-006": {
    bodyRevision: 2,
    bodySha256: "550ef1495b5ed74481eb4e7fc861cc678b1e9691e0624b8c0187732649b05664",
    blockCount: 10,
    anchors: [
      { block: 0, textHash: "f3671d775fb3ce27" },
      { block: 1, textHash: "2b98a1ec0fd7e8ca" },
      { block: 2, textHash: "2fd029fd8cdc4218" },
      { block: 3, textHash: "e4044bb1b72f1364" },
      { block: 4, textHash: "c05f89b982dc2402" },
      { block: 5, textHash: "ac770c9be4897e5c" },
      { block: 7, textHash: "5805dee27b8a0bfc" },
      { block: 9, textHash: "72a86ab638fb84e3" },
    ],
    // 2023-03-05 Reol Oneman Live 2023「新式浪漫 Neo Nostalgia」長野公演(まつもと市民芸術館)
    liveItemUuids: ["019e8284-c56f-750c-8925-8de26e1151b8"],
  },
  // MONSTER(plan/32)。一言(1)・注記(2: 収録作)・カラスの群れの後(3)・結び(4)
  "reol-song-026": {
    bodyRevision: 3,
    bodySha256: "b554f21452805a202daa7383e58c7c45eaa58e39df0b039e6d65bd5d807b732e",
    blockCount: 7,
    anchors: [
      { block: 1, textHash: "11a780cd00d8b781" },
      { block: 2, textHash: "f58cf5a1438b3b27" },
      { block: 3, textHash: "e2ec4ed7f8e40050" },
      { block: 4, textHash: "f1c0bb94c010cf51" },
    ],
    // 2025-02-02 Reol Oneman Live 2025 カルチュア・カリキュラム 東京(Zepp DiverCity Tokyo)。奥付に使う
    liveItemUuids: ["019e8284-df9c-7077-9032-3ff96d8ff44d"],
  },
};
