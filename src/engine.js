"use strict";

window.Staminia = window.Staminia || {};
const Staminia = window.Staminia;
Staminia.Engine = Staminia.Engine || {};

const VERSION = 5;

const KICKOFF = 1;
const HALFTIME = 45;
const SECONDHALF = 46;
const FULLTIME = 90;
const SUBTOTALMINUTES = 88;

const LOW_STAMINA = 0.51;

const CHECKPOINT = 5;
const CHECKPOINTS = [1, 6, 11, 16, 21, 26, 31, 36, 41, 46, 51, 56, 61, 66, 71, 76, 81, 86];
const CHECKPOINTS_LENGTH = 18;
const CHECKPOINT_FIRSTHALF = 41;
const CHECKPOINT_SECONDHALF = 86;

const BAD_STAMINA_SE = [61, 71, 76, 86];

const SKILL_VALIDATION = {
  form: { min: 1, max: 8 },
  stamina: { min: 1, max: 9 },
  exp: { min: 0, max: 30 },
  skill: { min: 0, max: 22 },
  loyalty: { min: 1, max: 20 }
};

const PR_ENUM_ROLE = {
  0: "GK",
  1: "CD",
  2: "CD OFF",
  3: "CD TW",
  4: "WB",
  5: "WB OFF",
  6: "WB DEF",
  7: "WB TM",
  8: "IM",
  9: "IM OFF",
  10: "IM DEF",
  11: "IM TW",
  12: "WI",
  13: "WI OFF",
  14: "WI DEF",
  15: "WI TM",
  16: "FW",
  17: "FW DEF",
  18: "FW DEF+T",
  19: "FW TW"
};

Staminia.estimateStaminaSubskills = (performanceAt90) => {
  if (performanceAt90 <= 89) {
    return Math.min(9, Number(0.10134 * performanceAt90 - 0.9899));
  }
  return 8 + (performanceAt90 - 90) / 15;
};

const getContribution = (minute, stamina, startsAtMinute, pressing) => {
  minute = Number(minute);
  stamina = Number(stamina);
  startsAtMinute = Number(startsAtMinute);

  if (stamina >= 9) return 1;

  const engineStamina = stamina;
  let initialEnergy = 1 + (0.0292 * engineStamina + 0.05);
  const pressingDecay = pressing ? 0.00055 * (9 - engineStamina) : 0;
  const decay = Math.max(0.0325, -0.0039 * engineStamina + 0.0633 + pressingDecay);
  const rest = 0.1875;

  // Boost
  if (engineStamina > 8) {
    initialEnergy += 0.15 * (engineStamina - 8);
  }

  // Magic Numbers
  const MINUTES_PER_CHECKPOINT = 5;
  const HALF_TIME_CHECKPOINT = 10;

  const initialCheckpoint = Math.max(0, Math.ceil(startsAtMinute / MINUTES_PER_CHECKPOINT));
  const checkpoint = Math.max(0, Math.ceil((startsAtMinute + minute) / MINUTES_PER_CHECKPOINT));
  const elapsedCheckpoints = checkpoint - initialCheckpoint + (initialCheckpoint > 0 ? 1 : 0);

  let energy;
  let secondHalfElapsedCheckpoints;
  let secondHalfEnergy;

  if (checkpoint < HALF_TIME_CHECKPOINT) {
    energy = initialEnergy - (elapsedCheckpoints * decay);
  } else {
    if (initialCheckpoint < HALF_TIME_CHECKPOINT) {
      secondHalfElapsedCheckpoints = (checkpoint - HALF_TIME_CHECKPOINT) + (initialCheckpoint > 0 ? 1 : 0);
    } else {
      secondHalfElapsedCheckpoints = elapsedCheckpoints;
    }
    secondHalfEnergy = Math.min(initialEnergy, initialEnergy - ((HALF_TIME_CHECKPOINT - initialCheckpoint) * decay) + rest);
    energy = secondHalfEnergy - (secondHalfElapsedCheckpoints * decay);
  }

  if (Staminia.CONFIG.DEBUG && false) {
    console.log("Initial Checkpoint: " + initialCheckpoint);
    console.log("Current Checkpoint: " + checkpoint);
    console.log("Elapsed Checkpoints: " + elapsedCheckpoints);
    console.log("Initial Energy: " + initialEnergy);
    console.log("Second Half Energy: " + secondHalfEnergy);
    console.log("Second Half Elapsed Checkpoints: " + secondHalfElapsedCheckpoints);
    console.log("Energy: " + energy);
    console.log("Decay: " + decay);
  }

  return Math.min(energy, 1);
};

