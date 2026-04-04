/**
 * Integration tests for main.js — the full page controller.
 *
 * main.js runs DOM queries at module-load time (addEventListener calls), so
 * the complete page fixture must be in the document BEFORE the module is
 * imported. We use a single dynamic import inside beforeAll for this reason.
 *
 * What these tests cover (main.js was previously at 0%):
 *   • Exports placed on Staminia (format, number_format, isChartsEnabled, …)
 *   • number_format / format helper functions
 *   • Full form-submission pipeline (engine → alerts → tab visibility)
 *   • verbose mode (contribution table rendered)
 *   • switch-players button swapping field values
 *   • reset button clearing alerts and hiding tabs
 *   • CONFIG initialisation (FORM_ID, predictions reference)
 */

import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";
import Staminia from "../src/staminia.js";
import "../src/engine.js";

// ---------------------------------------------------------------------------
// chart.js must be mocked before main.js is imported (main.js → charts.js →
// chart.js would otherwise crash without a real canvas context).
// ---------------------------------------------------------------------------
const MockChart = vi.hoisted(() => {
  const ctor = vi.fn(function(ctx, cfg) {
    this.data = cfg.data;
    this.options = cfg.options;
    this.destroy = vi.fn();
    this.resize = vi.fn();
    this.update = vi.fn();
  });
  return ctor;
});

vi.mock("chart.js", () => {
  MockChart.register = vi.fn();
  return {
    Chart: MockChart,
    registerables: [],
    LineController: {},
    LineElement: {},
    PointElement: {},
    LinearScale: {},
    CategoryScale: {},
    Filler: {},
    Tooltip: {},
    Legend: {},
  };
});

// ---------------------------------------------------------------------------
// Helpers used to build the page fixture
// ---------------------------------------------------------------------------

/** Build a <select name="…"> with options [min..max], selecting `value`. */
const selectEl = (name, value, min = 1, max = 20) => {
  const opts = Array.from({ length: max - min + 1 }, (_, i) => {
    const v = min + i;
    return `<option value="${v}"${v === value ? " selected" : ""}>${v}</option>`;
  }).join("");
  return `<select name="${name}">${opts}</select>`;
};

