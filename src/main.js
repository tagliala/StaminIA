import { renderTotalChart, renderPartialsChart, destroyCharts, resizeCharts, updateChartsTheme } from "./charts.js";
import { SAME_AS_PLAYER_1_POSITION, isAdvancedPositionValid, resolveAdvancedPosition } from "./engine.js";
import Staminia from "./staminia.js";
Staminia.CONFIG = Staminia.CONFIG || {};

Object.assign(Staminia.CONFIG, {
  FORM_ID: "#formPlayersInfo",
  OPTION_FORM_ID: "#optionForm",
  TABLE_ID: "#playersInfoTable",
  DEBUG: false,
  DEBUG_STEP: 1,
  AUTOSTART: true,
  PREDICTIONS_ANDREAC: [[0.5036, 0.2310, 0.0, 0.0, 0.0, 0.0], [0.0, 0.3492, 0.1180, 0.0, 0.0, 0.0], [0.0, 0.2514, 0.1590, 0.0, 0.0, 0.0], [0.0, 0.3546, 0.0825, 0.0556, 0.0, 0.0], [0.0, 0.3236, 0.0780, 0.1086, 0.0, 0.0], [0.0, 0.2480, 0.1080, 0.1375, 0.0, 0.0], [0.0, 0.3440, 0.0310, 0.0688, 0.0, 0.0], [0.0, 0.3256, 0.0780, 0.0604, 0.0, 0.0], [0.0, 0.1302, 0.4680, 0.0, 0.1149, 0.0], [0.0, 0.0733, 0.4420, 0.0, 0.1508, 0.0], [0.0, 0.2039, 0.4420, 0.0, 0.0760, 0.0], [0.0, 0.1383, 0.4130, 0.1073, 0.1071, 0.0], [0.0, 0.1314, 0.2180, 0.1848, 0.0669, 0.0], [0.0, 0.0652, 0.1830, 0.2081, 0.0803, 0.0], [0.0, 0.1831, 0.1830, 0.1556, 0.0484, 0.0], [0.0, 0.1341, 0.2760, 0.1350, 0.0671, 0.0], [0.0, 0.0, 0.0, 0.0808, 0.1306, 0.3077], [0.0, 0.0, 0.1950, 0.0550, 0.2189, 0.1778], [0.0, 0.0, 0.1950, 0.0550, 0.2661, 0.1778], [0.0, 0.0, 0.0, 0.0901, 0.1334, 0.2441]],
  PREDICTIONS_HO: [[0.4897, 0.2310, 0.0, 0.0, 0.0, 0.0], [0.0, 0.3492, 0.1140, 0.0, 0.0, 0.0], [0.0, 0.2530, 0.1540, 0.0, 0.0, 0.0], [0.0, 0.3488, 0.0825, 0.0556, 0.0, 0.0], [0.0, 0.3283, 0.0780, 0.1086, 0.0, 0.0], [0.0, 0.2582, 0.1080, 0.1375, 0.0, 0.0], [0.0, 0.3550, 0.0310, 0.0688, 0.0, 0.0], [0.0, 0.3214, 0.0780, 0.0604, 0.0, 0.0], [0.0, 0.1348, 0.4680, 0.0, 0.1148, 0.0], [0.0, 0.0727, 0.4420, 0.0, 0.1475, 0.0], [0.0, 0.1974, 0.4420, 0.0, 0.0760, 0.0], [0.0, 0.1383, 0.4130, 0.1073, 0.1063, 0.0], [0.0, 0.1314, 0.2130, 0.1873, 0.0669, 0.0], [0.0, 0.0629, 0.1780, 0.2193, 0.0814, 0.0], [0.0, 0.1769, 0.1780, 0.1585, 0.0484, 0.0], [0.0, 0.1245, 0.2690, 0.1235, 0.0596, 0.0], [0.0, 0.0, 0.0, 0.0790, 0.1297, 0.3046], [0.0, 0.0, 0.2010, 0.0545, 0.2214, 0.1781], [0.0, 0.0, 0.2010, 0.0545, 0.2519, 0.1781], [0.0, 0.0, 0.0, 0.1150, 0.1323, 0.2632]],
  PR_ENUM_SKILL: {
    Keeper: 0,
    Defending: 1,
    Playmaking: 2,
    Winger: 3,
    Passing: 4,
    Scoring: 5
  }
});

const format = function(source, params) {
  if (arguments.length === 1) {
    return function() {
      const args = [...arguments];
      args.unshift(source);
      return format.apply(this, args);
    };
  }
  if (arguments.length > 2 && params.constructor !== Array) {
    params = [...arguments].slice(1);
  }
  if (params.constructor !== Array) {
    params = [params];
  }
  params.forEach((n, i) => {
    source = source.replace(new RegExp("\\{" + i + "\\}", "g"), n);
  });
  return source;
};

const createSubstitutionAlert = (substituteAtArray, mayNotReplace) => {
  const ranges = [];
  let r = 0;
  let check_with;

  for (let i = 0; i < substituteAtArray.length; i++) {
    const minute = substituteAtArray[i];
    if (!ranges[r]) {
      ranges[r] = [];
      ranges[r].push(minute);
      check_with = minute + 1;
    } else if (minute !== check_with) {
      if (ranges[r][ranges[r].length - 1] !== check_with - 1) {
        ranges[r].push(check_with - 1);
      }
      r++;
      i--;
    } else if (minute === check_with) {
      check_with = minute + 1;
    }
    if (i === substituteAtArray.length - 1) {
      const l = ranges[r].length - 1;
      if (ranges[r][l] !== minute) {
        ranges[r].push(minute);
      }
    }
  }

  const result = [];
  for (const range of ranges) {
    result.push(range.join("-"));
  }

  let title = "";
  let body = "";
  if (substituteAtArray.length > 0) {
    title = "";
    if (substituteAtArray.length === 1) {
      title += `${Staminia.messages.replace} ${Staminia.messages.at_minute}`;
    } else {
      title += `${Staminia.messages.replace} ${Staminia.messages.at_minutes}`;
    }
    body = `<span class="minutes">${result.join(", ")}</span>`;
    if (mayNotReplace) {
      body += `${Staminia.messages.may_not_replace}`;
    }
  } else {
    title = Staminia.messages.do_not_replace;
  }

  document.getElementById("AlertsContainer").insertAdjacentHTML("beforeend", createAlert({
    id: "formSubstituteAt",
    type: "success",
    title: title,
    body: body
  }));
};

