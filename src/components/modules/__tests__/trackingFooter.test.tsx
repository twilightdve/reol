import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import TrackingFooter from "../trackingFooter";
import routeReducer from "../../../redux/slices/routeSlice";
import { ROUTE_NAMES } from "../../../types/common";

// モックストアの作成
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      route: routeReducer,
    },
    preloadedState: {
      route: { currentRoute: "HOME" },
      ...initialState,
    },
  });
};

const renderWithStore = (
  component: React.ReactElement,
  store = createMockStore()
) => {
  return render(<Provider store={store}>{component}</Provider>);
};

describe("TrackingFooter", () => {
  // Jest環境でのwindowオブジェクトモック
  const mockLocation = {
    pathname: "/",
    href: "",
  };
  const mockPushState = jest.fn();
  const mockScrollTo = jest.fn();

  beforeEach(() => {
    // 既存のモックをクリア
    jest.clearAllMocks();

    // locationのモック（より安全な方法）
    delete (window as any).location;
    (window as any).location = mockLocation;

    // historyのモック
    delete (window as any).history;
    (window as any).history = {
      pushState: mockPushState,
    };

    // scrollToのモック
    window.scrollTo = mockScrollTo;
  });

  test("renders all navigation items", () => {
    renderWithStore(<TrackingFooter />);

    ROUTE_NAMES.forEach((route) => {
      expect(screen.getByText(route)).toBeInTheDocument();
    });
  });

  test("highlights current route", () => {
    const store = createMockStore({
      route: { currentRoute: "DISCOGRAPHY" },
    });

    renderWithStore(<TrackingFooter />, store);

    const activeItem = screen.getByLabelText("Navigate to DISCOGRAPHY section");
    expect(activeItem).toHaveAttribute("aria-selected", "true");
    expect(activeItem).toHaveClass("bg-theme");
  });

  test("handles navigation on click", () => {
    const store = createMockStore();
    renderWithStore(<TrackingFooter />, store);

    const discographyButton = screen.getByLabelText(
      "Navigate to DISCOGRAPHY section"
    );
    fireEvent.click(discographyButton);

    expect(mockScrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: "smooth",
    });
    expect(mockPushState).toHaveBeenCalledWith(
      null,
      "!Legit｜Reol Unofficial Fansite",
      "/#DISCOGRAPHY"
    );
  });

  test("handles keyboard navigation", () => {
    const store = createMockStore();
    renderWithStore(<TrackingFooter />, store);

    const homeButton = screen.getByLabelText("Navigate to HOME section");
    fireEvent.keyDown(homeButton, { key: "Enter" });

    expect(mockScrollTo).toHaveBeenCalled();
  });

  test("handles arrow key navigation", () => {
    const store = createMockStore();
    renderWithStore(<TrackingFooter />, store);

    const homeButton = screen.getByLabelText("Navigate to HOME section");
    fireEvent.keyDown(homeButton, { key: "ArrowRight" });

    // 次のルートに移動することを確認
    expect(mockScrollTo).toHaveBeenCalled();
  });

  test("has proper accessibility attributes", () => {
    renderWithStore(<TrackingFooter />);

    const nav = screen.getByRole("navigation");
    expect(nav).toHaveAttribute("aria-label", "Main navigation");

    const tablist = screen.getByRole("tablist");
    expect(tablist).toBeInTheDocument();

    const tabs = screen.getAllByRole("tab");
    expect(tabs).toHaveLength(ROUTE_NAMES.length);

    tabs.forEach((tab) => {
      expect(tab).toHaveAttribute("aria-selected");
      expect(tab).toHaveAttribute("aria-label");
    });
  });
});