// ---------------------------------------------------------------------------
// Full page fixture
// All element IDs that main.js touches at module load time must be present.
// Elements accessed only inside event-handler callbacks are also included so
// that submit / reset / switch-players can run end-to-end without throwing.
// ---------------------------------------------------------------------------
const PAGE_HTML = `
  <form id="formPlayersInfo">
    ${selectEl("Staminia_Simple_Player_1_Form", 5, 1, 8)}
    ${selectEl("Staminia_Simple_Player_1_Stamina", 7, 1, 9)}
    ${selectEl("Staminia_Simple_Player_1_Experience", 8)}
    ${selectEl("Staminia_Simple_Player_1_MainSkill", 8)}
    ${selectEl("Staminia_Simple_Player_1_Loyalty", 10)}
    <input type="checkbox" name="Staminia_Player_1_MotherClubBonus">
    <input type="text" name="Staminia_Advanced_Player_1_Form" value="5.00">
    <input type="text" name="Staminia_Advanced_Player_1_Stamina" value="7.00">
    <input type="text" name="Staminia_Advanced_Player_1_Experience" value="8.00">
    <input type="text" name="Staminia_Advanced_Player_1_Loyalty" value="10.00">

    ${selectEl("Staminia_Simple_Player_2_Form", 4, 1, 8)}
    ${selectEl("Staminia_Simple_Player_2_Stamina", 5, 1, 9)}
    ${selectEl("Staminia_Simple_Player_2_Experience", 6)}
    ${selectEl("Staminia_Simple_Player_2_MainSkill", 6)}
    ${selectEl("Staminia_Simple_Player_2_Loyalty", 15)}
    <input type="checkbox" name="Staminia_Player_2_MotherClubBonus">
    <input type="text" name="Staminia_Advanced_Player_2_Form" value="4.00">
    <input type="text" name="Staminia_Advanced_Player_2_Stamina" value="5.00">
    <input type="text" name="Staminia_Advanced_Player_2_Experience" value="6.00">
    <input type="text" name="Staminia_Advanced_Player_2_Loyalty" value="15.00">

    <input type="checkbox" id="Staminia_Options_AdvancedMode"
           name="Staminia_Options_AdvancedMode">
    <input type="checkbox" id="Staminia_Options_Pressing"
           name="Staminia_Options_Pressing">
    <input type="checkbox" id="Staminia_Options_Charts"
           name="Staminia_Options_Charts">
    <input type="checkbox" id="Staminia_Options_VerboseMode"
           name="Staminia_Options_VerboseMode">
    <input type="checkbox" id="Staminia_Options_OnlySecondHalf"
           name="Staminia_Options_OnlySecondHalf">

    <table id="playersInfoTable">
      <tbody>
        <tr class="advanced d-none">
          <td>Position</td>
          <td>
            <select id="Staminia_Advanced_Player_1_Position" name="Staminia_Advanced_Player_1_Position">
              <option value="0">GK</option>
              <option value="8" selected>IM</option>
              <option value="16">FW</option>
            </select>
          </td>
          <td>
            <select id="Staminia_Advanced_Player_2_Position" name="Staminia_Advanced_Player_2_Position">
              <option value="-1" selected>Same as Player 1</option>
              <option value="0">GK</option>
              <option value="8">IM</option>
              <option value="16">FW</option>
            </select>
          </td>
        </tr>
        <tr class="advanced d-none" id="Staminia_Advanced_Skill_Keeper">
          <td>Keeper</td>
          <td><input type="text" class="ignore" name="Staminia_Advanced_Player_1_Skill_Keeper" value="4.00"></td>
          <td><input type="text" class="ignore" name="Staminia_Advanced_Player_2_Skill_Keeper" value="3.00"></td>
        </tr>
        <tr class="advanced d-none" id="Staminia_Advanced_Skill_Defending">
          <td>Defending</td>
          <td><input type="text" class="ignore" name="Staminia_Advanced_Player_1_Skill_Defending" value="7.00"></td>
          <td><input type="text" class="ignore" name="Staminia_Advanced_Player_2_Skill_Defending" value="6.00"></td>
        </tr>
        <tr class="advanced d-none" id="Staminia_Advanced_Skill_Playmaking">
          <td>Playmaking</td>
          <td><input type="text" class="ignore" name="Staminia_Advanced_Player_1_Skill_Playmaking" value="10.00"></td>
          <td><input type="text" class="ignore" name="Staminia_Advanced_Player_2_Skill_Playmaking" value="7.00"></td>
        </tr>
        <tr class="advanced d-none" id="Staminia_Advanced_Skill_Winger">
          <td>Winger</td>
          <td><input type="text" class="ignore" name="Staminia_Advanced_Player_1_Skill_Winger" value="5.00"></td>
          <td><input type="text" class="ignore" name="Staminia_Advanced_Player_2_Skill_Winger" value="4.00"></td>
        </tr>
        <tr class="advanced d-none" id="Staminia_Advanced_Skill_Passing">
          <td>Passing</td>
          <td><input type="text" class="ignore" name="Staminia_Advanced_Player_1_Skill_Passing" value="6.00"></td>
          <td><input type="text" class="ignore" name="Staminia_Advanced_Player_2_Skill_Passing" value="5.00"></td>
        </tr>
        <tr class="advanced d-none" id="Staminia_Advanced_Skill_Scoring">
          <td>Scoring</td>
          <td><input type="text" class="ignore" name="Staminia_Advanced_Player_1_Skill_Scoring" value="3.00"></td>
          <td><input type="text" class="ignore" name="Staminia_Advanced_Player_2_Skill_Scoring" value="4.00"></td>
        </tr>
      </tbody>
    </table>
  </form>

  <form id="optionForm"></form>

  <div id="AlertsContainer"></div>
  <button id="calculate"></button>
  <button id="switchPlayers"></button>
  <button id="resetApp"></button>
  <button id="getLink"></button>

  <div id="tabChartsNav" class="d-none"><a href="#tabCharts"></a></div>
  <div id="tabContributionsNav" class="d-none"><a href="#tabContributions"></a></div>
  <div id="tabDebugNav" class="d-none"><a href="#tabDebug"></a></div>
  <div id="tabCharts">
    <div id="chartTotal"></div>
    <div id="chartPartials"></div>
  </div>
  <div id="tabContributions"></div>
  <div id="tabDebug"></div>

  <select id="CHPP_Player_1"></select>
  <select id="CHPP_Player_2"></select>
  <select id="CHPP_Team"></select>
  <select id="CHPP_Players_SortBy"></select>
  <button id="CHPP_Refresh_Data" data-loading-text="Loading…"></button>
  <a id="CHPP_Revoke_Auth_Link"></a>

  <input id="performanceAt90" type="number" value="100">
  <span id="staminaSubskillsEstimationTarget"></span>
  <span id="or-higher"></span>
  <button id="themeToggle" data-next="dark"></button>
  <div id="Staminia_Options_Predictions_Type" class="d-none"></div>
`;

