<?php
require __DIR__ . '/vendor/autoload.php';
include __DIR__ . '/config.php';
include __DIR__ . '/includes/icon.php';
session_start();
$oauthToken = $_SESSION['oauthToken'] ?? null;
$permanent = $_COOKIE['permanent'] ?? null;
$tryAjax = (($oauthToken != null) || $permanent);
?>
<?php
include 'localization.php';
?>
<?php

function optionSkills($start = 0, $stop = 20, $select = 6)
{
    global $localizedSkills;

    if ($start < 0) {
        $start = 0;
    }
    if ($stop > 20) {
        $stop = 20;
    }
    if (($select < 0) || ($select > 20)) {
        $select = -1;
    }

    if ($stop < $start) {
        $start = 0;
        $stop = 20;
    }
    if ($select > $stop) {
        $select = -1;
    }

    for ($i = $start; $i <= $stop; ++$i) {
        echo "<option value=\"$i\"" . (($select == $i) ? " selected=\"selected\"" : "") . ">$localizedSkills[$i]</option>\n";
    }
}
?>
<?php $staminia_version = "13.09.29" ?>
<!DOCTYPE html>
<html lang="<?php echo localize("lang"); ?>">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Stamin.IA! <?php echo localize("SUBTITLE"); ?></title>

    <meta name="description" content="Stamin.IA! <?php echo localize("SUBTITLE"); ?>"/>
    <meta name="author" content="Lizardopoli"/>
    <meta name="keywords" content="Stamin.IA!, CHPP, stamina tool, hattrick, substitutions tool, substitutions"/>

    <meta property="og:title" content="Stamin.IA!"/>
    <meta property="og:description" content="<?php echo localize("SUBTITLE"); ?>"/>
    <meta property="og:type" content="game"/>
    <meta property="og:image" content="<?= APP_ROOT ?>img/big_logo.png"/>
    <meta property="og:url" content="<?= APP_ROOT ?>"/>
    <meta property="og:site_name" content="Lizardopoli"/>

    <script>
      (function(){var m=document.cookie.match(/(?:^|;\s*)theme=(\w+)/);document.documentElement.setAttribute("data-bs-theme",m?m[1]:"light")})()
    </script>

    <link href="dist/staminia.min.css" rel="stylesheet">
    <link href="//fonts.googleapis.com/css?family=Telex|Lobster" rel="stylesheet">

    <link rel="shortcut icon" href="img/staminia_favicon.png">
    <link rel="apple-touch-icon" href="img/ico/apple-touch-icon.png">
    <link rel="apple-touch-icon" sizes="72x72" href="img/ico/apple-touch-icon-72x72.png">
    <link rel="apple-touch-icon" sizes="114x114" href="img/ico/apple-touch-icon-114x114.png">
  </head>
