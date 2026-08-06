<?php

/**
 * Registriert das CKEditor-Plugin als ES6-Modul in der Importmap des Backends.
 */
return [
    'dependencies' => ['backend'],
    'tags' => [
        'backend.form',
    ],
    'imports' => [
        '@hauerheinrich/hh-ckeditor-font/' => 'EXT:hh_ckeditor_font/Resources/Public/JavaScript/',
    ],
];
