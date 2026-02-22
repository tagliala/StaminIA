<?php

require __DIR__ . '/../vendor/autoload.php';
include __DIR__ . '/config.php';
session_start();

setcookie('permanent', '', time() - 3600, COOKIE_PATH, COOKIE_DOMAIN);
setcookie('userToken', '', time() - 3600, COOKIE_PATH, COOKIE_DOMAIN);
setcookie('userTokenSecret', '', time() - 3600, COOKIE_PATH, COOKIE_DOMAIN);

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
