"use strict";

(function () {
    const systemConfigMessage = {
        vi: {
            PAGE_TITLE: "Quản trị nội dung hệ thống",
            CONFIGURATION: "Cấu hình hệ thống",
            SYSTEM_CONFIG_SUCCESS: "Cấu hình hệ thống thành công!"  ,
            SYSTEM_CONFIG_ERROR: "Cấu hình hệ thống không thành công. Vui lòng thử lại.",
            NO_DATA: "Không có dữ liệu cấu hình hệ thống.",
            CONFIRM_UPDATE_SYSTEM_CONFIG: "Bạn có chắc chắn muốn cập nhật cấu hình hệ thống?",
            CONFIRM_RESET_SYSTEM_CONFIG: "Bạn có chắc chắn muốn đặt lại cấu hình hệ thống?",
            RESET_SUCCESS: "Đặt lại cấu hình hệ thống thành công!",
            INVALID_EMAIL: "Email không đúng định dạng."
        }
    }
    I18n.load("systemConfig", systemConfigMessage);
})();