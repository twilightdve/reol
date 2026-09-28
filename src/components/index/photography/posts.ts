import * as images from "./index";

export const TYPES = {
  photo: 0,
  youtube: 1,
  youtube_tate: 2,
  post: 3,
  photo_tate: 4,
  photo_wide: 5,
};

export const posts = [
  {
    date: "2025/4/5",
    title: "#CENTRAL_FEST VIVAL",
    description:
      "5組ともこれ以上ない最高のパフォーマンスでした!! それぞれのアーティストがVIVALのコンセプトを解釈して最大限表現していたのがわかって、トータルで見てもアートとして素晴らしすぎました👏 我らがれをるは初見も2階席も見たことないくらい沸かせていてダントツの一体感でフロアを沸かせてました。さすれ!!",
    items: [
      {
        type: TYPES.photo,
        src: images.vival1,
      },
      {
        type: TYPES.photo,
        src: images.vival2,
      },
      {
        type: TYPES.photo,
        src: images.vival3,
      },
      {
        type: TYPES.photo,
        src: images.vival4,
      },
      {
        type: TYPES.photo,
        src: images.vival5,
      },
      {
        type: TYPES.photo,
        src: images.vival6,
      },
    ],
    links: [
      {
        title: "中洲屋台「やまちゃん」",
        url: "https://maps.app.goo.gl/j5tmXgaSs2HTAqae9?g_st=com.google.maps.preview.copy",
      },
      {
        title: "Legit FCコンテンツ <MEMO>",
        url: "https://reol.jp/blog/detail/61/",
      },
    ],
    relatedPosts: [],
  },
  {
    date: "2025/2/16",
    title: "【聖地巡礼】やまちゃん",
    description:
      "中洲屋台のやまちゃんにも行ってきたよ。夜中1:30頃だったからもう終わっちゃってて食べれなかったけどとりあえず✅",
    items: [
      {
        type: TYPES.photo,
        src: images.diosYamachanImage,
      },
      {
        type: TYPES.photo,
        src: images.diosNakasuImage,
      },
    ],
    links: [
      {
        title: "中洲屋台「やまちゃん」",
        url: "https://maps.app.goo.gl/j5tmXgaSs2HTAqae9?g_st=com.google.maps.preview.copy",
      },
      {
        title: "Legit FCコンテンツ <MEMO>",
        url: "https://reol.jp/blog/detail/61/",
      },
    ],
    relatedPosts: [],
  },
  {
    date: "2024/3/1",
    title: "No title鑑賞会@福岡",
    description:
      "3回目となるNo title鑑賞会。今回は15人の方が参加してくださりとても賑やかな会となりました。私が2/15に誕生日を迎えた翌日だったため仲良しの二人がケーキを用意してくれて、みんなで盛大に祝っていただきました。こんなにたくさんの人に祝われたのは人生で初めてかも。とても幸せな時間でした。",
    items: [
      {
        type: TYPES.photo,
        src: images.diosWatchPartyCake,
      },
      {
        type: TYPES.photo,
        src: images.diosWatchParty,
      },
    ],
    links: [],
    relatedPosts: [],
  },
  {
    date: "2025/2/16",
    title: "Dios 脱構築β with Reol",
    description:
      "Diosのライヴは撮影可だったため超貴重映像が撮れました！あんまりステージから近くなかったので映像粗くすみません。",
    items: [
      {
        type: TYPES.youtube_tate,
        src: "fKYasD-PsJ4",
      },
      {
        type: TYPES.youtube_tate,
        src: "1nSngSuy-Qc",
      },
      {
        type: TYPES.photo_wide,
        src: images.unboxIshikawa1,
      },
    ],
    links: [],
    relatedPosts: ["1891373798730936736", "1891101612866781292"],
  },
  {
    date: "2025/2/16",
    title: "【聖地巡礼】博多ラーメン Shin Shin",
    description:
      "shinshinのラーメン美味しかった！！めちゃくちゃ並んでて1時間半くらい待ったけどこれは美味しい。濃厚なのに軽くて一回替え玉したけどあと二玉は食べれたな〜。今度は飲んだ後に食べにいきたい😋店内サインだらけだったけどReolのサインは見当たらなかった…ないのかな🤔",
    items: [
      {
        type: TYPES.photo,
        src: images.diosShinFrontImage,
      },
      {
        type: TYPES.photo,
        src: images.diosShinMenImage,
      },
      {
        type: TYPES.photo,
        src: images.diosShinSign1Image,
      },
      {
        type: TYPES.photo,
        src: images.diosShinSign2Image,
      },
    ],
    links: [
      {
        title: "博多ラーメン「Shin Shin」",
        url: "https://www.hakata-shinshin.com/",
      },
      {
        title: "Legit FCコンテンツ <DOCUMENT>",
        url: "https://reol.jp/blog/detail/94/",
      },
    ],
    relatedPosts: [],
  },
  {
    date: "2025/2/16",
    title: "【聖地巡礼】QUON RIVER TERRACE",
    description:
      "QUON RIVER TERRACEに聖地巡礼。本当は夜行きたかったけどタイミングあわなかったので朝行ってきた。モンブラン美味しかった〜",
    items: [
      {
        type: TYPES.photo,
        src: images.diosQuantedImage,
      },
      {
        type: TYPES.photo,
        src: images.diosQuantedCakeImage,
      },
    ],
    links: [
      {
        title: "QUON RIVER TERRACE",
        url: "https://quon-rt.com/",
      },
      {
        title: "Legit FCコンテンツ <DOCUMENT>",
        url: "https://reol.jp/blog/detail/94/",
      },
    ],
    relatedPosts: ["1886740203202863330"],
  },
  {
    date: "2025/2/3",
    title: "No title鑑賞会@東京",
    description:
      "No title鑑賞会!! 名古屋に続いて早くも2回目の開催でした。2回目も最高に楽しかったのでいろんなところでやりたくなりました!!",
    items: [
      {
        type: TYPES.photo_wide,
        src: images.cultureTokyoWatchParty1,
      },
      {
        type: TYPES.photo_wide,
        src: images.cultureTokyoWatchParty2,
      },
      {
        type: TYPES.photo_wide,
        src: images.cultureTokyoWatchParty3,
      },
    ],
    links: [],
    relatedPosts: [],
  },
  {
    date: "2025/2/3",
    title: "カルチュア・カリキュラム東京",
    description:
      "初のZepp Divercity TOKYO!!今夜のれをる氏は仕上がってた！完璧なパフォーマンスで千穐楽を迎えていて本当にさすがとしか言いようがない…やっぱりれをるはすごかった。。",
    items: [
      {
        type: TYPES.photo_wide,
        src: images.cultureTokyo1,
      },
      {
        type: TYPES.photo,
        src: images.cultureTokyo2,
      },
      {
        type: TYPES.photo,
        src: images.cultureTokyo3,
      },
    ],
    links: [],
    relatedPosts: [
      "1886262339034624462",
      "1886387378048188914",
      "1886050671050567752",
      "1886072141705253351",
    ],
  },
  {
    date: "2025/1/25",
    title: "松本弾丸旅行",
    description: "カルチュア名古屋の翌朝、特急しなのに乗り松本へ弾丸旅行♪",
    items: [
      {
        type: TYPES.photo_wide,
        src: images.cultureMatsumoto1,
      },
      {
        type: TYPES.photo_wide,
        src: images.cultureMatsumoto2,
      },
      {
        type: TYPES.photo_wide,
        src: images.cultureMatsumoto3,
      },
      {
        type: TYPES.photo_wide,
        src: images.cultureMatsumoto4,
      },
    ],
    links: [],
    relatedPosts: [],
  },
  {
    date: "2025/1/24",
    title: "No title鑑賞会@名古屋",
    description:
      "No titleをみんなで見ながら愛を語り合えたら最高だよね…ということでレンタルスペースを借りて鑑賞会を企画しました。思ったとおり最高に楽しい会となりました！またやりたい！",
    items: [
      {
        type: TYPES.photo_wide,
        src: images.cultureNagoya3,
      },
      {
        type: TYPES.photo_wide,
        src: images.cultureNagoya2,
      },
    ],
    links: [],
    relatedPosts: [],
  },
  {
    date: "2025/1/24",
    title: "カルチュア・カリキュラム名古屋",
    description:
      "UNBOX以来の名古屋！今日のれをる氏はなんとなく、何かを試しているような感じがした。カルチュアでどんなことを学んでいるんだろう？その答えはきっと未来にわかる…",
    items: [
      {
        type: TYPES.photo,
        src: images.cultureNagoya1,
      },
    ],
    links: [],
    relatedPosts: ["1882769053087138278", "1884274103810679064"],
  },
  {
    date: "2025/1/19",
    title: "カルチュア・カリキュラム大阪",
    description:
      "カルチュア初日!新式浪漫以来のZepp Osaka Bayside!!まさかの「たい」を2回歌うというアクシデントもありファンは大歓喜!れをる氏にとっては大変なライヴでした笑（ステージセットの雰囲気、ロストワンの号哭を歌うんじゃないかと思った人は自分だけじゃないはず）",
    items: [
      {
        type: TYPES.photo_wide,
        src: images.cultureOsaka1,
      },
      {
        type: TYPES.photo_wide,
        src: images.cultureOsaka2,
      },
    ],
    links: [],
    relatedPosts: ["1880941252985892976", "1880950169447055546"],
  },
  {
    date: "2025/1/18",
    title: "【グッズ】カルチュア・カリキュラムはじまるよ",
    description:
      "いよいよ明日からカルチュア・カリキュラムがはじまる・・届いたグッズをどう組み合わせて自分なりにするか考えるのもまた醍醐味♪",
    items: [
      {
        type: TYPES.photo,
        src: images.cultureGoods1,
      },
      {
        type: TYPES.photo,
        src: images.cultureGoods3,
      },
      {
        type: TYPES.photo,
        src: images.cultureGoods4,
      },
    ],
    links: [],
    relatedPosts: ["1877641625301832139", "1879766902886814002"],
  },
  {
    date: "2025/1/14",
    title: "No title BDフラゲ!!",
    description:
      "No titleがついに自宅でも観れるように…望月けい先生のNo titleタペストリーやアクキーもめちゃくちゃ可愛すぎるしまだまだカルチュアに気持ちが向かない笑",
    items: [
      {
        type: TYPES.photo,
        src: images.bdkGoods1,
      },
    ],
    links: [],
    relatedPosts: [],
  },
  {
    date: "2025/1/14",
    title: "ライヴフィルム・No title劇場上映",
    description:
      "あの日みんなでお祝いしたNo title記念日を鮮明に思い出せて、遠くて見えなかったれをる氏の表情が補完されたことでとても豊かな気持ちになった。あまりの迫力に魅入られたし泣き笑いできて最高だったな",
    items: [
      {
        type: TYPES.photo_tate,
        src: images.bdkCinema1,
      },
      {
        type: TYPES.photo,
        src: images.bdkCinema2,
      },
      {
        type: TYPES.photo,
        src: images.bdkCinema3,
      },
      {
        type: TYPES.photo,
        src: images.bdkCinema4,
      },
    ],
    links: [],
    relatedPosts: ["1879062884262781180", "1879053712850829585"],
  },
  {
    date: "2025/12/24",
    title: "ギガンティックO.T.N 2025 Xmas FA",
    description:
      "武道館で念願のO.T.N‼️ができた記念にギガンティックOTNのファンアート動画を制作させていただきました🎁 オリジナルMVをオマージュしつつクリスマス仕立てになってます🤶🎄 今年も最高の音楽をありがとう　ありがとう二〇二四　来年もよろしく✨",
    items: [
      {
        type: TYPES.youtube,
        src: "T3wwIIjD6pM",
      },
    ],
    links: [],
    relatedPosts: [],
  },
  {
    date: "2024/10/27",
    title: "【Cö shu Nie対バン】大阪観光",
    description:
      "大阪は実家があるので最悪なんとかなると思いいつもギリギリまでホテルを取らない癖があり…この日もなんなら始発で帰ればいいと思っていたら優しい一行の宿に泊めてもらいました。朝からおすすめのチョコレート専門店でお茶してたまたま近くにあった有名なカレー屋さんでランチ。大阪を満喫して帰宅しました^^",
    items: [
      {
        type: TYPES.photo_wide,
        src: images.coshunie4,
      },
      {
        type: TYPES.photo_wide,
        src: images.coshunie5,
      },
    ],
    links: [
      {
        title: "チョコレート専門店「エクチュア」",
        url: "https://www.ek-chuah.co.jp/",
      },
      {
        title: "スパイスカレー「旧ヤム邸 空堀店」",
        url: "https://maps.app.goo.gl/pWpXxf8jKRyiKPfQ8?g_st=com.google.maps.preview.copy",
      },
    ],
    relatedPosts: ["1850155775525814464"],
  },
  {
    date: "2024/10/26",
    title: "Cö shu Nie対バン参戦!!",
    description:
      "初のCö shu Nieライヴにワクワク…音楽性だけで言えばReolと結構違うイメージだったけど、生の音を体感したら不思議と親近感を感じました!!Mikuさんのものすごい色気に当てられて全員テンションがおかしくなったところに我らがReol、ばちばちにカッコ良いパフォーマンスでまた違った「大人の女」を魅せてくれて今回もとても良いライヴでした!!",
    items: [
      {
        type: TYPES.photo_tate,
        src: images.coshunie3,
      },
      {
        type: TYPES.photo_tate,
        src: images.coshunie2,
      },
    ],
    links: [],
    relatedPosts: ["1850157358003163617", "1850155775525814464"],
  },
  {
    date: "2024/10/26",
    title: "Cö shu Nie対バンのために大阪へ!!",
    description:
      "夜通し車を走らせて千葉から大阪へ着弾!!お気に入りのカフェ「トリントンティールーム」で最高のモーニング♪",
    items: [
      {
        type: TYPES.photo,
        src: images.coshunie6,
      },
      {
        type: TYPES.photo,
        src: images.coshunie1,
      },
    ],
    links: [
      {
        title: "トリントンティールーム",
        url: "https://www.torrington-tearoom.com/",
      },
    ],
    relatedPosts: [],
  },
  {
    date: "2024/9/20",
    title: "【軌道共鳴2024】大阪粉もん観光",
    description:
      "軌道共鳴翌日は大阪で粉もん観光してました。馴染みのお店でお好み焼きにイカ焼きにたこ焼き…粉に塗れて幸せな１日でした",
    items: [
      {
        type: TYPES.photo,
        src: images.yamaKidou5,
      },
      {
        type: TYPES.photo,
        src: images.yamaKidou4,
      },
      {
        type: TYPES.photo,
        src: images.yamaKidou3,
      },
    ],
    links: [],
    relatedPosts: [],
  },
  {
    date: "2024/9/20",
    title: "【軌道共鳴2024】打ち上げ",
    description:
      "軌道共鳴後はみんなで焼肉♪やグリコやお洒落カフェで夜中まで語り合い楽しい夜を過ごしました^^",
    items: [
      {
        type: TYPES.photo,
        src: images.yamaKidou8,
      },
      {
        type: TYPES.photo,
        src: images.yamaKidou7,
      },
      {
        type: TYPES.photo,
        src: images.yamaKidou2,
      },
    ],
    links: [],
    relatedPosts: ["1837121823319937132", "1837115068410122290"],
  },
  {
    date: "2024/9/20",
    title: "yama対バンツアー『軌道共鳴2024』",
    description:
      "(全然会場の写真なくて何故かドリンクチケットの写真だけww) 武道館以来のライヴ!!れをる氏が秘色録なビジュになって登場!!定番曲からカバー曲まで聴けて大満足なライヴでした!!",
    items: [
      {
        type: TYPES.photo_tate,
        src: images.yamaKidou1,
      },
    ],
    links: [],
    relatedPosts: [
      "1837126824629051666",
      "1837121823319937132",
      "1837115068410122290",
    ],
  },
  {
    date: "2024/8/18",
    title: "No title after party #Reolあふぱ",
    description:
      "No title武道館の翌日は「No title after party」(あふぱ)を幹事の一人として参加させていただきました。暑い中、各地から集まったReolリスナーのみんなで集まりワイワイ語り合い、古参も新参も年齢も性別も関係なくReolを通して交流できる場になりました。総勢120名という規模は想定を遥かに超えていたため、不手際もありましたがみなさんに楽しんでいただいて本当に良かったです!!",
    items: [
      {
        type: TYPES.photo,
        src: images.bdkAfterParty1,
      },
      {
        type: TYPES.photo,
        src: images.bdkAfterParty2,
      },
      {
        type: TYPES.photo,
        src: images.bdkAfterParty3,
      },
    ],
    links: [],
    relatedPosts: [
      "1824794898236846300",
      "1825105781458690385",
      "1825107030266581317",
      "1825106224989532630",
      "1830525688111100196",
      "1824813187902140808",
      "1825478580245344632",
    ],
  },
  {
    date: "2024/8/17",
    title: "Reol Oneman Live「No title」 フラスタ",
    description: "",
    items: [
      {
        type: TYPES.photo_tate,
        src: images.bdk2,
      },
    ],
    links: [],
    relatedPosts: [],
  },
  {
    date: "2024/8/17",
    title: "Reol Oneman Live「No title」",
    description: "",
    items: [
      {
        type: TYPES.photo_wide,
        src: images.bdk1,
      },
      {
        type: TYPES.photo_wide,
        src: images.bdk3,
      },
      {
        type: TYPES.photo_wide,
        src: images.bdk4,
      },
    ],
    links: [],
    relatedPosts: ["1824326102271267092"],
  },
  {
    date: "2024/6/22",
    title: "ﾌﾚﾃﾞﾘｯｸ対ﾊﾞﾝ「UMIMOYASU2024 -WAVE-」",
    description: "",
    items: [
      {
        type: TYPES.photo,
        src: images.frederic1,
      },
      {
        type: TYPES.photo,
        src: images.frederic2,
      },
      {
        type: TYPES.photo,
        src: images.frederic3,
      },
      {
        type: TYPES.photo,
        src: images.frederic4,
      },
    ],
    links: [],
    relatedPosts: [],
  },
  {
    date: "2024/6/18",
    title: "UNBOXリリース記念ﾌｫﾄﾊﾟﾈﾙ&衣装展示",
    description: "",
    items: [
      {
        type: TYPES.photo_tate,
        src: images.releaseUnbox1,
      },
      {
        type: TYPES.photo_tate,
        src: images.releaseUnbox2,
      },
      {
        type: TYPES.photo_tate,
        src: images.releaseUnbox3,
      },
      {
        type: TYPES.photo,
        src: images.releaseUnbox4,
      },
      {
        type: TYPES.photo_tate,
        src: images.releaseUnbox5,
      },
      {
        type: TYPES.photo_tate,
        src: images.releaseUnbox6,
      },
      {
        type: TYPES.photo_tate,
        src: images.releaseUnbox7,
      },
      {
        type: TYPES.photo_tate,
        src: images.releaseUnbox8,
      },
      {
        type: TYPES.photo_tate,
        src: images.releaseUnbox9,
      },
      {
        type: TYPES.photo_tate,
        src: images.releaseUnbox10,
      },
    ],
    links: [],
    relatedPosts: [],
  },
  {
    date: "2024/5/3",
    title: "BBQオフ会",
    description: "",
    items: [
      {
        type: TYPES.photo,
        src: images.bbq241,
      },
      {
        type: TYPES.photo,
        src: images.bbq242,
      },
    ],
    links: [],
    relatedPosts: [],
  },
  {
    date: "2024/4/27",
    title: "超音楽祭 in ニコニコ超会議2024",
    description: "",
    items: [
      {
        type: TYPES.photo_tate,
        src: images.nico241,
      },
      {
        type: TYPES.photo,
        src: images.nico242,
      },
      {
        type: TYPES.photo,
        src: images.nico243,
      },
      {
        type: TYPES.photo,
        src: images.nico244,
      },
      {
        type: TYPES.photo,
        src: images.nico245,
      },
    ],
    links: [],
    relatedPosts: [],
  },
  {
    date: "2024/4/17",
    title: 'Reol Secret Live "極秘LEGIT"＠東京',
    description: "",
    items: [
      {
        type: TYPES.photo,
        src: images.secretLegit2024Tokyo1,
      },
      {
        type: TYPES.photo,
        src: images.secretLegit2024Tokyo2,
      },
      {
        type: TYPES.photo,
        src: images.secretLegit2024Tokyo3,
      },
    ],
    links: [],
    relatedPosts: [],
  },
  {
    date: "2024/4/6",
    title: 'Reol Secret Live "極秘LEGIT"＠大阪',
    description: "",
    items: [
      {
        type: TYPES.photo,
        src: images.secretLegit2024Osaka1,
      },
      {
        type: TYPES.photo,
        src: images.secretLegit2024Osaka2,
      },
      {
        type: TYPES.photo,
        src: images.secretLegit2024Osaka3,
      },
    ],
    links: [],
    relatedPosts: [],
  },
  {
    date: "2024/4/6",
    title: "いざ極秘LEGIT大阪へ♪",
    description: "",
    items: [
      {
        type: TYPES.photo_tate,
        src: images.secretLegit2024OsakaBefore1,
      },
      {
        type: TYPES.photo_tate,
        src: images.secretLegit2024OsakaBefore2,
      },
      {
        type: TYPES.photo_tate,
        src: images.secretLegit2024OsakaBefore3,
      },
    ],
    links: [],
    relatedPosts: [],
  },
  {
    date: "2024/3/21",
    title: "金沢観光 2日目",
    description:
      "金沢の2日目は金沢城周辺で観光♪ 散歩日和で梅も綺麗、美味しいご飯を食べて全国行脚はいよいよ終了しました（帰り道はUNBOXロス…）",
    items: [
      {
        type: TYPES.photo_tate,
        src: images.unboxIshikawaSecond1,
      },
      {
        type: TYPES.photo_tate,
        src: images.unboxIshikawaSecond2,
      },
      {
        type: TYPES.photo_tate,
        src: images.unboxIshikawaSecond3,
      },
      {
        type: TYPES.photo_tate,
        src: images.unboxIshikawaSecond4,
      },
    ],
    links: [
      {
        title: "金澤神社",
        url: "https://maps.app.goo.gl/Ho39KHHkg6uXRXdj6?g_st=com.google.maps.preview.copy",
      },
      {
        title: "和風洋食 さか井",
        url: "https://maps.app.goo.gl/W6LShZj2CoD5sALz6?g_st=com.google.maps.preview.copy",
      },
    ],
    relatedPosts: [],
  },
  {
    date: "2024/3/21",
    title: "金沢打ち上げ",
    description:
      "東京から新潟、そして金沢へと大移動して千秋楽ライブで完全に出し尽くした一同。打ち上げ会場まで考えてなかったので近くの居酒屋へ。ふらっと入ったのにとても良いお店で、店員さんに元気・親切で金沢を盛り上げようという活気を感じました。Reolのライブを見に来たと言えば3曲も店内BGMで流してくれて嬉しい限り♪たのしい打ち上げでした。二次会は地方特有の夜パフェを堪能しました^^",
    items: [
      {
        type: TYPES.photo_wide,
        src: images.unboxIshikawaAfter1,
      },
      {
        type: TYPES.photo_wide,
        src: images.unboxIshikawaAfter2,
      },
      {
        type: TYPES.photo_wide,
        src: images.unboxIshikawaAfter3,
      },
      {
        type: TYPES.photo_wide,
        src: images.unboxIshikawaAfter4,
      },
    ],
    links: [
      {
        title: "金沢炉端 あっぱれ-片町本店-",
        url: "https://maps.app.goo.gl/12pntJZxjQN4bcKz9?g_st=com.google.maps.preview.copy",
      },
      {
        title: "SWEETS BAR Jam's",
        url: "https://maps.app.goo.gl/1triDzpid8vY9NVf6?g_st=com.google.maps.preview.copy",
      },
    ],
    relatedPosts: [],
  },
  {
    date: "2024/3/20",
    title: "UNBOX pure 石川 ②",
    description:
      "アンコールも終わり、俺たちのUNBOXはついに終わった…と達成感や虚無感に浸ろうとしていたら、ステージ奥にニコニコ動画のコメント風の映像が投影され「おつかれ」のコメントが!! ニコ厨だった人もそうでない人にもワッと湧くようなサプライズ演出でした。長期にわたって尽力してくれたチームReolの方々や金沢まで追いかけてきたリスナーたちへの労いの言葉のように感じました。",
    items: [
      {
        type: TYPES.youtube,
        src: "YTo4HsX-5sw",
      },
    ],
    links: [],
    relatedPosts: [],
  },
  {
    date: "2024/3/20",
    title: "UNBOX pure 石川 ①",
    description:
      "17公演の最後を飾るに相応しい、本当にすごいライブでした。アンコールでは昨夜解禁の「感情御中」を披露し、撮影可能曲「un, deux, trois」で誰しもがReolの哲学に抱かれた後、Reolからリスナーへ「劣等上等」か「(もう一回)感情御中」どっちが良い？と問いかけ。そんなの答えられるわけがない…!!笑 両方聴きたいに決まってる〜！と思っていたら、「劣等上等」に決まり最高の千秋楽だった〜!!と心の中で締めくくりの準備をしていたら…まさかの「感情御中」も披露!!今日初めて乗る曲なのにみんなニッコニコでしっかり手拍子♪これでもかというほどReolの魅力を見せつけられました",
    items: [
      {
        type: TYPES.youtube_tate,
        src: "SPOLS6iZep4",
      },
    ],
    links: [],
    relatedPosts: [],
  },
  {
    date: "2024/3/21",
    title: "金沢エイトホール到着!!!",
    description:
      "会場に着くと全国から集まったReolリスナーたちが所狭しとワイワイしてる。千秋楽の独特の雰囲気が大好き。みんな後悔がないように全力で楽しむ準備ができている。昨夜解禁された感情御中は聴けるんだろうか？今日のセトリは？楽しみなことばっかり^^",
    items: [
      {
        type: TYPES.photo_wide,
        src: images.unboxIshikawa1,
      },
    ],
    links: [
      {
        title: "金沢エイトホール",
        url: "https://maps.app.goo.gl/TJTB7A4Vjoq5tJxg9?g_st=com.google.maps.preview.copy",
      },
    ],
    relatedPosts: [],
  },
  {
    date: "2024/3/20",
    title: "金沢着弾!!",
    description:
      "いよいよUNBOX pure最終日!!もう終わるなんて信じられない…と思いつつ早速金沢観光で「白山比咩神社」へ白箱千秋楽の成功祈願。お昼は近くの「りんどう」という和食店で心豊かになる焼き魚の定食をいただきました。店主のご夫婦がとても良い雰囲気だったんだけど、生きた魚を目の前で串打ちする姿にリアルを感じ…ふと窓に目を向けると巨大なスピーカーが…良いご趣味の予感がしました",
    items: [
      {
        type: TYPES.photo_wide,
        src: images.unboxIshikawaBefore1,
      },
      {
        type: TYPES.photo_wide,
        src: images.unboxIshikawaBefore2,
      },
      {
        type: TYPES.photo_wide,
        src: images.unboxIshikawaBefore3,
      },
      {
        type: TYPES.photo_wide,
        src: images.unboxIshikawaBefore4,
      },
      {
        type: TYPES.photo_wide,
        src: images.unboxIshikawaBefore5,
      },
      {
        type: TYPES.photo_wide,
        src: images.unboxIshikawaBefore6,
      },
    ],
    links: [
      {
        title: "白山比咩神社",
        url: "https://www.shirayama.or.jp/",
      },
      {
        title: "りんどう",
        url: "https://maps.app.goo.gl/Wm5ixpLDXRZeTZc9A?g_st=com.google.maps.preview.copy",
      },
    ],
    relatedPosts: [],
  },
  {
    date: "2024/3/20",
    title: "UNBOX pure 新潟",
    description: "",
    items: [
      {
        type: TYPES.youtube_tate,
        src: "fVnZ772_ZSw",
      },
      {
        type: TYPES.photo_wide,
        src: images.unboxNiigata1,
      },
      {
        type: TYPES.photo_wide,
        src: images.unboxNiigata2,
      },
    ],
    links: [
      {
        title: "新潟LOTS",
        url: "https://maps.app.goo.gl/RZ6w2zUv5nUjw6b69?g_st=com.google.maps.preview.copy",
      },
    ],
    relatedPosts: [],
  },
  {
    date: "2024/3/20",
    title: "UNBOX pure 新潟",
    description: "",
    items: [
      {
        type: TYPES.photo_tate,
        src: images.unboxNiigataBefore1,
      },
      {
        type: TYPES.photo_wide,
        src: images.unboxNiigataBefore2,
      },
    ],
    links: [],
    relatedPosts: [],
  },
  {
    date: "2024/2/18",
    title: "UNBOX black 神奈川",
    description: "",
    items: [
      {
        type: TYPES.photo_wide,
        src: images.unboxKanagawa4,
      },
      {
        type: TYPES.photo_wide,
        src: images.unboxKanagawa1,
      },
      {
        type: TYPES.photo_wide,
        src: images.unboxKanagawa2,
      },
      {
        type: TYPES.photo_wide,
        src: images.unboxKanagawa3,
      },
    ],
    links: [],
    relatedPosts: [],
  },
  {
    date: "2024/2/11",
    title: "北海道3日目観光",
    description: "",
    items: [
      {
        type: TYPES.photo,
        src: images.unboxSapporo3th1,
      },
      {
        type: TYPES.photo,
        src: images.unboxSapporo3th2,
      },
      {
        type: TYPES.photo,
        src: images.unboxSapporo3th3,
      },
      {
        type: TYPES.photo,
        src: images.unboxSapporo3th4,
      },
      {
        type: TYPES.photo,
        src: images.unboxSapporo3th5,
      },
      {
        type: TYPES.photo,
        src: images.unboxSapporo3th6,
      },
    ],
    links: [],
    relatedPosts: [],
  },
  {
    date: "2024/2/10",
    title: "UNBOX pure 北海道",
    description: "",
    items: [
      {
        type: TYPES.youtube_tate,
        src: "ng51_dTzmks",
      },
      {
        type: TYPES.youtube_tate,
        src: "p7iJwyI4oMI",
      },
      {
        type: TYPES.photo_tate,
        src: images.unboxSapporo1,
      },
      {
        type: TYPES.photo_tate,
        src: images.unboxSapporo2,
      },
      {
        type: TYPES.photo_tate,
        src: images.unboxSapporo3,
      },
      {
        type: TYPES.photo_tate,
        src: images.unboxSapporo4,
      },
      {
        type: TYPES.photo_tate,
        src: images.unboxSapporo5,
      },
      {
        type: TYPES.photo_tate,
        src: images.unboxSapporo6,
      },
      {
        type: TYPES.photo_tate,
        src: images.unboxSapporo7,
      },
      {
        type: TYPES.photo_tate,
        src: images.unboxSapporo8,
      },
    ],
    links: [],
    relatedPosts: [],
  },
  {
    date: "2024/2/10",
    title: "北海道2日目観光",
    description: "",
    items: [
      {
        type: TYPES.photo_wide,
        src: images.unboxSapporo2nd1,
      },
      {
        type: TYPES.photo_wide,
        src: images.unboxSapporo2nd2,
      },
      {
        type: TYPES.photo_wide,
        src: images.unboxSapporo2nd3,
      },
    ],
    links: [],
    relatedPosts: [],
  },
  {
    date: "2024/2/9",
    title: "北海道1日目観光",
    description: "",
    items: [
      {
        type: TYPES.photo_tate,
        src: images.unboxSapporo1st1,
      },
      {
        type: TYPES.photo_tate,
        src: images.unboxSapporo1st2,
      },
      {
        type: TYPES.photo_tate,
        src: images.unboxSapporo1st3,
      },
    ],
    links: [],
    relatedPosts: [],
  },
  {
    date: "2024/2/5",
    title: "盛岡観光 2日目",
    description: "",
    items: [
      {
        type: TYPES.photo,
        src: images.unboxIwate2nd1,
      },
      {
        type: TYPES.photo,
        src: images.unboxIwate2nd2,
      },
      {
        type: TYPES.photo,
        src: images.unboxIwate2nd3,
      },
      {
        type: TYPES.photo,
        src: images.unboxIwate2nd4,
      },
      {
        type: TYPES.photo,
        src: images.unboxIwate2nd5,
      },
    ],
    links: [],
    relatedPosts: [],
  },
  {
    date: "2024/2/4",
    title: "盛岡観光 1日目夜",
    description: "",
    items: [
      {
        type: TYPES.photo,
        src: images.unboxIwateAfter1,
      },
      {
        type: TYPES.photo,
        src: images.unboxIwateAfter2,
      },
      {
        type: TYPES.photo,
        src: images.unboxIwateAfter3,
      },
      {
        type: TYPES.photo,
        src: images.unboxIwateAfter4,
      },
    ],
    links: [],
    relatedPosts: [],
  },
  {
    date: "2024/2/4",
    title: "UNBOX pure 岩手",
    description: "",
    items: [
      {
        type: TYPES.photo,
        src: images.unboxIwate1,
      },
      {
        type: TYPES.youtube,
        src: "kdnbvPvUYEA",
      },
      {
        type: TYPES.photo,
        src: images.unboxIwate2,
      },
    ],
    links: [],
    relatedPosts: [],
  },
  {
    date: "2024/2/4",
    title: "盛岡観光 1日目",
    description: "",
    items: [
      {
        type: TYPES.photo,
        src: images.unboxIwate1st1,
      },
      {
        type: TYPES.photo,
        src: images.unboxIwate1st2,
      },
      {
        type: TYPES.photo,
        src: images.unboxIwate1st3,
      },
      {
        type: TYPES.photo,
        src: images.unboxIwate1st4,
      },
    ],
    links: [],
    relatedPosts: [],
  },
  {
    date: "2024/2/3",
    title: "UNBOX black 宮城",
    description: "",
    items: [
      {
        type: TYPES.photo,
        src: images.unboxSendai1,
      },
      {
        type: TYPES.photo,
        src: images.unboxSendai2,
      },
    ],
    links: [],
    relatedPosts: [],
  },
  {
    date: "2024/2/3",
    title: "仙台観光",
    description: "",
    items: [
      {
        type: TYPES.photo,
        src: images.unboxSendaiKankou1,
      },
      {
        type: TYPES.photo,
        src: images.unboxSendaiKankou2,
      },
      {
        type: TYPES.photo,
        src: images.unboxSendaiKankou3,
      },
      {
        type: TYPES.photo,
        src: images.unboxSendaiKankou4,
      },
      {
        type: TYPES.photo,
        src: images.unboxSendaiKankou5,
      },
      {
        type: TYPES.photo,
        src: images.unboxSendaiKankou6,
      },
    ],
    links: [],
    relatedPosts: [],
  },
  {
    date: "2024/1/28",
    title: "UNBOX pure 岡山",
    description: "",
    items: [
      {
        type: TYPES.youtube_tate,
        src: "fOpE2Ojs_2U",
      },
      {
        type: TYPES.youtube_tate,
        src: "c44ZKriWRXc",
      },
      {
        type: TYPES.photo,
        src: images.unboxOkayama1,
      },
      {
        type: TYPES.photo,
        src: images.unboxOkayama2,
      },
      {
        type: TYPES.photo,
        src: images.unboxOkayama3,
      },
      {
        type: TYPES.photo,
        src: images.unboxOkayama4,
      },
    ],
    links: [],
    relatedPosts: [],
  },
  {
    date: "2024/1/27",
    title: "広島飲み会",
    description: "",
    items: [
      {
        type: TYPES.photo,
        src: images.unboxHiroshimaAfter1,
      },
      {
        type: TYPES.photo,
        src: images.unboxHiroshimaAfter2,
      },
      {
        type: TYPES.photo,
        src: images.unboxHiroshimaAfter3,
      },
    ],
    links: [],
    relatedPosts: [],
  },
  {
    date: "2024/1/27",
    title: "UNBOX pure 広島",
    description: "",
    items: [
      {
        type: TYPES.youtube_tate,
        src: "y4esXHURGMY",
      },
      {
        type: TYPES.youtube_tate,
        src: "nyHItnmDXMM",
      },
      {
        type: TYPES.photo,
        src: images.unboxOkayama1,
      },
      {
        type: TYPES.photo,
        src: images.unboxOkayama2,
      },
      {
        type: TYPES.photo,
        src: images.unboxOkayama3,
      },
      {
        type: TYPES.photo,
        src: images.unboxOkayama4,
      },
    ],
    links: [],
    relatedPosts: [],
  },
  {
    date: "2024/1/27",
    title: "広島ランチ会",
    description: "",
    items: [
      {
        type: TYPES.photo,
        src: images.unboxHiroshimaLunch1,
      },
      {
        type: TYPES.photo,
        src: images.unboxHiroshimaLunch2,
      },
    ],
    links: [],
    relatedPosts: [],
  },
  {
    date: "2023/12/25",
    title: "UNBOX black 東京",
    description: "",
    items: [
      {
        type: TYPES.photo,
        src: images.unboxTokyo1,
      },
      {
        type: TYPES.photo,
        src: images.unboxTokyo2,
      },
      {
        type: TYPES.photo,
        src: images.unboxTokyo3,
      },
      {
        type: TYPES.photo,
        src: images.unboxTokyo4,
      },
      {
        type: TYPES.photo,
        src: images.unboxTokyo5,
      },
    ],
    links: [],
    relatedPosts: [],
  },
  {
    date: "2023/12/24",
    title: "UNBOX black 名古屋",
    description: "",
    items: [
      {
        type: TYPES.photo,
        src: images.unboxNagoya1,
      },
      {
        type: TYPES.photo,
        src: images.unboxNagoya2,
      },
    ],
    links: [],
    relatedPosts: [],
  },
  {
    date: "2023/12/24",
    title: "名古屋観光",
    description: "",
    items: [
      {
        type: TYPES.photo,
        src: images.unboxNagoyaBefore1,
      },
      {
        type: TYPES.photo,
        src: images.unboxNagoyaBefore2,
      },
      {
        type: TYPES.photo,
        src: images.unboxNagoyaBefore3,
      },
    ],
    links: [],
    relatedPosts: [],
  },
  {
    date: "2023/12/18",
    title: "香川観光 2日目",
    description: "",
    items: [
      {
        type: TYPES.photo,
        src: images.unboxKagawa2nd1,
      },
      {
        type: TYPES.photo,
        src: images.unboxKagawa2nd2,
      },
      {
        type: TYPES.photo,
        src: images.unboxKagawa2nd3,
      },
      {
        type: TYPES.photo,
        src: images.unboxKagawa2nd4,
      },
      {
        type: TYPES.photo,
        src: images.unboxKagawa2nd5,
      },
    ],
    links: [],
    relatedPosts: [],
  },
  {
    date: "2023/12/17",
    title: "香川打ち上げ",
    description: "",
    items: [
      {
        type: TYPES.photo,
        src: images.unboxKagawaAfter1,
      },
      {
        type: TYPES.photo,
        src: images.unboxKagawaAfter2,
      },
    ],
    links: [],
    relatedPosts: [],
  },
  {
    date: "2023/12/17",
    title: "UNBOX pure 香川",
    description: "",
    items: [
      {
        type: TYPES.youtube_tate,
        src: "QjrDw5tpd8M",
      },
      {
        type: TYPES.youtube_tate,
        src: "wA2QV7oIE1s",
      },
      {
        type: TYPES.photo,
        src: images.unboxKagawa1,
      },
      {
        type: TYPES.photo,
        src: images.unboxKagawa2,
      },
      {
        type: TYPES.photo,
        src: images.unboxKagawa3,
      },
      {
        type: TYPES.photo,
        src: images.unboxKagawa4,
      },
      {
        type: TYPES.photo,
        src: images.unboxKagawa5,
      },
    ],
    links: [],
    relatedPosts: [],
  },
  {
    date: "2023/12/17",
    title: "松山 → 高松移動",
    description: "",
    items: [
      {
        type: TYPES.photo,
        src: images.unboxKagawaBefore1,
      },
    ],
    links: [],
    relatedPosts: [],
  },
  {
    date: "2023/12/17",
    title: "松山観光",
    description: "",
    items: [
      {
        type: TYPES.photo,
        src: images.unboxEhime2nd1,
      },
      {
        type: TYPES.photo,
        src: images.unboxEhime2nd2,
      },
      {
        type: TYPES.photo,
        src: images.unboxEhime2nd3,
      },
    ],
    links: [],
    relatedPosts: [],
  },
  {
    date: "2023/12/17",
    title: "松山打ち上げ",
    description: "",
    items: [
      {
        type: TYPES.photo,
        src: images.unboxEhimeAfter1,
      },
      {
        type: TYPES.photo,
        src: images.unboxEhimeAfter2,
      },
    ],
    links: [],
    relatedPosts: [],
  },
  {
    date: "2023/12/16",
    title: "UNBOX pure 愛媛",
    description: "",
    items: [
      {
        type: TYPES.photo_tate,
        src: images.unboxEhime1,
      },
      {
        type: TYPES.youtube_tate,
        src: "SL2q7tSSnoc",
      },
      {
        type: TYPES.youtube_tate,
        src: "Sw0cU0mqy_k",
      },
      {
        type: TYPES.youtube_tate,
        src: "Dr5vsdoJ0hg",
      },
      {
        type: TYPES.photo_tate,
        src: images.unboxEhime2,
      },
    ],
    links: [],
    relatedPosts: [],
  },
  {
    date: "2023/12/16",
    title: "松山観光 1日目",
    description: "",
    items: [
      {
        type: TYPES.photo,
        src: images.unboxEhimeBefore1,
      },
      {
        type: TYPES.photo,
        src: images.unboxEhimeBefore2,
      },
      {
        type: TYPES.photo,
        src: images.unboxEhimeBefore3,
      },
    ],
    links: [],
    relatedPosts: [],
  },
  {
    date: "2023/12/10",
    title: "UNBOX pure 神戸",
    description: "",
    items: [
      {
        type: TYPES.youtube_tate,
        src: "jYZeAWlhjuA",
      },
      {
        type: TYPES.youtube_tate,
        src: "ot9MxJPdtN0",
      },
      {
        type: TYPES.photo,
        src: images.unboxKoube1,
      },
      {
        type: TYPES.photo,
        src: images.unboxKoube2,
      },
      {
        type: TYPES.photo,
        src: images.unboxKoube3,
      },
    ],
    links: [],
    relatedPosts: [],
  },
  {
    date: "2023/12/10",
    title: "神戸観光",
    description: "",
    items: [
      {
        type: TYPES.photo,
        src: images.unboxKoubeBefore1,
      },
      {
        type: TYPES.photo,
        src: images.unboxKoubeBefore2,
      },
      {
        type: TYPES.photo,
        src: images.unboxKoubeBefore3,
      },
      {
        type: TYPES.photo,
        src: images.unboxKoubeBefore4,
      },
      {
        type: TYPES.photo,
        src: images.unboxKoubeBefore5,
      },
      {
        type: TYPES.photo,
        src: images.unboxKoubeBefore6,
      },
      {
        type: TYPES.photo,
        src: images.unboxKoubeBefore7,
      },
      {
        type: TYPES.photo,
        src: images.unboxKoubeBefore8,
      },
      {
        type: TYPES.photo,
        src: images.unboxKoubeBefore9,
      },
    ],
    links: [],
    relatedPosts: [],
  },
  {
    date: "2023/12/09",
    title: "UNBOX pure 静岡 (唯一参加できず)",
    description: "",
    items: [
      {
        type: TYPES.youtube_tate,
        src: "R8hLR6-iNBM",
      },
    ],
    links: [],
    relatedPosts: [],
  },
  {
    date: "2023/12/03",
    title: "大分観光",
    description: "",
    items: [
      {
        type: TYPES.photo,
        src: images.unboxOita2nd3,
      },
      {
        type: TYPES.photo,
        src: images.unboxOita2nd2,
      },
      {
        type: TYPES.photo,
        src: images.unboxOita2nd1,
      },
    ],
    links: [],
    relatedPosts: [],
  },
  {
    date: "2023/12/02",
    title: "UNBOX pure 大分",
    description: "",
    items: [
      {
        type: TYPES.youtube,
        src: "aPjHg04siok",
      },
      {
        type: TYPES.youtube_tate,
        src: "ZFJoN0osyx0",
      },
      {
        type: TYPES.photo,
        src: images.unboxOita1,
      },
      {
        type: TYPES.photo,
        src: images.unboxOita2,
      },
      {
        type: TYPES.photo,
        src: images.unboxOita3,
      },
    ],
    links: [],
    relatedPosts: [],
  },
  {
    date: "2023/12/02",
    title: "UNBOX pure 大分",
    description: "",
    items: [
      {
        type: TYPES.photo,
        src: images.unboxOitaBefore1,
      },
      {
        type: TYPES.photo,
        src: images.unboxOitaBefore2,
      },
      {
        type: TYPES.photo,
        src: images.unboxOitaBefore3,
      },
      {
        type: TYPES.photo,
        src: images.unboxOitaBefore4,
      },
      {
        type: TYPES.photo,
        src: images.unboxOitaBefore5,
      },
    ],
    links: [],
    relatedPosts: [],
  },
  {
    date: "2023/12/02",
    title: "大分移動~湯布院経由",
    description: "",
    items: [
      {
        type: TYPES.photo,
        src: images.unboxOitaTrans1,
      },
      {
        type: TYPES.photo,
        src: images.unboxOitaTrans2,
      },
      {
        type: TYPES.photo,
        src: images.unboxOitaTrans3,
      },
      {
        type: TYPES.photo,
        src: images.unboxOitaTrans4,
      },
      {
        type: TYPES.photo,
        src: images.unboxOitaTrans5,
      },
      {
        type: TYPES.photo,
        src: images.unboxOitaTrans6,
      },
      {
        type: TYPES.photo,
        src: images.unboxOitaTrans7,
      },
      {
        type: TYPES.photo,
        src: images.unboxOitaTrans8,
      },
      {
        type: TYPES.photo,
        src: images.unboxOitaTrans9,
      },
      {
        type: TYPES.photo,
        src: images.unboxOitaTrans10,
      },
    ],
    links: [],
    relatedPosts: [],
  },
  {
    date: "2023/12/01",
    title: "UNBOX black 福岡",
    description: "",
    items: [
      {
        type: TYPES.photo,
        src: images.unboxFukuoka1,
      },
      {
        type: TYPES.photo,
        src: images.unboxFukuoka2,
      },
      {
        type: TYPES.photo,
        src: images.unboxFukuoka3,
      },
    ],
    links: [],
    relatedPosts: [],
  },
  {
    date: "2023/11/18",
    title: "UNBOX black 大阪",
    description: "",
    items: [
      {
        type: TYPES.photo,
        src: images.unboxOsaka1,
      },
      {
        type: TYPES.photo,
        src: images.unboxOsaka2,
      },
      {
        type: TYPES.photo,
        src: images.unboxOsaka3,
      },
      {
        type: TYPES.photo,
        src: images.unboxOsaka4,
      },
    ],
    links: [],
    relatedPosts: [],
  },
  {
    date: "2023/11/18",
    title: "大阪到着!!",
    description: "",
    items: [
      {
        type: TYPES.photo,
        src: images.unboxOsakaBefore1,
      },
      {
        type: TYPES.photo,
        src: images.unboxOsakaBefore2,
      },
    ],
    links: [],
    relatedPosts: [],
  },
  {
    date: "2023/09/10",
    title: "新潟観光",
    description: "",
    items: [
      {
        type: TYPES.photo,
        src: images.mirrorball2nd1,
      },
      {
        type: TYPES.photo,
        src: images.mirrorball2nd2,
      },
      {
        type: TYPES.photo,
        src: images.mirrorball2nd3,
      },
      {
        type: TYPES.photo,
        src: images.mirrorball2nd4,
      },
      {
        type: TYPES.photo,
        src: images.mirrorball2nd5,
      },
      {
        type: TYPES.photo,
        src: images.mirrorball2nd6,
      },
      {
        type: TYPES.photo,
        src: images.mirrorball2nd7,
      },
    ],
    links: [],
    relatedPosts: [],
  },
  {
    date: "2023/09/10",
    title: "MIRRORBALL PARADE Vol.3",
    description: "",
    items: [
      {
        type: TYPES.photo,
        src: images.mirrorball1,
      },
      {
        type: TYPES.photo,
        src: images.mirrorball2,
      },
      {
        type: TYPES.photo,
        src: images.mirrorball3,
      },
      {
        type: TYPES.photo,
        src: images.mirrorball4,
      },
    ],
    links: [],
    relatedPosts: [],
  },
  {
    date: "2023/09/10",
    title: "新潟観光（ライブ前）",
    description: "",
    items: [
      {
        type: TYPES.photo,
        src: images.mirrorballBefore1,
      },
      {
        type: TYPES.photo,
        src: images.mirrorballBefore2,
      },
      {
        type: TYPES.photo,
        src: images.mirrorballBefore3,
      },
      {
        type: TYPES.photo,
        src: images.mirrorballBefore4,
      },
      {
        type: TYPES.photo,
        src: images.mirrorballBefore5,
      },
      {
        type: TYPES.photo,
        src: images.mirrorballBefore6,
      },
      {
        type: TYPES.photo,
        src: images.mirrorballBefore7,
      },
      {
        type: TYPES.photo,
        src: images.mirrorballBefore8,
      },
      {
        type: TYPES.photo,
        src: images.mirrorballBefore9,
      },
    ],
    links: [],
    relatedPosts: [],
  },
  {
    date: "2023/09/09",
    title: "松本観光",
    description: "",
    items: [
      {
        type: TYPES.photo,
        src: images.mirrorballMatsumoto1,
      },
      {
        type: TYPES.photo,
        src: images.mirrorballMatsumoto2,
      },
      {
        type: TYPES.photo,
        src: images.mirrorballMatsumoto3,
      },
      {
        type: TYPES.photo,
        src: images.mirrorballMatsumoto4,
      },
      {
        type: TYPES.photo,
        src: images.mirrorballMatsumoto5,
      },
      {
        type: TYPES.photo,
        src: images.mirrorballMatsumoto6,
      },
      {
        type: TYPES.photo,
        src: images.mirrorballMatsumoto7,
      },
      {
        type: TYPES.photo,
        src: images.mirrorballMatsumoto8,
      },
      {
        type: TYPES.photo,
        src: images.mirrorballMatsumoto9,
      },
    ],
    links: [],
    relatedPosts: [],
  },
  {
    date: "2023/07/22",
    title: "ジャイガ 2023",
    description:
      "この日も暑すぎて熱中症になりそうだったけどなんとか乗り切った!! サマーホラーパーティが聴けてもう思い残すことはないと思えるくらい楽しかった^^",
    items: [
      {
        type: TYPES.photo,
        src: images.giga20231,
      },
      {
        type: TYPES.photo,
        src: images.giga20232,
      },
    ],
    links: [],
    relatedPosts: [],
  },
  {
    date: "2023/07/16",
    title: "ラッキーフェス 2023",
    description: "",
    items: [
      {
        type: TYPES.photo,
        src: images.luckyfes20231,
      },
      {
        type: TYPES.youtube_tate,
        src: "LvA5d5lwQ3c",
      },
      {
        type: TYPES.youtube_tate,
        src: "oGQ4DGfwKwI",
      },
      {
        type: TYPES.photo,
        src: images.luckyfes20233,
      },
      {
        type: TYPES.photo,
        src: images.luckyfes20234,
      },
      {
        type: TYPES.photo,
        src: images.luckyfes20235,
      },
    ],
    links: [],
    relatedPosts: [],
  },
  {
    date: "2023/05/14",
    title: "Osaka Metrock 2023",
    description: "",
    items: [
      {
        type: TYPES.photo,
        src: images.metrock20231,
      },
      {
        type: TYPES.photo,
        src: images.metrock20232,
      },
      {
        type: TYPES.photo,
        src: images.metrock20233,
      },
      {
        type: TYPES.photo,
        src: images.metrock20234,
      },
    ],
    links: [],
    relatedPosts: [],
  },
  {
    date: "2023/05/13",
    title: "さよなら中野サンプラザ音楽祭",
    description: "",
    items: [
      {
        type: TYPES.photo,
        src: images.sayonarana1,
      },
      {
        type: TYPES.photo,
        src: images.sayonarana2,
      },
    ],
    links: [],
    relatedPosts: [],
  },
  {
    date: "2023/03/05",
    title: "新式浪漫 Neo Nostalgia 松本凱旋公演",
    description: "",
    items: [
      {
        type: TYPES.photo,
        src: images.neoNostalgiaMatsumoto1,
      },
      {
        type: TYPES.photo,
        src: images.neoNostalgiaMatsumoto2,
      },
      {
        type: TYPES.photo,
        src: images.neoNostalgiaMatsumoto3,
      },
      {
        type: TYPES.photo,
        src: images.neoNostalgiaMatsumoto4,
      },
      {
        type: TYPES.photo,
        src: images.neoNostalgiaMatsumoto5,
      },
      {
        type: TYPES.photo,
        src: images.neoNostalgiaMatsumoto6,
      },
      {
        type: TYPES.photo,
        src: images.neoNostalgiaMatsumoto7,
      },
      {
        type: TYPES.photo,
        src: images.neoNostalgiaMatsumoto8,
      },
      {
        type: TYPES.photo,
        src: images.neoNostalgiaMatsumoto9,
      },
      {
        type: TYPES.photo,
        src: images.neoNostalgiaMatsumoto10,
      },
      {
        type: TYPES.photo,
        src: images.neoNostalgiaMatsumoto11,
      },
      {
        type: TYPES.photo,
        src: images.neoNostalgiaMatsumoto12,
      },
      {
        type: TYPES.photo,
        src: images.neoNostalgiaMatsumoto13,
      },
      {
        type: TYPES.photo,
        src: images.neoNostalgiaMatsumoto14,
      },
      {
        type: TYPES.photo,
        src: images.neoNostalgiaMatsumoto15,
      },
      {
        type: TYPES.photo,
        src: images.neoNostalgiaMatsumoto16,
      },
      {
        type: TYPES.photo,
        src: images.neoNostalgiaMatsumoto17,
      },
    ],
    links: [],
    relatedPosts: [],
  },
  {
    date: "2023/02/25",
    title: "新式浪漫 Neo Nostalgia 大阪公演",
    description: "",
    items: [
      {
        type: TYPES.photo,
        src: images.neoNostalgiaOsaka1,
      },
      {
        type: TYPES.photo,
        src: images.neoNostalgiaOsaka2,
      },
      {
        type: TYPES.photo,
        src: images.neoNostalgiaOsaka3,
      },
    ],
    links: [],
    relatedPosts: [],
  },
  {
    date: "2023/01/29",
    title: "新式浪漫 Neo Nostalgia 東京公演",
    description: "",
    items: [
      {
        type: TYPES.photo,
        src: images.neoNostalgiaTokyo1,
      },
      {
        type: TYPES.photo,
        src: images.neoNostalgiaTokyo2,
      },
      {
        type: TYPES.photo,
        src: images.neoNostalgiaTokyo3,
      },
    ],
    links: [],
    relatedPosts: [],
  },
  {
    date: "2023/01/29",
    title: "激情アラート 東京公演 2days",
    description: "",
    items: [
      {
        type: TYPES.photo,
        src: images.alert1,
      },
      {
        type: TYPES.photo,
        src: images.alert2,
      },
      {
        type: TYPES.photo,
        src: images.alert3,
      },
    ],
    links: [],
    relatedPosts: [],
  },
  {
    date: "2021/06/26",
    title: "音沙汰",
    description: "",
    items: [
      {
        type: TYPES.photo,
        src: images.otosata1,
      },
      {
        type: TYPES.photo,
        src: images.otosata2,
      },
    ],
    links: [],
    relatedPosts: [],
  },
];