const resetAndHideTabs = () => {
  document.getElementById("tabChartsNav").classList.add("d-none");
  document.getElementById("tabContributionsNav").classList.add("d-none");
  document.getElementById("tabDebugNav").classList.add("d-none");
  destroyCharts();
  document.getElementById("chartTotal").innerHTML = "";
  document.getElementById("chartPartials").innerHTML = "";
  document.getElementById("tabContributions").innerHTML = "";
  document.getElementById("tabDebug").innerHTML = "";
};

const FORM_ID = Staminia.CONFIG.FORM_ID;
const OPTION_FORM_ID = Staminia.CONFIG.OPTION_FORM_ID;
const TABLE_ID = Staminia.CONFIG.TABLE_ID;
const DEBUG = Staminia.CONFIG.DEBUG;
const AUTOSTART = Staminia.CONFIG.AUTOSTART;
Staminia.predictions = Staminia.CONFIG.PREDICTIONS_HO;

const ADVANCED_PLAYER_IDS = [1, 2];
const ADVANCED_SKILL_NAMES = Object.keys(Staminia.CONFIG.PR_ENUM_SKILL);

const getAdvancedPositionFieldName = (playerId) => `Staminia_Advanced_Player_${playerId}_Position`;

const isSkillUsedForPosition = (position, skill) => (
  isAdvancedPositionValid(position) &&
  Staminia.predictions[position][Staminia.CONFIG.PR_ENUM_SKILL[skill]] > 0
);

const setAdvancedSkillFieldState = (field, enabled) => {
  if (field == null) return;

  field.disabled = !enabled;
  field.classList.toggle("ignore", !enabled);

  if (!enabled) {
    field.classList.remove("is-invalid");
    delete field.dataset.validationMessage;
  }
};

const normalizeLegacyAdvancedParams = (params, fields) => {
  if (params.length !== fields.length - 1) return params;

  const fieldNames = fields.map(field => field.name);
  const player1PositionIndex = fieldNames.indexOf(getAdvancedPositionFieldName(1));
  const player2PositionIndex = fieldNames.indexOf(getAdvancedPositionFieldName(2));

  if (player1PositionIndex < 0 || player2PositionIndex !== player1PositionIndex + 1) {
    return params;
  }

  const normalizedParams = [...params];
  normalizedParams.splice(player2PositionIndex, 0, String(SAME_AS_PLAYER_1_POSITION));
  return normalizedParams;
};

const swapFieldState = (firstField, secondField) => {
  const firstValue = firstField.value;
  const firstDisabled = firstField.disabled;
  const firstChecked = firstField.checked;

  firstField.value = secondField.value;
  firstField.disabled = secondField.disabled;
  firstField.checked = secondField.checked;

  secondField.value = firstValue;
  secondField.disabled = firstDisabled;
  secondField.checked = firstChecked;
};

const swapAdvancedPositionFields = (form) => {
  const player1PositionField = form[getAdvancedPositionFieldName(1)];
  const player2PositionField = form[getAdvancedPositionFieldName(2)];
  if (player1PositionField == null || player2PositionField == null) return;

  const player1Position = resolveAdvancedPosition(form, 1);
  const player2Position = resolveAdvancedPosition(form, 2);

  player1PositionField.value = String(player2Position);
  player2PositionField.value = String(player1Position);
};

// Stops propagation of click event on login form
document.querySelectorAll(".dropdown-menu form").forEach(el => {
  el.addEventListener("click", (e) => e.stopPropagation());
});

const checkIframe = () => {
  if (top.location !== self.location) {
    top.location = self.location;
  }
};

const validateFormField = (el) => {
  if (el.disabled || el.classList.contains("ignore")) {
    el.classList.remove("is-invalid");
    delete el.dataset.validationMessage;
    return;
  }
  if (el.dataset.validate === "range") {
    const val = parseFloat(String(el.value).replace(",", "."));
    const min = Number(el.dataset.rangeMin);
    const max = Number(el.dataset.rangeMax);
    if (isNaN(val) || val < min || val > max) {
      el.classList.add("is-invalid");
      el.dataset.validationMessage = Staminia.messages.validation_range(min, max);
      return;
    }
  }
  el.classList.remove("is-invalid");
  delete el.dataset.validationMessage;
};

const validateForm = () => {
  const allFields = document.querySelectorAll(`${FORM_ID} input, ${FORM_ID} select`);
  allFields.forEach(validateFormField);
  const errors = [...allFields].filter(
    el => !el.disabled && !el.classList.contains("ignore") && el.classList.contains("is-invalid")
  );
  if (errors.length > 0) {
    document.getElementById("formErrors")?.remove();
    const title = errors.length === 1
      ? Staminia.messages.validation_error
      : Staminia.messages.validation_errors(errors.length);
    const items = errors.map(el => `<li>${el.dataset.fieldName}: ${el.dataset.validationMessage}</li>`).join("");
    document.getElementById("AlertsContainer").insertAdjacentHTML("beforeend", createAlert({
      id: "formErrors",
      type: "error",
      title,
      body: `<ul id="formErrorsUl">${items}</ul>`
    }));
    errors[0].focus();
    return false;
  }
  document.getElementById("formErrors")?.remove();
  return true;
};