const getAvgAt90 = (stamina) => {
  if (stamina >= 9) return 1;

  let totalEnergy = 0;
  let initialEnergy = 1 + (0.0292 * stamina + 0.05);
  if (stamina > 8) {
    initialEnergy += 0.15 * (stamina - 8);
  }
  const decay = Math.max(0.0325, -0.0039 * stamina + 0.0633);
  const rest = 0.1875;

  for (let checkpoint = 1; checkpoint <= 18; checkpoint++) {
    let currentEnergy = initialEnergy - checkpoint * decay;
    if (checkpoint > 9) {
      currentEnergy += rest;
    }
    currentEnergy = Math.min(1, currentEnergy);
    totalEnergy += currentEnergy;
  }
  return totalEnergy / 18;
};

const calculateStrength = (skill, form, stamina, experience, include_stamina) => {
  skill = Number(skill);
  form = Math.max(0.5, Number(form));
  stamina = Number(stamina);
  experience = Math.max(0.5, Number(experience));

  const c_form = Math.pow((form - 0.5) / 7, 0.45);
  const c_stamina = Math.pow((stamina + 6.5) / 14, 0.6);
  const c_experience = 1 + 0.0716 * Math.sqrt(experience - 0.5);

  const result = skill * c_form * (include_stamina ? c_stamina : 1) * c_experience;

  if (Staminia.CONFIG.DEBUG) {
    const tempHTML =
      `strength(skill = <b>${skill}</b>, form = <b>${form}</b>, stamina = <b>${stamina}</b>, experience = <b>${experience}</b>, include_stamina = <b>${include_stamina}</b>)<br/>` +
      `&nbsp;&nbsp;c_form(<b>${form}</b>) = <b>${c_form}</b><br/>` +
      `&nbsp;&nbsp;c_stamina(<b>${stamina}</b>) = <b>${c_stamina}</b><br/>` +
      `&nbsp;&nbsp;c_experience(<b>${experience}</b>) = <b>${c_experience}</b><br/>` +
      `&nbsp;&nbsp;result_w_stamina = <b>${skill * c_form * c_stamina * c_experience}</b><br/>` +
      `&nbsp;&nbsp;result_wo_stamina = <b>${skill * c_form * 1 * c_experience}</b><br/>` +
      `&nbsp;&nbsp;result = <b>${result}</b><br/><br/>`;
    $("#tabDebug").append(tempHTML);
  }

  return result;
};

const validateSkill = (skill, type) => {
  if (SKILL_VALIDATION[type] == null) return 0;

  const min = SKILL_VALIDATION[type].min;
  const max = SKILL_VALIDATION[type].max;
  const parsedSkill = Number(skill.toString().replace(/,/g, "."));

  if (isNaN(parsedSkill) || parsedSkill < min) {
    return min;
  } else if (parsedSkill > max) {
    return max;
  }
  return parsedSkill;
};

const getPlayerBonus = (loyalty, motherClubBonus) => {
  if (motherClubBonus) loyalty = 20;
  let playerBonus = 0;
  if (motherClubBonus) playerBonus += 0.5;
  playerBonus += Math.max(0, loyalty - 1) / 19;

  if (Staminia.CONFIG.DEBUG) {
    const tempHTML = `getPlayerBonus(loyalty = <b>${loyalty}</b>, motherClubBonus = <b>${motherClubBonus}</b>): <b>${playerBonus}</b><br/><br/>`;
    $("#tabDebug").append(tempHTML);
  }
  return playerBonus;
};

const getSimpleSkill = (player) => {
  const formReference = $(Staminia.CONFIG.FORM_ID)[0];

  const playerLoyalty = validateSkill(formReference["Staminia_Simple_Player_" + player + "_Loyalty"].value, "loyalty");
  const playerMotherClubBonus = formReference["Staminia_Player_" + player + "_MotherClubBonus"].checked;
  const playerBonus = getPlayerBonus(playerLoyalty, playerMotherClubBonus);

  let playerSkill = validateSkill(formReference["Staminia_Simple_Player_" + player + "_MainSkill"].value, "skill");
  playerSkill += playerBonus;

  if (Staminia.CONFIG.DEBUG) {
    const tempHTML = `getSimpleSkill(player = <b>${player}</b>): <b>${playerSkill}</b><br/><br/>`;
    $("#tabDebug").append(tempHTML);
  }
  return playerSkill;
};

