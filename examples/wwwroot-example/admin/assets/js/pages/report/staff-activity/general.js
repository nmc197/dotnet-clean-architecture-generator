"use strict";

(function () {
    // Class definition
    const ReportStaffActivityPage = {
        table: null,
        formValidator: null,
        plugins: {
            dateRangePickerFilter: null
        },
        variables: {
            period: AppSettings.periodOptions.TODAY,
        },
        message: {
            pageTitle: I18n.t("report_staff_activity", "PAGE_TITLE"),
            actions: I18n.t("common", "ACTIONS"),
            create: I18n.t("common", "ADD_NEW"),
            edit: I18n.t("common", "EDIT"),
            delete: I18n.t("common", "DELETE"),
            confirmTitle: I18n.t("common", "CONFIRM_TITLE"),
            successTitle: I18n.t("common", "SUCCESS_TITLE"),
            errorTitle: I18n.t("common", "ERROR_TITLE"),
            failTitle: I18n.t("common", "FAIL_TITLE"),
            warningTitle: I18n.t("common", "WARNING_TITLE"),
            createConfirm: I18n.t("common", "CREATE_CONFIRM", { name: I18n.t("report_staff_activity", "PAGE_TITLE").toLocaleLowerCase() }),
            createSuccess: I18n.t("common", "CREATE_SUCCESS", { name: I18n.t("report_staff_activity", "PAGE_TITLE").toLocaleLowerCase() }),
            createError: I18n.t("common", "CREATE_ERROR", { name: I18n.t("report_staff_activity", "PAGE_TITLE").toLocaleLowerCase() }),
            updateConfirm: I18n.t("common", "UPDATE_CONFIRM", { name: I18n.t("report_staff_activity", "PAGE_TITLE").toLocaleLowerCase() }),
            updateSuccess: I18n.t("common", "UPDATE_SUCCESS", { name: I18n.t("report_staff_activity", "PAGE_TITLE") }),
            updateError: I18n.t("common", "UPDATE_ERROR", { name: I18n.t("report_staff_activity", "PAGE_TITLE").toLocaleLowerCase() }),
            deleteConfirm: I18n.t("common", "DELETE_CONFIRM", { name: I18n.t("report_staff_activity", "PAGE_TITLE").toLocaleLowerCase() }),
            deleteSuccess: I18n.t("common", "DELETE_SUCCESS", { name: I18n.t("report_staff_activity", "PAGE_TITLE").toLocaleLowerCase() }),
            deleteError: I18n.t("common", "DELETE_ERROR", { name: I18n.t("report_staff_activity", "PAGE_TITLE").toLocaleLowerCase() }),
            notFound: I18n.t("common", "NOT_FOUND", { name: I18n.t("report_staff_activity", "PAGE_TITLE").toLocaleLowerCase() }),
            validationError: I18n.t("common", "VALIDATION_ERROR"),
            view: "Xem hồ sơ"
        },
        init: function () {
            this.initPlugins();
            this.loadDashboardLongTermMonth();
            this.loadRelatedData();
            this.bindEvents();
            this.bindPeriodButtons();
            this.initDataTable();
        },
        bindPeriodButtons: function () {
            const self = this;

            const buttonMap = {
                'kt_charts_widget_1_today_btn': { period: AppSettings.periodOptions.TODAY, variable: 'period', loadFn: 'loadDashboardLongTermMonth' },
                'kt_charts_widget_1_week_btn': { period: AppSettings.periodOptions.WEEK, variable: 'period', loadFn: 'loadDashboardLongTermMonth' },
                'kt_charts_widget_1_month_btn': { period: AppSettings.periodOptions.MONTH, variable: 'period', loadFn: 'loadDashboardLongTermMonth' },
                'kt_charts_widget_1_year_btn': { period: AppSettings.periodOptions.YEAR, variable: 'period', loadFn: 'loadDashboardLongTermMonth' }
            };

            $(document).on('click', Object.keys(buttonMap).map(id => `#${id}`).join(','), async function (e) {
                e.preventDefault();

                const config = buttonMap[this.id];
                if (!config) return;

                self.setActiveButton(this);
                self.variables[config.variable] = config.period;
                await self[config.loadFn]();
            });
        },
        loadDashboardLongTermMonth: async function () {
            try {
                const response = await httpService.getAsync(ApiRoutes.Dashboard.v1.DashboardLongTermMonth(this.variables.period));

                if (response.isSucceeded && response.resources) {
                    this.updateStatisticsCards(response.resources);
                }
            } catch (error) {
                console.error(error);
            }
        },
        setActiveButton: function (activeBtn) {
            let selector = '[data-kt-buttons="true"] .btn';


            document.querySelectorAll(selector).forEach(btn => {
                btn.classList.remove('active');
            });

            activeBtn.classList.add('active');
        },
        updateStatisticsCards: function (data) {
            try {
                const contractsValue = data.contracts?.data?.[0] || 0;
                this.updateCountUpCard('contracts_count', contractsValue, false);

                const notarizationFeeValue = data.notarizationFee?.data?.[0] || 0;
                this.updateCountUpCard('notarization_fee', notarizationFeeValue);

                const serviceFeeValue = data.serviceFee?.data?.[0] || 0;
                this.updateCountUpCard('service_fee', serviceFeeValue);

                const otherFeeValue = data.otherFee?.data?.[0] || 0;
                this.updateCountUpCard('other_fee', otherFeeValue);

                // Trigger countup animation
                setTimeout(() => {
                    this.reinitializeCountUp();
                }, 100);
            } catch (error) {
                console.error(error);
            }
        },
         updateCountUpCard: function (elementId, value) {
            const element = $(`#${elementId}`);
            if (element.length) {
                element.attr('data-kt-countup-value', value);
                element.attr('data-kt-countup-currency');


                    element.text(AppUtils.numberWithCommas(value));
            } else {
                console.warn();
            }
        },
        reinitializeCountUp: function () {
            document.querySelectorAll('[data-kt-countup="true"]').forEach(element => {
                const targetValue = parseInt(element.getAttribute('data-kt-countup-value')) || 0;

                this.animateCountUp(element, targetValue);
            });
        },
        animateCountUp: function (element, targetValue) {
            const duration = 2000;
            const startTime = Date.now();
            const startValue = 0;

            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);

                const easeOutQuart = 1 - Math.pow(1 - progress, 4);
                const currentValue = Math.floor(startValue + (targetValue - startValue) * easeOutQuart);

                    element.textContent = AppUtils.numberWithCommas(currentValue);

                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
            };
            animate();
        },
        initDataTable: function () {
            this.table = $("#report_staff_activity_datatable").DataTable({
                processing: true,
                serverSide: true,
                paging: true,
                searching: { regex: true },
                order: [8, 'desc'],
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
                            const tableSettings = ReportStaffActivityPage.table.settings()[0];
                            tableSettings.ajax.headers.Authorization = "Bearer " + TokenService.getAccessToken();

                            //Reload lại datatable với token mới
                            ReportStaffActivityPage.table.ajax.reload();
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
                        d.viewOwnDataOnly = true;
                        d.minTransactionValue = $("#filter_min_notarizationNumber").val();
                        d.maxTransactionValue = $("#filter_max_notarizationNumber").val();
                        return JSON.stringify(d);
                    }

                },
                columns: [
                    {
                        data: 'id',
                        render: function (data, type, row, meta) {
                            const info = ReportStaffActivityPage.table.page.info();
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
                    }
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
                    $('#report_staff_activity _datatable tfoot').html("");
                    $("#report_staff_activity_datatable thead tr").clone(true).appendTo("#report_staff_activity_datatable tfoot");
                    $('#report_staff_activity_datatable tfoot tr').addClass("border-top");
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
                dropdownParent: "#report_staff_activity_filter",
                placeholder: "Chọn trạng thái",
            });
            $("#filter_documentTypeId").select2({
                language: currentLang,
                dropdownParent: "#report_staff_activity_filter",
                placeholder: "Chọn loại hợp đồng",
            });
            $("#filter_notarizationRequestTypeId").select2({
                language: currentLang,
                dropdownParent: "#report_staff_activity_filter",
                placeholder: "Chọn tài sản là đối tượng của hợp đồng giao dịch",
            });
            AppUtils.createSelect2("#filter_requesterId", {
                url: ApiRoutes.User.v1.Search,
                allowClear: true,
                cache: true,
                placeholder: 'Chọn người yêu cầu',
                select2Options: {
                    dropdownParent: "#report_staff_activity_filter",
                    closeOnSelect: false,
                }
            });
            //END: SELECT2
            AppUtils.formatNumberCurency();
        },
        regenDataTable: function () {
            if (this.table) {
                this.table.destroy();
                $("#report_staff_activity_datatable tbody").html("");
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
        },
        bindEditEvent: function () {
            $("#report_staff_activity_datatable tbody").on("click", ".btn-edit", function () {
                const id = $(this).attr("data-notarization-request-id");
                editItem(id);
            });
        },
        bindDeleteEvent: function () {
            $("#report_staff_activity_datatable tbody").on("click", ".btn-delete", function () {
                const id = $(this).attr("data-notarization-request-id");
                deleteItem(id);
            });
        },
        bindViewEvent: function () {
            $("#report_staff_activity_datatable tbody").on("click", ".btn-view", function () {
                const id = $(this).attr("data-notarization-request-id");
                let url = `/notarization-request/view/${id}`
                window.open(url, '_blank');
            });
        },
        bindSearchAllEvents: function () {
            $("#report_staff_activity_datatable_search").on("keyup", AppUtils.debounce(function () {
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
            $("#btn_add_report_staff_activity").on("click", function () {
                addItem();
            })
        },
        bindClearFilterDateRangeEvent: function () {
            $("#clear_filter_created_date i").on("click", function () {
                ReportStaffActivityPage.plugins.dateRangePickerFilter.clear();
            })
            $("#clear_filter_created_date").on("click", function () {
                ReportStaffActivityPage.plugins.dateRangePickerFilter.clear();
            })
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
        window.open(`/notarization-request/detail/${id}`);
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
            title: ReportStaffActivityPage.message.confirmTittle,
            html: ReportStaffActivityPage.message.deleteConfirm,
            ...AppSettings.sweetAlertOptions(true)
        });

        if (!isConfirmed)
            return;

        $("#global_loader").addClass("show");
        try {
            const response = await httpService.deleteAsync(ApiRoutes.NotarizationRequest.v1.Delete(id));
            if (response?.isSucceeded) {
                /*tableSearch();*/
                ReportStaffActivityPage.refreshDataTable();
                Swal.fire({
                    icon: "success",
                    title: ReportStaffActivityPage.message.successTitle,
                    html: ReportStaffActivityPage.message.deleteSuccess,
                    ...AppSettings.sweetAlertOptions(false)
                })
            }
        } catch (e) {
            console.error(e);
            Swal.fire({
                icon: "error",
                title: ReportStaffActivityPage.message.failTitle,
                html: ReportStaffActivityPage.message.deleteError,
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
        ReportStaffActivityPage.table.column(1).search($("#filter_notarizationNumber").val().trim());
        ReportStaffActivityPage.table.column(2).search($("#filter_notarization_date").val());
        ReportStaffActivityPage.table.search($("#report_staff_activity_datatable_search").val().trim()).draw();
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
        ReportStaffActivityPage.plugins.dateRangePickerFilter.clear();
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
    // On document ready
    KTUtil.onDOMContentLoaded(async function () {
        await AppEntry.init();
        ReportStaffActivityPage.init();
    });
})();