document.querySelector(FORM_ID).addEventListener("submit", (e) => {
  e.preventDefault();
  if (!validateForm()) return;
    document.getElementById("calculate").classList.add("disabled");
    resetAndHideTabs();
    document.getElementById("AlertsContainer").innerHTML = "";
    const result = Staminia.Engine.start();

    // Show warnings
    let warnings_list = "";
    if (result.player2_stronger_than_player1) {
      warnings_list += `<li>${Staminia.messages.player2_stronger_than_player1}</li>`;
    }
    if (result.player1_low_stamina_se_risk) {
      warnings_list += `<li>${Staminia.messages.player1_low_stamina_se(result.player1_low_stamina_se)}</li>`;
    }
    if (result.player2_low_stamina_se_risk) {
      warnings_list += `<li>${Staminia.messages.player2_low_stamina_se(result.player2_low_stamina_se)}</li>`;
    }
    if (result.bestInFirstHalf && isOnlySecondHalfEnabled()) {
      warnings_list += `<li>${Staminia.messages.best_in_first_half}</li>`;
    }
    if (warnings_list !== "") {
      document.getElementById("AlertsContainer").insertAdjacentHTML("beforeend", createAlert({
        id: "formWarnings",
        type: "warning",
        title: Staminia.messages.status_warning,
        body: `<ul>${warnings_list}</ul>`
      }));
    }

    // Render Contributions table
    if (isVerboseModeEnabled()) {
      const tabContributions = document.getElementById("tabContributions");
      let tempHTML =
        `<h3 class="legend-like">${Staminia.messages.strength_table}</h3>` +
        '<table class="table table-striped table-sm table-staminia table-staminia-strength width-auto">' +
        "<thead><tr>" +
        `<th></th><th>${Staminia.messages.player1}</th><th>${Staminia.messages.player2}</th>` +
        "</tr></thead><tbody>" +
        `<tr><td>${Staminia.messages.strength}</td>` +
        `<td>${number_format(result.player1Strength, 2)}</td>` +
        `<td>${number_format(result.player2Strength, 2)}</td></tr>` +
        `<tr><td>${Staminia.messages.strength_st_independent}</td>` +
        `<td>${number_format(result.player1StrengthStaminaIndependent, 2)}</td>` +
        `<td>${number_format(result.player2StrengthStaminaIndependent, 2)}</td></tr>` +
        "</tbody></table>" +
        `<p><small>${Staminia.messages.used_in_calculation}</small></p>`;
      tabContributions.insertAdjacentHTML("beforeend", tempHTML);

      const tableHeader =
        "<thead><tr>" +
        `<th class="min-width">${Staminia.messages.substitution_minute}</th>` +
        `<th>${Staminia.messages.total_contribution}</th>` +
        `<th>${Staminia.messages.contribution_percent}</th>` +
        `<th>${Staminia.messages.p1_contrib}</th>` +
        `<th>${Staminia.messages.p2_contrib}</th>` +
        `<th>${Staminia.messages.notes}</th>` +
        "</tr></thead>";

      tempHTML =
        `<h3 class="legend-like">${Staminia.messages.contribution_table}</h3>` +
        '<table class="table table-striped table-sm table-staminia table-staminia-contributions">' +
        tableHeader + "<tbody>";

      const player1LowStamina = String(result.player1_low_stamina_se);
      const player2LowStamina = String(result.player2_low_stamina_se);

      for (const minute in result.minutes) {
        const minuteObject = result.minutes[minute];
        const totalContribution = minuteObject.total;
        const percentContribution = minuteObject.percent;
        const p1Contribution = minuteObject.p1;
        const p2Contribution = minuteObject.p2;
        const isMax = minuteObject.isMax;
        const isMin = minuteObject.isMin;

        if (minute === "46") {
          tempHTML += tableHeader;
        }

        const note = (isMax ? "MAX" : (isMin ? "MIN" : (100 - percentContribution < 1 ? "~ 1%" : ""))) +
          (minute === player1LowStamina ? " " + Staminia.messages.p1_low_stamina : "") +
          (minute === player2LowStamina ? " " + Staminia.messages.p2_low_stamina : "");
        const css_classes = (isMax ? " max" : "") + (isMin ? " min" : "");

        tempHTML +=
          `<tr class="${css_classes}">` +
          `<td>${minute}</td>` +
          `<td>${totalContribution}</td>` +
          `<td>${percentContribution}%</td>` +
          `<td>${p1Contribution}</td>` +
          `<td>${p2Contribution}</td>` +
          `<td>${note}</td></tr>`;
      }

      tempHTML += "</tbody></table>";
      tabContributions.insertAdjacentHTML("beforeend", tempHTML);
      document.getElementById("tabContributionsNav").classList.remove("d-none");
    }

    // Render Charts
    if (isChartsEnabled()) {
      document.getElementById("tabChartsNav").classList.remove("d-none");
      const chartsTab = document.querySelector("#tabChartsNav a");
      if (chartsTab) bootstrap.Tab.getOrCreateInstance(chartsTab).show();

      renderTotalChart(
        document.getElementById("chartTotal"),
        result.plotDataTotal[0],
        result.min,
        result.max,
        Staminia.messages
      );

      renderPartialsChart(
        document.getElementById("chartPartials"),
        result.plotDataPartial[0],
        result.plotDataPartial[1],
        Staminia.messages.p1_contrib,
        Staminia.messages.p2_contrib,
        Staminia.messages
      );
    }

    createSubstitutionAlert(
      isOnlySecondHalfEnabled() ? result.substituteAtSecondHalf : result.substituteAt,
      result.mayNotReplace
    );

    // Show the right tab
    if (isChartsEnabled()) {
      // Chart.js handles resize automatically
    } else if (isVerboseModeEnabled()) {
      const contribTab = document.querySelector("#tabContributionsNav a");
      if (contribTab) bootstrap.Tab.getOrCreateInstance(contribTab).show();
    }

    // Scroll up if needed
    scrollUpToResults();

  // Reset button status
  document.getElementById("calculate").classList.remove("disabled");
});

