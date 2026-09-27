// 日本語(原文)。ほかの言語の辞書はこの型(SiteDict)に合わせる。

const ja = {
  site: {
    /** 下層ページの <title> に付けるサフィックス */
    titleSuffix: "!Legit - Reol非公式ファンサイト",
    /** トップページの <title> */
    topTitle: "!Legit｜Reolの楽曲・ライブ・セトリを網羅する非公式ファンサイト",
    defaultDescription: (years: number) =>
      `Reol(れをる)の非公式ファンサイト。全楽曲のライブ演奏統計、歴代ライブのセットリスト、MVロケ地(聖地)マップ、ファンタイプ診断まで。${years}年分の活動を横断検索できます。`,
    breadcrumbHome: "ホーム",
  },
  header: {
    search: "検索",
    searchTitle: "楽曲・LIVE・ロケ地を横断検索",
    toDark: "ダークモードに切替",
    toLight: "ライトモードに切替",
    myPage: "マイページ",
    menu: "メニュー",
    language: "言語",
  },
  footer: {
    officialSite: "公式サイト",
    goods: "グッズ",
    disclaimer:
      "本サイトはReol公式とは関係のない非公式ファンサイトです。楽曲・映像は公式の埋め込み/リンクのみ使用しています。",
    operator: "運営(非公式ファンサイト)",
  },
  video: {
    expand: "動画を横幅フル表示に戻す",
    close: "動画を閉じる",
    unmute: "ミュート解除",
    mute: "ミュート",
    play: "動画を再生",
  },
  stats: {
    title: "楽曲統計",
    metaDescription: "Reolの全楽曲のライブ演奏統計。通算演奏回数・初披露日・最終演奏日を一覧できます。",
    lead: "LIVEで演奏された楽曲の通算演奏回数・初出 / 最終演奏日を一覧します。",
    rulesLink: "集計ルールについて →",
    totalPlays: "演奏数 (述べ)",
    uniqueSongs: "ユニーク楽曲",
    searchPlaceholder: "🔍 曲名で検索",
    sortPlays: "演奏回数 (多)",
    sortLast: "最終演奏 (新)",
    sortFirst: "初演奏 (古)",
    sortName: "曲名 (あいうえお)",
    songCount: (n: string) => `${n} 曲`,
    toSongPageTitle: "楽曲詳細ページへ",
    firstPlayed: "初演奏",
    lastPlayed: "最新",
    toAlbum: "収録アルバムを見る →",
    toSongPage: "この曲のページへ →",
    watchMv: "▶ 公式MVを見る",
    stream: "♪ 配信で聴く",
    history: "演奏履歴",
    historyCount: (n: number) => `(${n}件)`,
    noMatch: "該当する楽曲が見つかりません",
    backToTop: "← トップに戻る",
    historyLoadError: "演奏履歴の読み込みに失敗しました",
    historyLoading: "演奏履歴を読み込み中...",
    historyEmpty: "演奏履歴がありません",
  },
};

export type SiteDict = typeof ja;
export default ja;
