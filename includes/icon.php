<?php

function icon(string $name, string $class = ''): string
{
    $path = __DIR__ . '/../img/icons/' . basename($name) . '.svg';
    if (!is_file($path)) {
        return '';
    }
    $svg = file_get_contents($path);
    $attrs = 'class="si' . ($class !== '' ? ' ' . htmlspecialchars($class, ENT_QUOTES, 'UTF-8') : '') . '" aria-hidden="true"';
    $svg = preg_replace('/<svg\b/', '<svg ' . $attrs, $svg, 1);
    return $svg;
}
