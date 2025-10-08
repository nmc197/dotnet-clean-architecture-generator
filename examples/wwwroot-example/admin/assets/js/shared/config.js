"use strict";
const AppSettings = {
    apiBaseUrl: "https://localhost:7149",
    loadingItem: `<div  class="dt-processing card" role="status"><span class="svg-icon svg-icon-success svg-icon-2hx"><svg class="spin" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path opacity="0.3" d="M13.341 22H11.341C10.741 22 10.341 21.6 10.341 21V18C10.341 17.4 10.741 17 11.341 17H13.341C13.941 17 14.341 17.4 14.341 18V21C14.341 21.6 13.941 22 13.341 22ZM18.5409 10.7L21.141 9.19997C21.641 8.89997 21.7409 8.29997 21.5409 7.79997L20.5409 6.09997C20.2409 5.59997 19.641 5.49997 19.141 5.69997L16.5409 7.19997C16.0409 7.49997 15.941 8.09997 16.141 8.59997L17.141 10.3C17.441 10.8 18.0409 11 18.5409 10.7ZM8.14096 7.29997L5.54095 5.79997C5.04095 5.49997 4.44096 5.69997 4.14096 6.19997L3.14096 7.89997C2.84096 8.39997 3.04095 8.99997 3.54095 9.29997L6.14096 10.8C6.64096 11.1 7.24095 10.9 7.54095 10.4L8.54095 8.69997C8.74095 8.19997 8.64096 7.49997 8.14096 7.29997Z" fill="currentColor"></path>
                        <path d="M13.3409 7H11.3409C10.7409 7 10.3409 6.6 10.3409 6V3C10.3409 2.4 10.7409 2 11.3409 2H13.3409C13.9409 2 14.3409 2.4 14.3409 3V6C14.3409 6.6 13.9409 7 13.3409 7ZM5.54094 18.2L8.14095 16.7C8.64095 16.4 8.74094 15.8 8.54094 15.3L7.54094 13.6C7.24094 13.1 6.64095 13 6.14095 13.2L3.54094 14.7C3.04094 15 2.94095 15.6 3.14095 16.1L4.14095 17.8C4.44095 18.3 5.04094 18.5 5.54094 18.2ZM21.1409 14.8L18.5409 13.3C18.0409 13 17.4409 13.2 17.1409 13.7L16.1409 15.4C15.8409 15.9 16.0409 16.5 16.5409 16.8L19.1409 18.3C19.6409 18.6 20.2409 18.4 20.5409 17.9L21.5409 16.2C21.7409 15.7 21.6409 15 21.1409 14.8Z" fill="currentColor"></path>
                        </svg>
                    </span>   Đang tải...</div>`,
    dataTableLanguage: {
        "vi": {
            oAria: {
                sSortAscending: ": Sắp xếp thứ tự tăng dần",
                sSortDescending: ": Sắp xếp thứ tự giảm dần"
            },
            oPaginate: {
                sFirst: "Đầu tiên",
                sLast: "Cuối cùng",
                sNext: "Sau",
                sPrevious: "Trước"
            },
            sEmptyTable: "Không có dữ liệu",
            sInfo: "Hiển thị _START_ tới _END_ của _TOTAL_ dữ liệu",
            sThousands: ".",
            sInfoEmpty: "Hiển thị 0 tới 0 của 0 dữ liệu",
            sInfoFiltered: "(được lọc từ _MAX_ dữ liệu)",
            sInfoPostFix: "",
            sDecimal: ",",
            sLengthMenu: "_MENU_ ",
            sLoadingRecords: "Đang tải...",
            sProcessing: `<span class="svg-icon svg-icon-success svg-icon-2hx"><svg class="spin" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path opacity="0.3" d="M13.341 22H11.341C10.741 22 10.341 21.6 10.341 21V18C10.341 17.4 10.741 17 11.341 17H13.341C13.941 17 14.341 17.4 14.341 18V21C14.341 21.6 13.941 22 13.341 22ZM18.5409 10.7L21.141 9.19997C21.641 8.89997 21.7409 8.29997 21.5409 7.79997L20.5409 6.09997C20.2409 5.59997 19.641 5.49997 19.141 5.69997L16.5409 7.19997C16.0409 7.49997 15.941 8.09997 16.141 8.59997L17.141 10.3C17.441 10.8 18.0409 11 18.5409 10.7ZM8.14096 7.29997L5.54095 5.79997C5.04095 5.49997 4.44096 5.69997 4.14096 6.19997L3.14096 7.89997C2.84096 8.39997 3.04095 8.99997 3.54095 9.29997L6.14096 10.8C6.64096 11.1 7.24095 10.9 7.54095 10.4L8.54095 8.69997C8.74095 8.19997 8.64096 7.49997 8.14096 7.29997Z" fill="currentColor"/>
                        <path d="M13.3409 7H11.3409C10.7409 7 10.3409 6.6 10.3409 6V3C10.3409 2.4 10.7409 2 11.3409 2H13.3409C13.9409 2 14.3409 2.4 14.3409 3V6C14.3409 6.6 13.9409 7 13.3409 7ZM5.54094 18.2L8.14095 16.7C8.64095 16.4 8.74094 15.8 8.54094 15.3L7.54094 13.6C7.24094 13.1 6.64095 13 6.14095 13.2L3.54094 14.7C3.04094 15 2.94095 15.6 3.14095 16.1L4.14095 17.8C4.44095 18.3 5.04094 18.5 5.54094 18.2ZM21.1409 14.8L18.5409 13.3C18.0409 13 17.4409 13.2 17.1409 13.7L16.1409 15.4C15.8409 15.9 16.0409 16.5 16.5409 16.8L19.1409 18.3C19.6409 18.6 20.2409 18.4 20.5409 17.9L21.5409 16.2C21.7409 15.7 21.6409 15 21.1409 14.8Z" fill="currentColor"/>
                        </svg>
                    </span>   Đang tải...`,
            sSearch: "Tìm kiếm:",
            sSearchPlaceholder: "",
            sUrl: "",
            sZeroRecords: "Không tìm thấy kết quả"
        }
    },
    dateRangePickerLocale: {
        vi: {
            "format": "DD/MM/YYYY",
            "separator": " - ",
            "applyLabel": "Áp dụng",
            "cancelLabel": "Huỷ bỏ",
            "fromLabel": "Từ",
            "toLabel": "Đến",
            "customRangeLabel": "Tuỳ chỉnh",
            "weekLabel": "W",
            "daysOfWeek": [
                "CN",
                "T2",
                "T3",
                "T4",
                "T5",
                "T6",
                "T7"
            ],
            "monthNames": [
                "Tháng 1",
                "Tháng 2",
                "Tháng 3",
                "Tháng 4",
                "Tháng 5",
                "Tháng 6",
                "Tháng 7",
                "Tháng 8",
                "Tháng 9",
                "Tháng 10",
                "Tháng 11",
                "Tháng 12"
            ],
            "firstDay": 1
        },
    },
    sweetAlertOptions: (showCancelButton = false) => {
        return {
            showCancelButton: showCancelButton,
            cancelButtonText: I18n.t("common", "CANCEL"),
            confirmButtonText: I18n.t("common", "OK"),
            customClass: {
                confirmButton: "btn btn-primary",
                cancelButton: "btn btn-active-light"
            }
        }
    },
    httpStatusCode: {
        OK: 200,
        CREATED: 201,
        NO_CONTENT: 204,
        BAD_REQUEST: 400,
        UNAUTHORIZED: 401,
        FORBIDDEN: 403,
        NOT_FOUND: 404,
        UNPROCESSABLE_ENTITY: 422,
        INTERNAL_SEVER_ERROR: 500
    },
    actions: {
        CREATE: 1001,
        READ: 1002,
        UPDATE: 1003,
        DELETE: 1004,
        EXPORT: 1005,
        APPROVE: 1006
    },
    fileManagerSettings: {
        MAXIMUM_TOTAL_FILES_UPLOAD: 10,
        MAXIMUM_TOTAL_SIZE: 1024 * 1024 * 50,
        MAXIMUM_IMAGE_SIZE: 1024 * 1024 * 10,
        ALLOW_EXTENSIONS: [".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp", ".tiff", ".heic", ".heif", ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".xlsm", ".xlsb", ".ppt", ".pptx", ".txt", ".mp3", ".wav", ".ogg", ".mp4", ".webm", ".mov", ".avi"],
        ALLOWED_EXTENSIONS_BY_MIME_TYPE: {
            "image/jpeg": [".jpg", ".jpeg"],
            "image/png": [".png"],
            "image/webp": [".webp"],
            "image/gif": [".gif"],
            "image/bmp": [".bmp"],
            "image/tiff": [".tiff"],
            "image/heic": [".heic"],
            "image/heif": [".heif"],
            "application/pdf": [".pdf"],
            "application/msword": [".doc"],
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
            "application/vnd.ms-excel": [".xls"],
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
            "application/vnd.ms-excel.sheet.macroEnabled.12": [".xlsm"],
            "application/vnd.ms-excel.sheet.binary.macroEnabled.12": [".xlsb"],
            "application/vnd.ms-powerpoint": [".ppt"],
            "application/vnd.openxmlformats-officedocument.presentationml.presentation": [".pptx"],
            "text/plain": [".txt"],
            "audio/mpeg": [".mp3"],
            "audio/wav": [".wav"],
            "audio/ogg": [".ogg"],
            "video/mp4": [".mp4"],
            "video/webm": [".webm"],
            "video/quicktime": [".mov"],
            "video/x-msvideo": [".avi"]
        },
        ALLOWED_EXTENSIONS_BY_CATEGORY: {
            "BLOG_POST": [".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp", ".tiff", ".heic", ".heif"],
            "PROFILE": [".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp", ".tiff", ".heic", ".heif"],
            "BRACELET": [".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp", ".tiff", ".heic", ".heif"],
            "CHARM": [".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp", ".tiff", ".heic", ".heif"],
            "GENERAL": [".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp", ".tiff", ".heic", ".heif"],
        },
    },
    avatarDefault: "/admin/assets/media/svg/avatars/blank.svg",
    imageDefault: "/admin/assets/media/svg/files/blank-image.svg",
    ckEditorSettingsForA4Paper: {
        // Make the editing area bigger than default.
        height: 1000,
        width: 760,
        // Allow pasting any content.
        allowedContent: true,
        // Remove buttons irrelevant for pasting from external sources.
        removeButtons: 'Image,ExportPdf,Form,Checkbox,Radio,TextField,Select,Textarea,Button,ImageButton,HiddenField,NewPage,CreateDiv,Flash,Iframe,About,ShowBlocks,Maximize',
        extraAllowedContent: 'span[data-code]; span(template-variable)',
        // An array of stylesheets to style the WYSIWYG area.
        // Note: it is recommended to keep your own styles in a separate file in order to make future updates painless.
        contentsCss: [
            '.template-variable { background-color: #eef; padding: 2px 6px; border-radius: 4px; font-weight: bold; color: #003399; }',
            '/admin/assets/plugins/custom/ckeditor/pastefromword.css'
        ],
        // This is optional, but will let us define multiple different styles for multiple editors using the same CSS file.
        bodyClass: 'document-editor'
    },
    publicRoutes: ["sign-in", "sign-up", "forgot-password"],
    dynamicRoutes: [
        { pattern: /^\/blog-post\/detail\/\d+$/, normalized: "/blog/detail/0" },
        { pattern: /^\/document-type\/detail\/\d+$/, normalized: "/document-type/detail/0" },
        { pattern: /^\/notarization-request\/detail\/\d+$/, normalized: "/notarization-request/detail/0" },
    ],
    userStatusIds: {
        NOTACTIVED: 1001,
        ACTIVED: 1002
    },
    purposes: {
        FORGOT_PASSWORD: "FORGOT_PASSWORD"
    },
    tagTypes: {
        BLOG_POST: 1001,
        NOTIFICATION: 1002
    },
    mainElements: {
        NOT_FOUND: $("#not_found"),
        APP_MAIN: $("#kt_app_main"),
        GLOBAL_LOADER: $("#global_loader"),
        PAGE_CONTENT: $("#kt_app_page_content"),
    },
    roles: {
        ADMIN: 1001, // admin
        USER: 1002, //Thư ký nghiệp vụ
        MANAGER: 1003, //Công chứng viên
    },
    mainRoles: [
        1001, 1002, 1003
    ],

    fileCategoryUpload: {
        SUBMITTED_DOCUMENT: "SUBMITTED_DOCUMENT",
        NOTARIZATION_REQUEST_ATTACHMENT: "NOTARIZATION_REQUEST_ATTACHMENT",
        PROFILE: "PROFILE",
        IDENTITY_CARD: "IDENTITY_CARD",
        BLOCKING_INFORMATION: "BLOCKING_INFORMATION"
    },
    CertificateSampleFileId: 1328,
    apexChartOptions: {
        locales: {
            vi: {
                "name": "vi",
                "options": {
                    "months": [
                        "Tháng 01",
                        "Tháng 02",
                        "Tháng 03",
                        "Tháng 04",
                        "Tháng 05",
                        "Tháng 06",
                        "Tháng 07",
                        "Tháng 08",
                        "Tháng 09",
                        "Tháng 10",
                        "Tháng 11",
                        "Tháng 12"
                    ],
                    "shortMonths": [
                        "Th01",
                        "Th02",
                        "Th03",
                        "Th04",
                        "Th05",
                        "Th06",
                        "Th07",
                        "Th08",
                        "Th09",
                        "Th10",
                        "Th11",
                        "Th12"
                    ],
                    "days": [
                        "Chủ nhật",
                        "Thứ hai",
                        "Thứ ba",
                        "Thứ Tư",
                        "Thứ năm",
                        "Thứ sáu",
                        "Thứ bảy"
                    ],
                    "shortDays": [
                        "CN",
                        "T2",
                        "T3",
                        "T4",
                        "T5",
                        "T6",
                        "T7"
                    ],
                    "toolbar": {
                        "exportToSVG": "Tải xuống SVG",
                        "exportToPNG": "Tải xuống PNG",
                        "exportToCSV": "Tải xuống CSV",
                        "menu": "Tuỳ chọn",
                        "selection": "Vùng chọn",
                        "selectionZoom": "Vùng chọn phóng to",
                        "zoomIn": "Phóng to",
                        "zoomOut": "Thu nhỏ",
                        "pan": "Di chuyển",
                        "reset": "Đặt lại thu phóng"
                    }
                }
            }
        }
    },
    periodOptions: {
        LAST_7_DAYS: "LAST_7_DAY",
        TODAY: "TODAY",
        WEEK: "WEEK",
        MONTH: "MONTH",
        YEAR: "YEAR",
    },
};