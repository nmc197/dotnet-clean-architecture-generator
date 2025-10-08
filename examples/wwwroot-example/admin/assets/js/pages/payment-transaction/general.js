"use strict";

(function () {
    // Class definition
    const PaymentTransactionPage = {
        table: null,
        formValidator: null,
        plugins: {
            dateRangePickerFilter: null
        },
        permissionFlags: AppUtils.getPermissionFlags(),
        message: {
            pageTitle: I18n.t("payment_transaction", "PAGE_TITLE"),
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
            createConfirm: I18n.t("common", "CREATE_CONFIRM", { name: I18n.t("payment_transaction", "PAGE_TITLE").toLocaleLowerCase() }),
            createSuccess: I18n.t("common", "CREATE_SUCCESS", { name: I18n.t("payment_transaction", "PAGE_TITLE").toLocaleLowerCase() }),
            createError: I18n.t("common", "CREATE_ERROR", { name: I18n.t("payment_transaction", "PAGE_TITLE").toLocaleLowerCase() }),
            updateConfirm: I18n.t("common", "UPDATE_CONFIRM", { name: I18n.t("payment_transaction", "PAGE_TITLE").toLocaleLowerCase() }),
            updateSuccess: I18n.t("common", "UPDATE_SUCCESS", { name: I18n.t("payment_transaction", "PAGE_TITLE") }),
            updateError: I18n.t("common", "UPDATE_ERROR", { name: I18n.t("payment_transaction", "PAGE_TITLE").toLocaleLowerCase() }),
            deleteConfirm: I18n.t("common", "DELETE_CONFIRM", { name: I18n.t("payment_transaction", "PAGE_TITLE").toLocaleLowerCase() }),
            deleteSuccess: I18n.t("common", "DELETE_SUCCESS", { name: I18n.t("payment_transaction", "PAGE_TITLE").toLocaleLowerCase() }),
            deleteError: I18n.t("common", "DELETE_ERROR", { name: I18n.t("payment_transaction", "PAGE_TITLE").toLocaleLowerCase() }),
            notFound: I18n.t("common", "NOT_FOUND", { name: I18n.t("payment_transaction", "PAGE_TITLE").toLocaleLowerCase() }),
            validationError: I18n.t("common", "VALIDATION_ERROR")
        },
        init: function () {
            this.initPlugins();
            this.initDataTable();
            this.loadRelatedData();
            this.bindEvents();
        },
        initDataTable: function () {
            this.table = $("#payment_transaction_datatable").DataTable({
                processing: true,
                serverSide: true,
                paging: true,
                searching: { regex: true },
                order: [5, 'desc'],
                language: AppSettings.dataTableLanguage.vi,
                ajax: {
                    url: ApiRoutes.PaymentTransaction.v1.PagedAdvanced,
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
                            const tableSettings = PaymentTransactionPage.table.settings()[0];
                            tableSettings.ajax.headers.Authorization = "Bearer " + TokenService.getAccessToken();

                            //Reload lại datatable với token mới
                            PaymentTransactionPage.table.ajax.reload();
                        }
                    },
                    dataSrc: {
                        data: 'resources.data',
                        draw: 'resources.draw',
                        recordsTotal: 'resources.recordsTotal',
                        recordsFiltered: 'resources.recordsFiltered'
                    },
                    data: function (d) {
                        d.officeIds = $('#filter_officeId').val();
                        d.paymentStatusIds = $('#filter_paymentStatusId').val();
                        d.userIds = $('#filter_userId').val();
                        return JSON.stringify(d);
                    }

                },
                columns: [
                    {
                        data: 'id',
                        render: function (data, type, row, meta) {
                            const info = PaymentTransactionPage.table.page.info();
                            const index = meta.row + 1 + info.page * info.length;
                            return index; // This contains the row index
                        }
                    },

                   
                    {
                        data: "userId",
                        render: function (data, type, row, meta) {
                            return `<span class="fw-semibold text-gray-800 text-hover-primary" data-payment-transaction-id='${row.id}'>${AppUtils.escapeHtml(row.userFullName)}<span>`;
                        },
                    },
                    {
                        data: "officeId",
                        render: function (data, type, row, meta) {
                            return `<span data-payment-transaction-id='${row.id}'>${AppUtils.escapeHtml(row.officeName)}<span>`;
                        },
                    },
                    {
                        data: "paymentStatusName",
                       
                        render: function (data, type, row, meta) {
                            return `<span data-payment-transaction-id='${row.id}' style="background-color: ${AppUtils.customBagdeColor(row.paymentStatusColor)}; color: ${row.paymentStatusColor}; padding: 5px 8px; border-radius: 8px; display: inline-block; font-weight: 600;">${AppUtils.escapeHtml(row.paymentStatusName)}<span>`;
                        },
                    },
                   
                    {
                        data: "amount",
                        className: 'text-end',
                        render: function (data, type, row, meta) {
                            return `<span data-payment-transaction-id='${row.id}'>  ${AppUtils.numberWithCommas(row.amount)}<span>`;
                        },
                    },

                    {
                        data: "createdDate",
                        render: function (data, type, row, meta) {
                            const displayValue = moment(data).format("DD/MM/YYYY HH:mm:ss");
                            return `<span data-payment-transaction-id='${row.id}'>${displayValue}<span>`;
                        }
                    },
                    {
                        data: 'id',
                        className: 'text-end',
                        render: function (data, type, row, meta) {
                            return `<a href="#" class="btn btn-light btn-active-light-primary btn-flex btn-center btn-sm text-nowrap" data-kt-menu-trigger="click" data-kt-menu-placement="bottom-end" data-kt-menu-flip="top-end">
                                                ${PaymentTransactionPage.message.actions}
                                                <i class="ki-duotone ki-down fs-5 ms-1"></i>
                                    </a>
                                    <div class="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg-light-primary fw-semibold fs-7 w-125px py-4" data-kt-menu="true">
                                        <div class="menu-item px-3">
                                            <a href="#" class="menu-link px-3 btn-detail" data-kt-docs-table-filter="edit_row" data-payment-transaction-id="${data}">
                                                ${PaymentTransactionPage.message.detail}
                                            </a>
                                        </div>
                                       `
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
                    $('#payment_transaction_datatable tfoot').html("");
                    $("#payment_transaction_datatable thead tr").clone(true).appendTo("#payment_transaction_datatable tfoot");
                    $('#payment_transaction_datatable tfoot tr').addClass("border-top");
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
            
            $("#filter_paymentStatusId").select2({
                placeholder: "Chọn trạng thái giao dịch",
                language: currentLang
            });

            AppUtils.createSelect2("#filter_officeId", {
                url: ApiRoutes.Office.v1.GetByCurrentUser,
                allowClear: true,
                cache: true,
                placeholder: 'Chọn văn phòng',
                select2Options: {
                    dropdownParent: "#payment_transaction_filter",
                    closeOnSelect: false,
                }
            });
            AppUtils.createSelect2("#filter_userId", {
                url: ApiRoutes.User.v1.Search,
                allowClear: true,
                cache: true,
                placeholder: 'Chọn khách hàng',
                select2Options: {
                    dropdownParent: "#payment_transaction_filter",
                    closeOnSelect: false,
                }
            });

        },
        regenDataTable: function () {
            if (this.table) {
                this.table.destroy();
                $("#payment_transaction_datatable tbody").html("");
                this.initDataTable();
            }
        },
        bindEvents: function () {
            this.binDetailEvent();
            this.bindSearchAllEvents();
            this.bindFilterEvents();
            this.bindClearFilterDateRangeEvent();
            this.bindToggleFilterEvent();
        },
        binDetailEvent: function () {
            $("#payment_transaction_datatable tbody").on("click", ".btn-detail", function () {
                const id = $(this).attr("data-payment-transaction-id");
                DetailItem(id);
            });
        },
       
        bindSearchAllEvents: function () {
            $("#payment_transaction_datatable_search").on("keyup", AppUtils.debounce(function () {
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
        bindToggleFilterEvent: function () {
            $("#btn_payment_transaction_filter").on("click", function () {
                $("#payment_transaction_filter").slideToggle();
            })
        },
        bindClearFilterDateRangeEvent: function () {
            $("#clear_filter_created_date i").on("click", function () {
                PaymentTransactionPage.plugins.dateRangePickerFilter.clear();
            })
            $("#clear_filter_created_date").on("click", function () {
                PaymentTransactionPage.plugins.dateRangePickerFilter.clear();
            })
        },
        loadRelatedData: async function () {
            loadPaymentMethod();
            loadPaymentStatus();
           
        },
    }
    async function loadPaymentMethod() {
        try {
            const response = await httpService.getAsync(ApiRoutes.PaymentMethod.v1.List);
            const data = response?.resources || [];
            data.forEach(item => {
                $("#payment_transaction_paymentMethodId").append(new Option(item.name, item.id, false, false));

            })
        } catch (e) {
            console.error(e);
        }
    }
    async function loadPaymentStatus() {
        try {
            const response = await httpService.getAsync(ApiRoutes.PaymentStatus.v1.List);
            const data = response?.resources || [];
            data.forEach(item => {
                $("#filter_paymentStatusId").append(new Option(item.name, item.id, false, false));
                $("#payment_transaction_paymentStatusId").append(new Option(item.name, item.id, false, false));
            })
        } catch (e) {
            console.error(e);
        }
    }

    /**
     * Author: 
     * CreatedDate: 
     * Description: View payment transaction  by id
     * @param {number} id
     */
    async function DetailItem(id) {
       
        $("#global_loader").addClass("show");
        try {
            const response = await httpService.getAsync(ApiRoutes.PaymentTransaction.v1.Detail(id));
            const data = response.resources;
            Object.keys(data).forEach(key => {
                const selector = `#payment_transaction_${key}`;
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
            $("#kt_modal_payment_transaction_header h2").text(`${PaymentTransactionPage.message.detail} ${PaymentTransactionPage.message.pageTitle.toLocaleLowerCase()}`);
            $("#kt_modal_payment_transaction").modal("show");
        } catch (e) {
            
            AppUtils.handleApiError(e, {
                action: "delete",
                name: PaymentTransactionPage.message.pageTitle,
                isShowAlert: true
            })
        }
        finally {
            $("#global_loader").removeClass("show");
            AppUtils.formatNumberCurency();
        }
    }


    /**
     * Search data table
     */
    function tableSearch() {
        PaymentTransactionPage.table.column(4).search($("#filter_amount").val().replace(/\./g, ''));
        PaymentTransactionPage.table.column(5).search($("#filter_created_date").val());
        PaymentTransactionPage.table.search($("#payment_transaction_datatable_search").val().trim()).draw();
    }

    /**
     * Reset filter
     */
    function resetFilter() {
        
        $("#filter_officeId").val("").trigger("change");
        $("#filter_userId").val("").trigger("change");
        $("#filter_paymentStatusId").val("").trigger("change");
        $("#filter_amount").val("");
        PaymentTransactionPage.plugins.dateRangePickerFilter.clear();
        tableSearch();
    }
    // On document ready
    KTUtil.onDOMContentLoaded(async function () {
        await AppEntry.init();
        if (!PaymentTransactionPage.permissionFlags.canView) {
            AppSettings.mainElements.PAGE_CONTENT.addClass("d-none");
            AppSettings.mainElements.NOT_FOUND.removeClass("d-none");
        }
        else
        PaymentTransactionPage.init();
    });
})();
