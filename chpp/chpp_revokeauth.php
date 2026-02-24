<?php

error_reporting(E_ALL & ~E_DEPRECATED);
require __DIR__ . '/../vendor/autoload.php';
include __DIR__ . '/config.php';
session_start();

$clear = array_merge(COOKIE_OPTIONS, ['expires' => time() - 3600]);
setcookie('permanent', '', $clear);
setcookie('userToken', '', $clear);
setcookie('userTokenSecret', '', $clear);

$oauthToken = $_SESSION['oauthToken'] ?? null;
$oauthTokenSecret = $_SESSION['oauthTokenSecret'] ?? null;

if ($oauthToken != null && $oauthTokenSecret != null) {
    try {
        $conn = new \PHT\Connection(getPhtConfig());
        $conn->deleteChppAccess($oauthToken, $oauthTokenSecret);
    } catch (\PHT\Exception\ChppException $e) {
    }
}

unset($_SESSION['oauthToken']);
unset($_SESSION['oauthTokenSecret']);
unset($_SESSION['storeTokens']);
unset($_SESSION['lastRefreshTime']);

header('Location: ' . APP_ROOT);
