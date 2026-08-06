/**
 * CKEditor 5 plugins for TYPO3 v13
 *
 *  - FontColorBtn           -> toolbar item "fontColorBtn"
 *  - FontBackgroundColorBtn -> toolbar item "fontBackgroundColorBtn"
 *  - FontFamilyBtn          -> toolbar item "fontFamilyBtn"
 *
 * Alle drei Buttons arbeiten klassenbasiert: Bei einer Auswahl wird ein
 * <span class="..."> um den selektierten Text gelegt. Die Paletten (Farben,
 * Schriftarten, Labels und CSS-Klassen) werden vollstaendig ueber die
 * RTE-YAML-Konfiguration gesteuert, z. B.:
 *
 *   editor:
 *     config:
 *       fontColorBtn:
 *         colors:
 *           - { classes: ['color-primary'], label: 'Primaerfarbe', color: '#F8F213' }
 *
 * Optional kann pro Farb-Button ein echter Colorpicker aktiviert werden
 * (colorPicker: true). Dieser setzt dann Inline-Styles statt Klassen.
 */
import { Plugin, Command } from '@ckeditor/ckeditor5-core';
import * as UI from '@ckeditor/ckeditor5-ui';
import { Collection } from '@ckeditor/ckeditor5-utils';

const {
    ButtonView,
    ColorGridView,
    ColorTileView,
    createDropdown,
    addListToDropdown
} = UI;

// CKEditor >= 40 exportiert "ViewModel", aeltere Versionen "Model".
const ListItemModel = UI.ViewModel ?? UI.Model;

const ICONS = {
    fontColorBtn: '<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10.6 3.5h-1.2L5.2 13.4h1.9l.9-2.3h4l.9 2.3h1.9L10.6 3.5Zm-2 6 1.4-3.7 1.4 3.7H8.6Z"/><rect x="4.5" y="14.7" width="11" height="2.3" rx=".5"/></svg>',
    fontBackgroundColorBtn: '<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><rect x="2.8" y="2.8" width="14.4" height="14.4" rx="1.6" opacity=".22"/><path d="M10.6 5H9.4L6.2 13.5h1.7l.7-2h3l.7 2H14L10.6 5Zm-1.5 5 .9-2.6.9 2.6H9.1Z"/></svg>'
};

/* -------------------------------------------------------------------------
 * Helpers
 * ---------------------------------------------------------------------- */

function normalizeClasses(classes) {
    if (Array.isArray(classes)) {
        return classes.map(String).map(c => c.trim()).filter(Boolean);
    }
    if (typeof classes === 'string') {
        return classes.split(/\s+/).filter(Boolean);
    }
    return [];
}

/**
 * Normalisiert die YAML-Eintraege (colors / fonts) in ein einheitliches Format.
 */
function normalizeItems(rawItems) {
    return (rawItems || [])
        .map(item => {
            const classes = normalizeClasses(item.classes);
            return {
                classes,
                // Der Attributwert im Model = alle Klassen als String.
                value: classes.join(' '),
                label: item.label || classes.join(' '),
                color: item.color || null,
                fontFamily: item.fontFamily || null,
                border: item.border !== false
            };
        })
        .filter(item => item.classes.length > 0);
}

/* -------------------------------------------------------------------------
 * Command: setzt/entfernt ein Textattribut auf der aktuellen Selektion
 * ---------------------------------------------------------------------- */

class ClassAttributeCommand extends Command {
    constructor(editor, attributeName) {
        super(editor);
        this.attributeName = attributeName;
    }

    refresh() {
        const model = this.editor.model;
        const selection = model.document.selection;

        this.value = selection.getAttribute(this.attributeName) ?? null;
        this.isEnabled = model.schema.checkAttributeInSelection(selection, this.attributeName);
    }

