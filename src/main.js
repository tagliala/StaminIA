import { renderTotalChart, renderPartialsChart, destroyCharts, resizeCharts, updateChartsTheme } from "./charts.js";

window.Staminia = window.Staminia || {};
const Staminia = window.Staminia;
Staminia.CONFIG = Staminia.CONFIG || {};

$.extend(Staminia.CONFIG, {
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
      const args = $.makeArray(arguments);
      args.unshift(source);
      return format.apply(this, args);
    };
  }
  if (arguments.length > 2 && params.constructor !== Array) {
    params = $.makeArray(arguments).slice(1);
  }
  if (params.constructor !== Array) {
    params = [params];
  }
  $.each(params, (i, n) => {
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

  $("#AlertsContainer").append(createAlert({
    id: "formSubstituteAt",
    type: "success",
    title: title,
    body: body
  }));
};

const resetAndHideTabs = () => {
  $("#tabChartsNav").addClass("d-none");
  $("#tabContributionsNav").addClass("d-none");
  $("#tabDebugNav").addClass("d-none");
  destroyCharts();
  $("#chartTotal").html("");
  $("#chartPartials").html("");
  $("#tabContributions").html("");
  $("#tabDebug").html("");
};

const FORM_ID = Staminia.CONFIG.FORM_ID;
const OPTION_FORM_ID = Staminia.CONFIG.OPTION_FORM_ID;
const TABLE_ID = Staminia.CONFIG.TABLE_ID;
const DEBUG = Staminia.CONFIG.DEBUG;
const AUTOSTART = Staminia.CONFIG.AUTOSTART;
Staminia.predictions = Staminia.CONFIG.PREDICTIONS_HO;

// Stops propagation of click event on login form
$(".dropdown-menu").find("form").click((e) => {
  e.stopPropagation();
});

const checkIframe = () => {
  if (top.location !== self.location) {
    top.location = self.location;
  }
};

$(FORM_ID).validate({
  ignore: ".ignore",
  errorContainer: "#formErrors",
  errorLabelContainer: "#formErrorsUl",
  errorElement: "li",
  focusInvalid: true,
  showErrors: function(errorMap, errorList) {
    if (this.numberOfInvalids() === 0) {
      $("#formErrors").remove();
    }
    this.defaultShowErrors();
  },
  errorPlacement: (error, element) => null,
  invalidHandler: (form, validator) => {
    const errors = validator.numberOfInvalids();
    if (errors) {
      let message;
      if (errors === 1) message = Staminia.messages.validation_error;
      if (errors > 1) message = Staminia.messages.validation_errors(errors);
      $("#formErrors").remove();
      if (validator.errorList.length > 0) {
        $("#AlertsContainer").append(createAlert({
          id: "formErrors",
          type: "error",
          title: message,
          body: '<ul id="formErrorsUl"></ul>'
        }));
        for (const error of validator.errorList) {
          $("#formErrorsUl").append(`<li>${$(error.element).data("fieldName")}: ${error.message}</li>`);
        }
      } else {
        $("#formErrors").dismiss();
      }
      validator.focusInvalid();
    }
  },
  submitHandler: (form) => {
    $("#calculate").addClass("disabled");
    resetAndHideTabs();
    $("#AlertsContainer").html("");
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
      $("#AlertsContainer").append(createAlert({
        id: "formWarnings",
        type: "warning",
        title: Staminia.messages.status_warning,
        body: `<ul>${warnings_list}</ul>`
      }));
    }

    // Render Contributions table
    if (isVerboseModeEnabled()) {
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
      $("#tabContributions").append(tempHTML);

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
      $("#tabContributions").append(tempHTML);
      $("#tabContributionsNav").removeClass("d-none");
    }

    // Render Charts
    if (isChartsEnabled()) {
      $("#tabChartsNav").removeClass("d-none");
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
    $("#calculate").removeClass("disabled");
  },
  highlight: (element, errorClass, validClass) => {
    $(element).closest("div").addClass(errorClass).removeClass(validClass);
  },
  unhighlight: (element, errorClass, validClass) => {
    $(element).closest("div").removeClass(errorClass).addClass(validClass);
  }
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
  const $elem = $(".nav-tabs");
  const docViewTop = $(window).scrollTop();
  const elemTop = $elem.offset().top;
  if (docViewTop > elemTop) {
    $("html, body").animate({ scrollTop: elemTop }, 200);
  }
};

// Dynamic Table Stripe
const stripeTable = () => {
  $(`${TABLE_ID} tr td, ${TABLE_ID} tr th`).removeClass("stripe");
  $(`${TABLE_ID} tr:visible:odd td, ${TABLE_ID} tr:visible:odd td`).addClass("stripe");
};

// Create alert
const createAlert = (params) => {
  const type = params.type === "error" ? "danger" : params.type;
  return `<div class="alert alert-${type} alert-dismissible fade show" id="${params.id}">` +
    '<button type="button" class="btn-close" data-bs-dismiss="alert"></button>' +
    `<h4 class="alert-heading">${params.title}</h4>` +
    `<p id="${params.id}Body">${params.body}</p></div>`;
};

$("#Staminia_Advanced_Position").on("change", () => {
  showSkillsByPosition();
  stripeTable();
});

const showSkillsByPosition = () => {
  $(`${FORM_ID} tr[class~=advanced]:not([id*=_Advanced_]) *[name*=_Advanced_]`).removeClass("ignore");
  $(`${FORM_ID} tr[class~=advanced][id*=_Advanced_] *[name*=_Advanced_]`).addClass("ignore");
  $(`${TABLE_ID} tr[class~=advanced][id*=_Advanced_]`).addClass("d-none").hide();

  const position = Number($("#Staminia_Advanced_Position").val());
  if (!(position >= 0 && position <= 19)) return;

  const SKILL_ENUMERATOR = Staminia.CONFIG.PR_ENUM_SKILL;
  for (const skill in SKILL_ENUMERATOR) {
    if (Staminia.predictions[position][SKILL_ENUMERATOR[skill]] > 0) {
      $(`#Staminia_Advanced_Skill_${skill} *[name]`).removeClass("ignore");
      $(`#Staminia_Advanced_Skill_${skill}`).removeClass("d-none").show();
    }
  }
};

// Enable Advanced Mode
const enableAdvancedMode = () => {
  $("#Staminia_Options_AdvancedMode_Predictions").find(".btn").prop("disabled", false);
  $(`${TABLE_ID} tr[class~='simple']`).addClass("d-none").hide();
  $(`${FORM_ID} *[name*=_Simple_]`).addClass("ignore");
  $(`${TABLE_ID} tr[class~=advanced]:not([id*=_Advanced_])`).removeClass("d-none").show();
  $("#Staminia_Options_Predictions_Type").removeClass("d-none");
  showSkillsByPosition();
};

// Disable Advanced Mode
const disableAdvancedMode = () => {
  $("#Staminia_Options_AdvancedMode_Predictions").find(".btn").prop("disabled", false);
  $(`${TABLE_ID} tr[class~='advanced']`).addClass("d-none").hide();
  $(`${FORM_ID} *[name*=_Advanced_]`).addClass("ignore");
  $(`${FORM_ID} *[name*=_Simple_]`).removeClass("ignore");
  $(`${TABLE_ID} tr[class~='simple']`).removeClass("d-none").show();
  $("#Staminia_Options_Predictions_Type").addClass("d-none");
};

const isOnlySecondHalfEnabled = () => $("#Staminia_Options_OnlySecondHalf").prop("checked");
const isChartsEnabled = () => $("#Staminia_Options_Charts").prop("checked");
const isVerboseModeEnabled = () => $("#Staminia_Options_VerboseMode").prop("checked");
const isPressingEnabled = () => $("#Staminia_Options_Pressing").prop("checked");
const isAdvancedModeEnabled = () => $("#Staminia_Options_AdvancedMode").prop("checked");

const enableCHPPMode = () => {
  $(`${TABLE_ID} tr[class~='chpp']`).removeClass("d-none").show();
};

const disableCHPPMode = () => {
  $(`${TABLE_ID} tr[class~='chpp']`).addClass("d-none").hide();
};

// Fill Form Helper
const fillForm = () => {
  const paramsString = gup("params");
  if (paramsString == null) return;

  const params = decodeURI(paramsString).split("-");
  const fields = $("*[name^=Staminia_]");
  for (let i = 0; i < fields.length; i++) {
    const field = fields[i];
    const $field = $(field);
    switch ($field.attr("type")) {
      case "checkbox":
      case "radio":
        $field.prop("checked", params[i] === "true");
        break;
      default:
        $field.val(params[i]);
    }
  }
  if (isAdvancedModeEnabled()) {
    enableAdvancedMode();
  } else {
    disableAdvancedMode();
  }
  checkMotherClubBonus();
  updatePredictions();
  stripeTable();
};

const checkMotherClubBonus = () => {
  for (const playerId of [1, 2]) {
    const status = $(`input[name=Staminia_Player_${playerId}_MotherClubBonus]`).prop("checked");
    $(`select[name=Staminia_Simple_Player_${playerId}_Loyalty]`).prop("disabled", status);
    $(`input[name=Staminia_Advanced_Player_${playerId}_Loyalty]`).prop("disabled", status);
  }
};

const updatePredictions = () => {
  if ($('input[name="Staminia_Options_Predictions_Type"]:checked').val() === "ho") {
    Staminia.predictions = Staminia.CONFIG.PREDICTIONS_HO;
  } else {
    Staminia.predictions = Staminia.CONFIG.PREDICTIONS_ANDREAC;
  }
};

const formSerialize = () => {
  const serializedFields = [];
  $('*[name^="Staminia_"]').each(function() {
    const $this = $(this);
    switch ($this.attr("type")) {
      case "checkbox":
      case "radio":
        serializedFields.push($this.prop("checked"));
        break;
      default:
        serializedFields.push($this.val());
    }
  });
  return encodeURI(serializedFields.join("-"));
};

// Stamin.IA! Get Link Button
$("#getLink").on("click", (e) => {
  if (!$(FORM_ID).validate().form()) {
    $("#generatedLink").remove();
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

  const copyButton = '<button class="btn btn-sm" id="copyLinkToClipboard" type="button">' + Staminia.messages.copy_to_clipboard + '</button>';
  const body = link;

  if ($("#generatedLinkBody").length) {
    $("#generatedLinkBody").fadeOut("fast", function() {
      $(this).html(body).fadeIn("fast");
    });
  } else {
    $("#AlertsContainer").append(createAlert({
      id: "generatedLink",
      type: "info",
      body: body,
      title: Staminia.messages.copy_link + " " + copyButton
    }));
  }

  $("#copyLinkToClipboard").off("click").on("click", () => {
    Staminia.copyToClipboard(link, $("#copyLinkToClipboard"));
  });

  // Scroll up if needed
  scrollUpToResults();
});

// Stamin.IA! Switch Players Button
$("#switchPlayers").click(() => {
  $(`${FORM_ID} *[name*=_Player_1_]`).each(function() {
    const form = $(FORM_ID)[0];
    const p2Field = form[this.name.replace("_1", "_2")];

    const $this = $(this);
    const $p2Field = $(p2Field);

    const p1Value = this.value;
    const p1Disabled = $this.prop("disabled");
    const p1Checked = $this.prop("checked");
    $this.val($p2Field.val());
    $this.prop("disabled", $p2Field.prop("disabled"));
    $this.prop("checked", $p2Field.prop("checked"));
    $p2Field.val(p1Value);
    $p2Field.prop("disabled", p1Disabled);
    $p2Field.prop("checked", p1Checked);
  });
  checkMotherClubBonus();
  $(FORM_ID).validate().form();
});

$("#Staminia_Options_AdvancedMode").on("change", function(e) {
  if ($(this).prop("checked")) {
    enableAdvancedMode();
  } else {
    disableAdvancedMode();
  }
  stripeTable();
});

$(".motherclub-bonus-checkbox").on("change", () => {
  checkMotherClubBonus();
});

$('input[name="Staminia_Options_Predictions_Type"]').on("change", () => {
  updatePredictions();
});

$('input[data-validate="range"], select[data-validate="range"]').each(function() {
  $(this).rules("add", { range: [$(this).data("rangeMin"), $(this).data("rangeMax")] });
});

// Hide alerts when showing credits and redraw charts if needed
document.querySelectorAll('[data-bs-toggle="tab"]').forEach((el) => {
  el.addEventListener("shown.bs.tab", (e) => {
    if (e.target.getAttribute("href") === "#tabCredits") {
      $("#AlertsContainer").hide();
    } else {
      $("#AlertsContainer").show();
    }
    if (e.target.getAttribute("href") === "#tabCharts") {
      resizeCharts();
    }
  });
});

// Stamin.IA! Reset Button
$("#resetApp").on("click", (e) => {
  $(`${FORM_ID}, ${OPTION_FORM_ID}`).each(function() {
    if (typeof this.reset === "function" || (typeof this.reset === "object" && !this.reset.nodeType)) {
      this.reset();
    }
  });

  $("#AlertsContainer").html("");
  resetAndHideTabs();

  checkMotherClubBonus();
  disableAdvancedMode();
  setupCHPPPlayerFields();
  stripeTable();
  e.preventDefault();
});

$.validator.methods.range = function(value, element, param) {
  const globalizedValue = value.replace(",", ".");
  return this.optional(element) || (globalizedValue >= param[0] && globalizedValue <= param[1]);
};

$.validator.methods.number = function(value, element) {
  return this.optional(element) || /^-?(?:\d+|\d{1,3}(?:[\s\.,]\d{3})+)(?:[\.,]\d+)?$/.test(value);
};

$.validator.addMethod("position", function(value, element, params) {
  return this.optional(element) || (value >= params[0] && value <= params[1]);
}, jQuery.validator.messages.required);

$("#Staminia_Advanced_Position").rules("add", { position: [0, 19] });

$.ajaxSetup({
  dataType: "json",
  timeout: 30000,
  beforeSend: (XMLHttpRequest, settings) => {
    const $btn = $("#CHPP_Refresh_Data");
    $btn.prop("disabled", true).text($btn.data("loadingText"));
    $("#CHPP_Refresh_Data_Status").html(Staminia.icons.clock);
    $("#CHPP_Refresh_Data_Status").prop("disabled", true);
    $("#CHPP_Refresh_Data_Status").removeClass("btn-danger btn-success btn-warning").addClass("btn-progress");
    $("#CHPP_Results").addClass("d-none");
    $("#CHPP_Status_Description").html("");
  },
  success: (jsonObject, textStatus, xhr) => {
    let error_message, description_message;
    switch (jsonObject.Status) {
      case "OK":
        try {
          Staminia.Teams = jsonObject.Teams;
          $("#menuLoginTitle").text(Staminia.Teams[0].TeamName);
          setupCHPPPlayerFields(true);
          loginMenuHide();
          enableCHPPMode();
          stripeTable();
          if (jsonObject.RefreshThrottle) {
            $("#CHPP_Refresh_Data_Status").html(Staminia.icons["triangle-exclamation"]).attr("title", Staminia.messages.status_warning);
            $("#CHPP_Refresh_Data_Status").removeClass("btn-progress btn-danger btn-success").addClass("btn-warning");
            $("#CHPP_Status_Description").text(Staminia.messages.refresh_throttle(jsonObject.RefreshThrottle));
          } else {
            $("#CHPP_Refresh_Data_Status").html(Staminia.icons.check).attr("title", Staminia.messages.status_ok);
            $("#CHPP_Refresh_Data_Status").removeClass("btn-progress btn-danger btn-warning").addClass("btn-success");
          }
          $("#CHPP_Refresh_Data").data("completeText", $("#CHPP_Refresh_Data").data("successText"));
        } catch (error) {
          $("#CHPP_Refresh_Data_Status").html(Staminia.icons.xmark).attr("title", Staminia.messages.status_error);
          $("#CHPP_Refresh_Data_Status").removeClass("btn-progress btn-success btn-warning").addClass("btn-danger");
          loginMenuShow();
          $("#CHPP_Refresh_Data").data("completeText", $("#CHPP_Refresh_Data").data("errorText"));
          $("#CHPP_Status_Description").html(
            `${Staminia.messages.error_unknown}.<br/>${Staminia.messages.retry_to_authorize}.`
          );
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
        $("#CHPP_Refresh_Data_Status").html(Staminia.icons.xmark).attr("title", Staminia.messages.status_error);
        $("#CHPP_Refresh_Data_Status").removeClass("btn-progress btn-success btn-warning").addClass("btn-danger");
        $("#CHPP_Status_Description").html(`${error_message}<br/>${description_message}`);
        loginMenuShow();
        $("#CHPP_Refresh_Data").data("completeText", $("#CHPP_Refresh_Data").data("errorText"));
        break;
    }
    $("#CHPP_Refresh_Data_Status").prop("disabled", false);
  },
  error: (jqXHR, textStatus, thrownError) => {
    let error_message, description_message;
    switch (textStatus) {
      case "timeout":
        error_message = Staminia.messages.error_timeout;
        description_message = "";
        break;
      case "parsererror":
        error_message = Staminia.messages.error_parser;
        description_message = "";
        break;
      default:
        error_message = Staminia.messages.error_unknown;
        description_message = Staminia.messages.retry_to_authorize;
    }
    $("#CHPP_Refresh_Data_Status").html(Staminia.icons.xmark).attr("title", Staminia.messages.status_error);
    $("#CHPP_Refresh_Data_Status").removeClass("btn-progress btn-success btn-warning").addClass("btn-danger");
    $("#CHPP_Results").addClass("d-none");
    $("#CHPP_Status_Description").html(`${error_message}<br/>${description_message}`);
    loginMenuShow();
    $("#CHPP_Refresh_Data").data("completeText", $("#CHPP_Refresh_Data").data("errorText"));
    $("#CHPP_Refresh_Data_Status").prop("disabled", false);
  },
  complete: (jqXHR, textStatus) => {
    $("#CHPP_Results").removeClass("d-none");
    const $btn = $("#CHPP_Refresh_Data");
    $btn.prop("disabled", false).text($btn.data("completeText") || $btn.data("successText"));
  }
});

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
  const PlayersData = Staminia.Teams[$("#CHPP_Team").val()].PlayersData;
  if (PlayersData == null) return;

  let field = "PlayerNumber";
  let reverse = false;
  let primer = parseInt;

  switch ($(`${FORM_ID} select[id=CHPP_Players_SortBy]`).val()) {
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
  const PlayersData = Staminia.Teams[$("#CHPP_Team").val()].PlayersData;
  if (PlayersData == null) return;

  sortCHPPPlayerFields();

  $("#CHPP_Player_1").html("");
  $("#CHPP_Player_2").html("");

  const select = $(document.createElement("select"));
  let number, mc;
  for (let index = 0; index < PlayersData.length; index++) {
    const player = PlayersData[index];
    const optionElement = $(document.createElement("option"));
    if (Number(player.InjuryLevel) === 0) optionElement.addClass("isBruised");
    if (Number(player.InjuryLevel) > 0) optionElement.addClass("isInjured");
    if (Number(player.Cards) >= 3) optionElement.addClass("isSuspended");
    if (player.TransferListed) optionElement.addClass("isTransferListed");
    optionElement.attr("value", index);
    optionElement.text(`${number = player.PlayerNumber != null ? player.PlayerNumber + "." : ""} ${player.PlayerName} ${mc = player.MotherClubBonus ? "\u2665" : ""}`);
    select.append(optionElement);
  }

  const selectP1 = select.clone(true);
  const selectP2 = select.clone(true);

  selectP1.attr("id", "CHPP_Player_1");
  selectP2.attr("id", "CHPP_Player_2");

  $("#CHPP_Player_1").html(selectP1.html());
  $("#CHPP_Player_2").html(selectP2.html());
};

const setupCHPPPlayerFields = (checkUrlParameter = false) => {
  const Teams = Staminia.Teams;
  if (Teams == null || Teams.length === 0) return;

  const select = $(document.createElement("select"));
  for (let index = 0; index < Teams.length; index++) {
    const team = Teams[index];
    const optionElement = $(document.createElement("option"));
    optionElement.attr("value", index);
    optionElement.text(team.TeamName);
    select.append(optionElement);
  }

  $("#CHPP_Team").html(select.html());
  if (Teams.length > 1) {
    $("#CHPP_Team").closest("tr").removeClass("d-none");
  }

  updateCHPPPlayerFields();

  if ($("#CHPP_Player_1 option").length > 2 && $("#CHPP_Player_2 option").length > 2) {
    $("#CHPP_Player_1 option:eq(0)").prop("selected", true);
    $("#CHPP_Player_2 option:eq(1)").prop("selected", true);
    setPlayerFormFields(1, checkUrlParameter);
    setPlayerFormFields(2, checkUrlParameter);
  }
};

$("#CHPP_Player_1").on("change", () => {
  setPlayerFormFields(1);
});

$("#CHPP_Player_2").on("change", () => {
  setPlayerFormFields(2);
});

$("#CHPP_Players_SortBy, #CHPP_Team").on("change", () => {
  updateCHPPPlayerFields();
  if ($("#CHPP_Player_1 option").length > 2 && $("#CHPP_Player_2 option").length > 2) {
    $("#CHPP_Player_1 option:eq(0)").prop("selected", true);
    $("#CHPP_Player_2 option:eq(1)").prop("selected", true);
    setPlayerFormFields(1);
    setPlayerFormFields(2);
  }
});

$("#CHPP_Team").on("change", function() {
  $("#menuLoginTitle").text(Staminia.Teams[$(this).val()].TeamName);
});

const setPlayerFormFields = (player, checkUrlParameter = false) => {
  if (checkUrlParameter && gup("params") != null) return;

  const PlayersData = Staminia.Teams[$("#CHPP_Team").val()].PlayersData;
  const formReference = $(FORM_ID)[0];
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
  $(`input[name=Staminia_Player_${player}_MotherClubBonus]`).prop("checked", PlayerData.MotherClubBonus);
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
  $("#loginDropdown").addClass("d-none");
  $("#loggedInDropdown").removeClass("d-none");
};

const loginMenuShow = () => {
  $("#menuLoginTitle").text("CHPP");
  $("#loggedInDropdown").addClass("d-none");
  $("#loginDropdown").removeClass("d-none");
};

$("#CHPP_Refresh_Data").on("click", () => {
  $.ajax({ url: "chpp/chpp_retrievedata.php?refresh", cache: false });
});

$("#CHPP_Revoke_Auth_Link").on("click", function() {
  $(this).closest("[class~='open']").removeClass("open");
  window.confirm(Staminia.messages.revoke_auth_confirm);
});



$("#performanceAt90").on("change", function() {
  Staminia.estimateStaminaSubskills($(this).val());
  $("#staminaSubskillsEstimationTarget").text(Staminia.estimateStaminaSubskills($(this).val()).toFixed(1));
  if ($(this).val() === "100") {
    $("#or-higher").show();
  } else {
    $("#or-higher").hide();
  }
});

$("#extraLink").on("click", (e) => {
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

$("#themeToggle").on("click", () => {
  const current = document.documentElement.getAttribute("data-bs-theme");
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-bs-theme", next);
  document.cookie = "theme=" + next + ";path=/;max-age=31536000;SameSite=Lax";
  syncThemeIcon();
  updateChartsTheme();
});

// Document.ready
$(() => {
  checkIframe();
  const hasParams = gup("params") != null;
  if (hasParams) fillForm();
  stripeTable();
  if (hasParams && AUTOSTART) $(FORM_ID).submit();
  const madeInItaly = document.getElementById("imgMadeInItaly");
  if (madeInItaly) new bootstrap.Tooltip(madeInItaly);
  if (document.startAjax) {
    $.ajax({ url: "chpp/chpp_retrievedata.php", cache: true });
  }
});
