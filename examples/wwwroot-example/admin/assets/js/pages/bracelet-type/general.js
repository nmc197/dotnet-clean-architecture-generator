"use strict";

(function () {
    // Class definition
    const BraceletTypePage = {
        table: null,
        target: null,
        formValidator: null,
        plugins: {
            dateRangePickerFilter: null
        },
        permissionFlags: AppUtils.getPermissionFlags(),
        message: {
            pageTitle: I18n.t("bracelet_type", "PAGE_TITLE"),
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
            createConfirm: I18n.t("common", "CREATE_CONFIRM", { name: I18n.t("bracelet_type", "PAGE_TITLE").toLocaleLowerCase() }),
            createSuccess: I18n.t("common", "CREATE_SUCCESS", { name: I18n.t("bracelet_type", "PAGE_TITLE").toLocaleLowerCase() }),
            createError: I18n.t("common", "CREATE_ERROR", { name: I18n.t("bracelet_type", "PAGE_TITLE").toLocaleLowerCase() }),
            updateConfirm: I18n.t("common", "UPDATE_CONFIRM", { name: I18n.t("bracelet_type", "PAGE_TITLE").toLocaleLowerCase() }),
            updateSuccess: I18n.t("common", "UPDATE_SUCCESS", { name: I18n.t("bracelet_type", "PAGE_TITLE") }),
            updateError: I18n.t("common", "UPDATE_ERROR", { name: I18n.t("bracelet_type", "PAGE_TITLE").toLocaleLowerCase() }),
            deleteConfirm: I18n.t("common", "DELETE_CONFIRM", { name: I18n.t("bracelet_type", "PAGE_TITLE").toLocaleLowerCase() }),
            deleteSuccess: I18n.t("common", "DELETE_SUCCESS", { name: I18n.t("bracelet_type", "PAGE_TITLE").toLocaleLowerCase() }),
            deleteError: I18n.t("common", "DELETE_ERROR", { name: I18n.t("bracelet_type", "PAGE_TITLE").toLocaleLowerCase() }),
            notFound: I18n.t("common", "NOT_FOUND", { name: I18n.t("bracelet_type", "PAGE_TITLE").toLocaleLowerCase() }),
            validationError: I18n.t("common", "VALIDATION_ERROR")
        },
        init: function () {
            this.initPlugins();
            this.initDataTable();
            this.bindEvents();
            this.formValidator = new FormValidator({
                formSelector: "#kt_modal_bracelet_type_form",
                handleSubmit: saveData,
                rules: [
                    {
                        element: "#bracelet_type_name",
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
                        element: "#bracelet_type_description",
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
            this.table = $("#bracelet_type_datatable").DataTable({
                processing: true,
                serverSide: true,
                paging: true,
                searching: { regex: true },
                order: [4, 'desc'],
                language: AppSettings.dataTableLanguage.vi,
                ajax: {
                    url: ApiRoutes.BraceletType.v1.PagedAdvanced,
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
                            const tableSettings = BraceletTypePage.table.settings()[0];
                            tableSettings.ajax.headers.Authorization = "Bearer " + TokenService.getAccessToken();

                            //Reload lại datatable với token mới
                            BraceletTypePage.table.ajax.reload();
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
                            const info = BraceletTypePage.table.page.info();
                            const index = meta.row + 1 + info.page * info.length;
                            return index; // This contains the row index
                        }
                    },

                    {
                        data: "name",
                        render: function (data, type, row, meta) {
                            return `<div class="fw-semibold text-gray-800 text-hover-primary"  data-bracelet-type-id='${row.id}'>${AppUtils.escapeHtml(data)}</div>`;
                        },
                    },
                    {
                        data: "color",
                        render: function (data, type, row, meta) {
                            return `<span style='background:${data}' class='badge w-50px h-30px' data-bracelet-type-id='${row.id}'><span>`;
                        },
                    },
                    {
                        data: "createdDate",
                        render: function (data, type, row, meta) {
                            const displayValue = moment(data).format("DD/MM/YYYY HH:mm:ss");
                            return `<span data-bracelet-type-id='${row.id}'>${displayValue}<span>`;
                        }
                    },
                    {
                        data: 'id',
                        className: 'text-end',
                        render: function (data, type, row, meta) {
                            return `<a href="#" class="btn btn-light btn-active-light-primary btn-flex btn-center btn-sm" data-kt-menu-trigger="click" data-kt-menu-placement="bottom-end" data-kt-menu-flip="top-end">
                                                ${BraceletTypePage.message.actions}
                                                <i class="ki-duotone ki-down fs-5 ms-1"></i>
                                    </a>
                                    <div class="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg-light-primary fw-semibold fs-7 w-125px py-4" data-kt-menu="true">
                                        <div class="menu-item px-3">
                                            <a href="#" class="menu-link px-3 btn-edit" data-kt-docs-table-filter="edit_row" data-bracelet-type-id="${data}">
                                                ${BraceletTypePage.permissionFlags.canUpdate ? BraceletTypePage.message.edit : BraceletTypePage.message.detail}
                                            </a>
                                        </div>
                                        <div class="menu-item px-3 ${!BraceletTypePage.permissionFlags.canDelete ? "d-none" : ""}">
                                            <a href="#" class="menu-link px-3 text-danger btn-delete" data-kt-users-table-filter="delete_row" data-bracelet-type-id="${data}">
                                                ${BraceletTypePage.message.delete}
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
                    $('#bracelet_type_datatable tfoot').html("");
                    $("#bracelet_type_datatable thead tr").clone(true).appendTo("#bracelet_type_datatable tfoot");
                    $('#bracelet_type_datatable tfoot tr').addClass("border-top");
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
            FileManager.init({
                //acceptTypes: "image/*",
                //loadTypes: ["image"],
                isGetAll: true,
                category: "GENERAL",
                onChooseFile: (file) => {
                    if (BraceletTypePage.target === "#bracelet_typeImageId") {
                        $("#bracelet_type_descriptionPath").css("background-image", `url('${file.url}')`);
                        $(".image-input").css("background-image", `unset`);
                        $("#bracelet_type_description").val(file.url);
                    }
                    else {
                        CKEDITOR.dialog.getCurrent().getContentElement('info', 'txtUrl').setValue(file.url);
                    }
                }
            });
           
        },
        checkPermissions: function () {
            if (!BraceletTypePage.permissionFlags.canCreate)
                $("#btn_add_blog_post").addClass("d-none");
        },
        regenDataTable: function () {
            if (this.table) {
                this.table.destroy();
                $("#bracelet_type_datatable tbody").html("");
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
            this.bindChangeImageEvent();
        },
        bindEditEvent: function () {
            $("#bracelet_type_datatable tbody").on("click", ".btn-edit", function () {
                const id = $(this).attr("data-bracelet-type-id");
              
                editItem(id);
            });
        },
        bindDeleteEvent: function () {
            $("#bracelet_type_datatable tbody").on("click", ".btn-delete", function () {
                const id = $(this).attr("data-bracelet-type-id");
                deleteItem(id);
            });
        },
        bindSearchAllEvents: function () {
            $("#bracelet_type_datatable_search").on("keyup", AppUtils.debounce(function () {
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
            $("#btn_add_bracelet_type").on("click", function () {
                addItem();
            })
        },
        bindSaveEvent: function () {
            //$("#btn_save_bracelet_type").on("click", function (e) {
            //    e.preventDefault();
            //    saveData();
            //})
        },
        bindClearFilterDateRangeEvent: function () {
            $("#clear_filter_created_date i").on("click", function () {
                BraceletTypePage.plugins.dateRangePickerFilter.clear();
            })
            $("#clear_filter_created_date").on("click", function () {
                BraceletTypePage.plugins.dateRangePickerFilter.clear();
            })
        },
        bindToggleFilterEvent: function () {
            $("#btn_bracelet_type_filter").on("click", function () {
                $("#bracelet_type_filter").slideToggle();
            })
        },
        bindChangeImageEvent: function () {
            $("#bracelet_typeImageId").on("click", function (e) {
                e.preventDefault();
                FileManager.show();
                BraceletTypePage.target = "#bracelet_typeImageId";
            });
        },
    }

    /**
     * Handle add new user status
     */
    function addItem() {
        BraceletTypePage.formValidator.clearErrors();
        $("#kt_modal_bracelet_type_header h2").text(`${BraceletTypePage.message.create} ${BraceletTypePage.message.pageTitle.toLocaleLowerCase()}`);
        $("#kt_modal_bracelet_type_form input[type='text'],#kt_modal_bracelet_type_form textarea, #kt_modal_bracelet_type_form select").val("").trigger("change");
        $("#kt_modal_bracelet_type_form input[type='color']").val("#000").trigger("change");
        $("#bracelet_type_createdDate").val(moment().format("DD/MM/YYYY HH:mm:ss")).trigger("change");
        $("#btn_save_bracelet_type").removeClass("d-none");
        $("#btn_cancel_bracelet_type").text(BraceletTypePage.message.cancel);
        $("#kt_modal_bracelet_type_form input[type='text'],#kt_modal_bracelet_type_form textarea, #kt_modal_bracelet_type_form select,#kt_modal_bracelet_type_form input[type='color']").attr("disabled", false);
        $("#bracelet_type_createdDate").attr("disabled", true);
        $("#bracelet_type_descriptionPath").css("background-image", `url('${AppSettings.imageDefault}')`);
        $("#bracelet_type_description").val(null);
    }

    /**
     * Author: 
     * CreatedDate: 
     * Description: Edit user status by id
     * @param {number} id
     */
    async function editItem(id) {
        BraceletTypePage.formValidator.clearErrors();
        $("#global_loader").addClass("show");
        try {
            const response = await httpService.getAsync(ApiRoutes.BraceletType.v1.Detail(id));
            const data = response.resources;
            Object.keys(data).forEach(key => {
                const selector = `#bracelet_type_${key}`;
                const value = key.toLocaleLowerCase().includes("date") ? moment(data[key].toString()).format("DD/MM/YYYY HH:mm:ss") : data[key];
                $(selector).val(value).trigger("change");
                if (!key.toLocaleLowerCase().includes("date")) {
                    $(selector).attr("disabled", !BraceletTypePage.permissionFlags.canUpdate);
                }
            })
            if (data.description) {
                $("#bracelet_type_descriptionPath").css("background-image", `url('${data.description}')`);
                $("#bracelet_type_description").val(data.description);
                $(".image-input").css("background-image", `unset`);
            }
            else {
                $("#bracelet_type_descriptionPath").css("background-image", `url('${AppSettings.imageDefault}')`);
                $("#bracelet_type_description").val(null);
            }
            if (BraceletTypePage.permissionFlags.canUpdate) {
                $("#kt_modal_bracelet_type_header h2").text(`${BraceletTypePage.message.edit} ${BraceletTypePage.message.pageTitle.toLocaleLowerCase()}`);
                $("#btn_save_bracelet_type").removeClass("d-none");
                $("#btn_cancel_bracelet_type").text(BraceletTypePage.message.cancel);
            }
            else {
                $("#kt_modal_bracelet_type_header h2").text(`${BraceletTypePage.message.detail} ${BraceletTypePage.message.pageTitle.toLocaleLowerCase()}`);
                $("#btn_save_bracelet_type").addClass("d-none");
                $("#btn_cancel_bracelet_type").text(BraceletTypePage.message.ok);
            }
            $("#kt_modal_bracelet_type").modal("show");
        } catch (e) {
            console.error(e);
            Swal.fire({
                icon: "error",
                title: BraceletTypePage.message.errorTitle,
                html: BraceletTypePage.message.notFound,
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
     * Description: Delete user status by id
     * @param {number} id
     */
    async function deleteItem(id) {

        const { isConfirmed } = await Swal.fire({
            icon: "question",
            title: BraceletTypePage.message.confirmTittle,
            html: BraceletTypePage.message.deleteConfirm,
            ...AppSettings.sweetAlertOptions(true)
        });

        if (!isConfirmed)
            return;

        $("#global_loader").addClass("show");
        try {
            const response = await httpService.deleteAsync(ApiRoutes.BraceletType.v1.Delete(id));
            if (response?.isSucceeded) {
                /*tableSearch();*/
                BraceletTypePage.refreshDataTable();
                Swal.fire({
                    icon: "success",
                    title: BraceletTypePage.message.successTitle,
                    html: BraceletTypePage.message.deleteSuccess,
                    ...AppSettings.sweetAlertOptions(false)
                })
            }
        } catch (e) {
            console.error(e);
            Swal.fire({
                icon: "error",
                title: BraceletTypePage.message.failTitle,
                html: BraceletTypePage.message.deleteError,
                ...AppSettings.sweetAlertOptions(false)
            })
        }
        finally {
            $("#global_loader").removeClass("show");
        }
    }

    /**
     * Save data (Create or Update) user status
     */
    async function saveData() {

        const btnSave = $("#btn_save_bracelet_type");
        btnSave.attr("disabled", true);

        const columns = ["id", "name", "description", "color"];
        const data = {};
        columns.forEach(key => {
            const selector = `#bracelet_type_${key}`;
            data[key] = $(selector).val();
        });
        const isAdd = !data.id;
        const confirmText = isAdd ? BraceletTypePage.message.createConfirm : BraceletTypePage.message.updateConfirm;
        const { isConfirmed } = await Swal.fire({
            icon: 'question',
            title: BraceletTypePage.message.confirmTittle,
            html: confirmText,
            ...AppSettings.sweetAlertOptions(true)
        });

        if (isConfirmed) {
            btnSave.attr("data-kt-indicator", "on");
            try {
                const response = isAdd ?
                    await httpService.postAsync(ApiRoutes.BraceletType.v1.Create, data) :
                    await httpService.putAsync(ApiRoutes.BraceletType.v1.Update, data);
                if (response?.isSucceeded) {
                    if (isAdd) {
                        $("#bracelet_type_datatable_search").val("").trigger("change");
                        resetFilter();
                    }
                    else {
                        BraceletTypePage.refreshDataTable();
                    }

                    $("#kt_modal_bracelet_type").modal("hide");
                    const successText = isAdd ? BraceletTypePage.message.createSuccess : BraceletTypePage.message.updateSuccess;
                    Swal.fire({
                        icon: "success",
                        title: BraceletTypePage.message.successTitle,
                        html: successText,
                        ...AppSettings.sweetAlertOptions(false)
                    });
                }

            } catch (e) {
                AppUtils.handleApiError(e, {
                    action: isAdd ? "create" : "update",
                    name: BraceletTypePage.message.pageTitle,
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
        BraceletTypePage.table.column(1).search($("#filter_name").val().trim());
        BraceletTypePage.table.column(2).search($("#filter_description").val().trim());
        BraceletTypePage.table.column(4).search($("#filter_created_date").val());
        BraceletTypePage.table.search($("#bracelet_type_datatable_search").val().trim()).draw();
    }

    /**
     * Reset filter
     */
    function resetFilter() {
        $("#filter_name").val("");
        $("#filter_description").val("");
        BraceletTypePage.plugins.dateRangePickerFilter.clear();
        /*$("#filter_created_date").val("").trigger("change");*/
        tableSearch();
    }

    // On document ready
    KTUtil.onDOMContentLoaded(async function () {
        await AppEntry.init();
        if (!BraceletTypePage.permissionFlags.canView) {
            AppSettings.mainElements.PAGE_CONTENT.addClass("d-none");
            AppSettings.mainElements.NOT_FOUND.removeClass("d-none");
        }
        else
            BraceletTypePage.init();
    });
})();