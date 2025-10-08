"use strict";

(function () {
    // Class definition
    const CharmCategoryPage = {
        table: null,
        formValidator: null,
        plugins: {
            dateRangePickerFilter: null
        },
        permissionFlags: AppUtils.getPermissionFlags(),
        message: {
            pageTitle: I18n.t("charm_category", "PAGE_TITLE"),
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
            createConfirm: I18n.t("common", "CREATE_CONFIRM", { name: I18n.t("charm_category", "PAGE_TITLE").toLocaleLowerCase() }),
            createSuccess: I18n.t("common", "CREATE_SUCCESS", { name: I18n.t("charm_category", "PAGE_TITLE").toLocaleLowerCase() }),
            createError: I18n.t("common", "CREATE_ERROR", { name: I18n.t("charm_category", "PAGE_TITLE").toLocaleLowerCase() }),
            updateConfirm: I18n.t("common", "UPDATE_CONFIRM", { name: I18n.t("charm_category", "PAGE_TITLE").toLocaleLowerCase() }),
            updateSuccess: I18n.t("common", "UPDATE_SUCCESS", { name: I18n.t("charm_category", "PAGE_TITLE") }),
            updateError: I18n.t("common", "UPDATE_ERROR", { name: I18n.t("charm_category", "PAGE_TITLE").toLocaleLowerCase() }),
            deleteConfirm: I18n.t("common", "DELETE_CONFIRM", { name: I18n.t("charm_category", "PAGE_TITLE").toLocaleLowerCase() }),
            deleteSuccess: I18n.t("common", "DELETE_SUCCESS", { name: I18n.t("charm_category", "PAGE_TITLE").toLocaleLowerCase() }),
            deleteError: I18n.t("common", "DELETE_ERROR", { name: I18n.t("charm_category", "PAGE_TITLE").toLocaleLowerCase() }),
            notFound: I18n.t("common", "NOT_FOUND", { name: I18n.t("charm_category", "PAGE_TITLE").toLocaleLowerCase() }),
            validationError: I18n.t("common", "VALIDATION_ERROR")
        },
        init: function () {
            this.initPlugins();
            this.initDataTable();
            this.checkPermissions();
            this.bindEvents();
            this.formValidator = new FormValidator({
                formSelector: "#kt_modal_charm_category_form",
                handleSubmit: saveData,
                rules: [
                    {
                        element: "#charm_category_name",
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
                        element: "#charm_category_description",
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
            this.table = $("#charm_category_datatable").DataTable({
                processing: true,
                serverSide: true,
                paging: true,
                searching: { regex: true },
                order: [4, 'desc'],
                language: AppSettings.dataTableLanguage.vi,
                ajax: {
                    url: ApiRoutes.CharmCategory.v1.PagedAdvanced,
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
                            const tableSettings = CharmCategoryPage.table.settings()[0];
                            tableSettings.ajax.headers.Authorization = "Bearer " + TokenService.getAccessToken();

                            //Reload lại datatable với token mới
                            CharmCategoryPage.table.ajax.reload();
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
                            const info = CharmCategoryPage.table.page.info();
                            const index = meta.row + 1 + info.page * info.length;
                            return index; // This contains the row index
                        }
                    },

                    {
                        data: "name",
                        render: function (data, type, row, meta) {
                            return `<span class='text-gray-800 text-hover-primary mb-1' data-charm-category-id='${row.id}'>${AppUtils.escapeHtml(row.name)}<span>`;
                        },
                    },
                    {
                        data: "description",
                        render: function (data, type, row, meta) {
                            return `<span data-charm-category-id='${row.id}'>${AppUtils.escapeHtml(data).replaceAll("\n", "<br>")}<span>`;
                        },
                    },
                    {
                        data: "createdDate",
                        render: function (data, type, row, meta) {
                            const displayValue = moment(data).format("DD/MM/YYYY HH:mm:ss");
                            return `<span data-charm-category-id='${row.id}'>${displayValue}<span>`;
                        }
                    },
                    {
                        data: 'id',
                        className: 'text-end',
                        render: function (data, type, row, meta) {
                            return `<a href="#" class="btn btn-light btn-active-light-primary btn-flex btn-center btn-sm" data-kt-menu-trigger="click" data-kt-menu-placement="bottom-end" data-kt-menu-flip="top-end">
                                                ${CharmCategoryPage.message.actions}
                                                <i class="ki-duotone ki-down fs-5 ms-1"></i>
                                    </a>
                                    <div class="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg-light-primary fw-semibold fs-7 w-125px py-4" data-kt-menu="true">
                                        <div class="menu-item px-3">
                                            <a href="#" class="menu-link px-3 btn-edit" data-kt-docs-table-filter="edit_row" data-charm-category-id="${data}">
                                                ${CharmCategoryPage.permissionFlags.canUpdate ? CharmCategoryPage.message.edit : CharmCategoryPage.message.detail}
                                            </a>
                                        </div>
                                        <div class="menu-item px-3 ${!CharmCategoryPage.permissionFlags.canDelete ? 'd-none' : ''}">
                                            <a href="#" class="menu-link px-3 text-danger btn-delete" data-kt-users-table-filter="delete_row" data-charm-category-id="${data}">
                                                ${CharmCategoryPage.message.delete}
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
                    $('#charm_category_datatable tfoot').html("");
                    $("#charm_category_datatable thead tr").clone(true).appendTo("#charm_category_datatable tfoot");
                    $('#charm_category_datatable tfoot tr').addClass("border-top");
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
        checkPermissions: function () {
            if (!CharmCategoryPage.permissionFlags.canCreate)
                $("#btn_add_charm_category").addClass("d-none");
        },
        regenDataTable: function () {
            if (this.table) {
                this.table.destroy();
                $("#charm_category_datatable tbody").html("");
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
            $("#charm_category_datatable tbody").on("click", ".btn-edit", function () {
                const id = $(this).attr("data-charm-category-id");
                editItem(id);
            });
        },
        bindDeleteEvent: function () {
            $("#charm_category_datatable tbody").on("click", ".btn-delete", function () {
                const id = $(this).attr("data-charm-category-id");
                deleteItem(id);
            });
        },
        bindSearchAllEvents: function () {
            $("#charm_category_datatable_search").on("keyup", AppUtils.debounce(function () {
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
            $("#btn_add_charm_category").on("click", function () {
                addItem();
            })
        },
        bindSaveEvent: function () {
            //$("#btn_save_charm_category").on("click", function (e) {
            //    e.preventDefault();
            //    saveData();
            //})
        },
        bindClearFilterDateRangeEvent: function () {
            $("#clear_filter_created_date i").on("click", function () {
                CharmCategoryPage.plugins.dateRangePickerFilter.clear();
            })
            $("#clear_filter_created_date").on("click", function () {
                CharmCategoryPage.plugins.dateRangePickerFilter.clear();
            })
        },
        bindToggleFilterEvent: function () {
            $("#btn_charm_category_filter").on("click", function () {
                $("#charm_category_filter").slideToggle();
            })
        }
    }

    /**
     * Handle add new blog post category
     */
    function addItem() {
        if (!CharmCategoryPage.permissionFlags.canCreate) {
            Swal.fire({
                icon: "warning",
                title: CharmCategoryPage.message.warningTitle,
                html: CharmCategoryPage.message.forbidden,
                ...AppSettings.sweetAlertOptions(false)
            });
            return;
        }
        CharmCategoryPage.formValidator.clearErrors();
        $("#kt_modal_charm_category_header h2").text(`${CharmCategoryPage.message.create} ${CharmCategoryPage.message.pageTitle.toLocaleLowerCase()}`);
        $("#kt_modal_charm_category_form input[type='text'],#kt_modal_charm_category_form textarea, #kt_modal_charm_category_form select").val("").trigger("change");
        //$("#kt_modal_charm_category_form input[type='color']").val("#000").trigger("change");
        $("#charm_category_createdDate").val(moment().format("DD/MM/YYYY HH:mm:ss")).trigger("change");
        $("#btn_save_charm_category").removeClass("d-none");
        $("#btn_cancel_charm_category").text(CharmCategoryPage.message.cancel);
        $("#charm_category_name, #charm_category_description, #charm_category_color").removeAttr("disabled");
        $("#charm_category_createdDate").attr("disabled", true);
        $("#kt_modal_charm_category").modal("show");
    }

    /**
     * Author: 
     * CreatedDate: 
     * Description: Edit blog post category by id
     * @param {number} id
     */
    async function editItem(id) {
        CharmCategoryPage.formValidator.clearErrors();
        $("#global_loader").addClass("show");
        try {
            const response = await httpService.getAsync(ApiRoutes.CharmCategory.v1.Detail(id));
            const data = response.resources;
            Object.keys(data).forEach(key => {
                const selector = `#charm_category_${key}`;
                const value = key.toLocaleLowerCase().includes("date") ? moment(data[key].toString()).format("DD/MM/YYYY HH:mm:ss") : data[key];
                $(selector).val(value).trigger("change");
                if (key.toLowerCase().includes("date")) {
                    $(selector).attr("disabled", true);
                } else {
                    $(selector).attr("disabled", !CharmCategoryPage.permissionFlags.canUpdate);
                }
            })

            if (CharmCategoryPage.permissionFlags.canUpdate) {
                $("#kt_modal_charm_category h2").text(
                    `${CharmCategoryPage.message.edit} ${CharmCategoryPage.message.pageTitle.toLowerCase()}`
                );
                $("#btn_save_charm_category").removeClass("d-none");
                $("#btn_cancel_charm_category").text(CharmCategoryPage.message.cancel);
            } else {
                $("#kt_modal_charm_category h2").text(
                    `${CharmCategoryPage.message.detail} ${CharmCategoryPage.message.pageTitle.toLowerCase()}`
                );
                $("#btn_save_charm_category").addClass("d-none");
                $("#btn_cancel_charm_category").text(CharmCategoryPage.message.ok);
            }
            $("#kt_modal_charm_category").modal("show");
        } catch (e) {
            console.error(e);
            Swal.fire({
                icon: "error",
                title: CharmCategoryPage.message.errorTitle,
                html: CharmCategoryPage.message.notFound,
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
     * Description: Delete blog post category by id
     * @param {number} id
     */
    async function deleteItem(id) {
        if (!CharmCategoryPage.permissionFlags.canDelete) {
            Swal.fire({
                icon: "warning",
                title: CharmCategoryPage.message.warningTitle,
                html: CharmCategoryPage.message.forbidden,
                ...AppSettings.sweetAlertOptions(false)
            });
            return;
        }
        const { isConfirmed } = await Swal.fire({
            icon: "question",
            title: CharmCategoryPage.message.confirmTittle,
            html: CharmCategoryPage.message.deleteConfirm,
            ...AppSettings.sweetAlertOptions(true)
        });

        if (!isConfirmed)
            return;

        $("#global_loader").addClass("show");
        try {
            const response = await httpService.deleteAsync(ApiRoutes.CharmCategory.v1.Delete(id));
            if (response?.isSucceeded) {
                /*tableSearch();*/
                CharmCategoryPage.refreshDataTable();
                Swal.fire({
                    icon: "success",
                    title: CharmCategoryPage.message.successTitle,
                    html: CharmCategoryPage.message.deleteSuccess,
                    ...AppSettings.sweetAlertOptions(false)
                })
            }
        } catch (e) {
            console.error(e);
            Swal.fire({
                icon: "error",
                title: CharmCategoryPage.message.failTitle,
                html: CharmCategoryPage.message.deleteError,
                ...AppSettings.sweetAlertOptions(false)
            })
        }
        finally {
            $("#global_loader").removeClass("show");
        }
    }

    /**
     * Save data (Create or Update) blog post category
     */
    async function saveData() {
        console.log(CharmCategoryPage.permissionFlags)
        const btnSave = $("#btn_save_charm_category");
        btnSave.attr("disabled", true);

        const columns = ["id", "name", "description"];
        const data = {};
        columns.forEach(key => {
            const selector = `#charm_category_${key}`;
            data[key] = $(selector).val();
        });
        const isAdd = !data.id;
        if (!isAdd && !CharmCategoryPage.permissionFlags.canUpdate) {
            Swal.fire({
                icon: "warning",
                title: CharmCategoryPage.message.warningTitle,
                html: CharmCategoryPage.message.forbidden,
                ...AppSettings.sweetAlertOptions(false)
            });
            btnSave.removeAttr("disabled");
            return;
        }
        if (isAdd && !CharmCategoryPage.permissionFlags.canCreate) {
            Swal.fire({
                icon: "warning",
                title: CharmCategoryPage.message.warningTitle,
                html: CharmCategoryPage.message.forbidden,
                ...AppSettings.sweetAlertOptions(false)
            });
            btnSave.removeAttr("disabled");
            return;
        }
        const confirmText = isAdd ? CharmCategoryPage.message.createConfirm : CharmCategoryPage.message.updateConfirm;
        const { isConfirmed } = await Swal.fire({
            icon: 'question',
            title: CharmCategoryPage.message.confirmTittle,
            html: confirmText,
            ...AppSettings.sweetAlertOptions(true)
        });

        if (isConfirmed) {
            btnSave.attr("data-kt-indicator", "on");
            try {
                const response = isAdd ?
                    await httpService.postAsync(ApiRoutes.CharmCategory.v1.Create, data) :
                    await httpService.putAsync(ApiRoutes.CharmCategory.v1.Update, data);
                if (response?.isSucceeded) {
                    if (isAdd) {
                        $("#charm_category_datatable_search").val("").trigger("change");
                        resetFilter();
                    }
                    else {
                        CharmCategoryPage.refreshDataTable();
                    }

                    $("#kt_modal_charm_category").modal("hide");
                    const successText = isAdd ? CharmCategoryPage.message.createSuccess : CharmCategoryPage.message.updateSuccess;
                    Swal.fire({
                        icon: "success",
                        title: CharmCategoryPage.message.successTitle,
                        html: successText,
                        ...AppSettings.sweetAlertOptions(false)
                    });
                }

            } catch (e) {
                AppUtils.handleApiError(e, {
                    action: isAdd ? "create" : "update",
                    name: CharmCategoryPage.message.pageTitle,
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
        CharmCategoryPage.table.column(1).search($("#filter_name").val().trim());
        CharmCategoryPage.table.column(2).search($("#filter_description").val().trim());
        CharmCategoryPage.table.column(4).search($("#filter_created_date").val());
        CharmCategoryPage.table.search($("#charm_category_datatable_search").val().trim()).draw();
    }

    /**
     * Reset filter
     */
    function resetFilter() {
        $("#filter_name").val("");
        $("#filter_description").val("");
        CharmCategoryPage.plugins.dateRangePickerFilter.clear();
        /*$("#filter_created_date").val("").trigger("change");*/
        tableSearch();
    }

    // On document ready
    KTUtil.onDOMContentLoaded(async function () {
        await AppEntry.init();
        if (!CharmCategoryPage.permissionFlags.canView) {
            AppSettings.mainElements.PAGE_CONTENT.addClass("d-none");
            AppSettings.mainElements.NOT_FOUND.removeClass("d-none");
        }
        else
            CharmCategoryPage.init();
    });
})();