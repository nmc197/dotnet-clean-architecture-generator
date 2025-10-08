"use strict";

(function () {
    // Class definition
    const LogPage = {
        activityLogTable: null,
        auditLogTable: null,
        formValidator: null,
        plugins: {
            dateRangePickerFilter: null
        },
        permissionFlags: AppUtils.getPermissionFlags(),
        message: {
            logTitle: I18n.t("log", "PAGE_TITLE"),
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
            createConfirm: I18n.t("common", "CREATE_CONFIRM", { name: I18n.t("log", "PAGE_TITLE").toLocaleLowerCase() }),
            createSuccess: I18n.t("common", "CREATE_SUCCESS", { name: I18n.t("log", "PAGE_TITLE").toLocaleLowerCase() }),
            createError: I18n.t("common", "CREATE_ERROR", { name: I18n.t("log", "PAGE_TITLE").toLocaleLowerCase() }),
            updateConfirm: I18n.t("common", "UPDATE_CONFIRM", { name: I18n.t("log", "PAGE_TITLE").toLocaleLowerCase() }),
            updateSuccess: I18n.t("common", "UPDATE_SUCCESS", { name: I18n.t("log", "PAGE_TITLE") }),
            updateError: I18n.t("common", "UPDATE_ERROR", { name: I18n.t("log", "PAGE_TITLE").toLocaleLowerCase() }),
            deleteConfirm: I18n.t("common", "DELETE_CONFIRM", { name: I18n.t("log", "PAGE_TITLE").toLocaleLowerCase() }),
            deleteSuccess: I18n.t("common", "DELETE_SUCCESS", { name: I18n.t("log", "PAGE_TITLE").toLocaleLowerCase() }),
            deleteError: I18n.t("common", "DELETE_ERROR", { name: I18n.t("log", "PAGE_TITLE").toLocaleLowerCase() }),
            notFound: I18n.t("common", "NOT_FOUND", { name: I18n.t("log", "PAGE_TITLE").toLocaleLowerCase() }),
            validationError: I18n.t("common", "VALIDATION_ERROR")
        },
        init: function () {
            this.initPlugins();
            this.initActivityLogDataTable();
            this.initAuditLogDataTable();
            this.bindEvents();
        },
        initActivityLogDataTable: function () {
            this.activityLogTable = $("#activity_log_datatable").DataTable({
                processing: true,
                serverSide: true,
                paging: true,
                searching: { regex: true },
                order: [6, 'desc'],
                language: AppSettings.dataTableLanguage.vi,
                ajax: {
                    url: ApiRoutes.ActivityLog.v1.PagedAdvancedByUserId,
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
                            const tableSettings = LogPage.activityLogTable.settings()[0];
                            tableSettings.ajax.headers.Authorization = "Bearer " + TokenService.getAccessToken();

                            //Reload lại datatable với token mới
                            LogPage.activityLogTable.ajax.reload();
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
                            const info = LogPage.activityLogTable.page.info();
                            const index = meta.row + 1 + info.page * info.length;
                            return index; // This contains the row index
                        }
                    },
                    {
                        data: "action",
                        render: function (data, type, row, meta) {
                            return `<div class="fw-semibold text-gray-800 text-hover-primary"  data-log-id='${row.id}'>${AppUtils.escapeHtml(data)}</div>`;
                        },
                    },
                    {
                        data: "ipAddress",
                        render: function (data, type, row, meta) {
                            return `<div class="fw-semibold text-gray-800 text-hover-primary"  data-log-id='${row.id}'>${AppUtils.escapeHtml(data)}</div>`;
                        },
                    },
                    {
                        data: "description",
                        render: function (data, type, row, meta) {
                            return data ? `<span  data-log-id='${row.id}'>${AppUtils.escapeHtml(data)}</span>` : "";
                        },
                    },
                    {
                        data: "userAgent",
                        render: function (data, type, row, meta) {
                            return data ? `<span  data-log-id='${row.id}'>${AppUtils.escapeHtml(data)}</span>` : "";
                        },
                    },
                    {
                        data: "createdUserName",
                        render: function (data, type, row, meta) {
                            return data ? `<span  data-log-id='${row.id}'>${AppUtils.escapeHtml(data)}</span>` : "";
                        },
                    },
                    {
                        data: "createdDate",
                        render: function (data, type, row, meta) {
                            const displayValue = moment(data).format("DD/MM/YYYY HH:mm:ss");
                            return `<span class='text-nowrap' data-notification-id='${row.id}'>${displayValue}<span>`;
                        },
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
                    $('#activity_log_datatable tfoot').html("");
                    $("#activity_log_datatable thead tr").clone(true).appendTo("#activity_log_datatable tfoot");
                    $('#activity_log_datatable tfoot tr').addClass("border-top");
                }
            })

            this.activityLogTable.on("draw", function () {
                KTMenu.createInstances();
            })
        },
        initAuditLogDataTable: function () {
            this.auditLogTable = $("#audit_log_datatable").DataTable({
                processing: true,
                serverSide: true,
                paging: true,
                searching: { regex: true },
                order: [6, 'desc'],
                language: AppSettings.dataTableLanguage.vi,
                ajax: {
                    url: ApiRoutes.AuditLog.v1.PagedAdvancedByUserId,
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
                            const tableSettings = LogPage.auditLogTable.settings()[0];
                            tableSettings.ajax.headers.Authorization = "Bearer " + TokenService.getAccessToken();

                            //Reload lại datatable với token mới
                            LogPage.auditLogTable.ajax.reload();
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
                            const info = LogPage.auditLogTable.page.info();
                            const index = meta.row + 1 + info.page * info.length;
                            return index; // This contains the row index
                        }
                    },
                    {
                        data: "action",
                        render: function (data, type, row, meta) {
                            return `<div class="fw-semibold text-gray-800 text-hover-primary"  data-log-id='${row.id}'>${AppUtils.escapeHtml(data)}</div>`;
                        },
                    },
                    {
                        data: "targetType",
                        render: function (data, type, row, meta) {
                            return `<div class="fw-semibold text-gray-800 text-hover-primary"  data-log-id='${row.id}'>${AppUtils.escapeHtml(data)}</div>`;
                        },
                    },
                    {
                        data: "description",
                        render: function (data, type, row, meta) {
                            return data ? `<span  data-log-id='${row.id}'>${AppUtils.escapeHtml(data)}</span>` : "";
                        },
                    },
                    {
                        data: "IpAddress",
                        render: function (data, type, row, meta) {
                            return data ? `<span  data-log-id='${row.id}'>${AppUtils.escapeHtml(data)}</span>` : "";
                        },
                    },
                    {
                        data: "createdUserName",
                        render: function (data, type, row, meta) {
                            return data ? `<span  data-log-id='${row.id}'>${AppUtils.escapeHtml(data)}</span>` : "";
                        },
                    },
                    {
                        data: "CreatedDate",
                        render: function (data, type, row, meta) {
                            const displayValue = moment(data).format("DD/MM/YYYY HH:mm:ss");
                            return `<span class='text-nowrap' data-notification-id='${row.id}'>${displayValue}<span>`;
                        },
                    },
                    {
                        data: 'id',
                        className: 'text-end',
                        render: function (data, type, row, meta) {
                            return `<a href="#" class="btn btn-light btn-active-light-primary btn-flex btn-center btn-sm" data-kt-menu-trigger="click" data-kt-menu-placement="bottom-end" data-kt-menu-flip="top-end">
                                                ${LogPage.message.actions}
                                                <i class="ki-duotone ki-down fs-5 ms-1"></i>
                                    </a>
                                    <div class="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg-light-primary fw-semibold fs-7 w-125px py-4" data-kt-menu="true">
                                        <div class="menu-item px-3">
                                            <a href="#" class="menu-link px-3 btn-edit" data-kt-docs-table-filter="edit_row" data-log-id="${data}">
                                                ${LogPage.message.detail}
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
                    $('#audit_log_datatable tfoot').html("");
                    $("#audit_log_datatable thead tr").clone(true).appendTo("#audit_log_datatable tfoot");
                    $('#audit_log_datatable tfoot tr').addClass("border-top");
                }
            })

            this.auditLogTable.on("draw", function () {
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
            this.plugins.dateRangePickerFilter = $("#filter_audit_created_date").flatpickr({
                dateFormat: "d/m/Y",
                mode: "range",
                conjunction: " - ",
                locale: "vn",
            });
        },
        checkPermissions: function () {
            if (!LogPage.permissionFlags.canCreate)
                $("#btn_add_blog_post").addClass("d-none");
        },
        regenActivityLogDataTable: function () {
            if (this.activityLogTable) {
                this.activityLogTable.destroy();
                $("#activity_log_datatable tbody").html("");
                this.initDataTable();
            }
        },
        refreshActivityLogDataTable: function () {
            if (this.activityLogTable) {
                this.activityLogTable.ajax.reload(null, false);
            }
        },
        bindEvents: function () {
            this.bindDetailAuditLogEvent();
            this.bindSearchAllActivityLogEvents();
            this.bindActivityLogFilterEvents();
            this.bindSearchAllAuditLogEvents();
            this.bindAuditLogFilterEvents();
            this.bindAddEvent();
            this.bindSaveEvent();
            this.bindToggleFilterEvent();
        },
        bindDetailAuditLogEvent: function () {
            $("#audit_log_datatable tbody").on("click", ".btn-edit", function () {
                const id = $(this).attr("data-log-id");
                detailAuditLogItem(id);
            });
        },
        bindSearchAllActivityLogEvents: function () {
            $("#activity_log_datatable_search").on("keyup", AppUtils.debounce(function () {
                tableActivityLogSearch();
            }, 300))
        },
        bindActivityLogFilterEvents: function () {
            //reset filter event
            $("#btn_reset_activity_log_filter").on("click", function () {
                resetFilterActivityLog();
            })

            //apply filter event
            $("#btn_apply_activity_log_filter").on("click", function () {
                tableActivityLogSearch();
            })
        },
        bindSearchAllAuditLogEvents: function () {
            $("#audit_log_datatable_search").on("keyup", AppUtils.debounce(function () {
                tableAuditLogSearch();
            }, 300))
        },
        bindAuditLogFilterEvents: function () {
            //reset filter event
            $("#btn_reset_audit_log_filter").on("click", function () {
                resetFilterAuditLog();
            })

            //apply filter event
            $("#btn_apply_audit_log_filter").on("click", function () {
                tableAuditLogSearch();
            })
        },
        bindAddEvent: function () {
            $("#btn_add_log").on("click", function () {
                addItem();
            })
        },
        bindSaveEvent: function () {
            
        },
        bindToggleFilterEvent: function () {
            $("#btn_activity_log_filter").on("click", function () {
                $("#activity_log_filter").slideToggle();
            })
            $("#btn_audit_log_filter").on("click", function () {
                $("#audit_log_filter").slideToggle();
            })
        }
    }

    async function detailAuditLogItem(id) {
        $("#global_loader").addClass("show");
        try {
            const response = await httpService.getAsync(ApiRoutes.AuditLog.v1.Detail(id));
            const data = response.resources;
            $("#auditLog_id").val(data.id);
            $("#auditLog_action").val(data.action);
            $("#auditLog_targetType").val(data.targetType);
            $("#auditLog_dataBefore").val(data.dataBefore);
            $("#auditLog_dataAfter").val(data.dataAfter);
            $("#auditLog_description").val(data.description);
            $("#auditLog_ipAddress").val(data.ipAddress);
            $("#auditLog_userAgent").val(data.userAgent);
            $("#auditLog_createdUser").val(data.createdUser.name);
            $("#auditLog_createdDate").val(moment(data.createdDate).format("DD/MM/YYYY HH:mm:ss"));
            $("#btn_cancel_auditLog").text(LogPage.message.cancel);          
            $("#kt_modal_auditLog").modal("show");
        } catch (e) {
            console.error(e);
            Swal.fire({
                icon: "error",
                title: LogPage.message.errorTitle,
                html: LogPage.message.wardNotFound,
                ...AppSettings.sweetAlertOptions(false)
            });
        }
        finally {
            $("#global_loader").removeClass("show");
        }
    }

    /**
     * Search data table
     */
    function tableActivityLogSearch() {
        LogPage.activityLogTable.column(1).search($("#filter_action_name").val().trim());
        LogPage.activityLogTable.column(2).search($("#filter_ipAddress").val().trim());
        LogPage.activityLogTable.column(3).search($("#filter_description").val().trim());
        LogPage.activityLogTable.column(5).search($("#filter_created_user_name").val().trim());
        LogPage.activityLogTable.column(6).search($("#filter_created_date").val().trim());
        LogPage.activityLogTable.search($("#activity_log_datatable_search").val().trim()).draw();
    }

    /**
     * Reset filter
     */
    function resetFilterActivityLog() {
        $("#filter_action_name").val("");
        $("#filter_ipAddress").val("");
        $("#filter_description").val("");
        $("#filter_created_user_name").val("");
        $("#filter_created_date").val("");
        tableActivityLogSearch();
    }

    function tableAuditLogSearch() {
        LogPage.auditLogTable.column(1).search($("#filter_audit_action").val().trim());
        LogPage.auditLogTable.column(2).search($("#filter_audit_target_type").val().trim());
        LogPage.auditLogTable.column(7).search($("#filter_audit_created_username").val().trim());
        LogPage.auditLogTable.column(8).search($("#filter_audit_created_date").val().trim());
        LogPage.auditLogTable.search($("#audit_log_datatable_search").val().trim()).draw();
    }

    function resetFilterAuditLog() {
        $("#filter_audit_action").val("");
        $("#filter_audit_target_type").val("");
        $("#filter_audit_created_username").val("");
        $("#filter_audit_created_date").val("");
        tableAuditLogSearch();
    }

    // On document ready
    KTUtil.onDOMContentLoaded(async function () {
        await AppEntry.init();
        LogPage.init();
    });
})();