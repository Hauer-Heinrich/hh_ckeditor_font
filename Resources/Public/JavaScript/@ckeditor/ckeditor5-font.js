/**
 * CKEditor5 Font Family Plugin - YAML Preprocessor für TYPO3
 * 
 * Konvertiert type: zu name: BEVOR CKEditor5 die Config parst
 * und behebt auch das Title-Problem im Dropdown
 * 
 * Konfiguration in rte_theme.yaml:
 * 
 * fontFamily:
 *   options:
 *     - 'default'
 *     - title: 'Moulin Web'
 *       model: 'moulin-web'
 *       view:
 *         name: 'span'
 *         classes: 'font-moulin-web'
 */

(function() {
    'use strict';

    // Speichere die ursprüngliche TYPO3 Config
    const originalTYPO3 = window.TYPO3;
    
    if (!originalTYPO3 || !originalTYPO3.settings) {
        console.warn('[FontFamily Patch] TYPO3 settings not found');
        return;
    }

    /**
     * Konvertiert type: zu name: in der fontFamily Config
     */
    function convertTypeToName(config) {
        if (!config || !config.fontFamily || !config.fontFamily.options) {
        return config;
        }

        const options = config.fontFamily.options || [];
        const convertedOptions = options.map(option => {
        // Nur komplexe Optionen mit view-Property verarbeiten
        if (typeof option === 'object' && option.view && option.view.type) {
            return {
            ...option,
            view: {
                ...option.view,
                name: option.view.type,  // Konvertiere type zu name
                type: undefined           // Lösche type
            }
            };
        }
        return option;
        });

        return {
        ...config,
        fontFamily: {
            ...config.fontFamily,
            options: convertedOptions
        }
        };
    }

    /**
     * Fügt title Property zu Dropdown-Optionen hinzu wenn label vorhanden
     */
    function ensureTitleProperty(config) {
        if (!config || !config.fontFamily || !config.fontFamily.options) {
        return config;
        }

        const options = config.fontFamily.options || [];
        const enhancedOptions = options.map(option => {
        // Nur komplexe Optionen mit label verarbeiten
        if (typeof option === 'object' && option.label && !option.title) {
            return {
            ...option,
            title: option.label  // Nutze label als title für Anzeige
            };
        }
        return option;
        });

        return {
        ...config,
        fontFamily: {
            ...config.fontFamily,
            options: enhancedOptions
        }
        };
    }

    /**
     * Patch alle RTE Editor Konfigurationen
     */
    function patchAllRTEConfigs() {
        try {
        // TYPO3 11/12 - settings.RTE
        if (window.TYPO3 && window.TYPO3.settings && window.TYPO3.settings.RTE) {
            const rteConfig = window.TYPO3.settings.RTE;
            
            // Durchsuche alle preset configs
            if (rteConfig.config && typeof rteConfig.config === 'object') {
            for (const presetKey in rteConfig.config) {
                if (rteConfig.config[presetKey] && rteConfig.config[presetKey].editor) {
                const editorConfig = rteConfig.config[presetKey].editor;
                
                if (editorConfig.config) {
                    // Konvertiere type zu name
                    editorConfig.config = convertTypeToName(editorConfig.config);
                    // Stelle sicher dass title gesetzt ist
                    editorConfig.config = ensureTitleProperty(editorConfig.config);
                }
                }
            }
            }
        }

        // Alternative: Direkter Editor Config (falls vorhanden)
        if (window.TYPO3 && window.TYPO3.settings && window.TYPO3.settings.editor) {
            window.TYPO3.settings.editor = convertTypeToName(window.TYPO3.settings.editor);
            window.TYPO3.settings.editor = ensureTitleProperty(window.TYPO3.settings.editor);
        }

        console.log('[FontFamily Patch] Configuration patched successfully');
        } catch (error) {
        console.error('[FontFamily Patch] Error patching config:', error);
        }
    }

    /**
     * Haupteinstieg
     */
    function init() {
        // Patch sofort wenn Skript geladen wird
        patchAllRTEConfigs();

        // Zusätzlich: Patch auch wenn CKEditor geladen wird (Fallback)
        if (window.CKEDITOR) {
        const originalCreate = window.CKEDITOR.create;
        if (typeof originalCreate === 'function') {
            window.CKEDITOR.create = function(...args) {
            patchAllRTEConfigs();
            return originalCreate.apply(this, args);
            };
        }
        }

        // Fallback: Patch bei Editor-Initialisierung
        document.addEventListener('ckeditorReady', function() {
        patchAllRTEConfigs();
        });
    }

    // Starte sofort
    init();

    // Exportiere für manuelle Nutzung
    window.TYPO3FontFamilyPatch = {
        convertTypeToName: convertTypeToName,
        ensureTitleProperty: ensureTitleProperty,
        patchAllRTEConfigs: patchAllRTEConfigs,
        version: '2.0'
    };

})();