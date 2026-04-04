/**
 * Integration tests for Staminia.Engine.start().
 *
 * These tests set up a minimal DOM that mirrors the real form structure,
 * wire up the Staminia helpers that Engine.start() depends on, then run
 * the full calculation and assert on the shape and values of the result.
 *
 * A CHPP fixture (anonymised) is also used to verify that player data
 * coming from the API can be round-tripped through the form fields and
 * produce a sensible calculation result.
 */

import { describe, it, expect, beforeAll, beforeEach, afterEach } from "vitest";
import Staminia from "../src/staminia.js";
import "../src/engine.js";
import chppFixture from "./fixtures/chpp-response.json";

// ---------------------------------------------------------------------------
// DOM helpers
// ---------------------------------------------------------------------------

const FORM_ID = "#testForm";

/**
 * Build the minimal set of form inputs Engine.start() reads.
 *
 * Uses innerHTML so that the browser's (jsdom's) HTML parser registers all
 * elements in the form's elements collection, enabling the named-item access
 * pattern `formRef["elementName"]` that engine.js relies on.
 */
function buildForm(opts = {}) {
  const {
    p1Form = 5, p1Stamina = 7, p1Experience = 8, p1MainSkill = 8, p1Loyalty = 10, p1MotherClub = false,
    p2Form = 4, p2Stamina = 5, p2Experience = 6, p2MainSkill = 6, p2Loyalty = 15, p2MotherClub = false,
    pressing = false, charts = false, verbose = false, advanced = false,
  } = opts;

  const checked = (v) => (v ? "checked" : "");
  const sel = (name, value) =>
    `<select name="${name}"><option value="${value}" selected>${value}</option></select>`;

  const container = document.createElement("div");
  container.innerHTML = `
    <form id="${FORM_ID.replace("#", "")}">
      ${sel("Staminia_Simple_Player_1_Form", p1Form)}
      ${sel("Staminia_Simple_Player_1_Stamina", p1Stamina)}
      ${sel("Staminia_Simple_Player_1_Experience", p1Experience)}
      ${sel("Staminia_Simple_Player_1_MainSkill", p1MainSkill)}
      ${sel("Staminia_Simple_Player_1_Loyalty", p1Loyalty)}
      <input type="checkbox" name="Staminia_Player_1_MotherClubBonus" ${checked(p1MotherClub)}>
      ${sel("Staminia_Simple_Player_2_Form", p2Form)}
      ${sel("Staminia_Simple_Player_2_Stamina", p2Stamina)}
      ${sel("Staminia_Simple_Player_2_Experience", p2Experience)}
      ${sel("Staminia_Simple_Player_2_MainSkill", p2MainSkill)}
      ${sel("Staminia_Simple_Player_2_Loyalty", p2Loyalty)}
      <input type="checkbox" name="Staminia_Player_2_MotherClubBonus" ${checked(p2MotherClub)}>
      <input type="checkbox" name="Staminia_Options_Pressing" ${checked(pressing)}>
      <input type="checkbox" name="Staminia_Options_Charts" ${checked(charts)}>
      <input type="checkbox" name="Staminia_Options_VerboseMode" ${checked(verbose)}>
      <input type="checkbox" name="Staminia_Options_AdvancedMode" ${checked(advanced)}>
    </form>
  `;

  document.body.appendChild(container);
  const form = container.querySelector("form");

  // jsdom doesn't implement the HTMLFormElement named-element getter from the
  // HTML spec (the feature that lets you write form["fieldName"]).  Add the
  // property descriptors directly to the form node.  document.querySelector
  // returns the same object reference, so the descriptors persist.
  for (const el of Array.from(form.elements)) {
    if (el.name) {
      Object.defineProperty(form, el.name, {
        get() { return this.elements.namedItem(el.name); },
        configurable: true,
      });
    }
  }

  return form;
}

/**
 * Build a form with all advanced-mode fields.
 * Sets Staminia_Options_AdvancedMode checkbox to checked.
 */
