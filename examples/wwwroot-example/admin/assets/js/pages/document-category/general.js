"use strict";

(function () {
    // Class definition
    const DocumentCategoryPage = {
        elements: {
            datatable: $("#document_category_datatable"),
            addUpdateModal: $("#kt_modal_document_category"),
            addUpdateModalHeader: $("#kt_modal_document_category_header h2"),
            btnSave: $("#btn_save_document_category"),
            btnAdd: $("#btn_add_document_category"),
            searchInput: $("#document_category_datatable_search"),
            filterForm: $("[data-kt-document-category-table-filter='form']"),
            filterButton: $("[data-kt-document-category-table-filter='filter']"),
            resetButton: $("[data-kt-document-category-table-filter='reset']")
        },
        permissionFlags: AppUtils.getPermissionFlags(),
        documentCategorySource: [],
        table: null,
        formValidator: null,
        plugins: {
            dateRangePickerFilter: null
        },
        messages: {
            pageTitle: I18n.t("document_category", "PAGE_TITLE"),
            actions: I18n.t("common", "ACTIONS"),
            create: I18n.t("common", "ADD_NEW"),
            edit: I18n.t("common", "EDIT"),
            detail: I18n.t("common", "DETAIL"),
            delete: I18n.t("common", "DELETE"),
            ok: I18n.t("common", "OK"),
            cancel: I18n.t("common", "CANCEL"),
            confirmTittle: I18n.t("common", "CONFIRM_TITLE"),
            successTitle: I18n.t("common", "SUCCESS_TITLE"),
            errorTitle: I18n.t("common", "ERROR_TITLE"),
            failTitle: I18n.t("common", "FAIL_TITLE"),
            warningTitle: I18n.t("common", "WARNING_TITLE"),
            createConfirm: I18n.t("common", "CREATE_CONFIRM", { name: I18n.t("document_category", "PAGE_TITLE").toLocaleLowerCase() }),
            createSuccess: I18n.t("common", "CREATE_SUCCESS", { name: I18n.t("document_category", "PAGE_TITLE") }),
            createError: I18n.t("common", "CREATE_ERROR", { name: I18n.t("document_category", "PAGE_TITLE").toLocaleLowerCase() }),
            updateConfirm: I18n.t("common", "UPDATE_CONFIRM", { name: I18n.t("document_category", "PAGE_TITLE").toLocaleLowerCase() }),
            updateSuccess: I18n.t("common", "UPDATE_SUCCESS", { name: I18n.t("document_category", "PAGE_TITLE") }),
            updateError: I18n.t("common", "UPDATE_ERROR", { name: I18n.t("document_category", "PAGE_TITLE").toLocaleLowerCase() }),
            deleteConfirm: I18n.t("common", "DELETE_CONFIRM", { name: I18n.t("document_category", "PAGE_TITLE").toLocaleLowerCase() }),
            deleteSuccess: I18n.t("common", "DELETE_SUCCESS", { name: I18n.t("document_category", "PAGE_TITLE").toLocaleLowerCase() }),
            deleteError: I18n.t("common", "DELETE_ERROR", { name: I18n.t("document_category", "PAGE_TITLE").toLocaleLowerCase() }),
            notFound: I18n.t("common", "NOT_FOUND", { name: I18n.t("document_category", "PAGE_TITLE").toLocaleLowerCase() }),
            validationError: I18n.t("common", "VALIDATION_ERROR")
        },
        init: function () {
            this.initDataTable();
            this.initPlugins();
            this.bindEvents();
            this.initFormValidation();
            this.loadRelatedData();
            //loadOffice();
        },
        bindEvents: function () {
            // Gộp tất cả events vào một hàm
            this.bindEditEvent();
            this.bindDeleteEvent();
            this.bindSearchAllEvents();
            this.bindFilterEvents();
            this.bindAddEvent();
            this.bindSaveEvent();
            this.bindClearFilterDateRangeEvent();
            this.bindToggleFilterEvent();

            // Clear date filter event
            $("#clear_filter_created_date").on("click", function () {
                $("#filter_created_date").val('');
            });
        },
        initFormValidation: function () {
            this.formValidator = new FormValidator({
                formSelector: "#kt_modal_document_category_form",
                handleSubmit: saveData,
                rules: [
                    {
                        element: "#document_category_name",
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
                        element: "#document_category_description",
                        rule: [
                            {
                                name: "maxLength",
                                message: I18n.t("common", "TOO_LONG", { field: "Mô tả", max: 500 }),
                                params: 500
                            }
                        ]
                    },
                    //{
                    //    element: "#document_category_office_id",
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
            this.table = $("#document_category_datatable").DataTable({
                processing: true,
                serverSide: true,
                paging: true,
                searching: { regex: true },
                order: [5, 'desc'],
                language: AppSettings.dataTableLanguage.vi,
                ajax: {
                    url: ApiRoutes.DocumentCategory.v1.PagedAdvanced,
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
                            const tableSettings = DocumentCategoryPage.table.settings()[0];
                            tableSettings.ajax.headers.Authorization = "Bearer " + TokenService.getAccessToken();

                            //Reload lại datatable với token mới
                            DocumentCategoryPage.table.ajax.reload();
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
                            const info = DocumentCategoryPage.table.page.info();
                            const index = meta.row + 1 + info.page * info.length;
                            return index; // This contains the row index
                        }
                    },

                    {
                        data: "name",
                        render: function (data, type, row, meta) {
                            return `<span class='text-gray-800 text-hover-primary mb-1' data-document-category-id='${row.id}'>${AppUtils.escapeHtml(row.name)}</span>`;
                        },
                    },
                    {
                        data: "parentId",
                        render: function (data, type, row, meta) {
                            if (row.parentName) {
                                return `<span class='' data-document-category-id='${row.id}'>${AppUtils.escapeHtml(row.parentName)}</span>`;
                            } else {
                                return `<span class='text-gray-400 mb-1'>-</span>`;
                            }
                        },
                    },
                    {
                        data: "officeName",
                        render: function (data, type, row, meta) {
                            return `<span class='' data-document-category-office-id='${row.officeId}'>${AppUtils.escapeHtml(row.officeName)}</span>`;
                        },
                    },
                    {
                        data: "description",
                        render: function (data, type, row, meta) {
                            return `<span data-document-category-id='${row.id}'>${AppUtils.escapeHtml(row.description).replaceAll("\n", "<br>") || ''}</span>`;
                        },
                    },
                    {
                        data: "createdDate",
                        render: function (data, type, row, meta) {
                            const displayValue = moment(data).format("DD/MM/YYYY HH:mm:ss");
                            return `<span data-document-category-id='${row.id}'>${displayValue}</span>`;
                        }
                    },
                    {
                        data: 'id',
                        className: 'text-end',
                        render: function (data, type, row, meta) {
                            return `<a href="#" class="btn btn-light btn-active-light-primary btn-flex btn-center btn-sm" data-kt-menu-trigger="click" data-kt-menu-placement="bottom-end" data-kt-menu-flip="top-end">
                                                ${DocumentCategoryPage.messages.actions}
                                                <i class="ki-duotone ki-down fs-5 ms-1"></i>
                                    </a>
                                    <div class="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg-light-primary fw-semibold fs-7 w-125px py-4" data-kt-menu="true">
                                        <div class="menu-item px-3">
                                            <a href="#" class="menu-link px-3 btn-edit" data-kt-docs-table-filter="edit_row" data-document-category-id="${data}">
                                             ${DocumentCategoryPage.permissionFlags.canUpdate ? DocumentCategoryPage.messages.edit : DocumentCategoryPage.messages.detail}
                                            </a>
                                        </div>
                                        <div class="menu-item px-3 ${!DocumentCategoryPage.permissionFlags.canDelete ? "d-none" : ""}">
                                            <a href="#" class="menu-link px-3 text-danger btn-delete" data-kt-users-table-filter="delete_row" data-document-category-id="${data}">
                                                ${DocumentCategoryPage.messages.delete}
                                            </a>
                                        </div>
                                    </div>`
                        }
                    },

                ],
                columnDefs: [
                    { targets: "no-sort", orderable: false },
                    { targets: "no-search", searchable: false },
                    { orderable: false, targets: [0, -1] },
                    { orderable: true, targets: [1, 2, 3, 4] },
                ],
                aLengthMenu: [
                    [10, 25, 50, 100],
                    [10, 25, 50, 100]
                ],
                drawCallback: function () {
                    $('#document_category_datatable tfoot').html("");
                    $("#document_category_datatable thead tr").clone(true).appendTo("#document_category_datatable tfoot");
                    $('#document_category_datatable tfoot tr').addClass("border-top");
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
                $("#document_category_datatable tbody").html("");
                this.initDataTable();
            }
        },
        refreshDataTable: function () {
            if (this.table) {
                this.table.ajax.reload(null, false);
            }
        },
        bindEditEvent: function () {
            $("#document_category_datatable tbody").on("click", ".btn-edit", function () {
                const id = $(this).attr("data-document-category-id");
                editItem(id);
            });
        },
        bindDeleteEvent: function () {
            $("#document_category_datatable tbody").on("click", ".btn-delete", function () {
                const id = $(this).attr("data-document-category-id");
                deleteItem(id);
            });
        },
        bindSearchAllEvents: function () {
            $("#document_category_datatable_search").on("keyup", AppUtils.debounce(function () {
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
            $("#btn_add_document_category").on("click", function () {
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
                DocumentCategoryPage.plugins.dateRangePickerFilter.clear();
            })
            $("#clear_filter_created_date").on("click", function () {
                DocumentCategoryPage.plugins.dateRangePickerFilter.clear();
            })
        },
        bindToggleFilterEvent: function () {
            $("#btn_document_cateogry_filter").on("click", function () {
                $("#document_cateogry_filter").slideToggle();
            })
        },
        loadRelatedData: function () {
            loadDocumentCategoryList();
        },
        checkPermissions: function () {
            if (!DocumentCategoryPage.permissionFlags.canCreate)
                $("#btn_add_document_category").addClass("d-none");
        },
    };

    /**
     *  Add Item Document Category
     */
    function addItem() {
        DocumentCategoryPage.formValidator.clearErrors();
        DocumentCategoryPage.elements.addUpdateModalHeader.text(
            `${DocumentCategoryPage.messages.create} ${DocumentCategoryPage.messages.pageTitle.toLocaleLowerCase()}`
        );

        $("#btn_save_document_category").removeClass("d-none");
        $("#btn_cancel_document_category").text(DocumentCategoryPage.messages.cancel);

        $("#document_category_id").val('');
        $("#document_category_name").val('');
        $("#document_category_parentId").val(null).trigger("change");
        //$("#document_category_office_id").val('');
        $("#document_category_description").val('');
        $("#document_category_created_date").val(moment().format("DD/MM/YYYY HH:mm:ss"));

        $("#kt_modal_document_category_form input, #kt_modal_document_category_form textarea, #kt_modal_document_category_form select").attr("disabled", false);
        $("#document_category_created_date").attr("disabled", true);

        DocumentCategoryPage.elements.addUpdateModal.modal('show');
    }

    /**
     * 
     * Edit Item Document Category
     */
    async function editItem(id) {
        DocumentCategoryPage.formValidator.clearErrors();
        AppSettings.mainElements.GLOBAL_LOADER.addClass("show");
        try {
            const response = await httpService.getAsync(ApiRoutes.DocumentCategory.v1.Detail(id));
            const data = response.resources;
            Object.keys(data).forEach(key => {
                const selector = `#document_category_${key}`;
                const value = key.toLocaleLowerCase().includes("date") ? moment(data[key].toString()).format("DD/MM/YYYY HH:mm:ss") : data[key];
                $(selector).val(value).trigger("change");
                if (!key.toLocaleLowerCase().includes("date")) {
                    $(selector).attr("disabled", !DocumentCategoryPage.permissionFlags.canUpdate);
                }
            })
            if (DocumentCategoryPage.permissionFlags.canUpdate) {
                $("#kt_modal_document_category_header h2").text(`${DocumentCategoryPage.messages.edit} ${DocumentCategoryPage.messages.pageTitle.toLocaleLowerCase()}`);
                $("#btn_save_document_category").removeClass("d-none");
                $("#btn_cancel_document_category").text(DocumentCategoryPage.messages.cancel);
            } else {
                $("#kt_modal_document_category_header h2").text(`${DocumentCategoryPage.messages.detail} ${DocumentCategoryPage.messages.pageTitle.toLocaleLowerCase()}`);
                $("#btn_save_document_category").addClass("d-none");
                $("#btn_cancel_document_category").text(DocumentCategoryPage.messages.ok);
            }

            $("#document_category_id").val(data.id);
            $("#document_category_name").val(data.name);
            $("#document_category_parentId").val(data.parentId).trigger("change");
            $("#document_category_office_id").val(data.officeId);
            $("#document_category_description").val(data.description);
            $("#document_category_created_date").val(moment(data.createdDate).format("DD/MM/YYYY HH:mm:ss"));

            DocumentCategoryPage.elements.addUpdateModalHeader.text(
                `${DocumentCategoryPage.messages.edit} ${DocumentCategoryPage.messages.pageTitle.toLocaleLowerCase()}`
            );
            DocumentCategoryPage.elements.addUpdateModal.modal('show');
        } catch (e) {
            console.error(e);
            Swal.fire({
                icon: "error",
                title: DocumentCategoryPage.messages.errorTitle,
                html: DocumentCategoryPage.messages.notFound,
                ...AppSettings.sweetAlertOptions(false)
            });
        }
        AppSettings.mainElements.GLOBAL_LOADER.removeClass("show");
    }

    /**
     * 
     * Delete Item Document Category
     */
    async function deleteItem(id) {
        const { isConfirmed } = await Swal.fire({
            icon: "question",
            title: DocumentCategoryPage.messages.confirmTittle,
            html: DocumentCategoryPage.messages.deleteConfirm,
            ...AppSettings.sweetAlertOptions(true)
        });

        if (!isConfirmed) return;

        try {
            const response = await httpService.deleteAsync(ApiRoutes.DocumentCategory.v1.Delete(id));
            if (response?.isSucceeded) {
                //DocumentCategoryPage.table.draw();
                DocumentCategoryPage.refreshDataTable();
                Swal.fire({
                    icon: "success",
                    title: DocumentCategoryPage.messages.successTitle,
                    html: DocumentCategoryPage.messages.deleteSuccess,
                    ...AppSettings.sweetAlertOptions(false)
                });
            }
        } catch (e) {
            console.error(e);
            Swal.fire({
                icon: "error",
                title: DocumentCategoryPage.messages.failTitle,
                html: DocumentCategoryPage.messages.deleteError,
                ...AppSettings.sweetAlertOptions(false)
            });
        }
    }

    /**
     * 
     * Save Item Document Category
     */
    async function saveData() {
        const btnSave = DocumentCategoryPage.elements.btnSave;
        btnSave.attr("disabled", true);

        const data = {
            id: $("#document_category_id").val(),
            name: $("#document_category_name").val(),
            officeId: $("#document_category_office_id").val(),
            description: $("#document_category_description").val(),
            parentId: $("#document_category_parentId").val() || null,
        };

        const isAdd = !data.id;
        const confirmText = isAdd ? DocumentCategoryPage.messages.createConfirm : DocumentCategoryPage.messages.updateConfirm;

        const { isConfirmed } = await Swal.fire({
            icon: 'question',
            title: DocumentCategoryPage.messages.confirmTittle,
            html: confirmText,
            ...AppSettings.sweetAlertOptions(true)
        });

        if (isConfirmed) {
            btnSave.attr("data-kt-indicator", "on");
            try {
                const response = isAdd ?
                    await httpService.postAsync(ApiRoutes.DocumentCategory.v1.Create, data) :
                    await httpService.putAsync(ApiRoutes.DocumentCategory.v1.Update, data);

                if (response?.isSucceeded) {
                    /*DocumentCategoryPage.table.draw();*/
                    loadDocumentCategoryList();
                    if (isAdd) {
                        $("#document_category_datatable_search").val("").trigger("change");
                        resetFilter();
                    }
                    else {
                        DocumentCategoryPage.refreshDataTable();
                    }
                    DocumentCategoryPage.elements.addUpdateModal.modal("hide");

                    const successText = isAdd ? DocumentCategoryPage.messages.createSuccess : DocumentCategoryPage.messages.updateSuccess;
                    Swal.fire({
                        icon: "success",
                        title: DocumentCategoryPage.messages.successTitle,
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
                //    errorTitle = DocumentCategoryPage.messages.validationError;

                //    const messages = [];
                //        messages.push(`<li class="text-start">${responseJSON?.message}</li>`);
                //    errorText = `<ul>${messages.join("")}</ul>`;
                //} else {
                //    icon = "error";
                //    errorTitle = DocumentCategoryPage.messages.failTitle;
                //    errorText = isAdd ? DocumentCategoryPage.messages.createError : DocumentCategoryPage.messages.updateError;
                //}

                //Swal.fire({
                //    icon: icon,
                //    title: errorTitle,
                //    html: errorText,
                //    ...AppSettings.sweetAlertOptions(false)
                //});
                AppUtils.handleApiError(e, {
                    action: isAdd ? "create" : "update",
                    name: DocumentCategoryPage.messages.pageTitle,
                    isShowAlert: true
                });
            } finally {
                btnSave.removeAttr("data-kt-indicator");
            }
        }
        btnSave.removeAttr("disabled");
    }

    /**
     * 
     * Load data Office
     */

    //async function loadOffice() {
    //    try {
    //        const response = await httpService.getAsync(ApiRoutes.Office.v1.List);

    //        if (response && response.resources) {
    //            const offices = response.resources;
    //            const officeSelect = $("#document_category_office_id");

    //            officeSelect.empty();
    //            officeSelect.append(new Option("Chọn văn phòng", ""));

    //            offices.forEach(office => {
    //                officeSelect.append(new Option(office.name, office.id));
    //            });
    //        } else {
    //            console.error("Lỗi không load được văn phòng");
    //        }
    //    } catch (error) {
    //        console.error("Lỗi office:", error);
    //    }
    //}

    /**
      * Load DocumentCategory list
      */
    async function loadDocumentCategoryList() {
        try {
            $("#document_category_parentId").html("");
            const response = await httpService.getAsync(ApiRoutes.DocumentCategory.v1.List);
            const data = response.resources || [];
            let lastLabel = 0;
            data.forEach((item, index) => {
                $("#document_category_parentId").append(new Option(item.name, item.id, false, false));
                if (!item.parentId) {
                    lastLabel++;
                    item.label = `${lastLabel}`;                  
                }
                else {
                    const parentLabel = data.find(parent => parent.id === item.parentId)?.label;
                    const index = data.filter(x => x.parentId === item.parentId).map(x => x.id).indexOf(item.id);
                    item.label = `${parentLabel}.${index + 1}`;
                }
            })

            $("#document_category_parentId").select2({
                dropdownParent: $("#kt_modal_document_category"),
                allowClear: true,
                placeholder: "Chọn danh mục cha",
                language: currentLang,
                templateResult: formatDocumentCategorySelectResult,
                data: data
            });

            $("#filter_parentName").select2({
                allowClear: true,
                placeholder: "Chọn danh mục cha",
                language: currentLang,
                templateResult: formatDocumentCategorySelectResult,
                templateSelection: function (option) {
                    if (!option.id) {
                        return "Chọn danh mục cha";
                    }
                    return option.name;
                },
                data: data
            });

        } catch (e) {
            console.error(e);
            $("#document_category_parentId").select2({
                dropdownParent: $("#kt_app_content_container"),
                allowClear: true,
                placeholder: "Chọn danh mục cha",
                language: currentLang
            });

            $("#filter_parentName").select2({
                allowClear: true,
                placeholder: "Chọn danh mục cha",
                language: currentLang,
            });
        }
    }

    function formatDocumentCategorySelectResult(data) {
        let html = $(`<span> </span>`);
        if (data.treeIds) {
            const level = data.treeIds.split("_").length - 1;
            html = $(`<span class="ps-${10 * level}" data-menu-parent-id="${data.id}"><span class="fw-bold">${data.label}.</span> ${data.name}</span>`);
        }
        return html;
    };

    /**
  * Search data table
  */
    function tableSearch() {
        DocumentCategoryPage.table.column(1).search($("#filter_name").val().trim());
        DocumentCategoryPage.table.column(2).search($("#filter_parentName").val().trim());
        DocumentCategoryPage.table.column(3).search($("#filter_officeName").val().trim());
        DocumentCategoryPage.table.column(4).search($("#filter_description").val().trim());
        DocumentCategoryPage.table.column(5).search($("#filter_created_date").val());
        DocumentCategoryPage.table.search($("#document_category_datatable_search").val().trim()).draw();
    }

    /**
     * Reset filter
     */
    function resetFilter() {
        $("#filter_name").val("");
        $("#filter_description").val("");
        $("#filter_parentName").val("").trigger("change");

        DocumentCategoryPage.plugins.dateRangePickerFilter.clear();
        /*$("#filter_created_date").val("").trigger("change");*/
        tableSearch();
    }

    // On document ready
    KTUtil.onDOMContentLoaded(async function () {
        await AppEntry.init();
        if (!DocumentCategoryPage.permissionFlags.canView) {
            AppSettings.mainElements.PAGE_CONTENT.addClass("d-none");
            AppSettings.mainElements.NOT_FOUND.removeClass("d-none");
        } else {
            DocumentCategoryPage.init();
        }
    });
})();