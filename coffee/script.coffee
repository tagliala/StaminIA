"use strict"
window.Staminia = window.Staminia || {}
Staminia = window.Staminia
Staminia.CONFIG = Staminia.CONFIG || {}
$.extend Staminia.CONFIG,
  FORM_ID: "#formPlayersInfo"
  TABLE_ID: "#playersInfoTable"
  DEBUG: true
  DEBUG_STEP: 1
  AUTOSTART: true
  PREDICTIONS_ANDREAC: [ [ 0.5036, 0.2310, 0.0, 0.0, 0.0, 0.0 ], [ 0.0, 0.3492, 0.1180, 0.0, 0.0, 0.0 ], [ 0.0, 0.2514, 0.1590, 0.0, 0.0, 0.0 ], [ 0.0, 0.3546, 0.0825, 0.0556, 0.0, 0.0 ], [ 0.0, 0.3236, 0.0780, 0.1086, 0.0, 0.0 ], [ 0.0, 0.2480, 0.1080, 0.1375, 0.0, 0.0 ], [ 0.0, 0.3440, 0.0310, 0.0688, 0.0, 0.0 ], [ 0.0, 0.3256, 0.0780, 0.0604, 0.0, 0.0 ], [ 0.0, 0.1302, 0.4680, 0.0, 0.1149, 0.0 ], [ 0.0, 0.0733, 0.4420, 0.0, 0.1508, 0.0 ], [ 0.0, 0.2039, 0.4420, 0.0, 0.0760, 0.0 ], [ 0.0, 0.1383, 0.4130, 0.1073, 0.1071, 0.0 ], [ 0.0, 0.1314, 0.2180, 0.1848, 0.0669, 0.0 ], [ 0.0, 0.0652, 0.1830, 0.2081, 0.0803, 0.0 ], [ 0.0, 0.1831, 0.1830, 0.1556, 0.0484, 0.0 ], [ 0.0, 0.1341, 0.2760, 0.1350, 0.0671, 0.0 ], [ 0.0, 0.0, 0.0, 0.0808, 0.1306, 0.3077 ], [ 0.0, 0.0, 0.1950, 0.0550, 0.2189, 0.1778 ], [ 0.0, 0.0, 0.1950, 0.0550, 0.2661, 0.1778 ], [ 0.0, 0.0, 0.0, 0.0901, 0.1334, 0.2441 ] ]
  PREDICTIONS_HO: [ [ 0.4897, 0.2310, 0.0, 0.0, 0.0, 0.0 ], [ 0.0, 0.3492, 0.1140, 0.0, 0.0, 0.0 ], [ 0.0, 0.2530, 0.1540, 0.0, 0.0, 0.0 ], [ 0.0, 0.3488, 0.0825, 0.0556, 0.0, 0.0 ], [ 0.0, 0.3283, 0.0780, 0.1086, 0.0, 0.0 ], [ 0.0, 0.2582, 0.1080, 0.1375, 0.0, 0.0 ], [ 0.0, 0.3550, 0.0310, 0.0688, 0.0, 0.0 ], [ 0.0, 0.3214, 0.0780, 0.0604, 0.0, 0.0 ], [ 0.0, 0.1348, 0.4680, 0.0, 0.1148, 0.0 ], [ 0.0, 0.0727, 0.4420, 0.0, 0.1475, 0.0 ], [ 0.0, 0.1974, 0.4420, 0.0, 0.0760, 0.0 ], [ 0.0, 0.1383, 0.4130, 0.1073, 0.1063, 0.0 ], [ 0.0, 0.1314, 0.2130, 0.1873, 0.0669, 0.0 ], [ 0.0, 0.0629, 0.1780, 0.2193, 0.0814, 0.0 ], [ 0.0, 0.1769, 0.1780, 0.1585, 0.0484, 0.0 ], [ 0.0, 0.1245, 0.2690, 0.1235, 0.0596, 0.0 ], [ 0.0, 0.0, 0.0, 0.0790, 0.1297, 0.3046 ], [ 0.0, 0.0, 0.2010, 0.0545, 0.2214, 0.1781 ], [ 0.0, 0.0, 0.2010, 0.0545, 0.2519, 0.1781 ], [ 0.0, 0.0, 0.0, 0.1150, 0.1323, 0.2632 ] ]
  PR_ENUM_SKILL:
    Keeper: 0
    Defending: 1
    Playmaking: 2
    Winger: 3
    Passing: 4
    Scoring: 5

