// Generated by CoffeeScript 1.3.3
(function() {
  "use strict";

  var AUTOSTART, DEBUG, FORM_ID, Staminia, TABLE_ID, checkFormButtonsAppearance, createAlert, createSubstitutionAlert, disableAdvancedMode, disableCHPPMode, enableAdvancedMode, enableCHPPMode, fillForm, format, gup, isAdvancedModeEnabled, isChartsEnabled, isPressingEnabled, isVerboseModeEnabled, loginMenuHide, loginMenuShow, number_format, resetAndHideTabs, setPlayerFormFields, setupCHPPPlayerFields, showSkillsByPosition, sortCHPPPlayerFields, sort_by, stripeTable, updateCHPPPlayerFields, updatePredictions;

  window.Staminia = window.Staminia || {};

  Staminia = window.Staminia;

  Staminia.CONFIG = Staminia.CONFIG || {};

  $.extend(Staminia.CONFIG, {
    FORM_ID: "#formPlayersInfo",
    TABLE_ID: "#playersInfoTable",
    DEBUG: true,
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

  format = function(source, params) {
    if (arguments.length === 1) {
      return function() {
        var args;
        args = $.makeArray(arguments);
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
    $.each(params, function(i, n) {
      source = source.replace(new RegExp("\\{" + i + "\\}", "g"), n);
    });
    return source;
  };

  createSubstitutionAlert = function(substituteAtArray, mayNotReplace) {
    var body, check_with, l, minute, r, range, ranges, result, title, _i, _j, _len, _len1;
    ranges = [];
    r = 0;
    for (_i = 0, _len = substituteAtArray.length; _i < _len; _i++) {
      minute = substituteAtArray[_i];
      if (!ranges[r]) {
        ranges[r] = [];
        ranges[r].push(minute);
        check_with = minute + 1;
      } else if (minute !== check_with) {
        if (ranges[r][ranges[r].length - 1] !== check_with - 1) {
          ranges[r].push(check_with - 1);
        }
        r++;
        _i--;
      } else if (minute === check_with) {
        check_with = minute + 1;
      }
      if (_i === _len - 1) {
        l = ranges[r].length - 1;
        if (ranges[r][l] !== minute) {
          ranges[r].push(minute);
        }
      }
    }
    result = [];
    for (_j = 0, _len1 = ranges.length; _j < _len1; _j++) {
      range = ranges[_j];
      result.push(range.join("-"));
    }
    title = "";
    body = "";
    if (substituteAtArray.length > 0) {
      title = "";
      if (substituteAtArray.length === 1) {
        title += "" + Staminia.messages.replace + " " + Staminia.messages.at_minute;
      } else {
        title += "" + Staminia.messages.replace + " " + Staminia.messages.at_minutes;
      }
      body = "<p class=\"minutes\">" + (result.join(",")) + "</p>";
      if (mayNotReplace) {
        body += "" + Staminia.messages.may_not_replace;
      }
    } else {
      title = Staminia.messages.do_not_replace;
    }
    $('#AlertsContainer').append(createAlert({
      "id": "formSubstituteAt",
      "type": "success",
      "title": title,
      "body": body
    }));
  };

  FORM_ID = Staminia.CONFIG.FORM_ID;

  TABLE_ID = Staminia.CONFIG.TABLE_ID;

  DEBUG = Staminia.CONFIG.DEBUG;

  AUTOSTART = Staminia.CONFIG.AUTOSTART;

  Staminia.predictions = Staminia.CONFIG.PREDICTIONS_HO;

  $('.dropdown-menu').find('form').click(function(e) {
    return e.stopPropagation();
  });

  $(function() {
    var hasParams;
    hasParams = gup("params") != null;
    if (hasParams) {
      fillForm();
    }
    stripeTable();
    if (hasParams && AUTOSTART) {
      $(FORM_ID).submit();
    }
    $("#imgMadeInItaly").tooltip();
    if (document.startAjax) {
      return $.ajax({
        url: "chpp/chpp_retrievedata.php",
        cache: true
      });
    }
  });

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
    errorPlacement: function(error, element) {
      return null;
    },
    invalidHandler: function(form, validator) {
      var error, errors, message, _i, _len, _ref;
      errors = validator.numberOfInvalids();
      if (errors) {
        if (errors === 1) {
          message = Staminia.messages.validation_error;
        }
        if (errors > 1) {
          message = Staminia.messages.validation_errors(errors);
        }
        $("#formErrors").remove();
        if (validator.errorList.length > 0) {
          $('#AlertsContainer').append(createAlert({
            "id": "formErrors",
            "type": "error",
            "title": message,
            "body": "<ul id=\"formErrorsUl\"></ul>"
          }));
          _ref = validator.errorList;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            error = _ref[_i];
            $("#formErrorsUl").append("<li>" + ($(error.element).data("fieldName")) + ": " + error.message + "</li>");
          }
        } else {
          $('#formErrors').dismiss();
        }
        validator.focusInvalid();
      }
    },
    submitHandler: function(form) {
      var css_classes, isMax, isMin, minute, minuteObject, note, p1Contribution, p2Contribution, percentContribution, player1LowStamina, player2LowStamina, result, tableHeader, tableSeparator, tempHTML, totalContribution, warnings_list;
      $("#calculate").addClass("disabled");
      resetAndHideTabs();
      $("#AlertsContainer").html("");
      result = Staminia.Engine.start();
      warnings_list = "";
      if (result.player2_stronger_than_player1) {
        warnings_list += "<li>" + Staminia.messages.player2_stronger_than_player1 + "</li>";
      }
      if (result.player1_low_stamina_se_risk) {
        warnings_list += "<li>" + (Staminia.messages.player1_low_stamina_se(result.player1_low_stamina_se)) + "</li>";
      }
      if (result.player2_low_stamina_se_risk) {
        warnings_list += "<li>" + (Staminia.messages.player2_low_stamina_se(result.player2_low_stamina_se)) + "</li>";
      }
      if (warnings_list !== "") {
        $('#AlertsContainer').append(createAlert({
          "id": "formWarnings",
          "type": "warning",
          "title": Staminia.messages.status_warning,
          "body": "<ul>" + warnings_list + "</ul>"
        }));
      }
      if (isVerboseModeEnabled()) {
        tempHTML = "<h3 class=\"legend-like\">" + Staminia.messages.strength_table + "</h3>\n<table class=\"table table-striped table-condensed table-staminia table-staminia-strength width-auto\">\n  <thead>\n    <tr>\n      <th></th><th>" + Staminia.messages.player1 + "</th><th>" + Staminia.messages.player2 + "</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr>\n      <td>" + Staminia.messages.strength + "</td>\n      <td>" + (number_format(result.player1Strength, 2)) + "</td>\n      <td>" + (number_format(result.player2Strength, 2)) + "</td>\n    </tr>\n    <tr>\n      <td>" + Staminia.messages.strength_st_independent + "</td>\n      <td>" + (number_format(result.player1StrengthStaminaIndependent, 2)) + "</td>\n      <td>" + (number_format(result.player2StrengthStaminaIndependent, 2)) + "</td>\n    </tr>\n  </tbody>\n</table>\n<p><small>" + Staminia.messages.used_in_calculation + "</small></p>";
        $("#tabContributions").append(tempHTML);
        tableHeader = "<thead>\n  <tr>\n    <th class=\"min-width\">" + Staminia.messages.substitution_minute + "</th>\n    <th>" + Staminia.messages.total_contribution + "</th>\n    <th>" + Staminia.messages.contribution_percent + "</th>\n    <th>" + Staminia.messages.p1_contrib + "</th>\n    <th>" + Staminia.messages.p2_contrib + "</th>\n    <th>" + Staminia.messages.notes + "</th>\n  </tr>\n</thead>";
        tableSeparator = "<tr><td colspan='6'></td></tr>";
        tempHTML = "<h3 class=\"legend-like\">" + Staminia.messages.contribution_table + "</h3>\n<table class=\"table table-striped table-condensed table-staminia table-staminia-contributions width-auto\">\n  <thead>\n  </thead>\n    " + tableHeader + "\n  </thead>\n  <tbody>";
        player1LowStamina = String(result.player1_low_stamina_se);
        player2LowStamina = String(result.player2_low_stamina_se);
        for (minute in result.minutes) {
          minuteObject = result.minutes[minute];
          totalContribution = minuteObject.total;
          percentContribution = minuteObject.percent;
          p1Contribution = minuteObject.p1;
          p2Contribution = minuteObject.p2;
          isMax = minuteObject.isMax;
          isMin = minuteObject.isMin;
          if (minute === "46") {
            tempHTML += tableHeader;
          }
          note = (isMax ? "MAX" : (isMin ? "MIN" : (100 - percentContribution < 1 ? "~ 1%" : ""))) + (minute === player1LowStamina ? " " + Staminia.messages.p1_low_stamina : "") + (minute === player2LowStamina ? " " + Staminia.messages.p2_low_stamina : "");
          css_classes = (isMax ? " max" : "") + (isMin ? " min" : "");
          tempHTML += "<tr class=\"" + css_classes + "\">\n  <td>" + minute + "</td>\n  <td>" + totalContribution + "</td>\n  <td>" + percentContribution + "%</td>\n  <td>" + p1Contribution + "</td>\n  <td>" + p2Contribution + "</td>\n  <td>" + note + "</td>\n</tr>";
        }
        tempHTML += "</tbody></table>";
        $("#tabContributions").append(tempHTML);
        $("#tabContributionsNav").show();
        $("#tabContributionsNav").find("a").tab("show");
      }
      createSubstitutionAlert(result.substituteAt, result.mayNotReplace);
      $("#calculate").removeClass("disabled");
    },
    highlight: function(element, errorClass, validClass) {
      $(element).closest("div").addClass(errorClass).removeClass(validClass);
    },
    unhighlight: function(element, errorClass, validClass) {
      $(element).closest("div").removeClass(errorClass).addClass(validClass);
    }
  });

  gup = function(name) {
    var regex, regexS, results;
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    regexS = "[\\?&]" + name + "=([^&#]*)";
    regex = new RegExp(regexS);
    results = regex.exec(window.location.search);
    if (results != null) {
      return results[1];
    }
  };

  number_format = function(number, decimals, dec_point, thousands_sep) {
    var n, prec, s, toFixedFix;
    if (number == null) {
      number = "";
    }
    if (decimals == null) {
      decimals = 0;
    }
    if (dec_point == null) {
      dec_point = ".";
    }
    if (thousands_sep == null) {
      thousands_sep = ",";
    }
    number = (String(number)).replace(/[^0-9+\-Ee.]/g, "");
    n = isFinite(number) ? number : 0;
    prec = isFinite(decimals) ? Math.abs(decimals) : 0;
    s = "";
    toFixedFix = function(n, prec) {
      var k;
      k = Math.pow(10, prec);
      return "" + Math.round(n * k) / k;
    };
    s = (prec ? toFixedFix(n, prec) : "" + Math.round(n)).split('.');
    if (s[0].length > 3) {
      s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, thousands_sep);
    }
    if ((s[1] || "").length < prec) {
      s[1] = s[1] || "";
      s[1] += new Array(prec - s[1].length + 1).join("0");
    }
    return s.join(dec_point);
  };

  stripeTable = function() {
    $("" + TABLE_ID + " tr td, " + TABLE_ID + " tr th").removeClass("stripe");
    return $("" + TABLE_ID + " tr:visible:odd td, " + TABLE_ID + " tr:visible:odd td").addClass("stripe");
  };

  createAlert = function(params) {
    return "<div class=\"alert alert-block alert-" + params.type + " fade in\" id=\"" + params.id + "\">\n  <a href=\"#\" data-dismiss=\"alert\" class=\"close\">&times;</a>\n  <h4 class=\"alert-heading\">" + params.title + "</h4>\n    <p id=\"" + params.id + "Body\">" + params.body + "</p>\n </div>";
  };

  $("#Staminia_Advanced_Position").on("change", function() {
    showSkillsByPosition();
    return stripeTable();
  });

  showSkillsByPosition = function() {
    var SKILL_ENUMERATOR, position, skill;
    $("" + FORM_ID + " tr[class~=advanced]:not([id*=_Advanced_]) *[name*=_Advanced_]").removeClass("ignore");
    $("" + FORM_ID + " tr[class~=advanced][id*=_Advanced_] *[name*=_Advanced_]").addClass("ignore");
    $("" + TABLE_ID + " tr[class~=advanced][id*=_Advanced_]").addClass("hide").hide();
    position = Number($("#Staminia_Advanced_Position").val());
    if (!(position >= 0 && position <= 19)) {
      return;
    }
    SKILL_ENUMERATOR = Staminia.CONFIG.PR_ENUM_SKILL;
    for (skill in SKILL_ENUMERATOR) {
      if (Staminia.predictions[position][SKILL_ENUMERATOR[skill]] > 0) {
        $("#Staminia_Advanced_Skill_" + skill + " *[name]").removeClass("ignore");
        $("#Staminia_Advanced_Skill_" + skill).removeClass("hide").show();
      }
    }
  };

  enableAdvancedMode = function() {
    $("#Staminia_Options_AdvancedMode_Predictions").find(".btn").removeAttr("disabled");
    $("" + TABLE_ID + " tr[class~='simple']").addClass("hide").hide();
    $("" + FORM_ID + " *[name*=_Simple_]").addClass("ignore");
    $("" + TABLE_ID + " tr[class~=advanced]:not([id*=_Advanced_])").removeClass("hide").show();
    $("#Staminia_Options_Predictions_Type").slideDown();
    showSkillsByPosition();
  };

  disableAdvancedMode = function() {
    $("#Staminia_Options_AdvancedMode_Predictions").find(".btn").attr("disabled", "disabled");
    $("" + TABLE_ID + " tr[class~='advanced']").addClass("hide").hide();
    $("" + FORM_ID + " *[name*=_Advanced_]").addClass("ignore");
    $("" + FORM_ID + " *[name*=_Simple_]").removeClass("ignore");
    $("" + TABLE_ID + " tr[class~='simple']").removeClass("hide").show();
    $("#Staminia_Options_Predictions_Type").slideUp();
  };

  isChartsEnabled = function() {
    return $("#Staminia_Options_ChartsButton_Status").hasClass("btn-success");
  };

  isVerboseModeEnabled = function() {
    return $("#Staminia_Options_VerboseModeButton_Status").hasClass("btn-success");
  };

  isPressingEnabled = function() {
    return $("#Staminia_Options_PressingButton_Status").hasClass("btn-success");
  };

  isAdvancedModeEnabled = function() {
    return $("#Staminia_Options_AdvancedModeButton_Status").hasClass("btn-success");
  };

  enableCHPPMode = function() {
    $("" + TABLE_ID + " tr[class~='chpp']").removeClass("hide").show();
  };

  disableCHPPMode = function() {
    $("" + TABLE_ID + " tr[class~='chpp']").addClass("hide").hide();
  };

  fillForm = function() {
    var field, fields, i, params, paramsString, _i, _len;
    paramsString = gup("params");
    if (paramsString == null) {
      return;
    }
    params = decodeURI(paramsString).split("-");
    fields = $('#formPlayersInfo *[name^=Staminia_]');
    for (i = _i = 0, _len = fields.length; _i < _len; i = ++_i) {
      field = fields[i];
      field.value = params[i];
    }
    checkFormButtonsAppearance();
    if (isAdvancedModeEnabled()) {
      enableAdvancedMode();
    } else {
      disableAdvancedMode();
    }
    stripeTable();
  };

  checkFormButtonsAppearance = function() {
    $("button[data-checkbox-button]").each(function() {
      var $status_button, form;
      $status_button = $("#" + ($(this).attr('id')) + "_Status");
      form = $(FORM_ID)[0];
      if (Boolean(form[$(this).data("linkedTo")].value === "true")) {
        $status_button.removeClass("btn-danger").addClass("btn-success");
        return $status_button.find("i").removeClass("icon-remove").addClass("icon-ok");
      } else {
        $status_button.removeClass("btn-success").addClass("btn-danger");
        return $status_button.find("i").removeClass("icon-ok").addClass("icon-remove");
      }
    });
    $("button[data-radio-button]").each(function() {
      var form;
      form = $(FORM_ID)[0];
      if (Boolean(form[$(this).data("linkedTo")].value === "true")) {
        return $(this).addClass("active");
      } else {
        return $(this).removeClass("active");
      }
    });
  };

  $("#getLink").on("click", function(e) {
    var body, clippy, link, locale;
    if (!$(FORM_ID).validate().form()) {
      $("#generatedLink").alert('close');
      return;
    }
    link = document.location.href.split("?")[0];
    locale = gup("locale");
    if (locale != null) {
      link += "?locale=" + locale + "&amp;";
    } else {
      link += "?";
    }
    link += "params=" + (encodeURI($('#formPlayersInfo *[name^=Staminia_]').fieldValue().toString().replace(/,/g, "-")));
    clippy = "&nbsp;<span class=\"clippy\" data-clipboard-text=\"" + link + "\" id=\"staminiaClippy\"></span>";
    body = link;
    if ($("#generatedLinkBody").length) {
      $("#copyLinkToClipboard").data("text", link);
      $("#staminiaClippy").attr("data-clipboard-text", link);
      $("#generatedLinkBody").fadeOut("fast", function() {
        return $(this).html(body).fadeIn("fast");
      });
    } else {
      $("#AlertsContainer").append(createAlert({
        "id": "generatedLink",
        "type": "info",
        "body": body,
        "title": Staminia.messages.copy_link + " " + clippy
      }));
      new Staminia.ClippableBehavior($("#staminiaClippy")[0]);
    }
  });

  $("#switchPlayers").click(function() {
    $("" + FORM_ID + " *[name*=_Player_1_]").each(function() {
      var form, p1Value, p2Field;
      form = $(FORM_ID)[0];
      p2Field = form[this.name.replace("_1", "_2")];
      p1Value = this.value;
      this.value = p2Field.value;
      return p2Field.value = p1Value;
    });
    checkFormButtonsAppearance();
    $('.control-group').removeClass("error");
    $(FORM_ID).validate().form();
  });

  $("button.btn-status").on("click", function(e) {
    return $("#" + ($(this).attr('id').replace(/_Status$/g, ''))).click();
  });

  $("button[data-checkbox-button]").on("click", function(e) {
    var $status_button, form;
    form = $(FORM_ID)[0];
    $status_button = $("#" + ($(this).attr('id')) + "_Status");
    if (!$status_button.hasClass("btn-success")) {
      form[$(this).data("linkedTo")].value = true;
      $status_button.removeClass("btn-danger").addClass("btn-success");
      $status_button.find("i").removeClass("icon-remove").addClass("icon-ok");
    } else {
      form[$(this).data("linkedTo")].value = false;
      $status_button.removeClass("btn-success").addClass("btn-danger");
      $status_button.find("i").removeClass("icon-ok").addClass("icon-remove");
    }
  });

  $("#Staminia_Options_AdvancedModeButton").on("click", function(e) {
    var $status_button;
    $status_button = $("#" + ($(this).attr('id')) + "_Status");
    if ($status_button.hasClass("btn-success")) {
      enableAdvancedMode();
    } else {
      disableAdvancedMode();
    }
    stripeTable();
  });

  $("button[data-radio-button]").on("click", function(e) {
    var form;
    form = $(FORM_ID)[0];
    $("button[data-radio-button][data-radio-group='" + ($(this).data("radioGroup")) + "']").each(function() {
      return form[$(this).data("linkedTo")].value = "false";
    });
    form[$(this).data("linkedTo")].value = !$(this).hasClass("active");
    updatePredictions();
  });

  updatePredictions = function() {
    if ($("" + FORM_ID + " input[name=Staminia_Options_AdvancedMode_Predictions_Andreac]").val() === "true") {
      Staminia.predictions = Staminia.CONFIG.PREDICTIONS_ANDREAC;
    } else {
      Staminia.predictions = Staminia.CONFIG.PREDICTIONS_HO;
    }
  };

  $("input[data-validate='range'], select[data-validate='range']").each(function() {
    $(this).rules("add", {
      range: [$(this).data("rangeMin"), $(this).data("rangeMax")]
    });
  });

  resetAndHideTabs = function() {
    $("#tabChartsNav").hide();
    $("#tabContributionsNav").hide();
    $("#tabDebugNav").hide();
    $("#tabCharts").html("");
    $("#tabContributions").html("");
    return $("#tabDebug").html("");
  };

  $('a[data-toggle="tab"]').on('shown', function(e) {
    if ($(e.target).attr("href") === "#tabCredits") {
      return $("#AlertsContainer").hide();
    } else {
      return $("#AlertsContainer").show();
    }
  });

  $("#resetApp").on("click", function(e) {
    $(FORM_ID).each(function() {
      if (typeof this.reset === 'function' || (typeof this.reset === 'object' && !this.reset.nodeType)) {
        return this.reset();
      }
    });
    $('.control-group').removeClass("error");
    $("#AlertsContainer").html("");
    resetAndHideTabs();
    $("button[data-checkbox-button], button[data-radio-button]").each(function() {
      var form;
      form = $(FORM_ID)[0];
      form[$(this).data("linkedTo")].value = $(this).data("default-value");
    });
    checkFormButtonsAppearance();
    disableAdvancedMode();
    setupCHPPPlayerFields();
    stripeTable();
    return e.preventDefault();
  });

  $.validator.methods.range = function(value, element, param) {
    var globalizedValue;
    globalizedValue = value.replace(",", ".");
    return this.optional(element) || (globalizedValue >= param[0] && globalizedValue <= param[1]);
  };

  $.validator.methods.number = function(value, element) {
    return this.optional(element) || /^-?(?:\d+|\d{1,3}(?:[\s\.,]\d{3})+)(?:[\.,]\d+)?$/.test(value);
  };

  $.validator.addMethod("position", function(value, element, params) {
    return this.optional(element) || value >= params[0] && value <= params[1];
  }, jQuery.validator.messages.required);

  $("#Staminia_Advanced_Position").rules("add", {
    position: [0, 19]
  });

  $.ajaxSetup({
    dataType: "json",
    timeout: 30000,
    beforeSend: function(XMLHttpRequest, settings) {
      $("#CHPP_Refresh_Data").button('loading');
      $("#CHPP_Refresh_Data_Status").find("i").attr("class", "icon-white icon-time");
      $("#CHPP_Refresh_Data_Status").find("i").attr("title", "");
      $("#CHPP_Refresh_Data_Status").attr("disabled", "disabled");
      $("#CHPP_Refresh_Data_Status").removeClass("btn-danger btn-success btn-warning").addClass("btn-progress");
      $("#CHPP_Results").hide();
      return $("#CHPP_Status_Description").html("");
    },
    success: function(jsonObject, textStatus, xhr) {
      var PlayersData, description_message, error_message;
      switch (jsonObject.Status) {
        case "OK":
          try {
            $("#menuLoginTitle").text(jsonObject.TeamName);
            PlayersData = jsonObject.PlayersData;
            Staminia.PlayersData = PlayersData;
            setupCHPPPlayerFields(true);
            loginMenuHide();
            enableCHPPMode();
            stripeTable();
            if (jsonObject.RefreshThrottle) {
              $("#CHPP_Refresh_Data_Status").find("i").attr("class", "icon-warning-sign");
              $("#CHPP_Refresh_Data_Status").find("i").attr("title", Staminia.messages.status_warning);
              $("#CHPP_Refresh_Data_Status").removeClass("btn-progress btn-danger btn-success").addClass("btn-warning");
              $("#CHPP_Status_Description").text(Staminia.messages.refresh_throttle(jsonObject.RefreshThrottle));
            } else {
              $("#CHPP_Refresh_Data_Status").find("i").attr("class", "icon-white icon-ok");
              $("#CHPP_Refresh_Data_Status").find("i").attr("title", Staminia.messages.status_ok);
              $("#CHPP_Refresh_Data_Status").removeClass("btn-progress btn-danger btn-warning").addClass("btn-success");
            }
            $("#CHPP_Refresh_Data").data("completeText", $("#CHPP_Refresh_Data").data("successText"));
          } catch (error) {
            $("#CHPP_Refresh_Data_Status").find("i").attr("class", "icon-white icon-remove");
            $("#CHPP_Refresh_Data_Status").find("i").attr("title", Staminia.messages.status_error);
            $("#CHPP_Refresh_Data_Status").removeClass("btn-progress btn-success btn-warning").addClass("btn-danger");
            loginMenuShow();
            $("#CHPP_Refresh_Data").data("completeText", $("#CHPP_Refresh_Data").data("errorText"));
            $("#CHPP_Status_Description").html("" + Staminia.messages.error_unknown + ".<br/>\n" + Staminia.messages.retry_to_authorize + ".");
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
          $("#CHPP_Refresh_Data_Status").find("i").attr("class", "icon-white icon-remove");
          $("#CHPP_Refresh_Data_Status").find("i").attr("title", Staminia.messages.status_error);
          $("#CHPP_Refresh_Data_Status").removeClass("btn-progress btn-success btn-warning").addClass("btn-danger");
          $("#CHPP_Status_Description").html("" + error_message + "<br/>\n" + description_message);
          loginMenuShow();
          $("#CHPP_Refresh_Data").data("completeText", $("#CHPP_Refresh_Data").data("errorText"));
      }
      $("#CHPP_Refresh_Data_Status").removeAttr("disabled");
    },
    error: function(jqXHR, textStatus, thrownError) {
      var description_message, error_message;
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
      $("#CHPP_Refresh_Data_Status").find("i").attr("class", "icon-white icon-remove");
      $("#CHPP_Refresh_Data_Status").find("i").attr("title", Staminia.messages.status_error);
      $("#CHPP_Refresh_Data_Status").removeClass("btn-success btn-warning").addClass("btn-danger");
      $("#CHPP_Status_Description").html("" + error_message + "<br/>\n" + description_message);
      loginMenuShow();
      $("#CHPP_Refresh_Data").data("completeText", $("#CHPP_Refresh_Data").data("errorText"));
      $("#CHPP_Refresh_Data_Status").removeAttr("disabled");
    },
    complete: function(jqXHR, textStatus) {
      $("#CHPP_Results").show();
      return $("#CHPP_Refresh_Data").button('complete');
    }
  });

  sort_by = function(field, reverse, primer) {
    reverse = reverse ? -1 : 1;
    return function(a, b) {
      a = a[field];
      b = b[field];
      if (primer != null) {
        a = primer(a);
        b = primer(b);
        if (isNaN(a)) {
          a = Infinity;
        }
        if (isNaN(b)) {
          b = Infinity;
        }
      }
      if (a < b) {
        return reverse * -1;
      }
      if (a > b) {
        return reverse * 1;
      }
      return 0;
    };
  };

  sortCHPPPlayerFields = function() {
    var PlayersData, field, primer, reverse;
    PlayersData = Staminia.PlayersData;
    if (PlayersData == null) {
      return;
    }
    field = "PlayerNumber";
    reverse = false;
    primer = parseInt;
    switch ($("" + FORM_ID + " select[id=CHPP_Players_SortBy]").val()) {
      case "ShirtNumber":
        field = "PlayerNumber";
        break;
      case "Name":
        field = "PlayerName";
        primer = void 0;
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
    }
    PlayersData.sort(sort_by(field, reverse, primer));
  };

  updateCHPPPlayerFields = function() {
    var PlayersData, index, mc, name, number, optionElement, player, select, selectP1, selectP2, _i, _len;
    PlayersData = Staminia.PlayersData;
    if (PlayersData == null) {
      return;
    }
    sortCHPPPlayerFields();
    $("#CHPP_Player_1").html("");
    $("#CHPP_Player_2").html("");
    select = $(document.createElement("select"));
    for (index = _i = 0, _len = PlayersData.length; _i < _len; index = ++_i) {
      player = PlayersData[index];
      optionElement = $(document.createElement("option"));
      if ((Number(player.InjuryLevel)) === 0) {
        optionElement.addClass("isBruised");
      }
      if ((Number(player.InjuryLevel)) > 0) {
        optionElement.addClass("isInjured");
      }
      if ((Number(player.Cards)) >= 3) {
        optionElement.addClass("isSuspended");
      }
      if (player.TransferListed) {
        optionElement.addClass("isTransferListed");
      }
      optionElement.attr("value", index);
      name = optionElement.text("" + (number = player.PlayerNumber != null ? player.PlayerNumber + '.' : '') + " " + player.PlayerName + " " + (mc = player.MotherClubBonus ? '\u2665' : ''));
      select.append(optionElement);
    }
    selectP1 = select.clone("true");
    selectP2 = select.clone("true");
    selectP1.attr("id", "CHPP_Player_1");
    selectP2.attr("id", "CHPP_Player_2");
    $("#CHPP_Player_1").html(selectP1.html());
    $("#CHPP_Player_2").html(selectP2.html());
  };

  setupCHPPPlayerFields = function(checkUrlParameter) {
    if (checkUrlParameter == null) {
      checkUrlParameter = false;
    }
    updateCHPPPlayerFields();
    if ($("#CHPP_Player_1 option").length > 2 && $("#CHPP_Player_2 option").length > 2) {
      $("#CHPP_Player_1 option:eq(0)").attr("selected", "selected");
      $("#CHPP_Player_2 option:eq(1)").attr("selected", "selected");
      setPlayerFormFields(1, checkUrlParameter);
      setPlayerFormFields(2, checkUrlParameter);
    }
  };

  $("" + FORM_ID + " select[id=CHPP_Player_1]").on("change", function() {
    setPlayerFormFields(1);
  });

  $("" + FORM_ID + " select[id=CHPP_Player_2]").on("change", function() {
    setPlayerFormFields(2);
  });

  $("" + FORM_ID + " select[id=CHPP_Players_SortBy]").on("change", function() {
    updateCHPPPlayerFields();
    if ($("#CHPP_Player_1 option").length > 2 && $("#CHPP_Player_2 option").length > 2) {
      $("#CHPP_Player_1 option:eq(0)").attr("selected", "selected");
      $("#CHPP_Player_2 option:eq(1)").attr("selected", "selected");
      setPlayerFormFields(1);
      setPlayerFormFields(2);
    }
  });

  setPlayerFormFields = function(player, checkUrlParameter) {
    var PlayerData, PlayersData, formReference;
    if (checkUrlParameter == null) {
      checkUrlParameter = false;
    }
    if (checkUrlParameter && (gup("params") != null)) {
      return;
    }
    PlayersData = Staminia.PlayersData;
    formReference = $(FORM_ID)[0];
    if (PlayersData == null) {
      return;
    }
    PlayerData = PlayersData[formReference["CHPP_Player_" + player].value];
    if (PlayerData == null) {
      return;
    }
    formReference["Staminia_Simple_Player_" + player + "_Experience"].value = PlayerData.Experience;
    formReference["Staminia_Simple_Player_" + player + "_Stamina"].value = PlayerData.StaminaSkill;
    formReference["Staminia_Simple_Player_" + player + "_Form"].value = PlayerData.PlayerForm;
    formReference["Staminia_Simple_Player_" + player + "_MainSkill"].value = PlayerData.MainSkill;
    formReference["Staminia_Simple_Player_" + player + "_Loyalty"].value = PlayerData.Loyalty;
    if ((PlayerData.MotherClubBonus && !$("#Button_Player_" + player + "_MotherClubBonus_Status").hasClass("btn-success")) || (!PlayerData.MotherClubBonus && $("#Button_Player_" + player + "_MotherClubBonus_Status").hasClass("btn-success"))) {
      $("#Button_Player_" + player + "_MotherClubBonus").click();
    }
    formReference["Staminia_Advanced_Player_" + player + "_Experience"].value = number_format(PlayerData.Experience, 2);
    formReference["Staminia_Advanced_Player_" + player + "_Stamina"].value = number_format(PlayerData.StaminaSkill, 2);
    formReference["Staminia_Advanced_Player_" + player + "_Form"].value = number_format(PlayerData.PlayerForm, 2);
    formReference["Staminia_Advanced_Player_" + player + "_Loyalty"].value = number_format(PlayerData.Loyalty, 2);
    formReference["Staminia_Advanced_Player_" + player + "_Skill_Keeper"].value = number_format(PlayerData.KeeperSkill, 2);
    formReference["Staminia_Advanced_Player_" + player + "_Skill_Defending"].value = number_format(PlayerData.DefenderSkill, 2);
    formReference["Staminia_Advanced_Player_" + player + "_Skill_Playmaking"].value = number_format(PlayerData.PlaymakerSkill, 2);
    formReference["Staminia_Advanced_Player_" + player + "_Skill_Winger"].value = number_format(PlayerData.WingerSkill, 2);
    formReference["Staminia_Advanced_Player_" + player + "_Skill_Passing"].value = number_format(PlayerData.PassingSkill, 2);
    return formReference["Staminia_Advanced_Player_" + player + "_Skill_Scoring"].value = number_format(PlayerData.ScorerSkill, 2);
  };

  loginMenuHide = function() {
    $("#loginDropdown").addClass("hide");
    return $("#loggedInDropdown").removeClass("hide");
  };

  loginMenuShow = function() {
    $("#menuLoginTitle").text("CHPP");
    $("#loggedInDropdown").addClass("hide");
    return $("#loginDropdown").removeClass("hide");
  };

  $("#CHPP_Refresh_Data").on("click", function() {
    return $.ajax({
      url: "chpp/chpp_retrievedata.php?refresh",
      cache: false
    });
  });

  $("#CHPP_Revoke_Auth_Link").on("click", function() {
    $(this).closest("[class~='open']").removeClass('open');
    return window.confirm(Staminia.messages.revoke_auth_confirm);
  });

  Staminia.format = format;

  Staminia.number_format = number_format;

  Staminia.isChartsEnabled = isChartsEnabled;

  Staminia.isVerboseModeEnabled = isVerboseModeEnabled;

  Staminia.isPressingEnabled = isPressingEnabled;

  Staminia.isAdvancedModeEnabled = isAdvancedModeEnabled;

}).call(this);
