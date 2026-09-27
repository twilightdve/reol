// 楽曲ソーター(/songs/sorter/)専用の辞書(plan/28 第2弾)。中国語・韓国語は機械翻訳。
import type { SiteLang } from "../langs";

const ja = {
  title: "楽曲ソーター",
  metaDescription:
    "2曲ずつ勝ち抜き戦で、あなたの一番好きな曲を決めるトーナメント。優勝までのブラケットを画像でシェアできます。",
  lead: "2曲ずつ勝ち抜き戦。あなたの一番好きな曲を決めるトーナメントです。",
  sizeOption: (n: number) => `${n}曲トーナメント`,
  allOption: (n: number) => `全${n}曲トーナメント`,
  matches: (n: number) => `対戦 ${n}回`,
  matchesLong: (n: number) => `対戦 ${n}回(かなり長丁場です)`,
  /** ラウンド名。entrants はそのラウンドに残っている曲数(決勝=2) */
  roundLabel: (entrants: number) =>
    entrants <= 2 ? "決勝" : entrants === 4 ? "準決勝" : entrants === 8 ? "準々決勝" : `ベスト${entrants}`,
  progress: (done: number, total: number) => `${done} / ${total}回`,
  tapPrompt: "好きな方をタップ",
  championOf: (n: number) => `🏆 優勝・全${n}曲中`,
  bracket: "トーナメントブラケット",
  previewNote: "プレビューは縮小表示です。保存すると全曲分の高解像度画像になります。",
  generating: "ブラケット画像を生成中…",
  saveImage: "画像を保存/共有",
  copied: "コピーしました！",
  shareText: "テキストで共有",
  restart: "もう一度作る",
  statsLink: "楽曲統計(演奏回数)を見る →",
  shareBody: (n: number, champion: string, runnerUp: string | null) =>
    `楽曲トーナメント(全${n}曲)で「${champion}」が優勝しました${runnerUp ? `\n準優勝: ${runnerUp}` : ""}`,
  // シェアカード(canvas)
  cardTitle: "楽曲トーナメント",
  cardSubtitle: (n: number) => `Reol ・ 全${n}曲`,
  cardChampion: "🏆 優勝 CHAMPION",
  cardFooter: "!Legit(非公式ファンサイト)",
};

type SorterDict = typeof ja;