<?php flush(); ?>
  <body>

  <!-- Navbar
    ================================================== -->
    <nav class="navbar navbar-expand-md fixed-top" data-bs-theme="dark">
      <div class="container-fluid">
        <span class="navbar-brand"><i id="staminia-logo"></i><span id="staminia-brand" class="d-none d-sm-inline">Stamin.IA!</span></span>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent" aria-controls="navbarContent" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarContent">
          <ul class="navbar-nav me-auto">
            <li class="nav-item"><a class="nav-link" href="#helpModal" data-bs-toggle="modal"><?= localize("Help") ?></a></li>
          </ul>
          <ul class="navbar-nav">
            <li class="nav-item">
              <button class="nav-link" id="themeToggle" type="button" aria-label="Toggle theme">
                <?= icon('sun', 'theme-icon-sun') ?>
                <?= icon('moon', 'theme-icon-moon') ?>
              </button>
            </li>
            <?php if (CHPP_APP_ID != "") { ?>
              <li class="nav-item dropdown" id="dropdownLogin">
                <a class="nav-link dropdown-toggle" data-bs-toggle="dropdown" data-bs-auto-close="outside" href="#" role="button">
                  <span id="menuLoginTitle"><?= localize("CHPP"); ?></span>
                </a>
                <div class="dropdown-menu dropdown-menu-end" id="loginDropdown">
                  <form id="LoginForm" action="chpp/chpp_auth.php" method="get">
                    <p><?= localize("Authorize Stamin.IA! to access your data"); ?></p>
                    <fieldset>
                      <label class="rememberme"><input type="checkbox" name="permanent" <?php if ($permanent) {
                          echo "checked=\"checked\"";
                      } ?>/> <span><?php echo localize("Remember me"); ?></span></label>
                      <button type="submit" class="btn btn-sm btn-primary" id="CHPPLink"><?= localize("Login"); ?></button>
                    </fieldset>
                  </form>
                  <small><?= icon('triangle-exclamation') ?> <?php echo sprintf(localize("<b>WARNING:</b> by enabling \"%s\", your authorization data are stored in a %s on your computer. <b>DO NOT USE</b> this option if you are using a public computer (i.e. internet points)."), localize("Remember me"), "<abbr title=\"" . localize("A cookie is used for an origin website to send state information to a user's browser and for the browser to return the state information to the origin site.") . "\">" . localize("cookie") . "</abbr>"); ?></small>
                </div>
                <ul class="dropdown-menu dropdown-menu-end d-none" id="loggedInDropdown">
                  <li>
                    <a class="dropdown-item" id="CHPP_Revoke_Auth_Link" href="chpp/chpp_revokeauth.php"><?= localize("Revoke authorization"); ?></a>
                  </li>
                </ul>
              </li>
            <?php } ?>
            <li class="nav-item dropdown" id="dropdownLanguages">
              <a class="nav-link dropdown-toggle" data-bs-toggle="dropdown" href="#" role="button">
                <i class="flag-<?= $lang_array[strtolower(localize("lang"))]["flag"] ?>"></i>
                <span class="d-none d-sm-inline">
                  <?= $lang_array[strtolower(localize("lang"))]["lang-name"] ?>
                </span>
              </a>
              <ul class="dropdown-menu dropdown-menu-end">
