"use strict";

(function () {
    // Class definition
    const OrderDetailPage = {
        table: null,
        formValidator: null,
        plugins: {
            dateRangePickerFilter: null
        },
        variables: {
            id: AppUtils.getPathSegment(2) || 0,
            dataDetail: null,
        },
        message: {
            pageTitle: I18n.t("order_detail", "PAGE_TITLE"),
            actions: I18n.t("common", "ACTIONS"),
            create: I18n.t("common", "ADD_NEW"),
            edit: I18n.t("common", "EDIT"),
            delete: I18n.t("common", "DELETE"),
            detail: I18n.t("common", "DETAIL"),
            forbidden: I18n.t("common", "FORBIDDEN"),
            confirmTittle: I18n.t("common", "CONFIRM_TITLE"),
            successTitle: I18n.t("common", "SUCCESS_TITLE"),
            errorTitle: I18n.t("common", "ERROR_TITLE"),
            failTitle: I18n.t("common", "FAIL_TITLE"),
            warningTitle: I18n.t("common", "WARNING_TITLE"),
            createConfirm: I18n.t("common", "CREATE_CONFIRM", { name: I18n.t("order_detail", "PAGE_TITLE").toLocaleLowerCase() }),
            createSuccess: I18n.t("common", "CREATE_SUCCESS", { name: I18n.t("order_detail", "PAGE_TITLE").toLocaleLowerCase() }),
            createError: I18n.t("common", "CREATE_ERROR", { name: I18n.t("order_detail", "PAGE_TITLE").toLocaleLowerCase() }),
            updateConfirm: I18n.t("common", "UPDATE_CONFIRM", { name: I18n.t("order_detail", "PAGE_TITLE").toLocaleLowerCase() }),
            updateSuccess: I18n.t("common", "UPDATE_SUCCESS", { name: I18n.t("order_detail", "PAGE_TITLE") }),
            updateError: I18n.t("common", "UPDATE_ERROR", { name: I18n.t("order_detail", "PAGE_TITLE").toLocaleLowerCase() }),
            deleteConfirm: I18n.t("common", "DELETE_CONFIRM", { name: I18n.t("order_detail", "PAGE_TITLE").toLocaleLowerCase() }),
            deleteSuccess: I18n.t("common", "DELETE_SUCCESS", { name: I18n.t("order_detail", "PAGE_TITLE").toLocaleLowerCase() }),
            deleteError: I18n.t("common", "DELETE_ERROR", { name: I18n.t("order_detail", "PAGE_TITLE").toLocaleLowerCase() }),
            notFound: I18n.t("common", "NOT_FOUND", { name: I18n.t("order_detail", "PAGE_TITLE").toLocaleLowerCase() }),
            validationError: I18n.t("common", "VALIDATION_ERROR")
        },
        init: async function () {
            this.initPlugins();
            this.bindEvents();
            await this.loadRelatedData();
            await this.initDataTable();
            this.formValidator = new FormValidator({
                formSelector: "#kt_modal_order_detail_form",
                handleSubmit: saveData,
                rules: []
            });
        },
        initDataTable: function () {
            this.table = $("#order_detail_datatable").DataTable({
                processing: true,
                serverSide: true,
                paging: true,
                searching: { regex: true },
                order: [0, 'desc'],
                language: AppSettings.dataTableLanguage.vi,
                ajax: {
                    url: ApiRoutes.Order.v1.OrderItemPagedAdvanced,
                    type: "POST",
                    contentType: "application/json",
                    dataType: "json",
                    headers: {
                        'Authorization': 'Bearer ' + TokenService.getAccessToken()
                    },
                    error: async function (xhr) {
                        if (xhr.status === 401) {
                            await TokenService.refreshToken();
                            const tableSettings = OrderDetailPage.table.settings()[0];
                            tableSettings.ajax.headers.Authorization = "Bearer " + TokenService.getAccessToken();
                            OrderDetailPage.table.ajax.reload();
                        }
                    },
                    dataSrc: {
                        data: 'resources.data',
                        draw: 'resources.draw',
                        recordsTotal: 'resources.recordsTotal',
                        recordsFiltered: 'resources.recordsFiltered'
                    },
                    data: function (d) {
                        d.orderId = OrderDetailPage.variables.id;
                        return JSON.stringify(d);
                    }
                },
                columns: [
                    {
                        data: 'id',
                        render: function (data, type, row, meta) {
                            const info = OrderDetailPage.table.page.info();
                            return meta.row + 1 + info.page * info.length;
                        }
                    },
                    {
                        data: "braceletName",
                        render: function (data, type, row) {
                            return `
                                <div class="d-flex align-items-center">
                                    <a href="javascript:void(0)" class="symbol symbol-50px">
                                        <span class="symbol-label" style="background-image:url(${row.braceletImageUrl || AppSettings.imageDefault});"></span>
                                    </a>
                                    <div class="ms-5">
                                        <a href="javascript:void(0)" class="text-gray-800 text-hover-primary fs-5 fw-bold">${row.braceletName}</a>
                                        <div class="text-muted">${row.braceletCode}</div>
                                    </div>
                                </div>`;
                        },
                    },
                    {
                        data: "braceletCategoryName",
                        className: "text-center"
                    },
                    {
                        data: "braceletTypeName",
                        className: "text-center",
                        render: function (data, type, row) {
                            return `<span style="background-color:${AppUtils.customBagdeColor(row.braceletTypeColor)};color:${row.braceletTypeColor};padding:5px 8px;border-radius:8px;display:inline-block;font-weight:600;">${row.braceletTypeName}</span>`;
                        },
                    },
                    { data: "quantity", className: "text-center" },
                    {
                        data: "braceletPrice",
                        className: "text-end fw-bold",
                        render: function (d) { return AppUtils.numberWithCommas(d); }
                    },
                    {
                        data: "totalBraceletPrice",
                        className: "text-end fw-bold",
                        render: function (d) { return AppUtils.numberWithCommas(d); }
                    },
                    {
                        data: "id",
                        className: "text-center",
                        render: function (data, type, row) {
                            return `<a href="javascript:;" class="btn btn-sm btn-light btn-active-light-primary toggle-subtable" data-id="${row.braceletId}" data-name="${row.braceletName}">Xem charms</a>`;
                        }
                    },
                ],
                columnDefs: [
                    { targets: "no-sort", orderable: false },
                    { targets: "no-search", searchable: false },
                    { orderable: false, targets: [-1, 0] },
                ],
                aLengthMenu: [[10, 25, 50, 100], [10, 25, 50, 100]],
                drawCallback: function () {
                    $('#order_detail_datatable tfoot').html("");
                    $("#order_detail_datatable thead tr").clone(true).appendTo("#order_detail_datatable tfoot");
                    $('#order_detail_datatable tfoot tr').addClass("border-top");
                }
            });

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
            $("#filter_order_detailStatusId").select2({ language: currentLang, placeholder: 'Chọn trạng thái', dropdownParent: "#order_detail_filter" });
            $("#filter_order_detailCategoryId").select2({ language: currentLang, placeholder: 'Chọn trạng thái', dropdownParent: "#order_detail_filter" });
            $("#filter_order_detailTypeId").select2({ language: currentLang, placeholder: 'Chọn loại', dropdownParent: "#order_detail_filter" });
        },
        regenDataTable: function () {
            if (this.table) {
                this.table.destroy();
                $("#order_detail_datatable tbody").html("");
                this.initDataTable();
            }
        },
        bindEvents: function () {
            this.bindSearchAllEvents();
            this.bindFilterEvents();
            this.bindClearFilterDateRangeEvent();
            this.bindToggleFilterEvent();
            this.bindToggleViewCharmsEvent();
        },
        bindSearchAllEvents: function () {
            $("#order_detail_datatable_search").on("keyup", AppUtils.debounce(function () {
                tableSearch();
            }, 300))
        },
        bindFilterEvents: function () {
            $("#btn_reset_filter").on("click", function () { resetFilter(); })
            $("#btn_apply_filter").on("click", function () { tableSearch(); })
        },
        bindClearFilterDateRangeEvent: function () {
            $("#clear_filter_created_date i, #clear_filter_created_date").on("click", function () {
                OrderDetailPage.plugins.dateRangePickerFilter.clear();
            })
        },
        loadRelatedData: async function () {
            OrderDetailPage.variables.dataDetail = await loadDataDetail();
        },
        bindToggleFilterEvent: function () {
            $("#btn_order_detail_filter").on("click", function () {
                $("#order_detail_filter").slideToggle();
            })
        },
        bindToggleViewCharmsEvent: function () {
            $('#order_detail_datatable').on('click', '.toggle-subtable', async function () {
                const braceletId = $(this).data('id');
                const braceletName = $(this).data('name');
                const $row = $(this).closest('tr');

                if ($row.hasClass('subtable-open')) {
                    $row.next('.subtable').remove();
                    $row.removeClass('subtable-open');
                    return;
                }

                const response = await httpService.getAsync(ApiRoutes.Order.v1.OrderItemCharm(OrderDetailPage.variables.id, braceletId));
                let charms = [];
                if (response.isSucceeded) charms = response.resources;
                const totalCharmPrice = charms.reduce((sum, c) => sum + (c.totalPrice || 0), 0);
                const html = `
                    <tr class="subtable">
                        <td></td>
                        <td colspan="6">
                            <div class="pt-5 pb-5 px-5">
                                <div class="d-flex justify-content-between align-items-center mb-3">
                                    <div class="fw-bold">Danh sách Charm (${braceletName})</div>
                                    <div class="fw-bold text-danger">Tổng tiền charm: ${AppUtils.numberWithCommas(totalCharmPrice)}</div>
                                </div>
                                <div class="table-responsive">
                                    <table class="table align-middle gs-0 gy-3 table-row-dashed dataTable">
                                        <thead>
                                            <tr class="fw-bold text-muted">
                                                <th class="w-50px">#</th>
                                                <th>Tên charm</th>
                                                <th class="text-center">Vị trí</th>
                                                <th class="text-center">Chất liệu</th>
                                                <th class="text-center">SL</th>
                                                <th class="text-end">Đơn giá</th>
                                                <th class="text-end">Thành tiền</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${charms.length ? charms.map((c, i) => `
                                                <tr>
                                                    <td>${i + 1}</td>
                                                    <td>
                                                        <div class="d-flex align-items-center">
                                                            <div class="symbol symbol-50px me-3">
                                                                <img src="${c.charmImageUrl}" alt="">
                                                            </div>
                                                            <div>
                                                                <div class="fw-bold">${c.charmName}</div>
                                                                <div class="text-muted">${c.charmCode}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td class="text-center">${c.position || "-"}</td>
                                                    <td class="text-center">
                                                        <span style="background-color:${AppUtils.customBagdeColor(c.charmTypeColor)};color:${c.charmTypeColor};padding:5px 8px;border-radius:8px;display:inline-block;font-weight:600;">${c.charmTypeName}</span>
                                                    </td>
                                                    <td class="text-center">${c.quantity}</td>
                                                    <td class="text-end fw-bold">${AppUtils.numberWithCommas(c.price)}</td>
                                                    <td class="text-end fw-bold">${AppUtils.numberWithCommas(c.totalPrice)}</td>
                                                </tr>
                                            `).join("") : `<tr><td colspan="7"><em>Không có charm nào.</em></td></tr>`}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </td>
                    </tr>`;

                $row.after(html);
                $row.addClass('subtable-open');
            });
        }
    }

    async function saveData() { }

    function tableSearch() {
        OrderDetailPage.table.column(1).search($("#filter_name").val().trim());
        OrderDetailPage.table.column(3).search($("#filter_description").val().trim());
        OrderDetailPage.table.column(7).search($("#filter_created_date").val());
        OrderDetailPage.table.search($("#order_detail_datatable_search").val().trim()).draw();
    }

    function resetFilter() {
        $("#filter_order_detailCategoryId, #filter_order_detailTypeId, #filter_order_detailStatusId").val("").trigger("change");
        $("#filter_description, #filter_name, #filter_start_price, #filter_end_price").val("");
        OrderDetailPage.plugins.dateRangePickerFilter.clear();
        tableSearch();
    }

    async function loadDataDetail() {
        let result = null;
        try {
            const response = await httpService.getAsync(ApiRoutes.Order.v1.Detail(OrderDetailPage.variables.id));
            const data = response.resources;
            result = data;
            Object.keys(data).forEach(key => {
                const selector = `#order_detail_${key}`;
                const value = key.toLowerCase().includes("date") ? moment(data[key].toString()).format("DD/MM/YYYY HH:mm:ss") : data[key];
                $(selector).text(value).trigger("change");
            });
            if (data.orderStatus) {
                $("#order_detail_orderStatusName").text(data.orderStatus.name || "").attr("style", `background-color:${AppUtils.customBagdeColor(data.orderStatus.description)};color:${data.orderStatus.description};padding:5px 8px;border-radius:8px;display:inline-block;font-weight:600;`);
            }
            if (data.finalAmount) {
                $("#order_detail_finalAmount").text(AppUtils.numberWithCommas(data.finalAmount));
            }
        } catch (e) {
            AppSettings.mainElements.PAGE_CONTENT.addClass("d-none");
            AppSettings.mainElements.NOT_FOUND.removeClass("d-none");
        }
        return result;
    }

    KTUtil.onDOMContentLoaded(async function () {
        await AppEntry.init();
        OrderDetailPage.init();
    });
})();
