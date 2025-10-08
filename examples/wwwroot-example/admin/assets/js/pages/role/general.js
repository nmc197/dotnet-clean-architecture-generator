"use strict";

(function () {
    const RolePage = {
        permissionFlags: AppUtils.getPermissionFlags(),
        userRoles: AppUtils.getRoles(),
        formValidator: null,
        messages: {
            pageTitle: I18n.t("role", "PAGE_TITLE"),
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
            createConfirm: I18n.t("common", "CREATE_CONFIRM", { name: I18n.t("role", "PAGE_TITLE").toLocaleLowerCase() }),
            createSuccess: I18n.t("common", "CREATE_SUCCESS", { name: I18n.t("role", "PAGE_TITLE").toLocaleLowerCase() }),
            createError: I18n.t("common", "CREATE_ERROR", { name: I18n.t("role", "PAGE_TITLE").toLocaleLowerCase() }),
            updateConfirm: I18n.t("common", "UPDATE_CONFIRM", { name: I18n.t("role", "PAGE_TITLE").toLocaleLowerCase() }),
            updateSuccess: I18n.t("common", "UPDATE_SUCCESS", { name: I18n.t("role", "PAGE_TITLE") }),
            updateError: I18n.t("common", "UPDATE_ERROR", { name: I18n.t("role", "PAGE_TITLE").toLocaleLowerCase() }),
            deleteConfirm: I18n.t("common", "DELETE_CONFIRM", { name: I18n.t("role", "PAGE_TITLE").toLocaleLowerCase() }),
            deleteSuccess: I18n.t("common", "DELETE_SUCCESS", { name: I18n.t("role", "PAGE_TITLE").toLocaleLowerCase() }),
            deleteError: I18n.t("common", "DELETE_ERROR", { name: I18n.t("role", "PAGE_TITLE").toLocaleLowerCase() }),
            notFound: I18n.t("common", "NOT_FOUND", { name: I18n.t("role", "PAGE_TITLE").toLocaleLowerCase() }),
            validationError: I18n.t("common", "VALIDATION_ERROR")
        },
        init: function () {
            loadMenuPermission();
            loadData();
            this.formValidator = new FormValidator({
                formSelector: "#kt_modal_add_role_form",
                handleSubmit: saveData,
                rules: [
                    {
                        element: "#role_name",
                        rule: [
                            {
                                name: "required",
                                message: I18n.t("common", "REQUIRED", { field: "Tên vai trò" })
                            },
                            {
                                name: "maxLength",
                                message: I18n.t("common", "TOO_LONG", { field: "Tên vai trò", max: 255 }),
                                params: 255
                            },
                        ]

                    },
                    {
                        element: "#role_description",
                        rule: [
                            {
                                name: "maxLength",
                                message: I18n.t("common", "TOO_LONG", { field: "Mô tả vai trò", max: 500 }),
                                params: 500,
                                allowNullOrEmpty: true
                            }
                        ]

                    }
                ]
            })
            this.bindEvents();
        },
        bindEvents: function () {
            this.bindCreateRoleEvent();
            this.bindDeleteRolEvent();
            this.bindEditRoleEvent();
            this.bindCheckAllPermission();
        },
        bindCreateRoleEvent: function () {
            $("#list_role").on("click", "#btn_create_role", function () {
                addRole();
            });
        },
        bindDeleteRolEvent: function () {
            $("#list_role").on("click", ".btn-delete-role", function () {
                const id = Number($(this).attr("data-role-id"));
                deleteRole(id);
            });
        },
        bindCheckAllPermission: function () {
            $("#kt_roles_select_all").on("change", function () {
                const isCheckAll = $("#kt_roles_select_all").is(":checked");
                $("#table_role_permission tbody input:not(:disabled)").prop("checked", isCheckAll);
            })
        },
        bindEditRoleEvent: function () {
            $("#list_role").on("click", ".btn-edit-role", function () {
                const id = Number($(this).attr("data-role-id"));
                editRole(id);
            });
        }
    }

    /**
     * Load menu with permisson data
     */
    async function loadMenuPermission() {
        const ísAdmin = RolePage.userRoles.some(x => x.id === AppSettings.roles.ADMIN);
        if (!ísAdmin)
            $("#tr_roles_select_all").addClass("d-none");
        try {
            const response = await httpService.getAsync(ApiRoutes.Menu.v1.Permissons);
            const data = response?.resources;
            const html = data?.map(item => {
                return `<tr>
                            <!--begin::Label-->
                            <td class="text-gray-800 min-w-125px ps-${(item.treeIds.split("_").length - 1) * 10}">${item.name}</td>
                            <!--end::Label-->
                            <!--begin::Input group-->
                            <td>
                                <!--begin::Wrapper-->
                                <div class="d-flex">
                                    <!--begin::Checkbox-->
                                    <label class="form-check form-check-sm form-check-custom form-check-solid min-w-125px">
                                        <input class="form-check-input" type="checkbox" value="" ${item.hasCreate ? "" : "disabled=true"} data-menu-action-id="${item.id}_${AppSettings.actions.CREATE}" />
                                        <span class="form-check-label">
                                            Thêm mới
                                        </span>
                                    </label>
                                    <!--end::Checkbox-->
                                    <!--begin::Checkbox-->
                                    <label class="form-check form-check-custom form-check-solid min-w-75px">
                                        <input class="form-check-input" type="checkbox" value="" ${item.hasRead ? "" : "disabled=true"} data-menu-action-id="${item.id}_${AppSettings.actions.READ}"/>
                                        <span class="form-check-label">
                                            Xem
                                        </span>
                                    </label>
                                    <!--end::Checkbox-->
                                    <!--begin::Checkbox-->
                                    <label class="form-check form-check-custom form-check-solid min-w-125px">
                                        <input class="form-check-input" type="checkbox" value="" ${item.hasUpdate ? "" : "disabled=true"}data-menu-action-id="${item.id}_${AppSettings.actions.UPDATE}" />
                                        <span class="form-check-label">
                                            Cập nhật
                                        </span>
                                    </label>
                                    <!--end::Checkbox-->
                                    <!--begin::Checkbox-->
                                    <label class="form-check form-check-custom form-check-solid min-w-75px">
                                        <input class="form-check-input" type="checkbox" value=""  ${item.hasDelete ? "" : "disabled=true"} data-menu-action-id="${item.id}_${AppSettings.actions.DELETE}"/>
                                        <span class="form-check-label">
                                            Xoá
                                        </span>
                                    </label>
                                    <!--end::Checkbox-->
                                    <!--begin::Checkbox-->
                                    <label class="form-check form-check-custom form-check-solid min-w-125px">
                                        <input class="form-check-input" type="checkbox" value="" ${item.hasExport ? "" : "disabled=true"} data-menu-action-id="${item.id}_${AppSettings.actions.EXPORT}" />
                                        <span class="form-check-label">
                                            Xuất dữ liệu
                                        </span>
                                    </label>
                                    <!--end::Checkbox-->
                                    <!--begin::Checkbox-->
                                    <label class="form-check form-check-custom form-check-solid min-w-75px">
                                        <input class="form-check-input" type="checkbox" value="" ${item.hasApprove ? "" : "disabled=true"} data-menu-action-id="${item.id}_${AppSettings.actions.APPROVE}" />
                                        <span class="form-check-label">
                                            Duyệt
                                        </span>
                                    </label>
                                    <!--end::Checkbox-->
                                </div>
                                <!--end::Wrapper-->
                            </td>
                            <!--end::Input group-->
                        </tr>`;
            })
            $("#table_role_permission tbody").append(html);
        } catch (e) {

        }
    }

    /**
     * Load role data
     */
    async function loadData() {
        //$("#global_loader").addClass("show");
        $("#list_role").append(AppSettings.loadingItem);
        try {
            //$("#list_role").html("");
            const response = await httpService.postAsync(ApiRoutes.Role.v1.Paged, {});
            const data = response?.resources;
            const html = data?.map(item => generateRoleItem(item));
            if (RolePage.permissionFlags.canCreate) {
                html.push(`<div class="col-md-4">
                        <!--begin::Card-->
                        <div class="card h-md-100">
                            <!--begin::Card body-->
                            <div class="card-body d-flex flex-center">
                                <!--begin::Button-->
                                <button type="button" class="btn btn-clear d-flex flex-column flex-center" data-bs-toggle="modal" data-bs-target="#kt_modal_add_role" id="btn_create_role">
                                    <!--begin::Illustration-->
                                    <img src="/admin/assets/media/illustrations/sketchy-1/4.png" alt="" class="mw-100 mh-150px mb-7">                      
                                    <!--end::Illustration-->

                                    <!--begin::Label-->
                                    <div class="fw-bold fs-3 text-gray-600 text-hover-primary">${RolePage.messages.create} ${RolePage.messages.pageTitle.toLowerCase()}</div>
                                    <!--end::Label-->
                                </button>
                                <!--begin::Button-->
                            </div>
                            <!--begin::Card body-->
                        </div>
                        <!--begin::Card-->
                    </div>`);
            }

            $("#list_role").html(html);
        } catch (e) {
            $("#list_role").html("");
        }
        //$("#global_loader").removeClass("show");
    }

    /**
     * Generate role item 
     * @param {object} data
     */
    function generateRoleItem(role) {
        const permissionMetaHtml = role.permissons.length > 5 ? `<div class="d-flex align-items-center py-2"><span class="bullet bg-primary me-3"></span> <em>và ${role.permissons.length - 5} vai trò nữa ...</em></div>` : "";
        const permissons = role.permissons.length > 5 ? role.permissons.slice(0, 5) : role.permissons;
        const permissonsHtml = permissons.map(item => `<div class="d-flex align-items-center py-2"><span class="bullet bg-primary me-3"></span> ${item.actionName} ${item.menuName.toLowerCase()}</div>`);
        const canDelete = RolePage.permissionFlags.canDelete && !AppSettings.mainRoles.includes(role.id);
        const html = `<div class="col-md-4">
                <!--begin::Card-->
                <div class="card card-flush h-md-100">
                    <!--begin::Card header-->
                    <div class="card-header">
                        <!--begin::Card title-->
                        <div class="card-title">
                            <h2>${role.name}</h2>
                        </div>
                        <!--end::Card title-->
                    </div>
                    <!--end::Card header-->
                    <!--begin::Card body-->
                    <div class="card-body pt-1">
                        <!--begin::Users-->
                        <div class="fw-bold text-gray-600 mb-5">Tổng số người dùng có vai trò này: ${role.totalUser}</div>
                        <!--end::Users-->
                        <!--begin::Permissions-->
                        <div class="d-flex flex-column text-gray-600">
                            ${permissonsHtml.join("")}
                            ${permissionMetaHtml}
                        </div>
                        <!--end::Permissions-->
                    </div>
                    <!--end::Card body-->
                    <!--begin::Card footer-->
                    <div class="card-footer flex-wrap pt-0">
                        <a href="#" class="btn btn-light btn-active-primary my-1 me-2 btn-edit-role" data-bs-toggle="modal" data-bs-target="#kt_modal_add_role" data-role-id=${role.id}>${RolePage.permissionFlags.canUpdate ? RolePage.messages.edit : RolePage.messages.detail}</a>
                        <button type="button" class="btn btn-light btn-active-light-danger my-1 btn-delete-role ${!canDelete ? "d-none" : ""}" data-role-id=${role.id}>${RolePage.messages.delete}</button>
                    </div>
                    <!--end::Card footer-->
                </div>
                <!--end::Card-->
            </div>`;

        return html;
    }

    /**
     * Handle add new role
     */
    function addRole() {
        RolePage.formValidator.clearErrors();
        $("#role_id").val("").trigger("change");
        $("#role_name").val("").trigger("change");
        $("#role_description").val("").trigger("change");
        $("#role_createdDate").val(moment().format("DD/MM/YYYY HH:mm:ss")).trigger("change");
        $("#table_role_permission tbody input").prop("checked", false);
        $("#kt_modal_add_role_title").text(`${RolePage.messages.create} ${RolePage.messages.pageTitle.toLocaleLowerCase()}`);
        $("#kt_modal_add_role_form input, #kt_modal_add_role_form textarea").attr("disabled", false);
        $("#role_createdDate").attr("disabled", true);
        $("#btn_save_role_data").removeClass("d-none");
        $("#btn_cancel_save_role").text(RolePage.messages.cancel);
    }

    /**
     * Delete role by id
     * @param {number} id
     */
    async function editRole(id) {
        RolePage.formValidator.clearErrors();
        $("#table_role_permission tbody input").prop("checked", false);
        $("#global_loader").addClass("show");
        if (!RolePage.permissionFlags.canUpdate) {
            $("#kt_modal_add_role_form input, #kt_modal_add_role_form textarea").attr("disabled", true);
            $("#kt_modal_add_role_title").text(`${RolePage.messages.detail} ${RolePage.messages.pageTitle.toLocaleLowerCase()}`);
            $("#btn_save_role_data").addClass("d-none");
            $("#btn_cancel_save_role").text(RolePage.messages.ok);
        }
        else {
            $("#kt_modal_add_role_title").text(`${RolePage.messages.edit} ${RolePage.messages.pageTitle.toLocaleLowerCase()}`);
            $("#btn_save_role_data").removeClass("d-none");
            $("#btn_cancel_save_role").text(RolePage.messages.cancel);
        }
        //Chỉ admin mới có quyền chỉnh sửa tên vs mô tả
        const ísAdmin = RolePage.userRoles.some(x => x.id === AppSettings.roles.ADMIN);
        if (!ísAdmin) {
            $("#role_name, #role_description").attr("disabled", true);
        }
        else {
            if (!ísAdmin) { //nếu là admin thì k được sửa các role liên quan đến nhân viên của văn phòng
                $("#table_role_permission tbody").addClass("d-none");
                $("#permission_note").removeClass("d-none");
            }
            else {
                $("#table_role_permission tbody").removeClass("d-none");
                $("#permission_note").addClass("d-none");
            }
        }

        $("#role_createdDate").attr("disabled", true);
        try {
            const response = await httpService.getAsync(ApiRoutes.Role.v1.Permissions(id));
            const data = response?.resources;
            Object.keys(data).forEach(key => {
                const selector = `#role_${key}`;
                const value = key.toLocaleLowerCase().includes("date") ? moment(data[key].toString()).format("DD/MM/YYYY HH:mm:ss") : data[key];
                $(selector).val(value).trigger("change");
            })
            //$("#role_name").val(data?.name).trigger("change");
            //$("#role_description").val(data.description).trigger("change");
            //$("#role_createdDate").val(moment(data.createdDate).format("DD/MM/YYYY HH:mm:ss")).trigger("change");
            data?.permissions?.forEach(item => {
                $(`[data-menu-action-id='${item.menuId}_${item.actionId}']`).prop("checked", true);
            });


        } catch (e) {
            Swal.fire({
                icon: "error",
                title: RolePage.messages.errorTitle,
                html: RolePage.messages.notFound,
                ...AppSettings.sweetAlertOptions(false)
            });
        }
        finally {
            $("#global_loader").removeClass("show");
        }

    }


    /**
     * Create or update role
     */
    async function saveData() {
        const btnSave = $("#btn_save_role_data");
        btnSave.attr("disabled", true);

        const columns = ["id", "name", "description"];
        const data = {
            isCheckAll: $("#kt_roles_select_all").is(":checked"),
            permissions: []
        };
        columns.forEach(key => {
            const selector = `#role_${key}`;
            data[key] = $(selector).val();
        });

        if (!data.isCheckAll) {
            const checkboxs = $("#table_role_permission tbody input:not(:disabled)");
            for (let item of checkboxs) {
                if ($(item).attr("id") !== "kt_roles_select_all") {
                    const isChecked = $(item).is(":checked");
                    if (isChecked) {
                        const [menuId, actionId] = $(item).attr("data-menu-action-id").split("_");
                        data.permissions.push({
                            menuId,
                            actionId
                        });
                    }

                }
            }
        }

        //$("#table_role_permission tbody input:not(:disabled)").forEach(item => {
        //    const isCheck = $(item).is(":checked");
        //    const [menuId, actionId] = $(item).attr("data-menu-action-id").split("_");
        //    if (isCheck)
        //        data.permissions.push({
        //            menuId,
        //            actionId
        //        });
        //})

        const isAdd = !data.id;
        const confirmText = isAdd ? RolePage.messages.createConfirm : RolePage.messages.updateConfirm;
        const { isConfirmed } = await Swal.fire({
            icon: 'question',
            title: RolePage.messages.confirmTittle,
            html: confirmText,
            ...AppSettings.sweetAlertOptions(true)
        });

        if (isConfirmed) {
            try {
                btnSave.attr("data-kt-indicator", "on");
                const response = isAdd ?
                    await httpService.postAsync(ApiRoutes.Role.v1.Create, data) :
                    await httpService.putAsync(ApiRoutes.Role.v1.Update, data);
                if (response?.isSucceeded) {
                    loadData();
                    $("#kt_modal_add_role").modal("hide");
                    const successText = isAdd ? RolePage.messages.createSuccess : RolePage.messages.updateSuccess;
                    Swal.fire({
                        icon: "success",
                        title: RolePage.messages.successTitle,
                        html: successText,
                        ...AppSettings.sweetAlertOptions(false)
                    });
                }
            } catch (e) {
                AppUtils.handleApiError(e, {
                    action: isAdd ? "create" : "update",
                    name: RolePage.messages.pageTitle,
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
     * Delete role by id
     * @param {number} id
     */
    async function deleteRole(id) {
        const { isConfirmed } = await Swal.fire({
            icon: "question",
            title: RolePage.messages.confirmTittle,
            html: RolePage.messages.deleteConfirm,
            ...AppSettings.sweetAlertOptions(true)
        });

        if (!isConfirmed)
            return;

        /*$("#global_loader").addClass("show");*/
        try {
            const response = await httpService.deleteAsync(ApiRoutes.Role.v1.Delete(id));
            if (response?.isSucceeded) {
                loadData();
                Swal.fire({
                    icon: "success",
                    title: RolePage.messages.successTitle,
                    html: RolePage.messages.deleteSuccess,
                    ...AppSettings.sweetAlertOptions(false)
                })
            }
        } catch (e) {
            console.error(e);
            Swal.fire({
                icon: "error",
                title: RolePage.messages.failTitle,
                html: RolePage.messages.deleteError,
                ...AppSettings.sweetAlertOptions(false)
            })
        }
        finally {
            /*$("#global_loader").removeClass("show");*/
        }
    }

    // On document ready
    KTUtil.onDOMContentLoaded(async function () {
        await AppEntry.init();
        if (!RolePage.permissionFlags.canView) {
            AppSettings.mainElements.APP_MAIN.addClass("d-none");
            AppSettings.mainElements.NOT_FOUND.removeClass("d-none");
        }
        else
            RolePage.init();

    });
})();