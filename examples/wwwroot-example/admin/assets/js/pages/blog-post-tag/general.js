"use strict";

(function () {
    // Class definition
    const BlogPostTagPage = {
        table: null,
        formValidator: null,
        plugins: {
            dateRangePickerFilter: null
        },
        permissionFlags: AppUtils.getPermissionFlags(),
        message: {
            pageTitle: I18n.t("blog_post_tag", "PAGE_TITLE"),
            actions: I18n.t("common", "ACTIONS"),
            create: I18n.t("common", "ADD_NEW"),
            edit: I18n.t("common", "EDIT"),
            delete: I18n.t("common", "DELETE"),
            detail: I18n.t("common", "DETAIL"),
            forbidden: I18n.t("common", "FORBIDDEN"),
            cancel: I18n.t("common", "CANCEL"),
            ok: I18n.t("common", "OK"),
            confirmTittle: I18n.t("common", "CONFIRM_TITLE"),
            successTitle: I18n.t("common", "SUCCESS_TITLE"),
            errorTitle: I18n.t("common", "ERROR_TITLE"),
            failTitle: I18n.t("common", "FAIL_TITLE"),
            warningTitle: I18n.t("common", "WARNING_TITLE"),
            createConfirm: I18n.t("common", "CREATE_CONFIRM", { name: I18n.t("blog_post_tag", "PAGE_TITLE").toLocaleLowerCase() }),
            createSuccess: I18n.t("common", "CREATE_SUCCESS", { name: I18n.t("blog_post_tag", "PAGE_TITLE").toLocaleLowerCase() }),
            createError: I18n.t("common", "CREATE_ERROR", { name: I18n.t("blog_post_tag", "PAGE_TITLE").toLocaleLowerCase() }),
            updateConfirm: I18n.t("common", "UPDATE_CONFIRM", { name: I18n.t("blog_post_tag", "PAGE_TITLE").toLocaleLowerCase() }),
            updateSuccess: I18n.t("common", "UPDATE_SUCCESS", { name: I18n.t("blog_post_tag", "PAGE_TITLE") }),
            updateError: I18n.t("common", "UPDATE_ERROR", { name: I18n.t("blog_post_tag", "PAGE_TITLE").toLocaleLowerCase() }),
            deleteConfirm: I18n.t("common", "DELETE_CONFIRM", { name: I18n.t("blog_post_tag", "PAGE_TITLE").toLocaleLowerCase() }),
            deleteSuccess: I18n.t("common", "DELETE_SUCCESS", { name: I18n.t("blog_post_tag", "PAGE_TITLE").toLocaleLowerCase() }),
            deleteError: I18n.t("common", "DELETE_ERROR", { name: I18n.t("blog_post_tag", "PAGE_TITLE").toLocaleLowerCase() }),
            notFound: I18n.t("common", "NOT_FOUND", { name: I18n.t("blog_post_tag", "PAGE_TITLE").toLocaleLowerCase() }),
            validationError: I18n.t("common", "VALIDATION_ERROR"),
        },
        init: function () {
            this.initPlugins();
            this.initDataTable();
            this.loadRelatedData();
            this.checkPermissions();
            this.bindEvents();
            this.formValidator = new FormValidator({
                formSelector: "#kt_modal_tag_form",
                handleSubmit: saveData,
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
                    //{
                    //    element: "#tag_tagTypeId",
                    //    rule: [
                    //        {
                    //            name: "required",
                    //            message: I18n.t("common", "REQUIRED_SELECT", { field: "Loại nhãn" })
                    //        }
                    //    ]

                    //},
                ]
            });
        },
        initDataTable: function () {
            this.table = $("#tag_datatable").DataTable({
                processing: true,
                serverSide: true,
                paging: true,
                searching: { regex: true },
                order: [3, 'desc'],
                language: AppSettings.dataTableLanguage.vi,
                ajax: {
                    url: ApiRoutes.Tag.v1.PagedAdvanced,
                    type: "POST",
                    contentType: "application/json",
                    dataType: "json",
                    headers: {
                        'Authorization': 'Bearer ' + TokenService.getAccessToken()
                    },
                    error: async function (xhr, status, error) {
                        if (xhr.status === 401) {
                            // Token hết hạn
                            await TokenService.refreshToken();
                            //Cập nhật lại Authorization header trong cấu hình DataTable
                            const tableSettings = BlogPostTagPage.table.settings()[0];
                            tableSettings.ajax.headers.Authorization = "Bearer " + TokenService.getAccessToken();

                            //Reload lại datatable với token mới
                            BlogPostTagPage.table.ajax.reload();
                        }
                    },
                    data: function (d) {
                        d.isIncludeTagType = false;
                        d.tagTypeIds = [AppSettings.tagTypes.BLOG_POST];
                        return JSON.stringify(d);
                    },
                    dataSrc: {
                        data: 'resources.data',
                        draw: 'resources.draw',
                        recordsTotal: 'resources.recordsTotal',
                        recordsFiltered: 'resources.recordsFiltered'
                    }

                },
                columns: [
                    {
                        data: 'id',
                        render: function (data, type, row, meta) {
                            const info = BlogPostTagPage.table.page.info();
                            const index = meta.row + 1 + info.page * info.length;
                            return index; // This contains the row index
                        }
                    },

                    {
                        data: "name",
                        render: function (data, type, row, meta) {
                            return `<span class='text-gray-800 text-hover-primary mb-1' data-tag-id='${row.id}'>${AppUtils.escapeHtml(row.name)}<span>`;
                        },
                    },
                    {
                        data: "description",
                        render: function (data, type, row, meta) {
                            return `<span data-tag-id='${row.id}'>${AppUtils.escapeHtml(row.description).replaceAll("\n", "<br>")}<span>`;
                        },
                    },
                    //{
                    //    data: "tagTypeName",
                    //    render: function (data, type, row, meta) {
                    //        return `<span class='text-gray-800 text-hover-primary mb-1' data-tag-id='${row.id}'>${row.tagTypeName}<span>`;
                    //    },
                    //},
                    {
                        data: "createdDate",
                        render: function (data, type, row, meta) {
                            const displayValue = moment(data).format("DD/MM/YYYY HH:mm:ss");
                            return `<span data-tag-id='${row.id}'>${displayValue}<span>`;
                        }
                    },
                    {
                        data: 'id',
                        className: 'text-end',
                        render: function (data, type, row, meta) {
                            return `<a href="#" class="btn btn-light btn-active-light-primary btn-flex btn-center btn-sm" data-kt-menu-trigger="click" data-kt-menu-placement="bottom-end" data-kt-menu-flip="top-end">
                                                ${BlogPostTagPage.message.actions}
                                                <i class="ki-duotone ki-down fs-5 ms-1"></i>
                                    </a>
                                    <div class="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg-light-primary fw-semibold fs-7 w-125px py-4" data-kt-menu="true">
                                        <div class="menu-item px-3">
                                            <a href="#" class="menu-link px-3 btn-edit" data-kt-docs-table-filter="edit_row" data-tag-id="${data}">
                                                ${BlogPostTagPage.permissionFlags.canUpdate ? BlogPostTagPage.message.edit : BlogPostTagPage.message.detail}
                                            </a>
                                        </div>
                                        <div class="menu-item px-3 ${!BlogPostTagPage.permissionFlags.canDelete ? 'd-none' : ''}">
                                            <a href="#" class="menu-link px-3 btn-delete text-danger" data-kt-users-table-filter="delete_row" data-tag-id="${data}">
                                                ${BlogPostTagPage.message.delete}
                                            </a>
                                        </div>
                                    </div>`
                        }
                    },

                ],
                columnDefs: [
                    { targets: "no-sort", orderable: false },
                    { targets: "no-search", searchable: false },
                    { orderable: false, targets: [-1, 0] },
                ],
                aLengthMenu: [
                    [10, 25, 50, 100],
                    [10, 25, 50, 100]
                ],
                drawCallback: function () {
                    $('#tag_datatable tfoot').html("");
                    $("#tag_datatable thead tr").clone(true).appendTo("#tag_datatable tfoot");
                    $('#tag_datatable tfoot tr').addClass("border-top");
                }
            })

            this.table.on("draw", function () {
                KTMenu.createInstances();
            })
        },
        initPlugins: function () {
            this.plugins.dateRangePickerFilter = $("#filter_created_date").flatpickr({
                dateFormat: "d/m/Y",
                mode: "range",
                conjunction: " - ",
                locale: "vn",
            });

            //$("#tag_tagTypeId").select2({
            //    language: currentLang,
            //    placeholder: 'Chọn loại nhãn',
            //    dropdownParent: "#kt_modal_tag_form",
            //});
        },
        checkPermissions: function () {
            if (!BlogPostTagPage.permissionFlags.canCreate) 
                $("#btn_add_tag").addClass("d-none");
        },
        regenDataTable: function () {
            if (this.table) {
                this.table.destroy();
                $("#tag_datatable tbody").html("");
                this.initDataTable();
            }
        },
        refreshDataTable: function () {
            if (this.table) {
                this.table.ajax.reload(null, false);
            }
        },
        bindEvents: function () {
            this.bindEditEvent();
            this.bindDeleteEvent();
            this.bindSearchAllEvents();
            this.bindFilterEvents();
            this.bindAddEvent();
            this.bindSaveEvent();
            this.bindClearFilterDateRangeEvent();
            this.bindToggleFilterEvent();
        },
        bindEditEvent: function () {
            $("#tag_datatable tbody").on("click", ".btn-edit", function () {
                const id = $(this).attr("data-tag-id");
                editItem(id);
            });
        },
        bindDeleteEvent: function () {
            $("#tag_datatable tbody").on("click", ".btn-delete", function () {
                const id = $(this).attr("data-tag-id");
                deleteItem(id);
            });
        },
        bindSearchAllEvents: function () {
            $("#tag_datatable_search").on("keyup", AppUtils.debounce(function () {
                tableSearch();
            }, 300))
        },
        bindFilterEvents: function () {
            //reset filter event
            $("#btn_reset_filter").on("click", function () {
                resetFilter();
            })

            //apply filter event
            $("#btn_apply_filter").on("click", function () {
                tableSearch();
            })
        },
        bindAddEvent: function () {
            $("#btn_add_tag").on("click", function () {
                addItem();
            })
        },
        bindSaveEvent: function () {
            //$("#btn_save_tag").on("click", function (e) {
            //    e.preventDefault();
            //    saveData();
            //})
        },
        bindClearFilterDateRangeEvent: function () {
            $("#clear_filter_created_date i").on("click", function () {
                BlogPostTagPage.plugins.dateRangePickerFilter.clear();
            })
            $("#clear_filter_created_date").on("click", function () {
                BlogPostTagPage.plugins.dateRangePickerFilter.clear();
            })
        },
        loadRelatedData: async function () {
            await loadDataTagTypes();
            $("select[data-control=select2]").val("").select2();
        },
        bindToggleFilterEvent: function () {
            $("#btn_tag_filter").on("click", function () {
                $("#tag_filter").slideToggle();
            })
        }
    }

    /**
     * Handle add new blog post tag
     */
    function addItem() {
        if (!BlogPostTagPage.permissionFlags.canCreate) {
            Swal.fire({
                icon: "warning",
                title: BlogPostTagPage.message.warningTitle,
                html: BlogPostTagPage.message.forbidden,
                ...AppSettings.sweetAlertOptions(false)
            });
            return;
        }
        BlogPostTagPage.formValidator.clearErrors();
        $("#kt_modal_tag_header h2").text(`${BlogPostTagPage.message.create} ${BlogPostTagPage.message.pageTitle.toLocaleLowerCase()}`);
        $("#kt_modal_tag_form input[type='text'],#kt_modal_tag_form textarea, #kt_modal_tag_form select").val("").trigger("change");
        $("#tag_createdDate").val(moment().format("DD/MM/YYYY HH:mm:ss")).trigger("change");
        $("#tag_id").val("");
        $("#btn_save_tag").removeClass("d-none");
        $("#btn_cancel_tag").text(BlogPostTagPage.message.cancel);
        $("#tag_name, #tag_description").removeAttr("disabled");
        $("#tag_createdDate").attr("disabled", true);
        $("#kt_modal_tag").modal("show");
    }

    /**
     * Author: 
     * CreatedDate: 
     * Description: Edit blog post tag by id
     * @param {number} id
     */
    async function editItem(id) {
        BlogPostTagPage.formValidator.clearErrors();
        $("#global_loader").addClass("show");
        try {
            const response = await httpService.getAsync(ApiRoutes.Tag.v1.Detail(id));
            const data = response.resources;
            Object.keys(data).forEach(key => {
                const selector = `#tag_${key}`;
                const value = key.toLocaleLowerCase().includes("date") ? moment(data[key].toString()).format("DD/MM/YYYY HH:mm:ss") : data[key];
                $(selector).val(value).trigger("change");
                if (key.toLowerCase().includes("date")) {
                    $(selector).attr("disabled", true);
                } else {
                    $(selector).attr("disabled", !BlogPostTagPage.permissionFlags.canUpdate);
                }
            })

            if (BlogPostTagPage.permissionFlags.canUpdate) {
                $("#kt_modal_tag_header h2").text(
                    `${BlogPostTagPage.message.edit} ${BlogPostTagPage.message.pageTitle.toLowerCase()}`
                );
                $("#btn_save_tag").removeClass("d-none");
                $("#btn_cancel_tag").text(BlogPostTagPage.message.cancel);
            } else {
                $("#kt_modal_tag_header h2").text(
                    `${BlogPostTagPage.message.detail} ${BlogPostTagPage.message.pageTitle.toLowerCase()}`
                );
                $("#btn_save_tag").addClass("d-none");
                $("#btn_cancel_tag").text(BlogPostTagPage.message.ok);
            }
            $("#kt_modal_tag").modal("show");
        } catch (e) {
            console.error(e);
            Swal.fire({
                icon: "error",
                title: BlogPostTagPage.message.errorTitle,
                html: BlogPostTagPage.message.notFound,
                ...AppSettings.sweetAlertOptions(false)
            });
        }
        finally {
            $("#global_loader").removeClass("show");
        }
    }

    /**
     * Author:
     * CreatedDate:
     * Description: Delete blog post tag by id
     * @param {number} id
     */
    async function deleteItem(id) {
        if (!BlogPostTagPage.permissionFlags.canDelete) {
            Swal.fire({
                icon: "warning",
                title: BlogPostTagPage.message.warningTitle,
                html: BlogPostTagPage.message.forbidden,
                ...AppSettings.sweetAlertOptions(false)
            });
            return;
        }
        const { isConfirmed } = await Swal.fire({
            icon: "question",
            title: BlogPostTagPage.message.confirmTittle,
            html: BlogPostTagPage.message.deleteConfirm,
            ...AppSettings.sweetAlertOptions(true)
        });

        if (!isConfirmed)
            return;

        $("#global_loader").addClass("show");
        try {
            const response = await httpService.deleteAsync(ApiRoutes.Tag.v1.Delete(id));
            if (response?.isSucceeded) {
                BlogPostTagPage.refreshDataTable();
                Swal.fire({
                    icon: "success",
                    title: BlogPostTagPage.message.successTitle,
                    html: BlogPostTagPage.message.deleteSuccess,
                    ...AppSettings.sweetAlertOptions(false)
                })
            }
        } catch (e) {
            console.error(e);
            Swal.fire({
                icon: "error",
                title: BlogPostTagPage.message.failTitle,
                html: BlogPostTagPage.message.deleteError,
                ...AppSettings.sweetAlertOptions(false)
            })
        }
        finally {
            $("#global_loader").removeClass("show");
        }
    }

    /**
     * Save data (Create or Update) blog post tag
     */
    async function saveData() {

        const btnSave = $("#btn_save_tag");
        btnSave.attr("disabled", true);

        const columns = ["id", "name", "description"];
        const data = {};
        columns.forEach(key => {
            const selector = `#tag_${key}`;
            data[key] = $(selector).val();
        });
        data["tagTypeId"] = AppSettings.tagTypes.BLOG_POST;
        const isAdd = !data.id;
        if (!isAdd && !BlogPostTagPage.permissionFlags.canUpdate) {
            Swal.fire({
                icon: "warning",
                title: BlogPostTagPage.message.warningTitle,
                html: BlogPostTagPage.message.forbidden,
                ...AppSettings.sweetAlertOptions(false)
            });
            btnSave.removeAttr("disabled");
            return;
        }
        if (isAdd && !BlogPostTagPage.permissionFlags.canCreate) {
            Swal.fire({
                icon: "warning",
                title: BlogPostTagPage.message.warningTitle,
                html: BlogPostTagPage.message.forbidden,
                ...AppSettings.sweetAlertOptions(false)
            });
            btnSave.removeAttr("disabled");
            return;
        }
        const confirmText = isAdd ? BlogPostTagPage.message.createConfirm : BlogPostTagPage.message.updateConfirm;
        const { isConfirmed } = await Swal.fire({
            icon: 'question',
            title: BlogPostTagPage.message.confirmTittle,
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
                    if (isAdd) {
                        $("#tag_datatable_search").val("").trigger("change");
                        resetFilter();
                    }
                    else {
                        BlogPostTagPage.refreshDataTable();
                    }

                    $("#kt_modal_tag").modal("hide");
                    const successText = isAdd ? BlogPostTagPage.message.createSuccess : BlogPostTagPage.message.updateSuccess;
                    Swal.fire({
                        icon: "success",
                        title: BlogPostTagPage.message.successTitle,
                        html: successText,
                        ...AppSettings.sweetAlertOptions(false)
                    });
                }

            } catch (e) {
                AppUtils.handleApiError(e, {
                    action: isAdd ? "create" : "update",
                    name: BlogPostTagPage.message.pageTitle,
                    isShowAlert: true
                })

            }
            finally {
                btnSave.removeAttr("data-kt-indicator");
            }
        }
        btnSave.removeAttr("disabled");
    }

    /**
     * Search data table
     */
    function tableSearch() {
        BlogPostTagPage.table.column(1).search($("#filter_name").val().trim());
        BlogPostTagPage.table.column(2).search($("#filter_description").val().trim());
        BlogPostTagPage.table.column(3).search($("#filter_created_date").val());
        BlogPostTagPage.table.search($("#tag_datatable_search").val().trim()).draw();
    }

    /**
     * Reset filter
     */
    function resetFilter() {
        $("#filter_name").val("");
        $("#filter_description").val("");
        BlogPostTagPage.plugins.dateRangePickerFilter.clear();
        /*$("#filter_created_date").val("").trigger("change");*/
        tableSearch();
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
                $("#filter_tagTypeId").append(new Option(item.name, item.id, false, false));
            });
        } catch (e) {
            console.error(e);
        }
    }

    // On document ready
    KTUtil.onDOMContentLoaded(async function () {
        await AppEntry.init();
        if (!BlogPostTagPage.permissionFlags.canView) {
            AppSettings.mainElements.PAGE_CONTENT.addClass("d-none");
            AppSettings.mainElements.NOT_FOUND.removeClass("d-none");
        }
        else
            BlogPostTagPage.init();
    });
})();