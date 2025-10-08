"use strict";

(function () {
    // Class definition
    const BraceletPage = {
        table: null,
        formValidator: null,
        plugins: {
            dateRangePickerFilter: null
        },
        permissionFlags: AppUtils.getPermissionFlags(),
        message: {
            pageTitle: I18n.t("bracelet", "PAGE_TITLE"),
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
            createConfirm: I18n.t("common", "CREATE_CONFIRM", { name: I18n.t("bracelet", "PAGE_TITLE").toLocaleLowerCase() }),
            createSuccess: I18n.t("common", "CREATE_SUCCESS", { name: I18n.t("bracelet", "PAGE_TITLE").toLocaleLowerCase() }),
            createError: I18n.t("common", "CREATE_ERROR", { name: I18n.t("bracelet", "PAGE_TITLE").toLocaleLowerCase() }),
            updateConfirm: I18n.t("common", "UPDATE_CONFIRM", { name: I18n.t("bracelet", "PAGE_TITLE").toLocaleLowerCase() }),
            updateSuccess: I18n.t("common", "UPDATE_SUCCESS", { name: I18n.t("bracelet", "PAGE_TITLE") }),
            updateError: I18n.t("common", "UPDATE_ERROR", { name: I18n.t("bracelet", "PAGE_TITLE").toLocaleLowerCase() }),
            deleteConfirm: I18n.t("common", "DELETE_CONFIRM", { name: I18n.t("bracelet", "PAGE_TITLE").toLocaleLowerCase() }),
            deleteSuccess: I18n.t("common", "DELETE_SUCCESS", { name: I18n.t("bracelet", "PAGE_TITLE").toLocaleLowerCase() }),
            deleteError: I18n.t("common", "DELETE_ERROR", { name: I18n.t("bracelet", "PAGE_TITLE").toLocaleLowerCase() }),
            notFound: I18n.t("common", "NOT_FOUND", { name: I18n.t("bracelet", "PAGE_TITLE").toLocaleLowerCase() }),
            validationError: I18n.t("common", "VALIDATION_ERROR")
        },
        init: function () {
            this.checkPermissions();
            this.initPlugins();
            this.initDataTable();
            this.loadRelatedData();
            this.bindEvents();
            this.formValidator = new FormValidator({
                formSelector: "#kt_modal_bracelet_form",
                handleSubmit: saveData,
                rules: [
                ]
            });
        },
        initDataTable: function () {
            this.table = $("#bracelet_datatable").DataTable({
                processing: true,
                serverSide: true,
                paging: true,
                searching: { regex: true },
                order: [7, 'desc'],
                language: AppSettings.dataTableLanguage.vi,
                ajax: {
                    url: ApiRoutes.Bracelet.v1.PagedAdvanced,
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
                            const tableSettings = BraceletPage.table.settings()[0];
                            tableSettings.ajax.headers.Authorization = "Bearer " + TokenService.getAccessToken();

                            //Reload lại datatable với token mới
                            BraceletPage.table.ajax.reload();
                        }
                    },
                    dataSrc: {
                        data: 'resources.data',
                        draw: 'resources.draw',
                        recordsTotal: 'resources.recordsTotal',
                        recordsFiltered: 'resources.recordsFiltered'
                    },
                    data: function (d) {
                        d.braceletStatusIds = $("#filter_braceletStatusId").val();
                        d.braceletCategoryIds = $("#filter_braceletCategoryId").val();
                        d.braceletTypeIds = $("#filter_braceletTypeId").val();
                        d.startPrice = $("#filter_start_price").val().replace(/\./g, '').replace(/[^0-9\-]/g, '') || "";
                        d.endPrice = $("#filter_end_price").val().replace(/\./g, '').replace(/[^0-9\-]/g, '') || "";
                        return JSON.stringify(d);
                    }
                },
                columns: [
                    {
                        data: 'id',
                        render: function (data, type, row, meta) {
                            const info = BraceletPage.table.page.info();
                            const index = meta.row + 1 + info.page * info.length;
                            return index; // This contains the row index
                        }
                    },
                    {
                        data: "name",
                        render: function (data, type, row, meta) {
                            return `<div class="d-flex align-items-center">
                                        <!--begin::Thumbnail-->
                                        <a href="javascript:void(0)" class="symbol symbol-50px">
                                            <span class="symbol-label" style="background-image:url(${row.braceletImageUrl || AppSettings.imageDefault});"></span>
                                        </a>
                                        <!--end::Thumbnail-->

                                        <div class="ms-5">
                                            <!--begin::Title-->
                                            <a href="javascript:void(0)" class="text-gray-800 text-hover-primary fs-5 fw-bold" data-kt-ecommerce-product-filter="product_name">${row.name}</a>
                                            <div>${row.code}</div>
                                            <!--end::Title-->
                                        </div>
                                    </div>`;
                        },
                    },
                    {
                        data: "price",
                        render: function (data, type, row, meta) {
                            return `<span data-bracelet-id='${row.id}'>${AppUtils.numberWithCommas(row.price)}<span>`;
                        },
                    },
                    {
                        data: "description",
                        render: function (data, type, row, meta) {
                            return `<span data-bracelet-id='${row.id}'>${row.description}<span>`;
                        },
                    },
                    {
                        data: "braceletCategoryId",
                        render: function (data, type, row, meta) {
                            return `<span data-bracelet-id='${row.id}' style="font-weight: 600;">${row.braceletCategoryName}<span>`;
                        },
                    },
                    {
                        data: "braceletTypeId",
                        render: function (data, type, row, meta) {
                            return `<span data-bracelet-id='${row.id}' style="background-color: ${AppUtils.customBagdeColor(row.braceletTypeColor)}; color: ${row.braceletTypeColor}; padding: 5px 8px; border-radius: 8px; display: inline-block; font-weight: 600;">${row.braceletTypeName}<span>`;
                        },
                    },
                    {
                        data: "braceletStatusId",
                        render: function (data, type, row, meta) {
                            return `<span data-bracelet-id='${row.id}' style="background-color: ${AppUtils.customBagdeColor(row.braceletStatusColor)}; color: ${row.braceletStatusColor}; padding: 5px 8px; border-radius: 8px; display: inline-block; font-weight: 600;">${row.braceletStatusName}<span>`;
                        },
                    },
                   
                    {
                        data: "createdDate",
                        render: function (data, type, row, meta) {
                            const displayValue = moment(data).format("DD/MM/YYYY HH:mm:ss");
                            return `<span data-bracelet-id='${row.id}'>${displayValue}<span>`;
                        }
                    },
                    {
                        data: 'id',
                        className: 'text-end',
                        render: function (data, type, row, meta) {
                            return `<a href="#" class="btn btn-light btn-active-light-primary btn-flex btn-center btn-sm" data-kt-menu-trigger="click" data-kt-menu-placement="bottom-end" data-kt-menu-flip="top-end">
                                                ${BraceletPage.message.actions}
                                                <i class="ki-duotone ki-down fs-5 ms-1"></i>
                                    </a>
                                    <div class="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg-light-primary fw-semibold fs-7 w-125px py-4" data-kt-menu="true">
                                        <div class="menu-item px-3">
                                            <a href="#" class="menu-link px-3 btn-edit" data-kt-docs-table-filter="edit_row" data-bracelet-id="${data}">
                                                ${BraceletPage.permissionFlags.canUpdate ? BraceletPage.message.edit : BraceletPage.message.detail}
                                            </a>
                                        </div>
                                        <div class="menu-item px-3">
                                            <a href="#" class="menu-link px-3 text-danger btn-delete ${!BraceletPage.permissionFlags.canDelete ? "d-none" : ""}" data-kt-users-table-filter="delete_row" data-bracelet-id="${data}">
                                                ${BraceletPage.message.delete}
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
                    $('#bracelet_datatable tfoot').html("");
                    $("#bracelet_datatable thead tr").clone(true).appendTo("#bracelet_datatable tfoot");
                    $('#bracelet_datatable tfoot tr').addClass("border-top");
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
            //BEGIN: SELECT2
            $("#filter_braceletStatusId").select2({
                language: currentLang,
                placeholder: 'Chọn trạng thái',
                dropdownParent: "#bracelet_filter",
            });
            $("#filter_braceletCategoryId").select2({
                language: currentLang,
                placeholder: 'Chọn trạng thái',
                dropdownParent: "#bracelet_filter",
            });
         
            $("#filter_braceletTypeId").select2({
                language: currentLang,
                placeholder: 'Chọn loại',
                dropdownParent: "#bracelet_filter",
            });
            //END: SELECT2


        },
        checkPermissions: function () {
            if (!BraceletPage.permissionFlags.canCreate)
                $("#btn_add_bracelet").addClass("d-none");
        },
        regenDataTable: function () {
            if (this.table) {
                this.table.destroy();
                $("#bracelet_datatable tbody").html("");
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
            $("#bracelet_datatable tbody").on("click", ".btn-edit", function () {
                const id = $(this).attr("data-bracelet-id");
                editItem(id);
            });
        },
        bindDeleteEvent: function () {
            $("#bracelet_datatable tbody").on("click", ".btn-delete", function () {
                const id = $(this).attr("data-bracelet-id");
                deleteItem(id);
            });
        },
        bindSearchAllEvents: function () {
            $("#bracelet_datatable_search").on("keyup", AppUtils.debounce(function () {
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
            $("#btn_add_bracelet").on("click", function () {
                addItem();
            })
        },
        bindSaveEvent: function () {
            //$("#btn_save_bracelet").on("click", function (e) {
            //    e.preventDefault();
            //    saveData();
            //})
        },
        bindClearFilterDateRangeEvent: function () {
            $("#clear_filter_created_date i").on("click", function () {
                BraceletPage.plugins.dateRangePickerFilter.clear();
            })
            $("#clear_filter_created_date").on("click", function () {
                BraceletPage.plugins.dateRangePickerFilter.clear();
            })
        },
        loadRelatedData: async function () {
            await loadDataBraceletStatus();
            await loadDataBraceletCategory();
            await loadDataBraceletType();
            //await loadDataAuthor();
        },
        bindToggleFilterEvent: function () {
            $("#btn_bracelet_filter").on("click", function () {
                $("#bracelet_filter").slideToggle();
            })
        }
    }

    /**
     * Handle add new blog post 
     */
    function addItem() {
        window.open("/bracelet/detail/0");
    }

    /**
     * Author: 
     * CreatedDate: 
     * Description: Edit blog post  by id
     * @param {number} id
     */
    async function editItem(id) {
        window.open(`/bracelet/detail/${id}`);
    }

    /**
     * Author:
     * CreatedDate:
     * Description: Delete blog post  by id
     * @param {number} id
     */
    async function deleteItem(id) {
        if (!BraceletPage.permissionFlags.canDelete) {
            Swal.fire({
                icon: "warning",
                title: BraceletPage.message.warningTitle,
                html: BraceletPage.message.forbidden,
                ...AppSettings.sweetAlertOptions(false)
            });
            return;
        }
        const { isConfirmed } = await Swal.fire({
            icon: "question",
            title: BraceletPage.message.confirmTittle,
            html: BraceletPage.message.deleteConfirm,
            ...AppSettings.sweetAlertOptions(true)
        });

        if (!isConfirmed)
            return;

        $("#global_loader").addClass("show");
        try {
            const response = await httpService.deleteAsync(ApiRoutes.Bracelet.v1.Delete(id));
            if (response?.isSucceeded) {
                tableSearch();
                Swal.fire({
                    icon: "success",
                    title: BraceletPage.message.successTitle,
                    html: BraceletPage.message.deleteSuccess,
                    ...AppSettings.sweetAlertOptions(false)
                })
            }
        } catch (e) {
            console.error(e);
            Swal.fire({
                icon: "error",
                title: BraceletPage.message.failTitle,
                html: BraceletPage.message.deleteError,
                ...AppSettings.sweetAlertOptions(false)
            })
        }
        finally {
            $("#global_loader").removeClass("show");
        }
    }

    /**
     * Save data (Create or Update) blog post 
     */
    async function saveData() {

    }

    /**
     * Search data table
     */
    function tableSearch() {
        BraceletPage.table.column(1).search($("#filter_name").val().trim());
        BraceletPage.table.column(3).search($("#filter_description").val().trim());
        BraceletPage.table.column(7).search($("#filter_created_date").val());
        BraceletPage.table.search($("#bracelet_datatable_search").val().trim()).draw();
    }

    /**
     * Reset filter
     */
    function resetFilter() {
        $("#filter_braceletCategoryId").val("").trigger("change");
        $("#filter_braceletTypeId").val("").trigger("change");
        $("#filter_braceletStatusId").val("").trigger("change");
        $("#filter_description").val("");
        $("#filter_name").val("");
        $("#filter_start_price").val("");
        $("#filter_end_price").val("");

        BraceletPage.plugins.dateRangePickerFilter.clear();
        tableSearch();
    }

    /**
    * Load data BraceletStatus
    */
    async function loadDataBraceletStatus() {
        try {
            const response = await httpService.getAsync(ApiRoutes.BraceletStatus.v1.List);
            const data = response.resources;
            data.forEach(function (item) {
                $("#filter_braceletStatusId").append(new Option(item.name, item.id, false, false));
            });
        } catch (e) {
            console.error(e);
        }
    }

    /**
   * Load data BraceletType
   */
    async function loadDataBraceletType() {
        try {
            const response = await httpService.getAsync(ApiRoutes.BraceletType.v1.List);
            const data = response.resources;
            data.forEach(function (item) {
                $("#filter_braceletTypeId").append(new Option(item.name, item.id, false, false));
            });
        } catch (e) {
            console.error(e);
        }
    }

    /**
    * Load data BraceletCategory
    */
    async function loadDataBraceletCategory() {
        try {
            const response = await httpService.getAsync(ApiRoutes.BraceletCategory.v1.List);
            const data = response.resources;
            data.forEach(function (item) {
                $("#filter_braceletCategoryId").append(new Option(item.name, item.id, false, false));
            });
        } catch (e) {
            console.error(e);
        }
    }

    // On document ready
    KTUtil.onDOMContentLoaded(async function () {
        await AppEntry.init();
        if (!BraceletPage.permissionFlags.canView) {
            AppSettings.mainElements.PAGE_CONTENT.addClass("d-none");
            AppSettings.mainElements.NOT_FOUND.removeClass("d-none");
        }
        else
            BraceletPage.init();
    });
})();