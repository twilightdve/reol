// PHOTOGRAPHY ページ専用の辞書(plan/28 第2弾)。中国語・韓国語は機械翻訳。
import type { SiteLang } from "../langs";

const ja = {
  metaDescription: "Reol 関連のライヴや聖地巡礼で撮影した写真・動画を掲載しています。",
  intro:
    "PHOTOGRAPHYではこれまで私が参加したライヴやイベント、Reol関連の聖地巡礼で撮影した写真や動画を掲載しています。",
};

type PhotosDict = typeof ja;

export const photosDict: Record<SiteLang, PhotosDict> = {
  ja,
  en: {
    metaDescription: "Photos and videos taken at Reol live shows and on pilgrimages to filming locations.",
    intro:
      "PHOTOGRAPHY collects photos and videos the site owner took at live shows and events they attended, and on pilgrimages to Reol-related filming locations.",
  },
  "zh-hant": {
    metaDescription: "收錄在 Reol 相關演唱會與聖地巡禮中拍攝的照片與影片。",
    intro: "PHOTOGRAPHY 收錄站長至今參加的演唱會、活動，以及 Reol 相關聖地巡禮時拍攝的照片與影片。",
  },
  "zh-hans": {
    metaDescription: "收录在 Reol 相关演唱会与圣地巡礼中拍摄的照片与视频。",
    intro: "PHOTOGRAPHY 收录站长至今参加的演唱会、活动，以及 Reol 相关圣地巡礼时拍摄的照片与视频。",
  },
  ko: {
    metaDescription: "Reol 관련 라이브와 성지 순례에서 촬영한 사진·영상을 소개합니다.",
    intro: "PHOTOGRAPHY에서는 운영자가 지금까지 참가한 라이브와 이벤트, Reol 관련 성지 순례에서 촬영한 사진과 영상을 소개합니다.",
  },
};
