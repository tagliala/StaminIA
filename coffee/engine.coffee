"use strict"
window.Staminia = window.Staminia || {}
Staminia = window.Staminia
Staminia.Engine = Staminia.Engine || {}

VERSION = 5

KICKOFF = 1
HALFTIME = 45
SECONDHALF = 46
FULLTIME = 90
SUBTOTALMINUTES = 88

LOW_STAMINA = 0.51

CHECKPOINT = 5
CHECKPOINTS = [ 1, 6, 11, 16, 21, 26, 31, 36, 41, 46, 51, 56, 61, 66, 71, 76, 81, 86 ]
CHECKPOINTS_LENGTH = 18
CHECKPOINT_FIRSTHALF = 41
CHECKPOINT_SECONDHALF = 86

BAD_STAMINA_SE = [ 61, 71, 76, 86 ]

SKILL_VALIDATION = {
  form: {
    min: 1
    max: 8
  }
  stamina: {
    min: 1
    max: 9
  }
  exp: {
    min: 0
    max: 30
  }
  skill: {
    min: 0
    max: 22
  }
  loyalty: {
    min: 1
    max: 20
  }
}

PR_ENUM_ROLE =
  0 : "GK"
  1 : "CD"
  2 : "CD OFF"
  3 : "CD TW"
  4 : "WB"
  5 : "WB OFF"
  6 : "WB DEF"
  7 : "WB TM"
  8 : "IM"
  9 : "IM OFF"
  10 : "IM DEF"
  11 : "IM TW"
  12 : "WI"
  13 : "WI OFF"
  14 : "WI DEF"
  15 : "WI TM"
  16 : "FW"
  17 : "FW DEF"
  18 : "FW DEF+T"
  19 : "FW TW"

$ ->
  FORM_ID = Staminia.CONFIG.FORM_ID
  TABLE_ID = Staminia.CONFIG.TABLE_ID
  DEBUG = Staminia.CONFIG.DEBUG
  AUTOSTART = Staminia.CONFIG.AUTOSTART
  return

Staminia.estimateStaminaSubskills = (performanceAt90) ->
  if performanceAt90 <= 89
    Math.min 9, (Number) 0.10134 * performanceAt90 - 0.9899
  else
    8 + (performanceAt90 - 90) / 15

getContribution = (minute, stamina, startsAtMinute, pressing) ->
  minute = (Number) minute
  stamina = (Number) stamina
  startsAtMinute = (Number) startsAtMinute

  return 1 if stamina >= 9

  engineStamina = stamina

  initialEnergy = 1 + (0.0292 * engineStamina + 0.05)
  pressingDecay = if pressing then 0.00055 * (9 - engineStamina) else 0
  decay = Math.max 0.0325, (-0.0039 * engineStamina + 0.0633 + pressingDecay)
  rest = 0.1875
  extra_time_rest = rest / 3

  # Boost
  initialEnergy += 0.15 * (engineStamina - 8) if engineStamina > 8

  # Magic Numbers
  MINUTES_PER_CHECKPOINT = 5
  HALF_TIME_CHECKPOINT = 10

  initialCheckpoint = Math.max(0, Math.ceil(startsAtMinute / MINUTES_PER_CHECKPOINT))
  checkpoint = Math.max(0, Math.ceil((startsAtMinute + minute) / MINUTES_PER_CHECKPOINT))
  elapsedCheckpoints = checkpoint - initialCheckpoint + (if initialCheckpoint > 0 then 1 else 0)

  if (checkpoint < HALF_TIME_CHECKPOINT)
    energy = initialEnergy - (elapsedCheckpoints * decay)
  else
    if initialCheckpoint < HALF_TIME_CHECKPOINT
      secondHalfElapsedCheckpoints = (checkpoint - HALF_TIME_CHECKPOINT) + (if initialCheckpoint > 0 then 1 else 0)
    else
      secondHalfElapsedCheckpoints = elapsedCheckpoints
    secondHalfEnergy = Math.min(initialEnergy, initialEnergy - ((HALF_TIME_CHECKPOINT - initialCheckpoint) * decay) + rest)
    energy = secondHalfEnergy - (secondHalfElapsedCheckpoints * decay)

  if Staminia.CONFIG.DEBUG && false
    console.log "Initial Checkpoint: " + initialCheckpoint
    console.log "Current Checkpoint: " + checkpoint
    console.log "Elapsed Checkpoints: " + elapsedCheckpoints
    console.log "Initial Energy: " + initialEnergy
    console.log "Second Half Energy: " + secondHalfEnergy
    console.log "Second Half Elapsed Checkpoints: " + secondHalfElapsedCheckpoints
    console.log "Energy: " + energy
    console.log "Decay: " + decay

  Math.min energy, 1

