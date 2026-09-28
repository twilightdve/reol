// ライヴ参戦ガイド(/live/guide/)専用の辞書(plan/28 第3弾)。中国語・韓国語は機械翻訳。
// 本文は「セクション → ブロック(小見出し/段落/箇条書き/注記)」のデータとして持ち、
// ページ側はこれを描画するだけにする。FAQPage の質問文はセクション見出しをそのまま使う。
import type { SiteLang } from "../langs";

export type GuideItem = { text: string; label?: boolean; sub?: string[] };
export type GuideBlock =
  | { kind: "h3"; text: string }
  | { kind: "p"; text: string; spacing?: "mb-1" | "mb-2" | "mb-3" | "mt-3 mb-1" }
  | { kind: "ul"; items: GuideItem[] }
  | { kind: "note"; text: string };
export type GuideSection = { heading: string; blocks: GuideBlock[]; faqAnswer: string };

type LiveGuideDict = {
  title: string;
  metaDescription: string;
  intro: string;
  sections: GuideSection[];
  moreHeading: string;
  moreText: string;
  moreLink: string;
};

const ja: LiveGuideDict = {
  title: "ライヴ参戦ガイド",
  metaDescription:
    "Reolのライヴに初めて参加する方向けの持ち物・服装・マナーガイドと、遠征の移動手段・予算・スケジュールの立て方をまとめました。",
  intro:
    "「Reolのライヴがはじめて」という方も多いのではないでしょうか。ここでは、Reolのライヴに行く前に知っておきたい情報をまとめました。もちろん、ライヴの楽しみ方は十人十色なので、この記事はあくまで参考程度に読んでもらえると嬉しいです。",
  sections: [
    {
      heading: "ライヴには何を持っていけばいいですか？",
      blocks: [
        { kind: "h3", text: "必須" },
        {
          kind: "ul",
          items: [
            { text: "🎫 チケット", sub: ["電子チケットのためスマホの充電を温存しておこう"] },
            {
              text: "💰 現金",
              sub: [
                "ドリンクチケット用。入場時に600円程度必要な場合が多い",
                "キャッシュレスに対応していない会場もあるため事前に確認しておこう",
              ],
            },
            {
              text: "💧 飲み物",
              sub: [
                "入場時に引き換えるドリンクチケットとドリンクを交換できる",
                "叫んだり汗をかくと喉が渇くので必須",
                "とにかく前に行きたい人は事前に飲み物を買っておいて、ライヴ終わりに引き換えるのがおすすめ",
              ],
            },
          ],
        },
        { kind: "h3", text: "あると便利" },
        {
          kind: "ul",
          items: [
            { text: "🔒 小さめバッグ", sub: ["邪魔にならないサイズのもの"] },
            { text: "🎤 タオル", sub: ["汗拭き用。Reolのライヴはエクササイズくらい熱くなる"] },
            {
              text: "👂 耳栓",
              sub: [
                "ライヴ用イヤープロテクターがおすすめ",
                "音響外傷で難聴になることがあるので、心配な人には推奨",
              ],
            },
            { text: "👟 履き慣れたスニーカー", sub: ["スタンディングの場合は特に重要"] },
          ],
        },
        { kind: "h3", text: "不要" },
        {
          kind: "ul",
          items: [
            {
              text: "🧳 大きなバッグ",
              sub: ["ロッカーに入らない、周囲の人の迷惑になるのでホテルに置いてこよう"],
            },
            {
              text: "🔋 モバイルバッテリー",
              sub: ["静かに見る人ならあっても良いが、飛ぶには重すぎるのでロッカーに入れておこう"],
            },
          ],
        },
      ],
      faqAnswer:
        "必須はチケット・現金(ドリンクチケット用に600円程度)・飲み物です。あると便利なものとして小さめバッグ・タオル・耳栓・履き慣れたスニーカーがあります。大きなバッグやモバイルバッテリーはロッカーに預けるか持って行かないことをおすすめします。",
    },
    {
      heading: "ライヴにはどんな服装で行けばいいですか？",
      blocks: [
        {
          kind: "p",
          spacing: "mb-2",
          text: "スタンディングの場合は動きやすい服装が基本。ホール公演ではもう少しラフでも大丈夫ですが、いずれにしても以下がポイントです。",
        },
        {
          kind: "ul",
          items: [
            {
              text: "厚底・ヒールの高い靴は避ける",
              sub: ["周囲の方への配慮+自分の安全のため", "身長が低い方は、厚底もありだが怪我などには注意"],
            },
            { text: "大きなアクセサリー・帽子は外す(後ろの方が見えなくなります)" },
            { text: "会場内は暑くなることが多い(脱ぎ着しやすい重ね着が◎)" },
            { text: "荷物はコインロッカーに預けて身軽に(大きな荷物はスタッフから注意されることも)" },
          ],
        },
      ],
      faqAnswer:
        "スタンディングの場合は動きやすい服装が基本です。厚底・ヒールの高い靴は避け、大きなアクセサリーや帽子は外し、会場内は暑くなりやすいので脱ぎ着しやすい重ね着がおすすめです。荷物はコインロッカーに預けて身軽にしましょう。",
    },
    {
      heading: "スタンディングではどこに立てばいいですか？",
      blocks: [
        {
          kind: "p",
          spacing: "mb-3",
          text: "スタンディングの場合、チケットの整理番号順に入場した後は立ち位置を自分の好みで決められるため、どこで見るかで体験が大きく変わります。会場によっては大きな柱などがあり見えにくい場所や音が届きにくい場所があることもあるので、事前に会場レイアウトを確認しておくと安心です。",
        },
        {
          kind: "ul",
          items: [
            {
              text: "前方中央エリア",
              label: true,
              sub: [
                "アーティストとの距離が近く臨場感が抜群。表情や細かい演出も見たい方におすすめ",
                "人が密集しやすく、押されたり揉まれたりすることがある。体力に自信がある人向け",
              ],
            },
            {
              text: "中間〜後方エリア",
              label: true,
              sub: ["比較的ゆったり楽しめる。ステージ全体の演出や照明を見渡せる", "初めてのライヴにはおすすめ"],
            },
            {
              text: "左右のエリア",
              label: true,
              sub: [
                "比較的空いていて整理番号が遅くても前方に行きやすい",
                "角度によってはステージが見えにくいことも。スピーカー近くは音量に注意",
              ],
            },
            {
              text: "(ある場合)2F席",
              label: true,
              sub: [
                "視界が広く、ステージ全体を見渡せる。音響のバランスが良いことが多い",
                "スタンディングエリアより距離があるため、表情や細かい演出は見えにくいことも",
              ],
            },
          ],
        },
      ],
      faqAnswer:
        "前方中央エリアは臨場感が高い一方で人が密集しやすく、中間〜後方エリアは比較的ゆったり楽しめて初めてのライヴにもおすすめです。左右のエリアは比較的空いていますが角度によってはステージが見えにくいことがあります。2F席がある会場では視界が広く音響のバランスも良い傾向があります。",
    },
    {
      heading: "会場にはいつ到着すればいいですか？",
      blocks: [
        {
          kind: "p",
          spacing: "mb-2",
          text: "チケットには「開場」と「開演」の2つの時間が書かれています。「開場」は会場に入れる時間、「開演」はライヴが始まる時間です。",
        },
        {
          kind: "ul",
          items: [
            { text: "整理番号順の入場(スタンディング)の場合: 開場30分前には会場周辺にいると安心" },
            { text: "指定席の場合: 開場時間に合わせればOK" },
            { text: "グッズ購入をしたい場合: 事前に会場ごとのグッズ販売開始時間をチェックし、開始時間前に並ぶのがおすすめ" },
          ],
        },
      ],
      faqAnswer:
        "整理番号順の入場(スタンディング)の場合は開場30分前には会場周辺にいると安心です。指定席の場合は開場時間に合わせればOKです。グッズ購入をしたい場合は会場ごとの販売開始時間を事前にチェックしましょう。",
    },
    {
      heading: "ライヴ中に気をつけることはありますか？",
      blocks: [
        {
          kind: "ul",
          items: [
            { text: "📱 撮影・録音は禁止(公式アナウンスがある場合を除く)" },
            { text: "🗣 MC中や静かなパートでは周囲に配慮" },
            {
              text: "🎶 アーティストから煽られた場合以外、日本では一緒に歌うのは周囲の迷惑になりがち",
              sub: ["国によっては一緒に歌う文化もあるので、郷に従おう"],
            },
            { text: "🙋 モッシュ・ダイブは原則禁止" },
            { text: "🎒 大きな荷物は必ずロッカーへ" },
            { text: "🤝 周囲のファンと協力して楽しい空間を作ろう" },
          ],
        },
      ],
      faqAnswer:
        "撮影・録音は公式アナウンスがある場合を除き禁止です。MC中や静かなパートでは周囲に配慮し、モッシュ・ダイブは原則禁止です。大きな荷物は必ずロッカーに預け、周囲のファンと協力して楽しい空間を作りましょう。",
    },
    {
      heading: "ライヴはどうやって楽しめばいいですか？",
      blocks: [
        {
          kind: "p",
          spacing: "mb-2",
          text: "楽しみ方は人それぞれ。自分のペースで、好きなように楽しむのが一番です。以下は一例ですが、参考にしてみてください。",
        },
        {
          kind: "ul",
          items: [
            { text: "💡 迷惑にならない限りは、自分の好きなスタイルで楽しむのが一番!(無理して合わせる必要はありません)" },
            { text: "🎤 アーティストとの一体感を楽しむ" },
            { text: "🎶 演出や照明、音響を堪能する" },
            { text: "🕺 周りのファンと一緒に盛り上がる" },
            { text: "📸 (撮影可能の場合)グッズや会場の雰囲気を写真に収める" },
          ],
        },
      ],
      faqAnswer:
        "楽しみ方は人それぞれです。迷惑にならない範囲で自分の好きなスタイルで楽しむのが一番で、アーティストとの一体感、演出や照明・音響、周りのファンとの一体感などを楽しむのがおすすめです。",
    },
    {
      heading: "ライヴが終わった後はどう過ごせばいいですか？",
      blocks: [
        {
          kind: "p",
          text: "余韻に浸りながら、近くのお店で感想を語り合うのも楽しみのひとつ。お店によってはライヴ帰りのファンで混雑することもあるので、事前に予約しておくと安心です。",
        },
        {
          kind: "note",
          text: "❗️ ライヴ後に耳鳴りや耳の違和感が続く場合は、早めに耳鼻科を受診しましょう。音響外傷は早期治療が大切です。心配な方は、上記の「あると便利」で紹介したライヴ用イヤープロテクターの使用をおすすめします。(最悪の場合は聴力を失うこともありますのでなるべく早く受診してください)",
        },
      ],
      faqAnswer:
        "余韻に浸りながら近くのお店で感想を語り合うのも楽しみのひとつです。混雑することもあるので事前予約がおすすめです。耳鳴りや耳の違和感が続く場合は早めに耳鼻科を受診してください。",
    },
    {
      heading: "遠征のコツはありますか？",
      blocks: [
        {
          kind: "p",
          spacing: "mb-2",
          text: "複数公演への参戦や遠方の公演に参戦する場合の、移動手段・予算・スケジュールの考え方です。",
        },
        { kind: "h3", text: "移動手段の選び方" },
        { kind: "p", spacing: "mb-1", text: "遠征の移動手段は距離と予算で使い分けましょう。" },
        {
          kind: "ul",
          items: [
            {
              text: "✈️ 飛行機",
              sub: [
                "沖縄・北海道・九州など遠方エリアの移動でおすすめ",
                "早割で予約すれば片道1万円以下も。LCCは成田・関空発着が中心",
                "空港から会場までの移動時間も計算に入れること",
              ],
            },
            {
              text: "🚄 新幹線",
              sub: [
                "東京・大阪を起点に主要都市へアクセスしやすい",
                "EX予約やスマートEXで割引あり",
                "時間の確実性が高く、終演後でも移動しやすい",
              ],
            },
            {
              text: "🚌 高速バス",
              sub: [
                "夜行バスなら宿泊費も節約できる(ただしライヴ後の夜行は体力的にハード)",
                "3列独立シートを選ぶと快適度が段違い",
              ],
            },
            {
              text: "🚗 車",
              sub: [
                "グループ遠征なら割り勘で最安になることも",
                "駐車場は会場によって事前予約が必要な場合があるので確認を",
                "長距離の場合は高速代+ガソリン代を計算してから判断を",
              ],
            },
          ],
        },
        { kind: "h3", text: "予算の目安" },
        { kind: "p", spacing: "mb-1", text: "複数公演に参戦する場合の1公演あたりの目安です(チケット代は別)。" },
        {
          kind: "ul",
          items: [
            { text: "日帰り遠征(新幹線圏内): 交通費5,000〜15,000円+食事代2,000〜3,000円 = 合計7,000〜18,000円" },
            {
              text: "1泊遠征(新幹線 or 飛行機): 交通費10,000〜30,000円+宿泊費5,000〜10,000円+食事代3,000〜5,000円 = 合計18,000〜45,000円",
            },
            {
              text: "2泊以上の遠征(連日公演セット): 交通費15,000〜40,000円+宿泊費10,000〜20,000円+食事代5,000〜10,000円 = 合計30,000〜70,000円",
            },
          ],
        },
        { kind: "h3", text: "節約のコツ" },
        {
          kind: "ul",
          items: [
            { text: "早割航空券は発売直後に押さえる" },
            { text: "ホテルの早期予約でビジネスホテルを確保(ツアー発表後はファンで埋まりがち)" },
            { text: "夜行バスは宿泊費と交通費を同時に節約できる裏ワザ" },
            { text: "連日公演のセットで1回の遠征費で2公演楽しめる" },
          ],
        },
        { kind: "h3", text: "スケジュールの立て方" },
        { kind: "p", spacing: "mb-1", text: "日帰りの場合" },
        {
          kind: "ul",
          items: [
            { text: "開演3時間前に現地着を目安にする(会場周辺の下見、コインロッカーの確保、食事を済ませる余裕ができる)" },
            { text: "終演後の最終交通手段は必ず事前確認(地方会場は最終電車が早いので要注意)" },
          ],
        },
        { kind: "p", spacing: "mt-3 mb-1", text: "宿泊ありの場合" },
        {
          kind: "ul",
          items: [
            { text: "会場近くのホテルを取るとコインロッカーが不要になる(チェックイン後に荷物を置いて身軽に会場へ)" },
            { text: "終演後もすぐホテルに戻れるので、地方の終電を気にしなくていい" },
            { text: "翌日に観光を入れるなら、チェックアウト後にコインロッカーを使う" },
            { text: "帰りの交通は昼過ぎの便にしておくとゆとりが持てる" },
          ],
        },
      ],
      faqAnswer:
        "移動手段は距離と予算で使い分けます(飛行機・新幹線・高速バス・車)。日帰り遠征は7,000〜18,000円、1泊遠征は18,000〜45,000円が目安です。早割航空券やホテルの早期予約、夜行バスの活用、連日公演のセット参戦が節約のコツです。",
    },
  ],
  moreHeading: "もっと見る",
  moreText:
    "各公演の会場情報(住所・地図)は公演ごとの詳細ページに掲載しています。過去のセットリストや関連ポストもあわせてチェックしてみてください。",
  moreLink: "LIVE一覧を見る →",
};