format = (source, params) ->
  if arguments.length is 1
    return ->
      args = $.makeArray(arguments)
      args.unshift source
      format.apply this, args
  params = $.makeArray(arguments).slice(1)  if arguments.length > 2 and params.constructor isnt Array
  params = [ params ]  unless params.constructor is Array
  $.each params, (i, n) ->
    source = source.replace(new RegExp("\\{" + i + "\\}", "g"), n)
    return
  source

createSubstitutionAlert = (substituteAtArray, mayNotReplace) ->
  ranges = []
  r = 0

  for minute in substituteAtArray
    unless ranges[r]
      ranges[r] = []
      ranges[r].push minute
      check_with = minute + 1
    else if minute isnt check_with      
      ranges[r].push check_with - 1 unless ranges[r][ranges[r].length - 1] is check_with - 1
      r++
      _i--
    else if minute is check_with
      check_with = minute + 1
    if _i is _len-1
      l = ranges[r].length - 1
      ranges[r].push minute if ranges[r][l] isnt minute
        
  result = []
  for range in ranges
    result.push range.join "-"
  title = ""
  body = ""
  if substituteAtArray.length > 0
    title = ""
    if substituteAtArray.length is 1
      title += "#{Staminia.messages.replace} #{Staminia.messages.at_minute}"
    else
      title += "#{Staminia.messages.replace} #{Staminia.messages.at_minutes}"
    body = """
      <p class="minutes">#{result.join ","}</p>
      """
    body += "#{Staminia.messages.may_not_replace}" if mayNotReplace
  else
    title = Staminia.messages.do_not_replace
  $('#AlertsContainer').append createAlert "id": "formSubstituteAt", "type": "success", "title" : title, "body": body
  return

FORM_ID = Staminia.CONFIG.FORM_ID
TABLE_ID = Staminia.CONFIG.TABLE_ID
DEBUG = Staminia.CONFIG.DEBUG
AUTOSTART = Staminia.CONFIG.AUTOSTART
Staminia.predictions = Staminia.CONFIG.PREDICTIONS_HO

# Stops propagation of click event on login form
$('.dropdown-menu').find('form').click (e) ->
  e.stopPropagation()
  
# Document.ready
$ ->
  hasParams = gup("params")?
  fillForm() if hasParams
  stripeTable()
  $(FORM_ID).submit() if hasParams and AUTOSTART
  $("#imgMadeInItaly").tooltip()
  $.ajax { url: "chpp/chpp_retrievedata.php", cache: true } if document.startAjax
    

