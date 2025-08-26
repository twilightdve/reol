declare global {
  interface Window {
    gtag: (key: string, trackingId: string, config: object) => void;
  }
}

interface GtagOptions {
  category: string;
  action: string;
  label: string;
}

class UtilityService {
  static formatViewCount = (value: number): string => {
    return new Intl.NumberFormat("ja-JP", {
      notation: "compact",
      maximumFractionDigits: 0,
    }).format(value);
  };

  static extractVideoId = (url: string): string | null => {
    if (!url) return null;

    // YouTube URLから動画IDを抽出
    const patterns = [
      /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^?&"'>]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&"'>]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^?&"'>]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    // 既にビデオIDの場合はそのまま返す
    if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
      return url;
    }

    return null;
  };

  static formatTimeDiff = (targetDate: string): string => {
    const diff = new Date().getTime() - new Date(targetDate).getTime();
    const progress = new Date(diff);
    let result: string;

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

  static gtag = (options: GtagOptions): void => {
    if (typeof window !== "undefined" && typeof window.gtag !== "undefined") {
      window.gtag("event", options.action, {
        event_category: options.category,
        event_label: options.label,
      });
    }
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

  /**
   * 基本的なHTMLサニタイゼーション（XSS対策）
   * 注意: これは基本的な実装です。本格的なアプリケーションではDOMPurifyなどの専用ライブラリを使用することを推奨します。
   */
  static sanitizeHTML = (input: string): string => {
    const temp = document.createElement("div");
    temp.textContent = input;
    return temp.innerHTML;
  };

  /**
   * 許可されたHTMLタグのみを保持する簡易サニタイゼーション
   */
  static sanitizeHTMLWithAllowedTags = (
    input: string,
    allowedTags: string[] = ["b", "i", "em", "strong", "br"]
  ): string => {
    const temp = document.createElement("div");
    temp.innerHTML = input;

    // 許可されていないタグを削除
    const allElements = temp.querySelectorAll("*");
    allElements.forEach((element) => {
      if (!allowedTags.includes(element.tagName.toLowerCase())) {
        const childNodes = Array.from(element.childNodes);
        element.replaceWith(...childNodes);
      }
    });

    return temp.innerHTML;
  };
}
export default UtilityService;
