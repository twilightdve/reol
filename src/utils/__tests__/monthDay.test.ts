import { formatMonthDayLabel, shiftMonthDay } from "../monthDay";

describe("shiftMonthDay", () => {
  it("前後にずらし、月・年をまたいでも MM-DD で返す", () => {
    expect(shiftMonthDay("09-28", 1)).toBe("09-29");
    expect(shiftMonthDay("09-30", 1)).toBe("10-01");
    expect(shiftMonthDay("01-01", -1)).toBe("12-31");
    expect(shiftMonthDay("12-31", 1)).toBe("01-01");
  });

  it("閏年の影響を受けない(2/28 の翌日は 3/1)", () => {
    expect(shiftMonthDay("02-28", 1)).toBe("03-01");
  });
});

describe("formatMonthDayLabel", () => {
  it("M月D日 の表記にする", () => {
    expect(formatMonthDayLabel("09-08")).toBe("9月8日");
  });
});
