import costumeHighFidelity from "../../../images/looks-history/costume_high_fidelity.png";
import costumeSyugakusho from "../../../images/looks-history/costume_syugakusho.png";
import costumeMadeInFaction from "../../../images/looks-history/costume_made_in_faction.png";
import costumeShinkouUpgrade from "../../../images/looks-history/costume_shinkou_upgrade.png";
import costumeHamelnNoDaigourei from "../../../images/looks-history/costume_hameln_no_daigourei.png";
import costumeGekijouAlert from "../../../images/looks-history/costume_gekijou_alert.png";
import costumeNeoNostalgia from "../../../images/looks-history/costume_neo_nostalgia.png";
import costumeUnbox from "../../../images/looks-history/costume_unbox.png";

export interface HistoryPageData {
  page: number;
  events: Array<{
    date: string;
    title: string;
    className?: string;
  }>;
  costumeImage: string;
  costumeAlt: string;
  costumeClassName?: string;
}

export const historyPagesData: HistoryPageData[] = [
  {
    page: 3,
    events: [
      {
        date: "2014.08.17",
        title: "フルアルバム「No title」発売",
        className: "tracking-tighter"
      },
      {
        date: "2015.07.29",
        title: "フルアルバム「極彩色」発売",
        className: "tracking-tighter"
      },
      {
        date: "2015.10.23",
        title: "れをる単独公演「極彩色 HighFidelity」"
      }
    ],
    costumeImage: costumeHighFidelity,
    costumeAlt: "High Fidelity costume"
  },
  {
    page: 4,
    events: [
      {
        date: "2016.10.19",
        title: "フルアルバム「Σ」発売"
      },
      {
        date: "2017.02.26",
        title: "REOLワンマンライヴ「テンカイ ノ コウシキ」",
        className: "tracking-tighter"
      },
      {
        date: "2017.10.11",
        title: "DIGITAL EP「エンドレスEP」発売"
      },
      {
        date: "2017.10.26",
        title: "REOL LAST LIVE「終楽章」"
      }
    ],
    costumeImage: costumeSyugakusho,
    costumeAlt: "Syugakusho costume",
    costumeClassName: "absolute bottom-6 right-2 w-2/3"
  },
  {
    page: 5,
    events: [
      {
        date: "2018.03.14",
        title: "ミニアルバム「虚構集」発売"
      },
      {
        date: "2018.10.17",
        title: "フルアルバム「事実上」発売"
      },
      {
        date: "2018.10.26",
        title: "Reol Japan Tour 2018\n「MADE IN FACTION」"
      }
    ],
    costumeImage: costumeMadeInFaction,
    costumeAlt: "Made in Faction costume",
    costumeClassName: "absolute bottom-8 right-4 w-2/3"
  },
  {
    page: 6,
    events: [
      {
        date: "2019.03.20",
        title: "1st EP「文明EP」発売"
      },
      {
        date: "2019.07.13",
        title: "Reol Secret Live 2019\n「文明ココロミー」"
      },
      {
        date: "2020.10.16",
        title: "Reol Oneman Live 2019「侵攻アップグレード」",
        className: "tracking-tighter"
      }
    ],
    costumeImage: costumeShinkouUpgrade,
    costumeAlt: "Shinkou Upgrade costume",
    costumeClassName: "absolute bottom-8 right-2 w-3/5"
  }
];

export const flipBookConfig = {
  className: "",
  style: {},
  minWidth: 257,
  minHeight: 364,
  size: "stretch" as const,
  startPage: 0,
  drawShadow: true,
  flippingTime: 1000,
  usePortrait: true,
  startZIndex: 0,
  autoSize: true,
  maxShadowOpacity: 0,
  showCover: true,
  mobileScrollSupport: true,
  clickEventForward: true,
  useMouseEvents: true,
  swipeDistance: 15,
  showPageCorners: true,
  disableFlipByClick: false,
};
