<?php

$EM_CONF['hh_ckeditor_font'] = [
    'title' => 'Hauer-Heinrich - RTE Font Buttons',
    'description' => 'CKEditor 5 Font buttons for TYPO3 v13: class-based font color, font background color and font family pickers, fully configurable via RTE YAML.',
    'category' => 'plugin',
    'state' => 'stable',
    'uploadfolder' => false,
    'clearcacheonload' => true,
    'author' => 'Martin Hofmann, Christian Hackl',
    'author_email' => 'web@hauer-heinrich.de',
    'author_company' => 'www.hauer-heinrich.de',
    'version' => '2.1.0',
    'constraints' => [
        'depends' => [
            'typo3' => '13.4.0-13.4.99',
            'rte_ckeditor' => '13.4.0-13.4.99',
        ],
        'conflicts' => [
        ],
        'suggests' => [
        ],
    ],
];