export const sorterDict: Record<SiteLang, SorterDict> = {
  ja,
  en: {
    title: "Song Sorter",
    metaDescription:
      "A knockout tournament, two songs at a time, to find your favorite Reol song. Share the bracket all the way to the champion as an image.",
    lead: "A knockout tournament, two songs at a time, to find your favorite song.",
    sizeOption: (n: number) => `${n}-song tournament`,
    allOption: (n: number) => `All ${n} songs`,
    matches: (n: number) => `${n} matchups`,
    matchesLong: (n: number) => `${n} matchups (a long one!)`,
    roundLabel: (entrants: number) =>
      entrants <= 2
        ? "Final"
        : entrants === 4
          ? "Semifinal"
          : entrants === 8
            ? "Quarterfinal"
            : `Round of ${entrants}`,
    progress: (done: number, total: number) => `${done} / ${total}`,
    tapPrompt: "Tap the one you like more",
    championOf: (n: number) => `🏆 Champion of ${n} songs`,
    bracket: "Tournament bracket",
    previewNote: "The preview is scaled down. The saved image is a high-resolution bracket of every song.",
    generating: "Generating bracket image…",
    saveImage: "Save / share image",
    copied: "Copied!",
    shareText: "Share as text",
    restart: "Start over",
    statsLink: "See song stats (live plays) →",
    shareBody: (n: number, champion: string, runnerUp: string | null) =>
      `"${champion}" won my Reol song tournament (${n} songs)${runnerUp ? `\nRunner-up: ${runnerUp}` : ""}`,
    cardTitle: "Song Tournament",
    cardSubtitle: (n: number) => `Reol · ${n} songs`,
    cardChampion: "🏆 CHAMPION",
    cardFooter: "!Legit (unofficial fan site)",
  },
  "zh-hant": {
    title: "歌曲排序器",
    metaDescription: "兩首兩首淘汰對決，選出你最喜歡的 Reol 歌曲。可以將直到冠軍的對戰表分享成圖片。",
    lead: "兩首兩首淘汰對決，選出你最喜歡的歌曲的錦標賽。",
    sizeOption: (n: number) => `${n} 首錦標賽`,
    allOption: (n: number) => `全 ${n} 首錦標賽`,
    matches: (n: number) => `對決 ${n} 次`,
    matchesLong: (n: number) => `對決 ${n} 次(相當漫長)`,
    roundLabel: (entrants: number) =>
      entrants <= 2 ? "決賽" : entrants === 4 ? "準決賽" : entrants === 8 ? "八強" : `${entrants} 強`,
    progress: (done: number, total: number) => `${done} / ${total} 次`,
    tapPrompt: "點選喜歡的那首",
    championOf: (n: number) => `🏆 冠軍(${n} 首之中)`,
    bracket: "錦標賽對戰表",
    previewNote: "預覽為縮小顯示。儲存後會是包含所有歌曲的高解析度圖片。",
    generating: "正在產生對戰表圖片…",
    saveImage: "儲存／分享圖片",
    copied: "已複製！",
    shareText: "以文字分享",
    restart: "再玩一次",
    statsLink: "查看歌曲統計(演出次數) →",
    shareBody: (n: number, champion: string, runnerUp: string | null) =>
      `在歌曲錦標賽(全 ${n} 首)中，「${champion}」奪得冠軍${runnerUp ? `\n亞軍：${runnerUp}` : ""}`,
    cardTitle: "歌曲錦標賽",
    cardSubtitle: (n: number) => `Reol · 全 ${n} 首`,
    cardChampion: "🏆 冠軍 CHAMPION",
    cardFooter: "!Legit(非官方粉絲網站)",
  },
  "zh-hans": {
    title: "歌曲排序器",
    metaDescription: "两首两首淘汰对决，选出你最喜欢的 Reol 歌曲。可以将直到冠军的对阵表分享成图片。",
    lead: "两首两首淘汰对决，选出你最喜欢的歌曲的锦标赛。",
    sizeOption: (n: number) => `${n} 首锦标赛`,
    allOption: (n: number) => `全 ${n} 首锦标赛`,
    matches: (n: number) => `对决 ${n} 次`,
    matchesLong: (n: number) => `对决 ${n} 次(相当漫长)`,
    roundLabel: (entrants: number) =>
      entrants <= 2 ? "决赛" : entrants === 4 ? "半决赛" : entrants === 8 ? "八强" : `${entrants} 强`,
    progress: (done: number, total: number) => `${done} / ${total} 次`,
    tapPrompt: "点选喜欢的那首",
    championOf: (n: number) => `🏆 冠军(${n} 首之中)`,
    bracket: "锦标赛对阵表",
    previewNote: "预览为缩小显示。保存后会是包含所有歌曲的高分辨率图片。",
    generating: "正在生成对阵表图片…",
    saveImage: "保存／分享图片",
    copied: "已复制！",
    shareText: "以文字分享",
    restart: "再玩一次",
    statsLink: "查看歌曲统计(演出次数) →",
    shareBody: (n: number, champion: string, runnerUp: string | null) =>
      `在歌曲锦标赛(全 ${n} 首)中，「${champion}」夺得冠军${runnerUp ? `\n亚军：${runnerUp}` : ""}`,
    cardTitle: "歌曲锦标赛",
    cardSubtitle: (n: number) => `Reol · 全 ${n} 首`,
    cardChampion: "🏆 冠军 CHAMPION",
    cardFooter: "!Legit(非官方粉丝网站)",
  },
  ko: {
    title: "곡 소터",
    metaDescription:
      "두 곡씩 겨루는 토너먼트로 가장 좋아하는 Reol 곡을 정합니다. 우승까지의 대진표를 이미지로 공유할 수 있습니다.",
    lead: "두 곡씩 겨루는 승자 진출전. 당신이 가장 좋아하는 곡을 정하는 토너먼트입니다.",
    sizeOption: (n: number) => `${n}곡 토너먼트`,
    allOption: (n: number) => `전체 ${n}곡 토너먼트`,
    matches: (n: number) => `대결 ${n}회`,
    matchesLong: (n: number) => `대결 ${n}회(꽤 깁니다)`,
    roundLabel: (entrants: number) =>
      entrants <= 2 ? "결승" : entrants === 4 ? "준결승" : entrants === 8 ? "8강" : `${entrants}강`,
    progress: (done: number, total: number) => `${done} / ${total}회`,
    tapPrompt: "좋아하는 쪽을 탭하세요",
    championOf: (n: number) => `🏆 우승 · 전체 ${n}곡 중`,
    bracket: "토너먼트 대진표",
    previewNote: "미리보기는 축소 표시입니다. 저장하면 모든 곡이 담긴 고해상도 이미지가 됩니다.",
    generating: "대진표 이미지를 생성하는 중…",
    saveImage: "이미지 저장/공유",
    copied: "복사했습니다!",
    shareText: "텍스트로 공유",
    restart: "다시 하기",
    statsLink: "곡 통계(연주 횟수) 보기 →",
    shareBody: (n: number, champion: string, runnerUp: string | null) =>
      `곡 토너먼트(전체 ${n}곡)에서 「${champion}」이(가) 우승했습니다${runnerUp ? `\n준우승: ${runnerUp}` : ""}`,
    cardTitle: "곡 토너먼트",
    cardSubtitle: (n: number) => `Reol · 전체 ${n}곡`,
    cardChampion: "🏆 우승 CHAMPION",
    cardFooter: "!Legit(비공식 팬사이트)",
  },
};
