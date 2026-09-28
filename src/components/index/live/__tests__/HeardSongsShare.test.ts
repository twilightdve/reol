import { writeFileSync } from "fs";
import { drawCard } from "../HeardSongsShare";
import { heardShareDict } from "../../../../i18n/site/pages/heardShare";

const stats = {
  heard: 52,
  total: 170,
  shows: 12,
  sinceYear: 2019,
  topSongs: [
    { name: "第六感", count: 11 },
    { name: "煽げや尊し", count: 10 },
    { name: "感情御中 -WANT U LUV IT-", count: 9 },
  ],
};

describe("drawCard", () => {
  it.each(["ja", "en", "ko"] as const)("%s のカードを PNG の data URL で返す", (lang) => {
    const url = drawCard(stats, heardShareDict[lang], lang === "ja" ? "/live/" : `/${lang}/live/`);
    expect(url.startsWith("data:image/png;base64,")).toBe(true);
    // 目視確認用に書き出す(環境変数を指定したときだけ)
    if (process.env.HEARD_CARD_OUT) {
      writeFileSync(`${process.env.HEARD_CARD_OUT}/heard-card-${lang}.png`, Buffer.from(url.split(",")[1], "base64"));
    }
  });

  it("曲数が3桁でも描ける(左列に収まるよう縮める)", () => {
    const url = drawCard({ ...stats, heard: 165, total: 170 }, heardShareDict.en, "/en/live/");
    expect(url.startsWith("data:image/png;base64,")).toBe(true);
    if (process.env.HEARD_CARD_OUT) {
      writeFileSync(`${process.env.HEARD_CARD_OUT}/heard-card-en-3digits.png`, Buffer.from(url.split(",")[1], "base64"));
    }
  });
});