// GUP
const gup = (name) => {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  const regexS = `[\\?&]${name}=([^&#]*)`;
  const regex = new RegExp(regexS);
  const results = regex.exec(window.location.search);
  if (results != null) {
    return results[1];
  }
};

const number_format = (number = "", decimals = 0, dec_point = ".", thousands_sep = ",") => {
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

// Set the view at the right point
const scrollUpToResults = () => {
  const elem = document.querySelector(".nav-tabs");
  if (!elem) return;
  const elemTop = elem.getBoundingClientRect().top + window.scrollY;
  if (window.scrollY > elemTop) {
    window.scrollTo({ top: elemTop, behavior: "smooth" });
  }
};

// Dynamic Table Stripe
const stripeTable = () => {
  document.querySelectorAll(`${TABLE_ID} tr td, ${TABLE_ID} tr th`).forEach(el => el.classList.remove("stripe"));
  const visibleRows = [...document.querySelectorAll(`${TABLE_ID} tr`)].filter(tr => tr.offsetParent !== null);
  visibleRows.forEach((tr, i) => {
    if (i % 2 === 1) {
      tr.querySelectorAll("td, th").forEach(cell => cell.classList.add("stripe"));
    }
  });
};

// Create alert
const createAlert = (params) => {
  const type = params.type === "error" ? "danger" : params.type;
  return `<div class="alert alert-${type} alert-dismissible fade show" id="${params.id}">` +
    '<button type="button" class="btn-close" data-bs-dismiss="alert"></button>' +
    `<h4 class="alert-heading">${params.title}</h4>` +
    `<p id="${params.id}Body">${params.body}</p></div>`;
};

document.querySelectorAll('[id^="Staminia_Advanced_Player_"][id$="_Position"]').forEach(el => {
  el.addEventListener("change", () => {
    showSkillsByPosition();
    stripeTable();
  });
});

const showSkillsByPosition = () => {
  document.querySelectorAll(`${FORM_ID} tr[class~=advanced]:not([id^=Staminia_Advanced_Skill_]) *[name*=_Advanced_]`).forEach(el => el.classList.remove("ignore"));

  const form = document.querySelector(FORM_ID);
  const positions = {};
  for (const playerId of ADVANCED_PLAYER_IDS) {
    positions[playerId] = resolveAdvancedPosition(form, playerId);
  }

  for (const skill of ADVANCED_SKILL_NAMES) {
    const row = document.getElementById(`Staminia_Advanced_Skill_${skill}`);
    let rowVisible = false;

    for (const playerId of ADVANCED_PLAYER_IDS) {
      const field = form[`Staminia_Advanced_Player_${playerId}_Skill_${skill}`];
      const enabled = isSkillUsedForPosition(positions[playerId], skill);
      setAdvancedSkillFieldState(field, enabled);
      rowVisible = rowVisible || enabled;
    }

    if (row) {
      row.classList.toggle("d-none", !rowVisible);
    }
  }
};

// Enable Advanced Mode
const enableAdvancedMode = () => {
  document.querySelectorAll("#Staminia_Options_AdvancedMode_Predictions .btn").forEach(el => { el.disabled = false; });
  document.querySelectorAll(`${TABLE_ID} tr[class~='simple']`).forEach(el => el.classList.add("d-none"));
  document.querySelectorAll(`${FORM_ID} *[name*=_Simple_]`).forEach(el => el.classList.add("ignore"));
  document.querySelectorAll(`${TABLE_ID} tr[class~=advanced]:not([id*=_Advanced_])`).forEach(el => el.classList.remove("d-none"));
  document.getElementById("Staminia_Options_Predictions_Type").classList.remove("d-none");
  showSkillsByPosition();
};

// Disable Advanced Mode
const disableAdvancedMode = () => {
  document.querySelectorAll("#Staminia_Options_AdvancedMode_Predictions .btn").forEach(el => { el.disabled = false; });
  document.querySelectorAll(`${TABLE_ID} tr[class~='advanced']`).forEach(el => el.classList.add("d-none"));
  document.querySelectorAll(`${FORM_ID} *[name*=_Advanced_]`).forEach(el => el.classList.add("ignore"));
  document.querySelectorAll(`${FORM_ID} *[name*=_Simple_]`).forEach(el => el.classList.remove("ignore"));
  document.querySelectorAll(`${TABLE_ID} tr[class~='simple']`).forEach(el => el.classList.remove("d-none"));
  document.getElementById("Staminia_Options_Predictions_Type").classList.add("d-none");
};

const isOnlySecondHalfEnabled = () => document.getElementById("Staminia_Options_OnlySecondHalf").checked;
const isChartsEnabled = () => document.getElementById("Staminia_Options_Charts").checked;
const isVerboseModeEnabled = () => document.getElementById("Staminia_Options_VerboseMode").checked;
const isPressingEnabled = () => document.getElementById("Staminia_Options_Pressing").checked;
const isAdvancedModeEnabled = () => document.getElementById("Staminia_Options_AdvancedMode").checked;

const enableCHPPMode = () => {
  document.querySelectorAll(`${TABLE_ID} tr[class~='chpp']`).forEach(el => el.classList.remove("d-none"));
};

const disableCHPPMode = () => {
  document.querySelectorAll(`${TABLE_ID} tr[class~='chpp']`).forEach(el => el.classList.add("d-none"));
};

// Fill Form Helper
const fillForm = () => {
  const paramsString = gup("params");
  if (paramsString == null) return;

  const fields = [...document.querySelectorAll("*[name^=Staminia_]")];
  const params = normalizeLegacyAdvancedParams(decodeURI(paramsString).split("-"), fields);
  fields.forEach((field, i) => {
    switch (field.type) {
      case "checkbox":
      case "radio":
        field.checked = params[i] === "true";
        break;
      default:
        field.value = params[i];
    }
  });
  if (isAdvancedModeEnabled()) {
    enableAdvancedMode();
  } else {
    disableAdvancedMode();
  }
  checkMotherClubBonus();
  updatePredictions();
  showSkillsByPosition();
  stripeTable();
};

const checkMotherClubBonus = () => {
  for (const playerId of [1, 2]) {
    const status = document.querySelector(`input[name=Staminia_Player_${playerId}_MotherClubBonus]`).checked;
    const simpleSelect = document.querySelector(`select[name=Staminia_Simple_Player_${playerId}_Loyalty]`);
    const advancedInput = document.querySelector(`input[name=Staminia_Advanced_Player_${playerId}_Loyalty]`);
    if (status) {
      simpleSelect.dataset.savedValue = simpleSelect.value;
      advancedInput.dataset.savedValue = advancedInput.value;
      simpleSelect.value = "20";
      advancedInput.value = "20.00";
    } else {
      if (simpleSelect.dataset.savedValue !== undefined) simpleSelect.value = simpleSelect.dataset.savedValue;
      if (advancedInput.dataset.savedValue !== undefined) advancedInput.value = advancedInput.dataset.savedValue;
    }
    simpleSelect.disabled = status;
    advancedInput.disabled = status;
  }
};

const updatePredictions = () => {
  const checked = document.querySelector('input[name="Staminia_Options_Predictions_Type"]:checked');
  if (checked && checked.value === "ho") {
    Staminia.predictions = Staminia.CONFIG.PREDICTIONS_HO;
  } else {
    Staminia.predictions = Staminia.CONFIG.PREDICTIONS_ANDREAC;
  }
};

const formSerialize = () => {
  const serializedFields = [];
  document.querySelectorAll('*[name^="Staminia_"]').forEach(field => {
    switch (field.type) {
      case "checkbox":
      case "radio":
        serializedFields.push(field.checked);
        break;
      default:
        serializedFields.push(field.value);
    }
  });
  return encodeURI(serializedFields.join("-"));
};

// Stamin.IA! Get Link Button
document.getElementById("getLink").addEventListener("click", (e) => {
  if (!validateForm()) {
    document.getElementById("generatedLink")?.remove();
    return;
  }

  let link = document.location.href.split("?")[0];
  const locale = gup("locale");

  if (locale != null) {
    link += `?locale=${locale}&amp;`;
  } else {
    link += "?";
  }

  link += `params=${formSerialize()}`;

  const copyButton = `<button class="btn btn-sm btn-secondary" id="copyLinkToClipboard" type="button" data-bs-toggle="tooltip" data-bs-title="${Staminia.messages.copy_to_clipboard}">${Staminia.icons.clipboard}</button>`;
  const body = link;

  const linkBody = document.getElementById("generatedLinkBody");
  if (linkBody) {
    linkBody.innerHTML = body;
  } else {
    document.getElementById("AlertsContainer").insertAdjacentHTML("beforeend", createAlert({
      id: "generatedLink",
      type: "info",
      body: body,
      title: Staminia.messages.copy_link + " " + copyButton
    }));
  }

  const copyBtn = document.getElementById("copyLinkToClipboard");
  if (copyBtn) {
    if (!bootstrap.Tooltip.getInstance(copyBtn)) new bootstrap.Tooltip(copyBtn);
    copyBtn.onclick = () => {
      Staminia.copyToClipboard(link, copyBtn);
    };
  }

  // Scroll up if needed
  scrollUpToResults();
});

// Stamin.IA! Switch Players Button
document.getElementById("switchPlayers").addEventListener("click", () => {
  const form = document.querySelector(FORM_ID);
  document.querySelectorAll(`${FORM_ID} *[name*=_Player_1_]`).forEach(p1Field => {
    if (p1Field.name.endsWith("_Position")) return;

    const p2Field = form[p1Field.name.replace("_1", "_2")];
    swapFieldState(p1Field, p2Field);
  });
  swapAdvancedPositionFields(form);
  checkMotherClubBonus();
  showSkillsByPosition();
  validateForm();
});

document.getElementById("Staminia_Options_AdvancedMode").addEventListener("change", function(e) {
  if (this.checked) {
    enableAdvancedMode();
  } else {
    disableAdvancedMode();
  }
  stripeTable();
});

document.querySelectorAll(".motherclub-bonus-checkbox").forEach(el => {
  el.addEventListener("change", () => checkMotherClubBonus());
});

document.querySelectorAll('input[name="Staminia_Options_Predictions_Type"]').forEach(el => {
  el.addEventListener("change", () => {
    updatePredictions();
    showSkillsByPosition();
    stripeTable();
  });
});

document.querySelectorAll('input[data-validate="range"], select[data-validate="range"]').forEach(function(el) {
  el.addEventListener("change", () => validateFormField(el));
  el.addEventListener("input", () => validateFormField(el));
});

// Hide alerts when showing credits and redraw charts if needed
document.querySelectorAll('[data-bs-toggle="tab"]').forEach((el) => {
  el.addEventListener("shown.bs.tab", (e) => {
    const alertsContainer = document.getElementById("AlertsContainer");
    if (e.target.getAttribute("href") === "#tabCredits") {
      alertsContainer.style.display = "none";
    } else {
      alertsContainer.style.display = "";
    }
    if (e.target.getAttribute("href") === "#tabCharts") {
      resizeCharts();
    }
  });
});

// Stamin.IA! Reset Button
document.getElementById("resetApp").addEventListener("click", (e) => {
  document.querySelectorAll(`${FORM_ID}, ${OPTION_FORM_ID}`).forEach(form => {
    if (typeof form.reset === "function" || (typeof form.reset === "object" && !form.reset.nodeType)) {
      form.reset();
    }
  });

  document.getElementById("AlertsContainer").innerHTML = "";
  resetAndHideTabs();

  document.querySelectorAll(`${FORM_ID} .is-invalid`).forEach(el => el.classList.remove("is-invalid"));

  checkMotherClubBonus();
  disableAdvancedMode();
  setupCHPPPlayerFields();
  stripeTable();
  e.preventDefault();
});


const fetchCHPP = async (refresh = false) => {
  // beforeSend
  const btn = document.getElementById("CHPP_Refresh_Data");
  btn.disabled = true;
  btn.textContent = btn.dataset.loadingText;
  const statusEl = document.getElementById("CHPP_Refresh_Data_Status");
  statusEl.innerHTML = Staminia.icons.clock;
  statusEl.disabled = true;
  statusEl.classList.remove("btn-danger", "btn-success", "btn-warning");
  statusEl.classList.add("btn-progress");
  document.getElementById("CHPP_Results").classList.add("d-none");
  document.getElementById("CHPP_Status_Description").innerHTML = "";

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const url = refresh ? "chpp/chpp_retrievedata.php?refresh" : "chpp/chpp_retrievedata.php";
    const response = await fetch(url, {
      signal: controller.signal,
      ...(refresh && { cache: "no-store" })
    });
    clearTimeout(timeoutId);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const jsonObject = await response.json();

    let error_message, description_message;
    switch (jsonObject.Status) {
      case "OK":
        try {
          Staminia.Teams = jsonObject.Teams;
          document.getElementById("menuLoginTitle").textContent = Staminia.Teams[0].TeamName;
          setupCHPPPlayerFields(true);
          loginMenuHide();
          enableCHPPMode();
          stripeTable();
          if (jsonObject.RefreshThrottle) {
            statusEl.innerHTML = Staminia.icons["triangle-exclamation"];
            statusEl.title = Staminia.messages.status_warning;
            statusEl.classList.remove("btn-progress", "btn-danger", "btn-success");
            statusEl.classList.add("btn-warning");
            document.getElementById("CHPP_Status_Description").textContent = Staminia.messages.refresh_throttle(jsonObject.RefreshThrottle);
          } else {
            statusEl.innerHTML = Staminia.icons.check;
            statusEl.title = Staminia.messages.status_ok;
            statusEl.classList.remove("btn-progress", "btn-danger", "btn-warning");
            statusEl.classList.add("btn-success");
          }
          btn.dataset.completeText = btn.dataset.successText;
        } catch (error) {
          statusEl.innerHTML = Staminia.icons.xmark;
          statusEl.title = Staminia.messages.status_error;
          statusEl.classList.remove("btn-progress", "btn-success", "btn-warning");
          statusEl.classList.add("btn-danger");
          loginMenuShow();
          btn.dataset.completeText = btn.dataset.errorText;
          document.getElementById("CHPP_Status_Description").innerHTML =
            `${Staminia.messages.error_unknown}.<br/>${Staminia.messages.retry_to_authorize}.`;
        }
        break;
      case "Error":
        switch (jsonObject.ErrorCode) {
          case "InvalidToken":
            error_message = Staminia.messages.error_invalid_token;
            description_message = Staminia.messages.retry_to_authorize;
            break;
          case "":
            break;
          default:
            error_message = Staminia.messages.error_unknown;
            description_message = Staminia.messages.retry_to_authorize;
        }
        statusEl.innerHTML = Staminia.icons.xmark;
        statusEl.title = Staminia.messages.status_error;
        statusEl.classList.remove("btn-progress", "btn-success", "btn-warning");
        statusEl.classList.add("btn-danger");
        document.getElementById("CHPP_Status_Description").innerHTML = `${error_message}<br/>${description_message}`;
        loginMenuShow();
        btn.dataset.completeText = btn.dataset.errorText;
        break;
    }
    statusEl.disabled = false;
  } catch (err) {
    clearTimeout(timeoutId);
    let error_message, description_message;
    if (err.name === "AbortError") {
      error_message = Staminia.messages.error_timeout;
      description_message = "";
    } else if (err instanceof SyntaxError) {
      error_message = Staminia.messages.error_parser;
      description_message = "";
    } else {
      error_message = Staminia.messages.error_unknown;
      description_message = Staminia.messages.retry_to_authorize;
    }
    statusEl.innerHTML = Staminia.icons.xmark;
    statusEl.title = Staminia.messages.status_error;
    statusEl.classList.remove("btn-progress", "btn-success", "btn-warning");
    statusEl.classList.add("btn-danger");
    document.getElementById("CHPP_Results").classList.add("d-none");
    document.getElementById("CHPP_Status_Description").innerHTML = `${error_message}<br/>${description_message}`;
    loginMenuShow();
    btn.dataset.completeText = btn.dataset.errorText;
    statusEl.disabled = false;
  } finally {
    document.getElementById("CHPP_Results").classList.remove("d-none");
    btn.disabled = false;
    btn.textContent = btn.dataset.completeText || btn.dataset.successText;
  }
};

