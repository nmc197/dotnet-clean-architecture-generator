"use strict";

(function () {
    // Class definition
    const NotarizationRequestPage = {
        table: null,
        formValidator: null,
        plugins: {
            dateRangePickerFilter: null
        },
        permissionFlags: AppUtils.getPermissionFlags(),
        message: {
            pageTitle: I18n.t("notarization_request", "PAGE_TITLE"),
            actions: I18n.t("common", "ACTIONS"),
            create: I18n.t("common", "ADD_NEW"),
            edit: I18n.t("common", "EDIT"),
            detail: I18n.t("common", "DETAIL"),
            delete: I18n.t("common", "DELETE"),
            confirmTittle: I18n.t("common", "CONFIRM_TITLE"),
            successTitle: I18n.t("common", "SUCCESS_TITLE"),
            errorTitle: I18n.t("common", "ERROR_TITLE"),
            failTitle: I18n.t("common", "FAIL_TITLE"),
            warningTitle: I18n.t("common", "WARNING_TITLE"),
            createConfirm: I18n.t("common", "CREATE_CONFIRM", { name: I18n.t("notarization_request", "PAGE_TITLE").toLocaleLowerCase() }),
            createSuccess: I18n.t("common", "CREATE_SUCCESS", { name: I18n.t("notarization_request", "PAGE_TITLE").toLocaleLowerCase() }),
            createError: I18n.t("common", "CREATE_ERROR", { name: I18n.t("notarization_request", "PAGE_TITLE").toLocaleLowerCase() }),
            updateConfirm: I18n.t("common", "UPDATE_CONFIRM", { name: I18n.t("notarization_request", "PAGE_TITLE").toLocaleLowerCase() }),
            updateSuccess: I18n.t("common", "UPDATE_SUCCESS", { name: I18n.t("notarization_request", "PAGE_TITLE") }),
            updateError: I18n.t("common", "UPDATE_ERROR", { name: I18n.t("notarization_request", "PAGE_TITLE").toLocaleLowerCase() }),
            deleteConfirm: I18n.t("common", "DELETE_CONFIRM", { name: I18n.t("notarization_request", "PAGE_TITLE").toLocaleLowerCase() }),
            deleteSuccess: I18n.t("common", "DELETE_SUCCESS", { name: I18n.t("notarization_request", "PAGE_TITLE").toLocaleLowerCase() }),
            deleteError: I18n.t("common", "DELETE_ERROR", { name: I18n.t("notarization_request", "PAGE_TITLE").toLocaleLowerCase() }),
            notFound: I18n.t("common", "NOT_FOUND", { name: I18n.t("notarization_request", "PAGE_TITLE").toLocaleLowerCase() }),
            validationError: I18n.t("common", "VALIDATION_ERROR"),
            view: "Xem hồ sơ",
            reject: "Xem lý do"

        },
        init: function () {
            this.checkPermissions();
            this.initPlugins();
            this.initDataTable();
            this.loadRelatedData();
            this.bindEvents();
        },
        initDataTable: function () {
            this.table = $("#notarization_request_datatable").DataTable({
                processing: true,
                serverSide: true,
                paging: true,
                searching: { regex: true },
                order: [9, 'desc'],
                language: AppSettings.dataTableLanguage.vi,
                ajax: {
                    url: ApiRoutes.NotarizationRequest.v1.PagedAdvanced,
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
                            const tableSettings = NotarizationRequestPage.table.settings()[0];
                            tableSettings.ajax.headers.Authorization = "Bearer " + TokenService.getAccessToken();

                            //Reload lại datatable với token mới
                            NotarizationRequestPage.table.ajax.reload();
                        }
                    },
                    dataSrc: {
                        data: 'resources.data',
                        draw: 'resources.draw',
                        recordsTotal: 'resources.recordsTotal',
                        recordsFiltered: 'resources.recordsFiltered'
                    },
                    data: function (d) {
                        d.documentTypeIds = $("#filter_documentTypeId").val();
                        d.notarizationRequestTypeIds = $("#filter_notarizationRequestTypeId").val();
                        d.notarizationRequestStatusIds = $("#filter_notarizationRequestStatusId").val();
                        d.requesterIds = $("#filter_requesterId").val();
                        d.staffIds = $("#filter_staffId").val();
                        d.minTransactionValue = $("#filter_min_notarizationNumber").val();
                        d.maxTransactionValue = $("#filter_max_notarizationNumber").val();
                        return JSON.stringify(d);
                    }

                },
                columns: [
                    {
                        data: 'id',
                        render: function (data, type, row, meta) {
                            const info = NotarizationRequestPage.table.page.info();
                            const index = meta.row + 1 + info.page * info.length;
                            return index; // This contains the row index
                        }
                    },

                    {
                        data: "notarizationNumber",
                        render: function (data, type, row, meta) {
                            return `<div class="fw-semibold text-gray-800 text-hover-primary"  data-notarization-request-id='${row.id}'>${AppUtils.escapeHtml(data)}</div>`;
                        },
                    },
                    {
                        data: "notarizedDate",
                        render: function (data, type, row, meta) {
                            const displayValue = moment(data).format("DD/MM/YYYY HH:mm:ss");
                            return data != null ?
                                `<div data-notarization-request-id='${row.id}'>${displayValue}<div>
                                 <div data-user-id='${row.id}' style="background-color: ${AppUtils.customBagdeColor(row.notarizationRequestStatusColor)}; color: ${row.notarizationRequestStatusColor}; padding: 5px 8px; border-radius: 8px; display: inline-block; font-weight: 600;">${AppUtils.escapeHtml(row.notarizationRequestStatusName)}</div>
                                `
                                : `<div data-user-id='${row.id}' style="background-color: ${AppUtils.customBagdeColor(row.notarizationRequestStatusColor)}; color: ${row.notarizationRequestStatusColor}; padding: 5px 8px; border-radius: 8px; display: inline-block; font-weight: 600;">${AppUtils.escapeHtml(row.notarizationRequestStatusName)}</div>`;
                        },
                    },
                    {
                        data: "requesterFullName",
                        render: function (data, type, row, meta) {
                            return data ? `<span  data-notarization-request-id='${row.id}'>${AppUtils.escapeHtml(data)}</span>` : "";
                        },
                    },
                    {
                        data: "documentTypeId",
                        render: function (data, type, row, meta) {
                            return data ? `<span  data-notarization-request-id='${row.id}'>${AppUtils.escapeHtml(row.documentTypeName)}</span>` : "";
                        },
                    },
                    {
                        data: "creatorName",
                        render: function (data, type, row, meta) {
                            let creatorName = row.creatorName;
                            if (row.requesterId == row.createdBy) {
                                creatorName = "Khách hàng";
                            }
                            return data ? `<span  data-notarization-request-id='${row.id}'>${AppUtils.escapeHtml(creatorName)}</span>` : "";
                        },
                    },
                    {
                        data: "staffId",
                        render: function (data, type, row, meta) {
                            return data ? `<span  data-notarization-request-id='${row.id}'>${AppUtils.escapeHtml(row.staffName)}</span>` : "";
                        },
                    },
                    {
                        data: "transactionValue",
                        className: 'text-end',
                        render: function (data, type, row, meta) {
                            return `<span data-notarization-request-id='${row.id}'>${AppUtils.numberWithCommas(row.transactionValue)}</span>`;
                        },
                    },
                    {
                        data: "notarizationRequestTypeId",
                        render: function (data, type, row, meta) {
                            return data ? `<span  data-notarization-request-id='${row.id}'>${AppUtils.escapeHtml(row.notarizationRequestTypeName)}</span>` : "";
                        },
                    },
                    {
                        data: "createdDate",
                        render: function (data, type, row, meta) {
                            const displayValue = moment(data).format("DD/MM/YYYY HH:mm:ss");
                            return `<span data-office-id='${row.id}'>${displayValue}<span>`;
                        }
                    },
                    {
                        data: 'id',
                        className: 'text-end text-nowrap',
                        render: function (data, type, row, meta) {
                            return `<a class="btn btn-light btn-active-light-primary btn-flex btn-center btn-sm" data-kt-menu-trigger="click" data-kt-menu-placement="bottom-end" data-kt-menu-flip="top-end">
                                                ${NotarizationRequestPage.message.actions}
                                                <i class="ki-duotone ki-down fs-5 ms-1"></i>
                                    </a>
                                    <div class="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg-light-primary fw-semibold fs-7 w-125px py-4" data-kt-menu="true">
                                        ${row.notarizationRequestStatusId == AppSettings.NotarizationRequestStatus.COMPLETED ?
                                NotarizationRequestPage.permissionFlags.canView ? `<div class="menu-item px-3">
                                            <a class="menu-link px-3 text-primary btn-view" data-kt-docs-table-filter="edit_row" data-notarization-request-id="${row.requestCode}">
                                                ${NotarizationRequestPage.message.view}
                                            </a>
                                        </div>` : `` : ''
                                        }
                                         ${row.notarizationRequestStatusId == AppSettings.NotarizationRequestStatus.REJECTED ?
                                NotarizationRequestPage.permissionFlags.canView ? `<div class="menu-item px-3">
                                            <a class="menu-link px-3 text-primary btn-reason" data-kt-docs-table-filter="edit_row" data-notarization-request-id="${row.id}">
                                                ${NotarizationRequestPage.message.reject}
                                            </a>
                                        </div>` : `` : ''
                                        }
                                        <div class="menu-item px-3">
                                         ${row.notarizationRequestStatusId != AppSettings.NotarizationRequestStatus.COMPLETED ?
                                `<a class="menu-link px-3 btn-edit" data-kt-docs-table-filter="edit_row" data-notarization-request-id="${data}">
                                              ${NotarizationRequestPage.permissionFlags.canUpdate ? NotarizationRequestPage.message.edit : NotarizationRequestPage.message.detail}
                                            </a>` : `` }
                                        </div>
                                        <div class="menu-item px-3">
                                            ${NotarizationRequestPage.permissionFlags.canDelete ? `<a class="menu-link px-3 text-danger btn-delete" data-kt-users-table-filter="delete_row" data-notarization-request-id="${data}">
                                                ${NotarizationRequestPage.message.delete}
                                            </a>` : '' }
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
                    $('#notarization_request_datatable tfoot').html("");
                    $("#notarization_request_datatable thead tr").clone(true).appendTo("#notarization_request_datatable tfoot");
                    $('#notarization_request_datatable tfoot tr').addClass("border-top");
                }
            })

            this.table.on("draw", function () {
                KTMenu.createInstances();
            })
        },
        initPlugins: function () {
            this.plugins.dateRangePickerFilter = $("#filter_notarization_date").flatpickr({
                dateFormat: "d/m/Y",
                mode: "range",
                conjunction: " - ",
                locale: "vn",
            });

            //BEGIN: SELECT2
            $("#filter_notarizationRequestStatusId").select2({
                language: currentLang,
                dropdownParent: "#notarization_request_filter",
                placeholder: "Chọn trạng thái",
            });
            $("#filter_documentTypeId").select2({
                language: currentLang,
                dropdownParent: "#notarization_request_filter",
                placeholder: "Chọn loại hợp đồng",
            });
            $("#filter_notarizationRequestTypeId").select2({
                language: currentLang,
                dropdownParent: "#notarization_request_filter",
                placeholder: "Chọn hình thức công chứng",
            });
            AppUtils.createSelect2("#filter_requesterId", {
                url: ApiRoutes.User.v1.Search,
                allowClear: true,
                cache: true,
                placeholder: 'Chọn người yêu cầu',
                select2Options: {
                    dropdownParent: "#notarization_request_filter",
                    closeOnSelect: false,
                }
            });
            AppUtils.createSelect2("#filter_staffId", {
                url: ApiRoutes.User.v1.Search,
                allowClear: true,
                cache: true,
                placeholder: 'Chọn công chứng viên',
                select2Options: {
                    dropdownParent: "#notarization_request_filter",
                    closeOnSelect: false,
                }
            });
            //END: SELECT2
            AppUtils.formatNumberCurency();
        },
        regenDataTable: function () {
            if (this.table) {
                this.table.destroy();
                $("#notarization_request_datatable tbody").html("");
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
            this.bindClearFilterDateRangeEvent();
            this.bindViewEvent();
            this.bindViewReasonEvent();
            this.bindToggleFilterEvent();
        },
        bindEditEvent: function () {
            $("#notarization_request_datatable tbody").on("click", ".btn-edit", function () {
                const id = $(this).attr("data-notarization-request-id");
                editItem(id);
            });
        },
        bindDeleteEvent: function () {
            $("#notarization_request_datatable tbody").on("click", ".btn-delete", function () {
                const id = $(this).attr("data-notarization-request-id");
                deleteItem(id);
            });
        },
        bindViewEvent: function () {
            $("#notarization_request_datatable tbody").on("click", ".btn-view", function () {
                const id = $(this).attr("data-notarization-request-id");
                let url = `/notarization-request/view/${id}`
                window.open(url, '_blank');
            });
        },
        bindViewReasonEvent: function () {
            $("#notarization_request_datatable tbody").on("click", ".btn-reason", function () {
                const id = $(this).attr("data-notarization-request-id");
                showReason(id);
            });
        },
        bindSearchAllEvents: function () {
            $("#notarization_request_datatable_search").on("keyup", AppUtils.debounce(function () {
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
            $("#btn_add_notarization_request").on("click", function () {
                addItem();
            })
        },
        bindClearFilterDateRangeEvent: function () {
            $("#clear_filter_created_date i").on("click", function () {
                NotarizationRequestPage.plugins.dateRangePickerFilter.clear();
            })
            $("#clear_filter_created_date").on("click", function () {
                NotarizationRequestPage.plugins.dateRangePickerFilter.clear();
            })
        },
        bindToggleFilterEvent: function () {
            $("#btn_notarization_request_filter").on("click", function () {
                $("#notarization_request_filter").slideToggle();
            })
        },
        checkPermissions: function () {
            if (!NotarizationRequestPage.permissionFlags.canCreate)
                $("#btn_add_notarization_request").addClass("d-none");
        },
        loadRelatedData: async function () {
            await loadDataDocumentTypes();
            await loadDataNotarizationRequestTypes();
            await loadDataNotarizationRequestStatuses();
        }
    }

    /**
     * Handle add new Notarization Request
     */
    function addItem() {
        window.open(`/notarization-request/detail/0`);
    }

    /**
     * Author: 
     * CreatedDate: 
     * Description: Edit Notarization Request by id
     * @param {number} id
     */
    async function editItem(id) {
        if (NotarizationRequestPage.permissionFlags.canView || NotarizationRequestPage.permissionFlags.canUpdate) {
            window.open(`/notarization-request/detail/${id}`);
        }
    }

    /**
     * Author:
     * CreatedDate:
     * Description: Delete Notarization Request by id
     * @param {number} id
     */
    async function deleteItem(id) {

        const { isConfirmed } = await Swal.fire({
            icon: "question",
            title: NotarizationRequestPage.message.confirmTittle,
            html: NotarizationRequestPage.message.deleteConfirm,
            ...AppSettings.sweetAlertOptions(true)
        });

        if (!isConfirmed)
            return;

        $("#global_loader").addClass("show");
        try {
            const response = await httpService.deleteAsync(ApiRoutes.NotarizationRequest.v1.Delete(id));
            if (response?.isSucceeded) {
                /*tableSearch();*/
                NotarizationRequestPage.refreshDataTable();
                Swal.fire({
                    icon: "success",
                    title: NotarizationRequestPage.message.successTitle,
                    html: NotarizationRequestPage.message.deleteSuccess,
                    ...AppSettings.sweetAlertOptions(false)
                })
            }
        } catch (e) {
            console.error(e);
            Swal.fire({
                icon: "error",
                title: NotarizationRequestPage.message.failTitle,
                html: NotarizationRequestPage.message.deleteError,
                ...AppSettings.sweetAlertOptions(false)
            })
        }
        finally {
            $("#global_loader").removeClass("show");
        }
    }

    /**
     * Search data table
     */
    function tableSearch() {
        NotarizationRequestPage.table.column(1).search($("#filter_notarizationNumber").val().trim());
        NotarizationRequestPage.table.column(2).search($("#filter_notarization_date").val());
        NotarizationRequestPage.table.search($("#notarization_request_datatable_search").val().trim()).draw();
    }

    /**
     * Reset filter
     */
    function resetFilter() {
        $("#filter_notarizationNumber").val("");
        $("#filter_notarizationRequestStatusId").val("").trigger("change");
        $("#filter_notarization_date").val("").trigger("change");
        $("#filter_requesterId").val("").trigger("change");
        $("#filter_documentTypeId").val("").trigger("change");
        $("#filter_staffId").val("").trigger("change");
        $("#filter_min_notarizationNumber").val("");
        $("#filter_max_notarizationNumber").val("");
        $("#filter_notarizationRequestTypeId").val("");
        NotarizationRequestPage.plugins.dateRangePickerFilter.clear();
        /*$("#filter_created_date").val("").trigger("change");*/
        tableSearch();
    }
    /**
     * load data document types
     */
    async function loadDataDocumentTypes() {
        try {
            const response = await httpService.getAsync(ApiRoutes.DocumentType.v1.List);
            const data = response.resources;
            data.forEach(function (item) {
                $("#filter_documentTypeId").append(new Option(AppUtils.escapeHtml(item.name), item.id, false, false));
            });
        } catch (e) {
            console.error(e);
        }
    }
    /**
    * load data notarization request types
    */
    async function loadDataNotarizationRequestTypes() {
        try {
            const response = await httpService.getAsync(ApiRoutes.NotarizationRequestType.v1.List);
            const data = response.resources;
            data.forEach(function (item) {
                $("#filter_notarizationRequestTypeId").append(new Option(AppUtils.escapeHtml(item.name), item.id, false, false));
            });
        } catch (e) {
            console.error(e);
        }
    }
    /**
   * load data notarization request statuses
   */
    async function loadDataNotarizationRequestStatuses() {
        try {
            const response = await httpService.getAsync(ApiRoutes.NotarizationRequestStatus.v1.List);
            const data = response.resources;
            data.forEach(function (item) {
                $("#filter_notarizationRequestStatusId").append(new Option(AppUtils.escapeHtml(item.name), item.id, false, false));
            });
        } catch (e) {
            console.error(e);
        }
    }

    async function showReason(id) {
        $("#global_loader").addClass("show");
        try {
            const response = await httpService.getAsync(ApiRoutes.NotarizationRequest.v1.Detail(id));
            const data = response.resources;

            const htmlContent = `
            <div style="text-align:left;">
                <p><strong>Lý do từ chối:</strong> ${data.notarizationRequestReviewHistory.reason || '<i>Không có</i>'}</p>
                <p><strong>Ghi chú:</strong> ${data.notarizationRequestReviewHistory.note || '<i>Không có</i>'}</p>
                <p><strong>Người thực hiện:</strong> ${data.notarizationRequestReviewHistory.reviewedByUserFullName || '<i>Không có</i>'}</p>
                <p><strong>Thời gian thực hiện</strong> ${data.notarizationRequestReviewHistory.reviewedAt ? moment(data.notarizationRequestReviewHistory.reviewedAt).format("DD/MM/YYYY HH:mm") : '<i>Không có</i>'}</p>
            </div>
        `;

            Swal.fire({
                icon: "info",
                title: `Lý do từ chối yêu cầu <br> Số hồ sơ: <b>${data.requestCode}</b>`,
                html: htmlContent,
                width: 600,
                confirmButtonText: "Đóng",
                ...AppSettings.sweetAlertOptions()
            });

        } catch (e) {
            console.error(e);
            Swal.fire({
                icon: "error",
                title: OfficeStatusPage.message.errorTitle,
                html: OfficeStatusPage.message.notFound,
                ...AppSettings.sweetAlertOptions(false)
            });
        } finally {
            $("#global_loader").removeClass("show");
        }
    }

    // On document ready
    KTUtil.onDOMContentLoaded(async function () {
        await AppEntry.init();
        if (!NotarizationRequestPage.permissionFlags.canView) {
            AppSettings.mainElements.PAGE_CONTENT.addClass("d-none");
            AppSettings.mainElements.NOT_FOUND.removeClass("d-none");
        }
        else
            NotarizationRequestPage.init();
    });
})();