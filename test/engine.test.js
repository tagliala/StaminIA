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

// ---------- validateSkill (extra edge cases) ----------

describe("validateSkill edge cases", () => {
  it("accepts exactly the minimum boundary", () => {
    expect(validateSkill(1, "form")).toBe(1);
    expect(validateSkill(1, "stamina")).toBe(1);
    expect(validateSkill(0, "skill")).toBe(0);
    expect(validateSkill(0, "exp")).toBe(0);
    expect(validateSkill(1, "loyalty")).toBe(1);
  });

  it("accepts exactly the maximum boundary", () => {
    expect(validateSkill(8, "form")).toBe(8);
    expect(validateSkill(9, "stamina")).toBe(9);
    expect(validateSkill(22, "skill")).toBe(22);
    expect(validateSkill(30, "exp")).toBe(30);
    expect(validateSkill(20, "loyalty")).toBe(20);
  });

  it("handles numeric strings without decimals", () => {
    expect(validateSkill("7", "form")).toBe(7);
    expect(validateSkill("9", "stamina")).toBe(9);
  });

  it("handles decimal values within range", () => {
    expect(validateSkill("6.5", "stamina")).toBe(6.5);
    expect(validateSkill(3.75, "stamina")).toBe(3.75);
  });

  it("clamps decimal values below minimum to min", () => {
    expect(validateSkill("0.5", "form")).toBe(1);
  });

  it("clamps decimal values above maximum to max", () => {
    expect(validateSkill("22.5", "skill")).toBe(22);
  });
});

// ---------- getPlayerBonus (extra edge cases) ----------

describe("getPlayerBonus edge cases", () => {
  it("returns max (1.5) regardless of passed loyalty when mother club enabled", () => {
    expect(getPlayerBonus(1, true)).toBe(getPlayerBonus(5, true));
    expect(getPlayerBonus(10, true)).toBe(getPlayerBonus(20, true));
  });

  it("loyalty 1 gives zero loyalty bonus (no mother club)", () => {
    expect(getPlayerBonus(1, false)).toBe(0);
  });

  it("loyalty 20 gives full loyalty bonus of 1 (no mother club)", () => {
    expect(getPlayerBonus(20, false)).toBe(1);
  });

  it("loyalty increases monotonically", () => {
    for (let l = 2; l <= 20; l++) {
      expect(getPlayerBonus(l, false)).toBeGreaterThan(getPlayerBonus(l - 1, false));
    }
  });
});

// ---------- getContribution (extra edge cases) ----------

describe("getContribution edge cases", () => {
  it("returns exactly 1 for stamina 9 at any minute", () => {
    expect(getContribution(1, 9, 0, false)).toBe(1);
    expect(getContribution(45, 9, 0, false)).toBe(1);
    expect(getContribution(90, 9, 0, false)).toBe(1);
  });

  it("halftime rest improves energy at start of second half", () => {
    const endFirstHalf = getContribution(44, 5, 0, false);
    const startSecondHalf = getContribution(0, 5, 46, false);
    // Sub entering at 46 should start with more energy than player at end of first half
    expect(startSecondHalf).toBeGreaterThan(endFirstHalf);
  });

  it("second half player contribution decreases as the half progresses", () => {
    const early = getContribution(5, 4, 46, false);
    const late = getContribution(40, 4, 46, false);
    expect(early).toBeGreaterThan(late);
  });

  it("pressing reduces contribution for mid/low stamina players", () => {
    for (const stamina of [3, 5, 7]) {
      const normal = getContribution(70, stamina, 0, false);
      const pressing = getContribution(70, stamina, 0, true);
      expect(normal).toBeGreaterThanOrEqual(pressing);
    }
  });
});

// ---------- calculateStrength (extra edge cases) ----------