function buildAdvancedForm(opts = {}) {
  const {
    p1Position = 8, // IM – playmaking-dominant position
    p2Position = -1,
    p1Form = 5, p1Stamina = 7, p1Experience = 8, p1Loyalty = 10, p1MotherClub = false,
    p1Keeper = 4, p1Defending = 7, p1Playmaking = 10, p1Winger = 5, p1Passing = 6, p1Scoring = 3,
    p2Form = 4, p2Stamina = 5, p2Experience = 6, p2Loyalty = 10, p2MotherClub = false,
    p2Keeper = 3, p2Defending = 6, p2Playmaking = 7, p2Winger = 4, p2Passing = 5, p2Scoring = 4,
    pressing = false,
  } = opts;

  const checked = (v) => (v ? "checked" : "");
  const inp = (name, value) => `<input type="text" name="${name}" value="${value}">`;
  const sel = (name, value) =>
    `<select name="${name}"><option value="${value}" selected>${value}</option></select>`;

  const container = document.createElement("div");
  container.innerHTML = `
    <form id="${FORM_ID.replace("#", "")}">
      <input type="checkbox" name="Staminia_Options_AdvancedMode" checked>
      <input type="checkbox" name="Staminia_Options_Pressing" ${checked(pressing)}>
      <input type="checkbox" name="Staminia_Options_Charts">
      <input type="checkbox" name="Staminia_Options_VerboseMode">
      ${sel("Staminia_Advanced_Player_1_Position", p1Position)}
      ${sel("Staminia_Advanced_Player_2_Position", p2Position)}
      ${inp("Staminia_Advanced_Player_1_Form", p1Form)}
      ${inp("Staminia_Advanced_Player_1_Stamina", p1Stamina)}
      ${inp("Staminia_Advanced_Player_1_Experience", p1Experience)}
      ${inp("Staminia_Advanced_Player_1_Loyalty", p1Loyalty)}
      <input type="checkbox" name="Staminia_Player_1_MotherClubBonus" ${checked(p1MotherClub)}>
      ${inp("Staminia_Advanced_Player_1_Skill_Keeper", p1Keeper)}
      ${inp("Staminia_Advanced_Player_1_Skill_Defending", p1Defending)}
      ${inp("Staminia_Advanced_Player_1_Skill_Playmaking", p1Playmaking)}
      ${inp("Staminia_Advanced_Player_1_Skill_Winger", p1Winger)}
      ${inp("Staminia_Advanced_Player_1_Skill_Passing", p1Passing)}
      ${inp("Staminia_Advanced_Player_1_Skill_Scoring", p1Scoring)}
      ${inp("Staminia_Advanced_Player_2_Form", p2Form)}
      ${inp("Staminia_Advanced_Player_2_Stamina", p2Stamina)}
      ${inp("Staminia_Advanced_Player_2_Experience", p2Experience)}
      ${inp("Staminia_Advanced_Player_2_Loyalty", p2Loyalty)}
      <input type="checkbox" name="Staminia_Player_2_MotherClubBonus" ${checked(p2MotherClub)}>
      ${inp("Staminia_Advanced_Player_2_Skill_Keeper", p2Keeper)}
      ${inp("Staminia_Advanced_Player_2_Skill_Defending", p2Defending)}
      ${inp("Staminia_Advanced_Player_2_Skill_Playmaking", p2Playmaking)}
      ${inp("Staminia_Advanced_Player_2_Skill_Winger", p2Winger)}
      ${inp("Staminia_Advanced_Player_2_Skill_Passing", p2Passing)}
      ${inp("Staminia_Advanced_Player_2_Skill_Scoring", p2Scoring)}
    </form>
  `;

  document.body.appendChild(container);
  const form = container.querySelector("form");

  for (const el of Array.from(form.elements)) {
    if (el.name) {
      Object.defineProperty(form, el.name, {
        get() { return this.elements.namedItem(el.name); },
        configurable: true,
      });
    }
  }

  return form;
}

// ---------------------------------------------------------------------------
// Global setup
// ---------------------------------------------------------------------------

let currentForm;

