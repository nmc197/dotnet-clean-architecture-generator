"use strict";
(function () {
    const SideBar = {
        activeMenu: [],
        init: function () {
            getMenuData();
            getPermissionData();
        }
    }

    /**
     * get menu data by user id
     */
    async function getMenuData() {
        let menuData = JSON.parse(localStorage.getItem("menus"));
        let menus = menuData?.data || [];
        const html = menus.map(item => generateMenu(item))
        $(".app-main-menu").html(html);
        if (SideBar.activeMenu && SideBar.activeMenu.length > 0) {
            SideBar.activeMenu.forEach(item => $(`[data-menu-id="${item}"]`).addClass("show hover"));
        }
        const twentyFourHours = 24 * 60 * 60 * 1000;
        try {
            if (!menuData?.lastUpdated || (Date.now() - parseInt(menuData.lastUpdated)) > twentyFourHours) {
                const response = await httpService.getAsync(ApiRoutes.User.v1.Menu);
                if (response?.resources) {
                    menus = response?.resources;
                    localStorage.menus = JSON.stringify({
                        data: menus,
                        lastUpdated: Date.now()
                    });
                }
            }
        } catch (e) {
            console.error(e);
        }
    }

    /**
     * Generate menu item html
     * @param {object} data
     * @returns
     */
    function generateMenu(data) {
        const currentPath = window.location.pathname;
        const isActive = AppUtils.normalizePath(currentPath) === data.url;
        if (isActive && data.treeIds) {
            SideBar.activeMenu = data.treeIds.split("_").filter(item => item !== data.id);
        }

        let html = "";
        if (data.child == null || data.child.length === 0) {
            const icon = data.icon && data.icon !== null ?
                `<span class="menu-icon">${data.icon}</span>` :
                data.parentId !== null && data.parentId !== 0 ?
                    `<span class="menu-bullet"><span class="bullet bullet-dot"></span></span>` : "";
            html = `<div class="menu-item" data-menu-id="${data.id}">
                        <a class="menu-link ${isActive ? "active" : ""}" href="${data.url}">
                            <span class="menu-icon">${icon}</span>
                            <span class="menu-title">${data.name}</span>
                        </a>
                    </div>`;
        }
        else {
            const childHtml = data.child.map(item => generateMenu(item)).join("");
            const icon = data.icon && data.icon !== null ?
                `<span class="menu-icon">${data.icon}</span>` :
                `<span class="menu-bullet"><span class="bullet bullet-dot"></span></span>`;
            html = `<div data-kt-menu-trigger="click" class="menu-item menu-accordion" data-menu-id="${data.id}">
                        <a class="menu-link ${isActive ? "active" : ""}" href="${data.url}">
                            ${icon}
                            <span class="menu-title">${data.name}</span>
                            <span class="menu-arrow"></span>
                        </a>
                        <div class="menu-sub menu-sub-accordion">
                            ${childHtml}
                        </div>
                    </div>`;
        }

        return html;
    }

    async function getPermissionData() {
        try {
            const permissions = JSON.parse(localStorage.getItem("permissions"));
            const twentyFourHours = 24 * 60 * 60 * 1000;

            if (!permissions?.lastUpdated || (Date.now() - parseInt(permissions.lastUpdated)) > twentyFourHours) {
                const response = await httpService.getAsync(ApiRoutes.User.v1.Permission);
                const data = response?.resources;
                localStorage.permissions = JSON.stringify({
                    data: data,
                    lastUpdated: Date.now()
                });
            }
        } catch (e) {
            console.error(e);
        }

    }
    // On document ready
    //KTUtil.onDOMContentLoaded(function () {
    //    SideBar.init();
    //});
    window.SideBarModule = SideBar;
})();