const en: LiveGuideDict = {
  title: "Live Show Guide",
  metaDescription:
    "What to bring, what to wear and concert etiquette for your first Reol live show, plus tips on travel, budgets and scheduling for trips to shows.",
  intro:
    "Going to a Reol live show for the first time? This page collects what's good to know before you go. Of course, everyone enjoys live shows in their own way, so please treat this as a reference. The tips are written with shows in Japan in mind.",
  sections: [
    {
      heading: "What should I bring to a live show?",
      blocks: [
        { kind: "h3", text: "Essentials" },
        {
          kind: "ul",
          items: [
            { text: "🎫 Ticket", sub: ["Tickets are usually electronic, so save your phone battery"] },
            {
              text: "💰 Cash",
              sub: [
                "For the drink ticket. Many venues charge about ¥600 at the entrance",
                "Some venues don't accept cashless payment, so check in advance",
              ],
            },
            {
              text: "💧 Something to drink",
              sub: [
                "You can exchange the drink ticket you buy at the entrance for a drink",
                "Shouting and sweating make you thirsty, so it's a must",
                "If you want to get to the front, buy a drink beforehand and exchange your ticket after the show",
              ],
            },
          ],
        },
        { kind: "h3", text: "Nice to have" },
        {
          kind: "ul",
          items: [
            { text: "🔒 A small bag", sub: ["Something that won't get in the way"] },
            { text: "🎤 A towel", sub: ["For sweat. A Reol show gets as hot as a workout"] },
            {
              text: "👂 Earplugs",
              sub: [
                "Earplugs made for concerts are recommended",
                "Loud sound can cause acoustic trauma and hearing loss, so they're recommended if you're worried",
              ],
            },
            { text: "👟 Comfortable sneakers", sub: ["Especially important for standing shows"] },
          ],
        },
        { kind: "h3", text: "Leave behind" },
        {
          kind: "ul",
          items: [
            {
              text: "🧳 A large bag",
              sub: ["It won't fit in a locker and gets in other people's way, so leave it at your hotel"],
            },
            {
              text: "🔋 A power bank",
              sub: ["Fine if you plan to watch quietly, but too heavy for jumping, so put it in a locker"],
            },
          ],
        },
      ],
      faqAnswer:
        "The essentials are your ticket, cash (about ¥600 for the drink ticket) and something to drink. A small bag, a towel, earplugs and comfortable sneakers are nice to have. Large bags and power banks are best left in a locker or at home.",
    },
    {
      heading: "What should I wear to a live show?",
      blocks: [
        {
          kind: "p",
          spacing: "mb-2",
          text: "For standing shows, wear something easy to move in. Hall shows can be a bit more casual, but either way, keep these points in mind.",
        },
        {
          kind: "ul",
          items: [
            {
              text: "Avoid platform soles and high heels",
              sub: [
                "Out of consideration for others and for your own safety",
                "Platform soles can help shorter people see, but be careful not to get hurt",
              ],
            },
            { text: "Take off large accessories and hats (they block the view of people behind you)" },
            { text: "Venues often get hot (layers you can easily take off are best)" },
            { text: "Leave your things in a coin locker and travel light (staff may warn you about large bags)" },
          ],
        },
      ],
      faqAnswer:
        "For standing shows, wear clothes that are easy to move in. Avoid platform soles and high heels, take off large accessories and hats, and wear layers since venues get hot. Leave your things in a coin locker so you can move freely.",
    },
    {
      heading: "Where should I stand at a standing show?",
      blocks: [
        {
          kind: "p",
          spacing: "mb-3",
          text: "At standing shows, you enter in order of your ticket number and then choose where to stand, so your spot makes a big difference to the experience. Some venues have pillars or areas where it's hard to see or hear, so it helps to check the venue layout in advance.",
        },
        {
          kind: "ul",
          items: [
            {
              text: "Front center",
              label: true,
              sub: [
                "Close to the artist with an incredible atmosphere. Recommended if you want to see expressions and small details",
                "It gets crowded and you may get pushed around. For people confident in their stamina",
              ],
            },
            {
              text: "Middle to back",
              label: true,
              sub: [
                "More relaxed. You can take in the whole stage production and lighting",
                "Recommended for your first live show",
              ],
            },
            {
              text: "Left and right sides",
              label: true,
              sub: [
                "Relatively uncrowded, so you can get close to the front even with a late ticket number",
                "The stage may be hard to see from some angles. Watch the volume near the speakers",
              ],
            },
            {
              text: "Second-floor seats (if any)",
              label: true,
              sub: [
                "A wide view of the whole stage, and the sound balance is often good",
                "Farther than the standing area, so expressions and small details may be hard to see",
              ],
            },
          ],
        },
      ],
      faqAnswer:
        "The front center has the best atmosphere but gets crowded; the middle to back is more relaxed and recommended for first-timers. The sides are relatively uncrowded but the stage can be hard to see from some angles. Second-floor seats, where available, tend to offer a wide view and good sound balance.",
    },
    {
      heading: "When should I arrive at the venue?",
      blocks: [
        {
          kind: "p",
          spacing: "mb-2",
          text: "Tickets list two times: doors (開場), when you can enter the venue, and show start (開演), when the show begins.",
        },
        {
          kind: "ul",
          items: [
            { text: "Entry by ticket number (standing): be near the venue about 30 minutes before doors open" },
            { text: "Reserved seats: arriving around the doors time is fine" },
            { text: "If you want merch: check when merch sales start at each venue and line up before then" },
          ],
        },
      ],
      faqAnswer:
        "For entry by ticket number (standing), be near the venue about 30 minutes before doors open. For reserved seats, arriving around the doors time is fine. If you want merch, check each venue's sales start time in advance.",
    },
    {
      heading: "Is there anything I should be careful about during the show?",
      blocks: [
        {
          kind: "ul",
          items: [
            { text: "📱 No photos or recordings (unless officially announced)" },
            { text: "🗣 Be considerate of others during MCs and quiet parts" },
            {
              text: "🎶 In Japan, singing along tends to bother others unless the artist invites the crowd to",
              sub: ["Some countries have a sing-along culture, so follow local customs"],
            },
            { text: "🙋 Moshing and stage diving are generally prohibited" },
            { text: "🎒 Always put large bags in a locker" },
            { text: "🤝 Work together with the fans around you to make it a fun space" },
          ],
        },
      ],
      faqAnswer:
        "Photos and recordings are prohibited unless officially announced. Be considerate during MCs and quiet parts; moshing and diving are generally prohibited. Always put large bags in a locker, and work together with other fans to make it a fun space.",
    },
    {
      heading: "How should I enjoy the show?",
      blocks: [
        {
          kind: "p",
          spacing: "mb-2",
          text: "Everyone enjoys it differently. It's best to enjoy it at your own pace, however you like. Here are a few examples for reference.",
        },
        {
          kind: "ul",
          items: [
            { text: "💡 As long as you don't bother anyone, enjoy it in your own style! (No need to force yourself to match others)" },
            { text: "🎤 Feel the connection with the artist" },
            { text: "🎶 Take in the production, lighting and sound" },
            { text: "🕺 Get hyped together with the fans around you" },
            { text: "📸 (When photos are allowed) Capture the merch and the atmosphere of the venue" },
          ],
        },
      ],
      faqAnswer:
        "Everyone enjoys it differently. As long as you don't bother others, enjoy it in your own style: the connection with the artist, the production, lighting and sound, and the energy of the fans around you.",
    },
    {
      heading: "What should I do after the show?",
      blocks: [
        {
          kind: "p",
          text: "Talking about the show over food at a nearby place while still in the afterglow is part of the fun. Some places get crowded with fans after the show, so booking ahead is a good idea.",
        },
        {
          kind: "note",
          text: "❗️ If ringing in your ears or discomfort continues after the show, see an ENT doctor soon. Early treatment matters for acoustic trauma. If you're worried, we recommend concert earplugs, mentioned under \"Nice to have\" above. (In the worst case you can lose your hearing, so please see a doctor as soon as possible.)",
        },
      ],
      faqAnswer:
        "Talking about the show at a nearby place is part of the fun; booking ahead is recommended since places get crowded. If ringing in your ears or discomfort continues, see an ENT doctor soon.",
    },
    {
      heading: "Any tips for traveling to shows?",
      blocks: [
        {
          kind: "p",
          spacing: "mb-2",
          text: "How to think about transportation, budget and scheduling when attending several shows or a show far from home. Prices are rough figures for travel within Japan.",
        },
        { kind: "h3", text: "Choosing how to get there" },
        { kind: "p", spacing: "mb-1", text: "Choose your transportation based on distance and budget." },
        {
          kind: "ul",
          items: [
            {
              text: "✈️ Plane",
              sub: [
                "Recommended for faraway areas such as Okinawa, Hokkaido and Kyushu",
                "Book early and one-way fares can be under ¥10,000. Low-cost carriers mainly fly from Narita and Kansai",
                "Factor in the travel time from the airport to the venue",
              ],
            },
            {
              text: "🚄 Shinkansen (bullet train)",
              sub: [
                "Easy access to major cities from Tokyo and Osaka",
                "Discounts are available through EX Reservation and smartEX",
                "Reliable timing, and easy to travel even after the show",
              ],
            },
            {
              text: "🚌 Highway bus",
              sub: [
                "An overnight bus also saves on accommodation (though it's physically tough after a show)",
                "Choosing a three-across seat layout makes a huge difference in comfort",
              ],
            },
            {
              text: "🚗 Car",
              sub: [
                "For group trips, splitting costs can make it the cheapest option",
                "Some venues require parking reservations, so check in advance",
                "For long distances, calculate tolls and fuel before deciding",
              ],
            },
          ],
        },
        { kind: "h3", text: "Budget guide" },
        { kind: "p", spacing: "mb-1", text: "Rough cost per show when attending multiple shows (tickets not included)." },
        {
          kind: "ul",
          items: [
            { text: "Day trip (within Shinkansen range): transport ¥5,000–15,000 + food ¥2,000–3,000 = ¥7,000–18,000 total" },
            {
              text: "One-night trip (Shinkansen or plane): transport ¥10,000–30,000 + lodging ¥5,000–10,000 + food ¥3,000–5,000 = ¥18,000–45,000 total",
            },
            {
              text: "Two or more nights (back-to-back shows): transport ¥15,000–40,000 + lodging ¥10,000–20,000 + food ¥5,000–10,000 = ¥30,000–70,000 total",
            },
          ],
        },
        { kind: "h3", text: "Ways to save" },
        {
          kind: "ul",
          items: [
            { text: "Grab early-bird plane tickets as soon as they go on sale" },
            { text: "Book a business hotel early (they fill up with fans once a tour is announced)" },
            { text: "Overnight buses save on lodging and transport at the same time" },
            { text: "Back-to-back shows let you enjoy two shows for the cost of one trip" },
          ],
        },
        { kind: "h3", text: "Planning your schedule" },
        { kind: "p", spacing: "mb-1", text: "For a day trip" },
        {
          kind: "ul",
          items: [
            { text: "Aim to arrive about 3 hours before the show (time to scout the area, get a coin locker and eat)" },
            { text: "Always check the last train or bus home in advance (last trains leave early outside big cities)" },
          ],
        },
        { kind: "p", spacing: "mt-3 mb-1", text: "With an overnight stay" },
        {
          kind: "ul",
          items: [
            { text: "A hotel near the venue means no coin locker needed (drop your bags after check-in and head out light)" },
            { text: "You can go straight back to the hotel after the show, so no worrying about the last train" },
            { text: "If you're sightseeing the next day, use a coin locker after checking out" },
            { text: "Taking an early-afternoon ride home gives you some breathing room" },
          ],
        },
      ],
      faqAnswer:
        "Choose transportation by distance and budget (plane, Shinkansen, highway bus, car). A day trip costs roughly ¥7,000–18,000 and a one-night trip ¥18,000–45,000. Early-bird flights, booking hotels early, overnight buses and attending back-to-back shows are good ways to save.",
    },
  ],
  moreHeading: "See more",
  moreText:
    "Venue information (address and map) is on each show's detail page. Check out past setlists and related posts there too.",
  moreLink: "See all live shows →",
};

