"use strict";

(function () {
    const menuMessage = {
        vi: {
            PAGE_TITLE: "Danh mục",
            NO_DATA: `<div class="d-flex flex-column flex-center">
                        <img src="/admin/assets/media/illustrations/sketchy-1/5.png" class="mw-400px">
                        <div class="fs-1 fw-bolder text-dark mb-4">Không có dữ liệu</div>
                        <div class="fs-6">Vui lòng tạo mới danh mục!</div>
                    </div>`
        }
    }
    I18n.load("menu", menuMessage);
})();