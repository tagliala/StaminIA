<?php

// Include PHT file before starting session!
include '../lib/PHT/PHT.php';
include 'config.php';
session_start();
/*
You must supply your chpp crendentials and a callback url.
User will be redirected to this url after login
You can add your own parameters to this url if you need,
they will be kept on user redirection
*/
try
{
 $_SESSION['storeTokens'] = false;

 $HT = new CHPPConnection(APP_CONSUMERKEY, APP_CONSUMERSECRET, APP_ROOT . 'chpp/chpp_callback.php');

 if (isset($_GET['permanent'])) {
  $url = $HT->getAuthorizeUrl(); //permanent authorization
  $_SESSION['storeTokens'] = true;
 } else {
  $url = $HT->getAuthenticateUrl(); //temporary authorization
 } 
}
catch(HTError $e)
{
 echo $e->getMessage();
}
/*
Be sure to store $HT in session before redirect user
to Hattrick chpp login page 
*/
$_SESSION['HT'] = $HT;
/*
Redirect user to Hattrick for login
or put a link with this url on your site
*/
header('Location: ' . $url);
?>