getAvgAt90 = (stamina) ->
  return 1 if stamina >= 9
  totalEnergy = 0
  initialEnergy = 1 + (0.0292 * stamina + 0.05)
  initialEnergy += 0.15 * (stamina - 8) if stamina > 8
  decay = Math.max 0.0325, (-0.0039 * stamina + 0.0633)
  rest = 0.1875
  for checkpoint in [1..18]
    currentEnergy = initialEnergy - checkpoint * decay
    currentEnergy+= rest if checkpoint > 9
    currentEnergy = Math.min(1, currentEnergy)
    totalEnergy += currentEnergy
  totalEnergy / 18

calculateStrength = (skill, form, stamina, experience, include_stamina) ->
  skill = (Number) skill
  form = Math.max(0.5, (Number) form)
  stamina = (Number) stamina

  experience = Math.max(0.5, (Number) experience)

  c_form = Math.pow((form - 0.5) / 7, 0.45)
  c_stamina = Math.pow((stamina + 6.5) / 14, 0.6)
  c_experience = 1 + 0.0716 * Math.sqrt(experience - 0.5)

  result = skill * c_form * (if (include_stamina) then c_stamina else 1) * c_experience

  if Staminia.CONFIG.DEBUG
    tempHTML = """
      strength(skill = <b>#{skill}</b>, form = <b>#{form}</b>, stamina = <b>#{stamina}</b>, experience = <b>#{experience}</b>, include_stamina = <b>#{include_stamina}</b>)<br/>
      &nbsp;&nbsp;c_form(<b>#{form}</b>) = <b>#{c_form}</b><br/>
      &nbsp;&nbsp;c_stamina(<b>#{stamina}</b>) = <b>#{c_stamina}</b><br/>
      &nbsp;&nbsp;c_experience(<b>#{experience}</b>) = <b>#{c_experience}</b><br/>
      &nbsp;&nbsp;result_w_stamina = <b>#{skill * c_form * c_stamina * c_experience}</b><br/>
      &nbsp;&nbsp;result_wo_stamina = <b>#{skill * c_form * 1 * c_experience}</b><br/>
      &nbsp;&nbsp;result = <b>#{result}</b><br/><br/>
      """
    $("#tabDebug").append tempHTML
  result

validateSkill = (skill, type) ->
  return 0 unless SKILL_VALIDATION[type]?
  min = SKILL_VALIDATION[type].min
  max = SKILL_VALIDATION[type].max

  parsedSkill = (Number) skill.toString().replace(/,/g, ".")
  if isNaN(parsedSkill) or parsedSkill < min
    min
  else if parsedSkill > max
    max
  else
    parsedSkill

getPlayerBonus = (loyalty, motherClubBonus) ->
  loyalty = 20 if motherClubBonus
  playerBonus = 0
  playerBonus += 0.5  if motherClubBonus
  playerBonus += Math.max(0, loyalty - 1) / 19
  if Staminia.CONFIG.DEBUG
    tempHTML = "getPlayerBonus(loyalty = <b>#{loyalty}</b>, motherClubBonus = <b>#{motherClubBonus}</b>): <b>#{playerBonus}</b><br/><br/>"
    $("#tabDebug").append tempHTML
  playerBonus

