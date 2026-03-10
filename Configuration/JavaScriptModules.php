<?php

$extensionKey = 'hh_ckeditor_font';

return [
    'dependencies' => [
        'backend',
    ],
    'tags' => [
        'backend.form',
    ],
    'imports' => [
        '@HauerHeinrich/ckeditor5-font' => 'EXT:hh_ckeditor_font/Resources/Public/JavaScript/@ckeditor/ckeditor5-font.js',
    ],
];
