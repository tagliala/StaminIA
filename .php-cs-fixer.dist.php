<?php

$finder = (new PhpCsFixer\Finder())
    ->in(__DIR__)
    ->exclude('vendor')
    ->exclude('lib')
    ->exclude('node_modules');

return (new PhpCsFixer\Config())
    ->setRules([
        '@PER-CS' => true,
    ])
    ->setFinder($finder);
