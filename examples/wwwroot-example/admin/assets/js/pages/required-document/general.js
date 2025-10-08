"use strict";

(function () {
    // Class definition
    const RequiredDocumentPage = {
        table: null,
        formValidator: null,
        plugins: {
            dateRangePickerFilter: null
        },
        message: {
            pageTitle: I18n.t("required_document", "PAGE_TITLE"),
            actions: I18n.t("common", "ACTIONS"),
            create: I18n.t("common", "ADD_NEW"),
            edit: I18n.t("common", "EDIT"),
            delete: I18n.t("common", "DELETE"),
            confirmTittle: I18n.t("common", "CONFIRM_TITLE"),
            successTitle: I18n.t("common", "SUCCESS_TITLE"),
            errorTitle: I18n.t("common", "ERROR_TITLE"),
            failTitle: I18n.t("common", "FAIL_TITLE"),
            warningTitle: I18n.t("common", "WARNING_TITLE"),
            createConfirm: I18n.t("common", "CREATE_CONFIRM", { name: I18n.t("required_document", "PAGE_TITLE").toLocaleLowerCase() }),
            createSuccess: I18n.t("common", "CREATE_SUCCESS", { name: I18n.t("required_document", "PAGE_TITLE").toLocaleLowerCase() }),
            createError: I18n.t("common", "CREATE_ERROR", { name: I18n.t("required_document", "PAGE_TITLE").toLocaleLowerCase() }),
            updateConfirm: I18n.t("common", "UPDATE_CONFIRM", { name: I18n.t("required_document", "PAGE_TITLE").toLocaleLowerCase() }),
            updateSuccess: I18n.t("common", "UPDATE_SUCCESS", { name: I18n.t("required_document", "PAGE_TITLE") }),
            updateError: I18n.t("common", "UPDATE_ERROR", { name: I18n.t("required_document", "PAGE_TITLE").toLocaleLowerCase() }),
            deleteConfirm: I18n.t("common", "DELETE_CONFIRM", { name: I18n.t("required_document", "PAGE_TITLE").toLocaleLowerCase() }),
            deleteSuccess: I18n.t("common", "DELETE_SUCCESS", { name: I18n.t("required_document", "PAGE_TITLE").toLocaleLowerCase() }),
            deleteError: I18n.t("common", "DELETE_ERROR", { name: I18n.t("required_document", "PAGE_TITLE").toLocaleLowerCase() }),
            notFound: I18n.t("common", "NOT_FOUND", { name: I18n.t("required_document", "PAGE_TITLE").toLocaleLowerCase() }),
            validationError: I18n.t("common", "VALIDATION_ERROR")
        },
        init: function () {
            this.initPlugins();
            this.initDataTable();
            this.loadRelatedData();
            this.bindEvents();
            this.formValidator = new FormValidator({
                formSelector: "#kt_modal_required_document_form",
                handleSubmit: saveData,
                rules: [
                    {
                        element: "#requireddocument_name",
                        rule: [
                            {
                                name: "required",
                                message: I18n.t("common", "REQUIRED", { field: "Tên tài liệu" })
                            },
                            {
                                name: "maxLength",
                                message: I18n.t("common", "TOO_LONG", { field: "Tên tài liệu", max: 255 }),
                                params: 255
                            },
                        ]

                    },
                    {
                        element: "#required_document_documentTypeName",
                        rule: [
                            {
                                name: "required",
                                message: I18n.t("common", "REQUIRED_SELECT", { field: "loại hồ sơ" }),
                            },
                        ],

                    },
                    {
                        element: "#required_document_isMandatory",
                        rule: [
                            {
                                name: "required",
                                message: I18n.t("common", "REQUIRED_SELECT", { field: "có bắt buộc không" })
                            },
                        ]

                    },
                ]
            });
        },
        initDataTable: function () {
            this.table = $("#requireddocument_datatable").DataTable({
                processing: true,
                serverSide: true,
                paging: true,
                searching: { regex: true },
                order: [6, 'desc'],
                language: AppSettings.dataTableLanguage.vi,
                ajax: {
                    url: ApiRoutes.RequiredDocument.v1.PagedAdvanced,
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
                            const tableSettings = RequiredDocumentPage.table.settings()[0];
                            tableSettings.ajax.headers.Authorization = "Bearer " + TokenService.getAccessToken();

                            //Reload lại datatable với token mới
                            RequiredDocumentPage.table.ajax.reload();
                        }
                    },
                    dataSrc: {
                        data: 'resources.data',
                        draw: 'resources.draw',
                        recordsTotal: 'resources.recordsTotal',
                        recordsFiltered: 'resources.recordsFiltered'
                    },
                    data: function (d) {
                        // Lấy giá trị từ các filter controls
                        d.name = $("#filter_name").val() || null;

                        // chuyen documentTypeIds - chuyển đổi thành mảng số nguyên
                        const documentTypeIds = $("#filter_documentTypeId").val();
                        d.documentTypeIds = Array.isArray(documentTypeIds) ?
                            documentTypeIds.filter(id => id != null && id !== "").map(id => parseInt(id)) : [];

                        // chuyen officeIds - chuyển đổi thành mảng số nguyên
                        const officeIds = $("#filter_officeId").val();
                        d.officeIds = Array.isArray(officeIds) ?
                            officeIds.filter(id => id != null && id !== "").map(id => parseInt(id)) : [];

                        const forParty = $("#filter_forParty").val();
                        d.forParty = Array.isArray(forParty) ? forParty.filter(id => id != null && id !== "") : [];

                        // chuyen isMandatory - chuyển đổi thành boolean hoặc null
                        const isMandatory = $("#filter_isMandatory").val();
                        d.isMandatory = Array.isArray(isMandatory) ? isMandatory.filter(id => id != null && id !== "") : [];


                        d.createdDateRange = $("#filter_created_date").val() || null; // Ngày tạo
                        return JSON.stringify(d);
                    }

                },
                columns: [
                    {
                        data: 'id',
                        render: function (data, type, row, meta) {
                            const info = RequiredDocumentPage.table.page.info();
                            const index = meta.row + 1 + info.page * info.length;
                            return index;
                        }
                    },
                    {
                        data: "name",
                        render: function (data, type, row, meta) {
                            return `<span data-required-document-id='${row.id}'>${AppUtils.escapeHtml(data) ?? ""}</span>`; // Văn bản yêu cầu
                        }
                    },
                    {
                        data: "documentTypeName",
                        render: function (data, type, row, meta) {
                            return `<span data-required-document-id='${row.id}'>${AppUtils.escapeHtml(data) ?? ""}</span>`; // Loại văn bản
                        }
                    },
                    {
                        data: "officeName",
                        render: function (data, type, row, meta) {
                            return `<div data-required-document-id='${row.id}'>${AppUtils.escapeHtml(data) ?? ""}</div>`; // Văn phòng
                        }
                    },
                    {
                        data: "forParty",
                        render: function (data, type, row, meta) {
                            return `<div data-required-document-id='${row.id}'>${AppUtils.escapeHtml(data) ?? ""}</div>`; // Tổ chức
                        }
                    },
                    {
                        data: "isMandatory",
                        render: function (data, type, row, meta) {
                            if (data) {
                                return `<div data-required-document-id='${row.id}'>Bắt buộc</div>`;
                            }
                            else {
                                return `<div data-required-document-id='${row.id}'>Không bắt buộc</div>`;
                            }
                        }
                    },
                    {
                        data: "createdDate",
                        render: function (data, type, row, meta) {
                            const displayValue = data ? moment(data).format("DD/MM/YYYY HH:mm:ss") : '';
                            return `<span data-required-document-id='${row.id}'>${displayValue}</span>`; // Ngày tạo
                        }
                    },
                    {
                        data: 'id',
                        className: 'text-end',
                        render: function (data, type, row, meta) {
                            return `<a href="#" class="btn btn-light btn-active-light-primary btn-flex btn-center btn-sm" data-kt-menu-trigger="click" data-kt-menu-placement="bottom-end" data-kt-menu-flip="top-end">
                                        ${RequiredDocumentPage.message.actions}
                                        <i class="ki-duotone ki-down fs-5 ms-1"></i>
                                    </a>
                                    <div class="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg-light-primary fw-semibold fs-7 w-125px py-4" data-kt-menu="true">
                                        <div class="menu-item px-3">
                                            <a href="#" class="menu-link px-3 btn-edit" data-kt-docs-table-filter="edit_row" data-required-document-id="${data}">
                                                ${RequiredDocumentPage.message.edit}
                                            </a>
                                        </div>
                                        <div class="menu-item px-3">
                                            <a href="#" class="text-danger menu-link px-3 btn-delete" data-kt-required-documents-table-filter="delete_row" data-required-document-id="${data}">
                                                ${RequiredDocumentPage.message.delete}
                                            </a>
                                        </div>
                                    </div>`; // Thao tác
                        }
                    },

                ],
                columnDefs: [
                    { targets: "no-sort", orderable: false },
                    { targets: "no-search", searchable: false },
                    { orderable: false, targets: [-1, 0, 1, 3] },
                ],
                aLengthMenu: [
                    [10, 25, 50, 100],
                    [10, 25, 50, 100]
                ],
                drawCallback: function () {
                    $('#requireddocument_datatable tfoot').html("");
                    $("#requireddocument_datatable thead tr").clone(true).appendTo("#requireddocument_datatable tfoot");
                    $('#requireddocument_datatable tfoot tr').addClass("border-top");
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

            AppUtils.createSelect2("#required_document_documentTypeName", {
                url: ApiRoutes.DocumentType.v1.GetByCurrentUser,
                placeholder: "Chọn loại hồ sơ",
                minimumInputLength: 3,
                select2Options: {
                    dropdownParent: $("#kt_modal_required_document"),
                }
            });

            AppUtils.createSelect2("#filter_documentTypeId", {
                url: ApiRoutes.DocumentType.v1.GetByCurrentUser,
                placeholder: "Chọn loại hồ sơ",
                minimumInputLength: 3,
                allowClear: true,
                select2Options: {
                    dropdownParent: $("#required_document_filter"),
                    closeOnSelect: false,
                }
            });

            AppUtils.createSelect2("#filter_officeId", {
                url: ApiRoutes.Office.v1.GetByCurrentUser,
                placeholder: "Chọn văn phòng",
                allowClear: true,
                select2Options: {
                    dropdownParent: $("#required_document_filter"),
                    closeOnSelect: false,
                }
            });

            $("#required_document_forParty").select2({
                language: currentLang,
                placeholder: "Chọn tài liệu cho bên nào",
                dropdownParent: $("#kt_modal_required_document"),
                allowClear: true
            });

            $("#filter_forParty").select2({
                language: currentLang,
                placeholder: "Chọn tài liệu cho bên nào",
                dropdownParent: $("#required_document_filter"),
                allowClear: true
            });

            $("#required_document_isMandatory").select2({
                language: currentLang,
                placeholder: "Có bắt buộc không",
                dropdownParent: $("#kt_modal_required_document"),
            });

            $("#filter_isMandatory").select2({
                language: currentLang,
                placeholder: "Có bắt buộc không",
                dropdownParent: $("#required_document_filter"),
                allowClear: true
            });
        },
        regenDataTable: function () {
            if (this.table) {
                this.table.destroy();
                $("#requireddocument_datatable tbody").html("");
                this.initDataTable();
            }
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
            this.bindSaveEvent();
            this.bindClearFilterDateRangeEvent();
        },
        bindEditEvent: function () {
            $("#requireddocument_datatable tbody").on("click", ".btn-edit", function () {
                const id = $(this).attr("data-required-document-id");
                editItem(id);
            });
        },
        bindDeleteEvent: function () {
            $("#requireddocument_datatable tbody").on("click", ".btn-delete", function () {
                const id = $(this).attr("data-required-document-id");
                deleteItem(id);
            });
        },
        bindSearchAllEvents: function () {
            $("#requireddocument_datatable_search").on("keyup", AppUtils.debounce(function () {
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
            $("#btn_add_required_document").on("click", function () {
                addItem();
            })
        },
        bindSaveEvent: function () {
            //$("#btn_save_user").on("click", function (e) {
            //    e.preventDefault();
            //    saveData();
            //})
        },
        bindClearFilterDateRangeEvent: function () {
            $("#clear_filter_created_date i").on("click", function () {
                RequiredDocumentPage.plugins.dateRangePickerFilter.clear();
            })
            $("#clear_filter_created_date").on("click", function () {
                RequiredDocumentPage.plugins.dateRangePickerFilter.clear();
            })
        },
        loadRelatedData: function () {
            //loadDataDocumentTypes();
            //loadDataOffices();
        }
    }

    /**
     * Handle add new user
     */
    function addItem() {
        RequiredDocumentPage.formValidator.clearErrors();
        $("#kt_modal_required_document_header h2").text(`${RequiredDocumentPage.message.create} ${RequiredDocumentPage.message.pageTitle.toLocaleLowerCase()}`);
        $("#kt_modal_required_document_form input[type='text'],#kt_modal_required_document_form textarea, #kt_modal_required_document_form select").val("").trigger("change");
        $("#kt_modal_required_document_form input[type='color']").val("#000").trigger("change");
        $("#required_document_createdDate").val(moment().format("DD/MM/YYYY HH:mm:ss")).trigger("change");
        $("#required_document_id").val("");
    }

    /**
     * Author: 
     * CreatedDate: 
     * Description: Edit user by id
     * @param {number} id
     */
    async function editItem(id) {
        RequiredDocumentPage.formValidator.clearErrors();
        $("#global_loader").addClass("show");
        try {
            const response = await httpService.getAsync(ApiRoutes.RequiredDocument.v1.Detail(id));
            const data = response.resources;
            $("#required_document_id").val(data.id); // Hidden field for ID
            $("#requireddocument_name").val(data.name); // Văn bản yêu cầu
            if ($("#required_document_documentTypeName").find(`option[value='${data.documentTypeId}']`).length == 0) {
                $("#required_document_documentTypeName").append(new Option(data.documentTypeName, data.documentTypeId, true, true));
                $("#required_document_documentTypeName").trigger("change");// Loại văn bản (ID từ API)
            }
            else {
                $("#required_document_documentTypeName").val(data.documentTypeId).trigger("change");// Loại văn bản (ID từ API)
            }

            //$("#required_document_officeName").val(data.officeId || '').trigger("change"); // Văn phòng (ID từ API)
            $("#required_document_office_id").val(data.officeId);
            $("#required_document_forParty").val(data.forParty).trigger("change"); // Tổ chức
            $("#required_document_isMandatory").val(data.isMandatory ? 'true' : 'false').trigger("change"); // Mức độ quan trọng
            $("#required_document_createdDate").val(data.createdDate ? moment(data.createdDate).format("DD/MM/YYYY") : 'Không có dữ liệu'); // Ngày tạo

            $("#kt_modal_required_document_header h2").text(`${RequiredDocumentPage.message.edit} ${RequiredDocumentPage.message.pageTitle.toLocaleLowerCase()}`);
            $("#kt_modal_required_document").modal("show");
        } catch (e) {
            console.error(e);
            Swal.fire({
                icon: "error",
                title: RequiredDocumentPage.message.errorTitle,
                html: RequiredDocumentPage.message.notFound,
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
     * Description: Delete user by id
     * @param {number} id
     */
    async function deleteItem(id) {

        const { isConfirmed } = await Swal.fire({
            icon: "question",
            title: RequiredDocumentPage.message.confirmTittle,
            html: RequiredDocumentPage.message.deleteConfirm,
            ...AppSettings.sweetAlertOptions(true)
        });

        if (!isConfirmed)
            return;

        $("#global_loader").addClass("show");
        try {
            const response = await httpService.deleteAsync(ApiRoutes.RequiredDocument.v1.Delete(id));
            if (response?.isSucceeded) {
                /*tableSearch();*/
                RequiredDocumentPage.refreshDataTable();
                Swal.fire({
                    icon: "success",
                    title: RequiredDocumentPage.message.successTitle,
                    html: RequiredDocumentPage.message.deleteSuccess,
                    ...AppSettings.sweetAlertOptions(false)
                })
            }
        } catch (e) {
            console.error(e);
            Swal.fire({
                icon: "error",
                title: RequiredDocumentPage.message.failTitle,
                html: RequiredDocumentPage.message.deleteError,
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

        const btnSave = $("#btn_save_required_document");
        btnSave.attr("disabled", true);

        const data = {
            id: $("#required_document_id").val(),
            name: $("#requireddocument_name").val(),
            officeId: $("#required_document_office_id").val(),
            isMandatory: $("#required_document_isMandatory").val() === "true",
            documentTypeId: $("#required_document_documentTypeName").val(),
            forParty: $("#required_document_forParty").val(),
        };

        const isAdd = !data.id;
        const confirmText = isAdd ? RequiredDocumentPage.message.createConfirm : RequiredDocumentPage.message.updateConfirm;
        const { isConfirmed } = await Swal.fire({
            icon: 'question',
            title: RequiredDocumentPage.message.confirmTittle,
            html: confirmText,
            ...AppSettings.sweetAlertOptions(true)
        });

        if (isConfirmed) {
            btnSave.attr("data-kt-indicator", "on");
            try {
                const response = isAdd ?
                    await httpService.postAsync(ApiRoutes.RequiredDocument.v1.Create, data) :
                    await httpService.putAsync(ApiRoutes.RequiredDocument.v1.Update, data);
                if (response?.isSucceeded) {
                    if (isAdd) {
                        $("#requireddocument_datatable_search").val("").trigger("change");
                        resetFilter();
                    }
                    else {
                        /*tableSearch();*/
                        RequiredDocumentPage.refreshDataTable();
                    }

                    $("#kt_modal_required_document").modal("hide");
                    const successText = isAdd ? RequiredDocumentPage.message.createSuccess : RequiredDocumentPage.message.updateSuccess;
                    Swal.fire({
                        icon: "success",
                        title: RequiredDocumentPage.message.successTitle,
                        html: successText,
                        ...AppSettings.sweetAlertOptions(false)
                    });
                }

            } catch (e) {
                //const { responseJSON } = e;
                //let errorText = "";
                //let errorTitle = "";
                //let icon = ""
                //if (responseJSON?.status === AppSettings.httpStatusCode.UNPROCESSABLE_ENTITY) {
                //    icon = "warning";
                //    errorTitle = RequiredDocumentPage.message.validationError;

                //    const messages = [];
                //    responseJSON?.errors?.forEach(error => {
                //        error.message.forEach(item => {
                //            messages.push(`<li class="text-start">${item}</li>`);
                //        })
                //    });
                //    errorText = `<ul>${messages.join("")}</ul>`;
                //}
                //else {
                //    icon = "error";
                //    errorTitle = RequiredDocumentPage.message.failTitle;
                //    errorText = isAdd ? RequiredDocumentPage.message.createError : RequiredDocumentPage.message.updateError;
                //}
                //Swal.fire({
                //    icon: icon,
                //    title: errorTitle,
                //    html: errorText,
                //    ...AppSettings.sweetAlertOptions(false)
                //});

                AppUtils.handleApiError(e, {
                    action: isAdd ? "create" : "update",
                    name: RequiredDocumentPage.message.pageTitle,
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
        RequiredDocumentPage.table.column(5).search($("#filter_created_date").val());
        RequiredDocumentPage.table.search($("#requireddocument_datatable_search").val().trim()).draw();
    }

    /**
     * Reset filter
     */
    function resetFilter() {
        $("#filter_name").val("");
        $("#filter_forParty").val("").trigger("change");
        $("#filter_documentTypeId").val("").trigger("change");
        $("#filter_officeId").val("").trigger("change");
        $("#filter_isMandatory").val("").trigger("change");
        /*        $("[data-control=select2]").val("").trigger("change");*/
        RequiredDocumentPage.plugins.dateRangePickerFilter.clear();
        /*$("#filter_created_date").val("").trigger("change");*/
        tableSearch();
    }

    /**
 * Load data for Document Types
 */
    async function loadDataDocumentTypes() {
        try {
            const response = await httpService.getAsync(ApiRoutes.DocumentType.v1.List); // Giả định có endpoint này
            const data = response.resources;
            //$("#required_document_documentTypeName").empty(); // Xóa các option cũ
            //$("#required_document_documentTypeName").append(new Option("", "", true, true)); // Thêm option mặc định
            //$("#filter_documentTypeId").empty();
            /*            $("#filter_documentTypeId").append(new Option("Tất cả", "", true, true));*/
            data.forEach(function (item) {
                $("#required_document_documentTypeName").append(new Option(item.name, item.id, false, false));
                $("#filter_documentTypeId").append(new Option(item.name, item.id, false, false));
            });
            //$("#required_document_documentTypeName").trigger("change");
            //$("#filter_documentTypeId").trigger("change");
        } catch (e) {
            console.error(e);
        }
    }

    /**
     * Load data for Offices
     */
    async function loadDataOffices() {
        try {
            const response = await httpService.getAsync(ApiRoutes.Office.v1.List);
            const data = response.resources;
            //$("#required_document_office_id").empty();
            //$("#required_document_office_id").append(new Option("", "", true, true));
            //$("#filter_officeId").empty();
            //$("#filter_officeId").append(new Option("Tất cả", "", true, true));
            data.forEach(function (item) {
                $("#required_document_office_id").append(new Option(item.name, item.id, false, false));
                $("#filter_officeId").append(new Option(item.name, item.id, false, false));
            });
            //$("#required_document_office_id").trigger("change");
            //$("#filter_officeId").trigger("change");
        } catch (e) {
            console.error(e);
        }
    }

    // On document ready
    KTUtil.onDOMContentLoaded(async function () {
        await AppEntry.init();
        RequiredDocumentPage.init();
    });
})();