getSimpleSkill = (player) ->
  formReference = $(Staminia.CONFIG.FORM_ID)[0]

  playerLoyalty = validateSkill formReference["Staminia_Simple_Player_" + player + "_Loyalty"].value, "loyalty"
  playerMotherClubBonus = formReference["Staminia_Player_" + player + "_MotherClubBonus"].checked
  playerBonus = getPlayerBonus(playerLoyalty, playerMotherClubBonus)

  playerSkill = validateSkill formReference["Staminia_Simple_Player_" + player + "_MainSkill"].value, "skill"
  playerSkill += playerBonus

  if Staminia.CONFIG.DEBUG
    tempHTML = "getSimpleSkill(player = <b>#{player}</b>): <b>#{playerSkill}</b><br/><br/>"
    $("#tabDebug").append tempHTML
  playerSkill

getAdvancedSkill = (player) ->
  formReference = $(Staminia.CONFIG.FORM_ID)[0]

  position = (Number) formReference.Staminia_Advanced_Position.value
  return 0 if position < 0

  playerLoyalty = validateSkill formReference["Staminia_Advanced_Player_" + player + "_Loyalty"].value, "loyalty"
  playerMotherClubBonus = formReference["Staminia_Player_" + player + "_MotherClubBonus"].value is "true"
  playerBonus = getPlayerBonus(playerLoyalty, playerMotherClubBonus)

  keeper = validateSkill(formReference["Staminia_Advanced_Player_" + player + "_Skill_Keeper"].value, "skill") + playerBonus
  defending = validateSkill(formReference["Staminia_Advanced_Player_" + player + "_Skill_Defending"].value, "skill") + playerBonus
  playmaking = validateSkill(formReference["Staminia_Advanced_Player_" + player + "_Skill_Playmaking"].value, "skill") + playerBonus
  winger = validateSkill(formReference["Staminia_Advanced_Player_" + player + "_Skill_Winger"].value, "skill") + playerBonus
  passing = validateSkill(formReference["Staminia_Advanced_Player_" + player + "_Skill_Passing"].value, "skill") + playerBonus
  scoring = validateSkill(formReference["Staminia_Advanced_Player_" + player + "_Skill_Scoring"].value, "skill") + playerBonus

  PR_ENUM_SKILL = Staminia.CONFIG.PR_ENUM_SKILL
  keeper_coeff = Staminia.predictions[position][PR_ENUM_SKILL.Keeper]
  defending_coeff = Staminia.predictions[position][PR_ENUM_SKILL.Defending]
  playmaking_coeff = Staminia.predictions[position][PR_ENUM_SKILL.Playmaking]
  winger_coeff = Staminia.predictions[position][PR_ENUM_SKILL.Winger]
  passing_coeff = Staminia.predictions[position][PR_ENUM_SKILL.Passing]
  scoring_coeff = Staminia.predictions[position][PR_ENUM_SKILL.Scoring]
  total = keeper_coeff * keeper + defending_coeff * defending + playmaking_coeff * playmaking + winger_coeff * winger + passing_coeff * passing + scoring_coeff * scoring
  if Staminia.CONFIG.DEBUG
    debug_coeff = keeper_coeff + defending_coeff + playmaking_coeff + winger_coeff + passing_coeff + scoring_coeff
    tempHTML = """
      getAdvancedSkill(player = <b>#{player}</b>)<br/>
      &nbsp;&nbsp;Position: <b>#{PR_ENUM_ROLE[position]}</b><br/>
      &nbsp;&nbsp;Keeper: <b>#{Staminia.number_format(keeper_coeff * 100, 2)}</b>% * <b>#{keeper}</b><br/>
      &nbsp;&nbsp;Defending: <b>#{Staminia.number_format(defending_coeff * 100, 2)}</b>% * <b>#{defending}</b><br/>
      &nbsp;&nbsp;Playmaking: <b>#{Staminia.number_format(playmaking_coeff * 100, 2)}</b>% * <b>#{playmaking}</b><br/>
      &nbsp;&nbsp;Winger: <b>#{Staminia.number_format(winger_coeff * 100, 2)}</b>% * <b>#{winger}</b><br/>
      &nbsp;&nbsp;Passing: <b>#{Staminia.number_format(passing_coeff * 100, 2)}</b>% * <b>#{passing}</b><br/>
      &nbsp;&nbsp;Scoring: <b>#{Staminia.number_format(scoring_coeff * 100, 2)}</b>% * <b>#{scoring}</b><br/>
      Expected (if all skills = 1.00): <b>#{debug_coeff}</b><br/>
      Calculated: <b>#{total}</b><br/>
      Match: <b>#{total is debug_coeff}</b><br/><br/>
      """
    $("#tabDebug").append tempHTML
  total

