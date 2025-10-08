"use strict";
(function () {
    const Header = {
        elements: {
            userFullName: $(".header_user_full_name"),
            userRoles: $("#header_user_roles"),
            userEmail: $("#header_user_email"),
            userAvatar: $(".header_user_avatar")
        },
        messages: {
            confirmTitle: I18n.t("common", "CONFIRM_TITLE"),
            logoutConfirm: I18n.t("common", "LOGOUT_CONFIRM")
        },
        init: async function () {
            this.loadRelatedData();
            this.bindEvents();
        },
        bindEvents: function () {
            this.bildLogoutEvent();
            this.bindNotificationHoverEvent();
        },
        bildLogoutEvent: function () {
            $("#btn_logout").on("click", function (e) {
                logout();
            })
        },
        bindNotificationHoverEvent: function () {
            $("#kt_menu_item_wow").on("mouseover", function (e) {
                $("#kt_menu_notifications .tab-content").removeClass("d-none");
                const createdDateElements = $(".notification-created-date");
                if (createdDateElements) {
                    Array.from(createdDateElements).forEach(item => {
                        const createdDate = $(item).data("created-date");
                        $(item).text(moment(createdDate).fromNow());
                    })
                }
            })

            $("#kt_menu_item_wow").on("click", function (e) {
                $("#kt_menu_notifications .tab-content").removeClass("d-none");
                const createdDateElements = $(".notification-created-date");
                if (createdDateElements) {
                    Array.from(createdDateElements).forEach(item => {
                        const createdDate = $(item).data("created-date");
                        $(item).text(moment(createdDate).fromNow());
                    })
                }
            })
        },
        loadRelatedData: function () {
            getProfile();
            getNotification(true);
            getNotification(false);
        }
    }

    async function getNotification(isRead) {
        try {
            const query = {
                isRead: isRead
            }
            const response = await httpService.postAsync(ApiRoutes.Notification.v1.Me, query);
            const dataSource = response?.resources?.dataSource;

            let html = "";
            if (dataSource && dataSource.length > 0) {
                html = dataSource.map(item => {
                    const createdDate = item.createdDate.substring(0,item.createdDate.length - 6);
                    return `<div class="d-flex flex-stack py-4 gap-2">
                                    <!--begin::Section-->
                                    <div class="d-flex align-items-center">
                                        <!--begin::Symbol-->
                                        <div class="symbol symbol-35px me-4">
                                            <span class="symbol-label bg-light-primary">
                                                <i class="ki-duotone ki-notification-on fs-2 text-success">
                                                    <span class="path1"></span>
                                                    <span class="path2"></span>
                                                    <span class="path3"></span>
                                                    <span class="path4"></span>
                                                    <span class="path5"></span>
                                                </i>
                                            </span>
                                        </div>
                                        <!--end::Symbol-->
                                        <!--begin::Title-->
                                        <div class="mb-0 me-2">
                                            <a href="#" class="fs-6 text-gray-800 text-hover-primary fw-bold">${item.title}</a>
                                            <div class="text-gray-500 fs-7">${item.content}</div>
                                        </div>
                                        <!--end::Title-->
                                    </div>
                                    <!--end::Section-->
                                    <!--begin::Label-->
                                    <span class="badge badge-light fs-8 notification-created-date" data-created-date="${createdDate}">${moment(createdDate).fromNow()}</span>
                                    ${!isRead ? `<span class="badge badge-circle badge-primary min-w-10px w-10px h-10px text-start animation-blink"></span>` : ""}
                                    <!--end::Label-->
                                </div>`
                }).join("");
            }
            else {
                html = `Bạn chưa có thông báo ${isRead ? "đã đọc" : "chưa đọc"}.`;
            }
            if (isRead) {
                $("#list_notification_read").html(html);
            }
            else {
                $("#list_notification_unread").html(html);
            }
        } catch (e) {

        }
    }

    /**
     * Get user profile
     */
    async function getProfile() {
        try {
            const userInfo = JSON.parse(localStorage.getItem("userInfo"));
            const twentyFourHours = 24 * 60 * 60 * 1000;
            if (!userInfo?.lastUpdated || (Date.now() - parseInt(userInfo.lastUpdated)) > twentyFourHours) {
                const response = await httpService.getAsync(ApiRoutes.Auth.v1.Me);
                const data = response.resources;

                //update local storage
                localStorage.userInfo = JSON.stringify({
                    fullName: `${data.firstName ?? ''} ${data.lastName ?? ''}`,
                    roles: data.userRoles || [],
                    officeName: data.office?.name || '',
                    avatarUrl: data.avatar?.url,
                    lastUpdated: Date.now()
                });
                //update html
                Header.elements.userFullName.text(`${data?.firstName ?? ""} ${data?.lastName ?? ""}`);
                Header.elements.userEmail.text(`${data?.email ?? ""}`)
                Header.elements.userAvatar.attr("src", data?.avatar?.url ?? AppSettings.avatarDefault);
                const roles = data?.userRoles?.map(item => `<span class="badge badge-light-success fw-bold fs-8 px-2 py-1">${item.name}</span>`).join("");
                Header.elements.userRoles.html(roles);
            }
        } catch (e) {
            console.error(e);
        }
    }

    /**
     * Handle logout event
     */
    async function logout() {
        const { isConfirmed } = await Swal.fire({
            icon: "question",
            title: Header.messages.confirmTitle,
            html: Header.messages.logoutConfirm,
            ...AppSettings.sweetAlertOptions(true)
        });

        if (isConfirmed) {
            try {
                const data = {
                    refreshToken: localStorage.refreshToken
                }
                httpService.postAsync(ApiRoutes.Auth.v1.Logout, data);               
            } catch (e) {
                console.error(e)
            }
            finally {
                localStorage.clear();
                window.location.href = "/sign-in";
            }
        }

    }
    // On document ready
    //KTUtil.onDOMContentLoaded(function () {
    //    Header.init();
    //});
    window.HeaderModule = Header;
})();