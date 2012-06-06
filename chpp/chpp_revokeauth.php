<?php
include '../lib/PHT/PHT.php';
include 'config.php';
session_start();

setcookie('permanent'      , '', time() - 3600, COOKIE_PATH, COOKIE_DOMAIN);
setcookie('userToken'      , '', time() - 3600, COOKIE_PATH, COOKIE_DOMAIN);
setcookie('userTokenSecret', '', time() - 3600, COOKIE_PATH, COOKIE_DOMAIN);

$HT = $_SESSION['HT'];

if ($HT != null) {
  try
  {
    $HT->invalidateToken();
    unset($_SESSION['HT']);
    unset($_SESSION['storeTokens']);
    unset($_SESSION['lastRefreshTime']);
  }
  catch(HTError $e)
  {
  }
}

header('Location: ' . APP_ROOT);
?>
