"use strict";
//(function () {
//    window.
//})();

/**
 * @typedef {Object} I18nService
 * @property {string} currentLang
 * @property {(lang: string) => void} setLang
 * @property {(moduleName: string, messageObj: Object) => void} load
 * @property {(moduleName: string, key: string, params?: Object) => string} t
 */

const I18n = {

    currentLang: currentLang || "vi",
    /**
     * 
     * @param {string} lang
     */
    setLang(lang) {
        this.currentLang = lang;
    },

    /**
     * Load message for module
     * @param {string} moduleName
     * @param {object} messageObj
     */
    load(moduleName, messageObj) {
        if (!I18n.modules) I18n.modules = {};
        I18n.modules[moduleName] = messageObj;
    },

    /**
     * Translate text by key and parameters
     * @param {string} moduleName
     * @param {string} key
     * @param {object} params 
     * @returns {string} 
     */
    t(moduleName, key, params = {}) {
        const messages = I18n.modules?.[moduleName]?.[this.currentLang];
        let text = messages?.[key] || `[${moduleName}.${key}]`;

        for (const k in params) {
            text = text.replace(`{${k}}`, params[k]);
        }

        return text;
    }
};