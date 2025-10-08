const AppEntry = {
    async init() {
        try {
            await TokenService.refreshToken();
            window.HeaderModule?.init?.();
            window.SideBarModule?.init?.();
        } catch (e) {
            console.error("AppEntry init error", e);
/*            window.location.href = "/sign-in";*/
        }
    }
};