Staminia.Engine.start = ->
  @result =
    minutes: []
    substituteAt: []
    substituteAtSecondHalf: []
    mayNotReplace: false
    bestInFirstHalf: false

  formReference = $(Staminia.CONFIG.FORM_ID)[0]
  if Staminia.isAdvancedModeEnabled()
    player1Form = validateSkill formReference.Staminia_Advanced_Player_1_Form.value, "form"
    player2Form = validateSkill formReference.Staminia_Advanced_Player_2_Form.value, "form"
    player1Stamina = validateSkill formReference.Staminia_Advanced_Player_1_Stamina.value, "stamina"
    player2Stamina = validateSkill formReference.Staminia_Advanced_Player_2_Stamina.value, "stamina"
    player1Experience = validateSkill formReference.Staminia_Advanced_Player_1_Experience.value, "exp"
    player2Experience = validateSkill formReference.Staminia_Advanced_Player_2_Experience.value, "exp"
    player1Skill = getAdvancedSkill 1
    player2Skill = getAdvancedSkill 2
  else
    player1Form = validateSkill formReference.Staminia_Simple_Player_1_Form.value, "form"
    player2Form = validateSkill formReference.Staminia_Simple_Player_2_Form.value, "form"
    player1Stamina = validateSkill formReference.Staminia_Simple_Player_1_Stamina.value, "stamina"
    player2Stamina = validateSkill formReference.Staminia_Simple_Player_2_Stamina.value, "stamina"
    player1Experience = validateSkill formReference.Staminia_Simple_Player_1_Experience.value, "exp"
    player2Experience = validateSkill formReference.Staminia_Simple_Player_2_Experience.value, "exp"
    player1Skill = getSimpleSkill 1
    player2Skill = getSimpleSkill 2

  player1Strength = calculateStrength player1Skill, player1Form, player1Stamina, player1Experience, true
  player2Strength = calculateStrength player2Skill, player2Form, player2Stamina, player2Experience, true

  player1StrengthStaminaIndependent = calculateStrength player1Skill, player1Form, player1Stamina, player1Experience, false
  player2StrengthStaminaIndependent = calculateStrength player2Skill, player2Form, player2Stamina, player2Experience, false

  @result.player2_stronger_than_player1 = player2Strength > player1Strength
  @result.player1Strength = Staminia.number_format player1Strength, 2
  @result.player2Strength = Staminia.number_format player2Strength, 2

  @result.player1StrengthStaminaIndependent = Staminia.number_format player1StrengthStaminaIndependent, 2
  @result.player2StrengthStaminaIndependent = Staminia.number_format player2StrengthStaminaIndependent, 2

  player1TotalContribution = 0
  player2TotalContribution = 0
  player1LowStamina = -1
  player2LowStamina = -1

  pressing = Staminia.isPressingEnabled()
  player1AVGArray = []
  player2AVGArray = []

  for p1_minute in [KICKOFF..FULLTIME] when p1_minute isnt HALFTIME
    p1PlayedMinutes = p1_minute
    --p1PlayedMinutes if p1_minute > HALFTIME
    player1CurrentContribution = getContribution p1_minute, player1Stamina, 0, pressing
    player2TotalContribution = 0

    for p2_minute in [0...(FULLTIME-p1_minute)] when p2_minute isnt HALFTIME
      p2PlayedMinutes = SUBTOTALMINUTES - p1_minute + 1
      ++p2PlayedMinutes if p1_minute > HALFTIME
      player2CurrentContribution = getContribution p2_minute, player2Stamina, p1_minute, pressing
      player2TotalContribution += player2CurrentContribution
      player2LowStamina = FULLTIME - p2_minute if player2LowStamina < 0 and player2CurrentContribution < LOW_STAMINA
    player2AVGArray[p1_minute] = player2TotalContribution / p2PlayedMinutes
    player1TotalContribution += player1CurrentContribution
    player1AVGArray[p1_minute] = player1TotalContribution / p1PlayedMinutes
    player1LowStamina = p1_minute if player1LowStamina < 0 and player1CurrentContribution < LOW_STAMINA

  player1AVGArray[0] = 0
  player1AVGArray[45] = player1AVGArray[44]
  player1TotalContribution = 0
  player2TotalContribution = 0

  max = -Infinity
  min = +Infinity
  secondHalfMax = -Infinity
  secondHalfMin = +Infinity
  totalContributionArray = []

  for minute in [KICKOFF..FULLTIME] when minute isnt HALFTIME
    p1PlayedMinutes = minute - 1
    --p1PlayedMinutes if minute > HALFTIME
    p2PlayedMinutes = SUBTOTALMINUTES - minute + 1
    ++p2PlayedMinutes if minute > HALFTIME
    totalContributionArray[minute] = player1AVGArray[minute - 1] * player1StrengthStaminaIndependent * (p1PlayedMinutes / SUBTOTALMINUTES)
    totalContributionArray[minute] += player2AVGArray[minute] * player2StrengthStaminaIndependent * (p2PlayedMinutes / SUBTOTALMINUTES)
    totalContributionArray[minute] = (Number) Staminia.number_format totalContributionArray[minute], 2
    max = totalContributionArray[minute] if totalContributionArray[minute] > max
    min = totalContributionArray[minute] if totalContributionArray[minute] < min
    secondHalfMax = totalContributionArray[minute] if minute > HALFTIME and totalContributionArray[minute] > secondHalfMax
    secondHalfMin = totalContributionArray[minute] if minute > HALFTIME and totalContributionArray[minute] < secondHalfMin

  min = -1 if max is min
  secondHalfMin = -1 if secondHalfMax is secondHalfMin
  @result.max = Staminia.number_format(max, 2)
  @result.min = Staminia.number_format(min, 2)
  @result.secondHalfMax = Staminia.number_format(secondHalfMax, 2)
  @result.secondHalfMin = Staminia.number_format(secondHalfMin, 2)

  if Staminia.isVerboseModeEnabled()
    for minute in [KICKOFF..FULLTIME] when minute isnt HALFTIME
      p1PlayedMinutes = minute - 1
      --p1PlayedMinutes  if minute > HALFTIME
      p2PlayedMinutes = SUBTOTALMINUTES - minute + 1
      ++p2PlayedMinutes  if minute > HALFTIME
      @result.minutes[minute] =
        total: Staminia.number_format(totalContributionArray[minute], 2)
        percent: Staminia.number_format(totalContributionArray[minute] / max * 100, 2)
        p1: Staminia.number_format(player1AVGArray[minute - 1] * player1StrengthStaminaIndependent * (p1PlayedMinutes / SUBTOTALMINUTES), 2)
        p2: Staminia.number_format(player2AVGArray[minute] * player2StrengthStaminaIndependent * (p2PlayedMinutes / SUBTOTALMINUTES), 2)
        isMax: (totalContributionArray[minute] is max)
        isMin: (totalContributionArray[minute] is min)
  substituteAt = []

  p1LowStaminaRisk = false
  p2LowStaminaRisk = false
  for minute in [KICKOFF..FULLTIME] when minute isnt HALFTIME
    if totalContributionArray[minute] is max
      if minute is FULLTIME
        mayNotReplace = true
      else
        substituteAt.push minute
      p1LowStaminaRisk = true if player1LowStamina > 0 and minute >= player1LowStamina
      p2LowStaminaRisk = true if player2LowStamina > 0 and minute <= player2LowStamina

  substituteAtSecondHalf = []
  for minute in [(HALFTIME+1)..FULLTIME]
    if totalContributionArray[minute] is secondHalfMax
      if minute is FULLTIME
        mayNotReplace = true
      else
        substituteAtSecondHalf.push minute
      #p1LowStaminaRisk = true if player1LowStamina > 0 and minute >= player1LowStamina
      #p2LowStaminaRisk = true if player2LowStamina > 0 and minute <= player2LowStamina

  if Staminia.isChartsEnabled()
    plotDataTotal = []
    plotDataPartial = []
    plotDataTotal[0] = []
    plotDataPartial[0] = []
    plotDataPartial[1] = []
    plotIndex = 0
    for minute in [KICKOFF...FULLTIME] when minute isnt HALFTIME
      plotDataTotal[0][plotIndex] = [minute, totalContributionArray[minute]]
      plotDataPartial[0][plotIndex] = [minute, player1AVGArray[minute] * player1StrengthStaminaIndependent]
      plotDataPartial[1][plotIndex] = [minute, player2AVGArray[minute] * player2StrengthStaminaIndependent]
      ++plotIndex;
    @result.plotDataTotal = plotDataTotal
    @result.plotDataPartial = plotDataPartial

  @result.player1_low_stamina_se = player1LowStamina
  @result.player2_low_stamina_se = player2LowStamina
  @result.player1_low_stamina_se_risk = p1LowStaminaRisk
  @result.player2_low_stamina_se_risk = p2LowStaminaRisk
  @result.substituteAt = substituteAt
  @result.substituteAtSecondHalf = substituteAtSecondHalf
  @result.mayNotReplace = mayNotReplace
  @result.bestInFirstHalf = secondHalfMax isnt max

  if Staminia.CONFIG.DEBUG
    console.log @result
    printContributionTables()
    printContributionTables true
    $("#tabDebugNav").show()
    #$("#tabDebugNav").find("a").tab "show"
  @result.status = "OK"
  @result

