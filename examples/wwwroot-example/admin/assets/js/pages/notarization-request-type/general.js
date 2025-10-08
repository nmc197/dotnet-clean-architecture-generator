"use strict";

(function () {
    // Class definition
    const NotarizationRequestTypePage = {
        table: null,
        formValidator: null,
        plugins: {
            dateRangePickerFilter: null
        },
        permissionFlags: AppUtils.getPermissionFlags(),
        message: {
            pageTitle: I18n.t("notarization_request_type", "PAGE_TITLE"),
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
            forbidden: I18n.t("common", "FORBIDDEN"),
            createConfirm: I18n.t("common", "CREATE_CONFIRM", { name: I18n.t("notarization_request_type", "PAGE_TITLE").toLocaleLowerCase() }),
            createSuccess: I18n.t("common", "CREATE_SUCCESS", { name: I18n.t("notarization_request_type", "PAGE_TITLE").toLocaleLowerCase() }),
            createError: I18n.t("common", "CREATE_ERROR", { name: I18n.t("notarization_request_type", "PAGE_TITLE").toLocaleLowerCase() }),
            updateConfirm: I18n.t("common", "UPDATE_CONFIRM", { name: I18n.t("notarization_request_type", "PAGE_TITLE").toLocaleLowerCase() }),
            updateSuccess: I18n.t("common", "UPDATE_SUCCESS", { name: I18n.t("notarization_request_type", "PAGE_TITLE") }),
            updateError: I18n.t("common", "UPDATE_ERROR", { name: I18n.t("notarization_request_type", "PAGE_TITLE").toLocaleLowerCase() }),
            deleteConfirm: I18n.t("common", "DELETE_CONFIRM", { name: I18n.t("notarization_request_type", "PAGE_TITLE").toLocaleLowerCase() }),
            deleteSuccess: I18n.t("common", "DELETE_SUCCESS", { name: I18n.t("notarization_request_type", "PAGE_TITLE").toLocaleLowerCase() }),
            deleteError: I18n.t("common", "DELETE_ERROR", { name: I18n.t("notarization_request_type", "PAGE_TITLE").toLocaleLowerCase() }),
            notFound: I18n.t("common", "NOT_FOUND", { name: I18n.t("notarization_request_type", "PAGE_TITLE").toLocaleLowerCase() }),
            validationError: I18n.t("common", "VALIDATION_ERROR")
        },
        init: function () {
            this.initPlugins();
            this.checkPermissions();
            this.initDataTable();
            this.bindEvents();
            this.formValidator = new FormValidator({
                formSelector: "#kt_modal_notarization_request_type_form",
                handleSubmit: saveData,
                rules: [
                    {
                        element: "#notarization_request_type_name",
                        rule: [
                            {
                                name: "required",
                                message: I18n.t("common", "REQUIRED", { field: "Tên loại hợp đồng" })
                            },
                            {
                                name: "maxLength",
                                message: I18n.t("common", "TOO_LONG", { field: "Tên loại hợp đồng", max: 255 }),
                                params: 255
                            },
                        ]

                    },
                    {
                        element: "#notarization_request_type_description",
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
            this.table = $("#notarization_request_type_datatable").DataTable({
                processing: true,
                serverSide: true,
                paging: true,
                searching: { regex: true },
                order: [3, 'desc'],
                language: AppSettings.dataTableLanguage.vi,
                ajax: {
                    url: ApiRoutes.NotarizationRequestType.v1.PagedAdvanced,
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
                            const tableSettings = NotarizationRequestTypePage.table.settings()[0];
                            tableSettings.ajax.headers.Authorization = "Bearer " + TokenService.getAccessToken();

                            //Reload lại datatable với token mới
                            NotarizationRequestTypePage.table.ajax.reload();
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
                            const info = NotarizationRequestTypePage.table.page.info();
                            const index = meta.row + 1 + info.page * info.length;
                            return index;
                        }
                    },
                    {
                        data: "name",
                        render: function (data, type, row, meta) {
                            return `<span class="text-gray-800 text-hover-primary mb-1" data-notarization-request-type-id='${row.id}'>${AppUtils.escapeHtml(data) ?? ""}</span>`;
                        }
                    },
                    {
                        data: "description",
                        render: function (data, type, row, meta) {
                            return `<span data-notarization-request-type-id='${row.id}'>${AppUtils.escapeHtml(data).replaceAll("\n", "<br>") ?? ""}</span>`;
                        }
                    },
                    {
                        data: "createdDate",
                        render: function (data, type, row, meta) {
                            const displayValue = data ? moment(data).format("DD/MM/YYYY HH:mm:ss") : '';
                            return `<span data-notarization-request-type-id='${row.id}'>${displayValue}</span>`;
                        }
                    },
                    {
                        data: 'id',
                        className: 'text-end',
                        render: function (data, type, row, meta) {
                            return `<a href="#" class="btn btn-light btn-active-light-primary btn-flex btn-center btn-sm" data-kt-menu-trigger="click" data-kt-menu-placement="bottom-end" data-kt-menu-flip="top-end">
                                          ${NotarizationRequestTypePage.message.actions}
                                          <i class="ki-duotone ki-down fs-5 ms-1"></i>
                                    </a>
                                    <div class="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg-light-primary fw-semibold fs-7 w-125px py-4" data-kt-menu="true">
                                         <div class="menu-item px-3">
                                             <a href="#" class="menu-link px-3 btn-edit" data-kt-docs-table-filter="edit_row" data-notarization-request-type-id="${data}">
                                                  ${NotarizationRequestTypePage.permissionFlags.canUpdate ? NotarizationRequestTypePage.message.edit : NotarizationRequestTypePage.message.detail}
                                             </a>
                                         </div>
                                         <div class="menu-item px-3 ${!NotarizationRequestTypePage.permissionFlags.canDelete ? 'd-none' : ''}">
                                             <a href="#" class="menu-link px-3 text-danger btn-delete" data-kt-notarization-request-type-documents-table-filter="delete_row" data-notarization-request-type-id="${data}">
                                                ${NotarizationRequestTypePage.message.delete}
                                              </a>
                                         </div>
                                    </div>`;
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
                    $('#notarization_request_type_datatable tfoot').html("");
                    $("#notarization_request_type_datatable thead tr").clone(true).appendTo("#notarization_request_type_datatable tfoot");
                    $('#notarization_request_type_datatable tfoot tr').addClass("border-top");
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
                $("#notarization_request_type_datatable tbody").html("");
                this.initDataTable();
            }
        },
        checkPermissions: function () {
            if (!NotarizationRequestTypePage.permissionFlags.canCreate)
                $("#btn_add_notarization_request_type").addClass("d-none");
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
            this.bindClearFilterDateRangeEvent();
            this.bindToggleFilterEvent();
        },
        bindEditEvent: function () {
            $("#notarization_request_type_datatable tbody").on("click", ".btn-edit", function () {
                const id = $(this).attr("data-notarization-request-type-id");
                editItem(id);
            });
        },
        bindDeleteEvent: function () {
            $("#notarization_request_type_datatable tbody").on("click", ".btn-delete", function () {
                const id = $(this).attr("data-notarization-request-type-id");
                deleteItem(id);
            });
        },
        bindSearchAllEvents: function () {
            $("#notarization_request_type_datatable_search").on("keyup", AppUtils.debounce(function () {
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
            $("#btn_add_notarization_request_type").on("click", function () {
                addItem();
            })
        },
        bindClearFilterDateRangeEvent: function () {
            $("#clear_filter_created_date i").on("click", function () {
                NotarizationRequestTypePage.plugins.dateRangePickerFilter.clear();
            })
            $("#clear_filter_created_date").on("click", function () {
                NotarizationRequestTypePage.plugins.dateRangePickerFilter.clear();
            })
        },
        bindToggleFilterEvent: function () {
            $("#btn_notarization_request_type_filter").on("click", function () {
                $("#notarization_request_type_filter").slideToggle();
            })
        }
    }

    /**
     * Handle add new notarization request type
     */
    function addItem() {
        if (!NotarizationRequestTypePage.permissionFlags.canCreate) {
            Swal.fire({
                icon: "warning",
                title: NotarizationRequestTypePage.message.warningTitle,
                html: NotarizationRequestTypePage.message.forbidden,
                ...AppSettings.sweetAlertOptions(false)
            });
            return;
        }
        NotarizationRequestTypePage.formValidator.clearErrors();
        $("#kt_modal_notarization_request_type_header h2").text(`${NotarizationRequestTypePage.message.create} ${NotarizationRequestTypePage.message.pageTitle.toLocaleLowerCase()}`);
        $("#kt_modal_notarization_request_type_form input[type='text'],#kt_modal_notarization_request_type_form textarea, #kt_modal_notarization_request_type_form select").val("").trigger("change");
        $("#kt_modal_notarization_request_type_form input[type='color']").val("#000").trigger("change");
        $("#notarization_request_type_createdDate").val(moment().format("DD/MM/YYYY HH:mm:ss")).trigger("change");
        $("#notarization_request_type_id").val("");
        $("#btn_save_notarization_request_type").removeClass("d-none");
        $("#btn_cancel_notarization_request_type").text(NotarizationRequestTypePage.message.cancel);
        $("#notarization_request_type_name, #notarization_request_type_description").removeAttr("disabled");
        $("#notarization_request_type_createdDate").attr("disabled", true);
        $("#kt_modal_notarization_request_type").modal("show");
    }

    /**
     * Author: 
     * CreatedDate: 
     * Description: Edit notarization request type by id
     * @param {number} id
     */
    async function editItem(id) {
        NotarizationRequestTypePage.formValidator.clearErrors();
        $("#global_loader").addClass("show");
        try {
            const response = await httpService.getAsync(ApiRoutes.NotarizationRequestType.v1.Detail(id));
            const data = response.resources;
            $("#notarization_request_type_id").val(data.id); // Hidden field for ID
            $("#notarization_request_type_name").val(data.name); // Văn bản yêu cầu
            $("#notarization_request_type_description").val(data.description);
            $("#notarization_request_type_createdDate").val(moment(data.createdDate).format("DD/MM/YYYY HH:mm:ss")); // Ngày tạo
            $("#notarization_request_type_name, #notarization_request_type_description").attr(
                "disabled",
                !NotarizationRequestTypePage.permissionFlags.canUpdate
            );
            $("#notarization_request_type_createdDate").attr("disabled", true);
            if (NotarizationRequestTypePage.permissionFlags.canUpdate) {
                $("#kt_modal_notarization_request_type_header h2").text(
                    `${NotarizationRequestTypePage.message.edit} ${NotarizationRequestTypePage.message.pageTitle.toLocaleLowerCase()}`
                );
                $("#btn_save_notarization_request_type").removeClass("d-none");
                $("#btn_cancel_notarization_request_type").text(NotarizationRequestTypePage.message.cancel);
            } else {
                $("#kt_modal_notarization_request_type_header h2").text(
                    `${NotarizationRequestTypePage.message.detail} ${NotarizationRequestTypePage.message.pageTitle.toLocaleLowerCase()}`
                );
                $("#btn_save_notarization_request_type").addClass("d-none");
                $("#btn_cancel_notarization_request_type").text(NotarizationRequestTypePage.message.ok);
            }
            $("#kt_modal_notarization_request_type").modal("show");
        } catch (e) {
            console.error(e);
            Swal.fire({
                icon: "error",
                title: NotarizationRequestTypePage.message.errorTitle,
                html: NotarizationRequestTypePage.message.notFound,
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
     * Description: Delete notarization request type by id
     * @param {number} id
     */
    async function deleteItem(id) {
        if (!NotarizationRequestTypePage.permissionFlags.canDelete) {
            Swal.fire({
                icon: "warning",
                title: NotarizationRequestTypePage.message.warningTitle,
                html: NotarizationRequestTypePage.message.forbidden,
                ...AppSettings.sweetAlertOptions(false)
            });
            return;
        }
        const { isConfirmed } = await Swal.fire({
            icon: "question",
            title: NotarizationRequestTypePage.message.confirmTittle,
            html: NotarizationRequestTypePage.message.deleteConfirm,
            ...AppSettings.sweetAlertOptions(true)
        });

        if (!isConfirmed)
            return;

        $("#global_loader").addClass("show");
        try {
            const response = await httpService.deleteAsync(ApiRoutes.NotarizationRequestType.v1.Delete(id));
            if (response?.isSucceeded) {
                /*tableSearch();*/
                NotarizationRequestTypePage.refreshDataTable();
                Swal.fire({
                    icon: "success",
                    title: NotarizationRequestTypePage.message.successTitle,
                    html: NotarizationRequestTypePage.message.deleteSuccess,
                    ...AppSettings.sweetAlertOptions(false)
                })
            }
        } catch (e) {
            console.error(e);
            Swal.fire({
                icon: "error",
                title: NotarizationRequestTypePage.message.failTitle,
                html: NotarizationRequestTypePage.message.deleteError,
                ...AppSettings.sweetAlertOptions(false)
            })
        }
        finally {
            $("#global_loader").removeClass("show");
        }
    }

    /**
     * Save data (Create or Update) notarization request type status
     */
    async function saveData() {

        const btnSave = $("#btn_save_notarization_request_type");
        btnSave.attr("disabled", true);

        const data = {
            id: $("#notarization_request_type_id").val(),
            name: $("#notarization_request_type_name").val(),
            description: $("#notarization_request_type_description").val(),
        };

        const isAdd = !data.id;
        if (!isAdd && !NotarizationRequestTypePage.permissionFlags.canUpdate) {
            Swal.fire({
                icon: "warning",
                title: NotarizationRequestTypePage.message.warningTitle,
                html: NotarizationRequestTypePage.message.forbidden,
                ...AppSettings.sweetAlertOptions(false)
            });
            btnSave.removeAttr("disabled");
            return;
        }
        if (isAdd && !NotarizationRequestTypePage.permissionFlags.canCreate) {
            Swal.fire({
                icon: "warning",
                title: NotarizationRequestTypePage.message.warningTitle,
                html: NotarizationRequestTypePage.message.forbidden,
                ...AppSettings.sweetAlertOptions(false)
            });
            btnSave.removeAttr("disabled");
            return;
        }
        const confirmText = isAdd ? NotarizationRequestTypePage.message.createConfirm : NotarizationRequestTypePage.message.updateConfirm;
        const { isConfirmed } = await Swal.fire({
            icon: 'question',
            title: NotarizationRequestTypePage.message.confirmTittle,
            html: confirmText,
            ...AppSettings.sweetAlertOptions(true)
        });

        if (isConfirmed) {
            btnSave.attr("data-kt-indicator", "on");
            try {
                const response = isAdd ?
                    await httpService.postAsync(ApiRoutes.NotarizationRequestType.v1.Create, data) :
                    await httpService.putAsync(ApiRoutes.NotarizationRequestType.v1.Update, data);
                if (response?.isSucceeded) {
                    if (isAdd) {
                        $("#notarization_request_type_datatable_search").val("").trigger("change");
                        resetFilter();
                    }
                    else {
                        /*tableSearch();*/
                        NotarizationRequestTypePage.refreshDataTable();
                    }

                    $("#kt_modal_notarization_request_type").modal("hide");
                    const successText = isAdd ? NotarizationRequestTypePage.message.createSuccess : NotarizationRequestTypePage.message.updateSuccess;
                    Swal.fire({
                        icon: "success",
                        title: NotarizationRequestTypePage.message.successTitle,
                        html: successText,
                        ...AppSettings.sweetAlertOptions(false)
                    });
                }

            } catch (e) {
                AppUtils.handleApiError(e, {
                    action: isAdd ? "create" : "update",
                    name: NotarizationRequestTypePage.message.pageTitle,
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
        NotarizationRequestTypePage.table.column(1).search($("#filter_name").val().trim());
        NotarizationRequestTypePage.table.column(2).search($("#filter_description").val().trim());
        NotarizationRequestTypePage.table.column(3).search($("#filter_created_date").val());
        NotarizationRequestTypePage.table.search($("#notarization_request_type_datatable_search").val().trim()).draw();
    }

    /**
     * Reset filter
     */
    function resetFilter() {
        $("#filter_name").val("");
        $("#filter_description").val("");
        NotarizationRequestTypePage.plugins.dateRangePickerFilter.clear();
        tableSearch();
    }

    // On document ready
    KTUtil.onDOMContentLoaded(async function () {
        await AppEntry.init();
        if (!NotarizationRequestTypePage.permissionFlags.canView) {
            AppSettings.mainElements.PAGE_CONTENT.addClass("d-none");
            AppSettings.mainElements.NOT_FOUND.removeClass("d-none");
        }
        else
            NotarizationRequestTypePage.init();
    });
})();