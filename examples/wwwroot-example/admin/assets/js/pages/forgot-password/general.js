"use strict";

(function () {
    const ForgotPasswordPage = {
        formValidator: null,
        message: {
            pageTitle: I18n.t("forgot_password", "PAGE_TITLE"),
            successTitle: I18n.t("common", "SUCCESS_TITLE"),
            failTitle: I18n.t("common", "FAIL_TITLE"),
        },
        init: function () {
            this.bindEvents();
            this.formValidator = new FormValidator({
                formSelector: "#kt_password_submit_form",
                handleSubmit: forgotPassword,
                rules: [
                    {
                        element: "#email_forgot_password",
                        rule: [
                            {
                                name: "required",
                                message: I18n.t("common", "REQUIRED", { field: "Email" })
                            },
                            {
                                name: "maxLength",
                                message: I18n.t("common", "TOO_LONG", { field: "Email", max: 500 }),
                                params: 500,
                                allowNullOrEmpty: true
                            },
                            {
                                name: "email",
                                message: I18n.t("common", "INVALID_FORMAT", { field: "Email" }),
                                allowNullOrEmpty: true
                            },
                        ]

                    },
                ]
            });
        },
        bindEvents: function () {

        }
    }

    async function forgotPassword() {
        const btnSubmit = $("#kt_forgot_password_submit");
        btnSubmit.attr("disabled", true);
        btnSubmit.attr("data-kt-indicator", "on");
        try {
            const data = {
                email: $("#email_forgot_password").val(),
            };
            const response = await httpService.postAsync(ApiRoutes.Auth.v1.ForgotPassword, data);
            if (response?.isSucceeded) {
                const resources = response?.resources;

                const title = `${ForgotPasswordPage.message.pageTitle} ${ForgotPasswordPage.message.successTitle.toLocaleLowerCase()}`;
                const text = I18n.t("forgot_password", "FORGET_DES", { name: resources?.toEmails });
                Swal.fire({
                    icon: "success",
                    title: title,
                    html: text,
                    ...AppSettings.sweetAlertOptions(false)
                }).then(function () {
                    window.location.href = "/forgot-password";
                })
            }
        } catch (e) {

            const { responseJSON } = e;
            const errorTitle = `${ForgotPasswordPage.message.pageTitle} ${ForgotPasswordPage.message.failTitle.toLocaleLowerCase()}`;
            const errorText = responseJSON?.message || I18n.t("common", "UNEXPECTED_ERROR");
            Swal.fire({
                icon: "error",
                title: errorTitle,
                html: errorText,
                ...AppSettings.sweetAlertOptions(false)
            });
        }
        finally {
            btnSubmit.removeAttr("data-kt-indicator");
            btnSubmit.removeAttr("disabled");
        }
    }

    // On document ready
    KTUtil.onDOMContentLoaded(function () {
        ForgotPasswordPage.init();
    });
})();