// ---------------------------------------------------------------------------
// Stubs
// ---------------------------------------------------------------------------

const messages = {
  replace: "Replace",
  at_minute: "at minute",
  at_minutes: "at minutes",
  do_not_replace: "Do not replace",
  may_not_replace: " (may not replace)",
  player2_stronger_than_player1: "Player 2 is stronger than player 1",
  player1_low_stamina_se: (n) => `P1 low stamina at minute ${n}`,
  player2_low_stamina_se: (n) => `P2 low stamina at minute ${n}`,
  best_in_first_half: "Best performance is in first half",
  status_warning: "Warning",
  validation_range: (min, max) => `Must be between ${min} and ${max}`,
  validation_error: "1 validation error",
  validation_errors: (n) => `${n} validation errors`,
  strength_table: "Strength Table",
  player1: "Player 1",
  player2: "Player 2",
  strength: "Strength",
  strength_st_independent: "Strength (stamina independent)",
  used_in_calculation: "Used in calculation",
  substitution_minute: "Minute",
  total_contribution: "Total",
  contribution_percent: "%",
  p1_contrib: "P1",
  p2_contrib: "P2",
  notes: "Notes",
  contribution_table: "Contribution Table",
  p1_low_stamina: "P1 low stamina",
  p2_low_stamina: "P2 low stamina",
  revoke_auth_confirm: "Revoke auth?",
};

const bootstrapMock = {
  Tab: { getOrCreateInstance: vi.fn(() => ({ show: vi.fn() })) },
  Modal: { getOrCreateInstance: vi.fn(() => ({ toggle: vi.fn() })) },
  Collapse: { getOrCreateInstance: vi.fn(() => ({ show: vi.fn() })) },
  Tooltip: vi.fn(),
};

// ---------------------------------------------------------------------------
// Setup: build DOM, set globals, then import main.js once
// ---------------------------------------------------------------------------

beforeAll(async () => {
  document.body.innerHTML = PAGE_HTML;

  // jsdom doesn't implement the HTMLFormElement named-element getter from the
  // HTML spec (the feature that lets you write form["fieldName"]).  The same
  // shim used in engine-integration.test.js is applied here.
  const form = document.querySelector("#formPlayersInfo");
  for (const el of Array.from(form.elements)) {
    if (el.name) {
      Object.defineProperty(form, el.name, {
        get() { return this.elements.namedItem(el.name); },
        configurable: true,
      });
    }
  }

  window.bootstrap = bootstrapMock;
  Staminia.messages = messages;
  Staminia.icons = { clock: "⏰", "triangle-exclamation": "⚠" };
  await import("../src/main.js");
});

