"use strict";

(function () {
    // Class definition
    const MenuPage = {
        elements: {
            treeView: $("#menu_tree_view"),
            addUpdateModal: $("#kt_modal_menu"),
            addUpdateModalHeader: $("#kt_modal_menu_header h2"),
            btnSaveMenu: $("#btn_save_menu"),
            btnAddMenu: $("#btn_add_menu"),
            btnDeleteMenu: $("#btn_delete_menu")
        },
        permissionFlags: AppUtils.getPermissionFlags(),
        menuSource: [],
        formValidator: null,
        messages: {
            pageTitle: I18n.t("menu", "PAGE_TITLE"),
            actions: I18n.t("common", "ACTIONS"),
            create: I18n.t("common", "ADD_NEW"),
            edit: I18n.t("common", "EDIT"),
            delete: I18n.t("common", "DELETE"),
            confirmTittle: I18n.t("common", "CONFIRM_TITLE"),
            successTitle: I18n.t("common", "SUCCESS_TITLE"),
            errorTitle: I18n.t("common", "ERROR_TITLE"),
            failTitle: I18n.t("common", "FAIL_TITLE"),
            warningTitle: I18n.t("common", "WARNING_TITLE"),
            createConfirm: I18n.t("common", "CREATE_CONFIRM", { name: I18n.t("menu", "PAGE_TITLE").toLocaleLowerCase() }),
            createSuccess: I18n.t("common", "CREATE_SUCCESS", { name: I18n.t("menu", "PAGE_TITLE") }),
            createError: I18n.t("common", "CREATE_ERROR", { name: I18n.t("menu", "PAGE_TITLE").toLocaleLowerCase() }),
            updateConfirm: I18n.t("common", "UPDATE_CONFIRM", { name: I18n.t("menu", "PAGE_TITLE").toLocaleLowerCase() }),
            updateSuccess: I18n.t("common", "UPDATE_SUCCESS", { name: I18n.t("menu", "PAGE_TITLE") }),
            updateError: I18n.t("common", "UPDATE_ERROR", { name: I18n.t("menu", "PAGE_TITLE").toLocaleLowerCase() }),
            deleteConfirm: I18n.t("common", "DELETE_CONFIRM", { name: I18n.t("menu", "PAGE_TITLE").toLocaleLowerCase() }),
            deleteSuccess: I18n.t("common", "DELETE_SUCCESS", { name: I18n.t("menu", "PAGE_TITLE").toLocaleLowerCase() }),
            deleteError: I18n.t("common", "DELETE_ERROR", { name: I18n.t("menu", "PAGE_TITLE").toLocaleLowerCase() }),
            notFound: I18n.t("common", "NOT_FOUND", { name: I18n.t("menu", "PAGE_TITLE").toLocaleLowerCase() }),
            validationError: I18n.t("common", "VALIDATION_ERROR"),
            noData: I18n.t("menu", "NO_DATA"),
        },
        init: function () {
            this.initPlugins();
            this.loadRelatedData();
            this.bindEvents();
            this.formValidator = new FormValidator({
                formSelector: "#kt_modal_menu_form",
                handleSubmit: saveData,
                rules: [
                    {
                        element: "#menu_name",
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
                        element: "#menu_url",
                        rule: [
                            {
                                name: "required",
                                message: I18n.t("common", "REQUIRED", { field: "Đường dẫn" })
                            }
                        ]
                    },
                    {
                        element: "#menu_menuType",
                        rule: [
                            {
                                name: "required",
                                message: I18n.t("common", "REQUIRED_SELECT", { field: "Loại" })
                            }
                        ]
                    }
                ]
            });
        },
        initPlugins: function () {
            $("#menu_actionIds").select2({
                dropdownParent: $("#kt_modal_menu"),
                allowClear: true,
                placeholder: "Chọn thao tác",
                language: currentLang
            });

            $("#menu_sortOrder").select2({
                dropdownParent: $("#kt_modal_menu"),
                language: currentLang
            });

            $("#menu_menuType").select2({
                dropdownParent: $("#kt_modal_menu"),
                language: currentLang
            });

            $("#filter_menu_type").select2({
                language: currentLang
            });
        },
        bindEvents: function () {
            this.bindEditEvent();
            this.bindDeleteEvent();
            this.bindAddEvent();
            this.bindFilterMenuTypeChangeEvent();
        },
        bindEditEvent: function () {
            this.elements.treeView.on("click", ".menu-link", function () {
                const id = $(this).attr("data-menu-item-id");
                editItem(id);
            });
        },
        bindDeleteEvent: function () {
            $("#btn_delete_menu").on("click", function () {
                const id = $("#menu_id").val();
                deleteItem(id);
            });
        },
        bindAddEvent: function () {
            this.elements.btnAddMenu.on("click", function () {
                addItem();
            })
        },
        bindFilterMenuTypeChangeEvent: function () {
            $("#filter_menu_type").on("change", function () {
                loadMenuData();
            });
        },
        loadRelatedData: function () {
            loadActionData();
            loadMenuList();
            /*loadMenuData();*/
            loadMenuTypeData();
        }
    }

    async function loadMenuTypeData() {
        try {
            const response = await httpService.getAsync(ApiRoutes.Menu.v1.Types);
            const data = response?.resources;
            if (data && data.length > 0) {
                data.forEach(item => {
                    $("#menu_menuType").append(new Option(item.name, item.id, false, false));
                    $("#filter_menu_type").append(new Option(item.name, item.id, false, false));
                })
                $("#filter_menu_type").val(data[0].id).trigger("change");
            }
        } catch (e) {
            console.error(e);
        }

    }

    /**
     * Load action data
     */
    async function loadActionData() {
        try {
            const response = await httpService.getAsync(ApiRoutes.Action.v1.List);
            const data = response?.resources || [];
            data.forEach(item => {
                $("#menu_actionIds").append(new Option(item.name, item.id, false, false));
            })
        } catch (e) {
            console.error(e);
        }
    }

    /**
     * Load menu list
     */
    async function loadMenuList() {
        try {
            $("#menu_parentId").html("");
            const response = await httpService.getAsync(ApiRoutes.Menu.v1.List);
            const data = response.resources || [];
            let lastLabel = 0;
            data.forEach((item, index) => {
                $("#menu_parentId").append(new Option(item.name, item.id, false, false));
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

            $("#menu_parentId").select2({
                dropdownParent: $("#kt_modal_menu"),
                allowClear: true,
                placeholder: "Chọn danh mục cha",
                language: currentLang,
                templateResult: formatMenuSelectResult,
                data: data
            });

        } catch (e) {
            console.error(e);
            $("#menu_parentId").select2({
                dropdownParent: $("#kt_modal_menu"),
                allowClear: true,
                placeholder: "Chọn danh mục cha",
                language: currentLang
            });
        }
    }

    function formatMenuSelectResult(data) {
        let html = $(`<span> </span>`);
        if (data.treeIds) {
            const level = data.treeIds.split("_").length - 1;
            html = $(`<span class="ps-${10 * level}" data-menu-parent-id="${data.id}"><span class="fw-bold">${data.label}.</span> ${data.name}</span>`);
        }
        return html;
    };

    /**
     * Get menu data
     */
    async function loadMenuData() {
        MenuPage.elements.treeView.append(AppSettings.loadingItem);
        try {
            const response = await httpService.postAsync(ApiRoutes.Menu.v1.Paged, {
                keyword: $("#filter_menu_type").val()
            });
            const data = response?.resources;
            MenuPage.menuSource = data || [];
        } catch (e) {
            console.error(e);
            MenuPage.menuSource = [];
        } finally {
            //generateMenu();
            generateMenuTree();
        }
    }

    function generateMenu() {
        if (MenuPage.menuSource.length === 0) {
            MenuPage.elements.treeView.html("Không có dữ liệu. Vui lòng tạo mới danh mục.");
        }
        else {
            const html = MenuPage.menuSource.map(item => generateMenuItem(item))
            MenuPage.elements.treeView.html(html);
        }
    }

    /**
     * 
     * @param {object} data
     * @returns
     */
    function generateMenuItem(data) {
        let html = "";
        if (data.child == null || data.child.length === 0) {
            const icon = data.icon && data.icon !== null ?
                `<span class="menu-icon">${data.icon}</span>` :
                data.parentId !== null && data.parentId !== 0 ?
                    `<span class="menu-bullet"><span class="bullet bullet-dot"></span></span>` : "";
            html = `<div class="menu-item">
                        <a class="menu-link py-3" href="#" data-menu-item-id="${data.id}">
                            <span class="menu-icon">${icon}</span>
                            <span class="menu-title">${data.name}</span>
                        </a>
                    </div>`;
        }
        else {
            const childHtml = data.child.map(item => generateMenuItem(item)).join("");
            const icon = data.icon && data.icon !== null ?
                `<span class="menu-icon">${data.icon}</span>` :
                `<span class="menu-bullet"><span class="bullet bullet-dot"></span></span>`;

            html = `<div data-kt-menu-trigger="click" class="menu-item menu-accordion menu-link-indention">
                        <a class="menu-link py-3" href="#" data-menu-item-id="${data.id}">
                            ${icon}
                            <span class="menu-title">${data.name}</span>
                            <span class="menu-arrow"></span>
                        </a>
                        <div class="menu-sub menu-sub-accordion pt-3">
                            ${childHtml}
                        </div>
                    </div>`;
        }

        return html;
    }

    function generateMenuTree() {
        if (MenuPage.menuSource.length === 0) {
            MenuPage.elements.treeView.html(MenuPage.messages.noData.replace("{name}", $("filter_menu_type option:selected").text()));
        }
        else {
            const html = MenuPage.menuSource.map(item => generateMenuTreeItem(item))
            if (MenuPage.elements.treeView.jstree(true)) {
                MenuPage.elements.treeView.jstree(true).destroy();
            }
            MenuPage.elements.treeView.html(`<ul>${html}</ul>`);
            MenuPage.elements.treeView.jstree({
                "core": {
                    "themes": {
                        "responsive": false
                    }
                },
                "types": {
                    "default": {
                        "icon": "ki-outline ki-folder fs-4 text-warning"
                    },
                    "file": {
                        "icon": "ki-outline ki-file fs-4 text-warning"
                    }
                },
                "plugins": ["types"]
            });
        }
    }

    function generateMenuTreeItem(data) {
        let html = "";
        if (data.child === null || data.child.length === 0) {
            html = `<li data-jstree='{ "type" : "folder" }'>
                        <a href="#" data-menu-item-id="${data.id}" class="menu-link">
                            ${data.name}
                        </a>
                    </li>`;
        }
        else {
            const childHtml = data.child.map(item => generateMenuTreeItem(item)).join("");
            html = `<li data-jstree='{"opened" : true }'>
                        <a href="#" data-menu-item-id="${data.id}" class="menu-link">
                            ${data.name}
                        </a>
                        <ul>
                            ${childHtml}
                        </ul>
                    </li>`;
        }
        return html;
    }

    /**
     * Handle add new menu
     */
    function addItem() {
        MenuPage.formValidator.clearErrors();
        MenuPage.elements.addUpdateModalHeader.text(`${MenuPage.messages.create} ${MenuPage.messages.pageTitle.toLocaleLowerCase()}`);
        $("#btn_delete_menu").addClass("d-none");
        $("#kt_modal_menu_form input[type='text']").val("").trigger("change");
        $("#kt_modal_menu_form #menu_parentId").val(null).trigger("change");
        $("#kt_modal_menu_form #menu_sortOrder").val(1).trigger("change");
        $("#kt_modal_menu_form #menu_actionIds").val([]).trigger("change");
        $("#kt_modal_menu_form #menu_menuType").val($("#filter_menu_type").val()).trigger("change");
        $("#kt_modal_menu_form #menu_isAdminOnly").prop("checked", false);
        $("#menu_createdDate").val(moment().format("DD/MM/YYYY HH:mm:ss")).trigger("change");
    }

    /**
     * Author: 
     * CreatedDate: 
     * Description: Edit menu by id
     * @param {number} id
     */
    async function editItem(id) {
        MenuPage.formValidator.clearErrors();
        $("#btn_delete_menu").removeClass("d-none");
        $("#global_loader").addClass("show");
        try {
            const response = await httpService.getAsync(ApiRoutes.Menu.v1.Detail(id));
            const data = response.resources;
            Object.keys(data).forEach(key => {
                const selector = `#menu_${key}`;
                if (key === "isAdminOnly") {
                    $(selector).prop("checked", data[key]).trigger("change");
                }
                else {
                    const value = key.toLocaleLowerCase().includes("date") ? moment(data[key].toString()).format("DD/MM/YYYY HH:mm:ss") : data[key];
                    $(selector).val(value).trigger("change");
                }

            })
            MenuPage.elements.addUpdateModalHeader.text(`${MenuPage.messages.edit} ${MenuPage.messages.pageTitle.toLocaleLowerCase()}`);
            MenuPage.elements.addUpdateModal.modal("show");
        } catch (e) {
            console.error(e);
            Swal.fire({
                icon: "error",
                title: MenuPage.messages.errorTitle,
                html: MenuPage.messages.notFound,
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
     * Description: Delete menu by id
     * @param {number} id
     */
    async function deleteItem(id) {

        const { isConfirmed } = await Swal.fire({
            icon: "question",
            title: MenuPage.messages.confirmTittle,
            html: MenuPage.messages.deleteConfirm,
            ...AppSettings.sweetAlertOptions(true)
        });

        if (!isConfirmed)
            return;

        MenuPage.elements.btnDeleteMenu.attr("disabled", true);
        try {
            MenuPage.elements.btnDeleteMenu.attr("data-kt-indicator", "on");
            const response = await httpService.deleteAsync(ApiRoutes.Menu.v1.Delete(id));
            if (response?.isSucceeded) {
                loadMenuData();
                Swal.fire({
                    icon: "success",
                    title: MenuPage.messages.successTitle,
                    html: MenuPage.messages.deleteSuccess,
                    ...AppSettings.sweetAlertOptions(false)
                })
            }
        } catch (e) {
            console.error(e);
            Swal.fire({
                icon: "error",
                title: MenuPage.messages.failTitle,
                html: MenuPage.messages.deleteError,
                ...AppSettings.sweetAlertOptions(false)
            })
        }
        finally {
            MenuPage.elements.btnDeleteMenu.removeAttr("data-kt-indicator");
            MenuPage.elements.btnDeleteMenu.removeAttr("disabled");
        }
    }

    /**
     * Save data (Create or Update) menu
     */
    async function saveData() {

        const btnSave = $("#btn_save_menu");
        btnSave.attr("disabled", true);

        const columns = ["id", "name", "parentId", "menuType", "url", "icon", "className", "sortOrder", "actionIds"];
        const data = {};
        columns.forEach(key => {
            const selector = `#menu_${key}`;
            data[key] = $(selector).val();
        });
        data.isAdminOnly = $("#kt_modal_menu_form #menu_isAdminOnly").is(":checked");
        const isAdd = !data.id;
        const confirmText = isAdd ? MenuPage.messages.createConfirm : MenuPage.messages.updateConfirm;
        const { isConfirmed } = await Swal.fire({
            icon: 'question',
            title: MenuPage.messages.confirmTittle,
            html: confirmText,
            ...AppSettings.sweetAlertOptions(true)
        });

        if (isConfirmed) {
            btnSave.attr("data-kt-indicator", "on");
            try {
                const response = isAdd ?
                    await httpService.postAsync(ApiRoutes.Menu.v1.Create, data) :
                    await httpService.putAsync(ApiRoutes.Menu.v1.Update, data);
                if (response?.isSucceeded) {
                    loadMenuData();
                    loadMenuList();
                    $("#kt_modal_menu").modal("hide");
                    const successText = isAdd ? MenuPage.messages.createSuccess : MenuPage.messages.updateSuccess;
                    Swal.fire({
                        icon: "success",
                        title: MenuPage.messages.successTitle,
                        html: successText,
                        ...AppSettings.sweetAlertOptions(false)
                    });
                }

            } catch (e) {
                const { responseJSON } = e;
                let errorText = "";
                let errorTitle = "";
                let icon = ""
                if (responseJSON?.status === AppSettings.httpStatusCode.UNPROCESSABLE_ENTITY) {
                    icon = "warning";
                    errorTitle = MenuPage.messages.validationError;

                    const messages = [];
                    responseJSON?.errors?.forEach(error => {
                        error.message.forEach(item => {
                            messages.push(`<li class="text-start">${item}</li>`);
                        })
                    });
                    errorText = `<ul>${messages.join("")}</ul>`;
                }
                else {
                    icon = "error";
                    errorTitle = MenuPage.messages.failTitle;
                    errorText = isAdd ? MenuPage.messages.createError : MenuPage.messages.updateError;
                }
                Swal.fire({
                    icon: icon,
                    title: errorTitle,
                    html: errorText,
                    ...AppSettings.sweetAlertOptions(false)
                });

            }
            finally {
                btnSave.removeAttr("data-kt-indicator");
            }
        }
        btnSave.removeAttr("disabled");
    }

    // On document ready
    KTUtil.onDOMContentLoaded(async function () {
        await AppEntry.init();
        if (!MenuPage.permissionFlags.canView) {
            AppSettings.mainElements.APP_MAIN.addClass("d-none");
            AppSettings.mainElements.NOT_FOUND.removeClass("d-none");
        }
        else
            MenuPage.init();
    });
})();