const zhHant: LiveGuideDict = {
  title: "演唱會參戰指南",
  metaDescription: "為第一次參加 Reol 演唱會的人整理的攜帶物品、服裝與禮儀指南，以及遠征的交通方式、預算與行程規劃。",
  intro:
    "應該有不少人是「第一次參加 Reol 的演唱會」吧。這裡整理了去 Reol 演唱會前最好先知道的資訊。當然，享受演唱會的方式因人而異，還請把這篇文章當作參考就好。內容以在日本舉辦的演出為前提。",
  sections: [
    {
      heading: "演唱會要帶什麼去？",
      blocks: [
        { kind: "h3", text: "必備" },
        {
          kind: "ul",
          items: [
            { text: "🎫 門票", sub: ["多為電子票，記得保留手機電量"] },
            {
              text: "💰 現金",
              sub: ["用於飲料券。入場時多半需要約 600 日圓", "有些場館不支援無現金支付，請事先確認"],
            },
            {
              text: "💧 飲料",
              sub: [
                "入場時購買的飲料券可以兌換飲料",
                "吶喊和流汗會口渴，所以是必需品",
                "想盡量往前擠的人，建議事先買好飲料，演出結束後再兌換飲料券",
              ],
            },
          ],
        },
        { kind: "h3", text: "有了會很方便" },
        {
          kind: "ul",
          items: [
            { text: "🔒 小包包", sub: ["不會礙事的大小"] },
            { text: "🎤 毛巾", sub: ["擦汗用。Reol 的演唱會熱到像在運動"] },
            {
              text: "👂 耳塞",
              sub: ["推薦演唱會用的護耳塞", "巨大音量可能造成聲音性外傷而導致聽力受損，擔心的人建議使用"],
            },
            { text: "👟 穿慣的運動鞋", sub: ["站票演出時特別重要"] },
          ],
        },
        { kind: "h3", text: "不需要" },
        {
          kind: "ul",
          items: [
            { text: "🧳 大包包", sub: ["放不進置物櫃，也會造成周圍的人困擾，請放在飯店"] },
            { text: "🔋 行動電源", sub: ["安靜觀賞的人帶著也無妨，但跳起來太重，請放進置物櫃"] },
          ],
        },
      ],
      faqAnswer:
        "必備的是門票、現金(飲料券約 600 日圓)和飲料。有了會很方便的有小包包、毛巾、耳塞和穿慣的運動鞋。大包包和行動電源建議寄放在置物櫃或不要帶去。",
    },
    {
      heading: "演唱會要穿什麼去？",
      blocks: [
        {
          kind: "p",
          spacing: "mb-2",
          text: "站票演出基本上以方便活動的服裝為主。廳堂演出可以稍微隨興一點，但無論哪種，都請注意以下幾點。",
        },
        {
          kind: "ul",
          items: [
            {
              text: "避免厚底鞋和高跟鞋",
              sub: ["為了顧及周圍的人以及自身安全", "個子較矮的人也可以穿厚底，但要小心受傷"],
            },
            { text: "摘下大型飾品和帽子(會擋住後方的人的視線)" },
            { text: "場內常常會很熱(方便穿脫的洋蔥式穿搭最好)" },
            { text: "行李寄放在投幣式置物櫃，輕裝上陣(大件行李可能會被工作人員提醒)" },
          ],
        },
      ],
      faqAnswer:
        "站票演出基本上以方便活動的服裝為主。避免厚底鞋和高跟鞋，摘下大型飾品和帽子，場內容易變熱，建議穿方便穿脫的洋蔥式穿搭。行李寄放在投幣式置物櫃，輕裝上陣吧。",
    },
    {
      heading: "站票演出要站在哪裡？",
      blocks: [
        {
          kind: "p",
          spacing: "mb-3",
          text: "站票演出依門票上的整理號碼依序入場後，可以依自己的喜好決定站位，因此站在哪裡看會讓體驗大不相同。有些場館有大柱子等，可能有看不清楚或聲音傳不太到的位置，事先確認場館配置會比較安心。",
        },
        {
          kind: "ul",
          items: [
            {
              text: "前方中央區",
              label: true,
              sub: ["離藝人很近，臨場感超群。推薦給想看清表情和細節演出的人", "人潮容易密集，可能會被推擠。適合對體力有自信的人"],
            },
            {
              text: "中段到後方區",
              label: true,
              sub: ["可以比較悠閒地享受。能一覽整個舞台的演出和燈光", "推薦給第一次參加演唱會的人"],
            },
            {
              text: "左右兩側區",
              label: true,
              sub: ["人比較少，即使整理號碼較後面也容易往前", "依角度可能不太看得到舞台。靠近喇叭處要注意音量"],
            },
            {
              text: "(若有)二樓座位",
              label: true,
              sub: ["視野寬廣，能一覽整個舞台。音響平衡通常很好", "比站票區遠，表情和細節演出可能看不太清楚"],
            },
          ],
        },
      ],
      faqAnswer:
        "前方中央區臨場感高但人潮容易密集；中段到後方區可以比較悠閒地享受，也推薦給第一次參加的人。左右兩側區人比較少，但依角度可能不太看得到舞台。有二樓座位的場館通常視野寬廣、音響平衡也好。",
    },
    {
      heading: "什麼時候到場館比較好？",
      blocks: [
        {
          kind: "p",
          spacing: "mb-2",
          text: "門票上會寫「開場」和「開演」兩個時間。「開場」是可以進入場館的時間，「開演」是演唱會開始的時間。",
        },
        {
          kind: "ul",
          items: [
            { text: "依整理號碼入場(站票)時：開場前 30 分鐘在場館附近會比較安心" },
            { text: "對號座位時：配合開場時間到即可" },
            { text: "想買周邊時：事先確認各場館的周邊販售開始時間，建議在開賣前排隊" },
          ],
        },
      ],
      faqAnswer:
        "依整理號碼入場(站票)時，開場前 30 分鐘在場館附近會比較安心。對號座位配合開場時間到即可。想買周邊的話，請事先確認各場館的販售開始時間。",
    },
    {
      heading: "演出中有什麼要注意的嗎？",
      blocks: [
        {
          kind: "ul",
          items: [
            { text: "📱 禁止攝影與錄音(有官方公告時除外)" },
            { text: "🗣 MC 時間或安靜的段落請顧及周圍" },
            {
              text: "🎶 除非藝人帶動，否則在日本跟著一起唱容易造成周圍困擾",
              sub: ["有些國家有一起合唱的文化，入境隨俗吧"],
            },
            { text: "🙋 原則上禁止衝撞(mosh)和跳水(dive)" },
            { text: "🎒 大件行李務必放進置物櫃" },
            { text: "🤝 和周圍的粉絲一起營造愉快的空間吧" },
          ],
        },
      ],
      faqAnswer:
        "除有官方公告外，禁止攝影與錄音。MC 時間或安靜的段落請顧及周圍，原則上禁止衝撞和跳水。大件行李務必寄放在置物櫃，和周圍的粉絲一起營造愉快的空間吧。",
    },
    {
      heading: "演唱會要怎麼享受？",
      blocks: [
        {
          kind: "p",
          spacing: "mb-2",
          text: "享受方式因人而異。按照自己的步調、用自己喜歡的方式享受最好。以下只是一些例子，僅供參考。",
        },
        {
          kind: "ul",
          items: [
            { text: "💡 只要不造成別人困擾，用自己喜歡的方式享受最好！(不需要勉強配合別人)" },
            { text: "🎤 享受與藝人之間的一體感" },
            { text: "🎶 盡情欣賞演出、燈光與音響" },
            { text: "🕺 和周圍的粉絲一起嗨起來" },
            { text: "📸 (可以攝影時)拍下周邊和場館的氣氛" },
          ],
        },
      ],
      faqAnswer:
        "享受方式因人而異。在不造成別人困擾的範圍內，用自己喜歡的方式享受最好，推薦享受與藝人的一體感、演出與燈光音響，以及和周圍粉絲一起的熱烈氣氛。",
    },
    {
      heading: "演唱會結束後要怎麼度過？",
      blocks: [
        {
          kind: "p",
          text: "沉浸在餘韻中，到附近的店家聊聊感想也是樂趣之一。有些店家會擠滿散場的粉絲，事先預約會比較安心。",
        },
        {
          kind: "note",
          text: "❗️ 演出後若持續耳鳴或耳朵不適，請盡早就醫(耳鼻喉科)。聲音性外傷及早治療很重要。擔心的人建議使用上方「有了會很方便」中介紹的演唱會用護耳塞。(最糟的情況可能會失去聽力，請盡快就醫)",
        },
      ],
      faqAnswer:
        "沉浸在餘韻中，到附近的店家聊聊感想也是樂趣之一，店家可能很擠，建議事先預約。若持續耳鳴或耳朵不適，請盡早到耳鼻喉科就醫。",
    },
    {
      heading: "遠征有什麼訣竅嗎？",
      blocks: [
        {
          kind: "p",
          spacing: "mb-2",
          text: "參加多場演出或遠方演出時，交通方式、預算與行程的規劃方式。金額為在日本國內移動的大致參考。",
        },
        { kind: "h3", text: "交通方式的選擇" },
        { kind: "p", spacing: "mb-1", text: "遠征的交通方式請依距離和預算選擇。" },
        {
          kind: "ul",
          items: [
            {
              text: "✈️ 飛機",
              sub: [
                "推薦用於沖繩、北海道、九州等遠方地區的移動",
                "早鳥預訂單程可低於 1 萬日圓。廉航以成田、關西機場起降為主",
                "記得把從機場到場館的移動時間也算進去",
              ],
            },
            {
              text: "🚄 新幹線",
              sub: ["以東京、大阪為起點，前往主要城市很方便", "透過 EX 預約或 smartEX 有折扣", "時間準確，散場後也方便移動"],
            },
            {
              text: "🚌 高速巴士",
              sub: ["搭夜間巴士還能省下住宿費(不過演出後搭夜車體力上很吃力)", "選擇三排獨立座位，舒適度截然不同"],
            },
            {
              text: "🚗 開車",
              sub: [
                "多人一起遠征時分攤費用可能最便宜",
                "有些場館的停車場需要事先預約，請確認",
                "長距離時請先計算高速公路費和油錢再決定",
              ],
            },
          ],
        },
        { kind: "h3", text: "預算參考" },
        { kind: "p", spacing: "mb-1", text: "參加多場演出時每場的大致費用(不含門票)。" },
        {
          kind: "ul",
          items: [
            { text: "當日來回(新幹線可達範圍)：交通費 5,000〜15,000 日圓+餐費 2,000〜3,000 日圓 = 合計 7,000〜18,000 日圓" },
            {
              text: "一晚遠征(新幹線或飛機)：交通費 10,000〜30,000 日圓+住宿費 5,000〜10,000 日圓+餐費 3,000〜5,000 日圓 = 合計 18,000〜45,000 日圓",
            },
            {
              text: "兩晚以上遠征(連日演出組合)：交通費 15,000〜40,000 日圓+住宿費 10,000〜20,000 日圓+餐費 5,000〜10,000 日圓 = 合計 30,000〜70,000 日圓",
            },
          ],
        },
        { kind: "h3", text: "省錢訣竅" },
        {
          kind: "ul",
          items: [
            { text: "早鳥機票在開賣後立刻訂" },
            { text: "提早預訂商務旅館(巡演公布後容易被粉絲訂滿)" },
            { text: "夜間巴士可同時省下住宿費和交通費" },
            { text: "連日演出組合一次遠征就能享受兩場" },
          ],
        },
        { kind: "h3", text: "行程安排" },
        { kind: "p", spacing: "mb-1", text: "當日來回時" },
        {
          kind: "ul",
          items: [
            { text: "以開演前 3 小時抵達當地為目標(有時間勘查場館周邊、找投幣式置物櫃、吃飯)" },
            { text: "務必事先確認散場後的末班交通(地方場館的末班車很早，要特別注意)" },
          ],
        },
        { kind: "p", spacing: "mt-3 mb-1", text: "有住宿時" },
        {
          kind: "ul",
          items: [
            { text: "住在場館附近的飯店就不需要投幣式置物櫃(入住後放下行李，輕裝前往場館)" },
            { text: "散場後可以馬上回飯店，不必擔心地方的末班車" },
            { text: "隔天要觀光的話，退房後再使用投幣式置物櫃" },
            { text: "回程交通選下午稍晚的班次會比較從容" },
          ],
        },
      ],
      faqAnswer:
        "交通方式依距離和預算選擇(飛機、新幹線、高速巴士、開車)。當日來回約 7,000〜18,000 日圓，一晚遠征約 18,000〜45,000 日圓。早鳥機票、提早訂飯店、善用夜間巴士、參加連日演出組合是省錢的訣竅。",
    },
  ],
  moreHeading: "查看更多",
  moreText: "各場演出的場館資訊(地址、地圖)刊登在各場演出的詳細頁面。也請一併查看過去的歌單和相關貼文。",
  moreLink: "查看演唱會一覽 →",
};