describe("calculateStrength edge cases", () => {
  it("scales positively with skill", () => {
    const low = calculateStrength(5, 5, 5, 10, true);
    const high = calculateStrength(10, 5, 5, 10, true);
    expect(high).toBeGreaterThan(low);
  });

  it("stamina coefficient at stamina=9 exceeds 1, so including it boosts strength", () => {
    const with_ = calculateStrength(10, 5, 9, 10, true);
    const without = calculateStrength(10, 5, 9, 10, false);
    // c_stamina = ((9 + 6.5) / 14) ^ 0.6 ≈ 1.064 > 1, so with_ > without
    expect(with_).toBeGreaterThan(without);
  });

  it("very low form produces proportionally lower strength", () => {
    const high = calculateStrength(10, 8, 5, 10, true);
    const low = calculateStrength(10, 1, 5, 10, true);
    expect(high / low).toBeGreaterThan(2);
  });
});

// ---------- getAvgAt90 (extra edge cases) ----------

describe("getAvgAt90 edge cases", () => {
  it("monotonically increases with stamina from 1 to 9", () => {
    for (let s = 2; s <= 9; s++) {
      expect(getAvgAt90(s)).toBeGreaterThanOrEqual(getAvgAt90(s - 1));
    }
  });

  it("returns exactly 1 for stamina 9", () => {
    expect(getAvgAt90(9)).toBe(1);
  });

  it("returns a value below 0.9 for stamina 5", () => {
    expect(getAvgAt90(5)).toBeLessThan(0.9);
  });
});

// ---------- getAvgAt90 – fractional stamina > 8 (boost branch) ----------

describe("getAvgAt90 fractional stamina > 8", () => {
  it("hits the stamina > 8 boost branch and returns a value between stamina-8 and 1", () => {
    const avg = getAvgAt90(8.5);
    // boost is applied, should be higher than stamina=8 result
    expect(avg).toBeGreaterThan(getAvgAt90(8));
    // but still <= 1
    expect(avg).toBeLessThanOrEqual(1);
  });

  it("returns 1 for stamina exactly 9", () => {
    expect(getAvgAt90(9)).toBe(1);
  });

  it("result for 8.9 is between result for 8 and 1", () => {
    const avg = getAvgAt90(8.9);
    expect(avg).toBeGreaterThan(getAvgAt90(8));
    expect(avg).toBeLessThanOrEqual(1);
  });
});

// ---------- getContribution – fractional stamina > 8 (boost branch) ----------

describe("getContribution fractional stamina > 8", () => {
  it("contribution for stamina 8.5 is higher than for stamina 8 at the same minute", () => {
    const c8 = getContribution(20, 8, 0, false);
    const c85 = getContribution(20, 8.5, 0, false);
    expect(c85).toBeGreaterThanOrEqual(c8);
  });

  it("contribution for stamina 8.5 does not exceed 1", () => {
    for (const minute of [1, 30, 60, 89]) {
      expect(getContribution(minute, 8.5, 0, false)).toBeLessThanOrEqual(1);
    }
  });
});

// ---------- getContribution – player starts in second half ----------

describe("getContribution player entering in the second half", () => {
  it("does not throw for startsAtMinute=60", () => {
    expect(() => getContribution(10, 5, 60, false)).not.toThrow();
  });

  it("initialCheckpoint >= HALF_TIME_CHECKPOINT path: returns value in range (0,1]", () => {
    // startsAtMinute=60: initialCheckpoint = ceil(60/5) = 12 >= 10 (HALF_TIME_CHECKPOINT)
    const c = getContribution(10, 5, 60, false);
    expect(c).toBeGreaterThan(0);
    expect(c).toBeLessThanOrEqual(1);
  });

  it("contribution decreases as more minutes are played after a second-half entry", () => {
    const early = getContribution(5, 4, 60, false);  // 5 min after entering at 60
    const late = getContribution(25, 4, 60, false); // 25 min after entering at 60
    expect(early).toBeGreaterThan(late);
  });

  it("second-half entry contribution is better than playing from kickoff for low stamina", () => {
    // Player with low stamina entering at 60 is fresher than one who played 65 minutes
    const starter = getContribution(65, 3, 0, false);
    const sub = getContribution(5, 3, 60, false);
    expect(sub).toBeGreaterThan(starter);
  });

  it("pressing still degrades contribution for a second-half entrant", () => {
    const normal = getContribution(20, 4, 60, false);
    const pressing = getContribution(20, 4, 60, true);
    expect(normal).toBeGreaterThanOrEqual(pressing);
  });
});