// Reset shared mutable state between tests so they don't bleed into each other
const resetForm = () => {
  const f = (name) => document.querySelector(`[name="${name}"]`);
  f("Staminia_Simple_Player_1_Form").value = "5";
  f("Staminia_Simple_Player_1_Stamina").value = "7";
  f("Staminia_Simple_Player_1_Experience").value = "8";
  f("Staminia_Simple_Player_1_MainSkill").value = "8";
  f("Staminia_Simple_Player_1_Loyalty").value = "10";
  f("Staminia_Player_1_MotherClubBonus").checked = false;
  f("Staminia_Advanced_Player_1_Form").value = "5.00";
  f("Staminia_Advanced_Player_1_Stamina").value = "7.00";
  f("Staminia_Advanced_Player_1_Experience").value = "8.00";
  f("Staminia_Advanced_Player_1_Loyalty").value = "10.00";
  f("Staminia_Advanced_Player_1_Position").value = "8";
  f("Staminia_Advanced_Player_1_Skill_Keeper").value = "4.00";
  f("Staminia_Advanced_Player_1_Skill_Defending").value = "7.00";
  f("Staminia_Advanced_Player_1_Skill_Playmaking").value = "10.00";
  f("Staminia_Advanced_Player_1_Skill_Winger").value = "5.00";
  f("Staminia_Advanced_Player_1_Skill_Passing").value = "6.00";
  f("Staminia_Advanced_Player_1_Skill_Scoring").value = "3.00";
  f("Staminia_Simple_Player_2_Form").value = "4";
  f("Staminia_Simple_Player_2_Stamina").value = "5";
  f("Staminia_Simple_Player_2_Experience").value = "6";
  f("Staminia_Simple_Player_2_MainSkill").value = "6";
  f("Staminia_Simple_Player_2_Loyalty").value = "15";
  f("Staminia_Player_2_MotherClubBonus").checked = false;
  f("Staminia_Advanced_Player_2_Form").value = "4.00";
  f("Staminia_Advanced_Player_2_Stamina").value = "5.00";
  f("Staminia_Advanced_Player_2_Experience").value = "6.00";
  f("Staminia_Advanced_Player_2_Loyalty").value = "15.00";
  f("Staminia_Advanced_Player_2_Position").value = "-1";
  f("Staminia_Advanced_Player_2_Skill_Keeper").value = "3.00";
  f("Staminia_Advanced_Player_2_Skill_Defending").value = "6.00";
  f("Staminia_Advanced_Player_2_Skill_Playmaking").value = "7.00";
  f("Staminia_Advanced_Player_2_Skill_Winger").value = "4.00";
  f("Staminia_Advanced_Player_2_Skill_Passing").value = "5.00";
  f("Staminia_Advanced_Player_2_Skill_Scoring").value = "4.00";
};

beforeEach(() => {
  document.getElementById("AlertsContainer").innerHTML = "";
  document.getElementById("tabChartsNav").classList.add("d-none");
  document.getElementById("tabContributionsNav").classList.add("d-none");
  document.getElementById("tabDebugNav").classList.add("d-none");
  document.getElementById("chartTotal").innerHTML = "";
  document.getElementById("chartPartials").innerHTML = "";
  document.getElementById("tabContributions").innerHTML = "";
  document.getElementById("tabDebug").innerHTML = "";
  document.getElementById("Staminia_Options_Charts").checked = false;
  document.getElementById("Staminia_Options_VerboseMode").checked = false;
  document.getElementById("Staminia_Options_Pressing").checked = false;
  document.getElementById("Staminia_Options_OnlySecondHalf").checked = false;
  document.getElementById("Staminia_Options_AdvancedMode").checked = false;
  document.getElementById("calculate").classList.remove("disabled");
  resetForm();
});

