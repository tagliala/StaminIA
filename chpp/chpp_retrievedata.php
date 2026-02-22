<?php

ob_start('ob_gzhandler');
header('Content-type: application/json');
require __DIR__ . '/../vendor/autoload.php';
include __DIR__ . '/config.php';

session_start();
$returnArray = [];

$oauthToken = $_SESSION['oauthToken'] ?? null;
$oauthTokenSecret = $_SESSION['oauthTokenSecret'] ?? null;

$clearCache = isset($_GET['refresh']);

function resetPermanentToken()
{
    if ($_COOKIE['permanent'] ?? false) {
        setcookie('permanent', '', time() - 3600, COOKIE_PATH, COOKIE_DOMAIN);
        setcookie('userToken', '', time() - 3600, COOKIE_PATH, COOKIE_DOMAIN);
        setcookie('userTokenSecret', '', time() - 3600, COOKIE_PATH, COOKIE_DOMAIN);
    }
}

function getTeamDetails($HT, $teamId)
{
    $team = $HT->getSeniorTeam();
    $teamArray = [];
    $teamArray["TeamId"] = $team->getId();
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
            $teamArray = [];
            $teamArray["TeamId"] = $primaryTeam->getId();
            $teamArray["TeamName"] = $primaryTeam->getName();

            $teamPlayers = $HT->getSeniorPlayers($primaryTeam->getId());
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
            array_push($returnArray["Teams"], $teamArray);
        }

        // Secondary team
        $teamConfig = new \PHT\Config\Team();
        $teamConfig->secondary = true;
        try {
            $secondaryTeam = $HT->getSeniorTeam($teamConfig);
            if (is_object($secondaryTeam)) {
                $teamArray = [];
                $teamArray["TeamId"] = $secondaryTeam->getId();
                $teamArray["TeamName"] = $secondaryTeam->getName();

                $teamPlayers = $HT->getSeniorPlayers($secondaryTeam->getId());
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
                array_push($returnArray["Teams"], $teamArray);
            }
        } catch (\PHT\Exception\ChppException $e) {
            // No secondary team — that's fine
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