const getAdvancedSkill = (player) => {
  const formReference = $(Staminia.CONFIG.FORM_ID)[0];
  const position = Number(formReference.Staminia_Advanced_Position.value);
  if (position < 0) return 0;

  const playerLoyalty = validateSkill(formReference["Staminia_Advanced_Player_" + player + "_Loyalty"].value, "loyalty");
  const playerMotherClubBonus = formReference["Staminia_Player_" + player + "_MotherClubBonus"].checked;
  const playerBonus = getPlayerBonus(playerLoyalty, playerMotherClubBonus);

  const keeper = validateSkill(formReference["Staminia_Advanced_Player_" + player + "_Skill_Keeper"].value, "skill") + playerBonus;
  const defending = validateSkill(formReference["Staminia_Advanced_Player_" + player + "_Skill_Defending"].value, "skill") + playerBonus;
  const playmaking = validateSkill(formReference["Staminia_Advanced_Player_" + player + "_Skill_Playmaking"].value, "skill") + playerBonus;
  const winger = validateSkill(formReference["Staminia_Advanced_Player_" + player + "_Skill_Winger"].value, "skill") + playerBonus;
  const passing = validateSkill(formReference["Staminia_Advanced_Player_" + player + "_Skill_Passing"].value, "skill") + playerBonus;
  const scoring = validateSkill(formReference["Staminia_Advanced_Player_" + player + "_Skill_Scoring"].value, "skill") + playerBonus;

  const PR_ENUM_SKILL = Staminia.CONFIG.PR_ENUM_SKILL;
  const keeper_coeff = Staminia.predictions[position][PR_ENUM_SKILL.Keeper];
  const defending_coeff = Staminia.predictions[position][PR_ENUM_SKILL.Defending];
  const playmaking_coeff = Staminia.predictions[position][PR_ENUM_SKILL.Playmaking];
  const winger_coeff = Staminia.predictions[position][PR_ENUM_SKILL.Winger];
  const passing_coeff = Staminia.predictions[position][PR_ENUM_SKILL.Passing];
  const scoring_coeff = Staminia.predictions[position][PR_ENUM_SKILL.Scoring];

  const total = keeper_coeff * keeper + defending_coeff * defending + playmaking_coeff * playmaking + winger_coeff * winger + passing_coeff * passing + scoring_coeff * scoring;

  if (Staminia.CONFIG.DEBUG) {
    const debug_coeff = keeper_coeff + defending_coeff + playmaking_coeff + winger_coeff + passing_coeff + scoring_coeff;
    const tempHTML =
      `getAdvancedSkill(player = <b>${player}</b>)<br/>` +
      `&nbsp;&nbsp;Position: <b>${PR_ENUM_ROLE[position]}</b><br/>` +
      `&nbsp;&nbsp;Keeper: <b>${Staminia.number_format(keeper_coeff * 100, 2)}</b>% * <b>${keeper}</b><br/>` +
      `&nbsp;&nbsp;Defending: <b>${Staminia.number_format(defending_coeff * 100, 2)}</b>% * <b>${defending}</b><br/>` +
      `&nbsp;&nbsp;Playmaking: <b>${Staminia.number_format(playmaking_coeff * 100, 2)}</b>% * <b>${playmaking}</b><br/>` +
      `&nbsp;&nbsp;Winger: <b>${Staminia.number_format(winger_coeff * 100, 2)}</b>% * <b>${winger}</b><br/>` +
      `&nbsp;&nbsp;Passing: <b>${Staminia.number_format(passing_coeff * 100, 2)}</b>% * <b>${passing}</b><br/>` +
      `&nbsp;&nbsp;Scoring: <b>${Staminia.number_format(scoring_coeff * 100, 2)}</b>% * <b>${scoring}</b><br/>` +
      `Expected (if all skills = 1.00): <b>${debug_coeff}</b><br/>` +
      `Calculated: <b>${total}</b><br/>` +
      `Match: <b>${total === debug_coeff}</b><br/><br/>`;
    $("#tabDebug").append(tempHTML);
  }

  return total;
};

