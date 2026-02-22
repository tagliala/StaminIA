<?php

error_reporting(E_ALL & ~E_DEPRECATED);
require __DIR__ . '/../vendor/autoload.php';
include __DIR__ . '/config.php';
session_start();

$temporaryToken = $_SESSION['temporaryToken'] ?? null;

if ($temporaryToken != null) {
    try {
        $HT = new \PHT\Connection(getPhtConfig());
        $access = $HT->getChppAccess($temporaryToken, $_REQUEST['oauth_token'], $_REQUEST['oauth_verifier']);

        if ($access === false) {
            echo "Impossible to confirm CHPP connection";
            exit();
        }

        $_SESSION['oauthToken'] = $access->oauthToken;
        $_SESSION['oauthTokenSecret'] = $access->oauthTokenSecret;
        unset($_SESSION['temporaryToken']);

        $storeTokens = $_SESSION['storeTokens'] ?? false;

        if ($storeTokens) {
            setcookie('userToken', $access->oauthToken, COOKIE_EXPIRE_TIME, COOKIE_PATH, COOKIE_DOMAIN);
            setcookie('userTokenSecret', $access->oauthTokenSecret, COOKIE_EXPIRE_TIME, COOKIE_PATH, COOKIE_DOMAIN);
            setcookie('permanent', 1, COOKIE_EXPIRE_TIME, COOKIE_PATH, COOKIE_DOMAIN);

            unset($_SESSION['storeTokens']);
        }
    } catch (\PHT\Exception\ChppException $e) {
        echo $e->getMessage();
    }
}
header('Location: ' . APP_ROOT);