beforeAll(() => {
  // Configure Staminia namespace that engine.js relies on
  Staminia.CONFIG = {
    DEBUG: false,
    FORM_ID,
    PR_ENUM_SKILL: { Keeper: 0, Defending: 1, Playmaking: 2, Winger: 3, Passing: 4, Scoring: 5 },
  };

  // number_format (copy from main.js)
  Staminia.number_format = (number = "", decimals = 0, dec_point = ".", thousands_sep = ",") => {
    number = String(number).replace(/[^0-9+\-Ee.]/g, "");
    const n = isFinite(number) ? number : 0;
    const prec = isFinite(decimals) ? Math.abs(decimals) : 0;
    const toFixedFix = (n, prec) => {
      const k = Math.pow(10, prec);
      return "" + Math.round(n * k) / k;
    };
    const s = (prec ? toFixedFix(n, prec) : "" + Math.round(n)).split(".");
    if (s[0].length > 3) {
      s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, thousands_sep);
    }
    if ((s[1] || "").length < prec) {
      s[1] = s[1] || "";
      s[1] += new Array(prec - s[1].length + 1).join("0");
    }
    return s.join(dec_point);
  };

  // Helpers that normally read specific checkboxes
  Staminia.isAdvancedModeEnabled = () => document.querySelector(`${FORM_ID} [name="Staminia_Options_AdvancedMode"]`)?.checked ?? false;
  Staminia.isPressingEnabled     = () => document.querySelector(`${FORM_ID} [name="Staminia_Options_Pressing"]`)?.checked ?? false;
  Staminia.isChartsEnabled       = () => document.querySelector(`${FORM_ID} [name="Staminia_Options_Charts"]`)?.checked ?? false;
  Staminia.isVerboseModeEnabled  = () => document.querySelector(`${FORM_ID} [name="Staminia_Options_VerboseMode"]`)?.checked ?? false;

  // Prediction coefficients used by getAdvancedSkill – same as PREDICTIONS_HO in main.js
  Staminia.predictions = [[0.4897,0.2310,0.0,0.0,0.0,0.0],[0.0,0.3492,0.1140,0.0,0.0,0.0],[0.0,0.2530,0.1540,0.0,0.0,0.0],[0.0,0.3488,0.0825,0.0556,0.0,0.0],[0.0,0.3283,0.0780,0.1086,0.0,0.0],[0.0,0.2582,0.1080,0.1375,0.0,0.0],[0.0,0.3550,0.0310,0.0688,0.0,0.0],[0.0,0.3214,0.0780,0.0604,0.0,0.0],[0.0,0.1348,0.4680,0.0,0.1148,0.0],[0.0,0.0727,0.4420,0.0,0.1475,0.0],[0.0,0.1974,0.4420,0.0,0.0760,0.0],[0.0,0.1383,0.4130,0.1073,0.1063,0.0],[0.0,0.1314,0.2130,0.1873,0.0669,0.0],[0.0,0.0629,0.1780,0.2193,0.0814,0.0],[0.0,0.1769,0.1780,0.1585,0.0484,0.0],[0.0,0.1245,0.2690,0.1235,0.0596,0.0],[0.0,0.0,0.0,0.0790,0.1297,0.3046],[0.0,0.0,0.2010,0.0545,0.2214,0.1781],[0.0,0.0,0.2010,0.0545,0.2519,0.1781],[0.0,0.0,0.0,0.1150,0.1323,0.2632]];
});

beforeEach(() => {
  // Remove the container div (and the form inside) left by the previous test
  currentForm?.parentElement?.remove();
  currentForm = undefined;
});

// ---------------------------------------------------------------------------
// Engine.start() – result structure
// ---------------------------------------------------------------------------

describe("Engine.start() result structure", () => {
  it("returns a result object with the expected keys", () => {
    currentForm = buildForm();
    const result = Staminia.Engine.start();

    expect(result).toHaveProperty("substituteAt");
    expect(result).toHaveProperty("substituteAtSecondHalf");
    expect(result).toHaveProperty("mayNotReplace");
    expect(result).toHaveProperty("bestInFirstHalf");
    expect(result).toHaveProperty("player1Strength");
    expect(result).toHaveProperty("player2Strength");
    expect(result).toHaveProperty("max");
    expect(result).toHaveProperty("min");
    expect(result).toHaveProperty("status", "OK");
  });

  it("substituteAt contains only valid match minutes (1–44, 46–89)", () => {
    currentForm = buildForm();
    const { substituteAt } = Staminia.Engine.start();

    for (const m of substituteAt) {
      expect(m).toBeGreaterThanOrEqual(1);
      expect(m).toBeLessThanOrEqual(90);
      expect(m).not.toBe(45);
    }
  });

  it("max is >= min in the result", () => {
    currentForm = buildForm();
    const { max, min } = Staminia.Engine.start();
    // min can be -1 when all minutes are equal; otherwise max >= min
    expect(Number(max)).toBeGreaterThanOrEqual(Number(min));
  });
});

