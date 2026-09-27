// English (unofficial translation). Proper nouns such as song titles stay in the original.
import type { SiteDict } from "./ja";

const en: SiteDict = {
  site: {
    titleSuffix: "!Legit - Unofficial Reol Fan Site",
    topTitle: "!Legit | Unofficial Reol fan site covering every song, live show and setlist",
    defaultDescription: (years: number) =>
      `An unofficial fan site for Reol. Live performance stats for every song, setlists from every show, a map of MV filming locations, a fan-type quiz and more — search ${years} years of activity in one place.`,
    breadcrumbHome: "Home",
  },
  header: {
    search: "Search",
    searchTitle: "Search songs, live shows and locations",
    toDark: "Switch to dark mode",
    toLight: "Switch to light mode",
    myPage: "My page",
    menu: "Menu",
    language: "Language",
  },
  footer: {
    officialSite: "Official site",
    goods: "Merch",
    disclaimer:
      "This is an unofficial fan site and is not affiliated with Reol or any official Reol organization. Music and videos are shown only through official embeds and links.",
    operator: "Run by (unofficial fan site)",
  },
  video: {
    expand: "Expand the video",
    close: "Close the video",
    unmute: "Unmute",
    mute: "Mute",
    play: "Play the video",
  },
  stats: {
    title: "Song Stats",
    metaDescription:
      "Live performance stats for every Reol song: total performances, first performance and most recent performance.",
    lead: "Total live performances of each song, with the dates it was first and most recently performed.",
    rulesLink: "How we count →",
    totalPlays: "Total performances",
    uniqueSongs: "Songs performed",
    searchPlaceholder: "🔍 Search by song title",
    sortPlays: "Most performed",
    sortLast: "Most recent",
    sortFirst: "Earliest debut",
    sortName: "Title",
    songCount: (n: string) => `${n} songs`,
    toSongPageTitle: "Go to song page",
    firstPlayed: "First",
    lastPlayed: "Latest",
    toAlbum: "View the release →",
    toSongPage: "Go to song page →",
    watchMv: "▶ Watch the official MV",
    stream: "♪ Listen on streaming",
    history: "Performance history",
    historyCount: (n: number) => `(${n})`,
    noMatch: "No songs match your search",
    backToTop: "← Back to top",
    historyLoadError: "Couldn't load the performance history",
    historyLoading: "Loading performance history...",
    historyEmpty: "No performance history",
  },
};

export default en;
