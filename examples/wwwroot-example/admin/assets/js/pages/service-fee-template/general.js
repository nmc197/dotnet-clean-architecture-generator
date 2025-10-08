"use strict";

(function () {
    // Class definition
    const ServiceFeeTemplatePage = {
        table: null,
        formValidator: null,
        plugins: {
            dateRangePickerFilter: null
        },
        permissionFlags: AppUtils.getPermissionFlags(),
        message: {
            pageTitle: I18n.t("service_fee_template", "PAGE_TITLE"),
            actions: I18n.t("common", "ACTIONS"),
            create: I18n.t("common", "ADD_NEW"),
            edit: I18n.t("common", "EDIT"),
            delete: I18n.t("common", "DELETE"),
            detail: I18n.t("common", "DETAIL"),
            ok: I18n.t("common", "OK"),
            cancel: I18n.t("common", "CANCEL"),
            confirmTittle: I18n.t("common", "CONFIRM_TITLE"),
            successTitle: I18n.t("common", "SUCCESS_TITLE"),
            errorTitle: I18n.t("common", "ERROR_TITLE"),
            failTitle: I18n.t("common", "FAIL_TITLE"),
            warningTitle: I18n.t("common", "WARNING_TITLE"),
            createConfirm: I18n.t("common", "CREATE_CONFIRM", { name: I18n.t("service_fee_template", "PAGE_TITLE").toLocaleLowerCase() }),
            createSuccess: I18n.t("common", "CREATE_SUCCESS", { name: I18n.t("service_fee_template", "PAGE_TITLE").toLocaleLowerCase() }),
            createError: I18n.t("common", "CREATE_ERROR", { name: I18n.t("service_fee_template", "PAGE_TITLE").toLocaleLowerCase() }),
            updateConfirm: I18n.t("common", "UPDATE_CONFIRM", { name: I18n.t("service_fee_template", "PAGE_TITLE").toLocaleLowerCase() }),
            updateSuccess: I18n.t("common", "UPDATE_SUCCESS", { name: I18n.t("service_fee_template", "PAGE_TITLE") }),
            updateError: I18n.t("common", "UPDATE_ERROR", { name: I18n.t("service_fee_template", "PAGE_TITLE").toLocaleLowerCase() }),
            deleteConfirm: I18n.t("common", "DELETE_CONFIRM", { name: I18n.t("service_fee_template", "PAGE_TITLE").toLocaleLowerCase() }),
            deleteSuccess: I18n.t("common", "DELETE_SUCCESS", { name: I18n.t("service_fee_template", "PAGE_TITLE").toLocaleLowerCase() }),
            deleteError: I18n.t("common", "DELETE_ERROR", { name: I18n.t("service_fee_template", "PAGE_TITLE").toLocaleLowerCase() }),
            notFound: I18n.t("common", "NOT_FOUND", { name: I18n.t("service_fee_template", "PAGE_TITLE").toLocaleLowerCase() }),
            validationError: I18n.t("common", "VALIDATION_ERROR")
        },
        init: function () {
            this.initPlugins();
            this.initDataTable();
            this.loadRelatedData();
            this.bindEvents();
            this.checkPermissions();
            this.formValidator = new FormValidator({
                formSelector: "#kt_modal_service_fee_template_form",
                handleSubmit: saveData,
                rules: [
                    {
                        element: "#service_fee_template_name",
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
                        element: "#service_fee_template_serviceFeeCategoryId",
                        rule: [
                            {
                                name: "required",
                                message: I18n.t("common", "REQUIRED_SELECT", { field: "Danh mục phí" })
                            },
                        ]

                    },
                    {
                        element: "#service_fee_template_unitPrice",
                        rule: [
                            {
                                name: "required",
                                message: I18n.t("common", "REQUIRED", { field: "Đơn giá" })
                            },
                        ]

                    },

                    {
                        element: "#service_fee_template_unitType",
                        rule: [
                            {
                                name: "required",
                                message: I18n.t("common", "REQUIRED_SELECT", { field: "Loại đơn vị" })
                            }
                        ]
                    },
                    {
                        element: "#service_fee_template_minValue",
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
            this.table = $("#service_fee_template_datatable").DataTable({
                processing: true,
                serverSide: true,
                paging: true,
                searching: { regex: true },
                order: [7, 'desc'],
                language: AppSettings.dataTableLanguage.vi,
                ajax: {
                    url: ApiRoutes.ServiceFeeTemplate.v1.PagedAdvanced,
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
                            const tableSettings = ServiceFeeTemplatePage.table.settings()[0];
                            tableSettings.ajax.headers.Authorization = "Bearer " + TokenService.getAccessToken();

                            //Reload lại datatable với token mới
                            ServiceFeeTemplatePage.table.ajax.reload();
                        }
                    },
                    dataSrc: {
                        data: 'resources.data',
                        draw: 'resources.draw',
                        recordsTotal: 'resources.recordsTotal',
                        recordsFiltered: 'resources.recordsFiltered'
                    },
                    data: function (d) {
                        d.minValue = $("#filter_minValue").val() || null;
                        d.maxValue = $("#filter_maxValue").val() || null;
                        d.serviceFeeCategoryIds = $("#filter_serviceFeeCategoryId").val() || [];
                        d.officeIds = $("#filter_officeId").val() || [];
                        d.serviceFeeUnitTypes = $("#filter_unitType").val() || [];
                        //d.documentTypeIds = $("#filter_documentTypeId").val() || [];
                        return JSON.stringify(d);
                    }

                },
                columns: [
                    {
                        data: 'id',
                        render: function (data, type, row, meta) {
                            const info = ServiceFeeTemplatePage.table.page.info();
                            const index = meta.row + 1 + info.page * info.length;
                            return index; // This contains the row index
                        }
                    },

                    {
                        data: "name",
                        render: function (data, type, row, meta) {
                            return `<span class='text-gray-800 text-hover-primary mb-1' data-service-fee-template-id='${row.id}'>${AppUtils.escapeHtml(row.name)}<span>`;
                        },
                    },
                    {
                        data: "serviceFeeCategoryId",
                        render: function (data, type, row, meta) {
                            return `<span data-service-fee-template-id='${row.id}'>${AppUtils.escapeHtml(row.serviceFeeCategoryName)}<span>`;
                        },
                    },
                    {
                        data: "officeId",
                        render: function (data, type, row, meta) {
                            return `<span data-service-fee-template-id='${row.id}'>${AppUtils.escapeHtml(row.officeName)}<span>`;
                        },
                    },
                    {
                        data: "value",
                        className: 'text-end',
                        render: function (data, type, row, meta) {
                            return `<span data-service-fee-template-id='${row.id}'>${AppUtils.numberWithCommas(row.minValue)} - ${AppUtils.numberWithCommas(row.maxValue)}<span>`;
                        },
                    },
                    //{
                    //    data: "allowQuantityInput",
                    //    render: function (data, type, row, meta) {
                    //        return `<span data-blog-post-id='${row.id}'><div class="form-check form-switch form-check-custom form-check-solid justify-content-start"><input class="form-check-input" type="checkbox" disabled value="" ${row.allowQuantityInput ? 'checked' : ''}></div></span>`;
                    //    },
                    //},
                    //{
                    //    data: "isPerUnit",
                    //    render: function (data, type, row, meta) {
                    //        return `<span data-blog-post-id='${row.id}'><div class="form-check form-switch form-check-custom form-check-solid justify-content-start"><input class="form-check-input" type="checkbox" disabled value="" ${row.isPerUnit ? 'checked' : ''}></div></span>`;
                    //    },
                    //},
                    {
                        data: "unitPrice",
                        className: 'text-end',
                        render: function (data, type, row, meta) {
                            return `<span data-service-fee-template-id='${row.id}'>${AppUtils.numberWithCommas(row.unitPrice)}<span>`;
                        },
                    },
                    {
                        data: "unitType",
                        render: function (data, type, row, meta) {
                            return `<span data-service-fee-template-id='${row.id}'>${row.unitType}<span>`;
                        },
                    },

                    //{
                    //    data: "documentTypes",
                    //    render: function (data, type, row, meta) {
                    //        var result = ``;
                    //        row.documentTypes.forEach(function (item) {
                    //            result += `<div data-user-id='${row.id}'>${item.name}</div>`;
                    //        });
                    //        return result;
                    //    },
                    //},
                    {
                        data: "createdDate",
                        render: function (data, type, row, meta) {
                            const displayValue = moment(data).format("DD/MM/YYYY HH:mm:ss");
                            return `<span data-service-fee-template-id='${row.id}'>${displayValue}<span>`;
                        }
                    },
                    {
                        data: 'id',
                        className: 'text-end',
                        render: function (data, type, row, meta) {
                            return `<a href="#" class="btn btn-light btn-active-light-primary btn-flex btn-center btn-sm text-nowrap" data-kt-menu-trigger="click" data-kt-menu-placement="bottom-end" data-kt-menu-flip="top-end">
                                                ${ServiceFeeTemplatePage.message.actions}
                                                <i class="ki-duotone ki-down fs-5 ms-1"></i>
                                    </a>
                                    <div class="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg-light-primary fw-semibold fs-7 w-125px py-4" data-kt-menu="true">
                                        <div class="menu-item px-3">
                                            <a href="#" class="menu-link px-3 btn-edit" data-kt-docs-table-filter="edit_row" data-service-fee-template-id="${data}">
                                                ${ServiceFeeTemplatePage.permissionFlags.canUpdate ? ServiceFeeTemplatePage.message.edit : ServiceFeeTemplatePage.message.detail}
                                            </a>
                                        </div>
                                        <div class="menu-item px-3 ${!ServiceFeeTemplatePage.permissionFlags.canDelete ? "d-none" : ""}">
                                            <a href="#" class="menu-link px-3 text-danger btn-delete" data-kt-users-table-filter="delete_row" data-service-fee-template-id="${data}">
                                                ${ServiceFeeTemplatePage.message.delete}
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
                    $('#service_fee_template_datatable tfoot').html("");
                    $("#service_fee_template_datatable thead tr").clone(true).appendTo("#service_fee_template_datatable tfoot");
                    $('#service_fee_template_datatable tfoot tr').addClass("border-top");
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

            //BEGIN: SELECT2
            AppUtils.createSelect2("#service_fee_template_serviceFeeCategoryId", {
                url: ApiRoutes.ServiceFeeCategory.v1.GetByCurrentUser,
                cache: true,
                placeholder: 'Chọn danh mục phí',
                select2Options: {
                    dropdownParent: "#kt_modal_service_fee_template",
                }
            });
            //$("#service_fee_template_serviceFeeCategoryId").select2({
            //    language: currentLang,
            //    placeholder: 'Chọn danh mục phí',
            //    dropdownParent: "#kt_modal_service_fee_template",
            //});
            AppUtils.createSelect2("#service_fee_template_documentTypeIds", {
                url: ApiRoutes.DocumentType.v1.GetByCurrentUser,
                allowClear: true,
                cache: true,
                placeholder: 'Chọn loại hồ sơ',
                select2Options: {
                    dropdownParent: "#kt_modal_service_fee_template",
                    closeOnSelect: false,
                }
            });
            //$("#service_fee_template_documentTypeIds").select2({
            //    language: currentLang,
            //    placeholder: 'Chọn loại hồ sơ',
            //    allowClear: true,
            //    dropdownParent: "#kt_modal_service_fee_template",
            //});

            $("#service_fee_template_unitType").select2({
                language: currentLang,
                placeholder: 'Chọn loại đơn vị',
                dropdownParent: "#kt_modal_service_fee_template",
            });

            //$("#filter_serviceFeeCategoryId").select2({
            //    language: currentLang,
            //    placeholder: 'Chọn danh mục phí',
            //    allowClear: true,
            //});
            AppUtils.createSelect2("#filter_serviceFeeCategoryId", {
                url: ApiRoutes.ServiceFeeCategory.v1.GetByCurrentUser,
                allowClear: true,
                cache: true,
                placeholder: 'Chọn danh mục phí',
                select2Options: {
                    dropdownParent: "#service_fee_template_filter",
                    closeOnSelect: false,
                }
            });
            //$("#filter_officeId").select2({
            //    language: currentLang,
            //    placeholder: 'Chọn danh văn phòng công chứng',
            //    allowClear: true,
            //});
            AppUtils.createSelect2("#filter_officeId", {
                url: ApiRoutes.Office.v1.GetByCurrentUser,
                allowClear: true,
                cache: true,
                placeholder: 'Chọn văn phòng',
                select2Options: {
                    dropdownParent: "#service_fee_template_filter",
                    closeOnSelect: false,
                }
            });
            $("#filter_unitType").select2({
                language: currentLang,
                placeholder: 'Chọn loại đơn vị',
                allowClear: true,
                /*dropdownParent: "#service_fee_template_filter",*/
            });
            //$("#filter_documentTypeId").select2({
            //    language: currentLang,
            //    placeholder: 'Chọn loại hồ sơ',
            //    allowClear: true,
            //});
            //END: SELECT2
        },
        checkPermissions: function () {
            if (!ServiceFeeTemplatePage.permissionFlags.canCreate)
                $("#btn_add_service_fee_template").addClass("d-none");
        },
        regenDataTable: function () {
            if (this.table) {
                this.table.destroy();
                $("#service_fee_template_datatable tbody").html("");
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
            $("#service_fee_template_datatable tbody").on("click", ".btn-edit", function () {
                const id = $(this).attr("data-service-fee-template-id");
                editItem(id);
            });
        },
        bindDeleteEvent: function () {
            $("#service_fee_template_datatable tbody").on("click", ".btn-delete", function () {
                const id = $(this).attr("data-service-fee-template-id");
                deleteItem(id);
            });
        },
        bindSearchAllEvents: function () {
            $("#service_fee_template_datatable_search").on("keyup", AppUtils.debounce(function () {
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
            $("#btn_add_service_fee_template").on("click", function () {
                addItem();
            })
        },
        bindSaveEvent: function () {
            //$("#btn_save_service_fee_template").on("click", function (e) {
            //    e.preventDefault();
            //    saveData();
            //})
        },
        bindClearFilterDateRangeEvent: function () {
            $("#clear_filter_created_date i").on("click", function () {
                ServiceFeeTemplatePage.plugins.dateRangePickerFilter.clear();
            })
            $("#clear_filter_created_date").on("click", function () {
                ServiceFeeTemplatePage.plugins.dateRangePickerFilter.clear();
            })
        },
        bindToggleFilterEvent: function () {
            $("#btn_service_fee_template_filter").on("click", function () {
                $("#service_fee_template_filter").slideToggle();
            })
        },
        loadRelatedData: async function () {
            //await loadDataOffices();
            //await loadDataDocumentTypes();
            //await loadDataServiceFeeCategories();
            await loadDataServiceFeeUnitTypies();
        }
    }

    /**
     * Handle add new service fee template
     */
    function addItem() {
        ServiceFeeTemplatePage.formValidator.clearErrors();
        $("#btn_save_service_fee_template").removeClass("d-none");
        $("#btn_cancel_service_fee_template").text(ServiceFeeTemplatePage.message.cancel);
        $("#kt_modal_service_fee_template_header h2").text(`${ServiceFeeTemplatePage.message.create} ${ServiceFeeTemplatePage.message.pageTitle.toLocaleLowerCase()}`);
        $("#kt_modal_service_fee_template_form input[type='text'],#kt_modal_service_fee_template_form textarea, #kt_modal_service_fee_template_form select").val("").trigger("change");
        $("#kt_modal_service_fee_template_form input[type='checkbox']").prop("checked", false).trigger("change");
        $("#service_fee_template_createdDate").val(moment().format("DD/MM/YYYY HH:mm:ss")).trigger("change");
        $("#service_fee_template_name,#service_fee_template_description,#service_fee_template_serviceFeeCategoryId, #service_fee_template_minValue, #service_fee_template_maxValue, #service_fee_template_unitPrice, #service_fee_template_isPerUnit, #service_fee_template_allowQuantityInput, #service_fee_template_unitType, #service_fee_template_documentTypeIds").attr("disabled", false);
    }

    /**
     * Author: 
     * CreatedDate: 
     * Description: Edit service fee template by id
     * @param {number} id
     */
    async function editItem(id) {
        ServiceFeeTemplatePage.formValidator.clearErrors();
        $("#global_loader").addClass("show");
        try {
            const response = await httpService.getAsync(ApiRoutes.ServiceFeeTemplate.v1.Detail(id));
            const data = response.resources;
            Object.keys(data).forEach(key => {
                const selector = `#service_fee_template_${key}`;
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
                    $(selector).attr("disabled", !ServiceFeeTemplatePage.permissionFlags.canUpdate);
                }
            });
            //gán giá trị select cho select2 
            if ($("#service_fee_template_serviceFeeCategoryId").find(`option[value='${data.serviceFeeCategory.id}']`).length == 0) {
                $("#service_fee_template_serviceFeeCategoryId").append(new Option(data.serviceFeeCategory.name, data.serviceFeeCategory.id, true, true));
                $("#service_fee_template_serviceFeeCategoryId").trigger("change");
            }
            else {
                $("#service_fee_template_serviceFeeCategoryId").val(data.serviceFeeCategory.id).trigger("change");
            }

            data.documentTypes.forEach(item => {
                if ($("#service_fee_template_documentTypeIds").find("option[value='" + item.id + "']").length === 0) {
                    const newOption = new Option(item.name, item.id, true, true);
                    $("#service_fee_template_documentTypeIds").append(newOption);
                }
            });
            $("#service_fee_template_documentTypeIds").val(data.documentTypes.map(item => item.id)).trigger("change");

            if (ServiceFeeTemplatePage.permissionFlags.canUpdate) {
                $("#kt_modal_service_fee_template_header h2").text(`${ServiceFeeTemplatePage.message.edit} ${ServiceFeeTemplatePage.message.pageTitle.toLocaleLowerCase()}`);
                $("#btn_save_service_fee_template").removeClass("d-none");
                $("#btn_cancel_service_fee_template").text(ServiceFeeTemplatePage.message.cancel);
            } else {
                $("#kt_modal_service_fee_template_header h2").text(`${ServiceFeeTemplatePage.message.detail} ${ServiceFeeTemplatePage.message.pageTitle.toLocaleLowerCase()}`);
                $("#btn_save_service_fee_template").addClass("d-none");
                $("#btn_cancel_service_fee_template").text(ServiceFeeTemplatePage.message.ok);
            }
            $("#kt_modal_service_fee_template").modal("show");
        } catch (e) {
            console.error(e);
            Swal.fire({
                icon: "error",
                title: ServiceFeeTemplatePage.message.errorTitle,
                html: ServiceFeeTemplatePage.message.notFound,
                ...AppSettings.sweetAlertOptions(false)
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
     * Description: Delete service fee template by id
     * @param {number} id
     */
    async function deleteItem(id) {

        const { isConfirmed } = await Swal.fire({
            icon: "question",
            title: ServiceFeeTemplatePage.message.confirmTittle,
            html: ServiceFeeTemplatePage.message.deleteConfirm,
            ...AppSettings.sweetAlertOptions(true)
        });

        if (!isConfirmed)
            return;

        $("#global_loader").addClass("show");
        try {
            const response = await httpService.deleteAsync(ApiRoutes.ServiceFeeTemplate.v1.Delete(id));
            if (response?.isSucceeded) {
                //tableSearch();
                ServiceFeeTemplatePage.refreshDataTable();
                Swal.fire({
                    icon: "success",
                    title: ServiceFeeTemplatePage.message.successTitle,
                    html: ServiceFeeTemplatePage.message.deleteSuccess,
                    ...AppSettings.sweetAlertOptions(false)
                })
            }
        } catch (e) {
            console.error(e);
            Swal.fire({
                icon: "error",
                title: ServiceFeeTemplatePage.message.failTitle,
                html: ServiceFeeTemplatePage.message.deleteError,
                ...AppSettings.sweetAlertOptions(false)
            })
        }
        finally {
            $("#global_loader").removeClass("show");
        }
    }

    /**
     * Save data (Create or Update) service fee template
     */
    async function saveData() {

        const btnSave = $("#btn_save_service_fee_template");
        btnSave.attr("disabled", true);

        const columns = ["id", "serviceFeeCategoryId", "officeId", "officeId", "minValue", "maxValue", "unitPrice", "unitType", "isPerUnit", "allowQuantityInput", "name", "description", "documentTypeIds"];
        const data = {};
        columns.forEach(key => {
            const selector = `#service_fee_template_${key}`;
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

                data[key] = value;
            }
        });

        const isAdd = !data.id;
        const confirmText = isAdd ? ServiceFeeTemplatePage.message.createConfirm : ServiceFeeTemplatePage.message.updateConfirm;
        const { isConfirmed } = await Swal.fire({
            icon: 'question',
            title: ServiceFeeTemplatePage.message.confirmTittle,
            html: confirmText,
            ...AppSettings.sweetAlertOptions(true)
        });

        if (isConfirmed) {
            btnSave.attr("data-kt-indicator", "on");
            try {
                const response = isAdd ?
                    await httpService.postAsync(ApiRoutes.ServiceFeeTemplate.v1.Create, data) :
                    await httpService.putAsync(ApiRoutes.ServiceFeeTemplate.v1.Update, data);
                if (response?.isSucceeded) {
                    if (isAdd) {
                        $("#service_fee_template_datatable_search").val("").trigger("change");
                        resetFilter();
                    }
                    else {
                        /*tableSearch();*/
                        ServiceFeeTemplatePage.refreshDataTable();
                    }

                    $("#kt_modal_service_fee_template").modal("hide");
                    const successText = isAdd ? ServiceFeeTemplatePage.message.createSuccess : ServiceFeeTemplatePage.message.updateSuccess;
                    Swal.fire({
                        icon: "success",
                        title: ServiceFeeTemplatePage.message.successTitle,
                        html: successText,
                        ...AppSettings.sweetAlertOptions(false)
                    });
                }

            } catch (e) {
                //const { responseJSON } = e;
                //let errorText = "";
                //let errorTitle = "";
                //let icon = ""
                //if (responseJSON?.status === AppSettings.httpStatusCode.UNPROCESSABLE_ENTITY) {
                //    icon = "warning";
                //    errorTitle = ServiceFeeTemplatePage.message.validationError;

                //    const messages = [];
                //    responseJSON?.errors?.forEach(error => {
                //        error.message.forEach(item => {
                //            messages.push(`<li class="text-start">${item}</li>`);
                //        })
                //    });
                //    errorText = `<ul>${messages.join("")}</ul>`;
                //}
                //else {
                //    icon = "error";
                //    errorTitle = ServiceFeeTemplatePage.message.failTitle;
                //    errorText = isAdd ? ServiceFeeTemplatePage.message.createError : ServiceFeeTemplatePage.message.updateError;
                //}
                //Swal.fire({
                //    icon: icon,
                //    title: errorTitle,
                //    html: errorText,
                //    ...AppSettings.sweetAlertOptions(false)
                //});
                AppUtils.handleApiError(e, {
                    action: isAdd ? "create" : "update",
                    name: ServiceFeeTemplatePage.message.pageTitle,
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
        ServiceFeeTemplatePage.table.column(1).search($("#filter_name").val().trim());
        ServiceFeeTemplatePage.table.column(5).search($("#filter_unitPrice").val());
        ServiceFeeTemplatePage.table.column(7).search($("#filter_created_date").val());
        ServiceFeeTemplatePage.table.search($("#service_fee_template_datatable_search").val().trim()).draw();
    }

    /**
     * Reset filter
     */
    function resetFilter() {
        $("#filter_name").val("");
        $("#filter_serviceFeeCategoryId").val("").trigger("change");
        $("#filter_officeId").val("").trigger("change");
        $("#filter_minValue").val("");
        $("#filter_maxValue").val("");
        $("#filter_unitPrice").val("");
        $("#filter_unitType").val("").trigger("change");
        //$("#filter_documentTypeId").val("").trigger("change");
        ServiceFeeTemplatePage.plugins.dateRangePickerFilter.clear();
        /*$("#filter_created_date").val("").trigger("change");*/
        tableSearch();
    }

    /**
    * Load data ServiceFeeCategories
    */
    async function loadDataServiceFeeCategories() {
        try {
            const response = await httpService.getAsync(ApiRoutes.ServiceFeeCategory.v1.List);
            const data = response.resources;
            $("#service_fee_template_serviceFeeCategoryId").empty();
            $("#filter_serviceFeeCategoryId").empty();
            data.forEach(item => {
                $("#filter_serviceFeeCategoryId").append(`<option value="${item.id}">${item.name}</option>`);
                $("#service_fee_template_serviceFeeCategoryId").append(`<option value="${item.id}">${item.name}</option>`);
            });
        } catch (e) {
            console.error(e);
        }
    }

    /**
    * Load data Offices
    */
    async function loadDataOffices() {
        try {
            const response = await httpService.getAsync(ApiRoutes.Office.v1.List);
            const data = response.resources;
            $("#filter_officeId").empty();
            data.forEach(item => {
                $("#filter_officeId").append(`<option value="${item.id}">${item.name}</option>`);
            });
        } catch (e) {
            console.error(e);
        }
    }

    /**
    * Load data DocumentTypes
    */
    async function loadDataDocumentTypes() {
        try {
            const response = await httpService.getAsync(ApiRoutes.DocumentType.v1.List);
            const data = response.resources;
            $("#service_fee_template_documentTypeIds").empty();
            //$("#filter_documentTypeId").empty();
            data.forEach(item => {
                //$("#filter_documentTypeId").append(`<option value="${item.id}">${item.name}</option>`);
                $("#service_fee_template_documentTypeIds").append(`<option value="${item.id}">${item.name}</option>`);
            });
        } catch (e) {
            console.error(e);
        }
    }

    /**
    * Load data ServiceFeeUnitTypies
    */
    async function loadDataServiceFeeUnitTypies() {
        try {
            const response = await httpService.getAsync(ApiRoutes.ServiceFeeTemplate.v1.ListUnitType);
            const data = response.resources;
            $("#service_fee_template_unitType").empty();
            $("#filter_unitType").empty();
            data.forEach(item => {
                $("#filter_unitType").append(new Option(AppUtils.escapeHtml(item.name), item.code, false, false));
                $("#service_fee_template_unitType").append(new Option(AppUtils.escapeHtml(item.name), item.code, false, false));
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
        const minValue = $("#service_fee_template_minValue").val().replace(/\D/g, '');
        const maxValue = $("#service_fee_template_maxValue").val().replace(/\D/g, '');
        if (minValue && maxValue) {
            if (Number(minValue) > Number(maxValue))
                return false;
        }

        return true;
    }

    // On document ready
    KTUtil.onDOMContentLoaded(async function () {
        await AppEntry.init();
        if (!ServiceFeeTemplatePage.permissionFlags.canView) {
            AppSettings.mainElements.PAGE_CONTENT.addClass("d-none");
            AppSettings.mainElements.NOT_FOUND.removeClass("d-none");
        }
        else {
            ServiceFeeTemplatePage.init();
        } 
    });
})();