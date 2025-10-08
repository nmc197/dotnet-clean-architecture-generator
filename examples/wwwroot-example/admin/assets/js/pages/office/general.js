"use strict";

(function () {
    // Class definition
    const OfficePage = {
        variables: {
            isLoadingFromEdit: false,
            targetImage: null,
        },
        table: null,
        formValidator: null,
        plugins: {
            dateRangePickerFilter: null,
            timePickerWorkingHourStart: null,
            timePickerWorkingHourEnd: null,
            timePickerOptions: {
                display: {
                    viewMode: "clock",
                    components: {
                        decades: false,
                        year: false,
                        month: false,
                        date: false,
                        hours: true,
                        minutes: true,
                        seconds: false
                    },
                    buttons: {
                        clear: true,
                        close: true
                    }
                },
                localization: {
                    hourCycle: "h23",
                    format: 'HH:mm'
                }
            }
        },
        permissionFlags: AppUtils.getPermissionFlags(),
        message: {
            pageTitle: I18n.t("office", "PAGE_TITLE"),
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
            createConfirm: I18n.t("common", "CREATE_CONFIRM", { name: I18n.t("office", "PAGE_TITLE").toLocaleLowerCase() }),
            createSuccess: I18n.t("common", "CREATE_SUCCESS", { name: I18n.t("office", "PAGE_TITLE") }),
            createError: I18n.t("common", "CREATE_ERROR", { name: I18n.t("office", "PAGE_TITLE").toLocaleLowerCase() }),
            updateConfirm: I18n.t("common", "UPDATE_CONFIRM", { name: I18n.t("office", "PAGE_TITLE").toLocaleLowerCase() }),
            updateSuccess: I18n.t("common", "UPDATE_SUCCESS", { name: I18n.t("office", "PAGE_TITLE") }),
            updateError: I18n.t("common", "UPDATE_ERROR", { name: I18n.t("office", "PAGE_TITLE").toLocaleLowerCase() }),
            deleteConfirm: I18n.t("common", "DELETE_CONFIRM", { name: I18n.t("office", "PAGE_TITLE").toLocaleLowerCase() }),
            deleteSuccess: I18n.t("common", "DELETE_SUCCESS", { name: I18n.t("office", "PAGE_TITLE").toLocaleLowerCase() }),
            deleteError: I18n.t("common", "DELETE_ERROR", { name: I18n.t("office", "PAGE_TITLE").toLocaleLowerCase() }),
            notFound: I18n.t("common", "NOT_FOUND", { name: I18n.t("office", "PAGE_TITLE").toLocaleLowerCase() }),
            validationError: I18n.t("common", "VALIDATION_ERROR"),
        },
        init: function () {
            this.initPlugins();
            this.checkPermissions();
            this.initDataTable();
            this.loadRelatedData();
            this.bindEvents();
            this.formValidator = new FormValidator({
                formSelector: "#kt_modal_office_form",
                handleSubmit: saveData,
                rules: [
                    {
                        element: "#office_name",
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
                        element: "#office_phone",
                        rule: [
                            {
                                name: "required",
                                message: I18n.t("common", "REQUIRED", { field: "Số điện thoại" })
                            },
                            {
                                name: "maxLength",
                                message: I18n.t("common", "TOO_LONG", { field: "Số điện thoại", max: 50 }),
                                params: 50
                            },
                            {
                                name: "vietnamPhone",
                                message: I18n.t("common", "INVALID_FORMAT", { field: "Số điện thoại" })
                            },
                        ]
                    },
                    {
                        element: "#office_email",
                        rule: [
                            {
                                name: "maxLength",
                                message: I18n.t("common", "TOO_LONG", { field: "Email", max: 500 }),
                                params: 500,
                                allowNullOrEmpty: true
                            },
                            {
                                name: "email",
                                message: I18n.t("common", "INVALID_FORMAT", { field: "Email" }),
                                allowNullOrEmpty: true
                            },
                        ]
                    },
                    {
                        element: "#office_provinceId",
                        rule: [
                            {
                                name: "required",
                                message: I18n.t("common", "REQUIRED", { field: "Tỉnh/thành phố" })
                            }
                        ]
                    },
                    //{
                    //    element: "#office_districtId",
                    //    rule: [
                    //        {
                    //            name: "required",
                    //            message: I18n.t("common", "REQUIRED", { field: "Quận/huyện" })
                    //        }
                    //    ]
                    //},
                    {
                        element: "#office_wardId",
                        rule: [
                            {
                                name: "required",
                                message: I18n.t("common", "REQUIRED", { field: "Xã/phường" })
                            }
                        ]
                    },
                    {
                        element: "#office_address",
                        rule: [
                            {
                                name: "required",
                                message: I18n.t("common", "REQUIRED", { field: "Địa chỉ chi tiết" })
                            },
                            {
                                name: "maxLength",
                                message: I18n.t("common", "TOO_LONG", { field: "Địa chỉ chi tiết", max: 500 }),
                                params: 500,
                            }
                        ]
                    },
                    {
                        element: "#office_officeStatusId",
                        rule: [
                            {
                                name: "required",
                                message: I18n.t("common", "REQUIRED", { field: "Trạng thái" })
                            }
                        ]
                    },
                    {
                        element: "#office_taxCode",
                        rule: [
                            {
                                name: "customFunction",
                                message: "Mã số thuế không hợp lệ. Định dạng đúng là 10 chữ số, hoặc 10 chữ số + '-' + 3 chữ số (ví dụ: 0101243150 hoặc 0101243150-001).",
                                params: checkValidTaxCode,
                                allowNullOrEmpty: true
                            },
                        ]
                    },
                    {
                        element: "#office_workingHourStart",
                        rule: [
                            {
                                name: "customFunction",
                                message: "Giờ bắt đầu làm việc cần đúng định dạng HH:mm",
                                params: checkValidTimeStartType,
                                allowNullOrEmpty: true

                            },
                            {
                                name: "customFunction",
                                message: "Giờ bắt đầu làm việc cần nhỏ hơn thời gian kết thúc làm việc",
                                params: checkValidTime,
                                allowNullOrEmpty: true
                            }
                        ]
                    },
                    {
                        element: "#office_workingHourEnd",
                        rule: [
                            {
                                name: "customFunction",
                                message: "Giờ kết thúc làm việc cần đúng định dạng HH:mm",
                                params: checkValidTimeEndType,
                                allowNullOrEmpty: true

                            },
                            {
                                name: "customFunction",
                                message: "Giờ kết thúc làm việc cần lớn hơn giờ bắt đầu làm việc",
                                params: checkValidTime,
                                allowNullOrEmpty: true
                            }
                        ]
                    },
                    {
                        element: "#office_longitude",
                        rule: [
                            {
                                name: "customFunction",
                                message: I18n.t("common", "INVALID_FORMAT", { field: "Kinh độ" }),
                                params: checkValidLongitude,
                                allowNullOrEmpty: true
                            }
                        ]
                    },
                    {
                        element: "#office_latitude",
                        rule: [
                            {
                                name: "customFunction",
                                message: I18n.t("common", "INVALID_FORMAT", { field: "Vĩ độ" }),
                                params: checkValidLatitude,
                                allowNullOrEmpty: true
                            }
                        ]
                    },
                    {
                        element: "#office_website",
                        rule: [
                            {
                                name: "url",
                                message: I18n.t("common", "INVALID_FORMAT", { field: "Website" }),
                                allowNullOrEmpty: true
                            },
                            {
                                name: "maxLength",
                                message: I18n.t("common", "TOO_LONG", { field: "Website", max: 500 }),
                                params: 500,
                                allowNullOrEmpty: true
                            }
                        ]
                    },
                    {
                        element: "#office_fax",
                        rule: [
                            {
                                name: "maxLength",
                                message: I18n.t("common", "TOO_LONG", { field: "Fax", max: 50 }),
                                params: 50,
                                allowNullOrEmpty: true
                            },
                            {
                                name: "phone",
                                message: I18n.t("common", "INVALID_FORMAT", { field: "Fax" }),
                                allowNullOrEmpty: true
                            }
                        ]
                    }

                ]
            });
        },
        initDataTable: function () {
            this.table = $("#office_datatable").DataTable({
                processing: true,
                serverSide: true,
                paging: true,
                searching: { regex: true },
                order: [5, 'desc'],
                language: AppSettings.dataTableLanguage.vi,
                ajax: {
                    url: ApiRoutes.Office.v1.PagedAdvanced,
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
                            const tableSettings = OfficePage.table.settings()[0];
                            tableSettings.ajax.headers.Authorization = "Bearer " + TokenService.getAccessToken();

                            //Reload lại datatable với token mới
                            OfficePage.table.ajax.reload();
                        }
                    },
                    data: function (d) {
                        d.provinceIds = ($("#filter_provinceId").val() || "").toString().split(',').map(Number).filter(x => x);
                        /*d.districtIds = ($("#filter_districtId").val() || "").toString().split(',').map(Number).filter(x => x);*/
                        d.wardIds = ($("#filter_wardId").val() || "").toString().split(',').map(Number).filter(x => x);
                        d.officeStatusIds = ($("#filter_officeStatusId").val() || "").toString().split(',').map(Number).filter(x => x);

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
                            const info = OfficePage.table.page.info();
                            const index = meta.row + 1 + info.page * info.length;
                            return index; // This contains the row index
                        }
                    },
                    {
                        data: "name",
                        render: function (data, type, row, meta) {
                            return `<div class="d-flex align-items-center" data-office-id='${row.id}'>
                                        <!--begin::Thumbnail-->
                                        <a class="symbol symbol-50px">
                                            <span class="symbol-label" style="background-image:url(${AppUtils.escapeHtml(row.imageUrl) || '/admin/assets/media/svg/files/blank-image.svg'});"></span>
                                        </a>
                                        <!--end::Thumbnail-->

                                        <div class="ms-5">
                                            <!--begin::Title-->
                                            <a class="text-gray-800 text-hover-primary fw-bold">${AppUtils.escapeHtml(row.name)}</a>
                                            ${row.taxCode ? `<br><span data-office-id='${row.id}'>MST: ${AppUtils.escapeHtml(row.taxCode)}</span>` : ''}
                                            <!--end::Title-->
                                        </div>
                                    </div>`;

                            //return `<span class='text-gray-800 text-hover-primary mb-1' data-office-id='${row.id}'>${AppUtils.escapeHtml(row.name)}<span>`;
                        },
                    },
                    //{
                    //    data: "phone",
                    //    render: function (data, type, row, meta) {
                    //        return `<span data-office-id='${row.id}'>${row.phone}<span>`;
                    //    },
                    //},
                    //{
                    //    data: "email",
                    //    render: function (data, type, row, meta) {
                    //        return `<span data-office-id='${row.id}'>${row.email ?? ""}<span>`;
                    //    },
                    //},
                    //{
                    //    data: "provinceName",
                    //    render: function (data, type, row, meta) {
                    //        return `<span class='text-gray-800 text-hover-primary mb-1' data-office-id='${row.id}'>${row.provinceName}<span>`;
                    //    },
                    //},
                    //{
                    //    data: "districtName",
                    //    render: function (data, type, row, meta) {
                    //        return `<span class='text-gray-800 text-hover-primary mb-1' data-office-id='${row.id}'>${row.districtName}<span>`;
                    //    },
                    //},
                    //{
                    //    data: "wardName",
                    //    render: function (data, type, row, meta) {
                    //        return `<span class='text-gray-800 text-hover-primary mb-1' data-office-id='${row.id}'>${row.wardName}<span>`;
                    //    },
                    //},
                    {
                        data: "fullAddress",
                        render: function (data, type, row, meta) {
                            let start = row.workingHourStart;
                            let end = row.workingHourEnd;
                            let timeDisplay = '';
                            if (start && end) {
                                timeDisplay = `từ ${formatTime(start)} - ${formatTime(end)}`;
                            } else if (start) {
                                timeDisplay = `từ ${formatTime(start)}`;
                            } else if (end) {
                                timeDisplay = `đến ${formatTime(end)}`;
                            }
                            return `
                                <span data-office-id='${row.id}'>Đ/C: ${AppUtils.escapeHtml(row.fullAddress)}</span>
                                ${timeDisplay != `` ? `<br><span data-office-id='${row.id}'>Giờ làm việc: ${timeDisplay}</span>` : ''}
                            `;
                        },
                    },
                    {
                        data: "phone",
                        render: function (data, type, row, meta) {
                            return `<span class='text-nowrap' data-office-id='${row.id}'>SĐT: ${AppUtils.escapeHtml(row.phone)}</span>
                                ${row.email ? `<br><span class='text-nowrap' data-office-id='${row.id}'>Email: ${AppUtils.escapeHtml(row.email)}</span>` : ''}`;
                        },
                    },

                    {
                        data: "officeStatusId",
                        render: function (data, type, row, meta) {
                            return `<span class='text-nowrap' data-office-id='${row.id}' style="background-color: ${AppUtils.customBagdeColor(row.officeStatusColor)}; color: ${AppUtils.escapeHtml(row.officeStatusColor)}; padding: 5px 8px; border-radius: 8px; display: inline-block; font-weight: 600;">${AppUtils.escapeHtml(row.officeStatusName)}<span>`;

                        },
                    },
                    {
                        data: "createdDate",
                        render: function (data, type, row, meta) {
                            const displayValue = moment(data).format("DD/MM/YYYY HH:mm:ss");
                            return `<span data-office-id='${row.id}'>${displayValue}<span>`;
                        }
                    },
                    {
                        data: 'id',
                        className: 'text-end',
                        render: function (data, type, row, meta) {
                            return `<a class="text-nowrap btn btn-light btn-active-light-primary btn-flex btn-center btn-sm" data-kt-menu-trigger="click" data-kt-menu-placement="bottom-end" data-kt-menu-flip="top-end">
                                                ${OfficePage.message.actions}
                                                <i class="ki-duotone ki-down fs-5 ms-1"></i>
                                    </a>
                                    <div class="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg-light-primary fw-semibold fs-7 w-125px py-4" data-kt-menu="true">
                                        <div class="menu-item px-3">
                                            <a class="menu-link px-3 btn-edit" data-kt-docs-table-filter="edit_row" data-office-id="${data}">
                                                ${OfficePage.permissionFlags.canUpdate ? OfficePage.message.edit : OfficePage.message.detail}
                                            </a>
                                        </div>
                                        <div class="menu-item px-3 ${!OfficePage.permissionFlags.canDelete ? "d-none" : ""}">
                                            <a class="menu-link px-3 btn-delete text-danger" data-kt-users-table-filter="delete_row" data-office-id="${data}">
                                                ${OfficePage.message.delete}
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
                    $('#office_datatable tfoot').html("");
                    $("#office_datatable thead tr").clone(true).appendTo("#office_datatable tfoot");
                    $('#office_datatable tfoot tr').addClass("border-top");
                }
            })
            this.table.on("draw", function () {
                KTMenu.createInstances();
            })
        },
        initPlugins: function () {
            //Init daterangepicker
            this.plugins.dateRangePickerFilter = $("#filter_created_date").flatpickr({
                dateFormat: "d/m/Y",
                mode: "range",
                conjunction: " - ",
                locale: "vn",
            });

            this.plugins.foundingDatePicker = $("#office_foundingDate").flatpickr({
                dateFormat: "d/m/Y",
                locale: "vn"
            });

            //Init select2
            $("#filter_provinceId, #office_provinceId").select2({
                language: currentLang,
                placeholder: 'Chọn tỉnh/thành phố',
                dropdownParent: $('#kt_modal_office'),
            });
            //$("#filter_districtId, #office_districtId").select2({
            //    language: currentLang,
            //    placeholder: 'Chọn quận/huyện',
            //    dropdownParent: $('#kt_modal_office')
            //});
            $("#filter_wardId, #office_wardId").select2({
                language: currentLang,
                placeholder: 'Chọn xã/phường',
                dropdownParent: $('#kt_modal_office')
            });

            $("#filter_officeStatusId, #office_officeStatusId").select2({
                language: currentLang,
                placeholder: 'Chọn trạng thái',
                dropdownParent: $('#kt_modal_office')
            });

            //Init time picker
            this.plugins.timePickerWorkingHourStart = new tempusDominus.TempusDominus(document.getElementById("office_workingHourStart"), OfficePage.plugins.timePickerOptions);
            this.plugins.timePickerWorkingHourEnd = new tempusDominus.TempusDominus(document.getElementById("office_workingHourEnd"), OfficePage.plugins.timePickerOptions);

            //Init file manager
            FileManager.init({
                //acceptTypes: "image/*",
                //loadTypes: ["image"],
                category: "office",
                isGetAll: true,
                onChooseFile: (file) => {
                    if (OfficePage.variables.targetImage === "#imageId") {
                        $("#office_imagePath").css("background-image", `url('${file.url}')`);
                        $("#office_imageId").val(file.id);
                    }
                    else {
                        CKEDITOR.dialog.getCurrent().getContentElement('info', 'txtUrl').setValue(file.url);
                    }
                }
            });

        },
        checkPermissions: function () {
            if (!OfficePage.permissionFlags.canCreate)
                $("#btn_add_office").addClass("d-none");
        },
        regenDataTable: function () {
            if (this.table) {
                this.table.destroy();
                $("#office_datatable tbody").html("");
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
            /*            this.bindLoadDistrictByProvince();*/
            this.bindLoadWardByProvince();
            /*            this.bindLoadFilterDistrictByProvince();*/
            this.bindLoadFilterWardByProvince();
            this.bindClearTimePickerEvent();
            this.bindChangeImageEvent();
            this.bindClearFoundingDateEvent();
            this.bindToggleFilterEvent();
        },
        bindEditEvent: function () {
            $("#office_datatable tbody").on("click", ".btn-edit", function () {
                const id = $(this).attr("data-office-id");
                editItem(id);
                FileManager.setDirectionId(id);
            });
        },
        bindDeleteEvent: function () {
            $("#office_datatable tbody").on("click", ".btn-delete", function () {
                const id = $(this).attr("data-office-id");
                deleteItem(id);
            });
        },

        bindSearchAllEvents: function () {
            $("#office_datatable_search").on("keyup", AppUtils.debounce(function () {
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
            $("#btn_add_office").on("click", function () {
                addItem();
                FileManager.setDirectionId(null);
            })
        },
        bindClearFilterDateRangeEvent: function () {
            $("#clear_filter_created_date i").on("click", function () {
                OfficePage.plugins.dateRangePickerFilter.clear();
            })
            $("#clear_filter_created_date").on("click", function () {
                OfficePage.plugins.dateRangePickerFilter.clear();
            })
        },
        bindClearTimePickerEvent: function () {
            $("#clear_office_workingHourStart i").on("click", function () {
                OfficePage.plugins.timePickerWorkingHourStart.clear();
            })
            $("#clear_office_workingHourStart").on("click", function () {
                OfficePage.plugins.timePickerWorkingHourStart.clear();
            })
            $("#clear_office_workingHourEnd i").on("click", function () {
                OfficePage.plugins.timePickerWorkingHourEnd.clear();
            })
            $("#clear_office_workingHourEnd").on("click", function () {
                OfficePage.plugins.timePickerWorkingHourEnd.clear();
            })
        },
        bindClearFoundingDateEvent: function () {
            $("#clear_office_foundingDate i").on("click", function () {
                OfficePage.plugins.foundingDatePicker.clear();
            });
            $("#clear_office_foundingDate").on("click", function () {
                OfficePage.plugins.foundingDatePicker.clear();
            });
        },
        bindLoadDistrictByProvince: function () {
            $("#office_provinceId").on("change", async function () {
                if (OfficePage.variables.isLoadingFromEdit) return;
                await loadDataDistrictByProvinceId($(this).val());
            })
        },
        bindLoadWardByProvince: function () {
            $("#office_provinceId").on("change", async function () {
                if (OfficePage.variables.isLoadingFromEdit) return;
                await loadDataWardByProvinceId($(this).val());
            })
        },
        bindLoadFilterDistrictByProvince: function () {
            $("#filter_provinceId").on("change", async function () {
                await loadDataFilterDistrictByProvinceId($(this).val());
            })
        },
        bindLoadFilterWardByProvince: function () {
            $("#filter_provinceId").on("change", async function () {
                await loadDataFilterWardByProvinceId($(this).val());
            })
        },
        bindChangeImageEvent: function () {
            $("#imageId").on("click", function (e) {
                e.preventDefault();
                /*$("#kt_modal_office").modal("hide");*/
                FileManager.show();
                OfficePage.variables.targetImage = "#imageId";
            });
        },
        loadRelatedData: async function () {
            await loadDataProvince();
            await loadDataOfficeStatus();
            $("select[data-control=select2]").val("").select2();
        },
        bindToggleFilterEvent: function () {
            $("#btn_office_filter").on("click", function () {
                $("#office_filter").slideToggle();
            })
        }
    }

    /**
     * Handle add new office
     */
    function addItem() {
        OfficePage.formValidator.clearErrors();
        $("#kt_modal_office_header h2").text(`${OfficePage.message.create} ${OfficePage.message.pageTitle.toLocaleLowerCase()}`);
        $("#kt_modal_office_form input[type='text'],#kt_modal_office_form textarea, #kt_modal_office_form select").val("").attr("disabled", false).trigger("change");
        $("#office_imagePath").css("background-image", `url('/admin/assets/media/svg/files/blank-image.svg')`);
        $("#office_imageId").val(null).attr("disabled", false);
        $("#office_createdDate").val(moment().format("DD/MM/YYYY HH:mm:ss")).attr("disabled", true).trigger("change");
        OfficePage.plugins.foundingDatePicker.clear();
        $('[data-kt-image-input-action="change"]').show();
        $('[data-kt-image-input-action="cancel"]').show();
        $('[data-kt-image-input-action="remove"]').show();
    }

    /**
     * Author: 
     * CreatedDate: 
     * Description: Edit office by id
     * @param {number} id
     */
    async function editItem(id) {
        OfficePage.formValidator.clearErrors();
        $("#global_loader").addClass("show");
        OfficePage.variables.isLoadingFromEdit = true;
        try {
            const response = await httpService.getAsync(ApiRoutes.Office.v1.Detail(id));
            const data = response.resources;
            const canEdit = OfficePage.permissionFlags.canUpdate;
            // Set fields khác
            Object.keys(data).forEach(key => {
                if (key === "districtId" || key === "wardId" || key === "workingHourStart" || key === "workingHourEnd" || key === "imageUrl") return;
                const selector = `#office_${key}`;

                let value;
                if (key === "foundingDate") {
                    value = data[key] && data[key] !== "" ? moment(data[key]).format("DD/MM/YYYY") : "";
                } else if (key.toLowerCase().includes("date")) {
                    value = data[key] != null ? moment(data[key].toString()).format("DD/MM/YYYY HH:mm:ss") : "";
                } else {
                    value = data[key];
                }

                $(selector).val(value).trigger("change");
                if (!key.toLocaleLowerCase().includes("date")) {
                    $(selector).attr("disabled", !canEdit);
                }
            });
            $("#office_foundingDate").attr("disabled", !canEdit);
            //Province
            //await loadDataDistrictByProvinceId(data.provinceId);
            //$('#office_districtId').val(data.districtId).attr("disabled", !canEdit).trigger("change");;

            //District
            await loadDataWardByProvinceId(data.provinceId);
            $('#office_wardId').val(data.wardId).attr("disabled", !canEdit).trigger("change");;

            //HourStart
            $('#office_workingHourStart').attr("disabled", !canEdit).val(data.workingHourStart != null ? formatTime(data.workingHourStart) : "");

            //HourEnd
            $('#office_workingHourEnd').attr("disabled", !canEdit).val(data.workingHourEnd != null ? formatTime(data.workingHourEnd) : "");

            // FoundingDate
            if (data.foundingDate) {
                const foundingDateFormatted = moment(data.foundingDate).format("DD/MM/YYYY");
                $("#office_foundingDate").val(foundingDateFormatted);
            } else {
                OfficePage.plugins.foundingDatePicker.clear();
            }
            $("#office_foundingDate").attr("disabled", !canEdit);

            //Image
            if (data.image) {
                $("#office_imagePath").css("background-image", `url('${data.image.url}')`);
                $("#office_imageId").val(data.image.id).attr("disabled", !canEdit);
            }
            else {
                $("#office_imagePath").css("background-image", `url('/admin/assets/media/svg/files/blank-image.svg')`);
                $("#office_imageId").val(null).attr("disabled", !canEdit);
            };
            $("#imageId").attr("disabled", !canEdit);
            if (!canEdit) {
                $('[data-kt-image-input-action="change"]').hide();
                $('[data-kt-image-input-action="cancel"]').hide();
                $('[data-kt-image-input-action="remove"]').hide();
            };

            $("#kt_modal_office_header h2").text(`${OfficePage.message.edit} ${OfficePage.message.pageTitle.toLocaleLowerCase()}`);
            $("#kt_modal_office").modal("show");
        } catch (e) {
            console.error(e);
            Swal.fire({
                icon: "error",
                title: OfficePage.message.errorTitle,
                html: OfficePage.message.notFound,
                ...AppSettings.sweetAlertOptions(false)
            });
        } finally {
            OfficePage.variables.isLoadingFromEdit = false; // Reset flag
            $("#global_loader").removeClass("show");
        }
    }

    /**
     * Author:
     * CreatedDate:
     * Description: Delete office by id
     * @param {number} id
     */
    async function deleteItem(id) {

        const { isConfirmed } = await Swal.fire({
            icon: "question",
            title: OfficePage.message.confirmTittle,
            html: OfficePage.message.deleteConfirm,
            ...AppSettings.sweetAlertOptions(true)
        });

        if (!isConfirmed)
            return;

        $("#global_loader").addClass("show");
        try {
            const response = await httpService.deleteAsync(ApiRoutes.Office.v1.Delete(id));
            if (response?.isSucceeded) {
                /*tableSearch();*/
                OfficePage.refreshDataTable();
                Swal.fire({
                    icon: "success",
                    title: OfficePage.message.successTitle,
                    html: OfficePage.message.deleteSuccess,
                    ...AppSettings.sweetAlertOptions(false)
                })
            }
        } catch (e) {
            console.error(e);
            Swal.fire({
                icon: "error",
                title: OfficePage.message.failTitle,
                html: OfficePage.message.deleteError,
                ...AppSettings.sweetAlertOptions(false)
            })
        }
        finally {
            $("#global_loader").removeClass("show");
        }
    }

    /**
     * Save data (Create or Update) office
     */
    async function saveData() {
        const btnSave = $("#btn_save_office");
        btnSave.attr("disabled", true);
        const columns = ["id", "name", "phone", "email", "provinceId", "districtId", "wardId", "address", "longitude", "latitude", "imageId", "officeStatusId", , "taxCode", "workingHourStart", "workingHourEnd", "fax", "foundingDate", "representative", "website"];
        const data = {};
        columns.forEach(key => {
            const value = $(`#office_${key}`).val();

            if (key === "workingHourStart" || key === "workingHourEnd") {
                data[key] = value ? `${value}:00` : undefined;
            } else if (key === "foundingDate") {
                const parts = value?.trim()?.split('/');
                data[key] = parts?.length === 3
                    ? `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`
                    : null;
            } else {
                data[key] = value;
            }
        });
        const isAdd = !data.id;
        const confirmText = isAdd ? OfficePage.message.createConfirm : OfficePage.message.updateConfirm;
        const { isConfirmed } = await Swal.fire({
            icon: 'question',
            title: OfficePage.message.confirmTittle,
            html: confirmText,
            ...AppSettings.sweetAlertOptions(true)
        });

        if (isConfirmed) {
            btnSave.attr("data-kt-indicator", "on");
            try {
                const response = isAdd ?
                    await httpService.postAsync(ApiRoutes.Office.v1.Create, data) :
                    await httpService.putAsync(ApiRoutes.Office.v1.Update, data);
                if (response?.isSucceeded) {
                    if (isAdd) {
                        $("#office_datatable_search").val("").trigger("change");
                        resetFilter();
                    }
                    else {
                        /*tableSearch();*/
                        OfficePage.refreshDataTable();
                    }

                    $("#kt_modal_office").modal("hide");
                    const successText = isAdd ? OfficePage.message.createSuccess : OfficePage.message.updateSuccess;
                    Swal.fire({
                        icon: "success",
                        title: OfficePage.message.successTitle,
                        html: successText,
                        ...AppSettings.sweetAlertOptions(false)
                    });
                }

            } catch (e) {
                AppUtils.handleApiError(e, {
                    action: isAdd ? "create" : "update",
                    name: OfficePage.message.pageTitle,
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
        OfficePage.table.column(1).search($("#filter_name").val().trim());
        OfficePage.table.column(2).search($("#filter_address").val().trim());
        OfficePage.table.column(3).search($("#filter_phone").val().trim());
        OfficePage.table.column(5).search($("#filter_created_date").val());
        OfficePage.table.search($("#office_datatable_search").val().trim()).draw();
    }
    /**
     * Reset filter
     */
    function resetFilter() {
        $("#filter_name").val("");
        $("#filter_phone").val("");
        $("#filter_provinceId").val("").trigger("change");
        $("#filter_officeStatusId").val("").trigger("change");
        /*        $("#filter_districtId").empty();*/
        $("#filter_wardId").empty();
        $("#filter_address").val("");

        OfficePage.plugins.dateRangePickerFilter.clear();
        /*$("#filter_created_date").val("").trigger("change");*/
        tableSearch();
    }

    async function loadDataProvince() {
        try {
            const response = await httpService.getAsync(ApiRoutes.Province.v1.List);
            const data = response.resources;
            data.forEach(function (item) {
                $("#office_provinceId").append(new Option(AppUtils.escapeHtml(item.name), item.id, false, false));
                $("#filter_provinceId").append(new Option(AppUtils.escapeHtml(item.name), item.id, false, false));
            });
        } catch (e) {
            console.error(e);
        }
    }

    async function loadDataDistrictByProvinceId(provinceId) {
        if (!provinceId) {
            return;
        }
        try {
            $("#office_districtId").empty();
            $("#office_wardId").empty();
            const response = await httpService.getAsync(ApiRoutes.Province.v1.ListDistrictByProvinceId(provinceId));
            const data = response.resources;
            data.forEach(function (item) {
                $("#office_districtId").append(new Option(AppUtils.escapeHtml(item.name), item.id, false, false));
            });
            $("#office_districtId").val("").trigger("change");
        } catch (e) {
            console.error(e);
        }
    }

    async function loadDataFilterDistrictByProvinceId(provinceId) {
        if (!provinceId) {
            return;
        }
        try {
            $("#filter_districtId").empty();
            $("#filter_wardId").empty();
            const response = await httpService.getAsync(ApiRoutes.Province.v1.ListDistrictByProvinceId(provinceId));
            const data = response.resources;
            data.forEach(function (item) {
                $("#filter_districtId").append(new Option(AppUtils.escapeHtml(item.name), item.id, false, false));
            });
            $("#filter_districtId").val("").trigger("change")
        } catch (e) {
            console.error(e);
        }
    }

    async function loadDataWardByProvinceId(provinceId) {
        if (!provinceId) {
            return;
        }
        try {
            $("#office_wardId").empty();
            const response = await httpService.getAsync(ApiRoutes.Province.v1.Wards(provinceId));
            const data = response.resources;
            data.forEach(function (item) {
                $("#office_wardId").append(new Option(AppUtils.escapeHtml(item.name), item.id, false, false));
            });
            $("#office_wardId").val("").trigger("change")

        } catch (e) {
            console.error(e);
        }
    }

    async function loadDataFilterWardByProvinceId(provinceId) {
        if (!provinceId) {
            return;
        }
        try {
            $("#filter_wardId").empty();
            const response = await httpService.getAsync(ApiRoutes.Province.v1.Wards(provinceId));
            const data = response.resources;
            data.forEach(function (item) {
                $("#filter_wardId").append(new Option(AppUtils.escapeHtml(item.name), item.id, false, false));
            });
            $("#filter_wardId").val("").trigger("change")

        } catch (e) {
            console.error(e);
        }
    }

    async function loadDataOfficeStatus() {
        try {
            const response = await httpService.getAsync(ApiRoutes.OfficeStatus.v1.List);
            const data = response.resources;
            data.forEach(function (item) {
                $("#office_officeStatusId").append(new Option(AppUtils.escapeHtml(item.name), item.id, false, false));
                $("#filter_officeStatusId").append(new Option(AppUtils.escapeHtml(item.name), item.id, false, false));
            });
        } catch (e) {
            console.error(e);
        }
    }
    function formatTime(timeString) {
        const parts = timeString.split(':');
        return parts[0] + ':' + parts[1];
    }
    function checkValidTimeStartType() {
        let timeString = $("#office_workingHourStart").val();
        if (timeString == "") {
            return true;
        }
        const pattern = /^(?:2[0-3]|[01]?[0-9]):[0-5][0-9]$/;
        return pattern.test(timeString);
    }
    function checkValidTimeEndType() {
        let timeString = $("#office_workingHourEnd").val();
        if (timeString == "") {
            return true;
        }
        const pattern = /^(?:2[0-3]|[01]?[0-9]):[0-5][0-9]$/;
        return pattern.test(timeString);
    }

    function checkValidTaxCode() {
        let taxCode = $("#office_taxCode").val().trim();
        if (taxCode.length === 0)
            return true;
        // Regex: 10 chữ số hoặc 10 chữ số + dấu gạch ngang + 3 chữ số
        const regex = /^\d{10}(-\d{3})?$/;
        return regex.test(taxCode);
    }
    function checkValidTime() {
        const officeWorkingHourStart = $("#office_workingHourStart").val();
        const officeWorkingHourEnd = $("#office_workingHourEnd").val();
        const startValue = officeWorkingHourStart === '' ? null : officeWorkingHourStart;
        const endValue = officeWorkingHourEnd === '' ? null : officeWorkingHourEnd;
        if (startValue === null && endValue === null) {
            return true;
        }
        if (startValue === null || endValue === null) {
            return true;
        }
        function convertHhmmToMinutes(hh_mm) {
            const [hours, minutes] = hh_mm.split(':').map(Number);
            return hours * 60 + minutes;
        }
        const startTimeInMinutes = convertHhmmToMinutes(startValue);
        const endTimeInMinutes = convertHhmmToMinutes(endValue);
        return endTimeInMinutes > startTimeInMinutes;
    }
    function checkValidLongitude() {
        let longitude = $("#office_longitude").val().trim();
        if (longitude === "") {
            return true;
        }
        const num = parseFloat(longitude);
        return !isNaN(num) && num >= -180 && num <= 180;
    }
    function checkValidLatitude() {
        let latitude = $("#office_latitude").val().trim();
        if (latitude === "") {
            return true;
        }
        const num = parseFloat(latitude);
        return !isNaN(num) && num >= -90 && num <= 90;
    }
    // On document ready
    KTUtil.onDOMContentLoaded(async function () {
        await AppEntry.init();
        if (!OfficePage.permissionFlags.canView) {
            AppSettings.mainElements.PAGE_CONTENT.addClass("d-none");
            AppSettings.mainElements.NOT_FOUND.removeClass("d-none");
        }
        else
            OfficePage.init();
    });
})();