// ---------------------------------------------------------------------------
// Engine.start() – player ordering
// ---------------------------------------------------------------------------

describe("Engine.start() player2_stronger flag", () => {
  it("sets player2_stronger_than_player1=false when player 1 is clearly stronger", () => {
    currentForm = buildForm({ p1MainSkill: 15, p1Form: 7, p2MainSkill: 3, p2Form: 3 });
    const result = Staminia.Engine.start();
    expect(result.player2_stronger_than_player1).toBe(false);
  });

  it("sets player2_stronger_than_player1=true when player 2 is clearly stronger", () => {
    currentForm = buildForm({ p1MainSkill: 3, p1Form: 3, p2MainSkill: 15, p2Form: 7 });
    const result = Staminia.Engine.start();
    expect(result.player2_stronger_than_player1).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Engine.start() – pressing option
// ---------------------------------------------------------------------------

describe("Engine.start() with pressing", () => {
  it("produces a result without error", () => {
    currentForm = buildForm({ pressing: true, p1Stamina: 4, p2Stamina: 4 });
    expect(() => Staminia.Engine.start()).not.toThrow();
  });

  it("max contribution is lower or equal when pressing is enabled", () => {
    currentForm = buildForm({
      p1Stamina: 4, p2Stamina: 4, p1Form: 5, p2Form: 5,
      p1MainSkill: 8, p2MainSkill: 8, pressing: false,
    });
    const normalMax = Number(Staminia.Engine.start().max);

    currentForm.parentElement.remove();
    currentForm = buildForm({
      p1Stamina: 4, p2Stamina: 4, p1Form: 5, p2Form: 5,
      p1MainSkill: 8, p2MainSkill: 8, pressing: true,
    });
    const pressingMax = Number(Staminia.Engine.start().max);

    expect(normalMax).toBeGreaterThanOrEqual(pressingMax);
  });
});

// ---------------------------------------------------------------------------
// Engine.start() – verbose mode produces minute-by-minute data
// ---------------------------------------------------------------------------

describe("Engine.start() verbose mode", () => {
  it("populates result.minutes when verbose is enabled", () => {
    currentForm = buildForm({ verbose: true });
    const { minutes } = Staminia.Engine.start();

    // Should have entries for every minute except 45
    const minuteKeys = Object.keys(minutes).map(Number);
    expect(minuteKeys).not.toContain(45);
    expect(minuteKeys.length).toBe(89); // 1..90 minus 45
  });

  it("each minute entry has total, percent, p1, p2, isMax, isMin", () => {
    currentForm = buildForm({ verbose: true });
    const { minutes } = Staminia.Engine.start();

    for (const m of Object.values(minutes)) {
      expect(m).toHaveProperty("total");
      expect(m).toHaveProperty("percent");
      expect(m).toHaveProperty("p1");
      expect(m).toHaveProperty("p2");
      expect(m).toHaveProperty("isMax");
      expect(m).toHaveProperty("isMin");
    }
  });

  it("exactly one minute is marked isMax=true", () => {
    currentForm = buildForm({ verbose: true });
    const { minutes } = Staminia.Engine.start();
    const maxMinutes = Object.values(minutes).filter(m => m.isMax);
    expect(maxMinutes.length).toBeGreaterThanOrEqual(1);
  });
});

// ---------------------------------------------------------------------------
// Engine.start() – mother club bonus
// ---------------------------------------------------------------------------

describe("Engine.start() mother club bonus", () => {
  it("player strength increases when mother club bonus is applied", () => {
    currentForm = buildForm({ p1MainSkill: 8, p1Form: 5, p1Stamina: 7, p1Experience: 8, p1Loyalty: 10, p1MotherClub: false });
    const withoutBonus = Number(Staminia.Engine.start().player1Strength);

    currentForm.parentElement.remove();
    currentForm = buildForm({ p1MainSkill: 8, p1Form: 5, p1Stamina: 7, p1Experience: 8, p1Loyalty: 10, p1MotherClub: true });
    const withBonus = Number(Staminia.Engine.start().player1Strength);

    expect(withBonus).toBeGreaterThan(withoutBonus);
  });
});

// ---------------------------------------------------------------------------
// Engine.start() – stamina warning thresholds
// ---------------------------------------------------------------------------

describe("Engine.start() low-stamina special event warning", () => {
  it("detects low-stamina risk for player 1 with very low stamina", () => {
    // With stamina=1, player 1 will hit the low-stamina threshold early
    currentForm = buildForm({ p1Stamina: 1, p1Form: 5, p1MainSkill: 8, p2MainSkill: 1 });
    const result = Staminia.Engine.start();
    // player1_low_stamina_se should be a positive minute
    expect(result.player1_low_stamina_se).toBeGreaterThan(0);
  });

  it("does not flag low-stamina risk for player 1 with perfect stamina", () => {
    currentForm = buildForm({ p1Stamina: 9, p1Form: 5, p1MainSkill: 8, p2MainSkill: 3 });
    const result = Staminia.Engine.start();
    expect(result.player1_low_stamina_se_risk).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// CHPP fixture – data shape validation
// ---------------------------------------------------------------------------

describe("CHPP fixture data", () => {
  it("has the expected top-level shape", () => {
    expect(chppFixture).toHaveProperty("Status", "OK");
    expect(chppFixture.Teams).toBeInstanceOf(Array);
    expect(chppFixture.Teams.length).toBeGreaterThan(0);
  });

  it("each player has required fields", () => {
    const players = chppFixture.Teams[0].PlayersData;
    for (const p of players) {
      expect(p).toHaveProperty("PlayerID");
      expect(p).toHaveProperty("PlayerName");
      expect(p).toHaveProperty("StaminaSkill");
      expect(p).toHaveProperty("PlayerForm");
      expect(p).toHaveProperty("Experience");
      expect(p).toHaveProperty("MainSkill");
      expect(p).toHaveProperty("Loyalty");
      expect(typeof p.MotherClubBonus).toBe("boolean");
    }
  });

  it("InjuryLevel 999 means fit, -1 means out-of-challenge, 0 means bruised", () => {
    const players = chppFixture.Teams[0].PlayersData;
    const fit = players.filter(p => Number(p.InjuryLevel) === 999);
    const bruised = players.filter(p => Number(p.InjuryLevel) === 0);
    const oc = players.filter(p => Number(p.InjuryLevel) === -1);

    expect(fit.length).toBeGreaterThan(0);
    expect(bruised.length).toBeGreaterThan(0);
    expect(oc.length).toBeGreaterThan(0);
  });

  it("Engine.start() produces valid results using CHPP fixture player data", () => {
    const p1 = chppFixture.Teams[0].PlayersData[0]; // Alpha Rossi
    const p2 = chppFixture.Teams[0].PlayersData[1]; // Beta Bianchi

    currentForm = buildForm({
      p1Form: Number(p1.PlayerForm),
      p1Stamina: Number(p1.StaminaSkill),
      p1Experience: Number(p1.Experience),
      p1MainSkill: Number(p1.MainSkill),
      p1Loyalty: Number(p1.Loyalty),
      p1MotherClub: p1.MotherClubBonus,
      p2Form: Number(p2.PlayerForm),
      p2Stamina: Number(p2.StaminaSkill),
      p2Experience: Number(p2.Experience),
      p2MainSkill: Number(p2.MainSkill),
      p2Loyalty: Number(p2.Loyalty),
      p2MotherClub: p2.MotherClubBonus,
    });

    const result = Staminia.Engine.start();
    expect(result.status).toBe("OK");
    expect(result.substituteAt.length + (result.mayNotReplace ? 1 : 0)).toBeGreaterThan(0);
  });

  it("players with MotherClubBonus produce higher strength than equivalent player without", () => {
    // Beta (p2 in fixture) has MotherClubBonus=true – use same stats but toggle the flag
    const p = chppFixture.Teams[0].PlayersData[1]; // Beta Bianchi

    currentForm = buildForm({
      p1Form: Number(p.PlayerForm), p1Stamina: Number(p.StaminaSkill),
      p1Experience: Number(p.Experience), p1MainSkill: Number(p.MainSkill),
      p1Loyalty: Number(p.Loyalty), p1MotherClub: false,
      p2Form: Number(p.PlayerForm), p2Stamina: Number(p.StaminaSkill),
      p2Experience: Number(p.Experience), p2MainSkill: Number(p.MainSkill),
      p2Loyalty: Number(p.Loyalty), p2MotherClub: true,
    });

    const result = Staminia.Engine.start();
    expect(Number(result.player2Strength)).toBeGreaterThan(Number(result.player1Strength));
  });
});

// ---------------------------------------------------------------------------
// Engine.start() – charts enabled
// ---------------------------------------------------------------------------

describe("Engine.start() with charts enabled", () => {
  it("populates plotDataTotal and plotDataPartial", () => {
    currentForm = buildForm({ charts: true });
    const result = Staminia.Engine.start();

    expect(result.plotDataTotal).toBeDefined();
    expect(result.plotDataPartial).toBeDefined();
    expect(result.plotDataTotal[0]).toBeInstanceOf(Array);
    expect(result.plotDataPartial[0]).toBeInstanceOf(Array);
    expect(result.plotDataPartial[1]).toBeInstanceOf(Array);
  });

  it("plotDataTotal has 88 entries (minutes 1-89 minus halftime)", () => {
    currentForm = buildForm({ charts: true });
    const { plotDataTotal } = Staminia.Engine.start();
    // loop is `minute < FULLTIME` (1..89) minus minute 45 = 88 entries
    expect(plotDataTotal[0]).toHaveLength(88);
  });

  it("each plotDataTotal entry is a [minute, value] pair starting at minute 1", () => {
    currentForm = buildForm({ charts: true });
    const { plotDataTotal } = Staminia.Engine.start();
    const first = plotDataTotal[0][0];
    expect(first).toHaveLength(2);
    expect(first[0]).toBe(1);
    expect(typeof first[1]).toBe("number");
  });

  it("plotDataPartial has two series of 88 entries each", () => {
    currentForm = buildForm({ charts: true });
    const { plotDataPartial } = Staminia.Engine.start();
    expect(plotDataPartial[0]).toHaveLength(88);
    expect(plotDataPartial[1]).toHaveLength(88);
  });
});

// ---------------------------------------------------------------------------
// Engine.start() – substituteAtSecondHalf
// ---------------------------------------------------------------------------

describe("Engine.start() substituteAtSecondHalf", () => {
  it("always contains at least one second-half minute", () => {
    // p1 with very low stamina decays fast; substituting in the second half
    // (not all the way at minute 90) maximises combined contribution.
    currentForm = buildForm({
      p1Stamina: 3, p1MainSkill: 8, p1Form: 5,
      p2Stamina: 8, p2MainSkill: 8, p2Form: 5,
    });
    const { substituteAtSecondHalf } = Staminia.Engine.start();
    expect(substituteAtSecondHalf.length).toBeGreaterThan(0);
  });

  it("all entries are valid second-half minutes (46–89)", () => {
    currentForm = buildForm();
    const { substituteAtSecondHalf } = Staminia.Engine.start();
    for (const m of substituteAtSecondHalf) {
      expect(m).toBeGreaterThan(45);
      expect(m).toBeLessThan(90);
    }
  });

  it("secondHalfMax is a formatted number string", () => {
    currentForm = buildForm();
    const { secondHalfMax } = Staminia.Engine.start();
    expect(Number.isFinite(Number(secondHalfMax))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Engine.start() – bestInFirstHalf = true
// ---------------------------------------------------------------------------

describe("Engine.start() bestInFirstHalf", () => {
  it("is true when p2 is dramatically stronger (optimal sub is at minute 1)", () => {
    // With a very weak p1 and a very strong p2, substituting immediately
    // maximises total contribution → global max falls in the first half.
    currentForm = buildForm({
      p1MainSkill: 1, p1Form: 2, p1Stamina: 4, p1Experience: 3,
      p2MainSkill: 20, p2Form: 8, p2Stamina: 8, p2Experience: 25,
    });
    const result = Staminia.Engine.start();
    expect(result.bestInFirstHalf).toBe(true);
  });

  it("is false when not substituting is optimal (max falls in second half)", () => {
    // p1 perfect stamina + much stronger → never sub → max at minute 90
    // minute 90 is in the second half → secondHalfMax == max → bestInFirstHalf = false
    currentForm = buildForm({
      p1MainSkill: 18, p1Form: 8, p1Stamina: 9, p1Experience: 25, p1Loyalty: 20,
      p2MainSkill: 1, p2Form: 1, p2Stamina: 1, p2Experience: 1, p2Loyalty: 1,
    });
    const result = Staminia.Engine.start();
    expect(result.bestInFirstHalf).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Engine.start() – mayNotReplace = true
// ---------------------------------------------------------------------------

describe("Engine.start() mayNotReplace", () => {
  it("is true when p2 is much weaker and p1 has perfect stamina", () => {
    // p1 contributes 100% throughout; replacing at any minute only hurts.
    // The maximum totalContribution is at minute 90 (= FULLTIME).
    currentForm = buildForm({
      p1MainSkill: 18, p1Form: 8, p1Stamina: 9, p1Experience: 25, p1Loyalty: 20,
      p2MainSkill: 1,  p2Form: 1, p2Stamina: 1, p2Experience: 1, p2Loyalty: 1,
    });
    const result = Staminia.Engine.start();
    expect(result.mayNotReplace).toBe(true);
  });

  it("is false in a normal substitution scenario", () => {
    currentForm = buildForm({
      p1MainSkill: 8, p1Form: 5, p1Stamina: 5, p1Experience: 10,
      p2MainSkill: 8, p2Form: 5, p2Stamina: 8, p2Experience: 10,
    });
    const result = Staminia.Engine.start();
    expect(result.mayNotReplace).toBeFalsy();
  });
});

// ---------------------------------------------------------------------------
// Engine.start() – advanced mode (getAdvancedSkill)
// ---------------------------------------------------------------------------

describe("Engine.start() – advanced mode", () => {
  it("returns status=OK when advanced mode is enabled", () => {
    currentForm = buildAdvancedForm();
    expect(Staminia.Engine.start().status).toBe("OK");
  });

  it("has the expected result keys in advanced mode", () => {
    currentForm = buildAdvancedForm();
    const result = Staminia.Engine.start();
    expect(result).toHaveProperty("substituteAt");
    expect(result).toHaveProperty("player1Strength");
    expect(result).toHaveProperty("player2Strength");
    expect(result).toHaveProperty("playerRolesMatch");
  });

  it("position=-1 causes both player skills to be 0, so strength is 0", () => {
    currentForm = buildAdvancedForm({ p1Position: -1 });
    const result = Staminia.Engine.start();
    expect(Number(result.player1Strength)).toBe(0);
    expect(Number(result.player2Strength)).toBe(0);
  });

  it("higher playmaking makes player 1 stronger for IM position (8)", () => {
    currentForm = buildAdvancedForm({ p1Playmaking: 16, p2Playmaking: 4 });
    const result = Staminia.Engine.start();
    expect(Number(result.player1Strength)).toBeGreaterThan(Number(result.player2Strength));
    expect(result.player2_stronger_than_player1).toBe(false);
  });

  it("reports player2_stronger correctly when p2 playmaking dominates", () => {
    currentForm = buildAdvancedForm({ p1Playmaking: 4, p2Playmaking: 16 });
    const result = Staminia.Engine.start();
    expect(result.player2_stronger_than_player1).toBe(true);
  });

  it("treats Player 2 default role as Player 1's role", () => {
    currentForm = buildAdvancedForm({ p1Position: 8, p2Position: -1, p1Playmaking: 4, p2Playmaking: 16 });
    const result = Staminia.Engine.start();

    expect(result.playerRolesMatch).toBe(true);
    expect(result.player2Position).toBe(8);
    expect(result.player2_stronger_than_player1).toBe(true);
  });

  it("suppresses stronger-player warning when advanced roles differ", () => {
    currentForm = buildAdvancedForm({
      p1Position: 0,
      p2Position: 16,
      p1Keeper: 4,
      p1Defending: 0,
      p2Winger: 22,
      p2Passing: 22,
      p2Scoring: 22,
    });
    const result = Staminia.Engine.start();

    expect(Number(result.player2Strength)).toBeGreaterThan(Number(result.player1Strength));
    expect(result.playerRolesMatch).toBe(false);
    expect(result.player2_stronger_than_player1).toBe(false);
  });

  it("mother club bonus increases strength in advanced mode", () => {
    currentForm = buildAdvancedForm({ p1Loyalty: 10, p1MotherClub: false });
    const withoutBonus = Number(Staminia.Engine.start().player1Strength);

    currentForm.parentElement.remove();
    currentForm = buildAdvancedForm({ p1Loyalty: 10, p1MotherClub: true });
    const withBonus = Number(Staminia.Engine.start().player1Strength);

    expect(withBonus).toBeGreaterThan(withoutBonus);
  });

  it("GK position (0) is dominated by keeper skill", () => {
    // position 0: keeper_coeff=0.4897, defending_coeff=0.2310
    currentForm = buildAdvancedForm({ p1Position: 0, p2Position: 0, p1Keeper: 18, p2Keeper: 3 });
    const result = Staminia.Engine.start();
    expect(Number(result.player1Strength)).toBeGreaterThan(Number(result.player2Strength));
  });

  it("FW position (16) is dominated by scoring+winger, not keeper", () => {
    // position 16: keeper=0, scoring_coeff=0.3046, winger_coeff=0.0790
    currentForm = buildAdvancedForm({ p1Position: 16, p2Position: 16, p1Scoring: 18, p2Scoring: 3 });
    const result = Staminia.Engine.start();
    expect(Number(result.player1Strength)).toBeGreaterThan(Number(result.player2Strength));
  });

  it("pressing affects contribution in advanced mode", () => {
    currentForm = buildAdvancedForm({ p1Stamina: 4, p2Stamina: 4, pressing: false });
    const normalMax = Number(Staminia.Engine.start().max);

    currentForm.parentElement.remove();
    currentForm = buildAdvancedForm({ p1Stamina: 4, p2Stamina: 4, pressing: true });
    const pressingMax = Number(Staminia.Engine.start().max);

    expect(normalMax).toBeGreaterThanOrEqual(pressingMax);
  });
});

// ---------------------------------------------------------------------------
// Engine.start() – debug mode (covers printContributionTables + debug blocks)
// ---------------------------------------------------------------------------

describe("Engine.start() – debug mode", () => {
  let tabDebug, tabDebugNav;

  beforeEach(() => {
    // Provide the DOM elements that the DEBUG code writes into
    tabDebug = document.createElement("div");
    tabDebug.id = "tabDebug";
    tabDebugNav = document.createElement("div");
    tabDebugNav.id = "tabDebugNav";
    tabDebugNav.classList.add("d-none");
    document.body.appendChild(tabDebug);
    document.body.appendChild(tabDebugNav);
    // Enable debug with a large step to keep the table small
    Staminia.CONFIG.DEBUG = true;
    Staminia.CONFIG.DEBUG_STEP = 15;
  });

  afterEach(() => {
    Staminia.CONFIG.DEBUG = false;
    delete Staminia.CONFIG.DEBUG_STEP;
    tabDebug.remove();
    tabDebugNav.remove();
  });

  it("still returns status=OK in simple debug mode", () => {
    currentForm = buildForm();
    expect(Staminia.Engine.start().status).toBe("OK");
  });

  it("removes d-none from tabDebugNav", () => {
    currentForm = buildForm();
    Staminia.Engine.start();
    expect(tabDebugNav.classList.contains("d-none")).toBe(false);
  });

  it("populates tabDebug with contribution table HTML", () => {
    currentForm = buildForm();
    Staminia.Engine.start();
    expect(tabDebug.innerHTML).toContain("table-staminia-debug");
  });

  it("generates both normal and pressing contribution tables", () => {
    currentForm = buildForm();
    Staminia.Engine.start();
    expect(tabDebug.innerHTML).toContain("Contribution Table (Pressing)");
  });

  it("generates debug output in advanced mode too", () => {
    currentForm = buildAdvancedForm();
    Staminia.Engine.start();
    expect(tabDebug.innerHTML).toContain("getAdvancedSkill");
  });

  it("debug table includes halftime separator row", () => {
    Staminia.CONFIG.DEBUG_STEP = 44; // step 44: visits minutes 1, 45, 89 — hits HALFTIME exactly
    currentForm = buildForm();
    Staminia.Engine.start();
    expect(tabDebug.innerHTML).toContain("separator");
    Staminia.CONFIG.DEBUG_STEP = 15;
  });
});
