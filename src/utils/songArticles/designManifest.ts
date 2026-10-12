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
  // 真空オールドローズ(plan/39)。リンクの行(0)・冒頭(1)・見出し(3, 8, 22, 31)・観覧車の見立て(18)とその次(19)・蓋をして(45)とその次(46)・結び(49)
  "reol-song-057": {
    bodyRevision: 8,
    bodySha256: "c9adfa30555fa74dcd08d0ef7541c6b07b158de6bf23d9848c96928188a01bff",
    blockCount: 50,
    anchors: [
      { block: 0, textHash: "60187d5eacfb03c0" },
      { block: 1, textHash: "a5041abb930386d9" },
      { block: 3, textHash: "19196832ebd8a577" },
      { block: 8, textHash: "a74b03b3ed6d8a96" },
      { block: 18, textHash: "ce1e7ce3c0518392" },
      { block: 19, textHash: "34b6bcdbb1aba97c" },
      { block: 22, textHash: "dae01ff70cddcfa7" },
      { block: 31, textHash: "ee97f67bace59c62" },
      { block: 45, textHash: "00d2351fbe1223c7" },
      { block: 46, textHash: "3eff502f548abcb0" },
      { block: 49, textHash: "9ad97f8d20427ecb" },
    ],
  },
  // ミュータント(plan/38)。動画へのリンク(0)・一言(1)・作り(4)・題名の意味(5)・場所(6, 11)・埠頭(12)・『虚構集』XFD へのリンク(13)・REOL→Reol(14, 19)・結び(20)
  "reol-song-082": {
    bodyRevision: 2,
    bodySha256: "8de47d135355f7ea91254beb9d7b12ff66db3dd7be31561fd6a74b57b7a9e94d",
    blockCount: 22,
    anchors: [
      { block: 0, textHash: "0040ea603ff13405" },
      { block: 1, textHash: "17374a932eb60c7e" },
      { block: 4, textHash: "f51a41c4a7f3c2f4" },
      { block: 5, textHash: "7352eeea49914230" },
      { block: 6, textHash: "d60cd43550306e22" },
      { block: 11, textHash: "4c50bfb174ad22e2" },
      { block: 12, textHash: "829607a0253f727d" },
      { block: 13, textHash: "1e08f88ec914f554" },
      { block: 14, textHash: "1a4971ed739e6e60" },
      { block: 19, textHash: "799491b0208d7d4c" },
      { block: 20, textHash: "71ce64be36e1e18f" },
    ],
  },
  // drop pop candy(plan/37)。本文版3(題名「雨降りの日に聴きたい」、段落12の名義を Reol に。2026-10-12)。一言(1)・雨と遊ぶ(2)・掛け合い(4)・景色の広がり(5)・日々(6)・踊ってみた(8, 9 動画へのリンク)・ライヴ(12)・結び(14)
  "reol-song-004": {
    bodyRevision: 3,
    bodySha256: "f6677ed5a97482f020faa9b842ff0aefb53aa1621302b90b97ded2fa458e8a43",
    blockCount: 15,
    anchors: [
      { block: 1, textHash: "a8d16b48abd1a358" },
      { block: 2, textHash: "dbd95469f19a7e4e" },
      { block: 4, textHash: "e406ff8b5651476c" },
      { block: 5, textHash: "2809b2bd51c20244" },
      { block: 6, textHash: "ba5f6bf8972f0a3d" },
      { block: 8, textHash: "1e700cc13251f509" },
      { block: 9, textHash: "07273dbff2de3d02" },
      { block: 12, textHash: "1f482fa4d64da121" },
      { block: 14, textHash: "01dadde102cb504d" },
    ],
    // 演奏記録の注記: 新式浪漫 Neo Nostalgia の全9公演(2023-01-26 愛知〜2023-03-05 長野)と、その前の演奏(2019-07-14 文明ココロミー -西の塔-)
    liveItemUuids: [
      "019e8284-bfd4-72b5-adf2-d41e0cf0b883",
      "019e8284-c0e9-7551-aec4-a75ac40dfd28",
      "019e8284-c1e0-770a-a065-f7898b03c036",
      "019e8284-c246-7903-bb46-b41acb18f4f3",
      "019e8284-c3e3-79b5-bbe7-36fc1e5ff9d4",
      "019e8284-c441-7fbe-b556-d41a75b30cf2",
      "019e8284-c4a8-7d1a-95c9-fea5b06ac38e",
      "019e8284-c510-753a-a7ec-4103bcd81648",
      "019e8284-c56f-750c-8925-8de26e1151b8",
      "019e8284-aa1a-7693-9934-f043910ff12e",
    ],
  },
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
    // 本文版2に、段落7の名義の修正(れをる → Reol)をこのリポジトリ側で加えたもの(2026-10-11 ユーザー指示)
    bodySha256: "98998d6fd572ca0b787c3c77b13c177e09e6fd1e028673cbdbd2f7c489505ab4",
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