Staminia.Engine.start = function() {
  this.result = {
    minutes: [],
    substituteAt: [],
    substituteAtSecondHalf: [],
    mayNotReplace: false,
    bestInFirstHalf: false
  };

  const formReference = $(Staminia.CONFIG.FORM_ID)[0];
  let player1Form, player2Form, player1Stamina, player2Stamina;
  let player1Experience, player2Experience, player1Skill, player2Skill;

  if (Staminia.isAdvancedModeEnabled()) {
    player1Form = validateSkill(formReference.Staminia_Advanced_Player_1_Form.value, "form");
    player2Form = validateSkill(formReference.Staminia_Advanced_Player_2_Form.value, "form");
    player1Stamina = validateSkill(formReference.Staminia_Advanced_Player_1_Stamina.value, "stamina");
    player2Stamina = validateSkill(formReference.Staminia_Advanced_Player_2_Stamina.value, "stamina");
    player1Experience = validateSkill(formReference.Staminia_Advanced_Player_1_Experience.value, "exp");
    player2Experience = validateSkill(formReference.Staminia_Advanced_Player_2_Experience.value, "exp");
    player1Skill = getAdvancedSkill(1);
    player2Skill = getAdvancedSkill(2);
  } else {
    player1Form = validateSkill(formReference.Staminia_Simple_Player_1_Form.value, "form");
    player2Form = validateSkill(formReference.Staminia_Simple_Player_2_Form.value, "form");
    player1Stamina = validateSkill(formReference.Staminia_Simple_Player_1_Stamina.value, "stamina");
    player2Stamina = validateSkill(formReference.Staminia_Simple_Player_2_Stamina.value, "stamina");
    player1Experience = validateSkill(formReference.Staminia_Simple_Player_1_Experience.value, "exp");
    player2Experience = validateSkill(formReference.Staminia_Simple_Player_2_Experience.value, "exp");
    player1Skill = getSimpleSkill(1);
    player2Skill = getSimpleSkill(2);
  }

  const player1Strength = calculateStrength(player1Skill, player1Form, player1Stamina, player1Experience, true);
  const player2Strength = calculateStrength(player2Skill, player2Form, player2Stamina, player2Experience, true);

  const player1StrengthStaminaIndependent = calculateStrength(player1Skill, player1Form, player1Stamina, player1Experience, false);
  const player2StrengthStaminaIndependent = calculateStrength(player2Skill, player2Form, player2Stamina, player2Experience, false);

  this.result.player2_stronger_than_player1 = player2Strength > player1Strength;
  this.result.player1Strength = Staminia.number_format(player1Strength, 2);
  this.result.player2Strength = Staminia.number_format(player2Strength, 2);

  this.result.player1StrengthStaminaIndependent = Staminia.number_format(player1StrengthStaminaIndependent, 2);
  this.result.player2StrengthStaminaIndependent = Staminia.number_format(player2StrengthStaminaIndependent, 2);

  let player1TotalContribution = 0;
  let player2TotalContribution = 0;
  let player1LowStamina = -1;
  let player2LowStamina = -1;

  const pressing = Staminia.isPressingEnabled();
  const player1AVGArray = [];
  const player2AVGArray = [];
  let p1PlayedMinutes, p2PlayedMinutes;

  for (let p1_minute = KICKOFF; p1_minute <= FULLTIME; p1_minute++) {
    if (p1_minute === HALFTIME) continue;

    p1PlayedMinutes = p1_minute;
    if (p1_minute > HALFTIME) --p1PlayedMinutes;

    const player1CurrentContribution = getContribution(p1_minute, player1Stamina, 0, pressing);
    player2TotalContribution = 0;

    for (let p2_minute = 0; p2_minute < FULLTIME - p1_minute; p2_minute++) {
      if (p2_minute === HALFTIME) continue;

      p2PlayedMinutes = SUBTOTALMINUTES - p1_minute + 1;
      if (p1_minute > HALFTIME) ++p2PlayedMinutes;

      const player2CurrentContribution = getContribution(p2_minute, player2Stamina, p1_minute, pressing);
      player2TotalContribution += player2CurrentContribution;
      if (player2LowStamina < 0 && player2CurrentContribution < LOW_STAMINA) {
        player2LowStamina = FULLTIME - p2_minute;
      }
    }

    player2AVGArray[p1_minute] = player2TotalContribution / p2PlayedMinutes;
    player1TotalContribution += player1CurrentContribution;
    player1AVGArray[p1_minute] = player1TotalContribution / p1PlayedMinutes;
    if (player1LowStamina < 0 && player1CurrentContribution < LOW_STAMINA) {
      player1LowStamina = p1_minute;
    }
  }

  player1AVGArray[0] = 0;
  player1AVGArray[45] = player1AVGArray[44];
  player1TotalContribution = 0;
  player2TotalContribution = 0;

  let max = -Infinity;
  let min = +Infinity;
  let secondHalfMax = -Infinity;
  let secondHalfMin = +Infinity;
  const totalContributionArray = [];

  for (let minute = KICKOFF; minute <= FULLTIME; minute++) {
    if (minute === HALFTIME) continue;

    p1PlayedMinutes = minute - 1;
    if (minute > HALFTIME) --p1PlayedMinutes;
    p2PlayedMinutes = SUBTOTALMINUTES - minute + 1;
    if (minute > HALFTIME) ++p2PlayedMinutes;

    totalContributionArray[minute] = player1AVGArray[minute - 1] * player1StrengthStaminaIndependent * (p1PlayedMinutes / SUBTOTALMINUTES);
    totalContributionArray[minute] += player2AVGArray[minute] * player2StrengthStaminaIndependent * (p2PlayedMinutes / SUBTOTALMINUTES);
    totalContributionArray[minute] = Number(Staminia.number_format(totalContributionArray[minute], 2));

    if (totalContributionArray[minute] > max) max = totalContributionArray[minute];
    if (totalContributionArray[minute] < min) min = totalContributionArray[minute];
    if (minute > HALFTIME && totalContributionArray[minute] > secondHalfMax) secondHalfMax = totalContributionArray[minute];
    if (minute > HALFTIME && totalContributionArray[minute] < secondHalfMin) secondHalfMin = totalContributionArray[minute];
  }

  if (max === min) min = -1;
  if (secondHalfMax === secondHalfMin) secondHalfMin = -1;

  this.result.max = Staminia.number_format(max, 2);
  this.result.min = Staminia.number_format(min, 2);
  this.result.secondHalfMax = Staminia.number_format(secondHalfMax, 2);
  this.result.secondHalfMin = Staminia.number_format(secondHalfMin, 2);

  if (Staminia.isVerboseModeEnabled()) {
    for (let minute = KICKOFF; minute <= FULLTIME; minute++) {
      if (minute === HALFTIME) continue;

      p1PlayedMinutes = minute - 1;
      if (minute > HALFTIME) --p1PlayedMinutes;
      p2PlayedMinutes = SUBTOTALMINUTES - minute + 1;
      if (minute > HALFTIME) ++p2PlayedMinutes;

      this.result.minutes[minute] = {
        total: Staminia.number_format(totalContributionArray[minute], 2),
        percent: Staminia.number_format(totalContributionArray[minute] / max * 100, 2),
        p1: Staminia.number_format(player1AVGArray[minute - 1] * player1StrengthStaminaIndependent * (p1PlayedMinutes / SUBTOTALMINUTES), 2),
        p2: Staminia.number_format(player2AVGArray[minute] * player2StrengthStaminaIndependent * (p2PlayedMinutes / SUBTOTALMINUTES), 2),
        isMax: totalContributionArray[minute] === max,
        isMin: totalContributionArray[minute] === min
      };
    }
  }

  const substituteAt = [];
  let p1LowStaminaRisk = false;
  let p2LowStaminaRisk = false;
  let mayNotReplace;

  for (let minute = KICKOFF; minute <= FULLTIME; minute++) {
    if (minute === HALFTIME) continue;
    if (totalContributionArray[minute] === max) {
      if (minute === FULLTIME) {
        mayNotReplace = true;
      } else {
        substituteAt.push(minute);
      }
      if (player1LowStamina > 0 && minute >= player1LowStamina) p1LowStaminaRisk = true;
      if (player2LowStamina > 0 && minute <= player2LowStamina) p2LowStaminaRisk = true;
    }
  }

  const substituteAtSecondHalf = [];
  for (let minute = HALFTIME + 1; minute <= FULLTIME; minute++) {
    if (totalContributionArray[minute] === secondHalfMax) {
      if (minute === FULLTIME) {
        mayNotReplace = true;
      } else {
        substituteAtSecondHalf.push(minute);
      }
    }
  }

  if (Staminia.isChartsEnabled()) {
    const plotDataTotal = [[]];
    const plotDataPartial = [[], []];
    let plotIndex = 0;

    for (let minute = KICKOFF; minute < FULLTIME; minute++) {
      if (minute === HALFTIME) continue;

      plotDataTotal[0][plotIndex] = [minute, totalContributionArray[minute]];
      plotDataPartial[0][plotIndex] = [minute, player1AVGArray[minute] * player1StrengthStaminaIndependent];
      plotDataPartial[1][plotIndex] = [minute, player2AVGArray[minute] * player2StrengthStaminaIndependent];
      ++plotIndex;
    }

    this.result.plotDataTotal = plotDataTotal;
    this.result.plotDataPartial = plotDataPartial;
  }

  this.result.player1_low_stamina_se = player1LowStamina;
  this.result.player2_low_stamina_se = player2LowStamina;
  this.result.player1_low_stamina_se_risk = p1LowStaminaRisk;
  this.result.player2_low_stamina_se_risk = p2LowStaminaRisk;
  this.result.substituteAt = substituteAt;
  this.result.substituteAtSecondHalf = substituteAtSecondHalf;
  this.result.mayNotReplace = mayNotReplace;
  this.result.bestInFirstHalf = secondHalfMax !== max;

  if (Staminia.CONFIG.DEBUG) {
    console.log(this.result);
    printContributionTables();
    printContributionTables(true);
    $("#tabDebugNav").show();
  }

  this.result.status = "OK";
  return this.result;
};

