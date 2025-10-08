"use strict";

(function () {
    const ResetPasswordPage = {
        formValidator: null,
        emailParam: null,
        codeParam: null,
        purpose: AppSettings.purposes.FORGOT_PASSWORD,
        isCodeVerified: false,
        message: {
            pageTitle: I18n.t("password_changed", "PAGE_TITLE"),
            successTitle: I18n.t("common", "SUCCESS_TITLE"),
            failTitle: I18n.t("common", "FAIL_TITLE"),
            errorTitle: I18n.t("common", "ERROR_TITLE"),
            warningTitle: I18n.t("common", "WARNING_TITLE"),
            resetSuccess: I18n.t("password_changed", "PASSWORD_RESET_SUCCESS") + " " + I18n.t("password_changed", "REDIRECTING_TO_LOGIN"),
            invalidLink: I18n.t("password_changed", "RESET_LINK_INVALID"),
            networkError: I18n.t("common", "UNEXPECTED_ERROR"),
        },

        init: function () {
            this.getUrlParams();
            if (!this.validateParams()) return;

            this.showLoadingState();

            this.bindEvents();
            this.verifyResetCode();
        },

        getUrlParams: function () {
            this.emailParam = AppUtils.getUrlParam('email');
            this.codeParam = AppUtils.getUrlParam('code');


            $("#email-field").val(this.emailParam || '');
            $("#code-field").val(this.codeParam || '');
            $("#email-display").text(this.emailParam || '');
        },

        validateParams: function () {
            if (!this.emailParam || !this.codeParam) {
                this.showAlert(this.message.invalidLink, 'error');
                setTimeout(() => {
                    window.location.href = '/sign-in';
                }, 3000);
                return false;
            }
            return true;
        },

        bindEvents: function () {
            this.bindPasswordVisibilityToggle();
/*            this.bindFormSubmit();*/
        },

        bindPasswordVisibilityToggle: function () {
            $('[data-kt-password-meter-control="visibility"]').on('click', function () {
                const $input = $(this).closest('.position-relative').find('input');
                const $eyeSlash = $(this).find('.ki-eye-slash');
                const $eye = $(this).find('.ki-eye');

                if ($input.attr('type') === 'password') {
                    $input.attr('type', 'text');
                    $eyeSlash.addClass('d-none');
                    $eye.removeClass('d-none');
                } else {
                    $input.attr('type', 'password');
                    $eyeSlash.removeClass('d-none');
                    $eye.addClass('d-none');
                }
            });
        },

        //bindFormSubmit: function () {
        //    $("#kt_new_password_form").on('submit', (e) => {
        //        e.preventDefault();
        //        this.handleSubmit();
        //    });
        //},

        showLoadingState: function () {
            $("#kt_new_password_form").addClass('d-none');

            const loadingHtml = `
        <div id="loading_state" class="text-center">
            <div class="spinner-border text-primary mb-3" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p>Đang xác thực liên kết...</p>
        </div>
    `;

            $(".w-lg-500px").append(loadingHtml);
        },

        showPasswordForm: function () {
            $("#loading_state").remove(); 
            $("#kt_new_password_form").removeClass('d-none');
            $("#error_state").addClass('d-none');
        },

        showErrorState: function (message) {
            $("#loading_state").remove(); 
            $("#kt_new_password_form").addClass('d-none');

            if ($("#error_state").length === 0) {
                const errorHtml = `
            <div class="text-center">
                        <div class="symbol symbol-100px symbol-circle mb-7">
                            <i class="ki-duotone ki-cross-circle fs-2hx text-danger">
                                <span class="path1"></span>
                                <span class="path2"></span>
                            </i>
                        </div>
                        <h1 class="text-gray-900 fw-bolder mb-3">Liên kết không hợp lệ</h1>
                        <div class="text-gray-500 fw-semibold fs-6 mb-8">
                            ${message}
                        </div>
                        <div class="mb-0">
                            <a href="/sign-in" class="btn btn-primary me-2">Quay lại đăng nhập</a>
                            <a href="/forgot-password" class="btn btn-light">Gửi lại email</a>
                        </div>
                    </div>
        `;
                $(".w-lg-500px").append(errorHtml);
            } else {
                $("#error_state").removeClass('d-none');
            }
        },

        verifyResetCode: async function () {
            try {
                const response = await httpService.postAsync(ApiRoutes.Auth.v1.VerifyCode, {
                    email: this.emailParam,
                    code: this.codeParam,
                    purpose: this.purpose
                });

                if (response?.isSucceeded) {
                    this.isCodeVerified = true;
                    this.showPasswordForm();
                    this.initFormValidator();
                } else {
                    this.showErrorState(response?.message || this.message.invalidLink);
                }
            } catch (error) {
                this.showErrorState(this.message.invalidLink);
            }
        },

        initFormValidator: function () {
            this.formValidator = new FormValidator({
                formSelector: "#kt_new_password_form",
                handleSubmit: handleSubmit,
                rules: [
                    {
                        element: "#password_field",
                        rule: [
                            {
                                name: "required",
                                message: I18n.t("common", "REQUIRED", { field: "Mật khẩu mới" })
                            },
                            {
                                name: "minLength",
                                message: I18n.t("common", "TOO_SHORT", { field: "Mật khẩu mới", min: 6 }),
                                params: 6
                            }
                        ]
                    },
                    {
                        element: "#confirm_password_field",
                        rule: [
                            {
                                name: "required",
                                message: I18n.t("common", "REQUIRED", { field: "Mật khẩu xác nhận" })
                            },
                            {
                                name: "equalTo",
                                message: I18n.t("common", "COMPARE_EQUAL", { fieldA: "Mật khẩu xác nhận", fieldB: "Mật khẩu" }),
                                params: "#password_field"
                            }
                        ]
                    }
                ]
            });
        },
      

        setLoadingState: function (submitButton, isLoading) {
            const indicatorLabel = submitButton.find('.indicator-label');
            const indicatorProgress = submitButton.find('.indicator-progress');

            if (isLoading) {
                submitButton.prop('disabled', true);
                indicatorLabel.addClass('d-none');
                indicatorProgress.addClass('d-block');
            } else {
                submitButton.prop('disabled', false);
                indicatorLabel.removeClass('d-none');
                indicatorProgress.addClass('d-none');
            }
        },

        showAlert: function (message, type) {
            if (typeof Swal !== 'undefined') {
                const icon = type === 'error' ? 'error' : type === 'warning' ? 'warning' : 'success';
                const title = type === 'error' ? this.message.errorTitle :
                    type === 'warning' ? this.message.warningTitle : this.message.successTitle;

                Swal.fire({
                    icon: icon,
                    title: title,
                    text: message,
                    ...AppSettings.sweetAlertOptions(false)
                });
            } else {
                alert(message);
            }
        }
    };
    async function handleSubmit() {
        const submitButton = $("#kt_new_password_submit");
        submitButton.attr("disabled", true);
        submitButton.attr("data-kt-indicator", "on");
        const password = $("#password_field").val();
        const confirmPassword = $("#confirm_password_field").val();


        try {
            const response = await httpService.postAsync(ApiRoutes.Auth.v1.ResetPassword, {
                email: ResetPasswordPage.emailParam,
                code: ResetPasswordPage.codeParam,
                purpose: ResetPasswordPage.purpose,
                newPassword: password,
                confirmPassword: confirmPassword
            });

            if (response?.isSucceeded) {
                Swal.fire({
                    icon: "success",
                    title: ResetPasswordPage.message.successTitle,
                    text: ResetPasswordPage.message.resetSuccess,
                    ...AppSettings.sweetAlertOptions(false)
                }).then(() => {
                    window.location.href = '/sign-in';
                });
            } else {
                const errorMessage = response?.message || ResetPasswordPage.message.networkError;
                Swal.fire({
                    icon: "error",
                    title: ResetPasswordPage.message.errorTitle,
                    html: errorMessage,
                    ...AppSettings.sweetAlertOptions(false)
                });
            }
        } catch (error) {
            const { responseJSON } = error;
            const errorTitle = `${ResetPasswordPage.message.pageTitle} ${ResetPasswordPage.message.failTitle.toLocaleLowerCase()}`;
            const errorText = responseJSON?.message || I18n.t("common", "UNEXPECTED_ERROR");
            Swal.fire({
                icon: "error",
                title: errorTitle,
                html: errorText,
                ...AppSettings.sweetAlertOptions(false)
            });
        }
        finally {
            submitButton.removeAttr("data-kt-indicator");
            submitButton.removeAttr("disabled");
        }
    }

    // Initialize when DOM is ready
    KTUtil.onDOMContentLoaded(function () {
        ResetPasswordPage.init();
    });
})();