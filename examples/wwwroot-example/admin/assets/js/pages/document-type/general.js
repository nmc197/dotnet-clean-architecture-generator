"use strict";

(function () {
    // Class definition
    const DocumentTypePage = {
        elements: {
            datatable: $("#document_type_datatable"),
            addUpdateModal: $("#kt_modal_document_type"),
            addUpdateModalHeader: $("#kt_modal_document_type_header h2"),
            btnSave: $("#btn_save_document_type"),
            btnAdd: $("#btn_add_document_type"),
            searchInput: $("#document_type_datatable_search"),
            filterForm: $("[data-kt-document-type-table-filter='form']"),
            filterButton: $("[data-kt-document-type-table-filter='filter']"),
            resetButton: $("[data-kt-document-type-table-filter='reset']")
        },
        userRoles: AppUtils.getRoles(),
        permissionFlags: AppUtils.getPermissionFlags(),
        table: null,
        formValidator: null,
        plugins: {
            dateRangePickerFilter: null
        },
        messages: {
            pageTitle: I18n.t("document_type", "PAGE_TITLE"),
            actions: I18n.t("common", "ACTIONS"),
            create: I18n.t("common", "ADD_NEW"),
            edit: I18n.t("common", "EDIT"),
            delete: I18n.t("common", "DELETE"),
            detail: I18n.t("common", "DETAIL"),
            confirmTittle: I18n.t("common", "CONFIRM_TITLE"),
            successTitle: I18n.t("common", "SUCCESS_TITLE"),
            errorTitle: I18n.t("common", "ERROR_TITLE"),
            failTitle: I18n.t("common", "FAIL_TITLE"),
            warningTitle: I18n.t("common", "WARNING_TITLE"),
            createConfirm: I18n.t("common", "CREATE_CONFIRM", { name: I18n.t("document_type", "PAGE_TITLE").toLocaleLowerCase() }),
            createSuccess: I18n.t("common", "CREATE_SUCCESS", { name: I18n.t("document_type", "PAGE_TITLE") }),
            createError: I18n.t("common", "CREATE_ERROR", { name: I18n.t("document_type", "PAGE_TITLE").toLocaleLowerCase() }),
            updateConfirm: I18n.t("common", "UPDATE_CONFIRM", { name: I18n.t("document_type", "PAGE_TITLE").toLocaleLowerCase() }),
            updateSuccess: I18n.t("common", "UPDATE_SUCCESS", { name: I18n.t("document_type", "PAGE_TITLE") }),
            updateError: I18n.t("common", "UPDATE_ERROR", { name: I18n.t("document_type", "PAGE_TITLE").toLocaleLowerCase() }),
            deleteConfirm: I18n.t("common", "DELETE_CONFIRM", { name: I18n.t("document_type", "PAGE_TITLE").toLocaleLowerCase() }),
            deleteSuccess: I18n.t("common", "DELETE_SUCCESS", { name: I18n.t("document_type", "PAGE_TITLE").toLocaleLowerCase() }),
            deleteError: I18n.t("common", "DELETE_ERROR", { name: I18n.t("document_type", "PAGE_TITLE").toLocaleLowerCase() }),
            notFound: I18n.t("common", "NOT_FOUND", { name: I18n.t("document_type", "PAGE_TITLE").toLocaleLowerCase() }),
            validationError: I18n.t("common", "VALIDATION_ERROR")
        },
        init: function () {
            this.checkPermissions();
            this.initDataTable();
            this.initPlugins();
            this.bindEvents();
            this.initFormValidation();
            this.bindToggleFilterEvent();
            //loadDocumentCategory();
        },
        checkPermissions: function () {
            const ísAdmin = this.userRoles.some(x => x.id === AppSettings.roles.ADMIN);
            const canAdd = DocumentTypePage.permissionFlags.canCreate && !ísAdmin;
            if (!canAdd)
                $("#btn_add_document_type").addClass("d-none");
        },
        bindEvents: function () {
            // Gộp tất cả events vào một hàm
            /*this.bindEditEvent();*/
            this.bindDeleteEvent();
            this.bindSearchAllEvents();
            this.bindFilterEvents();
            /*this.bindAddEvent();*/
            this.bindSaveEvent();
            this.bindClearFilterDateRangeEvent();

            // Clear date filter event
            $("#clear_filter_created_date").on("click", function () {
                $("#filter_created_date").val('');
            });
        },
        initFormValidation: function () {
            this.formValidator = new FormValidator({
                formSelector: "#kt_modal_document_type_form",
                handleSubmit: saveData,
                rules: [
                    {
                        element: "#document_type_name",
                        rule: [
                            {
                                name: "required",
                                message: I18n.t("common", "REQUIRED", { field: "Tên" })
                            },
                            {
                                name: "maxLength",
                                message: I18n.t("common", "TOO_LONG", { field: "Tên", max: 255 }),
                                params: 255
                            }
                        ]
                    },
                    {
                        element: "#document_type_description",
                        rule: [
                            {
                                name: "maxLength",
                                message: I18n.t("common", "TOO_LONG", { field: "Tên", max: 500 }),
                                params: 500,
                            }
                        ]
                    },
                    {
                        element: "#document_category_name",
                        rule: [
                            {
                                name: "required",
                                message: I18n.t("common", "REQUIRED_SELECT", { field: "Nhóm hồ sơ" })
                            }
                        ]
                    },
                    //{
                    //    element: "#document_type_office_id",
                    //    rule: [
                    //        {
                    //            name: "required",
                    //            message: I18n.t("common", "REQUIRED", { field: "Mã văn phòng" })
                    //        }
                    //    ]
                    //}
                ]
            });
        },
        initDataTable: function () {
            this.table = $("#document_type_datatable").DataTable({
                processing: true,
                serverSide: true,
                paging: true,
                searching: { regex: true },
                order: [5, 'desc'],
                language: AppSettings.dataTableLanguage.vi,
                ajax: {
                    url: ApiRoutes.DocumentType.v1.PagedAdvanced,
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
                            const tableSettings = DocumentTypePage.table.settings()[0];
                            tableSettings.ajax.headers.Authorization = "Bearer " + TokenService.getAccessToken();

                            //Reload lại datatable với token mới
                            DocumentTypePage.table.ajax.reload();
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
                            const info = DocumentTypePage.table.page.info();
                            const index = meta.row + 1 + info.page * info.length;
                            return index;
                        }
                    },
                    {
                        data: "name",
                        render: function (data, type, row, meta) {
                            return `<div class="fw-semibold text-gray-800 text-hover-primary">${AppUtils.escapeHtml(data)}</div>`;
                        }
                    },
                    {
                        data: "documentCategoryName",
                        render: function (data) {
                            return AppUtils.escapeHtml(data) ?? "";
                        }
                    },
                    {
                        data: "officeName",
                        render: function (data) {
                            return AppUtils.escapeHtml(data) ?? "";
                        }
                    },
                    {
                        data: "description",
                        render: function (data, type, row, meta) {
                            return data ? `<span>${AppUtils.escapeHtml(data).replaceAll("\n", "<br>")}</span>` : "";
                        }
                    },
                    {
                        data: "createdDate",
                        render: function (data, type, row, meta) {
                            const displayValue = moment(data).format("DD/MM/YYYY HH:mm:ss");
                            return `<span>${displayValue}</span>`;
                        }
                    },
                    {
                        data: 'id',
                        className: 'text-end',
                        render: function (data, type, row, meta) {
                            const ísAdmin = DocumentTypePage.userRoles.some(x => x.id === AppSettings.roles.ADMIN);
                            const canUpdate = !ísAdmin && DocumentTypePage.permissionFlags.canUpdate;
                            return `<a href="#" class="btn btn-light btn-active-light-primary btn-flex btn-center btn-sm" data-kt-menu-trigger="click" data-kt-menu-placement="bottom-end" data-kt-menu-flip="top-end">
                                                ${DocumentTypePage.messages.actions}
                                                <i class="ki-duotone ki-down fs-5 ms-1"></i>
                                    </a>
                                    <div class="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg-light-primary fw-semibold fs-7 w-125px py-4" data-kt-menu="true">
                                        <div class="menu-item px-3">
                                            <a href="/document-type/detail/${data}" target="_blank" class="menu-link px-3 btn-edit" data-kt-docs-table-filter="edit_row" data-user-status-id="${data}">
                                                ${canUpdate ? DocumentTypePage.messages.edit : DocumentTypePage.messages.detail}
                                            </a>
                                        </div>
                                        <div class="menu-item px-3">
                                            <a href="#" class="menu-link px-3 text-danger btn-delete ${DocumentTypePage.permissionFlags.canDelete ? "" : "d-none"}" data-kt-users-table-filter="delete_row" data-user-status-id="${data}">
                                                ${DocumentTypePage.messages.delete}
                                            </a>
                                        </div>
                                    </div>`
                        }
                    },
                ],
                columnDefs: [
                    { targets: "no-sort", orderable: false },
                    { targets: "no-search", searchable: false },
                    { orderable: false, targets: [0, -1] }
                ],
                aLengthMenu: [
                    [10, 25, 50, 100],
                    [10, 25, 50, 100]
                ],
                drawCallback: function () {
                    $('#document_type_datatable tfoot').html("");
                    $("#document_type_datatable thead tr").clone(true).appendTo("#document_type_datatable tfoot");
                    $('#document_type_datatable tfoot tr').addClass("border-top");
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

            AppUtils.createSelect2("#document_category_name", {
                url: ApiRoutes.DocumentCategory.v1.GetByCurrentUser,
                cache: true,
                placeholder: 'Chọn nhóm hồ sơ',
                select2Options: {
                    dropdownParent: $("#kt_modal_document_type"),
                }
            });
            //$("#document_category_name").select2({
            //    language: currentLang,
            //    placeholder: "Chọn nhóm hồ sơ",
            //    dropdownParent: $("#kt_modal_document_type"),
            //})
        },
        regenDataTable: function () {
            if (this.table) {
                this.table.destroy();
                $("#document_type_datatable tbody").html("");
                this.initDataTable();
            }
        },
        refreshDataTable: function () {
            if (this.table) {
                this.table.ajax.reload(null, false);
            }
        },
        bindEditEvent: function () {
            $("#document_type_datatable tbody").on("click", ".btn-edit", function () {
                const id = $(this).attr("data-user-status-id");
                editItem(id);
            });
        },
        bindDeleteEvent: function () {
            $("#document_type_datatable tbody").on("click", ".btn-delete", function () {
                const id = $(this).attr("data-user-status-id");
                deleteItem(id);
            });
        },
        bindSearchAllEvents: function () {
            $("#document_type_datatable_search").on("keyup", AppUtils.debounce(function () {
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
            $("#btn_add_document_type").on("click", function () {
                addItem();
            })
        },
        bindSaveEvent: function () {
            //$("#btn_save_document_category").on("click", function (e) {
            //    e.preventDefault();
            //    saveData();
            //})
        },
        bindClearFilterDateRangeEvent: function () {
            $("#clear_filter_created_date i").on("click", function () {
                DocumentTypePage.plugins.dateRangePickerFilter.clear();
            })
            $("#clear_filter_created_date").on("click", function () {
                DocumentTypePage.plugins.dateRangePickerFilter.clear();
            })
        },
        bindToggleFilterEvent: function () {
            $("#btn_document_type_filter").on("click", function () {
                $("#document_type_filter").slideToggle();
            })
        }
    };

    function addItem() {
        DocumentTypePage.formValidator.clearErrors();
        DocumentTypePage.elements.addUpdateModalHeader.text(
            `${DocumentTypePage.messages.create} ${DocumentTypePage.messages.pageTitle.toLocaleLowerCase()}`
        );

        $("#document_type_id").val('');
        $("#document_type_name").val('');
        $("#document_category_name").val('').trigger("change");
        /*$("#document_category_office_id").val('').trigger("change").prop("disabled", false);*/
        $("#document_type_description").val('');
        $("#document_type_created_date").val(moment().format("DD/MM/YYYY HH:mm:ss"));

        DocumentTypePage.elements.addUpdateModal.modal('show');
    }

    async function editItem(id) {
        DocumentTypePage.formValidator.clearErrors();
        try {
            const response = await httpService.getAsync(ApiRoutes.DocumentType.v1.Detail(id));
            const data = response.resources;

            $("#document_type_id").val(data.id);
            $("#document_type_name").val(data.name);
            if ($("#document_category_name").find("option[value='" + data.documentCategoryId + "']").length === 0) {
                const newOption = new Option(data.documentCategoryName, data.documentCategoryId, true, true);
                $("#document_category_name").append(newOption).trigger('change');
            } else {
                $("#document_category_name").val(data.documentCategoryId).trigger('change');
            }
            /*$("#document_category_name").val(data.documentCategoryId).trigger("change");*/
            /*$("#document_category_office_id").val(data.officeId).trigger("change").prop("disabled", true);*/
            $("#document_type_description").val(data.description);
            $("#document_type_created_date").val(moment(data.createdDate).format("DD/MM/YYYY HH:mm:ss"));

            DocumentTypePage.elements.addUpdateModalHeader.text(
                `${DocumentTypePage.messages.edit} ${DocumentTypePage.messages.pageTitle.toLocaleLowerCase()}`
            );
            DocumentTypePage.elements.addUpdateModal.modal('show');
        } catch (e) {
            console.error(e);
            Swal.fire({
                icon: "error",
                title: DocumentTypePage.messages.errorTitle,
                html: DocumentTypePage.messages.notFound,
                ...AppSettings.sweetAlertOptions(false)
            });
        }
    }

    async function deleteItem(id) {
        const { isConfirmed } = await Swal.fire({
            icon: "question",
            title: DocumentTypePage.messages.confirmTittle,
            html: DocumentTypePage.messages.deleteConfirm,
            ...AppSettings.sweetAlertOptions(true)
        });

        if (!isConfirmed) return;

        try {
            const response = await httpService.deleteAsync(ApiRoutes.DocumentType.v1.Delete(id));
            if (response?.isSucceeded) {
                /*DocumentTypePage.table.draw();*/
                DocumentTypePage.refreshDataTable();
                Swal.fire({
                    icon: "success",
                    title: DocumentTypePage.messages.successTitle,
                    html: DocumentTypePage.messages.deleteSuccess,
                    ...AppSettings.sweetAlertOptions(false)
                });
            }
        } catch (e) {
            console.error(e);
            Swal.fire({
                icon: "error",
                title: DocumentTypePage.messages.failTitle,
                html: DocumentTypePage.messages.deleteError,
                ...AppSettings.sweetAlertOptions(false)
            });
        }
    }

    async function saveData() {
        const btnSave = DocumentTypePage.elements.btnSave;
        btnSave.attr("disabled", true);

        const data = {
            id: $("#document_type_id").val(),
            name: $("#document_type_name").val(),
            documentCategoryId: $("#document_category_name").val(),
            /*officeId: $("#document_category_office_id").val(),*/
            description: $("#document_type_description").val()
        };

        const isAdd = !data.id;
        const confirmText = isAdd ? DocumentTypePage.messages.createConfirm : DocumentTypePage.messages.updateConfirm;

        const { isConfirmed } = await Swal.fire({
            icon: 'question',
            title: DocumentTypePage.messages.confirmTittle,
            html: confirmText,
            ...AppSettings.sweetAlertOptions(true)
        });

        if (isConfirmed) {
            btnSave.attr("data-kt-indicator", "on");
            try {
                const response = isAdd ?
                    await httpService.postAsync(ApiRoutes.DocumentType.v1.Create, data) :
                    await httpService.putAsync(ApiRoutes.DocumentType.v1.Update, data);

                if (response?.isSucceeded) {
                    /*DocumentTypePage.table.draw();*/
                    if (isAdd) {
                        $("#document_type_datatable_search").val("").trigger("change");
                        resetFilter();
                    }
                    else {
                        DocumentTypePage.refreshDataTable();
                    }
                    DocumentTypePage.elements.addUpdateModal.modal("hide");

                    const successText = isAdd ? DocumentTypePage.messages.createSuccess : DocumentTypePage.messages.updateSuccess;
                    Swal.fire({
                        icon: "success",
                        title: DocumentTypePage.messages.successTitle,
                        html: successText,
                        ...AppSettings.sweetAlertOptions(false)
                    });
                }
            } catch (e) {
                //const { responseJSON } = e;
                //let errorText = "";
                //let errorTitle = "";
                //let icon = "";

                //if (responseJSON?.status === AppSettings.httpStatusCode.UNPROCESSABLE_ENTITY) {
                //    icon = "warning";
                //    errorTitle = DocumentTypePage.messages.validationError;

                //    const messages = [];
                //    responseJSON?.errors?.forEach(error => {
                //        error.message.forEach(item => {
                //            messages.push(`<li class="text-start">${item}</li>`);
                //        });
                //    });
                //    errorText = `<ul>${messages.join("")}</ul>`;
                //} else {
                //    icon = "error";
                //    errorTitle = DocumentTypePage.messages.failTitle;
                //    errorText = isAdd ? DocumentTypePage.messages.createError : DocumentTypePage.messages.updateError;
                //}

                //Swal.fire({
                //    icon: icon,
                //    title: errorTitle,
                //    html: errorText,
                //    ...AppSettings.sweetAlertOptions(false)
                //});
                AppUtils.handleApiError(e, {
                    action: isAdd ? "create" : "update",
                    name: DocumentTypePage.messages.pageTitle,
                    isShowAlert: true
                })
            } finally {
                btnSave.removeAttr("data-kt-indicator");
            }
        }
        btnSave.removeAttr("disabled");
    }


    /**
  * Search data table
  */
    function tableSearch() {
        DocumentTypePage.table.column(1).search($("#filter_name").val().trim());
        DocumentTypePage.table.column(2).search($("#filter_officeName").val().trim());
        DocumentTypePage.table.column(4).search($("#filter_description").val().trim());
        DocumentTypePage.table.column(5).search($("#filter_created_date").val());
        DocumentTypePage.table.search($("#document_type_datatable_search").val().trim()).draw();
    }

    /**
     * Reset filter
     */
    function resetFilter() {
        $("#filter_name").val("");
        $("#filter_description").val("");
        DocumentTypePage.plugins.dateRangePickerFilter.clear();
        /*$("#filter_created_date").val("").trigger("change");*/
        tableSearch();
    }

    // On document ready
    KTUtil.onDOMContentLoaded(async function () {
        await AppEntry.init();
        if (!DocumentTypePage.permissionFlags.canView) {
            AppSettings.mainElements.PAGE_CONTENT.addClass("d-none");
            AppSettings.mainElements.NOT_FOUND.removeClass("d-none");
        }
        else
            DocumentTypePage.init();

    });
})();