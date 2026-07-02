// Reolファン16タイプ診断 — タイプ定義データ

export type TypeCode =
  | 'FGSA' | 'FGSI' | 'FGQA' | 'FGQI'
  | 'FESA' | 'FESI' | 'FEQA' | 'FEQI'
  | 'BGSA' | 'BGSI' | 'BGQA' | 'BGQI'
  | 'BESA' | 'BESI' | 'BEQA' | 'BEQI';

export type GroupCode = 'FG' | 'FE' | 'BG' | 'BE';

export interface AxisScore {
  F: number; B: number;
  G: number; E: number;
  S: number; Q: number;
  A: number; I: number;
}

export interface ReolType {
  code: TypeCode;
  group: GroupCode;
  name: string;        // 型名（扇動者 etc.）
  song: string;        // 楽曲名
  songLabel: string;   // 「○○型」
  quote: string;       // 冒頭の一言
  emoji: string;       // タイプのアイコン
  color: string;       // テーマカラー
  summary: string;     // 短い説明（結果画面用・3行程度）
  spotifyTrackId: string; // SpotifyトラックID
  sections: {          // 詳細セクション
    title: string;
    body: string;
  }[];
  compatibility: {
    bestMatch: TypeCode;   // 最も理解し合える
    inspire: TypeCode;     // 刺激を受ける
    complement: TypeCode;  // 補完し合える
  };
}

export interface TypeGroup {
  code: GroupCode;
  name: string;
  emoji: string;
  description: string;
}

export const typeGroups: Record<GroupCode, TypeGroup> = {
  FG: { code: 'FG', name: '突撃型', emoji: '🔥🎸', description: '最前列を愛し、激しい曲に身を委ねるグループ' },
  FE: { code: 'FE', name: '感動型', emoji: '🔥🎹', description: '最前列でエモい曲に心を打たれるグループ' },
  BG: { code: 'BG', name: '俯瞰型', emoji: '🌊🎸', description: '後方からゴリゴリな曲を味わうグループ' },
  BE: { code: 'BE', name: '内観型', emoji: '🌊🎹', description: '後方でエモい曲に浸るグループ' },
};

export const axisLabels = {
  FB: { left: { key: 'F', label: '最前突撃', emoji: '🔥' }, right: { key: 'B', label: '後方俯瞰', emoji: '🌊' }, name: 'ライブスタイル' },
  GE: { left: { key: 'G', label: 'ゴリゴリ', emoji: '🎸' }, right: { key: 'E', label: 'エモ・バラード', emoji: '🎹' }, name: '楽曲の好み' },
  SQ: { left: { key: 'S', label: '布教', emoji: '📢' }, right: { key: 'Q', label: '没入', emoji: '🎧' }, name: 'ファン活動' },
  AI: { left: { key: 'A', label: '考察', emoji: '🔍' }, right: { key: 'I', label: '直感', emoji: '💫' }, name: '沼り方' },
} as const;

