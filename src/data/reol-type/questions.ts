// Reolファン16タイプ診断 — 質問データ

export type Axis = 'FB' | 'GE' | 'SQ' | 'AI';

export interface Question {
  id: number;
  axis: Axis;
  text: string;
  optionA: { icon: string; text: string };
  optionB: { icon: string; text: string };
}

export const questions: Question[] = [
  // === Q1-Q4: 1巡目 ===
  {
    id: 1,
    axis: 'FB',
    text: 'ライブ会場に到着！あなたがまず向かうのは？',
    optionA: { icon: '🔥', text: '少しでも前へ！Reolの息遣いまで感じたい' },
    optionB: { icon: '🌊', text: '見渡せる場所へ。照明演出もまるごと楽しみたい' },
  },
  {
    id: 2,
    axis: 'GE',
    text: 'Reolの新曲のティザーが公開！テンションが上がるのは？',
    optionA: { icon: '🎸', text: '重低音とシャウトが響く、攻めまくりのサウンド' },
    optionB: { icon: '🎹', text: '繊細なメロディが広がる、心に沁みるサウンド' },
  },
  {
    id: 3,
    axis: 'SQ',
    text: 'Reolを知らない友人と音楽の話に。あなたは…',
    optionA: { icon: '📢', text: '「絶対ハマるから！」とその場でおすすめ曲を共有' },
    optionB: { icon: '🎧', text: '「いいよ」とは言うけど、自分から積極的には勧めない' },
  },
  {
    id: 4,
    axis: 'AI',
    text: 'ReolのMVが公開された！まず何をする？',
    optionA: { icon: '🔍', text: '映像の細部をチェック。色彩、小道具、カット割りを分析' },
    optionB: { icon: '💫', text: 'とりあえず全体の雰囲気に浸る。「エモい…」が第一声' },
  },

  // === Q5-Q8: 2巡目 ===
  {
    id: 5,
    axis: 'FB',
    text: 'ライブ中の自分、気づいたら…',
    optionA: { icon: '🔥', text: '前のめりで全力で拳を突き上げている' },
    optionB: { icon: '🌊', text: '少し引いた位置で全体の空気を味わっている' },
  },
  {
    id: 6,
    axis: 'GE',
    text: 'ライブのセトリ、一番テンションが上がるのは？',
    optionA: { icon: '🎸', text: '激しい曲が続いてフロアが揺れる瞬間' },
    optionB: { icon: '🎹', text: '静かな曲で会場がしんと一つになる瞬間' },
  },
  {
    id: 7,
    axis: 'SQ',
    text: 'ライブ終了直後、あなたは…',
    optionA: { icon: '📢', text: '即ポスト！この感動を今すぐ世界に叫びたい' },
    optionB: { icon: '🎧', text: 'まだスマホは出さない。もう少しだけ余韻に浸りたい' },
  },
  {
    id: 8,
    axis: 'AI',
    text: '心に刺さるReolの歌詞に出会った。あなたは…',
    optionA: { icon: '🔍', text: '歌詞の意味を調べ、他の曲や背景との繋がりを考察する' },
    optionB: { icon: '💫', text: '深く考えず、心に響いた感覚をそのまま大事にする' },
  },

  // === Q9-Q12: 3巡目 ===
  {
    id: 9,
    axis: 'FB',
    text: 'もう一度あのライブに行けるとしたら？',
    optionA: { icon: '🔥', text: '迷わず最前。あの距離でしか得られないものがある' },
    optionB: { icon: '🌊', text: '今度は後方で。前回見えなかった全体像を観たい' },
  },
  {
    id: 10,
    axis: 'GE',
    text: '落ち込んだとき、Reolの曲に求めるのは？',
    optionA: { icon: '🎸', text: 'ぶち上げてほしい。激しい曲で気分を上書きしたい' },
    optionB: { icon: '🎹', text: '寄り添ってほしい。静かな曲でじっくり浸りたい' },
  },
  {
    id: 11,
    axis: 'SQ',
    text: 'ライブの感動、あなたはどう残す？',
    optionA: { icon: '📢', text: 'レポやポストで記録して、みんなと共有する' },
    optionB: { icon: '🎧', text: '心の中に留めておく。自分だけの宝物でいい' },
  },
  {
    id: 12,
    axis: 'AI',
    text: 'Reolの曲を「好き」と感じる一番の理由は？',
    optionA: { icon: '🔍', text: '聴くたびに新しい発見がある。構成や歌詞の奥深さ' },
    optionB: { icon: '💫', text: '理屈は説明できないけど、直感的に「これだ」と感じる' },
  },

  // === Q13-Q16: 4巡目 ===
  {
    id: 13,
    axis: 'FB',
    text: '開場してフロアに入った。あなたがまずすることは？',
    optionA: { icon: '🔥', text: 'すぐ前方へ。少しでもステージに近いポジションを確保したい' },
    optionB: { icon: '🌊', text: 'まず全体を見渡して、音と視界のバランスが良い場所を探す' },
  },
  {
    id: 14,
    axis: 'GE',
    text: 'Reolのアルバムで一番リピートする曲は？',
    optionA: { icon: '🎸', text: 'BPM高めの、身体が勝手に動くアッパーチューン' },
    optionB: { icon: '🎹', text: '何度聴いても泣きそうになる、しっとりした曲' },
  },
  {
    id: 15,
    axis: 'SQ',
    text: 'Reolのことを語りたくなるのはどんなとき？',
    optionA: { icon: '📢', text: 'いつでも。話題になれば自然とReolの話をしてしまう' },
    optionB: { icon: '🎧', text: '一人で聴いてるときが至福。あえて人に語る必要はない' },
  },
  {
    id: 16,
    axis: 'AI',
    text: 'ライブでReolが曲間にMCを挟んだ。あなたの聴き方は…',
    optionA: { icon: '🔍', text: '言葉の一つ一つを覚えておいて、後から意図を考えたい' },
    optionB: { icon: '💫', text: '内容より、その場の空気感や声のトーンを感じていたい' },
  },

  // === Q17-Q20: 5巡目 ===
  {
    id: 17,
    axis: 'FB',
    text: '理想のライブハウスの立ち位置は？',
    optionA: { icon: '🔥', text: 'ステージに手が届きそうな最前エリア' },
    optionB: { icon: '🌊', text: 'PA卓の横あたり。音のバランスが一番良い場所' },
  },
  {
    id: 18,
    axis: 'GE',
    text: 'Reolのライブで「この曲来た！」と一番アガるのは？',
    optionA: { icon: '🎸', text: 'フロア全体がジャンプで揺れるキラーチューン' },
    optionB: { icon: '🎹', text: 'ピアノ一本から始まる、息を呑むようなバラード' },
  },
  {
    id: 19,
    axis: 'SQ',
    text: '同じライブに行ったフォロワーのポストが流れてきた。あなたは…',
    optionA: { icon: '📢', text: 'すぐリプやリポスト。感想を語り合いたい！' },
    optionB: { icon: '🎧', text: 'そっといいね。自分の感動は自分の中に持っていたい' },
  },
  {
    id: 20,
    axis: 'AI',
    text: 'Reolが過去のインタビューで制作秘話を語っていた。あなたは…',
    optionA: { icon: '🔍', text: '全文読み込んで、楽曲の新しい解釈を組み立てる' },
    optionB: { icon: '💫', text: '「へー面白い」と思いつつ、曲の印象はそのまま大事にする' },
  },
];
