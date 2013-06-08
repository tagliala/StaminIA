<?php
ob_start('ob_gzhandler');
header('Content-type: application/json');
include '../lib/PHT/PHT.php';
include 'config.php';

session_start();
$returnArray = array();

$HT = $_SESSION['HT'];

$clearCache = isset($_GET['refresh']);

function resetPermanentToken() {
  if ($_COOKIE['permanent']) {
    setcookie('permanent', '', time() - 3600, COOKIE_PATH, COOKIE_DOMAIN);
    setcookie('userToken', '', time() - 3600, COOKIE_PATH, COOKIE_DOMAIN);
    setcookie('userTokenSecret', '', time() - 3600, COOKIE_PATH, COOKIE_DOMAIN);
  }
}

function getTeamDetails($HT, $team) {
  $teamArray = array();
  $teamArray["TeamId"]    = $team->getTeamId();
  $teamArray["TeamName"]    = $team->getTeamName();

  $teamPlayers = $HT->getTeamPlayers();
  $teamPlayersArray = array();

  for ($i = 1; $i <= $teamPlayers->getNumberPlayers(); $i++) {
    $player      = $teamPlayers->getPlayer($i);
    $playerArray = array(
      'PlayerID'        => $player->getId(),
      'PlayerName'      => $player->getName(),
      'PlayerNumber'    => $player->getShirtNumber(),

      'PlayerForm'      => $player->getForm(),
      'Experience'      => $player->getExperience(),

      'InjuryLevel'     => $player->getInjury(),
      'TransferListed'  => $player->isTransferListed(),
      'Cards'           => $player->getCards(),

      'StaminaSkill'    => $player->getStamina(),

      'KeeperSkill'     => $player->getKeeper(),
      'PlaymakerSkill'  => $player->getPlaymaker(),
      'ScorerSkill'     => $player->getScorer(),
      'PassingSkill'    => $player->getPassing(),
      'WingerSkill'     => $player->getWinger(),
      'DefenderSkill'   => $player->getDefender(),
      'SetPiecesSkill'  => $player->getSetPieces(),

      'Loyalty'         => $player->getLoyalty(),
      'MotherClubBonus' => $player->hasMotherClubBonus()
    );

    // Main skill
    $playerArray['MainSkill'] = max(
      1,
      $playerArray['KeeperSkill'],
      $playerArray['DefenderSkill'],
      $playerArray['PlaymakerSkill'],
      $playerArray['ScorerSkill'],
      $playerArray['WingerSkill'],
      $playerArray['PassingSkill']);

    array_push($teamPlayersArray, $playerArray);
  }

  $teamArray["PlayersData"] = $teamPlayersArray;
  return $teamArray;
}

if (($HT == null) && ($_COOKIE['permanent'])) {
  $userToken       = $_COOKIE['userToken'];
  $userTokenSecret = $_COOKIE['userTokenSecret'];
  try {
    $HT = new CHPPConnection(APP_CONSUMERKEY, APP_CONSUMERSECRET);
    $HT->setOauthToken($userToken);
    $HT->setOauthTokenSecret($userTokenSecret);
    $_SESSION['HT'] = $HT;
  }
  catch (HTError $e) {
    $returnArray['Status']    = 'Error';
    $returnArray['ErrorCode'] = 'InvalidToken';
    resetPermanentToken();
  }
}

if ($HT != null) {
  try {
    if ($clearCache) {
      // Prevent flooding
      if (isset($_SESSION['lastRefreshTime'])) {
        $lastRefreshTime           = $_SESSION['lastRefreshTime'];
        $currentRefreshRequestTime = time();
        if ($currentRefreshRequestTime >= ($lastRefreshTime + MIN_REFRESH_SECONDS)) {
          $HT->clearTeamsPlayers();
          $_SESSION['lastRefreshTime'] = time();
        } else {
          $returnArray["RefreshThrottle"] = (MIN_REFRESH_SECONDS - ($currentRefreshRequestTime - $lastRefreshTime));
        }
      } else {
        $HT->clearTeamsPlayers();
        $_SESSION['lastRefreshTime'] = time();
      }
    }

    $returnArray["Teams"] = array();

    // Check and set Primary Team
    if (is_object($team = $HT->getPrimaryTeam())) {
      array_push($returnArray["Teams"], getTeamDetails($HT, $team));
    }

    // Check and set Secondary Team
    if (is_object($team = $HT->getSecondaryTeam())) {
      array_push($returnArray["Teams"], getTeamDetails($HT, $team));
    }

    $returnArray["Status"]      = "OK";

    // Update last refresh time
    if (!isset($_SESSION['lastRefreshTime'])) {
      $_SESSION['lastRefreshTime'] = time();
    }
  }
  catch (HTError $e) {
    $HTCheckToken = $HT->checkToken();
    if ($HTCheckToken->isValid()) {
      $returnArray['Status']    = 'Error';
      $returnArray['ErrorCode'] = $e->getMessage();
    } else {
      $returnArray['Status']    = 'Error';
      $returnArray['ErrorCode'] = 'InvalidToken';
      resetPermanentToken();
    }
  }
} else {
  $returnArray['Status']    = 'Error';
  $returnArray['ErrorCode'] = 'UnknownError';
}
echo json_encode($returnArray);
?>
