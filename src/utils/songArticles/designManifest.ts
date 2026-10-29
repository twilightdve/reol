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
  // ハルシアン(plan/55)。聴くリンク(0)・冒頭(1)・見出し(4, 10, 19)・学校の言葉(5)・シーソーの前(9)・引用と出典(12, 13)・差の図の前(15)・要の一文(16)・舌打ちの図の前(20)・見返すページの前後(21, 22)・ハルとシアンの図の前(23)・結び(26)
  "reol-song-016": {
    bodyRevision: 5,
    bodySha256: "0bd4f28ef6616ceb1cc4ea4b4980bbadd5ac86c717c77be229c2bd31f4ebc892",
    blockCount: 27,
    anchors: [
      { block: 0, textHash: "a48c85475537b26d" },
      { block: 1, textHash: "9b738ee3081c814d" },
      { block: 4, textHash: "a21faaa2e18a7ba4" },
      { block: 5, textHash: "e4b0e403459e6775" },
      { block: 9, textHash: "8dce97ca5cde448b" },
      { block: 10, textHash: "f6f47e93774a28e5" },
      { block: 12, textHash: "1189af34b40d42d0" },
      { block: 13, textHash: "3c3c5b65566d51ad" },
      { block: 15, textHash: "09df5799b8b9387a" },
      { block: 16, textHash: "58bd46950fcde86e" },
      { block: 19, textHash: "44c82672ee6f2772" },
      { block: 20, textHash: "646e7bed74acab18" },
      { block: 21, textHash: "49b064277b6a0738" },
      { block: 22, textHash: "919e412b96d99889" },
      { block: 23, textHash: "374e10d9785d5831" },
      { block: 26, textHash: "67a7cbd0c39097cc" },
    ],
  },
  // 水底游歩道(plan/54)。聴くリンク(0)・冒頭の一文(1)・見出し(4, 12, 19)・月の図の前(5)・浮かんでは潜る線の前(11)・手紙の図の前(13)・要の一文(27)・結び(28)
  "reol-song-015": {
    bodyRevision: 6,
    bodySha256: "487a2799311ec4f92ccc1ff64096abf5058baf1470de470df6428382e4bdf5bf",
    blockCount: 29,
    anchors: [
      { block: 0, textHash: "d93279c0a9adc074" },
      { block: 1, textHash: "96bff712576aed26" },
      { block: 4, textHash: "a7bb13a5850c9ccc" },
      { block: 5, textHash: "39fc0b2974c20ae5" },
      { block: 11, textHash: "2693cd2c81a7c7ae" },
      { block: 12, textHash: "4e31197d6da6ca4b" },
      { block: 13, textHash: "0d6e517ec20f955c" },
      { block: 19, textHash: "84d5f064e2f5f7e1" },
      { block: 27, textHash: "9cb95adbba1a180a" },
      { block: 28, textHash: "3729cae9299847cb" },
    ],
  },
  // 生命線(plan/50)。冒頭(0)・クレジットの段落(3)・見出し(4, 12, 23)・断片から線への図の前後(10, 11)・線の上と下の図の前後(16, 17)・手のひらの線の前後(25, 26)・要の一文(29)・結び(30)
  "reol-song-014": {
    bodyRevision: 3,
    bodySha256: "8cdc99cf699f611d2a394035a37257a4a9edaac2f2a62686f7e8b2e2e39544ee",
    blockCount: 31,
    anchors: [
      { block: 0, textHash: "f5be222fe4823dc7" },
      { block: 3, textHash: "92d2e8573b17d1e3" },
      { block: 4, textHash: "7cc182b637570ae8" },
      { block: 10, textHash: "393ff89086be9131" },
      { block: 11, textHash: "b45a30cf9408f37c" },
      { block: 12, textHash: "aa9e1b521ff4eda4" },
      { block: 16, textHash: "c8f7789f14f91656" },
      { block: 17, textHash: "e199eba17ceda37d" },
      { block: 23, textHash: "81c3f3ab1b4d77c1" },
      { block: 25, textHash: "23b4e54c4a11f749" },
      { block: 26, textHash: "90038c199c22267d" },
      { block: 29, textHash: "830c882d61d88fff" },
      { block: 30, textHash: "f14db42ee4f7c2fc" },
    ],
  },
  // -nil-／極彩色(plan/49)。Spotify(0)・MV(1)・冒頭(2)・境目の帯の前後(5, 6)・見出し(9, 16, 28, 43, 55, 67, 76)・16曲の輪の前後(12, 13)・要の一文(24 とその前後)・四つのにじみの前後(30, 31)・年表の前後(46, 47)・武道館の映像の前後(57, 58)・二つの輪の前後(64, 65)・色見本の前後(70, 71)・結び(80)
  "reol-song-012": {
    bodyRevision: 2,
    bodySha256: "bd35832a5af58efb52c8c7230a4a8f5dc6c4b3918d50836ea4489502b92658a4",
    blockCount: 81,
    anchors: [
      { block: 0, textHash: "cea5894b1fa5bbcb" },
      { block: 1, textHash: "b16101997af010cc" },
      { block: 2, textHash: "7bfeb1b40c91dd6b" },
      { block: 5, textHash: "bbe4e93e9d951c05" },
      { block: 6, textHash: "26ec04b6e9aa3f04" },
      { block: 9, textHash: "3cf242f9bedddf32" },
      { block: 12, textHash: "c6dfbc7f6f0aae36" },
      { block: 13, textHash: "21dc43b857fdc7be" },
      { block: 16, textHash: "4ff980ea31716819" },
      { block: 23, textHash: "99a89b83835ff8b9" },
      { block: 24, textHash: "518f72bc960b3ca3" },
      { block: 25, textHash: "67e628648f5ce686" },
      { block: 28, textHash: "e38e2e2f3bcbbe2d" },
      { block: 30, textHash: "05ee8ce99b46c738" },
      { block: 31, textHash: "a2beae89a0f804cb" },
      { block: 43, textHash: "1b73b5818d738fc8" },
      { block: 46, textHash: "094250a47051ef62" },
      { block: 47, textHash: "146a3b481582ee7c" },
      { block: 55, textHash: "d54658a4bc1efebc" },
      { block: 57, textHash: "8a4b3020102ede70" },
      { block: 58, textHash: "ccb0cfb3deab0149" },
      { block: 64, textHash: "cc9b35e0d79feee8" },
      { block: 65, textHash: "37d4d5803b6532b5" },
      { block: 67, textHash: "78673d9a1cc63673" },
      { block: 70, textHash: "19f8ab4f630f268d" },
      { block: 71, textHash: "b831161b6d289fe9" },
      { block: 76, textHash: "9d0caaceba232987" },
      { block: 80, textHash: "873a46001b3d18b6" },
    ],
  },
  // あ可よろし(plan/45)。Spotify(0)・冒頭(1)・五曲の並びの前後(5, 6)・見出し(8, 19, 32, 48, 68)・XFD の前後(9, 10)・赤短の前後(11, 12)・彼岸花の前後(28, 29)・要の一文(41, 75 とその前後)・2018→2025 の前後(63, 64)・結び(79)
  "reol-song-049": {
    bodyRevision: 3,
    bodySha256: "487093f8e0ccc2afe616b1068ba19f209ff70ccf2c47d408734d75b9756eb51e",
    blockCount: 80,
    anchors: [
      { block: 0, textHash: "bb42e17aad92ab16" },
      { block: 1, textHash: "851198435be7265c" },
      { block: 5, textHash: "1ef6312024c176e0" },
      { block: 6, textHash: "086fc9f9ed585d56" },
      { block: 8, textHash: "d94c60bb9f9ad753" },
      { block: 9, textHash: "3ca3742a23b3d786" },
      { block: 10, textHash: "06624723d50280a2" },
      { block: 11, textHash: "5fcf080319052bc5" },
      { block: 12, textHash: "dc8c59ecd04e30ef" },
      { block: 19, textHash: "f0dcf00a7c1579c6" },
      { block: 28, textHash: "14d1882209ca7010" },
      { block: 29, textHash: "af782ae54910ee82" },
      { block: 32, textHash: "560138b91c6367a8" },
      { block: 40, textHash: "08ddff777a30f219" },
      { block: 41, textHash: "e38f9e0198bc3db0" },
      { block: 42, textHash: "36a8326cab62acb5" },
      { block: 48, textHash: "9c21660c900d96f7" },
      { block: 63, textHash: "fe33e5f0cb9a5075" },
      { block: 64, textHash: "2d702e3a675af652" },
      { block: 68, textHash: "9b28bc2444f6cfeb" },
      { block: 74, textHash: "bebaf99791534aab" },
      { block: 75, textHash: "fbb993ee0db8b62d" },
      { block: 76, textHash: "9635bfde6ee8df9e" },
      { block: 79, textHash: "9cc345c3872f9181" },
    ],
  },
  // カルト(plan/44)。Spotify(0)・冒頭(1)・語源の図の前後(2, 3)・見出し(5, 16, 37, 51, 62)・波形の前後(12, 13)・XFD の前後(17, 18)・浴室の前後(23, 24)・八卦の前後(25, 26)・要の一文(27, 35, 44, 50, 66 とその前後)・光背の前後(49, 50)・境界の図の前後(75, 76)
  "reol-song-048": {
    bodyRevision: 3,
    bodySha256: "700bf46a009da31e6326d21e980d308cbcaf97eb16aa0d0edc95bec4d644c395",
    blockCount: 77,
    anchors: [
      { block: 0, textHash: "42d8259b04b539f9" },
      { block: 1, textHash: "a655851b48b00a28" },
      { block: 2, textHash: "c6689ff10e157e32" },
      { block: 3, textHash: "18f45ebd6eb761a2" },
      { block: 5, textHash: "4c3d6577da0bede6" },
      { block: 12, textHash: "032dacd529051568" },
      { block: 13, textHash: "a52e75b2004dc438" },
      { block: 16, textHash: "3c21b6653314e894" },
      { block: 17, textHash: "d17d7903b53d664e" },
      { block: 18, textHash: "a79eb8d210912a4e" },
      { block: 23, textHash: "ca4b4d8e414d2dc5" },
      { block: 24, textHash: "9bcbdc55160a6507" },
      { block: 25, textHash: "e3834f05b1347a74" },
      { block: 26, textHash: "2607ea75271c4811" },
      { block: 27, textHash: "6411fc01ae19da29" },
      { block: 28, textHash: "dacc30edf8f0848c" },
      { block: 34, textHash: "e323bfc36189403a" },
      { block: 35, textHash: "443fc0068ccce4d9" },
      { block: 36, textHash: "461f92e9596c7140" },
      { block: 37, textHash: "99ed0de0eb417544" },
      { block: 43, textHash: "839904b4917b1345" },
      { block: 44, textHash: "7a565ca0ca37027e" },
      { block: 45, textHash: "13dde343b1202306" },
      { block: 49, textHash: "5a01175bf9305033" },
      { block: 50, textHash: "0d335783978b0327" },
      { block: 51, textHash: "2695c5300803000f" },
      { block: 62, textHash: "0d6cac1a3d34fafe" },
      { block: 65, textHash: "915b354d07f225f1" },
      { block: 66, textHash: "5e78809274320bba" },
      { block: 67, textHash: "bc0a2c862e421612" },
      { block: 75, textHash: "48848fd60548fca0" },
      { block: 76, textHash: "183518b8e9474dc0" },
    ],
  },
  // ミッシング(plan/42)。Spotify(0)・冒頭(1, 2)・メーターの前後(5, 6)・追い越しの前後(9, 10)・XFD の前後(12, 13)・四十九の輪の前後(20, 21)・結び(30)
  "reol-song-047": {
    bodyRevision: 4,
    bodySha256: "3bfd175ba80a90cc4488986efcedf89366a82a080c627bda68663af88c358603",
    blockCount: 31,
    anchors: [
      { block: 0, textHash: "266ba8ca7c4455cd" },
      { block: 1, textHash: "85d146397f27d000" },
      { block: 2, textHash: "5141c9b52a6a7504" },
      { block: 5, textHash: "8394dc17f84f379b" },
      { block: 6, textHash: "674964c7d2478e1c" },
      { block: 9, textHash: "28c60bebe7daa787" },
      { block: 10, textHash: "d5caf6612133fb0e" },
      { block: 12, textHash: "6718d966d85373f1" },
      { block: 13, textHash: "fae93890d7b53b4a" },
      { block: 20, textHash: "b6246b48aa03e9be" },
      { block: 21, textHash: "bb4f15e18c014fc4" },
      { block: 30, textHash: "a5136aaa35755b06" },
    ],
  },
  // 平面鏡(plan/41)。映像へのリンク(0, 1)・Spotify(2)・冒頭(3)・2018年の映像の前後(5, 6)・見出し(12, 26, 36, 47, 68)・ダーツの的の前後(15, 16)・三面鏡の前後(33, 34)・市松の帯の後(48)・2025年の映像の前後(51, 52)・曲順の図の前後(74, 75)・結び(84)
  "reol-song-045": {
    bodyRevision: 3,
    bodySha256: "d1f3e945d592c79912245cec67a5ac14b9ba2f6f14d4fbc2d1f397648a1d3ea8",
    blockCount: 85,
    anchors: [
      { block: 0, textHash: "2b57cb695e5c680a" },
      { block: 1, textHash: "5398bd46eb1d3966" },
      { block: 2, textHash: "63114dff57e97fd9" },
      { block: 3, textHash: "3db4e12a5520a406" },
      { block: 5, textHash: "a7b09ba383675b86" },
      { block: 6, textHash: "15ea3021e2c6847c" },
      { block: 12, textHash: "0d2939b981504868" },
      { block: 15, textHash: "584d1606aca1888e" },
      { block: 16, textHash: "8e7178492e27d2cb" },
      { block: 26, textHash: "5377e46b65f51735" },
      { block: 33, textHash: "bf1feb9af9ae66f9" },
      { block: 34, textHash: "0cc87f32ebd2ca09" },
      { block: 36, textHash: "c42822928d4b2005" },
      { block: 47, textHash: "d216c66200a63378" },
      { block: 48, textHash: "c06b7a789b873160" },
      { block: 51, textHash: "6371e50ba40a638d" },
      { block: 52, textHash: "ebe8a5961918848a" },
      { block: 68, textHash: "718621dfc44d2a46" },
      { block: 74, textHash: "baa30d7cd261bfba" },
      { block: 75, textHash: "a21524d8c80761ff" },
      { block: 84, textHash: "fb503ca885bc4c3d" },
    ],
  },
  // エンド(plan/40)。MV(0)・Spotify(1)・冒頭(2)・見出し(9, 18, 32, 44, 57, 68)・文字の図の前後(12, 13)・「相手」と「自分」の図の前後(26, 27)・献花の前後(50, 51)・届かない電話の図の前後(60, 61)・届く線の前後(72, 73)・結び(82)
  "reol-song-046": {
    bodyRevision: 3,
    bodySha256: "45813c4a325af324e172487473cc75339fab03a95ae382807327349ac64c4860",
    blockCount: 83,
    anchors: [
      { block: 0, textHash: "f808e223725bc280" },
      { block: 1, textHash: "06d216e2fa46ea4a" },
      { block: 2, textHash: "9fbf8a9f6050fff9" },
      { block: 9, textHash: "80cc60cd7b3401a1" },
      { block: 12, textHash: "6995f78e2f0c1605" },
      { block: 13, textHash: "42a4fef9b37f87ca" },
      { block: 18, textHash: "26a70fd4c21a1c3b" },
      { block: 26, textHash: "981fc046839a44a8" },
      { block: 27, textHash: "28089db22312fde6" },
      { block: 32, textHash: "8c829a07e038ac28" },
      { block: 44, textHash: "c5eeb726c90f05bf" },
      { block: 50, textHash: "1edf7417f2a6ec23" },
      { block: 51, textHash: "4c574b3f8b098eb8" },
      { block: 57, textHash: "465f42740d65b686" },
      { block: 60, textHash: "ec5dcc89a2637373" },
      { block: 61, textHash: "98128f8511b932b2" },
      { block: 68, textHash: "6cc2a78c5f847f69" },
      { block: 72, textHash: "41d047cbcfbf0c9c" },
      { block: 73, textHash: "1d6c19963af331ad" },
      { block: 82, textHash: "f9438d8d4e48f776" },
    ],
  },
  // 真空オールドローズ(plan/39)。本文版9(2026-10-13 加筆: 21 オールドローズの色名と夕陽に染まる衛星都市)。
  // リンクの行(0)・冒頭(1)・見出し(3, 8, 23, 32)・夕陽に染まる衛星都市(21)とその次(22)・蓋をして(46)とその次(47)・結び(50)
  "reol-song-057": {
    bodyRevision: 9,
    bodySha256: "8750fb111295ea849bfc9df3f7c4d2c58cef012ca14ffd1f6c494569779e4f74",
    blockCount: 51,
    anchors: [
      { block: 0, textHash: "60187d5eacfb03c0" },
      { block: 1, textHash: "a5041abb930386d9" },
      { block: 3, textHash: "19196832ebd8a577" },
      { block: 8, textHash: "a74b03b3ed6d8a96" },
      { block: 21, textHash: "58abdebc4c30ed11" },
      { block: 22, textHash: "61feb4419d0eec12" },
      { block: 23, textHash: "dae01ff70cddcfa7" },
      { block: 32, textHash: "ee97f67bace59c62" },
      { block: 46, textHash: "00d2351fbe1223c7" },
      { block: 47, textHash: "e0ffb3cbe88ee7af" },
      { block: 50, textHash: "9ad97f8d20427ecb" },
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
    bodySha256: "a97c089df8ca46308f41daba0a5bf04b094213606eb33cfc183d78ba976e544a",
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