# DEBUG FUNCTIONS
debugTableHeader = (header) ->
  """
  <table class="table table-striped table-bordered table-condensed table-staminia table-staminia-debug width-auto">
    <thead>
      <tr>
        <th colspan="10">
          #{header} (Minute/Stamina)
        </th>
      </tr>
      <tr>
        <th></th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th><th>8</th><th>9</th>
      </tr>
    </thead>
    <tbody>
  """

debugTableAddCell = (content, bad_stamina_minute) ->
  "<td #{if bad_stamina_minute then 'style="background: #e0cccc"'}>#{content}</td>"

printContributionTables = (pressing = false) ->
  tempHTML = debugTableHeader "Contribution Table#{if pressing then ' (Pressing)' else ''}"
  tempAVGHTML = debugTableHeader "AVG Contribution Table#{if pressing then ' (Pressing)' else ''}"

  totalContributionArray = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]
  totalContributionPressingArray = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]

  for minute in [KICKOFF..FULLTIME] by Staminia.CONFIG.DEBUG_STEP
    tempHTML += "<tr><td><b>#{minute}</b></td>"
    tempAVGHTML += "<tr><td><b>#{minute}</b></td>"
    for stamina_level in [1..9]
      currentContribution = getContribution(minute, stamina_level, 0, pressing);
      totalContributionArray[stamina_level] += getContribution(minute, stamina_level, 0, false);
      totalContributionPressingArray[stamina_level] += getContribution(minute, stamina_level, 0, true);
      tempHTML += debugTableAddCell Staminia.number_format(currentContribution, 2), (BAD_STAMINA_SE[stamina_level - 1] is minute) && stamina_level <= 4
      if pressing
        delta = 1 - (totalContributionArray[stamina_level] / minute) / (totalContributionPressingArray[stamina_level] / minute)
        tempAVGHTML += debugTableAddCell "#{Staminia.number_format(totalContributionPressingArray[stamina_level] / minute, 2)} (#{Staminia.number_format(delta * 100, 2)}%)", (BAD_STAMINA_SE[stamina_level - 1] is minute) && stamina_level <= 4
      else
        tempAVGHTML += debugTableAddCell Staminia.number_format(totalContributionArray[stamina_level] / minute, 2), (BAD_STAMINA_SE[stamina_level - 1] is minute) && stamina_level <= 4
    tempHTML += '</tr>'
    tempAVGHTML += '</tr>'

    # Halftime Separator
    if minute is HALFTIME
      tempHTML += '<tr class="separator"><td colspan="10"></td></tr>'
      tempAVGHTML += '<tr class="separator"><td colspan="10"></td></tr>'

  tempHTML += '</tbody></table>'
  tempAVGHTML += '</tbody></table>'
  $('#tabDebug').append tempHTML
  $('#tabDebug').append tempAVGHTML