    /**
     * @param {Object} options
     * @param {String|null} options.value Attributwert (null = entfernen)
     * @param {String[]} [options.clearAttributes] Weitere Attribute, die dabei entfernt werden
     */
    execute(options = {}) {
        const model = this.editor.model;
        const selection = model.document.selection;
        const value = options.value ?? null;
        const attributesToRemove = new Set([this.attributeName, ...(options.clearAttributes || [])]);

        model.change(writer => {
            if (selection.isCollapsed) {
                for (const attribute of attributesToRemove) {
                    writer.removeSelectionAttribute(attribute);
                }
                if (value) {
                    writer.setSelectionAttribute(this.attributeName, value);
                }
            } else {
                for (const attribute of attributesToRemove) {
                    for (const range of model.schema.getValidRanges(selection.getRanges(), attribute)) {
                        writer.removeAttribute(attribute, range);
                    }
                }
                if (value) {
                    for (const range of model.schema.getValidRanges(selection.getRanges(), this.attributeName)) {
                        writer.setAttribute(this.attributeName, value, range);
                    }
                }
            }
        });
    }
}

/* -------------------------------------------------------------------------
 * Schema + Konvertierung (Model-Attribut <-> <span class="...">)
 * ---------------------------------------------------------------------- */

function registerClassAttribute(editor, attributeName, items, priority) {
    const schema = editor.model.schema;

    schema.extend('$text', { allowAttributes: attributeName });
    schema.setAttributeProperties(attributeName, {
        isFormatting: true,
        copyOnEnter: true
    });

    // Model-Attribut -> <span class="...">
    editor.conversion.for('downcast').attributeToElement({
        model: attributeName,
        view: (value, { writer }) => writer.createAttributeElement('span', { class: value }, { priority })
    });

    // <span class="..."> -> Model-Attribut (pro konfiguriertem Eintrag)
    for (const item of items) {
        editor.conversion.for('upcast').elementToAttribute({
            view: { name: 'span', classes: item.classes },
            model: { key: attributeName, value: item.value }
        });
    }

    editor.commands.add(attributeName, new ClassAttributeCommand(editor, attributeName));
}

/**
 * Nur fuer den optionalen Colorpicker: Model-Attribut <-> <span style="...">
 */
function registerStyleAttribute(editor, attributeName, cssProperty, priority) {
    const schema = editor.model.schema;

    schema.extend('$text', { allowAttributes: attributeName });
    schema.setAttributeProperties(attributeName, {
        isFormatting: true,
        copyOnEnter: true
    });

    editor.conversion.for('downcast').attributeToElement({
        model: attributeName,
        view: (value, { writer }) => writer.createAttributeElement('span', { style: `${cssProperty}:${value}` }, { priority })
    });

    editor.conversion.for('upcast').elementToAttribute({
        view: { name: 'span', styles: { [cssProperty]: /[\s\S]+/ } },
        model: {
            key: attributeName,
            value: viewElement => viewElement.getStyle(cssProperty)
        }
    });

    editor.commands.add(attributeName, new ClassAttributeCommand(editor, attributeName));
}

/* -------------------------------------------------------------------------
 * UI: Farb-Dropdown (Palette + optionaler Colorpicker)
 * ---------------------------------------------------------------------- */

