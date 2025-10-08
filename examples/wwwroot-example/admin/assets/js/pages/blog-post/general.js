"use strict";

(function () {
    // Class definition
    const BlogPostPage = {
        table: null,
        formValidator: null,
        plugins: {
            dateRangePickerFilter: null
        },
        permissionFlags: AppUtils.getPermissionFlags(),
        message: {
            pageTitle: I18n.t("blog_post", "PAGE_TITLE"),
            actions: I18n.t("common", "ACTIONS"),
            create: I18n.t("common", "ADD_NEW"),
            edit: I18n.t("common", "EDIT"),
            delete: I18n.t("common", "DELETE"),
            detail: I18n.t("common", "DETAIL"),
            forbidden: I18n.t("common", "FORBIDDEN"),
            confirmTittle: I18n.t("common", "CONFIRM_TITLE"),
            successTitle: I18n.t("common", "SUCCESS_TITLE"),
            errorTitle: I18n.t("common", "ERROR_TITLE"),
            failTitle: I18n.t("common", "FAIL_TITLE"),
            warningTitle: I18n.t("common", "WARNING_TITLE"),
            createConfirm: I18n.t("common", "CREATE_CONFIRM", { name: I18n.t("blog_post", "PAGE_TITLE").toLocaleLowerCase() }),
            createSuccess: I18n.t("common", "CREATE_SUCCESS", { name: I18n.t("blog_post", "PAGE_TITLE").toLocaleLowerCase() }),
            createError: I18n.t("common", "CREATE_ERROR", { name: I18n.t("blog_post", "PAGE_TITLE").toLocaleLowerCase() }),
            updateConfirm: I18n.t("common", "UPDATE_CONFIRM", { name: I18n.t("blog_post", "PAGE_TITLE").toLocaleLowerCase() }),
            updateSuccess: I18n.t("common", "UPDATE_SUCCESS", { name: I18n.t("blog_post", "PAGE_TITLE") }),
            updateError: I18n.t("common", "UPDATE_ERROR", { name: I18n.t("blog_post", "PAGE_TITLE").toLocaleLowerCase() }),
            deleteConfirm: I18n.t("common", "DELETE_CONFIRM", { name: I18n.t("blog_post", "PAGE_TITLE").toLocaleLowerCase() }),
            deleteSuccess: I18n.t("common", "DELETE_SUCCESS", { name: I18n.t("blog_post", "PAGE_TITLE").toLocaleLowerCase() }),
            deleteError: I18n.t("common", "DELETE_ERROR", { name: I18n.t("blog_post", "PAGE_TITLE").toLocaleLowerCase() }),
            notFound: I18n.t("common", "NOT_FOUND", { name: I18n.t("blog_post", "PAGE_TITLE").toLocaleLowerCase() }),
            validationError: I18n.t("common", "VALIDATION_ERROR")
        },
        init: function () {
            this.checkPermissions();
            this.initPlugins();
            this.initDataTable();
            this.loadRelatedData();
            this.bindEvents();
            this.formValidator = new FormValidator({
                formSelector: "#kt_modal_blog_post_form",
                handleSubmit: saveData,
                rules: [
                ]
            });
        },
        initDataTable: function () {
            this.table = $("#blog_post_datatable").DataTable({
                processing: true,
                serverSide: true,
                paging: true,
                searching: { regex: true },
                order: [7, 'desc'],
                language: AppSettings.dataTableLanguage.vi,
                ajax: {
                    url: ApiRoutes.BlogPost.v1.PagedAdvanced,
                    type: "POST",
                    contentType: "application/json",
                    dataType: "json",
                    headers: {
                        'Authorization': 'Bearer ' + TokenService.getAccessToken()
                    },
                    error: async function (xhr, status, error) {
                        if (xhr.status === 401) {
                            // Token hết hạn
                            await TokenService.refreshToken();
                            //Cập nhật lại Authorization header trong cấu hình DataTable
                            const tableSettings = BlogPostPage.table.settings()[0];
                            tableSettings.ajax.headers.Authorization = "Bearer " + TokenService.getAccessToken();

                            //Reload lại datatable với token mới
                            BlogPostPage.table.ajax.reload();
                        }
                    },
                    dataSrc: {
                        data: 'resources.data',
                        draw: 'resources.draw',
                        recordsTotal: 'resources.recordsTotal',
                        recordsFiltered: 'resources.recordsFiltered'
                    },
                    data: function (d) {
                        d.blogPostStatusIds = $("#filter_blogPostStatusId").val();
                        d.blogPostCategoryIds = $("#filter_blogPostCategoryId").val();
                        d.blogPostLayoutIds = $("#filter_blogLayoutId").val();
                        d.authorIds = $("#filter_authorId").val();
                        return JSON.stringify(d);
                    }
                },
                columns: [
                    {
                        data: 'id',
                        render: function (data, type, row, meta) {
                            const info = BlogPostPage.table.page.info();
                            const index = meta.row + 1 + info.page * info.length;
                            return index; // This contains the row index
                        }
                    },
                    {
                        data: "title",
                        render: function (data, type, row, meta) {
                            return `<div class="d-flex flex-column gap-5 align-items-center" data-blog-post-id='${row.id}'>
                                        <!--begin::Thumbnail-->
                                        <a href="/blog-post/detail/${row.id}" class="symbol symbol-100px">
                                            <span class="symbol-label" style="background-image:url(${row.coverImageUrl || AppSettings.imageDefault});"></span>
                                        </a>
                                        <!--end::Thumbnail-->

                                        <div>
                                            <!--begin::Title-->
                                            <a href="/blog-post/detail/${row.id}" class="text-gray-800 text-hover-primary fs-5 fw-bold">${row.title}</a>
                                            <!--end::Title-->
                                        </div>
                                    </div>`;
                        },
                    },
                    {
                        data: "description",
                        render: function (data, type, row, meta) {
                            return `<span data-blog-post-id='${row.id}'>${row.description}<span>`;
                        },
                    },
                    {
                        data: "blogPostCategoryId",
                        render: function (data, type, row, meta) {
                            return `<span data-blog-post-id='${row.id}' style="background-color: ${AppUtils.customBagdeColor(row.blogPostCategoryColor)}; color: ${row.blogPostCategoryColor}; padding: 5px 8px; border-radius: 8px; display: inline-block; font-weight: 600;">${row.blogPostCategoryName}<span>`;
                        },
                    },
                    {
                        data: "authorId",
                        render: function (data, type, row, meta) {
                            return `<span class='text-gray-800 text-hover-primary mb-1' data-blog-post-id='${row.id}'>${row.authorName}<span>`;
                        },
                    },
                    {
                        data: "isApproved",
                        render: function (data, type, row, meta) {
                            return `<span data-blog-post-id='${row.id}'><div class="form-check form-switch form-check-custom form-check-solid justify-content-start"><input class="form-check-input" type="checkbox" value="" ${row.isApproved ? 'checked' : ''} disabled></div></span>`;
                        },
                    },
                    {
                        data: "blogPostStatusId",
                        render: function (data, type, row, meta) {
                            return `<span data-blog-post-id='${row.id}' style="background-color: ${AppUtils.customBagdeColor(row.blogPostStatusColor)}; color: ${row.blogPostStatusColor}; padding: 5px 8px; border-radius: 8px; display: inline-block; font-weight: 600;">${row.blogPostStatusName}<span>`;
                        },
                    },

                    {
                        data: "createdDate",
                        render: function (data, type, row, meta) {
                            const displayValue = moment(data).format("DD/MM/YYYY HH:mm:ss");
                            return `<span data-blog-post-id='${row.id}'>${displayValue}<span>`;
                        }
                    },
                    {
                        data: 'id',
                        className: 'text-end',
                        render: function (data, type, row, meta) {
                            return `<a href="#" class="btn btn-light btn-active-light-primary btn-flex btn-center btn-sm" data-kt-menu-trigger="click" data-kt-menu-placement="bottom-end" data-kt-menu-flip="top-end">
                                                ${BlogPostPage.message.actions}
                                                <i class="ki-duotone ki-down fs-5 ms-1"></i>
                                    </a>
                                    <div class="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg-light-primary fw-semibold fs-7 w-125px py-4" data-kt-menu="true">
                                        <div class="menu-item px-3">
                                            <a href="#" class="menu-link px-3 btn-edit" data-kt-docs-table-filter="edit_row" data-blog-post-id="${data}">
                                                ${BlogPostPage.permissionFlags.canUpdate ? BlogPostPage.message.edit : BlogPostPage.message.detail}
                                            </a>
                                        </div>
                                        <div class="menu-item px-3">
                                            <a href="#" class="menu-link px-3 text-danger btn-delete ${!BlogPostPage.permissionFlags.canDelete ? "d-none" : ""}" data-kt-users-table-filter="delete_row" data-blog-post-id="${data}">
                                                ${BlogPostPage.message.delete}
                                            </a>
                                        </div>
                                    </div>`
                        }
                    },

                ],
                columnDefs: [
                    { targets: "no-sort", orderable: false },
                    { targets: "no-search", searchable: false },
                    { orderable: false, targets: [-1, 0] },
                ],
                aLengthMenu: [
                    [10, 25, 50, 100],
                    [10, 25, 50, 100]
                ],
                drawCallback: function () {
                    $('#blog_post_datatable tfoot').html("");
                    $("#blog_post_datatable thead tr").clone(true).appendTo("#blog_post_datatable tfoot");
                    $('#blog_post_datatable tfoot tr').addClass("border-top");
                }
            })

            this.table.on("draw", function () {
                KTMenu.createInstances();
            })
        },
        initPlugins: function () {
            this.plugins.dateRangePickerFilter = $("#filter_created_date").flatpickr({
                dateFormat: "d/m/Y",
                mode: "range",
                conjunction: " - ",
                locale: "vn",
            });
            //BEGIN: SELECT2
            $("#filter_blogPostStatusId").select2({
                language: currentLang,
                placeholder: 'Chọn trạng thái',
                dropdownParent: "#blog_post_filter",
            });

            AppUtils.createSelect2("#filter_blogPostCategoryId", {
                url: ApiRoutes.BlogPostCategory.v1.Search,
                allowClear: true,
                cache: true,
                placeholder: 'Chọn danh mục',
                select2Options: {
                    dropdownParent: "#blog_post_filter",
                    closeOnSelect: false,
                }
            });
            AppUtils.createSelect2("#filter_authorId", {
                url: ApiRoutes.User.v1.Search,
                allowClear: true,
                cache: true,
                placeholder: 'Chọn tác giả',
                select2Options: {
                    dropdownParent: "#blog_post_filter",
                    closeOnSelect: false,
                }
            });
            //END: SELECT2


        },
        checkPermissions: function () {
            if (!BlogPostPage.permissionFlags.canCreate)
                $("#btn_add_blog_post").addClass("d-none");
        },
        regenDataTable: function () {
            if (this.table) {
                this.table.destroy();
                $("#blog_post_datatable tbody").html("");
                this.initDataTable();
            }
        },
        bindEvents: function () {
            this.bindEditEvent();
            this.bindDeleteEvent();
            this.bindSearchAllEvents();
            this.bindFilterEvents();
            this.bindAddEvent();
            this.bindSaveEvent();
            this.bindClearFilterDateRangeEvent();
            this.bindToggleFilterEvent();
        },
        bindEditEvent: function () {
            $("#blog_post_datatable tbody").on("click", ".btn-edit", function () {
                const id = $(this).attr("data-blog-post-id");
                editItem(id);
            });
        },
        bindDeleteEvent: function () {
            $("#blog_post_datatable tbody").on("click", ".btn-delete", function () {
                const id = $(this).attr("data-blog-post-id");
                deleteItem(id);
            });
        },
        bindSearchAllEvents: function () {
            $("#blog_post_datatable_search").on("keyup", AppUtils.debounce(function () {
                tableSearch();
            }, 300))
        },
        bindFilterEvents: function () {
            //reset filter event
            $("#btn_reset_filter").on("click", function () {
                resetFilter();
            })

            //apply filter event
            $("#btn_apply_filter").on("click", function () {
                tableSearch();
            })
        },
        bindAddEvent: function () {
            $("#btn_add_blog_post").on("click", function () {
                addItem();
            })
        },
        bindSaveEvent: function () {
            //$("#btn_save_blog_post").on("click", function (e) {
            //    e.preventDefault();
            //    saveData();
            //})
        },
        bindClearFilterDateRangeEvent: function () {
            $("#clear_filter_created_date i").on("click", function () {
                BlogPostPage.plugins.dateRangePickerFilter.clear();
            })
            $("#clear_filter_created_date").on("click", function () {
                BlogPostPage.plugins.dateRangePickerFilter.clear();
            })
        },
        loadRelatedData: async function () {
            await loadDataBlogPostStatus();
            //await loadDataBlogCategory();
            //await loadDataAuthor();
        },
        bindToggleFilterEvent: function () {
            $("#btn_blog_post_filter").on("click", function () {
                $("#blog_post_filter").slideToggle();
            })
        }
    }

    /**
     * Handle add new blog post 
     */
    function addItem() {
        window.open("/blog-post/detail/0");
    }

    /**
     * Author: 
     * CreatedDate: 
     * Description: Edit blog post  by id
     * @param {number} id
     */
    async function editItem(id) {
        window.open(`/blog-post/detail/${id}`);
    }

    /**
     * Author:
     * CreatedDate:
     * Description: Delete blog post  by id
     * @param {number} id
     */
    async function deleteItem(id) {
        if (!BlogPostPage.permissionFlags.canDelete) {
            Swal.fire({
                icon: "warning",
                title: BlogPostPage.message.warningTitle,
                html: BlogPostPage.message.forbidden,
                ...AppSettings.sweetAlertOptions(false)
            });
            return;
        }
        const { isConfirmed } = await Swal.fire({
            icon: "question",
            title: BlogPostPage.message.confirmTittle,
            html: BlogPostPage.message.deleteConfirm,
            ...AppSettings.sweetAlertOptions(true)
        });

        if (!isConfirmed)
            return;

        $("#global_loader").addClass("show");
        try {
            const response = await httpService.deleteAsync(ApiRoutes.BlogPost.v1.Delete(id));
            if (response?.isSucceeded) {
                tableSearch();
                Swal.fire({
                    icon: "success",
                    title: BlogPostPage.message.successTitle,
                    html: BlogPostPage.message.deleteSuccess,
                    ...AppSettings.sweetAlertOptions(false)
                })
            }
        } catch (e) {
            console.error(e);
            Swal.fire({
                icon: "error",
                title: BlogPostPage.message.failTitle,
                html: BlogPostPage.message.deleteError,
                ...AppSettings.sweetAlertOptions(false)
            })
        }
        finally {
            $("#global_loader").removeClass("show");
        }
    }

    /**
     * Save data (Create or Update) blog post 
     */
    async function saveData() {

    }

    /**
     * Search data table
     */
    function tableSearch() {
        BlogPostPage.table.column(1).search($("#filter_title").val().trim());
        BlogPostPage.table.column(2).search($("#filter_description").val().trim());
        BlogPostPage.table.column(7).search($("#filter_created_date").val());
        BlogPostPage.table.search($("#blog_post_datatable_search").val().trim()).draw();
    }

    /**
     * Reset filter
     */
    function resetFilter() {
        $("#filter_blogPostCategoryId").val("").trigger("change");
        $("#filter_authorId").val("").trigger("change");
        $("#filter_blogPostStatusId").val("").trigger("change");
        $("#filter_title").val("");
        $("filter_title").val("");
        BlogPostPage.plugins.dateRangePickerFilter.clear();
        tableSearch();
    }

    /**
    * Load data BlogPostStatus
    */
    async function loadDataBlogPostStatus() {
        try {
            const response = await httpService.getAsync(ApiRoutes.BlogPostStatus.v1.List);
            const data = response.resources;
            data.forEach(function (item) {
                $("#user_userStatusId").append(new Option(item.name, item.id, false, false));
                $("#filter_blogPostStatusId").append(new Option(item.name, item.id, false, false));
            });
        } catch (e) {
            console.error(e);
        }
    }

    // On document ready
    KTUtil.onDOMContentLoaded(async function () {
        await AppEntry.init();
        if (!BlogPostPage.permissionFlags.canView) {
            AppSettings.mainElements.PAGE_CONTENT.addClass("d-none");
            AppSettings.mainElements.NOT_FOUND.removeClass("d-none");
        }
        else
            BlogPostPage.init();
    });
})();