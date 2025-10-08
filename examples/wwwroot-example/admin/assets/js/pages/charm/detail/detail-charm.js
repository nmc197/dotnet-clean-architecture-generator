"use strict";
(function () {
    const CharmDetailPage = {
        table: null,
        target: null,
        formValidator: null,
        variables: {
            tagTypeBlogId: 1001,
            id: AppUtils.getPathSegment(2) || 0, // Lấy id từ URL
        },
        plugins: {
            dateTimepickerPublicationDate: null
        },
        blockUI: null,
        permissionFlags: AppUtils.getPermissionFlags('/charm/list'),
        message: {
            pageTitle: I18n.t("charm", "PAGE_TITLE"),
            tagTitle: I18n.t("charm", "TAG_TITLE"),
            actions: I18n.t("common", "ACTIONS"),
            create: I18n.t("common", "ADD_NEW"),
            edit: I18n.t("common", "EDIT"),
            delete: I18n.t("common", "DELETE"),
            forbidden: I18n.t("common", "FORBIDDEN"),
            confirmTittle: I18n.t("common", "CONFIRM_TITLE"),
            successTitle: I18n.t("common", "SUCCESS_TITLE"),
            errorTitle: I18n.t("common", "ERROR_TITLE"),
            failTitle: I18n.t("common", "FAIL_TITLE"),
            warningTitle: I18n.t("common", "WARNING_TITLE"),
            createConfirm: I18n.t("common", "CREATE_CONFIRM", { name: I18n.t("charm", "PAGE_TITLE").toLocaleLowerCase() }),
            createSuccess: I18n.t("common", "CREATE_SUCCESS", { name: I18n.t("charm", "PAGE_TITLE").toLocaleLowerCase() }),
            createError: I18n.t("common", "CREATE_ERROR", { name: I18n.t("charm", "PAGE_TITLE").toLocaleLowerCase() }),
            updateConfirm: I18n.t("common", "UPDATE_CONFIRM", { name: I18n.t("charm", "PAGE_TITLE").toLocaleLowerCase() }),
            updateSuccess: I18n.t("common", "UPDATE_SUCCESS", { name: I18n.t("charm", "PAGE_TITLE") }),
            updateError: I18n.t("common", "UPDATE_ERROR", { name: I18n.t("charm", "PAGE_TITLE").toLocaleLowerCase() }),
            deleteConfirm: I18n.t("common", "DELETE_CONFIRM", { name: I18n.t("charm", "PAGE_TITLE").toLocaleLowerCase() }),
            deleteSuccess: I18n.t("common", "DELETE_SUCCESS", { name: I18n.t("charm", "PAGE_TITLE").toLocaleLowerCase() }),
            deleteError: I18n.t("common", "DELETE_ERROR", { name: I18n.t("charm", "PAGE_TITLE").toLocaleLowerCase() }),
            notFound: I18n.t("common", "NOT_FOUND", { name: I18n.t("charm", "PAGE_TITLE").toLocaleLowerCase() }),
            validationError: I18n.t("common", "VALIDATION_ERROR")
        },
        formValidatorBlogTag: null,
        messageBlogTag: {
            pageTitle: I18n.t("tag", "PAGE_TITLE"),
            actions: I18n.t("common", "ACTIONS"),
            create: I18n.t("common", "ADD_NEW"),
            edit: I18n.t("common", "EDIT"),
            delete: I18n.t("common", "DELETE"),
            forbidden: I18n.t("common", "FORBIDDEN"),
            confirmTittle: I18n.t("common", "CONFIRM_TITLE"),
            successTitle: I18n.t("common", "SUCCESS_TITLE"),
            errorTitle: I18n.t("common", "ERROR_TITLE"),
            failTitle: I18n.t("common", "FAIL_TITLE"),
            warningTitle: I18n.t("common", "WARNING_TITLE"),
            createConfirm: I18n.t("common", "CREATE_CONFIRM", { name: I18n.t("tag", "PAGE_TITLE").toLocaleLowerCase() }),
            createSuccess: I18n.t("common", "CREATE_SUCCESS", { name: I18n.t("tag", "PAGE_TITLE").toLocaleLowerCase() }),
            createError: I18n.t("common", "CREATE_ERROR", { name: I18n.t("tag", "PAGE_TITLE").toLocaleLowerCase() }),
            updateConfirm: I18n.t("common", "UPDATE_CONFIRM", { name: I18n.t("tag", "PAGE_TITLE").toLocaleLowerCase() }),
            updateSuccess: I18n.t("common", "UPDATE_SUCCESS", { name: I18n.t("tag", "PAGE_TITLE") }),
            updateError: I18n.t("common", "UPDATE_ERROR", { name: I18n.t("tag", "PAGE_TITLE").toLocaleLowerCase() }),
            deleteConfirm: I18n.t("common", "DELETE_CONFIRM", { name: I18n.t("tag", "PAGE_TITLE").toLocaleLowerCase() }),
            deleteSuccess: I18n.t("common", "DELETE_SUCCESS", { name: I18n.t("tag", "PAGE_TITLE").toLocaleLowerCase() }),
            deleteError: I18n.t("common", "DELETE_ERROR", { name: I18n.t("tag", "PAGE_TITLE").toLocaleLowerCase() }),
            notFound: I18n.t("common", "NOT_FOUND", { name: I18n.t("tag", "PAGE_TITLE").toLocaleLowerCase() }),
            validationError: I18n.t("common", "VALIDATION_ERROR"),
        },
        init: async function () {
            this.blockUI = new KTBlockUI(document.querySelector("#kt_app_content"));
            await this.initPlugins();
            await this.loadRelatedData();
            await this.bindEvents();
            this.formValidator = new FormValidator({
                formSelector: "#kt_modal_charm_form",
                handleSubmit: saveData,
                rules: [
                    {
                        element: "#charm_title",
                        rule: [
                            {
                                name: "required",
                                message: I18n.t("common", "REQUIRED", { field: "Tiêu đề" })
                            },
                            {
                                name: "maxLength",
                                message: I18n.t("common", "TOO_LONG", { field: "Tiêu đề", max: 500 }),
                                params: 500
                            },
                        ]

                    },
                    {
                        element: "#charm_description",
                        rule: [
                            {
                                name: "required",
                                message: I18n.t("common", "REQUIRED", { field: "Mô tả ngắn" })
                            },
                            {
                                name: "maxLength",
                                message: I18n.t("common", "TOO_LONG", { field: "Mô tả ngắn", max: 500 }),
                                params: 500,
                                allowNullOrEmpty: true
                            }
                        ]

                    },
                    {
                        element: "#charm_fileUploadId",
                        rule: [
                            {
                                name: "image",
                                message: I18n.t("common", "REQUIRED", { field: "Ảnh bài viết" })
                            },
                        ]
                    },
                    {
                        element: "#charm_charmStatusId",
                        rule: [
                            {
                                name: "required",
                                message: I18n.t("common", "REQUIRED_SELECT", { field: "Trạng thái" })
                            },
                        ]
                    },
                    {
                        element: "#charm_charmTypeId",
                        rule: [
                            {
                                name: "required",
                                message: I18n.t("common", "REQUIRED_SELECT", { field: "Loại vòng" })
                            },
                        ]
                    },
                    {
                        element: "#charm_charmCategoryId",
                        rule: [
                            {
                                name: "required",
                                message: I18n.t("common", "REQUIRED_SELECT", { field: "Danh mục" })
                            },
                        ]
                    },
                    {
                        element: "#charm_code",
                        rule: [
                            {
                                name: "required",
                                message: I18n.t("common", "REQUIRED", { field: "Mã phân loại" })
                            },
                        ]
                    },
                    {
                        element: "#charm_maxCharm",
                        rule: [
                            {
                                name: "required",
                                message: I18n.t("common", "REQUIRED", { field: "Số lượng charm" })
                            },
                        ]
                    },
                    {
                        element: "#charm_price",
                        rule: [
                            {
                                name: "required",
                                message: I18n.t("common", "REQUIRED", { field: "Giá tiền" })
                            },
                        ]
                    }

                ]
            });
        },
        initPlugins: function () {
            //BEGIN: CKEDITOR
            CKEDITOR.replace('charm_info');
            CKEDITOR.on('dialogDefinition', function (e) {
                const dialogName = e.data.name;
                const dialog = e.data.definition.dialog;
                dialog.on('show', function () {
                    setupCKUploadFile();
                });
            });
            //END: CKEDITOR
            //BEGIN: SELECT2
            $("#charm_charmStatusId").select2({
                language: currentLang,
                placeholder: 'Chọn trạng thái',
            });
            $("#charm_charmCategoryId").select2({
                language: currentLang,
                placeholder: 'Chọn danh mục',
            });
            $("#charm_charmTypeId").select2({
                language: currentLang,
                placeholder: 'Chọn loại vòng',
            });

            //END: SELECT2


        },
        bindEvents: function () {
            this.bindSaveEvent();
            this.bindEditEvent();
            this.bindChangeImageEvent();
            this.bindLoadEvent();
            this.bindApproveEvent();
            this.bindClearDatetimePickerEvent();
            this.bindAddEvent();
        },
        bindEditEvent: function () {
            FileManager.init({
                //acceptTypes: "image/*",
                //loadTypes: ["image"],
                directionId: CharmDetailPage.variables.id > 0 ? CharmDetailPage.variables.id : null,
                isGetAll: true,
                category: "CHARM",
                onChooseFile: (file) => {
                    if (CharmDetailPage.target === "#fileUploadId") {
                        $("#charm_fileUploadPath").css("background-image", `url('${file.url}')`);
                        $(".image-input").css("background-image", `unset`);
                        $("#charm_fileUploadId").val(file.id);
                    }
                    else {
                        CKEDITOR.dialog.getCurrent().getContentElement('info', 'txtUrl').setValue(file.url);
                    }
                }
            });
            if (CharmDetailPage.variables.id > 0)
                editItem(CharmDetailPage.variables.id);
        },
        bindSaveEvent: function () {
            //$("#btn_save_charm").on("click", function (e) {
            //    e.preventDefault();
            //    saveData();
            //})
        },
        bindAddEvent: function () {
            $("#btn_open_modal_charmTag").on("click", function () {
                addItemBlogTag();
            })
        },
        bindApproveEvent: function () {
            $("#charm_isApproved").on("change", function () {
                if ($(this).is(":checked")) {
                    //$(this).attr("disabled", "disabled");
                    $("#charm_approvalDate").val(moment().format("DD/MM/YYYY HH:mm:ss")).trigger("change");
                    $("#charm_charmStatusId").val(1002).trigger("change");
                }
                else {
                    $("#charm_approvalDate").val("").trigger("change");
                    $("#charm_charmStatusId").val(1001).trigger("change");
                }
            });
        },
        bindChangeImageEvent: function () {
            $("#fileUploadId").on("click", function (e) {
                e.preventDefault();
                FileManager.show();
                CharmDetailPage.target = "#fileUploadId";
            });
        },
        bindLoadEvent: function () {
            $("#charm_createdDate").val(moment().format("DD/MM/YYYY HH:mm:ss")).trigger("change");
        },
        bindClearDatetimePickerEvent: function () {
            $("#clear_charm_publicationDate i").on("click", function () {
                CharmDetailPage.plugins.dateTimepickerPublicationDate.clear();
            })
            $("#clear_charm_publicationDate").on("click", function () {
                CharmDetailPage.plugins.dateTimepickerPublicationDate.clear();
            })
        },
        loadRelatedData: async function () {
            await loadDataCharmStatus();
            await loadDataCharmCategory();
            await loadDataCharmType();
            //await loadDataBlogTag();
        },
    }
    /**
     * Author: 
     * CreatedDate: 
     * Description: Edit blog post by id
     * @param {number} id
     */
    async function editItem(id) {
        //CharmDetailPage.formValidator.clearErrors();
        if (!CharmDetailPage.permissionFlags.canUpdate) {
            $("#kt_modal_charm_form input, #kt_modal_charm_form textarea, #kt_modal_charm_form select")
                .prop("disabled", true);
            $("#charm_charmStatusId, #charm_charmCategoryId, #charm_charmTypeId, #charm_charmTagIds")
                .prop("disabled", true).select2();
            CKEDITOR.instances['charm_info'].setReadOnly(true);
            $("#btn_save_charm").addClass("d-none");
            $("#btn_open_modal_charmTag").addClass("d-none");
        }
        CharmDetailPage.blockUI.block();
        /*$("#global_loader").addClass("show");*/
        try {
            const response = await httpService.getAsync(ApiRoutes.Charm.v1.Detail(id));
            const data = response.resources;
            Object.keys(data).forEach(key => {
                const selector = `#charm_${key}`;
                const $el = $(selector);
                const rawValue = data[key];

                // CKEditor
                if (typeof CKEDITOR !== 'undefined' && CKEDITOR.instances[`charm_${key}`]) {
                    CKEDITOR.instances[`charm_${key}`].setData(rawValue ?? "");
                }
                // Checkbox
                else if ($el.is(':checkbox')) {
                    $el.prop("checked", rawValue === true).trigger("change");
                }
                // Ảnh
                else if (key.toLowerCase().includes("image") && key.toLowerCase().includes("path")) {
                    $el.css("background-image", `url('${rawValue}')`);
                }
                // Ngày
                else {
                    const value = key.toLowerCase().includes("date") && rawValue != null
                        ? moment(rawValue.toString()).format("DD/MM/YYYY HH:mm:ss")
                        : rawValue;
                    $el.val(value).trigger("change");
                }
            });
            //gán giá trị select cho select2

            //CharmStatus
            $("#charm_charmStatusId").val(data.charmStatus.id).trigger("change");

            //CharmType
            $("#charm_charmTypeId").val(data.charmType.id).trigger("change");

            //CharmCategory
            $("#charm_charmCategoryId").val(data.charmCategory.id).trigger("change");
            //CoverImage
            if (data.fileUpload) {
                $(".image-input").css("background-image", `unset`);
                $("#charm_fileUploadPath").css("background-image", `url('${data.fileUpload.fileKey}')`);
                $("#charm_fileUploadId").val(data.fileUpload.id);
            };
        } catch (e) {
            console.error(e);
            if (!e.responseJSON.isSucceeded && e.responseJSON.status === 404 && e.responseJSON.code === "CMN_404") {
                window.location.href = "/not-found";
            }
            Swal.fire({
                icon: "error",
                title: CharmDetailPage.message.errorTitle,
                html: CharmDetailPage.message.notFound,
                ...AppSettings.sweetAlertOptions(false)
            });
            $("#btn_save_charm, #btn_open_modal_charmTag").remove();
            $("#kt_modal_charm_form input, #kt_modal_charm_form textarea, #kt_modal_charm_form select")
                .prop("disabled", true);
            $('#charm_charmStatusId').prop('disabled', true).select2();
            $('#charm_charmTypeId').prop('disabled', true).select2();
            $('#charm_charmCategoryId').prop('disabled', true).select2();
            CKEDITOR.instances['charm_content'].setReadOnly(true);
        }
        finally {
            /*$("#global_loader").removeClass("show");*/
            AppUtils.formatNumberCurency();
            CharmDetailPage.blockUI.release();
        }
    }
    /**
     * Save data (Create or Update) charm
     */
    async function saveData() {
        const btnSave = $("#btn_save_charm");
        btnSave.attr("disabled", true);

        const columns = ["id", "name", "info", "description", "charmStatusId", "charmTypeId", "charmCategoryId", "code", "price", "maxCharm", "fileUploadId", "isBestSeller"];
        const data = {};
        columns.forEach(key => {
            const selector = `#charm_${key}`;
            const $el = $(selector);
            const dataType = $el.data('type');

            if ($el.is(':checkbox')) {
                data[key] = $el.is(':checked');
            }
            else if (key === "approvalDate") {
                const value = $el.val();
                data[key] = value ? moment(value, "DD/MM/YYYY HH:mm:ss").toISOString() : null;
            }
            else {
                let value = $el.val();

                if (dataType === 'currency') {
                    value = value.replace(/\./g, '').replace(/[^0-9\-]/g, '');
                    value = parseFloat(value) || 0;
                }

                data[key] = value;
            }
        });
        data.content = CKEDITOR.instances['charm_info'].getData();
        const isAdd = !data.id || data.id == 0;
        if (!isAdd && !CharmDetailPage.permissionFlags.canUpdate) {
            Swal.fire({
                icon: "warning",
                title: CharmDetailPage.message.warningTitle,
                html: CharmDetailPage.message.forbidden,
                ...AppSettings.sweetAlertOptions(false)
            });
            btnSave.removeAttr("disabled");
            return;
        }
        if (isAdd && !CharmDetailPage.permissionFlags.canCreate) {
            Swal.fire({
                icon: "warning",
                title: CharmDetailPage.message.warningTitle,
                html: CharmDetailPage.message.forbidden,
                ...AppSettings.sweetAlertOptions(false)
            });
            btnSave.removeAttr("disabled");
            return;
        }
        const confirmText = isAdd ? CharmDetailPage.message.createConfirm : CharmDetailPage.message.updateConfirm;
        const { isConfirmed } = await Swal.fire({
            icon: 'question',
            title: CharmDetailPage.message.confirmTittle,
            html: confirmText,
            ...AppSettings.sweetAlertOptions(true)
        });

        if (isConfirmed) {
            btnSave.attr("data-kt-indicator", "on");
            try {
                const response = isAdd ?
                    await httpService.postAsync(ApiRoutes.Charm.v1.Create, data) :
                    await httpService.putAsync(ApiRoutes.Charm.v1.Update, data);
                if (response?.isSucceeded) {
                    const successText = isAdd ? CharmDetailPage.message.createSuccess : CharmDetailPage.message.updateSuccess;
                    Swal.fire({
                        icon: "success",
                        title: CharmDetailPage.message.successTitle,
                        html: successText,
                        ...AppSettings.sweetAlertOptions(false)
                    }).then(result => {
                        //if (result.isConfirmed) {

                        //}
                        window.location.href = "/charm/list";
                    });
                }

            } catch (e) {
                const { responseJSON } = e;
                let errorText = "";
                let errorTitle = "";
                let icon = ""
                if (responseJSON?.status === AppSettings.httpStatusCode.UNPROCESSABLE_ENTITY) {
                    icon = "warning";
                    errorTitle = CharmDetailPage.message.validationError;

                    const messages = [];
                    responseJSON?.errors?.forEach(error => {
                        error.message.forEach(item => {
                            messages.push(`<li class="text-start">${item}</li>`);
                        })
                    });
                    errorText = `<ul>${messages.join("")}</ul>`;
                }
                else {
                    icon = "error";
                    errorTitle = CharmDetailPage.message.failTitle;
                    errorText = isAdd ? CharmDetailPage.message.createError : CharmDetailPage.message.updateError;
                }
                Swal.fire({
                    icon: icon,
                    title: errorTitle,
                    html: errorText,
                    ...AppSettings.sweetAlertOptions(false)
                });

            }
            finally {
                btnSave.removeAttr("data-kt-indicator");
            }
        }
        btnSave.removeAttr("disabled");
    }

    /**
    * load data CharmStatus
    */
    async function loadDataCharmStatus() {
        try {
            const response = await httpService.getAsync(ApiRoutes.CharmStatus.v1.List);
            const data = response.resources;
            data.forEach(function (item) {
                $("#charm_charmStatusId").append(new Option(AppUtils.escapeHtml(item.name), item.id, false, false));
            });
        } catch (e) {
            console.error(e);
        }
    }
    /**
   * load data CharmCategory
   */
    async function loadDataCharmCategory() {
        try {
            const response = await httpService.getAsync(ApiRoutes.CharmCategory.v1.List);
            const data = response.resources;
            data.forEach(function (item) {
                $("#charm_charmCategoryId").append(new Option(AppUtils.escapeHtml(item.name), item.id, false, false));
            });
        } catch (e) {
            console.error(e);
        }
    }
    /**
    * load data CharmCategory
    */
    async function loadDataCharmType() {
        try {
            const response = await httpService.getAsync(ApiRoutes.CharmType.v1.List);
            const data = response.resources;
            data.forEach(function (item) {
                $("#charm_charmTypeId").append(new Option(AppUtils.escapeHtml(item.name), item.id, false, false));
            });
        } catch (e) {
            console.error(e);
        }
    }
    /**
     * setup CKEDITOR
    */
    function setupCKUploadFile() {
        const buttonFileElement = $(".cke_dialog_image_url .cke_dialog_ui_hbox_last a");

        buttonFileElement.click(function () {
            CharmDetailPage.target = ".cke_dialog_image_url";
            FileManager.show();
        });
    }

    KTUtil.onDOMContentLoaded(async function () {
        await AppEntry.init();
        if (!CharmDetailPage.permissionFlags.canView) {
            AppSettings.mainElements.PAGE_CONTENT.addClass("d-none");
            AppSettings.mainElements.NOT_FOUND.removeClass("d-none");
        }
        else
            CharmDetailPage.init();
    });
})();




