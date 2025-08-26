import { DiscographyWithSongs } from "../types/discography";
import { LiveInfo } from "../types/live";

interface UserInfo {
  nickname: string;
  startYear: string;
  favoriteEra?: string;
  favoriteGenre?: string;
  discoverySource: string;
}

interface UserEvent {
  type: string;
  title: string;
  description: string;
}

interface YearData {
  year: number;
  releases: DiscographyWithSongs[];
  lives: LiveInfo[];
  userEvents: UserEvent[];
}

interface TimelineStats {
  totalReleases: number;
  totalLives: number;
  totalSongs: number;
}

export class TimelineService {
  static generatePersonalTimeline(
    userInfo: UserInfo, 
    discographies: DiscographyWithSongs[], 
    liveInfos: LiveInfo[]
  ): YearData[] {
    const startYear = parseInt(userInfo.startYear);
    const currentYear = new Date().getFullYear();
    const timeline = [];

    for (let year = startYear; year <= currentYear; year++) {
      const yearData = {
        year,
        releases: this.getReleasesForYear(year, discographies),
        lives: this.getLivesForYear(year, liveInfos),
        userEvents: this.getUserEventsForYear(year, userInfo)
      };

      // データが存在する年のみ追加
      if (yearData.releases.length > 0 || yearData.lives.length > 0 || yearData.userEvents.length > 0) {
        timeline.push(yearData);
      }
    }

    return timeline;
  }

  static getReleasesForYear(year: number, discographies: DiscographyWithSongs[]): DiscographyWithSongs[] {
    return discographies.filter((disc: DiscographyWithSongs) => {
      if (!disc.releaseDate) return false;
      const releaseYear = new Date(disc.releaseDate).getFullYear();
      return releaseYear === year;
    });
  }

  static getLivesForYear(year: number, liveInfos: LiveInfo[]): LiveInfo[] {
    return liveInfos.filter((live: LiveInfo) => {
      if (!live.date) return false;
      const liveYear = new Date(live.date).getFullYear();
      return liveYear === year;
    });
  }

  static getUserEventsForYear(year: number, userInfo: UserInfo): UserEvent[] {
    const events = [];
    const startYear = parseInt(userInfo.startYear);

    if (year === startYear) {
      events.push({
        type: "discovery",
        title: "Reolとの出会い",
        description: `${userInfo.discoverySource}でReolを知る`
      });
    }

    // 特定の年に特別なイベントを追加
    if (year === 2016 && startYear <= 2016) {
      events.push({
        type: "milestone",
        title: "REOL結成",
        description: "Giga・Okameとのユニット「REOL」始動"
      });
    }

    if (year === 2020 && startYear <= 2020) {
      events.push({
        type: "milestone",
        title: "ソロ活動再開",
        description: "「Reol」名義でのソロ活動スタート"
      });
    }

    return events;
  }

  static calculateStats(timeline: YearData[]): TimelineStats {
    let totalReleases = 0;
    let totalLives = 0;
    let totalSongs = 0;

    timeline.forEach((yearData: YearData) => {
      totalReleases += yearData.releases.length;
      totalLives += yearData.lives.length;
      
      yearData.releases.forEach((release: DiscographyWithSongs) => {
        if (release.songs) {
          totalSongs += release.songs.length;
        }
      });
    });

    return { totalReleases, totalLives, totalSongs };
  }

  static generateShareText(userInfo: UserInfo, stats: TimelineStats, timelineLength: number): string {
    return `${userInfo.nickname}さんのReol年表
${userInfo.startYear}年からReolと歩んだ${timelineLength}年間
🎵 ${stats.totalReleases}作品・${stats.totalSongs}曲・${stats.totalLives}ライブと共に
${userInfo.discoverySource}での出会いから現在まで...

#Reol年表ジェネレーター #Reol`;
  }

  static exportToJSON(timelineData: any): string {
    return JSON.stringify(timelineData, null, 2);
  }

  static saveToLocalStorage(timelineData: any): void {
    localStorage.setItem("reol_timeline_data", JSON.stringify(timelineData));
  }

  static loadFromLocalStorage(): any {
    const data = localStorage.getItem("reol_timeline_data");
    return data ? JSON.parse(data) : null;
  }
}
