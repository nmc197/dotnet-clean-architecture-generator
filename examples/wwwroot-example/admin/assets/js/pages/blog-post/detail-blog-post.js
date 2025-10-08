"use strict";
(function () {
    const BlogPostDetailPage = {
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
        permissionFlags: AppUtils.getPermissionFlags('/blog-post/list'),
        message: {
            pageTitle: I18n.t("blog_post", "PAGE_TITLE"),
            tagTitle: I18n.t("blog_post", "TAG_TITLE"),
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
            createConfirm: I18n.t("common", "CREATE_CONFIRM", { name: I18n.t("blog_post", "PAGE_TITLE").toLocaleLowerCase() }),
            createSuccess: I18n.t("common", "CREATE_SUCCESS", { name: I18n.t("blog_post", "PAGE_TITLE").toLocaleLowerCase() }),
            createError: I18n.t("common", "CREATE_ERROR", { name: I18n.t("blog_post", "PAGE_TITLE").toLocaleLowerCase() }),
            updateConfirm: I18n.t("common", "UPDATE_CONFIRM", { name: I18n.t("blog_post", "PAGE_TITLE").toLocaleLowerCase() }),
            updateSuccess: I18n.t("common", "UPDATE_SUCCESS", { name: I18n.t("blog_post", "PAGE_TITLE") }),
            updateError: I18n.t("common", "UPDATE_ERROR", { name: I18n.t("blog_post", "PAGE_TITLE").toLocaleLowerCase() }),
            deleteConfirm: I18n.t("common", "DELETE_CONFIRM", { name: I18n.t("blog_post", "PAGE_TITLE").toLocaleLowerCase() }),
            deleteSuccess: I18n.t("common", "DELETE_SUCCESS", { name: I18n.t("blog_post", "PAGE_TITLE").toLocaleLowerCase() }),
            deleteError: I18n.t("common", "DELETE_ERROR", { name: I18n.t("blog_post", "PAGE_TITLE").toLocaleLowerCase() }),
            notFound: I18n.t("common", "NOT_FOUND", { name: I18n.t("blog_post", "PAGE_TITLE").toLocaleLowerCase() }),
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
                formSelector: "#kt_modal_blog_post_form",
                handleSubmit: saveData,
                rules: [
                    {
                        element: "#blog_post_title",
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
                        element: "#blog_post_description",
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
                        element: "#blog_post_coverImageId",
                        rule: [
                            {
                                name: "required",
                                message: I18n.t("common", "REQUIRED", { field: "Ảnh bài viết" })
                            },
                        ]
                    },
                    {
                        element: "#blog_post_blogPostStatusId",
                        rule: [
                            {
                                name: "required",
                                message: I18n.t("common", "REQUIRED_SELECT", { field: "Trạng thái" })
                            },
                        ]
                    },
                    {
                        element: "#blog_post_blogPostLayoutId",
                        rule: [
                            {
                                name: "required",
                                message: I18n.t("common", "REQUIRED_SELECT", { field: "Bố cục" })
                            },
                        ]
                    },
                    {
                        element: "#blog_post_blogPostCategoryId",
                        rule: [
                            {
                                name: "required",
                                message: I18n.t("common", "REQUIRED_SELECT", { field: "Danh mục" })
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
            //BEGIN: DATETIMEPICKER
            this.plugins.dateTimepickerPublicationDate = new tempusDominus.TempusDominus(document.getElementById("blog_post_publicationDate"), {
                localization: {
                    locale: currentLang,
                    startOfTheWeek: 1,
                    format: "dd/MM/yyyy HH:mm:ss"
                }
            });


            //END: DATETIMEPICKER
            //BEGIN: CKEDITOR
            CKEDITOR.replace('blog_post_content');
            CKEDITOR.on('dialogDefinition', function (e) {
                const dialogName = e.data.name;
                const dialog = e.data.definition.dialog;
                dialog.on('show', function () {
                    setupCKUploadFile();
                });
            });
            //END: CKEDITOR
            //BEGIN: SELECT2
            $("#blog_post_blogPostStatusId").select2({
                language: currentLang,
                placeholder: 'Chọn trạng thái',
            });
            $("#blog_post_blogPostCategoryId").select2({
                language: currentLang,
                placeholder: 'Chọn danh mục',
            });
            $("#blog_post_blogPostLayoutId").select2({
                language: currentLang,
                placeholder: 'Chọn bố cục',
            });

            AppUtils.createSelect2("#blog_post_blogPostTagIds", {
                url: ApiRoutes.Tag.v1.Search,
                allowClear: true,
                cache: true,
                placeholder: 'Chọn nhãn',
                select2Options: {
                    closeOnSelect: false,
                },
                extraParams: {
                    tagTypeId: BlogPostDetailPage.variables.tagTypeBlogId
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
                directionId: BlogPostDetailPage.variables.id > 0 ? BlogPostDetailPage.variables.id : null,
                isGetAll: true,
                category: "BLOG_POST",
                onChooseFile: (file) => {
                    if (BlogPostDetailPage.target === "#coverImageId") {
                        $("#blog_post_coverImagePath").css("background-image", `url('${file.url}')`);
                        $("#blog_post_coverImageId").val(file.id);
                    }
                    else {
                        CKEDITOR.dialog.getCurrent().getContentElement('info', 'txtUrl').setValue(file.url);
                    }
                }
            });
            if (BlogPostDetailPage.variables.id > 0)
                editItem(BlogPostDetailPage.variables.id);
        },
        bindSaveEvent: function () {
            //$("#btn_save_blog_post").on("click", function (e) {
            //    e.preventDefault();
            //    saveData();
            //})
        },
        bindAddEvent: function () {
            $("#btn_open_modal_blogPostTag").on("click", function () {
                addItemBlogTag();
            })
        },
        bindApproveEvent: function () {
            $("#blog_post_isApproved").on("change", function () {
                if ($(this).is(":checked")) {
                    //$(this).attr("disabled", "disabled");
                    $("#blog_post_approvalDate").val(moment().format("DD/MM/YYYY HH:mm:ss")).trigger("change");
                    $("#blog_post_blogPostStatusId").val(1002).trigger("change");
                }
                else {
                    $("#blog_post_approvalDate").val("").trigger("change");
                    $("#blog_post_blogPostStatusId").val(1001).trigger("change");
                }
            });
        },
        bindChangeImageEvent: function () {
            $("#coverImageId").on("click", function (e) {
                e.preventDefault();
                FileManager.show();
                BlogPostDetailPage.target = "#coverImageId";
            });
        },
        bindLoadEvent: function () {
            $("#blog_post_createdDate").val(moment().format("DD/MM/YYYY HH:mm:ss")).trigger("change");
        },
        bindClearDatetimePickerEvent: function () {
            $("#clear_blog_post_publicationDate i").on("click", function () {
                BlogPostDetailPage.plugins.dateTimepickerPublicationDate.clear();
            })
            $("#clear_blog_post_publicationDate").on("click", function () {
                BlogPostDetailPage.plugins.dateTimepickerPublicationDate.clear();
            })
        },
        loadRelatedData: async function () {
            await loadDataBlogPostStatus();
            await loadDataBlogPostCategory();
            await loadDataBlogPostLayout();
            await loadDataTagTypes();
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
        //BlogPostDetailPage.formValidator.clearErrors();
        if (!BlogPostDetailPage.permissionFlags.canUpdate) {
            $("#kt_modal_blog_post_form input, #kt_modal_blog_post_form textarea, #kt_modal_blog_post_form select")
                .prop("disabled", true);
            $("#blog_post_blogPostStatusId, #blog_post_blogPostCategoryId, #blog_post_blogPostLayoutId, #blog_post_blogPostTagIds")
                .prop("disabled", true).select2();
            CKEDITOR.instances['blog_post_content'].setReadOnly(true);
            $("#btn_save_blog_post").addClass("d-none");
            $("#btn_open_modal_blogPostTag").addClass("d-none");
        }
        BlogPostDetailPage.blockUI.block();
        /*$("#global_loader").addClass("show");*/
        try {
            const response = await httpService.getAsync(ApiRoutes.BlogPost.v1.Detail(id));
            const data = response.resources;
            Object.keys(data).forEach(key => {
                const selector = `#blog_post_${key}`;
                const $el = $(selector);
                const rawValue = data[key];

                // CKEditor
                if (typeof CKEDITOR !== 'undefined' && CKEDITOR.instances[`blog_post_${key}`]) {
                    CKEDITOR.instances[`blog_post_${key}`].setData(rawValue ?? "");
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

            //BlogPostStatus
            $("#blog_post_blogPostStatusId").val(data.blogPostStatus.id).trigger("change");

            //BlogPostLayout
            $("#blog_post_blogPostLayoutId").val(data.blogPostLayout.id).trigger("change");

            //BlogPostCategory
            $("#blog_post_blogPostCategoryId").val(data.blogCategory.id).trigger("change");


            //BlogTags
            data.blogPostTagIds.forEach(item => {
                if ($("#blog_post_blogPostTagIds").find("option[value='" + item.id + "']").length === 0) {
                    const newOption = new Option(item.name, item.id, true, true);
                    $("#blog_post_blogPostTagIds").append(newOption);
                }
            });
            $("#blog_post_blogPostTagIds").val(data.blogPostTagIds.map(item => item.id)).trigger("change");
            //CoverImage
            if (data.coverImage) {
                $("#blog_post_coverImagePath").css("background-image", `url('${data.coverImage.fileKey}')`);
                $("#blog_post_coverImageId").val(data.coverImage.id);
            };
        } catch (e) {
            console.error(e);
            if (!e.responseJSON.isSucceeded && e.responseJSON.status === 404 && e.responseJSON.code === "CMN_404") {
                window.location.href = "/not-found";
            }
            Swal.fire({
                icon: "error",
                title: BlogPostDetailPage.message.errorTitle,
                html: BlogPostDetailPage.message.notFound,
                ...AppSettings.sweetAlertOptions(false)
            });
            $("#btn_save_blog_post, #btn_open_modal_blogPostTag").remove();
            $("#kt_modal_blog_post_form input, #kt_modal_blog_post_form textarea, #kt_modal_blog_post_form select")
                .prop("disabled", true);
            $('#blog_post_blogPostStatusId').prop('disabled', true).select2();
            $('#blog_post_blogPostLayoutId').prop('disabled', true).select2();
            $('#blog_post_blogPostCategoryId').prop('disabled', true).select2();
            $('#blog_post_blogPostTagIds').prop('disabled', true).select2();
            CKEDITOR.instances['blog_post_content'].setReadOnly(true);
        }
        finally {
            /*$("#global_loader").removeClass("show");*/
            BlogPostDetailPage.blockUI.release();
        }
    }
    /**
     * Save data (Create or Update) blogpost
     */
    async function saveData() {
        const btnSave = $("#btn_save_blog_post");
        btnSave.attr("disabled", true);

        const columns = ["id", "authorId", "coverImageId", "title", "content", "description", "blogPostStatusId", "blogPostLayoutId", "blogPostCategoryId", "blogPostTagIds", "isApproved", "isPopular", "isShowOnHomePage", "approvalDate", "publicationDate"];
        const data = {};
        columns.forEach(key => {
            const selector = `#blog_post_${key}`;
            const $el = $(selector);

            if ($el.is(':checkbox')) {
                data[key] = $el.is(':checked');
            }
            else if (key === "approvalDate") {
                const value = $el.val();
                data[key] = value ? moment(value, "DD/MM/YYYY HH:mm:ss").toISOString() : null;
            }
            else {
                data[key] = $el.val();
            }
        });
        data.content = CKEDITOR.instances['blog_post_content'].getData();
        const isAdd = !data.id || data.id == 0;
        if (!isAdd && !BlogPostDetailPage.permissionFlags.canUpdate) {
            Swal.fire({
                icon: "warning",
                title: BlogPostDetailPage.message.warningTitle,
                html: BlogPostDetailPage.message.forbidden,
                ...AppSettings.sweetAlertOptions(false)
            });
            btnSave.removeAttr("disabled");
            return;
        }
        if (isAdd && !BlogPostDetailPage.permissionFlags.canCreate) {
            Swal.fire({
                icon: "warning",
                title: BlogPostDetailPage.message.warningTitle,
                html: BlogPostDetailPage.message.forbidden,
                ...AppSettings.sweetAlertOptions(false)
            });
            btnSave.removeAttr("disabled");
            return;
        }
        const confirmText = isAdd ? BlogPostDetailPage.message.createConfirm : BlogPostDetailPage.message.updateConfirm;
        const { isConfirmed } = await Swal.fire({
            icon: 'question',
            title: BlogPostDetailPage.message.confirmTittle,
            html: confirmText,
            ...AppSettings.sweetAlertOptions(true)
        });

        if (isConfirmed) {
            btnSave.attr("data-kt-indicator", "on");
            try {
                const response = isAdd ?
                    await httpService.postAsync(ApiRoutes.BlogPost.v1.Create, data) :
                    await httpService.putAsync(ApiRoutes.BlogPost.v1.Update, data);
                if (response?.isSucceeded) {
                    const successText = isAdd ? BlogPostDetailPage.message.createSuccess : BlogPostDetailPage.message.updateSuccess;
                    Swal.fire({
                        icon: "success",
                        title: BlogPostDetailPage.message.successTitle,
                        html: successText,
                        ...AppSettings.sweetAlertOptions(false)
                    }).then(result => {
                        //if (result.isConfirmed) {

                        //}
                        window.location.href = "/blog-post/list";
                    });
                }

            } catch (e) {
                const { responseJSON } = e;
                let errorText = "";
                let errorTitle = "";
                let icon = ""
                if (responseJSON?.status === AppSettings.httpStatusCode.UNPROCESSABLE_ENTITY) {
                    icon = "warning";
                    errorTitle = BlogPostDetailPage.message.validationError;

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
                    errorTitle = BlogPostDetailPage.message.failTitle;
                    errorText = isAdd ? BlogPostDetailPage.message.createError : BlogPostDetailPage.message.updateError;
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
    * load data BlogPostStatus
    */
    async function loadDataBlogPostStatus() {
        try {
            const response = await httpService.getAsync(ApiRoutes.BlogPostStatus.v1.List);
            const data = response.resources;
            data.forEach(function (item) {
                $("#blog_post_blogPostStatusId").append(new Option(AppUtils.escapeHtml(item.name), item.id, false, false));
            });
        } catch (e) {
            console.error(e);
        }
    }
    /**
   * load data BlogPostCategory
   */
    async function loadDataBlogPostCategory() {
        try {
            const response = await httpService.getAsync(ApiRoutes.BlogPostCategory.v1.List);
            const data = response.resources;
            data.forEach(function (item) {
                $("#blog_post_blogPostCategoryId").append(new Option(AppUtils.escapeHtml(item.name), item.id, false, false));
            });
        } catch (e) {
            console.error(e);
        }
    }
    /**
    * load data BlogPostCategory
    */
    async function loadDataBlogPostLayout() {
        try {
            const response = await httpService.getAsync(ApiRoutes.BlogPostLayout.v1.List);
            const data = response.resources;
            data.forEach(function (item) {
                $("#blog_post_blogPostLayoutId").append(new Option(AppUtils.escapeHtml(item.name), item.id, false, false));
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
            BlogPostDetailPage.target = ".cke_dialog_image_url";
            FileManager.show();
        });
    }

    /**
    * Handle add new blog tag
    */
    function addItemBlogTag() {
        BlogPostDetailPage.formValidatorBlogTag.clearErrors();
        $("#kt_modal_tag_header h2").text(`${BlogPostDetailPage.messageBlogTag.create} ${BlogPostDetailPage.messageBlogTag.pageTitle.toLocaleLowerCase()}`);
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
        const confirmText = isAdd ? BlogPostDetailPage.messageBlogTag.createConfirm : BlogPostDetailPage.messageBlogTag.updateConfirm;
        const { isConfirmed } = await Swal.fire({
            icon: 'question',
            title: BlogPostDetailPage.messageBlogTag.confirmTittle,
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
                    var selectElement = $("#blog_post_blogPostTagIds");
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
                    const successText = isAdd ? BlogPostDetailPage.messageBlogTag.createSuccess : BlogPostDetailPage.messageBlogTag.updateSuccess;
                    Swal.fire({
                        icon: "success",
                        title: BlogPostDetailPage.messageBlogTag.successTitle,
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
                    errorTitle = BlogPostDetailPage.messageBlogTag.validationError;

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
                    errorTitle = BlogPostDetailPage.messageBlogTag.failTitle;
                    errorText = isAdd ? BlogPostDetailPage.messageBlogTag.createError : BlogPostDetailPage.messageBlogTag.updateError;
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
        if (!BlogPostDetailPage.permissionFlags.canView) {
            AppSettings.mainElements.PAGE_CONTENT.addClass("d-none");
            AppSettings.mainElements.NOT_FOUND.removeClass("d-none");
        }
        else
            BlogPostDetailPage.init();
    });
})();




