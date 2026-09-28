// 「生で聴いた曲」シェアカード(LIVE ページ・案K、plan/25 §6)専用の辞書。中国語・韓国語は機械翻訳。
import type { SiteLang } from "../langs";

type HeardShareDict = {
  create: string;
  generating: string;
  preview: string;
  saveImage: string;
  postToX: string;
  copyText: string;
  copied: string;
  close: string;
  // カード(画像)の文言
  cardKicker: string;
  cardTitle: string;
  cardSongsUnit: string;
  cardShows: (n: number) => string;
  cardSince: (year: number) => string;
  cardTopHeading: string;
  cardTimes: (n: number) => string;
  cardFooter: string;
  // シェア文
  shareText: (heard: number, total: number, rate: number, shows: number) => string;
};

const ja: HeardShareDict = {
  create: "シェアカードを作る",
  generating: "カードを作成中…",
  preview: "生で聴いた曲のシェアカード",
  saveImage: "画像を保存/共有",
  postToX: "Xでポスト",
  copyText: "テキストをコピー",
  copied: "コピーしました",
  close: "閉じる",
  cardKicker: "MY REOL LIVE LOG",
  cardTitle: "生で聴いた曲",
  cardSongsUnit: "曲",
  cardShows: (n) => `参戦 ${n}公演`,
  cardSince: (year) => `${year}年から`,
  cardTopHeading: "よく聴いた曲",
  cardTimes: (n) => `${n}回`,
  cardFooter: "!Legit(非公式ファンサイト)",
  shareText: (heard, total, rate, shows) =>
    `Reolのライブで生で聴いた曲は ${heard} / ${total}曲(${rate}%)でした\n参戦 ${shows}公演\n#Reol`,
};

const en: HeardShareDict = {
  create: "Make a share card",
  generating: "Making your card…",
  preview: "Share card of songs heard live",
  saveImage: "Save / share image",
  postToX: "Post on X",
  copyText: "Copy text",
  copied: "Copied!",
  close: "Close",
  cardKicker: "MY REOL LIVE LOG",
  cardTitle: "Songs heard live",
  cardSongsUnit: "songs",
  cardShows: (n) => `${n} ${n === 1 ? "show" : "shows"} attended`,
  cardSince: (year) => `since ${year}`,
  cardTopHeading: "Most heard",
  cardTimes: (n) => `×${n}`,
  cardFooter: "!Legit (unofficial fan site)",
  shareText: (heard, total, rate, shows) =>
    `I've heard ${heard} / ${total} Reol songs live (${rate}%)\n${shows} ${shows === 1 ? "show" : "shows"} attended\n#Reol`,
};

const zhHant: HeardShareDict = {
  create: "製作分享卡",
  generating: "正在製作分享卡…",
  preview: "現場聽過的歌曲分享卡",
  saveImage: "儲存／分享圖片",
  postToX: "發佈到 X",
  copyText: "複製文字",
  copied: "已複製",
  close: "關閉",
  cardKicker: "MY REOL LIVE LOG",
  cardTitle: "現場聽過的歌曲",
  cardSongsUnit: "首",
  cardShows: (n) => `參加 ${n} 場`,
  cardSince: (year) => `${year} 年起`,
  cardTopHeading: "最常聽到的歌",
  cardTimes: (n) => `${n} 次`,
  cardFooter: "!Legit(非官方粉絲網站)",
  shareText: (heard, total, rate, shows) =>
    `我在 Reol 的演唱會現場聽過 ${heard} / ${total} 首歌(${rate}%)\n參加 ${shows} 場\n#Reol`,
};

const zhHans: HeardShareDict = {
  create: "制作分享卡",
  generating: "正在制作分享卡…",
  preview: "现场听过的歌曲分享卡",
  saveImage: "保存／分享图片",
  postToX: "发布到 X",
  copyText: "复制文字",
  copied: "已复制",
  close: "关闭",
  cardKicker: "MY REOL LIVE LOG",
  cardTitle: "现场听过的歌曲",
  cardSongsUnit: "首",
  cardShows: (n) => `参加 ${n} 场`,
  cardSince: (year) => `${year} 年起`,
  cardTopHeading: "最常听到的歌",
  cardTimes: (n) => `${n} 次`,
  cardFooter: "!Legit(非官方粉丝网站)",
  shareText: (heard, total, rate, shows) =>
    `我在 Reol 的演唱会现场听过 ${heard} / ${total} 首歌(${rate}%)\n参加 ${shows} 场\n#Reol`,
};

const ko: HeardShareDict = {
  create: "공유 카드 만들기",
  generating: "카드를 만드는 중…",
  preview: "라이브로 들은 곡 공유 카드",
  saveImage: "이미지 저장/공유",
  postToX: "X에 포스트",
  copyText: "텍스트 복사",
  copied: "복사했습니다",
  close: "닫기",
  cardKicker: "MY REOL LIVE LOG",
  cardTitle: "라이브로 들은 곡",
  cardSongsUnit: "곡",
  cardShows: (n) => `참전 ${n}공연`,
  cardSince: (year) => `${year}년부터`,
  cardTopHeading: "가장 많이 들은 곡",
  cardTimes: (n) => `${n}회`,
  cardFooter: "!Legit(비공식 팬사이트)",
  shareText: (heard, total, rate, shows) =>
    `Reol 라이브에서 들은 곡은 ${heard} / ${total}곡(${rate}%)이었습니다\n참전 ${shows}공연\n#Reol`,
};

export const heardShareDict: Record<SiteLang, HeardShareDict> = { ja, en, "zh-hant": zhHant, "zh-hans": zhHans, ko };
