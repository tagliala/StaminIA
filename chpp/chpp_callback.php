<?php

include '../lib/PHT/PHT.php';
include 'config.php';
session_start();
$HT = $_SESSION['HT'];
/*
When user is redirected to your callback url
you will received two parameters in url
oauth_token and oauth_verifier
use both in next function:
*/
if ($HT != null) try
{
 $HT->retrieveAccessToken($_REQUEST['oauth_token'], $_REQUEST['oauth_verifier']);
 
 /*
 Now access is granted for your application
 You can save user token and token secret and/or request xml files
 */
 
 $storeTokens = $_SESSION['storeTokens'];

 if (($storeTokens != null) && ($storeTokens)) {

  $userToken = $HT->getOauthToken();
  $userTokenSecret = $HT->getOauthTokenSecret();

  setcookie('userToken'      , $userToken      , COOKIE_EXPIRE_TIME, COOKIE_PATH, COOKIE_DOMAIN);
  setcookie('userTokenSecret', $userTokenSecret, COOKIE_EXPIRE_TIME, COOKIE_PATH, COOKIE_DOMAIN);
  setcookie('permanent'      , 1               , COOKIE_EXPIRE_TIME, COOKIE_PATH, COOKIE_DOMAIN);

  unset($_SESSION['storeTokens']);
 }
}
catch(HTError $e)
{
 echo $e->getMessage();
}
header('Location: ' . APP_ROOT);
?>