<?php
include 'config.php';
include 'lib/PHT/PHT.php';
session_start();
$HT = $_SESSION['HT'];
$permanent = $_COOKIE['permanent'];
/*
When user is redirected to your callback url
you will received two parameters in url
oauth_token and oauth_verifier
use both in next function:
*/
if ($HT != null) try
{
}
catch(HTError $e)
{
  echo $e->getMessage();
}
$tryAjax = (($HT != null) || $permanent);
?>
<?php
include 'localization.php';
?>
<?

function optionSkills($start = 0, $stop = 20, $select = 6) {
  global $localizedSkills;

  if ($start < 0) $start = 0;
  if ($stop > 20) $stop = 20;
  if (($select < 0) || ($select > 20)) $select = -1;

  if ($stop < $start) { $start = 0; $stop = 20; }
  if ($select > $stop) { $select = -1; }

  for ($i = $start; $i <= $stop; ++$i) {
    echo "<option value=\"$i\"" . (($select == $i)?" selected=\"selected\"":"") . ">$localizedSkills[$i]</option>\n";
  }
}
?>
<?php $staminia_version = "12.09.29" ?>
<!DOCTYPE html>
<html lang="<?php echo localize("lang"); ?>">
  <head>
    <meta http-equiv="content-type" content="text/html; charset=UTF-8">
    <meta charset="utf-8">
    <title>Stamin.IA! <?php echo localize("SUBTITLE"); ?></title>

    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Stamin.IA! <?php echo localize("SUBTITLE"); ?>"/>
    <meta name="author" content="Lizardopoli"/>

    <meta name="description" content="Stamin.IA! <?php echo localize("SUBTITLE"); ?>"/>
    <meta name="keywords" content="Stamin.IA!, CHPP, stamina tool, hattrick, substitutions tool, substitutions"/>

    <?php if (FB_ADMINS != "") { ?>
      <meta property="fb:admins" content="<?= FB_ADMINS ?>"/>
      <meta property="og:title" content="Stamin.IA!"/>
      <meta property="og:description" content="<?php echo localize("SUBTITLE"); ?>"/>
      <meta property="og:type" content="game"/>
      <meta property="og:image" content="<?= APP_ROOT ?>img/big_logo.png"/>
      <meta property="og:url" content="<?= APP_ROOT ?>"/>
      <meta property="og:site_name" content="Lizardopoli"/>
    <?php } ?>

    <!-- Le HTML5 shim, for IE6-8 support of HTML elements -->
    <!--[if lt IE 9]>
      <script src="http://html5shim.googlecode.com/svn/trunk/html5.js"></script>
    <![endif]-->

    <!-- Le styles -->
    <link href="css/main.css" rel="stylesheet">
    <link href="http://fonts.googleapis.com/css?family=Telex" rel="stylesheet" type="text/css">
    <link href="http://fonts.googleapis.com/css?family=Lobster" rel="stylesheet" type="text/css">

    <!-- Le fav and touch icons -->
    <link rel="shortcut icon" href="img/staminia_favicon.png">
    <link rel="apple-touch-icon" href="img/ico/apple-touch-icon.png">
    <link rel="apple-touch-icon" sizes="72x72" href="img/ico/apple-touch-icon-72x72.png">
    <link rel="apple-touch-icon" sizes="114x114" href="img/ico/apple-touch-icon-114x114.png">
  </head>
<?php flush(); ?>
  <body>
  <div id="fb-root"></div>

  <!-- Navbar
    ================================================== -->
    <div class="navbar navbar-fixed-top">
      <div class="navbar-inner">
        <div class="container">
          <a class="btn btn-navbar" data-toggle="collapse" data-target=".nav-collapse">
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
          </a>
          <div class="brand"><i id="staminia-logo"></i><span id="staminia-brand" class="hidden-phone">Stamin.IA!</span></div>
          <ul class="nav pull-right">
            <?php if (CHPP_APP_ID != "") { ?>
              <li class="dropdown" id="dropdownLogin">
                <a class="dropdown-toggle" data-toggle="dropdown" href="#dropdownLogin">
                  <span id="menuLoginTitle"><?= localize("CHPP"); ?></span>
                  <b class="caret"></b>
                </a>
                <ul class="dropdown-menu" id="loginDropdown">
                  <li>
                    <form id="LoginForm" action="chpp/chpp_auth.php" method="get">
                      <p><?= localize("Authorize Stamin.IA! to access your data"); ?></p>
                      <fieldset>
                        <label class="rememberme"><input type="checkbox" name="permanent" <?php if ($permanent) echo "checked=\"checked\"" ?>/> <span><?php echo localize("Remember me"); ?></span></label>
                        <button type="submit" class="btn" id="CHPPLink"><?= localize("Login"); ?></button>
                      </fieldset>
                    </form>
                    <small><i class="icon-warning-sign"></i> <?php echo sprintf(localize("<b>WARNING:</b> by enabling \"%s\", your authorization data are stored in a %s on your computer. <b>DO NOT USE</b> this option if you are using a public computer (i.e. internet points)."), localize("Remember me"), "<abbr title=\"" . localize("A cookie is used for an origin website to send state information to a user's browser and for the browser to return the state information to the origin site.") . "\">" . localize("cookie") . "</abbr>"); ?></small>
                  </li>
                </ul>
                <ul class="dropdown-menu hide" id="loggedInDropdown">
                  <li>
                    <a id="CHPP_Revoke_Auth_Link" href="chpp/chpp_revokeauth.php"><?= localize("Revoke authorization"); ?></a>
                  </li>
                </ul>
              </li>
            <?php } ?>
            <li class="dropdown" id="dropdownLanguages">
              <a class="dropdown-toggle" data-toggle="dropdown" href="#dropdownLanguages">
                <i class="flag-<?= $lang_array[strtolower(localize("lang"))]["flag"] ?>"></i>
                <span class="hidden-phone">
                  <?= $lang_array[strtolower(localize("lang"))]["lang-name"] ?>
                </span>
                <b class="caret"></b>
              </a>
              <ul class="dropdown-menu">
