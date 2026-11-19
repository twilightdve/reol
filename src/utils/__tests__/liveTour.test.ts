import { tourTitleColor, isOngoing } from "../liveTour";

// 2026-11 時点のワンマン 21 件の色(シートの themeColorPrimary / Secondary)
const ONEMAN: [string, string][] = [
  ["#7A65A6", "#915C8E"], ["#BF2633", "#262626"], ["#B39267", "#EAE0D7"], ["#F4ECD5", "#87735B"],
  ["#E3EDF6", "#2A84B9"], ["#D5783F", "#386F58"], ["#E3EDF6", "#2A84B9"], ["#4FF090", "#565656"],
  ["#E85920", "#B9B9B9"], ["#FE8630", "#2E2926"], ["#D8BE23", "#FF5824"], ["#E36692", "#DED5DA"],
  ["#39596E", "#528598"], ["#EAD79C", "#AB7932"], ["#101012", "#97A6A3"], ["#8798A2", "#D9C8D0"],
  ["#CD0000", "#270000"], ["#9A0201", "#000F4A"], ["#BF1C1C", "#620E0E"], ["#222A3F", "#010119"],
  ["#0A0350", "#0B0716"],
];

describe("tourTitleColor", () => {
  it("白・黒・灰に寄る色だけ公式の青(null)になる", () => {
    expect(ONEMAN.filter(([p, s]) => tourTitleColor(p, s, "light") === null)).toHaveLength(3);
    expect(ONEMAN.filter(([p, s]) => tourTitleColor(p, s, "dark") === null)).toHaveLength(4);
  });

  it("淡い主の色は 2 色目に切り替わる", () => {
    // 『No title』上海: 淡い水色ではなく青
    expect(tourTitleColor("#E3EDF6", "#2A84B9", "dark")).not.toBe(tourTitleColor("#E3EDF6", "#E3EDF6", "dark"));
    expect(tourTitleColor("#E3EDF6", "#2A84B9", "light")).toMatch(/^rgb\(/);
  });

  it("色が無い・読めない時は null", () => {
    expect(tourTitleColor(null, undefined, "light")).toBeNull();
    expect(tourTitleColor("red", "", "dark")).toBeNull();
  });
});

describe("isOngoing", () => {
  const now = new Date("2026-03-20T12:00:00");
  it("始まっていて終わっていないツアーだけ true", () => {
    expect(isOngoing(["2026-03-14", "2026-07-26"], now)).toBe(true);
    expect(isOngoing(["2026-01-01", "2026-02-01"], now)).toBe(false);
    expect(isOngoing(["2026-04-01", "2026-05-01"], now)).toBe(false);
  });
  it("複数日にまたがる表記も読む", () => {
    expect(isOngoing(["2026-03-14〜2026-07-26"], now)).toBe(true);
    expect(isOngoing([null, undefined], now)).toBe(false);
  });
});