<?php
foreach ($lang_array as $key => $val) {
    if (strtolower(localize("lang")) === $key) {
        continue;
    }
    echo "                  <li><a class=\"dropdown-item\" href=\"?locale=$key\"><i class=\"flag-" . $val["flag"] . "\"></i> " . $val["lang-name"] . "</a></li>\n";
}
?>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <!-- Container Start -->
    <div id="main" class="container-fluid">

      <!-- First Row Start -->
      <div class="row">

        <!-- First Column Start -->
        <div class="col-lg-3 side-panel" id="side-panel">

          <!-- Staminia Options Start -->
          <div class="accordion" id="accordion-settings">
            <form id="optionForm" action="javascript:{}" method="post">
              <div class="accordion-item">
                <h2 class="accordion-header">
                  <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseSettings">
                    <?= icon('gear') ?>
                    <?= localize("Settings") ?>
                  </button>
                </h2>
                <div id="collapseSettings" class="accordion-collapse collapse" data-bs-parent="#accordion-settings">
                  <div class="accordion-body">
                    <div class="staminia-button-panel">
                      <div class="form-check form-switch">
                        <input class="form-check-input" type="checkbox" name="Staminia_Options_OnlySecondHalf" id="Staminia_Options_OnlySecondHalf" checked>
                        <label class="form-check-label" for="Staminia_Options_OnlySecondHalf" title="<?= localize("Only calculate the second half") ?>"><?= localize("Only calculate the second half") ?></label>
                      </div>
                      <div class="form-check form-switch">
                        <input class="form-check-input" type="checkbox" name="Staminia_Options_Charts" id="Staminia_Options_Charts" checked>
                        <label class="form-check-label" for="Staminia_Options_Charts" title="<?= localize("Show charts") ?>"><?= localize("Show charts") ?></label>
                      </div>
                      <div class="form-check form-switch">
                        <input class="form-check-input" type="checkbox" name="Staminia_Options_VerboseMode" id="Staminia_Options_VerboseMode" checked>
                        <label class="form-check-label" for="Staminia_Options_VerboseMode" title="<?= localize("Show contributions table") ?>"><?= localize("Show contributions table") ?></label>
                      </div>
                      <div class="form-check form-switch">
                        <input class="form-check-input" type="checkbox" name="Staminia_Options_Pressing" id="Staminia_Options_Pressing">
                        <label class="form-check-label" for="Staminia_Options_Pressing" title="<?= localize("Pressing") ?>"><?= localize("Pressing") ?></label>
                      </div>
                      <div class="form-check form-switch">
                        <input class="form-check-input" type="checkbox" name="Staminia_Options_AdvancedMode" id="Staminia_Options_AdvancedMode">
                        <label class="form-check-label" for="Staminia_Options_AdvancedMode" title="<?= localize("Advanced strength calculation") ?>"><?= localize("Advanced strength calculation") ?></label>
                      </div>
                    </div>

                    <!-- Staminia Predictions Type Start -->
                    <div class="staminia-button-panel d-none" id="Staminia_Options_Predictions_Type">
                      <?= localize("Predictions Type") ?>
                      <div class="btn-group btn-group-radio d-flex">
                        <input type="radio" name="Staminia_Options_Predictions_Type" id="Staminia_Options_AdvancedMode_Predictions_HO" value="ho" checked>
                        <label class="btn btn-outline-secondary" for="Staminia_Options_AdvancedMode_Predictions_HO">
                          HO
                        </label>
                        <input type="radio" name="Staminia_Options_Predictions_Type" id="Staminia_Options_AdvancedMode_Predictions_AndreaC" value="andreac">
                        <label class="btn btn-outline-secondary" for="Staminia_Options_AdvancedMode_Predictions_AndreaC">
                          AndreaC
                        </label>
                      </div>
                    </div> <!-- Staminia Predictions Type End -->
                  </div>
                </div>
              </div>
            </form>
          </div> <!-- Staminia Options End -->

          <!-- Staminia CHPP Start -->
          <div class="accordion<?php if (!$tryAjax) {
              echo " d-none";
          } ?>" id="accordion-chpp">
            <div class="accordion-item">
              <h2 class="accordion-header">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseCHPP">
                  <?= icon('star') ?>
                  <?= localize("CHPP Mode") ?>
                </button>
              </h2>
              <div id="collapseCHPP" class="accordion-collapse collapse" data-bs-parent="#accordion-chpp">
                <div class="accordion-body">
                  <div class="staminia-button-panel<?php if (!$tryAjax) {
                      echo " d-none";
                  } ?>" id="Staminia_Options_CHPP">
                    <div class="btn-group btn-chpp">
                      <button class="btn btn-sm btn-status" id="CHPP_Refresh_Data_Status" disabled="disabled"><?= icon('triangle-exclamation') ?></button>
                      <button class="btn btn-sm btn-outline-secondary" disabled="disabled" id="CHPP_Refresh_Data" data-error-text="<?= localize("Error"); ?>" data-loading-text="<?= localize("Loading..."); ?>" data-success-text="<?= localize("Refresh data") ?>" data-complete-text="<?= localize("Refresh data") ?>"><?= localize("Unauthorized") ?></button>
                    </div>

                    <div id="CHPP_Results" class="d-none shy">
                      <p id="CHPP_Status_Description"></p>
                    </div>

                  </div> <!-- Staminia CHPP Options End -->
                </div>
              </div>
            </div>
          </div> <!-- Staminia CHPP End -->

