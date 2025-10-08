"use strict";
(function () {
    const BraceletDetailPage = {
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
        permissionFlags: AppUtils.getPermissionFlags('/bracelet/list'),
        message: {
            pageTitle: I18n.t("bracelet", "PAGE_TITLE"),
            tagTitle: I18n.t("bracelet", "TAG_TITLE"),
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
            createConfirm: I18n.t("common", "CREATE_CONFIRM", { name: I18n.t("bracelet", "PAGE_TITLE").toLocaleLowerCase() }),
            createSuccess: I18n.t("common", "CREATE_SUCCESS", { name: I18n.t("bracelet", "PAGE_TITLE").toLocaleLowerCase() }),
            createError: I18n.t("common", "CREATE_ERROR", { name: I18n.t("bracelet", "PAGE_TITLE").toLocaleLowerCase() }),
            updateConfirm: I18n.t("common", "UPDATE_CONFIRM", { name: I18n.t("bracelet", "PAGE_TITLE").toLocaleLowerCase() }),
            updateSuccess: I18n.t("common", "UPDATE_SUCCESS", { name: I18n.t("bracelet", "PAGE_TITLE") }),
            updateError: I18n.t("common", "UPDATE_ERROR", { name: I18n.t("bracelet", "PAGE_TITLE").toLocaleLowerCase() }),
            deleteConfirm: I18n.t("common", "DELETE_CONFIRM", { name: I18n.t("bracelet", "PAGE_TITLE").toLocaleLowerCase() }),
            deleteSuccess: I18n.t("common", "DELETE_SUCCESS", { name: I18n.t("bracelet", "PAGE_TITLE").toLocaleLowerCase() }),
            deleteError: I18n.t("common", "DELETE_ERROR", { name: I18n.t("bracelet", "PAGE_TITLE").toLocaleLowerCase() }),
            notFound: I18n.t("common", "NOT_FOUND", { name: I18n.t("bracelet", "PAGE_TITLE").toLocaleLowerCase() }),
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
                formSelector: "#kt_modal_bracelet_form",
                handleSubmit: saveData,
                rules: [
                    {
                        element: "#bracelet_title",
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
                        element: "#bracelet_description",
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
                        element: "#bracelet_braceletImageId",
                        rule: [
                            {
                                name: "image",
                                message: I18n.t("common", "REQUIRED", { field: "Ảnh bài viết" })
                            },
                        ]
                    },
                    {
                        element: "#bracelet_braceletStatusId",
                        rule: [
                            {
                                name: "required",
                                message: I18n.t("common", "REQUIRED_SELECT", { field: "Trạng thái" })
                            },
                        ]
                    },
                    {
                        element: "#bracelet_braceletTypeId",
                        rule: [
                            {
                                name: "required",
                                message: I18n.t("common", "REQUIRED_SELECT", { field: "Loại vòng" })
                            },
                        ]
                    },
                    {
                        element: "#bracelet_braceletCategoryId",
                        rule: [
                            {
                                name: "required",
                                message: I18n.t("common", "REQUIRED_SELECT", { field: "Danh mục" })
                            },
                        ]
                    },
                    {
                        element: "#bracelet_code",
                        rule: [
                            {
                                name: "required",
                                message: I18n.t("common", "REQUIRED", { field: "Mã phân loại" })
                            },
                        ]
                    },
                    {
                        element: "#bracelet_maxCharm",
                        rule: [
                            {
                                name: "required",
                                message: I18n.t("common", "REQUIRED", { field: "Số lượng charm" })
                            },
                        ]
                    },
                    {
                        element: "#bracelet_price",
                        rule: [
                            {
                                name: "required",
                                message: I18n.t("common", "REQUIRED", { field: "Giá tiền" })
                            },
                        ]
                    }

                ]
            });
            this.formValidatorBlogTag = new FormValidator({
                formSelector: "#kt_modal_tag_form",
                handleSubmit: saveDataBlogTag,
                rules: [
                    {
                        element: "#tag_name",
                        rule: [
                            {
                                name: "required",
                                message: I18n.t("common", "REQUIRED", { field: "Tên" })
                            },
                            {
                                name: "maxLength",
                                message: I18n.t("common", "TOO_LONG", { field: "Tên", max: 255 }),
                                params: 255
                            },
                        ]

                    },
                    {
                        element: "#tag_description",
                        rule: [
                            {
                                name: "maxLength",
                                message: I18n.t("common", "TOO_LONG", { field: "Mô tả", max: 500 }),
                                params: 500,
                                allowNullOrEmpty: true
                            }
                        ]

                    },
                    {
                        element: "#tag_tagTypeId",
                        rule: [
                            {
                                name: "required",
                                message: I18n.t("common", "REQUIRED_SELECT", { field: "Loại nhãn" })
                            }
                        ]

                    },
                ]
            });
        },
        initPlugins: function () {
            //BEGIN: CKEDITOR
            CKEDITOR.replace('bracelet_info');
            CKEDITOR.on('dialogDefinition', function (e) {
                const dialogName = e.data.name;
                const dialog = e.data.definition.dialog;
                dialog.on('show', function () {
                    setupCKUploadFile();
                });
            });
            //END: CKEDITOR
            //BEGIN: SELECT2
            $("#bracelet_braceletStatusId").select2({
                language: currentLang,
                placeholder: 'Chọn trạng thái',
            });
            $("#bracelet_braceletCategoryId").select2({
                language: currentLang,
                placeholder: 'Chọn danh mục',
            });
            $("#bracelet_braceletTypeId").select2({
                language: currentLang,
                placeholder: 'Chọn loại vòng',
            });

            AppUtils.createSelect2("#bracelet_braceletTagIds", {
                url: ApiRoutes.Tag.v1.Search,
                allowClear: true,
                cache: true,
                placeholder: 'Chọn nhãn',
                select2Options: {
                    closeOnSelect: false,
                },
                extraParams: {
                    tagTypeId: BraceletDetailPage.variables.tagTypeBlogId
                }
            });

            $("#tag_tagTypeId").select2({
                language: currentLang,
                placeholder: 'Chọn loại nhãn',
                dropdownParent: "#kt_modal_tag",
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
                directionId: BraceletDetailPage.variables.id > 0 ? BraceletDetailPage.variables.id : null,
                isGetAll: true,
                category: "BRACELET",
                onChooseFile: (file) => {
                    if (BraceletDetailPage.target === "#braceletImageId") {
                        $("#bracelet_braceletImagePath").css("background-image", `url('${file.url}')`);
                        $(".image-input").css("background-image", `unset`);
                        $("#bracelet_braceletImageId").val(file.id);
                    }
                    else {
                        CKEDITOR.dialog.getCurrent().getContentElement('info', 'txtUrl').setValue(file.url);
                    }
                }
            });
            if (BraceletDetailPage.variables.id > 0)
                editItem(BraceletDetailPage.variables.id);
        },
        bindSaveEvent: function () {
            //$("#btn_save_bracelet").on("click", function (e) {
            //    e.preventDefault();
            //    saveData();
            //})
        },
        bindAddEvent: function () {
            $("#btn_open_modal_braceletTag").on("click", function () {
                addItemBlogTag();
            })
        },
        bindApproveEvent: function () {
            $("#bracelet_isApproved").on("change", function () {
                if ($(this).is(":checked")) {
                    //$(this).attr("disabled", "disabled");
                    $("#bracelet_approvalDate").val(moment().format("DD/MM/YYYY HH:mm:ss")).trigger("change");
                    $("#bracelet_braceletStatusId").val(1002).trigger("change");
                }
                else {
                    $("#bracelet_approvalDate").val("").trigger("change");
                    $("#bracelet_braceletStatusId").val(1001).trigger("change");
                }
            });
        },
        bindChangeImageEvent: function () {
            $("#braceletImageId").on("click", function (e) {
                e.preventDefault();
                FileManager.show();
                BraceletDetailPage.target = "#braceletImageId";
            });
        },
        bindLoadEvent: function () {
            $("#bracelet_createdDate").val(moment().format("DD/MM/YYYY HH:mm:ss")).trigger("change");
        },
        bindClearDatetimePickerEvent: function () {
            $("#clear_bracelet_publicationDate i").on("click", function () {
                BraceletDetailPage.plugins.dateTimepickerPublicationDate.clear();
            })
            $("#clear_bracelet_publicationDate").on("click", function () {
                BraceletDetailPage.plugins.dateTimepickerPublicationDate.clear();
            })
        },
        loadRelatedData: async function () {
            await loadDataBraceletStatus();
            await loadDataBraceletCategory();
            await loadDataBraceletType();
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
        //BraceletDetailPage.formValidator.clearErrors();
        if (!BraceletDetailPage.permissionFlags.canUpdate) {
            $("#kt_modal_bracelet_form input, #kt_modal_bracelet_form textarea, #kt_modal_bracelet_form select")
                .prop("disabled", true);
            $("#bracelet_braceletStatusId, #bracelet_braceletCategoryId, #bracelet_braceletTypeId, #bracelet_braceletTagIds")
                .prop("disabled", true).select2();
            CKEDITOR.instances['bracelet_info'].setReadOnly(true);
            $("#btn_save_bracelet").addClass("d-none");
            $("#btn_open_modal_braceletTag").addClass("d-none");
        }
        BraceletDetailPage.blockUI.block();
        /*$("#global_loader").addClass("show");*/
        try {
            const response = await httpService.getAsync(ApiRoutes.Bracelet.v1.Detail(id));
            const data = response.resources;
            Object.keys(data).forEach(key => {
                const selector = `#bracelet_${key}`;
                const $el = $(selector);
                const rawValue = data[key];

                // CKEditor
                if (typeof CKEDITOR !== 'undefined' && CKEDITOR.instances[`bracelet_${key}`]) {
                    CKEDITOR.instances[`bracelet_${key}`].setData(rawValue ?? "");
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

            //BraceletStatus
            $("#bracelet_braceletStatusId").val(data.braceletStatus.id).trigger("change");

            //BraceletType
            $("#bracelet_braceletTypeId").val(data.braceletType.id).trigger("change");

            //BraceletCategory
            $("#bracelet_braceletCategoryId").val(data.braceletCategory.id).trigger("change");
            //CoverImage
            if (data.braceletImage) {
                $(".image-input").css("background-image", `unset`);
                $("#bracelet_braceletImagePath").css("background-image", `url('${data.braceletImage.fileKey}')`);
                $("#bracelet_braceletImageId").val(data.braceletImage.id);
            };
        } catch (e) {
            console.error(e);
            if (!e.responseJSON.isSucceeded && e.responseJSON.status === 404 && e.responseJSON.code === "CMN_404") {
                window.location.href = "/not-found";
            }
            Swal.fire({
                icon: "error",
                title: BraceletDetailPage.message.errorTitle,
                html: BraceletDetailPage.message.notFound,
                ...AppSettings.sweetAlertOptions(false)
            });
            $("#btn_save_bracelet, #btn_open_modal_braceletTag").remove();
            $("#kt_modal_bracelet_form input, #kt_modal_bracelet_form textarea, #kt_modal_bracelet_form select")
                .prop("disabled", true);
            $('#bracelet_braceletStatusId').prop('disabled', true).select2();
            $('#bracelet_braceletTypeId').prop('disabled', true).select2();
            $('#bracelet_braceletCategoryId').prop('disabled', true).select2();
            CKEDITOR.instances['bracelet_content'].setReadOnly(true);
        }
        finally {
            /*$("#global_loader").removeClass("show");*/
            AppUtils.formatNumberCurency();
            BraceletDetailPage.blockUI.release();
        }
    }
    /**
     * Save data (Create or Update) bracelet
     */
    async function saveData() {
        const btnSave = $("#btn_save_bracelet");
        btnSave.attr("disabled", true);

        const columns = ["id", "name", "info", "description", "braceletStatusId", "braceletTypeId", "braceletCategoryId", "code", "price", "maxCharm", "braceletImageId", "isBestSeller"];
        const data = {};
        columns.forEach(key => {
            const selector = `#bracelet_${key}`;
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
        data.content = CKEDITOR.instances['bracelet_info'].getData();
        const isAdd = !data.id || data.id == 0;
        if (!isAdd && !BraceletDetailPage.permissionFlags.canUpdate) {
            Swal.fire({
                icon: "warning",
                title: BraceletDetailPage.message.warningTitle,
                html: BraceletDetailPage.message.forbidden,
                ...AppSettings.sweetAlertOptions(false)
            });
            btnSave.removeAttr("disabled");
            return;
        }
        if (isAdd && !BraceletDetailPage.permissionFlags.canCreate) {
            Swal.fire({
                icon: "warning",
                title: BraceletDetailPage.message.warningTitle,
                html: BraceletDetailPage.message.forbidden,
                ...AppSettings.sweetAlertOptions(false)
            });
            btnSave.removeAttr("disabled");
            return;
        }
        const confirmText = isAdd ? BraceletDetailPage.message.createConfirm : BraceletDetailPage.message.updateConfirm;
        const { isConfirmed } = await Swal.fire({
            icon: 'question',
            title: BraceletDetailPage.message.confirmTittle,
            html: confirmText,
            ...AppSettings.sweetAlertOptions(true)
        });

        if (isConfirmed) {
            btnSave.attr("data-kt-indicator", "on");
            try {
                const response = isAdd ?
                    await httpService.postAsync(ApiRoutes.Bracelet.v1.Create, data) :
                    await httpService.putAsync(ApiRoutes.Bracelet.v1.Update, data);
                if (response?.isSucceeded) {
                    const successText = isAdd ? BraceletDetailPage.message.createSuccess : BraceletDetailPage.message.updateSuccess;
                    Swal.fire({
                        icon: "success",
                        title: BraceletDetailPage.message.successTitle,
                        html: successText,
                        ...AppSettings.sweetAlertOptions(false)
                    }).then(result => {
                        //if (result.isConfirmed) {

                        //}
                        window.location.href = "/bracelet/list";
                    });
                }

            } catch (e) {
                const { responseJSON } = e;
                let errorText = "";
                let errorTitle = "";
                let icon = ""
                if (responseJSON?.status === AppSettings.httpStatusCode.UNPROCESSABLE_ENTITY) {
                    icon = "warning";
                    errorTitle = BraceletDetailPage.message.validationError;

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
                    errorTitle = BraceletDetailPage.message.failTitle;
                    errorText = isAdd ? BraceletDetailPage.message.createError : BraceletDetailPage.message.updateError;
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
    * load data BraceletStatus
    */
    async function loadDataBraceletStatus() {
        try {
            const response = await httpService.getAsync(ApiRoutes.BraceletStatus.v1.List);
            const data = response.resources;
            data.forEach(function (item) {
                $("#bracelet_braceletStatusId").append(new Option(AppUtils.escapeHtml(item.name), item.id, false, false));
            });
        } catch (e) {
            console.error(e);
        }
    }
    /**
   * load data BraceletCategory
   */
    async function loadDataBraceletCategory() {
        try {
            const response = await httpService.getAsync(ApiRoutes.BraceletCategory.v1.List);
            const data = response.resources;
            data.forEach(function (item) {
                $("#bracelet_braceletCategoryId").append(new Option(AppUtils.escapeHtml(item.name), item.id, false, false));
            });
        } catch (e) {
            console.error(e);
        }
    }
    /**
    * load data BraceletCategory
    */
    async function loadDataBraceletType() {
        try {
            const response = await httpService.getAsync(ApiRoutes.BraceletType.v1.List);
            const data = response.resources;
            data.forEach(function (item) {
                $("#bracelet_braceletTypeId").append(new Option(AppUtils.escapeHtml(item.name), item.id, false, false));
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
            BraceletDetailPage.target = ".cke_dialog_image_url";
            FileManager.show();
        });
    }

    /**
    * Handle add new blog tag
    */
    function addItemBlogTag() {
        BraceletDetailPage.formValidatorBlogTag.clearErrors();
        $("#kt_modal_tag_header h2").text(`${BraceletDetailPage.messageBlogTag.create} ${BraceletDetailPage.messageBlogTag.pageTitle.toLocaleLowerCase()}`);
        $("#kt_modal_tag_form input[type='text'],#kt_modal_tag_form textarea, #kt_modal_tag_form select").val("").trigger("change");
        $("#tag_createdDate").val(moment().format("DD/MM/YYYY HH:mm:ss")).trigger("change");
        $("#kt_modal_tag").modal("show");
    }

    /**
     * Save data (Create or Update) blog tag
     */
    async function saveDataBlogTag() {

        const btnSave = $("#btn_save_tag");
        btnSave.attr("disabled", true);

        const columns = ["id", "name", "description", "tagTypeId"];
        const data = {};
        columns.forEach(key => {
            const selector = `#tag_${key}`;
            data[key] = $(selector).val();
        });
        const isAdd = !data.id;
        const confirmText = isAdd ? BraceletDetailPage.messageBlogTag.createConfirm : BraceletDetailPage.messageBlogTag.updateConfirm;
        const { isConfirmed } = await Swal.fire({
            icon: 'question',
            title: BraceletDetailPage.messageBlogTag.confirmTittle,
            html: confirmText,
            ...AppSettings.sweetAlertOptions(true)
        });

        if (isConfirmed) {
            btnSave.attr("data-kt-indicator", "on");
            try {
                const response = isAdd ?
                    await httpService.postAsync(ApiRoutes.Tag.v1.Create, data) :
                    await httpService.putAsync(ApiRoutes.Tag.v1.Update, data);
                if (response?.isSucceeded) {
                    var selectElement = $("#bracelet_braceletTagIds");
                    var currentTag = selectElement.val() || [];

                    // Đảm bảo currentTag là mảng
                    if (!Array.isArray(currentTag)) {
                        currentTag = [currentTag];
                    }

                    var newTagId = response.resources.toString();

                    if (isAdd) {
                        // Nếu tag chưa có trong danh sách option thì thêm mới
                        if (selectElement.find("option[value='" + newTagId + "']").length === 0) {
                            selectElement.append(new Option(data.name, newTagId, false, false));
                        }

                        // Nếu chưa có trong danh sách đã chọn thì thêm vào
                        if (!currentTag.includes(newTagId)) {
                            currentTag.push(newTagId);
                        }
                    } else {
                        // Xoá tag nếu đang tồn tại
                        currentTag = currentTag.filter(id => id !== newTagId);
                    }

                    // Cập nhật lại Select2
                    selectElement.val(currentTag).trigger("change");



                    $("#kt_modal_tag").modal("hide");
                    const successText = isAdd ? BraceletDetailPage.messageBlogTag.createSuccess : BraceletDetailPage.messageBlogTag.updateSuccess;
                    Swal.fire({
                        icon: "success",
                        title: BraceletDetailPage.messageBlogTag.successTitle,
                        html: successText,
                        ...AppSettings.sweetAlertOptions(false)
                    });
                }

            } catch (e) {
                const { responseJSON } = e;
                let errorText = "";
                let errorTitle = "";
                let icon = ""
                if (responseJSON?.status === AppSettings.httpStatusCode.UNPROCESSABLE_ENTITY) {
                    icon = "warning";
                    errorTitle = BraceletDetailPage.messageBlogTag.validationError;

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
                    errorTitle = BraceletDetailPage.messageBlogTag.failTitle;
                    errorText = isAdd ? BraceletDetailPage.messageBlogTag.createError : BraceletDetailPage.messageBlogTag.updateError;
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
    * Load data TagType
    */
    async function loadDataTagTypes() {
        try {
            const response = await httpService.getAsync(ApiRoutes.TagType.v1.List);
            const data = response.resources;
            data.forEach(function (item) {
                $("#tag_tagTypeId").append(new Option(item.name, item.id, false, false));
            });
        } catch (e) {
            console.error(e);
        }
    }

    KTUtil.onDOMContentLoaded(async function () {
        await AppEntry.init();
        if (!BraceletDetailPage.permissionFlags.canView) {
            AppSettings.mainElements.PAGE_CONTENT.addClass("d-none");
            AppSettings.mainElements.NOT_FOUND.removeClass("d-none");
        }
        else
            BraceletDetailPage.init();
    });
})();