// DEBUG FUNCTIONS
const debugTableHeader = (header) =>
  `<table class="table table-striped table-bordered table-condensed table-staminia table-staminia-debug width-auto">
  <thead>
    <tr>
      <th colspan="10">
        ${header} (Minute/Stamina)
      </th>
    </tr>
    <tr>
      <th></th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th><th>8</th><th>9</th>
    </tr>
  </thead>
  <tbody>`;

const debugTableAddCell = (content, bad_stamina_minute) =>
  `<td ${bad_stamina_minute ? 'style="background: #e0cccc"' : ""}>${content}</td>`;

const printContributionTables = (pressing = false) => {
  let tempHTML = debugTableHeader(`Contribution Table${pressing ? " (Pressing)" : ""}`);
  let tempAVGHTML = debugTableHeader(`AVG Contribution Table${pressing ? " (Pressing)" : ""}`);

  const totalContributionArray = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  const totalContributionPressingArray = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  for (let minute = KICKOFF; minute <= FULLTIME; minute += Staminia.CONFIG.DEBUG_STEP) {
    tempHTML += `<tr><td><b>${minute}</b></td>`;
    tempAVGHTML += `<tr><td><b>${minute}</b></td>`;

    for (let stamina_level = 1; stamina_level <= 9; stamina_level++) {
      const currentContribution = getContribution(minute, stamina_level, 0, pressing);
      totalContributionArray[stamina_level] += getContribution(minute, stamina_level, 0, false);
      totalContributionPressingArray[stamina_level] += getContribution(minute, stamina_level, 0, true);

      tempHTML += debugTableAddCell(
        Staminia.number_format(currentContribution, 2),
        BAD_STAMINA_SE[stamina_level - 1] === minute && stamina_level <= 4
      );

      if (pressing) {
        const delta = 1 - (totalContributionArray[stamina_level] / minute) / (totalContributionPressingArray[stamina_level] / minute);
        tempAVGHTML += debugTableAddCell(
          `${Staminia.number_format(totalContributionPressingArray[stamina_level] / minute, 2)} (${Staminia.number_format(delta * 100, 2)}%)`,
          BAD_STAMINA_SE[stamina_level - 1] === minute && stamina_level <= 4
        );
      } else {
        tempAVGHTML += debugTableAddCell(
          Staminia.number_format(totalContributionArray[stamina_level] / minute, 2),
          BAD_STAMINA_SE[stamina_level - 1] === minute && stamina_level <= 4
        );
      }
    }

    tempHTML += "</tr>";
    tempAVGHTML += "</tr>";

    // Halftime Separator
    if (minute === HALFTIME) {
      tempHTML += '<tr class="separator"><td colspan="10"></td></tr>';
      tempAVGHTML += '<tr class="separator"><td colspan="10"></td></tr>';
    }
  }

  tempHTML += "</tbody></table>";
  tempAVGHTML += "</tbody></table>";
  $("#tabDebug").append(tempHTML);
  $("#tabDebug").append(tempAVGHTML);
};