###
      while i < 256
        tempHTML += "<span style=\"background: #" + (382 - i).toString(16) + i.toString(16) + "00;\">&nbsp;</span>"
        i += 5
      tempHTML += " MAX<br/><br/>"
      $("#tabDebug").append tempHTML
    i = KICKOFF

      while i <= FULLTIME
        if i is HALFTIME
          tempHTML += tableHeader
          continue
        p1PlayedMinutes = i - 1
        --p1PlayedMinutes  if i > HALFTIME
        p2PlayedMinutes = SUBTOTALMINUTES - i + 1
        ++p2PlayedMinutes  if i > HALFTIME
        red_tone = 127 + Math.floor((max - totalContributionArray[i]) / (max - min) * 128)
        red_tone = red_tone.toString(16)
        red_tone = "0" + "" + red_tone  if red_tone.length is 1
        green_tone = 127 + Math.floor((totalContributionArray[i] - min) / (max - min) * 128)
        green_tone = green_tone.toString(16)
        green_tone = "0" + "" + green_tone  if green_tone.length is 1
        isMax = (totalContributionArray[i] is max)
        isMin = (totalContributionArray[i] is min)
        contributionPercent = totalContributionArray[i] / max * 100
        tempHTML += "<tr class=\"" + (if isMax then " max" else "") + (if isMin then " min" else "") + "\">"
        tempHTML += "<th>" + i + "</th>"
        tempHTML += "<td style=\"background: #" + red_tone + green_tone + "00; font-weight: bold;\">" + number_format(totalContributionArray[i]) + "</td>"
        tempHTML += "<td>" + number_format(contributionPercent) + "%</td>"
        tempHTML += "<td>" + number_format(player1AVGArray[i - 1] * player1StrengthStaminaIndependent * (p1PlayedMinutes / SUBTOTALMINUTES)) + "</td>"
        tempHTML += "<td>" + number_format(player2AVGArray[i] * player2StrengthStaminaIndependent * (p2PlayedMinutes / SUBTOTALMINUTES)) + "</td>"
        tempHTML += "<td>" + (if isMax then "MAX" else (if isMin then "MIN" else (if 100 - contributionPercent < 1 then "~ 1%" else ""))) + (if i is player1LowStamina then " " + STRINGS["P1_BAD_STAMINA"] else "") + (if i is player2LowStamina then " " + STRINGS["P2_BAD_STAMINA"] else "") + "</td></tr>"
        ++i
###