export const reolTypes: Record<TypeCode, ReolType> = {
  // ===== 🔥🎸 突撃型（FG__）=====
  FGSA: {
    code: 'FGSA',
    group: 'FG',
    name: '扇動者',
    song: '煽げや尊し',
    songLabel: '煽げや尊し型',
    quote: '衝動的で無敵　いい感じじゃん',
    emoji: '🪭',
    color: '#E63946',
    spotifyTrackId: '2LeHTvjUmiR1A6L9txGDfm',
    summary: '最前列で全力で盛り上がりながら、その経験を言語化して周囲にReolの魅力を広めます。考察と布教を両立する、Reolファン界のカリスマ的存在。',
    sections: [
      { title: '戦略的な熱狂', body: '単に暴れるだけではなく、ライブ中の体験を言葉にする能力に長けています。「あの曲のあの瞬間、照明が赤に変わった時の会場の熱量がすごかった」と、具体的かつ説得力のある言葉で感動を伝えます。' },
      { title: 'ライブという名の布教活動', body: 'ライブは個人的な体験であると同時に布教の素材でもあります。ライブ後にはSNSで長文レポを書き、音源とライブの違いを考察し、初参戦の友人に「次はここに注目して」とアドバイスを送ります。' },
      { title: '同志を見つける喜び', body: '同じ熱量で語り合える同志を見つけたときの喜びは格別です。「あなたのレポを読んで行ってみた」と言われたときの達成感は、最前列の興奮にも匹敵します。' },
    ],
    compatibility: { bestMatch: 'FGSI', inspire: 'BGSA', complement: 'BEQI' },
  },
  FGSI: {
    code: 'FGSI',
    group: 'FG',
    name: '鼓舞者',
    song: 'たい',
    songLabel: 'たい型',
    quote: 'もっと馬鹿になりたい　いっしょ、いっしょ',
    emoji: '⚡',
    color: '#FF6B35',
    spotifyTrackId: '4gtvQM3JWzRNYwGF1iYkmb',
    summary: '最前列で本能のまま暴れ、その熱量で周囲を巻き込んでいくタイプ。「とりあえず一回ライブ来て」が最強の布教スタイル。',
    sections: [
      { title: '衝動が生む連鎖反応', body: '行動原理はシンプル。「やりたいからやる」。ライブが始まれば考える前に身体が動き、その圧倒的な熱量が周囲にも伝染していきます。存在そのもので人を動かします。' },
      { title: '本能の布教者', body: '布教スタイルは論理ではなく体験の共有です。一緒にライブに行って隣で暴れることが最大の布教活動。理屈ではなく「空気」で伝えるのが真骨頂。' },
      { title: '「やりたい」の純粋さ', body: '打算や計算なく「やりたいからやる」を貫くことで、周囲に安心感を与えます。気づけばその周りにはいつも人が集まっています。' },
    ],
    compatibility: { bestMatch: 'FGSA', inspire: 'FGQI', complement: 'BEQA' },
  },
  FGQA: {
    code: 'FGQA',
    group: 'FG',
    name: '猛者',
    song: '生命線',
    songLabel: '生命線型',
    quote: '誰も気付かないような感覚を　独り占めしていくのさ',
    emoji: '💪',
    color: '#B5179E',
    spotifyTrackId: '4YDnmsQW2lnZL4Cju7EPMT',
    summary: '最前列で激しい曲に身を委ねながら、楽曲の構造や音作りを冷静に分析。没入と分析の二重構造を持つ孤高のリスナー。',
    sections: [
      { title: '没入と分析の両立', body: '最前列でヘッドバンギングしながら、同時に「あのシンセの音色が前回のライブと違う」と気づける耳を持っています。身体は完全に没入しているのに、脳の一部は冷静に分析を続けています。' },
      { title: '孤高のリスナー', body: '布教に興味がなく、ライブ後にSNSで感想を書くこともほとんどありません。しかし音楽理論の話題を振れば、驚くほど深い知見を惜しみなく語ってくれるでしょう。' },
      { title: '命を懸ける覚悟', body: '最前列でなければ得られない情報——アーティストの息遣い、モニタースピーカーから漏れる音——を逃したくないという覚悟が、彼らを最前列に立たせ続けます。' },
    ],
    compatibility: { bestMatch: 'BGQA', inspire: 'FGSA', complement: 'FESI' },
  },
  FGQI: {
    code: 'FGQI',
    group: 'FG',
    name: '闘士',
    song: '第六感',
    songLabel: '第六感型',
    quote: '今最高潮なんです！第六感、六感またがって　このまま何処までいけるの',
    emoji: '🥊',
    color: '#D62828',
    spotifyTrackId: '5zYnmO6kfYp88THtqvxYTW',
    summary: '理屈抜きで最前列に立ち、本能のままに激しい曲と一体化するタイプ。ライブは「身体で受け止める」もの。',
    sections: [
      { title: '身体が先に動く', body: 'イントロが鳴った瞬間、考える前に身体が反応しています。なぜその曲が好きなのか聞かれても「わからない、でもヤバい」としか答えられない——でも、それでいい。' },
      { title: '言葉のいらない世界', body: 'ライブ後も「良かった」以上の言葉はなかなか出てきません。でも、言葉にした瞬間に失われるものがあると本能的に知っています。' },
      { title: '最前列の孤独と充実', body: '余計な気遣いをせずに音楽と一体化できる一人参戦を好む傾向があります。汗だくで会場を出るときの充実感は、闘士にしかわからない特別なもの。' },
    ],
    compatibility: { bestMatch: 'BGQI', inspire: 'FGSI', complement: 'BESA' },
  },

  // ===== 🔥🎹 感動型（FE__）=====
  FESA: {
    code: 'FESA',
    group: 'FE',
    name: '伝承者',
    song: '宵々古今',
    songLabel: '宵々古今型',
    quote: '移ろうは古今　航路なら堂々　恐るることなどはあらざらむ',
    emoji: '📜',
    color: '#7B2D8E',
    spotifyTrackId: '3KLHSYHSmny4sJo2finqy9',
    summary: '最前列で受けた感動を深く考察し、その体験を丁寧に言語化して伝えます。一つひとつのライブを「歴史」として記録する語り手。',
    sections: [
      { title: '感動を「歴史」にする人', body: '一つひとつのライブ体験を「記録すべき歴史」として捉えています。過去のライブや楽曲のリリース時期と結びつけ、文脈の中に位置づけます。' },
      { title: '布教のための分析', body: '長文のライブレポはもちろん、過去のセットリストとの比較表を作ったり、演出の変遷をまとめたりと、体系的で資料性に富んだ伝え方をします。' },
      { title: '過去と未来を繋ぐ橋', body: '伝承者のレポや感想には独特の深みと温かみがあり、読む人に「自分もReolの歴史の一部なんだ」と感じさせる力があります。' },
    ],
    compatibility: { bestMatch: 'FESI', inspire: 'BESA', complement: 'FGQA' },
  },
  FESI: {
    code: 'FESI',
    group: 'FE',
    name: '語り部',
    song: 'サイサキ',
    songLabel: 'サイサキ型',
    quote: '足掻いても伝わらないよそれでも僕らには言葉しかないから　歌い続けるよ',
    emoji: '🎤',
    color: '#E76F51',
    spotifyTrackId: '5yMHjWC8xY3MvHl090qABC',
    summary: '最前列で直感的に受け取った感動を、そのまま熱く周囲に語るタイプ。感情の鮮度を大切にする天性の共感力の持ち主。',
    sections: [
      { title: '感情の翻訳者', body: '「あの瞬間、マジで泣いた」「照明が変わった瞬間に鳥肌が立った」という素直な感情表現が、読む人の共感を呼びます。言葉はストレートで飾り気がないけれど、だからこそ心に真っ直ぐ届きます。' },
      { title: '共感の連鎖', body: '感想を発信すると「わかる！」というリプライが連なり、気づけばTLが同じライブの感動で溢れている——そんな光景を生み出します。' },
      { title: '「響かせる」ということ', body: '意図して布教しているわけではありません。ただ感じたことを素直に発信しているだけですが、その感情の純度が高いからこそ、結果として最も効果的な布教になっています。' },
    ],
    compatibility: { bestMatch: 'FESA', inspire: 'BESI', complement: 'BGQA' },
  },
  FEQA: {
    code: 'FEQA',
    group: 'FE',
    name: '探究者',
    song: 'ミュータント',
    songLabel: 'ミュータント型',
    quote: '答を、アウフガーベ　迷いを正して',
    emoji: '🔬',
    color: '#457B9D',
    spotifyTrackId: '3AkvJc5aJt3FauOliKi9Z9',
    summary: '最前列でエモい曲に浸りながら、歌詞やMVの深い意味を一人で探り続けます。独自の解釈で音楽の深淵に潜る孤独な探究者。',
    sections: [
      { title: '独自の進化を遂げた存在', body: '既存の解釈に満足できず、自分だけの答えを見つけ出すために歌詞を何度も読み返し、MVのワンカットを何十回も再生します。' },
      { title: '孤独な探究の道', body: '自分の考察を積極的に共有しません。まだ探究の途中だから。中途半端な解釈を発信することを嫌い、腑に落ちるまで考え続けます。' },
      { title: '変異し続ける感性', body: '同じ曲を半年後に聴いたとき、まったく違う意味を見出すことがあります。音楽と自分の関係が常に「突然変異」し続けていることを楽しめるのが強みです。' },
    ],
    compatibility: { bestMatch: 'BEQA', inspire: 'FEQI', complement: 'BGSI' },
  },
  FEQI: {
    code: 'FEQI',
    group: 'FE',
    name: '詩人',
    song: '1LDK',
    songLabel: '1LDK型',
    quote: 'イヤフォンの向こうへ　三分と少しの間だけ　全能感、革命的な気分でいさせて',
    emoji: '🪶',
    color: '#264653',
    spotifyTrackId: '27MVvs7ErNpl81dkwwNS5i',
    summary: '最前列で繊細に音楽を受け止め、言葉にならない余韻をそっと心に留めます。音楽との一対一の対話を大切にする静かな感受性の持ち主。',
    sections: [
      { title: '一対一の対話', body: 'ライブは大勢の中にいながらReolと一対一で向き合う時間。会場の喧騒の中に自分だけの静かな空間を作り出します。声の息遣い、ピアノの残響を一つも逃したくない。' },
      { title: '言葉にしない美学', body: 'ライブの感想をほとんど発信しません。言葉にした瞬間に何かが失われると直感的に感じているから。帰りの電車で余韻に浸る時間が最も大切。' },
      { title: '繊細さという強さ', body: '他の人が気づかないような微細な変化——MCのニュアンスの違い、セットリストの並びが生む感情の流れ——に気づき、静かに心に刻んでいます。' },
    ],
    compatibility: { bestMatch: 'BEQI', inspire: 'FEQA', complement: 'BGSA' },
  },

  // ===== 🌊🎸 俯瞰型（BG__）=====
  BGSA: {
    code: 'BGSA',
    group: 'BG',
    name: '軍師',
    song: 'ウテナ',
    songLabel: 'ウテナ型',
    quote: 'あなたと機械になって　御眼鏡通りさ　浮かぶ理想郷',
    emoji: '♟️',
    color: '#2A9D8F',
    spotifyTrackId: '4j8iEmJZidEu5hwM7lBtVM',
    summary: '後方から全体を見渡して冷静に分析し、その知見を戦略的に共有します。会場レポや音響分析など実用的な情報を体系的にまとめる参謀。',
    sections: [
      { title: '凛とした知略家', body: '最前列の熱狂を冷静に観察し、会場全体の空気感、照明と音響の連携、観客の反応のうねりをマクロな視点で捉えます。後方に立つのは全体像を把握するための戦略的なポジショニングです。' },
      { title: '知見の戦略的共有', body: '会場ごとの音響の違い、座席位置と見え方の関係、効率的な物販攻略法——実用的な情報を体系的にまとめ上げることが得意です。' },
      { title: '冷静さの中の情熱', body: '冷静に見えますが内側にはReolへの深い情熱が。感情的な言葉ではなく、精緻な分析と有用な情報提供という形で愛情を示します。' },
    ],
    compatibility: { bestMatch: 'BGSI', inspire: 'FGSA', complement: 'FEQI' },
  },
  BGSI: {
    code: 'BGSI',
    group: 'BG',
    name: '賢者',
    song: 'Q?',
    songLabel: 'Q?型',
    quote: '生きるほど傷が増えていく　それでも探している僕らの理由を',
    emoji: '🦉',
    color: '#588157',
    spotifyTrackId: '6z8lqqJDjpLisnIA1Gf88o',
    summary: '後方から直感的に場の空気を読み取り、独自の問いかけで周囲に気づきを与えます。謎めいた洞察力を持つ不思議な存在。',
    sections: [
      { title: '問いを投げる人', body: '分析的な答えを出すのではなく、直感的な「問い」を投げかけます。「あの曲、なんであのタイミングで演ったんだろう？」——その問いが周囲の思考を刺激します。' },
      { title: '空気を読む達人', body: '後方から会場全体の空気を直感的に感じ取ります。論理的な根拠はないけれど、なぜか的を射た観察をするのが特徴です。' },
      { title: '謎めいた存在感', body: 'ぽつりと投げる一言が周囲に長い余韻を残します。答えを押し付けるのではなく問いを共有するスタンスが、心地よい知的刺激を与えています。' },
    ],
    compatibility: { bestMatch: 'BGSA', inspire: 'BGQI', complement: 'FGQA' },
  },
  BGQA: {
    code: 'BGQA',
    group: 'BG',
    name: '観測者',
    song: 'ちるちる',
    songLabel: 'ちるちる型',
    quote: '知れば知るほど苦しい　それでもなぜ、知りたいの',
    emoji: '📊',
    color: '#344E41',
    spotifyTrackId: '4homtlmmqdnMSv6uLJR2kI',
    summary: '後方から冷静にライブを観測し、論理的に詳細な記録と分析を重ねます。16タイプの中で最も客観的にライブを「観る」存在。',
    sections: [
      { title: '論理の代理人', body: '感情を排したピュアなデータでライブを記録し分析します。セットリストの順番、曲間の秒数、照明の色彩パターン——あらゆる情報を脳内データベースに記録し続けています。' },
      { title: '感情を排した純粋な分析', body: '「良かった」ではなく「前回のツアーと比べてMCの長さが平均20秒伸びている」といった客観的事実の積み重ねを好みます。感情の排除は、音楽への最大の敬意です。' },
      { title: '孤高の記録者', body: '分析を積極的に共有しません。記録ノートにはファンの誰よりも詳細なライブの記録が残されていますが、それは自分のためのものです。' },
    ],
    compatibility: { bestMatch: 'FGQA', inspire: 'BGSA', complement: 'FESI' },
  },
  BGQI: {
    code: 'BGQI',
    group: 'BG',
    name: '共鳴者',
    song: '激白',
    songLabel: '激白型',
    quote: '間違っていても　痛い思いをしても構わないよ　不幸も君とだけ',
    emoji: '🌋',
    color: '#6D597A',
    spotifyTrackId: '44NoxHRefNWip1dlZTjNB9',
    summary: '後方で直感的にライブの空気と共鳴し、内なる衝動と静かに向き合います。外見は静かでも、内面は激しく燃えている存在。',
    sections: [
      { title: '激しくも純粋な共鳴', body: '外見からは想像できないほど内面は激しく動いています。身体ではなく内面で「暴れる」のです。ベースラインが身体を震わせ、ドラムが心臓の鼓動と重なるとき、完全な一体感を体験します。' },
      { title: '後方という選択', body: '音楽と内面的に共鳴するためには物理的な距離が必要。後方で目を閉じて音に身を委ねるとき、音楽は外からの刺激ではなく、自分の内側から湧き上がるものになります。' },
      { title: '言葉にならない、だからいい', body: '感じすぎているからこそ語ることが苦手。あの瞬間の高揚を「良かった」で片付けることへの抵抗が、共鳴者を沈黙させます。' },
    ],
    compatibility: { bestMatch: 'FGQI', inspire: 'BGSI', complement: 'FESA' },
  },

  // ===== 🌊🎹 内観型（BE__）=====
  BESA: {
    code: 'BESA',
    group: 'BE',
    name: '伝道者',
    song: 'シンカロン',
    songLabel: 'シンカロン型',
    quote: '僕の指先から送り出す理想　急転直下　不安定な信号をきっと拾ってよ',
    emoji: '📖',
    color: '#1D3557',
    spotifyTrackId: '15eeDH2c5RDLvSKY9qjldS',
    summary: '後方で深く味わった感動を、論理的に整理して多くの人に届けます。温かい論理で「なぜこの曲が心に響くのか」を丁寧に紐解く人。',
    sections: [
      { title: '感動の進化を伝える', body: '感動は一度きりの出来事ではなく、ライブを重ねるごとに進化していくもの。「感動の進化」を丁寧に言語化し、時系列で整理して伝えるのが使命です。' },
      { title: '温かい論理', body: '「なぜこの曲が心に響くのか」を丁寧に紐解き、読む人が自分自身の体験と照らし合わせて共感できるような書き方をします。考察的でありながらも温かみがあるのが特徴。' },
      { title: '「伝える」ことの責任', body: '何度も推敲を重ねてから発信します。頻度は高くありませんが、一つひとつの投稿には深い愛情と考察が詰まっており、「保存して何度も読み返したくなる」質の高いコンテンツを生み出します。' },
    ],
    compatibility: { bestMatch: 'BESI', inspire: 'FESA', complement: 'FGQI' },
  },
  BESI: {
    code: 'BESI',
    group: 'BE',
    name: '表現者',
    song: '極彩色',
    songLabel: '極彩色型',
    quote: 'この命を彩る色　染める色は　極めて鮮やか',
    emoji: '🎨',
    color: '#F72585',
    spotifyTrackId: '1ppgOVjBFREq0apmtBBIqM',
    summary: '後方で直感的に感じたものを、自分なりの鮮やかな表現で周囲に伝えます。イラスト、詩、ファンアートなど言葉を超えた表現力の持ち主。',
    sections: [
      { title: '鮮やかな感性の持ち主', body: '16タイプの中で最も独創的な方法でReolの音楽を表現します。イラストを描いたり、詩に綴ったり——言葉だけに頼らない多彩な表現力を持っています。' },
      { title: '後方からのインプット', body: '後方にいることで、照明が作り出す会場全体の色彩、観客のシルエットの美しさ、ステージと客席が一体になる瞬間の全景——創作の素材を心に焼き付けます。' },
      { title: '共有することの喜び', body: '「あのライブ、こんな感じだった」とイラストを一枚投稿するだけで、言葉では伝えきれないライブの空気感を一瞬で伝えてしまう力があります。' },
    ],
    compatibility: { bestMatch: 'BESA', inspire: 'FESI', complement: 'FGSA' },
  },
  BEQA: {
    code: 'BEQA',
    group: 'BE',
    name: '求道者',
    song: 'un, deux, trois',
    songLabel: 'un, deux, trois型',
    quote: 'あなたの哲学に抱かれたい　今公転する公転する、僕',
    emoji: '🧭',
    color: '#023E8A',
    spotifyTrackId: '2NXqn7SaFWJmIpjwu9Ae6c',
    summary: '後方から一人で音楽の深淵を分析し、理想の音楽体験を探り続けます。感情を論理で解き明かそうとするストイックな探究者。',
    sections: [
      { title: '一つずつ、丁寧に', body: '歌詞の一節、メロディの一小節、アレンジの一つの選択——すべてに意味があると信じ、妥協することなく分析を続けます。感情を論理で解き明かそうとする、一見矛盾した試みが本質。' },
      { title: '終わりなき探究', body: '一つの答えに辿り着いたと思ったら、その先にまた新しい問いが待っています。「なぜReolの音楽はこれほど心を動かすのか」という根源的な問いに、歩みを止めません。' },
      { title: '静かなる情熱', body: 'ライブ後、一人でカフェに入り、ノートを開いて今日の気づきを書き留める——求道者の本当のライブ体験は、会場を出た後から始まるのかもしれません。' },
    ],
    compatibility: { bestMatch: 'FEQA', inspire: 'BEQI', complement: 'FGSI' },
  },
  BEQI: {
    code: 'BEQI',
    group: 'BE',
    name: '内省者',
    song: 'エンド',
    songLabel: 'エンド型',
    quote: '僕を好きだと言う君が大嫌い',
    emoji: '🪞',
    color: '#4A4E69',
    spotifyTrackId: '4bCY4od5T0HCBVISAmkoFO',
    summary: '後方で直感的に音楽を受け止め、自分の内面を静かに見つめるタイプ。16タイプの中で最も静かで、最も内面的な存在。',
    sections: [
      { title: '最も静かなタイプ', body: '後方の最も人の少ないエリアに立ち、音楽と自分だけの世界に沈む。曲を聴きながら、自分の過去の記憶や感情が浮かんでは消えていく——ライブは「瞑想」に近い体験。' },
      { title: '音楽という鏡', body: '歌詞の中に自分と重なる感情を見出し、メロディの中に自分の心の揺れを感じます。「この曲は私のための曲だ」という確信がある。' },
      { title: '共有しないという選択', body: 'ライブで感じたことは極めて個人的な体験。ライブ後に一人で帰路につく時間、暗い部屋で余韻に浸る時間こそが、ライブ体験の本質です。' },
    ],
    compatibility: { bestMatch: 'FEQI', inspire: 'BEQA', complement: 'BGSI' },
  },
};