function registerColorFeature(editor, options) {
    const config = editor.config.get(options.configKey);

    // Button ist optional: ohne Konfiguration wird nichts registriert.
    if (!config) {
        return;
    }

    const items = normalizeItems(config.colors);
    const pickerEnabled = config.colorPicker === true;

    registerClassAttribute(editor, options.classAttribute, items, options.priority);

    if (pickerEnabled) {
        registerStyleAttribute(editor, options.styleAttribute, options.cssProperty, options.priority);
    }

    editor.ui.componentFactory.add(options.componentName, locale => {
        const dropdown = createDropdown(locale);
        const classCommand = editor.commands.get(options.classAttribute);
        const styleCommand = pickerEnabled ? editor.commands.get(options.styleAttribute) : null;

        dropdown.buttonView.set({
            label: config.label || options.defaultLabel,
            tooltip: true,
            icon: options.icon
        });

        dropdown.bind('isEnabled').to(classCommand, 'isEnabled');

        // createDropdown() bindet buttonView.isOn bereits an dropdown.isOpen.
        // Ein erneutes bind() wuerde "observable-bind-rebind" werfen, daher
        // zuerst loesen und dann kombiniert neu binden (offen ODER aktiv).
        dropdown.buttonView.unbind('isOn');

        if (styleCommand) {
            dropdown.buttonView
                .bind('isOn')
                .to(
                    dropdown, 'isOpen',
                    classCommand, 'value',
                    styleCommand, 'value',
                    (isOpen, classValue, styleValue) => isOpen || !!(classValue || styleValue)
                );
        } else {
            dropdown.buttonView
                .bind('isOn')
                .to(
                    dropdown, 'isOpen',
                    classCommand, 'value',
                    (isOpen, value) => isOpen || !!value
                );
        }

        // Panel-Inhalt erst beim ersten Oeffnen aufbauen.
        dropdown.once('change:isOpen', () => {
            // "Entfernen"-Button
            const removeButton = new ButtonView(locale);
            removeButton.set({
                label: config.removeLabel || options.defaultRemoveLabel,
                withText: true
            });
            removeButton.on('execute', () => {
                editor.execute(options.classAttribute, {
                    value: null,
                    clearAttributes: pickerEnabled ? [options.styleAttribute] : []
                });
                dropdown.isOpen = false;
                editor.editing.view.focus();
            });
            dropdown.panelView.children.add(removeButton);

            // Farbpalette
            if (items.length) {
                const grid = new ColorGridView(locale, {
                    columns: Math.max(1, Math.min(config.columns || 5, items.length))
                });

                for (const item of items) {
                    const tile = new ColorTileView(locale);
                    tile.set({
                        color: item.color,
                        label: item.label,
                        tooltip: true,
                        hasBorder: item.border
                    });
                    tile.bind('isOn').to(classCommand, 'value', value => value === item.value);
                    tile.on('execute', () => {
                        editor.execute(options.classAttribute, {
                            value: item.value,
                            clearAttributes: pickerEnabled ? [options.styleAttribute] : []
                        });
                        dropdown.isOpen = false;
                        editor.editing.view.focus();
                    });
                    grid.items.add(tile);
                }

                dropdown.panelView.children.add(grid);
            }

            // Optionaler Colorpicker (setzt Inline-Style statt Klasse)
            if (pickerEnabled && UI.ColorPickerView) {
                const picker = new UI.ColorPickerView(locale, { format: 'hex' });

                picker.on('colorSelected', (evt, data) => {
                    if (!data.color || data.color === styleCommand.value) {
                        return;
                    }
                    editor.execute(options.styleAttribute, {
                        value: data.color,
                        clearAttributes: [options.classAttribute]
                    });
                });

                dropdown.on('change:isOpen', (evt, name, isOpen) => {
                    if (isOpen && styleCommand.value) {
                        picker.color = styleCommand.value;
                    }
                });

                if (styleCommand.value) {
                    picker.color = styleCommand.value;
                }

                dropdown.panelView.children.add(picker);
            }
        });

        return dropdown;
    });
}

/* -------------------------------------------------------------------------
 * UI: Schriftarten-Dropdown (Liste)
 * ---------------------------------------------------------------------- */

