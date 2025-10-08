'use strict';

(function () {
    const SystemConfigPage = {
        logoImg: '/admin/assets/media/svg/files/blank-image.svg',
        target: null,
        blockUI: null,
        dataSystemConfigs: [],
        permissionFlags: AppUtils.getPermissionFlags(),
        configKeys: {
            HOT_LINE: "HOT_LINE",
            EMAIL: "EMAIL",
            USER_MANUAL: "USER_MANUAL",
            PRIVACY_POLICY: "PRIVACY_POLICY",
            TERMS_OF_SERVICE: "TERMS_OF_SERVICE",
            ADDRESS: "ADDRESS",
            GOOGLE_MAPS_LINK: "GOOGLE_MAPS_LINK",
            WORKING_HOURS: "WORKING_HOURS"
        },
        editors: {
            systemConfigUserManual: null,
            systemConfigPrivacyPolicy: null,
            systemConfigTermsOfService: null
        },
        formValidator: null,
        message: {
            pageTitle: I18n.t("systemConfig", "PAGE_TITLE"),
            confỉmTitle: I18n.t("common", "CONFIRM_TITLE"),
            successTitle: I18n.t("common", "SUCCESS_TITLE"),
            errorTitle: I18n.t("common", "ERROR_TITLE"),
            failTitle: I18n.t("common", "FAIL_TITLE"),
            actions: I18n.t("common", "ACTIONS"),
            create: I18n.t("common", "ADD_NEW"),
            edit: I18n.t("common", "EDIT"),
            delete: I18n.t("common", "DELETE"),
            confirmTitle: I18n.t("common", "CONFIRM_TITLE"),
            warningTitle: I18n.t("common", "WARNING_TITLE"),
            validationError: I18n.t("common", "VALIDATION_ERROR"),
            updateSuccess: I18n.t("systemConfig", "SYSTEM_CONFIG_SUCCESS"),
            updateError: I18n.t("systemConfig", "SYSTEM_CONFIG_ERROR"),
            noData: I18n.t("common", "NO_DATA")
        },
        init: async function () {

            this.checkPermissions();
            this.blockUI = new KTBlockUI(document.querySelector("#kt_app_content"));
            await this.loadRelatedData();
            this.bindResetEvent();
            this.formValidator = new FormValidator({
                formSelector: "#kt_modal_tag_form_system_config",
                handleSubmit: saveSystemConfig,
                rules: [
                    {
                        element: "#system_config_hot_line",
                        rule: [
                            {
                                name: "required",
                                message: I18n.t("common", "REQUIRED", { field: "Số điện thoại" })
                            },
                            {
                                name: "phone",
                                message: I18n.t("common", "INVALID_FORMAT", { field: "Số điện thoại" }),
                            },
                        ]
                    },
                    {
                        element: "#system_config_email",
                        rule: [
                            {
                                name: "required",
                                message: I18n.t("common", "REQUIRED", { field: "Email" })
                            },
                            {
                                name: "maxLength",
                                message: I18n.t("common", "TOO_LONG", { field: "Email", max: 50 }),
                                params: 50
                            },
                            {
                                name: "email",
                                message: I18n.t("systemConfig", "INVALID_EMAIL"),
                                params: null
                            },
                        ]
                    },
                    {
                        element: "#system_config_working_hours",
                        rule: [
                            {
                                name: "required",
                                message: I18n.t("common", "REQUIRED", { field: "Giờ làm việc" })
                            },
                            {
                                name: "maxLength",
                                message: I18n.t("common", "TOO_LONG", { field: "Giờ làm việc", max: 255 }),
                                params: 255
                            },
                        ]
                    },
                    {
                        element: "#system_config_address",
                        rule: [
                            {
                                name: "required",
                                message: I18n.t("common", "REQUIRED", { field: "Địa chỉ" })
                            },
                            {
                                name: "maxLength",
                                message: I18n.t("common", "TOO_LONG", { field: "Địa chỉ", max: 255 }),
                                params: 255
                            },
                        ]
                    },
                    {
                        element: "#system_config_google_maps_link",
                        rule: [
                            {
                                name: "url",
                                message: I18n.t("common", "INVALID_FORMAT", { field: "Link Google Map" }),
                                allowNullOrEmpty: true
                            },
                        ]
                    },
                    {
                        element: "#system_config_user_manual",
                        rule: [
                            {
                                name: "customFunction",
                                message: I18n.t("common", "REQUIRED", { field: "Hướng dẫn sử dụng" }),
                                params: function (element) {
                                    if (SystemConfigPage.editors.systemConfigUserManual) {
                                        const editorData = SystemConfigPage.editors.systemConfigUserManual.getData();
                                        const textContent = editorData.replace(/<[^>]*>/g, '').trim();
                                        return textContent.length > 0;
                                    }
                                    return false;
                                }
                            },
                        ]
                    },
                    {
                        element: "#system_config_privacy_policy",
                        rule: [
                            {
                                name: "customFunction",
                                message: I18n.t("common", "REQUIRED", { field: "Chính sách bảo mật" }),
                                params: function (element) {
                                    if (SystemConfigPage.editors.systemConfigPrivacyPolicy) {
                                        const editorData = SystemConfigPage.editors.systemConfigPrivacyPolicy.getData();
                                        const textContent = editorData.replace(/<[^>]*>/g, '').trim();
                                        return textContent.length > 0;
                                    }
                                    return false;
                                }
                            },
                        ]
                    },
                    {
                        element: "#system_config_terms_of_service",
                        rule: [
                            {
                                name: "customFunction",
                                message: I18n.t("common", "REQUIRED", { field: "Điều khoản dịch vụ" }),
                                params: function (element) {
                                    if (SystemConfigPage.editors.systemConfigTermsOfService) {
                                        const editorData = SystemConfigPage.editors.systemConfigTermsOfService.getData();
                                        const textContent = editorData.replace(/<[^>]*>/g, '').trim();
                                        return textContent.length > 0;
                                    }
                                    return false;
                                }
                            },
                        ]
                    },
                ]
            });
        },
        bindSaveSystemConfigEvent: function () {
            //$("#btn_save_system_config").on("click", async function (e) {
            //    e.preventDefault();
            //    await saveSystemConfig();
            //});
        },
        loadRelatedData: async function () {
            loadCKEditor();
            loadDataSystemConfig();
        },
        checkPermissions: function () {
            if (!SystemConfigPage.permissionFlags.canUpdate) {
                $("#btn_save_system_config").addClass("d-none");
                $("button[type='reset']").addClass("d-none");
                $("#kt_modal_tag_form_system_config input,#kt_modal_tag_form_system_config textarea").attr("disabled", true);
            }
        },
        bindResetEvent: function () {
            $("button[type='reset']").on("click", async function (e) {
                e.preventDefault();

                const confirmReset = I18n.t("systemConfig", "CONFIRM_RESET_SYSTEM_CONFIG");
                const { isConfirmed } = await Swal.fire({
                    icon: 'question',
                    title: SystemConfigPage.message.confirmTittle,
                    html: confirmReset,
                    ...AppSettings.sweetAlertOptions(true)
                });

                if (isConfirmed) {


                    $("#kt_modal_tag_form_system_config")[0].reset();

                    if (SystemConfigPage.editors.systemConfigUserManual) {
                        SystemConfigPage.editors.systemConfigUserManual.setData('');
                    }
                    if (SystemConfigPage.editors.systemConfigPrivacyPolicy) {
                        SystemConfigPage.editors.systemConfigPrivacyPolicy.setData('');
                    }
                    if (SystemConfigPage.editors.systemConfigTermsOfService) {
                        SystemConfigPage.editors.systemConfigTermsOfService.setData('');
                    }

                    Swal.fire({
                        icon: "success",
                        title: SystemConfigPage.message.successTitle,
                        html: I18n.t("systemConfig", "RESET_SUCCESS"),
                        ...AppSettings.sweetAlertOptions(false)
                    });
                }

            });
        },

    };


    /**
   * load data SystemConfig
   */
    async function loadDataSystemConfig() {
        SystemConfigPage.blockUI.block();
        try {
            const response = await httpService.getAsync(ApiRoutes.SystemConfig.v1.List);
            SystemConfigPage.dataSystemConfigs = response.resources;
            if (!SystemConfigPage.dataSystemConfigs || SystemConfigPage.dataSystemConfigs.length === 0) {


                Swal.fire({
                    icon: "warning",
                    title: SystemConfigPage.message.warningTitle,
                    html: SystemConfigPage.message.noData,
                    ...AppSettings.sweetAlertOptions(true)
                });
            }
            SystemConfigPage.dataSystemConfigs.forEach(function (item) {
                SystemConfigPage.dataSystemConfigs.forEach(function (item) {
                    const elementId = `#system_config_${item.configKey.toLowerCase()}`;

                    if (item.configKey === SystemConfigPage.configKeys.HOT_LINE ||
                        item.configKey === SystemConfigPage.configKeys.EMAIL ||
                        item.configKey === SystemConfigPage.configKeys.ADDRESS ||
                        item.configKey === SystemConfigPage.configKeys.GOOGLE_MAPS_LINK ||
                        item.configKey === SystemConfigPage.configKeys.WORKING_HOURS) {
                        $(elementId).val(item.configValue);
                    }
                    if (item.configKey === SystemConfigPage.configKeys.USER_MANUAL) {
                        SystemConfigPage.editors.systemConfigUserManual.setData(item.configValue);
                    }
                    if (item.configKey === SystemConfigPage.configKeys.PRIVACY_POLICY) {
                        SystemConfigPage.editors.systemConfigPrivacyPolicy.setData(item.configValue);
                    }
                    if (item.configKey === SystemConfigPage.configKeys.TERMS_OF_SERVICE) {
                        SystemConfigPage.editors.systemConfigTermsOfService.setData(item.configValue);
                    }

                });
            });
        } catch (e) {
            console.error(e);
        }
        finally {
            SystemConfigPage.blockUI.release();
        }
    }

    /**
     * Save system configuration data
     */
    async function saveSystemConfig() {
        try {
            const btnSave = $("#btn_save_system_config");

            SystemConfigPage.dataSystemConfigs.forEach(function (item) {
                const elementId = `#system_config_${item.configKey.toLowerCase()}`;
                if (item.configKey === SystemConfigPage.configKeys.HOT_LINE ||
                    item.configKey === SystemConfigPage.configKeys.EMAIL ||
                    item.configKey === SystemConfigPage.configKeys.ADDRESS ||
                    item.configKey === SystemConfigPage.configKeys.GOOGLE_MAPS_LINK ||
                    item.configKey === SystemConfigPage.configKeys.WORKING_HOURS) {
                    item.configValue = $(elementId).val();
                }
                if (item.configKey === SystemConfigPage.configKeys.USER_MANUAL) {
                    item.configValue = SystemConfigPage.editors.systemConfigUserManual.getData();
                }
                if (item.configKey === SystemConfigPage.configKeys.PRIVACY_POLICY) {
                    item.configValue = SystemConfigPage.editors.systemConfigPrivacyPolicy.getData();
                }
                if (item.configKey === SystemConfigPage.configKeys.TERMS_OF_SERVICE) {
                    item.configValue = SystemConfigPage.editors.systemConfigTermsOfService.getData();
                }
            });



            if (SystemConfigPage.dataSystemConfigs.length === 0) {
                Swal.fire({
                    icon: "warning",
                    title: SystemConfigPage.message.warningTitle,
                    html: SystemConfigPage.message.validationError,
                    ...AppSettings.sweetAlertOptions(true)
                });
                return;
            }


            btnSave.prop("disabled", true);
            const confirmText = I18n.t("systemConfig", "CONFIRM_UPDATE_SYSTEM_CONFIG");
            const { isConfirmed } = await Swal.fire({
                icon: 'question',
                title: SystemConfigPage.message.confirmTittle,
                html: confirmText,
                ...AppSettings.sweetAlertOptions(true)
            });
            if (isConfirmed) {
                btnSave.attr("data-kt-indicator", "on");
                try {
                    const response = await httpService.putAsync(ApiRoutes.SystemConfig.v1.UpdateList, SystemConfigPage.dataSystemConfigs);

                    if (response.isSucceeded) {
                        Swal.fire({
                            icon: "success",
                            title: SystemConfigPage.message.successTitle,
                            html: SystemConfigPage.message.updateSuccess,
                            ...AppSettings.sweetAlertOptions(false)
                        });
                    } else {
                        Swal.fire({
                            icon: "error",
                            title: SystemConfigPage.message.errorTitle,
                            html: response.message || SystemConfigPage.message.updateError,
                            ...AppSettings.sweetAlertOptions(true)
                        });
                    }
                } catch (apiError) {
                    console.error(apiError);
                    Swal.fire({
                        icon: "error",
                        title: SystemConfigPage.message.errorTitle,
                        html: SystemConfigPage.message.updateError,
                        ...AppSettings.sweetAlertOptions(true)
                    });
                } finally {
                    // Tắt loading state
                    btnSave.attr("data-kt-indicator", "off");
                }
            }
            btnSave.prop("disabled", false);
        }
        catch (error) {
            console.error(error);
        }
    }


    /**
     * Load CKEditor with specific configurations
     */
    function loadCKEditor() {
        const editorConfig = {
            language: 'vi',
            toolbar: [
                ['Format'],
                ['Bold', 'Italic'],
                ['Link'],
                ['NumberedList', 'BulletedList', 'Indent', 'Outdent'],
                ['Maximize']
            ],
            format_tags: 'p;h1;h2;h3;pre',
            removeDialogTabs: 'image:advanced;link:advanced',
            height: 500,
            removePlugins: 'exportpdf',
            contentsCss: [
                "body { font-family: 'Inter',sans-serif; }",
            ]
        };

        SystemConfigPage.editors.systemConfigUserManual = CKEDITOR.replace('system_config_user_manual', editorConfig);
        SystemConfigPage.editors.systemConfigPrivacyPolicy = CKEDITOR.replace('system_config_privacy_policy', editorConfig);
        SystemConfigPage.editors.systemConfigTermsOfService = CKEDITOR.replace('system_config_terms_of_service', editorConfig);
    }

    KTUtil.onDOMContentLoaded(async function () {
        await AppEntry.init();
        if (!SystemConfigPage.permissionFlags.canView) {
            AppSettings.mainElements.PAGE_CONTENT.addClass("d-none");
            AppSettings.mainElements.NOT_FOUND.removeClass("d-none");
        }
        else
            SystemConfigPage.init();
    });
})();                                                                                   