const sort_by = (field, reverse, primer) => {
  reverse = reverse ? -1 : 1;
  return (a, b) => {
    a = a[field];
    b = b[field];
    if (primer != null) {
      a = primer(a);
      b = primer(b);
      if (isNaN(a)) a = Infinity;
      if (isNaN(b)) b = Infinity;
    }
    if (a < b) return reverse * -1;
    if (a > b) return reverse * 1;
    return 0;
  };
};

const sortCHPPPlayerFields = () => {
  const PlayersData = Staminia.Teams[document.getElementById("CHPP_Team").value].PlayersData;
  if (PlayersData == null) return;

  let field = "PlayerNumber";
  let reverse = false;
  let primer = parseInt;

  switch (document.getElementById("CHPP_Players_SortBy").value) {
    case "ShirtNumber":
      field = "PlayerNumber";
      break;
    case "Name":
      field = "PlayerName";
      primer = undefined;
      break;
    case "Form":
      field = "PlayerForm";
      reverse = true;
      break;
    case "Stamina":
      field = "StaminaSkill";
      reverse = true;
      break;
    case "Keeper":
      field = "KeeperSkill";
      reverse = true;
      break;
    case "Playmaking":
      field = "PlaymakerSkill";
      reverse = true;
      break;
    case "Passing":
      field = "PassingSkill";
      reverse = true;
      break;
    case "Winger":
      field = "WingerSkill";
      reverse = true;
      break;
    case "Defending":
      field = "DefenderSkill";
      reverse = true;
      break;
    case "Scoring":
      field = "ScorerSkill";
      reverse = true;
      break;
    case "SetPieces":
      field = "SetPiecesSkill";
      reverse = true;
      break;
    case "Experience":
      field = "Experience";
      reverse = true;
      break;
    case "Loyalty":
      field = "Loyalty";
      reverse = true;
      break;
  }

  PlayersData.sort(sort_by(field, reverse, primer));
};

