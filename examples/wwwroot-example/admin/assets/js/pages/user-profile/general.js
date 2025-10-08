"use strict";

(function () {
    let tabs, tabContents;
    const userUpdateProfilePage = {
        blockUI: null,
        table: null,
        target: null,
        formValidator: null,
        passwordFormValidator: null,
        plugins: {
            dateRangePickerFilter: null,
            dateRangePicker: null
        },
        notificationQuery: {
            pageIndex: 1,
            pageSize: 10,
        },
        message: {
            pageTitle: I18n.t("profile", "PAGE_TITLE"),
            successTitle: I18n.t("common", "SUCCESS_TITLE"),
            errorTitle: I18n.t("common", "ERROR_TITLE"),
            failTitle: I18n.t("common", "FAIL_TITLE"),
            actions: I18n.t("common", "ACTIONS"),
            create: I18n.t("common", "ADD_NEW"),
            edit: I18n.t("common", "EDIT"),
            delete: I18n.t("common", "DELETE"),
            confirmTitle: I18n.t("common", "CONFIRM_TITLE"), // Sửa chính tả
            warningTitle: I18n.t("common", "WARNING_TITLE"),
            validationError: I18n.t("common", "VALIDATION_ERROR"),
            updateSuccess: I18n.t("profile", "PROFILE_SUCCESS"),
            updateConfirm: I18n.t("common", "UPDATE_CONFIRM", { name: I18n.t("profile", "PAGE_TITLE").toLocaleLowerCase() }),
            passwordTitle: I18n.t("profile", "PASSWORD_TITLE"),
            passwordSuccess: I18n.t("profile", "PASSWORD_SUCCESS"),
            insuranceTitle: I18n.t("profile", "INSURANCE_TITLE"),
            updatePasswordConfirm: I18n.t("common", "UPDATE_CONFIRM", { name: I18n.t("profile", "PASSWORD_TITLE").toLocaleLowerCase() }),
            createConfirm: I18n.t("common", "CREATE_CONFIRM", { name: I18n.t("profile", "INSURANCE_TITLE").toLocaleLowerCase() }),
            createSuccess: I18n.t("common", "CREATE_SUCCESS", { name: I18n.t("profile", "INSURANCE_TITLE").toLocaleLowerCase() }),
            createError: I18n.t("common", "CREATE_ERROR", { name: I18n.t("profile", "INSURANCE_TITLE").toLocaleLowerCase() }),
            updateInsuranceConfirm: I18n.t("common", "UPDATE_CONFIRM", { name: I18n.t("profile", "INSURANCE_TITLE").toLocaleLowerCase() }),
            updateInsuranceSuccess: I18n.t("common", "UPDATE_SUCCESS", { name: I18n.t("profile", "INSURANCE_TITLE").toLocaleLowerCase() }),
            updateError: I18n.t("common", "UPDATE_ERROR", { name: I18n.t("profile", "INSURANCE_TITLE").toLocaleLowerCase() }),
            deleteConfirm: I18n.t("common", "DELETE_CONFIRM", { name: I18n.t("profile", "INSURANCE_TITLE").toLocaleLowerCase() }),
            deleteSuccess: I18n.t("common", "DELETE_SUCCESS", { name: I18n.t("profile", "INSURANCE_TITLE").toLocaleLowerCase() }),
            deleteError: I18n.t("common", "DELETE_ERROR", { name: I18n.t("profile", "INSURANCE_TITLE").toLocaleLowerCase() }),
            notFound: I18n.t("common", "NOT_FOUND", { name: I18n.t("profile", "INSURANCE_TITLE").toLocaleLowerCase() }),
            read: I18n.t("profile", "READ"),
            unread: I18n.t("profile", "UNREAD"),
            notificationNoData: I18n.t("profile", "NOTIFICATION_NO_DATA"),
            markRead: I18n.t("profile", "MARK_READ"),
            markUnRead: I18n.t("profile", "MARK_UNREAD"),
        },
        init: function () {
            this.blockUI = new KTBlockUI(document.querySelector("#kt_app_content"));
            this.initPlugins();
            fetchAndPopulateUserProfile();
            loadNotificationData();
            this.initDataTable();
            this.bindEvents();
            tabs = document.querySelectorAll(".tab-link");
            tabContents = document.querySelectorAll('.tab-content');

            function setActiveTabFromURL() {
                const urlParams = new URLSearchParams(window.location.search);
                const tabFromURL = urlParams.get('tab');
                if (tabFromURL) {
                    const tabToActivate = document.querySelector(`.tab-link[data-tab="${tabFromURL}"]`);
                    if (tabToActivate) {
                        tabs.forEach(t => t.classList.remove('active'));
                        tabToActivate.classList.add('active');
                        tabContents.forEach(content => content.classList.add('d-none'));
                        const activeContent = document.getElementById(tabFromURL);
                        if (activeContent) {
                            activeContent.classList.remove('d-none');
                        }
                    }
                }
            }

            // Tab-switching logic
            tabs.forEach(tab => {
                tab.addEventListener('click', function (event) {
                    event.preventDefault();

                    // Get current active tab
                    const currentActiveTab = document.querySelector('.tab-link.active');
                    const currentTabId = currentActiveTab ? currentActiveTab.getAttribute('data-tab') : null;
                    const newTabId = this.getAttribute('data-tab');

                    // Only clear errors if switching to a different tab
                    if (currentTabId !== newTabId) {
                        if (userUpdateProfilePage.formValidator) {
                            userUpdateProfilePage.formValidator.clearErrors();
                        }
                        if (userUpdateProfilePage.passwordFormValidator) {
                            userUpdateProfilePage.passwordFormValidator.clearErrors();
                        }
                        const category = getCategoryByTab(newTabId);
                        FileManager.setCategory(category);
                    }

                    // Remove active class from all tabs
                    tabs.forEach(t => t.classList.remove('active'));
                    // Add active class to clicked tab
                    this.classList.add('active');
                    
                    // Hide all tab contents
                    tabContents.forEach(content => content.classList.add('d-none'));

                    // Show the corresponding tab content
                    const activeContent = document.getElementById(newTabId);
                    if (activeContent) {
                        activeContent.classList.remove('d-none');
                    }

                    // Update URL with the active tab
                    const newURL = `${window.location.pathname}?tab=${newTabId}`;
                    window.history.pushState({}, '', newURL);
                });
            });

            // Set active tab on page load
            window.addEventListener('load', setActiveTabFromURL);

            // Add event listeners for cascading dropdowns
            const provinceSelect = document.querySelector("#user_province");
            /*const districtSelect = document.querySelector("#user_district");*/
            if (provinceSelect) {
                $(provinceSelect).select2({ // Khởi tạo Select2 cho province
                    placeholder: "Chọn tỉnh/thành phố",
                    allowClear: true
                }).on('select2:select', function (e) {
                    const provinceId = e.target.value;
                    fetchAndPopulateWards(provinceId, null);
                });
            }
            //if (districtSelect) {
            //    $(districtSelect).select2({ // Khởi tạo Select2 cho district
            //        placeholder: "Chọn quận/huyện",
            //        allowClear: true
            //    }).on('select2:select', function (e) {
            //        const districtId = e.target.value;
            //        fetchAndPopulateWards(districtId, null);
            //    });
            //}

            const profileForm = document.querySelector('#update_profile_form');
            this.formValidator = new FormValidator({
                formSelector: "#update_profile_form",
                handleSubmit: updateProfile,
                rules: [
                    {
                        element: "#user_firstname",
                        rule: [
                            {
                                name: "required",
                                message: I18n.t("common", "REQUIRED", { field: "Họ và tên đệm" })
                            },
                        ]
                    },
                    {
                        element: "#user_lastname",
                        rule: [
                            {
                                name: "required",
                                message: I18n.t("common", "REQUIRED", { field: "Tên" })
                            },
                        ]
                    },
                    {
                        element: "#user_phone",
                        rule: [
                            {
                                name: "phone",
                                message: I18n.t("common", "INVALID_FORMAT", { field: "Số điện thoại" }),
                                allowNullOrEmpty: true

                            }
                        ]
                    },
                    {
                        element: "#user_identity",
                        rule: [
                            {
                                name: "digits",
                                message: I18n.t("common", "VALID_NUMBER", { field: "CCCD/CMND" }),
                                allowNullOrEmpty: true
                            },
                        ]
                    },
                    {
                        element: "#user_address_detail",
                        rule: [
                            {
                                name: "maxLength",
                                message: I18n.t("common", "TOO_LONG", { field: "Địa chỉ chi tiết", max: 255 }),
                                params: 255
                            }
                        ]
                    },
                ]
            });
            if (profileForm) {
                profileForm.addEventListener('submit', function (e) {
                    e.preventDefault();
                });
            }

            const passwordForm = document.querySelector('#password_change_form');
            this.passwordFormValidator = new FormValidator({
                formSelector: "#password_change_form",
                handleSubmit: changePassword,
                rules: [
                    {
                        element: "#user_current_password",
                        rule: [
                            {
                                name: "required",
                                message: I18n.t("common", "REQUIRED", { field: "Mật khẩu cũ" })
                            },
                        ]
                    },
                    {
                        element: "#user_new_password",
                        rule: [
                            {
                                name: "required",
                                message: I18n.t("common", "REQUIRED", { field: "Mật khẩu mới" })
                            },
                            {
                                name: "minLength",
                                message: I18n.t("common", "TOO_SHORT", { field: "Mật khẩu mới", min: 10 }),
                                params: 10
                            },
                            {
                                name: "customRegex",
                                message: I18n.t("profile", "NEW_PASSWORD_INVALID"),
                                params: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*(),.?\":{}|<>]).*$"
                            }
                        ]
                    },
                    {
                        element: "#user_confirm_password",
                        rule: [
                            {
                                name: "required",
                                message: I18n.t("common", "REQUIRED", { field: "Mật khẩu xác nhận" })
                            },
                        ]
                    },
                ]
            });
            if (passwordForm) {
                passwordForm.addEventListener('submit', function (e) {
                    e.preventDefault();
                    // Gọi handleSubmit khi submit
                });
            }

        },
        initPlugins: function () {
            this.plugins.dateRangePickerFilter = $("#filter_effective_date").flatpickr({
                dateFormat: "d/m/Y",
                mode: "range",
                conjunction: " - ",
                locale: "vn",
            });

            this.plugins.dateRangePicker = $("#notary_insurance_effectiveTime").flatpickr({
                dateFormat: "d/m/Y",
                mode: "range",
                conjunction: " - ",
                locale: "vn",
            });
            let category = getCategoryByTab();
            FileManager.setCategory(category);

            FileManager.init({
                category: category,
                onChooseFile: (file) => {
                    if (userUpdateProfilePage.target === "#user_avatar_detail") {
                        $("#user_profile_coverImagePath").css("background-image", `url('${file.url}')`);
                        $("#user_profile_coverImageId").val(file.id);
                    } else if (userUpdateProfilePage.target === "#notary_insurance_file_trigger") {
                        $("#notary_insurance_attachmentFileId").val(file.id); // Sửa tên ID
                        const fileName = file.fileName || file.url.split('/').pop();
                        const $displayInput = $("#notary_insurance_file_display");
                        $displayInput.val(fileName); // Hiển thị tên file;
                    }
                },

            });

            CKEDITOR.on('dialogDefinition', function (e) {
                const dialogName = e.data.name;
                const dialog = e.data.definition.dialog;
                dialog.on('show', function () {
                    setupCKUploadFile();
                });
            });
        },
        regenDataTable: function () {
        },
        refreshDataTable: function () {
           
        },
        bindEvents: function () {
            this.bindEditEvent();
            this.bindDeleteEvent();
            this.bindSearchAllEvents();
            this.bindFilterEvents();
            this.bindAddEvent();
            this.bindSaveEvent();
            this.bindClearFilterDateRangeEvent();
            this.bindChangeImageEvent();
            this.bindChangeFileEvent();
            this.bindRemoveAvatarEvent();
            this.bindClearDateRangeEvent();
            this.bindNotificationPageChangeEvent();
            this.bindMarkReadEvent();
            this.bindMarkUnreadEvent();
            this.bindDeleteUserNotificationEvent();
        },
        bindRemoveAvatarEvent: function () {
            const removeAvatarButton = document.querySelector('[data-kt-image-input-action="remove"]');
            if (removeAvatarButton) {
                removeAvatarButton.addEventListener('click', function () {
                    const avatarIdInput = document.getElementById('user_profile_coverImageId');
                    avatarIdInput.value = '';
                });
            }
        },
        bindChangeImageEvent: function () {
            $("#user_avatar_detail").on("click", function (e) {
                e.preventDefault();
                FileManager.show();
                userUpdateProfilePage.target = "#user_avatar_detail";
            });
        },
        bindChangeFileEvent: function () {
            $("#notary_insurance_file_trigger").on("click", function (e) {
                e.preventDefault();
                FileManager.show();
                userUpdateProfilePage.target = "#notary_insurance_file_trigger";
            });
        },
        bindEditEvent: function () {
        },
        bindDeleteEvent: function () {
        },
        bindSearchAllEvents: function () {
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
            $("#btn_add_notary_insurance").on("click", function () {
                addItem();
            })
        },
        bindSaveEvent: function () {
            //$("#btn_save_service_fee_category").on("click", function (e) {
            //    e.preventDefault();
            //    saveData();
            //})
        },
        bindClearFilterDateRangeEvent: function () {
            $("#clear_filter_effective_date i").on("click", function () {
                userUpdateProfilePage.plugins.dateRangePickerFilter.clear();
            })
            $("#clear_filter_effective_date").on("click", function () {
                userUpdateProfilePage.plugins.dateRangePickerFilter.clear();
            })
        },
        bindClearDateRangeEvent: function () {
            $("#notary_insurance_effectiveTime_clear i").on("click", function () {
                userUpdateProfilePage.plugins.dateRangePicker.clear();
            })
        },
        bindNotificationPageChangeEvent: function () {
            $("#notification_pagination").on("click", ".page-item", function () {
                const disabled = $(this).hasClass("disabled");
                const isActive = $(this).hasClass("active");
                if (!disabled && !isActive) {
                    $(this).addClass("active");
                    const page = Number($(this).data("page-number"));
                    userUpdateProfilePage.notificationQuery.pageIndex = page;
                    loadNotificationData();
                }
            })
        },
        bindMarkReadEvent: function () {
            $("#list_notification").on("click", ".btn-mark-read", function () {
                const id = Number($(this).data("user-notification-id"));
                if (id)
                    markReadNotification(id);
            })
        },
        bindMarkUnreadEvent: function () {
            $("#list_notification").on("click", ".btn-mark-unread", function () {
                const id = Number($(this).data("user-notification-id"));
                if (id)
                    markUnreadNotification(id);
            })
        },
        bindDeleteUserNotificationEvent: function () {
            $("#list_notification").on("click", ".btn-delete-user-notification", function () {
                const id = Number($(this).data("user-notification-id"));
                if (id)
                    deleteUserNotification(id);
            })
        },
        initDataTable: function () {
        },
    };

    function populateSelect2(selectElement, options, selectedId, placeholder) {
        if (!selectElement) return;
        selectElement.innerHTML = '';
        // Thêm option mặc định (placeholder)
        const defaultOption = new Option('', '', true, !selectedId);
        selectElement.appendChild(defaultOption);
        // Thêm các option từ dữ liệu
        options.forEach(item => {
            const option = new Option(item.name, item.id, false, item.id == selectedId);
            selectElement.appendChild(option);
        });
        // Khởi tạo Select2
        $(selectElement).select2({
            placeholder: placeholder,
            allowClear: true
        });
        // Cập nhật giá trị được chọn
        $(selectElement).val(selectedId || '').trigger('change');
    }

    const formInputs = {
        firstName: document.getElementById('user_firstname'),
        lastName: document.getElementById('user_lastname'),
        gender: document.querySelectorAll('input[name="user_gender"]'),
        phone: document.getElementById('user_phone'),
        avatarId: document.getElementById('user_profile_coverImageId'),
    };

    async function updateProfile() {
        const avatarUrl = document.getElementById('user_profile_coverImagePath').style.backgroundImage
            .replace(/url\(["']?/, '').replace(/["']?\)$/, '') || AppSettings.avatarDefault;
        const data = {
            firstName: formInputs.firstName.value,
            lastName: formInputs.lastName.value,
            gender: Array.from(formInputs.gender).find(radio => radio.checked)?.value || '',
            phoneNumber: formInputs.phone.value,
            avatarId: formInputs.avatarId ? formInputs.avatarId.value : null,
            avatarUrl: avatarUrl,
        };
        const form = document.querySelector("#update_profile_form");
        if (!form) {
            console.error("Form not found");
            return;
        }
        const confirmText = userUpdateProfilePage.message.updateConfirm; // Sửa tham chiếu sai
        const { isConfirmed } = await Swal.fire({
            icon: 'question',
            title: userUpdateProfilePage.message.confirmTitle, // Sửa chính tả
            html: confirmText,
            ...AppSettings.sweetAlertOptions(true)
        });

        if (isConfirmed) {
            try {
                const response = await httpService.putAsync(ApiRoutes.User.v1.UpdateProfile, data);
                if (response?.isSucceeded) {
                    let currentUserInfo = JSON.parse(localStorage.getItem('userInfo')) || {};
                    //currentUserInfo.firstName = data.firstName;
                    //currentUserInfo.lastName = data.lastName;
                    currentUserInfo.fullName = `${data.firstName} ${data.lastName}`;
                    currentUserInfo.avatarUrl = data.avatarId ? data.avatarUrl : AppSettings.avatarDefault;
                    currentUserInfo.lastUpdated = Date.now();
                    localStorage.setItem('userInfo', JSON.stringify(currentUserInfo));

                    const avatarImgs = document.querySelectorAll(".header_user_avatar");
                    const avatarMain = document.querySelector("#avatar_main");
                    const newAvatarUrl = data.avatarId ? data.avatarUrl : AppSettings.avatarDefault;
                    avatarImgs.forEach(avatarImg => {
                        avatarImg.src = newAvatarUrl;
                    });
                    avatarMain.src = newAvatarUrl;
                    $("#user_profile_coverImagePath").css("background-image", `url('${newAvatarUrl}')`);
                    $(".header_user_full_name").text(`${data.firstName} ${data.lastName}`);
                    Swal.fire({
                        icon: "success",
                        title: userUpdateProfilePage.message.successTitle,
                        html: userUpdateProfilePage.message.updateSuccess, // Sửa tham chiếu sai
                        ...AppSettings.sweetAlertOptions(false)
                    });
                }
            } catch (e) {
                AppUtils.handleApiError(e, {
                    action: "update",
                    name: userUpdateProfilePage.message.pageTitle,
                    isShowAlert: true
                });
            }
        }
    }
    function addItem() {
    }

    /**
     * Author: 
     * CreatedDate: 
     * Description: Edit notary insurance by id
     * @param {number} id
     */
    async function editItem(id) {
    }

    /**
     * Author:
     * CreatedDate:
     * Description: Delete service fee category by id
     * @param {number} id
     */
    async function deleteItem(id) {

    }

    /**
     * Save data (Create or Update)
     */
    async function saveData() {

    }

    /**
     * Search data table
     */
    function tableSearch() {
        const effectiveTimeValue = $("#filter_effective_date").val();
        userUpdateProfilePage.table.column(1).search($("#filter_notary_insurance").val().trim());
        userUpdateProfilePage.table.column(2).search($("#filter_provider").val().trim());
        userUpdateProfilePage.table.column(3).search(effectiveTimeValue ? effectiveTimeValue.trim() : "");
    }

    /**
     * Reset filter
     */
    function resetFilter() {
        $("#filter_notary_insurance").val("");
        $("#filter_provider").val("");
        userUpdateProfilePage.plugins.dateRangePickerFilter.clear();
        /*$("#filter_created_date").val("").trigger("change");*/
        tableSearch();
    }

    const formPasswordInputs = {
        OldPassword: document.getElementById('user_current_password'),
        NewPassword: document.getElementById('user_new_password'),
        ConfirmPassword: document.getElementById('user_confirm_password'),
    };

    async function changePassword() {
        const data = {
            oldPassword: formPasswordInputs.OldPassword.value,
            newPassword: formPasswordInputs.NewPassword.value,
            confirmNewPassword: formPasswordInputs.ConfirmPassword.value,
        };
        const btnSave = $("#change_password_btn");
        btnSave.attr("disabled", true);
        const form = document.querySelector("#password_change_form");
        if (!form) {
            console.error("Form not found");
            return;
        }
        const confirmText = userUpdateProfilePage.message.updatePasswordConfirm;
        const { isConfirmed } = await Swal.fire({
            icon: 'question',
            title: userUpdateProfilePage.message.confirmTitle, // Sửa chính tả
            html: confirmText,
            ...AppSettings.sweetAlertOptions(true)
        });

        if (isConfirmed) {
            try {
                const response = await httpService.putAsync(ApiRoutes.User.v1.ChangePassword, data);
                if (response?.isSucceeded) {
                    Swal.fire({
                        icon: "success",
                        title: userUpdateProfilePage.message.successTitle,
                        html: userUpdateProfilePage.message.passwordSuccess,
                        ...AppSettings.sweetAlertOptions(false)
                    }).then(result => {
                        const data = {
                            refreshToken: localStorage.refreshToken
                        }
                        httpService.postAsync(ApiRoutes.Auth.v1.Logout, data);
                        localStorage.clear();
                        window.location.href = "/sign-in";
                    });
                }
            } catch (e) {
                AppUtils.handleApiError(e, {
                    action: "update",
                    name: userUpdateProfilePage.message.passwordTitle,
                    isShowAlert: true
                });
            }
        }
        btnSave.removeAttr("disabled");
    }

    async function fetchAndPopulateDistricts(provinceId, selectedDistrictId) {
        const districtSelect = document.querySelector("#user_district");
        const wardSelect = document.querySelector("#user_ward");
        if (!districtSelect) return;

        districtSelect.innerHTML = '';
        if (wardSelect) wardSelect.innerHTML = '';
        $(districtSelect).select2({
            placeholder: "Chọn huyện, thị xã",
            allowClear: true
        }).trigger('change');
        if (wardSelect) {
            $(wardSelect).select2({
                placeholder: "Chọn xã, phường",
                allowClear: true
            }).trigger('change');
        }

        if (!provinceId) return;

        try {
            const districtResponse = await httpService.getAsync(ApiRoutes.Province.v1.ListDistrictByProvinceId(provinceId));
            if (districtResponse.isSucceeded && districtResponse.status === 200) {
                populateSelect2(districtSelect, districtResponse.resources, selectedDistrictId, "Chọn huyện, thị xã");
            }
        } catch (e) {
            console.error("Error fetching districts:", e);
        }
    }

    async function fetchAndPopulateWards(provinceId, selectedWardId) {
        const wardSelect = document.querySelector("#user_ward");
        if (!wardSelect) return;

        wardSelect.innerHTML = '';
        $(wardSelect).select2({
            placeholder: "Chọn xã/phường",
            allowClear: true,
            language: currentLang
        }).trigger('change');

        if (!provinceId) return;

        try {
            const wardResponse = await httpService.getAsync(ApiRoutes.Province.v1.Wards(provinceId));
            if (wardResponse.isSucceeded && wardResponse.status === 200) {
                populateSelect2(wardSelect, wardResponse.resources, selectedWardId, "Chọn xã/phường");
            }
        } catch (e) {
            console.error("Error fetching wards:", e);
        }
    }

    async function fetchAndPopulateUserProfile() {
        //const loader = document.querySelector("#global_loader");
        //if (loader) loader.classList.add("show");
        userUpdateProfilePage.blockUI.block();
        try {
            const response = await httpService.getAsync(ApiRoutes.User.v1.Profile);
            if (response.isSucceeded && response.status === 200) {
                const data = response.resources;
                const avatarUrl = data.avatar?.url || AppSettings.avatarDefault;
                //update local storage
                const currentInfo = JSON.parse(localStorage.userInfo) || {};
                localStorage.userInfo = JSON.stringify({
                    ...currentInfo,
                    fullName: `${data.firstName} ${data.lastName}`,
                    avatarUrl: avatarUrl,
                    email: data.email,
                    roles: data.userRoles,
                    lastUpdated: Date.now()
                })

                $("#user_username").text(`${data.firstName} ${data.lastName}`);
                $("#user_firstname").val(data.firstName || "");
                $("#user_lastname").val(data.lastName || "");
                $("#user_email").text(data.email || "");
                const $genderRadios = $('input[name="user_gender"]');
                if ($genderRadios.length) {
                    const genderValue = data.gender !== null ? data.gender.toString() : null;
                    $genderRadios.each(function () {
                        $(this).prop("checked", $(this).val() === genderValue);
                    });
                }
                $("#user_phone").val(data.phoneNumber || "");
                $("#user_identity").val(data.identityNumber || "");

                const $provinceSelect = $("#user_province");
                if ($provinceSelect.length) {
                    const provinceResponse = await httpService.getAsync(ApiRoutes.Province.v1.List);
                    if (provinceResponse.isSucceeded && provinceResponse.status === 200) {
                        populateSelect2($provinceSelect[0], provinceResponse.resources, data.province?.id, "Chọn tỉnh, thành phố");
                        /*await fetchAndPopulateDistricts(data.province?.id, data.district?.id);*/
                        await fetchAndPopulateWards(data.province?.id, data.ward?.id);
                    }
                }

                $("#user_address_detail").val(data.addresDetail || ""); // Sửa chính tả
                $("#user_status").html(
                    `<span style="background-color:${AppUtils.customBagdeColor(data.userStatus.description)}; color: ${data.userStatus.description}; padding: 5px 8px; border-radius: 8px; display: inline-block; font-weight: 600; width:120px; font-size:12px; text-align:center">${AppUtils.escapeHtml(data.userStatus.name)}</span>`
                );
                const roles = (data.userRoles || []).map(item => item.name).join(", ");
                $("#user_role").text(roles);

                $("#user_profile_coverImagePath").css("background-image", `url('${data.avatar?.url || AppSettings.avatarDefault}')`);
                const $avatarPathInput = $("#user_profile_coverImageId");
                /*$("#image-input-placeholder").css("background-image", `url('${data.avatar.url}')`);*/
                $avatarPathInput.val(data.avatar?.id || "");
                const avatarImgs = document.querySelectorAll(".header_user_avatar");
                const avatarMain = document.querySelector("#avatar_main");
                avatarImgs.forEach(avatarImg => {
                    avatarImg.src = avatarUrl;
                });
                avatarMain.src = avatarUrl;
            } else {
                Swal.fire({
                    icon: "error",
                    title: userUpdateProfilePage.message.errorTitle,
                    html: "Không thể tải dữ liệu hồ sơ người dùng.",
                    buttonsStyling: false,
                    confirmButtonText: "OK",
                    customClass: {
                        confirmButton: "btn btn-primary"
                    }
                });
            }
        } catch (e) {
            console.error("Error fetching user profile:", e);
            Swal.fire({
                icon: "error",
                title: userUpdateProfilePage.message.errorTitle,
                html: "Đã xảy ra lỗi khi tải dữ liệu hồ sơ người dùng.",
                buttonsStyling: false,
                confirmButtonText: "OK",
                customClass: {
                    confirmButton: "btn btn-primary"
                }
            });
        } finally {
            /*if (loader) loader.classList.remove("show");*/
            userUpdateProfilePage.blockUI.release();
        }
    }

    function setupCKUploadFile() {
        const buttonFileElement = $(".cke_dialog_image_url .cke_dialog_ui_hbox_last a");

        buttonFileElement.trigger('click')(function () {
            userUpdateProfilePage.target = ".cke_dialog_image_url";
            FileManager.show();
        });
    }

    async function loadNotificationData() {
        $("#list_notification").append(AppSettings.loadingItem);
        let html = "";
        try {
            const response = await httpService.postAsync(ApiRoutes.Notification.v1.Me, userUpdateProfilePage.notificationQuery);
            const data = response?.resources;

            if (data && data.total > 0) {
                html = data.dataSource
                    .map(item => {
                        const createdDate = item.createdDate.substring(0, item.createdDate.length - 6);
                        return `<div class="timeline-item">
                                    <!--begin::Timeline line-->
                                    <div class="timeline-line"></div>
                                    <!--end::Timeline line-->

                                    <!--begin::Timeline icon-->
                                    <div class="timeline-icon position-relative">
                                        <i class="ki-duotone ki-notification-on fs-2 text-success">
                                            <span class="path1"></span>
                                            <span class="path2"></span>
                                            <span class="path3"></span>
                                            <span class="path4"></span>
                                            <span class="path5"></span>
                                        </i>                                        
                                    </div>
                                    <!--end::Timeline icon-->

                                        <!--begin::Timeline content-->
                                    <div class="timeline-content mb-10 mt-n1">
                                        <!--begin::Timeline heading-->
                                        <div class="pe-3 mb-5">
                                            <!--begin::Title-->
                                            <div class="fs-5 fw-semibold mb-2">
                                                ${item.title}
                                            </div>
                                            <!--end::Title-->

                                            <!--begin::Description-->
                                            <div class="fs-6">
                                                <!--begin::Info-->
                                                <div class="me-2">${item.content}</div>
                                                <div class="text-muted me-2 fs-7 created-date" data-created-date="${createdDate}">${moment(createdDate).fromNow()}</div>
                                                <!--end::Info-->
                                              
                                            </div>
                                            <!--end::Description-->
                                        </div>
                                        <!--end::Timeline heading-->
                                    </div>
                                    <!--end::Timeline content--> 
                                    <div class="d-flex gap-1 align-items-center">
                                        ${item.isRead ? "" : `<span class="bullet bullet-dot bg-primary h-10px w-10px animation-blink unread-icon" data-user-notification-id="${item.id}">
                                        </span>`}
                                        <a href="#" class="ms-2 btn btn-sm btn-icon btn-light btn-active-light-primary menu-dropdown" data-kt-menu-trigger="click" data-kt-menu-placement="bottom-end" data-kt-menu-flip="top-end">
                                                    <i class="ki-duotone ki-dots-square fs-5 m-0">
                                                        <span class="path1"></span>
                                                        <span class="path2"></span>
                                                        <span class="path3"></span>
                                                        <span class="path4"></span>
                                                    </i>
                                        </a>
                                        <div class="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg-light-primary fw-semibold fs-7 w-175px py-4" data-kt-menu="true">
                                            <div class="menu-item px-3">
                                                <a href="#" class="menu-link px-3 btn-mark-read ${item.isRead ? "d-none" : ""}" data-user-notification-id="${item.id}">
                                                    ${userUpdateProfilePage.message.markRead}
                                                </a>
                                            </div>
                                            <div class="menu-item px-3">
                                                <a href="#" class="menu-link px-3 btn-mark-unread ${!item.isRead ? "d-none" : ""}" data-user-notification-id="${item.id}">
                                                    ${userUpdateProfilePage.message.markUnRead}
                                                </a>
                                            </div>
                                            <div class="menu-item px-3">
                                                <a href="#" class="menu-link px-3 btn-delete-user-notification text-danger" data-user-notification-id="${item.id}">
                                                    ${userUpdateProfilePage.message.delete}
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>`;
                    })
                    .join("");
            }
            else {
                html = `<div class="text-center fs-5">${userUpdateProfilePage.message.notificationNoData}</div>`;
            }
            $("#notification_page_info").text(data.pageInfo);
            AppUtils.pagination("notification_pagination", data.totalPages, data.currentPage);
            /*generateNotficationPagination(data);*/

        } catch (e) {
            console.error(e);
            html = `<div class="text-center fs-5">${userUpdateProfilePage.message.notificationNoData}</div>`;
        }
        finally {
            $("#list_notification").html(html);
            KTMenu.createInstances();
        }

    }

    function generateNotficationPagination(data) {
        const totalPages = data.totalPages;
        let html = `<li class="page-item previous ${!data.hasPrevious ? "disabled" : ""}" data-notification-page="${data.currentPage - 1}"><a href="#" class="page-link"><i class="previous"></i></a></li>`;
        if (totalPages) {
            let startPage, endPage;
            if (totalPages <= 3 || data.currentPage < 3)
                startPage = 1;
            else if (totalPages == data.currentPage)
                startPage = totalPages - 2;
            else
                startPage = data.currentPage - 1;
            endPage = startPage + 2 <= totalPages ? startPage + 2 : totalPages;

            for (let i = startPage; i <= endPage; i++) {
                html += `<li class="page-item ${data.currentPage === i ? "active" : ""}" data-notification-page="${i}">
                                <a href="#" class="page-link">${i}</a>
                            </li>`;
            }

        }
        html += `<li class="page-item next ${!data.hasNext ? "disabled" : ""}" data-notification-page="${data.currentPage + 1}"><a href="#"  class="page-link"><i class="next"></i></a></li>`;

        $("#notification_page_info").text(data.pageInfo)
        $("#notification_pagination").html(html);
    }

    async function markReadNotification(id) {
        AppSettings.mainElements.GLOBAL_LOADER.addClass("show");
        try {
            const response = await httpService.putAsync(ApiRoutes.Notification.v1.MarkRead(id));
            loadNotificationData();
        } catch (e) {
            console.error(e);
        }
        finally {
            AppSettings.mainElements.GLOBAL_LOADER.removeClass("show");
        }
    }

    async function markUnreadNotification(id) {
        AppSettings.mainElements.GLOBAL_LOADER.addClass("show");
        try {
            const response = await httpService.putAsync(ApiRoutes.Notification.v1.MarkUnread(id));
            loadNotificationData();
        } catch (e) {
            console.error(e);
        }
        finally {
            AppSettings.mainElements.GLOBAL_LOADER.removeClass("show");
        }
    }

    async function deleteUserNotification(id) {
        AppSettings.mainElements.GLOBAL_LOADER.addClass("show");
        try {
            const response = await httpService.deleteAsync(ApiRoutes.Notification.v1.DeleteUserNotification(id));
            loadNotificationData();
        } catch (e) {
            console.error(e);
        }
        finally {
            AppSettings.mainElements.GLOBAL_LOADER.removeClass("show");
        }
    }

    function getCategoryByTab(tabName) {
        let category = "PROFILE";
        if (!tabName) {
            tabName = AppUtils.getUrlParam("tab") ?? "PROFILE";
        }

        if (tabName === "notary_insurance") {
            category = "INSURANCE";
        }
        return category;
    }

    KTUtil.onDOMContentLoaded(async function () {
        await AppEntry.init();
        userUpdateProfilePage.init();
    });
})();