// === 英語翻訳データ ===
type TranslatedTypeData = {
  name: string;
  summary: string;
  sections: { title: string; body: string }[];
};

const enTypeTranslations: Record<TypeCode, TranslatedTypeData> = {
  FGSA: {
    name: 'The Agitator',
    summary: 'You go wild in the front row while articulating your experience to spread Reol\'s charm. A charismatic figure who balances analysis and evangelism.',
    sections: [
      { title: 'Strategic Frenzy', body: 'You don\'t just go wild — you have the ability to put live experiences into words. "When the lights turned red during that song, the venue\'s energy was incredible" — your vivid, convincing words convey the excitement.' },
      { title: 'Lives as Evangelism', body: 'Every live show is both a personal experience and material for spreading the word. After shows, you write long reports on social media, analyze differences between recordings and live performances, and advise newcomers on what to watch for.' },
      { title: 'The Joy of Finding Allies', body: 'Finding someone who shares your passion is pure bliss. The satisfaction of hearing "I went because of your report" rivals the thrill of the front row itself.' },
    ],
  },
  FGSI: {
    name: 'The Inspirer',
    summary: 'You go wild on pure instinct in the front row, sweeping everyone around you into your energy. "Just come to one show" is your ultimate evangelism.',
    sections: [
      { title: 'Chain Reaction of Impulse', body: 'Your principle is simple: "I do it because I want to." When the show starts, your body moves before you think, and that overwhelming energy spreads to everyone around you. You move people just by being there.' },
      { title: 'Evangelist of Instinct', body: 'Your evangelism isn\'t about logic — it\'s about shared experience. Going to a show and going wild next to someone is the ultimate way to spread the word. You communicate through "atmosphere," not arguments.' },
      { title: 'The Purity of "I Want To"', body: 'By following "I want to, so I do" without calculation, you put others at ease. Before you know it, people are always gathering around you.' },
    ],
  },
  FGQA: {
    name: 'The Veteran',
    summary: 'You immerse yourself in intense music from the front row while coolly analyzing song structure and sound design. A solitary listener with dual layers of immersion and analysis.',
    sections: [
      { title: 'Immersion and Analysis Combined', body: 'You can headbang in the front row while simultaneously noticing "that synth tone is different from the last show." Your body is fully immersed, yet part of your brain stays coolly analytical.' },
      { title: 'The Solitary Listener', body: 'You have no interest in evangelism and rarely post impressions on social media. But bring up music theory, and you\'ll share surprisingly deep knowledge without hesitation.' },
      { title: 'The Resolve to Risk It All', body: 'Information only available from the front row — the artist\'s breathing, sound leaking from monitors — this determination to miss nothing keeps you standing in the front.' },
    ],
  },
  FGQI: {
    name: 'The Fighter',
    summary: 'You stand in the front row without reason, becoming one with intense music through pure instinct. For you, live shows are meant to be "felt with your body."',
    sections: [
      { title: 'Body Moves First', body: 'The moment the intro plays, your body reacts before you think. Asked why you love that song, you can only say "I don\'t know, but it\'s incredible" — and that\'s perfectly fine.' },
      { title: 'A World Beyond Words', body: 'Even after the show, words beyond "it was good" don\'t come easily. But you instinctively know that something is lost the moment you try to put it into words.' },
      { title: 'Solitude and Fulfillment in the Front Row', body: 'You tend to prefer going solo, free to become one with the music without worrying about others. The satisfaction of leaving the venue drenched in sweat is something only a Fighter understands.' },
    ],
  },
  FESA: {
    name: 'The Chronicler',
    summary: 'You deeply analyze the emotions you feel in the front row and carefully put them into words. A storyteller who records each live experience as "history."',
    sections: [
      { title: 'Turning Emotion into History', body: 'You see each live experience as "history worth recording." You connect it to past shows and release timelines, contextualizing everything within a larger narrative.' },
      { title: 'Analysis for Evangelism', body: 'Beyond lengthy live reports, you create comparison charts of past setlists, compile changes in stage production, and share information in a systematic, resource-rich manner.' },
      { title: 'A Bridge Between Past and Future', body: 'Your reports and reflections carry a unique depth and warmth, giving readers the feeling that "I\'m part of Reol\'s history too."' },
    ],
  },
  FESI: {
    name: 'The Storyteller',
    summary: 'You passionately share the emotions you intuitively feel in the front row. A natural empath who treasures the freshness of feeling.',
    sections: [
      { title: 'Translator of Emotions', body: '"I literally cried at that moment." "I got goosebumps when the lights changed." Your honest emotional expressions resonate deeply. Your words are straightforward and unadorned, which is exactly why they reach hearts directly.' },
      { title: 'Chain of Empathy', body: 'When you post your impressions, "I feel that!" replies cascade in, and before you know it, the timeline is overflowing with shared excitement from the same show.' },
      { title: 'The Art of Resonating', body: 'You\'re not intentionally evangelizing. You\'re simply sharing what you feel. But because your emotions are so pure, it becomes the most effective evangelism of all.' },
    ],
  },
  FEQA: {
    name: 'The Researcher',
    summary: 'You immerse yourself in emotional songs from the front row while endlessly exploring the deep meanings of lyrics and MVs. A solitary researcher diving into music\'s depths with unique interpretations.',
    sections: [
      { title: 'A Uniquely Evolved Being', body: 'Unable to settle for existing interpretations, you reread lyrics countless times and replay single MV cuts dozens of times to find your own answer.' },
      { title: 'The Path of Solitary Research', body: 'You don\'t actively share your analysis. It\'s still in progress. You dislike publishing half-formed interpretations and keep thinking until everything clicks.' },
      { title: 'Ever-Mutating Sensitivity', body: 'Hearing the same song six months later, you might discover an entirely different meaning. Your ability to enjoy the constant "mutation" in your relationship with music is your greatest strength.' },
    ],
  },
  FEQI: {
    name: 'The Poet',
    summary: 'You delicately receive music from the front row, quietly holding onto the lingering echoes in your heart. A person of quiet sensitivity who treasures one-on-one dialogue with music.',
    sections: [
      { title: 'One-on-One Dialogue', body: 'A live show is time spent facing Reol one-on-one amid the crowd. You create your own quiet space within the venue\'s noise. You don\'t want to miss a single breath or piano reverb.' },
      { title: 'The Aesthetics of Not Speaking', body: 'You rarely share your concert impressions. You intuitively feel that something is lost the moment you put it into words. The time spent savoring the afterglow on the train home is what matters most.' },
      { title: 'Sensitivity as Strength', body: 'You notice subtle changes others miss — nuances in MCs, the emotional flow created by setlist order — and quietly engrave them in your heart.' },
    ],
  },
  BGSA: {
    name: 'The Strategist',
    summary: 'You observe everything from the back with cool composure, then strategically share your insights. A tactician who systematically compiles venue reports and acoustic analyses.',
    sections: [
      { title: 'The Graceful Tactician', body: 'You calmly observe the front row\'s frenzy, capturing the venue\'s atmosphere, lighting-sound coordination, and audience reactions from a macro perspective. Standing in the back is strategic positioning to grasp the full picture.' },
      { title: 'Strategic Knowledge Sharing', body: 'Acoustic differences between venues, sightlines from different seats, efficient merch strategies — you excel at systematically organizing practical information.' },
      { title: 'Passion Within Composure', body: 'You may appear calm, but deep inside burns a profound passion for Reol. You show your love not through emotional words, but through precise analysis and useful information.' },
    ],
  },
  BGSI: {
    name: 'The Sage',
    summary: 'You intuitively read the room from the back and offer unique questions that spark insights in others. A mysterious presence with enigmatic perception.',
    sections: [
      { title: 'The One Who Asks', body: 'Rather than providing analytical answers, you throw out intuitive "questions." "Why did they play that song at that timing?" — your questions stimulate others\' thinking.' },
      { title: 'Master of Reading the Room', body: 'You intuitively sense the entire venue\'s atmosphere from the back. You make observations that are surprisingly on point, even without logical evidence.' },
      { title: 'An Enigmatic Presence', body: 'A single quiet remark from you leaves a lasting impression. Your style of sharing questions rather than pushing answers provides pleasant intellectual stimulation.' },
    ],
  },
  BGQA: {
    name: 'The Observer',
    summary: 'You calmly observe shows from the back, building detailed logical records and analysis. The most objective live show "observer" among all 16 types.',
    sections: [
      { title: 'Agent of Logic', body: 'You record and analyze shows with pure data, stripped of emotion. Setlist order, seconds between songs, lighting color patterns — everything is logged in your mental database.' },
      { title: 'Pure Analysis Without Emotion', body: 'You prefer accumulating objective facts like "MC length has increased by an average of 20 seconds compared to the last tour" rather than saying "it was good." Excluding emotion is your highest form of respect for the music.' },
      { title: 'The Solitary Recorder', body: 'You don\'t actively share your analysis. Your notebooks contain the most detailed live records of any fan, but they\'re kept for yourself.' },
    ],
  },
  BGQI: {
    name: 'The Resonator',
    summary: 'You intuitively resonate with the show\'s atmosphere from the back, quietly facing your inner impulses. Calm on the outside, fiercely burning within.',
    sections: [
      { title: 'Fierce Yet Pure Resonance', body: 'Your inner world moves far more intensely than your exterior suggests. You "rage" internally, not physically. When the bassline shakes your body and the drums sync with your heartbeat, you experience complete unity.' },
      { title: 'Choosing the Back', body: 'You need physical distance to resonate internally with the music. When you close your eyes and surrender to the sound from the back, music transforms from an external stimulus into something welling up from within.' },
      { title: 'Beyond Words, and That\'s Fine', body: 'You struggle to speak about it precisely because you feel too much. The resistance to reducing that moment to just "it was good" is what keeps the Resonator silent.' },
    ],
  },
  BESA: {
    name: 'The Evangelist',
    summary: 'You logically organize deep emotions felt from the back and deliver them to many. Someone who gently explains "why this song touches the heart" through warm logic.',
    sections: [
      { title: 'Conveying the Evolution of Emotion', body: 'Emotion isn\'t a one-time event — it evolves with each show. Your mission is to carefully verbalize and chronologically organize this "evolution of emotion."' },
      { title: 'Warm Logic', body: 'You carefully unravel "why this song resonates" in a way that lets readers connect with their own experiences. Your writing is analytical yet warm.' },
      { title: 'The Responsibility of Communication', body: 'You revise multiple times before publishing. Your frequency isn\'t high, but each post is packed with deep love and analysis, creating content that people "save and reread again and again."' },
    ],
  },
  BESI: {
    name: 'The Artist',
    summary: 'You express what you intuitively feel from the back in your own vivid way. A creative force whose illustrations, poetry, and fan art transcend words.',
    sections: [
      { title: 'A Vivid Sensibility', body: 'Among all 16 types, you express Reol\'s music in the most creative ways. Drawing illustrations, writing poetry — you have diverse expressive abilities that go beyond words alone.' },
      { title: 'Input from the Back', body: 'Being in the back lets you absorb it all: the colors created by lighting across the entire venue, the beautiful silhouettes of the audience, the panoramic moment when stage and audience become one — all burned into your heart as creative material.' },
      { title: 'The Joy of Sharing', body: 'By simply posting one illustration saying "this is what that show felt like," you can instantly convey the atmosphere of a live show in ways words never could.' },
    ],
  },
  BEQA: {
    name: 'The Devotee',
    summary: 'You analyze music\'s depths alone from the back, endlessly seeking the ideal musical experience. A stoic seeker who tries to decipher emotion through logic.',
    sections: [
      { title: 'One Step at a Time, Carefully', body: 'A single lyric phrase, a single melodic measure, a single arrangement choice — you believe everything has meaning and continue analyzing without compromise. The seemingly contradictory attempt to decipher emotion through logic is your essence.' },
      { title: 'Endless Pursuit', body: 'Just when you think you\'ve reached an answer, a new question awaits beyond it. You never stop walking toward the fundamental question: "Why does Reol\'s music move hearts so deeply?"' },
      { title: 'Quiet Passion', body: 'After the show, you slip into a café alone, open your notebook, and jot down today\'s discoveries — perhaps the Devotee\'s true live experience begins after leaving the venue.' },
    ],
  },
  BEQI: {
    name: 'The Introspector',
    summary: 'You intuitively receive music from the back, quietly contemplating your inner world. The quietest and most internally-focused of all 16 types.',
    sections: [
      { title: 'The Quietest Type', body: 'Standing in the emptiest area in the back, you sink into a world of just you and the music. As songs play, memories and emotions from your past surface and dissolve — live shows are closer to "meditation."' },
      { title: 'Music as a Mirror', body: 'You find emotions that overlap with your own in the lyrics, and feel your heart\'s tremors in the melody. You have a conviction that "this song was written for me."' },
      { title: 'Choosing Not to Share', body: 'What you feel at shows is profoundly personal. The time spent walking home alone afterward, sitting in the dark room savoring the afterglow — that is the essence of your live experience.' },
    ],
  },
};