<?php
foreach ($lang_array as $key => $val) {
if (strtolower(localize("lang")) === $key) { continue; }
echo "                  <li><a href=\"?locale=$key\"><i class=\"flag-" . $val["flag"] . "\"></i> " . $val["lang-name"] . "</a></li>\n";
}
?>
                </ul>
              </li>
          </ul>
          <div class="nav-collapse">
            <ul class="nav">
              <li><a href="#helpModal" data-toggle="modal"><?= localize("Help") ?></a></li>
            </ul>
            <ul class="nav pull-right">
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Container Fluid Start -->
    <div id="main" class="container-fluid">

      <!-- First Row Start -->
      <div class="row-fluid">

        <!-- First Column Start -->
        <div class="span3 side-panel" id="side-panel">

          <!-- Staminia Main Options Start -->
          <div class="staminia-button-panel align-center">
            <h4><?= localize("General settings") ?></h4>
            <div class="btn-group btn-checkbox">
              <button id="Staminia_Options_OnlySecondHalfButton_Status" class="btn btn-status btn-success"><i class="icon-white icon-ok"></i></button>
              <button id="Staminia_Options_OnlySecondHalfButton" data-linked-to="Staminia_Options_OnlySecondHalf" class="btn btn-text-overflow" data-checkbox-button="data-checkbox-button" data-default-value="true"><span title="<?= localize("Only calculate the second half") ?>"><?= localize("Only calculate the second half") ?></span></button>
            </div>
            <div></div>
            <div class="btn-group btn-checkbox">
              <button id="Staminia_Options_ChartsButton_Status" class="btn btn-status btn-success"><i class="icon-white icon-ok"></i></button>
              <button id="Staminia_Options_ChartsButton" data-linked-to="Staminia_Options_Charts" class="btn btn-text-overflow" data-checkbox-button="data-checkbox-button" data-default-value="true"><span title="<?= localize("Show charts") ?>"><?= localize("Show charts") ?></span></button>
            </div>
            <div></div>
            <div class="btn-group btn-checkbox">
              <button id="Staminia_Options_VerboseModeButton_Status" class="btn btn-status btn-success"><i class="icon-white icon-ok"></i></button>
              <button id="Staminia_Options_VerboseModeButton" data-linked-to="Staminia_Options_VerboseMode" class="btn btn-text-overflow" data-checkbox-button="data-checkbox-button" data-default-value="true"><span title="<?= localize("Show contributions table") ?>"><?= localize("Show contributions table") ?></span></button>
            </div>
            <div></div>
            <div class="btn-group btn-checkbox">
              <button id="Staminia_Options_PressingButton_Status" class="btn btn-status btn-danger"><i class="icon-white icon-remove"></i></button>
              <button id="Staminia_Options_PressingButton" data-linked-to="Staminia_Options_Pressing" class="btn btn-text-overflow" data-checkbox-button="data-checkbox-button" data-default-value="false"><span title="<?= localize("Pressing") ?>"><?= localize("Pressing") ?></span></button>
            </div>
            <div></div>
            <div class="btn-group btn-checkbox">
              <button id="Staminia_Options_AdvancedModeButton_Status" class="btn btn-status btn-danger"><i class="icon-white icon-remove"></i></button>
              <button id="Staminia_Options_AdvancedModeButton" data-linked-to="Staminia_Options_AdvancedMode" class="btn btn-text-overflow" data-checkbox-button="data-checkbox-button" data-default-value="false"><span title="<?= localize("Advanced strength calculation") ?>"><?= localize("Advanced strength calculation") ?></span></button>
            </div>
          </div> <!-- Staminia Main Options End -->

          <!-- Staminia Predictions Type Start -->
          <div class="align-center staminia-button-panel hide" id="Staminia_Options_Predictions_Type">
            <h4><?= localize("Predictions Type") ?></h4>
            <div id="Staminia_Options_AdvancedMode_Predictions" class="btn-group btn-group-advanced" data-toggle="buttons-radio">
              <button class="btn active" disabled="disabled" data-radio-group="predictions" data-linked-to="Staminia_Options_AdvancedMode_Predictions_HO" data-radio-button="data-radio-button" data-default-value="true">HO</button>
              <button class="btn" disabled="disabled" data-radio-group="predictions" data-linked-to="Staminia_Options_AdvancedMode_Predictions_Andreac" data-radio-button="data-radio-button" data-default-value="false">Andreac</button>
            </div>
          </div> <!-- Staminia Predictions Type End -->

          <!-- Staminia CHPP Options Start -->
          <div class="align-center staminia-button-panel<? if (!$tryAjax) echo " hide"; ?>" id="Staminia_Options_CHPP">
            <h4><?= localize("CHPP Mode") ?></h4>
            <div class="btn-group btn-checkbox">
              <button class="btn btn-status" id="CHPP_Refresh_Data_Status" disabled="disabled"><i class="icon-warning-sign"></i></button>
              <button class="btn" disabled="disabled" id="CHPP_Refresh_Data" data-error-text="<?= localize("Error"); ?>" data-loading-text="<?= localize("Loading..."); ?>" data-success-text="<?= localize("Refresh data") ?>" data-complete-text="<?= localize("Refresh data") ?>"><?= localize("Unauthorized") ?></button>
            </div>

            <div id="CHPP_Results" class="hide shy align-left">
              <p id="CHPP_Status_Description"></p>
            </div>

          </div> <!-- Staminia CHPP Options End -->

        </div> <!-- First Column End -->

        <!-- Second Column Start -->
        <div class="span9">
          <ul class="nav nav-tabs">
            <li class="active"><a href="#tabPlayersInfo" data-toggle="tab"><i class="icon-user"></i> <span class="hidden-phone"><?= localize("Players Info") ?></span></a></li>
            <li class="hide" id="tabChartsNav"><a href="#tabCharts" data-toggle="tab"><i class="icon-bar-chart"></i> <span class="hidden-phone"><?= localize("Charts") ?></span></a></li>
            <li class="hide" id="tabContributionsNav"><a href="#tabContributions" data-toggle="tab"><i class="icon-list-alt"></i> <span class="hidden-phone"><?= localize("Contributions table") ?></span></a></li>
            <li class="hide" id="tabDebugNav"><a href="#tabDebug" data-toggle="tab">Debug</a></li>
            <li id="tabExtraNav"><a href="#tabExtra" data-toggle="tab"><i class="icon-plus-sign"></i> <span class="hidden-phone"><?= localize("Extra") ?></span></a></li>
            <li class="credits"><a href="#tabCredits" data-toggle="tab"><i class="icon-gift"></i> <span class="hidden-phone"><?= localize("Credits") ?></span></a></li>
          </ul>

          <!-- Tab Content Start -->
          <div class="tab-content">

            <div id="AlertsContainer"></div>

            <noscript>
              <div class="alert alert-block alert-error">
                <h4 class="alert-heading"><?= localize("Error"); ?></h4>
                <?= localize("You need a browser with JavaScript support") ?>
              </div>
            </noscript>

            <!-- Tab Players Info -->
            <div class="tab-pane active" id="tabPlayersInfo">
              <h1 class="mainTitle">Stamin.IA! <span class="sub"><?= localize("SUBTITLE") ?></span></h1>
              <p><?= sprintf(localize("SHORT_HELP"),localize("Player 1"), localize("Player 2")) ?></p>

              <!-- Main Form Start -->

              <form id="formPlayersInfo" action="javascript:{}" method="post" class="staminiaForm">
                <input type="hidden" name="Staminia_Options_OnlySecondHalf" value="true"/>
                <input type="hidden" name="Staminia_Options_Charts" value="true"/>
                <input type="hidden" name="Staminia_Options_VerboseMode" value="true"/>
                <input type="hidden" name="Staminia_Options_Pressing" value="false"/>
                <input type="hidden" name="Staminia_Options_AdvancedMode" value="false"/>
                <input type="hidden" name="Staminia_Options_AdvancedMode_Predictions_HO" value="true"/>
                <input type="hidden" name="Staminia_Options_AdvancedMode_Predictions_Andreac" value="false"/>

                <table class="table table-bordered table-condensed" id="playersInfoTable">
                  <thead>
                    <tr>
                      <th></th>
                      <th id="Staminia_Player_1" data-default-name="<?= localize("Player 1") ?>">
                        <?= localize("Player 1") ?>
                      </th>
                      <th id="Staminia_Player_2" data-default-name="<?= localize("Player 2") ?>">
                        <?= localize("Player 2") ?>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr class="chpp hide">
                      <td><?= localize("Player"); ?></td>
                      <td>
                        <select class="ignore" id="CHPP_Player_1" name="CHPP_Player_1_Name">
                        </select>
                      </td>
                      <td>
                        <select class="ignore" id="CHPP_Player_2" name="CHPP_Player_2_Name">
                        </select>
                      </td>
                    </tr>
                    <tr class="chpp hide">
                      <td><?= localize("Sort by"); ?></td>
                      <td colspan="2">
                        <div class="control-group">
                          <select class="ignore" id="CHPP_Players_SortBy" name="CHPP_Players_SortBy">
                            <option value="ShirtNumber"><?php echo localize("Shirt Number"); ?></option>
                            <option value="Name"><?php echo localize("Name"); ?></option>
                            <option value="Form"><?php echo localize("Form"); ?></option>
                            <option value="Stamina"><?php echo localize("Stamina"); ?></option>
                            <option value="Experience"><?php echo localize("Experience"); ?></option>
                            <option value="Loyalty"><?php echo localize("Loyalty"); ?></option>
                            <optgroup label="<?= localize("Skill"); ?>">
                              <option value="Keeper"><?php echo localize("Keeper (skill)"); ?></option>
                              <option value="Playmaking"><?php echo localize("Playmaking (skill)"); ?></option>
                              <option value="Passing"><?php echo localize("Passing (skill)"); ?></option>
                              <option value="Winger"><?php echo localize("Winger (skill)"); ?></option>
                              <option value="Defending"><?php echo localize("Defending (skill)"); ?></option>
                              <option value="Scoring"><?php echo localize("Scoring (skill)"); ?></option>
                              <option value="SetPieces"><?php echo localize("Set Pieces (skill)"); ?></option>
                            </optgroup>
                          </select>
                        </div>
                      </td>
                    </tr>
                    <tr class="simple">
                      <td><?= localize("Form"); ?></td>
                      <td>
                        <div class="control-group">
                          <select name="Staminia_Simple_Player_1_Form" data-validate="range" data-range-min="1" data-range-max="8" data-field-name="<?= localize("Player 1") ?> <?= localize("Form"); ?>">
                            <? optionSkills(1, 8) ?>
                          </select>
                        </div>
                      </td>
                      <td>
                        <div class="control-group">
                          <select name="Staminia_Simple_Player_2_Form" data-validate="range" data-range-min="1" data-range-max="8" data-field-name="<?= localize("Player 2") ?> <?= localize("Form"); ?>">
                            <? optionSkills(1, 8) ?>
                          </select>
                        </div>
                      </td>
                    </tr>
                    <tr class="simple">
                      <td><?= localize("Stamina"); ?></td>
                      <td>
                        <div class="control-group">
                          <select name="Staminia_Simple_Player_1_Stamina" data-validate="range" data-range-min="1" data-range-max="9" data-field-name="<?= localize("Player 1") ?> <?= localize("Stamina"); ?>">
                            <? optionSkills(1, 9) ?>
                          </select>
                        </div>
                      </td>
                      <td>
                        <div class="control-group">
                          <select name="Staminia_Simple_Player_2_Stamina" data-validate="range" data-range-min="1" data-range-max="9" data-field-name="<?= localize("Player 2") ?> <?= localize("Stamina"); ?>">
                            <? optionSkills(1, 9) ?>
                          </select>
                        </div>
                      </td>
                    </tr>
                    <tr class="simple">
                      <td><?= localize("Experience"); ?></td>
                      <td>
                        <div class="control-group">
                          <select name="Staminia_Simple_Player_1_Experience" data-validate="range" data-range-min="0" data-range-max="20" data-field-name="<?= localize("Player 1") ?> <?= localize("Experience"); ?>">
                            <? optionSkills() ?>
                          </select>
                        </div>
                      </td>
                      <td>
                        <div class="control-group">
                          <select name="Staminia_Simple_Player_2_Experience" data-validate="range" data-range-min="0" data-range-max="20" data-field-name="<?= localize("Player 2") ?> <?= localize("Experience"); ?>">
                            <? optionSkills() ?>
                          </select>
                        </div>
                      </td>
                    </tr>
                    <tr class="simple">
                      <td><?= localize("Main Skill"); ?></td>
                      <td>
                        <div class="control-group">
                          <select name="Staminia_Simple_Player_1_MainSkill" data-validate="range" data-range-min="0" data-range-max="20" data-field-name="<?= localize("Player 1") ?> <?= localize("Main Skill"); ?>">
                            <? optionSkills() ?>
                          </select>
                        </div>
                      </td>
                      <td>
                        <div class="control-group">
                          <select name="Staminia_Simple_Player_2_MainSkill" data-validate="range" data-range-min="0" data-range-max="20" data-field-name="<?= localize("Player 2") ?> <?= localize("Main Skill"); ?>">
                            <? optionSkills() ?>
                          </select>
                        </div>
                      </td>
                    </tr>
                    <tr class="simple">
                      <td><?= localize("Loyalty"); ?></td>
                      <td>
                        <div class="control-group">
                          <select name="Staminia_Simple_Player_1_Loyalty" data-validate="range" data-range-min="1" data-range-max="20" data-field-name="<?= localize("Player 1") ?> <?= localize("Loyalty"); ?>">
                            <? optionSkills(1,20,1) ?>
                          </select>
                        </div>
                      </td>
                      <td>
                        <div class="control-group">
                          <select name="Staminia_Simple_Player_2_Loyalty" data-validate="range" data-range-min="1" data-range-max="20" data-field-name="<?= localize("Player 2") ?> <?= localize("Loyalty"); ?>">
                            <? optionSkills(1,20,1) ?>
                          </select>
                        </div>
                      </td>
                    </tr>
                    <tr class="advanced hide">
                      <td><?= localize("Form"); ?></td>
                      <td>
                        <div class="control-group">
                          <input class="ignore" type="text" name="Staminia_Advanced_Player_1_Form" data-validate="range" data-range-min="1" data-range-max="8" data-field-name="<?= localize("Player 1") ?> <?= localize("Form"); ?>" value="6.00"/>
                        </div>
                      </td>
                      <td>
                        <div class="control-group">
                          <input class="ignore" type="text" name="Staminia_Advanced_Player_2_Form" data-validate="range" data-range-min="1" data-range-max="8" data-field-name="<?= localize("Player 2") ?> <?= localize("Form"); ?>" value="6.00"/>
                        </div>
                      </td>
                    </tr>
                    <tr class="advanced hide">
                      <td><?= localize("Stamina"); ?></td>
                      <td>
                        <div class="control-group">
                          <input class="ignore" type="text" name="Staminia_Advanced_Player_1_Stamina" data-validate="range" data-range-min="1" data-range-max="9" data-field-name="<?= localize("Player 1") ?> <?= localize("Stamina"); ?>" value="6.00"/>
                        </div>
                      </td>
                      <td>
                        <div class="control-group">
                          <input class="ignore" type="text" name="Staminia_Advanced_Player_2_Stamina" data-validate="range" data-range-min="1" data-range-max="9" data-field-name="<?= localize("Player 2") ?> <?= localize("Stamina"); ?>" value="6.00"/>
                        </div>
                      </td>
                    </tr>
                    <tr class="advanced hide">
                      <td><?= localize("Experience"); ?></td>
                      <td>
                        <div class="control-group">
                          <input class="ignore" type="text" name="Staminia_Advanced_Player_1_Experience" data-validate="range" data-range-min="0" data-range-max="30" data-field-name="<?= localize("Player 1") ?> <?= localize("Experience"); ?>" value="6.00"/>
                        </div>
                      </td>
                      <td>
                        <div class="control-group">
                          <input class="ignore" type="text" name="Staminia_Advanced_Player_2_Experience" data-validate="range" data-range-min="0" data-range-max="30" data-field-name="<?= localize("Player 2") ?> <?= localize("Experience"); ?>" value="6.00"/>
                        </div>
                      </td>
                    </tr>
                    <tr class="advanced hide">
                      <td><?= localize("Loyalty"); ?></td>
                      <td>
                        <div class="control-group">
                          <input class="ignore" type="text" name="Staminia_Advanced_Player_1_Loyalty" data-validate="range" data-range-min="1" data-range-max="20" data-field-name="<?= localize("Player 1") ?> <?= localize("Loyalty"); ?>" value="1.00"/>
                        </div>
                      </td>
                      <td>
                        <div class="control-group">
                          <input class="ignore" type="text" name="Staminia_Advanced_Player_2_Loyalty" data-validate="range" data-range-min="1" data-range-max="20" data-field-name="<?= localize("Player 2") ?> <?= localize("Loyalty"); ?>" value="1.00"/>
                        </div>
                      </td>
                    </tr>
                    <tr class="motherClubBonus">
                      <td><?= localize("Mother club bonus") ?></td>
                      <td>
                        <input type="hidden" name="Staminia_Player_1_MotherClubBonus" value="false"/>
                        <div class="btn-group btn-checkbox">
                          <button type="button" id="Button_Player_1_MotherClubBonus_Status" class="btn btn-danger btn-status"><i class="icon-remove icon-white"></i></button>
                          <button type="button" data-linked-to="Staminia_Player_1_MotherClubBonus" id="Button_Player_1_MotherClubBonus" class="btn width-auto" data-checkbox-button="data-checkbox-button" data-motherclub-button="1" data-default-value="false"><i class="icon-heart"></i></button>
                        </div>
                      </td>
                      <td>
                        <input type="hidden" name="Staminia_Player_2_MotherClubBonus" value="false"/>
                        <div class="btn-group btn-checkbox">
                          <button type="button" id="Button_Player_2_MotherClubBonus_Status" class="btn btn-danger btn-status"><i class="icon-remove icon-white"></i></button>
                          <button type="button" data-linked-to="Staminia_Player_2_MotherClubBonus" id="Button_Player_2_MotherClubBonus" class="btn width-auto" data-checkbox-button="data-checkbox-button" data-motherclub-button="2" data-default-value="false"><i class="icon-heart"></i></button>
                        </div>
                      </td>
                    </tr>
                    <tr class="advanced hide">
                      <td><?= localize("Position"); ?></td>
                      <td colspan="2">
                        <div class="control-group">
                          <select class="ignore" id="Staminia_Advanced_Position" name="Staminia_Advanced_Position" data-field-name="<?php echo localize("Position"); ?>">
                            <option value="0"><?php echo localize("Keeper"); ?></option>
                            <optgroup label="<?= localize("Defender"); ?>">
                              <option value="1"><?php echo localize("Defender"); ?></option>
                              <option value="2"><?php echo localize("Defender (Off)"); ?></option>
                              <option value="3"><?php echo localize("Defender (TW)"); ?></option>
                            <optgroup label="<?= localize("Winger Back"); ?>">
                              <option value="4"><?php echo localize("Winger Back"); ?></option>
                              <option value="5"><?php echo localize("Winger Back (Off)"); ?></option>
                              <option value="6"><?php echo localize("Winger Back (Def)"); ?></option>
                              <option value="7"><?php echo localize("Winger Back (TM)"); ?></option>
                            </optgroup>
                            <optgroup label="<?= localize("Midfielder"); ?>">
                              <option value="8"><?php echo localize("Midfielder"); ?></option>
                              <option value="9"><?php echo localize("Midfielder (Off)"); ?></option>
                              <option value="10"><?php echo localize("Midfielder (Def)"); ?></option>
                              <option value="11"><?php echo localize("Midfielder (TW)"); ?></option>
                            </optgroup>
                            <optgroup label="<?= localize("Winger"); ?>">
                              <option value="12"><?php echo localize("Winger"); ?></option>
                              <option value="13"><?php echo localize("Winger (Off)"); ?></option>
                              <option value="14"><?php echo localize("Winger (Def)"); ?></option>
                              <option value="15"><?php echo localize("Winger (TM)"); ?></option>
                            </optgroup>
                            <optgroup label="<?= localize("Forward"); ?>">
                              <option value="16"><?php echo localize("Forward"); ?></option>
                              <option value="17"><?php echo localize("Forward (Def)"); ?></option>
                              <option value="18"><?php echo localize("Forward (Def+Tec)"); ?></option>
                              <option value="19"><?php echo localize("Forward (TW)"); ?></option>
                            </optgroup>
                          </select>
                        </div>
                      </td>
                    </tr>
                    <tr class="advanced hide" id="Staminia_Advanced_Skill_Keeper">
                      <td><?= localize("Keeper (skill)"); ?></td>
                      <td>
                        <div class="control-group">
                          <input class="ignore" type="text" name="Staminia_Advanced_Player_1_Skill_Keeper" data-validate="range" data-range-min="0" data-range-max="22" data-field-name="<?= localize("Player 1") ?> <?= localize("Keeper (skill)"); ?>" value="6.00"/>
                        </div>
                      </td>
                      <td>
                        <div class="control-group">
                          <input class="ignore" type="text" name="Staminia_Advanced_Player_2_Skill_Keeper" data-validate="range" data-range-min="0" data-range-max="22" data-field-name="<?= localize("Player 2") ?> <?= localize("Keeper (skill)"); ?>" value="6.00"/>
                        </div>
                      </td>
                    </tr>
                    <tr class="advanced hide" id="Staminia_Advanced_Skill_Defending">
                      <td><?= localize("Defending (skill)"); ?></td>
                      <td>
                        <div class="control-group">
                          <input class="ignore" type="text" name="Staminia_Advanced_Player_1_Skill_Defending" data-validate="range" data-range-min="0" data-range-max="22" data-field-name="<?= localize("Player 1") ?> <?= localize("Defending (skill)"); ?>" value="6.00"/>
                        </div>
                      </td>
                      <td>
                        <div class="control-group">
                          <input class="ignore" type="text" name="Staminia_Advanced_Player_2_Skill_Defending" data-validate="range" data-range-min="0" data-range-max="22" data-field-name="<?= localize("Player 2") ?> <?= localize("Defending (skill)"); ?>" value="6.00"/>
                        </div>
                      </td>
                    </tr>
                    <tr class="advanced hide" id="Staminia_Advanced_Skill_Playmaking">
                      <td><?= localize("Playmaking (skill)"); ?></td>
                      <td>
                        <div class="control-group">
                          <input class="ignore" type="text" name="Staminia_Advanced_Player_1_Skill_Playmaking" data-validate="range" data-range-min="0" data-range-max="22" data-field-name="<?= localize("Player 1") ?> <?= localize("Playmaking (skill)"); ?>" value="6.00"/>
                        </div>
                      </td>
                      <td>
                        <div class="control-group">
                          <input class="ignore" type="text" name="Staminia_Advanced_Player_2_Skill_Playmaking" data-validate="range" data-range-min="0" data-range-max="22" data-field-name="<?= localize("Player 2") ?> <?= localize("Playmaking (skill)"); ?>" value="6.00"/>
                        </div>
                      </td>
                    </tr>
                    <tr class="advanced hide" id="Staminia_Advanced_Skill_Winger">
                      <td><?= localize("Winger (skill)"); ?></td>
                      <td>
                        <div class="control-group">
                          <input class="ignore" type="text" name="Staminia_Advanced_Player_1_Skill_Winger" data-validate="range" data-range-min="0" data-range-max="22" data-field-name="<?= localize("Player 1") ?> <?= localize("Winger (skill)"); ?>" value="6.00"/>
                        </div>
                      </td>
                      <td>
                        <div class="control-group">
                          <input class="ignore" type="text" name="Staminia_Advanced_Player_2_Skill_Winger" data-validate="range" data-range-min="0" data-range-max="22" data-field-name="<?= localize("Player 2") ?> <?= localize("Winger (skill)"); ?>" value="6.00"/>
                        </div>
                      </td>
                    </tr>
                    <tr class="advanced hide" id="Staminia_Advanced_Skill_Passing">
                      <td><?= localize("Passing (skill)"); ?></td>
                      <td>
                        <div class="control-group">
                          <input class="ignore" type="text" name="Staminia_Advanced_Player_1_Skill_Passing" data-validate="range" data-range-min="0" data-range-max="22" data-field-name="<?= localize("Player 1") ?> <?= localize("Passing (skill)"); ?>" value="6.00"/>
                        </div>
                      </td>
                      <td>
                        <div class="control-group">
                          <input class="ignore" type="text" name="Staminia_Advanced_Player_2_Skill_Passing" data-validate="range" data-range-min="0" data-range-max="22" data-field-name="<?= localize("Player 2") ?> <?= localize("Passing (skill)"); ?>" value="6.00"/>
                        </div>
                      </td>
                    </tr>
                    <tr class="advanced hide" id="Staminia_Advanced_Skill_Scoring">
                      <td><?= localize("Scoring (skill)"); ?></td>
                      <td>
                        <div class="control-group">
                          <input class="ignore" type="text" name="Staminia_Advanced_Player_1_Skill_Scoring" data-validate="range" data-range-min="0" data-range-max="22" data-field-name="<?= localize("Player 1") ?> <?= localize("Scoring (skill)"); ?>" value="6.00"/>
                        </div>
                      </td>
                      <td>
                        <div class="control-group">
                          <input class="ignore" type="text" name="Staminia_Advanced_Player_2_Skill_Scoring" data-validate="range" data-range-min="0" data-range-max="22" data-field-name="<?= localize("Player 2") ?> <?= localize("Scoring (skill)"); ?>" value="6.00"/>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div class="align-center form-actions">
                  <button type="submit" id="calculate" class="btn btn-large btn-primary"><i class="icon-large icon-magic"></i> <?= localize("Calculate") ?></button>
                  <button type="button" id="switchPlayers" class="btn btn-large"><i class="icon-large icon-random"></i> <?= localize("Switch players") ?></button>
                  <button type="button" id="getLink" class="btn btn-large"><i class="icon-large icon-link"></i> <?= localize("Get link") ?></button>
                  <button type="reset" id="resetApp" class="btn btn-large btn-warning"><i class="icon-large icon-undo"></i> <?= localize("Reset") ?></button>
                </div>
              </form> <!-- Main Form End -->
            </div>

            <!-- Charts -->
            <div class="tab-pane" id="tabCharts">
              <div id="charts">
                <h3 class="legend-like"><?= localize("Total Contribution"); ?></h3>
                <div id="chartTotal" class="chart"></div>
                <h3 class="legend-like"><?= localize("Partial Contributions"); ?></h3>
                <div id="chartPartials" class="chart"></div>
              </div>
            </div>

            <!-- Contributions -->
            <div class="tab-pane" id="tabContributions">
            </div>

            <!-- Extra -->
            <div class="tab-pane" id="tabExtra">
              <h3 class="legend-like"><?= localize("Stamina subskills calculation"); ?></h3>
              <form action="javascript:{}" method="post" class="form-inline">
                <div class="control-group">
                  <label for="performanceAt90" class="inline">
                    <?= localize("Performance at 90'"); ?>:
                  </label>
                  <select class="ignore width-auto" id="performanceAt90" name="performanceAt90">
                    <?php for ($i = 100; $i >= 26; $i--) { ?>
                      <option value=<?= $i ?>><?= $i ?>%</option>
                    <?php } ?>
                  </select>
                  <span class="help-inline success-text"><?= localize("The estimate stamina level is"); ?> <b id="staminaSubskillsEstimationTarget">9.0</b></span>
                </div>
                <p class="help-block"><i class="icon-question-sign"></i> <?= localize("In order to get performance at minute 90', you need to go under \"Lineup\" tab of match ratings, click on the \"90\" button on the top and leave the mouse on player's stamina bar: a tooltip with stamina percentage will eventually appear."); ?></p>
              </form>
            </div>

            <!-- Debug -->
            <div class="tab-pane" id="tabDebug">
            </div>

            <!-- Credits -->
            <div class="tab-pane" id="tabCredits">
              <blockquote>
                <p><?= localize("QUOTE"); ?></p>
                <small>Danfisico (3232936)</small>
              </blockquote>
              <h3><?= localize("Thanks to"); ?>:</h3>
              <p>
                <b>CHPP-teles</b> (653581), <b>GM-Andreac</b> (7790187), <b>Cuomos</b> (4052076), <b>Danfisico</b> (3232936), <b>Hiddink14</b> (9141503), <b>sulce</b> (9767434), <b>Shinobi-fisc</b> (7328722), <b>taccola</b> (7541533), <b>Cacchino</b> (11389955), <b>-Materasso-</b> (7313267), <b>arezzowave</b> (11613695), <b>trigrottro</b> (10193531), <b>Manny_Ray-BSK</b> (6506224), <b>xin</b> [old 3D Logo], Federation <b>"L'Antica Osteria da Ciccio"</b> (91634), Federation <b>"DAC - Crick &amp; Croack"</b> (37817)
              </p>
              <h3><?= localize("Translated by"); ?>:</h3>
              <p>
                <?= localize("TRANSLATED_BY"); ?>
              </p>
              <h3><?= localize("Nerd thanks"); ?>:</h3>
              <p>
                <a href="http://twitter.github.com/bootstrap/">Twitter Bootstrap's team</a>,
                <a href="http://html5boilerplate.com/">HTML5 Bolierplate's team</a>,
                <a href="http://github.com/mojombo/clippy">mojombo/clippy</a>,
                <a href="http://github.com/jzaefferer/jquery-validation">jzaefferer/jquery-validation</a>,
                <a href="http://github.com/flot/flot">flot/flot</a>,
                <a href="http://fortawesome.github.com/Font-Awesome">Font Awesome</a>,
                <a href="http://www.famfamfam.com/lab/icons/flags/">Mark James</a>
              </p>
            </div>

          </div> <!-- Tab Content End -->

        </div> <!-- Second Column End -->

      </div> <!-- First Row End -->

      <!-- Help Modal Start -->
      <div class='modal hide' id='helpModal'>
        <div class='modal-header'>
          <button type='button' class='close' data-dismiss='modal'>&times;</button>
          <h3><?= localize("Help") ?></h3>
        </div>
        <div class="modal-body">
          <?= localize("LONG_HELP") ?>
        </div>
        <div class="modal-footer">
          <a href="#" class="btn" data-dismiss="modal"><?= localize("Close") ?></a>
        </div>
      </div> <!-- Help Modal End -->

      <hr/>

      <!-- Footer Start -->
      <footer>
        <ul class="unstyled">
          <li><b>Stamin.IA!</b> by <b>Lizardopoli</b> (5246225)</li>
          <li><a href="https://github.com/<?= GH_REPO ?>/blob/master/CHANGELOG.md">v<?= $staminia_version ?></a></li>
          <?php if (CHPP_APP_ID != "") { ?>
            <li><i class="icon-star"></i> <a href="http://www.hattrick.org/Community/CHPP/ChppProgramDetails.aspx?ApplicationId=<?= CHPP_APP_ID ?>">Certified Hattrick Product Provider</a></li>
          <?php } ?>
          <li><i class="icon-github"></i> <a href="http://github.com/<?= GH_REPO ?>">Stamin.IA! @ github</a></li>
        </ul>
      </footer> <!-- Footer End -->

    </div> <!-- Container Fluid End -->
