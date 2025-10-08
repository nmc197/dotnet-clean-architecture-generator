"use strict";

(function () {
    const SignInPage = {
        formValidator: null,
        message: {
            pageTitle: I18n.t("sign_in", "PAGE_TITLE"),
            successTitle: I18n.t("common", "SUCCESS_TITLE"),
            failTitle: I18n.t("common", "FAIL_TITLE"),
        },
        init: function () {
            this.bindEvents();
            this.formValidator = new FormValidator({
                formSelector: "#kt_sign_in_form",
                handleSubmit: login,
                rules: [
                    {
                        element: "#user_name",
                        rule: [
                            {
                                name: "required",
                                message: I18n.t("common", "REQUIRED", { field: "Tên đăng nhập" })
                            }
                        ]

                    },
                    {
                        element: "#password",
                        rule: [
                            {
                                name: "required",
                                message: I18n.t("common", "REQUIRED", { field: "Mật khẩu" })
                            }
                        ]

                    }
                ]
            });
        },
        bindEvents: function () {
            this.bindShowHidePassword();
        },
        bindShowHidePassword: function () {
            $('.toggle-password').on("click", function () {
                const inputSelector = $(this).data('target');
                const $input = $(inputSelector);
                const $icon = $(this).find('.toggle-icon');

                if ($input.attr('type') === 'password') {
                    $input.attr('type', 'text');
                    $icon
                        .removeClass('ki-eye')
                        .addClass('ki-eye-slash')
                        .html(`
                      <span class="path1"></span>
                      <span class="path2"></span>
                      <span class="path3"></span>
                      <span class="path4"></span>
                    `);
                } else {
                    $input.attr('type', 'password');
                    $icon
                        .removeClass('ki-eye-slash')
                        .addClass('ki-eye')
                        .html(`
                      <span class="path1"></span>
                      <span class="path2"></span>
                      <span class="path3"></span>
                    `);
                }
            })
        }
    }

    async function login() {
        const btnLogin = $("#kt_sign_in_submit");
        btnLogin.attr("disabled", true);
        btnLogin.attr("data-kt-indicator", "on");
        try {
            const data = {
                username: $("#user_name").val(),
                password: $("#password").val()
            };
            const response = await httpService.postAsync(ApiRoutes.Auth.v1.Login, data);
            if (response?.isSucceeded) {
                const resources = response?.resources;
                TokenService.setUserInfo(resources);

                const title = `${SignInPage.message.pageTitle} ${SignInPage.message.successTitle.toLocaleLowerCase()}`;
                const text = I18n.t("sign_in", "WELCOME", { name: resources?.userInfo.fullName });
                const menus = resources.userInfo?.menus || [];
                if (menus.length > 0) {
                    Swal.fire({
                        icon: "success",
                        title: title,
                        html: text,
                        ...AppSettings.sweetAlertOptions(false)
                    }).then(function () {
                        const url = menus[0].child.length > 0 ? menus[0].child[0].url : menus[0].url;
                        window.location.href = url;
                    })
                }
                else {
                    Swal.fire({
                        icon: "error",
                        title: `${SignInPage.message.pageTitle} ${SignInPage.message.failTitle.toLocaleLowerCase()}`,
                        html: I18n.t("common", "FORBIDDEN"),
                        ...AppSettings.sweetAlertOptions(false)
                    });
                }
                
            }
        } catch (e) {

            const { responseJSON } = e;
            const errorTitle = `${SignInPage.message.pageTitle} ${SignInPage.message.failTitle.toLocaleLowerCase()}`;
            const errorText = responseJSON?.message || I18n.t("common", "UNEXPECTED_ERROR");
            Swal.fire({
                icon: "error",
                title: errorTitle,
                html: errorText,
                ...AppSettings.sweetAlertOptions(false)
            });
        }
        finally {
            btnLogin.removeAttr("data-kt-indicator");
            btnLogin.removeAttr("disabled");
        }
    }

    // On document ready
    KTUtil.onDOMContentLoaded(function () {
        SignInPage.init();
    });
})();