import {
  acousticForVenue,
  deriveVenueAcoustic,
  listOverriddenVenueIds,
  VENUE_ACOUSTIC_OVERRIDES,
} from "../acousticDerivation";

describe("acousticForVenue (base layer)", () => {
  it("ライブハウスはアリーナより reverb amount / decaySec が小さい", () => {
    const liveHouse = acousticForVenue({
      venueId: "lh1",
      type: "live_house",
      capacity: 800,
    });
    const arena = acousticForVenue({
      venueId: "ar1",
      type: "arena",
      capacity: 14000,
    });
    expect(liveHouse.reverb.decaySec).toBeLessThan(arena.reverb.decaySec);
    expect(liveHouse.reverb.amount).toBeLessThan(arena.reverb.amount);
  });

  it("屋外フェスは reverb が抑えられている (amount < 0.25)", () => {
    const outdoor = acousticForVenue({
      venueId: "od1",
      type: "outdoor_festival",
      capacity: 8000,
    });
    expect(outdoor.reverb.amount).toBeLessThan(0.25);
  });

  it("capacity が null でも数値が決まる (NaN を出さない)", () => {
    const result = acousticForVenue({
      venueId: "x",
      type: "hall",
      capacity: null,
    });
    expect(Number.isFinite(result.reverb.decaySec)).toBe(true);
    expect(Number.isFinite(result.reverb.amount)).toBe(true);
  });

  it("exhibition (展示場) も hall 系として広めの stageWidth を持つ", () => {
    const exhibition = acousticForVenue({
      venueId: "ex1",
      type: "exhibition",
      capacity: 9000,
    });
    expect(exhibition.spatial.stageWidth).toBeGreaterThanOrEqual(22);
  });
});

describe("deriveVenueAcoustic (overrides merge)", () => {
  it("既存 override は基本層をマージで上書きする", () => {
    const overriddenIds = listOverriddenVenueIds();
    expect(overriddenIds.length).toBeGreaterThan(0);
    const targetId = overriddenIds[0];
    const override = VENUE_ACOUSTIC_OVERRIDES[targetId];
    const merged = deriveVenueAcoustic({
      venueId: targetId,
      type: "arena",
      capacity: 12000,
    });

    if (override.reverb?.amount !== undefined) {
      expect(merged.reverb.amount).toBeCloseTo(override.reverb.amount, 3);
    }
    if (override.spatial?.stageWidth !== undefined) {
      expect(merged.spatial.stageWidth).toBe(override.spatial.stageWidth);
    }
  });

  it("override が無い venueId では基本層と一致する", () => {
    const base = acousticForVenue({
      venueId: "no_override_id_xyz",
      type: "live_house",
      capacity: 600,
    });
    const derived = deriveVenueAcoustic({
      venueId: "no_override_id_xyz",
      type: "live_house",
      capacity: 600,
    });
    expect(derived).toEqual(base);
  });
});