<?php
if (defined('GA_ID')) { ?>
    <script type="text/javascript">
      var _gaq = _gaq || [];
      _gaq.push(['_setAccount', '<?= GA_ID ?>']);
      _gaq.push(['_trackPageview']);

      (function() {
        var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
        ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
        var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
      })();
    </script>
<? } ?>
    <script src="js/vendor/jquery-1.8.0.min.js"></script>
    <script src="js/vendor/bootstrap-2.0.4.min.js"></script>

    <!-- scripts concatenated and minified via build script -->
    <script src="js/vendor/jqform/jquery.form.min.js"></script>
    <script src="js/vendor/jqvalidate/jquery.validate.min.js"></script>
    <script src="js/vendor/jqthrottle/jquery.ba-throttle-debounce.min.js"></script>
    <script src="js/jquery.flot.js"></script>
    <script src="js/main.js"></script>
    <script src="js/plugins.js"></script>
    <script src="js/engine.js"></script>
    <!-- end scripts -->

    <!--[if IE]><script language="javascript" type="text/javascript" src="js/vendor/flot/excanvas.min.js"></script><![endif]-->

    <script>
      document.startAjax = <?php if ($tryAjax) { echo "true"; } else { echo "false"; } ?>;
<?php
$file = "js/vendor/jqvalidate/localization/messages_" . localize("validateLang") . ".js";
if (is_file($file)) { include($file); }
$file = "js/localization/messages_" . localize("lang") . ".js";
$file_en = "js/localization/messages_en-US.js";
if (is_file($file)) { include($file); }
else { include($file_en); }
?>
    </script>
  </body>
</html>