$(FORM_ID).validate({
  ignore: ".ignore"
  errorContainer: "#formErrors"
  errorLabelContainer: "#formErrorsUl"
  errorElement: "li"
  focusInvalid: true
  showErrors: (errorMap, errorList) -> 
    if (@numberOfInvalids() == 0)
      $("#formErrors").remove()
    @defaultShowErrors()
    return
  errorPlacement: (error, element) -> null
  invalidHandler: (form, validator) ->
    errors = validator.numberOfInvalids()
    if errors
      message = Staminia.messages.validation_error if errors == 1
      message = Staminia.messages.validation_errors(errors) if errors > 1
      $("#formErrors").remove()
      if validator.errorList.length > 0
        $('#AlertsContainer').append createAlert "id": "formErrors", "type": "error", "title" : message, "body": """
          <ul id="formErrorsUl"></ul>
        """
        for error in validator.errorList
          $("#formErrorsUl").append "<li>#{$(error.element).data("fieldName")}: #{error.message}</li>"
      else
        $('#formErrors').dismiss()
      validator.focusInvalid()
      return
  submitHandler: (form) ->   
    $("#calculate").addClass "disabled"
    resetAndHideTabs()
    $("#AlertsContainer").html ""
    result = Staminia.Engine.start()
    
    # Show warnings
    warnings_list = ""
    if result.player2_stronger_than_player1
      warnings_list += "<li>#{Staminia.messages.player2_stronger_than_player1}</li>"
    if result.player1_low_stamina_se_risk
      warnings_list += "<li>#{Staminia.messages.player1_low_stamina_se(result.player1_low_stamina_se)}</li>"
    if result.player2_low_stamina_se_risk
      warnings_list += "<li>#{Staminia.messages.player2_low_stamina_se(result.player2_low_stamina_se)}</li>"
    $('#AlertsContainer').append createAlert "id": "formWarnings", "type": "warning", "title" : Staminia.messages.status_warning, "body": "<ul>#{warnings_list}</ul>" if warnings_list isnt ""

    # Show contributions table
    if isVerboseModeEnabled()
      # Strength table
      tempHTML = """
        <h3 class="legend-like">#{Staminia.messages.strength_table}</h3>
        <table class="table table-striped table-condensed table-staminia table-staminia-strength width-auto">
          <thead>
            <tr>
              <th></th><th>#{Staminia.messages.player1}</th><th>#{Staminia.messages.player2}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>#{Staminia.messages.strength}</td>
              <td>#{number_format(result.player1Strength, 2)}</td>
              <td>#{number_format(result.player2Strength, 2)}</td>
            </tr>
            <tr>
              <td>#{Staminia.messages.strength_st_independent}</td>
              <td>#{number_format(result.player1StrengthStaminaIndependent, 2)}</td>
              <td>#{number_format(result.player2StrengthStaminaIndependent, 2)}</td>
            </tr>
          </tbody>
        </table>
        <p><small>#{Staminia.messages.used_in_calculation}</small></p>
        """
      $("#tabContributions").append tempHTML

      # Contributions table
      tableHeader = """
        <thead>
          <tr>
            <th class="min-width">#{Staminia.messages.substitution_minute}</th>
            <th>#{Staminia.messages.total_contribution}</th>
            <th>#{Staminia.messages.contribution_percent}</th>
            <th>#{Staminia.messages.p1_contrib}</th>
            <th>#{Staminia.messages.p2_contrib}</th>
            <th>#{Staminia.messages.notes}</th>
          </tr>
        </thead>
        """

      tableSeparator = "<tr><td colspan='6'></td></tr>"

      tempHTML = """
        <h3 class="legend-like">#{Staminia.messages.contribution_table}</h3>
        <table class="table table-striped table-condensed table-staminia table-staminia-contributions width-auto">
          <thead>
          </thead>
            #{tableHeader}
          </thead>
          <tbody>
        """
      player1LowStamina = (String) result.player1_low_stamina_se
      player2LowStamina = (String) result.player2_low_stamina_se
      for minute of result.minutes
        minuteObject = result.minutes[minute]
        totalContribution = minuteObject.total
        percentContribution = minuteObject.percent
        p1Contribution = minuteObject.p1
        p2Contribution = minuteObject.p2
        isMax = minuteObject.isMax
        isMin = minuteObject.isMin
        if minute is "46"
          tempHTML += tableHeader
        note = (if isMax then "MAX" else (if isMin then "MIN" else (if 100 - percentContribution < 1 then "~ 1%" else ""))) + (if minute is player1LowStamina then " " + Staminia.messages.p1_low_stamina else "") + (if minute is player2LowStamina then " " + Staminia.messages.p2_low_stamina else "")
        css_classes = (if isMax then " max" else "") + (if isMin then " min" else "")
        tempHTML += """
          <tr class="#{css_classes}">
            <td>#{minute}</td>
            <td>#{totalContribution}</td>
            <td>#{percentContribution}%</td>
            <td>#{p1Contribution}</td>
            <td>#{p2Contribution}</td>
            <td>#{note}</td>
          </tr>
          """
      tempHTML += "</tbody></table>"
      $("#tabContributions").append tempHTML

      $("#tabContributionsNav").show() 
      $("#tabContributionsNav").find("a").tab "show"

    createSubstitutionAlert(result.substituteAt, result.mayNotReplace)

    #if Staminia.CONFIG.DEBUG_STEP
    #  printContributionTable()
    #  $("#tabDebugNav").show() 
    #  #$("#tabDebugNav").find("a").tab "show"

    # Reset button status
    $("#calculate").removeClass "disabled"

    return
  highlight: (element, errorClass, validClass) ->
     $(element).closest("div").addClass(errorClass).removeClass(validClass)
     return
  unhighlight: (element, errorClass, validClass) ->
     $(element).closest("div").removeClass(errorClass).addClass(validClass)
     return
})

# GUP
gup = (name) ->
  name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]")
  regexS = "[\\?&]#{name}=([^&#]*)"
  regex = new RegExp(regexS)
  results = regex.exec(window.location.search)
  results[1] if results?

number_format = (number = "", decimals = 0, dec_point = ".", thousands_sep = ",") ->
  number = ((String) number).replace /[^0-9+\-Ee.]/g, ""
  n = if isFinite(number) then number else 0
  prec = if isFinite(decimals) then Math.abs(decimals) else 0
  s = ""
  toFixedFix = (n, prec) ->
    k = Math.pow(10, prec)
    "" + Math.round(n * k) / k
  s = (if prec then toFixedFix(n, prec) else "" + Math.round(n)).split '.'
  if s[0].length > 3
    s[0] = s[0].replace /\B(?=(?:\d{3})+(?!\d))/g, thousands_sep
  if (s[1] or "").length < prec
    s[1] = s[1] or ""
    s[1] += new Array(prec - s[1].length + 1).join "0"
  
  s.join dec_point