const updateCHPPPlayerFields = () => {
  const teamIndex = document.getElementById("CHPP_Team").value;
  const PlayersData = Staminia.Teams[teamIndex].PlayersData;
  if (PlayersData == null) return;

  sortCHPPPlayerFields();

  const p1Select = document.getElementById("CHPP_Player_1");
  const p2Select = document.getElementById("CHPP_Player_2");
  p1Select.innerHTML = "";
  p2Select.innerHTML = "";

  for (let index = 0; index < PlayersData.length; index++) {
    const player = PlayersData[index];
    const opt = document.createElement("option");
    if (Number(player.InjuryLevel) === 0) opt.classList.add("isBruised");
    if (Number(player.InjuryLevel) > 0) opt.classList.add("isInjured");
    if (Number(player.Cards) >= 3) opt.classList.add("isSuspended");
    if (player.TransferListed) opt.classList.add("isTransferListed");
    opt.value = index;
    const number = player.PlayerNumber != null ? player.PlayerNumber + "." : "";
    const mc = player.MotherClubBonus ? "\u2665" : "";
    opt.textContent = `${number} ${player.PlayerName} ${mc}`;
    p1Select.appendChild(opt.cloneNode(true));
    p2Select.appendChild(opt);
  }
};

const setupCHPPPlayerFields = (checkUrlParameter = false) => {
  const Teams = Staminia.Teams;
  if (Teams == null || Teams.length === 0) return;

  const teamSelect = document.getElementById("CHPP_Team");
  teamSelect.innerHTML = "";
  for (let index = 0; index < Teams.length; index++) {
    const opt = document.createElement("option");
    opt.value = index;
    opt.textContent = Teams[index].TeamName;
    teamSelect.appendChild(opt);
  }

  if (Teams.length > 1) {
    teamSelect.closest("tr").classList.remove("d-none");
  }

  updateCHPPPlayerFields();

  const p1Select = document.getElementById("CHPP_Player_1");
  const p2Select = document.getElementById("CHPP_Player_2");
  if (p1Select.options.length > 2 && p2Select.options.length > 2) {
    p1Select.selectedIndex = 0;
    p2Select.selectedIndex = 1;
    setPlayerFormFields(1, checkUrlParameter);
    setPlayerFormFields(2, checkUrlParameter);
  }
};

