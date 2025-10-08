"use strict";

(function () {
    const SignUpPage = {
        formValidator: null,
        message: {
            pageTitle: I18n.t("sign_up", "PAGE_TITLE"),
            successTitle: I18n.t("common", "SUCCESS_TITLE"),
            failTitle: I18n.t("common", "FAIL_TITLE"),
        },
        init: function () {
            this.initPlugins();
            this.bindEvents();
            this.formValidator = new FormValidator({
                formSelector: "#kt_sign_up_form",
                handleSubmit: signup,
                rules: [
                    {
                        element: "#user_username",
                        rule: [
                            {
                                name: "required",
                                message: I18n.t("common", "REQUIRED", { field: "Tên đăng nhập" })
                            },
                            {
                                name: "maxLength",
                                message: I18n.t("common", "TOO_LONG", { field: "Tên đăng nhập", max: 30 }),
                                params: 30
                            },
                            {
                                name: "minLength",
                                message: I18n.t("common", "TOO_SHORT", { field: "Tên đăng nhập", min: 6 }),
                                params: 6
                            },
                            {
                                name: "customFunction",
                                message: "Tên đăng nhập chỉ cho phép nhập chữ và số",
                                params: checkValidUsername,
                            }
                        ]
                    },
                    {
                        element: "#user_password",
                        rule: [
                            {
                                name: "required",
                                message: I18n.t("common", "REQUIRED", { field: "Mật khẩu" })
                            },
                            {
                                name: "maxLength",
                                message: I18n.t("common", "TOO_LONG", { field: "Mật khẩu", max: 64 }),
                                params: 64
                            },
                            {
                                name: "minLength",
                                message: I18n.t("common", "TOO_SHORT", { field: "Mật khẩu", min: 10 }),
                                params: 10
                            },
                            {
                                name: "customRegex",
                                message: I18n.t("common", "PASSWORD_WEAK"),
                                params: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*(),.?\":{}|<>]).*$"    
                            }
                        ]
                    },
                    {
                        element: "#user_rePassword",
                        rule: [
                            {
                                name: "required",
                                message: I18n.t("common", "REQUIRED", { field: "Nhập lại mật khẩu" })
                            },
                            {
                                name: "equalTo",
                                message: I18n.t("common", "COMPARE_EQUAL", { fieldA: "Nhập lại mật khẩu", fieldB: "Mật khẩu" }),
                                params: "#user_password"
                            }
                        ]
                    },
                    {
                        element: "#user_firstName",
                        rule: [
                            {
                                name: "required",
                                message: I18n.t("common", "REQUIRED", { field: "Họ và tên đệm" })
                            },
                            {
                                name: "maxLength",
                                message: I18n.t("common", "TOO_LONG", { field: "Họ và tên đệm", max: 255 }),
                                params: 255
                            }
                        ]
                    },
                    {
                        element: "#user_lastName",
                        rule: [
                            {
                                name: "required",
                                message: I18n.t("common", "REQUIRED", { field: "Tên" })
                            },
                            {
                                name: "maxLength",
                                message: I18n.t("common", "TOO_LONG", { field: "Tên", max: 255 }),
                                params: 255
                            }
                        ]
                    },
                    {
                        element: "#user_email",
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
                    //{
                    //    element: "#user_provinceId",
                    //    rule: [
                    //        {
                    //            name: "required",
                    //            message: I18n.t("common", "REQUIRED_SELECT", { field: "Tỉnh/thành phố" })
                    //        }
                    //    ]
                    //},
                    //{
                    //    element: "#user_districtId",
                    //    rule: [
                    //        {
                    //            name: "required",
                    //            message: I18n.t("common", "REQUIRED_SELECT", { field: "Quận/huyện" })
                    //        }
                    //    ]
                    //},
                    //{
                    //    element: "#user_wardId",
                    //    rule: [
                    //        {
                    //            name: "required",
                    //            message: I18n.t("common", "REQUIRED_SELECT", { field: "Xã/phường" })
                    //        }
                    //    ]
                    //},
                    //{
                    //    element: "#user_officeId",
                    //    rule: [
                    //        {
                    //            name: "required",
                    //            message: I18n.t("common", "REQUIRED_SELECT", { field: "Văn phòng" })
                    //        }
                    //    ]
                    //},
                    //{
                    //    element: "#user_roleId",
                    //    rule: [
                    //        {
                    //            name: "required",
                    //            message: I18n.t("common", "REQUIRED_SELECT", { field: "Vai trò" })
                    //        }
                    //    ]
                    //},
                ]
            });
            this.loadRelatedData();
        },
        initPlugins: function () {
            $("#user_provinceId").select2({
                language: currentLang,
                placeholder: 'Chọn tỉnh/thành phố',
            });
            //$("#user_districtId").select2({
            //    language: currentLang,
            //    placeholder: 'Chọn quận/huyện',
            //});
            $("#user_wardId").select2({
                language: currentLang,
                placeholder: 'Chọn xã/phường',
            });
            $("#user_officeId").select2({
                language: currentLang,
                placeholder: 'Chọn văn phòng',
            });
            $("#user_roleId").select2({
                language: currentLang,
                placeholder: 'Chọn vai trò',
            });
        },
        bindEvents: function () {
            /*this.bindLoadDistrictByProvince();*/
            this.bindLoadWardByDistrict();
            this.bindOnchangeWard();
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
        },
        bindLoadDistrictByProvince: function () {
            $("#user_provinceId").on("change", async function () {
                await loadDataDistrictByProvinceId($(this).val());
                await tryLoadOffice();
            })
        },
        bindLoadWardByDistrict: function () {
            $("#user_provinceId").on("change", async function () {
                await loadDataWardByProvinceId($(this).val());
                await tryLoadOffice();
            });
        },
        bindOnchangeWard: function () {
            $("#user_wardId").on("change", async function () {
                await tryLoadOffice();
            });
        },
        loadRelatedData: async function () {
            await loadDataProvince();
            await loadDataRoleRegister();
            $("select[data-control=select2]").val("").select2();
        }
    }

    async function signup() {
        const btnLogin = $("#kt_sign_up_submit");
        btnLogin.attr("disabled", true);
        btnLogin.attr("data-kt-indicator", "on");
        try {
            const data = {
                username: $("#user_username").val().trim(),
                password: $("#user_password").val().trim(),
                firstName: $("#user_firstName").val().trim(),
                lastName: $("#user_lastName").val().trim(),
                email: $("#user_email").val().trim(),
                officeId: $("#user_officeId").val(),
                roleId: $("#user_roleId").val(),
            };
            const response = await httpService.postAsync(ApiRoutes.Auth.v1.Register, data);
            if (response?.isSucceeded) {
                const title = `${SignUpPage.message.pageTitle} ${SignUpPage.message.successTitle.toLocaleLowerCase()}`;
                const text = I18n.t("sign_up", "WELCOME");
                Swal.fire({
                    icon: "success",
                    title: title,
                    html: text,
                    ...AppSettings.sweetAlertOptions(false)
                }).then(function () {
                    window.location.href = "/sign-in";
                })
            }
        } catch (e) {
            const { responseJSON } = e;
            const errorTitle = `${SignUpPage.message.pageTitle} ${SignUpPage.message.failTitle.toLocaleLowerCase()}`;
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

    async function loadDataProvince() {
        try {
            const response = await httpService.getAsync(ApiRoutes.Province.v1.List);
            const data = response.resources;
            data.forEach(function (item) {
                $("#user_provinceId").append(new Option(item.name, item.id, false, false));
            });
        } catch (e) {
            console.error(e);
        }
    }

    async function loadDataDistrictByProvinceId(provinceId) {
        if (!provinceId) {
            return;
        }
        try {
            $("#user_districtId").empty();
            $("#user_wardId").empty();
            const response = await httpService.getAsync(ApiRoutes.Province.v1.ListDistrictByProvinceId(provinceId));
            const data = response.resources;
            data.forEach(function (item) {
                $("#user_districtId").append(new Option(item.name, item.id, false, false));
            });
            $("#user_districtId").val("").trigger("change");
        } catch (e) {
            console.error(e);
        }
    }

    async function loadDataWardByProvinceId(districtId) {
        if (!districtId) {
            return;
        }
        try {
            $("#user_wardId").empty();
            const response = await httpService.getAsync(ApiRoutes.Province.v1.Wards(districtId));
            const data = response.resources;
            data.forEach(function (item) {
                $("#user_wardId").append(new Option(item.name, item.id, false, false));
            });
            $("#user_wardId").val("").trigger("change")

        } catch (e) {
            console.error(e);
        }
    }

    async function loadDataRoleRegister() {
        try {
            const response = await httpService.getAsync(ApiRoutes.Role.v1.ListByRegister);
            const data = response.resources;
            data.forEach(function (item) {
                $("#user_roleId").append(new Option(item.name, item.id, false, false));
            });
        } catch (e) {
            console.error(e);
        }
    }

    async function tryLoadOffice() {
        //Mặc định onchange reset luôn
        $("#user_officeId").empty();

        let provinceId = $("#user_provinceId").val();
        /*let districtId = $("#user_districtId").val();*/
        let wardId = $("#user_wardId").val();

        if (!provinceId /*|| !districtId*/ || !wardId) {
            return;
        }

        try {
            const dataRequest = {
                provinceId: provinceId,
                /*districtId: districtId,*/
                wardId: wardId,
            };
            const response = await httpService.postAsync(ApiRoutes.Office.v1.GetByRegisterAddress, dataRequest);
            const data = response.resources;
            data.forEach(function (item) {
                $("#user_officeId").append(new Option(item.name, item.id, false, false));
            });
            $("#user_officeId").val("").trigger("change");
        } catch (e) {
            console.error(e);
        }
    }

    function checkValidUsername() {
        const username = $("#user_username").val();
        const regex = /^[a-zA-Z0-9]{6,30}$/;
        return regex.test(username);
    }

    // On document ready
    KTUtil.onDOMContentLoaded(function () {
        SignUpPage.init();
    });
})();