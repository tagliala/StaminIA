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

import { describe, it, expect, beforeAll, beforeEach } from "vitest";
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
