# hh_ckeditor_highlight
hh_ckeditor_highlight is a TYPO3 extension.
Same as the original ck_editor highlight plugin but output 'span'-tag instead of 'mark'.

### Installation
... like any other TYPO3 extension [extensions.typo3.org](https://extensions.typo3.org/ "TYPO3 Extension Repository")
Don't forget to include the PageTS -> backend->rootPage->site configuration->resources!

### Configuration
See [example](Configuration/RTE/example.yaml)
You have the additional option "type": "span" to render a HTML-tag "span" element instead of original "mark"-tag.

```
- { model: 'brandSpan', class: 'color-brand', title: 'Color Brand (span)', color: '#4DAF2E', type: 'span' }
```

[GitHub Issue](https://github.com/ckeditor/ckeditor5/issues/6557#issuecomment-3132239802 "GitHub Issue")

### Development

Want to contribute? Great!

##### Copyright notice

This repository is part of the TYPO3 project. The TYPO3 project is
free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 2 of the License, or
(at your option) any later version.

The GNU General Public License can be found at
http://www.gnu.org/copyleft/gpl.html.

This repository is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

This copyright notice MUST APPEAR in all copies of the repository!

##### License
----
GNU GENERAL PUBLIC LICENSE Version 3
