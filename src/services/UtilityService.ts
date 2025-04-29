declare global {
  interface Window {
    gtag: (key: string, trackingId: string, config: object) => void;
  }
}
class UtilityService {
  static formatViewCount = (value: number) => {
    return new Intl.NumberFormat("ja-JP", {
      notation: "compact",
      maximumFractionDigits: 0,
    }).format(value);
  };

  static formatTimeDiff = (targetDate: string) => {
    let diff = new Date().getTime() - new Date(targetDate).getTime();
    let progress = new Date(diff);
    let result = null;
    if (progress.getUTCFullYear() - 1970) {
      result = progress.getUTCFullYear() - 1970 + "年前";
    } else if (progress.getUTCMonth()) {
      result = progress.getUTCMonth() + "ヶ月前";
    } else if (progress.getUTCDate() - 1) {
      result = progress.getUTCDate() - 1 + "日前";
    } else if (progress.getUTCHours()) {
      result = progress.getUTCHours() + "時間前";
    } else if (progress.getUTCMinutes()) {
      result = progress.getUTCMinutes() + "分前";
    } else {
      result = progress.getUTCSeconds() + "秒前";
    }
    return result;
  };

  static gtag = (options: { [p: string]: string }) => {
    typeof window !== "undefined" &&
      typeof window.gtag !== "undefined" &&
      window.gtag("event", options.action, {
        event_category: options.category,
        event_label: options.label,
      });
  };

  static getObjectQueries = (): { [key: string]: string } => {
    if (!location.search) return {};
    return location.search
      .substring(1)
      .split("&")
      .reduce((acc, cur) => {
        acc[cur.split("=")[0]] = cur.split("=")[1];
        return acc;
      }, {} as { [key: string]: string });
  };
}
export default UtilityService;