# Dynamic Table Stripe
stripeTable = ->
  $("#{TABLE_ID} tr td, #{TABLE_ID} tr th").removeClass "stripe"
  $("#{TABLE_ID} tr:visible:odd td, #{TABLE_ID} tr:visible:odd td").addClass "stripe"

# Create alert
createAlert = (params) ->
  """
  <div class="alert alert-block alert-#{params.type} fade in" id="#{params.id}">
    <a href="#" data-dismiss="alert" class="close">&times;</a>
    <h4 class="alert-heading">#{params.title}</h4>
      <p id="#{params.id}Body">#{params.body}</p>
   </div>
  """

$("#Staminia_Advanced_Position").on "change", ->
  showSkillsByPosition()
  stripeTable()

showSkillsByPosition = ->
  $("#{FORM_ID} tr[class~=advanced]:not([id*=_Advanced_]) *[name*=_Advanced_]").removeClass "ignore"
  $("#{FORM_ID} tr[class~=advanced][id*=_Advanced_] *[name*=_Advanced_]").addClass "ignore"
  $("#{TABLE_ID} tr[class~=advanced][id*=_Advanced_]").addClass("hide").hide()
  
  position = (Number) $("#Staminia_Advanced_Position").val()
  return unless position >= 0 and position <= 19
  SKILL_ENUMERATOR = Staminia.CONFIG.PR_ENUM_SKILL
  for skill of SKILL_ENUMERATOR
    if Staminia.predictions[position][SKILL_ENUMERATOR[skill]] > 0
      $("#Staminia_Advanced_Skill_#{skill} *[name]").removeClass "ignore"
      $("#Staminia_Advanced_Skill_#{skill}").removeClass("hide").show()
  return

# Enable Advanced Mode
enableAdvancedMode =  ->
  $("#Staminia_Options_AdvancedMode_Predictions").find(".btn").removeAttr "disabled"
  $("#{TABLE_ID} tr[class~='simple']").addClass("hide").hide()
  $("#{FORM_ID} *[name*=_Simple_]").addClass "ignore"
  $("#{TABLE_ID} tr[class~=advanced]:not([id*=_Advanced_])").removeClass("hide").show()
  $("#Staminia_Options_Predictions_Type").slideDown()
  showSkillsByPosition()
  return

# Disable Advanced Mode
disableAdvancedMode =  ->
  $("#Staminia_Options_AdvancedMode_Predictions").find(".btn").attr "disabled", "disabled"
  $("#{TABLE_ID} tr[class~='advanced']").addClass("hide").hide()
  $("#{FORM_ID} *[name*=_Advanced_]").addClass "ignore"
  $("#{FORM_ID} *[name*=_Simple_]").removeClass "ignore"
  $("#{TABLE_ID} tr[class~='simple']").removeClass("hide").show()
  $("#Staminia_Options_Predictions_Type").slideUp()
  return

isChartsEnabled = ->
  $("#Staminia_Options_ChartsButton_Status").hasClass "btn-success"

isVerboseModeEnabled = ->
  $("#Staminia_Options_VerboseModeButton_Status").hasClass "btn-success"

isPressingEnabled = ->
  $("#Staminia_Options_PressingButton_Status").hasClass "btn-success"

isAdvancedModeEnabled = ->
  $("#Staminia_Options_AdvancedModeButton_Status").hasClass "btn-success"

enableCHPPMode = ->
  $("#{TABLE_ID} tr[class~='chpp']").removeClass("hide").show()
  return
  
disableCHPPMode = ->
  $("#{TABLE_ID} tr[class~='chpp']").addClass("hide").hide()
  return

# Fill Form Helper
fillForm = ->
  paramsString = gup("params")
  return unless paramsString?
  params = decodeURI(paramsString).split "-"
  fields = $('#formPlayersInfo *[name^=Staminia_]')
  for field, i in fields
    field.value = params[i]
  checkFormButtonsAppearance()
  if isAdvancedModeEnabled()
    enableAdvancedMode()
  else
    disableAdvancedMode()
  stripeTable()
  return

# Check Form Buttons Appearance
checkFormButtonsAppearance = ->
  $("button[data-checkbox-button]").each ->
    $status_button = $("##{$(this).attr 'id'}_Status")
    form = $(FORM_ID)[0]
    if (Boolean) form[$(this).data("linkedTo")].value == "true"
      $status_button.removeClass("btn-danger").addClass "btn-success"
      $status_button.find("i").removeClass("icon-remove").addClass "icon-ok"
    else
      $status_button.removeClass("btn-success").addClass "btn-danger"
      $status_button.find("i").removeClass("icon-ok").addClass "icon-remove"
  $("button[data-radio-button]").each ->
    form = $(FORM_ID)[0]
    if (Boolean) form[$(this).data("linkedTo")].value == "true"
      $(this).addClass "active"
    else
      $(this).removeClass "active"
  return

