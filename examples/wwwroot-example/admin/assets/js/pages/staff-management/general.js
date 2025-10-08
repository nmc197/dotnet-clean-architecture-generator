"use strict";

(function () {
    // Class definition
    const StaffManagementPage = {
        table: null,
        formValidator: null,
        plugins: {
            dateRangePickerFilter: null
        },
        permissionFlags: AppUtils.getPermissionFlags(),
        message: {
            pageTitle: I18n.t("staff", "PAGE_TITLE"),
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
            createConfirm: I18n.t("common", "CREATE_CONFIRM", { name: I18n.t("staff", "PAGE_TITLE").toLocaleLowerCase() }),
            createSuccess: I18n.t("common", "CREATE_SUCCESS", { name: I18n.t("staff", "PAGE_TITLE").toLocaleLowerCase() }),
            createError: I18n.t("common", "CREATE_ERROR", { name: I18n.t("staff", "PAGE_TITLE").toLocaleLowerCase() }),
            updateConfirm: I18n.t("common", "UPDATE_CONFIRM", { name: I18n.t("staff", "PAGE_TITLE").toLocaleLowerCase() }),
            updateSuccess: I18n.t("common", "UPDATE_SUCCESS", { name: I18n.t("staff", "PAGE_TITLE") }),
            updateError: I18n.t("common", "UPDATE_ERROR", { name: I18n.t("staff", "PAGE_TITLE").toLocaleLowerCase() }),
            deleteConfirm: I18n.t("common", "DELETE_CONFIRM", { name: I18n.t("staff", "PAGE_TITLE").toLocaleLowerCase() }),
            deleteSuccess: I18n.t("common", "DELETE_SUCCESS", { name: I18n.t("staff", "PAGE_TITLE").toLocaleLowerCase() }),
            deleteError: I18n.t("common", "DELETE_ERROR", { name: I18n.t("staff", "PAGE_TITLE").toLocaleLowerCase() }),
            notFound: I18n.t("common", "NOT_FOUND", { name: I18n.t("staff", "PAGE_TITLE").toLocaleLowerCase() }),
            validationError: I18n.t("common", "VALIDATION_ERROR")
        },
        init: function () {
            this.initPlugins();
            this.initDataTable();
            this.loadRelatedData();
            this.bindEvents();
            this.formValidator = new FormValidator({
                formSelector: "#kt_modal_staff_form",
                handleSubmit: saveData,
                rules: [
                    {
                        element: "#staff_username",
                        rule: [
                            {
                                name: "required",
                                message: I18n.t("common", "REQUIRED", { field: "Tên đăng nhập" })
                            },
                            {
                                name: "maxLength",
                                message: I18n.t("common", "TOO_LONG", { field: "Tên đăng nhập", max: 255 }),
                                params: 255
                            },
                        ]

                    },
                    {
                        element: "#staff_firstName",
                        rule: [
                            {
                                name: "required",
                                message: I18n.t("common", "REQUIRED", { field: "Họ" })
                            },
                            {
                                name: "maxLength",
                                message: I18n.t("common", "TOO_LONG", { field: "Họ", max: 255 }),
                                params: 255
                            },
                        ]

                    },
                    {
                        element: "#staff_lastName",
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
                        element: "#staff_email",
                        rule: [
                            {
                                name: "required",
                                message: I18n.t("common", "REQUIRED", { field: "Email" })
                            },
                            {
                                name: "maxLength",
                                message: I18n.t("common", "TOO_LONG", { field: "Email", max: 500 }),
                                params: 500
                            },
                            {
                                name: "email",
                                message: I18n.t("common", "INVALID_FORMAT", { field: "Email" }),
                            },
                        ]

                    },
                    {
                        element: "#staff_userStatusId",
                        rule: [
                            {
                                name: "required",
                                message: I18n.t("common", "REQUIRED", { field: "Trạng thái" })
                            },
                        ]

                    },
                    {
                        element: "#staff_roles",
                        rule: [
                            {
                                name: "required",
                                message: I18n.t("common", "REQUIRED", { field: "Vị trí" })
                            },
                        ]

                    },
                ]
            });
        },
        initDataTable: function () {
            this.table = $("#staff_datatable").DataTable({
                processing: true,
                serverSide: true,
                paging: true,
                order: [5, 'desc'],
                searching: { regex: true },
                language: AppSettings.dataTableLanguage.vi,
                ajax: {
                    url: ApiRoutes.StaffManagement.v1.PagedAdvanced,
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
                            const tableSettings = StaffManagementPage.table.settings()[0];
                            tableSettings.ajax.headers.Authorization = "Bearer " + TokenService.getAccessToken();

                            //Reload lại datatable với token mới
                            StaffManagementPage.table.ajax.reload();
                        }
                    },
                    dataSrc: {
                        data: 'resources.data',
                        draw: 'resources.draw',
                        recordsTotal: 'resources.recordsTotal',
                        recordsFiltered: 'resources.recordsFiltered'
                    },
                    data: function (d) {
                        d.username = $("#filter_username").val() || null;
                        d.fullName = $("#filter_fullname").val() || null;
                        d.email = $("#filter_email").val() || null;
                        d.phoneNumber = $("#filter_phoneNumber").val() || null;
                        d.userStatusIds = $("#filter_userStatusId").val() || null;
                        d.roleIds = $("#filter_roleId").val() || null;
                        d.genderIds = $("#filter_gender").val() || null;
                        return JSON.stringify(d);
                    }

                },
                columns: [
                    {
                        data: 'id',
                        render: function (data, type, row, meta) {
                            const info = StaffManagementPage.table.page.info();
                            const index = meta.row + 1 + info.page * info.length;
                            return index; // This contains the row index
                        }
                    },

                    {
                        data: "username",
                        render: function (data, type, row, meta) {
                            return `<div class="d-flex align-items-center">
                                        <!--begin:: Avatar -->
                                        <div class="symbol symbol-circle symbol-50px overflow-hidden me-3">
                                            <div class="symbol-label">
                                                <img src="${AppUtils.escapeHtml(row.avatarPath) || AppSettings.avatarDefault}" alt="${AppUtils.escapeHtml(row.firstName)} ${AppUtils.escapeHtml(row.lastName)}" class="w-100">
                                            </div>
                                        </div>
                                        <!--end::Avatar-->
                                        <!--begin::Staff details-->
                                        <div class="d-flex flex-column">
                                            <div class="text-gray-800 text-hover-primary mb-1">${AppUtils.escapeHtml(row.firstName)} ${AppUtils.escapeHtml(row.lastName)}</div>
                                            <div class="d-flex flex-column">
                                                <span>${AppUtils.escapeHtml(row.email)}</span>
                                                <span>${AppUtils.escapeHtml(row.phoneNumber) || ``}</span>
                                            </div>
                                        </div>
                                        <!--begin::Staff details-->
                                    </div>`;
                        },
                    },

                    {
                        data: "gender",
                        render: function (data, type, row, meta) {
                            return `<span data-staff-id='${row.id}'>${row.gender != null ? (row.gender == 1 ? `Nam` : row.gender == 0 ? `Nữ` : `Khác`) : ``}<span>`;
                        },
                    },
                    {
                        data: "roles",
                        render: function (data, type, row, meta) {
                            var result = '';
                            row.roles.forEach(function (item) {
                                result += `<div data-staff-id='${row.id}'>${AppUtils.escapeHtml(item.name)}</div>`;
                            });
                            return result;
                        },
                    },
                    {
                        data: "userStatusId",
                        render: function (data, type, row, meta) {
                            return `<span data-staff-id='${row.id}' style="background-color:${AppUtils.customBagdeColor(row.userStatusColor)}; color: ${row.userStatusColor}; padding: 5px 8px; border-radius: 8px; display: inline-block; font-weight: 600;">${AppUtils.escapeHtml(row.userStatusName)}<span>`;
                        },
                    },
                    {
                        data: "createdDate",
                        render: function (data, type, row, meta) {
                            const displayValue = moment(data).format("DD/MM/YYYY HH:mm:ss");
                            return `<span data-staff-id='${row.id}'>${displayValue}<span>`;
                        }
                    },
                    {
                        data: 'id',
                        className: 'text-end',
                        render: function (data, type, row, meta) {
                            return `<a href="#" class="btn btn-light btn-active-light-primary btn-flex btn-center btn-sm" data-kt-menu-trigger="click" data-kt-menu-placement="bottom-end" data-kt-menu-flip="top-end">
                                                ${StaffManagementPage.message.actions}
                                                <i class="ki-duotone ki-down fs-5 ms-1"></i>
                                    </a>
                                    <div class="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg-light-primary fw-semibold fs-7 w-125px py-4" data-kt-menu="true">
                                        <div class="menu-item px-3">
                                            <a href="#" class="menu-link px-3 btn-edit" data-kt-docs-table-filter="edit_row" data-staff-id="${data}">
                                                ${StaffManagementPage.permissionFlags.canUpdate ? StaffManagementPage.message.edit : StaffManagementPage.message.detail}
                                            </a>
                                        </div>
                                        <div class="menu-item px-3 ${!StaffManagementPage.permissionFlags.canDelete ? "d-none" : ""}">
                                            <a href="#" class="menu-link px-3 btn-delete text-danger" data-kt-users-table-filter="delete_row" data-staff-id="${data}">
                                                ${StaffManagementPage.message.delete}
                                            </a>
                                        </div>
                                    </div>`
                        }
                    },

                ],
                columnDefs: [
                    { targets: "no-sort", orderable: false },
                    { targets: "no-search", searchable: false },
                    { orderable: false, targets: [-1, 0, 1 , 3] },
                ],
                aLengthMenu: [
                    [10, 25, 50, 100],
                    [10, 25, 50, 100]
                ],
                drawCallback: function () {
                    $('#staff_datatable tfoot').html("");
                    $("#staff_datatable thead tr").clone(true).appendTo("#staff_datatable tfoot");
                    $('#staff_datatable tfoot tr').addClass("border-top");
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
                $("#staff_datatable tbody").html("");
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
            $("#staff_datatable tbody").on("click", ".btn-edit", function () {
                const id = $(this).attr("data-staff-id");
                editItem(id);
            });
        },
        bindDeleteEvent: function () {
            $("#staff_datatable tbody").on("click", ".btn-delete", function () {
                const id = $(this).attr("data-staff-id");
                deleteItem(id);
            });
        },
        bindSearchAllEvents: function () {
            $("#staff_datatable_search").on("keyup", AppUtils.debounce(function () {
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
            $("#btn_add_staff").on("click", function () {
                addItem();
            })
        },
        bindSaveEvent: function () {
            //$("#btn_save_user").on("click", function (e) {
            //    e.preventDefault();
            //    saveData();
            //})
        },
        bindClearFilterDateRangeEvent: function () {
            $("#clear_filter_created_date i").on("click", function () {
                StaffManagementPage.plugins.dateRangePickerFilter.clear();
            })
            $("#clear_filter_created_date").on("click", function () {
                StaffManagementPage.plugins.dateRangePickerFilter.clear();
            })
        },
        loadRelatedData: async function () {
            await loadDataUserStatuses();
            await loadDataRoles();
            $("select[data-control=select2]").val("").select2();
        },
        checkPermissions: function () {
            if (!StaffManagementPage.permissionFlags.canCreate) {
                $("#btn_add_staff").addClass("d-none");
            }
        },
        bindToggleFilterEvent: function () {
            $("#btn_user_filter").on("click", function () {
                $("#user_filter").slideToggle();
            })
        }
    }

    /**
     * Handle add new staff
     */
    function addItem() {
        StaffManagementPage.formValidator.clearErrors();
        $("#kt_modal_staff_header h2").text(`${StaffManagementPage.message.create} ${StaffManagementPage.message.pageTitle.toLocaleLowerCase()}`);
        $("#kt_modal_staff_form input[type='text'],#kt_modal_staff_form textarea, #kt_modal_staff_form select").val("").trigger("change");
        $("#kt_modal_staff_form input[type='color']").val("#000").trigger("change");
        $("#staff_createdDate").val(moment().format("DD/MM/YYYY HH:mm:ss")).trigger("change");
        $("#btn_save_staff").removeClass("d-none");
        $("#btn_cancel_staff").text(StaffManagementPage.message.cancel);
        $("#staff_createdDate").attr("disabled", true);
    }

    /**
     * Author: 
     * CreatedDate: 
     * Description: Edit staff by id
     * @param {number} id
     */
    async function editItem(id) {
        StaffManagementPage.formValidator.clearErrors();
        $("#global_loader").addClass("show");
        try {
            const response = await httpService.getAsync(ApiRoutes.StaffManagement.v1.Detail(id));
            const data = response.resources;
            Object.keys(data).forEach(key => {
                const selector = `#staff_${key}`;
                const value = key.toLocaleLowerCase().includes("date") && data[key] != null ? moment(data[key].toString()).format("DD/MM/YYYY HH:mm:ss") : data[key];
                if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object') {
                    var result = value
                        .map(r => r.id);
                    $(selector).val(result).trigger("change");
                } else if ($(selector).is(':checkbox')) {
                    $(selector).prop("checked", value === true).trigger("change");
                }
                else {
                    $(selector).val(value).trigger("change");
                }
            });

            if (StaffManagementPage.permissionFlags.canUpdate) {
                $("#kt_modal_staff_header h2").text(`${StaffManagementPage.message.edit} ${StaffManagementPage.message.pageTitle.toLocaleLowerCase()}`);
                $("#btn_save_staff").removeClass("d-none");
                $("#btn_cancel_staff").text(StaffManagementPage.message.cancel);
            } else {
                $("#kt_modal_staff_header h2").text(`${StaffManagementPage.message.detail} ${StaffManagementPage.message.pageTitle.toLocaleLowerCase()}`);
                $("#btn_save_staff").addClass("d-none");
                $("#btn_cancel_staff").text(StaffManagementPage.message.ok);
            }

            $("#staff_fullName").val(data['firstName'] + ' ' + data['lastName']).trigger("change");
            if (data['gender'] !== null)
            {
                $("#staff_gender").val(data['gender'] == 0 ? 'Nữ' : (data['gender'] == 1 ? 'Nam' : 'Khác')).trigger("change");
            }
            if (data['avatarPath']) {
                $("#staff_avatar").css("background-image", `url('${data.avatarPath}')`);
            }
            else {
                $("#staff_avatar").css("background-image", `url('${AppSettings.avatarDefault}')`);
            }

            $("#kt_modal_staff").modal("show");
        } catch (e) {
            console.error(e);
            Swal.fire({
                icon: "error",
                title: StaffManagementPage.message.errorTitle,
                html: StaffManagementPage.message.notFound,
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
     * Description: Delete staff by id
     * @param {number} id
     */
    async function deleteItem(id) {

        const { isConfirmed } = await Swal.fire({
            icon: "question",
            title: StaffManagementPage.message.confirmTittle,
            html: StaffManagementPage.message.deleteConfirm,
            ...AppSettings.sweetAlertOptions(true)
        });

        if (!isConfirmed)
            return;

        $("#global_loader").addClass("show");
        try {
            const response = await httpService.deleteAsync(ApiRoutes.StaffManagement.v1.Delete(id));
            if (response?.isSucceeded) {
                StaffManagementPage.refreshDataTable();
                Swal.fire({
                    icon: "success",
                    title: StaffManagementPage.message.successTitle,
                    html: StaffManagementPage.message.deleteSuccess,
                    ...AppSettings.sweetAlertOptions(false)
                })
            }
        } catch (e) {
            console.error(e);
            Swal.fire({
                icon: "error",
                title: StaffManagementPage.message.failTitle,
                html: StaffManagementPage.message.deleteError,
                ...AppSettings.sweetAlertOptions(false)
            })
        }
        finally {
            $("#global_loader").removeClass("show");
        }
    }

    /**
     * Save data (Create or Update)
     */
    async function saveData() {

        const btnSave = $("#btn_save_staff");
        btnSave.attr("disabled", true);

        const columns = ["id", "userStatusId", "roles", "officeId"];
        const data = {};
        columns.forEach(key => {
            const selector = `#staff_${key}`;
            data[key] = $(selector).val();
        });
        const isAdd = !data.id;
        const confirmText = isAdd ? StaffManagementPage.message.createConfirm : StaffManagementPage.message.updateConfirm;
        const { isConfirmed } = await Swal.fire({
            icon: 'question',
            title: StaffManagementPage.message.confirmTittle,
            html: confirmText,
            ...AppSettings.sweetAlertOptions(true)
        });

        if (isConfirmed) {
            btnSave.attr("data-kt-indicator", "on");
            try {
                const response = isAdd ?
                    await httpService.postAsync(ApiRoutes.StaffManagement.v1.Create, data) :
                    await httpService.putAsync(ApiRoutes.StaffManagement.v1.Update, data);
                if (response?.isSucceeded) {
                    if (isAdd) {
                        $("#staff_datatable_search").val("").trigger("change");
                        resetFilter();
                    }
                    else {
                        StaffManagementPage.refreshDataTable();
                    }

                    $("#kt_modal_staff").modal("hide");
                    const successText = isAdd ? StaffManagementPage.message.createSuccess : StaffManagementPage.message.updateSuccess;
                    Swal.fire({
                        icon: "success",
                        title: StaffManagementPage.message.successTitle,
                        html: successText,
                        ...AppSettings.sweetAlertOptions(false)
                    });
                }

            } catch (e) {
                AppUtils.handleApiError(e, {
                    action: isAdd ? "create" : "update",
                    name: StaffManagementPage.message.pageTitle,
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
        StaffManagementPage.table.column(5).search($("#filter_created_date").val());
        StaffManagementPage.table.search($("#staff_datatable_search").val().trim()).draw();
    }

    /**
     * Reset filter
     */
    function resetFilter() {
        $("#filter_fullname").val("");
        $("#filter_email").val("");
        $("#filter_phoneNumber").val("");
        $("#filter_description").val("");
        $("[data-control=select2]").val("").trigger("change");
        StaffManagementPage.plugins.dateRangePickerFilter.clear();
        /*$("#filter_created_date").val("").trigger("change");*/
        tableSearch();
    }

    /**
    * Load data UserStatus
    */
    async function loadDataUserStatuses() {
        try {
            const response = await httpService.getAsync(ApiRoutes.UserStatus.v1.List);
            const data = response.resources;
            data.forEach(function (item) {
                $("#staff_userStatusId").append(new Option(item.name, item.id, false, false));
                $("#filter_userStatusId").append(new Option(item.name, item.id, false, false));
            });
        } catch (e) {
            console.error(e);
        }
    }
    /**
    * Load data Roles
    */
    async function loadDataRoles() {
        try {
            const response = await httpService.getAsync(ApiRoutes.Role.v1.ListByRegister);
            const data = response.resources;
            data.forEach(function (item) {
                $("#staff_roles").append(new Option(item.name, item.id, false, false));
                $("#filter_roleId").append(new Option(item.name, item.id, false, false));
            });
        } catch (e) {
            console.error(e);
        }
    }

    // On document ready
    KTUtil.onDOMContentLoaded(async function () {
        await AppEntry.init();
        if (!StaffManagementPage.permissionFlags.canView) {
            AppSettings.mainElements.PAGE_CONTENT.addClass("d-none");
            AppSettings.mainElements.NOT_FOUND.removeClass("d-none");
        } else {
            StaffManagementPage.init();
        }
    });
})();