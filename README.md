# RTE Palette Buttons (TYPO3 v13)

CKEditor-5-Erweiterung für TYPO3 v13, die drei **optionale** Toolbar-Buttons
bereitstellt – alle **klassenbasiert** (es werden `<span class="...">`-Elemente
erzeugt, keine Inline-Styles):

| Toolbar-Item             | Funktion                                        |
| ------------------------ | ----------------------------------------------- |
| `fontColorBtn`           | Schriftfarben-Palette (ohne Colorpicker)        |
| `fontBackgroundColorBtn` | Hintergrundfarben-Palette (ohne Colorpicker)    |
| `fontFamilyBtn`          | Schriftarten-Auswahl                            |

Welche Buttons erscheinen und welche Farben / Schriftarten / CSS-Klassen zur
Auswahl stehen, wird vollständig über die **RTE-YAML-Konfiguration** gesteuert.

## Installation

**Composer-Mode** – z. B. als lokales Package (Pfad ggf. anpassen):

```json
"repositories": [
    { "type": "path", "url": "packages/*" }
]
```

```bash
composer require hauerheinrich/hh-ckeditor-font:@dev
```

**Classic-Mode:** Ordner nach `typo3conf/ext/hh_ckeditor_font` kopieren und
die Extension im Extension Manager aktivieren.

Danach in beiden Fällen: Caches leeren (`vendor/bin/typo3 cache:flush`).

## Schnellstart

Die Extension bringt ein fertiges Beispiel-Preset `paletteButtons` mit.
Aktivierung via Page TSconfig:

```tsconfig
RTE.default.preset = paletteButtons
```

## Integration in ein eigenes Preset

In das eigene RTE-YAML übernehmen (jeder Button ist optional – einfach den
Config-Block und den Toolbar-Eintrag weglassen):

```yaml
editor:
  config:
    importModules:
      - {
          module: '@hauerheinrich/hh-ckeditor-font/palette-buttons.min.js',
          exports: [ 'FontColorBtn', 'FontBackgroundColorBtn', 'FontFamilyBtn' ]
        }

    toolbar:
      items:
        - fontColorBtn
        - fontBackgroundColorBtn
        - fontFamilyBtn

    fontColorBtn:
      colors:
        - { classes: ['color-primary'], label: 'Color primary', color: '#F8F213' }
        - { classes: ['color-secondary'], label: 'Color secondary', color: '#0AA1DD' }

    fontBackgroundColorBtn:
      colors:
        - { classes: ['background-color-primary'], label: 'Color primary', color: '#F8F213' }
        - { classes: ['background-color-secondary'], label: 'Color secondary', color: '#0AA1DD' }

    fontFamilyBtn:
      fonts:
        - { classes: ['font-sans'], label: 'Sans-Serif', fontFamily: 'Arial, sans-serif' }
        - { classes: ['font-serif'], label: 'Serif', fontFamily: 'Georgia, serif' }
```

Tipp: Wer nur einen einzelnen Button möchte, listet in `exports` nur das
jeweilige Plugin (z. B. `exports: [ 'FontColorBtn' ]`). Alternativ steht auch
das Sammel-Plugin `PaletteButtons` als Export zur Verfügung.

## Konfigurationsreferenz

### `fontColorBtn` / `fontBackgroundColorBtn`

| Option        | Typ     | Default                    | Beschreibung |
| ------------- | ------- | -------------------------- | ------------ |
| `colors`      | Liste   | `[]`                       | Paletten-Einträge, siehe unten |
| `label`       | String  | „Schriftfarbe" / „Hintergrundfarbe" | Tooltip / Label des Toolbar-Buttons |
| `removeLabel` | String  | „… entfernen"              | Beschriftung des Entfernen-Buttons im Dropdown |
| `columns`     | Integer | `5`                        | Spalten der Farbpalette |
| `colorPicker` | Boolean | `false`                    | Optionalen Colorpicker unter der Palette anzeigen (siehe Hinweis unten) |

Paletten-Eintrag (`colors`):

| Feld      | Typ            | Beschreibung |
| --------- | -------------- | ------------ |
| `classes` | Liste / String | CSS-Klasse(n), die auf das `<span>` gesetzt werden |
| `label`   | String         | Tooltip der Kachel |
| `color`   | String         | Anzeigefarbe der Kachel in der Palette (rein visuell, z. B. `#F8F213`) |
| `border`  | Boolean        | Rahmen um die Kachel (Default `true`, hilfreich bei hellen Farben) |

### `fontFamilyBtn`

| Option         | Typ    | Default      | Beschreibung |
| -------------- | ------ | ------------ | ------------ |
| `fonts`        | Liste  | `[]`         | Einträge mit `classes`, `label` und optional `fontFamily` (nur als Tooltip genutzt) |
| `label`        | String | „Schriftart" | Label des Toolbar-Buttons |
| `defaultLabel` | String | „Standard"   | Beschriftung des Eintrags, der die Klasse entfernt |

## Erzeugtes Markup

```html
<p>Text mit <span class="color-primary">farbigem</span> und
<span class="background-color-primary">hinterlegtem</span> Inhalt in
<span class="font-serif">Serifenschrift</span>.</p>
```

Die Attribute sind kombinierbar (verschachtelte Spans), werden vom
„Formatierung entfernen"-Button (`removeFormat`) mit gelöscht und beim
erneuten Öffnen des Editors korrekt wiedererkannt (Upcast).

## Wichtige Hinweise

1. **Backend-Vorschau:** Damit die Klassen im Editor sichtbar sind, muss das
   CSS via `editor.config.contentsCss` geladen werden (siehe Beispiel-Preset;
   dabei die Core-Datei `EXT:rte_ckeditor/Resources/Public/Css/contents.css`
   mit angeben, da `contentsCss` die Default-Liste ersetzt).

2. **Frontend:** Die Klassen müssen im Frontend-CSS des Sitepackages definiert
   sein, z. B. durch Einbinden von
   `Resources/Public/Css/palette-example.css` (oder besser: eigene Datei):

   ```typoscript
   page.includeCSS.rtePalette = EXT:hh_ckeditor_font/Resources/Public/Css/palette-example.css
   ```

3. **Optionaler Colorpicker (`colorPicker: true`):** Frei gewählte Farben
   lassen sich naturgemäß nicht auf CSS-Klassen abbilden – der Picker setzt
   daher Inline-Styles (`<span style="color: …">`). Falls Inline-Styles beim
   Speichern oder bei der Frontend-Ausgabe entfernt werden, muss die
   Processing-/parseFunc-Konfiguration der Installation entsprechend
   angepasst werden. Für rein klassenbasiertes Arbeiten die Option einfach
   auf `false` lassen (Default).

4. **Optionalität:** Ist ein Config-Block (z. B. `fontFamilyBtn`) nicht
   vorhanden, registriert das zugehörige Plugin nichts. Der Toolbar-Eintrag
   sollte dann ebenfalls entfernt werden, sonst loggt CKEditor eine Warnung
   in der Browser-Konsole.

5. **Modulname:** Der Importmap-Prefix `@hauerheinrich/hh-ckeditor-font/` kann
   in `Configuration/JavaScriptModules.php` und im YAML angepasst werden.
