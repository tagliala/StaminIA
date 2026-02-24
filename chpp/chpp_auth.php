<?php

error_reporting(E_ALL & ~E_DEPRECATED);
require __DIR__ . '/../vendor/autoload.php';
include __DIR__ . '/config.php';
ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_secure', 1);
ini_set('session.cookie_samesite', 'Lax');
ini_set('session.use_strict_mode', 1);
session_start();

/*
You must supply your chpp credentials and a callback url.
User will be redirected to this url after login.
*/
try {
    $_SESSION['storeTokens'] = false;

    $HT = new \PHT\Connection(getPhtConfig());
    $callbackUrl = APP_ROOT . 'chpp/chpp_callback.php';

    if (isset($_GET['permanent'])) {
        $auth = $HT->getPermanentAuthorization($callbackUrl);
        $_SESSION['storeTokens'] = true;
    } else {
        $auth = $HT->getTemporaryAuthorization($callbackUrl);
    }

    if ($auth === false) {
        echo "Impossible to initiate CHPP connection";
        exit();
    }

    $_SESSION['temporaryToken'] = $auth->temporaryToken;
    $url = $auth->url;
} catch (\PHT\Exception\ChppException $e) {
    error_log('CHPP auth error: ' . $e->getMessage());
    echo "An error occurred during CHPP authorization. Please try again.";
    exit();
}

header('Location: ' . $url);