const zhHans: LiveGuideDict = {
  title: "演唱会参战指南",
  metaDescription: "为第一次参加 Reol 演唱会的人整理的携带物品、服装与礼仪指南，以及远征的交通方式、预算与行程规划。",
  intro:
    "应该有不少人是「第一次参加 Reol 的演唱会」吧。这里整理了去 Reol 演唱会前最好先知道的信息。当然，享受演唱会的方式因人而异，还请把这篇文章当作参考就好。内容以在日本举办的演出为前提。",
  sections: [
    {
      heading: "演唱会要带什么去？",
      blocks: [
        { kind: "h3", text: "必备" },
        {
          kind: "ul",
          items: [
            { text: "🎫 门票", sub: ["多为电子票，记得保留手机电量"] },
            {
              text: "💰 现金",
              sub: ["用于饮料券。入场时大多需要约 600 日元", "有些场馆不支持无现金支付，请事先确认"],
            },
            {
              text: "💧 饮料",
              sub: [
                "入场时购买的饮料券可以兑换饮料",
                "呐喊和流汗会口渴，所以是必需品",
                "想尽量往前挤的人，建议事先买好饮料，演出结束后再兑换饮料券",
              ],
            },
          ],
        },
        { kind: "h3", text: "有了会很方便" },
        {
          kind: "ul",
          items: [
            { text: "🔒 小包", sub: ["不会碍事的大小"] },
            { text: "🎤 毛巾", sub: ["擦汗用。Reol 的演唱会热到像在运动"] },
            {
              text: "👂 耳塞",
              sub: ["推荐演唱会用的护耳塞", "巨大音量可能造成声损伤而导致听力受损，担心的人建议使用"],
            },
            { text: "👟 穿惯的运动鞋", sub: ["站票演出时特别重要"] },
          ],
        },
        { kind: "h3", text: "不需要" },
        {
          kind: "ul",
          items: [
            { text: "🧳 大包", sub: ["放不进储物柜，也会给周围的人添麻烦，请放在酒店"] },
            { text: "🔋 充电宝", sub: ["安静观看的人带着也无妨，但跳起来太重，请放进储物柜"] },
          ],
        },
      ],
      faqAnswer:
        "必备的是门票、现金(饮料券约 600 日元)和饮料。有了会很方便的有小包、毛巾、耳塞和穿惯的运动鞋。大包和充电宝建议寄存在储物柜或不要带去。",
    },
    {
      heading: "演唱会要穿什么去？",
      blocks: [
        {
          kind: "p",
          spacing: "mb-2",
          text: "站票演出基本上以方便活动的服装为主。剧场演出可以稍微随意一点，但无论哪种，都请注意以下几点。",
        },
        {
          kind: "ul",
          items: [
            {
              text: "避免厚底鞋和高跟鞋",
              sub: ["为了顾及周围的人以及自身安全", "个子较矮的人也可以穿厚底，但要小心受伤"],
            },
            { text: "摘下大型饰品和帽子(会挡住后方的人的视线)" },
            { text: "场内常常会很热(方便穿脱的叠穿最好)" },
            { text: "行李寄存在投币式储物柜，轻装上阵(大件行李可能会被工作人员提醒)" },
          ],
        },
      ],
      faqAnswer:
        "站票演出基本上以方便活动的服装为主。避免厚底鞋和高跟鞋，摘下大型饰品和帽子，场内容易变热，建议穿方便穿脱的叠穿。行李寄存在投币式储物柜，轻装上阵吧。",
    },
    {
      heading: "站票演出要站在哪里？",
      blocks: [
        {
          kind: "p",
          spacing: "mb-3",
          text: "站票演出按门票上的整理号码依次入场后，可以按自己的喜好决定站位，因此站在哪里看会让体验大不相同。有些场馆有大柱子等，可能有看不清楚或声音传不太到的位置，事先确认场馆布局会比较安心。",
        },
        {
          kind: "ul",
          items: [
            {
              text: "前方中央区",
              label: true,
              sub: ["离艺人很近，临场感超群。推荐给想看清表情和细节演出的人", "人群容易密集，可能会被推挤。适合对体力有自信的人"],
            },
            {
              text: "中段到后方区",
              label: true,
              sub: ["可以比较悠闲地享受。能一览整个舞台的演出和灯光", "推荐给第一次参加演唱会的人"],
            },
            {
              text: "左右两侧区",
              label: true,
              sub: ["人比较少，即使整理号码较靠后也容易往前", "根据角度可能不太看得到舞台。靠近音箱处要注意音量"],
            },
            {
              text: "(如果有)二楼座位",
              label: true,
              sub: ["视野宽广，能一览整个舞台。音响平衡通常很好", "比站票区远，表情和细节演出可能看不太清楚"],
            },
          ],
        },
      ],
      faqAnswer:
        "前方中央区临场感高但人群容易密集；中段到后方区可以比较悠闲地享受，也推荐给第一次参加的人。左右两侧区人比较少，但根据角度可能不太看得到舞台。有二楼座位的场馆通常视野宽广、音响平衡也好。",
    },
    {
      heading: "什么时候到场馆比较好？",
      blocks: [
        {
          kind: "p",
          spacing: "mb-2",
          text: "门票上会写「开场」和「开演」两个时间。「开场」是可以进入场馆的时间，「开演」是演唱会开始的时间。",
        },
        {
          kind: "ul",
          items: [
            { text: "按整理号码入场(站票)时：开场前 30 分钟在场馆附近会比较安心" },
            { text: "对号座位时：配合开场时间到即可" },
            { text: "想买周边时：事先确认各场馆的周边销售开始时间，建议在开卖前排队" },
          ],
        },
      ],
      faqAnswer:
        "按整理号码入场(站票)时，开场前 30 分钟在场馆附近会比较安心。对号座位配合开场时间到即可。想买周边的话，请事先确认各场馆的销售开始时间。",
    },
    {
      heading: "演出中有什么要注意的吗？",
      blocks: [
        {
          kind: "ul",
          items: [
            { text: "📱 禁止拍摄与录音(有官方公告时除外)" },
            { text: "🗣 MC 时间或安静的段落请顾及周围" },
            {
              text: "🎶 除非艺人带动，否则在日本跟着一起唱容易给周围添麻烦",
              sub: ["有些国家有一起合唱的文化，入乡随俗吧"],
            },
            { text: "🙋 原则上禁止冲撞(mosh)和跳水(dive)" },
            { text: "🎒 大件行李务必放进储物柜" },
            { text: "🤝 和周围的粉丝一起营造愉快的空间吧" },
          ],
        },
      ],
      faqAnswer:
        "除有官方公告外，禁止拍摄与录音。MC 时间或安静的段落请顾及周围，原则上禁止冲撞和跳水。大件行李务必寄存在储物柜，和周围的粉丝一起营造愉快的空间吧。",
    },
    {
      heading: "演唱会要怎么享受？",
      blocks: [
        {
          kind: "p",
          spacing: "mb-2",
          text: "享受方式因人而异。按照自己的节奏、用自己喜欢的方式享受最好。以下只是一些例子，仅供参考。",
        },
        {
          kind: "ul",
          items: [
            { text: "💡 只要不给别人添麻烦，用自己喜欢的方式享受最好！(不需要勉强配合别人)" },
            { text: "🎤 享受与艺人之间的一体感" },
            { text: "🎶 尽情欣赏演出、灯光与音响" },
            { text: "🕺 和周围的粉丝一起嗨起来" },
            { text: "📸 (可以拍摄时)拍下周边和场馆的氛围" },
          ],
        },
      ],
      faqAnswer:
        "享受方式因人而异。在不给别人添麻烦的范围内，用自己喜欢的方式享受最好，推荐享受与艺人的一体感、演出与灯光音响，以及和周围粉丝一起的热烈氛围。",
    },
    {
      heading: "演唱会结束后要怎么度过？",
      blocks: [
        {
          kind: "p",
          text: "沉浸在余韵中，到附近的店里聊聊感想也是乐趣之一。有些店会挤满散场的粉丝，事先预约会比较安心。",
        },
        {
          kind: "note",
          text: "❗️ 演出后如果持续耳鸣或耳朵不适，请尽早去耳鼻喉科就医。声损伤及早治疗很重要。担心的人建议使用上方「有了会很方便」中介绍的演唱会用护耳塞。(最坏的情况可能会失去听力，请尽快就医)",
        },
      ],
      faqAnswer:
        "沉浸在余韵中，到附近的店里聊聊感想也是乐趣之一，店里可能很挤，建议事先预约。如果持续耳鸣或耳朵不适，请尽早去耳鼻喉科就医。",
    },
    {
      heading: "远征有什么诀窍吗？",
      blocks: [
        {
          kind: "p",
          spacing: "mb-2",
          text: "参加多场演出或远方演出时，交通方式、预算与行程的规划方法。金额为在日本国内移动的大致参考。",
        },
        { kind: "h3", text: "交通方式的选择" },
        { kind: "p", spacing: "mb-1", text: "远征的交通方式请根据距离和预算选择。" },
        {
          kind: "ul",
          items: [
            {
              text: "✈️ 飞机",
              sub: [
                "推荐用于冲绳、北海道、九州等远方地区的移动",
                "提前预订单程可低于 1 万日元。廉航以成田、关西机场起降为主",
                "记得把从机场到场馆的移动时间也算进去",
              ],
            },
            {
              text: "🚄 新干线",
              sub: ["以东京、大阪为起点，前往主要城市很方便", "通过 EX 预约或 smartEX 有折扣", "时间准确，散场后也方便移动"],
            },
            {
              text: "🚌 高速巴士",
              sub: ["坐夜间巴士还能省下住宿费(不过演出后坐夜车体力上很吃力)", "选择三排独立座位，舒适度截然不同"],
            },
            {
              text: "🚗 开车",
              sub: [
                "多人一起远征时分摊费用可能最便宜",
                "有些场馆的停车场需要事先预约，请确认",
                "长距离时请先计算高速费和油费再决定",
              ],
            },
          ],
        },
        { kind: "h3", text: "预算参考" },
        { kind: "p", spacing: "mb-1", text: "参加多场演出时每场的大致费用(不含门票)。" },
        {
          kind: "ul",
          items: [
            { text: "当日往返(新干线可达范围)：交通费 5,000〜15,000 日元+餐费 2,000〜3,000 日元 = 合计 7,000〜18,000 日元" },
            {
              text: "一晚远征(新干线或飞机)：交通费 10,000〜30,000 日元+住宿费 5,000〜10,000 日元+餐费 3,000〜5,000 日元 = 合计 18,000〜45,000 日元",
            },
            {
              text: "两晚以上远征(连日演出组合)：交通费 15,000〜40,000 日元+住宿费 10,000〜20,000 日元+餐费 5,000〜10,000 日元 = 合计 30,000〜70,000 日元",
            },
          ],
        },
        { kind: "h3", text: "省钱诀窍" },
        {
          kind: "ul",
          items: [
            { text: "早鸟机票在开卖后立刻订" },
            { text: "提早预订商务酒店(巡演公布后容易被粉丝订满)" },
            { text: "夜间巴士可同时省下住宿费和交通费" },
            { text: "连日演出组合一次远征就能享受两场" },
          ],
        },
        { kind: "h3", text: "行程安排" },
        { kind: "p", spacing: "mb-1", text: "当日往返时" },
        {
          kind: "ul",
          items: [
            { text: "以开演前 3 小时抵达当地为目标(有时间考察场馆周边、找投币式储物柜、吃饭)" },
            { text: "务必事先确认散场后的末班交通(地方场馆的末班车很早，要特别注意)" },
          ],
        },
        { kind: "p", spacing: "mt-3 mb-1", text: "有住宿时" },
        {
          kind: "ul",
          items: [
            { text: "住在场馆附近的酒店就不需要投币式储物柜(入住后放下行李，轻装前往场馆)" },
            { text: "散场后可以马上回酒店，不必担心地方的末班车" },
            { text: "第二天要观光的话，退房后再使用投币式储物柜" },
            { text: "回程交通选下午稍晚的班次会比较从容" },
          ],
        },
      ],
      faqAnswer:
        "交通方式根据距离和预算选择(飞机、新干线、高速巴士、开车)。当日往返约 7,000〜18,000 日元，一晚远征约 18,000〜45,000 日元。早鸟机票、提早订酒店、善用夜间巴士、参加连日演出组合是省钱的诀窍。",
    },
  ],
  moreHeading: "查看更多",
  moreText: "各场演出的场馆信息(地址、地图)刊登在各场演出的详细页面。也请一并查看过去的歌单和相关帖子。",
  moreLink: "查看演唱会一览 →",
};

