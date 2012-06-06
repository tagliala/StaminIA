<?php
header('Content-type: application/json');
include '../lib/PHT/PHT.php';
include 'config.php';

session_start();
$returnArray = array();

$HT = $_SESSION['HT'];

$clearCache = isset($_GET['refresh']);

if (($HT == null) && ($_COOKIE['permanent'])) {
  $userToken = $_COOKIE['userToken'];
  $userTokenSecret = $_COOKIE['userTokenSecret'];
  try
  {
   /*
   You don't need to login to Hattrick, you cas use
   user token (if you saved it) to retrieve xml
   Create PHT instance (no need to set a callback url)
   set user token and token secret, then request xml, it's easy :)
   */
   $HT = new CHPPConnection(APP_CONSUMERKEY, APP_CONSUMERSECRET);
   $HT->setOauthToken($userToken);
   $HT->setOauthTokenSecret($userTokenSecret);
   $_SESSION['HT'] = $HT;
  }
  catch(HTError $e)
  {
   setcookie('permanent'      , '', time() - 3600, COOKIE_PATH, COOKIE_DOMAIN);
   setcookie('userToken'      , '', time() - 3600, COOKIE_PATH, COOKIE_DOMAIN);
   setcookie('userTokenSecret', '', time() - 3600, COOKIE_PATH, COOKIE_DOMAIN);
   $returnArray["Status"] = "Error";
   $returnArray["ErrorCode"] = "InvalidToken";
  }
}

if ($HT != null) {
  try
  {
   if ($clearCache) {
   
    //prevent flooding
    if (isset($_SESSION['lastRefreshTime'])) {
      $lastRefreshTime = $_SESSION['lastRefreshTime'];
      $currentRefreshRequestTime = time();
      if ($currentRefreshRequestTime >= ($lastRefreshTime + MIN_REFRESH_SECONDS)) {
        $HT->clearTeamsPlayers();
        $_SESSION['lastRefreshTime'] = time();
      }
      else {
        $returnArray["RefreshThrottle"] = (MIN_REFRESH_SECONDS - ($currentRefreshRequestTime - $lastRefreshTime));
      }
    }
    else {
      $HT->clearTeamsPlayers();
      $_SESSION['lastRefreshTime'] = time();
    }  
    
   }

   $teamPlayers = $HT->getTeamPlayers();
   
   $teamPlayersArray = array();
   
   for($i=1; $i<=$teamPlayers->getNumberPlayers(); $i++)
   {
    $player = $teamPlayers->getPlayer($i);
    $playerArray = array(
          "PlayerID" => $player->getId(),
          "PlayerName" => $player->getName(),
          "PlayerNumber" => $player->getShirtNumber(),

          "PlayerForm" => $player->getForm(),
          "Experience" => $player->getExperience(),

          "InjuryLevel" => $player->getInjury(),
          "TransferListed" => $player->isTransferListed(),
          "Cards" => $player->getCards(),

          "StaminaSkill" => $player->getStamina(),
          
          "KeeperSkill" => $player->getKeeper(),
          "PlaymakerSkill" => $player->getPlaymaker(),
          "ScorerSkill" => $player->getScorer(),
          "PassingSkill" => $player->getPassing(),
          "WingerSkill" => $player->getWinger(),
          "DefenderSkill" => $player->getDefender(),
          "SetPiecesSkill" => $player->getSetPieces(),

          "Loyalty" => $player->getLoyalty(),
          "MotherClubBonus" => $player->hasMotherClubBonus()
    );
    
    //Main skill
    {
      $max = 1;
      if ($playerArray["PlaymakerSkill"] > $max) 
        $max = $playerArray["PlaymakerSkill"];
      if ($playerArray["KeeperSkill"] > $max)
        $max = $playerArray["KeeperSkill"];
      if ($playerArray["DefenderSkill"] > $max)
        $max = $playerArray["DefenderSkill"];
      if ($playerArray["ScorerSkill"] > $max)
        $max = $playerArray["ScorerSkill"];
      if ($playerArray["WingerSkill"] > $max)
        $max = $playerArray["WingerSkill"];            
      if ($playerArray["PassingSkill"] > $max)
        $max = $playerArray["PassingSkill"];            
      $playerArray["MainSkill"] = $max;
    }
    
    array_push($teamPlayersArray, $playerArray);

    }

    $returnArray["Status"] = "OK";
    $returnArray["TeamName"] = $teamPlayers->getTeamName();
    $returnArray["PlayersData"] = $teamPlayersArray;
    
    //prevent flooding
    if (!isset($_SESSION['lastRefreshTime'])) {
     $_SESSION['lastRefreshTime'] = time();
    }
  }
  catch(HTError $e)
  {
   $HTCheckToken = $HT->checkToken();
   if ($HTCheckToken->isValid()) {
    $returnArray["Status"] = "Error";
    $returnArray["ErrorCode"] = $e->getMessage();
   } else {
    $returnArray["Status"] = "Error";
    $returnArray["ErrorCode"] = "InvalidToken";
    if ($_COOKIE['permanent']) {
      setcookie('permanent'      , '', time() - 3600, COOKIE_PATH, COOKIE_DOMAIN);
      setcookie('userToken'      , '', time() - 3600, COOKIE_PATH, COOKIE_DOMAIN);
      setcookie('userTokenSecret', '', time() - 3600, COOKIE_PATH, COOKIE_DOMAIN);
    }
   }
  }
}
else {
  $returnArray["Status"] = "Error";
  $returnArray["ErrorCode"] = "UnknownError";
}
echo json_encode($returnArray);
?>
