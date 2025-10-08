"use strict";

(function () {
    // Class definition
    const DocumentTypeDetailPage = {
        blockUI: null,
        elements: {
            datatable: $("#document_type_datatable"),
            addUpdateModal: $("#kt_modal_document_type"),
            addUpdateModalHeader: $("#kt_modal_document_type_header h2"),
            btnSave: $("#btn_save_document_type"),
            btnAdd: $("#btn_add_document_type"),
            searchInput: $("#document_type_datatable_search"),
            filterForm: $("[data-kt-document-type-table-filter='form']"),
            filterButton: $("[data-kt-document-type-table-filter='filter']"),
            resetButton: $("[data-kt-document-type-table-filter='reset']"),
            listVariable: $("#list_variables")
        },
        userRoles: AppUtils.getRoles(),
        permissionFlags: AppUtils.getPermissionFlags("/document-type/list"),
        table: null,
        feeRuleTable: null,
        serviceFeeTable: null,
        formValidator: null,
        formRequiredDocumentValidator: null,
        editorInstance: null,
        requiredDocumentSource: [],
        selectedDocument: null,
        feeRuleSource: [],
        feeRuleSelected: [],
        serviceFeeSource: [],
        serviceFeeSelected: [],
        plugins: {
            dateRangePickerFilter: null
        },
        messages: {
            pageTitle: I18n.t("document_type", "PAGE_TITLE"),
            actions: I18n.t("common", "ACTIONS"),
            create: I18n.t("common", "ADD_NEW"),
            edit: I18n.t("common", "EDIT"),
            delete: I18n.t("common", "DELETE"),
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
            validationError: I18n.t("common", "VALIDATION_ERROR"),
            requiredDocumentTitle: I18n.t("required_document", "PAGE_TITLE"),
            deleteRequiredDocumentConfirm: I18n.t("common", "DELETE_CONFIRM", { name: I18n.t("required_document", "PAGE_TITLE").toLocaleLowerCase() }),
            saveRequiredDocumentConfirm: I18n.t("common", "SAVE_CONFIRM", { name: I18n.t("required_document", "PAGE_TITLE").toLocaleLowerCase() }),
        },
        init: async function () {
            this.blockUI = new KTBlockUI(document.querySelector("#kt_app_content"));
            this.checkPermissions();
            await loadDocumentTypeData();
            this.initPlugins();
            this.bindEvents();
            this.initFormValidation();
            this.loadRelatedData();
            this.initRequiredDocumentTable();
            //loadDocumentCategory();
        },
        checkPermissions: function () {
            const ísAdmin = this.userRoles.some(x => x.id === AppSettings.roles.ADMIN);
            const canModify = (DocumentTypeDetailPage.permissionFlags.canCreate || DocumentTypeDetailPage.permissionFlags.canUpdate) && !ísAdmin;
            if (!canModify) {
                $("#kt_modal_document_type_form button, #kt_modal_document_type_form input, #kt_modal_document_type_form select, #kt_modal_document_type_form textarea").attr("disabled", true);
            }

        },
        initRequiredDocumentTable() {
            const ísAdmin = this.userRoles.some(x => x.id === AppSettings.roles.ADMIN);
            const canModify = (DocumentTypeDetailPage.permissionFlags.canCreate || DocumentTypeDetailPage.permissionFlags.canUpdate) && !ísAdmin;
            let html = "";
            if (DocumentTypeDetailPage.requiredDocumentSource.length === 0) {
                html = "<tr><td colspan='5' class='text-center'>Không có dữ liệu</td></tr>"
            }
            else {
                html += DocumentTypeDetailPage.requiredDocumentSource.map((item, index) => `<tr>
                    <td>${index + 1}</td>
                    <td>${AppUtils.escapeHtml(item.name)}</td>
                    <td>${AppUtils.escapeHtml(item.forParty)}</td>
                    <td>${AppUtils.escapeHtml(item.isMandatory ? "Bắt buộc" : "Không bắt buộc")}</td>
                    <td>${item.templateDocument?.fileName ?? ""}</td>
                    <td class="text-end">
                        <a href="#" class="btn btn-light btn-active-light-primary btn-flex btn-center btn-sm ${canModify ? "" : "disabled"}" data-kt-menu-trigger="click" data-kt-menu-placement="bottom-end" data-kt-menu-flip="top-end">
                                                ${DocumentTypeDetailPage.messages.actions}
                                                <i class="ki-duotone ki-down fs-5 ms-1"></i>
                        </a>
                        <div class="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg-light-primary fw-semibold fs-7 w-125px py-4" data-kt-menu="true">
                            <div class="menu-item px-3">
                                <a href="#!" class="menu-link px-3 btn-edit" data-kt-docs-table-filter="edit_row" data-required-document-id="${index + 1}">
                                    ${DocumentTypeDetailPage.messages.edit}
                                </a>
                            </div>
                            <div class="menu-item px-3">
                                <a href="#!" class="text-danger menu-link px-3 btn-delete" data-kt-required-documents-table-filter="delete_row" data-required-document-id="${index + 1}">
                                    ${DocumentTypeDetailPage.messages.delete}
                                </a>
                            </div>
                        </div>
                    </td>
            </tr>`).join("");
            }
            $("#document_type_requireddocument_datatable tbody").html(html);
            KTMenu.createInstances();
        },
        initFeeRuleTable: function () {
            this.feeRuleTable = $("#document_type_fee_rule_datatable").DataTable({
                paging: true,
                searching: { regex: true },
                order: [1, 'asc'],
                pageLength: 5,
                /*                scrollY: 400,*/
                language: AppSettings.dataTableLanguage.vi,
                data: this.feeRuleSource,
                columns: [
                    {
                        data: "id",
                        render: function (data, type, row, meta) {                           
                            return `<div class="form-check form-check-sm form-check-custom form-check-solid">
                                        <input class="form-check-input cursor-pointer" type="checkbox" data-fee-rule-id='${row.id}' />
                                    </div>`;
                        },
                    },
                    {
                        data: "name",
                        render: function (data, type, row, meta) {
                            return `<span class='text-gray-800 text-hover-primary mb-1' data-fee-rule-id='${row.id}'>${AppUtils.escapeHtml(row.name)}<span>`;
                        },
                    },
                    {
                        data: "id",
                        className: 'text-end',
                        render: function (data, type, row, meta) {
                            return `<span data-fee-rule-id='${row.id}'>${AppUtils.numberWithCommas(row.minValue)} - ${AppUtils.numberWithCommas(row.maxValue)}<span>`;
                        },
                    },
                    {
                        data: "feeAmount",
                        className: 'text-end',
                        render: function (data, type, row, meta) {
                            return `<span data-fee-rule-id='${row.id}'>${AppUtils.numberWithCommas(row.feeAmount)}<span>`;
                        },
                    },
                    {
                        data: "percentRate",
                        className: 'text-end',
                        render: function (data, type, row, meta) {
                            return `<span data-fee-rule-id='${row.id}'>${row.percentRate ?? 0} %<span>`;
                        },
                    },
                    {
                        data: "isFixed",
                        render: function (data, type, row, meta) {
                            return `<span data-fee-rule-id='${row.id}'>${row.isFixed ? `<i class="ki-duotone ki-check text-success"></i>` : ""}<span>`;
                        },
                    },
                    {
                        data: "description",
                        render: function (data, type, row, meta) {
                            return `<span data-fee-rule-id='${row.id}'>${AppUtils.escapeHtml(row.description).replaceAll("\n", "<br>")}<span>`;
                        },
                    }

                ],
                columnDefs: [
                    { targets: "no-sort", orderable: false },
                    { targets: "no-search", searchable: false },
                    { orderable: false, targets: [0] },
                ],
                aLengthMenu: [
                    [5, 10, 25, 50, 100],
                    [5, 10, 25, 50, 100]
                ],
                drawCallback: function () {
                    const checkboxes = $("#document_type_fee_rule_datatable tbody input");
                    Array.from(checkboxes).forEach(item => {
                        const id = Number($(item).attr("data-fee-rule-id"));
                        $(item).prop("checked", DocumentTypeDetailPage.feeRuleSelected.includes(id))
                    })
                    const ísAdmin = DocumentTypeDetailPage.userRoles.some(x => x.id === AppSettings.roles.ADMIN);
                    const canModify = (DocumentTypeDetailPage.permissionFlags.canCreate || DocumentTypeDetailPage.permissionFlags.canUpdate) && !ísAdmin;
                    if (!canModify)
                        $("#document_type_fee_rule_datatable tbody input").attr("disabled", true);
                    //const isCheckAll = $("#document_type_fee_rule_checkAll").is(":checked");
                    //$("#document_type_fee_rule_datatable tbody input").prop("checked", isCheckAll).trigger("change");
                    //$('#document_type_fee_rule_datatable tfoot').html("");
                    //$("#document_type_fee_rule_datatable thead tr").clone(true).appendTo("#document_type_fee_rule_datatable tfoot");
                    //$('#document_type_fee_rule_datatable tfoot tr').addClass("border-top");
                }
            })
        },
        initServiceRuleTable: function () {
            this.serviceFeeTable = $("#document_type_service_fee_datatable").DataTable({
                paging: true,
                searching: { regex: true },
                order: [1, 'asc'],
                pageLength: 5,
                language: AppSettings.dataTableLanguage.vi,
                data: this.serviceFeeSource,
                columns: [
                    {
                        data: "id",
                        render: function (data, type, row, meta) {
                            return `<div class="form-check form-check-sm form-check-custom form-check-solid">
                                        <input class="form-check-input cursor-pointer" type="checkbox" data-service-fee-id='${row.id}'/>
                                    </div>`;
                        },
                    },
                    {
                        data: "name",
                        render: function (data, type, row, meta) {
                            return `<span class='text-gray-800 text-hover-primary mb-1' data-service-fee-id='${row.id}'>${AppUtils.escapeHtml(row.name)}<span>`;
                        },
                    },
                    {
                        data: "serviceFeeCategoryName",
                        render: function (data, type, row, meta) {
                            return `<span class='text-gray-800 text-hover-primary mb-1' data-service-fee-id='${row.id}'>${AppUtils.escapeHtml(row.serviceFeeCategoryName)}<span>`;
                        },
                    },
                    {
                        data: "id",
                        className: 'text-end',
                        render: function (data, type, row, meta) {
                            return `<span data-service-fee-id='${row.id}'>${AppUtils.numberWithCommas(row.minValue)} - ${AppUtils.numberWithCommas(row.maxValue)}<span>`;
                        },
                    },
                    {
                        data: "unitPrice",
                        className: 'text-end',
                        render: function (data, type, row, meta) {
                            return `<span data-service-fee-id='${row.id}'>${AppUtils.numberWithCommas(row.unitPrice)}<span>`;
                        },
                    },
                    {
                        data: "isPerUnit",
                        render: function (data, type, row, meta) {
                            return `<span data-service-fee-id='${row.id}'>${row.isPerUnit ? `<i class="ki-duotone ki-check text-success"></i>` : ""}<span>`;
                        },
                    },
                    {
                        data: "unitType",
                        render: function (data, type, row, meta) {
                            return `<span data-service-fee-id='${row.id}'>${AppUtils.escapeHtml(row.unitType)}<span>`;
                        },
                    }

                ],
                columnDefs: [
                    { targets: "no-sort", orderable: false },
                    { targets: "no-search", searchable: false },
                    { orderable: false, targets: [0] },
                ],
                aLengthMenu: [
                    [5, 10, 25, 50, 100],
                    [5, 10, 25, 50, 100]
                ],
                drawCallback: function () {
                    const checkboxes = $("#document_type_service_fee_datatable tbody input");
                    Array.from(checkboxes).forEach(item => {
                        const id = Number($(item).attr("data-service-fee-id"));
                        $(item).prop("checked", DocumentTypeDetailPage.serviceFeeSelected.includes(id))
                    })

                    const ísAdmin = DocumentTypeDetailPage.userRoles.some(x => x.id === AppSettings.roles.ADMIN);
                    const canModify = (DocumentTypeDetailPage.permissionFlags.canCreate || DocumentTypeDetailPage.permissionFlags.canUpdate) && !ísAdmin;
                    if (!canModify)
                        $("#document_type_service_fee_datatable tbody input").attr("disabled", true);
                }
            })
        },
        bindEvents: function () {
            // Gộp tất cả events vào một hàm          
            this.bindSaveEvent();
            this.bindClickVariableEvent();
            this.bindGoBackEvent();
            this.bindAddRequiredDocumentEvent();
            this.bindEditRequiredDocumentEvent();
            this.bindDeleteRequiredDocumentEvent();
            this.bindFeeRuleSearchAllEvents();
            this.bindServiceFeeSearchAllEvents();
            this.bindCheckAllFeeRuleEvent();
            this.bindCheckAllServiceFeeEvent();
            this.bindSelectedFeeRuleEvent();
            this.bindUploadTemplateFileEvent();
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
                                message: I18n.t("common", "REQUIRED", { field: "Tên mẫu hợp đồng - giao dịch" })
                            },
                            {
                                name: "maxLength",
                                message: I18n.t("common", "TOO_LONG", { field: "Tên mẫu hợp đồng - giao dịch", max: 255 }),
                                params: 255
                            }
                        ]
                    },
                    {
                        element: "#document_type_description",
                        rule: [
                            {
                                name: "maxLength",
                                message: I18n.t("common", "TOO_LONG", { field: "Mô tả", max: 500 }),
                                params: 500,
                            }
                        ]
                    },
                    {
                        element: "#document_type_documentCategoryId",
                        rule: [
                            {
                                name: "required",
                                message: I18n.t("common", "REQUIRED_SELECT", { field: "Danh mục hợp đồng - giao dịch" })
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

            this.formRequiredDocumentValidator = new FormValidator({
                formSelector: "#kt_modal_required_document_form",
                handleSubmit: saveRequiredDocument,
                rules: [
                    {
                        element: "#required_document_name",
                        rule: [
                            {
                                name: "required",
                                message: I18n.t("common", "REQUIRED", { field: "Tên tài liệu" })
                            },
                            {
                                name: "maxLength",
                                message: I18n.t("common", "TOO_LONG", { field: "Tên tài liệu", max: 255 }),
                                params: 255
                            }
                        ]
                    },
                    {
                        element: "#required_document_isMandatory",
                        rule: [
                            {
                                name: "required",
                                message: I18n.t("common", "REQUIRED_SELECT", { field: "Có bắt buộc không" })
                            }
                        ]
                    },
                ]
            });
        },
        initPlugins: function () {
            //AppUtils.createSelect2("#document_type_documentCategoryId", {
            //    url: ApiRoutes.DocumentCategory.v1.GetByCurrentUser,
            //    cache: true,
            //    placeholder: 'Chọn nhóm hợp đồng',
            //});

            $("#required_document_isMandatory").select2({
                language: currentLang,
                placeholder: "Có bắt buộc không",
                dropdownParent: $("#kt_modal_required_document"),
            });

            $("#required_document_forParty").select2({
                language: currentLang,
                placeholder: "Chọn tài liệu cho bên nào",
                dropdownParent: $("#kt_modal_required_document"),
                allowClear: true
            });

            $("#document_type_feeRuleIds").select2({
                language: currentLang,
                placeholder: "Chọn phí công chứng",
                allowClear: true
            });

            $("#document_type_serviceFeeIds").select2({
                language: currentLang,
                placeholder: "Chọn phí thù lao",
                allowClear: true
            });

            CKEDITOR.replace('document_type_templateContent', AppSettings.ckEditorSettingsForA4Paper);
            this.editorInstance = CKEDITOR.instances["document_type_templateContent"];

            FileManager.init({
                acceptTypes: "application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                loadTypes: ["application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
                onChooseFile: (file) => {
                    $("#required_document_templateDocumentId").val(file.id);
                    $("#required_document_template_file_display").val(file.fileName).trigger("change");
                    this.selectedDocument = file;
                }
            });
        },
        bindSaveEvent: function () {

        },
        bindClickVariableEvent: function () {
            this.elements.listVariable.on("click", ".variable-item", function () {
                const ísAdmin = DocumentTypeDetailPage.userRoles.some(x => x.id === AppSettings.roles.ADMIN);
                const canModify = (DocumentTypeDetailPage.permissionFlags.canCreate || DocumentTypeDetailPage.permissionFlags.canUpdate) && !ísAdmin;
                if (canModify) {
                    const code = $(this).attr("data-code");
                    const html = `<span class="template-variable" data-code="{{${code}}}">[${code}]</span>&nbsp;`;
                    DocumentTypeDetailPage.editorInstance.insertHtml(html)
                }
            })
        },
        bindGoBackEvent: function () {
            $("#btn_go_back_list_document_type").on("click", function () {
                window.location.href = "/document-type/list";
            });
        },
        bindEditRequiredDocumentEvent: function () {
            $("#document_type_requireddocument_datatable tbody").on("click", ".btn-edit", function () {
                const id = $(this).attr("data-required-document-id");
                editRequiredDocumentItem(id);
            });
        },
        bindDeleteRequiredDocumentEvent: function () {
            $("#document_type_requireddocument_datatable tbody").on("click", ".btn-delete", function () {
                const id = $(this).attr("data-required-document-id");
                deleteRequiredDocumentItem(id);
            });
        },
        bindAddRequiredDocumentEvent: function () {
            $("#btn_add_required_document").on("click", function () {
                addRequiredDocumentItem();
            })
        },
        bindFeeRuleSearchAllEvents: function () {
            $("#document_type_fee_rule_datatable_search").on("keyup", function () {
                feeRuleDataTableSearch();
            })
        },
        bindServiceFeeSearchAllEvents: function () {
            $("#document_type_serive_fee_datatable_search").on("keyup", function () {
                serviceFeeDataTableSearch();
            })
        },
        bindCheckAllFeeRuleEvent: function () {
            $("#document_type_fee_rule_checkAll").on("change", function () {
                const isCheck = $(this).is(":checked");
                $("#document_type_fee_rule_datatable tbody input").prop("checked", isCheck);
                if (isCheck) {
                    DocumentTypeDetailPage.feeRuleSelected = DocumentTypeDetailPage.feeRuleSource.map(item => item.id);
                }
                else {
                    DocumentTypeDetailPage.feeRuleSelected = [];
                }
            })
        },
        bindCheckAllServiceFeeEvent: function () {
            $("#document_type_service_fee_checkAll").on("change", function () {
                const isCheck = $(this).is(":checked");
                $("#document_type_service_fee_datatable tbody input").prop("checked", isCheck);
                if (isCheck) {
                    DocumentTypeDetailPage.serviceFeeSelected = DocumentTypeDetailPage.serviceFeeSource.map(item => item.id);
                }
                else {
                    DocumentTypeDetailPage.serviceFeeSelected = [];
                }
            })
        },
        bindSelectedFeeRuleEvent: function () {
            $("#document_type_fee_rule_datatable tbody").on("click", ".form-check-input", function () {
                const isCheck = $(this).is(":checked");
                const id = Number($(this).attr("data-fee-rule-id"));
                if (isCheck && !DocumentTypeDetailPage.feeRuleSelected.includes(id)) {
                    DocumentTypeDetailPage.feeRuleSelected.push(id);
                }
                else if (!isCheck && DocumentTypeDetailPage.feeRuleSelected.includes(id)) {
                    const index = DocumentTypeDetailPage.feeRuleSelected.indexOf(id);
                    DocumentTypeDetailPage.feeRuleSelected.splice(index, 1);
                }
            })
        },
        bindSelectedServiceFeeEvent: function () {
            $("#document_type_service_fee_datatable tbody").on("click", ".form-check-input", function () {
                const isCheck = $(this).is(":checked");
                const id = Number($(this).attr("data-service-fee-id"));
                if (isCheck && !DocumentTypeDetailPage.serviceFeeSelected.includes(id)) {
                    DocumentTypeDetailPage.serviceFeeSelected.push(id);
                }
                else if (!isCheck && DocumentTypeDetailPage.serviceFeeSelected.includes(id)) {
                    const index = DocumentTypeDetailPage.serviceFeeSelected.indexOf(id);
                    DocumentTypeDetailPage.serviceFeeSelected.splice(index, 1);
                }
            })
        },
        bindUploadTemplateFileEvent: function () {
            $("#required_document_upload_template_file").on("click", function () {
                FileManager.show();
            })
        },
        loadRelatedData: function () {
            loadListVariables();
            loadFeeRuleData();
            loadServiceFeeData();
        }
    };

    async function loadDocumentCategory() {
        try {
            const response = await httpService.getAsync(ApiRoutes.DocumentCategory.v1.List);
            const data = response.resources || [];
            let lastLabel = 0;
            data.forEach((item, index) => {
                $("#document_type_documentCategoryId").append(new Option(item.name, item.id, false, false));
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

            $("#document_type_documentCategoryId").select2({
                placeholder: "Chọn danh mục hợp đồng - giao dịch",
                language: currentLang,
                templateResult: formatDocumentCategorySelectResult,
                data: data
            });
        } catch (e) {
            $("#document_type_documentCategoryId").select2({
                allowClear: true,
                placeholder: "Chọn danh mục hợp đồng - giao dịch",
                language: currentLang
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

    async function loadFeeRuleData() {
        try {
            //$("#document_type_fee_rule_datatable tbody").append(AppSettings.loadingItem);
            const response = await httpService.getAsync(ApiRoutes.FeeRule.v1.List);
            const data = response?.resources;
            DocumentTypeDetailPage.feeRuleSource = data || [];

        } catch (e) {
            console.error(e);
            DocumentTypeDetailPage.feeRuleSource = [];
            $("#document_type_fee_rule_datatable tbody").html("");
        }
        DocumentTypeDetailPage.initFeeRuleTable();
    }
    function feeRuleDataTableSearch() {
        DocumentTypeDetailPage.feeRuleTable.search($("#document_type_fee_rule_datatable_search").val().trim()).draw();
    }

    function serviceFeeDataTableSearch() {
        DocumentTypeDetailPage.serviceFeeTable.search($("#document_type_serive_fee_datatable_search").val().trim()).draw();
    }

    async function loadServiceFeeData() {
        try {
            const response = await httpService.getAsync(ApiRoutes.ServiceFeeTemplate.v1.GetByCurrentOffice);
            const data = response?.resources;
            DocumentTypeDetailPage.serviceFeeSource = data || [];
        } catch (e) {
            console.error(e);
            DocumentTypeDetailPage.serviceFeeSource = [];
        }
        DocumentTypeDetailPage.initServiceRuleTable();
    }

    async function loadDocumentTypeData() {
        const id = Number(AppUtils.getPathSegment(2));
        $("#document_type_id").val(id);
        await loadDocumentCategory();
        if (id) {
            DocumentTypeDetailPage.blockUI.block();
            //AppSettings.mainElements.GLOBAL_LOADER.addClass("show");
            try {
                const response = await httpService.getAsync(ApiRoutes.DocumentType.v1.Detail(id));
                const data = response?.resources;
                DocumentTypeDetailPage.feeRuleSelected = data.feeRuleIds || [];
                DocumentTypeDetailPage.serviceFeeSelected = data.serviceRuleIds || [];
                DocumentTypeDetailPage.requiredDocumentSource = data.requiredDocuments || [];
                Object.keys(data).forEach(key => {
                    const selector = `#document_type_${key}`;
                    const value = key.toLocaleLowerCase().includes("date") ? moment(data[key].toString()).format("DD/MM/YYYY HH:mm:ss") : data[key];
                    if (key.includes("documentCategoryId")) {
                        if ($(selector).find("option[value='" + data.documentCategoryId + "']").length === 0) {
                            const newOption = new Option(data.documentCategoryName, data.documentCategoryId, true, true);
                            $(selector).append(newOption).trigger('change');
                        } else {
                            $(selector).val(data.documentCategoryId).trigger('change');
                        }
                    }
                    else {
                        $(selector).val(value).trigger("change");
                    }
                })
            } catch (e) {
                AppSettings.mainElements.PAGE_CONTENT.addClass("d-none");
                AppSettings.mainElements.NOT_FOUND.removeClass("d-none");
                console.error(e);
            }
            DocumentTypeDetailPage.blockUI.release();
            //AppSettings.mainElements.GLOBAL_LOADER.removeClass("show");
        }
        else {
            $("#document_type_createdDate").val(moment().format("DD/MM/YYYY HH:mm:ss")).trigger("change");
        }
    }

    async function saveData() {
        const btnSave = DocumentTypeDetailPage.elements.btnSave;
        btnSave.attr("disabled", true);

        const data = {
            id: $("#document_type_id").val(),
            name: $("#document_type_name").val(),
            documentCategoryId: $("#document_type_documentCategoryId").val(),
            description: $("#document_type_description").val(),
            templateContent: DocumentTypeDetailPage.editorInstance.getData(),
            feeRuleIds: DocumentTypeDetailPage.feeRuleSelected,
            serviceRuleIds: DocumentTypeDetailPage.serviceFeeSelected,
            requiredDocuments: DocumentTypeDetailPage.requiredDocumentSource
        };
        const isAdd = Number(data.id) === 0;
        const confirmText = isAdd ? DocumentTypeDetailPage.messages.createConfirm : DocumentTypeDetailPage.messages.updateConfirm;

        const { isConfirmed } = await Swal.fire({
            icon: 'question',
            title: DocumentTypeDetailPage.messages.confirmTittle,
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
                    const successText = isAdd ? DocumentTypeDetailPage.messages.createSuccess : DocumentTypeDetailPage.messages.updateSuccess;
                    Swal.fire({
                        icon: "success",
                        title: DocumentTypeDetailPage.messages.successTitle,
                        html: successText,
                        ...AppSettings.sweetAlertOptions(false)
                    }).then(function () {
                        window.location.href = "/document-type/list";
                    });
                }
            } catch (e) {
                AppUtils.handleApiError(e, {
                    action: isAdd ? "create" : "update",
                    name: DocumentTypeDetailPage.messages.pageTitle,
                    isShowAlert: true
                })
            } finally {
                btnSave.removeAttr("data-kt-indicator");
            }
        }
        btnSave.removeAttr("disabled");
    }

    async function loadListVariables() {
        try {
            DocumentTypeDetailPage.elements.listVariable.append(AppSettings.loadingItem);
            const response = await httpService.getAsync(ApiRoutes.TemplateVariable.v1.GetByCurrentUser);
            const data = response?.resources;
            const html = generateListVariableHtml(data);
            DocumentTypeDetailPage.elements.listVariable.html(html);
        } catch (e) {
            console.error(e);
            DocumentTypeDetailPage.elements.listVariable.html('');
        }
    }

    function generateListVariableHtml(data) {
        let html = "";
        data.forEach(item => {
            html += `<div class="mb-0">
                        <div class="d-flex align-items-center collapsible py-3 toggle collapsed mb-0" data-bs-toggle="collapse" data-bs-target="#group_code_${item.groupCode}">
                            <!--begin::Icon-->
                            <div class="btn btn-sm btn-icon mw-20px btn-active-color-primary me-5">
                                <i class="ki-duotone ki-minus-square toggle-on text-primary fs-1"><span class="path1"></span><span class="path2"></span></i>                
                                <i class="ki-duotone ki-plus-square toggle-off fs-1"><span class="path1"></span><span class="path2"></span><span class="path3"></span></i> 
                            </div>
                            <!--end::Icon-->
                            <!--begin::Title-->
                            <h4 class="text-gray-700 fw-bold cursor-pointer mb-0">
                                ${item.groupCodeName}
                            </h4>
                            <!--end::Title-->
                        </div>
                        <!--begin::Body-->
                        <div id="group_code_${item.groupCode}" class="collapse fs-6 ms-1">
                            ${item.variables.map(variable => `<!--begin::Item-->
                                                        <div class="mb-4">
                                                            <!--begin::Item-->
                                                            <div class="d-flex align-items-center ps-10 mb-n1">
                                                                <!--begin::Bullet-->
                                                                <span class="bullet me-3"></span>
                                                                <!--end::Bullet-->
                                                                <!--begin::Label-->
                                                                <div class="text-gray-600 fw-semibold fs-6 cursor-pointer variable-item" title="${variable.description}" data-code="${variable.groupCode}.${variable.code}">
                                                                    ${variable.displayName}
                                                                </div>
                                                                <!--end::Label-->
                                                            </div>
                                                            <!--end::Item-->
                                                        </div>
                                                        <!--end::Item-->`).join("")
                }
                        </div>
                        <!--end::Content-->
                        <!--begin::Separator-->
                        <div class="separator separator-dashed"></div>
                        <!--end::Separator-->
                    </div>`;
        });

        return html;
    }
    function addRequiredDocumentItem() {
        DocumentTypeDetailPage.selectedDocument = null;
        DocumentTypeDetailPage.formRequiredDocumentValidator.clearErrors();
        $("#kt_modal_required_document_header h2").text(`${DocumentTypeDetailPage.messages.create} ${DocumentTypeDetailPage.messages.requiredDocumentTitle.toLocaleLowerCase()}`);
        $("#kt_modal_required_document input[type='text'],#kt_modal_required_document select").val("").trigger("change");
        $("#required_document_id").val("").trigger("change");
    }

    function editRequiredDocumentItem(id) {
        DocumentTypeDetailPage.formRequiredDocumentValidator.clearErrors();
        const data = DocumentTypeDetailPage.requiredDocumentSource[id - 1];
        Object.keys(data).forEach(key => {
            const selector = `#required_document_${key}`;
            const value = key.toLocaleLowerCase().includes("date") ? moment(data[key].toString()).format("DD/MM/YYYY HH:mm:ss") : data[key];
            $(selector).val(value).trigger("change");
        })
        $("#required_document_isMandatory").val(data.isMandatory ? "1" : "0").trigger("change");
        $("#required_document_id").val(id).trigger("change");
        $("#required_document_templateDocumentId").val(data.templateDocument?.id).trigger("change");
        $("#required_document_template_file_display").val(data.templateDocument?.fileName).trigger("change");
        DocumentTypeDetailPage.selectedDocument = data.templateDocument;
        $("#kt_modal_required_document_header h2").text(`${DocumentTypeDetailPage.messages.edit} ${DocumentTypeDetailPage.messages.requiredDocumentTitle.toLocaleLowerCase()}`);
        $("#kt_modal_required_document").modal("show");
    }

    async function saveRequiredDocument() {
        const columns = ["name", "forParty", "templateDocumentId"];
        const data = {};
        columns.forEach(key => {
            const selector = `#required_document_${key}`;
            data[key] = $(selector).val();
        });
        data.isMandatory = $("#required_document_isMandatory").val() === "1" ? true : false;
        data.templateDocument = DocumentTypeDetailPage.selectedDocument;
        const isAdd = !$("#required_document_id").val();
        const { isConfirmed } = await Swal.fire({
            icon: 'question',
            title: DocumentTypeDetailPage.messages.confirmTittle,
            html: DocumentTypeDetailPage.messages.saveRequiredDocumentConfirm,
            ...AppSettings.sweetAlertOptions(true)
        });

        if (!isConfirmed)
            return;

        if (isAdd)
            DocumentTypeDetailPage.requiredDocumentSource.push(data);
        else
            DocumentTypeDetailPage.requiredDocumentSource[Number($("#required_document_id").val()) - 1] = data;

        DocumentTypeDetailPage.initRequiredDocumentTable();
        $("#kt_modal_required_document").modal("hide");
    }

    async function deleteRequiredDocumentItem(id) {
        const { isConfirmed } = await Swal.fire({
            icon: "question",
            title: DocumentTypeDetailPage.messages.confirmTittle,
            html: DocumentTypeDetailPage.messages.deleteRequiredDocumentConfirm,
            ...AppSettings.sweetAlertOptions(true)
        });

        if (!isConfirmed)
            return;

        $(`[data-required-document-id="${id}"]`).parents("tr").hide(500, function () {
            DocumentTypeDetailPage.requiredDocumentSource.splice(id - 1, 1);
            DocumentTypeDetailPage.initRequiredDocumentTable();
        });

    }
    // On document ready
    KTUtil.onDOMContentLoaded(async function () {
        await AppEntry.init();
        if (!(DocumentTypeDetailPage.permissionFlags.canUpdate || DocumentTypeDetailPage.permissionFlags.canCreate)) {
            AppSettings.mainElements.PAGE_CONTENT.addClass("d-none");
            AppSettings.mainElements.NOT_FOUND.removeClass("d-none");
        }
        else
            DocumentTypeDetailPage.init();
        /*DocumentTypeDetailPage.init();*/
    });
})();