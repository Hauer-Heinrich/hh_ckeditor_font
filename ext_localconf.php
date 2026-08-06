<?php

defined('TYPO3') or die();

// Beispiel-Preset registrieren. Aktivierung via Page TSconfig:
//   RTE.default.preset = paletteButtons
$GLOBALS['TYPO3_CONF_VARS']['RTE']['Presets']['paletteButtons'] = 'EXT:hh_ckeditor_font/Configuration/RTE/PaletteButtons.yaml';
