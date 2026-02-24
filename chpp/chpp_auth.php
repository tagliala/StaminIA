<?php

error_reporting(E_ALL & ~E_DEPRECATED);
require __DIR__ . '/../vendor/autoload.php';
include __DIR__ . '/config.php';
session_start();

if (!isset($_POST['csrf_token'], $_SESSION['csrf_token'])
    || !hash_equals($_SESSION['csrf_token'], $_POST['csrf_token'])) {
    http_response_code(403);
    echo "Invalid request.";
    exit();
}

/*
You must supply your chpp credentials and a callback url.
User will be redirected to this url after login.
*/
try {
    $_SESSION['storeTokens'] = false;

    $HT = new \PHT\Connection(getPhtConfig());
    $callbackUrl = APP_ROOT . 'chpp/chpp_callback.php';

    if (isset($_POST['permanent'])) {
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