const submitForm = () => {
  document.querySelector("#formPlayersInfo").dispatchEvent(
    new Event("submit", { bubbles: true, cancelable: true })
  );
};

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

describe("Exports placed on Staminia by main.js", () => {
  it("exports Staminia.number_format", () => {
    expect(typeof Staminia.number_format).toBe("function");
  });

  it("exports Staminia.format", () => {
    expect(typeof Staminia.format).toBe("function");
  });

  it("exports Staminia.isChartsEnabled", () => {
    expect(typeof Staminia.isChartsEnabled).toBe("function");
  });

  it("exports Staminia.isVerboseModeEnabled", () => {
    expect(typeof Staminia.isVerboseModeEnabled).toBe("function");
  });

  it("exports Staminia.isPressingEnabled", () => {
    expect(typeof Staminia.isPressingEnabled).toBe("function");
  });

  it("exports Staminia.isAdvancedModeEnabled", () => {
    expect(typeof Staminia.isAdvancedModeEnabled).toBe("function");
  });
});

// ---------------------------------------------------------------------------
// number_format helper
// ---------------------------------------------------------------------------

describe("Staminia.number_format", () => {
  it("rounds to 2 decimal places", () => {
    expect(Staminia.number_format(3.14159, 2)).toBe("3.14");
  });

  it("pads trailing zeros", () => {
    expect(Staminia.number_format(3.1, 2)).toBe("3.10");
  });

  it("adds thousands separator", () => {
    expect(Staminia.number_format(1234567.89, 2)).toBe("1,234,567.89");
  });

  it("accepts string input", () => {
    expect(Staminia.number_format("8.473684210526315", 2)).toBe("8.47");
  });

  it("defaults to 0 decimal places", () => {
    expect(Staminia.number_format(42.9)).toBe("43");
  });

  it("uses a custom decimal separator", () => {
    expect(Staminia.number_format(3.14, 2, ",")).toBe("3,14");
  });
});

// ---------------------------------------------------------------------------
// format helper
// ---------------------------------------------------------------------------

describe("Staminia.format", () => {
  it("substitutes a single {0} placeholder", () => {
    expect(Staminia.format("Hello {0}!", "world")).toBe("Hello world!");
  });

  it("substitutes multiple placeholders", () => {
    expect(Staminia.format("{0} and {1}", "foo", "bar")).toBe("foo and bar");
  });

  it("returns a curried function when called with one argument", () => {
    const fn = Staminia.format("Replace {0} with {1}");
    expect(typeof fn).toBe("function");
    expect(fn("A", "B")).toBe("Replace A with B");
  });
});

// ---------------------------------------------------------------------------
// isChartsEnabled / isVerboseModeEnabled reflect checkbox state
// ---------------------------------------------------------------------------

