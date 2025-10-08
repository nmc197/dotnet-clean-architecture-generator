"use strict";

(function () {
    // Class definition
    const BlogPostLayoutPage = {
        table: null,
        formValidator: null,
        plugins: {
            dateRangePickerFilter: null
        },
        message: {
            pageTitle: I18n.t("blog_post_layout", "PAGE_TITLE"),
            actions: I18n.t("common", "ACTIONS"),
            create: I18n.t("common", "ADD_NEW"),
            edit: I18n.t("common", "EDIT"),
            delete: I18n.t("common", "DELETE"),
            confirmTittle: I18n.t("common", "CONFIRM_TITLE"),
            successTitle: I18n.t("common", "SUCCESS_TITLE"),
            errorTitle: I18n.t("common", "ERROR_TITLE"),
            failTitle: I18n.t("common", "FAIL_TITLE"),
            warningTitle: I18n.t("common", "WARNING_TITLE"),
            createConfirm: I18n.t("common", "CREATE_CONFIRM", { name: I18n.t("blog_post_layout", "PAGE_TITLE").toLocaleLowerCase() }),
            createSuccess: I18n.t("common", "CREATE_SUCCESS", { name: I18n.t("blog_post_layout", "PAGE_TITLE").toLocaleLowerCase() }),
            createError: I18n.t("common", "CREATE_ERROR", { name: I18n.t("blog_post_layout", "PAGE_TITLE").toLocaleLowerCase() }),
            updateConfirm: I18n.t("common", "UPDATE_CONFIRM", { name: I18n.t("blog_post_layout", "PAGE_TITLE").toLocaleLowerCase() }),
            updateSuccess: I18n.t("common", "UPDATE_SUCCESS", { name: I18n.t("blog_post_layout", "PAGE_TITLE") }),
            updateError: I18n.t("common", "UPDATE_ERROR", { name: I18n.t("blog_post_layout", "PAGE_TITLE").toLocaleLowerCase() }),
            deleteConfirm: I18n.t("common", "DELETE_CONFIRM", { name: I18n.t("blog_post_layout", "PAGE_TITLE").toLocaleLowerCase() }),
            deleteSuccess: I18n.t("common", "DELETE_SUCCESS", { name: I18n.t("blog_post_layout", "PAGE_TITLE").toLocaleLowerCase() }),
            deleteError: I18n.t("common", "DELETE_ERROR", { name: I18n.t("blog_post_layout", "PAGE_TITLE").toLocaleLowerCase() }),
            notFound: I18n.t("common", "NOT_FOUND", { name: I18n.t("blog_post_layout", "PAGE_TITLE").toLocaleLowerCase() }),
            validationError: I18n.t("common", "VALIDATION_ERROR")
        },
        init: function () {
            this.initPlugins();
            this.initDataTable();
            this.bindEvents();
            this.formValidator = new FormValidator({
                formSelector: "#kt_modal_blog_post_layout_form",
                handleSubmit: saveData,
                rules: [
                    {
                        element: "#blog_post_layout_name",
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
                        element: "#blog_post_layout_description",
                        rule: [
                            {
                                name: "maxLength",
                                message: I18n.t("common", "TOO_LONG", { field: "Mô tả", max: 500 }),
                                params: 500,
                                allowNullOrEmpty: true
                            }
                        ]

                    }
                ]
            });
        },
        initDataTable: function () {
            this.table = $("#blog_post_layout_datatable").DataTable({
                processing: true,
                serverSide: true,
                paging: true,
                searching: { regex: true },
                order: [4, 'desc'],
                language: AppSettings.dataTableLanguage.vi,
                ajax: {
                    url: ApiRoutes.BlogPostLayout.v1.PagedAdvanced,
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
                            const tableSettings = BlogPostLayoutPage.table.settings()[0];
                            tableSettings.ajax.headers.Authorization = "Bearer " + TokenService.getAccessToken();

                            //Reload lại datatable với token mới
                            BlogPostLayoutPage.table.ajax.reload();
                        }
                    },
                    dataSrc: {
                        data: 'resources.data',
                        draw: 'resources.draw',
                        recordsTotal: 'resources.recordsTotal',
                        recordsFiltered: 'resources.recordsFiltered'
                    },
                    data: function (d) {
                        return JSON.stringify(d);
                    }

                },
                columns: [
                    {
                        data: 'id',
                        render: function (data, type, row, meta) {
                            const info = BlogPostLayoutPage.table.page.info();
                            const index = meta.row + 1 + info.page * info.length;
                            return index; // This contains the row index
                        }
                    },

                    {
                        data: "name",
                        render: function (data, type, row, meta) {
                            return `<span class='text-gray-800 text-hover-primary mb-1' data-blog-post-layout-id='${row.id}'>${AppUtils.escapeHtml(row.name)}<span>`;
                        },
                    },
                    {
                        data: "description",
                        render: function (data, type, row, meta) {
                            return `<span data-blog-post-layout-id='${row.id}'>${AppUtils.escapeHtml(data).replaceAll("\n", "<br>")}<span>`;
                        },
                    },
                    {
                        data: "createdDate",
                        render: function (data, type, row, meta) {
                            const displayValue = moment(data).format("DD/MM/YYYY HH:mm:ss");
                            return `<span data-blog-post-layout-id='${row.id}'>${displayValue}<span>`;
                        }
                    },
                    {
                        data: 'id',
                        className: 'text-end',
                        render: function (data, type, row, meta) {
                            return `<a href="#" class="btn btn-light btn-active-light-primary btn-flex btn-center btn-sm" data-kt-menu-trigger="click" data-kt-menu-placement="bottom-end" data-kt-menu-flip="top-end">
                                                ${BlogPostLayoutPage.message.actions}
                                                <i class="ki-duotone ki-down fs-5 ms-1"></i>
                                    </a>
                                    <div class="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg-light-primary fw-semibold fs-7 w-125px py-4" data-kt-menu="true">
                                        <div class="menu-item px-3">
                                            <a href="#" class="menu-link px-3 btn-edit" data-kt-docs-table-filter="edit_row" data-blog-post-layout-id="${data}">
                                                ${BlogPostLayoutPage.message.edit}
                                            </a>
                                        </div>
                                        <div class="menu-item px-3">
                                            <a href="#" class="menu-link px-3 text-danger btn-delete" data-kt-users-table-filter="delete_row" data-blog-post-layout-id="${data}">
                                                ${BlogPostLayoutPage.message.delete}
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
                    $('#blog_post_layout_datatable tfoot').html("");
                    $("#blog_post_layout_datatable thead tr").clone(true).appendTo("#blog_post_layout_datatable tfoot");
                    $('#blog_post_layout_datatable tfoot tr').addClass("border-top");
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
        },
        regenDataTable: function () {
            if (this.table) {
                this.table.destroy();
                $("#blog_post_layout_datatable tbody").html("");
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
        },
        bindEditEvent: function () {
            $("#blog_post_layout_datatable tbody").on("click", ".btn-edit", function () {
                const id = $(this).attr("data-blog-post-layout-id");
                editItem(id);
            });
        },
        bindDeleteEvent: function () {
            $("#blog_post_layout_datatable tbody").on("click", ".btn-delete", function () {
                const id = $(this).attr("data-blog-post-layout-id");
                deleteItem(id);
            });
        },
        bindSearchAllEvents: function () {
            $("#blog_post_layout_datatable_search").on("keyup", AppUtils.debounce(function () {
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
            $("#btn_add_blog_post_layout").on("click", function () {
                addItem();
            })
        },
        bindSaveEvent: function () {
            //$("#btn_save_blog_post_layout").on("click", function (e) {
            //    e.preventDefault();
            //    saveData();
            //})
        },
        bindClearFilterDateRangeEvent: function () {
            $("#clear_filter_created_date i").on("click", function () {
                BlogPostLayoutPage.plugins.dateRangePickerFilter.clear();
            })
            $("#clear_filter_created_date").on("click", function () {
                BlogPostLayoutPage.plugins.dateRangePickerFilter.clear();
            })
        }
    }

    /**
     * Handle add new blog post layout
     */
    function addItem() {
        BlogPostLayoutPage.formValidator.clearErrors();
        $("#kt_modal_blog_post_layout_header h2").text(`${BlogPostLayoutPage.message.create} ${BlogPostLayoutPage.message.pageTitle.toLocaleLowerCase()}`);
        $("#kt_modal_blog_post_layout_form input[type='text'],#kt_modal_blog_post_layout_form textarea, #kt_modal_blog_post_layout_form select").val("").trigger("change");
        $("#kt_modal_blog_post_layout_form input[type='color']").val("#000").trigger("change");
        $("#blog_post_layout_createdDate").val(moment().format("DD/MM/YYYY HH:mm:ss")).trigger("change");
    }

    /**
     * Author: 
     * CreatedDate: 
     * Description: Edit blog post layout by id
     * @param {number} id
     */
    async function editItem(id) {
        BlogPostLayoutPage.formValidator.clearErrors();
        $("#global_loader").addClass("show");
        try {
            const response = await httpService.getAsync(ApiRoutes.BlogPostLayout.v1.Detail(id));
            const data = response.resources;
            Object.keys(data).forEach(key => {
                const selector = `#blog_post_layout_${key}`;
                const value = key.toLocaleLowerCase().includes("date") ? moment(data[key].toString()).format("DD/MM/YYYY HH:mm:ss") : data[key];
                $(selector).val(value).trigger("change");
            })

            $("#kt_modal_blog_post_layout_header h2").text(`${BlogPostLayoutPage.message.edit} ${BlogPostLayoutPage.message.pageTitle.toLocaleLowerCase()}`);
            $("#kt_modal_blog_post_layout").modal("show");
        } catch (e) {
            console.error(e);
            Swal.fire({
                icon: "error",
                title: BlogPostLayoutPage.message.errorTitle,
                html: BlogPostLayoutPage.message.notFound,
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
     * Description: Delete blog post layout by id
     * @param {number} id
     */
    async function deleteItem(id) {

        const { isConfirmed } = await Swal.fire({
            icon: "question",
            title: BlogPostLayoutPage.message.confirmTittle,
            html: BlogPostLayoutPage.message.deleteConfirm,
            ...AppSettings.sweetAlertOptions(true)
        });

        if (!isConfirmed)
            return;

        $("#global_loader").addClass("show");
        try {
            const response = await httpService.deleteAsync(ApiRoutes.BlogPostLayout.v1.Delete(id));
            if (response?.isSucceeded) {
                /*tableSearch();*/
                BlogPostLayoutPage.refreshDataTable();
                Swal.fire({
                    icon: "success",
                    title: BlogPostLayoutPage.message.successTitle,
                    html: BlogPostLayoutPage.message.deleteSuccess,
                    ...AppSettings.sweetAlertOptions(false)
                })
            }
        } catch (e) {
            console.error(e);
            Swal.fire({
                icon: "error",
                title: BlogPostLayoutPage.message.failTitle,
                html: BlogPostLayoutPage.message.deleteError,
                ...AppSettings.sweetAlertOptions(false)
            })
        }
        finally {
            $("#global_loader").removeClass("show");
        }
    }

    /**
     * Save data (Create or Update) blog post layout
     */
    async function saveData() {

        const btnSave = $("#btn_save_blog_post_layout");
        btnSave.attr("disabled", true);

        const columns = ["id", "name", "description"];
        const data = {};
        columns.forEach(key => {
            const selector = `#blog_post_layout_${key}`;
            data[key] = $(selector).val();
        });
        const isAdd = !data.id;
        const confirmText = isAdd ? BlogPostLayoutPage.message.createConfirm : BlogPostLayoutPage.message.updateConfirm;
        const { isConfirmed } = await Swal.fire({
            icon: 'question',
            title: BlogPostLayoutPage.message.confirmTittle,
            html: confirmText,
            ...AppSettings.sweetAlertOptions(true)
        });

        if (isConfirmed) {
            btnSave.attr("data-kt-indicator", "on");
            try {
                const response = isAdd ?
                    await httpService.postAsync(ApiRoutes.BlogPostLayout.v1.Create, data) :
                    await httpService.putAsync(ApiRoutes.BlogPostLayout.v1.Update, data);
                if (response?.isSucceeded) {
                    if (isAdd) {
                        $("#blog_post_layout_datatable_search").val("").trigger("change");
                        resetFilter();
                    }
                    else {
                        BlogPostLayoutPage.refreshDataTable();
                    }

                    $("#kt_modal_blog_post_layout").modal("hide");
                    const successText = isAdd ? BlogPostLayoutPage.message.createSuccess : BlogPostLayoutPage.message.updateSuccess;
                    Swal.fire({
                        icon: "success",
                        title: BlogPostLayoutPage.message.successTitle,
                        html: successText,
                        ...AppSettings.sweetAlertOptions(false)
                    });
                }

            } catch (e) {
                AppUtils.handleApiError(e, {
                    action: isAdd ? "create" : "update",
                    name: BlogPostLayoutPage.message.pageTitle,
                    isShowAlert: true
                });

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
        BlogPostLayoutPage.table.column(1).search($("#filter_name").val().trim());
        BlogPostLayoutPage.table.column(2).search($("#filter_description").val().trim());
        BlogPostLayoutPage.table.column(3).search($("#filter_created_date").val());
        BlogPostLayoutPage.table.search($("#blog_post_layout_datatable_search").val().trim()).draw();
    }

    /**
     * Reset filter
     */
    function resetFilter() {
        $("#filter_name").val("");
        $("#filter_description").val("");
        BlogPostLayoutPage.plugins.dateRangePickerFilter.clear();
        /*$("#filter_created_date").val("").trigger("change");*/
        tableSearch();
    }

    // On document ready
    KTUtil.onDOMContentLoaded(async function () {
        await AppEntry.init();
        BlogPostLayoutPage.init();
    });
})();