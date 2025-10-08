"use strict";

(function () {
    // Class definition
    const ServiceFeeCategoryPage = {
        table: null,
        formValidator: null,
        plugins: {
            dateRangePickerFilter: null
        },
        permissionFlags: AppUtils.getPermissionFlags(),
        message: {
            pageTitle: I18n.t("ServiceFeeCategory", "PAGE_TITLE"),
            actions: I18n.t("common", "ACTIONS"),
            create: I18n.t("common", "ADD_NEW"),
            edit: I18n.t("common", "EDIT"),
            detail: I18n.t("common", "DETAIL"),
            delete: I18n.t("common", "DELETE"),
            confirmTittle: I18n.t("common", "CONFIRM_TITLE"),
            successTitle: I18n.t("common", "SUCCESS_TITLE"),
            errorTitle: I18n.t("common", "ERROR_TITLE"),
            failTitle: I18n.t("common", "FAIL_TITLE"),
            ok: I18n.t("common", "OK"),
            cancel: I18n.t("common", "CANCEL"),
            warningTitle: I18n.t("common", "WARNING_TITLE"),
            createConfirm: I18n.t("common", "CREATE_CONFIRM", { name: I18n.t("ServiceFeeCategory", "PAGE_TITLE").toLocaleLowerCase() }),
            createSuccess: I18n.t("common", "CREATE_SUCCESS", { name: I18n.t("ServiceFeeCategory", "PAGE_TITLE").toLocaleLowerCase() }),
            createError: I18n.t("common", "CREATE_ERROR", { name: I18n.t("ServiceFeeCategory", "PAGE_TITLE").toLocaleLowerCase() }),
            updateConfirm: I18n.t("common", "UPDATE_CONFIRM", { name: I18n.t("ServiceFeeCategory", "PAGE_TITLE").toLocaleLowerCase() }),
            updateSuccess: I18n.t("common", "UPDATE_SUCCESS", { name: I18n.t("ServiceFeeCategory", "PAGE_TITLE") }),
            updateError: I18n.t("common", "UPDATE_ERROR", { name: I18n.t("ServiceFeeCategory", "PAGE_TITLE").toLocaleLowerCase() }),
            deleteConfirm: I18n.t("common", "DELETE_CONFIRM", { name: I18n.t("ServiceFeeCategory", "PAGE_TITLE").toLocaleLowerCase() }),
            deleteSuccess: I18n.t("common", "DELETE_SUCCESS", { name: I18n.t("ServiceFeeCategory", "PAGE_TITLE").toLocaleLowerCase() }),
            deleteError: I18n.t("common", "DELETE_ERROR", { name: I18n.t("ServiceFeeCategory", "PAGE_TITLE").toLocaleLowerCase() }),
            notFound: I18n.t("common", "NOT_FOUND", { name: I18n.t("ServiceFeeCategory", "PAGE_TITLE").toLocaleLowerCase() }),
            validationError: I18n.t("common", "VALIDATION_ERROR"),
        },
        init: function () {
            this.initPlugins();
            this.initDataTable();
            this.bindEvents();
            this.checkPermissions();
            this.formValidator = new FormValidator({
                formSelector: "#kt_modal_service_fee_category_form",
                handleSubmit: saveData,
                rules: [
                    {
                        element: "#service_fee_category_name",
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
                        element: "#service_fee_category_description",
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
            this.table = $("#service_fee_category_datatable").DataTable({
                processing: true,
                serverSide: true,
                paging: true,
                searching: { regex: true },
                order: [4, 'desc'],
                language: AppSettings.dataTableLanguage.vi,
                ajax: {
                    url: ApiRoutes.ServiceFeeCategory.v1.PagedAdvanced,
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
                            const tableSettings = ServiceFeeCategoryPage.table.settings()[0];
                            tableSettings.ajax.headers.Authorization = "Bearer " + TokenService.getAccessToken();

                            //Reload lại datatable với token mới
                            ServiceFeeCategoryPage.table.ajax.reload();
                        }
                    },
                    data: function (d) {
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
                            const info = ServiceFeeCategoryPage.table.page.info();
                            const index = meta.row + 1 + info.page * info.length;
                            return index; // This contains the row index
                        }
                    },

                    {
                        data: "name",
                        render: function (data, type, row, meta) {
                            return `<span class='text-gray-800 text-hover-primary mb-1' data-service-fee-category-id='${row.id}'>${AppUtils.escapeHtml(row.name)}<span>`;
                        },
                    },
                    {
                        data: "description",
                        render: function (data, type, row, meta) {
                            return `<span data-service-fee-category-id='${row.id}'>${AppUtils.escapeHtml(row.description).replaceAll("\n", "<br>")}<span>`;
                        },
                    },
                    {
                        data: "officeName",
                        render: function (data, type, row, meta) {
                            return `<span data-service-fee-category-id='${row.id}'>${AppUtils.escapeHtml(row.officeName)}<span>`;
                        },
                    },
                    {
                        data: "createdDate",
                        render: function (data, type, row, meta) {
                            const displayValue = moment(data).format("DD/MM/YYYY HH:mm:ss");
                            return `<span data-service-fee-category-id='${row.id}'>${displayValue}<span>`;
                        }
                    },
                    {
                        data: 'id',
                        className: 'text-end',
                        render: function (data, type, row, meta) {
                            return `<a href="#" class="btn btn-light btn-active-light-primary btn-flex btn-center btn-sm" data-kt-menu-trigger="click" data-kt-menu-placement="bottom-end" data-kt-menu-flip="top-end">
                                                ${ServiceFeeCategoryPage.message.actions}
                                                <i class="ki-duotone ki-down fs-5 ms-1"></i>
                                    </a>
                                    <div class="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg-light-primary fw-semibold fs-7 w-125px py-4" data-kt-menu="true">
                                        <div class="menu-item px-3">
                                            <a href="#" class="menu-link px-3 btn-edit" data-kt-docs-table-filter="edit_row" data-service-fee-category-id="${data}">
                                                ${ServiceFeeCategoryPage.permissionFlags.canUpdate ? ServiceFeeCategoryPage.message.edit : ServiceFeeCategoryPage.message.detail}
                                            </a>
                                        </div>
                                        <div class="menu-item px-3 ${!ServiceFeeCategoryPage.permissionFlags.canDelete ? "d-none" : ""}">
                                            <a href="#" class="menu-link px-3 btn-delete text-danger" data-kt-users-table-filter="delete_row" data-service-fee-category-id="${data}">
                                                ${ServiceFeeCategoryPage.message.delete}
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
                    $('#service_fee_category_datatable tfoot').html("");
                    $("#service_fee_category_datatable thead tr").clone(true).appendTo("#service_fee_category_datatable tfoot");
                    $('#service_fee_category_datatable tfoot tr').addClass("border-top");
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
            if (!ServiceFeeCategoryPage.permissionFlags.canCreate)
                $("#btn_add_service_fee_category").addClass("d-none");
        },
        regenDataTable: function () {
            if (this.table) {
                this.table.destroy();
                $("#service_fee_category_datatable tbody").html("");
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
            $("#service_fee_category_datatable tbody").on("click", ".btn-edit", function () {
                const id = $(this).attr("data-service-fee-category-id");
                editItem(id);
            });
        },
        bindDeleteEvent: function () {
            $("#service_fee_category_datatable tbody").on("click", ".btn-delete", function () {
                const id = $(this).attr("data-service-fee-category-id");
                deleteItem(id);
            });
        },
        bindSearchAllEvents: function () {
            $("#service_fee_category_datatable_search").on("keyup", AppUtils.debounce(function () {
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
            $("#btn_add_service_fee_category").on("click", function () {
                addItem();
            })
        },
        bindSaveEvent: function () {
            //$("#btn_save_service_fee_category").on("click", function (e) {
            //    e.preventDefault();
            //    saveData();
            //})
        },
        bindClearFilterDateRangeEvent: function () {
            $("#clear_filter_created_date i").on("click", function () {
                ServiceFeeCategoryPage.plugins.dateRangePickerFilter.clear();
            })
            $("#clear_filter_created_date").on("click", function () {
                ServiceFeeCategoryPage.plugins.dateRangePickerFilter.clear();
            })
        },
        bindToggleFilterEvent: function () {
            $("#btn_service_fee_category_filter").on("click", function () {
                $("#service_fee_category_filter").slideToggle();
            })
        }
        //loadRelatedData: async function () {
        //}
    }

    /**
     * Handle add new service-fee-category
     */
    function addItem() {
        ServiceFeeCategoryPage.formValidator.clearErrors();
        $("#btn_save_service_fee_category").removeClass("d-none");
        $("#btn_cancel_service_fee_category").text(ServiceFeeCategoryPage.message.cancel);
        $("#kt_modal_service_fee_category_header h2").text(`${ServiceFeeCategoryPage.message.create} ${ServiceFeeCategoryPage.message.pageTitle.toLocaleLowerCase()}`);
        $("#kt_modal_service_fee_category_form input[type='text'],#kt_modal_service_fee_category_form textarea, #kt_modal_service_fee_category_form select").val("").trigger("change");
        $("#service_fee_category_createdDate").val(moment().format("DD/MM/YYYY HH:mm:ss")).trigger("change");
        $("#service_fee_category_name, #service_fee_category_description").attr("disabled", false);
    }

    /**
     * Author: 
     * CreatedDate: 
     * Description: Edit service fee category by id
     * @param {number} id
     */
    async function editItem(id) {
        ServiceFeeCategoryPage.formValidator.clearErrors();
        $("#global_loader").addClass("show");
        try {
            const response = await httpService.getAsync(ApiRoutes.ServiceFeeCategory.v1.Detail(id));
            const data = response.resources;
            Object.keys(data).forEach(key => {
                const selector = `#service_fee_category_${key}`;
                const value = key.toLocaleLowerCase().includes("date") ? moment(data[key].toString()).format("DD/MM/YYYY HH:mm:ss") : data[key];
                $(selector).val(value).trigger("change");
                if (!key.toLocaleLowerCase().includes("date")) {
                    $(selector).attr("disabled", !ServiceFeeCategoryPage.permissionFlags.canUpdate);
                }
            })

            if (ServiceFeeCategoryPage.permissionFlags.canUpdate) {
                $("#kt_modal_service_fee_category_header h2").text(`${ServiceFeeCategoryPage.message.edit} ${ServiceFeeCategoryPage.message.pageTitle.toLocaleLowerCase()}`);
                $("#btn_save_service_fee_category").removeClass("d-none");
                $("#btn_cancel_service_fee_category").text(ServiceFeeCategoryPage.message.cancel);
            } else {
                $("#kt_modal_service_fee_category_header h2").text(`${ServiceFeeCategoryPage.message.detail} ${ServiceFeeCategoryPage.message.pageTitle.toLocaleLowerCase()}`);
                $("#btn_save_service_fee_category").addClass("d-none");
                $("#btn_cancel_service_fee_category").text(ServiceFeeCategoryPage.message.ok);
            }
            $("#kt_modal_service_fee_category").modal("show");
        } catch (e) {
            console.error(e);
            Swal.fire({
                icon: "error",
                title: ServiceFeeCategoryPage.message.errorTitle,
                html: ServiceFeeCategoryPage.message.notFound,
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
     * Description: Delete service fee category by id
     * @param {number} id
     */
    async function deleteItem(id) {

        const { isConfirmed } = await Swal.fire({
            icon: "question",
            title: ServiceFeeCategoryPage.message.confirmTittle,
            html: ServiceFeeCategoryPage.message.deleteConfirm,
            ...AppSettings.sweetAlertOptions(true)
        });

        if (!isConfirmed)
            return;

        $("#global_loader").addClass("show");
        try {
            const response = await httpService.deleteAsync(ApiRoutes.ServiceFeeCategory.v1.Delete(id));
            if (response?.isSucceeded) {
                //tableSearch();
                ServiceFeeCategoryPage.refreshDataTable();
                Swal.fire({
                    icon: "success",
                    title: ServiceFeeCategoryPage.message.successTitle,
                    html: ServiceFeeCategoryPage.message.deleteSuccess,
                    ...AppSettings.sweetAlertOptions(false)
                })
            }
        } catch (e) {
            console.error(e);
            Swal.fire({
                icon: "error",
                title: ServiceFeeCategoryPage.message.failTitle,
                html: ServiceFeeCategoryPage.message.deleteError,
                ...AppSettings.sweetAlertOptions(false)
            })
        }
        finally {
            $("#global_loader").removeClass("show");
        }
    }

    /**
     * Save data (Create or Update) service fee category
     */
    async function saveData() {

        const btnSave = $("#btn_save_service_fee_category");
        btnSave.attr("disabled", true);

        const columns = ["id", "name", "description"];
        const data = {};
        columns.forEach(key => {
            const selector = `#service_fee_category_${key}`;
            data[key] = $(selector).val();
        });
        const isAdd = !data.id;
        const confirmText = isAdd ? ServiceFeeCategoryPage.message.createConfirm : ServiceFeeCategoryPage.message.updateConfirm;
        const { isConfirmed } = await Swal.fire({
            icon: 'question',
            title: ServiceFeeCategoryPage.message.confirmTittle,
            html: confirmText,
            ...AppSettings.sweetAlertOptions(true)
        });

        if (isConfirmed) {
            btnSave.attr("data-kt-indicator", "on");
            try {
                const response = isAdd ?
                    await httpService.postAsync(ApiRoutes.ServiceFeeCategory.v1.Create, data) :
                    await httpService.putAsync(ApiRoutes.ServiceFeeCategory.v1.Update, data);
                if (response?.isSucceeded) {
                    if (isAdd) {
                        $("#service_fee_category_datatable_search").val("").trigger("change");
                        resetFilter();
                    }
                    else {
                        ServiceFeeCategoryPage.refreshDataTable();
                        /*tableSearch();*/
                    }

                    $("#kt_modal_service_fee_category").modal("hide");
                    const successText = isAdd ? ServiceFeeCategoryPage.message.createSuccess : ServiceFeeCategoryPage.message.updateSuccess;
                    Swal.fire({
                        icon: "success",
                        title: ServiceFeeCategoryPage.message.successTitle,
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
                //    errorTitle = ServiceFeeCategoryPage.message.validationError;

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
                //    errorTitle = ServiceFeeCategoryPage.message.failTitle;
                //    errorText = isAdd ? ServiceFeeCategoryPage.message.createError : ServiceFeeCategoryPage.message.updateError;
                //}
                //Swal.fire({
                //    icon: icon,
                //    title: errorTitle,
                //    html: errorText,
                //    ...AppSettings.sweetAlertOptions(false)
                //});
                AppUtils.handleApiError(e, {
                    action: isAdd ? "create" : "update",
                    name: ServiceFeeCategoryPage.message.pageTitle,
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
        ServiceFeeCategoryPage.table.column(1).search($("#filter_name").val().trim());
        ServiceFeeCategoryPage.table.column(2).search($("#filter_description").val().trim());
        ServiceFeeCategoryPage.table.column(3).search($("#filter_officeName").val().trim());
        ServiceFeeCategoryPage.table.column(4).search($("#filter_created_date").val());
        ServiceFeeCategoryPage.table.search($("#service_fee_category_datatable_search").val().trim()).draw();
    }

    /**
     * Reset filter
     */
    function resetFilter() {
        $("#filter_name").val("");
        $("#filter_description").val("");
        $("#filter_officeName").val("");
        ServiceFeeCategoryPage.plugins.dateRangePickerFilter.clear();
        /*$("#filter_created_date").val("").trigger("change");*/
        tableSearch();
    }

    /**
    * Load data ServiceFeeCategoryType
    */
    //async function loadDataOffice() {
    //    try {
    //        const response = await httpService.getAsync(ApiRoutes.Office.v1.List);
    //        const data = response.resources;
    //        data.forEach(function (item) {
    //            $("#service_fee_category_officeName").append(new Option(item.name, item.id, false, false));
    //            $("#filter_officeName").append(new Option(item.name, item.id, false, false));
    //        });
    //    } catch (e) {
    //        console.error(e);
    //    }
    //}

    // On document ready
    KTUtil.onDOMContentLoaded(async function () {
        await AppEntry.init();
        if (!ServiceFeeCategoryPage.permissionFlags.canView) {
            AppSettings.mainElements.PAGE_CONTENT.addClass("d-none");
            AppSettings.mainElements.NOT_FOUND.removeClass("d-none");
        }
        else {
            ServiceFeeCategoryPage.init();
        }
    });    
})();