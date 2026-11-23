<?php

/**
 * Fails when the app or its PHT dependency emits any notice, warning or
 * deprecation on the PHP version running this script, or when an endpoint
 * answers with something that is not the expected payload.
 *
 * The point is to catch problems that PHP otherwise only shows in a browser:
 * a notice printed before a JSON body breaks the client exactly like an error.
 *
 * usage: php scripts/php-smoke.php
 */

error_reporting(E_ALL);
ini_set('display_errors', '0');

$root = dirname(__DIR__);
$problems = [];

set_error_handler(function ($no, $str, $file, $line) use ($root, &$problems) {
    $caught = E_DEPRECATED | E_USER_DEPRECATED | E_NOTICE | E_USER_NOTICE | E_WARNING | E_USER_WARNING;
    if (($no & $caught) === 0) {
        return false;
    }
    $problems[] = sprintf('%s in %s:%d', $str, str_replace($root . '/', '', $file), $line);
    return true;
});

require $root . '/vendor/autoload.php';

// 1. Loading every class catches deprecations emitted while the class is declared.
$loaded = 0;
$iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($root . '/vendor/jetwitaussi/pht/PHT'));
foreach ($iterator as $file) {
    if ($file->isFile() && $file->getExtension() === 'php') {
        $source = file_get_contents($file->getPathname());
        if (preg_match('/^namespace\s+([^;]+);/m', $source, $ns)
            && preg_match('/^(?:abstract\s+|final\s+)?(?:class|interface|trait)\s+(\w+)/m', $source, $class)) {
            class_exists($ns[1] . '\\' . $class[1]) || interface_exists($ns[1] . '\\' . $class[1]);
            $loaded++;
        }
    }
}

// 2. The parsing paths a browser test reaches only with a real Hattrick session.
$valid = '<?xml version="1.0"?><HattrickData><FileName>ok.xml</FileName><Team><TeamID>1</TeamID></Team></HattrickData>';
\PHT\Network\Request::checkXmlData($valid, 200);
try {
    \PHT\Network\Request::checkXmlData('not xml', 200);
    $problems[] = 'checkXmlData accepted invalid XML';
} catch (\PHT\Exception\NetworkException $e) {
}

$dom = new \DOMDocument('1.0', 'UTF-8');
$dom->loadXML('<HattrickData><Team><TeamID>1</TeamID></Team><Team><TeamID>2</TeamID></Team></HattrickData>');
foreach (new \PHT\Utils\XmlIterator($dom->getElementsByTagName('Team'), 'PHT\Xml\World\Country') as $country) {
    $country instanceof \PHT\Xml\World\Country || $problems[] = 'XmlIterator yielded an unexpected object';
}
\PHT\Network\Request::urlencodeRfc3986(['a b', 'c~d', 0, null]);
\PHT\Utils\Date::convert('2026-11-04 10:00:00', 'Y-m-d');

// 3. Endpoints must answer with their payload and never with a notice in front of it.
$port = 30000 + getmypid() % 5000;
$command = sprintf('%s -S 127.0.0.1:%d -t %s', escapeshellarg(PHP_BINARY), $port, escapeshellarg($root));
$server = proc_open($command, [1 => ['file', '/dev/null', 'w'], 2 => ['file', '/dev/null', 'w']], $pipes);
if (!is_resource($server)) {
    $problems[] = 'unable to start the built-in web server';
} else {
    usleep(700000);
    // A real request through PHT so the curl handle lifecycle is exercised too.
    \PHT\Network\Request::fetchUrl('http://127.0.0.1:' . $port . '/', false);
    $endpoints = ['chpp/chpp_retrievedata.php' => 'json', 'chpp/chpp_callback.php' => 'redirect', 'chpp/chpp_revokeauth.php' => 'redirect', 'index.php' => 'html'];
    $context = stream_context_create(['http' => ['follow_location' => 0, 'ignore_errors' => true, 'timeout' => 5]]);
    foreach ($endpoints as $path => $kind) {
        $body = @file_get_contents('http://127.0.0.1:' . $port . '/' . $path, false, $context);
        if ($body === false) {
            $problems[] = $path . ': no response';
            continue;
        }
        foreach (['Deprecated:', 'Warning:', 'Notice:'] as $needle) {
            strpos($body, $needle) === false || $problems[] = $path . ': response contains "' . $needle . '"';
        }
        if ($kind === 'json' && json_decode($body, true) === null) {
            $problems[] = $path . ': response is not valid JSON (' . substr($body, 0, 80) . ')';
        }
    }
    proc_terminate($server);
    proc_close($server);
}

printf("PHP %s, %d classes loaded, 4 endpoints checked, 1 PHT request\n", PHP_VERSION, $loaded);
if ($problems) {
    echo "SMOKE FAILED\n";
    foreach (array_unique($problems) as $problem) {
        echo '  - ', $problem, "\n";
    }
    exit(1);
}
echo "SMOKE OK\n";
