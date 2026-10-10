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
  // 本文版3(2014年の曲の文脈の「Reol」を当時の名義「れをる」に直した版。Drive・管理シートに反映済み 2026-10-10)
  "reol-song-006": {
    bodyRevision: 3,
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
  // SCORPION(plan/34)。本文版2: 冒頭(1)・注記(2)・引用(3)・サソリの尾(4)・結びの帯(7)
  "reol-song-087": {
    bodyRevision: 2,
    bodySha256: "5f37645b78adfd53afc5349cc870282f83d1b119eb80b34330812b9bf793de45",
    blockCount: 8,
    anchors: [
      { block: 1, textHash: "4a216722a87b6cfb" },
      { block: 2, textHash: "29d11fbd87bc3188" },
      { block: 3, textHash: "1a353c65942e7d00" },
      { block: 4, textHash: "2f24d9e45d3c5f9c" },
      { block: 7, textHash: "925333e90aaeed06" },
    ],
  },
  // 1LDK(plan/35)。本文版2: 冒頭(1)・歌詞の読み(2〜4)・ライヴでの変化(5〜7。6 に公演の注記)・書き手の体験(8〜9)・結び(10〜11。11 の前に壁の額)
  "reol-song-076": {
    bodyRevision: 2,
    bodySha256: "36aa385f23f1fee3da84f0fbbf1c588415a4b03fa242e7058a17ad0ef0b2f648",
    blockCount: 12,
    anchors: [
      { block: 1, textHash: "8bf95c5f809971a5" },
      { block: 2, textHash: "238eab7513867eef" },
      { block: 5, textHash: "18241f053d0e8690" },
      { block: 6, textHash: "e2c60a10d924b2af" },
      { block: 8, textHash: "5ee36aff00c12c15" },
      { block: 10, textHash: "4f337033ea3c469f" },
      { block: 11, textHash: "b65c3494e6349b26" },
    ],
    // 2023-03-05 Reol Oneman Live 2023「新式浪漫 Neo Nostalgia」長野公演(まつもと市民芸術館)。段落6の注記
    liveItemUuids: ["019e8284-c56f-750c-8925-8de26e1151b8"],
  },
};
