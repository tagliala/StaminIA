<?php

$langs = array();

if (isset($_SERVER['HTTP_ACCEPT_LANGUAGE'])) {
    // break up string into pieces (languages and q factors)
    preg_match_all('/([a-z]{1,8}(-[a-z]{1,8})?)\s*(;\s*q\s*=\s*(1|0\.[0-9]+))?/i', $_SERVER['HTTP_ACCEPT_LANGUAGE'], $lang_parse);

    if (count($lang_parse[1])) {
        // create a list like "en" => 0.8
        $langs = array_combine($lang_parse[1], $lang_parse[4]);
    	
        // set default to 1 for any without q factor
        foreach ($langs as $lang => $val) {
            if ($val === '') $langs[$lang] = 1;
        }
    }
}

if ($_GET["locale"]) {
    preg_match('/([a-z]{1,8}(-[a-z]{1,8})?)/i', $_GET['locale'], $lang_parse);
    if ($lang_parse[0]) {
      //highest priority
      $langs{$lang_parse[0]} = 2;
    }
}

// sort list based on value	
arsort($langs, SORT_NUMERIC);

/**
* Define the url path for the resources
*/
defined('LANG_PATH') or define('LANG_PATH', 'lang/');

$lang_array = array();
$lang_nocountry_array = array();

if ($handle = opendir(LANG_PATH)) {
    while (false !== ($file = readdir($handle))) {
        if (preg_match("/^[a-zA-Z\-]+\.json$/", $file)) {
            $name = preg_replace('/\.json$/', '', $file); 
            $nocountry = preg_replace('/-.*$/', '', $name); 
            $content = file_get_contents(LANG_PATH . $file);
            $lang_strings = json_decode($content, true);
            $lang_array[strtolower($lang_strings["lang"])] = array("lang-name" => $lang_strings["lang-name"], "flag" => $lang_strings["flag"]);
            $lang_nocountry_array[strtolower($nocountry)] = strtolower($lang_strings["lang"]);
        }
    }
    $content = NULL;
    $lang_strings = NULL;
    closedir($handle);
}
asort($lang_array);

// look through sorted list and use first one that matches our languages
foreach ($langs as $lang => $val) {
  $lang = strtolower($lang);
  if ($lang_array[$lang]) {
    defined('LANGUAGE') or define('LANGUAGE', $lang);
  } else if ($lang_nocountry_array[$lang]) {
    defined('LANGUAGE') or define('LANGUAGE', $lang_nocountry_array[$lang]);
  }
}

//if no suitable languages were found, set LANGUAGE to english (us)
defined('LANGUAGE') or define('LANGUAGE', "en-us");

static $translations = NULL;

/* If no instance of $translations has occured load the language file */
if (is_null($translations)) {
    $lang_file = LANG_PATH . LANGUAGE . '.json';
    if (!file_exists($lang_file)) {
        $lang_file = LANG_PATH . 'en-us.json';
    }
    $lang_file_content = file_get_contents($lang_file);
    /* Load the language file as a JSON object and transform it into an associative array */
    $translations = json_decode($lang_file_content, true);
}

/**
* Load the proper language file and return the translated phrase
*
* The language file is JSON encoded and returns an associative array
* Language filename is determined by BCP 47 + RFC 4646
* http://www.rfc-editor.org/rfc/bcp/bcp47.txt
*
* @param string $phrase The phrase that needs to be translated
* @return string
*/
function localize($phrase) {
    global $translations;
    /* Static keyword is used to ensure the file is loaded only once */
    if ($translations[$phrase])
      return $translations[$phrase];
    else
      return $phrase;
}

function localizeJavascript() {
    global $translations;
    /* Static keyword is used to ensure the file is loaded only once */
    $javascript_translation = $translations[JAVASCRIPT_MESSAGES];
    $javascript_messages = "Staminia.JAVASCRIPT_MESSAGES = { ";
    foreach ($javascript_translation as $func => $message) {
      $javascript_messages = $javascript_messages . strtolower($func) . ": Staminia.format(\"" . addslashes($message) . "\"), ";
    }
    return $javascript_messages . " };";
}

$localizedSkills = array(localize("non-existent"), localize("disastrous"), localize("wretched"), localize("poor"), localize("weak"),
                  localize("inadequate"), localize("passable"), localize("solid"), localize("excellent"),
                  localize("formidable"), localize("outstanding"), localize("brilliant"), localize("magnificent"),
                  localize("world class"), localize("supernatural"), localize("titanic"), localize("extra-terrestrial"),
                  localize("mythical"), localize("magical"), localize("utopian"), localize("divine"));

$italianFacts = array(
    "Italians are grrrrreat!",
    "Spaghetti, pizza and mandolino!",
    "Italians sing",
    "Italians always eat pasta",
    "Italians always eat pizza",
    "Italy's economy is based on art",
    "Italians live for football",
    "Italians drink a lot of coffee",
    "Italians are poor",
    "Italians don't work",
    "Italians are always late",
    "Italians gesticulate",
    "Italians have large families",
    "Italians are carpetbaggers",
    "Apulians - The Pugliesi are said to be proud and ironic opportunists",
    "Calabrians - People from Calabria are considered mistrustful and stubborn",
    "Genoeses - People from Genoa are said to be 'tirchi' (stingy)",
    "Lucani - People from Basilicata are considered stubborn",
    "Milaneses - People from Milan are renowned for being arrogant, cold and efficient in the working world",
    "Neapolitans - people from Naples are considered noisy, superstitious and good at cooking pizza",
    "Piedmonteses - There is an Italian saying referring to people coming from Piedmont: 'Piemontese falso e cortese', which means Piedmontese false and kind",
    "Romagnoles - People from Romagna are famous for being passionate, greedy and fighters",
    "Romans - Two adjectives are often attributed to people from Rome: noisy and 'burini' (boorish)",
    "Sardinians - They are said to be proud, farmers and stubborn",
    "Sicilians - People from Sicily are labeled as 'omertosi', meaning that they don't talk especially when it comes to denouncing offenses. Sicilians are also famous for their jealousy",
    "Tuscans - They are called 'mangiafagioli' (bean eaters) and they're known for loving nature",
    "Umbrians - They are associated with kindness and reserve",
    "Veneti - People from Veneto are said to be heavy drinkers and not patriotic at all"
);

//$WARNING = "WARNING: ";
?>
