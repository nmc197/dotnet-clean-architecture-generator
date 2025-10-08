"use strict";

(function () {
    // Class definition
    const UserPage = {
        table: null,
        formValidator: null,
        target: null,
        permissionFlags: AppUtils.getPermissionFlags(),
        variables: {
            userStatusActive: AppSettings.userStatusIds.ACTIVED,
            isLoadingFromEdit: false
        },
        plugins: {
            dateRangePickerFilter: null,
            datetimePickerLockEndDate: null
        },
        message: {
            pageTitle: I18n.t("user", "PAGE_TITLE"),
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
            createConfirm: I18n.t("common", "CREATE_CONFIRM", { name: I18n.t("user", "PAGE_TITLE").toLocaleLowerCase() }),
            createSuccess: I18n.t("common", "CREATE_SUCCESS", { name: I18n.t("user", "PAGE_TITLE").toLocaleLowerCase() }),
            createError: I18n.t("common", "CREATE_ERROR", { name: I18n.t("user", "PAGE_TITLE").toLocaleLowerCase() }),
            updateConfirm: I18n.t("common", "UPDATE_CONFIRM", { name: I18n.t("user", "PAGE_TITLE").toLocaleLowerCase() }),
            updateSuccess: I18n.t("common", "UPDATE_SUCCESS", { name: I18n.t("user", "PAGE_TITLE") }),
            updateError: I18n.t("common", "UPDATE_ERROR", { name: I18n.t("user", "PAGE_TITLE").toLocaleLowerCase() }),
            deleteConfirm: I18n.t("common", "DELETE_CONFIRM", { name: I18n.t("user", "PAGE_TITLE").toLocaleLowerCase() }),
            deleteSuccess: I18n.t("common", "DELETE_SUCCESS", { name: I18n.t("user", "PAGE_TITLE").toLocaleLowerCase() }),
            deleteError: I18n.t("common", "DELETE_ERROR", { name: I18n.t("user", "PAGE_TITLE").toLocaleLowerCase() }),
            notFound: I18n.t("common", "NOT_FOUND", { name: I18n.t("user", "PAGE_TITLE").toLocaleLowerCase() }),
            validationError: I18n.t("common", "VALIDATION_ERROR")
        },
        init: function () {
            this.initPlugins();
            this.initDataTable();
            this.loadRelatedData();
            this.bindEvents();
            this.formValidator = new FormValidator({
                formSelector: "#kt_modal_user_form",
                handleSubmit: saveData,
                rules: [
                    {
                        element: "#user_username",
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
                        element: "#user_firstName",
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
                        element: "#user_lastName",
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
                        element: "#user_email",
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
                        element: "#user_userStatusId",
                        rule: [
                            {
                                name: "required",
                                message: I18n.t("common", "REQUIRED", { field: "Trạng thái" })
                            },
                        ]

                    },
                    {
                        element: "#user_roles",
                        rule: [
                            {
                                name: "required",
                                message: I18n.t("common", "REQUIRED", { field: "Quyền" })
                            },
                        ]

                    },
                ]
            });
        },
        initDataTable: function () {
            this.table = $("#user_datatable").DataTable({
                processing: true,
                serverSide: true,
                paging: true,
                order: [6, 'desc'],
                searching: { regex: true },
                language: AppSettings.dataTableLanguage.vi,
                ajax: {
                    url: ApiRoutes.User.v1.PagedAdvanced,
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
                            const tableSettings = UserPage.table.settings()[0];
                            tableSettings.ajax.headers.Authorization = "Bearer " + TokenService.getAccessToken();

                            //Reload lại datatable với token mới
                            UserPage.table.ajax.reload();
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
                        //d.genderIds = $("#filter_gender").val() || null;
                        return JSON.stringify(d);
                    }

                },
                columns: [
                    {
                        data: 'id',
                        render: function (data, type, row, meta) {
                            const info = UserPage.table.page.info();
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
                                                    <img src="${AppUtils.escapeHtml(row.avatarUrl) || AppSettings.avatarDefault
                                }" alt="${AppUtils.escapeHtml(row.firstName)} ${AppUtils.escapeHtml(row.lastName)}" class="w-100">
                                                </div>
                                        </div>
                                        <!--end::Avatar-->
                                        <!--begin::User details-->
                                        <div class="d-flex flex-column">
                                            <div class="text-gray-800 text-hover-primary mb-1">${AppUtils.escapeHtml(row.firstName)} ${AppUtils.escapeHtml(row.lastName)}</div>
                                            <div class="d-flex flex-column">
                                                <span>${AppUtils.escapeHtml(row.email)}</span>
                                                <span>${AppUtils.escapeHtml(row.phoneNumber) || ``}</span>
                                            </div>
                                        </div>
                                        <!--begin::User details-->
                                    </div>`;
                        },
                    },
                    {
                        data: "lockEnabled",
                        render: function (data, type, row, meta) {
                            return `<span data-blog-post-id='${row.id}'><div class="form-check form-switch form-check-custom form-check-solid justify-content-start"><input class="form-check-input" type="checkbox" disabled value="" ${row.lockEnabled ? 'checked' : ''}></div></span>`;
                        },
                    },
                    {
                        data: "roles",
                        render: function (data, type, row, meta) {
                            var result = ``;
                            row.roles.forEach(function (item) {
                                result += `<div data-user-id='${row.id}'>${AppUtils.escapeHtml(item.name)}</div>`;
                            });
                            return result;
                        },
                    },
                    {
                        data: "userStatusId",
                        render: function (data, type, row, meta) {
                            return `<span data-user-id='${row.id}' style="background-color: ${AppUtils.customBagdeColor(row.userStatusColor)}; color: ${row.userStatusColor}; padding: 5px 8px; border-radius: 8px; display: inline-block; font-weight: 600;">${AppUtils.escapeHtml(row.userStatusName)}<span>`;
                        },
                    },
                    {
                        data: "createdDate",
                        render: function (data, type, row, meta) {
                            const displayValue = moment(data).format("DD/MM/YYYY HH:mm:ss");
                            return `<span data-user-id='${row.id}'>${displayValue}<span>`;
                        }
                    },
                    {
                        data: 'id',
                        className: 'text-end',
                        render: function (data, type, row, meta) {
                            return `<a class="btn btn-light btn-active-light-primary btn-flex btn-center btn-sm" data-kt-menu-trigger="click" data-kt-menu-placement="bottom-end" data-kt-menu-flip="top-end">
                                                ${UserPage.message.actions}
                                                <i class="ki-duotone ki-down fs-5 ms-1"></i>
                                    </a>
                                    <div class="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg-light-primary fw-semibold fs-7 w-125px py-4" data-kt-menu="true">
                                        <div class="menu-item px-3">
                                            <a class="menu-link px-3 btn-edit" data-kt-docs-table-filter="edit_row" data-user-id="${data}">
                                                ${UserPage.message.edit}
                                            </a>
                                        </div>
                                        <div class="menu-item px-3">
                                            <a class="menu-link px-3 btn-delete text-danger" data-kt-users-table-filter="delete_row" data-user-id="${data}">
                                                ${UserPage.message.delete}
                                            </a>
                                        </div>
                                    </div>`
                        }
                    },

                ],
                columnDefs: [
                    { targets: "no-sort", orderable: false },
                    { targets: "no-search", searchable: false },
                    { orderable: false, targets: [-1, 0, 1, 4] },
                ],
                aLengthMenu: [
                    [10, 25, 50, 100],
                    [10, 25, 50, 100]
                ],
                drawCallback: function () {
                    $('#user_datatable tfoot').html("");
                    $("#user_datatable thead tr").clone(true).appendTo("#user_datatable tfoot");
                    $('#user_datatable tfoot tr').addClass("border-top");
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
            //BEGIN: DATETIMEPICKER
            this.plugins.datetimePickerLockEndDate = new tempusDominus.TempusDominus(document.getElementById("user_lockEndDate"), {
                localization: {
                    locale: currentLang,
                    startOfTheWeek: 1,
                    format: "dd/MM/yyyy HH:mm:ss"
                }
            });

            //END: DATETIMEPICKER
            $("#user_gender").select2({
                language: currentLang,
                placeholder: 'Chọn giới tính',
                dropdownParent: $("#kt_modal_user"),
                disabled: true,
            });
            $("#user_userStatusId").select2({
                language: currentLang,
                placeholder: 'Chọn trạng thái',
                dropdownParent: $("#kt_modal_user"),
            });
            $("#user_roles").select2({
                language: currentLang,
                placeholder: 'Chọn quyền',
                dropdownParent: $("#kt_modal_user"),
                allowClear: true,
            });
            $("#user_provinceId").select2({
                language: currentLang,
                placeholder: 'Chọn tỉnh/thành phố',
            });
            //$("#user_districtId").select2({
            //    language: currentLang,
            //    placeholder: 'Chọn quận/huyện',
            //});
            $("#user_wardId").select2({
                language: currentLang,
                placeholder: 'Chọn xã/phường',
            });
           
        },
        regenDataTable: function () {
            if (this.table) {
                this.table.destroy();
                $("#user_datatable tbody").html("");
                this.initDataTable();
            }
        },
        refreshDataTable: function () {
            if (this.table)
                this.table.ajax.reload(null, false);
        },
        bindEvents: function () {
            this.bindEditEvent();
            this.bindDeleteEvent();
            this.bindSearchAllEvents();
            this.bindFilterEvents();
            this.bindAddEvent();
            this.bindSaveEvent();
            this.bindClearFilterDateRangeEvent();
            this.bindChangeEvent();
            this.bindClearDatetimePickerEvent();
            this.bindChangeImageEvent();
            /*this.bindLoadDistrictByProvince();*/
            this.bindLoadWardByProvince();
            this.bindToggleFilterEvent();
        },
        bindEditEvent: function () {
            $("#user_datatable tbody").on("click", ".btn-edit", function () {
                const id = $(this).attr("data-user-id");
                editItem(id);
            });
        },
        bindDeleteEvent: function () {
            $("#user_datatable tbody").on("click", ".btn-delete", function () {
                const id = $(this).attr("data-user-id");
                deleteItem(id);
            });
        },
        bindSearchAllEvents: function () {
            $("#user_datatable_search").on("keyup", AppUtils.debounce(function () {
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
            $("#btn_add_user").on("click", function () {
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
                UserPage.plugins.dateRangePickerFilter.clear();
            })
            $("#clear_filter_created_date").on("click", function () {
                UserPage.plugins.dateRangePickerFilter.clear();
            })
        },
        bindChangeEvent: function () {
            $("#user_userStatusId").on("change", function () {
                if ($(this).val() == UserPage.variables.userStatusActive) {
                    $("#user_lockEnabled").prop("disabled", true);
                    $("#user_lockEnabled").prop("checked", false);
                    $("#user_lockEndDate").val("").trigger("change");
                    $("#user_lockEndDate").prop("disabled", true);
                    $("#user_accessFailedCount").val(0).trigger("change");
                }
                else {
                    $("#user_lockEnabled").prop("disabled", false);
                    if ($("#user_lockEnabled").is(":checked")) {
                        $("#user_lockEndDate").prop("disabled", false);
                    }
                    else {
                        $("#user_lockEndDate").prop("disabled", true);
                    }
                }
            });
            $("#user_lockEnabled").on("change", function () {
                if (!$(this).is(":checked")) {
                    $("#user_lockEndDate").attr("disabled", true);
                    $("#user_lockEndDate").val("").trigger("change");
                }
                else {
                    $("#user_lockEndDate").attr("disabled", false);
                }
            });
        },
        bindClearDatetimePickerEvent: function () {
            $("#clear_user_lockEndDate i").on("click", function () {
                UserPage.plugins.datetimePickerLockEndDate.clear();
            })
            $("#clear_user_lockEndDate").on("click", function () {
                UserPage.plugins.datetimePickerLockEndDate.clear();
            })
        },
        bindChangeImageEvent: function () {
            $("#avatarId").on("click", function (e) {
                e.preventDefault();
                FileManager.show();
                UserPage.target = "#avatarId";
            });
        },
        bindLoadDistrictByProvince: function () {
            $("#user_provinceId").on("change", async function () {
                if (UserPage.variables.isLoadingFromEdit) return;
                await loadDataDistrictByProvinceId($(this).val());
            })
        },
        bindLoadWardByProvince: function () {
            $("#user_provinceId").on("change", async function () {
                if (UserPage.variables.isLoadingFromEdit) return;
                await loadDataWardByProvinceId($(this).val());
            });
        },
        loadRelatedData: async function () {
            await loadDataUserStatuses();
            await loadDataRoles();
            await loadDataProvince();
        },
        bindToggleFilterEvent: function () {
            $("#btn_user_filter").on("click", function () {
                $("#user_filter").slideToggle();
            })
        }
    }

    /**
     * Handle add new user
     */
    function addItem() {
        UserPage.formValidator.clearErrors();
        $("#kt_modal_user_header h2").text(`${UserPage.message.create} ${UserPage.message.pageTitle.toLocaleLowerCase()}`);
        $("#kt_modal_user_form input[type='text'],#kt_modal_user_form textarea, #kt_modal_user_form select").val("").trigger("change");
        $("#kt_modal_user_form input[type='color']").val("#000").trigger("change");
        $("#user_createdDate").val(moment().format("DD/MM/YYYY HH:mm:ss")).trigger("change");
    }

    /**
     * Author: 
     * CreatedDate: 
     * Description: Edit user by id
     * @param {number} id
     */
    async function editItem(id) {
        UserPage.formValidator.clearErrors();
        $("#global_loader").addClass("show");
        UserPage.variables.isLoadingFromEdit = true;
        try {
            const response = await httpService.getAsync(ApiRoutes.User.v1.Detail(id));
            const data = response.resources;
            Object.keys(data).forEach(key => {
                const selector = `#user_${key}`;
                const $el = $(selector);
                const rawValue = data[key];

                if ($el.is(':checkbox')) {
                    $el.prop("checked", rawValue === true).trigger("change");
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
            //User status
            $("#user_userStatusId").val(data.userStatus.id).trigger("change");


            //Quyền
            data.roles.forEach(item => {
                if ($("#user_roles").find("option[value='" + item.id + "']").length === 0) {
                    const newOption = new Option(AppUtils.escapeHtml(item.name), item.id, true, true);
                    $("#user_roles").append(newOption);
                }
            });
            $("#user_roles").val(data.roles.map(item => item.id)).trigger("change");

            //Ảnh
            if (data.avatar) {
                $("#user_avatar").css("background-image", `url('${data.avatar.url}')`);
                $("#user_avatarId").val(data.avatar.id);
            }
            else {
                $("#user_avatar").css("background-image", `url('${AppSettings.avatarDefault}')`);
                $("#user_avatarId").val(null);
            }

            //Địa chỉ
            //await loadDataDistrictByProvinceId(data.provinceId);
            //$('#user_districtId').val(data.districtId).trigger("change");;

            await loadDataWardByProvinceId(data.provinceId);
            $('#user_wardId').val(data.wardId).trigger("change");;
            $("#user_userStatusId, #user_roles").attr("disabled", !UserPage.permissionFlags.canUpdate);
            if (UserPage.permissionFlags.canUpdate) {
                $("#kt_modal_user_header h2").text(`${UserPage.message.edit} ${UserPage.message.pageTitle.toLocaleLowerCase()}`);
                $("#btn_save_user").removeClass("d-none");
                $("#btn_cancel_user").text(UserPage.message.cancel);
            }
            else {
                $("#kt_modal_user_header h2").text(`${UserPage.message.detail} ${UserPage.message.pageTitle.toLocaleLowerCase()}`);
                $("#btn_save_user").addClass("d-none");
                $("#btn_cancel_user").text(UserPage.message.ok);
            }
          
            $("#kt_modal_user").modal("show");
        } catch (e) {
            console.error(e);
            Swal.fire({
                icon: "error",
                title: UserPage.message.errorTitle,
                html: UserPage.message.notFound,
                ...AppSettings.sweetAlertOptions(false)
            });
        }
        finally {
            UserPage.variables.isLoadingFromEdit = false; // Reset flag
            $("#global_loader").removeClass("show");
        }
    }

    /**
     * Author:
     * CreatedDate:
     * Description: Delete user by id
     * @param {number} id
     */
    async function deleteItem(id) {

        const { isConfirmed } = await Swal.fire({
            icon: "question",
            title: UserPage.message.confirmTittle,
            html: UserPage.message.deleteConfirm,
            ...AppSettings.sweetAlertOptions(true)
        });

        if (!isConfirmed)
            return;

        $("#global_loader").addClass("show");
        try {
            const response = await httpService.deleteAsync(ApiRoutes.User.v1.Delete(id));
            if (response?.isSucceeded) {
                tableSearch();
                Swal.fire({
                    icon: "success",
                    title: UserPage.message.successTitle,
                    html: UserPage.message.deleteSuccess,
                    ...AppSettings.sweetAlertOptions(false)
                })
            }
        } catch (e) {
            console.error(e);
            Swal.fire({
                icon: "error",
                title: UserPage.message.failTitle,
                html: UserPage.message.deleteError,
                ...AppSettings.sweetAlertOptions(false)
            })
        }
        finally {
            $("#global_loader").removeClass("show");
        }
    }

    /**
     * Save data (Create or Update) user status
     */
    async function saveData() {

        const btnSave = $("#btn_save_user");
        btnSave.attr("disabled", true);

        const columns = ["id", "userStatusId", "lockEnabled", "lockEndDate", "roles"];
        const data = {};
        columns.forEach(key => {
            const selector = `#user_${key}`;
            const $el = $(selector);

            if ($el.is(':checkbox')) {
                data[key] = $el.is(':checked');
            } else {
                data[key] = key.toLocaleLowerCase().includes("date") && $el.val() != null && $el.val() != '' ? moment($el.val().toString(), "DD/MM/YYYY HH:mm:ss").format("YYYY-MM-DD HH:mm:ss") : $el.val();
            }
        });
        const isAdd = !data.id;
        const confirmText = isAdd ? UserPage.message.createConfirm : UserPage.message.updateConfirm;
        const { isConfirmed } = await Swal.fire({
            icon: 'question',
            title: UserPage.message.confirmTittle,
            html: confirmText,
            ...AppSettings.sweetAlertOptions(true)
        });

        if (isConfirmed) {
            btnSave.attr("data-kt-indicator", "on");
            try {
                const response = isAdd ?
                    await httpService.postAsync(ApiRoutes.User.v1.Create, data) :
                    await httpService.putAsync(ApiRoutes.User.v1.Update, data);
                if (response?.isSucceeded) {
                    if (isAdd) {
                        $("#user_datatable_search").val("").trigger("change");
                        resetFilter();
                    }
                    else {
                        UserPage.refreshDataTable();
                    }

                    $("#kt_modal_user").modal("hide");
                    const successText = isAdd ? UserPage.message.createSuccess : UserPage.message.updateSuccess;
                    Swal.fire({
                        icon: "success",
                        title: UserPage.message.successTitle,
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
                    errorTitle = UserPage.message.validationError;

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
                    errorTitle = UserPage.message.failTitle;
                    errorText = isAdd ? UserPage.message.createError : UserPage.message.updateError;
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
     * Search data table
     */
    function tableSearch() {
        UserPage.table.column(6).search($("#filter_created_date").val());
        UserPage.table.search($("#user_datatable_search").val().trim()).draw();
    }

    /**
     * Reset filter
     */
    function resetFilter() {
        $("#filter_name").val("");
        $("#filter_description").val("");
        $("#filter_email").val("");
        $("#filter_phoneNumber").val("");
        $("#user_filter [data-control=select2]").val("").trigger("change");
        UserPage.plugins.dateRangePickerFilter.clear();
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
                $("#user_userStatusId").append(new Option(AppUtils.escapeHtml(item.name), item.id, false, false));
                $("#filter_userStatusId").append(new Option(AppUtils.escapeHtml(item.name), item.id, false, false));
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
            const response = await httpService.getAsync(ApiRoutes.Role.v1.List);
            const data = response.resources;
            data.forEach(function (item) {
                $("#user_roles").append(new Option(AppUtils.escapeHtml(item.name), item.id, false, false));
                $("#filter_roleId").append(new Option(AppUtils.escapeHtml(item.name), item.id, false, false));
            });
        } catch (e) {
            console.error(e);
        }
    }
   
    /**
    * Load data Province
    */
    async function loadDataProvince() {
        try {
            const response = await httpService.getAsync(ApiRoutes.Province.v1.List);
            const data = response.resources;
            data.forEach(function (item) {
                $("#user_provinceId").append(new Option(AppUtils.escapeHtml(item.name), item.id, false, false));
            });
        } catch (e) {
            console.error(e);
        }
    }
    /**
    * Load data District by ProvinceId
    * @param {number} provinceId
    */
    async function loadDataDistrictByProvinceId(provinceId) {
        if (!provinceId) {
            return;
        }
        try {
            $("#user_districtId").empty();
            $("#user_wardId").empty();
            const response = await httpService.getAsync(ApiRoutes.Province.v1.ListDistrictByProvinceId(provinceId));
            const data = response.resources;
            data.forEach(function (item) {
                $("#user_districtId").append(new Option(AppUtils.escapeHtml(item.name), item.id, false, false));
            });
            $("#user_districtId").val("").trigger("change");
        } catch (e) {
            console.error(e);
        }
    }
    /**
      * Load data Ward by provinceId
      * @param {number} provinceId
      */
    async function loadDataWardByProvinceId(provinceId) {
        if (!provinceId) {
            return;
        }
        try {
            $("#user_wardId").empty();
            const response = await httpService.getAsync(ApiRoutes.Province.v1.Wards(provinceId));
            const data = response.resources;
            data.forEach(function (item) {
                $("#user_wardId").append(new Option(AppUtils.escapeHtml(item.name), item.id, false, false));
            });
            $("#user_wardId").val("").trigger("change")

        } catch (e) {
            console.error(e);
        }
    }

    // On document ready
    KTUtil.onDOMContentLoaded(async function () {
        await AppEntry.init();
        if (!UserPage.permissionFlags.canView) {
            AppSettings.mainElements.PAGE_CONTENT.addClass("d-none");
            AppSettings.mainElements.NOT_FOUND.removeClass("d-none");
        }
        else
            UserPage.init();     
    });
})();