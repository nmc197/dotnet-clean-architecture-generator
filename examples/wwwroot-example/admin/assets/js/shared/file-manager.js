"use strict";

(function () {
    const FileManager = {
        options: {
            //acceptTypes: AppSettings.fileManagerSettings.ALLOW_EXTENSIONS.join(","),
            /*loadTypes: [],*/
            onChooseFile: null, // Optional callback
            category: "",
            isGetAll: false,
            directionId: null,
        },
        allowExtensions: [],
        formValidator: null,
        query: {
            keyword: "",
            pageIndex: 1,
            pageSize: 12,
            /*fileTypes: [],*/
            directionId: null,
            isGetAll: false
        },
        elements: {
            menu: $("#file_explorer_sidebar_menu"),
            fileExplorer: $("#kt_modal_file_manager .file_explorer_view_content"),
            pagination: $("#file_pagination"),
            inputUpload: $("#file_manager_input_upload_file")
        },
        fileSources: [],
        selectedFile: null,
        currentUploadFolderId: null,
        messages: {
            fileManager: I18n.t("common", "FILE_MANAGER"),
            folder: I18n.t("common", "FOLDER"),
            actions: I18n.t("common", "ACTIONS"),
            create: I18n.t("common", "ADD_NEW"),
            edit: I18n.t("common", "EDIT"),
            delete: I18n.t("common", "DELETE"),
            confirmTittle: I18n.t("common", "CONFIRM_TITLE"),
            successTitle: I18n.t("common", "SUCCESS_TITLE"),
            errorTitle: I18n.t("common", "ERROR_TITLE"),
            failTitle: I18n.t("common", "FAIL_TITLE"),
            warningTitle: I18n.t("common", "WARNING_TITLE"),
            createConfirm: I18n.t("common", "CREATE_CONFIRM", { name: I18n.t("common", "FOLDER").toLocaleLowerCase() }),
            createSuccess: I18n.t("common", "CREATE_SUCCESS", { name: I18n.t("common", "FOLDER").toLocaleLowerCase() }),
            createError: I18n.t("common", "CREATE_ERROR", { name: I18n.t("common", "FOLDER").toLocaleLowerCase() }),
            notFound: I18n.t("common", "NOT_FOUND", { name: I18n.t("common", "PAGE_TITLE").toLocaleLowerCase() }),
            validationError: I18n.t("common", "VALIDATION_ERROR"),
            uploadSucces: I18n.t("common", "UPLOAD_SUCCESS"),
            uploadError: I18n.t("common", "UPLOAD_ERROR"),
            uploadLimitTotal: I18n.t("common", "UPLOAD_LIMIT_TOTAL", { max: AppSettings.fileManagerSettings.MAXIMUM_TOTAL_FILES_UPLOAD }),
            uploadLimitImageSize: I18n.t("common", "UPLOAD_LIMIT_IMAGE_SIZE", { max: 50 }),
            uploadLimitTotalSize: I18n.t("common", "UPLOAD_LIMIT_TOTAL_SIZE", { max: 50 }),
            uploadInvalidFile: I18n.t("common", "UPLOAD_INVALID_FILE"),
        },
        init: function (customOptions = {}) {
            this.options = {
                ...this.options,
                ...customOptions
            };
            //this.query.fileTypes = this.options.loadTypes;
            //this.query.category = this.options.category;
            this.query.isGetAll = this.options.isGetAll;
            this.query.directionId = this.options.directionId;
            this.bindEvents();
            loadAllowedExtentions();
            loadFiles();
            /*getFolder();*/

            //if (this.options.acceptTypes) {
            //    this.elements.inputUpload.attr("accept", this.options.acceptTypes);
            //}

            this.formValidator = new FormValidator({
                formSelector: "#kt_modal_add_folder_form",
                handleSubmit: createFolder,
                rules: [
                    {
                        element: "#folder_name",
                        rule: [
                            {
                                name: "required",
                                message: I18n.t("common", "REQUIRED", { field: "Tên thư mục" })
                            },
                            {
                                name: "maxLength",
                                message: I18n.t("common", "TOO_LONG", { field: "Tên thư mục", max: 255 }),
                                params: 255
                            },
                            {
                                name: "customRegex",
                                message: I18n.t("common", "INVALID_FORMAT", { field: "Tên thư mục" }),
                                params: /^[a-zA-Z0-9_-]+(?: [a-zA-Z0-9_-]+)*$/,
                                allowNullOrEmpty: true
                            },
                        ]

                    },
                    //{
                    //    element: "#user_status_description",
                    //    rule: [
                    //        {
                    //            name: "maxLength",
                    //            message: I18n.t("common", "TOO_LONG", { field: "Mô tả", max: 500 }),
                    //            params: 500,
                    //            allowNullOrEmpty: true
                    //        }
                    //    ]

                    //}
                ]
            })
        },
        show: function () {
            $("#kt_modal_file_manager").modal("show");
        },
        hide: function () {
            $("#kt_modal_file_manager").modal("hide");
        },
        bindEvents: function () {
            this.bindClickFolderMenuEvent();
            this.bindAddFolderEvent();
            this.bindSearchEvent();
            this.bindRefreshEvent();
            this.bindUploadFileEvent();
            this.bindSelectFileEvent();
            this.bindChooseFileEvent();
            this.bindPaginationEvent();
        },
        bindClickFolderMenuEvent: function () {
            this.elements.menu.on("click", ".menu-link", function (e) {
                //$(".menu-link").removeClass("active");
                //$(this).addClass("active");
                /*const folderUploadId = Number($(this).parent().attr("data-folder-upload-id"));*/
                const folderUploadId = Number($(this).attr("data-folder-upload-id"));
                if (folderUploadId !== FileManager.currentUploadFolderId) {
                    FileManager.currentUploadFolderId = folderUploadId;
                    loadFiles();
                }
            })
        },
        bindAddFolderEvent: function () {
            $("#kt_modal_file_manager .btn_add_folder").on("click", function (e) {
                FileManager.formValidator.clearErrors();
                $('#modal_add_folder .folder_name').val("");
                $("#modal_add_folder").modal("show");
            })
        },
        bindSearchEvent: function () {
            $("#file_manager_search").on("keyup", AppUtils.debounce(function () {
                FileManager.query.keyword = $("#file_manager_search").val();
                loadFiles();
            }, 300))
        },
        bindRefreshEvent: function () {
            $("#btn_refresh_search").on("click", function () {
                $("#file_manager_search").val("").trigger("change");
                FileManager.query.keyword = "";
                FileManager.query.pageIndex = 1;
                loadFiles();
            })
        },
        bindUploadFileEvent: function () {
            $("#btn_upload_file").on("click", function (e) {
                FileManager.elements.inputUpload.trigger("click");
            })

            FileManager.elements.inputUpload.on("change", function (e) {
                const files = e.target.files;
                const value = e.target.value;
                if (files?.length > 0 && value)
                    uploadFile(files);

            })
        },
        bindSelectFileEvent: function () {
            this.elements.fileExplorer.on("click", ".file_gallery_item", function () {
                $(".file_gallery_item").removeClass("active");
                $(this).addClass("active");
                const fileUploadId = Number($(this).attr("data-file-upload-id"));
                FileManager.selectedFile = FileManager.fileSources.find(file => file.id === fileUploadId);
                $("#btnChooseFile").removeAttr("disabled");
            })

            this.elements.fileExplorer.on("click", function (e) {
                if (!e.target.closest(".file_gallery_item")) {
                    FileManager.selectedFile = null;
                    $(".file_gallery_item").removeClass("active");
                    $("#btnChooseFile").attr("disabled", true);
                }
            });
        },
        bindChooseFileEvent: function () {
            $("#btnChooseFile").on("click", function () {
                const selectedFile = FileManager.selectedFile;

                //dispatch event 
                const event = new CustomEvent("fileManager:onChooseFile", {
                    detail: {
                        file: selectedFile
                    }
                });
                window.dispatchEvent(event);

                //call callback function
                if (typeof FileManager.options.onChooseFile === "function") {
                    FileManager.options.onChooseFile(selectedFile);
                }

                FileManager.hide();
                FileManager.selectedFile = null;
                $(".file_gallery_item").removeClass("active");
                $("#btnChooseFile").attr("disabled", true);
            });
        },
        bindPaginationEvent: function () {
            this.elements.pagination.on("click", ".paging-number", function (e) {
                $(".paging-number").removeClass("active");
                $(this).addClass("active");
                FileManager.query.pageIndex = Number($(this).attr("paging-data"));
                loadFiles();
            })
        },
        //setAcceptTypes: function (acceptTypes) {
        //    this.options.acceptTypes = acceptTypes ?? AppSettings.fileManagerSettings.ALLOW_EXTENSIONS.join(",");
        //},
        //setLoadTypes: function (loadTypes) {
        //    this.options.acceptTypes = loadTypes ?? [];
        //},
        setDirectionId: function (directionId) {
            this.query.directionId = directionId ?? null;
            this.options.directionId = directionId ?? null;
        },
        setCategory: function (category) {
            this.options.category = category ?? ""
            loadAllowedExtentions();
            loadFiles();
        },
        refreshFileManager: function () {
            this.query = {
                ...this.query,
                keyword: "",
                pageIndex: 1,
            };
            loadFiles();
        }
    }

    async function loadAllowedExtentions() {
        try {
            const response = await httpService.getAsync(ApiRoutes.FileManager.v1.GetAllowedExtensionsByCategory(FileManager.options.category));
            const data = response?.resources || AppSettings.fileManagerSettings.ALLOW_EXTENSIONS;
            FileManager.allowExtensions = data;
            FileManager.elements.inputUpload.attr("accept", data.join(","));
        } catch (e) {
            FileManager.elements.inputUpload.attr("accept", AppSettings.fileManagerSettings.ALLOW_EXTENSIONS.join(","));
            FileManager.allowExtensions = AppSettings.fileManagerSettings.ALLOW_EXTENSIONS;
        }
    }

    /**
     * Load all folder
     */
    async function getFolder() {
        try {
            const repsonse = await httpService.getAsync(`${ApiRoutes.FileManager.v1.GetAllFolder}`);
            const data = repsonse?.resources;
            if (data?.length > 0) {
                if (!FileManager.currentUploadFolderId) {
                    FileManager.currentUploadFolderId = data[0].id;
                    //loadFiles();
                }
                const html = data.map(item => generateFolderMenuTreeItem(item));
                if (FileManager.elements.menu.jstree(true)) {
                    FileManager.elements.menu.jstree(true).destroy();
                }
                FileManager.elements.menu.html(`<ul>${html}</ul>`);
                FileManager.elements.menu.jstree({
                    "core": {
                        "themes": {
                            "responsive": false
                        }
                    },
                    "types": {
                        "default": {
                            "icon": "ki-outline ki-folder fs-4 text-warning"
                        },
                        "file": {
                            "icon": "ki-outline ki-file fs-4 text-warning"
                        }
                    },
                    "plugins": ["types"]
                });
            }

        } catch (e) {
            /*FileManager.elements.menu.html("");*/
        }
    }

    /**
     * Generate html for folder item
     * @param {object} data
     * @returns
     */
    function generateFolderMenuItem(data) {
        let html = "";
        const isActive = FileManager.currentUploadFolderId === data.id;
        if (data.childs == null || data.childs.length === 0) {
            html = `<div class="menu-item" data-folder-upload-id="${data.id}">
                        <a class="menu-link ${isActive ? "active" : ""}" href="#">
                            <span class="menu-icon">                                 
                               <i class="ki-duotone ki-folder text-warning fs-1">
                                <span class="path1"></span>
                                <span class="path2"></span>
                               </i>
                            </span>
                            <span class="menu-title">${data.folderName}</span>
                        </a>
                    </div>`;
        }
        else {
            const childHtml = data.childs.map(item => generateFolderMenuItem(item)).join("");
            html = `<div data-kt-menu-trigger="click" class="menu-item menu-accordion menu-sub-indention ${isActive ? "show hover" : ""}" data-folder-upload-id="${data.id}">
                        <a class="menu-link ${isActive ? "active" : ""}" href="#">
                            <span class="menu-icon">                                 
                               <i class="ki-duotone ki-folder text-warning fs-1">
                                <span class="path1"></span>
                                <span class="path2"></span>
                               </i>
                            </span>
                            <span class="menu-title">${data.folderName}</span>
                            <span class="menu-arrow"></span>
                        </a>
                        <div class="menu-sub menu-sub-accordion">
                            ${childHtml}
                        </div>
                    </div>`;
        }

        return html;

    }

    function generateFolderMenuTreeItem(data) {
        let html = "";
        const isActive = FileManager.currentUploadFolderId === data.id;
        if (data.childs == null || data.childs.length === 0) {
            html = `<li data-jstree='{ "type" : "folder","selected" : ${isActive}  }'>
                        <a href="#" data-folder-upload-id="${data.id}" class="menu-link w-100 ${isActive ? "jstree-clicked" : ""}">
                            ${data.folderName}
                        </a>
                    </li>`;
        }
        else {
            const childHtml = data.childs.map(item => generateFolderMenuTreeItem(item)).join("");
            html = `<li data-jstree='{"opened" : ${isActive} }'>
                        <a href="#" data-folder-upload-id="${data.id}" class="menu-link w-100 ${isActive ? "jstree-clicked" : ""}">
                            ${data.folderName}
                        </a>
                        <ul>
                            ${childHtml}
                        </ul>
                    </li>`;
        }

        return html;
    }

    /**
     * Load file upload for current folder
     */
    async function loadFiles() {
        try {
            $("#btnChooseFile").attr("disabled", true);
            FileManager.selectedFile = null;
            FileManager.elements.fileExplorer.append(AppSettings.loadingItem);
            const response = await httpService.postAsync(ApiRoutes.FileManager.v1.GetFilesByCategory(FileManager.options.category), FileManager.query);
            const data = response?.resources;
            FileManager.fileSources = data.dataSource ?? [];
            if (data.totalPages === 0) {
                FileManager.elements.fileExplorer.html(`<div class="d-flex flex-column flex-center h-100">'
                                                            <img src = "/admin/assets/media/illustrations/sketchy-1/5.png" class= "mw-400px" >
                                                            <div class="fs-1 fw-bolder text-dark mb-4" > Thư mục này trống!</div>
                                                            <div class="fs-6" >Vui lòng tải lên tệp tin! </div> 
                                                        </div>`);
            }
            else {
                const html = data.dataSource.map(item => generateFileItem(item)).join("");
                FileManager.elements.fileExplorer.html(`<div class="file_gallery" role="grid" tabindex="-1" style="--file-gallery-size: 140px;">${html}</div>`);
            }
            initPagination(data.totalPages);

        } catch (e) {
            console.error(e);
            FileManager.elements.fileExplorer.html("");
        }
        finally {
            refreshFsLightbox();
        }
    }

    /**
     * Generate html file item
     * @param {object} item
     * @returns
     */
    function generateFileItem(item) {
        const createdDate = moment(item.createdDate).format("DD/MM/YYYY HH:mm:ss");
        const thumbContent = generateThumbContent(item);
        const ext = item.fileName.split(".").pop().toUpperCase();
        const html = `<div class="file_gallery_item position-relative rounded border shadow-sm" data-file-upload-id="${item.id}" title="${item.fileName} Kích cỡ: ${AppUtils.byteConverter(item.fileSize)
            } Ngày tạo: ${createdDate} ">
							<div class="overlay overflow-hidden">
                                ${thumbContent}
							</div>
							<div class="fs-7 position-absolute start-0 top-0 px-2" style="background:var(--bs-modal-bg);">${ext}</div>
							<div class="item_title p-2 fs-8">
								${item.fileName}
                                <div class="text-muted">${AppUtils.byteConverter(item.fileSize)}</div>
								<span class="file_check ki-duotone ki-check ki-uniEABC position-absolute end-0 bottom-0 fs-3 me-2 mb-2">
								</span>
							</div>
						</div>`;

        return html;
    }

    /**
     * Generate file content 
     * @param {object} item
     * @returns
     */
    function generateThumbContent(item) {
        const ext = item.fileName.split('.').pop();
        let thumbContent = "";
        if (item.fileType.includes("image")) {
            thumbContent = `<img class="item_img" alt="${item.fileName}" src="${item.url}" />
							<a class="overlay-layer bg-dark bg-opacity-25 shadow align-items-center justify-content-center " data-fslightbox="file_gallery" href="${item.url}" data-type="image">
								<i class="bi bi-eye-fill text-white fs-2x"></i>
							</a>`;
        }
        else if (item.fileType.includes("video")) {
            thumbContent = `<div class="d-flex thumb-icon d-block overlay">
                                <span><i class="fa-solid fa-video text-primary"></i></span>
                                <a data-fslightbox="gallery-file" href="${item.url}" class="overlay-layer card-rounded bg-dark bg-opacity-25" data-type="video">
                                    <i class="bi bi-eye-fill text-white fs-2x"></i>
                                </a>
                            </div>`;
        }
        else if (item.fileType.includes("audio")) {
            thumbContent = `<div class="d-flex thumb-icon d-block overlay">
                                <span><i class="fa-solid fa-headphones text-primary"></i></span>
                                <a data-fslightbox="gallery-file" href="${item.url}" class="overlay-layer card-rounded bg-dark bg-opacity-25" data-type="audio">
                                    <i class="bi bi-eye-fill text-white fs-2x"></i>
                                </a>
                            </div>`;
        }
        else if (item.fileType.includes("text")) {
            thumbContent = `<div class="d-flex thumb-icon bg-primary bg-opacity-25">
                                <span><i class="fa-solid fa-file-lines text-primary" > </i></span>
                            </div>`;
        }
        else if (ext === "doc" || ext === "docx") {
            thumbContent = `<div class="d-flex thumb-icon bg-primary bg-opacity-25">
                                <span><i class="fa-solid fa-file-word text-primary" > </i></span>
                            </div>`;
        }
        else if (ext === "xls" || ext === "xlsx" || ext === "xlsm" || ext === "xlsb") {
            thumbContent = `<div class="d-flex thumb-icon bg-success  bg-opacity-25">
                                <span><i class="fa-solid fa-file-excel text-success" > </i></span>
                            </div>`;
        }
        else if (item.fileType.includes("pdf")) {
            thumbContent = `<div class="d-flex thumb-icon bg-danger  bg-opacity-25">
                                <span><i class="fa-solid fa-file-pdf text-danger" > </i></span>
                            </div>`;
        }
        else {
            thumbContent = `<div class="d-flex thumb-icon bg-primary bg-opacity-25">
                                <span><i class="fa-solid fa-file text-primary" > </i></span>
                            </div>`;
        }


        return thumbContent;
    }

    /**
     * Generate pagination
     * @param {number} totalPage
     */
    function initPagination(totalPage) {
        if (totalPage >= 0) {
            let html = "";
            let startPage;
            if (totalPage <= 3) {
                startPage = 1;
            }
            else {
                if (totalPage == FileManager.query.pageIndex) {
                    startPage = totalPage - 2;
                }
                else {
                    startPage = FileManager.query.pageIndex == 1 ? 1 : FileManager.query.pageIndex - 1;
                }

            }
            let endPage = startPage + 2 <= totalPage ? startPage + 2 : totalPage;
            if (FileManager.query.pageIndex > 1) {
                html += `<li class="page-item paging-number paging-first-item" paging-data="1">
                            <a class="page-link" href="#!" aria-label="First">
                                <i class="ki-duotone ki-double-left"><span class="path1"></span><span class="path2"></span></i>
                             </a>
                         </li>
                        <li class="page-item previous paging-number" paging-data="${FileManager.query.pageIndex - 1}">
                            <a class="page-link" href="#!" aria-label="Previous"><i class="ki-duotone ki-left"></i></a>
                        </li>`;
            }
            for (let i = startPage; i <= endPage; i++) {
                if (i > 0) {
                    html += `<li class="page-item paging-number ${i == FileManager.query.pageIndex ? 'active' : ''}" paging-data="${i}"> 
                                <a class="paging-index page-link" href="#!">${i}</a>
                             </li>`
                }
            }
            if (FileManager.query.pageIndex < totalPage) {
                html += `<li class="page-item paging-number paging-next" paging-data="${FileManager.query.pageIndex + 1}">
                            <a class="page-link" href="#!" aria-label="Next"><i class="ki-duotone ki-right"></i></a>
                          </li>
                          <li class="page-item paging-number paging-last-item" paging-data="${totalPage}">
                            <a class="page-link" href="#!" aria-label="Last">
                                <i class="ki-duotone ki-double-right"><span class="path1"></span><span class="path2"></span></i>
                            </a>
                          </li>`;
            }
            FileManager.elements.pagination.html(`<ul class="pagination pagination-outline">${html}</ul>`);
        }
        else {
            FileManager.elements.pagination.html("");
        }
    }

    /**
     * Handle create folder
     */
    async function createFolder() {
        const btnSave = $("#btn_create_folder");
        btnSave.attr("disabled", true);
        const { isConfirmed } = await Swal.fire({
            icon: 'question',
            title: FileManager.messages.confirmTittle,
            html: FileManager.messages.createConfirm,
            ...AppSettings.sweetAlertOptions(true)
        });

        if (isConfirmed) {
            btnSave.attr("data-kt-indicator", "on");
            try {
                const data = {
                    folderName: $('#modal_add_folder .folder_name').val(),
                    parentId: FileManager.currentUploadFolderId
                }

                const response = await httpService.postAsync(ApiRoutes.FileManager.v1.CreateFolder, data);
                if (response?.isSucceeded) {
                    getFolder();
                    $("#modal_add_folder").modal("hide");
                    const successText = FileManager.messages.createSuccess;
                    Swal.fire({
                        icon: "success",
                        title: FileManager.messages.successTitle,
                        html: successText,
                        ...AppSettings.sweetAlertOptions(false)
                    });
                }
            } catch (e) {
                const { responseJSON } = e;
                let errorText = "";
                let errorTitle = "";
                let icon = ""
                if (responseJSON?.status === AppSettings.httpStatusCode.UNPROCESSABLE_ENTITY) {
                    icon = "warning";
                    errorTitle = FileManager.messages.validationError;

                    const messages = [];
                    responseJSON?.errors?.forEach(error => {
                        error.message.forEach(item => {
                            messages.push(`<li class="text-start">${item}</li>`);
                        })
                    });
                    errorText = `<ul>${messages.join("")}</ul>`;
                }
                else {
                    icon = "error";
                    errorTitle = FileManager.messages.failTitle;
                    errorText = FileManager.messages.createError;
                }
                Swal.fire({
                    icon: icon,
                    title: errorTitle,
                    html: errorText,
                    ...AppSettings.sweetAlertOptions(false)
                });
            }
            finally {
                btnSave.removeAttr("data-kt-indicator");
            }
        }
        btnSave.removeAttr("disabled");
    }

    /**
     * Handle upload file
     * @param {File[]} files
     */
    async function uploadFile(files) {
        //check total file
        if (files.length > AppSettings.fileManagerSettings.MAXIMUM_TOTAL_FILES_UPLOAD) {
            Swal.fire({
                icon: "warning",
                title: FileManager.messages.warningTitle,
                html: FileManager.messages.uploadLimitTotal,
                ...AppSettings.sweetAlertOptions(false)
            })

            return;
        }

        let totalSize = 0;
        let fileInvalidExtension = [];
        let imageInvalid = [];
        files.forEach(file => {
            totalSize += file.size;
            const mimeType = file.type;
            if (!isValidFile(file)) {
                fileInvalidExtension.push(file);
            }

            if (mimeType.includes("image") && file.size > AppSettings.fileManagerSettings.MAXIMUM_IMAGE_SIZE) {
                imageInvalid.push(file);
            }
        });

        //check total size
        if (totalSize > AppSettings.fileManagerSettings.MAXIMUM_TOTAL_SIZE) {
            Swal.fire({
                icon: "warning",
                title: FileManager.messages.warningTitle,
                html: FileManager.messages.uploadLimitTotalSize,
                ...AppSettings.sweetAlertOptions(false)
            })

            return;
        }

        //check valid file
        if (fileInvalidExtension.length > 0) {
            Swal.fire({
                icon: "warning",
                title: FileManager.messages.warningTitle,
                html: FileManager.messages.uploadInvalidFile,
                ...AppSettings.sweetAlertOptions(false)
            })

            return;
        }

        //check image valid
        if (imageInvalid.length > 0) {
            Swal.fire({
                icon: "warning",
                title: FileManager.messages.warningTitle,
                html: FileManager.messages.uploadLimitImageSize,
                ...AppSettings.sweetAlertOptions(false)
            })

            return;
        }

        const formData = new FormData();
        formData.append("category", FileManager.options.category);
        if (FileManager.options.directionId) {
            formData.append("directionId", FileManager.options.directionId)
        }
        files.forEach(file => {
            formData.append("files", file)
        });
        const btnUpload = $("#btn_upload_file");
        try {
            btnUpload.attr("disabled", true);
            btnUpload.attr("data-kt-indicator", "on");
            /*$("#globaler_loading").addClass("show");*/
            const response = await httpService.postFormDataAsync(ApiRoutes.FileManager.v1.UploadByCategory, formData);
            if (response?.isSucceeded) {
                $("#btn_refresh_search").trigger("click");
                Swal.fire({
                    icon: "success",
                    title: FileManager.messages.successTitle,
                    html: FileManager.messages.uploadSucces,
                    ...AppSettings.sweetAlertOptions(false)
                })
                /*$("#file_manager_input_upload_file").val("");*/
                $("#file_manager_search").val("");
                FileManager.refreshFileManager();
            }

        } catch (e) {
            Swal.fire({
                icon: "error",
                title: FileManager.messages.failTitle,
                html: FileManager.messages.uploadError,
                ...AppSettings.sweetAlertOptions(false)
            })
        }
        finally {
            btnUpload.removeAttr("disabled");
            btnUpload.removeAttr("data-kt-indicator");
            $("#file_manager_input_upload_file").val("");
            /*$("#globaler_loading").removeClass("show");*/
        }
    }

    /**
     * Check file upload valid
     * @param {File} file
     * @returns 
     */
    function isValidFile(file) {
        /*const mime = file.type;*/
        const ext = "." + file.name.split(".").pop().toLowerCase();
        const allowedExts = FileManager.allowExtensions;
        return allowedExts && allowedExts.includes(ext);
    }

    window.FileManager = FileManager;

    // On document ready
    KTUtil.onDOMContentLoaded(function () {

    });

})();