<?php if (defined('GOOGLE_AD_CLIENT')) { ?>
          <!-- Advertising -->
          <div class="advertising border-box">
            <script type="text/javascript">
              google_ad_client = "<?= GOOGLE_AD_CLIENT ?>";
              if (window.innerWidth <= 767) {
                /* Stamin.IA! 236x60 */
                google_ad_slot = "6526500219";
                google_ad_width = 234;
                google_ad_height = 60;
              } else if (window.innerWidth >= 1024) {
                /* Stamin.IA! 200x200 */
                google_ad_slot = "9120039814";
                google_ad_width = 200;
                google_ad_height = 200;
              } else {
                /* Stamin.IA! 125x125 */
                google_ad_slot = "2912055810";
                google_ad_width = 125;
                google_ad_height = 125;
              }
            </script>
            <script type="text/javascript"
             src="http://pagead2.googlesyndication.com/pagead/show_ads.js">
            </script>
          </div>
<?php } else { ?>
          <div class="spacer"></div>
<?php } ?>
        </div> <!-- First Column End -->

        <!-- Second Column Start -->
        <div class="col-lg-9">
          <ul class="nav nav-tabs" role="tablist">
            <li class="nav-item"><a class="nav-link active" href="#tabPlayersInfo" data-bs-toggle="tab" role="tab"><?= icon('user') ?> <span class="d-none d-sm-inline"><?= localize("Players Info") ?></span></a></li>
            <li class="nav-item d-none" id="tabChartsNav"><a class="nav-link" href="#tabCharts" data-bs-toggle="tab" role="tab"><?= icon('chart-bar') ?> <span class="d-none d-sm-inline"><?= localize("Charts") ?></span></a></li>
            <li class="nav-item d-none" id="tabContributionsNav"><a class="nav-link" href="#tabContributions" data-bs-toggle="tab" role="tab"><?= icon('rectangle-list') ?> <span class="d-none d-sm-inline"><?= localize("Contributions table") ?></span></a></li>
            <li class="nav-item d-none" id="tabDebugNav"><a class="nav-link" href="#tabDebug" data-bs-toggle="tab" role="tab">Debug</a></li>
            <li class="nav-item" id="tabExtraNav"><a class="nav-link" href="#tabExtra" data-bs-toggle="tab" role="tab"><?= icon('circle-plus') ?> <span class="d-none d-sm-inline"><?= localize("Extra") ?></span></a></li>
            <li class="nav-item credits"><a class="nav-link" href="#tabCredits" data-bs-toggle="tab" role="tab"><?= icon('gift') ?> <span class="d-none d-sm-inline"><?= localize("Credits") ?></span></a></li>
          </ul>

          <!-- Tab Content Start -->
          <div class="tab-content">

            <div id="AlertsContainer"></div>

            <noscript>
              <div class="alert alert-danger">
                <h4 class="alert-heading"><?= localize("Error"); ?></h4>
                <?= localize("You need a browser with JavaScript support") ?>
              </div>
            </noscript>

            <!-- Tab Players Info -->
            <div class="tab-pane active" id="tabPlayersInfo">
              <h1 class="mainTitle">Stamin.IA! <span class="sub"><?= localize("SUBTITLE") ?></span></h1>
              <p><?= sprintf(localize("SHORT_HELP"), localize("Player 1"), localize("Player 2")) ?></p>

              <!-- Main Form Start -->

              <form id="formPlayersInfo" action="javascript:{}" method="post" class="staminiaForm">

                <table class="table table-bordered table-condensed border-box" id="playersInfoTable">
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
                    <tr class="hide">
                      <td><?= localize("Team"); ?></td>
                      <td colspan="2">
                        <select class="ignore" id="CHPP_Team" name="CHPP_Team">
                        </select>
                      </td>
                    </tr>
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
                          <span class="field-caption"><?= localize("Sort by"); ?></span>
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
                          <span class="field-caption"><?= localize("Form"); ?></span>
                          <select name="Staminia_Simple_Player_1_Form" data-validate="range" data-range-min="1" data-range-max="8" data-field-name="<?= localize("Player 1") ?> <?= localize("Form"); ?>">
                            <?php optionSkills(1, 8) ?>
                          </select>
                        </div>
                      </td>
                      <td>
                        <div class="control-group">
                          <span class="field-caption"></span>
                          <select name="Staminia_Simple_Player_2_Form" data-validate="range" data-range-min="1" data-range-max="8" data-field-name="<?= localize("Player 2") ?> <?= localize("Form"); ?>">
                            <?php optionSkills(1, 8) ?>
                          </select>
                        </div>
                      </td>
                    </tr>
                    <tr class="simple">
                      <td><?= localize("Stamina"); ?></td>
                      <td>
                        <div class="control-group">
                          <span class="field-caption"><?= localize("Stamina"); ?></span>
                          <select name="Staminia_Simple_Player_1_Stamina" data-validate="range" data-range-min="1" data-range-max="9" data-field-name="<?= localize("Player 1") ?> <?= localize("Stamina"); ?>">
                            <?php optionSkills(1, 9) ?>
                          </select>
                        </div>
                      </td>
                      <td>
                        <div class="control-group">
                          <select name="Staminia_Simple_Player_2_Stamina" data-validate="range" data-range-min="1" data-range-max="9" data-field-name="<?= localize("Player 2") ?> <?= localize("Stamina"); ?>">
                            <?php optionSkills(1, 9) ?>
                          </select>
                        </div>
                      </td>
                    </tr>
                    <tr class="simple">
                      <td><?= localize("Experience"); ?></td>
                      <td>
                        <div class="control-group">
                          <span class="field-caption"><?= localize("Experience"); ?></span>
                          <select name="Staminia_Simple_Player_1_Experience" data-validate="range" data-range-min="0" data-range-max="20" data-field-name="<?= localize("Player 1") ?> <?= localize("Experience"); ?>">
                            <?php optionSkills() ?>
                          </select>
                        </div>
                      </td>
                      <td>
                        <div class="control-group">
                          <select name="Staminia_Simple_Player_2_Experience" data-validate="range" data-range-min="0" data-range-max="20" data-field-name="<?= localize("Player 2") ?> <?= localize("Experience"); ?>">
                            <?php optionSkills() ?>
                          </select>
                        </div>
                      </td>
                    </tr>
                    <tr class="simple">
                      <td><?= localize("Main Skill"); ?></td>
                      <td>
                        <div class="control-group">
                          <span class="field-caption"><?= localize("Main Skill"); ?></span>
                          <select name="Staminia_Simple_Player_1_MainSkill" data-validate="range" data-range-min="0" data-range-max="20" data-field-name="<?= localize("Player 1") ?> <?= localize("Main Skill"); ?>">
                            <?php optionSkills() ?>
                          </select>
                        </div>
                      </td>
                      <td>
                        <div class="control-group">
                          <select name="Staminia_Simple_Player_2_MainSkill" data-validate="range" data-range-min="0" data-range-max="20" data-field-name="<?= localize("Player 2") ?> <?= localize("Main Skill"); ?>">
                            <?php optionSkills() ?>
                          </select>
                        </div>
                      </td>
                    </tr>
                    <tr class="simple">
                      <td><?= localize("Loyalty"); ?></td>
                      <td>
                        <div class="control-group">
                          <span class="field-caption"><?= localize("Loyalty"); ?></span>
                          <select name="Staminia_Simple_Player_1_Loyalty" data-validate="range" data-range-min="1" data-range-max="20" data-field-name="<?= localize("Player 1") ?> <?= localize("Loyalty"); ?>">
                            <?php optionSkills(1, 20, 1) ?>
                          </select>
                        </div>
                      </td>
                      <td>
                        <div class="control-group">
                          <select name="Staminia_Simple_Player_2_Loyalty" data-validate="range" data-range-min="1" data-range-max="20" data-field-name="<?= localize("Player 2") ?> <?= localize("Loyalty"); ?>">
                            <?php optionSkills(1, 20, 1) ?>
                          </select>
                        </div>
                      </td>
                    </tr>
                    <tr class="advanced hide">
                      <td><?= localize("Form"); ?></td>
                      <td>
                        <div class="control-group">
                          <span class="field-caption"></span>
                          <span class="field-caption"><?= localize("Form"); ?></span>
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
                          <span class="field-caption"><?= localize("Stamina"); ?></span>
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
                          <span class="field-caption"><?= localize("Experience"); ?></span>
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
                          <span class="field-caption"><?= localize("Loyalty"); ?></span>
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
                        <span class="field-caption"><?= localize("Mother club bonus"); ?></span>
                        <div class="form-check">
                          <input class="form-check-input" type="checkbox" name="Staminia_Player_1_MotherClubBonus" id="Staminia_Player_1_MotherClubBonus" class="motherclub-bonus-checkbox">
                          <label class="form-check-label" for="Staminia_Player_1_MotherClubBonus"><?= icon('heart') ?></label>
                        </div>
                      </td>
                      <td>
                        <div class="form-check">
                          <input class="form-check-input" type="checkbox" name="Staminia_Player_2_MotherClubBonus" id="Staminia_Player_2_MotherClubBonus" class="motherclub-bonus-checkbox">
                          <label class="form-check-label" for="Staminia_Player_2_MotherClubBonus"><?= icon('heart') ?></label>
                        </div>
                      </td>
                    </tr>
                    <tr class="advanced hide">
                      <td><?= localize("Position"); ?></td>
                      <td colspan="2">
                        <div class="control-group">
                          <span class="field-caption"><?= localize("Position"); ?></span>
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
                          <span class="field-caption"><?= localize("Keeper (skill)"); ?></span>
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
                          <span class="field-caption"><?= localize("Defending (skill)"); ?></span>
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
                          <span class="field-caption"><?= localize("Playmaking (skill)"); ?></span>
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
                          <span class="field-caption"><?= localize("Winger (skill)"); ?></span>
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
                          <span class="field-caption"><?= localize("Passing (skill)"); ?></span>
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
                          <span class="field-caption"><?= localize("Scoring (skill)"); ?></span>
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
<?php if (defined('GOOGLE_AD_CLIENT')) { ?>
                <!-- Advertising -->
                <div class="advertising border-box advertising-leaderboard">
                  <script type="text/javascript">
                    google_ad_client = "<?= GOOGLE_AD_CLIENT ?>";
                    /* Stamin.IA! 728x90 */
                    google_ad_slot = "5365994614";
                    google_ad_width = 728;
                    google_ad_height = 90;
                    //-->
                    </script>
                    <script type="text/javascript"
                    src="http://pagead2.googlesyndication.com/pagead/show_ads.js">
                    </script>
                </div>
<?php } ?>
                <div class="text-center form-actions">
                  <button type="submit" id="calculate" class="btn btn-lg btn-primary"><?= icon('wand-magic-sparkles') ?> <?= localize("Calculate") ?></button>
                  <button type="button" id="switchPlayers" class="btn btn-lg btn-outline-secondary"><?= icon('shuffle') ?> <?= localize("Switch players") ?></button>
                  <button type="button" id="getLink" class="btn btn-lg btn-outline-secondary"><?= icon('link') ?> <?= localize("Get link") ?></button>
                  <button type="reset" id="resetApp" class="btn btn-lg btn-warning"><?= icon('rotate-left') ?> <?= localize("Reset") ?></button>
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
                    <?php for ($i = 100; $i >= 16; $i--) { ?>
                      <option value=<?= $i ?>><?= $i ?>%</option>
                    <?php } ?>
                  </select>
                  <span class="text-success"><?= localize("The estimate stamina level is"); ?> <b id="staminaSubskillsEstimationTarget">8.7</b><span id="or-higher"> <?= localize("(or higher)"); ?></span></span>
                </div>
                <p class="text-body-secondary"><?= icon('circle-question') ?> <?= localize("In order to get performance at minute 90', you need to go under \"Lineup\" tab of match ratings, click on the \"90\" button on the top and leave the mouse on player's stamina bar: a tooltip with stamina percentage will eventually appear. Player should have played all 90 minutes without confusion in the formation."); ?></p>
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
                <a href="http://getbootstrap.com/">Twitter Bootstrap's team</a>,
                <a href="http://html5boilerplate.com/">HTML5 Bolierplate's team</a>,
                <a href="http://github.com/jzaefferer/jquery-validation">jzaefferer/jquery-validation</a>,
                <a href="http://github.com/flot/flot">flot/flot</a>,
                <a href="http://fontawesome.io">Font Awesome</a>,
                <a href="http://www.famfamfam.com/lab/icons/flags/">Mark James</a>
              </p>
            </div>

          </div> <!-- Tab Content End -->

        </div> <!-- Second Column End -->

      </div> <!-- First Row End -->

      <!-- Help Modal Start -->
      <div class="modal fade" tabindex="-1" id="helpModal">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title"><?= localize("Help") ?></h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <?= localize("LONG_HELP") ?>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal"><?= localize("Close") ?></button>
            </div>
          </div>
        </div>
      </div> <!-- Help Modal End -->

      <hr/>

      <!-- Footer Start -->
      <footer>
        <ul class="list-unstyled">
          <li><b>Stamin.IA!</b> by <b>Lizardopoli</b> (5246225)</li>
          <li><a href="https://github.com/<?= GH_REPO ?>/blob/master/CHANGELOG.md">v<?= $staminia_version ?></a></li>
          <?php if (CHPP_APP_ID != "") { ?>
            <li><?= icon('star') ?> <a href="http://www.hattrick.org/Community/CHPP/ChppProgramDetails.aspx?ApplicationId=<?= CHPP_APP_ID ?>">Certified Hattrick Product Provider</a></li>
          <?php } ?>
          <li><?= icon('github') ?> <a href="http://github.com/<?= GH_REPO ?>">Stamin.IA! @ github</a></li>
        </ul>
      </footer> <!-- Footer End -->

    </div> <!-- Container End -->

    <script src="dist/staminia.min.js"></script>

    <script>
      document.startAjax = <?php if ($tryAjax) {
          echo "true";
      } else {
          echo "false";
      } ?>;
<?php
$file = "js/vendor/jqvalidate/localization/messages_" . localize("validateLang") . ".js";
if (is_file($file)) {
    include($file);
}
$file = "js/localization/messages_" . localize("lang") . ".js";
$file_en = "js/localization/messages_en-US.js";
if (is_file($file)) {
    include($file);
} else {
    include($file_en);
}
?>
    </script>
  </body>
</html>
