import { tourShortName } from "../profileCard/tourName";

describe("プロフィールカードのツアーの短い名前(plan/48)", () => {
  it.each([
    ["Reol Oneman Live 2026 美辞学", "美辞学"],
    ["Reol Oneman Live 2025 カルチュア・カリキュラム", "カルチュア・カリキュラム"],
    ['Reol ASIA TOUR "UNBOX"', "UNBOX"],
    ["Reol Oneman Live 2023/24「UNBOX black/pure」", "UNBOX black/pure"],
    ["REOLワンマンライブ 『テンカイ ノ コウシキ』", "テンカイ ノ コウシキ"],
    ["れをる単独公演「極彩色HighFidelity」", "極彩色HighFidelity"],
    ["ジャイガ-OSAKA GIGANTIC MUSIC FESTIVAL 2026-", "ジャイガ-OSAKA GIGANTIC MUSIC FESTIVAL 2026-"],
    ["COUNTDOWN JAPAN 25/26", "COUNTDOWN JAPAN 25/26"],
    ["Dios対バンツアー2025「脱構築β with」福岡UNITEDLAB", "Dios対バンツアー2025「脱構築β with」福岡UNITEDLAB"],
    ['Reol Secret Live  "極秘LEGIT"', "極秘LEGIT"],
  ])("%s → %s", (title, short) => {
    expect(tourShortName(title)).toBe(short);
  });
});