document.getElementById("CHPP_Player_1").addEventListener("change", () => {
  setPlayerFormFields(1);
});

document.getElementById("CHPP_Player_2").addEventListener("change", () => {
  setPlayerFormFields(2);
});

document.querySelectorAll("#CHPP_Players_SortBy, #CHPP_Team").forEach(el => {
  el.addEventListener("change", () => {
    updateCHPPPlayerFields();
    const p1Select = document.getElementById("CHPP_Player_1");
    const p2Select = document.getElementById("CHPP_Player_2");
    if (p1Select.options.length > 2 && p2Select.options.length > 2) {
      p1Select.selectedIndex = 0;
      p2Select.selectedIndex = 1;
      setPlayerFormFields(1);
      setPlayerFormFields(2);
    }
  });
});

document.getElementById("CHPP_Team").addEventListener("change", function() {
  document.getElementById("menuLoginTitle").textContent = Staminia.Teams[this.value].TeamName;
});

const setPlayerFormFields = (player, checkUrlParameter = false) => {
  if (checkUrlParameter && gup("params") != null) return;

  const PlayersData = Staminia.Teams[document.getElementById("CHPP_Team").value].PlayersData;
  const formReference = document.querySelector(FORM_ID);
  if (PlayersData == null) return;

  const PlayerData = PlayersData[formReference["CHPP_Player_" + player].value];
  if (PlayerData == null) return;

  // Standard Mode
  formReference[`Staminia_Simple_Player_${player}_Experience`].value = PlayerData.Experience;
  formReference[`Staminia_Simple_Player_${player}_Stamina`].value = PlayerData.StaminaSkill;
  formReference[`Staminia_Simple_Player_${player}_Form`].value = PlayerData.PlayerForm;
  formReference[`Staminia_Simple_Player_${player}_MainSkill`].value = PlayerData.MainSkill;
  formReference[`Staminia_Simple_Player_${player}_Loyalty`].value = PlayerData.Loyalty;

  // Mother Club Bonus
  document.querySelector(`input[name=Staminia_Player_${player}_MotherClubBonus]`).checked = PlayerData.MotherClubBonus;
  checkMotherClubBonus();

  // Advanced Mode
  formReference[`Staminia_Advanced_Player_${player}_Experience`].value = number_format(PlayerData.Experience, 2);
  formReference[`Staminia_Advanced_Player_${player}_Stamina`].value = number_format(PlayerData.StaminaSkill, 2);
  formReference[`Staminia_Advanced_Player_${player}_Form`].value = number_format(PlayerData.PlayerForm, 2);
  formReference[`Staminia_Advanced_Player_${player}_Loyalty`].value = number_format(PlayerData.Loyalty, 2);
  formReference[`Staminia_Advanced_Player_${player}_Skill_Keeper`].value = number_format(PlayerData.KeeperSkill, 2);
  formReference[`Staminia_Advanced_Player_${player}_Skill_Defending`].value = number_format(PlayerData.DefenderSkill, 2);
  formReference[`Staminia_Advanced_Player_${player}_Skill_Playmaking`].value = number_format(PlayerData.PlaymakerSkill, 2);
  formReference[`Staminia_Advanced_Player_${player}_Skill_Winger`].value = number_format(PlayerData.WingerSkill, 2);
  formReference[`Staminia_Advanced_Player_${player}_Skill_Passing`].value = number_format(PlayerData.PassingSkill, 2);
  formReference[`Staminia_Advanced_Player_${player}_Skill_Scoring`].value = number_format(PlayerData.ScorerSkill, 2);
};

