<?php

/***************************************************************
 * Extension Manager/Repository config file for ext "hh_ckeditor_highlight".
 *
 * Auto generated 05-02-2026 11:08
 *
 * Manual updates:
 * Only the data in the array - everything else is removed by next
 * writing. "version" and "dependencies" must not be touched!
 ***************************************************************/

$EM_CONF[$_EXTKEY] = array (
  'title' => 'Hauer-Heinrich - ck_editor font plugin',
  'description' => 'Same as the original ck_editor font plugin but output "span"-tag instead of inline styles',
  'category' => 'plugin',
  'version' => '2.0.1',
  'state' => 'stable',
  'uploadfolder' => false,
  'clearcacheonload' => false,
  'author' => 'Martin Hofmann',
  'author_email' => 'web@hauer-heinrich.de',
  'author_company' => 'www.hauer-heinrich.de',
  'constraints' => 
  array (
    'depends' => 
    array (
      'typo3' => '13.4.0-13.4.99',
      'rte_ckeditor' => '13.4.0-13.4.99',
    ),
    'conflicts' => 
    array (
    ),
    'suggests' => 
    array (
    ),
  ),
);