# Stamin.IA! Get Link Button
$("#getLink").on "click", (e) ->
  unless $(FORM_ID).validate().form()
    $("#generatedLink").alert('close')
    return
  
  link = document.location.href.split("?")[0]
  locale = gup "locale"

  if locale?
    link += "?locale=#{locale}&amp;"
  else
    link +="?"
  
  link += "params=#{encodeURI($('#formPlayersInfo *[name^=Staminia_]').fieldValue().toString().replace(/,/g,"-"))}"

  clippy = """
    &nbsp;<span class="clippy" data-clipboard-text="#{link}" id="staminiaClippy"></span>
    """
  body = link
  
  if $("#generatedLinkBody").length
    $("#copyLinkToClipboard").data("text", link)
    $("#staminiaClippy").attr("data-clipboard-text", link)
    $("#generatedLinkBody").fadeOut "fast", ->
      $(this).html(body).fadeIn "fast"
  else
    $("#AlertsContainer").append createAlert "id": "generatedLink", "type": "info", "body": body, "title" : Staminia.messages.copy_link + " " + clippy
    new Staminia.ClippableBehavior($("#staminiaClippy")[0])
  return

# Stamin.IA! Switch Players Button
$("#switchPlayers").click ->
  $("#{FORM_ID} *[name*=_Player_1_]").each ->
      form = $(FORM_ID)[0]
      p2Field = form[@name.replace("_1","_2")]
      p1Value = @value
      @value = p2Field.value
      p2Field.value = p1Value
  checkFormButtonsAppearance()
  $('.control-group').removeClass "error"
  $(FORM_ID).validate().form()
  return

$("button.btn-status").on "click", (e) ->
  $("##{$(this).attr('id').replace(/_Status$/g,'')}").click()

$("button[data-checkbox-button]").on "click", (e) ->
  form = $(FORM_ID)[0]
  $status_button = $("##{$(this).attr 'id'}_Status")
  if !$status_button.hasClass "btn-success"
    form[$(this).data("linkedTo")].value = true
    $status_button.removeClass("btn-danger").addClass "btn-success"
    $status_button.find("i").removeClass("icon-remove").addClass "icon-ok"
  else
    form[$(this).data("linkedTo")].value = false
    $status_button.removeClass("btn-success").addClass "btn-danger"
    $status_button.find("i").removeClass("icon-ok").addClass "icon-remove"
  return

$("#Staminia_Options_AdvancedModeButton").on "click", (e) -> 
  $status_button = $("##{$(this).attr 'id'}_Status")
  if $status_button.hasClass "btn-success"
    enableAdvancedMode()
  else
    disableAdvancedMode()
  stripeTable()
  return

$("button[data-radio-button]").on "click", (e) ->
  form = $(FORM_ID)[0]
  $("button[data-radio-button][data-radio-group='#{$(this).data("radioGroup")}']").each ->
    form[$(this).data("linkedTo")].value = "false"
  form[$(this).data("linkedTo")].value = !$(this).hasClass "active"
  updatePredictions()
  return

updatePredictions = ->
  if $("#{FORM_ID} input[name=Staminia_Options_AdvancedMode_Predictions_Andreac]").val() == "true"
    Staminia.predictions = Staminia.CONFIG.PREDICTIONS_ANDREAC
  else
    Staminia.predictions = Staminia.CONFIG.PREDICTIONS_HO
  return
  
$("input[data-validate='range'], select[data-validate='range']").each -> 
  $(this).rules("add", { range: [$(this).data("rangeMin"), $(this).data("rangeMax")] })
  return

resetAndHideTabs = ->
  $("#tabChartsNav").hide()
  $("#tabContributionsNav").hide()
  $("#tabDebugNav").hide()
  $("#tabCharts").html ""
  $("#tabContributions").html ""
  $("#tabDebug").html ""

# Hide alerts when showing credits
$('a[data-toggle="tab"]').on 'shown', (e) ->
  if $(e.target).attr("href") is "#tabCredits"
    $("#AlertsContainer").hide()
  else
    $("#AlertsContainer").show()

