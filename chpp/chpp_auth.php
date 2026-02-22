<?php

error_reporting(E_ALL & ~E_DEPRECATED);
require __DIR__ . '/../vendor/autoload.php';
include __DIR__ . '/config.php';
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
    echo $e->getMessage();
    exit();
}

header('Location: ' . $url);
