"use strict";

(function () {
    const reportCustomerInfo = {
        table: null,
        init: function () {
            this.bindEvents();
            this.initPlugins();
            this.loadRelatedData();
            this.initDataTable();
        },

        bindEvents: function () {
            $("#btn_apply_filter").on("click", function () {
                tableSearch();
            });
            $("#btn_reset_filter").on("click", function () {
                resetFilter();
            });
            $("#report_customer_datatable_search").on("keypress", function (e) {
                if (e.which === 13) {
                    e.preventDefault();
                    tableSearch();
                }
            });

        },
        initDataTable: function () {
            this.table = $("#report_customer_datatable").DataTable({
                processing: true,
                serverSide: true,
                paging: true,
                searching: { regex: true },
                order: [6, 'desc'],
                language: AppSettings.dataTableLanguage.vi,
                ajax: {
                    url: ApiRoutes.User.v1.ReportCustomerInfo,
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
                            const tableSettings = reportCustomerInfo.table.settings()[0];
                            tableSettings.ajax.headers.Authorization = "Bearer " + TokenService.getAccessToken();

                            //Reload lại datatable với token mới
                            reportCustomerInfo.table.ajax.reload();
                        }
                    },
                    dataSrc: {
                        data: 'resources.data',
                        draw: 'resources.draw',
                        recordsTotal: 'resources.recordsTotal',
                        recordsFiltered: 'resources.recordsFiltered'
                    },
                    data: function (d) {
                        d.userStatusIds = $("#filter_userStatusId").val();
                        d.fullName = $("#filter_userInfo").val();
                        return JSON.stringify(d);
                    }

                },
                columns: [
                    {
                        data: 'id',
                        render: function (data, type, row, meta) {
                            const info = reportCustomerInfo.table.page.info();
                            const index = meta.row + 1 + info.page * info.length;
                            return index; // This contains the row index
                        }
                    },

                    {
                        data: "fullName",
                        render: function (data, type, row, meta) {
                            return `<div>
                                <div class="fw-semibold text-gray-800 text-hover-primary" data-report-customer-id='${row.requesterId}'>${AppUtils.escapeHtml(data)}</div>
                                <div class="text-muted fs-7">
                                    <span>${AppUtils.escapeHtml(row.email || '')}</span><br>
                                    <span>${AppUtils.escapeHtml(row.phoneNumber || '')}</span>
                                </div>
                            </div>`;
                        },
                    },
                    {
                        data: "requestStatusName",
                        render: function (data, type, row, meta) {

                            return `<div data-report-customer-id='${row.requesterId}' style="background-color: ${AppUtils.customBagdeColor(row.userStatusColor)}; color: ${row.userStatusColor}; padding: 5px 8px; border-radius: 8px; display: inline-block; font-weight: 600;">${AppUtils.escapeHtml(row.requestStatusName)}</div>`;
                        },
                    },
                    {
                        data: "totalFees",
                        render: function (data, type, row, meta) {
                            return data ? `<span  data-report-customer-id='${row.requesterId}'>${AppUtils.numberWithCommas(data)}</span>` : "";
                        },
                    },
                    {
                        data: "totalRemuneration",
                        render: function (data, type, row, meta) {
                            return data ? `<span  data-report-customer-id='${row.requesterId}'>${AppUtils.numberWithCommas(data)}</span>` : "";
                        },
                    },
                    {
                        data: "totalRequest",
                        className: 'text-center',
                        render: function (data, type, row, meta) {
                            return `<span data-report-customer-id='${row.requesterId}'>${AppUtils.numberWithCommas(data)}</span>`;
                        },
                    },
                    {
                        data: "createdDate",
                        render: function (data, type, row, meta) {
                            const displayValue = moment(data).format("DD/MM/YYYY HH:mm:ss");
                            return `<span data-report-customer-id='${row.requesterId}'>${displayValue}</span>`;
                        },
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
                    $('#report_customer_datatable tfoot').html("");
                    $("#report_customer_datatable thead tr").clone(true).appendTo("#report_customer_datatable tfoot");
                    $('#report_customer_datatable tfoot tr').addClass("border-top");
                }
            });

            this.table.on("draw", function () {
                KTMenu.createInstances();
            });
        },

        initPlugins: function () {
            $("#filter_userStatusId").select2({
                language: currentLang,
                dropdownParent: "#report_customer_filter",
                placeholder: "Chọn trạng thái",
            });
        },
        loadRelatedData: async function () {
            await loadDataUserStatuses();
        }
    };

    /**
   * Reset filter
   */
    function resetFilter() {
        $("#filter_userStatusId").val("").trigger("change");    
        $("#filter_userInfo").val("");
        $("#filter_total_revenue").val("");
        $("#filter_total_remuneration").val("");


        tableSearch();
    }

    /**
   * Search data table
   */
    function tableSearch() {
        reportCustomerInfo.table.column(1).search($("#filter_userInfo").val().trim());

        const totalFeeFrom = $("#filter_total_fee_from").val() ? $("#filter_total_fee_from").val().replace(/\./g, '') : "";
        const totalFeeTo = $("#filter_total_fee_to").val() ? $("#filter_total_fee_to").val().replace(/\./g, '') : "";
        reportCustomerInfo.table.column(3).search(`${totalFeeFrom}-${totalFeeTo}`);

        const totalRemunerationFrom = $("#filter_total_remuneration_from").val() ? $("#filter_total_remuneration_from").val().replace(/\./g, '') : "";
        const totalRemunerationTo = $("#filter_total_remuneration_to").val() ? $("#filter_total_remuneration_to").val().replace(/\./g, '') : "";
        reportCustomerInfo.table.column(4).search(`${totalRemunerationFrom}-${totalRemunerationTo}`);

        reportCustomerInfo.table.search($("#report_customer_datatable_search").val().trim()).draw();

        reportCustomerInfo.table.draw();
    }


    /**
 * load data notarization request statuses
 */
    async function loadDataUserStatuses() {
        try {
            const response = await httpService.getAsync(ApiRoutes.UserStatus.v1.List);
            const data = response.resources;
            data.forEach(function (item) {
                $("#filter_userStatusId").append(new Option(AppUtils.escapeHtml(item.name), item.id, false, false));
            });
        } catch (e) {
            console.error(e);
        }
    }

    KTUtil.onDOMContentLoaded(async function () {
        await AppEntry.init();
        reportCustomerInfo.init();
    });
})();