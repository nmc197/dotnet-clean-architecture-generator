"use strict";

/**
 * FormValidator class provides client-side validation for HTML forms.
 * It supports multiple types of validation rules and custom error display modes.
 */
class FormValidator {
    constructor({ formSelector, rules, handleSubmit, renderError, errorDisplayMode = "inline" }) {
        this.form = document.querySelector(formSelector);
        this.rules = rules || [];
        this.handleSubmit = handleSubmit;
        this.renderError = renderError || this.defaultRenderError;
        this.errorDisplayMode = errorDisplayMode;
        this.touchedFields = new Set();

        this.form?.addEventListener("submit", (e) => {
            e.preventDefault();
            this.clearErrors();
            const result = this.validate();
            if (result.isValid && this.handleSubmit) {
                this.handleSubmit();
            } else {
                this.displayErrors(result.errorMessages);
                const firstError = result.errorMessages[0];
                if (firstError?.element) {
                    firstError.element.scrollIntoView({ behavior: "smooth", block: "center" });
                    firstError.element.focus({ preventScroll: true });
                }
            }
        });

        this.rules.forEach(({ element }) => {
            const el = document.querySelector(element);
            //const targetEl = target ? el.parentNode.querySelector(target) : el;
            if (el) {
                const isSelect2 = el.hasAttribute("data-select2-id");
                el.addEventListener("blur", () => {
                    this.touchedFields.add(el);
                    this.validateAndRenderSingle(el);
                });

                el.addEventListener("input", () => {
                    if (this.touchedFields.has(el)) {
                        this.validateAndRenderSingle(el);
                    }
                });

                el.addEventListener("change", () => {
                    if (this.touchedFields.has(el)) {
                        this.validateAndRenderSingle(el);
                    }
                });

                // Detect Select2 by data-select2-id attribute and bind via jQuery
                if (isSelect2 && window.jQuery && window.jQuery.fn.select2) {
                    window.jQuery(el).on("change", () => {
                        if (this.touchedFields.size) {
                            this.touchedFields.add(el);
                            this.validateAndRenderSingle(el);
                        }
                    });

                    window.jQuery(el).on("select2:open", () => {
                        this.touchedFields.add(el);
                    });

                    window.jQuery(el).on("select2:close", () => {
                        if (this.touchedFields.has(el)) {
                            this.validateAndRenderSingle(el);
                        }
                    });
                }
            }
        });
    }

    getElementValue(el) {
        if (el.type === "checkbox") {
            return el.checked ? el.value : "";
        } else if (el.type === "radio") {
            const checked = this.form.querySelector(`input[name="${el.name}"]:checked`);
            return checked ? checked.value : "";
        }
        return el.value?.trim() || "";
    }

    validate() {
        const result = { isValid: true, errorMessages: [] };

        this.rules.forEach(({ element, rule }) => {
            const el = document.querySelector(element);
            if (!el) return;
            const messages = [];
            for (const { name, params, message, allowNullOrEmpty } of rule) {
                if (!this.runValidationRule(el, name, params, allowNullOrEmpty)) {
                    messages.push(message ?? "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại trường này.");
                }
            }
            if (messages.length > 0)
                result.errorMessages.push({
                    element: el,
                    messages
                })
        });

        result.isValid = result.errorMessages.length === 0;
        return result;
    }

    validateAndRenderSingle(el) {
        const rulesForElement = this.rules.find((r) => document.querySelector(r.element) === el);
        if (!rulesForElement) return;

        this.clearSingleError(el);
        const messages = [];
        for (const { name, params, message, allowNullOrEmpty } of rulesForElement.rule) {
            if (!this.runValidationRule(el, name, params, allowNullOrEmpty)) {
                messages.push(message);
            }
        }
        if (messages.length > 0) {
            const fullMessage = messages.map((m) => `<div>${m}</div>`).join("");
            this.renderError(el, fullMessage, this.errorDisplayMode);
        }
    }