const loginMenuHide = () => {
  document.getElementById("loginDropdown").classList.add("d-none");
  document.getElementById("loggedInDropdown").classList.remove("d-none");
};

const loginMenuShow = () => {
  document.getElementById("menuLoginTitle").textContent = "CHPP";
  document.getElementById("loggedInDropdown").classList.add("d-none");
  document.getElementById("loginDropdown").classList.remove("d-none");
};

document.getElementById("CHPP_Refresh_Data").addEventListener("click", () => {
  fetchCHPP(true);
});

document.getElementById("CHPP_Revoke_Auth_Link").addEventListener("click", function() {
  const openParent = this.closest(".open");
  if (openParent) openParent.classList.remove("open");
  window.confirm(Staminia.messages.revoke_auth_confirm);
});



document.getElementById("performanceAt90").addEventListener("change", function() {
  Staminia.estimateStaminaSubskills(this.value);
  document.getElementById("staminaSubskillsEstimationTarget").textContent = Staminia.estimateStaminaSubskills(this.value).toFixed(1);
  if (this.value === "100") {
    document.getElementById("or-higher").style.display = "";
  } else {
    document.getElementById("or-higher").style.display = "none";
  }
});

document.getElementById("extraLink")?.addEventListener("click", (e) => {
  e.preventDefault();
  const extraTab = document.querySelector("#tabExtraNav a");
  if (extraTab) bootstrap.Tab.getOrCreateInstance(extraTab).show();
  const helpModal = document.getElementById("helpModal");
  if (helpModal) bootstrap.Modal.getOrCreateInstance(helpModal).toggle();
  return false;
});

// BS5 accordion collapse is handled natively via data-bs-toggle
// Expand settings on desktop
if (window.innerWidth >= 768) {
  const el = document.getElementById("collapseSettings");
  if (el) bootstrap.Collapse.getOrCreateInstance(el, { toggle: false }).show();
}

// Exports
Staminia.format = format;
Staminia.number_format = number_format;

Staminia.isChartsEnabled = isChartsEnabled;
Staminia.isVerboseModeEnabled = isVerboseModeEnabled;
Staminia.isPressingEnabled = isPressingEnabled;
Staminia.isAdvancedModeEnabled = isAdvancedModeEnabled;

// Theme toggle
const syncThemeIcon = () => {
  const isDark = document.documentElement.getAttribute("data-bs-theme") === "dark";
  document.documentElement.classList.toggle("dark-mode", isDark);
};
syncThemeIcon();

document.getElementById("themeToggle").addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-bs-theme");
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-bs-theme", next);
  document.cookie = "theme=" + next + ";path=/;max-age=31536000;SameSite=Lax";
  syncThemeIcon();
  updateChartsTheme();
});

// Document.ready
const onReady = () => {
  checkIframe();
  const hasParams = gup("params") != null;
  if (hasParams) fillForm();
  stripeTable();
  if (hasParams && AUTOSTART) document.querySelector(FORM_ID).requestSubmit();
  const madeInItaly = document.getElementById("imgMadeInItaly");
  if (madeInItaly) new bootstrap.Tooltip(madeInItaly);
  if (document.startAjax) {
    fetchCHPP(false);
  }
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", onReady);
} else {
  onReady();
}