const ko: LiveGuideDict = {
  title: "라이브 참전 가이드",
  metaDescription:
    "Reol 라이브에 처음 가는 분을 위한 준비물·복장·매너 가이드와, 원정의 이동 수단·예산·일정 짜는 법을 정리했습니다.",
  intro:
    "'Reol 라이브는 처음'이라는 분도 많지 않을까요? 여기서는 Reol 라이브에 가기 전에 알아 두면 좋은 정보를 정리했습니다. 물론 라이브를 즐기는 방법은 사람마다 다르니, 이 글은 어디까지나 참고용으로 읽어 주시면 좋겠습니다. 일본에서 열리는 공연을 전제로 한 내용입니다.",
  sections: [
    {
      heading: "라이브에는 무엇을 가져가면 되나요?",
      blocks: [
        { kind: "h3", text: "필수" },
        {
          kind: "ul",
          items: [
            { text: "🎫 티켓", sub: ["전자 티켓이 많으니 스마트폰 배터리를 아껴 두자"] },
            {
              text: "💰 현금",
              sub: [
                "드링크 티켓용. 입장 시 600엔 정도가 필요한 경우가 많다",
                "캐시리스 결제가 안 되는 공연장도 있으니 미리 확인해 두자",
              ],
            },
            {
              text: "💧 음료",
              sub: [
                "입장 시 구입하는 드링크 티켓을 음료로 교환할 수 있다",
                "소리 지르고 땀을 흘리면 목이 마르니 필수",
                "어떻게든 앞쪽으로 가고 싶은 사람은 미리 음료를 사 두고, 라이브가 끝난 뒤 교환하는 것을 추천",
              ],
            },
          ],
        },
        { kind: "h3", text: "있으면 편리" },
        {
          kind: "ul",
          items: [
            { text: "🔒 작은 가방", sub: ["방해되지 않는 크기"] },
            { text: "🎤 수건", sub: ["땀 닦기용. Reol의 라이브는 운동할 때만큼 뜨거워진다"] },
            {
              text: "👂 귀마개",
              sub: ["라이브용 이어 프로텍터를 추천", "음향 외상으로 난청이 생길 수 있으니 걱정되는 사람에게 권장"],
            },
            { text: "👟 신던 운동화", sub: ["스탠딩 공연에서는 특히 중요"] },
          ],
        },
        { kind: "h3", text: "불필요" },
        {
          kind: "ul",
          items: [
            { text: "🧳 큰 가방", sub: ["사물함에 들어가지 않고 주변 사람에게 방해가 되니 호텔에 두고 오자"] },
            { text: "🔋 보조 배터리", sub: ["조용히 보는 사람이라면 있어도 좋지만, 뛰기에는 너무 무거우니 사물함에 넣어 두자"] },
          ],
        },
      ],
      faqAnswer:
        "필수는 티켓·현금(드링크 티켓용 600엔 정도)·음료입니다. 있으면 편리한 것으로는 작은 가방·수건·귀마개·신던 운동화가 있습니다. 큰 가방이나 보조 배터리는 사물함에 맡기거나 가져가지 않는 것을 추천합니다.",
    },
    {
      heading: "라이브에는 어떤 복장으로 가면 되나요?",
      blocks: [
        {
          kind: "p",
          spacing: "mb-2",
          text: "스탠딩 공연은 움직이기 편한 복장이 기본. 홀 공연은 조금 더 편하게 입어도 괜찮지만, 어느 쪽이든 아래가 포인트입니다.",
        },
        {
          kind: "ul",
          items: [
            {
              text: "통굽·높은 굽 신발은 피한다",
              sub: ["주변 사람에 대한 배려와 자신의 안전을 위해", "키가 작은 사람은 통굽도 괜찮지만 부상에는 주의"],
            },
            { text: "큰 액세서리·모자는 벗는다(뒷사람이 안 보이게 됩니다)" },
            { text: "공연장 안은 더워지는 경우가 많다(입고 벗기 쉬운 레이어드가 좋음)" },
            { text: "짐은 코인 로커에 맡기고 가볍게(큰 짐은 스태프에게 주의를 받을 수도 있음)" },
          ],
        },
      ],
      faqAnswer:
        "스탠딩 공연은 움직이기 편한 복장이 기본입니다. 통굽·높은 굽 신발은 피하고, 큰 액세서리나 모자는 벗고, 공연장 안이 더워지기 쉬우니 입고 벗기 쉬운 레이어드를 추천합니다. 짐은 코인 로커에 맡기고 가볍게 다니세요.",
    },
    {
      heading: "스탠딩에서는 어디에 서면 되나요?",
      blocks: [
        {
          kind: "p",
          spacing: "mb-3",
          text: "스탠딩 공연은 티켓의 정리 번호 순으로 입장한 뒤 서는 위치를 자유롭게 정할 수 있어서, 어디서 보느냐에 따라 경험이 크게 달라집니다. 공연장에 따라 큰 기둥 등이 있어 잘 안 보이거나 소리가 잘 닿지 않는 곳도 있으니, 미리 공연장 배치를 확인해 두면 안심입니다.",
        },
        {
          kind: "ul",
          items: [
            {
              text: "앞쪽 중앙 구역",
              label: true,
              sub: [
                "아티스트와 가까워 현장감이 발군. 표정이나 세세한 연출까지 보고 싶은 분에게 추천",
                "사람이 몰리기 쉬워 밀리거나 치일 수 있다. 체력에 자신 있는 사람용",
              ],
            },
            {
              text: "중간~뒤쪽 구역",
              label: true,
              sub: ["비교적 여유롭게 즐길 수 있다. 무대 전체의 연출과 조명을 한눈에 볼 수 있다", "첫 라이브라면 추천"],
            },
            {
              text: "좌우 구역",
              label: true,
              sub: ["비교적 한산해서 정리 번호가 늦어도 앞쪽으로 가기 쉽다", "각도에 따라 무대가 잘 안 보일 수도. 스피커 근처는 음량에 주의"],
            },
            {
              text: "(있는 경우) 2층석",
              label: true,
              sub: ["시야가 넓어 무대 전체를 볼 수 있다. 음향 밸런스가 좋은 경우가 많다", "스탠딩 구역보다 멀어서 표정이나 세세한 연출은 잘 안 보일 수도"],
            },
          ],
        },
      ],
      faqAnswer:
        "앞쪽 중앙 구역은 현장감이 높은 반면 사람이 몰리기 쉽고, 중간~뒤쪽 구역은 비교적 여유롭게 즐길 수 있어 첫 라이브에도 추천합니다. 좌우 구역은 비교적 한산하지만 각도에 따라 무대가 잘 안 보일 수 있습니다. 2층석이 있는 공연장은 시야가 넓고 음향 밸런스도 좋은 편입니다.",
    },
    {
      heading: "공연장에는 언제 도착하면 되나요?",
      blocks: [
        {
          kind: "p",
          spacing: "mb-2",
          text: "티켓에는 '개장'과 '개연' 두 가지 시간이 적혀 있습니다. '개장'은 공연장에 들어갈 수 있는 시간, '개연'은 라이브가 시작하는 시간입니다.",
        },
        {
          kind: "ul",
          items: [
            { text: "정리 번호 순 입장(스탠딩)인 경우: 개장 30분 전에는 공연장 주변에 있으면 안심" },
            { text: "지정석인 경우: 개장 시간에 맞춰 가면 OK" },
            { text: "굿즈를 사고 싶은 경우: 공연장별 굿즈 판매 시작 시간을 미리 확인하고, 시작 전에 줄을 서는 것을 추천" },
          ],
        },
      ],
      faqAnswer:
        "정리 번호 순 입장(스탠딩)인 경우 개장 30분 전에는 공연장 주변에 있으면 안심입니다. 지정석은 개장 시간에 맞춰 가면 됩니다. 굿즈를 사고 싶다면 공연장별 판매 시작 시간을 미리 확인하세요.",
    },
    {
      heading: "라이브 중에 조심할 점이 있나요?",
      blocks: [
        {
          kind: "ul",
          items: [
            { text: "📱 촬영·녹음 금지(공식 안내가 있는 경우 제외)" },
            { text: "🗣 MC 중이나 조용한 파트에서는 주변을 배려" },
            {
              text: "🎶 아티스트가 유도하는 경우가 아니면, 일본에서는 따라 부르는 것이 주변에 폐가 되기 쉽다",
              sub: ["나라에 따라서는 함께 부르는 문화도 있으니 그곳의 방식을 따르자"],
            },
            { text: "🙋 모싱·다이브는 원칙적으로 금지" },
            { text: "🎒 큰 짐은 반드시 사물함에" },
            { text: "🤝 주변 팬들과 협력해 즐거운 공간을 만들자" },
          ],
        },
      ],
      faqAnswer:
        "촬영·녹음은 공식 안내가 있는 경우를 제외하고 금지입니다. MC 중이나 조용한 파트에서는 주변을 배려하고, 모싱·다이브는 원칙적으로 금지입니다. 큰 짐은 반드시 사물함에 맡기고, 주변 팬들과 협력해 즐거운 공간을 만드세요.",
    },
    {
      heading: "라이브는 어떻게 즐기면 되나요?",
      blocks: [
        {
          kind: "p",
          spacing: "mb-2",
          text: "즐기는 방법은 사람마다 다릅니다. 자기 페이스대로, 좋아하는 방식으로 즐기는 것이 최고입니다. 아래는 한 가지 예이니 참고해 보세요.",
        },
        {
          kind: "ul",
          items: [
            { text: "💡 폐가 되지 않는 한, 자기가 좋아하는 스타일로 즐기는 것이 최고!(무리해서 맞출 필요는 없습니다)" },
            { text: "🎤 아티스트와의 일체감을 즐긴다" },
            { text: "🎶 연출과 조명, 음향을 만끽한다" },
            { text: "🕺 주변 팬들과 함께 분위기를 띄운다" },
            { text: "📸 (촬영 가능한 경우) 굿즈나 공연장 분위기를 사진에 담는다" },
          ],
        },
      ],
      faqAnswer:
        "즐기는 방법은 사람마다 다릅니다. 폐가 되지 않는 범위에서 좋아하는 스타일로 즐기는 것이 최고이며, 아티스트와의 일체감, 연출·조명·음향, 주변 팬들과의 분위기 등을 즐기는 것을 추천합니다.",
    },
    {
      heading: "라이브가 끝난 뒤에는 어떻게 보내면 되나요?",
      blocks: [
        {
          kind: "p",
          text: "여운에 잠겨 근처 가게에서 감상을 나누는 것도 즐거움 중 하나. 가게에 따라 라이브를 마친 팬들로 붐빌 수 있으니 미리 예약해 두면 안심입니다.",
        },
        {
          kind: "note",
          text: "❗️ 라이브 후 이명이나 귀의 위화감이 계속되면 빨리 이비인후과 진료를 받으세요. 음향 외상은 조기 치료가 중요합니다. 걱정되는 분은 위의 '있으면 편리'에서 소개한 라이브용 이어 프로텍터 사용을 추천합니다.(최악의 경우 청력을 잃을 수도 있으니 되도록 빨리 진료를 받으세요)",
        },
      ],
      faqAnswer:
        "여운에 잠겨 근처 가게에서 감상을 나누는 것도 즐거움 중 하나입니다. 붐빌 수 있으니 미리 예약하는 것을 추천합니다. 이명이나 귀의 위화감이 계속되면 빨리 이비인후과 진료를 받으세요.",
    },
    {
      heading: "원정 요령이 있나요?",
      blocks: [
        {
          kind: "p",
          spacing: "mb-2",
          text: "여러 공연에 참전하거나 먼 곳의 공연에 참전할 때의 이동 수단·예산·일정 생각법입니다. 금액은 일본 국내 이동 기준의 대략적인 수치입니다.",
        },
        { kind: "h3", text: "이동 수단 고르기" },
        { kind: "p", spacing: "mb-1", text: "원정의 이동 수단은 거리와 예산에 따라 골라 쓰세요." },
        {
          kind: "ul",
          items: [
            {
              text: "✈️ 비행기",
              sub: [
                "오키나와·홋카이도·규슈 등 먼 지역으로 이동할 때 추천",
                "조기 예약하면 편도 1만 엔 이하도. LCC는 나리타·간사이 공항 발착이 중심",
                "공항에서 공연장까지의 이동 시간도 계산에 넣을 것",
              ],
            },
            {
              text: "🚄 신칸센",
              sub: ["도쿄·오사카를 기점으로 주요 도시로 이동하기 쉽다", "EX 예약이나 스마트EX로 할인 가능", "시간이 확실하고 공연이 끝난 뒤에도 이동하기 쉽다"],
            },
            {
              text: "🚌 고속버스",
              sub: ["야간 버스라면 숙박비도 아낄 수 있다(단, 라이브 후 야간 버스는 체력적으로 힘듦)", "3열 독립 시트를 고르면 쾌적함이 차원이 다르다"],
            },
            {
              text: "🚗 자동차",
              sub: ["그룹 원정이라면 비용을 나눠 가장 저렴해질 수도", "공연장에 따라 주차장 사전 예약이 필요할 수 있으니 확인을", "장거리라면 고속도로 요금+기름값을 계산한 뒤 판단을"],
            },
          ],
        },
        { kind: "h3", text: "예산 기준" },
        { kind: "p", spacing: "mb-1", text: "여러 공연에 참전할 때 1공연당 대략적인 비용입니다(티켓값 별도)." },
        {
          kind: "ul",
          items: [
            { text: "당일치기 원정(신칸센 권역): 교통비 5,000~15,000엔+식비 2,000~3,000엔 = 합계 7,000~18,000엔" },
            {
              text: "1박 원정(신칸센 또는 비행기): 교통비 10,000~30,000엔+숙박비 5,000~10,000엔+식비 3,000~5,000엔 = 합계 18,000~45,000엔",
            },
            {
              text: "2박 이상 원정(연일 공연 세트): 교통비 15,000~40,000엔+숙박비 10,000~20,000엔+식비 5,000~10,000엔 = 합계 30,000~70,000엔",
            },
          ],
        },
        { kind: "h3", text: "절약 요령" },
        {
          kind: "ul",
          items: [
            { text: "조기 할인 항공권은 발매 직후에 잡아 둔다" },
            { text: "호텔을 일찍 예약해 비즈니스호텔을 확보(투어 발표 후에는 팬들로 차기 쉽다)" },
            { text: "야간 버스는 숙박비와 교통비를 동시에 아끼는 비법" },
            { text: "연일 공연 세트라면 한 번의 원정비로 두 공연을 즐길 수 있다" },
          ],
        },
        { kind: "h3", text: "일정 짜는 법" },
        { kind: "p", spacing: "mb-1", text: "당일치기인 경우" },
        {
          kind: "ul",
          items: [
            { text: "개연 3시간 전 현지 도착을 기준으로 한다(공연장 주변 답사, 코인 로커 확보, 식사를 마칠 여유가 생긴다)" },
            { text: "공연 후 마지막 교통편은 반드시 미리 확인(지방 공연장은 막차가 빠르니 주의)" },
          ],
        },
        { kind: "p", spacing: "mt-3 mb-1", text: "숙박하는 경우" },
        {
          kind: "ul",
          items: [
            { text: "공연장 근처 호텔을 잡으면 코인 로커가 필요 없다(체크인 후 짐을 두고 가볍게 공연장으로)" },
            { text: "공연이 끝나도 바로 호텔로 돌아갈 수 있어서 지방의 막차를 신경 쓰지 않아도 된다" },
            { text: "다음 날 관광을 한다면 체크아웃 후 코인 로커를 이용" },
            { text: "돌아가는 교통편은 오후 이른 시간대로 해 두면 여유가 생긴다" },
          ],
        },
      ],
      faqAnswer:
        "이동 수단은 거리와 예산에 따라 골라 씁니다(비행기·신칸센·고속버스·자동차). 당일치기 원정은 7,000~18,000엔, 1박 원정은 18,000~45,000엔이 기준입니다. 조기 할인 항공권이나 호텔 조기 예약, 야간 버스 활용, 연일 공연 세트 참전이 절약 요령입니다.",
    },
  ],
  moreHeading: "더 보기",
  moreText: "각 공연의 공연장 정보(주소·지도)는 공연별 상세 페이지에 실려 있습니다. 지난 세트리스트와 관련 포스트도 함께 확인해 보세요.",
  moreLink: "LIVE 목록 보기 →",
};

export const liveGuideDict: Record<SiteLang, LiveGuideDict> = {
  ja,
  en,
  "zh-hant": zhHant,
  "zh-hans": zhHans,
  ko,
};
