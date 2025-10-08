"use strict";

(function () {

    const NotificationTypePage = {
        table: null,
        formValidator: null,
        plugins: {
            dateRangePickerFilter: null
        },
        permissionFlags: AppUtils.getPermissionFlags(),
        message: {
            pageTitle: I18n.t("notification_type", "PAGE_TITLE"),
            actions: I18n.t("common", "ACTIONS"),
            create: I18n.t("common", "ADD_NEW"),
            edit: I18n.t("common", "EDIT"),
            delete: I18n.t("common", "DELETE"),
            detail: I18n.t("common", "DETAIL"),
            cancel: I18n.t("common", "CANCEL"),
            ok: I18n.t("common", "OK"),
            confirmTittle: I18n.t("common", "CONFIRM_TITLE"),
            successTitle: I18n.t("common", "SUCCESS_TITLE"),
            errorTitle: I18n.t("common", "ERROR_TITLE"),
            failTitle: I18n.t("common", "FAIL_TITLE"),
            warningTitle: I18n.t("common", "WARNING_TITLE"),
            createConfirm: I18n.t("common", "CREATE_CONFIRM", { name: I18n.t("notification_type", "PAGE_TITLE").toLocaleLowerCase() }),
            createSuccess: I18n.t("common", "CREATE_SUCCESS", { name: I18n.t("notification_type", "PAGE_TITLE") }),
            createError: I18n.t("common", "CREATE_ERROR", { name: I18n.t("notification_type", "PAGE_TITLE").toLocaleLowerCase() }),
            updateConfirm: I18n.t("common", "UPDATE_CONFIRM", { name: I18n.t("notification_type", "PAGE_TITLE").toLocaleLowerCase() }),
            updateSuccess: I18n.t("common", "UPDATE_SUCCESS", { name: I18n.t("notification_type", "PAGE_TITLE") }),
            updateError: I18n.t("common", "UPDATE_ERROR", { name: I18n.t("notification_type", "PAGE_TITLE").toLocaleLowerCase() }),
            deleteConfirm: I18n.t("common", "DELETE_CONFIRM", { name: I18n.t("notification_type", "PAGE_TITLE").toLocaleLowerCase() }),
            deleteSuccess: I18n.t("common", "DELETE_SUCCESS", { name: I18n.t("notification_type", "PAGE_TITLE").toLocaleLowerCase() }),
            deleteError: I18n.t("common", "DELETE_ERROR", { name: I18n.t("notification_type", "PAGE_TITLE").toLocaleLowerCase() }),
            notFound: I18n.t("common", "NOT_FOUND", { name: I18n.t("notification_type", "PAGE_TITLE").toLocaleLowerCase() }),
            validationError: I18n.t("common", "VALIDATION_ERROR")
        },
        init: function () {
            this.initPlugins();
            this.checkPermissions();
            this.initDataTable();
            this.bindEvents();
            this.formValidator = new FormValidator({
                formSelector: "#kt_modal_notification_type_form",
                handleSubmit: saveData,
                rules: [
                    {
                        element: "#notification_type_name",
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
                        element: "#notification_type_description",
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
            this.table = $("#notification_type_datatable").DataTable({
                processing: true,
                serverSide: true,
                paging: true,
                searching: { regex: true },
                order: [3, 'desc'],
                language: AppSettings.dataTableLanguage.vi,
                ajax: {
                    url: ApiRoutes.NotificationType.v1.PagedAdvanced,
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
                            const tableSettings = NotificationTypePage.table.settings()[0];
                            tableSettings.ajax.headers.Authorization = "Bearer " + TokenService.getAccessToken();

                            //Reload lại datatable với token mới
                            NotificationTypePage.table.ajax.reload();
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
                            const info = NotificationTypePage.table.page.info();
                            const index = meta.row + 1 + info.page * info.length;
                            return index;
                        }
                    },

                    {
                        data: "name",
                        render: function (data, type, row, meta) {
                            return `<div class="fw-semibold text-gray-800 text-hover-primary"  data-notification-type-id='${row.id}'>${AppUtils.escapeHtml(data)}</div>`;
                        },
                    },
                    {
                        data: "description",
                        render: function (data, type, row, meta) {
                            return data ? `<span  data-notification-type-id='${row.id}'>${AppUtils.escapeHtml(data).replaceAll("\n", "<br>")}</span>` : "";
                        },
                    },

                    {
                        data: "createdDate",
                        render: function (data, type, row, meta) {
                            const displayValue = moment(data).format("DD/MM/YYYY HH:mm:ss");
                            return `<span data-notification-type-id='${row.id}'>${displayValue}<span>`;
                        }
                    },
                    {
                        data: 'id',
                        className: 'text-end',
                        render: function (data, type, row, meta) {
                            return `<a href="#" class="btn btn-light btn-active-light-primary btn-flex btn-center btn-sm" data-kt-menu-trigger="click" data-kt-menu-placement="bottom-end" data-kt-menu-flip="top-end">
                                                ${NotificationTypePage.message.actions}
                                                <i class="ki-duotone ki-down fs-5 ms-1"></i>
                                    </a>
                                    <div class="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg-light-primary fw-semibold fs-7 w-125px py-4" data-kt-menu="true">
                                        <div class="menu-item px-3">
                                            <a href="#" class="menu-link px-3 btn-edit" data-kt-docs-table-filter="edit_row" data-notification-type-id="${data}">
                                                ${NotificationTypePage.permissionFlags.canUpdate ? NotificationTypePage.message.edit : NotificationTypePage.message.detail}
                                            </a>
                                        </div>
                                        <div class="menu-item px-3 ${!NotificationTypePage.permissionFlags.canDelete ? "d-none" : ""}">
                                            <a href="#" class="menu-link px-3 text-danger btn-delete" data-kt-users-table-filter="delete_row" data-notification-type-id="${data}">
                                                ${NotificationTypePage.message.delete}
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
                    $('#notification_type_datatable tfoot').html("");
                    $("#notification_type_datatable thead tr").clone(true).appendTo("#notification_type_datatable tfoot");
                    $('#notification_type_datatable tfoot tr').addClass("border-top");
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
            if (!NotificationTypePage.permissionFlags.canCreate)
                $("#btn_add_notification_type").addClass("d-none");
        },
        regenDataTable: function () {
            if (this.table) {
                this.table.destroy();
                $("#notification_type_datatable tbody").html("");
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
            $("#notification_type_datatable tbody").on("click", ".btn-edit", function () {
                const id = $(this).attr("data-notification-type-id");
                editItem(id);
            });
        },
        bindDeleteEvent: function () {
            $("#notification_type_datatable tbody").on("click", ".btn-delete", function () {
                const id = $(this).attr("data-notification-type-id");
                deleteItem(id);
            });
        },
        bindSearchAllEvents: function () {
            $("#notification_type_datatable_search").on("keyup", AppUtils.debounce(function () {
                tableSearch();
            }, 300))
        },
        bindFilterEvents: function () {
            $("#btn_reset_filter").on("click", function () {
                resetFilter();
            })

            $("#btn_apply_filter").on("click", function () {
                tableSearch();
            })
        },
        bindAddEvent: function () {
            $("#btn_add_notification_type").on("click", function () {
                addItem();
            })
        },
        bindSaveEvent: function () {

        },
        bindClearFilterDateRangeEvent: function () {
            $("#clear_filter_created_date i").on("click", function () {
                NotificationTypePage.plugins.dateRangePickerFilter.clear();
            })
            $("#clear_filter_created_date").on("click", function () {
                NotificationTypePage.plugins.dateRangePickerFilter.clear();
            })
        },
        bindToggleFilterEvent: function () {
            $("#btn_notification_type_filter").on("click", function () {
                $("#notification_type_filter").slideToggle();
            })
        }
    }

    
    function addItem() {
        
        NotificationTypePage.formValidator.clearErrors();
        $("#kt_modal_notification_type_header h2").text(`${NotificationTypePage.message.create} ${NotificationTypePage.message.pageTitle.toLocaleLowerCase()}`);
        $("#kt_modal_notification_type_form input[type='text'],#kt_modal_notification_type_form textarea, #kt_modal_notification_type_form select").val("").attr("disabled", false).trigger("change");
        $("#notification_type_createdDate").val(moment().format("DD/MM/YYYY HH:mm:ss")).trigger("change");
        $("#btn_save_notification_type").removeClass("d-none");
        $("#btn_cancel_notification_type").text(NotificationTypePage.message.cancel);
        $("#notification_type_createdDate").attr("disabled", true);
    }

   
    async function editItem(id) {
       
        NotificationTypePage.formValidator.clearErrors();
        $("#global_loader").addClass("show");
        try {
            const response = await httpService.getAsync(ApiRoutes.NotificationType.v1.Detail(id));
            const data = response.resources;
            Object.keys(data).forEach(key => {
                const selector = `#notification_type_${key}`;
                const value = key.toLocaleLowerCase().includes("date") ? moment(data[key].toString()).format("DD/MM/YYYY HH:mm:ss") : data[key];
                $(selector).val(value).trigger("change");
               
                if (!key.toLocaleLowerCase().includes("date")) {
                    $(selector).attr("disabled", !NotificationTypePage.permissionFlags.canUpdate);
                }
            })

            if (NotificationTypePage.permissionFlags.canUpdate) {
                $("#kt_modal_notification_type_header h2").text(`${NotificationTypePage.message.edit} ${NotificationTypePage.message.pageTitle.toLocaleLowerCase()}`);
                $("#btn_save_notification_type").removeClass("d-none");
                $("#btn_cancel_notification_type").text(NotificationTypePage.message.cancel);
            }
            else {
                $("#kt_modal_notification_type_header h2").text(`${NotificationTypePage.message.detail} ${NotificationTypePage.message.pageTitle.toLocaleLowerCase()}`);
                $("#btn_save_notification_type").addClass("d-none");
                $("#btn_cancel_notification_type").text(NotificationTypePage.message.ok);
            }
            
            $("#kt_modal_notification_type").modal("show");
        } catch (e) {
            console.error(e);
            Swal.fire({
                icon: "error",
                title: NotificationTypePage.message.errorTitle,
                html: NotificationTypePage.message.notFound,
                ...AppSettings.sweetAlertOptions(false)
            });
        }
        finally {
            $("#global_loader").removeClass("show");
        }
    }

   
    async function deleteItem(id) {

        const { isConfirmed } = await Swal.fire({
            icon: "question",
            title: NotificationTypePage.message.confirmTittle,
            html: NotificationTypePage.message.deleteConfirm,
            ...AppSettings.sweetAlertOptions(true)
        });

        if (!isConfirmed)
            return;

        $("#global_loader").addClass("show");
        try {
            const response = await httpService.deleteAsync(ApiRoutes.NotificationType.v1.Delete(id));
            if (response?.isSucceeded) {
                /*tableSearch();*/
                NotificationTypePage.refreshDataTable();
                Swal.fire({
                    icon: "success",
                    title: NotificationTypePage.message.successTitle,
                    html: NotificationTypePage.message.deleteSuccess,
                    ...AppSettings.sweetAlertOptions(false)
                })
            }
        } catch (e) {


            AppUtils.handleApiError(e, {
                action: "delete",
                name: NotificationTypePage.message.pageTitle,
                isShowAlert: true
            })
        }
        finally {
            $("#global_loader").removeClass("show");
        }
    }

   
    async function saveData() {

        const btnSave = $("#btn_save_notification_type");
        btnSave.attr("disabled", true);

        const columns = ["id", "name", "description"];
        const data = {};
        columns.forEach(key => {
            const selector = `#notification_type_${key}`;
            data[key] = $(selector).val();
        });
        const isAdd = !data.id;
        const confirmText = isAdd ? NotificationTypePage.message.createConfirm : NotificationTypePage.message.updateConfirm;
        const { isConfirmed } = await Swal.fire({
            icon: 'question',
            title: NotificationTypePage.message.confirmTittle,
            html: confirmText,
            ...AppSettings.sweetAlertOptions(true)
        });

        if (isConfirmed) {
            btnSave.attr("data-kt-indicator", "on");
            try {
                const response = isAdd ?
                    await httpService.postAsync(ApiRoutes.NotificationType.v1.Create, data) :
                    await httpService.putAsync(ApiRoutes.NotificationType.v1.Update, data);
                if (response?.isSucceeded) {
                    if (isAdd) {
                        $("#notification_type_datatable_search").val("").trigger("change");
                        resetFilter();
                    }
                    else {
                        NotificationTypePage.refreshDataTable();
                    }

                    $("#kt_modal_notification_type").modal("hide");
                    const successText = isAdd ? NotificationTypePage.message.createSuccess : NotificationTypePage.message.updateSuccess;
                    Swal.fire({
                        icon: "success",
                        title: NotificationTypePage.message.successTitle,
                        html: successText,
                        ...AppSettings.sweetAlertOptions(false)
                    });
                }

            } catch (e) {

                AppUtils.handleApiError(e, {
                    action: isAdd ? "create" : "update",
                    name: NotificationTypePage.message.pageTitle,
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
        NotificationTypePage.table.column(1).search($("#filter_name").val().trim());
        NotificationTypePage.table.column(2).search($("#filter_description").val().trim());
        NotificationTypePage.table.column(3).search($("#filter_created_date").val());
        NotificationTypePage.table.search($("#notification_type_datatable_search").val().trim()).draw();
    }

    /**
     * Reset filter
     */
    function resetFilter() {
        $("#filter_name").val("");
        $("#filter_description").val("");
        NotificationTypePage.plugins.dateRangePickerFilter.clear();
        tableSearch();
    }

    // On document ready
    KTUtil.onDOMContentLoaded(async function () {
        await AppEntry.init();
        if (!NotificationTypePage.permissionFlags.canView) {
            AppSettings.mainElements.PAGE_CONTENT.addClass("d-none");
            AppSettings.mainElements.NOT_FOUND.removeClass("d-none");
        }
        else
            NotificationTypePage.init();
        
    });
})();