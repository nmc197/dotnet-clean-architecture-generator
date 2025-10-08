"use strict";

(function () {
    // Class definition
    const ProvincePage = {
        provinceTable: null,
        wardTable: null,
        formValidator: null,
        wardFormValidator: null,
        plugins: {
            dateRangePickerFilter: null
        },
        permissionFlags: AppUtils.getPermissionFlags(),
        message: {
            provinceTitle: I18n.t("province", "PROVINCE"),
            wardTitle: I18n.t("province", "WARD"),
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
            createConfirm: I18n.t("common", "CREATE_CONFIRM", { name: I18n.t("province", "PROVINCE").toLocaleLowerCase() }),
            createSuccess: I18n.t("common", "CREATE_SUCCESS", { name: I18n.t("province", "PROVINCE").toLocaleLowerCase() }),
            createError: I18n.t("common", "CREATE_ERROR", { name: I18n.t("province", "PROVINCE").toLocaleLowerCase() }),
            updateConfirm: I18n.t("common", "UPDATE_CONFIRM", { name: I18n.t("province", "PROVINCE").toLocaleLowerCase() }),
            updateSuccess: I18n.t("common", "UPDATE_SUCCESS", { name: I18n.t("province", "PROVINCE") }),
            updateError: I18n.t("common", "UPDATE_ERROR", { name: I18n.t("province", "PROVINCE").toLocaleLowerCase() }),
            deleteConfirm: I18n.t("common", "DELETE_CONFIRM", { name: I18n.t("province", "PROVINCE").toLocaleLowerCase() }),
            deleteSuccess: I18n.t("common", "DELETE_SUCCESS", { name: I18n.t("province", "PROVINCE").toLocaleLowerCase() }),
            deleteError: I18n.t("common", "DELETE_ERROR", { name: I18n.t("province", "PROVINCE").toLocaleLowerCase() }),
            notFound: I18n.t("common", "NOT_FOUND", { name: I18n.t("province", "PROVINCE").toLocaleLowerCase() }),
            validationError: I18n.t("common", "VALIDATION_ERROR"),
            createWardConfirm: I18n.t("common", "CREATE_CONFIRM", { name: I18n.t("province", "WARD").toLocaleLowerCase() }),
            createWardSuccess: I18n.t("common", "CREATE_SUCCESS", { name: I18n.t("province", "WARD").toLocaleLowerCase() }),
            createWardError: I18n.t("common", "CREATE_ERROR", { name: I18n.t("province", "WARD").toLocaleLowerCase() }),
            updateWardConfirm: I18n.t("common", "UPDATE_CONFIRM", { name: I18n.t("province", "WARD").toLocaleLowerCase() }),
            updateWardSuccess: I18n.t("common", "UPDATE_SUCCESS", { name: I18n.t("province", "WARD") }),
            updateWardError: I18n.t("common", "UPDATE_ERROR", { name: I18n.t("province", "WARD").toLocaleLowerCase() }),
            deleteWardConfirm: I18n.t("common", "DELETE_CONFIRM", { name: I18n.t("province", "WARD").toLocaleLowerCase() }),
            deleteWardSuccess: I18n.t("common", "DELETE_SUCCESS", { name: I18n.t("province", "WARD").toLocaleLowerCase() }),
            deleteWardError: I18n.t("common", "DELETE_ERROR", { name: I18n.t("province", "WARD").toLocaleLowerCase() }),
            wardNotFound: I18n.t("common", "NOT_FOUND", { name: I18n.t("province", "WARD").toLocaleLowerCase() }),
        },
        init: function () {
            this.initPlugins();
            this.loadRelatedData();
            this.initProvinceDataTable();
            this.initWardDataTable();
            this.bindEvents();
            this.formValidator = new FormValidator({
                formSelector: "#kt_modal_province_form",
                handleSubmit: saveData,
                rules: [
                    {
                        element: "#province_name",
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
                        element: "#province_code",
                        rule: [
                            {
                                name: "required",
                                message: I18n.t("common", "REQUIRED", { field: "Mã" })
                            },
                            {
                                name: "maxLength",
                                message: I18n.t("common", "TOO_LONG", { field: "Mã", max: 255 }),
                                params: 255,
                                allowNullOrEmpty: true
                            }
                        ]

                    },
                    {
                        element: "#province_slug",
                        rule: [
                            {
                                name: "required",
                                message: I18n.t("common", "REQUIRED", { field: "Slug" })
                            },
                            {
                                name: "maxLength",
                                message: I18n.t("common", "TOO_LONG", { field: "Slug", max: 255 }),
                                params: 255,
                                allowNullOrEmpty: true
                            }
                        ]

                    },
                    {
                        element: "#province_type",
                        rule: [
                            {
                                name: "required",
                                message: I18n.t("common", "REQUIRED_SELECT", { field: "Cấp" })
                            },
                        ]

                    },
                ]
            });
            this.wardFormValidator = new FormValidator({
                formSelector: "#kt_modal_ward_form",
                handleSubmit: saveWardData,
                rules: [
                    {
                        element: "#ward_name",
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
                        element: "#ward_code",
                        rule: [
                            {
                                name: "required",
                                message: I18n.t("common", "REQUIRED", { field: "Mã" })
                            },
                            {
                                name: "maxLength",
                                message: I18n.t("common", "TOO_LONG", { field: "Mã", max: 255 }),
                                params: 255,
                                allowNullOrEmpty: true
                            }
                        ]

                    },
                    {
                        element: "#ward_slug",
                        rule: [
                            {
                                name: "required",
                                message: I18n.t("common", "REQUIRED", { field: "Slug" })
                            },
                            {
                                name: "maxLength",
                                message: I18n.t("common", "TOO_LONG", { field: "Slug", max: 255 }),
                                params: 255,
                                allowNullOrEmpty: true
                            }
                        ]

                    },
                    {
                        element: "#ward_type",
                        rule: [
                            {
                                name: "required",
                                message: I18n.t("common", "REQUIRED_SELECT", { field: "Cấp" })
                            },
                        ]

                    },
                    {
                        element: "#ward_provinceId",
                        rule: [
                            {
                                name: "required",
                                message: I18n.t("common", "REQUIRED_SELECT", { field: "Tỉnh/Thành phố" })
                            },
                        ]
                    }
                ]
            });
        },
        initProvinceDataTable: function () {
            this.provinceTable = $("#province_datatable").DataTable({
                processing: true,
                serverSide: true,
                paging: true,
                searching: { regex: true },
                order: [1, 'asc'],
                language: AppSettings.dataTableLanguage.vi,
                ajax: {
                    url: ApiRoutes.Province.v1.PagedAdvanced,
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
                            const tableSettings = ProvincePage.provinceTable.settings()[0];
                            tableSettings.ajax.headers.Authorization = "Bearer " + TokenService.getAccessToken();

                            //Reload lại datatable với token mới
                            ProvincePage.provinceTable.ajax.reload();
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
                            const info = ProvincePage.provinceTable.page.info();
                            const index = meta.row + 1 + info.page * info.length;
                            return index; // This contains the row index
                        }
                    },
                    {
                        data: "code",
                        render: function (data, type, row, meta) {
                            return `<div class="fw-semibold text-gray-800 text-hover-primary"  data-province-id='${row.id}'>${AppUtils.escapeHtml(data)}</div>`;
                        },
                    },
                    {
                        data: "name",
                        render: function (data, type, row, meta) {
                            return `<div class="fw-semibold text-gray-800 text-hover-primary"  data-province-id='${row.id}'>${AppUtils.escapeHtml(data)}</div>`;
                        },
                    },
                    {
                        data: "slug",
                        render: function (data, type, row, meta) {
                            return data ? `<span  data-province-id='${row.id}'>${AppUtils.escapeHtml(data)}</span>` : "";
                        },
                    },
                    {
                        data: "type",
                        render: function (data, type, row, meta) {
                            return data ? `<span  data-province-id='${row.id}'>${AppUtils.escapeHtml(row.typeName)}</span>` : "";
                        },
                    },
                    {
                        data: 'id',
                        className: 'text-end',
                        render: function (data, type, row, meta) {
                            return `<a href="#" class="btn btn-light btn-active-light-primary btn-flex btn-center btn-sm" data-kt-menu-trigger="click" data-kt-menu-placement="bottom-end" data-kt-menu-flip="top-end">
                                                ${ProvincePage.message.actions}
                                                <i class="ki-duotone ki-down fs-5 ms-1"></i>
                                    </a>
                                    <div class="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg-light-primary fw-semibold fs-7 w-125px py-4" data-kt-menu="true">
                                        <div class="menu-item px-3">
                                            <a href="#" class="menu-link px-3 btn-edit" data-kt-docs-table-filter="edit_row" data-province-id="${data}">
                                                ${ProvincePage.permissionFlags.canUpdate ? ProvincePage.message.edit : ProvincePage.message.detail}
                                            </a>
                                        </div>
                                        <div class="menu-item px-3 ${!ProvincePage.permissionFlags.canDelete ? "d-none" : ""}">
                                            <a href="#" class="menu-link px-3 text-danger btn-delete" data-kt-users-table-filter="delete_row" data-province-id="${data}">
                                                ${ProvincePage.message.delete}
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
                    $('#province_datatable tfoot').html("");
                    $("#province_datatable thead tr").clone(true).appendTo("#province_datatable tfoot");
                    $('#province_datatable tfoot tr').addClass("border-top");
                }
            })

            this.provinceTable.on("draw", function () {
                KTMenu.createInstances();
            })
        },
        initWardDataTable: function () {
            this.wardTable = $("#ward_datatable").DataTable({
                processing: true,
                serverSide: true,
                paging: true,
                searching: { regex: true },
                order: [1, 'asc'],
                language: AppSettings.dataTableLanguage.vi,
                ajax: {
                    url: ApiRoutes.Ward.v1.PagedAdvanced,
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
                            const tableSettings = ProvincePage.wardTable.settings()[0];
                            tableSettings.ajax.headers.Authorization = "Bearer " + TokenService.getAccessToken();

                            //Reload lại datatable với token mới
                            ProvincePage.wardTable.ajax.reload();
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
                            const info = ProvincePage.wardTable.page.info();
                            const index = meta.row + 1 + info.page * info.length;
                            return index; // This contains the row index
                        }
                    },
                    {
                        data: "code",
                        render: function (data, type, row, meta) {
                            return `<div class="fw-semibold text-gray-800 text-hover-primary"  data-province-id='${row.id}'>${AppUtils.escapeHtml(data)}</div>`;
                        },
                    },
                    {
                        data: "name",
                        render: function (data, type, row, meta) {
                            return `<div class="fw-semibold text-gray-800 text-hover-primary"  data-province-id='${row.id}'>${AppUtils.escapeHtml(data)}</div>`;
                        },
                    },
                    {
                        data: "slug",
                        render: function (data, type, row, meta) {
                            return data ? `<span  data-province-id='${row.id}'>${AppUtils.escapeHtml(data)}</span>` : "";
                        },
                    },
                    {
                        data: "type",
                        render: function (data, type, row, meta) {
                            return data ? `<span  data-province-id='${row.id}'>${AppUtils.escapeHtml(row.typeName)}</span>` : "";
                        },
                    },
                    {
                        data: "provinceId",
                        render: function (data, type, row, meta) {
                            return data ? `<span  data-province-id='${row.id}'>${AppUtils.escapeHtml(row.provinceName)}</span>` : "";
                        },
                    },
                    {
                        data: 'id',
                        className: 'text-end',
                        render: function (data, type, row, meta) {
                            return `<a href="#" class="btn btn-light btn-active-light-primary btn-flex btn-center btn-sm" data-kt-menu-trigger="click" data-kt-menu-placement="bottom-end" data-kt-menu-flip="top-end">
                                                ${ProvincePage.message.actions}
                                                <i class="ki-duotone ki-down fs-5 ms-1"></i>
                                    </a>
                                    <div class="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg-light-primary fw-semibold fs-7 w-125px py-4" data-kt-menu="true">
                                        <div class="menu-item px-3">
                                            <a href="#" class="menu-link px-3 btn-edit" data-kt-docs-table-filter="edit_row" data-ward-id="${data}">
                                                ${ProvincePage.permissionFlags.canUpdate ? ProvincePage.message.edit : ProvincePage.message.detail}
                                            </a>
                                        </div>
                                        <div class="menu-item px-3 ${!ProvincePage.permissionFlags.canDelete ? "d-none" : ""}">
                                            <a href="#" class="menu-link px-3 text-danger btn-delete" data-kt-users-table-filter="delete_row" data-ward-id="${data}">
                                                ${ProvincePage.message.delete}
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
                    $('#ward_datatable tfoot').html("");
                    $("#ward_datatable thead tr").clone(true).appendTo("#ward_datatable tfoot");
                    $('#ward_datatable tfoot tr').addClass("border-top");
                }
            })

            this.wardTable.on("draw", function () {
                KTMenu.createInstances();
            })
        },
        initPlugins: function () {
            $("#filter_province_type").select2({
                language: currentLang,
                allowClear: true,
                placeholder: "Chọn cấp",
            });
            $("#province_type").select2({
                language: currentLang,
                placeholder: "Chọn cấp",
                allowClear: true,
                dropdownParent: "#kt_modal_province"
            });
            $("#ward_type").select2({
                language: currentLang,
                placeholder: "Chọn cấp",
                allowClear: true,
                dropdownParent: "#kt_modal_ward"
            });
            $("#filter_ward_type").select2({
                language: currentLang,
                allowClear: true,
                placeholder: "Chọn cấp",
            });
            $("#filter_ward_provinceId").select2({
                language: currentLang,
                allowClear: true,
                placeholder: "Chọn tỉnh/thành phố",
            });
            $("#ward_provinceId").select2({
                language: currentLang,
                allowClear: true,
                placeholder: "Chọn tỉnh/thành phố",
            }).on('change', function () {
                const selectedOption = $(this).select2('data')[0];
                const provinceCode = selectedOption ? selectedOption.code : '';
                $("#ward_provinceCode").val(provinceCode).trigger('change');
            });
        },
        checkPermissions: function () {
            if (!ProvincePage.permissionFlags.canCreate)
                $("#btn_add_blog_post").addClass("d-none");
        },
        regenProvinceDataTable: function () {
            if (this.provinceTable) {
                this.provinceTable.destroy();
                $("#province_datatable tbody").html("");
                this.initDataTable();
            }
        },
        refreshProvinceDataTable: function () {
            if (this.provinceTable) {
                this.provinceTable.ajax.reload(null, false);
            }
        },
        refreshWardDataTable: function () {
            if (this.wardTable) {
                this.wardTable.ajax.reload(null, false);
            }
        },
        bindEvents: function () {
            this.bindEditEvent();
            this.bindDeleteEvent();
            this.bindSearchAllProvinceEvents();
            this.bindProvinceFilterEvents();
            this.bindSearchAllWardEvents();
            this.bindWardFilterEvents();
            this.bindAddEvent();
            this.bindSaveEvent();
            this.bindAddWardEvent();
            this.bindEditWardEvent();
            this.bindDeleteWardEvent();
            this.bindProvinceNameChangeEvent();
            this.bindWardNameChangeEvent();
            this.bindToggleFilterEvent();
        },
        bindEditEvent: function () {
            $("#province_datatable tbody").on("click", ".btn-edit", function () {
                const id = $(this).attr("data-province-id");
                editItem(id);
            });
        },
        bindDeleteEvent: function () {
            $("#province_datatable tbody").on("click", ".btn-delete", function () {
                const id = $(this).attr("data-province-id");
                deleteItem(id);
            });
        },
        bindEditWardEvent: function () {
            $("#ward_datatable tbody").on("click", ".btn-edit", function () {
                const id = $(this).attr("data-ward-id");
                editWardItem(id);
            });
        },
        bindDeleteWardEvent: function () {
            $("#ward_datatable tbody").on("click", ".btn-delete", function () {
                const id = $(this).attr("data-ward-id");
                deleteWardItem(id);
            });
        },
        bindSearchAllProvinceEvents: function () {
            $("#province_datatable_search").on("keyup", AppUtils.debounce(function () {
                tableProvinceSearch();
            }, 300))
        },
        bindProvinceFilterEvents: function () {
            //reset filter event
            $("#btn_reset_province_filter").on("click", function () {
                resetFilterProvince();
            })

            //apply filter event
            $("#btn_apply_province_filter").on("click", function () {
                tableProvinceSearch();
            })
        },
        bindSearchAllWardEvents: function () {
            $("#ward_datatable_search").on("keyup", AppUtils.debounce(function () {
                tableWardSearch();
            }, 300))
        },
        bindWardFilterEvents: function () {
            //reset filter event
            $("#btn_reset_ward_filter").on("click", function () {
                resetFilterWard();
            })

            //apply filter event
            $("#btn_apply_ward_filter").on("click", function () {
                tableWardSearch();
            })
        },
        bindAddEvent: function () {
            $("#btn_add_province").on("click", function () {
                addItem();
            })
        },
        bindAddWardEvent: function () {
            $("#btn_add_ward").on("click", function () {
                addWardItem();
            })
        },
        bindSaveEvent: function () {
            //$("#btn_save_province").on("click", function (e) {
            //    e.preventDefault();
            //    saveData();
            //})
        },
        bindProvinceNameChangeEvent: function () {
            $("#province_name").on("keyup", function () {
                const value = $(this).val();
                $("#province_slug").val(AppUtils.slugify(value)).trigger("change");
            });
            $("#province_name").on("change", function () {
                const value = $(this).val();
                $("#province_slug").val(AppUtils.slugify(value)).trigger("change");
            })
        },
        bindWardNameChangeEvent: function () {
            $("#ward_name").on("keyup", function () {
                const value = $(this).val();
                $("#ward_slug").val(AppUtils.slugify(value)).trigger("change");
            });
            $("#ward_name").on("change", function () {
                const value = $(this).val();
                $("#ward_slug").val(AppUtils.slugify(value)).trigger("change");
            })
        },
        loadRelatedData: function () {
            loadProvinceData();
        },
        bindToggleFilterEvent: function () {
            $("#btn_province_filter").on("click", function () {
                $("#province_filter").slideToggle();
            })
            $("#btn_ward_filter").on("click", function () {
                $("#ward_filter").slideToggle();
            })
        }
    }

    /**
     * Handle add new province
     */
    function addItem() {
        ProvincePage.formValidator.clearErrors();
        $("#kt_modal_province_header h2").text(`${ProvincePage.message.create} ${ProvincePage.message.provinceTitle.toLocaleLowerCase()}`);
        $("#kt_modal_province_form input[type='text'],#kt_modal_province_form textarea, #kt_modal_province_form select").val("").trigger("change");
        $("#kt_modal_province_form input[type='color']").val("#000").trigger("change");
        $("#province_createdDate").val(moment().format("DD/MM/YYYY HH:mm:ss")).trigger("change");
        $("#btn_save_province").removeClass("d-none");
        $("#btn_cancel_province").text(ProvincePage.message.cancel);
        $("#kt_modal_province_form input[type='text'],#kt_modal_province_form textarea, #kt_modal_province_form select,#kt_modal_province_form input[type='color']").attr("disabled", false);
        $("#province_createdDate").attr("disabled", true);
        $("#province_slug").attr("disabled", true);
        $("#province_isCentral").prop("checked", false).trigger("change");
    }

    /**
     * Handle add new ward
     */
    function addWardItem() {
        ProvincePage.wardFormValidator.clearErrors();
        $("#kt_modal_ward_header h2").text(`${ProvincePage.message.create} ${ProvincePage.message.wardTitle.toLocaleLowerCase()}`);
        $("#kt_modal_ward_form input[type='text'],#kt_modal_ward_form textarea, #kt_modal_ward_form select").val("").trigger("change");
        $("#kt_modal_ward_form input[type='color']").val("#000").trigger("change");
        $("#ward_createdDate").val(moment().format("DD/MM/YYYY HH:mm:ss")).trigger("change");
        $("#btn_save_ward").removeClass("d-none");
        $("#btn_cancel_ward").text(ProvincePage.message.cancel);
        $("#kt_modal_ward_form input[type='text'],#kt_modal_ward_form textarea, #kt_modal_ward_form select,#kt_modal_ward_form input[type='color']").attr("disabled", false);
        $("#ward_createdDate").attr("disabled", true);
        $("#ward_slug").attr("disabled", true);
        $("#ward_provinceId").val(null).trigger("change");
        $("#kt_modal_ward").modal("show");
    }

    /**
     * Author: 
     * CreatedDate: 
     * Description: Edit province by id
     * @param {number} id
     */
    async function editItem(id) {
        ProvincePage.formValidator.clearErrors();
        $("#global_loader").addClass("show");
        try {
            const response = await httpService.getAsync(ApiRoutes.Province.v1.Detail(id));
            const data = response.resources;
            Object.keys(data).forEach(key => {
                const selector = `#province_${key}`;
                if (key === 'isCentral') {
                    $(selector).prop("checked", data[key]).trigger("change");
                } else {
                    const value = key.toLocaleLowerCase().includes("date") ? moment(data[key].toString()).format("DD/MM/YYYY HH:mm:ss") : data[key];
                    $(selector).val(value).trigger("change");
                }
                if (!key.toLocaleLowerCase().includes("date") && !key.toLocaleLowerCase().includes("slug")) {
                    $(selector).attr("disabled", !ProvincePage.permissionFlags.canUpdate);
                }
            })
            if (ProvincePage.permissionFlags.canUpdate) {
                $("#kt_modal_province_header h2").text(`${ProvincePage.message.edit} ${ProvincePage.message.provinceTitle.toLocaleLowerCase()}`);
                $("#btn_save_province").removeClass("d-none");
                $("#btn_cancel_province").text(ProvincePage.message.cancel);
            }
            else {
                $("#kt_modal_province_header h2").text(`${ProvincePage.message.detail} ${ProvincePage.message.provinceTitle.toLocaleLowerCase()}`);
                $("#btn_save_province").addClass("d-none");
                $("#btn_cancel_province").text(ProvincePage.message.ok);
            }
            $("#kt_modal_province").modal("show");
        } catch (e) {
            console.error(e);
            Swal.fire({
                icon: "error",
                title: ProvincePage.message.errorTitle,
                html: ProvincePage.message.notFound,
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
     * Description: Edit ward by id
     * @param {number} id
     */
    async function editWardItem(id) {
        ProvincePage.wardFormValidator.clearErrors();
        $("#global_loader").addClass("show");
        try {
            const response = await httpService.getAsync(ApiRoutes.Ward.v1.Detail(id));
            const data = response.resources;
            Object.keys(data).forEach(key => {
                const selector = `#ward_${key}`;
                if (key === 'provinceId') {
                    $(selector).val(data[key]).trigger("change");

                } else if (key === 'provinceCode') {
                    $(selector).val(data[key]).trigger("change");
                } else {
                    const value = key.toLocaleLowerCase().includes("date") ? moment(data[key].toString()).format("DD/MM/YYYY HH:mm:ss") : data[key];
                    $(selector).val(value).trigger("change");
                }
                if (!key.toLocaleLowerCase().includes("date") && !key.toLocaleLowerCase().includes("slug")) {
                    $(selector).attr("disabled", !ProvincePage.permissionFlags.canUpdate);
                }
            })
            if (ProvincePage.permissionFlags.canUpdate) {
                $("#kt_modal_ward_header h2").text(`${ProvincePage.message.edit} ${ProvincePage.message.wardTitle.toLocaleLowerCase()}`);
                $("#btn_save_ward").removeClass("d-none");
                $("#btn_cancel_ward").text(ProvincePage.message.cancel);
            }
            else {
                $("#kt_modal_ward_header h2").text(`${ProvincePage.message.detail} ${ProvincePage.message.wardTitle.toLocaleLowerCase()}`);
                $("#btn_save_ward").addClass("d-none");
                $("#btn_cancel_ward").text(ProvincePage.message.ok);
            }
            $("#kt_modal_ward").modal("show");
        } catch (e) {
            console.error(e);
            Swal.fire({
                icon: "error",
                title: ProvincePage.message.errorTitle,
                html: ProvincePage.message.wardNotFound,
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
     * Description: Delete province by id
     * @param {number} id
     */
    async function deleteItem(id) {

        const { isConfirmed } = await Swal.fire({
            icon: "question",
            title: ProvincePage.message.confirmTittle,
            html: ProvincePage.message.deleteConfirm,
            ...AppSettings.sweetAlertOptions(true)
        });

        if (!isConfirmed)
            return;

        $("#global_loader").addClass("show");
        try {
            const response = await httpService.deleteAsync(ApiRoutes.Province.v1.Delete(id));
            if (response?.isSucceeded) {
                /*tableProvinceSearch();*/
                ProvincePage.refreshProvinceDataTable();
                Swal.fire({
                    icon: "success",
                    title: ProvincePage.message.successTitle,
                    html: ProvincePage.message.deleteSuccess,
                    ...AppSettings.sweetAlertOptions(false)
                })
            }
        } catch (e) {
            console.error(e);
            Swal.fire({
                icon: "error",
                title: ProvincePage.message.failTitle,
                html: ProvincePage.message.deleteError,
                ...AppSettings.sweetAlertOptions(false)
            })
        }
        finally {
            $("#global_loader").removeClass("show");
        }
    }

    /**
     * Author:
     * CreatedDate:
     * Description: Delete ward by id
     * @param {number} id
     */
    async function deleteWardItem(id) {

        const { isConfirmed } = await Swal.fire({
            icon: "question",
            title: ProvincePage.message.confirmTittle,
            html: ProvincePage.message.deleteWardConfirm,
            ...AppSettings.sweetAlertOptions(true)
        });

        if (!isConfirmed)
            return;

        $("#global_loader").addClass("show");
        try {
            const response = await httpService.deleteAsync(ApiRoutes.Ward.v1.Delete(id));
            if (response?.isSucceeded) {
                /*tableProvinceSearch();*/
                ProvincePage.refreshWardDataTable();
                Swal.fire({
                    icon: "success",
                    title: ProvincePage.message.successTitle,
                    html: ProvincePage.message.deleteWardSuccess,
                    ...AppSettings.sweetAlertOptions(false)
                })
            }
        } catch (e) {
            console.error(e);
            Swal.fire({
                icon: "error",
                title: ProvincePage.message.failTitle,
                html: ProvincePage.message.deleteWardError,
                ...AppSettings.sweetAlertOptions(false)
            })
        }
        finally {
            $("#global_loader").removeClass("show");
        }
    }

    /**
     * Save data (Create or Update) province
     */
    async function saveData() {

        const btnSave = $("#btn_save_province");
        btnSave.attr("disabled", true);

        const columns = ["id", "name", "code", "slug", "type"];
        const data = {};
        columns.forEach(key => {
            const selector = `#province_${key}`;
            data[key] = $(selector).val();
        });
        data.isCentral = data.type === "city";
        const isAdd = !data.id;
        const confirmText = isAdd ? ProvincePage.message.createConfirm : ProvincePage.message.updateConfirm;
        const { isConfirmed } = await Swal.fire({
            icon: 'question',
            title: ProvincePage.message.confirmTittle,
            html: confirmText,
            ...AppSettings.sweetAlertOptions(true)
        });

        if (isConfirmed) {
            btnSave.attr("data-kt-indicator", "on");
            try {
                const response = isAdd ?
                    await httpService.postAsync(ApiRoutes.Province.v1.Create, data) :
                    await httpService.putAsync(ApiRoutes.Province.v1.Update, data);
                if (response?.isSucceeded) {
                    if (isAdd) {
                        $("#province_datatable_search").val("").trigger("change");
                        resetFilterProvince();
                    }
                    else {
                        ProvincePage.refreshProvinceDataTable();
                    }

                    $("#kt_modal_province").modal("hide");
                    const successText = isAdd ? ProvincePage.message.createSuccess : ProvincePage.message.updateSuccess;
                    Swal.fire({
                        icon: "success",
                        title: ProvincePage.message.successTitle,
                        html: successText,
                        ...AppSettings.sweetAlertOptions(false)
                    });
                }

            } catch (e) {
                AppUtils.handleApiError(e, {
                    action: isAdd ? "create" : "update",
                    name: ProvincePage.message.provinceTitle,
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
     * Save data (Create or Update) ward
     */
    async function saveWardData() {

        const btnSave = $("#btn_save_ward");
        btnSave.attr("disabled", true);

        const columns = ["id", "name", "code", "slug", "type", "provinceId", "provinceCode"];
        const data = {};
        columns.forEach(key => {
            const selector = `#ward_${key}`;
            data[key] = $(selector).val();

        });
        const isAdd = !data.id;
        const confirmText = isAdd ? ProvincePage.message.createWardConfirm : ProvincePage.message.updateWardConfirm;
        const { isConfirmed } = await Swal.fire({
            icon: 'question',
            title: ProvincePage.message.confirmTittle,
            html: confirmText,
            ...AppSettings.sweetAlertOptions(true)
        });

        if (isConfirmed) {
            btnSave.attr("data-kt-indicator", "on");
            try {
                const response = isAdd ?
                    await httpService.postAsync(ApiRoutes.Ward.v1.Create, data) :
                    await httpService.putAsync(ApiRoutes.Ward.v1.Update, data);
                if (response?.isSucceeded) {
                    if (isAdd) {
                        $("#ward_datatable_search").val("").trigger("change");
                        resetFilterWard();
                    }
                    else {
                        ProvincePage.refreshWardDataTable();
                    }

                    $("#kt_modal_ward").modal("hide");
                    const successText = isAdd ? ProvincePage.message.createWardSuccess : ProvincePage.message.updateWardSuccess;
                    Swal.fire({
                        icon: "success",
                        title: ProvincePage.message.successTitle,
                        html: successText,
                        ...AppSettings.sweetAlertOptions(false)
                    });
                }

            } catch (e) {
                AppUtils.handleApiError(e, {
                    action: isAdd ? "create" : "update",
                    name: ProvincePage.message.wardTitle,
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
    function tableProvinceSearch() {
        ProvincePage.provinceTable.column(2).search($("#filter_province_name").val().trim());
        ProvincePage.provinceTable.column(4).search($("#filter_province_type").val().join(","));
        ProvincePage.provinceTable.search($("#province_datatable_search").val().trim()).draw();
    }

    /**
     * Reset filter
     */
    function resetFilterProvince() {
        $("#filter_province_name").val("");
        $("#filter_province_type").val([]).trigger("change");
        tableProvinceSearch();
    }

    function tableWardSearch() {
        ProvincePage.wardTable.column(2).search($("#filter_ward_name").val().trim());
        ProvincePage.wardTable.column(4).search($("#filter_ward_type").val().join(","));
        ProvincePage.wardTable.column(5).search($("#filter_ward_provinceId").val().join(","));
        ProvincePage.wardTable.search($("#ward_datatable_search").val().trim()).draw();
    }

    function resetFilterWard() {
        $("#filter_ward_name").val("");
        $("#filter_ward_type").val([]).trigger("change");
        $("#filter_ward_provinceId").val([]).trigger("change");
        tableWardSearch();
    }

    async function loadProvinceData() {
        try {
            const response = await httpService.getAsync(ApiRoutes.Province.v1.List);
            response?.resources?.forEach(item => {
                $("#filter_ward_provinceId").append(new Option(item.name, item.id, false, false, false));
            });

            const provinces = response?.resources || [];
            const select2Data = provinces.map(item => ({
                id: item.id,
                text: item.name,
                code: item.code // Lưu code của tỉnh/thành phố
            }));
            $("#ward_provinceId").empty().select2({
                data: select2Data,
                language: currentLang,
                allowClear: true,
                placeholder: "Chọn tỉnh/thành phố",
            }).trigger('change');

        } catch (e) {
            console.error(e);
        }
    }

    // On document ready
    KTUtil.onDOMContentLoaded(async function () {
        await AppEntry.init();
        if (!ProvincePage.permissionFlags.canView) {
            AppSettings.mainElements.APP_MAIN.addClass("d-none");
            AppSettings.mainElements.NOT_FOUND.removeClass("d-none");
        }
        else
            ProvincePage.init();
    });
})();