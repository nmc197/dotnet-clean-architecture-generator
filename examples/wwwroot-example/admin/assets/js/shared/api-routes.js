"use strict";

const BaseApiUrl = AppSettings.apiBaseUrl;
const ApiRoutes = {
    Auth: {
        "v1": {
            Login: `${BaseApiUrl}/api/v1/auth/admin/login`,
            Logout: `${BaseApiUrl}/api/v1/auth/logout`,
            RefreshToken: `${BaseApiUrl}/api/v1/auth/refresh-token`,
            Me: `${BaseApiUrl}/api/v1/auth/me`,
            ForgotPassword: `${BaseApiUrl}/api/v1/auth/forgot-password`,
            VerifyCode: `${BaseApiUrl}/api/v1/auth/verify-code`,
            ResetPassword: `${BaseApiUrl}/api/v1/auth/reset-password`,
            Register: `${BaseApiUrl}/api/v1/auth/admin/register`,
            AdminCreateEndUser: `${BaseApiUrl}/api/v1/auth/admin/create-end-user`,
            GetCurrentUser: `${BaseApiUrl}/api/v1/auth/me/decentralization`
        }
    },
    Role: {
        "v1": {
            "Paged": `${BaseApiUrl}/api/v1/role/paged`,
            "PagedAdvanced": `${BaseApiUrl}/api/v1/role/paged-advanced`,
            "List": `${BaseApiUrl}/api/v1/role`,
            "Create": `${BaseApiUrl}/api/v1/role`,
            "Update": `${BaseApiUrl}/api/v1/role`,
            "Delete": (id) => `${BaseApiUrl}/api/v1/role/${id}`,
            "Detail": (id) => `${BaseApiUrl}/api/v1/role/${id}`,
            "Permissions": (id) => `${BaseApiUrl}/api/v1/role/${id}/permissons`,
            "ListByRegister": `${BaseApiUrl}/api/v1/role/available-for-register`

        }
    },
    User: {
        "v1": {
            "PagedAdvanced": `${BaseApiUrl}/api/v1/user/paged-advanced`,
            "List": `${BaseApiUrl}/api/v1/user`,
            "Search": `${BaseApiUrl}/api/v1/user/search`,
            "Create": `${BaseApiUrl}/api/v1/user`,
            "Update": `${BaseApiUrl}/api/v1/user`,
            "Delete": (id) => `${BaseApiUrl}/api/v1/user/${id}`,
            "Detail": (id) => `${BaseApiUrl}/api/v1/user/${id}`,
            "Menu": `${BaseApiUrl}/api/v1/user/menus`,
            "Permission": `${BaseApiUrl}/api/v1/user/permissions`,
            "Profile": `${BaseApiUrl}/api/v1/user/me`,
            "UpdateProfile": `${BaseApiUrl}/api/v1/user/me`,
            "ChangePassword": `${BaseApiUrl}/api/v1/user/me/change-password`,
            "AdminRegister": `${BaseApiUrl}/api/v1/user/admin/register`,
            "PagedClient": `${BaseApiUrl}/api/v1/user/paged-end-user`,
            "ReportCustomerInfo": `${BaseApiUrl}/api/v1/user/report-customer-info`,
        }
    },
    UserStatus: {
        "v1": {
            "PagedAdvanced": `${BaseApiUrl}/api/v1/user-status/paged-advanced`,
            "List": `${BaseApiUrl}/api/v1/user-status`,
            "Create": `${BaseApiUrl}/api/v1/user-status`,
            "Update": `${BaseApiUrl}/api/v1/user-status`,
            "Delete": (id) => `${BaseApiUrl}/api/v1/user-status/${id}`,
            "Detail": (id) => `${BaseApiUrl}/api/v1/user-status/${id}`
        }
    },
    Tag: {
        "v1": {
            "PagedAdvanced": `${BaseApiUrl}/api/v1/tag/paged-advanced`,
            "List": `${BaseApiUrl}/api/v1/tag`,
            "Search": `${BaseApiUrl}/api/v1/tag/search`,
            "Create": `${BaseApiUrl}/api/v1/tag`,
            "Update": `${BaseApiUrl}/api/v1/tag`,
            "Delete": (id) => `${BaseApiUrl}/api/v1/tag/${id}`,
            "Detail": (id) => `${BaseApiUrl}/api/v1/tag/${id}`
        }
    },
    TagType: {
        "v1": {
            "PagedAdvanced": `${BaseApiUrl}/api/v1/tag-type/paged-advanced`,
            "List": `${BaseApiUrl}/api/v1/tag-type`,
            "Create": `${BaseApiUrl}/api/v1/tag-type`,
            "Update": `${BaseApiUrl}/api/v1/tag-type`,
            "Delete": (id) => `${BaseApiUrl}/api/v1/tag-type/${id}`,
            "Detail": (id) => `${BaseApiUrl}/api/v1/tag-type/${id}`
        }
    },
    Menu: {
        v1: {
            "List": `${BaseApiUrl}/api/v1/menu`,
            "Create": `${BaseApiUrl}/api/v1/menu`,
            "Update": `${BaseApiUrl}/api/v1/menu`,
            "Detail": (id) => `${BaseApiUrl}/api/v1/menu/${id}`,
            "Paged": `${BaseApiUrl}/api/v1/menu/paged`,
            "Permissons": `${BaseApiUrl}/api/v1/menu/permissons`,
            "Delete": (id) => `${BaseApiUrl}/api/v1/menu/${id}`,
            "Types": `${BaseApiUrl}/api/v1/menu/types`,
        }
    },
    FileManager: {
        v1: {
            "Upload": `${BaseApiUrl}/api/v1/file-manager/upload`,
            "CreateFolder": `${BaseApiUrl}/api/v1/file-manager/folders`,
            "GetAllFolder": `${BaseApiUrl}/api/v1/file-manager/folders`,
            "GetSubFolder": `${BaseApiUrl}/api/v1/file-manager/folders/sub-folder`,
            "GetFiles": (folderId) => `${BaseApiUrl}/api/v1/file-manager/folders/${folderId}/paged`,
            "UploadByCategory": `${BaseApiUrl}/api/v1/file-manager/upload-by-category`,
            "GetFilesByCategory": (category) => `${BaseApiUrl}/api/v1/file-manager/${category}/paged`,
            "GetAllowedExtensionsByCategory": (category) => `${BaseApiUrl}/api/v1/file-manager/${category}/allowed-extentions`,
        }
    },
    Action: {
        v1: {
            "PagedAdvanced": `${BaseApiUrl}/api/v1/action/paged-advanced`,
            "List": `${BaseApiUrl}/api/v1/action`,
            "Create": `${BaseApiUrl}/api/v1/action`,
            "Update": `${BaseApiUrl}/api/v1/action`,
            "Delete": (id) => `${BaseApiUrl}/api/v1/action/${id}`,
            "Detail": (id) => `${BaseApiUrl}/api/v1/action/${id}`
        }
    },
    Province: {
        v1: {
            "PagedAdvanced": `${BaseApiUrl}/api/v1/province/paged-advanced`,
            "List": `${BaseApiUrl}/api/v1/province`,
            "Create": `${BaseApiUrl}/api/v1/province`,
            "Update": `${BaseApiUrl}/api/v1/province`,
            "Delete": (id) => `${BaseApiUrl}/api/v1/province/${id}`,
            "Detail": (id) => `${BaseApiUrl}/api/v1/province/${id}`,
            "ListDistrictByProvinceId": (id) => `${BaseApiUrl}/api/v1/province/${id}/districts`,
            "Wards": (id) => `${BaseApiUrl}/api/v1/province/${id}/wards`,
        }
    },
    District: {
        v1: {
            "PagedAdvanced": `${BaseApiUrl}/api/v1/district/paged-advanced`,
            "List": `${BaseApiUrl}/api/v1/district`,
            "Create": `${BaseApiUrl}/api/v1/district`,
            "Update": `${BaseApiUrl}/api/v1/district`,
            "Delete": (id) => `${BaseApiUrl}/api/v1/district/${id}`,
            "Detail": (id) => `${BaseApiUrl}/api/v1/district/${id}`,
            "ListWardByDistrictId": (id) => `${BaseApiUrl}/api/v1/district/${id}/wards`,
        }
    },
    Ward: {
        v1: {
            "PagedAdvanced": `${BaseApiUrl}/api/v1/ward/paged-advanced`,
            "Create": `${BaseApiUrl}/api/v1/ward`,
            "Update": `${BaseApiUrl}/api/v1/ward`,
            "Delete": (id) => `${BaseApiUrl}/api/v1/ward/${id}`,
            "Detail": (id) => `${BaseApiUrl}/api/v1/ward/${id}`,
        }
    },
    BlogPost: {
        "v1": {
            "PagedAdvanced": `${BaseApiUrl}/api/v1/blog-post/paged-advanced`,
            "List": `${BaseApiUrl}/api/v1/blog-post`,
            "Create": `${BaseApiUrl}/api/v1/blog-post`,
            "Update": `${BaseApiUrl}/api/v1/blog-post`,
            "Delete": (id) => `${BaseApiUrl}/api/v1/blog-post/${id}`,
            "Detail": (id) => `${BaseApiUrl}/api/v1/blog-post/${id}`
        }
    },
    BlogPostStatus: {
        "v1": {
            "PagedAdvanced": `${BaseApiUrl}/api/v1/blog-post-status/paged-advanced`,
            "List": `${BaseApiUrl}/api/v1/blog-post-status`,
            "Create": `${BaseApiUrl}/api/v1/blog-post-status`,
            "Update": `${BaseApiUrl}/api/v1/blog-post-status`,
            "Delete": (id) => `${BaseApiUrl}/api/v1/blog-post-status/${id}`,
            "Detail": (id) => `${BaseApiUrl}/api/v1/blog-post-status/${id}`
        }
    },
    BlogPostCategory: {
        "v1": {
            "PagedAdvanced": `${BaseApiUrl}/api/v1/blog-category/paged-advanced`,
            "List": `${BaseApiUrl}/api/v1/blog-category`,
            "Create": `${BaseApiUrl}/api/v1/blog-category`,
            "Search": `${BaseApiUrl}/api/v1/blog-category/search`,
            "Update": `${BaseApiUrl}/api/v1/blog-category`,
            "Delete": (id) => `${BaseApiUrl}/api/v1/blog-category/${id}`,
            "Detail": (id) => `${BaseApiUrl}/api/v1/blog-category/${id}`
        }
    },
    BlogPostLayout: {
        "v1": {
            "PagedAdvanced": `${BaseApiUrl}/api/v1/blog-layout/paged-advanced`,
            "List": `${BaseApiUrl}/api/v1/blog-layout`,
            "Search": `${BaseApiUrl}/api/v1/blog-layout/search`,
            "Create": `${BaseApiUrl}/api/v1/blog-layout`,
            "Update": `${BaseApiUrl}/api/v1/blog-layout`,
            "Delete": (id) => `${BaseApiUrl}/api/v1/blog-layout/${id}`,
            "Detail": (id) => `${BaseApiUrl}/api/v1/blog-layout/${id}`
        }
    },
    Notification: {
        v1: {
            "PagedAdvanced": `${BaseApiUrl}/api/v1/notification/paged-advanced`,
            "List": `${BaseApiUrl}/api/v1/notification`,
            "Create": `${BaseApiUrl}/api/v1/notification`,
            "Update": `${BaseApiUrl}/api/v1/notification`,
            "Delete": (id) => `${BaseApiUrl}/api/v1/notification/${id}`,
            "Detail": (id) => `${BaseApiUrl}/api/v1/notification/${id}`,
            "Me": `${BaseApiUrl}/api/v1/notification/me`,
            "MarkRead": (userNotificationId) => `${BaseApiUrl}/api/v1/notification/me/${userNotificationId}/mark-read`,
            "MarkUnread": (userNotificationId) => `${BaseApiUrl}/api/v1/notification/me/${userNotificationId}/mark-unread`,
            "DeleteUserNotification": (userNotificationId) => `${BaseApiUrl}/api/v1/notification/me/${userNotificationId}`,
        }
    },
    NotificationCategory: {
        v1: {
            "PagedAdvanced": `${BaseApiUrl}/api/v1/notification-category/paged-advanced`,
            "List": `${BaseApiUrl}/api/v1/notification-category`,
            "Create": `${BaseApiUrl}/api/v1/notification-category`,
            "Update": `${BaseApiUrl}/api/v1/notification-category`,
            "Delete": (id) => `${BaseApiUrl}/api/v1/notification-category/${id}`,
            "Detail": (id) => `${BaseApiUrl}/api/v1/notification-category/${id}`,
            "Search": `${BaseApiUrl}/api/v1/notification-category/search`,

        }
    },
    ActivityLog: {
        v1: {
            "PagedAdvancedByUserId": `${BaseApiUrl}/api/v1/activity-log/me`,
        }
    },
    AuditLog: {
        v1: {
            "PagedAdvancedByUserId": `${BaseApiUrl}/api/v1/audit-log/me`,
            "Detail": (id) => `${BaseApiUrl}/api/v1/audit-log/${id}`, 
        }
    },
    NotificationType: {
        "v1": {
            "PagedAdvanced": `${BaseApiUrl}/api/v1/notification-type/paged-advanced`,
            "List": `${BaseApiUrl}/api/v1/notification-type`,
            "Create": `${BaseApiUrl}/api/v1/notification-type`,
            "Update": `${BaseApiUrl}/api/v1/notification-type`,
            "Delete": (id) => `${BaseApiUrl}/api/v1/notification-type/${id}`,
            "Detail": (id) => `${BaseApiUrl}/api/v1/notification-type/${id}`
        }
    },
    SystemConfig: {
        v1: {
            "List": `${BaseApiUrl}/api/v1/system-config`,
            "UpdateList": `${BaseApiUrl}/api/v1/system-config/update-list`,
        }
    },
    Dashboard: {
        v1: {
            ReportRevenueByTime: (from, to) => `${BaseApiUrl}/api/v1/dashboard/report-revenue-by-time?from=${from}&to=${to}`,
            DashboardLongTermMonth: (period) => `${BaseApiUrl}/api/v1/dashboard/report-long-term-month?period=${period}`,
            DashboardTransactionNumber: (period) => `${BaseApiUrl}/api/v1/dashboard/report-transaction-number?period=${period}`,
            DashboardTotalRevenue: (period) => `${BaseApiUrl}/api/v1/dashboard/report-total-revenue?period=${period}`
        }
    },
    BraceletCategory: {
        "v1": {
            "PagedAdvanced": `${BaseApiUrl}/api/v1/bracelet-category/paged-advanced`,
            "List": `${BaseApiUrl}/api/v1/bracelet-category`,
            "Create": `${BaseApiUrl}/api/v1/bracelet-category`,
            "Update": `${BaseApiUrl}/api/v1/bracelet-category`,
            "Delete": (id) => `${BaseApiUrl}/api/v1/bracelet-category/${id}`,
            "Detail": (id) => `${BaseApiUrl}/api/v1/bracelet-category/${id}`,
            "Search": `${BaseApiUrl}/api/v1/bracelet-category/search`,
        }
    },
    BraceletType: {
        "v1": {
            "PagedAdvanced": `${BaseApiUrl}/api/v1/bracelet-type/paged-advanced`,
            "List": `${BaseApiUrl}/api/v1/bracelet-type`,
            "Create": `${BaseApiUrl}/api/v1/bracelet-type`,
            "Update": `${BaseApiUrl}/api/v1/bracelet-type`,
            "Delete": (id) => `${BaseApiUrl}/api/v1/bracelet-type/${id}`,
            "Detail": (id) => `${BaseApiUrl}/api/v1/bracelet-type/${id}`
        }
    },
    BraceletStatus: {
        "v1": {
            "PagedAdvanced": `${BaseApiUrl}/api/v1/bracelet-status/paged-advanced`,
            "List": `${BaseApiUrl}/api/v1/bracelet-status`,
            "Create": `${BaseApiUrl}/api/v1/bracelet-status`,
            "Update": `${BaseApiUrl}/api/v1/bracelet-status`,
            "Delete": (id) => `${BaseApiUrl}/api/v1/bracelet-status/${id}`,
            "Detail": (id) => `${BaseApiUrl}/api/v1/bracelet-status/${id}`
        }
    },
    CharmType: {
        "v1": {
            "PagedAdvanced": `${BaseApiUrl}/api/v1/charm-type/paged-advanced`,
            "List": `${BaseApiUrl}/api/v1/charm-type`,
            "Create": `${BaseApiUrl}/api/v1/charm-type`,
            "Update": `${BaseApiUrl}/api/v1/charm-type`,
            "Delete": (id) => `${BaseApiUrl}/api/v1/charm-type/${id}`,
            "Detail": (id) => `${BaseApiUrl}/api/v1/charm-type/${id}`
        }
    },
    CharmStatus: {
        "v1": {
            "PagedAdvanced": `${BaseApiUrl}/api/v1/charm-status/paged-advanced`,
            "List": `${BaseApiUrl}/api/v1/charm-status`,
            "Create": `${BaseApiUrl}/api/v1/charm-status`,
            "Update": `${BaseApiUrl}/api/v1/charm-status`,
            "Delete": (id) => `${BaseApiUrl}/api/v1/charm-status/${id}`,
            "Detail": (id) => `${BaseApiUrl}/api/v1/charm-status/${id}`
        }
    },
    CharmCategory: {
        "v1": {
            "PagedAdvanced": `${BaseApiUrl}/api/v1/charm-category/paged-advanced`,
            "List": `${BaseApiUrl}/api/v1/charm-category`,
            "Create": `${BaseApiUrl}/api/v1/charm-category`,
            "Update": `${BaseApiUrl}/api/v1/charm-category`,
            "Delete": (id) => `${BaseApiUrl}/api/v1/charm-category/${id}`,
            "Detail": (id) => `${BaseApiUrl}/api/v1/charm-category/${id}`
        }
    },
    Bracelet: {
        "v1": {
            "PagedAdvanced": `${BaseApiUrl}/api/v1/bracelet/paged-advanced`,
            "List": `${BaseApiUrl}/api/v1/bracelet`,
            "Create": `${BaseApiUrl}/api/v1/bracelet`,
            "Update": `${BaseApiUrl}/api/v1/bracelet`,
            "Delete": (id) => `${BaseApiUrl}/api/v1/bracelet/${id}`,
            "Detail": (id) => `${BaseApiUrl}/api/v1/bracelet/${id}`
        }
    },
    Charm: {
        "v1": {
            "PagedAdvanced": `${BaseApiUrl}/api/v1/charm/paged-advanced`,
            "List": `${BaseApiUrl}/api/v1/charm`,
            "Create": `${BaseApiUrl}/api/v1/charm`,
            "Update": `${BaseApiUrl}/api/v1/charm`,
            "Delete": (id) => `${BaseApiUrl}/api/v1/charm/${id}`,
            "Detail": (id) => `${BaseApiUrl}/api/v1/charm/${id}`
        }
    },
    OrderStatus: {
        "v1": {
            "PagedAdvanced": `${BaseApiUrl}/api/v1/order-status/paged-advanced`,
            "List": `${BaseApiUrl}/api/v1/order-status`,
            "Create": `${BaseApiUrl}/api/v1/order-status`,
            "Update": `${BaseApiUrl}/api/v1/order-status`,
            "Delete": (id) => `${BaseApiUrl}/api/v1/order-status/${id}`,
            "Detail": (id) => `${BaseApiUrl}/api/v1/order-status/${id}`
        }
    },
    Order: {
        "v1": {
            "PagedAdvanced": `${BaseApiUrl}/api/v1/order/paged-advanced`,
            "OrderItemPagedAdvanced": `${BaseApiUrl}/api/v1/order/items/paged-advanced`,
            "OrderItemCharm": (orderId, braceletId) => `${BaseApiUrl}/api/v1/order/${orderId}/bracelet/${braceletId}/items-charm`,
            "List": `${BaseApiUrl}/api/v1/order`,
            "Create": `${BaseApiUrl}/api/v1/order`,
            "Update": `${BaseApiUrl}/api/v1/order`,
            "Delete": (id) => `${BaseApiUrl}/api/v1/order/${id}`,
            "Detail": (id) => `${BaseApiUrl}/api/v1/order/${id}`
        }
    },
};