describe("Staminia.isChartsEnabled / isVerboseModeEnabled", () => {
  it("returns false when checkboxes are unchecked", () => {
    expect(Staminia.isChartsEnabled()).toBe(false);
    expect(Staminia.isVerboseModeEnabled()).toBe(false);
  });

  it("returns true when checkboxes are checked", () => {
    document.getElementById("Staminia_Options_Charts").checked = true;
    document.getElementById("Staminia_Options_VerboseMode").checked = true;
    expect(Staminia.isChartsEnabled()).toBe(true);
    expect(Staminia.isVerboseModeEnabled()).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// CONFIG initialised by main.js
// ---------------------------------------------------------------------------

describe("CONFIG initialised by main.js", () => {
  it("sets FORM_ID to #formPlayersInfo", () => {
    expect(Staminia.CONFIG.FORM_ID).toBe("#formPlayersInfo");
  });

  it("sets predictions to PREDICTIONS_HO by default", () => {
    expect(Staminia.predictions).toBe(Staminia.CONFIG.PREDICTIONS_HO);
  });

  it("PREDICTIONS_HO and PREDICTIONS_ANDREAC are distinct 20×6 matrices", () => {
    expect(Staminia.CONFIG.PREDICTIONS_HO).toHaveLength(20);
    expect(Staminia.CONFIG.PREDICTIONS_ANDREAC).toHaveLength(20);
    expect(Staminia.CONFIG.PREDICTIONS_HO).not.toBe(Staminia.CONFIG.PREDICTIONS_ANDREAC);
  });
});

// ---------------------------------------------------------------------------
// Form submission – substitution result
// ---------------------------------------------------------------------------

describe("Form submission – substitution result", () => {
  it("creates an alert in AlertsContainer after submit", () => {
    submitForm();
    expect(document.getElementById("AlertsContainer").innerHTML).not.toBe("");
  });

  it("creates #formSubstituteAt alert element", () => {
    submitForm();
    expect(document.getElementById("formSubstituteAt")).not.toBeNull();
  });

  it("re-enables #calculate after submission completes", () => {
    submitForm();
    expect(document.getElementById("calculate").classList.contains("disabled")).toBe(false);
  });

  it("shows 'Do not replace' when p1 is much stronger", () => {
    const f = (name) => document.querySelector(`[name="${name}"]`);
    f("Staminia_Simple_Player_1_MainSkill").value = "20";
    f("Staminia_Simple_Player_1_Stamina").value = "9";
    f("Staminia_Simple_Player_2_MainSkill").value = "1";
    f("Staminia_Simple_Player_2_Stamina").value = "1";
    submitForm();
    expect(document.getElementById("AlertsContainer").textContent).toContain(
      messages.do_not_replace
    );
  });

  it("shows substitute minute(s) when p2 is stronger than p1", () => {
    const f = (name) => document.querySelector(`[name="${name}"]`);
    f("Staminia_Simple_Player_1_MainSkill").value = "5";
    f("Staminia_Simple_Player_1_Stamina").value = "3";
    f("Staminia_Simple_Player_2_MainSkill").value = "15";
    f("Staminia_Simple_Player_2_Stamina").value = "9";
    submitForm();
    const body = document.getElementById("formSubstituteAtBody");
    expect(body).not.toBeNull();
    expect(body.textContent).toMatch(/\d/);
  });

  it("shows player2-stronger warning when p2 dominates p1", () => {
    const f = (name) => document.querySelector(`[name="${name}"]`);
    f("Staminia_Simple_Player_1_MainSkill").value = "1";
    f("Staminia_Simple_Player_1_Stamina").value = "1";
    f("Staminia_Simple_Player_2_MainSkill").value = "20";
    f("Staminia_Simple_Player_2_Stamina").value = "9";
    submitForm();
    const warnings = document.getElementById("formWarnings");
    expect(warnings).not.toBeNull();
    expect(warnings.textContent).toContain(messages.player2_stronger_than_player1);
  });
});

// ---------------------------------------------------------------------------
// Form submission – verbose mode
// ---------------------------------------------------------------------------

describe("Form submission – verbose mode", () => {
  it("shows contribution tab nav when verbose mode is enabled", () => {
    document.getElementById("Staminia_Options_VerboseMode").checked = true;
    submitForm();
    expect(
      document.getElementById("tabContributionsNav").classList.contains("d-none")
    ).toBe(false);
  });

  it("populates #tabContributions with an HTML table", () => {
    document.getElementById("Staminia_Options_VerboseMode").checked = true;
    submitForm();
    expect(document.getElementById("tabContributions").innerHTML).toContain("<table");
  });

  it("table includes strength header row", () => {
    document.getElementById("Staminia_Options_VerboseMode").checked = true;
    submitForm();
    expect(document.getElementById("tabContributions").textContent).toContain(
      messages.strength_table
    );
  });

  it("halftime row repeats the table header at minute 46", () => {
    document.getElementById("Staminia_Options_VerboseMode").checked = true;
    submitForm();
    // The table header is duplicated at minute 46 in the contributions table
    const html = document.getElementById("tabContributions").innerHTML;
    const headerCount = (html.match(/<thead>/g) || []).length;
    expect(headerCount).toBeGreaterThanOrEqual(2);
  });
});

// ---------------------------------------------------------------------------
// Form submission – charts mode
// ---------------------------------------------------------------------------

describe("Form submission – charts mode", () => {
  it("shows charts tab nav when charts mode is enabled", () => {
    document.getElementById("Staminia_Options_Charts").checked = true;
    submitForm();
    expect(
      document.getElementById("tabChartsNav").classList.contains("d-none")
    ).toBe(false);
  });

  it("calls bootstrap.Tab.getOrCreateInstance to switch to charts tab", () => {
    bootstrapMock.Tab.getOrCreateInstance.mockClear();
    document.getElementById("Staminia_Options_Charts").checked = true;
    submitForm();
    expect(bootstrapMock.Tab.getOrCreateInstance).toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Advanced mode role handling
// ---------------------------------------------------------------------------

describe("Advanced mode role handling", () => {
  const f = (name) => document.querySelector(`[name="${name}"]`);

  const enableAdvancedMode = () => {
    const advancedModeToggle = document.getElementById("Staminia_Options_AdvancedMode");
    advancedModeToggle.checked = true;
    advancedModeToggle.dispatchEvent(new Event("change", { bubbles: true }));
  };

  it("shows the union of required skill rows and disables irrelevant inputs", () => {
    enableAdvancedMode();
    f("Staminia_Advanced_Player_1_Position").value = "0";
    f("Staminia_Advanced_Player_1_Position").dispatchEvent(new Event("change", { bubbles: true }));
    f("Staminia_Advanced_Player_2_Position").value = "16";
    f("Staminia_Advanced_Player_2_Position").dispatchEvent(new Event("change", { bubbles: true }));

    expect(document.getElementById("Staminia_Advanced_Skill_Keeper").classList.contains("d-none")).toBe(false);
    expect(document.getElementById("Staminia_Advanced_Skill_Scoring").classList.contains("d-none")).toBe(false);
    expect(f("Staminia_Advanced_Player_1_Skill_Keeper").disabled).toBe(false);
    expect(f("Staminia_Advanced_Player_2_Skill_Keeper").disabled).toBe(true);
    expect(f("Staminia_Advanced_Player_1_Skill_Scoring").disabled).toBe(true);
    expect(f("Staminia_Advanced_Player_2_Skill_Scoring").disabled).toBe(false);
  });

  it("does not show the stronger-player warning when advanced roles differ", () => {
    enableAdvancedMode();
    f("Staminia_Advanced_Player_1_Position").value = "0";
    f("Staminia_Advanced_Player_1_Position").dispatchEvent(new Event("change", { bubbles: true }));
    f("Staminia_Advanced_Player_2_Position").value = "16";
    f("Staminia_Advanced_Player_2_Position").dispatchEvent(new Event("change", { bubbles: true }));

    f("Staminia_Advanced_Player_1_Skill_Keeper").value = "4.00";
    f("Staminia_Advanced_Player_1_Skill_Defending").value = "0.00";
    f("Staminia_Advanced_Player_2_Skill_Winger").value = "22.00";
    f("Staminia_Advanced_Player_2_Skill_Passing").value = "22.00";
    f("Staminia_Advanced_Player_2_Skill_Scoring").value = "22.00";

    submitForm();

    const warnings = document.getElementById("formWarnings");
    expect(warnings?.textContent ?? "").not.toContain(messages.player2_stronger_than_player1);
  });
});

// ---------------------------------------------------------------------------
// Switch players button
// ---------------------------------------------------------------------------

describe("Switch players button", () => {
  const f = (name) => document.querySelector(`[name="${name}"]`);

  it("swaps MainSkill values", () => {
    f("Staminia_Simple_Player_1_MainSkill").value = "12";
    f("Staminia_Simple_Player_2_MainSkill").value = "7";
    document.getElementById("switchPlayers").click();
    expect(f("Staminia_Simple_Player_1_MainSkill").value).toBe("7");
    expect(f("Staminia_Simple_Player_2_MainSkill").value).toBe("12");
  });

  it("swaps Stamina values", () => {
    f("Staminia_Simple_Player_1_Stamina").value = "9";
    f("Staminia_Simple_Player_2_Stamina").value = "3";
    document.getElementById("switchPlayers").click();
    expect(f("Staminia_Simple_Player_1_Stamina").value).toBe("3");
    expect(f("Staminia_Simple_Player_2_Stamina").value).toBe("9");
  });

  it("swaps Form values", () => {
    f("Staminia_Simple_Player_1_Form").value = "8";
    f("Staminia_Simple_Player_2_Form").value = "2";
    document.getElementById("switchPlayers").click();
    expect(f("Staminia_Simple_Player_1_Form").value).toBe("2");
    expect(f("Staminia_Simple_Player_2_Form").value).toBe("8");
  });

  it("swaps MotherClubBonus checkboxes", () => {
    f("Staminia_Player_1_MotherClubBonus").checked = true;
    f("Staminia_Player_2_MotherClubBonus").checked = false;
    document.getElementById("switchPlayers").click();
    expect(f("Staminia_Player_1_MotherClubBonus").checked).toBe(false);
    expect(f("Staminia_Player_2_MotherClubBonus").checked).toBe(true);
  });

  it("swaps advanced position values by effective role", () => {
    f("Staminia_Advanced_Player_1_Position").value = "0";
    f("Staminia_Advanced_Player_2_Position").value = "16";
    document.getElementById("switchPlayers").click();
    expect(f("Staminia_Advanced_Player_1_Position").value).toBe("16");
    expect(f("Staminia_Advanced_Player_2_Position").value).toBe("0");
  });

  it("result after switch reflects swapped players", () => {
    // p1 weak, p2 strong → after switch p1 is strong, so "do not replace"
    f("Staminia_Simple_Player_1_MainSkill").value = "1";
    f("Staminia_Simple_Player_1_Stamina").value = "1";
    f("Staminia_Simple_Player_2_MainSkill").value = "20";
    f("Staminia_Simple_Player_2_Stamina").value = "9";
    document.getElementById("switchPlayers").click();
    submitForm();
    expect(document.getElementById("AlertsContainer").textContent).toContain(
      messages.do_not_replace
    );
  });
});

// ---------------------------------------------------------------------------
// Reset button
// ---------------------------------------------------------------------------

describe("Reset button", () => {
  it("clears AlertsContainer", () => {
    submitForm();
    expect(document.getElementById("AlertsContainer").innerHTML).not.toBe("");
    document.getElementById("resetApp").click();
    expect(document.getElementById("AlertsContainer").innerHTML).toBe("");
  });

  it("hides contribution tab nav after reset", () => {
    document.getElementById("Staminia_Options_VerboseMode").checked = true;
    submitForm();
    expect(
      document.getElementById("tabContributionsNav").classList.contains("d-none")
    ).toBe(false);
    document.getElementById("resetApp").click();
    expect(
      document.getElementById("tabContributionsNav").classList.contains("d-none")
    ).toBe(true);
  });

  it("clears contribution table content after reset", () => {
    document.getElementById("Staminia_Options_VerboseMode").checked = true;
    submitForm();
    expect(document.getElementById("tabContributions").innerHTML).not.toBe("");
    document.getElementById("resetApp").click();
    expect(document.getElementById("tabContributions").innerHTML).toBe("");
  });
});