# Stamin.IA! Reset Button
$("#resetApp").on "click", (e) ->
  $(FORM_ID).each ->
    if (typeof this.reset == 'function' or (typeof this.reset == 'object' and !this.reset.nodeType))
      this.reset()

  $('.control-group').removeClass "error"
  $("#AlertsContainer").html ""
  resetAndHideTabs()
  
  $("button[data-checkbox-button], button[data-radio-button]").each ->
    form = $(FORM_ID)[0]
    form[$(this).data("linkedTo")].value = $(this).data "default-value"
    return
    
  checkFormButtonsAppearance()
  disableAdvancedMode()
  setupCHPPPlayerFields()
  stripeTable()
  e.preventDefault()

$.validator.methods.range = (value, element, param) ->
  globalizedValue = value.replace ",", "."
  @optional(element) or (globalizedValue >= param[0] and globalizedValue <= param[1])

$.validator.methods.number = (value, element) ->
  return @optional(element) or /^-?(?:\d+|\d{1,3}(?:[\s\.,]\d{3})+)(?:[\.,]\d+)?$/.test(value)

$.validator.addMethod "position" , (value, element, params) -> 
 @optional(element) or value >= params[0] and value <= params[1]
, jQuery.validator.messages.required

$("#Staminia_Advanced_Position").rules "add", { position: [0, 19] }

$.ajaxSetup {
  dataType: "json",
  timeout: 30000,
  beforeSend : (XMLHttpRequest, settings) ->
    $("#CHPP_Refresh_Data").button('loading')
    $("#CHPP_Refresh_Data_Status").find("i").attr "class", "icon-white icon-time"
    $("#CHPP_Refresh_Data_Status").find("i").attr "title", ""
    $("#CHPP_Refresh_Data_Status").attr "disabled", "disabled"
    $("#CHPP_Refresh_Data_Status").removeClass("btn-danger btn-success btn-warning").addClass "btn-progress"
    $("#CHPP_Results").hide()
    $("#CHPP_Status_Description").html ""
  success : (jsonObject, textStatus, xhr) ->
    switch jsonObject.Status
      when "OK"
        try
          $("#menuLoginTitle").text jsonObject.TeamName
          PlayersData = jsonObject.PlayersData
          Staminia.PlayersData = PlayersData
          setupCHPPPlayerFields(true)
          loginMenuHide()
          enableCHPPMode()
          stripeTable()
          if (jsonObject.RefreshThrottle)
            $("#CHPP_Refresh_Data_Status").find("i").attr "class", "icon-warning-sign"
            $("#CHPP_Refresh_Data_Status").find("i").attr "title", Staminia.messages.status_warning
            $("#CHPP_Refresh_Data_Status").removeClass("btn-progress btn-danger btn-success").addClass "btn-warning"
            $("#CHPP_Status_Description").text Staminia.messages.refresh_throttle jsonObject.RefreshThrottle
          else
            $("#CHPP_Refresh_Data_Status").find("i").attr "class", "icon-white icon-ok"
            $("#CHPP_Refresh_Data_Status").find("i").attr "title", Staminia.messages.status_ok
            $("#CHPP_Refresh_Data_Status").removeClass("btn-progress btn-danger btn-warning").addClass "btn-success"
          $("#CHPP_Refresh_Data").data "completeText", $("#CHPP_Refresh_Data").data("successText")
        catch error
          $("#CHPP_Refresh_Data_Status").find("i").attr "class", "icon-white icon-remove"
          $("#CHPP_Refresh_Data_Status").find("i").attr "title", Staminia.messages.status_error
          $("#CHPP_Refresh_Data_Status").removeClass("btn-progress btn-success btn-warning").addClass "btn-danger"
          loginMenuShow()
          $("#CHPP_Refresh_Data").data "completeText", $("#CHPP_Refresh_Data").data("errorText")
          $("#CHPP_Status_Description").html """
            #{Staminia.messages.error_unknown}.<br/>
            #{Staminia.messages.retry_to_authorize}.
            """ 
      when "Error"
        switch jsonObject.ErrorCode
          when "InvalidToken"
            error_message = Staminia.messages.error_invalid_token
            description_message = Staminia.messages.retry_to_authorize
          when ""
          else
            error_message = Staminia.messages.error_unknown
            description_message = Staminia.messages.retry_to_authorize
        $("#CHPP_Refresh_Data_Status").find("i").attr "class", "icon-white icon-remove"
        $("#CHPP_Refresh_Data_Status").find("i").attr "title", Staminia.messages.status_error
        $("#CHPP_Refresh_Data_Status").removeClass("btn-progress btn-success btn-warning").addClass "btn-danger"
        $("#CHPP_Status_Description").html """
          #{error_message}<br/>
          #{description_message}
          """ 
        loginMenuShow()
        $("#CHPP_Refresh_Data").data "completeText", $("#CHPP_Refresh_Data").data("errorText")
    $("#CHPP_Refresh_Data_Status").removeAttr "disabled"
    return
        
  error : (jqXHR, textStatus, thrownError) ->
    switch textStatus
      when "timeout"
        error_message = Staminia.messages.error_timeout
        description_message = ""
      when "parsererror"
        error_message = Staminia.messages.error_parser
        description_message = ""
      else
        error_message = Staminia.messages.error_unknown
        description_message = Staminia.messages.retry_to_authorize
    $("#CHPP_Refresh_Data_Status").find("i").attr "class", "icon-white icon-remove"
    $("#CHPP_Refresh_Data_Status").find("i").attr "title", Staminia.messages.status_error
    $("#CHPP_Refresh_Data_Status").removeClass("btn-success btn-warning").addClass "btn-danger"
    $("#CHPP_Status_Description").html """
      #{error_message}<br/>
      #{description_message}
      """ 
    loginMenuShow()
    $("#CHPP_Refresh_Data").data "completeText", $("#CHPP_Refresh_Data").data("errorText")
    $("#CHPP_Refresh_Data_Status").removeAttr "disabled"
    return
  
  complete : (jqXHR, textStatus) ->
    $("#CHPP_Results").show()
    $("#CHPP_Refresh_Data").button 'complete'
}

