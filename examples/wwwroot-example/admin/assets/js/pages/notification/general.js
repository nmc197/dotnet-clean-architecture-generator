"use strict";

(function () {
    // Class definition
    const NotificationPage = {
        table: null,
        formValidator: null,
        plugins: {
            dateRangePickerFilter: null
        },
        permissionFlags: AppUtils.getPermissionFlags(),
        message: {
            pageTitle: I18n.t("notification", "PAGE_TITLE"),
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
            createConfirm: I18n.t("common", "CREATE_CONFIRM", { name: I18n.t("notification", "PAGE_TITLE").toLocaleLowerCase() }),
            createSuccess: I18n.t("common", "CREATE_SUCCESS", { name: I18n.t("notification", "PAGE_TITLE").toLocaleLowerCase() }),
            createError: I18n.t("common", "CREATE_ERROR", { name: I18n.t("notification", "PAGE_TITLE").toLocaleLowerCase() }),
            updateConfirm: I18n.t("common", "UPDATE_CONFIRM", { name: I18n.t("notification", "PAGE_TITLE").toLocaleLowerCase() }),
            updateSuccess: I18n.t("common", "UPDATE_SUCCESS", { name: I18n.t("notification", "PAGE_TITLE") }),
            updateError: I18n.t("common", "UPDATE_ERROR", { name: I18n.t("notification", "PAGE_TITLE").toLocaleLowerCase() }),
            deleteConfirm: I18n.t("common", "DELETE_CONFIRM", { name: I18n.t("notification", "PAGE_TITLE").toLocaleLowerCase() }),
            deleteSuccess: I18n.t("common", "DELETE_SUCCESS", { name: I18n.t("notification", "PAGE_TITLE").toLocaleLowerCase() }),
            deleteError: I18n.t("common", "DELETE_ERROR", { name: I18n.t("notification", "PAGE_TITLE").toLocaleLowerCase() }),
            notFound: I18n.t("common", "NOT_FOUND", { name: I18n.t("notification", "PAGE_TITLE").toLocaleLowerCase() }),
            validationError: I18n.t("common", "VALIDATION_ERROR"),
        },
        init: function () {
            this.initPlugins();
            this.initDataTable();
            this.loadRelatedData();
            this.bindEvents();
            this.formValidator = new FormValidator({
                formSelector: "#kt_modal_notification_form",
                handleSubmit: saveData,
                rules: [
                    //{
                    //    element: "#notification_name",
                    //    rule: [
                    //        {
                    //            name: "required",
                    //            message: I18n.t("common", "REQUIRED", { field: "Tên" })
                    //        },
                    //        {
                    //            name: "maxLength",
                    //            message: I18n.t("common", "TOO_LONG", { field: "Tên", max: 255 }),
                    //            params: 255
                    //        },
                    //    ]
                    //},
                ]
            });
        },
        initDataTable: function () {
            this.table = $("#notification_datatable").DataTable({
                processing: true,
                serverSide: true,
                paging: true,
                searching: { regex: true },
                order: [4, 'desc'],
                language: AppSettings.dataTableLanguage.vi,
                ajax: {
                    url: ApiRoutes.Notification.v1.PagedAdvanced,
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
                            const tableSettings = NotificationPage.table.settings()[0];
                            tableSettings.ajax.headers.Authorization = "Bearer " + TokenService.getAccessToken();

                            //Reload lại datatable với token mới
                            NotificationPage.table.ajax.reload();
                        }
                    },
                    data: function (d) {
                        //d.userIds = ($("#filter_userIds").val() || "").toString().split(',').map(Number).filter(x => x);
                        d.notificationCategoryIds = ($("#filter_notificationCategoryIds").val() || "").toString().split(',').map(Number).filter(x => x);
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
                            const info = NotificationPage.table.page.info();
                            const index = meta.row + 1 + info.page * info.length;
                            return index; // This contains the row index
                        }
                    },
                    {
                        data: "notificationCategoryName",
                        render: function (data, type, row, meta) {
                            return `<span data-notification-id='${row.id}' style="background-color: ${AppUtils.customBagdeColor(row.notificationCategoryColor)}; color: ${row.notificationCategoryColor}; padding: 5px 8px; border-radius: 8px; display: inline-block; font-weight: 600;">${row.notificationCategoryName}<span>`;
                        },
                    },
                    //{
                    //    data: "directionId",
                    //    render: function (data, type, row, meta) {
                    //        return `<span data-notification-id='${row.id}'>${AppUtils.escapeHtml(row.name)}<span>`;
                    //    },
                    //},
                    {
                        data: "title",
                        render: function (data, type, row, meta) {
                            return `<span class='text-gray-800 text-hover-primary mb-1' data-notification-id='${row.id}'>${AppUtils.escapeHtml(row.title)}<span>`;
                        },
                    },
                    {
                        data: "content",
                        render: function (data, type, row, meta) {
                            return `<span data-notification-id='${row.id}'>${AppUtils.escapeHtml(row.content)}<span>`;
                        },
                    },
                    //{
                    //    data: "user",
                    //    render: function (data, type, row, meta) {
                    //        return ``;
                    //    },
                    //},
                    {
                        data: "createdDate",
                        render: function (data, type, row, meta) {
                            const displayValue = moment(data).format("DD/MM/YYYY HH:mm:ss");
                            return `<span class='text-nowrap' data-notification-id='${row.id}'>${displayValue}<span>`;
                        }
                    },
                    {
                        data: 'id',
                        className: 'text-end',
                        render: function (data, type, row, meta) {
                            //return `<a href="#" class="btn btn-light btn-active-light-primary btn-flex btn-center btn-sm" data-kt-menu-trigger="click" data-kt-menu-placement="bottom-end" data-kt-menu-flip="top-end">
                            //                    ${NotificationPage.message.actions}
                            //                    <i class="ki-duotone ki-down fs-5 ms-1"></i>
                            //        </a>
                            //        <div class="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg-light-primary fw-semibold fs-7 w-125px py-4" data-kt-menu="true">
                            //            <div class="menu-item px-3">
                            //                <a href="#" class="menu-link px-3 btn-edit" data-kt-docs-table-filter="edit_row" data-notification-id="${data}">
                            //                    ${NotificationPage.message.edit}
                            //                </a>
                            //            </div>
                            //            <div class="menu-item px-3">
                            //                <a href="#" class="menu-link px-3 btn-delete text-danger" data-kt-users-table-filter="delete_row" data-notification-id="${data}">
                            //                    ${NotificationPage.message.delete}
                            //                </a>
                            //            </div>
                            //        </div>`
                            return `<a href="#" class="btn btn-light btn-active-light-primary btn-flex btn-center btn-sm" data-kt-menu-trigger="click" data-kt-menu-placement="bottom-end" data-kt-menu-flip="top-end">
                                                ${NotificationPage.message.actions}
                                                <i class="ki-duotone ki-down fs-5 ms-1"></i>
                                    </a>
                                    <div class="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg-light-primary fw-semibold fs-7 w-125px py-4" data-kt-menu="true">
                                        <div class="menu-item px-3 ${!NotificationPage.permissionFlags.canDelete ? "d-none" : ""}">
                                            <a href="#" class="menu-link px-3 btn-delete text-danger" data-kt-users-table-filter="delete_row" data-notification-id="${data}">
                                                ${NotificationPage.message.delete}
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
                    $('#notification_datatable tfoot').html("");
                    $("#notification_datatable thead tr").clone(true).appendTo("#notification_datatable tfoot");
                    $('#notification_datatable tfoot tr').addClass("border-top");
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

            AppUtils.createSelect2("#filter_notificationCategoryIds", {
                url: ApiRoutes.NotificationCategory.v1.Search,
                allowClear: true,
                cache: true,
                placeholder: 'Chọn danh mục',
                select2Options: {
                    dropdownParent: "#notification_filter",
                    closeOnSelect: false,
                }
            });

            //AppUtils.createSelect2("#filter_userIds", {
            //    url: ApiRoutes.User.v1.Search,
            //    allowClear: true,
            //    cache: true,
            //    placeholder: 'Chọn người dùng',
            //    select2Options: {
            //        dropdownParent: "#notification_filter",
            //        closeOnSelect: false,
            //    }
            //});
        },
        regenDataTable: function () {
            if (this.table) {
                this.table.destroy();
                $("#notification_datatable tbody").html("");
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
        },
        bindEditEvent: function () {
            $("#notification_datatable tbody").on("click", ".btn-edit", function () {
                const id = $(this).attr("data-notification-id");
                editItem(id);
            });
        },
        bindDeleteEvent: function () {
            $("#notification_datatable tbody").on("click", ".btn-delete", function () {
                const id = $(this).attr("data-notification-id");
                deleteItem(id);
            });
        },
        bindSearchAllEvents: function () {
            $("#notification_datatable_search").on("keyup", AppUtils.debounce(function () {
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
            $("#btn_add_notification").on("click", function () {
                addItem();
            })
        },
        bindSaveEvent: function () {
            //$("#btn_save_notification").on("click", function (e) {
            //    e.preventDefault();
            //    saveData();
            //})
        },
        bindClearFilterDateRangeEvent: function () {
            $("#clear_filter_created_date i").on("click", function () {
                NotificationPage.plugins.dateRangePickerFilter.clear();
            })
            $("#clear_filter_created_date").on("click", function () {
                NotificationPage.plugins.dateRangePickerFilter.clear();
            })
        },  
        loadRelatedData: async function () {
            //await loadDataUser();
            await loadDataNotificationCategory();
            $("select[data-control=select2]").val("").select2();
        },
        bindToggleFilterEvent: function () {
            $("#btn_notification_filter").on("click", function () {
                $("#notification_filter").slideToggle();
            })
        }
    }

    /**
     * Handle add new notification
     */
    function addItem() {
        NotificationPage.formValidator.clearErrors();
        $("#kt_modal_notification_header h2").text(`${NotificationPage.message.create} ${NotificationPage.message.pageTitle.toLocaleLowerCase()}`);
        $("#kt_modal_notification_form input[type='text'],#kt_modal_notification_form textarea, #kt_modal_notification_form select").val("").trigger("change");
        $("#notification_createdDate").val(moment().format("DD/MM/YYYY HH:mm:ss")).trigger("change");
    }

    /**
     * Author: 
     * CreatedDate: 
     * Description: Edit notification by id
     * @param {number} id
     */
    async function editItem(id) {
        NotificationPage.formValidator.clearErrors();
        $("#global_loader").addClass("show");
        NotificationPage.variables.isLoadingFromEdit = true;
        try {
            const response = await httpService.getAsync(ApiRoutes.Notification.v1.Detail(id));
            const data = response.resources;

            // Set fields khác
            Object.keys(data).forEach(key => {
                const selector = `#notification_${key}`;
                const value = key.toLowerCase().includes("date")
                    ? moment(data[key].toString()).format("DD/MM/YYYY HH:mm:ss")
                    : data[key];
                $(selector).val(value).trigger("change");
            });
            $("#kt_modal_notification_header h2").text(`${NotificationPage.message.edit} ${NotificationPage.message.pageTitle.toLocaleLowerCase()}`);
            $("#kt_modal_notification").modal("show");
        } catch (e) {
            console.error(e);
            Swal.fire({
                icon: "error",
                title: NotificationPage.message.errorTitle,
                html: NotificationPage.message.notFound,
                ...AppSettings.sweetAlertOptions(false)
            });
        } finally {
            NotificationPage.variables.isLoadingFromEdit = false; // Reset flag
            $("#global_loader").removeClass("show");
        }
    }

    /**
     * Author:
     * CreatedDate:
     * Description: Delete notification by id
     * @param {number} id
     */
    async function deleteItem(id) {
        const { isConfirmed } = await Swal.fire({
            icon: "question",
            title: NotificationPage.message.confirmTittle,
            html: NotificationPage.message.deleteConfirm,
            ...AppSettings.sweetAlertOptions(true)
        });

        if (!isConfirmed)
            return;

        $("#global_loader").addClass("show");
        try {
            const response = await httpService.deleteAsync(ApiRoutes.Notification.v1.Delete(id));
            if (response?.isSucceeded) {
                /*tableSearch();*/
                NotificationPage.refreshDataTable();
                Swal.fire({
                    icon: "success",
                    title: NotificationPage.message.successTitle,
                    html: NotificationPage.message.deleteSuccess,
                    ...AppSettings.sweetAlertOptions(false)
                })
            }
        } catch (e) {
            AppUtils.handleApiError(e, {
                action: "delete",
                name: NotificationPage.message.pageTitle,
                isShowAlert: true
            })
        }
        finally {
            $("#global_loader").removeClass("show");
        }
    }

    /**
     * Save data (Create or Update) notification
     */
    async function saveData() {
        const btnSave = $("#btn_save_notification");
        btnSave.attr("disabled", true);

        const columns = ["id", "name", "phone", "email", "provinceId", "districtId", "wardId", "address"];
        const data = {};
        columns.forEach(key => {
            const selector = `#notification_${key}`;
            data[key] = $(selector).val();
        });
        const isAdd = !data.id;
        const confirmText = isAdd ? NotificationPage.message.createConfirm : NotificationPage.message.updateConfirm;
        const { isConfirmed } = await Swal.fire({
            icon: 'question',
            title: NotificationPage.message.confirmTittle,
            html: confirmText,
            ...AppSettings.sweetAlertOptions(true)
        });

        if (isConfirmed) {
            btnSave.attr("data-kt-indicator", "on");
            try {
                const response = isAdd ?
                    await httpService.postAsync(ApiRoutes.Notification.v1.Create, data) :
                    await httpService.putAsync(ApiRoutes.Notification.v1.Update, data);
                if (response?.isSucceeded) {
                    if (isAdd) {
                        $("#notification_datatable_search").val("").trigger("change");
                        resetFilter();
                    }
                    else {
                        /*tableSearch();*/
                        NotificationPage.refreshDataTable();
                    }

                    $("#kt_modal_notification").modal("hide");
                    const successText = isAdd ? NotificationPage.message.createSuccess : NotificationPage.message.updateSuccess;
                    Swal.fire({
                        icon: "success",
                        title: NotificationPage.message.successTitle,
                        html: successText,
                        ...AppSettings.sweetAlertOptions(false)
                    });
                }

            } catch (e) {
                console.log(e);
                AppUtils.handleApiError(e, {
                    action: isAdd ? "create" : "update",
                    name: NotificationPage.message.pageTitle,
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
        NotificationPage.table.column(2).search($("#filter_title").val().trim());
        NotificationPage.table.column(3).search($("#filter_content").val().trim());
        NotificationPage.table.column(4).search($("#filter_created_date").val());
        NotificationPage.table.search($("#notification_datatable_search").val().trim()).draw();
    }
    /**
     * Reset filter
     */
    function resetFilter() {
        $("#filter_title").val("");
        $("#filter_content").val("");
        $("#filter_userIds").val("").trigger("change");
        $("#filter_notificationCategoryIds").val("").trigger("change");
        NotificationPage.plugins.dateRangePickerFilter.clear();
        tableSearch();
    }

    //async function loadDataUser() {
    //    try {
    //        const response = await httpService.getAsync(ApiRoutes.User.v1.List);
    //        const data = response.resources;
    //        data.forEach(function (item) {
    //            $("#filter_userIds").append(new Option(item.username, item.id, false, false));
    //        });
    //    } catch (e) {
    //        console.error(e);
    //    }
    //}

    async function loadDataNotificationCategory() {
        try {
            const response = await httpService.getAsync(ApiRoutes.NotificationCategory.v1.List);
            const data = response.resources;
            data.forEach(function (item) {
                $("#filter_notificationCategoryIds").append(new Option(item.name, item.id, false, false));
            });
        } catch (e) {
            console.error(e);
        }
    }
    // On document ready
    KTUtil.onDOMContentLoaded(async function () {
        await AppEntry.init();
        if (!NotificationPage.permissionFlags.canView) {
            AppSettings.mainElements.PAGE_CONTENT.addClass("d-none");
            AppSettings.mainElements.NOT_FOUND.removeClass("d-none");
        }
        else
            NotificationPage.init();
    });
})();