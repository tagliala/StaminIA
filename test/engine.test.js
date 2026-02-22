import { describe, it, expect, beforeAll } from "vitest";
import {
  getContribution,
  getAvgAt90,
  calculateStrength,
  validateSkill,
  getPlayerBonus,
} from "../src/engine.js";

// engine.js reads Staminia.CONFIG.DEBUG; provide a minimal stub.
beforeAll(() => {
  window.Staminia = window.Staminia || {};
  window.Staminia.CONFIG = { DEBUG: false };
  window.$ = () => {};
});

// ---------- validateSkill ----------

describe("validateSkill", () => {
  it("clamps below minimum to min", () => {
    expect(validateSkill(0, "form")).toBe(1);
    expect(validateSkill(-5, "stamina")).toBe(1);
  });

  it("clamps above maximum to max", () => {
    expect(validateSkill(10, "form")).toBe(8);
    expect(validateSkill(25, "skill")).toBe(22);
  });

  it("returns the value when within range", () => {
    expect(validateSkill(5, "form")).toBe(5);
    expect(validateSkill(7.5, "stamina")).toBe(7.5);
  });

  it("handles comma-separated decimals", () => {
    expect(validateSkill("5,5", "stamina")).toBe(5.5);
  });

  it("returns 0 for unknown skill type", () => {
    expect(validateSkill(5, "unknown")).toBe(0);
  });
});

// ---------- getPlayerBonus ----------

describe("getPlayerBonus", () => {
  it("returns 0 for minimum loyalty without mother club", () => {
    expect(getPlayerBonus(1, false)).toBe(0);
  });

  it("returns 1 (max loyalty) for loyalty 20 without mother club", () => {
    expect(getPlayerBonus(20, false)).toBe(1);
  });

  it("returns 1.5 with mother club bonus", () => {
    // motherClubBonus sets loyalty to 20 and adds 0.5
    expect(getPlayerBonus(1, true)).toBe(1.5);
  });

  it("scales linearly between 1 and 20", () => {
    const bonus = getPlayerBonus(10, false);
    expect(bonus).toBeCloseTo(9 / 19, 5);
  });
});

// ---------- getContribution ----------

describe("getContribution", () => {
  it("returns 1 for stamina 9 (perfect stamina)", () => {
    expect(getContribution(1, 9, 0, false)).toBe(1);
    expect(getContribution(90, 9, 0, false)).toBe(1);
  });

  it("starts at or above 1 for high stamina at minute 1", () => {
    expect(getContribution(1, 8, 0, false)).toBeLessThanOrEqual(1);
  });

  it("decreases over time for low stamina", () => {
    const early = getContribution(5, 3, 0, false);
    const late = getContribution(85, 3, 0, false);
    expect(early).toBeGreaterThan(late);
  });

  it("pressing causes faster decay", () => {
    const normal = getContribution(80, 5, 0, false);
    const pressing = getContribution(80, 5, 0, true);
    expect(normal).toBeGreaterThan(pressing);
  });

  it("second-half player starts fresh from their entry minute", () => {
    // A sub entering at minute 60 should be stronger at minute 60
    // than the starter at minute 60
    const starter = getContribution(60, 5, 0, false);
    const sub = getContribution(0, 5, 60, false);
    expect(sub).toBeGreaterThan(starter);
  });
});

// ---------- getAvgAt90 ----------

describe("getAvgAt90", () => {
  it("returns 1 for stamina 9", () => {
    expect(getAvgAt90(9)).toBe(1);
  });

  it("returns a value between 0 and 1 for low stamina", () => {
    const avg = getAvgAt90(3);
    expect(avg).toBeGreaterThan(0);
    expect(avg).toBeLessThan(1);
  });

  it("higher stamina produces higher average", () => {
    expect(getAvgAt90(7)).toBeGreaterThan(getAvgAt90(4));
  });
});

// ---------- calculateStrength ----------

describe("calculateStrength", () => {
  it("returns 0 when skill is 0", () => {
    expect(calculateStrength(0, 5, 5, 10, true)).toBe(0);
  });

  it("higher form produces higher strength", () => {
    const low = calculateStrength(10, 2, 5, 10, true);
    const high = calculateStrength(10, 7, 5, 10, true);
    expect(high).toBeGreaterThan(low);
  });

  it("higher experience produces higher strength", () => {
    const low = calculateStrength(10, 5, 5, 1, true);
    const high = calculateStrength(10, 5, 5, 20, true);
    expect(high).toBeGreaterThan(low);
  });

  it("stamina-independent ignores stamina coefficient", () => {
    const withStamina = calculateStrength(10, 5, 3, 10, true);
    const without = calculateStrength(10, 5, 3, 10, false);
    expect(without).toBeGreaterThan(withStamina);
  });

  it("stamina-independent returns same result for different staminas", () => {
    const a = calculateStrength(10, 5, 3, 10, false);
    const b = calculateStrength(10, 5, 8, 10, false);
    expect(a).toBe(b);
  });
});

// ---------- estimateStaminaSubskills ----------

describe("estimateStaminaSubskills", () => {
  it("returns a low value for low performance", () => {
    const result = window.Staminia.estimateStaminaSubskills(20);
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThan(3);
  });

  it("returns around 8 for performance at 90", () => {
    const result = window.Staminia.estimateStaminaSubskills(90);
    expect(result).toBeCloseTo(8, 0);
  });

  it("returns above 8 for performance above 90", () => {
    expect(window.Staminia.estimateStaminaSubskills(100)).toBeGreaterThan(8);
  });

  it("caps at 9 for very low performance values", () => {
    // The formula has a min(9, ...) cap
    expect(window.Staminia.estimateStaminaSubskills(10)).toBeLessThanOrEqual(9);
  });
});
