"use strict";

/**
 * @namespace AppUtils
 */
const AppUtils = {
    /**
    * Xử lý lỗi API và hiển thị thông báo
    * @param {any} error - Lỗi nhận được từ API
    * @param {{ action?: string, name?: string, isShowAlert?: boolean }} [options]
    * @returns {{ icon: string, title: string, html: string }}
    */
    handleApiError: function (error, { action, name, isShowAlert = true } = {}) {
        const { responseJSON } = error || {};
        const code = responseJSON?.status || error?.status || AppSettings.httpStatusCode.INTERNAL_SEVER_ERROR;

        let icon = "error";
        let title = I18n.t("common", "ERROR_TITLE");
        let html = I18n.t("common", "UNEXPECTED_ERROR");

        switch (code) {
            case AppSettings.httpStatusCode.BAD_REQUEST:
                html = I18n.t("common", "VALIDATION_ERROR");
                break;
            case AppSettings.httpStatusCode.FORBIDDEN:
                html = I18n.t("common", "FORBIDDEN");
                break;
            case AppSettings.httpStatusCode.NOT_FOUND:
                html = I18n.t("common", "NOT_FOUND", { name: name });
                break;
            case AppSettings.httpStatusCode.UNPROCESSABLE_ENTITY:
                icon = "warning";
                title = I18n.t("common", "WARNING_TITLE");
                if (Array.isArray(responseJSON?.errors)) {
                    let messages = [];
                    responseJSON.errors.forEach(error => {
                        if (Array.isArray(error.message)) {
                            error.message.forEach(item => {
                                messages.push(`<li class="text-start">${item}</li>`);
                            });
                        }
                    });
                    html = messages.length > 0 ? `<ul>${messages.join("")}</ul>` : I18n.t("common", "VALIDATION_ERROR");
                }
                else {
                    html = responseJSON?.message || I18n.t("common", "VALIDATION_ERROR");
                }

                break;
            case AppSettings.httpStatusCode.INTERNAL_SEVER_ERROR:
                html = I18n.t("common", "UNEXPECTED_ERROR");
                break;
            default:
                switch (action) {
                    case "create":
                        html = I18n.t("common", "CREATE_ERROR", { name: name.toLowerCase() });
                        break;
                    case "update":
                        html = I18n.t("common", "UPDATE_ERROR", { name: name.toLowerCase() });
                        break;
                    case "delete":
                        html = I18n.t("common", "DELETE_ERROR", { name: name.toLowerCase() });
                        break;
                    case "get":
                        html = I18n.t("common", "NOT_FOUND", { name: name.toLowerCase() });
                        break;
                    default:
                        html = I18n.t("common", "ACTION_FAILED");
                        break;
                }
                break;
        }

        if (isShowAlert) {
            Swal.fire({
                icon,
                title,
                html,
                ...AppSettings.sweetAlertOptions(false)
            });
        }

        return { icon, title, html };
    },

    /**
     * Thay thế biến trong chuỗi template
     * @param {string} template
     * @param {Object} values
     * @returns {string}
     */
    formatMessage: function (template, values = {}) {
        return Object.entries(values).reduce((msg, [key, value]) => {
            return msg.replaceAll(`{${key}}`, value);
        }, template);
    },

    /**
     * Kiểm tra email hợp lệ
     * @param {string} email
     * @returns {boolean}
     */
    isEmailValid: function (email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },

    /**
     * Khai báo select2 khi làm việc với remote data
     * @param {string} elementSelector
     * @param {{url:string, placeholder?:string, minimumInputLength?:number, allowClear?:boolean, delay?:number, cache?:boolean, select2Options:object }} options
     */
    createSelect2(elementSelector, options) {
        $(elementSelector).select2({
            ajax: {
                transport: createSecureTransport(options.url),
                delay: options.delay || 250,
                cache: options.cache !== false,
                data: function (params) {
                    if (!params.term || params.term.length < (options.minimumInputLength || 3)) {
                        return false;
                    }
                    return {
                        keyword: params.term || '', // Search term
                        pageIndex: params.page || 1,
                        pageSize: options.pageSize || 10,
                        ...options.extraParams // Bổ sung thêm param tùy chọn (như provinceId...)
                    };
                },
                processResults: function (data, params) {
                    params.page = params.page || 1;

                    const currentPage = data.resources?.currentPage || 1;
                    const totalPages = data.resources?.totalPages || 1;

                    return {
                        results: data.resources?.dataSource?.map(item => ({
                            id: item.id,
                            text: item.name
                        })) || [],
                        pagination: {
                            more: currentPage < totalPages
                        }
                    };
                }
            },
            placeholder: options.placeholder || 'Vui lòng chọn',
            minimumInputLength: options.minimumInputLength || 3,
            language: currentLang,
            allowClear: options.allowClear || false,
            ...options.select2Options // Cho phép thêm option tùy chỉnh Select2 khác
        });
    },

    /**
     * Khai báo select2 khi làm việc với remote data trả ra toàn bộ data
     * @param {string} elementSelector
     * @param {{url:string, placeholder?:string, minimumInputLength?:number, allowClear?:boolean, delay?:number, cache?:boolean, select2Options:object }} options
     */
    createSelect2Custom(elementSelector, options) {
        $(elementSelector).select2({
            ajax: {
                transport: createSecureTransport(options.url),
                delay: options.delay || 250,
                cache: options.cache !== false,
                data: function (params) {
                    if (!params.term || params.term.length < (options.minimumInputLength || 3)) {
                        return false;
                    }
                    return {
                        keyword: params.term || '',
                        pageIndex: params.page || 1,
                        pageSize: options.pageSize || 10,
                        ...options.extraParams
                    };
                },
                processResults: function (data, params) {
                    params.page = params.page || 1;

                    const currentPage = data.resources?.currentPage || 1;
                    const totalPages = data.resources?.totalPages || 1;

                    return {
                        results: (data.resources?.dataSource || []).map(item => ({
                            ...item // giữ toàn bộ dữ liệu để dùng cho custom hiển thị
                        })),
                        pagination: {
                            more: currentPage < totalPages
                        }
                    };
                }
            },
            placeholder: options.placeholder || 'Vui lòng chọn',
            minimumInputLength: options.minimumInputLength || 3,
            language: currentLang,
            allowClear: options.allowClear || false,
            escapeMarkup: m => m, // cho phép hiển thị HTML nếu có
            ...options.select2Options // cho phép truyền vào templateResult/templateSelection từ bên ngoài
        });
    },

    /**
     * Get cookie by name
     * @param {string} name
     * @returns
     */
    getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    },

    /**
     * Trì hoãn gọi hàm cho đến khi dừng gọi liên tục
     * @param {Function} func
     * @param {number} delay - Thời gian chờ (ms)
     * @returns
     */
    debounce(func, delay = 300) {
        let timer;
        return function (...args) {
            clearTimeout(timer);
            timer = setTimeout(() => func.apply(this, args), delay);
        };
    },

    customBagdeColor(color) {
        const percent = 90;
        let fontColor = "";
        let backColor = color;
        // strip the leading # if it's there
        color = color.replace(/^\s*#|\s*$/g, '');

        // convert 3 char codes --> 6, e.g. `E0F` --> `EE00FF`
        if (color.length == 3) {
            color = color.replace(/(.)/g, '$1$1');
        }

        const r = parseInt(color.substr(0, 2), 16),
            g = parseInt(color.substr(2, 2), 16),
            b = parseInt(color.substr(4, 2), 16);

        return '#' +
            ((0 | (1 << 8) + r + (256 - r) * percent / 100).toString(16)).substr(1) +
            ((0 | (1 << 8) + g + (256 - g) * percent / 100).toString(16)).substr(1) +
            ((0 | (1 << 8) + b + (256 - b) * percent / 100).toString(16)).substr(1);
    },
    /**
     * Convert byte ra các kiểu khác nhau
     * @param {number} bytes
     * @param {number} decimals
     * @param {string} only
     * @returns string
     */
    byteConverter(bytes, decimals, only) {
        const K_UNIT = 1024;
        const SIZES = ["Bytes", "KB", "MB", "GB", "TB", "PB"];
        if (bytes == 0) return "0 Byte";
        if (only === "MB") return (bytes / (K_UNIT * K_UNIT)).toFixed(decimals) + " MB";
        const i = Math.floor(Math.log(bytes) / Math.log(K_UNIT));
        const result = parseFloat((bytes / Math.pow(K_UNIT, i)).toFixed(decimals)) + " " + SIZES[i];
        return result;
    },

    /**
     * Tạo slug cho chuỗi
     * @param {string} str
     * @param {string} separator
     * @param {boolean} lowerCase
     * @returns
     */
    slugify(str, separator = "-", lowerCase = true) {
        if (!str)
            return "";
        const map = {
            'à': 'a', 'á': 'a', 'ạ': 'a', 'ả': 'a', 'ã': 'a',
            'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ậ': 'a', 'ẩ': 'a', 'ẫ': 'a',
            'ă': 'a', 'ằ': 'a', 'ắ': 'a', 'ặ': 'a', 'ẳ': 'a', 'ẵ': 'a',
            'è': 'e', 'é': 'e', 'ẹ': 'e', 'ẻ': 'e', 'ẽ': 'e',
            'ê': 'e', 'ề': 'e', 'ế': 'e', 'ệ': 'e', 'ể': 'e', 'ễ': 'e',
            'ì': 'i', 'í': 'i', 'ị': 'i', 'ỉ': 'i', 'ĩ': 'i',
            'ò': 'o', 'ó': 'o', 'ọ': 'o', 'ỏ': 'o', 'õ': 'o',
            'ô': 'o', 'ồ': 'o', 'ố': 'o', 'ộ': 'o', 'ổ': 'o', 'ỗ': 'o',
            'ơ': 'o', 'ờ': 'o', 'ớ': 'o', 'ợ': 'o', 'ở': 'o', 'ỡ': 'o',
            'ù': 'u', 'ú': 'u', 'ụ': 'u', 'ủ': 'u', 'ũ': 'u',
            'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ự': 'u', 'ử': 'u', 'ữ': 'u',
            'ỳ': 'y', 'ý': 'y', 'ỵ': 'y', 'ỷ': 'y', 'ỹ': 'y',
            'đ': 'd'
        };


        str = str
            .trim()
            .toLowerCase()
            .split('')
            .map(char => map[char] || char) // Thay thế ký tự có dấu
            .join('')
            .replace(/[^a-z0-9\s-]/g, '') // Loại bỏ ký tự đặc biệt, giữ số
            .replace(/\s+/g, separator) // Thay thế khoảng trắng bằng dấu gạch ngang
            .replace(/-+/g, separator); // Loại bỏ dấu gạch ngang thừa

        return lowerCase ? str.toLowerCase() : str.toUpperCase();
    },

    /**
     * Tạo phân trang
     * @param {string} target Id của phần tử muốn tạo phân trang
     * @param {number} totalPage Tổng số trang
     * @param {number} currentPage Trang hiện tại
     */
    pagination(target, totalPage, currentPage) {
        const targetElement = document.getElementById(target);
        if (targetElement) {
            let html = "";
            html += `<li class="page-item previous cursor-pointer ${currentPage === 1 || totalPage <= 1 ? "disabled" : ""}" ${currentPage === 1 || totalPage <= 1 ? "disabled" : ""} data-page-number="${currentPage - 1}">
                        <a class="page-link page-text" href="#">Trước</a>
                    </li>`;

            if (totalPage <= 7) {
                for (let i = 1; i <= totalPage; i++) {
                    html += `<li class="page-item ${i === currentPage ? "active" : ""}" data-page-number="${i}"><a href="#" class="page-link">${i}</a></li>`;
                }
            }
            else {
                if (currentPage <= 4) {
                    for (let i = 1; i <= 5; i++) {
                        html += `<li class="page-item ${i === currentPage ? "active" : ""}" data-page-number="${i}"><a href="#" class="page-link">${i}</a></li>`;
                    }
                    html += `<li class="page-item disabled"><a href="#" class="page-link">...</a></li>`;
                    html += `<li class="page-item" data-page-number="${totalPage}"><a href="#" class="page-link">${totalPage}</a></li>`;
                }
                else if (currentPage > totalPage - 4) {
                    html += `<li class="page-item" data-page-number="1"><a href="#" class="page-link">1</a></li>`;
                    html += `<li class="page-item disabled"><a href="#" class="page-link">...</a></li>`;
                    for (let i = totalPage - 4; i <= totalPage; i++) {
                        html += `<li class="page-item ${i === currentPage ? "active" : ""}" data-page-number="${i}"><a href="#" class="page-link">${i}</a></li>`;
                    }
                }
                else {
                    html += `<li class="page-item" data-page-number="1"><a href="#" class="page-link">1</a></li>`;
                    html += `<li class="page-item disabled"><a href="#" class="page-link">...</a></li>`;
                    for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                        html += `<li class="page-item ${i === currentPage ? "active" : ""}" data-page-number="${i}"><a href="#" class="page-link">${i}</a></li>`;
                    }
                    html += `<li class="page-item disabled"><a href="#" class="page-link">...</a></li>`;
                    html += `<li class="page-item" data-page-number="${totalPage}"><a href="#" class="page-link">${totalPage}</a></li>`;
                }
            }

            html += `<li class="page-item next cursor-pointer ${currentPage === totalPage || totalPage <= 1 ? "disabled" : ""}" ${currentPage === 1 || totalPage <= 1 ? "disabled" : ""} data-page-number="${currentPage + 1}">
                        <a class="page-link page-text" href="#">Sau</a>
                    </li>`;

            targetElement.innerHTML = html;
        }
    },
    /**
     * Format tât cả các input có data-type='currency'
     */
    formatNumberCurency() {
        $("input[data-type='currency']").each(function () {
            let value = $(this).val().replace(/\D/g, ''); // Xóa ký tự không phải số
            if (value) {
                $(this).val(AppUtils.numberWithCommas(value));
            } else {
                $(this).val('');
            }
        });
    },

    /**
     * Format số có dấu phẩy phân cách hàng nghìn
     * @param {number|string} number
     * @returns  {string}
     */
    numberWithCommas(number) {
        return Number(number).toLocaleString('vi-VN');
    },

    /**
     * Chuyển query string thành object
     * @param {string} query
     * @returns {Object}
     */
    parseQueryString(query) {
        const params = new URLSearchParams(query.startsWith('?') ? query : '?' + query);
        const result = {};
        for (const [key, value] of params.entries()) {
            result[key] = value;
        }
        return result;
    },

    /**
     * Chuyển object thành query string
     * @param {Object} params
     * @returns {string}
     */
    buildQueryString(params = {}) {
        return '?' + Object.entries(params)
            .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
            .join('&');
    },

    /**
     * Lấy giá trị của tham số URL
     * @param {string} key
     * @param {string} [url] - Mặc định là window.location.href
     * @returns {string|null}
     */
    getUrlParam(key, url = window.location.href) {
        const params = new URL(url).searchParams;
        return params.get(key);
    },
    /**
     * Lấy phần tử path theo chỉ số (0-based) từ pathname
     * @param {number} index - Vị trí cần lấy từ path, ví dụ: 2 -> "/product/detail/10001" => "10001"
     * @param {string} [url] - URL để lấy path (mặc định là window.location.pathname)
     * @returns {string|null}
     */
    getPathSegment(index, url = window.location.pathname) {
        const segments = url.split('/').filter(Boolean); // bỏ các phần trống
        return segments[index] || null;
    },

    /**
     * Thêm hoặc cập nhật query param trên URL (không reload)
     * @param {string} key
     * @param {string} value
     */
    setUrlParam(key, value) {
        const url = new URL(window.location.href);
        url.searchParams.set(key, value);
        window.history.replaceState({}, '', url.toString());
    },

    /**
     * Xoá tham số URL (không reload)
     * @param {string} key
     */
    removeUrlParam(key) {
        const url = new URL(window.location.href);
        url.searchParams.delete(key);
        window.history.replaceState({}, '', url.toString());
    },

    /**
     * Tải xuống tệp từ Blob
     * @param {Blob} blob
     * @param {string} filename
     */
    downloadFileFromBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    /**
     * Escape các ký tự HTML để chống XSS
     * @param {string} str
     * @returns {string}
     */
    escapeHtml(str) {
        if (!str)
            return "";

        return str.replace(/[&<>"']/g, function (match) {
            const escape = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;',
            };
            return escape[match];
        });
    },
    capitalizeWords(str) {
        // Chuyển toàn bộ tên về chữ thường để đảm bảo tính nhất quán
        str = str.toLowerCase();

        // Tách chuỗi thành mảng các từ dựa trên khoảng trắng
        let words = str.split(' ');

        // Duyệt qua từng từ và viết hoa chữ cái đầu tiên
        for (let i = 0; i < words.length; i++) {
            if (words[i].length > 0) { // Đảm bảo từ không rỗng
                words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1);
            }
        }

        // Nối lại các từ thành chuỗi hoàn chỉnh
        return words.join(' ');
    },

    /**
     * Lấy danh sách role
     * @returns
     */
    getRoles() {
        try {
            return JSON.parse(localStorage.getItem("userInfo"))?.roles || [];
        } catch {
            return [];
        }
    },

    /**
     * Lấy danh sách menu
     * @returns
     */
    getMenus() {
        try {
            return JSON.parse(localStorage.getItem("menus"))?.data || [];
        } catch {
            return [];
        }
    },

    /**
     * Lấy danh sách permission
     * @returns
     */
    getPermissions() {
        try {
            return JSON.parse(localStorage.getItem("permissions"))?.data || [];
        } catch {
            return [];
        }
    },

    /**
     * Chuẩn hóa path động thành path cố định chứa placeholder
     * @param {string} path
     * @returns string
     */
    normalizePath(path = window.location.pathname) {
        for (const route of AppSettings.dynamicRoutes) {
            if (route.pattern.test(path)) return route.normalized;
        }

        return path;
    },

    /**
     * Tìm menu theo path 
     * @param {{id:number, url:string, child:{id:number, url:string}[]}[]} menuList
     * @param {string} targetPath
     * @returns {{id:number, url:string}}}
     */
    findMenuByPath(menuList, targetPath) {
        for (const menu of menuList) {
            if (menu.url === targetPath) return menu;
            if (menu.child && menu.child.length) {
                const found = this.findMenuByPath(menu.child, targetPath);
                if (found) return found;
            }
        }
        return null;
    },

    /**
     * Tìm menu hiện tại theo path
     * @param {string} pathname
     * @param {{id:number, url:string, child:{id:number, url:string}[]}[]} menuList
     * @returns {{id:number, url:string}}}
     */
    getCurrentMenu(pathname, menuList) {
        const normalizedPath = this.normalizePath(pathname);
        return this.findMenuByPath(menuList, normalizedPath);
    },

    /**
     * Lấy danh sách permission theo path
     * @param {string} pathname
     * @returns {number[]}
     */
    listPermissions(pathname = window.location.pathname) {
        const menuList = this.getMenus();
        const permissions = this.getPermissions();
        const normalizedPath = this.normalizePath(pathname);
        const matchedMenu = this.findMenuByPath(menuList, normalizedPath);
        if (!matchedMenu) return [];

        const found = permissions.find(p => p.menuId === matchedMenu.id);
        return found ? found.actionIds : [];
    },

    /**
     * Trả về object chứa các quyền dạng boolean theo pathname
     * @param {string} pathname
     * @returns {{
     *  canView: boolean,
     *  canCreate: boolean,
     *  canUpdate: boolean,
     *  canDelete: boolean,
     *  canApprove: boolean,
     *  canExport: boolean
     * }}
     */
    getPermissionFlags(pathname = window.location.pathname) {
        const actionIds = this.listPermissions(pathname);
        const actions = AppSettings.actions;

        return {
            canView: actionIds.includes(actions.READ),
            canCreate: actionIds.includes(actions.CREATE),
            canUpdate: actionIds.includes(actions.UPDATE),
            canDelete: actionIds.includes(actions.DELETE),
            canApprove: actionIds.includes(actions.APPROVE),
            canExport: actionIds.includes(actions.EXPORT)
        };
    },

    /**
     * Kiểm tra có quyền cụ thể không
     * @param {string} pathname
     * @param {number} actionId
     * @returns {boolean}
     */
    hasPermission(pathname, actionId) {
        return this.listPermissions(pathname).includes(actionId);
    },

    /**
     * Kiểm tra có quyền xem hay không
     * @param {string} pathname
     * @returns {boolean}
     */
    canView(pathname = window.location.pathname) {
        return this.hasPermission(pathname, AppSettings.actions.READ);
    },

    /**
     * Kiểm tra có quyền thêm mới hay không
     * @param {string} pathname
     * @returns {boolean}
     */
    canCreate(pathname = window.location.pathname) {
        return this.hasPermission(pathname, AppSettings.actions.CREATE);
    },

    /**
     * Kiểm tra có quyền cập nhật hay không
     * @param {string} pathname
     * @returns {boolean}
     */
    canUpdate(pathname = window.location.pathname) {
        return this.hasPermission(pathname, AppSettings.actions.UPDATE);
    },

    /**
     * Kiểm tra có quyền xoá hay không
     * @param {string} pathname
     * @returns {boolean}
     */
    canDelete(pathname = window.location.pathname) {
        return this.hasPermission(pathname, AppSettings.actions.DELETE);
    },

    /**
     * Kiểm tra có quyền duyệt hay không
     * @param {string} pathname
     * @returns {boolean}
     */
    canApprove(pathname = window.location.pathname) {
        return this.hasPermission(pathname, AppSettings.actions.APPROVE);
    },

    /**
     * Kiểm tra có quyền xuất dữ liệu hay không
     * @param {string} pathname
     * @returns {boolean}
     */
    canExport(pathname = window.location.pathname) {
        return this.hasPermission(pathname, AppSettings.actions.EXPORT);
    }

};

function createSecureTransport(url) {
    return async function (params, success, failure) {
        async function sendRequest() {
            return await $.ajax({
                url: url,
                dataType: 'json',
                headers: {
                    'Authorization': 'Bearer ' + (TokenService.getAccessToken() || '')
                },
                data: params.data
            });
        }

        try {
            const response = await sendRequest();
            success(response);
        } catch (xhr) {
            if (xhr.status === 401) {
                try {
                    await TokenService.refreshToken();
                    const retryResponse = await sendRequest();
                    success(retryResponse);
                } catch (retryError) {
                    failure(retryError);
                }
            } else {
                failure(xhr);
            }
        }
    };
}