const enTypeGroupTranslations: Record<GroupCode, { name: string; description: string }> = {
  FG: { name: 'Charger', description: 'A group that loves the front row and surrenders to intense music' },
  FE: { name: 'Emoter', description: 'A group moved by emotional songs from the front row' },
  BG: { name: 'Overseer', description: 'A group that savors intense music from the back' },
  BE: { name: 'Reflector', description: 'A group that immerses in emotional songs from the back' },
};

const enAxisLabelTranslations = {
  FB: { left: 'Front Row', right: 'Back Row', name: 'Live Style' },
  GE: { left: 'Intense', right: 'Emotional', name: 'Music Taste' },
  SQ: { left: 'Evangelize', right: 'Immerse', name: 'Fan Activity' },
  AI: { left: 'Analyze', right: 'Intuition', name: 'How You Obsess' },
} as const;

// === 言語に応じたデータ取得ヘルパー ===
export function getLocalizedType(typeCode: TypeCode, lang: string): ReolType {
  const base = reolTypes[typeCode];
  if (lang === 'en') {
    const en = enTypeTranslations[typeCode];
    return {
      ...base,
      name: en.name,
      summary: en.summary,
      sections: en.sections,
    };
  }
  return base;
}

export function getLocalizedTypeGroup(groupCode: GroupCode, lang: string): TypeGroup {
  const base = typeGroups[groupCode];
  if (lang === 'en') {
    const en = enTypeGroupTranslations[groupCode];
    return { ...base, name: en.name, description: en.description };
  }
  return base;
}

export function getLocalizedAxisLabels(lang: string) {
  if (lang === 'en') {
    return {
      FB: { left: { key: 'F', label: enAxisLabelTranslations.FB.left, emoji: '🔥' }, right: { key: 'B', label: enAxisLabelTranslations.FB.right, emoji: '🌊' }, name: enAxisLabelTranslations.FB.name },
      GE: { left: { key: 'G', label: enAxisLabelTranslations.GE.left, emoji: '🎸' }, right: { key: 'E', label: enAxisLabelTranslations.GE.right, emoji: '🎹' }, name: enAxisLabelTranslations.GE.name },
      SQ: { left: { key: 'S', label: enAxisLabelTranslations.SQ.left, emoji: '📢' }, right: { key: 'Q', label: enAxisLabelTranslations.SQ.right, emoji: '🎧' }, name: enAxisLabelTranslations.SQ.name },
      AI: { left: { key: 'A', label: enAxisLabelTranslations.AI.left, emoji: '🔍' }, right: { key: 'I', label: enAxisLabelTranslations.AI.right, emoji: '💫' }, name: enAxisLabelTranslations.AI.name },
    } as unknown as typeof axisLabels;
  }
  return axisLabels;
}