    runValidationRule(el, name, params, allowNullOrEmpty) {
        const val = this.getElementValue(el);
        switch (name) {
            case "required":
                return val.length > 0;
            case "minLength":
                return allowNullOrEmpty && !val ? true : val.length >= params;
            case "maxLength":
                return allowNullOrEmpty && !val ? true : val.length <= params;
            case "rangeLength":
                return allowNullOrEmpty && !val ? true : val.length >= params[0] && val.length <= params[1];
            case "min":
                return allowNullOrEmpty && !val ? true : parseFloat(val) >= params;
            case "max":
                return allowNullOrEmpty && !val ? true : parseFloat(val) <= params;
            case "range":
                return allowNullOrEmpty && !val ? true : parseFloat(val) >= params[0] && parseFloat(val) <= params[1];
            case "email":
                return allowNullOrEmpty && !val ? true : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
            case "phone":
                return allowNullOrEmpty && !val ? true : /^(\+84|84|0)(3|5|7|8|9|1[2689])[0-9]{8}$/.test(val);
            case "vietnamPhone":
                return allowNullOrEmpty && !val
                    ? true
                    : /^(\+84|84|0)((3[2-9]|5[25689]|7[06-9]|8[1-689]|9[0-46-9])[0-9]{7}|2[0-9]{9})$/.test(val);
            case "url":
                return allowNullOrEmpty && !val ? true : /^https?:\/\/[\w\-]+(\.[\w\-]+)+[/#?]?.*$/.test(val);
            case "date":
                return allowNullOrEmpty && !val ? true : moment(val, params).isValid();
            case "number":
                return allowNullOrEmpty && !val ? true : !isNaN(parseFloat(val));
            case "digits":
                return allowNullOrEmpty && !val ? true : /^\d+$/.test(val);
            case "equalTo": {
                const otherEl = document.querySelector(params);
                return otherEl ? val === this.getElementValue(otherEl) : false;
            }
            case "notEqualTo": {
                const diffEl = document.querySelector(params);
                return diffEl ? val !== this.getElementValue(diffEl) : true;
            }
            case "customRegex":
                return allowNullOrEmpty && !val ? true : new RegExp(params).test(val);
            case "customFunction":
                return typeof params === "function" ? params(el) : true;
            case "image":
                return val.length > 0;
            default:
                return true;
        }
    }

    displayErrors(errors) {
        this.lastErrors = errors;
        errors.forEach(({ element, messages }) => {
            const fullMessage = messages.map((m) => `<div>${m}</div>`).join("");
            this.renderError(element, fullMessage, this.errorDisplayMode);
        });

        if (this.errorDisplayMode === "alert" && typeof Swal !== "undefined") {
            const html = `<ul>${errors.map((e) => `<li class="text-start">${e.message}</li>`).join("")}</ul>`;
            Swal.fire({
                icon: "warning",
                title: I18n.t("common", "VALIDATION_ERROR"),
                html: html,
                ...AppSettings.sweetAlertOptions(false)
            });
        }
    }

    defaultRenderError(element, message, mode = "inline") {
        element.classList.add("is-invalid");
        let errorNode = element.nextElementSibling;
        //const rule = this.rules.find(r => document.querySelector(r.element) === element);
        const isSelect2 = element.hasAttribute("data-select2-id");
        const target = isSelect2 ? element.nextElementSibling || element : element;
        if (isSelect2) {
            target.querySelector(".select2-selection")?.classList.add("is-invalid");
        }
        if (mode === "tooltip") {
            element.setAttribute("title", message);
            element.classList.add("has-tooltip-error");
            return;
        }

        if (mode === "alert") {
            return;
        }

        if (!errorNode || !errorNode.classList.contains("invalid-feedback")) {
            errorNode = document.createElement("div");
            errorNode.className = "invalid-feedback";
            /*element.parentNode.insertBefore(errorNode, target.nextSibling);*/
            target.after(errorNode);
        }
        errorNode.innerHTML = message;
    }

    clearErrors() {
        this.touchedFields.clear();
        this.form.querySelectorAll('.is-invalid').forEach((el) => el.classList.remove("is-invalid"));
        this.form.querySelectorAll('.has-tooltip-error').forEach((el) => el.removeAttribute("title"));
        this.form.querySelectorAll('.invalid-feedback').forEach((el) => el.remove());
    }

    clearSingleError(element) {
        element.classList.remove("is-invalid");
        element.removeAttribute("title");
        const next = element.nextElementSibling;
        if (next && next.classList.contains("invalid-feedback")) {
            next.remove();
        }
        const isSelect2 = element.hasAttribute("data-select2-id");
        if (isSelect2 && next) {
            next.querySelector(".select2-selection")?.classList?.remove("is-invalid");
            const invalidEl = next.nextElementSibling;
            if (invalidEl)
                invalidEl.remove();
        }
        //else {
        //    const invalidEl = element.parentNode.querySelector(".invalid-feedback");
        //    if (invalidEl)
        //        invalidEl.remove();
        //}
    }
}
