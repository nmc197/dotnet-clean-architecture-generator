'use strict';

(function () {
    const passwordChangedMessage = {
        vi: {
            PAGE_TITLE: 'Đặt lại mật khẩu',
            FORGET_DES: 'Vui lòng kiểm tra hộp thư đến hoặc thư rác của email để tiếp tục đặt lại mật khẩu.',
            RESET_LINK_INVALID: "Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng thử lại.",
            PASSWORD_MISMATCH: "Mật khẩu xác nhận không khớp. Vui lòng kiểm tra lại.",
            PASSWORD_RESET_SUCCESS: "Mật khẩu của bạn đã được đặt lại thành công!",
            AGREEMENT_REQUIRED: "Vui lòng đồng ý với điều khoản sử dụng để tiếp tục.",
            REDIRECTING_TO_LOGIN: "Bạn sẽ được chuyển đến trang đăng nhập trong giây lát...",
        },
    };
    I18n.load('password_changed', passwordChangedMessage);
})();