sort_by = (field, reverse, primer) ->
  reverse = if reverse then -1 else 1
  (a, b) ->
    a = a[field];
    b = b[field];
    if primer?
      a = primer(a)
      b = primer(b)

      a = Infinity if isNaN(a)
      b = Infinity if isNaN(b)
    return reverse * -1 if a < b
    return reverse * 1 if a > b
    0

sortCHPPPlayerFields = ->
  PlayersData = Staminia.PlayersData
  return unless PlayersData?

  field = "PlayerNumber"
  reverse = false
  primer = parseInt

  switch $("#{FORM_ID} select[id=CHPP_Players_SortBy]").val()
    when "ShirtNumber"
      field = "PlayerNumber"
    when "Name"
      field = "PlayerName"
      primer = undefined
    when "Form"
      field = "PlayerForm"
      reverse = true
    when "Stamina"
      field = "StaminaSkill"
      reverse = true
    when "Keeper"
      field = "KeeperSkill"
      reverse = true
    when "Playmaking"
      field = "PlaymakerSkill"
      reverse = true
    when "Passing"
      field = "PassingSkill"
      reverse = true
    when "Winger"
      field = "WingerSkill"
      reverse = true
    when "Defending"
      field = "DefenderSkill"
      reverse = true
    when "Scoring"
      field = "ScorerSkill"
      reverse = true
    when "SetPieces"
      field = "SetPiecesSkill"
      reverse = true
    when "Experience"
      field = "Experience"
      reverse = true
    when "Loyalty"
      field = "Loyalty"
      reverse = true
      
  PlayersData.sort sort_by(field, reverse, primer)
  
  return

updateCHPPPlayerFields = ->
  PlayersData = Staminia.PlayersData
  return unless PlayersData?

  sortCHPPPlayerFields()
  
  $("#CHPP_Player_1").html ""
  $("#CHPP_Player_2").html ""

  select = $(document.createElement("select"))
  for player, index in PlayersData
    optionElement = $(document.createElement("option"))
    optionElement.addClass("isBruised") if ((Number) player.InjuryLevel) == 0
    optionElement.addClass("isInjured") if ((Number) player.InjuryLevel) > 0
    optionElement.addClass("isSuspended") if ((Number) player.Cards) >= 3
    optionElement.addClass("isTransferListed") if player.TransferListed
    optionElement.attr "value", index
    name = 
    optionElement.text "#{ number = if player.PlayerNumber? then player.PlayerNumber + '.' else '' } #{player.PlayerName} #{ mc = if player.MotherClubBonus then '\u2665' else '' }"
    select.append optionElement

  selectP1 = select.clone("true")
  selectP2 = select.clone("true")

  selectP1.attr("id","CHPP_Player_1")
  selectP2.attr("id","CHPP_Player_2")

  $("#CHPP_Player_1").html selectP1.html()
  $("#CHPP_Player_2").html selectP2.html()

  return

setupCHPPPlayerFields = (checkUrlParameter = false) ->
  updateCHPPPlayerFields()

  if ($("#CHPP_Player_1 option").length > 2 and $("#CHPP_Player_2 option").length > 2)
    $("#CHPP_Player_1 option:eq(0)").attr "selected", "selected"
    $("#CHPP_Player_2 option:eq(1)").attr "selected", "selected"
    setPlayerFormFields 1, checkUrlParameter
    setPlayerFormFields 2, checkUrlParameter
  return
          
