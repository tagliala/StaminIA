<?php

error_reporting(E_ALL & ~E_DEPRECATED);
ob_start('ob_gzhandler');
header('Content-type: application/json');
require __DIR__ . '/../vendor/autoload.php';
include __DIR__ . '/config.php';

ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_secure', 1);
ini_set('session.cookie_samesite', 'Lax');
ini_set('session.use_strict_mode', 1);
session_start();
$returnArray = [];

$oauthToken = $_SESSION['oauthToken'] ?? null;
$oauthTokenSecret = $_SESSION['oauthTokenSecret'] ?? null;

$clearCache = isset($_GET['refresh']);

function resetPermanentToken()
{
    if ($_COOKIE['permanent'] ?? false) {
        $clear = array_merge(COOKIE_OPTIONS, ['expires' => time() - 3600]);
        setcookie('permanent', '', $clear);
        setcookie('userToken', '', $clear);
        setcookie('userTokenSecret', '', $clear);
    }
}

function getTeamDetails($HT, $team)
{
    $teamId = $team->getId();
    $teamArray = [];
    $teamArray["TeamId"] = $teamId;
    $teamArray["TeamName"] = $team->getName();

    $teamPlayers = $HT->getSeniorPlayers($teamId);
    $teamPlayersArray = [];

    for ($i = 0; $i < $teamPlayers->getPlayerNumber(); $i++) {
        $player = $teamPlayers->getPlayer($i);
        $playerArray = [
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
            'MotherClubBonus' => $player->hasMotherClubBonus(),
        ];

        // Main skill
        $playerArray['MainSkill'] = max(
            1,
            $playerArray['KeeperSkill'],
            $playerArray['DefenderSkill'],
            $playerArray['PlaymakerSkill'],
            $playerArray['ScorerSkill'],
            $playerArray['WingerSkill'],
            $playerArray['PassingSkill'],
        );

        array_push($teamPlayersArray, $playerArray);
    }

    $teamArray["PlayersData"] = $teamPlayersArray;
    return $teamArray;
}

if ($oauthToken == null && ($_COOKIE['permanent'] ?? false)) {
    $oauthToken = $_COOKIE['userToken'] ?? null;
    $oauthTokenSecret = $_COOKIE['userTokenSecret'] ?? null;

    if ($oauthToken && $oauthTokenSecret) {
        $_SESSION['oauthToken'] = $oauthToken;
        $_SESSION['oauthTokenSecret'] = $oauthTokenSecret;
    } else {
        $returnArray['Status'] = 'Error';
        $returnArray['ErrorCode'] = 'InvalidToken';
        resetPermanentToken();
    }
}

if ($oauthToken != null && $oauthTokenSecret != null) {
    try {
        $HT = new \PHT\PHT(getPhtConfig([
            'OAUTH_TOKEN' => $oauthToken,
            'OAUTH_TOKEN_SECRET' => $oauthTokenSecret,
            'CACHE' => 'session',
        ]));

        if ($clearCache) {
            // Prevent flooding
            if (isset($_SESSION['lastRefreshTime'])) {
                $lastRefreshTime = $_SESSION['lastRefreshTime'];
                $currentRefreshRequestTime = time();
                if ($currentRefreshRequestTime >= ($lastRefreshTime + MIN_REFRESH_SECONDS)) {
                    \PHT\Cache\Driver::getInstance()->clear('players');
                    $_SESSION['lastRefreshTime'] = time();
                } else {
                    $returnArray["RefreshThrottle"] = (MIN_REFRESH_SECONDS - ($currentRefreshRequestTime - $lastRefreshTime));
                }
            } else {
                \PHT\Cache\Driver::getInstance()->clear('players');
                $_SESSION['lastRefreshTime'] = time();
            }
        }

        $returnArray["Teams"] = [];

        // Primary team
        $primaryTeam = $HT->getSeniorTeam();
        if (is_object($primaryTeam)) {
            array_push($returnArray["Teams"], getTeamDetails($HT, $primaryTeam));
        }

        // Secondary teams (a user can have multiple)
        for ($n = 1; $n <= 3; $n++) {
            $teamConfig = new \PHT\Config\Team();
            $teamConfig->secondary = true;
            $teamConfig->number = $n;
            try {
                $secondaryTeam = $HT->getSeniorTeam($teamConfig);
                if (!is_object($secondaryTeam)) {
                    break;
                }
                array_push($returnArray["Teams"], getTeamDetails($HT, $secondaryTeam));
            } catch (\PHT\Exception\ChppException $e) {
                break;
            }
        }

        $returnArray["Status"] = "OK";

        // Update last refresh time
        if (!isset($_SESSION['lastRefreshTime'])) {
            $_SESSION['lastRefreshTime'] = time();
        }
    } catch (\PHT\Exception\ChppException $e) {
        $conn = new \PHT\Connection(getPhtConfig());
        try {
            $tokenCheck = $conn->checkChppAccess($oauthToken, $oauthTokenSecret);
            if ($tokenCheck->isValid()) {
                $returnArray['Status'] = 'Error';
                $returnArray['ErrorCode'] = $e->getMessage();
            } else {
                $returnArray['Status'] = 'Error';
                $returnArray['ErrorCode'] = 'InvalidToken';
                resetPermanentToken();
                unset($_SESSION['oauthToken']);
                unset($_SESSION['oauthTokenSecret']);
            }
        } catch (\Exception $ex) {
            $returnArray['Status'] = 'Error';
            $returnArray['ErrorCode'] = 'InvalidToken';
            resetPermanentToken();
            unset($_SESSION['oauthToken']);
            unset($_SESSION['oauthTokenSecret']);
        }
    }
} else {
    $returnArray['Status'] = 'Error';
    $returnArray['ErrorCode'] = 'UnknownError';
}
echo json_encode($returnArray);
