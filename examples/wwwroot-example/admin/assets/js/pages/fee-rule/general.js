"use strict";

(function () {
    // Class definition
    const FeeRulePage = {
        table: null,
        formValidator: null,
        plugins: {
            dateRangePickerFilter: null
        },
        permissionFlags: AppUtils.getPermissionFlags(),
        message: {
            pageTitle: I18n.t("fee_rule", "PAGE_TITLE"),
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
            createConfirm: I18n.t("common", "CREATE_CONFIRM", { name: I18n.t("fee_rule", "PAGE_TITLE").toLocaleLowerCase() }),
            createSuccess: I18n.t("common", "CREATE_SUCCESS", { name: I18n.t("fee_rule", "PAGE_TITLE") }),
            createError: I18n.t("common", "CREATE_ERROR", { name: I18n.t("fee_rule", "PAGE_TITLE").toLocaleLowerCase() }),
            updateConfirm: I18n.t("common", "UPDATE_CONFIRM", { name: I18n.t("fee_rule", "PAGE_TITLE").toLocaleLowerCase() }),
            updateSuccess: I18n.t("common", "UPDATE_SUCCESS", { name: I18n.t("fee_rule", "PAGE_TITLE") }),
            updateError: I18n.t("common", "UPDATE_ERROR", { name: I18n.t("fee_rule", "PAGE_TITLE").toLocaleLowerCase() }),
            deleteConfirm: I18n.t("common", "DELETE_CONFIRM", { name: I18n.t("fee_rule", "PAGE_TITLE").toLocaleLowerCase() }),
            deleteSuccess: I18n.t("common", "DELETE_SUCCESS", { name: I18n.t("fee_rule", "PAGE_TITLE").toLocaleLowerCase() }),
            deleteError: I18n.t("common", "DELETE_ERROR", { name: I18n.t("fee_rule", "PAGE_TITLE").toLocaleLowerCase() }),
            notFound: I18n.t("common", "NOT_FOUND", { name: I18n.t("fee_rule", "PAGE_TITLE").toLocaleLowerCase() }),
            validationError: I18n.t("common", "VALIDATION_ERROR")
        },
        init: function () {
            this.initPlugins();
            this.checkPermissions();
            this.initDataTable();
            this.loadRelatedData();
            this.bindEvents();
            this.formValidator = new FormValidator({
                formSelector: "#kt_modal_fee_rule_form",
                handleSubmit: saveData,
                rules: [
                    {
                        element: "#notarization_request_status_name",
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
                        element: "#fee_rule_documentTypeIds",
                        rule: [
                            {
                                name: "required",
                                message: I18n.t("common", "REQUIRED_SELECT", { field: "Loại hồ sơ" })
                            },
                        ]

                    },
                    {
                        element: "#fee_rule_minValue",
                        rule: [
                            {
                                name: "customFunction",
                                message: I18n.t("common", "COMPARE_LESS_THAN_OR_EQUAL", { fieldA: "Giá trị nhỏ nhất", fieldB: "Giá trị lớn nhất" }),
                                params: checkMinMaxValueValid,
                                allowNullOrEmpty: true
                            }
                        ]
                    }
                ]
            });
        },
        initDataTable: function () {
            this.table = $("#fee_rule_datatable").DataTable({
                processing: true,
                serverSide: true,
                paging: true,
                searching: { regex: true },
                order: [4, 'desc'],
                language: AppSettings.dataTableLanguage.vi,
                ajax: {
                    url: ApiRoutes.FeeRule.v1.PagedAdvanced,
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
                            const tableSettings = FeeRulePage.table.settings()[0];
                            tableSettings.ajax.headers.Authorization = "Bearer " + TokenService.getAccessToken();

                            //Reload lại datatable với token mới
                            FeeRulePage.table.ajax.reload();
                        }
                    },
                    dataSrc: {
                        data: 'resources.data',
                        draw: 'resources.draw',
                        recordsTotal: 'resources.recordsTotal',
                        recordsFiltered: 'resources.recordsFiltered'
                    },
                    data: function (d) {
                        var minValue = $("#filter_minValue").val();
                        var maxValue = $("#filter_maxValue").val();
                        d.minValue = minValue ? minValue.replace(/\./g, '') : null;
                        d.maxValue = maxValue ? maxValue.replace(/\./g, '') : null;
                        d.name = $("#filter_name").val() || null;
                        d.createdDate = $("#filter_created_date").val() || null;
                        return JSON.stringify(d);
                    }
                   
                },
                columns: [
                    {
                        data: 'id',
                        render: function (data, type, row, meta) {
                            const info = FeeRulePage.table.page.info();
                            const index = meta.row + 1 + info.page * info.length;
                            return index; // This contains the row index
                        }
                    },
                    {
                        data: "name",
                        render: function (data, type, row, meta) {
                            return `<span class='text-gray-800 text-hover-primary mb-1' data-fee-rule-id='${row.id}'>${AppUtils.escapeHtml(row.name)}<span>`;
                        },
                    },
                    {
                        data: "minValue",
                        className: 'text-end',
                        render: function (data, type, row, meta) {
                            return `<span data-fee-rule-id='${row.id}'>${AppUtils.numberWithCommas(row.minValue)}</span>`;
                        },
                    },
                    {
                        data: "maxValue",
                        className: 'text-end',
                        render: function (data, type, row, meta) {
                            return `<span data-fee-rule-id='${row.id}'>${AppUtils.numberWithCommas(row.maxValue)}</span>`;
                        },
                    },
                    {
                        data: "createdDate",
                        render: function (data, type, row, meta) {
                            const displayValue = moment(data).format("DD/MM/YYYY HH:mm:ss");
                            return `<span data-fee-rule-id='${row.id}'>${displayValue}<span>`;
                        }
                    },
                    {
                        data: 'id',
                        className: 'text-end',
                        render: function (data, type, row, meta) {
                            return `<a href="#" class="btn btn-light btn-active-light-primary btn-flex btn-center btn-sm" data-kt-menu-trigger="click" data-kt-menu-placement="bottom-end" data-kt-menu-flip="top-end">
                                                ${FeeRulePage.message.actions}
                                                <i class="ki-duotone ki-down fs-5 ms-1"></i>
                                    </a>
                                    <div class="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg-light-primary fw-semibold fs-7 w-125px py-4" data-kt-menu="true">
                                        <div class="menu-item px-3">
                                            <a href="#" class="menu-link px-3 btn-edit" data-kt-docs-table-filter="edit_row" data-fee-rule-id="${data}">
                                                ${FeeRulePage.permissionFlags.canUpdate ? FeeRulePage.message.edit : FeeRulePage.message.detail}
                                            </a>
                                        </div>
                                        <div class="menu-item px-3 ${!FeeRulePage.permissionFlags.canDelete ? "d-none" : ""}">
                                            <a href="#" class="menu-link px-3 text-danger btn-delete" data-kt-users-table-filter="delete_row" data-fee-rule-id="${data}">
                                                ${FeeRulePage.message.delete}
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
                    $('#fee_rule_datatable tfoot').html("");
                    $("#fee_rule_datatable thead tr").clone(true).appendTo("#fee_rule_datatable tfoot");
                    $('#fee_rule_datatable tfoot tr').addClass("border-top");
                }
            })

            this.table.on("draw", function () {
                KTMenu.createInstances();
            })
        },
        refreshDataTable: function () {
            if (this.table)
                this.table.ajax.reload(null, false);
        },
        initPlugins: function () {
            this.plugins.dateRangePickerFilter = $("#filter_created_date").flatpickr({
                dateFormat: "d/m/Y",
                mode: "range",
                conjunction: " - ",
                locale: "vn",
            });
            AppUtils.createSelect2("#fee_rule_documentTypeIds", {
                url: ApiRoutes.DocumentType.v1.GetByCurrentUser,
                allowClear: true,
                cache: true,
                placeholder: 'Chọn loại hồ sơ',
                select2Options: {
                    dropdownParent: "#kt_modal_fee_rule",
                    closeOnSelect: false,
                }
            });
            AppUtils.createSelect2("#filter_documentTypeId", {
                url: ApiRoutes.DocumentType.v1.GetByCurrentUser,
                allowClear: true,
                cache: true,
                placeholder: 'Chọn loại hồ sơ',
                select2Options: {
                    closeOnSelect: false,
                }
            });

        },
        checkPermissions: function () {
            if (!FeeRulePage.permissionFlags.canCreate)
                $("#btn_add_fee_rule").addClass("d-none");
        },
        regenDataTable: function () {
            if (this.table) {
                this.table.destroy();
                $("#fee_rule_datatable tbody").html("");
                this.initDataTable();
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
            $("#fee_rule_datatable tbody").on("click", ".btn-edit", function () {
                const id = $(this).attr("data-fee-rule-id");
                editItem(id);
            });
        },
        bindDeleteEvent: function () {
            $("#fee_rule_datatable tbody").on("click", ".btn-delete", function () {
                const id = $(this).attr("data-fee-rule-id");
                deleteItem(id);
            });
        },
        bindSearchAllEvents: function () {
            $("#fee_rule_datatable_search").on("keyup", AppUtils.debounce(function () {
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
            $("#btn_add_fee_rule").on("click", function () {
                addItem();
            })
        },
        bindSaveEvent: function () {

        },
        bindClearFilterDateRangeEvent: function () {
            $("#clear_filter_created_date i").on("click", function () {
                FeeRulePage.plugins.dateRangePickerFilter.clear();
            })
            $("#clear_filter_created_date").on("click", function () {
                FeeRulePage.plugins.dateRangePickerFilter.clear();
            })
        },
        bindToggleFilterEvent: function () {
            $("#btn_fee_rule_filter").on("click", function () {
                $("#fee_rule_filter").slideToggle();
            })
        },
        loadRelatedData: async function () {
            
        }
    }

    /**
     * Handle add new fee rule
     */
    function addItem() {
        FeeRulePage.formValidator.clearErrors();
        $("#kt_modal_fee_rule_header h2").text(`${FeeRulePage.message.create} ${FeeRulePage.message.pageTitle.toLocaleLowerCase()}`);
        $("#kt_modal_fee_rule_form input[type='text'],#kt_modal_fee_rule_form textarea, #kt_modal_fee_rule_form select").val("").attr("disabled", false).trigger("change");
        $("#kt_modal_fee_rule_form input[type='checkbox']").prop("checked", false).attr("disabled", false).trigger("change");
        $("#fee_rule_createdDate").val(moment().format("DD/MM/YYYY HH:mm:ss")).attr("disabled", true).trigger("change");
        $("#btn_save_fee_rule").removeClass("d-none");
        $("#btn_cancel_fee_rule").text(FeeRulePage.message.cancel);
    }

    /**
     * Author: 
     * CreatedDate: 
     * Description: Edit fee rule by id
     * @param {number} id
     */
    async function editItem(id) {
        FeeRulePage.formValidator.clearErrors();
        $("#global_loader").addClass("show");
        try {
            const response = await httpService.getAsync(ApiRoutes.FeeRule.v1.Detail(id));
            const data = response.resources;
            Object.keys(data).forEach(key => {
                const selector = `#fee_rule_${key}`;
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
                if (!key.toLocaleLowerCase().includes("date")) {
                    $(selector).attr("disabled", !FeeRulePage.permissionFlags.canUpdate);
                }
            });

            data.documentTypes.forEach(item => {
                if ($("#fee_rule_documentTypeIds").find("option[value='" + item.id + "']").length === 0) {
                    const newOption = new Option(item.name, item.id, true, true);
                    $("#fee_rule_documentTypeIds").append(newOption);
                }
            });
            $("#fee_rule_documentTypeIds").val(data.documentTypes.map(item => item.id)).trigger("change");
            $("#fee_rule_documentTypeIds").attr("disabled", !FeeRulePage.permissionFlags.canUpdate);
            if (FeeRulePage.permissionFlags.canUpdate) {
                $("#kt_modal_fee_rule_header h2").text(`${FeeRulePage.message.edit} ${FeeRulePage.message.pageTitle.toLocaleLowerCase()}`);
                $("#btn_save_fee_rule").removeClass("d-none");
                $("#btn_cancel_fee_rule").text(FeeRulePage.message.cancel);
            }
            else {
                $("#kt_modal_fee_rule_header h2").text(`${FeeRulePage.message.detail} ${FeeRulePage.message.pageTitle.toLocaleLowerCase()}`);
                $("#btn_save_fee_rule").addClass("d-none");
                $("#btn_cancel_fee_rule").text(FeeRulePage.message.ok);
            }
            $("#kt_modal_fee_rule").modal("show");
        } catch (e) {
            AppUtils.handleApiError(e, {
                action: "delete",
                name: FeeRulePage.message.pageTitle,
                isShowAlert: true
            });
        }
        finally {
            $("#global_loader").removeClass("show");
            AppUtils.formatNumberCurency();
        }
    }

    /**
     * Author:
     * CreatedDate:
     * Description: Delete fee rule by id
     * @param {number} id
     */
    async function deleteItem(id) {

        const { isConfirmed } = await Swal.fire({
            icon: "question",
            title: FeeRulePage.message.confirmTittle,
            html: FeeRulePage.message.deleteConfirm,
            ...AppSettings.sweetAlertOptions(true)
        });

        if (!isConfirmed)
            return;

        $("#global_loader").addClass("show");
        try {
            const response = await httpService.deleteAsync(ApiRoutes.FeeRule.v1.Delete(id));
            if (response?.isSucceeded) {
                FeeRulePage.refreshDataTable();
                Swal.fire({
                    icon: "success",
                    title: FeeRulePage.message.successTitle,
                    html: FeeRulePage.message.deleteSuccess,
                    ...AppSettings.sweetAlertOptions(false)
                })
            }
        } catch (e) {
            console.error(e);
            Swal.fire({
                icon: "error",
                title: FeeRulePage.message.failTitle,
                html: FeeRulePage.message.deleteError,
                ...AppSettings.sweetAlertOptions(false)
            })
        }
        finally {
            $("#global_loader").removeClass("show");
        }
    }

    /**
     * Save data (Create or Update) fee rule
     */
    async function saveData() {
        const btnSave = $("#btn_save_fee_rule");
        btnSave.attr("disabled", true);

        const columns = ["id", "documentTypeIds", "minValue", "maxValue", "feeAmount", "percentRate", "applyFormula", "name", "description", "isFixed"];
        const data = {};
        columns.forEach(key => {
            const selector = `#fee_rule_${key}`;
            const $el = $(selector);
            const dataType = $el.data('type');

            if ($el.is(':checkbox')) {
                data[key] = $el.is(':checked');
            } else {
                let value = $el.val();

                if (dataType === 'currency') {
                    value = value.replace(/\./g, '').replace(/[^0-9\-]/g, '');
                    value = parseFloat(value) || 0;
                }

                if (key === 'documentTypeIds' && Array.isArray(value)) {
                    value = value.map(id => parseInt(id));
                }

                data[key] = value;
            }
        });
        const isAdd = !data.id;
        const confirmText = isAdd ? FeeRulePage.message.createConfirm : FeeRulePage.message.updateConfirm;
        const { isConfirmed } = await Swal.fire({
            icon: 'question',
            title: FeeRulePage.message.confirmTittle,
            html: confirmText,
            ...AppSettings.sweetAlertOptions(true)
        });

        if (isConfirmed) {
            btnSave.attr("data-kt-indicator", "on");
            try {
                const response = isAdd ?
                    await httpService.postAsync(ApiRoutes.FeeRule.v1.Create, data) :
                    await httpService.putAsync(ApiRoutes.FeeRule.v1.Update, data);
                if (response?.isSucceeded) {
                    if (isAdd) {
                        $("#fee_rule_datatable_search").val("").trigger("change");
                        resetFilter();
                    }
                    else {
                        //tableSearch();
                        FeeRulePage.refreshDataTable();
                    }

                    $("#kt_modal_fee_rule").modal("hide");
                    const successText = isAdd ? FeeRulePage.message.createSuccess : FeeRulePage.message.updateSuccess;
                    Swal.fire({
                        icon: "success",
                        title: FeeRulePage.message.successTitle,
                        html: successText,
                        ...AppSettings.sweetAlertOptions(false)
                    });
                }

            } catch (e) {
                AppUtils.handleApiError(e, {
                    action: isAdd ? "create" : "update",
                    name: FeeRulePage.message.pageTitle,
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
        var minValue = $("#filter_minValue").val();
        var maxValue = $("#filter_maxValue").val();
        FeeRulePage.table.column(1).search($("#filter_name").val() || "");
        FeeRulePage.table.column(2).search(minValue ? minValue.replace(/\./g, '') : "");
        FeeRulePage.table.column(3).search(maxValue ? maxValue.replace(/\./g, '') : "");
        FeeRulePage.table.column(4).search($("#filter_created_date").val() || "");
        FeeRulePage.table.search($("#fee_rule_datatable_search").val().trim()).draw();
    }

    /**
     * Reset filter
     */
    function resetFilter() {
        $("#filter_name").val("");
        $("#filter_minValue").val("");
        $("#filter_maxValue").val("");
        FeeRulePage.plugins.dateRangePickerFilter.clear();
        $("#filter_created_date").val("").trigger("change");
        tableSearch();
    }

    /**
    * Load data DocumentTypes
    */
    async function loadDataDocumentTypes() {
        try {
            const response = await httpService.getAsync(ApiRoutes.DocumentType.v1.List);
            const data = response.resources;
            $("#fee_rule_documentTypeIds").empty();
            $("#filter_documentTypeId").empty();
            data.forEach(item => {
                $("#filter_documentTypeId").append(`<option value="${item.id}">${item.name}</option>`);
                $("#fee_rule_documentTypeIds").append(`<option value="${item.id}">${item.name}</option>`);
            });
        } catch (e) {
            console.error(e);
        }
    }  

    /**
     * Check min value, max value valid
     * @returns boolean
     */
    function checkMinMaxValueValid() {
        const minValue = $("#fee_rule_minValue").val().replace(/\D/g, '');
        const maxValue = $("#fee_rule_maxValue").val().replace(/\D/g, '');
        if (minValue && maxValue) {
            if (Number(minValue) > Number(maxValue))
                return false;
        }

        return true;
    }

    // On document ready
    KTUtil.onDOMContentLoaded(async function () {
        await AppEntry.init();
        if (!FeeRulePage.permissionFlags.canView) {
            AppSettings.mainElements.PAGE_CONTENT.addClass("d-none");
            AppSettings.mainElements.NOT_FOUND.removeClass("d-none");
        }
        else
            FeeRulePage.init();
    });
})();