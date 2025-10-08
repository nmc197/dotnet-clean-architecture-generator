"use strict";
const TokenService = (function () {
    let refreshingPromise = null;

    function getAccessToken() {
        return localStorage.token;
    }

    function setUserInfo({ accessToken, refreshToken, userInfo }) {
        localStorage.token = accessToken;
        localStorage.refreshToken = refreshToken;
        //Login case
        if (userInfo) {
            localStorage.userInfo = JSON.stringify({
                fullName: userInfo.fullName,
                avatarUrl: userInfo.avatarUrl,
                email: userInfo.email,
                roles: userInfo.roles,
                officeName: userInfo.officeName,
                lastUpdated: Date.now()
            });

            localStorage.permissions = JSON.stringify({
                data: userInfo.permissions || [],
                lastUpdated: Date.now()
            });

            localStorage.menus = JSON.stringify({
                data: userInfo.menus || [],
                lastUpdated: Date.now()
            })
        }
    }

    function isTokenExpiringSoon() {
        const token = localStorage.token;
        if (!token) return true;

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const exp = payload.exp;
            const now = Math.floor(Date.now() / 1000);

            // Token sẽ hết hạn trong 5 phút tới
            return exp - now < 300;
        } catch {
            return true;
        }
    }

    function refreshToken() {

        if (!isTokenExpiringSoon()) {
            return Promise.resolve(localStorage.token);
        }

        if (refreshingPromise) {
            return refreshingPromise; // Return existing promise if refresh is already in progress
        }

        refreshingPromise = new Promise((resolve, reject) => {
            const data = {
                accessToken: localStorage.token,
                refreshToken: localStorage.refreshToken
            };
            $.ajax({
                url: ApiRoutes.Auth.v1.RefreshToken,
                type: "POST",
                contentType: "application/json",
                /*                xhrFields: { withCredentials: true },*/
                data: JSON.stringify(data),
                success: function (data) {
                    if (data && data.resources) {
                        setUserInfo(data.resources);
                        resolve(data.resources.accessToken);
                    } else {
                        reject("Invalid token");
                    }
                },
                error: function (jqXHR) {
                    if (jqXHR.status !== AppSettings.httpStatusCode.BAD_REQUEST) {
                        localStorage.removeItem("token");
                        localStorage.removeItem("refreshToken");
                        localStorage.removeItem("userInfo");
                        localStorage.removeItem("permissions");
                        localStorage.removeItem("menus");
                        Swal.fire({
                            icon: "warning",
                            title: I18n.t("common", "WARNING_TITLE"),
                            html: I18n.t("common", "SESSION_EXPIRED"),
                            ...AppSettings.sweetAlertOptions(false)
                        }).then(function () {
                            window.location.href = "/sign-in";
                        })
                        reject("Refresh failed");
                    }
                    else {
                        resolve(localStorage.token);
                    }                   
                },
                complete: function () {
                    refreshingPromise = null; // Reset after done
                }
            });
        });

        return refreshingPromise;
    }

    return {
        getAccessToken,
        setUserInfo,
        refreshToken
    };
})();