function registerFontFamilyFeature(editor, options) {
    const config = editor.config.get(options.configKey);

    if (!config) {
        return;
    }

    const items = normalizeItems(config.fonts);

    registerClassAttribute(editor, options.classAttribute, items, options.priority);

    editor.ui.componentFactory.add(options.componentName, locale => {
        const dropdown = createDropdown(locale);
        const command = editor.commands.get(options.classAttribute);
        const buttonLabel = config.label || options.defaultLabel;
        const labelByValue = new Map(items.map(item => [item.value, item.label]));

        const definitions = new Collection();

        // "Standard"-Eintrag: entfernt die Schriftart-Klasse wieder.
        const defaultModel = new ListItemModel({
            label: config.defaultLabel || 'Standard',
            withText: true,
            commandValue: null
        });
        defaultModel.bind('isOn').to(command, 'value', value => !value);
        definitions.add({ type: 'button', model: defaultModel });
        definitions.add({ type: 'separator' });

        for (const item of items) {
            const model = new ListItemModel({
                label: item.label,
                withText: true,
                tooltip: item.fontFamily || false,
                commandValue: item.value
            });
            model.bind('isOn').to(command, 'value', value => value === item.value);
            definitions.add({ type: 'button', model });
        }

        addListToDropdown(dropdown, definitions);

        dropdown.buttonView.set({
            label: buttonLabel,
            tooltip: true,
            withText: true
        });

        // Button-Label zeigt die aktuell gesetzte Schriftart an.
        dropdown.buttonView
            .bind('label')
            .to(command, 'value', value => (value && labelByValue.get(value)) || buttonLabel);

        dropdown.bind('isEnabled').to(command, 'isEnabled');

        // Siehe Hinweis oben: isOn ist bereits an dropdown.isOpen gebunden.
        dropdown.buttonView.unbind('isOn');
        dropdown.buttonView
            .bind('isOn')
            .to(
                dropdown, 'isOpen',
                command, 'value',
                (isOpen, value) => isOpen || !!value
            );

        dropdown.on('execute', evt => {
            editor.execute(options.classAttribute, { value: evt.source.commandValue ?? null });
            editor.editing.view.focus();
        });

        return dropdown;
    });
}

/* -------------------------------------------------------------------------
 * Plugins
 * ---------------------------------------------------------------------- */

export class FontColorBtn extends Plugin {
    static pluginName = 'FontColorBtn';

    init() {
        registerColorFeature(this.editor, {
            componentName: 'fontColorBtn',
            configKey: 'fontColorBtn',
            classAttribute: 'fontColorClass',
            styleAttribute: 'fontColorStyle',
            cssProperty: 'color',
            priority: 6,
            icon: ICONS.fontColorBtn,
            defaultLabel: 'Schriftfarbe',
            defaultRemoveLabel: 'Schriftfarbe entfernen'
        });
    }
}

export class FontBackgroundColorBtn extends Plugin {
    static pluginName = 'FontBackgroundColorBtn';

    init() {
        registerColorFeature(this.editor, {
            componentName: 'fontBackgroundColorBtn',
            configKey: 'fontBackgroundColorBtn',
            classAttribute: 'fontBackgroundColorClass',
            styleAttribute: 'fontBackgroundColorStyle',
            cssProperty: 'background-color',
            priority: 7,
            icon: ICONS.fontBackgroundColorBtn,
            defaultLabel: 'Hintergrundfarbe',
            defaultRemoveLabel: 'Hintergrundfarbe entfernen'
        });
    }
}

export class FontFamilyBtn extends Plugin {
    static pluginName = 'FontFamilyBtn';

    init() {
        registerFontFamilyFeature(this.editor, {
            componentName: 'fontFamilyBtn',
            configKey: 'fontFamilyBtn',
            classAttribute: 'fontFamilyClass',
            priority: 8,
            defaultLabel: 'Schriftart'
        });
    }
}

/**
 * Convenience-Plugin, das alle drei Buttons laedt.
 * In der YAML-Konfiguration alternativ nutzbar:
 *   exports: [ 'PaletteButtons' ]
 */
export class PaletteButtons extends Plugin {
    static pluginName = 'PaletteButtons';

    static get requires() {
        return [FontColorBtn, FontBackgroundColorBtn, FontFamilyBtn];
    }
}
