"use strict";

(function () {
    // Class definition
    const TemplateVariablePage = {
        table: null,
        formValidator: null,
        fields: [],
        currentTemplateVariable: null,
        plugins: {
            dateRangePickerFilter: null
        },
        message: {
            pageTitle: I18n.t("template-variable", "PAGE_TITLE"),
            actions: I18n.t("common", "ACTIONS"),
            create: I18n.t("common", "ADD_NEW"),
            edit: I18n.t("common", "EDIT"),
            delete: I18n.t("common", "DELETE"),
            confirmTittle: I18n.t("common", "CONFIRM_TITLE"),
            successTitle: I18n.t("common", "SUCCESS_TITLE"),
            errorTitle: I18n.t("common", "ERROR_TITLE"),
            failTitle: I18n.t("common", "FAIL_TITLE"),
            warningTitle: I18n.t("common", "WARNING_TITLE"),
            createConfirm: I18n.t("common", "CREATE_CONFIRM", { name: I18n.t("template-variable", "PAGE_TITLE").toLocaleLowerCase() }),
            createSuccess: I18n.t("common", "CREATE_SUCCESS", { name: I18n.t("template-variable", "PAGE_TITLE").toLocaleLowerCase() }),
            createError: I18n.t("common", "CREATE_ERROR", { name: I18n.t("template-variable", "PAGE_TITLE").toLocaleLowerCase() }),
            updateConfirm: I18n.t("common", "UPDATE_CONFIRM", { name: I18n.t("template-variable", "PAGE_TITLE").toLocaleLowerCase() }),
            updateSuccess: I18n.t("common", "UPDATE_SUCCESS", { name: I18n.t("template-variable", "PAGE_TITLE") }),
            updateError: I18n.t("common", "UPDATE_ERROR", { name: I18n.t("template-variable", "PAGE_TITLE").toLocaleLowerCase() }),
            deleteConfirm: I18n.t("common", "DELETE_CONFIRM", { name: I18n.t("template-variable", "PAGE_TITLE").toLocaleLowerCase() }),
            deleteSuccess: I18n.t("common", "DELETE_SUCCESS", { name: I18n.t("template-variable", "PAGE_TITLE").toLocaleLowerCase() }),
            deleteError: I18n.t("common", "DELETE_ERROR", { name: I18n.t("template-variable", "PAGE_TITLE").toLocaleLowerCase() }),
            notFound: I18n.t("common", "NOT_FOUND", { name: I18n.t("template-variable", "PAGE_TITLE").toLocaleLowerCase() }),
            validationError: I18n.t("common", "VALIDATION_ERROR"),
        },
        init: function () {
            this.initPlugins();
            this.initDataTable();
            this.loadRelatedData();
            this.bindEvents();
            this.formValidator = new FormValidator({
                formSelector: "#kt_modal_template_variable_form",
                handleSubmit: saveData,
                rules: [
                    {
                        element: "#template_variable_displayName",
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
                        element: "#template_variable_groupCode",
                        rule: [
                            {
                                name: "required",
                                message: I18n.t("common", "REQUIRED_SELECT", { field: "Nhóm" })
                            },
                        ]

                    },
                    {
                        element: "#template_variable_code",
                        rule: [
                            {
                                name: "required",
                                message: I18n.t("common", "REQUIRED_SELECT", { field: "Mã" })
                            },
                        ]

                    },
                    {
                        element: "#template_variable_description",
                        rule: [
                            {
                                name: "maxLength",
                                message: I18n.t("common", "TOO_LONG", { field: "Mô tả", max: 500 }),
                                params: 500,
                                allowNullOrEmpty: true
                            }
                        ]

                    },
                ]
            });
        },
        initDataTable: function () {
            this.table = $("#templateVariable_datatable").DataTable({
                processing: true,
                serverSide: true,
                paging: true,
                searching: { regex: true },
                order: [6, 'desc'],
                language: AppSettings.dataTableLanguage.vi,
                ajax: {
                    url: ApiRoutes.TemplateVariable.v1.PagedAdvanced,
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
                            const tableSettings = TemplateVariablePage.table.settings()[0];
                            tableSettings.ajax.headers.Authorization = "Bearer " + TokenService.getAccessToken();

                            //Reload lại datatable với token mới
                            TemplateVariablePage.table.ajax.reload();
                        }
                    },
                    data: function (d) {
                        d.displayName = $("#filter_name").val() || null;
                        d.description = $("#filter_description").val() || null;
                        d.code = $("#filter_code").val() || null;
                        d.groupCode = $("#filter_groupCode").val() || null;
                        return JSON.stringify(d);
                    },
                    dataSrc: {
                        data: 'resources.data',
                        draw: 'resources.draw',
                        recordsTotal: 'resources.recordsTotal',
                        recordsFiltered: 'resources.recordsFiltered'
                    }

                },
                columns: [
                    {
                        data: 'id',
                        render: function (data, type, row, meta) {
                            const info = TemplateVariablePage.table.page.info();
                            const index = meta.row + 1 + info.page * info.length;
                            return index; // This contains the row index
                        }
                    },
                    //{
                    //    data: "officeName",
                    //    render: function (data, type, row, meta) {
                    //        return `<span class='text-gray-800 text-hover-primary mb-1' data-template-variable-id='${row.id}'>${row.officeName??""}<span>`;
                    //    },
                    //},
                    {
                        data: "code",
                        render: function (data, type, row, meta) {
                            return `<span class='text-gray-800 text-hover-primary' data-template-variable-id='${row.id}'>${row.code}<span>`;
                        },
                    },

                    {
                        data: "displayName",
                        render: function (data, type, row, meta) {
                            return `<span class='' data-template-variable-id='${row.id}'>${row.displayName}<span>`;
                        },
                    },
                    {
                        data: "description",
                        render: function (data, type, row, meta) {
                            return `<span data-template-variable-id='${row.id}'>${row.description}<span>`;
                        },
                    },
                    {
                        data: "groupCode",
                        render: function (data, type, row, meta) {
                            return `<span data-template-variable-id='${row.id}'>${row.groupCode}<span>`;
                        },
                    },

                    {
                        data: "createdDate",
                        render: function (data, type, row, meta) {
                            const displayValue = moment(data).format("DD/MM/YYYY HH:mm:ss");
                            return `<span data-template-variable-id='${row.id}'>${displayValue}<span>`;
                        }
                    },
                    {
                        data: 'id',
                        className: 'text-end',
                        render: function (data, type, row, meta) {
                            return `<a href="#" class="btn btn-light btn-active-light-primary btn-flex btn-center btn-sm" data-kt-menu-trigger="click" data-kt-menu-placement="bottom-end" data-kt-menu-flip="top-end">
                                                ${TemplateVariablePage.message.actions}
                                                <i class="ki-duotone ki-down fs-5 ms-1"></i>
                                    </a>
                                    <div class="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg-light-primary fw-semibold fs-7 w-125px py-4" data-kt-menu="true">
                                        <div class="menu-item px-3">
                                            <a href="#" class="menu-link px-3 btn-edit" data-kt-docs-table-filter="edit_row" data-template-variable-id="${data}">
                                                ${TemplateVariablePage.message.edit}
                                            </a>
                                        </div>
                                        <div class="menu-item px-3">
                                            <a href="#" class="menu-link px-3 btn-delete text-danger" data-kt-users-table-filter="delete_row" data-template-variable-id="${data}">
                                                ${TemplateVariablePage.message.delete}
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
                    $('#templateVariable_datatable tfoot').html("");
                    $("#templateVariable_datatable thead tr").clone(true).appendTo("#templateVariable_datatable tfoot");
                    $('#templateVariable_datatable tfoot tr').addClass("border-top");
                }
            })

            this.table.on("draw", function () {
                KTMenu.createInstances();
            })
        },
        initPlugins: function () {
            this.plugins.dateRangePickerFilter = $("#filter_template_variable_createdDate").flatpickr({
                dateFormat: "d/m/Y",
                mode: "range",
                conjunction: " - ",
                locale: "vn",
            });

            $("#template_variable_groupCode").select2({
                language: currentLang,
                dropdownParent: $("#kt_modal_template_variable"),
            })

            $("#template_variable_code").select2({
                language: currentLang,
                dropdownParent: $("#kt_modal_template_variable"),
            })

            $("#filter_template_variable_groupCode").select2({
                language: currentLang,
                dropdownParent: $("#template_variable_filter"),
                allowClear: true,
                placeholder: "Chọn nhóm biến"
            })
        },
        regenDataTable: function () {
            if (this.table) {
                this.table.destroy();
                $("#templateVariable_datatable tbody").html("");
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
            this.bindDisplayNameChangeEvent();
            this.bindGroupCodeChangeEvent();
            this.bindToggleFilterEvent();
        },
        bindEditEvent: function () {
            $("#templateVariable_datatable tbody").on("click", ".btn-edit", function () {
                const id = $(this).attr("data-template-variable-id");
                editItem(id);
            });
        },
        bindDeleteEvent: function () {
            $("#templateVariable_datatable tbody").on("click", ".btn-delete", function () {
                const id = $(this).attr("data-template-variable-id");
                deleteItem(id);
            });
        },
        bindSearchAllEvents: function () {
            $("#templateVariable_datatable").on("keyup", AppUtils.debounce(function () {
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
            $("#btn_add_template_variable").on("click", function () {
                addItem();
            })
        },
        bindSaveEvent: function () {
            //$("#btn_save_tag").on("click", function (e) {
            //    e.preventDefault();
            //    saveData();
            //})
        },
        bindClearFilterDateRangeEvent: function () {
            $("#clear_filter_created_date i").on("click", function () {
                TemplateVariablePage.plugins.dateRangePickerFilter.clear();
            })
            $("#clear_filter_created_date").on("click", function () {
                TemplateVariablePage.plugins.dateRangePickerFilter.clear();
            })
        },
        bindDisplayNameChangeEvent: function () {
            $("#template_variable_displayName").on("keyup", function () {
                generateTemplateVariableCode();
            })
        },
        bindGroupCodeChangeEvent: function () {
            $("#template_variable_groupCode").on("change", function () {
                generateTemplateVariableCode();
            })
        },
        loadRelatedData: function () {
            loadDataGroupCode();
            loadAvailableFieldsByGroup();
        },
        bindToggleFilterEvent: function () {
            $("#btn_template_variable_filter").on("click", function () {
                $("#template_variable_filter").slideToggle();
            })
        }
    }

    /**
     * Handle add new template variable
     */
    function addItem() {
        TemplateVariablePage.formValidator.clearErrors();
        $("#kt_modal_template_variable_header h2").text(`${TemplateVariablePage.message.create} ${TemplateVariablePage.message.pageTitle.toLocaleLowerCase()}`);
        $("#kt_modal_template_variable_form input[type='text'],#kt_modal_template_variable_form textarea").val("").trigger("change");
        $("#kt_modal_template_variable_form select").val([]).trigger("change");
        $("#template_variable_createdDate").val(moment().format("DD/MM/YYYY HH:mm:ss")).trigger("change");
    }

    /**
     * Author: 
     * CreatedDate: 
     * Description: Edit template variable by id
     * @param {number} id
     */
    async function editItem(id) {
        TemplateVariablePage.formValidator.clearErrors();
        $("#global_loader").addClass("show");
        try {
            const response = await httpService.getAsync(ApiRoutes.TemplateVariable.v1.Detail(id));
            const data = response.resources;
            TemplateVariablePage.currentTemplateVariable = data;
            Object.keys(data).forEach(key => {
                const selector = `#template_variable_${key}`;
                const value = key.toLocaleLowerCase().includes("date") ? moment(data[key].toString()).format("DD/MM/YYYY HH:mm:ss") : data[key];
                $(selector).val(value).trigger("change");
            })

            $("#kt_modal_template_variable_header h2").text(`${TemplateVariablePage.message.edit} ${TemplateVariablePage.message.pageTitle.toLocaleLowerCase()}`);
            $("#kt_modal_template_variable").modal("show");
        } catch (e) {
            console.error(e);
            Swal.fire({
                icon: "error",
                title: TemplateVariablePage.message.errorTitle,
                html: TemplateVariablePage.message.notFound,
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
     * Description: Delete template variable by id
     * @param {number} id
     */
    async function deleteItem(id) {

        const { isConfirmed } = await Swal.fire({
            icon: "question",
            title: TemplateVariablePage.message.confirmTittle,
            html: TemplateVariablePage.message.deleteConfirm,
            ...AppSettings.sweetAlertOptions(true)
        });

        if (!isConfirmed)
            return;

        $("#global_loader").addClass("show");
        try {
            const response = await httpService.deleteAsync(ApiRoutes.TemplateVariable.v1.Delete(id));
            if (response?.isSucceeded) {
                TemplateVariablePage.refreshDataTable();
                Swal.fire({
                    icon: "success",
                    title: TemplateVariablePage.message.successTitle,
                    html: TemplateVariablePage.message.deleteSuccess,
                    ...AppSettings.sweetAlertOptions(false)
                })
            }
        } catch (e) {
            console.error(e);
            Swal.fire({
                icon: "error",
                title: TemplateVariablePage.message.failTitle,
                html: TemplateVariablePage.message.deleteError,
                ...AppSettings.sweetAlertOptions(false)
            })
        }
        finally {
            $("#global_loader").removeClass("show");
        }
    }

    /**
     * Save data (Create or Update) template variable
     */
    async function saveData() {

        const btnSave = $("#btn_save_template_variable");
        btnSave.attr("disabled", true);

        const columns = ["id", "displayName", "description", "code", "groupCode"];
        const data = {};
        columns.forEach(key => {
            const selector = `#template_variable_${key}`;
            data[key] = $(selector).val();
        });
        const isAdd = !data.id;
        const confirmText = isAdd ? TemplateVariablePage.message.createConfirm : TemplateVariablePage.message.updateConfirm;
        const { isConfirmed } = await Swal.fire({
            icon: 'question',
            title: TemplateVariablePage.message.confirmTittle,
            html: confirmText,
            ...AppSettings.sweetAlertOptions(true)
        });

        if (isConfirmed) {
            btnSave.attr("data-kt-indicator", "on");
            try {
                const response = isAdd ?
                    await httpService.postAsync(ApiRoutes.TemplateVariable.v1.Create, data) :
                    await httpService.putAsync(ApiRoutes.TemplateVariable.v1.Update, data);
                if (response?.isSucceeded) {
                    if (isAdd) {
                        $("#templateVariable_datatable_search").val("").trigger("change");
                        resetFilter();
                    }
                    else {
                        TemplateVariablePage.refreshDataTable();
                    }

                    $("#kt_modal_template_variable").modal("hide");
                    const successText = isAdd ? TemplateVariablePage.message.createSuccess : TemplateVariablePage.message.updateSuccess;
                    Swal.fire({
                        icon: "success",
                        title: TemplateVariablePage.message.successTitle,
                        html: successText,
                        ...AppSettings.sweetAlertOptions(false)
                    });
                }

            } catch (e) {
                console.log(e);
                AppUtils.handleApiError(e, {
                    action: isAdd ? "created" : "update",
                    name: TemplateVariablePage.message.pageTitle,
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
        TemplateVariablePage.table.column(1).search($("#filter_template_variable_code").val().trim());
        TemplateVariablePage.table.column(2).search($("#filter_template_variable_displayName").val().trim());
        TemplateVariablePage.table.column(3).search($("#filter_template_variable_description").val().trim());
        TemplateVariablePage.table.column(4).search($("#filter_template_variable_groupCode").val().join(","));
        TemplateVariablePage.table.column(5).search($("#filter_template_variable_createdDate").val());
        TemplateVariablePage.table.search($("#templateVariable_datatable_search").val().trim()).draw();
    }

    /**
     * Reset filter
     */
    function resetFilter() {
        $("#template_variable_filter input[type='text']").val("");
        $("#template_variable_filter select").val([]).trigger("change");
        TemplateVariablePage.plugins.dateRangePickerFilter.clear();
        /*$("#filter_created_date").val("").trigger("change");*/
        tableSearch();
    }

    /**
    * Load group code
    */
    async function loadDataGroupCode() {
        try {
            const response = await httpService.getAsync(ApiRoutes.TemplateVariable.v1.ListGroupCodes);
            const data = response.resources;
            data.forEach(function (item) {
                $("#template_variable_groupCode").append(new Option(item.name, item.code, false, false));
                $("#filter_template_variable_groupCode").append(new Option(item.name, item.code, false, false));
                /*$("#filter_tagTypeId").append(new Option(item.name, item.id, false, false));*/
            });
        } catch (e) {
            console.error(e);
        }
    }

    async function loadAvailableFieldsByGroup() {
        try {
            const response = await httpService.getAsync(ApiRoutes.TemplateVariable.v1.AvailableFieldsByGroup);
            const data = response.resources;
            TemplateVariablePage.fields = data || [];
        } catch (e) {
            console.error(e);
            TemplateVariablePage.fields = data || [];
        }
    }

    function generateTemplateVariableCode() {
        $("#template_variable_code").val("")
        $("#template_variable_code").empty();
        const groupCode = $("#template_variable_groupCode").val();
        if (groupCode) {
            const variable = TemplateVariablePage.fields.find(item => item.groupCode.toLocaleLowerCase() === groupCode.toLocaleLowerCase());
            variable.fields.forEach(item => {
                $("#template_variable_code").append(new Option(item.displayName, item.code, false, TemplateVariablePage.currentTemplateVariable?.code === item.code));
            });
        }
        //const displayName = AppUtils.slugify($("#template_variable_displayName").val(), "_", false);
        //const groupCode = $("#template_variable_groupCode").val();
        //if (displayName && groupCode) {
        //    const code = `${groupCode}.${displayName}`;
        //    $("#template_variable_code").val(code).trigger("change");
        //}
    }

    // On document ready
    KTUtil.onDOMContentLoaded(async function () {
        await AppEntry.init();
        TemplateVariablePage.init();
    });
})();