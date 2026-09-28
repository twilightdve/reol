import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import HeardSongsShare from "../HeardSongsShare";
import { SiteLangProvider } from "../../../../i18n/site/SiteLangContext";

jest.mock("gatsby", () => ({ __esModule: true, Link: () => null, navigate: jest.fn() }));
jest.mock("../../../../utils/analytics", () => ({ trackEvent: jest.fn() }));

const stats = {
  heard: 52,
  total: 170,
  shows: 12,
  sinceYear: 2019,
  topSongs: [{ name: "第六感", count: 11 }],
};

describe("HeardSongsShare", () => {
  it("ボタンでカードを作り、Xのポストは表示中の言語のURLと本文を渡す", () => {
    render(
      <SiteLangProvider lang="ko">
        <HeardSongsShare stats={stats} />
      </SiteLangProvider>
    );
    fireEvent.click(screen.getByRole("button", { name: "공유 카드 만들기" }));
    expect(screen.getByRole("img", { name: "라이브로 들은 곡 공유 카드" })).toBeInTheDocument();
    const x = screen.getByRole("link", { name: "X에 포스트" });
    const href = decodeURIComponent(x.getAttribute("href") ?? "");
    expect(href).toContain("https://reol.twilightea.com/ko/live/");
    expect(href).toContain("52 / 170곡(31%)");
    fireEvent.click(screen.getByRole("button", { name: "닫기" }));
    expect(screen.getByRole("button", { name: "공유 카드 만들기" })).toBeInTheDocument();
  });
});