$("#{FORM_ID} select[id=CHPP_Player_1]").on "change", ->
  setPlayerFormFields 1
  return

$("#{FORM_ID} select[id=CHPP_Player_2]").on "change", ->
  setPlayerFormFields 2
  return

$("#{FORM_ID} select[id=CHPP_Players_SortBy]").on "change", ->
  updateCHPPPlayerFields()

  if ($("#CHPP_Player_1 option").length > 2 and $("#CHPP_Player_2 option").length > 2)
    $("#CHPP_Player_1 option:eq(0)").attr "selected", "selected"
    $("#CHPP_Player_2 option:eq(1)").attr "selected", "selected"
    setPlayerFormFields 1
    setPlayerFormFields 2

  return

setPlayerFormFields = (player, checkUrlParameter = false) -> 
  return if checkUrlParameter && gup("params")?
  
  PlayersData = Staminia.PlayersData
  formReference = $(FORM_ID)[0]
  return unless PlayersData?
  PlayerData = PlayersData[formReference["CHPP_Player_" + player].value]
  return unless PlayerData?
  
  # Standard Mode
  formReference["Staminia_Simple_Player_#{player}_Experience"].value = PlayerData.Experience;
  formReference["Staminia_Simple_Player_#{player}_Stamina"].value = PlayerData.StaminaSkill;
  formReference["Staminia_Simple_Player_#{player}_Form"].value = PlayerData.PlayerForm;
  formReference["Staminia_Simple_Player_#{player}_MainSkill"].value = PlayerData.MainSkill;
  formReference["Staminia_Simple_Player_#{player}_Loyalty"].value = PlayerData.Loyalty;

  # Mother Club Bonus
  $("#Button_Player_#{player}_MotherClubBonus").click() if (PlayerData.MotherClubBonus and !$("#Button_Player_#{player}_MotherClubBonus_Status").hasClass("btn-success")) or (!PlayerData.MotherClubBonus and $("#Button_Player_#{player}_MotherClubBonus_Status").hasClass("btn-success"))

  # Advanced Mode
  formReference["Staminia_Advanced_Player_#{player}_Experience"].value       = number_format(PlayerData.Experience,     2);
  formReference["Staminia_Advanced_Player_#{player}_Stamina"].value          = number_format(PlayerData.StaminaSkill,   2);
  formReference["Staminia_Advanced_Player_#{player}_Form"].value             = number_format(PlayerData.PlayerForm,     2);
  formReference["Staminia_Advanced_Player_#{player}_Loyalty"].value          = number_format(PlayerData.Loyalty,        2);
  formReference["Staminia_Advanced_Player_#{player}_Skill_Keeper"].value     = number_format(PlayerData.KeeperSkill,    2);
  formReference["Staminia_Advanced_Player_#{player}_Skill_Defending"].value  = number_format(PlayerData.DefenderSkill,  2);
  formReference["Staminia_Advanced_Player_#{player}_Skill_Playmaking"].value = number_format(PlayerData.PlaymakerSkill, 2);
  formReference["Staminia_Advanced_Player_#{player}_Skill_Winger"].value     = number_format(PlayerData.WingerSkill,    2);
  formReference["Staminia_Advanced_Player_#{player}_Skill_Passing"].value    = number_format(PlayerData.PassingSkill,   2);
  formReference["Staminia_Advanced_Player_#{player}_Skill_Scoring"].value    = number_format(PlayerData.ScorerSkill,    2);

loginMenuHide = ->
  $("#loginDropdown").addClass "hide"
  $("#loggedInDropdown").removeClass "hide"

loginMenuShow = ->
  $("#menuLoginTitle").text "CHPP"
  $("#loggedInDropdown").addClass "hide"
  $("#loginDropdown").removeClass "hide"

$("#CHPP_Refresh_Data").on "click", ->
  $.ajax { url: "chpp/chpp_retrievedata.php?refresh", cache: false }
  
$("#CHPP_Revoke_Auth_Link").on "click", ->
  $(this).closest("[class~='open']").removeClass 'open'
  window.confirm Staminia.messages.revoke_auth_confirm

#export
Staminia.format = format
Staminia.number_format = number_format

Staminia.isChartsEnabled = isChartsEnabled
Staminia.isVerboseModeEnabled = isVerboseModeEnabled
Staminia.isPressingEnabled = isPressingEnabled
Staminia.isAdvancedModeEnabled = isAdvancedModeEnabled

