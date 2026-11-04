import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import PlayerSlot from "../PlayerSlot";
import playerReducer from "../../../redux/slices/playerSlice";
import { getSlot } from "../slotRegistry";

jest.mock("gatsby", () => ({ __esModule: true }));

const createStore = () => configureStore({ reducer: { player: playerReducer } });

describe("PlayerSlot", () => {
  it("押すまでは再生しない。押すとその動画を全体のプレイヤーに渡し、枠を登録する", () => {
    const store = createStore();
    const { container } = render(
      <Provider store={store}>
        <PlayerSlot videoId="abcdefghijk" title="テストの曲" />
      </Provider>
    );
    expect(store.getState().player.current).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /テストの曲/ }));
    const current = store.getState().player.current;
    expect(current).toMatchObject({ videoId: "abcdefghijk", title: "テストの曲" });
    // 再生中は再生ボタンを外し、プレイヤーが重なる要素を登録している
    expect(screen.queryByRole("button")).toBeNull();
    expect(container.querySelector('[data-player-slot="active"]')).not.toBeNull();
    expect(getSlot(current?.slotId)).not.toBeNull();
  });

  it("同じ動画の枠が2つあっても、押した方だけが再生中になる", () => {
    const store = createStore();
    const { container } = render(
      <Provider store={store}>
        <PlayerSlot videoId="abcdefghijk" title="一つ目" />
        <PlayerSlot videoId="abcdefghijk" title="二つ目" />
      </Provider>
    );
    fireEvent.click(screen.getByRole("button", { name: /二つ目/ }));
    const slots = container.querySelectorAll("[data-player-slot]");
    expect(slots[0].getAttribute("data-player-slot")).toBe("idle");
    expect(slots[1].getAttribute("data-player-slot")).toBe("active");
  });

  it("autoStart の枠は出した時に流し始める", () => {
    const store = createStore();
    render(
      <Provider store={store}>
        <PlayerSlot videoId="abcdefghijk" title="演奏" autoStart />
      </Provider>
    );
    expect(store.getState().player.current?.videoId).toBe("abcdefghijk");
  });

  it("外すと枠の登録も消える(別のページへ移った時は右上の小窓になる)", () => {
    const store = createStore();
    const { unmount } = render(
      <Provider store={store}>
        <PlayerSlot list="PLxxxxxxxxxxxx" title="再生リスト" autoStart />
      </Provider>
    );
    const slotId = store.getState().player.current?.slotId;
    expect(getSlot(slotId)).not.toBeNull();
    unmount();
    expect(getSlot(slotId)).toBeNull();
    expect(store.getState().player.current?.list).toBe("PLxxxxxxxxxxxx");
  });

  it("小窓で流れている動画と同じ枠が出てきたら、その枠に付き直す(作り直さないよう中身はそのまま)", () => {
    const store = createStore();
    const first = render(
      <Provider store={store}>
        <PlayerSlot videoId="abcdefghijk" title="元の枠" />
      </Provider>
    );
    fireEvent.click(screen.getByRole("button", { name: /元の枠/ }));
    const before = store.getState().player.current;
    first.unmount();
    const { container } = render(
      <Provider store={store}>
        <PlayerSlot videoId="zzzzzzzzzzz" title="別の動画" />
        <PlayerSlot videoId="abcdefghijk" title="戻ってきた枠" />
      </Provider>
    );
    const after = store.getState().player.current;
    expect(after?.slotId).not.toBe(before?.slotId);
    expect(after).toMatchObject({ videoId: "abcdefghijk", title: "元の枠" });
    const slots = container.querySelectorAll("[data-player-slot]");
    expect(slots[0].getAttribute("data-player-slot")).toBe("idle");
    expect(slots[1].getAttribute("data-player-slot")).toBe("active");
  });
});
