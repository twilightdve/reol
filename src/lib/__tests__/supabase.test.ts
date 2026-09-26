import {
  fetchWithSessionToken,
  getSessionToken,
  setSessionToken,
  clearSessionToken,
} from "../supabase";

describe("セッショントークンのヘッダー付与", () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    fetchMock.mockResolvedValue({ ok: true });
    (global as unknown as { fetch: typeof fetch }).fetch = fetchMock as unknown as typeof fetch;
    localStorage.clear();
  });

  it("トークンが無いときはリクエストをそのまま送る", async () => {
    const init = { headers: { apikey: "anon-key" } };
    await fetchWithSessionToken("https://example.supabase.co/rest/v1/profiles", init);

    expect(fetchMock).toHaveBeenCalledWith("https://example.supabase.co/rest/v1/profiles", init);
  });

  it("トークンがあるときは x-session-token ヘッダーを付け、既存ヘッダーを保つ", async () => {
    setSessionToken("token-abc");
    await fetchWithSessionToken("https://example.supabase.co/rest/v1/profiles", {
      method: "PATCH",
      headers: { apikey: "anon-key" },
    });

    const [, sentInit] = fetchMock.mock.calls[0];
    const headers = sentInit.headers as Headers;
    expect(sentInit.method).toBe("PATCH");
    expect(headers.get("x-session-token")).toBe("token-abc");
    expect(headers.get("apikey")).toBe("anon-key");
  });

  it("clearSessionToken でトークンが消える", () => {
    setSessionToken("token-abc");
    expect(getSessionToken()).toBe("token-abc");
    clearSessionToken();
    expect(getSessionToken()).toBeNull();
  });
});
