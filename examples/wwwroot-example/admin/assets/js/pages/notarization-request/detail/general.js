"use strict";
(function () {
    // Class definition
    const NotarizationRequestDetailPage = {
        permissionFlags: AppUtils.getPermissionFlags('/notarization-request/list'),
        variables: {
            id: AppUtils.getPathSegment(2), //id của bản ghi hồ sơ công chứng
            currentUserId: 0,
            statusId: 0, // trạng thái của hợp đồng công chứng
            documentTypeId: 0, //id loại hợp đồng
            requesterId: 0, //id khách hàng
            requestTypeId: 0,
            notaryPhoneNumber: "",
            currentUserRoles: [],
            requestCode: "",
            currentUserOfficeId: 0,
            notarizationRequestOfficeId: 0,
            staffId: 0, //id công chứng viên
            cachedUserData: [], // lưu vào khi filter khách để có thể find không cần gọi lại detail
            isLoadingDetail: false,  //khi loading detail với các hợp đồng đã tạo            
            isLoadingUserData: false, //khi loading dữ liệu user
            stepValidators: [],  //danh sách validator của các form  
            isCreatePaymentTransaction: false, //Biến xác định đã tạo transaction hay chưa
            stepSaveFunctions: {  //các function khi add/update các form
                1: saveDataStep1,
                2: saveDataStep2,
                3: saveDataStep3,
                4: saveDataStep4,
                5: saveDataStep5,
                6: saveDataStep6,
            },
            initStepFunctions: {
                1: initStep1,
                2: initStep2,
                3: initStep3,
                4: initStep4,
                5: initStep5,
                6: initStep6,
            },
            stepper: null,
            currentStep: 1,
            lastStepIndex: 6,
            roleValidator: { //phân quyền CẬP NHẬT cho step theo từng vai trò
                step1: [AppSettings.roles.NOTARY_STAFF, AppSettings.roles.SECRETARY, AppSettings.roles.OFFICE_MANAGEMENT], //nhân viên công chứng, thư ký nghiệp vụ, quản lý cấp vp
                step2: [AppSettings.roles.NOTARY_STAFF, AppSettings.roles.SECRETARY, AppSettings.roles.OFFICE_MANAGEMENT], //nhân viên công chứng, thư ký nghiệp vụ, quản lý cấp vp
                reject: [AppSettings.roles.NOTARY_STAFF, AppSettings.roles.SECRETARY, AppSettings.roles.OFFICE_MANAGEMENT], //từ chối công chứng: nhân viên công chứng, thư ký nghiệp vụ, quản lý cấp vp
                step3: [AppSettings.roles.NOTARY_STAFF, AppSettings.roles.SECRETARY, AppSettings.roles.OFFICE_MANAGEMENT], //nhân viên công chứng, thư ký nghiệp vụ, quản lý cấp vp
                step4: [AppSettings.roles.NOTARY_STAFF, AppSettings.roles.SECRETARY, AppSettings.roles.OFFICE_MANAGEMENT], //nhân viên công chứng, thư ký nghiệp vụ, quản lý cấp vp
                step5: [AppSettings.roles.CLERICAL_ASSISTANT, AppSettings.roles.OFFICE_MANAGEMENT], //văn thư, quản lý cấp vp
                step6: [AppSettings.roles.CLERICAL_ASSISTANT, AppSettings.roles.OFFICE_MANAGEMENT], //văn thư, quản lý cấp vp
            },
            steps: {
                step1: 'step1',
                step2: 'step2',
                reject: 'reject',
                step3: 'step3',
                step4: 'step4',
                step5: 'step5',
                step6: 'step6',
            },
            cert_user_id: "",
            selectCert: null,
            cert_file: null,
            insertCertToPdf: [],
        },
        constants: {
            fileType: {
                pdf: "application/pdf"
            }
        },
        fields: {},
        plugins: {
            dateRangePickerFilter: null,
        },
        editorInstance: null,
        message: { // message khi thao tác với hợp đồng
            pageTitle: I18n.t("notarization_request", "PAGE_TITLE"),
            actions: I18n.t("common", "ACTIONS"),
            create: I18n.t("common", "ADD_NEW"),
            edit: I18n.t("common", "EDIT"),
            delete: I18n.t("common", "DELETE"),
            confirmTittle: I18n.t("common", "CONFIRM_TITLE"),
            successTitle: I18n.t("common", "SUCCESS_TITLE"),
            errorTitle: I18n.t("common", "ERROR_TITLE"),
            failTitle: I18n.t("common", "FAIL_TITLE"),
            warningTitle: I18n.t("common", "WARNING_TITLE"),
            createConfirm: I18n.t("common", "CREATE_CONFIRM", { name: I18n.t("notarization_request", "PAGE_TITLE").toLocaleLowerCase() }),
            createSuccess: I18n.t("common", "CREATE_SUCCESS", { name: I18n.t("notarization_request", "PAGE_TITLE").toLocaleLowerCase() }),
            createError: I18n.t("common", "CREATE_ERROR", { name: I18n.t("notarization_request", "PAGE_TITLE").toLocaleLowerCase() }),
            updateConfirm: I18n.t("common", "UPDATE_CONFIRM", { name: I18n.t("notarization_request", "PAGE_TITLE").toLocaleLowerCase() }),
            updateSuccess: I18n.t("common", "UPDATE_SUCCESS", { name: I18n.t("notarization_request", "PAGE_TITLE") }),
            updateError: I18n.t("common", "UPDATE_ERROR", { name: I18n.t("notarization_request", "PAGE_TITLE").toLocaleLowerCase() }),
            deleteConfirm: I18n.t("common", "DELETE_CONFIRM", { name: I18n.t("notarization_request", "PAGE_TITLE").toLocaleLowerCase() }),
            deleteSuccess: I18n.t("common", "DELETE_SUCCESS", { name: I18n.t("notarization_request", "PAGE_TITLE").toLocaleLowerCase() }),
            deleteError: I18n.t("common", "DELETE_ERROR", { name: I18n.t("notarization_request", "PAGE_TITLE").toLocaleLowerCase() }),
            notFound: I18n.t("common", "NOT_FOUND", { name: I18n.t("notarization_request", "PAGE_TITLE").toLocaleLowerCase() }),
            validationError: I18n.t("common", "VALIDATION_ERROR"),
            pageTitleSubDoc: I18n.t("notarization_request", "PAGE_TITLE_SUB_DOC"),
            confirmText: I18n.t("notarization_request", "CONFIRM_TEXT"),
            confirmComplete: I18n.t("notarization_request", "CONFIRM_COMPLETE"),
            forbiddenText: I18n.t("common", "FORBIDDEN"),
        },
        messageAddUser: { // message khi thêm khách hàng
            pageTitle: I18n.t("notarization_request", "PAGE_TITLE_USER"),
            actions: I18n.t("common", "ACTIONS"),
            create: I18n.t("common", "ADD_NEW"),
            confirmTittle: I18n.t("common", "CONFIRM_TITLE"),
            successTitle: I18n.t("common", "SUCCESS_TITLE"),
            errorTitle: I18n.t("common", "ERROR_TITLE"),
            failTitle: I18n.t("common", "FAIL_TITLE"),
            warningTitle: I18n.t("common", "WARNING_TITLE"),
            createConfirm: I18n.t("common", "CREATE_CONFIRM", { name: I18n.t("notarization_request", "PAGE_TITLE_USER").toLocaleLowerCase() }),
            createSuccess: I18n.t("common", "CREATE_SUCCESS", { name: I18n.t("notarization_request", "PAGE_TITLE_USER").toLocaleLowerCase() }),
            createError: I18n.t("common", "CREATE_ERROR", { name: I18n.t("notarization_request", "PAGE_TITLE_USER").toLocaleLowerCase() }),
            validationError: I18n.t("common", "VALIDATION_ERROR"),
        },
        messageRejectNotarizationRequest: { // message khi từ chối
            pageTitle: I18n.t("notarization_request", "PAGE_TITLE_USER"),
            actions: I18n.t("common", "ACTIONS"),
            create: I18n.t("common", "ADD_NEW"),
            confirmTittle: I18n.t("common", "CONFIRM_TITLE"),
            successTitle: I18n.t("common", "SUCCESS_TITLE"),
            errorTitle: I18n.t("common", "ERROR_TITLE"),
            failTitle: I18n.t("common", "FAIL_TITLE"),
            warningTitle: I18n.t("common", "WARNING_TITLE"),
            rejectTitle: I18n.t("notarization_request", "REJECT_TITLE"),
            rejectText: I18n.t("notarization_request", "REJECT_TEXT"),
            rejectSuccessText: I18n.t("notarization_request", "REJECT_SUCCESS_TEXT"),
            validationError: I18n.t("common", "VALIDATION_ERROR"),
        },
        messagesFileManager: {
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
        formValidatorStep1: null, //init validate cho [step1]
        formValidatorStep2: null, //init validate cho [step2]
        formValidatorStep3: null, //init validate cho [step3]
        formValidatorStep4: null, //init validate cho [step4]
        formValidatorStep5: null, //init validate cho [step5]
        formValidatorStep6: null, //init validate cho [step6]
        formValidatorAddUser: null, //init validate cho thêm khách hàng [step1]
        formValidatorRejectRequest: null, //init validate cho từ chối yêu cầu [step2]
        init: function () {
            this.initPlugins();
            this.loadRelatedData();
            this.bindEvents();
            //định nghĩa các form
            this.formValidatorAddUser = new FormValidator({
                formSelector: "#kt_modal_addUser_form",
                handleSubmit: saveDataAddUser,
                rules: [
                    //{
                    //    element: "#addUser_username",
                    //    rule: [
                    //        {
                    //            name: "required",
                    //            message: I18n.t("common", "REQUIRED", { field: "Tên đăng nhập" })
                    //        },
                    //        {
                    //            name: "maxLength",
                    //            message: I18n.t("common", "TOO_LONG", { field: "Tên đăng nhập", max: 30 }),
                    //            params: 30
                    //        },
                    //        {
                    //            name: "minLength",
                    //            message: I18n.t("common", "TOO_SHORT", { field: "Tên đăng nhập", min: 6 }),
                    //            params: 6
                    //        },
                    //        {
                    //            name: "customFunction",
                    //            message: "Tên đăng nhập chỉ cho phép nhập chữ và số",
                    //            params: checkValidUsername,
                    //        }
                    //    ]
                    //},
                    //{
                    //    element: "#addUser_password",
                    //    rule: [
                    //        {
                    //            name: "required",
                    //            message: I18n.t("common", "REQUIRED", { field: "Mật khẩu" })
                    //        },
                    //        {
                    //            name: "maxLength",
                    //            message: I18n.t("common", "TOO_LONG", { field: "Mật khẩu", max: 64 }),
                    //            params: 64
                    //        },
                    //        {
                    //            name: "minLength",
                    //            message: I18n.t("common", "TOO_SHORT", { field: "Mật khẩu", min: 8 }),
                    //            params: 8
                    //        },
                    //    ]
                    //},
                    //{
                    //    element: "#addUser_rePassword",
                    //    rule: [
                    //        {
                    //            name: "required",
                    //            message: I18n.t("common", "REQUIRED", { field: "Nhập lại mật khẩu" })
                    //        },
                    //        {
                    //            name: "equalTo",
                    //            message: I18n.t("common", "COMPARE_EQUAL", { fieldA: "Nhập lại mật khẩu", fieldB: "Mật khẩu" }),
                    //            params: "#addUser_password"
                    //        }
                    //    ]
                    //},
                    {
                        element: "#addUser_firstName",
                        rule: [
                            {
                                name: "required",
                                message: I18n.t("common", "REQUIRED", { field: "Họ và tên đệm" })
                            },
                            {
                                name: "maxLength",
                                message: I18n.t("common", "TOO_LONG", { field: "Họ và tên đệm", max: 255 }),
                                params: 255
                            }
                        ]
                    },
                    {
                        element: "#addUser_lastName",
                        rule: [
                            {
                                name: "required",
                                message: I18n.t("common", "REQUIRED", { field: "Tên" })
                            },
                            {
                                name: "maxLength",
                                message: I18n.t("common", "TOO_LONG", { field: "Tên", max: 255 }),
                                params: 255
                            }
                        ]
                    },
                    {
                        element: "#addUser_email",
                        rule: [
                            //{
                            //    name: "required",
                            //    message: I18n.t("common", "REQUIRED", { field: "Email" })
                            //},
                            {
                                name: "maxLength",
                                message: I18n.t("common", "TOO_LONG", { field: "Email", max: 500 }),
                                params: 500,
                                allowNullOrEmpty: true
                            },
                            {
                                name: "email",
                                message: I18n.t("common", "INVALID_FORMAT", { field: "Email" }),
                                allowNullOrEmpty: true
                            },
                        ]
                    },
                    {
                        element: "#addUser_phoneNumber",
                        rule: [
                            {
                                name: "phone",
                                message: I18n.t("common", "INVALID_FORMAT", { field: "Số điện thoại" }),
                                allowNullOrEmpty: true
                            },
                        ]
                    },
                    {
                        element: "#addUser_identityNumber",
                        rule: [
                            {
                                name: "required",
                                message: I18n.t("common", "REQUIRED", { field: "Số CCCD" })
                            },
                            {
                                name: "customFunction",
                                message: "CCCD gồm 12 chữ số.",
                                params: checkValidIdentityNumber,
                            }
                        ]
                    },
                    {
                        element: "#addUser_taxCode",
                        rule: [
                            {
                                name: "customFunction",
                                message: "Mã số thuế không hợp lệ. Định dạng đúng là 10 chữ số, hoặc 10 chữ số + '-' + 3 chữ số (ví dụ: 0101243150 hoặc 0101243150-001).",
                                params: checkValidTaxCode,
                                allowNullOrEmpty: true
                            }
                        ]
                    },
                    {
                        element: "#addUser_gender",
                        rule: [
                            {
                                name: "required",
                                message: I18n.t("common", "REQUIRED_SELECT", { field: "Giới tính" })
                            },
                        ]
                    },
                    {
                        element: "#addUser_dateOfBirth",
                        rule: [
                            {
                                name: "required",
                                message: I18n.t("common", "REQUIRED", { field: "Ngày sinh" })
                            },
                        ]
                    },
                    {
                        element: "#addUser_nationality",
                        rule: [
                            {
                                name: "required",
                                message: I18n.t("common", "REQUIRED", { field: "Quốc tịch" })
                            },
                        ]
                    },
                ]
            });
            this.formValidatorRejectRequest = new FormValidator({
                formSelector: "#kt_modal_reject",
                handleSubmit: saveDataRejectRequest,
                rules: [
                    {
                        element: "#notatization_request_review_history_reason",
                        rule: [
                            {
                                name: "required",
                                message: I18n.t("common", "REQUIRED", { field: "Lý do từ chối" })
                            },
                        ]
                    },
                ]
            });
            this.formValidatorStep1 = new FormValidator({
                formSelector: "#form_step1",
                rules: [
                    {
                        element: "#step1_documentCategoryId",
                        rule: [
                            {
                                name: "required",
                                message: I18n.t("common", "REQUIRED_SELECT", { field: "Danh mục hợp đồng giao dịch" })
                            }
                        ]
                    },
                    {
                        element: "#step1_documentTypeId",
                        rule: [
                            {
                                name: "required",
                                message: I18n.t("common", "REQUIRED_SELECT", { field: "Loại hợp đồng giao dịch" })
                            }
                        ]
                    },
                    {
                        element: "#step1_requestTypeId",
                        rule: [
                            {
                                name: "required",
                                message: I18n.t("common", "REQUIRED_SELECT", { field: "Hình thức ký hợp đồng" })
                            }
                        ]
                    },
                    //{
                    //    element: "#step1_transactionValue",
                    //    rule: [
                    //        {
                    //            name: "required",
                    //            message: I18n.t("common", "REQUIRED", { field: "Giá trị hợp đồng" })
                    //        },
                    //    ]
                    //},
                    {
                        element: "#step1_user_id",
                        rule: [
                            {
                                name: "required",
                                message: I18n.t("common", "REQUIRED_SELECT", { field: "Chọn khách hàng" })
                            },
                        ]
                    },
                    {
                        element: "#step1_notaryPhoneNumber",
                        rule: [
                            {
                                name: "phone",
                                message: I18n.t("common", "INVALID_FORMAT", { field: "Số điện thoại" }),
                                allowNullOrEmpty: true
                            },
                        ]
                    },
                ]
            });
            this.formValidatorStep2 = new FormValidator({
                formSelector: "#form_step2",
                rules: [
                    {
                        element: "#step2_requester_confirm",
                        rule: [
                            {
                                name: "required",
                                message: I18n.t("common", "REQUIRED", { field: "Xác thực thông tin" })
                            },
                        ]
                    }
                ]
            });
            this.formValidatorStep3 = new FormValidator({
                formSelector: "#form_step3",
                rules: []
            });
            this.formValidatorStep4 = new FormValidator({
                formSelector: "#form_step4",
                rules: [
                    {
                        element: "#step4_sign_confirm",
                        rule: [
                            {
                                name: "required",
                                message: I18n.t("common", "REQUIRED", { field: "Xác thực thông tin" })
                            },
                        ]
                    }
                ]
            });
            this.formValidatorStep5 = new FormValidator({
                formSelector: "#form_step5",
                rules: []
            });
            this.formValidatorStep6 = new FormValidator({
                formSelector: "#form_step6",
                rules: [
                    {
                        element: "#step6_notarizationNumber",
                        rule: [
                            {
                                name: "required",
                                message: I18n.t("common", "REQUIRED", { field: "Số công chứng" })
                            },
                        ]
                    },
                    {
                        element: "#step6_notarizationBookId",
                        rule: [
                            {
                                name: "required",
                                message: I18n.t("common", "REQUIRED", { field: "Số sổ công chứng" })
                            },
                        ]
                    },
                    //{
                    //    element: "#step6_archiveLocation",
                    //    rule: [
                    //        {
                    //            name: "required",
                    //            message: I18n.t("common", "REQUIRED", { field: "Vị trí lưu trữ" })
                    //        },
                    //    ]
                    //},
                ]
            });
            //Gán vào stepValidators
            this.variables.stepValidators = [
                this.formValidatorStep1,
                this.formValidatorStep2,
                this.formValidatorStep3,
                this.formValidatorStep4,
                this.formValidatorStep5,
                this.formValidatorStep6,
            ];

        },
        initPlugins: function () {
            //khởi tạo stepper
            var element = document.querySelector("#kt_stepper_example_basic");
            this.variables.stepper = new KTStepper(element);
            //Sự kiện khi ấn nút tiếp tục
            this.variables.stepper.on("kt.stepper.next", async function (stepperObj) {
                const currentStep = stepperObj.getCurrentStepIndex();
                const validator = NotarizationRequestDetailPage.variables.stepValidators[currentStep - 1];
                validator.clearErrors();

                if (!validator) {
                    stepperObj.goNext();
                    return;
                }
                const result = await validator.validate();
                if (!result.isValid) {
                    result.errorMessages.forEach(({ element, messages }) => {
                        validator.defaultRenderError(element, messages[0]);
                    });
                } else {
                    const saveFunc = NotarizationRequestDetailPage.variables.stepSaveFunctions[currentStep];
                    if (saveFunc) {
                        const success = await saveFunc(); // mỗi saveDataStepX cần return true/false
                        if (success) {
                            //Nếu bước đã hoàn thiện lớn hơn bước cbi nhảy đến thì disable
                            if (NotarizationRequestDetailPage.variables.currentStep > (currentStep + 1)) {
                                disableFormControls(`#form_step${currentStep + 1}`)
                            }
                            stepperObj.goNext();
                        }
                    } else {
                        stepperObj.goNext(); // nếu không có hàm save, cứ next
                    }
                }
            });

            //Sự kiện khi ấn nút quay lại
            this.variables.stepper.on("kt.stepper.previous", async function (stepperObj) {
                const previousStep = stepperObj.getCurrentStepIndex() - 1; // sau khi lùi xong là bước hiện tại
                const initFunc = NotarizationRequestDetailPage.variables.initStepFunctions[previousStep];
                if (typeof initFunc === "function") {
                    const result = await initFunc();
                    if (!result) {
                        console.warn(`Init step ${previousStep} thất bại`);
                    }
                    else {
                        disableFormControls(`#form_step${previousStep}`);
                        stepperObj.goPrevious();
                    }
                } else {
                    console.warn(`Không tìm thấy hàm init cho step ${previousStep}`);
                }
            });

            //Sự kiện khi ấn vào step
            this.variables.stepper.on("kt.stepper.click", async function (stepperObj) {
                const clickedStep = stepperObj.getClickedStepIndex();
                const currentStep = NotarizationRequestDetailPage.variables.currentStep;

                if (clickedStep <= currentStep) {
                    // Cho phép quay lại bước trước
                    const initFunc = NotarizationRequestDetailPage.variables.initStepFunctions[clickedStep];
                    if (typeof initFunc === "function") {
                        const result = await initFunc();
                        if (!result) {
                            return;
                        } else {
                            //Nếu bước của hiện tại khác bước bấm vào thì mới disable
                            if (NotarizationRequestDetailPage.variables.currentStep != clickedStep) {
                                disableFormControls(`#form_step${clickedStep}`);
                            }
                        }
                    }
                    stepperObj.goTo(clickedStep);
                } else {
                    // Không cho nhảy tới bước chưa làm và hiện cảnh báo
                    Swal.fire({
                        icon: "warning",
                        title: "Chưa thể chuyển bước",
                        text: `Bạn cần hoàn thành bước hiện tại trước khi chuyển đến bước tiếp theo.`,
                        ...AppSettings.sweetAlertOptions(false)

                    });
                }
            });

            //khởi tạo select2
            $("#addUser_provinceId").select2({
                language: currentLang,
                placeholder: 'Chọn tỉnh/thành phố',
                dropdownParent: "#kt_modal_addUser"
            });

            $("#addUser_wardId").select2({
                language: currentLang,
                placeholder: 'Chọn xã/phường',
                dropdownParent: "#kt_modal_addUser"
            });

            $("#step1_documentCategoryId").select2({
                language: currentLang,
                placeholder: 'Chọn danh mục hợp đồng',
            });

            $("#step1_documentTypeId").select2({
                language: currentLang,
                placeholder: 'Chọn loại hợp đồng',
            });

            $("#step1_requestTypeId").select2({
                language: currentLang,
                placeholder: 'Chọn hình thức',
            });

            $("#step6_notarizationBookId").select2({
                language: currentLang,
                placeholder: 'Chọn số sổ'
            });

            $("#addUser_gender").select2({
                language: currentLang,
                placeholder: 'Chọn giới tính'
            })

            $("#step4_staffId").select2({
                language: currentLang,
                placeholder: 'Chọn công chứng viên'
            })

            //select thay đổi requester ở bước 1
            AppUtils.createSelect2Custom("#step1_user_id", {
                url: ApiRoutes.User.v1.PagedClient,
                cache: true,
                placeholder: 'Chọn khách hàng (Tên/Email/CCCD)',
                select2Options: {
                    templateResult: function (data) {
                        if (!data.id) return data.text;
                        // Lưu vào biến nếu chưa có
                        let exists = NotarizationRequestDetailPage.variables.cachedUserData.find(x => x.id === data.id);
                        if (!exists) {
                            NotarizationRequestDetailPage.variables.cachedUserData.push(data);
                        }
                        return $(`
                            <span>
                                <div class="d-flex align-items-center">
                                    <img src="${AppUtils.escapeHtml(data.avatarUrl) || `/admin/assets/media/svg/files/blank-image.svg`}" 
                                         class="rounded-circle h-40px me-3" 
                                         alt="" />
                                    <div class="d-flex flex-column">
                                        <span class="fs-4 fw-bold lh-1">${data.name}</span>
                                        <span class="text-muted fs-5">${data.email}</span>
                                    </div>
                                </div>
                            </span>
                        `);
                    },
                    templateSelection: function (data) {
                        return data.text || `${data.name}`;
                    },
                    escapeMarkup: function (markup) {
                        return markup;
                    }
                }
            });

            ////select thay đổi documentType
            //AppUtils.createSelect2("#step1_documentTypeId", {
            //    url: ApiRoutes.DocumentType.v1.GetByCurrentUser,
            //    cache: true,
            //    placeholder: 'Chọn loại hợp đồng giao dịch',
            //});

            ////init reapeater cho các phí khác
            //$('#kt_docs_repeater_other_fee').repeater({
            //    initEmpty: false,
            //    show: function () {
            //        const index = $(this).index();
            //        if (index >= 1) {
            //            $(this).addClass('mt-5');
            //        }
            //        $(this).slideDown();
            //    },

            //    hide: function (deleteElement) {
            //        $(this).slideUp(deleteElement);
            //    }
            //});

            //init khi chọn ngày sinh ở bước 1 thêm requester
            $("#addUser_dateOfBirth").flatpickr({
                dateFormat: "d/m/Y",
                locale: "vn",
            });
            AppSettings.ckEditorSettingsForA4Paper.width = "100%";
            AppSettings.ckEditorSettingsForA4Paper.height = "55vh";

            AppSettings.ckEditorSettingsForA4Paper.removeButtons = 'Image,ExportPdf,Form,Checkbox,Radio,TextField,Select,Textarea,Button,ImageButton,HiddenField,NewPage,CreateDiv,Flash,Iframe,About,ShowBlocks,Save,Preview,Print',

                CKEDITOR.replace('preview_contract_content', {
                    ...AppSettings.ckEditorSettingsForA4Paper,
                    toolbar: [],
                    readOnly: true
                });
            this.editorInstance = CKEDITOR.instances["preview_contract_content"];
        },
        bindEvents: function () {
            //sự kiện khi thay đổi loại hợp đồng [step1]
            this.bindChangeDocumentType();
            //sự kiện khi thay đổi giá trị hợp đồng [step1]
            this.bindChangeTransactionValue();
            //sự kiện khi thay đổi hình thức [step1]
            this.bindChangeRequestType();
            //sự kiện khi ấn vào tạo nhanh khách hàng [step1]
            this.bindAddUser();
            //load quận/huyện theo tỉnh/thành phố [step1]
            /*this.bindLoadDistrictByProvince();*/
            //load xã/phường theo quận/huyện [step1]
            this.bindLoadWardByProvince();
            //sự kiện khi thay đổi user [step1]
            this.bindLoadUserByChange();
            //Sự kiện khi thêm người dùng upload ảnh CCCD [step1]
            this.bindUploadFileIdentity();
            //Sự kiện khi chọn danh mục hợp đồng [step1]
            this.bindSelectedDocumentCategory();
            //sự kiện khi thay đổi checkbox xác thực thông tin người dùng [step2]
            this.bindChangeConfirmStep2();
            //upload file tài liệu [step2]
            this.bindUploadFileSummited();
            //Sự kiện nút thêm tài liệu [step 2]
            this.bindAddOtherDocument();
            //Sự kiện khi nhấn nút từ chối [step2]
            this.bindClickRejectRequestEvent();
            //Sự kiện tải tài liệu tra cứu [step2]
            this.bindUploadBlockingInformation();

            this.bindAddSubmittedDocument();
            //Khi nhập ô input [step 3]
            this.bindKeyPressDocument();
            //Khi nhấn vào tải xuống [step 3]
            this.bindDownLoadPdfDocument();
            //Khi nhấn vào nút tải hợp đồng công chứng [step3]
            this.bindUploadFileNotarizationDocument();
            //Khi thay đổi trạng thái có mẫu sẵn document [step3]
            this.bindChangeDocumentStep3();
            //Khi ấn nút download qr 
            this.bindDownloadQrStep3();
            //Sự kiện khi thay đổi chọn ký bên ngoài [step4]
            this.bindChangeCheckOutsideLocationStep4();

            this.bindClickCheckPubEvent();

            ////khi thay đổi phương thức chuyển khoản [step5]
            //this.bindOnchangePaymentMethod();
            //Sự kiện khi ấn nút hoàn thành ở [step6]
            this.bindComplete();

        },
        bindAddUser: function () {
            $("#btn_open_modal_addUser").on("click", function () {
                addItemUser();
            })
        },
        bindChangeDocumentType: function () {
            $("#step1_documentTypeId").on("change", async function () {
                if (NotarizationRequestDetailPage.variables.isLoadingDetail) return;
                await loadDataDocumentNecessary($(this).val());
                //await tryGetFee();
            })
        },
        bindChangeRequestType: function () {
            $("#step1_requestTypeId").on("change", async function () {
                //Nếu là công chứng trực tuyến thì hiển thị, tạm thời fix cứng
                $(".step1-connection-phone-container").toggleClass("d-none", $(this).val() != AppSettings.notarizationRequestType.ONLINE);
            })
        },
        bindChangeTransactionValue: function () {
            $("#step1_transactionValue").on("change", async function () {
                //if (NotarizationRequestDetailPage.variables.isLoadingDetail) return;
                //await tryGetFee();
            })
        },
        bindLoadWardByProvince: function () {
            $("#addUser_provinceId").on("change", async function () {
                await loadDataWardByProvinceId($(this).val());
            })
        },
        bindLoadUserByChange: function () {
            $("#step1_user_id").on("change", async function () {
                if (NotarizationRequestDetailPage.variables.isLoadingUserData) return;
                await loadDataCustomer($(this).val());
            })
        },
        bindChangeConfirmStep2: function () {
            $('#step2_requester_confirm').on("change", async function () {
                await loadDataDocumentStep2(this.checked);
            })
        },
        bindUploadFileSummited: function () {
            // Trigger click vào input[type=file]
            $(".step2-list-document, .step2-list-document-other").on("click", ".btn-trigger-upload", function () {
                const docId = $(this).data("doc-id");
                $(`input.form-upload-file[data-doc-id="${docId}"]`).click();
            });

            // Xử lý khi người dùng chọn file
            $(".step2-list-document, .step2-list-document-other").on("change", ".form-upload-file", async function () {
                const files = this.files;
                if (!files || files.length === 0) return;

                const docId = $(this).data("doc-id");
                const $container = $(`[data-submitdoc-id="${docId}"]`);

                try {
                    // Gửi mảng file lên server
                    let uploadResults = await uploadFile(files, AppSettings.fileCategoryUpload.SUBMITTED_DOCUMENT);
                    // Kết quả trả về là mảng
                    if (!Array.isArray(uploadResults)) {
                        uploadResults = [uploadResults]; // fallback nếu server trả về 1 file
                    }

                    // Cập nhật data-fileupload-id (dạng chuỗi "id1,id2,...")
                    const newIds = uploadResults.map(x => x.id);
                    const existingIds = $container.attr("data-fileupload-id")
                        ?.toString()
                        .split(",")
                        .map(id => parseInt(id))
                        .filter(id => !isNaN(id)) || [];

                    const allIds = [...existingIds, ...newIds];
                    $container.attr("data-fileupload-id", allIds.join(","));
                    $container.removeData('submitted').attr("data-submitted", true);
                    $container.find(".upload-success").removeClass("d-none");

                    // Append từng file mới vào
                    uploadResults.forEach(file => {
                        let fileHtml = ``;
                        if (file.fileType == NotarizationRequestDetailPage.constants.fileType.pdf) {
                            fileHtml = `
                            <div class="notarization-item-file d-flex justify-content-between align-items-center mgt-10px"
                                data-doc-id="${docId}" data-file-id="${file.id}">
                                <div class="d-flex gap-10px align-items-center">
                                    <div class="icon-file"><img src="/admin/assets/media/file-type-icons/pdf.png"></div>
                                    <a href="/notarization-request/${NotarizationRequestDetailPage.variables.id}/file/${file.id}/${AppUtils.getPathSegment(5, file.fileKey)}" class="upload-file-link" target="_blank">${file.fileName}</a>
                                </div>
                                <div class="d-flex align-items-center gap-10px">
                                    <p class="upload-file-size">${formatToKB(file.fileSize)}</p>
                                    <span class="btn-delete-upload btn btn-icon btn-circle btn-color-muted btn-active-color-primary w-25px h-25px bg-body shadow" data-kt-image-input-action="remove" data-bs-toggle="tooltip" data-bs-trigger="hover" data-bs-dismiss="click" aria-label="Xóa ảnh" data-bs-original-title="Xóa ảnh" data-kt-initialized="1"
                                    data-doc-id="${docId}" data-file-id="${file.id}">
                                         <i class="ki-outline ki-cross fs-3"></i>
                                    </span>
                                </div>
                            </div>`;
                        }
                        else {
                            //Nếu không thì là ảnh
                            fileHtml = `
                            <div class="notarization-item-file d-flex justify-content-between align-items-center mgt-10px flex-column w-fit-content gap-10px bg-white"
                                data-doc-id="${docId}" data-file-id="${file.id}">
                                <div class="d-flex gap-10px align-items-center image-input">
                                    <!--begin::Overlay-->
                                        <div class="d-block overlay card-rounded overflow-hidden">
                                            <!--begin::Image-->
                                            <img src="${file.fileUrl}" class="overlay-wrapper bgi-no-repeat bgi-position-center bgi-size-cover h-150px"/>
                                            <!--end::Image-->
                                            <!--begin::Action-->
                                            <a class="overlay-layer bg-dark bg-opacity-25 shadow align-items-center justify-content-center " data-fslightbox="file_gallery" href="${file.fileUrl}" data-type="image">
					                            <i class="bi bi-eye-fill text-white fs-3x"></i>
					                        </a>
                                            <!--end::Action-->
                                        </div>
                                        <!--end::Overlay-->
                                    <span class="btn-delete-upload btn btn-icon btn-circle btn-color-muted btn-active-color-primary w-25px h-25px bg-body shadow" data-kt-image-input-action="remove" data-bs-toggle="tooltip" data-bs-trigger="hover" data-bs-dismiss="click" aria-label="Xóa ảnh" data-bs-original-title="Xóa ảnh" data-kt-initialized="1"
                                    data-doc-id="${docId}" data-file-id="${file.id}">
                                         <i class="ki-outline ki-cross fs-3"></i>
                                    </span>
                                </div>
                            </div>`;
                        }
                        // sau đó append
                        if (file.fileType == NotarizationRequestDetailPage.constants.fileType.pdf) {
                            $container.find(".submitted-pdf").append(fileHtml);
                        }
                        else {
                            $container.find(".submitted-img").append(fileHtml);
                        }
                    });
                    refreshFsLightbox();

                } catch (err) {
                    console.error("Upload error", err);
                }
            });

            //Xử lý khi đổi loại file
            $(document).on("change", 'select[data-doc-id]', function () {
                const docId = $(this).data("doc-id");
                const value = $(this).val();
                const type = $(this).data("type"); // "document-type" hoặc "forparty"
                const $target = $(`.step2-documentNecessary-item[data-submitdoc-id="${docId}"]`);

                if (type === "document-type") {
                    $target.attr("data-doc-type", value);
                } else if (type === "forparty") {
                    $target.attr("data-forparty", value);
                }
            });

            // Xử lý khi người dùng xóa file
            $(".step2-list-document, .step2-list-document-other").on("click", ".btn-delete-upload", function () {
                const docId = $(this).data("doc-id");
                const fileId = $(this).data("file-id");

                const $docBlock = $(`.step2-documentNecessary-item[data-submitdoc-id="${docId}"]`);
                const $fileBlock = $(`.notarization-item-file[data-doc-id="${docId}"][data-file-id="${fileId}"]`);

                // Xóa giao diện
                $fileBlock.remove();

                // Cập nhật lại data-fileupload-id
                let fileIds = $docBlock.attr("data-fileupload-id")?.split(",").map(id => parseInt(id)) || [];
                fileIds = fileIds.filter(id => id !== fileId);
                $docBlock.attr("data-fileupload-id", fileIds.join(","));
                $docBlock.attr("data-submitted", fileIds.length > 0);

                // Ẩn icon check nếu không còn file
                if (fileIds.length === 0) {
                    $docBlock.find(".upload-success").addClass("d-none");
                }
            });

            // Gán sự kiện click cho nút xóa tài liệu
            $(".step2-list-document-other").on("click", ".btn-remove-document", function () {
                $(this).closest(".step2-documentNecessary-item").remove();
            });

            $("#form_step2").on("click", ".step2-list-document-forparty .btn-remove-document", function () {
                $(this).closest(".step2-documentNecessary-item").remove();
            });
        },
        bindUploadBlockingInformation: function () {
            $("#btn_upload_blockingInformation").on("click", function () {
                $("#hidden_upload_blockingInformation").click();
            });

            $("#hidden_upload_blockingInformation").on("change", async function () {
                const files = this.files;
                if (!files || files.length === 0) return;

                try {
                    let results = await uploadFile(files, AppSettings.fileCategoryUpload.BLOCKING_INFORMATION, false, true);
                    // Kết quả trả về là mảng
                    if (!Array.isArray(results)) {
                        results = [results]; // fallback nếu server trả về 1 file
                    }
                    results.forEach(result => {
                        let card = generateFileItem(result);
                        $("#step2_blockingInformation-files").append(card);
                    });
                    refreshFsLightbox();
                } catch (err) {
                    console.error("Upload error", err);
                }
                //reset value
                $(this).val("");
            });

            $("#step2_blockingInformation-files").on('click', '.btn-delete-upload', function () {
                const $item = $(this).closest('.file_gallery_item');
                $item.remove();
            });
        },
        bindKeyPressDocument: function () {
            $("#contract_toolbar").on("input", "input", function () {
                const value = $(this).val();
                const variable = $(this).attr("data-code");
                const displayOrder = Number($(this).attr("data-sort"));
                const index = NotarizationRequestDetailPage.fields[variable].indexOf(displayOrder);
                const editor = NotarizationRequestDetailPage.editorInstance;

                if (!editor || !editor.document) return;

                const elements = editor.document.find(".template-variable[data-code='{{" + variable + "}}']");

                if (elements.count() > 0) {
                    const el = elements.getItem(index);
                    el.setText(value);
                }
            });
        },
        bindDownLoadPdfDocument: function () {
            $("#form_step3 #download-notarization-document").on("click", function () {
                generatePDFByPreviewPage();
            });
        },
        bindUploadFileNotarizationDocument: function () {
            // Trigger click vào input[type=file]
            $(".step5-list-document").on("click", "#btn-upload-notarization-document", function () {
                $(`.step5-list-document #upload-notarization-document`).click();
            });

            // Xử lý khi người dùng chọn file
            $(".step5-list-document").on("change", "#upload-notarization-document", async function () {
                const file = this.files[0];
                if (!file) return;
                try {
                    let result = await uploadFile(this.files, AppSettings.fileCategoryUpload.NOTARIZATION_REQUEST_ATTACHMENT);
                    const fileLink = $(`.step5-notarization-document-item`);
                    fileLink.attr('data-fileupload-id', result.id);
                    fileLink.removeData('submitted'); // xóa cache cũ
                    fileLink.attr('data-submitted', true);
                    fileLink.find(".notarization-item-file").removeClass("d-none");
                    fileLink.find(".upload-success").removeClass("d-none");
                    fileLink.find(".upload-file-link").attr("href", `/notarization-request/${NotarizationRequestDetailPage.variables.id}/file/${result.id}/${AppUtils.getPathSegment(5, result.fileKey)}`).text(result.fileName);
                    fileLink.find(".upload-file-size").text(formatToKB(result.fileSize));
                    readFileNotarizationDocument(result, $(".signature-notarization-document-form"));
                } catch (err) {
                    console.error("Upload error", err);
                }
            });

            $("#form_step5").on("click", "#btn-sign-notarization-document", function () {
                NotarizationRequestDetailPage.variables.cert_user_id = "";
                NotarizationRequestDetailPage.variables.selectCert = null;
                NotarizationRequestDetailPage.variables.cert_file = null;
                NotarizationRequestDetailPage.variables.insertCertToPdf = [];
                updateSignatureBoxData(NotarizationRequestDetailPage.variables.selectCert);
                $("#sign-notarization-document").click();
            });

            $("#form_step5").on("change", "#sign-notarization-document", async function () {
                const file = this.files[0];
                if (!file) return;
                NotarizationRequestDetailPage.variables.cert_file = file; // Lưu file để sử dụng sau này
                const reader = new FileReader();
                reader.onload = async function () {
                    const typedarray = new Uint8Array(reader.result);
                    const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
                    const container = $("#pdfCanvasContainer").empty();

                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const viewport = page.getViewport({ scale: 1 });

                        const canvas = document.createElement("canvas");
                        canvas.width = viewport.width;
                        canvas.height = viewport.height;
                        canvas.classList.add("pdf-canvas");
                        canvas.dataset.page = i;

                        const context = canvas.getContext("2d");
                        await page.render({ canvasContext: context, viewport }).promise;

                        const wrapper = $("<div class='pdf-page-wrapper' style='position:relative; margin-bottom: 20px;'>").append(canvas);
                        wrapper.width(viewport.width);
                        wrapper.height(viewport.height);
                        container.append(wrapper);
                    }

                    new bootstrap.Modal(document.getElementById("signModal")).show();
                };
                reader.readAsArrayBuffer(file);
            });


            $(".step5-list-document").on("click", "#btn-upload-certificate-document", function () {
                $(`.step5-list-document #upload-certificate-document`).click();
            });

            // Xử lý khi người dùng chọn file
            $(".step5-list-document").on("change", "#upload-certificate-document", async function () {
                const file = this.files[0];
                if (!file) return;
                try {
                    let result = await uploadFile(this.files, AppSettings.fileCategoryUpload.NOTARIZATION_REQUEST_ATTACHMENT);
                    const fileLink = $(`.step5-certificate-document-item`);
                    fileLink.attr("data-submitted", true);
                    fileLink.attr('data-fileupload-id', result.id);
                    fileLink.find(".notarization-item-file").removeClass("d-none");
                    fileLink.find(".upload-success").removeClass("d-none");
                    fileLink.find(".upload-file-link").attr("href", `/notarization-request/${NotarizationRequestDetailPage.variables.id}/file/${result.id}/${AppUtils.getPathSegment(5, result.fileKey)}`).text(result.fileName);
                    fileLink.find(".upload-file-size").text(formatToKB(result.fileSize));
                    readFileNotarizationDocument(result, $(".signature-certificate-document-form"));

                } catch (err) {
                    console.error("Upload error", err);
                }
            });

            $(".step-4-component").on("click", "#btn-upload-image-attach-document", function () {
                $(`.step-4-component #upload-image-attach-document`).click();
            });

            // Xử lý khi người dùng chọn file
            $(".step-4-component").on("change", "#upload-image-attach-document", async function () {
                const files = this.files;
                if (!files || files.length === 0) return;
                try {
                    let results = await uploadFile(files, AppSettings.fileCategoryUpload.NOTARIZATION_REQUEST_ATTACHMENT);
                    // Kết quả trả về là mảng
                    if (!Array.isArray(results)) {
                        results = [results]; // fallback nếu server trả về 1 file
                    }

                    results.forEach(result => {
                        $(".step-component-content-img").append(`
                            <!--begin::Overlay-->
                                <div class="d-block overlay card-rounded overflow-hidden">
                                    <!--begin::Image-->
                                    <img src="${result.fileUrl}" class="overlay-wrapper bgi-no-repeat bgi-position-center bgi-size-cover h-150px" data-fileupload-id="${result.id}" data-id="${result.id}" />
                                    <!--end::Image-->

                                    <!--begin::Action-->
                                    <a class="overlay-layer bg-dark bg-opacity-25 shadow align-items-center justify-content-center " data-fslightbox="file_gallery" href="${result.fileUrl}" data-type="image">
					                    <i class="bi bi-eye-fill text-white fs-3x"></i>
					                </a>
                                    <!--end::Action-->
                                </div>
                                <!--end::Overlay-->`);
                    }
                    );
                    refreshFsLightbox();

                } catch (err) {
                    console.error("Upload error", err);
                }
            });

            $(".step5-other-document-item").on("click", "#step5_add_other_document", function () {
                $(`.step5-other-document-item #step5_upload_other_document`).click();
            });

            // Xử lý khi người dùng chọn file
            $(".step5-other-document-item").on("change", "#step5_upload_other_document", async function () {
                const files = this.files;
                if (!files) return;
                try {
                    let results = await uploadFile(files, AppSettings.fileCategoryUpload.NOTARIZATION_REQUEST_ATTACHMENT);

                    // Kết quả trả về là mảng
                    if (!Array.isArray(results)) {
                        results = [results]; // fallback nếu server trả về 1 file
                    }

                    results.forEach(result => {
                        $(".step5-other-document-item").append(`<div class="notarization-item-file d-flex justify-content-between align-items-center mgt-10px" data-file-id="${result.id}">
                                <div class="d-flex gap-10px align-items-center">
                                    <div class="icon-file"><img src="/admin/assets/media/file-type-icons/pdf.png"></div>
                                    <a href="/notarization-request/${NotarizationRequestDetailPage.variables.id}/file/${result.id}/${AppUtils.getPathSegment(5, result.fileKey)}" class="upload-file-link" target="_blank">${result.fileName}</a>
                                </div>
                                <div class="d-flex align-items-center gap-10px">
                                    <p class="upload-file-size">${formatToKB(result.fileSize)}</p>
                                   <span class="btn-delete-upload btn btn-icon btn-circle btn-color-muted btn-active-color-primary w-25px h-25px bg-body shadow" data-kt-image-input-action="remove" data-bs-toggle="tooltip" data-bs-trigger="hover" data-bs-dismiss="click" aria-label="Xóa ảnh" data-bs-original-title="Xóa ảnh" data-kt-initialized="1"
                                     data-file-id="${result.id}">
                                         <i class="ki-outline ki-cross fs-3"></i>
                                    </span>
                                </div>
                            </div>`)
                    });

                } catch (err) {
                    console.error("Upload error", err);
                }
            });

            $(".step5-other-document-item").on("click", ".btn-delete-upload", function () {
                const fileId = $(this).data("file-id");

                const $fileBlock = $(`.step5-other-document-item .notarization-item-file[data-file-id="${fileId}"]`);

                // Xóa giao diện
                $fileBlock.remove();

                // Cập nhật lại data-fileupload-id
                let fileIds = $docBlock.attr("data-fileupload-id")?.split(",").map(id => parseInt(id)) || [];
                fileIds = fileIds.filter(id => id !== fileId);

            });
        },
        bindComplete: function () {
            $("#btn_complete").on("click", async function () {
                const validator = NotarizationRequestDetailPage.variables.stepValidators[NotarizationRequestDetailPage.variables.lastStepIndex - 1];
                validator.clearErrors();
                const result = await validator.validate();
                if (!result.isValid) {
                    result.errorMessages.forEach(({ element, messages }) => {
                        validator.defaultRenderError(element, messages[0]);
                    });
                } else {
                    const saveFunc = NotarizationRequestDetailPage.variables.stepSaveFunctions[NotarizationRequestDetailPage.variables.lastStepIndex];
                    await saveFunc();
                }
            });
        },
        loadRelatedData: async function () {
            await getCurrentUser();
            //Nếu không phải các role cho phép tạo hợp đồng công chứng thì cho out luôn
            if (NotarizationRequestDetailPage.variables.id == 0 && !canSaveStep(NotarizationRequestDetailPage.variables.steps.step1, NotarizationRequestDetailPage.variables.currentUserRoles, false)) {
                AppSettings.mainElements.PAGE_CONTENT.addClass("d-none");
                AppSettings.mainElements.NOT_FOUND.removeClass("d-none");
                return;
            }
            AppSettings.mainElements.GLOBAL_LOADER.addClass("show");
            await Promise.all([
                loadDataProvince(),
                loadDataRequestType(),
                loadDataNotarizationBook(),
                loadDataPaymentMethod(),
                loadDocumentCategoryList(),
                loadDataStaff()
            ]);
            await loadRelatedDetail(); // This will execute after all the above functions complete
            AppSettings.mainElements.GLOBAL_LOADER.removeClass("show");
        },
        bindChangeDocumentStep3: function () {
            $('#step3_document_confirm').on("change", async function () {
                const isChecked = $(this).is(":checked");
                $('#step3_contract_template').toggleClass('d-none', !isChecked);
            });
            $('#step3_document_confirmed').on("change", async function () {
                const isChecked = $(this).is(":checked");
                if (isChecked == true) {
                    $('#step3_contract_template').toggleClass('d-none', isChecked);
                }
            });
        },
        bindAddSubmittedDocument: function () {
            $("#form_step2").on("click", ".step2_add_document_forparty", function () {
                const tempId = crypto.randomUUID(); // ID tạm thời duy nhất cho mỗi khối
                const target = $(this).data("forparty");
                const html = `
                    <div class="step2-documentNecessary-item pb-12px border-bottom-custom"
                         data-submitdoc-id="${tempId}" 
                         data-other-document-forparty="true"
                         data-required="false"
                         data-submitted="false"
                         data-fileupload-id=""
                         data-doc-type="ORIGINAL"
                         data-forparty="${target}">

                        <div class="d-flex flex-row gap-10px align-items-center"> 
                            <input type="text" class="form-control document-name-input mw-300px" placeholder="Nhập tên tài liệu" />
                            <input type="file" class="form-upload-file d-none" accept="application/pdf,image/jpeg,image/png,image/jpg" multiple data-doc-id="${tempId}" />
                             <select class="form-select w-fit-content document-type-select" data-type="document-type" data-doc-id="${tempId}">
                                    <option value="ORIGINAL" selected>Bản gốc</option>
                                    <option value="COPY">Bản copy</option>
                                    <option value="NOTARIZED">Bản đã công chứng</option>
                             </select>
                            <button type="button" class="btn btn-light-primary btn-trigger-upload" data-doc-id="${tempId}">
                                <i class="ki-duotone ki-file-up fs-2"><span class="path1"></span><span class="path2"></span></i>
                                <span>Tải lên</span>
                            </button>
                            <button type="button" class="btn btn-icon btn-light-danger btn-remove-document" title="Xoá tài liệu">
                                <i class="ki-duotone ki-trash fs-2"><span class="path1"></span><span class="path2"></span></i>
                            </button>
                        </div>
                        <div class="submitted-pdf d-flex flex-column"></div>
                        <div class="submitted-img d-flex flex-row gap-10px flex-wrap"></div>
                    </div>
                    `;
                $(`.step2-list-document-forparty[data-target='${target}']`).append(html);

                // Re-init select2 nếu cần
                $(".step2-list-document-forparty .document-type-select").last().select2({
                    language: currentLang,
                    placeholder: 'Chọn loại tài liệu',
                    width: 'auto',
                    dropdownAutoWidth: true
                });

            });
        },
        bindAddOtherDocument: function () {
            $("#step2_add_document").on("click", function () {
                const tempId = crypto.randomUUID(); // ID tạm thời duy nhất cho mỗi khối

                const html = `
                    <div class="step2-documentNecessary-item pb-12px border-bottom-custom"
                         data-submitdoc-id="${tempId}" 
                         data-other-document="true"
                         data-required="false"
                         data-submitted="false"
                         data-fileupload-id=""
                         data-doc-type="ORIGINAL"
                         data-forparty="Bên A">

                        <div class="d-flex flex-row gap-10px align-items-center"> 
                            <input type="text" class="form-control document-name-input mw-300px" placeholder="Nhập tên tài liệu" />
                            <input type="file" class="form-upload-file d-none" accept="application/pdf,image/jpeg,image/png,image/jpg" multiple data-doc-id="${tempId}" />
                             <select class="form-select w-fit-content document-type-select" data-type="document-type" data-doc-id="${tempId}">
                                    <option value="ORIGINAL" selected>Bản gốc</option>
                                    <option value="COPY">Bản copy</option>
                                    <option value="NOTARIZED">Bản đã công chứng</option>
                             </select>
                             <select class="form-select w-fit-content document-forparty-select" data-type="forparty" data-doc-id="${tempId}">
                                    <option value="Bên A" selected>Bên A</option>
                                    <option value="Bên B">Bên B</option>
                                    <option value="Cả hai">Cả hai</option>
                                    <option value="Người làm chứng">Người làm chứng</option>
                                    <option value="Người phiên dịch">Người phiên dịch</option>
                                    <option value="Người yêu cầu công chứng">Người yêu cầu công chứng</option>
                             </select>
                            <button type="button" class="btn btn-light-primary btn-trigger-upload" data-doc-id="${tempId}">
                                <i class="ki-duotone ki-file-up fs-2"><span class="path1"></span><span class="path2"></span></i>
                                <span>Tải lên</span>
                            </button>
                            <button type="button" class="btn btn-icon btn-light-danger btn-remove-document" title="Xoá tài liệu">
                                <i class="ki-duotone ki-trash fs-2"><span class="path1"></span><span class="path2"></span></i>
                            </button>
                        </div>
                        <div class="submitted-pdf d-flex flex-column"></div>
                        <div class="submitted-img d-flex flex-row gap-10px flex-wrap"></div>
                    </div>
                    `;

                $(".step2-list-document-other").append(html);

                // Re-init select2 nếu cần
                $(".step2-list-document-other .document-type-select").last().select2({
                    language: currentLang,
                    placeholder: 'Chọn loại tài liệu',
                    width: 'auto',
                    dropdownAutoWidth: true
                });

                $(".step2-list-document-other .document-forparty-select").last().select2({
                    language: currentLang,
                    placeholder: 'Chọn đối tượng',
                    width: 'auto',
                    dropdownAutoWidth: true
                });
            });
        },
        bindClickRejectRequestEvent: function () {
            $(".reject-button").on("click", "button[data-kt-stepper-action=cancel]", function () {
                const id = NotarizationRequestDetailPage.variables.id;
                if (id > 0) {
                    rejectNotarizationRequest();
                }
            });
        },
        bindChangeCheckOutsideLocationStep4: function () {
            $('#step4_check_outside').on("change", async function () {
                const isChecked = $(this).is(":checked");
                $('.step4-outside-info').toggleClass('d-none', !isChecked);
            })
        },
        bindSelectedDocumentCategory: function () {
            $("#form_step1").on("change", "#step1_documentCategoryId", async function () {
                if (NotarizationRequestDetailPage.variables.isLoadingDetail) return;
                await loadDocumentTypeByDocumentCategoryId($(this).val());
            });
        },
        //upload fiel cccd
        bindUploadFileIdentity: function () {
            $('#btn_upload_identity_front').on('click', function () {
                $('#citizen_front_input').click();
            });

            $('#citizen_front_img').on('click', function () {
                $('#citizen_front_input').click();
            });

            $('#btn_upload_identity_back').on('click', function () {
                $('#citizen_back_input').click();
            });

            $('#citizen_back_img').on('click', function () {
                $('#citizen_back_input').click();
            });

            // Xử lý sự kiện khi có file được chọn cho mặt trước
            $('#citizen_front_input').on('change', async function () {
                const file = this.files;
                if (!file) return;
                const result = await uploadFile(file, AppSettings.fileCategoryUpload.IDENTITY_CARD, true, true);
                $(this).val('');
                try {
                    //bắn url vào ảnh
                    $("#citizen_front_img").attr("src", result.fileUrl);
                    $("#addUser_frontOfIdentityCardFileId").val(result.id);
                    //load data orc text vào ô
                    const ocrText = result.ocrText;
                    $("#addUser_identityNumber").val(ocrText.so_cccd);
                    $("#addUser_gender").val(ocrText.gioi_tinh).trigger("change");
                    $("#addUser_dateOfBirth").val(ocrText.ngay_sinh).trigger("change");
                    $("#addUser_nationality").val((ocrText.quoc_tich != null && ocrText.quoc_tich != "") ? ocrText.quoc_tich : "Việt Nam");
                    ocrText.ho_ten = AppUtils.capitalizeWords(ocrText.ho_ten);
                    const fullNameArr = ocrText.ho_ten.split(" ");
                    if (fullNameArr.length > 0) {
                        $("#addUser_lastName").val(fullNameArr[fullNameArr.length - 1]);
                        fullNameArr.splice(fullNameArr.length - 1, 1);
                        $("#addUser_firstName").val(fullNameArr.join(" "));
                    }
                } catch (e) {
                    console.log(e)
                }
            });

            // Xử lý sự kiện khi có file được chọn cho mặt sau
            $('#citizen_back_input').on('change', async function () {
                const file = this.files;
                if (!file) return;
                const result = await uploadFile(file, AppSettings.fileCategoryUpload.IDENTITY_CARD, false, true);
                $(this).val('');
                try {
                    $("#citizen_back_img").attr("src", result.fileUrl);
                    $("#addUser_backOfIdentityCardFileId").val(result.id);
                } catch (e) {
                    console.log(e)
                }
            });
        },
        bindDownloadQrStep3: function () {
            $("#btn_download_qr").on("click", function () {
                const base64Image = $("#step3_request_qrCode img").attr("src");
                const link = document.createElement("a");
                link.href = base64Image;
                link.download = "qr-code.png"; // Tên file khi tải về
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            });
        },
        bindClickCheckPubEvent: function () {
            $("#check-pub").on("click", async function () {
                const modalEl = document.getElementById("signModal");
                const modalInstance = bootstrap.Modal.getInstance(modalEl);
                //modalInstance.hide(); // Ẩn modal gốc

                try {
                    const { value: userId } = await Swal.fire({
                        title: "Nhập User ID",
                        input: "text",
                        inputLabel: "Nhập mã hoặc ID người dùng để tra cứu chứng thư số",
                        inputPlaceholder: "VD: ICA.12345678",
                        showCancelButton: true,
                        confirmButtonText: "Tiếp tục",
                        cancelButtonText: "Hủy bỏ",
                        inputValidator: (value) => {
                            if (!value) return "Bạn cần nhập User ID!";
                        },
                        ...AppSettings.sweetAlertOptions(true)
                    });

                    if (!userId) {
                        //modalInstance.show();
                        return;
                    }

                    $("#global_loader").addClass("show");
                    NotarizationRequestDetailPage.variables.cert_user_id = userId; // Lưu ID người dùng để sử dụng sau này
                    const response = await httpService.getAsync(ApiRoutes.NotarizationRequest.v1.GetCertificatePub(userId));
                    $("#global_loader").removeClass("show");

                    if (!response.isSucceeded) {
                        throw new Error(response.message || "Lỗi không xác định khi lấy chứng thư số");
                    }

                    const data = response.resources;

                    const htmlTable = `
                        <style>
                          .cert-table {
                            width: 100%;
                            border-collapse: collapse;
                            font-size: 14px;
                            table-layout: fixed;
                          }
                          .cert-table th, .cert-table td {
                            padding: 10px;
                            border: 1px solid #ccc;
                            vertical-align: top;
                            word-wrap: break-word;
                          }
                          .cert-table th {
                            background: #f0f2f5;
                            font-weight: bold;
                            text-align: center;
                          }
                          .cert-table td {
                            text-align: left;
                          }
                          .cert-radio {
                            text-align: center !important;
                          }
                          .cert-radio input {
                            transform: scale(1.2);
                            cursor: pointer;
                          }
                        </style>
                        <table class="cert-table">
                          <thead>
                            <tr>
                              <th style="width: 40px;">#</th>
                              <th style="width: 200px;">Số serial</th>
                              <th>Thông tin chính</th>
                              <th style="width: 60px;">Chọn</th>
                            </tr>
                          </thead>
                          <tbody>
                            ${data.map((item, index) => `
                              <tr>
                                <td style="text-align:center;">${index + 1}</td>
                                <td>${item.cert_serial}</td>
                                <td>
                                  <strong>${item.name}</strong><br/>
                                  CCCD: ${item.cert_tax_code}<br/>
                                </td>
                                <td class="cert-radio">
                                  <input type="radio" name="cert-choice" value="${index}" ${index === 0 ? "checked" : ""}>
                                </td>
                              </tr>
                            `).join("")}
                          </tbody>
                        </table>
                    `;

                    const { isConfirmed, value: selectedCert } = await Swal.fire({
                        title: "Thông tin chứng thư số",
                        html: htmlTable,
                        showCancelButton: false,
                        confirmButtonText: "Đồng ý",
                        width: "850px",
                        preConfirm: () => {
                            const selectedIndex = $("input[name='cert-choice']:checked").val();
                            const cert = data[selectedIndex];

                            // Kiểm tra nếu đã tồn tại vùng ký với chứng thư này
                            const alreadyAdded = NotarizationRequestDetailPage.variables.insertCertToPdf.some(
                                ($el) => $el.data("cert-serial") === cert.cert_serial
                            );

                            if (alreadyAdded) {
                                Swal.showValidationMessage("Chứng thư này đã được thêm vùng ký!");
                                return false;
                            }

                            return cert;
                        },
                        ...AppSettings.sweetAlertOptions(false)
                    });

                    if (isConfirmed && selectedCert) {
                        NotarizationRequestDetailPage.variables.selectCert = selectedCert;
                        updateSignatureBoxData(selectedCert);
                    }
                } catch (err) {
                    $("#global_loader").removeClass("show");
                    toastr.error(err.responseJSON?.message || err.message || "Lỗi khi lấy thông tin chứng thư số. Vui lòng thử lại sau.");
                }

                //modalInstance.show(); // Hiện lại modal sau tất cả
            });
            $("#sign-pub").on("click", async function () {
                const certInstances = NotarizationRequestDetailPage.variables.insertCertToPdf;

                if (certInstances.length === 0) {
                    toastr.error("Vui lòng chọn mẫu ký trước khi ký văn bản!");
                    return;
                }

                const selectedCert = NotarizationRequestDetailPage.variables.selectCert;
                if (!selectedCert) {
                    toastr.error("Chưa có thông tin chứng thư số!");
                    return;
                }

                const userId = NotarizationRequestDetailPage.variables.cert_user_id;
                const fileBlob = NotarizationRequestDetailPage.variables.cert_file;

                if (!userId || !fileBlob) {
                    toastr.error("Thiếu thông tin user ID hoặc file cần ký!");
                    return;
                }

                try {

                    $("#global_loader").addClass("show");

                    const signatureInfos = [];

                    $(".signature-instance").each(function () {
                        const $sig = $(this);

                        // Kiểm tra chứng thư
                        if ($sig.data("cert-serial") !== selectedCert.cert_serial) return;

                        const sigRect = this.getBoundingClientRect();

                        $(".pdf-page-wrapper").each(function (index) {
                            const $page = $(this);
                            const canvas = $page.find("canvas")[0];
                            const canvasRect = canvas.getBoundingClientRect();

                            // Nếu chữ ký nằm trong canvas trang
                            if (
                                sigRect.top >= canvasRect.top &&
                                sigRect.bottom <= canvasRect.bottom &&
                                sigRect.left >= canvasRect.left &&
                                sigRect.right <= canvasRect.right
                            ) {
                                const relativeLeft = sigRect.left - canvasRect.left;
                                const relativeTop = sigRect.top - canvasRect.top;

                                const width = sigRect.width;
                                const height = sigRect.height;

                                const x1 = relativeLeft;
                                const y1 = relativeTop;
                                const x2 = x1 + width;
                                const y2 = y1 + height;

                                // 💡 Chuyển tọa độ gốc bottom-left (PDF gốc)
                                const pageHeight = canvas.height; // đơn vị point (pt) vì scale = 1
                                const pdfY1 = pageHeight - y2;
                                const pdfY2 = pageHeight - y1;

                                const coordinate = `${Math.round(x1)},${Math.round(pdfY1)},${Math.round(x2)},${Math.round(pdfY2)}`;

                                signatureInfos.push({
                                    pageNo: index + 1,
                                    coorDinate: coordinate
                                });

                                return false; // Dừng mỗi trang sau khi tìm thấy
                            }
                        });
                    });

                    const formData = new FormData();
                    formData.append("user_id", userId);
                    formData.append("certificate.key_id", selectedCert.key_id || "");
                    formData.append("certificate.cert_serial", selectedCert.cert_serial || "");
                    formData.append("certificate.cert_content", selectedCert.cert_content || "");
                    formData.append("file", fileBlob);
                    formData.append("pageNo", signatureInfos[0].pageNo);
                    formData.append("coorDinate", signatureInfos[0].coorDinate);

                    const response = await httpService.postFormDataAsync(ApiRoutes.NotarizationRequest.v1.SignPub, formData);

                    if (!response.isSucceeded) {
                        toastr.error(response.message || "Có lỗi xảy ra khi ký văn bản!");
                    } else {
                        toastr.success("Ký văn bản thành công!");
                        openBase64PdfInNewTab(response.resources[0].content_file);
                    }

                } catch (err) {
                    if (err.responseJSON) {
                        toastr.error(err.responseJSON.message || "Có lỗi khi ký văn bản!");
                    }
                    else {
                        toastr.error("Có lỗi khi ký văn bản!");
                    }
                } finally {
                    $("#global_loader").removeClass("show");
                }
            });
            $("#remove-sign-pub").on("click", function () {
                $(".pdf-page-wrapper .signature-instance").remove();
                if (NotarizationRequestDetailPage.variables.insertCertToPdf.length == 0) {
                    toastr.info("Không có vùng ký nào được thêm vào văn bản.");
                }
                NotarizationRequestDetailPage.variables.insertCertToPdf = [];
            });
            $(".signature-box").on("click", function () {
                const selectedCert = NotarizationRequestDetailPage.variables.selectCert;

                if (!selectedCert) {
                    toastr.error("Vui lòng chọn chứng thư số trước khi ký!");
                    return;
                }

                const existingIndex = NotarizationRequestDetailPage.variables.insertCertToPdf.findIndex(
                    ($el) => $el.data("cert-serial") === selectedCert.cert_serial
                );

                const $newClone = $(this).clone()
                    .removeClass("signature-box")
                    .addClass("signature-instance")
                    .css({
                        position: "absolute",
                        top: "100px",
                        left: "100px",
                        width: "250px",
                        cursor: "move",
                        zIndex: 10,
                        background: "#fff"
                    })
                    .data("cert-serial", selectedCert.cert_serial);

                makeDraggable($newClone[0]);

                const $pageWrapper = $(".pdf-page-wrapper").first();

                if (existingIndex !== -1) {
                    const $old = NotarizationRequestDetailPage.variables.insertCertToPdf[existingIndex];
                    $old.remove();
                    $pageWrapper.append($newClone);
                    NotarizationRequestDetailPage.variables.insertCertToPdf[existingIndex] = $newClone;
                } else {
                    $pageWrapper.append($newClone);
                    NotarizationRequestDetailPage.variables.insertCertToPdf.push($newClone);
                }

                // 👉 Giả lập click để kéo luôn sau khi thêm vào
                setTimeout(() => {
                    const rect = $newClone[0].getBoundingClientRect();

                    // Dispatch mouse event tại vị trí giữa chữ ký
                    const event = new MouseEvent("mousedown", {
                        bubbles: true,
                        clientX: rect.left + rect.width / 2,
                        clientY: rect.top + rect.height / 2,
                    });

                    $newClone[0].dispatchEvent(event);
                }, 50);
            });
        }
    }
    //[Step1]
    //Chỉ dùng khi previous về step1
    async function initStep1() {
        if (NotarizationRequestDetailPage.variables.id != 0) {
            try {
                const response = await httpService.getAsync(ApiRoutes.NotarizationRequest.v1.Detail(NotarizationRequestDetailPage.variables.id));
                if (response?.isSucceeded) {
                    $(".footer-notarization-request button[data-kt-stepper-action=next]").attr("disabled", false);

                    NotarizationRequestDetailPage.variables.isLoadingDetail = true;
                    let data = response.resources;

                    //Lấy khóa phụ
                    $("#step1_documentCategoryId").append(new Option(data.documentCategory.name, data.documentCategory.id, false, false)).val(data.documentCategory.id).trigger("change");
                    $("#step1_documentTypeId").append(new Option(data.documentType.name, data.documentType.id, false, false)).val(data.documentType.id).trigger("change");
                    $("#step1_requestTypeId").val(data.notarizationRequestType.id).trigger("change");
                    $("#step1_transactionValue").val(AppUtils.numberWithCommas(data.transactionValue));
                    $("#step1_user_id").append(new Option(data.requester.name, data.requester.id, false, false)).val(data.requester.id).trigger("change");
                    $("#step1_notaryPhoneNumber").val(data.notaryPhoneNumber);


                    //gán vào biến toàn cục
                    NotarizationRequestDetailPage.variables.id = data.id;
                    NotarizationRequestDetailPage.variables.documentTypeId = data.documentType.id;
                    NotarizationRequestDetailPage.variables.requesterId = data.requester.id;
                    NotarizationRequestDetailPage.variables.notaryPhoneNumber = data.notaryPhoneNumber;
                    NotarizationRequestDetailPage.variables.requestTypeId = data.notarizationRequestType.id;
                    NotarizationRequestDetailPage.variables.statusId = data.notarizationRequestStatus.id;


                    //NotarizationRequestDetailPage.variables.staffId = data.staff.id;


                    //// Lấy phần fee
                    //if (data.feeRecords.length > 0) {
                    //    const $repeater = $('#kt_docs_repeater_other_fee');
                    //    const $repeaterList = $repeater.find('[data-repeater-list]');
                    //    const $template = $repeater.find('[data-repeater-item]').first().clone();

                    //    // Xóa hết item cũ (nếu cần)
                    //    $repeaterList.empty();

                    //    // Add từng item
                    //    data.feeRecords.forEach(item => {
                    //        // Nếu là phí ngoài thì mới add
                    //        if (item.type === AppSettings.feeRecordType.ADDITIONAL_SERVICE_FEE) {
                    //            const $newItem = $template.clone();
                    //            $newItem.find('input[name$="[otherFee-name]"]').val(item.name);
                    //            $newItem.find('input[name$="[otherFee-description]"]').val(item.description ?? '');
                    //            $newItem.find('input[name$="[otherFee-amount]"]').val(AppUtils.numberWithCommas(item.amount));
                    //            $repeaterList.append($newItem);
                    //        }
                    //    });
                    //}




                    //Lấy thông tin người tạo
                    $("#step1_creator_name").text(data.createdUser.fullName),
                        $("#step1_creator_phoneNumber").text(data.createdUser.phoneNumber ?? "---");
                    $("#step1_creator_identityNumber").text(data.createdUser.identityNumber ?? "---");
                    $("#step1_creator_officeName").text(data.office.name);
                    $("#step1_creator_officeAddress").text(data.office.address);
                    $("#step1_creator_officePhoneNumber").text(data.office.phone ?? "---");
                    const roleNames = data.createdUser.roles.map(r => r.name).join(", ");
                    $("#step1_creator_position").text(roleNames || "---");




                    ////Giá trị tài sản
                    //$("#footer_transactionValue").text(AppUtils.numberWithCommas(data.transactionValue));

                    ////Phí công chứng
                    //let feeRecordNotarizationFee = data.feeRecords.find(x => x.type === AppSettings.feeRecordType.FIXED_FEE).amount || 0;
                    //$("#footer_notarizationFee").text(AppUtils.numberWithCommas(feeRecordNotarizationFee));
                    //$("#step1_fee_notarizationFee").text(AppUtils.numberWithCommas(feeRecordNotarizationFee));

                    ////Thù lao công chứng
                    //let feeRecordRemunerationFee = data.feeRecords.find(x => x.type === AppSettings.feeRecordType.SERVICE_FEE).amount || 0;
                    //$("#footer_remunerationFee").text(AppUtils.numberWithCommas(feeRecordRemunerationFee));
                    //$("#step1_fee_remunerationFee").text(AppUtils.numberWithCommas(feeRecordRemunerationFee));

                    ////Phí khác
                    //$("#footer_otherFees").text(
                    //    AppUtils.numberWithCommas(
                    //        data.feeRecords
                    //            .filter(x => x.type == AppSettings.feeRecordType.ADDITIONAL_SERVICE_FEE)
                    //            .reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
                    //    )
                    //);

                    //Lấy ra submit documents thay vì required documents cho những hợp đồng đã tạo
                    let responseSubmitedDocuments = await httpService.getAsync(ApiRoutes.NotarizationRequest.v1.ListSubmitedDocuments(NotarizationRequestDetailPage.variables.id));
                    if (responseSubmitedDocuments?.isSucceeded) {
                        renderDocumentNecessary(responseSubmitedDocuments.resources.requiredDocuments);
                    }

                    //disabled các nút bấm, input
                    NotarizationRequestDetailPage.variables.isLoadingDetail = false;
                    if (NotarizationRequestDetailPage.variables.currentStep > 1) {
                        $(".reject-button").addClass("d-none");
                    }

                    return true;
                }
            } catch (e) {
                if (NotarizationRequestDetailPage.variables.currentStep > 1) {
                    $(".reject-button").addClass("d-none");
                }

                return false;
            }
        }
    }

    //get current roles
    async function getCurrentUser() {
        const response = await httpService.getAsync(ApiRoutes.Auth.v1.GetCurrentUser);
        if (response?.isSucceeded) {
            NotarizationRequestDetailPage.variables.currentUserRoles = response.resources.userRoleIds;
            NotarizationRequestDetailPage.variables.currentUserOfficeId = response.resources.officeId ?? 0;
            NotarizationRequestDetailPage.variables.currentUserId = response.resources.userId ?? 0;

        }
    }

    async function loadRelatedDetail() {
        if (NotarizationRequestDetailPage.variables.id != 0) {
            try {
                const response = await httpService.getAsync(ApiRoutes.NotarizationRequest.v1.Detail(NotarizationRequestDetailPage.variables.id));
                if (response?.isSucceeded) {
                    NotarizationRequestDetailPage.variables.isLoadingDetail = true;
                    let data = response.resources;
                    if (NotarizationRequestDetailPage.variables.currentUserOfficeId != data.office.id && !NotarizationRequestDetailPage.variables.currentUserRoles.includes(AppSettings.roles.ADMIN)) {
                        AppSettings.mainElements.PAGE_CONTENT.addClass("d-none");
                        AppSettings.mainElements.NOT_FOUND.removeClass("d-none");
                    }

                    //Lấy khóa phụ
                    $("#step1_documentTypeId").append(new Option(data.documentType.name, data.documentType.id, false, false)).val(data.documentType.id).trigger("change");
                    $("#step1_requestTypeId").val(data.notarizationRequestType.id).trigger("change");
                    $("#step1_transactionValue").val(AppUtils.numberWithCommas(data.transactionValue));
                    $("#step1_user_id").append(new Option(data.requester.name, data.requester.id, false, false)).val(data.requester.id).trigger("change");
                    $("#step1_notaryPhoneNumber").val(data.notaryPhoneNumber);


                    //gán vào biến toàn cục
                    NotarizationRequestDetailPage.variables.id = data.id;
                    NotarizationRequestDetailPage.variables.documentTypeId = data.documentType.id;
                    NotarizationRequestDetailPage.variables.requesterId = data.requester.id;
                    NotarizationRequestDetailPage.variables.notaryPhoneNumber = data.notaryPhoneNumber;
                    NotarizationRequestDetailPage.variables.requestTypeId = data.notarizationRequestType.id;
                    NotarizationRequestDetailPage.variables.statusId = data.notarizationRequestStatus.id;
                    NotarizationRequestDetailPage.variables.staffId = data.staft ? data.staff.id : 0;
                    NotarizationRequestDetailPage.variables.notarizationRequestOfficeId = data.office.id;


                    //// Lấy phần phí khác
                    //if (data.feeRecords.length > 0) {
                    //    const $repeater = $('#kt_docs_repeater_other_fee');
                    //    const $repeaterList = $repeater.find('[data-repeater-list]');
                    //    const $template = $repeater.find('[data-repeater-item]').first().clone();

                    //    // Xóa hết item cũ (nếu cần)
                    //    $repeaterList.empty();

                    //    // Add từng item
                    //    data.feeRecords.forEach(item => {
                    //        // Nếu là phí ngoài thì mới add
                    //        if (item.type === AppSettings.feeRecordType.ADDITIONAL_SERVICE_FEE) {
                    //            const $newItem = $template.clone();
                    //            $newItem.find('input[name$="[otherFee-name]"]').val(item.name);
                    //            $newItem.find('input[name$="[otherFee-description]"]').val(item.description ?? '');
                    //            $newItem.find('input[name$="[otherFee-amount]"]').val(AppUtils.numberWithCommas(item.amount));
                    //            $repeaterList.append($newItem);
                    //        }
                    //    });
                    //}

                    //Lấy người tạo
                    $("#step1_creator_name").text(data.createdUser.fullName),
                        $("#step1_creator_phoneNumber").text(data.createdUser.phoneNumber ?? "---");
                    $("#step1_creator_identityNumber").text(data.createdUser.identityNumber ?? "---");
                    $("#step1_creator_officeName").text(data.office.name);
                    $("#step1_creator_officeAddress").text(data.office.address);
                    $("#step1_creator_officePhoneNumber").text(data.office.phone ?? "---");
                    const roleNames = data.createdUser.roles.map(r => r.name).join(", ");
                    $("#step1_creator_position").text(roleNames || "---");





                    ////Giá trị tài sản
                    //$("#footer_transactionValue").text(AppUtils.numberWithCommas(data.transactionValue));

                    ////Phí công chứng
                    //let feeRecordNotarizationFee = data.feeRecords.find(x => x.type === AppSettings.feeRecordType.FIXED_FEE).amount || 0;
                    //$("#footer_notarizationFee").text(AppUtils.numberWithCommas(feeRecordNotarizationFee));
                    //$("#step1_fee_notarizationFee").text(AppUtils.numberWithCommas(feeRecordNotarizationFee));

                    ////Thù lao công chứng
                    //let feeRecordRemunerationFee = data.feeRecords.find(x => x.type === AppSettings.feeRecordType.SERVICE_FEE).amount || 0;
                    //$("#footer_remunerationFee").text(AppUtils.numberWithCommas(feeRecordRemunerationFee));
                    //$("#step1_fee_remunerationFee").text(AppUtils.numberWithCommas(feeRecordRemunerationFee));

                    ////Phí khác
                    //$("#footer_otherFees").text(
                    //    AppUtils.numberWithCommas(
                    //        data.feeRecords
                    //            .filter(x => x.type == AppSettings.feeRecordType.ADDITIONAL_SERVICE_FEE)
                    //            .reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
                    //    )
                    //);

                    //Lấy ra submit documents thay vì required documents cho những hợp đồng đã tạo
                    let responseSubmitedDocuments = await httpService.getAsync(ApiRoutes.NotarizationRequest.v1.ListSubmitedDocuments(NotarizationRequestDetailPage.variables.id));
                    if (responseSubmitedDocuments?.isSucceeded) {
                        renderDocumentNecessary(responseSubmitedDocuments.resources.requiredDocuments);
                    }

                    ////đi đến step đang thực hiện
                    NotarizationRequestDetailPage.variables.currentStep = data.currentStep;
                    NotarizationRequestDetailPage.variables.stepper.goTo(data.currentStep);
                    await initStep(data.currentStep);

                    //Nếu step lớn hơn 2 thì check vào ô checkbox, step 4
                    if (data.currentStep > 2) {
                        $("#step2_requester_confirm").prop("checked", true).trigger("change");
                    }

                    //Nếu step lớn hơn 2 thì check vào ô checkbox, step 4
                    if (data.currentStep > 4) {
                        $("#step4_sign_confirm").prop("checked", true).trigger("change");
                    }

                    //disabled các nút bấm, input
                    NotarizationRequestDetailPage.variables.isLoadingDetail = false;
                    disableFormControls("#form_step1");
                }
                else {
                    AppSettings.mainElements.PAGE_CONTENT.addClass("d-none");
                    AppSettings.mainElements.NOT_FOUND.removeClass("d-none");
                }
            } catch (e) {
                AppSettings.mainElements.PAGE_CONTENT.addClass("d-none");
                AppSettings.mainElements.NOT_FOUND.removeClass("d-none");
            }
        }
        //case tạo
        else {
            try {
                //Lấy thông tin nhân viên tạo
                const response = await httpService.getAsync(ApiRoutes.StaffManagement.v1.Me);
                if (response?.isSucceeded) {
                    let data = response.resources;
                    //Lấy phần thông tin các bên liên quan
                    $("#step1_creator_name").text(data.fullName),
                        $("#step1_creator_phoneNumber").text(data.phoneNumber ?? "---");
                    $("#step1_creator_identityNumber").text(data.identityNumber ?? "---");
                    $("#step1_creator_officeName").text(data.office.name);
                    $("#step1_creator_officeAddress").text(data.office.address);
                    $("#step1_creator_officePhoneNumber").text(data.office.phone ?? "---");

                    //lấy role
                    const roleNames = data.roles.map(r => r.name).join(", ");
                    $("#step1_creator_position").text(roleNames || "---");

                }
            } catch (e) {

            }
        }
    }
    function addItemUser() {
        NotarizationRequestDetailPage.formValidatorAddUser.clearErrors();
        $("#kt_modal_addUser_header h2").text(`${NotarizationRequestDetailPage.messageAddUser.create} ${NotarizationRequestDetailPage.messageAddUser.pageTitle.toLocaleLowerCase()}`);
        $("#kt_modal_addUser_form input[type='text'], #kt_modal_addUser_form input[type='password'],#kt_modal_addUser_form textarea, #kt_modal_addUser_form select").val("").trigger("change");
        $("#addUser_createdDate").val(moment().format("DD/MM/YYYY HH:mm:ss")).trigger("change");


        //Xóa ảnh và các thứ
        $("#citizen_front_img").attr("src", "/admin/assets/media/pages/notarization-request-detail/citizen-front.png");
        $("#addUser_frontOfIdentityCardFileId").val(null);

        $("#citizen_back_img").attr("src", "/admin/assets/media/pages/notarization-request-detail/citizen-back.png");
        $("#addUser_backOfIdentityCardFileId").val(null);

        $("#kt_modal_addUser").modal("show");
    }

    async function saveDataAddUser() {
        //check up ảnh căn cước chưa
        if ($("#addUser_frontOfIdentityCardFileId").val() == "" || $("#addUser_backOfIdentityCardFileId").val() == "") {
            swal.fire({
                icon: 'warning',
                title: "Lưu ý ",
                text: "Vui lòng tải đủ các ảnh CCCD",
                ...AppSettings.sweetAlertOptions(false)
            });
            return;
        }

        const btnSave = $("#btn_save_addUser");
        btnSave.attr("disabled", true);

        const columns = ["username", "password", "firstName", "lastName", "phoneNumber", "email", "identityNumber", "provinceId", "districtId", "wardId", "addressDetail", "taxCode", "nationality", "dateOfBirth", "frontOfIdentityCardFileId", "backOfIdentityCardFileId"];
        const data = {};
        columns.forEach(key => {
            const selector = `#addUser_${key}`;
            data[key] = $(selector).val();
        });
        const genderMap = { "Nam": 1, "Nữ": 0, "Khác": 2 };
        data["gender"] = genderMap[$("#addUser_gender").val()] ?? null;

        //Lấy email theo CCCD nếu không nhập
        const emailInput = $("#addUser_email").val().trim();
        const identity = $("#addUser_identityNumber").val().trim();
        data["email"] = emailInput !== "" ? emailInput : `${identity}@congchungso.net`;
        //password lấy random
        data["password"] = generatePassword(12);
        data["username"] = identity;

        const confirmText = NotarizationRequestDetailPage.messageAddUser.createConfirm;
        const { isConfirmed } = await Swal.fire({
            icon: 'question',
            title: NotarizationRequestDetailPage.messageAddUser.confirmTittle,
            html: confirmText,
            ...AppSettings.sweetAlertOptions(true)
        });

        if (isConfirmed) {
            btnSave.attr("data-kt-indicator", "on");
            try {
                const response = await httpService.postAsync(ApiRoutes.Auth.v1.AdminCreateEndUser, data);
                if (response?.isSucceeded) {
                    $("#kt_modal_addUser").modal("hide");
                    const successText = NotarizationRequestDetailPage.messageAddUser.createSuccess
                    Swal.fire({
                        icon: "success",
                        title: NotarizationRequestDetailPage.messageAddUser.successTitle,
                        html: successText,
                        ...AppSettings.sweetAlertOptions(false)
                    });
                    //Trigger change data userid
                    await loadDataCustomer(response.resources);
                }

            } catch (e) {
                AppUtils.handleApiError(e, {
                    action: "create",
                    name: NotarizationRequestDetailPage.messageAddUser.pageTitle,
                    isShowAlert: true
                })
            }
            finally {
                btnSave.removeAttr("data-kt-indicator");
            }
        }
        btnSave.removeAttr("disabled");
    }
    function resetDataUser() {
        NotarizationRequestDetailPage.formValidatorAddUser.clearErrors();
        $("#step1_customer_component input[type='text'],#step1_customer_component textarea, #step1_customer_component select").val("").trigger("change");
    }

    async function loadDataProvince() {
        try {
            const response = await httpService.getAsync(ApiRoutes.Province.v1.List);
            const data = response.resources;
            data.forEach(function (item) {
                $("#addUser_provinceId").append(new Option(item.name, item.id, false, false));
            });
        } catch (e) {
            console.error(e);
        }
    }

    async function loadDataNotarizationBook() {
        try {
            const response = await httpService.getAsync(ApiRoutes.NotarizationBook.v1.ListByOffice);
            const data = response.resources;
            data.forEach(function (item) {
                $("#step6_notarizationBookId").append(new Option(item.name, item.id, false, false));
            });
        } catch (e) {
            console.error(e);
        }
    }

    async function loadDataRequestType() {
        try {
            const response = await httpService.getAsync(ApiRoutes.NotarizationRequestType.v1.List);
            const data = response.resources;
            data.forEach(function (item) {
                $("#step1_requestTypeId").append(new Option(item.name, item.id, false, false));
            });
        } catch (e) {
            console.error(e);
        }
    }

    async function loadDataDistrictByProvinceId(provinceId) {
        if (!provinceId) {
            return;
        }
        try {
            $("#addUser_districtId").empty();
            $("#addUser_wardId").empty();
            const response = await httpService.getAsync(ApiRoutes.Province.v1.ListDistrictByProvinceId(provinceId));
            const data = response.resources;
            data.forEach(function (item) {
                $("#addUser_districtId").append(new Option(item.name, item.id, false, false));
            });
            $("#addUser_districtId").val("").trigger("change");
        } catch (e) {
            console.error(e);
        }
    }

    async function loadDataWardByProvinceId(provinceId) {
        if (!provinceId) {
            return;
        }
        try {
            $("#addUser_wardId").empty();
            const response = await httpService.getAsync(ApiRoutes.Province.v1.Wards(provinceId));
            const data = response.resources;
            data.forEach(function (item) {
                $("#addUser_wardId").append(new Option(item.name, item.id, false, false));
            });
            $("#addUser_wardId").val("").trigger("change")

        } catch (e) {
            console.error(e);
        }
    }

    async function loadDataCustomer(userId) {
        try {
            if (userId == 0) {
                resetDataUser();
                return;
            }
            const genderMap = { 1: "Nam", 0: "Nữ", 2: "Khác" };

            //Tìm trong cache data trước
            let userObj = NotarizationRequestDetailPage.variables.cachedUserData.find(x => x.id === parseInt(userId));
            if (userObj) {
                //Gán id user hiện tại
                $("#step1_user_fullName").val(userObj.name);
                $("#step1_user_identityNumber").val(userObj.identityNumber ?? "---");
                $("#step1_user_phoneNumber").val(userObj.phoneNumber ?? "---");
                $("#step1_user_email").val(userObj.email ?? "---");
                $("#step1_user_fullAddress").val(userObj.addressDetail ?? "---");
                //update
                $("#step1_user_gender").val(userObj.gender != null ? genderMap[userObj.gender] : "---");
                $("#step1_user_dateOfBirth").val(userObj.dateOfBirth ? moment(userObj.dateOfBirth).format("DD/MM/YYYY") : "---");
                $("#step1_user_identity_frontFileId").attr("src", userObj.frontOfIdentityCardFile ? userObj.frontOfIdentityCardFile.url : "/admin/assets/media/pages/notarization-request-detail/citizen-front.png");
                $("#step1_user_identity_backFileId").attr("src", userObj.backOfIdentityCardFile ? userObj.backOfIdentityCardFile.url : "/admin/assets/media/pages/notarization-request-detail/citizen-back.png");
            }
            //Tìm theo api
            else {
                NotarizationRequestDetailPage.variables.isLoadingUserData = true;
                let response = await httpService.getAsync(ApiRoutes.User.v1.Detail(userId));
                if (response?.isSucceeded) {
                    let data = response.resources;
                    // Set fields
                    let name = `${data.firstName} ${data.lastName}`
                    $("#step1_user_fullName").val(name);
                    $("#step1_user_identityNumber").val(data.identityNumber ?? "---");
                    $("#step1_user_phoneNumber").val(data.phoneNumber ?? "---");
                    $("#step1_user_email").val(data.email ?? "---");
                    $("#step1_user_fullAddress").val(data.addressDetail ?? "---");
                    $("#step1_user_id").append(new Option(name, userId, false, true)).trigger("change");
                    //update
                    $("#step1_user_gender").val(data.gender != null ? genderMap[data.gender] : "---");
                    $("#step1_user_dateOfBirth").val(data.dateOfBirth ? moment(data.dateOfBirth).format("DD/MM/YYYY") : "---");
                    $("#step1_user_identity_frontFileId").attr("src", data.frontOfIdentityCardFile ? data.frontOfIdentityCardFile.url : "/admin/assets/media/pages/notarization-request-detail/citizen-front.png");
                    $("#step1_user_identity_backFileId").attr("src", data.backOfIdentityCardFile ? data.backOfIdentityCardFile.url : "/admin/assets/media/pages/notarization-request-detail/citizen-back.png");

                }
            }
        } catch (e) {
            console.error(e);
            resetDataUser();
        } finally {
            NotarizationRequestDetailPage.variables.isLoadingUserData = false;
            $("#global_loader").removeClass("show");
        }
    }

    async function loadDataDocumentNecessary(documentTypeId) {
        try {
            if (documentTypeId) {
                //load theo api
                let response = await httpService.getAsync(ApiRoutes.DocumentType.v1.GetRequiredDocuments(documentTypeId));
                let data = response.resources;
                $(".step1-documentNecessary-content").html("");
                renderDocumentNecessary(data);
            }
        } catch (e) {
            $(".step1-documentNecessary-content").html("");
            console.error(e);
        }
    }

    async function tryGetFee() {
        let documentTypeId = $("#step1_documentTypeId").val();
        let transactionValue = $("#step1_transactionValue").val();
        try {
            if (documentTypeId != "" && transactionValue != "") {
                $("#global_loader").addClass("show");
                //load theo api
                let response = await httpService.getAsync(ApiRoutes.DocumentType.v1.CalculateFee(documentTypeId, transactionValue.replaceAll(".", "")));
                let data = response.resources;
                $("#step1_fee_notarizationFee").text(AppUtils.numberWithCommas(data.notarizationFee.feeAmount.toString()));
                $("#step1_fee_remunerationFee").text(AppUtils.numberWithCommas(data.remunerationFee.unitPrice.toString()));
                $("#global_loader").removeClass("show");

            }
            else {
                $("#step1_fee_notarizationFee").text("---");
                $("#step1_fee_remunerationFee").text("---");
            }
        } catch (e) {
            $("#step1_fee_notarizationFee").text("---");
            $("#step1_fee_remunerationFee").text("---");
            $("#global_loader").removeClass("show");
        }
    }

    function renderDocumentNecessary(resources) {
        let html = `
        <div class="step1-list-documentNecessary mgt-20px">
    `;
        resources.forEach((group) => {
            if (!group.forParty) {
                return; // Skip item này
            }
            html += `
            <div class="step-1-documentNecessary-title w-100">
                <h3>${group.forParty} cần cung cấp</h3>
            </div>
        `;
            group.requiredDocuments.forEach((doc, index) => {
                html += `
                <div class="step-1-documentNecessary-item d-flex flex-row gap-10px ${doc.description ? 'align-items-start' : 'align-items-center'}">
                    <p class="index-item">${index + 1}</p>
                    <div class="d-flex gap-10px flex-column documentNecessary-item">
                        <h4>${doc.name}</h4>
                        ${doc.description ? `<p>${doc.description}</p>` : ""}
                    </div>
                </div>
            `;
            });
        });

        html += `</div>`; // close step1-list-documentNecessary

        $(".step1-documentNecessary-content").html(html);
    }

    async function saveDataStep1() {
        let isSuccess = true;
        // Case: Add
        if (NotarizationRequestDetailPage.variables.id == 0) {
            // phân quyền khi thêm mới chỉ cho phép nhân viên công chứng, thư ký và quản lý cấp văn phòng
            if (!canSaveStep(NotarizationRequestDetailPage.variables.steps.step1, NotarizationRequestDetailPage.variables.currentUserRoles)) {
                isSuccess = false;
                return isSuccess;
            }
            const listOtherFee = [];
            //$('#kt_docs_repeater_other_fee [data-repeater-item]').each(function (index) {
            //    const name = $(this).find(`input[name="kt_docs_repeater_basic[${index}][otherFee-name]"]`).val();
            //    const description = $(this).find(`input[name="kt_docs_repeater_basic[${index}][otherFee-description]"]`).val();
            //    const amount = $(this).find(`input[name="kt_docs_repeater_basic[${index}][otherFee-amount]"]`).val().replaceAll(".", "") || 0;
            //    if (name !== "" && amount !== "") {
            //        listOtherFee.push({ name, description, amount });
            //    }
            //});

            const data = {
                notarizationRequestTypeId: $('#step1_requestTypeId').val(),
                requesterId: $('#step1_user_id').val(),
                documentTypeId: $('#step1_documentTypeId').val(),
                notaryPhoneNumber: $("#step1_notaryPhoneNumber").val(),
                transactionValue: $('#step1_transactionValue').val().replaceAll(".", "") || 0,
                listOtherFee,
            };

            const confirmText = NotarizationRequestDetailPage.message.createConfirm;
            const { isConfirmed } = await Swal.fire({
                icon: 'question',
                title: NotarizationRequestDetailPage.message.confirmTittle,
                html: confirmText,
                ...AppSettings.sweetAlertOptions(true)
            });

            if (isConfirmed) {
                $("#global_loader").addClass("show");
                try {
                    const response = await httpService.postAsync(ApiRoutes.NotarizationRequest.v1.Create, data);
                    if (response?.isSucceeded) {
                        const successText = NotarizationRequestDetailPage.message.createSuccess;
                        //Swal.fire({
                        //    icon: "success",
                        //    title: NotarizationRequestDetailPage.message.successTitle,
                        //    html: successText,
                        //    ...AppSettings.sweetAlertOptions(false)
                        //});
                        toastr.success(NotarizationRequestDetailPage.message.successTitle, successText);

                        //gán lại biến toán cục
                        NotarizationRequestDetailPage.variables.id = response.resources;
                        NotarizationRequestDetailPage.variables.documentTypeId = data.documentTypeId;
                        NotarizationRequestDetailPage.variables.requesterId = data.requesterId;
                        NotarizationRequestDetailPage.variables.requestTypeId = data.notarizationRequestTypeId;
                        NotarizationRequestDetailPage.variables.notaryPhoneNumber = data.notaryPhoneNumber;
                        //NotarizationRequestDetailPage.variables.staffId = ;


                        $("#footer_transactionValue").text($("#step1_transactionValue").val());
                        $("#footer_notarizationFee").text($("#step1_fee_notarizationFee").text());
                        $("#footer_remunerationFee").text($("#step1_fee_remunerationFee").text());
                        $("#footer_otherFees").text(AppUtils.numberWithCommas(
                            listOtherFee.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
                        ));

                        //Cập nhật step
                        NotarizationRequestDetailPage.variables.currentStep = 2;

                    }
                } catch (e) {
                    AppUtils.handleApiError(e, {
                        action: "create",
                        name: NotarizationRequestDetailPage.message.pageTitle,
                        isShowAlert: true
                    });
                    isSuccess = false;
                }
            }
            else {
                isSuccess = false;
            }
        }


        if (isSuccess && (isSuccess = await initStep2())) {
            disableFormControls("#form_step1");
        }
        $("#global_loader").removeClass("show");
        return isSuccess;
    }

    async function loadDocumentCategoryList() {
        try {
            const response = await httpService.getAsync(ApiRoutes.DocumentCategory.v1.List);
            const data = response.resources || [];
            let lastLabel = 0;
            data.forEach((item, index) => {
                $("#step1_documentCategoryId").append(new Option(item.name, item.id, false, false));
                if (!item.parentId) {
                    lastLabel++;
                    item.label = `${lastLabel}`;
                }
                else {
                    const parentLabel = data.find(parent => parent.id === item.parentId)?.label;
                    const index = data.filter(x => x.parentId === item.parentId).map(x => x.id).indexOf(item.id);
                    item.label = `${parentLabel}.${index + 1}`;
                }
            })

            $("#step1_documentCategoryId").select2({
                cache: true,
                placeholder: "Chọn danh mục cha",
                language: currentLang,
                templateResult: formatDocumentCategorySelectResult,
                data: data,
            });


        } catch (e) {
            console.error(e);
            $("#step1_documentCategoryId").select2({
                cache: true,
                placeholder: "Chọn danh mục cha",
                language: currentLang
            });
        }
    }
    function formatDocumentCategorySelectResult(data) {
        let html = $(`<span> </span>`);
        if (data.treeIds) {
            const level = data.treeIds.split("_").length - 1;
            html = $(`<span class="ps-${10 * level}" data-menu-parent-id="${data.id}"><span class="fw-bold">${data.label}.</span> ${data.name}</span>`);
        }
        return html;
    };

    async function loadDocumentTypeByDocumentCategoryId(documentCategoryId) {
        if (!documentCategoryId) {
            return;
        }
        try {
            $("#step1_documentTypeId").empty();
            const response = await httpService.getAsync(ApiRoutes.DocumentCategory.v1.ListDocumentByDocumentCategoryId(documentCategoryId));
            const data = response.resources;
            data.forEach(function (item) {
                $("#step1_documentTypeId").append(new Option(AppUtils.escapeHtml(item.name), item.id, false, false));
            });
            $("#step1_documentTypeId").val("").trigger("change");

        } catch (e) {
            console.error(e);
        }
    }
    //[Step2]
    async function loadDataDocumentStep2(value) {
        try {
            if (value) {
                $("#step2_upload_document").removeClass("d-none")
                $(".step2-blockingInformation").removeClass("d-none")
                //load data required documents
            }
            else {
                $("#step2_upload_document").addClass("d-none")
                $(".step2-blockingInformation").addClass("d-none")

            }
        } catch (e) {
            $("#step2_upload_document").addClass("d-none")
            $(".step2-blockingInformation").addClass("d-none")
        }
    }

    function renderSubmittedDocument(resources) {
        let html = ``;
        resources.forEach((group) => {
            if (!group.forParty) return;

            html += `<h3 class="item-category-title mt-5">${group.forParty} cần cung cấp</h3>`;

            group.requiredDocuments.forEach((doc, index) => {
                const submittedDoc = doc;
                const selectedType = doc.submittedDocumentType || "ORIGINAL";
                const fileUploads = doc.fileUploads;
                let imgFilesHtml = '';
                let pdfFilesHtml = '';
                let buttonDownload = ``;
                if (doc.templateDocument) {
                    buttonDownload = `
                <a download href="${doc.templateDocument.url}" class="btn btn-outline btn-outline-primary btn-active-light-primary text-nowrap">
                    <i class="ki-duotone ki-file-down fs-2"><span class="path1"></span><span class="path2"></span></i>
                    Tải xuống mẫu
                </a>`;
                }
                html += `
            <div class="step2-documentNecessary-item pb-12px border-bottom-custom"
                data-submitdoc-id="${submittedDoc.id}"
                data-required="${submittedDoc.isRequired}"
                data-submitted="${fileUploads.length > 0}"
                data-fileupload-id="${fileUploads.map(f => f.id).join(',')}"
                data-doc-type="${selectedType}">

                <div class="d-flex flex-row gap-10px ${doc.description ? 'align-items-start' : 'align-items-center'}"> 
                    <p class="index-item">${index + 1}</p>
                    <div class="d-flex gap-10px flex-column documentNecessary-item">
                        <h4 class="${submittedDoc.isRequired ? 'required' : ''}">${doc.name}</h4>
                        ${doc.description ? `<p>${doc.description}</p>` : ""}
                    </div>
                    <i class="ki-duotone ki-check-square text-success fs-2 ${fileUploads.length > 0 ? '' : 'd-none'} upload-success">
                        <span class="path1"></span><span class="path2"></span>
                    </i>
                    <select class="form-select w-fit-content" data-type="document-type" data-doc-id="${submittedDoc.id}">
                        <option value="ORIGINAL" ${selectedType === "ORIGINAL" ? "selected" : ""}>Bản gốc</option>
                        <option value="COPY" ${selectedType === "COPY" ? "selected" : ""}>Bản copy</option>
                        <option value="NOTARIZED" ${selectedType === "NOTARIZED" ? "selected" : ""}>Bản đã công chứng</option>
                    </select>
                </div>

                <div class="upload-cluster d-flex gap-10px flex-wrap">
                    <input type="file" class="form-upload-file d-none" accept="application/pdf,image/jpeg,image/png,image/jpg" multiple data-doc-id="${submittedDoc.id}" />

                    <button type="button" class="btn btn-light-primary text-nowrap btn-trigger-upload" data-doc-id="${submittedDoc.id}">
                        <i class="ki-duotone ki-file-up fs-2"><span class="path1"></span><span class="path2"></span></i>
                        <span>Tải lên</span>
                    </button>
                    ${buttonDownload}

                </div>`;
                fileUploads.forEach(file => {
                    const isPdf = file.fileType == NotarizationRequestDetailPage.constants.fileType.pdf;
                    let itemHtml = ``
                    if (!isPdf) {
                        itemHtml = `
                        <div class="notarization-item-file d-flex justify-content-between align-items-center mgt-10px flex-column w-fit-content gap-10px bg-white"
                            data-doc-id="${submittedDoc.id}" data-file-id="${file.id}">
                            <div class="d-flex gap-10px align-items-center">
                                <!--begin::Overlay-->
                                <div class="d-block overlay card-rounded overflow-hidden">
                                    <!--begin::Image-->
                                    <img src="${file.url}" class="overlay-wrapper bgi-no-repeat bgi-position-center bgi-size-cover h-150px" />
                                    <!--end::Image-->
                                    <!--begin::Action-->
                                    <a class="overlay-layer bg-dark bg-opacity-25 shadow align-items-center justify-content-center " data-fslightbox="file_gallery" href="${file.url}" data-type="image">
                                        <i class="bi bi-eye-fill text-white fs-3x"></i>
                                    </a>
                                    <!--end::Action-->
                                </div>
                                <!--end::Overlay-->
                            </div>
                        </div>`;
                    }
                    else {
                        itemHtml = `
                        <div class="notarization-item-file d-flex justify-content-between align-items-center mgt-10px"
                             data-doc-id="${submittedDoc.id}" data-file-id="${file.id}">
                            <div class="d-flex gap-10px align-items-center">
                                <div class="icon-file">
                                    <img src="/admin/assets/media/file-type-icons/pdf.png">
                                </div>
                                <a href="/notarization-request/${NotarizationRequestDetailPage.variables.id}/file/${file.id}/${AppUtils.getPathSegment(5, file.fileKey)}"
                                   class="upload-file-link" target="_blank">${file.fileName}</a>
                            </div>
                            <div class="d-flex align-items-center gap-10px">
                                <p class="upload-file-size">${formatToKB(file.fileSize)}</p>
                            </div>
                        </div>`;
                    }

                    if (!isPdf) imgFilesHtml += itemHtml;
                    else pdfFilesHtml += itemHtml;
                });
                // Thêm hai wrapper chứa danh sách file tương ứng
                html += `<div class="submitted-pdf d-flex flex-column">${pdfFilesHtml}</div>`;
                html += `<div class="submitted-img d-flex flex-row gap-10px flex-wrap">${imgFilesHtml}</div>`;
                html += `</div>`;

            });
            html += `
                 <div class="step2-list-document-forparty" data-target  ="${group.forParty}">
                 </div>
                <button type="button" class="btn btn-light-primary mgt-20px step2_add_document_forparty" data-forparty="${group.forParty}">
                     <i class="ki-duotone ki-plus fs-3"></i>
                     Thêm tài liệu
                </button>`;
        });
        $(".step2-list-document").html(html);
        refreshFsLightbox();

        // Init Select2 cho các select loại tài liệu
        $(".step2-list-document .form-select").select2({
            language: currentLang,
            placeholder: 'Chọn loại tài liệu',
            width: 'auto',
            dropdownAutoWidth: true
        });
    }

    function renderOtherDocument(resources) {
        let html = ``;
        resources.forEach((group, index) => {
            if (!group.forParty) return;
            html += `<h3 class="item-category-title mt-5">${group.forParty}</h3>`;
            const submittedDoc = group;
            const selectedType = group.submittedDocumentType || "ORIGINAL"; // fallback
            const fileUploads = group.fileUploads;
            let imgFilesHtml = '';
            let pdfFilesHtml = '';

            html += `
            <div class="step2-documentNecessary-item pb-12px border-bottom-custom"
                data-submitdoc-id="${submittedDoc.id}"
                data-required="${submittedDoc.isRequired}"
                data-submitted="${fileUploads.length > 0}"
                data-fileupload-id="${fileUploads.map(f => f.id).join(',')}"
                data-doc-type="${selectedType}">

                <div class="d-flex flex-row gap-10px align-items-center"> 
                    <p class="index-item">${index + 1}</p>
                    <div class="d-flex gap-10px flex-column documentNecessary-item">
                        <h4 class="${submittedDoc.isRequired ? 'required' : ''}">${group.name}</h4>
                    </div>
                    <i class="ki-duotone ki-check-square text-success fs-2 ${fileUploads.length > 0 ? '' : 'd-none'} upload-success">
                        <span class="path1"></span><span class="path2"></span>
                    </i>
                    <select class="form-select w-fit-content" data-type="document-type" data-doc-id="${submittedDoc.id}">
                        <option value="ORIGINAL" ${selectedType === "ORIGINAL" ? "selected" : ""}>Bản gốc</option>
                        <option value="COPY" ${selectedType === "COPY" ? "selected" : ""}>Bản copy</option>
                        <option value="NOTARIZED" ${selectedType === "NOTARIZED" ? "selected" : ""}>Bản đã công chứng</option>
                    </select>
                </div>

                <div class="upload-cluster d-flex gap-10px flex-wrap">
                    <input type="file" class="form-upload-file d-none" accept="application/pdf,image/jpeg,image/png,image/jpg" multiple data-doc-id="${submittedDoc.id}" />
                    <button type="button" class="btn btn-light-primary text-nowrap btn-trigger-upload" data-doc-id="${submittedDoc.id}">
                        <i class="ki-duotone ki-file-up fs-2"><span class="path1"></span><span class="path2"></span></i>
                        <span>Tải lên</span>
                    </button>
                </div>`;

            fileUploads.forEach(file => {
                const isPdf = file.fileType == NotarizationRequestDetailPage.constants.fileType.pdf;
                let itemHtml = ``
                if (!isPdf) {
                    itemHtml = `
                        <div class="notarization-item-file d-flex justify-content-between align-items-center mgt-10px flex-column w-fit-content gap-10px bg-white"
                            data-doc-id="${submittedDoc.id}" data-file-id="${file.id}">
                            <div class="d-flex gap-10px align-items-center">
                                <!--begin::Overlay-->
                                <div class="d-block overlay card-rounded overflow-hidden">
                                    <!--begin::Image-->
                                    <img src="${file.url}" class="overlay-wrapper bgi-no-repeat bgi-position-center bgi-size-cover h-150px" />
                                    <!--end::Image-->
                                    <!--begin::Action-->
                                    <a class="overlay-layer bg-dark bg-opacity-25 shadow align-items-center justify-content-center " data-fslightbox="file_gallery" href="${file.url}" data-type="image">
                                        <i class="bi bi-eye-fill text-white fs-3x"></i>
                                    </a>
                                    <!--end::Action-->
                                </div>
                                <!--end::Overlay-->
                            </div>
                        </div>`
                }
                else {
                    itemHtml = `
                        <div class="notarization-item-file d-flex justify-content-between align-items-center mgt-10px"
                             data-doc-id="${submittedDoc.id}" data-file-id="${file.id}">
                            <div class="d-flex gap-10px align-items-center">
                                <div class="icon-file">
                                    <img src="/admin/assets/media/file-type-icons/pdf.png">
                                </div>
                                <a href="/notarization-request/${NotarizationRequestDetailPage.variables.id}/file/${file.id}/${AppUtils.getPathSegment(5, file.fileKey)}"
                                   class="upload-file-link" target="_blank">${file.fileName}</a>
                            </div>
                            <div class="d-flex align-items-center gap-10px">
                                <p class="upload-file-size">${formatToKB(file.fileSize)}</p>
                            </div>
                        </div>`;
                }
                if (!isPdf) imgFilesHtml += itemHtml;
                else pdfFilesHtml += itemHtml;
            });
            // Thêm hai wrapper chứa danh sách file tương ứng
            html += `<div class="submitted-pdf d-flex flex-column">${pdfFilesHtml}</div>`;
            html += `<div class="submitted-img d-flex flex-row gap-10px flex-wrap">${imgFilesHtml}</div>`;
            html += `</div>`;
        });
        $(".step2-list-document-other").html(html);
        refreshFsLightbox();
    }

    function renderBlockingInformation(resources, target) {
        target.html("");
        resources.forEach(result => {
            let card = generateFileItem(result, false);
            target.append(card);
        });
        refreshFsLightbox();
    }


    async function initStep2() {
        let isSuccess = true;
        //load data requestId
        try {
            //Load detail request để check status
            let responseNotarizationRequestDetail = await httpService.getAsync(ApiRoutes.NotarizationRequest.v1.Detail(NotarizationRequestDetailPage.variables.id));
            if (responseNotarizationRequestDetail?.isSucceeded) {
                let dataDetail = responseNotarizationRequestDetail.resources;
                //Gán lại staff, office vào
                NotarizationRequestDetailPage.variables.staffId = dataDetail.staff ? dataDetail.staff.id : 0;
                NotarizationRequestDetailPage.variables.notarizationRequestOfficeId = dataDetail.office.id;

                if (dataDetail.notarizationRequestStatus.id == AppSettings.NotarizationRequestStatus.REJECTED) {
                    $(".footer-notarization-request button[data-kt-stepper-action=next]").attr("disabled", true);
                    $(".footer-notarization-request button[data-kt-stepper-action=cancel]").attr("disabled", true);
                    disableFormControls("#form_step2");
                }
            }

            // Ẩn gọi điện nếu requestType != công chứng trực tuyến
            const isOnlineReqiestType = NotarizationRequestDetailPage.variables.requestTypeId === AppSettings.notarizationRequestType.ONLINE;

            const $zaloLink = $("#step2_call_connection").toggleClass("d-none", !isOnlineReqiestType);

            if (isOnlineReqiestType) {
                $zaloLink
                    .attr("href", `https://zalo.me/${NotarizationRequestDetailPage.variables.notaryPhoneNumber}`)
                    .attr("target", "_blank");
            } else {
                $zaloLink.removeAttr("href").removeAttr("target");
            }


            let response = await httpService.getAsync(ApiRoutes.User.v1.Detail(NotarizationRequestDetailPage.variables.requesterId));
            if (response?.isSucceeded) {
                let data = response.resources;
                // Set fields khác
                Object.keys(data).forEach(key => {
                    const selector = `#step2_requester_${key}`;
                    const value = data[key];
                    $(selector).text(value);
                });
                $("#step2_requester_identity_front").attr("src", data.frontOfIdentityCardFile ? data.frontOfIdentityCardFile.url : "/admin/assets/media/pages/notarization-request-detail/citizen-front.png");
                $("#step2_requester_identity_back").attr("src", data.backOfIdentityCardFile ? data.backOfIdentityCardFile.url : "/admin/assets/media/pages/notarization-request-detail/citizen-back.png");

                $("#step2_requester_name").text(`${data.firstName} ${data.lastName}`);

            }
            else {
                isSuccess = false;
                return isSuccess;
            }

            //Lấy ra submit documents thay vì required documents cho những hợp đồng đã tạo
            let responseSubmitedDocuments = await httpService.getAsync(ApiRoutes.NotarizationRequest.v1.ListSubmitedDocuments(NotarizationRequestDetailPage.variables.id));
            renderSubmittedDocument(responseSubmitedDocuments.resources.requiredDocuments);
            renderOtherDocument(responseSubmitedDocuments.resources.otherDocuments);
            if (responseSubmitedDocuments.resources.blockingInformations.length == 0 && NotarizationRequestDetailPage.variables.currentStep > 2) {
                $(".step2-blockingInformation").hide();
            }
            else {
                renderBlockingInformation(responseSubmitedDocuments.resources.blockingInformations, $("#step2_blockingInformation-files"));
            }

        } catch (e) {
            console.log(e);
            isSuccess = false;
        }

        if (NotarizationRequestDetailPage.variables.currentStep == 2) {
            $(".reject-button").removeClass("d-none");
        }

        return isSuccess;
        //load data tài liệu
    }

    async function saveDataStep2() {
        let isSuccess = true;
        if (NotarizationRequestDetailPage.variables.currentStep == 2) {
            try {
                if (!canSaveStep(NotarizationRequestDetailPage.variables.steps.step2, NotarizationRequestDetailPage.variables.currentUserRoles)) {
                    isSuccess = false;
                    return isSuccess;
                }

                const isValid = $('.step2-documentNecessary-item[data-required="true"]').toArray().every(item => {
                    const fileIds = ($(item).attr('data-fileupload-id') || '')
                        .split(',')
                        .map(id => parseInt(id.trim()))
                        .filter(id => !isNaN(id));
                    return fileIds.length > 0;
                });

                if (!isValid) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Thiếu tài liệu bắt buộc',
                        text: 'Vui lòng tải lên tất cả các tài liệu được yêu cầu trước khi tiếp tục.',
                        confirmButtonText: 'Đã hiểu',
                        ...AppSettings.sweetAlertOptions(false)
                    });
                    return false;
                }

                const { isConfirmed } = await Swal.fire({
                    icon: 'question',
                    title: NotarizationRequestDetailPage.message.confirmTittle,
                    html: NotarizationRequestDetailPage.message.confirmText,
                    ...AppSettings.sweetAlertOptions(true)
                });

                if (isConfirmed) {
                    $("#global_loader").addClass("show");

                    let submittedDocuments = [];
                    $('.step2-documentNecessary-item').each(function () {
                        const submitDocId = $(this).data('submitdoc-id');
                        const fileUploadIds = $(this).data('fileupload-id');
                        const docType = $(this).data('doc-type');
                        const isOtherDoc = $(this).data('other-document');
                        const isSubmittedDoc = $(this).data('other-document-forparty');
                        const documentName = $(this).find('.document-name-input').val();

                        const fileIds = fileUploadIds
                            ? fileUploadIds.toString().split(',').map(id => parseInt(id))
                            : [];

                        // Nếu là tài liệu thêm tay và chưa có file, bỏ qua
                        if (isOtherDoc && fileIds.length === 0) {
                            return;
                        }

                        if (isSubmittedDoc && fileIds.length === 0) {
                            return;
                        }

                        submittedDocuments.push({
                            name: isOtherDoc || isSubmittedDoc ? documentName : "",
                            id: isOtherDoc || isSubmittedDoc ? 0 : submitDocId,
                            fileIds: fileIds,
                            type: docType || "ORIGINAL",
                            isRequired: isSubmittedDoc ? true : false,
                            forParty: isOtherDoc || isSubmittedDoc ? $(this).data('forparty') : ''
                        });
                    });

                    // Lấy blocking Informations
                    const blockingInformations = [];
                    $('#step2_blockingInformation-files .file_gallery_item').each(function () {
                        const id = $(this).data('file-upload-id');
                        if (id != null) {
                            blockingInformations.push({ fileId: id });
                        }
                    });

                    const requestObj = {
                        id: NotarizationRequestDetailPage.variables.id,
                        submittedDocuments,
                        blockingInformations
                    };

                    const response = await httpService.putAsync(ApiRoutes.NotarizationRequest.v1.UpdateSubmitedDocuments, requestObj);

                    if (response?.isSucceeded) {
                        const successText = NotarizationRequestDetailPage.message.submittedDocument;
                        toastr.success(NotarizationRequestDetailPage.message.successTitle, successText);
                        NotarizationRequestDetailPage.variables.currentStep = 3;
                    } else {
                        isSuccess = false;
                    }
                } else {
                    isSuccess = false;
                }
            } catch (e) {
                console.log(e);
                isSuccess = false;
            }
        }

        if (isSuccess && (isSuccess = await initStep3())) {
            disableFormControls("#form_step2");
        }

        $("#global_loader").removeClass("show");
        return isSuccess;
    }

    function rejectNotarizationRequest() {
        NotarizationRequestDetailPage.formValidatorRejectRequest.clearErrors();
        $("#kt_modal_reject").modal("show");
    }
    async function saveDataRejectRequest() {
        // phân quyền khi thêm mới chỉ cho phép nhân viên công chứng, thư ký và quản lý cấp văn phòng
        if (!canSaveStep(NotarizationRequestDetailPage.variables.steps.reject, NotarizationRequestDetailPage.variables.currentUserRoles)) {
            return;
        }
        const btnSave = $("#btn_save_reject");
        btnSave.attr("disabled", true);

        const data = {
            notarizationRequestId: NotarizationRequestDetailPage.variables.id,
            reason: $("#notatization_request_review_history_reason").val(),
        };

        const confirmText = NotarizationRequestDetailPage.messageRejectNotarizationRequest.rejectText;
        const { isConfirmed } = await Swal.fire({
            icon: 'question',
            title: NotarizationRequestDetailPage.messageRejectNotarizationRequest.rejectTitle,
            html: confirmText,
            ...AppSettings.sweetAlertOptions(true)
        });

        if (isConfirmed) {
            btnSave.attr("data-kt-indicator", "on");
            try {
                const response = await httpService.putAsync(ApiRoutes.NotarizationRequest.v1.RejectNotarizationRequest, data);
                if (response?.isSucceeded) {
                    $("#kt_modal_reject").modal("hide");
                    const successText = NotarizationRequestDetailPage.messageRejectNotarizationRequest.rejectSuccessText
                    Swal.fire({
                        icon: "success",
                        title: NotarizationRequestDetailPage.messageRejectNotarizationRequest.successTitle,
                        html: successText,
                        ...AppSettings.sweetAlertOptions(false)
                    }).then(result => {
                        window.location.href = '/notarization-request/list';
                    });
                    //Trigger change data userid
                }

            } catch (e) {
                AppUtils.handleApiError(e, {
                    action: "create",
                    name: NotarizationRequestDetailPage.messageRejectNotarizationRequest.pageTitle,
                    isShowAlert: true
                })
            }
            finally {
                btnSave.removeAttr("data-kt-indicator");
            }
        }
        btnSave.removeAttr("disabled");
    }
    //[Step3]
    async function initStep3() {
        let isSuccess = true;
        //load data requestId
        try {
            let responseNotarizationRequestDetail = await httpService.getAsync(ApiRoutes.NotarizationRequest.v1.Detail(NotarizationRequestDetailPage.variables.id));
            var dataDetail = [];
            var dataToolbar = [];
            var dataToolbarProperties = [];
            if (responseNotarizationRequestDetail?.isSucceeded) {
                dataDetail = responseNotarizationRequestDetail.resources;
                NotarizationRequestDetailPage.variables.requestCode = dataDetail.requestCode;
                //gen qr code
                let urlQRCode = `${window.location.origin}/notarization-request/view/${dataDetail.requestCode}`;
                generateQRCode(urlQRCode, $("#step3_request_qrCode"));
            }
            //Load data NotarizationRequestParticipant
            let responseNotarizationRequestParticipant = await httpService.getAsync(ApiRoutes.NotarizationRequest.v1.ListParticipants(NotarizationRequestDetailPage.variables.id));
            if (responseNotarizationRequestParticipant?.isSucceeded) {
                dataToolbar = responseNotarizationRequestParticipant.resources;
            }
            //Load data NotarizationRequestProperty
            let responseNotarizationRequestProperty = await httpService.getAsync(ApiRoutes.NotarizationRequest.v1.ListProperties(NotarizationRequestDetailPage.variables.id));
            if (responseNotarizationRequestProperty?.isSucceeded) {
                dataToolbarProperties = responseNotarizationRequestProperty.resources;
            }

            //IsHaveContractFile để checked vào radio
            if (dataDetail.isHaveContractFile) {
                $("#step3_document_confirmed").prop("checked", true).trigger("change");
            }
            else {
                $("#step3_document_confirm").prop("checked", true).trigger("change");
            }

            renderNotarizationDocument(dataDetail, dataToolbar, dataToolbarProperties);
        } catch (e) {
            isSuccess = false;
        }

        if (NotarizationRequestDetailPage.variables.currentStep > 1) {
            $(".reject-button").addClass("d-none");
        }

        return isSuccess;
        //load data tài liệu
    }

    function renderNotarizationDocument(dataDetail, dataToolbar, dataToolbarProperties) {
        $("#preview_contract_content").html(dataDetail.contractContent);
        AppSettings.notarizationFields.forEach(item => {
            const value = getValueByPath(dataDetail, item.mappingValue);
            $(`[data-code="{{${item.field}}}"]`).text(value ?? '');
        });
        buildPreviewFromContractContent(dataDetail);
        //Render toolbar
        let html = "";
        dataToolbar.forEach(item => {
            let childHtml = "";
            item.notarizationRequestParticipantDetails
                .forEach(field => {
                    const key = `${item.roleCode}.${field.fieldCode}`;
                    if (!Array.isArray(NotarizationRequestDetailPage.fields[key])) {
                        NotarizationRequestDetailPage.fields[key] = [];
                    }
                    NotarizationRequestDetailPage.fields[key].push(field.displayOrder);
                    childHtml += `
                    <div class="form-floating mb-5">
                    <input class="form-control for-party mb-5" data-participant-id=${item.id} data-participant-detail-id="${field.id}" data-code="${key}" data-sort="${field.displayOrder}" placeholder="${field.fieldLabel} (${field.displayOrder})" value="${field.fieldValue || ""}"/>
                    <label class="form-label">${field.fieldLabel} (${field.displayOrder})</label>
                    </div>`;
                });

            html += `<div>
                         <h2 class="mb-5">${item.roleName}</h2>
                         ${childHtml}
                     </div>`
        });
        //Render toolbar properties
        var htmlProperty = '';
        let childHtmlProperty = "";
        dataToolbarProperties.forEach(item => {
            const key = `${item.fieldCode}`;
            if (!Array.isArray(NotarizationRequestDetailPage.fields[key])) {
                NotarizationRequestDetailPage.fields[key] = [];
            }
            NotarizationRequestDetailPage.fields[key].push(item.displayOrder);
            childHtmlProperty += `
            <div class="form-floating mb-5">
            <input class="form-control for-property mb-5" data-id="${item.id}" data-code="${item.fieldCode}" data-sort="${item.displayOrder}" placeholder="${item.fieldLabel} (${item.displayOrder})" value="${item.fieldValue || ""}"/>
            <label class="form-label">${item.fieldLabel} (${item.displayOrder})</label>
            </div>`;
        });
        if (dataToolbarProperties.length > 0) {
            htmlProperty = `<div>
                         <h2 class="mb-5">Tài sản công chứng</h2>
                         ${childHtmlProperty}
                     </div>`;
        }
        html += htmlProperty;
        $("#contract_toolbar").html(html);


    }

    function buildPreviewFromContractContent(dataDetail) {
        const previewWrapper = document.getElementById('preview_contract_content');
        const qrDiv = document.createElement('div');
        qrDiv.className = 'online-qr-code d-none';
        document.body.appendChild(qrDiv);

        const urlQRCode = `${window.location.origin}/notarization-request/view/${dataDetail.requestCode}`;
        generateQRCode(urlQRCode, qrDiv);

        $('#preview_contract_content .template-variable').each(function (i) {
            const index = i + 1;
            $(this).attr('title', `Biến số ${index}`);
            $(this).prepend(`<sup class="text-muted me-1" style="color:#99A1B7;font-size:10px;">[${index}]</sup>`);
            $(this).attr('style', 'color:#003399;font-weight:600;');
        });

        let html = previewWrapper.innerHTML;

        if (NotarizationRequestDetailPage.editorInstance) {
            NotarizationRequestDetailPage.editorInstance.destroy(true);
        }

        const editableArea = document.createElement('textarea');
        editableArea.id = 'preview_contract_content';
        editableArea.name = 'preview_contract_content';
        editableArea.innerHTML = html;

        previewWrapper.replaceWith(editableArea);
        NotarizationRequestDetailPage.editorInstance = CKEDITOR.replace(
            'preview_contract_content',
            AppSettings.ckEditorSettingsForA4Paper
        );

        document.body.removeChild(qrDiv);
    }


    async function generatePDFByPreviewPage() {
        const editor = NotarizationRequestDetailPage.editorInstance;
        if (!editor) return;

        const originalHtml = editor.getData();
        const requestCode = NotarizationRequestDetailPage.variables.requestCode || "no-code";
        const qrUrl = `${window.location.origin}/notarization-request/view/${requestCode}`;

        // 1. Tạo mã QR DOM tạm
        const qrContainer = document.createElement('div');
        qrContainer.style.position = 'absolute';
        qrContainer.style.left = '-9999px';
        document.body.appendChild(qrContainer);

        await generateQRCode(qrUrl, qrContainer, 200, 200);
        await new Promise(resolve => setTimeout(resolve, 300));
        const qrImg = qrContainer.querySelector('img');

        // 2. QR HTML chỉ hiện khi in
        const qrHtml = qrImg
            ? `<div class="qr-print-only"><img src="${qrImg.src}" width="70" height="70" /></div>`
            : '';

        // 3. CSS để giữ lề nội dung & đẩy QR sát góc giấy
        const styleForPrint = `
        <style>
        @page {
            size: A4;
            margin: 0;
        }
        body {
            margin: 0;
            padding: 0;
        }

        .content {
            width: 210mm;
            height: 297mm;
            padding: 20mm;
            box-sizing: border-box;
            font-family: "Times New Roman", Times, serif;
        }

        .qr-print-only {
            display: none;
        }

        @media print {
            body {
                margin: 0 !important;
                padding: 0 !important;
            }
            sup {
                display: none !important;
            }
            .template-variable {
                padding:0;
            }
            .qr-print-only {
                display: block;
                position: absolute;
                top: 10px;
                right: 10px;
                width: 70px;
                height: 70px;
                z-index: 9999;
            }
        }
        </style>
        `;

        // 4. Lồng nội dung đầy đủ
        const newHtml = `
        ${styleForPrint}
        ${qrHtml}
        <div class="content">
            ${originalHtml}
        </div>
    `;

        // 5. Gán nội dung mới vào editor và gọi in
        editor.setData(newHtml, {
            callback: function () {
                editor.execCommand('print');

                // 6. Khôi phục nội dung sau khi in
                setTimeout(() => {
                    editor.setData(originalHtml);
                }, 500);
            }
        });

        // 7. Cleanup
        document.body.removeChild(qrContainer);
    }

    async function saveDataStep3() {
        let isSuccess = true;
        if (NotarizationRequestDetailPage.variables.currentStep == 3) {
            try {
                if (!canSaveStep(NotarizationRequestDetailPage.variables.steps.step2, NotarizationRequestDetailPage.variables.currentUserRoles)) {
                    isSuccess = false;
                    return isSuccess;
                }

                const { isConfirmed } = await Swal.fire({
                    icon: 'question',
                    title: NotarizationRequestDetailPage.message.confirmTittle,
                    html: NotarizationRequestDetailPage.message.confirmText,
                    ...AppSettings.sweetAlertOptions(true)
                });

                if (isConfirmed) {
                    $("#global_loader").addClass("show");
                    let participantDetails = [];
                    let properties = [];
                    $('#form_step3 #contract_toolbar .for-party').each(function () {
                        const participantId = $(this).data('participant-id');
                        const participantDetailId = $(this).data('participant-detail-id');
                        const fieldValue = $(this).val();
                        participantDetails.push({
                            id: participantDetailId,
                            notarizationRequestParticipantId: participantId,
                            fieldValue: fieldValue
                        });
                    });
                    $('#form_step3 #contract_toolbar .for-property').each(function () {
                        const id = $(this).data('id');
                        const fieldValue = $(this).val();
                        properties.push({
                            id: id,
                            fieldValue: fieldValue
                        });
                    });

                    let isHaveContractFile = $("#step3_document_confirmed").is(":checked");

                    let requestObj = {
                        id: NotarizationRequestDetailPage.variables.id,
                        isHaveContractFile: isHaveContractFile,
                        contractContent: NotarizationRequestDetailPage.editorInstance.getData().replace(/<sup[^>]*>.*?<\/sup>/gi, '')
                            .replace(/<sub[^>]*>.*?<\/sub>/gi, ''),
                        notarizationRequestParticipantDetails: participantDetails,
                        notarizationRequestParticipantProperties: properties
                    }
                    const response = await httpService.putAsync(ApiRoutes.NotarizationRequest.v1.SaveNotarizationDocument, requestObj);
                    if (response?.isSucceeded) {
                        const successText = NotarizationRequestDetailPage.message.submittedDocument;
                        toastr.success(NotarizationRequestDetailPage.message.successTitle, successText);
                        //Cập nhật step
                        NotarizationRequestDetailPage.variables.currentStep = 4;
                    }
                    else isSuccess = false
                }
                else isSuccess = false
            } catch (e) {
                isSuccess = false;
            }
        }

        if (isSuccess && (isSuccess = await initStep4())) {
            disableFormControls("#form_step2");
        }
        $("#global_loader").removeClass("show");
        return isSuccess;
    }

    //[Step4]
    async function initStep4() {
        let isSuccess = true;
        //load data requestId
        try {
            var dataAttachment = [];
            let responseNotarizationRequestDetail = await httpService.getAsync(ApiRoutes.NotarizationRequest.v1.Detail(NotarizationRequestDetailPage.variables.id));
            let dataDetail = responseNotarizationRequestDetail.resources;
            //Lấy ra xem 
            $("#step4_sign_location").val(dataDetail.location || "");
            $("#step4_check_outside").prop("checked", dataDetail.isOutsideNotary).trigger("change");

            let responseNotarizationAttachment = await httpService.getAsync(ApiRoutes.NotarizationRequest.v1.ListAttachments(NotarizationRequestDetailPage.variables.id));
            if (responseNotarizationAttachment?.isSucceeded) {
                dataAttachment = responseNotarizationAttachment.resources;
            }
            ////xem có show ra chọn ctv không
            //let isHasStaff = dataDetail.staff != null;
            //let currentUserIsNotaryStaff = NotarizationRequestDetailPage.variables.currentUserRoles.includes(AppSettings.roles.NOTARY_STAFF);
            //let isShowSelectStaff = !isHasStaff && !currentUserIsNotaryStaff;

            //if (isShowSelectStaff) {
            //    $(".step4-select-staff").show();
            //} else {
            //    $(".step4-select-staff").hide();
            //}

            let isHasStaff = dataDetail.staff != null;
            if (isHasStaff) {
                $("#step4_staffId").val(dataDetail.staff.id).trigger("change");
            }
            let currentUserIsNotaryStaff = NotarizationRequestDetailPage.variables.currentUserRoles.includes(AppSettings.roles.NOTARY_STAFF);
            let isShowSelectStaff = !currentUserIsNotaryStaff;

            if (isShowSelectStaff) {
                $(".step4-select-staff").show();
            } else {
                $(".step4-select-staff").hide();
            }

            renderNotarizationDocumentStep4(/*dataDetail,*/ dataAttachment);

        } catch (e) {
            isSuccess = false;
        }

        if (NotarizationRequestDetailPage.variables.currentStep > 1) {
            $(".reject-button").addClass("d-none");
        }

        return isSuccess;
        //load data tài liệu
    }

    async function saveDataStep4() {
        let isSuccess = true;
        if (NotarizationRequestDetailPage.variables.currentStep == 4) {
            try {
                if (!canSaveStep(NotarizationRequestDetailPage.variables.steps.step2, NotarizationRequestDetailPage.variables.currentUserRoles)) {
                    isSuccess = false;
                    return isSuccess;
                }

                const isValid = $('#form_step4 .step-component-content-img img[data-fileupload-id]').length > 0;
                if (!isValid) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Thiếu tài liệu bắt buộc',
                        text: 'Vui lòng tải lên tất cả ảnh trước khi tiếp tục.',
                        confirmButtonText: 'Đã hiểu',
                        ...AppSettings.sweetAlertOptions(false)
                    });
                    return false;
                }
                let isOutsideNotary = $("#step4_check_outside").is(":checked");

                if (isOutsideNotary && $("#step4_sign_location").val().length == 0) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Cần ghi rõ địa điểm ký bên ngoài',
                        text: 'Các hợp đồng, giấy tờ ký bên ngoài gần được khi rõ thông tin địa điểm',
                        confirmButtonText: 'Đã hiểu',
                        ...AppSettings.sweetAlertOptions(false)
                    });
                    return false;
                }


                if (!NotarizationRequestDetailPage.variables.currentUserRoles.includes(AppSettings.roles.NOTARY_STAFF)) {
                    if ($("#step4_staffId").val() == "" || $("#step4_staffId").val() == null) {
                        Swal.fire({
                            icon: 'warning',
                            title: 'Cần chọn công chứng viên',
                            text: 'Cần chọn công chứng viên cho hợp đồng này',
                            confirmButtonText: 'Đã hiểu',
                            ...AppSettings.sweetAlertOptions(false)
                        });
                        return false;
                    }
                }

                const { isConfirmed } = await Swal.fire({
                    icon: 'question',
                    title: NotarizationRequestDetailPage.message.confirmTittle,
                    html: NotarizationRequestDetailPage.message.confirmText,
                    ...AppSettings.sweetAlertOptions(true)
                });

                if (isConfirmed) {
                    $("#global_loader").addClass("show");
                    const certificateSampleFileId = $("#form_step4 .step4-certificate-document-item").data("fileupload-id");
                    let notarizationRequestAttachments = [];
                    //const attachmentNotarizationDocument = {
                    //    id: $(".step5-notarization-document-item").data("attach-document-id") || 0,
                    //    fileId: $(".step5-notarization-document-item").data("fileupload-id"),
                    //    attachmentType: AppSettings.AttachmentType.NOTARY_DOCUMENT,
                    //};
                    //notarizationRequestAttachments.push(attachmentNotarizationDocument);

                    $(".step-component-content-img img").each(function () {
                        var attachmentObj = {
                            id: $(this).data("id") || 0,
                            fileId: $(this).data("fileupload-id"),
                            attachmentType: AppSettings.AttachmentType.SIGNATURE,
                        };
                        notarizationRequestAttachments.push(attachmentObj);
                    });

                    var requestObj = {
                        id: NotarizationRequestDetailPage.variables.id,
                        certificateSampleFileId: certificateSampleFileId,
                        notarizationRequestAttachments: notarizationRequestAttachments,
                        isOutsideNotary: isOutsideNotary,
                        location: $("#step4_sign_location").val(),
                        staffId: NotarizationRequestDetailPage.variables.currentUserRoles.includes(AppSettings.roles.NOTARY_STAFF) ? null : $("#step4_staffId").val()
                    }
                    const response = await httpService.putAsync(ApiRoutes.NotarizationRequest.v1.AttachSignatures, requestObj);
                    if (response?.isSucceeded) {
                        const successText = NotarizationRequestDetailPage.message.submittedDocument;
                        toastr.success(NotarizationRequestDetailPage.message.successTitle, successText);
                        //Cập nhật step
                        NotarizationRequestDetailPage.variables.currentStep = 5;
                    }
                }
                else isSuccess = false;

            } catch (e) {
                isSuccess = false;
            }
        }

        if (isSuccess && (isSuccess = await initStep5())) {
            disableFormControls("#form_step3");
        }
        $("#global_loader").removeClass("show");
        return isSuccess;
    }

    async function renderNotarizationDocumentStep4(/*dataDetail,*/ dataAttachment) {
        ////$("#global_loader").addClass("show");
        ////render lời chứng
        //$(".step4-certificate-document-item").find(".notarization-item-file").remove();
        //if (dataDetail.certificateSampleFile != null) {
        //    //html lời chứng
        //    $(".step4-certificate-document-item").append(`
        //    <div class="notarization-item-file d-flex justify-content-between align-items-center mgt-10px">
        //        <div class="d-flex gap-10px align-items-center">
        //            <div class="icon-file">
        //                <img src="/admin/assets/media/file-type-icons/pdf.png">
        //            </div>
        //            <a href="${dataDetail.certificateSampleFile.url}" class="upload-file-link" target="_blank">
        //                ${dataDetail.certificateSampleFile.fileName}
        //            </a>
        //        </div>
        //        <p class="upload-file-size">
        //           ${formatToKB(dataDetail.certificateSampleFile.fileSize)}
        //        </p>
        //    </div>
        //    `).attr("data-fileupload-id", dataDetail.certificateSampleFile.id);
        //}
        ////render hợp đồng
        //var objNotarizationDocument = dataAttachment.find(x => x.attachmentType === AppSettings.AttachmentType.NOTARY_DOCUMENT);
        //if (objNotarizationDocument != undefined && objNotarizationDocument != null) {
        //    $(".step4-notarization-document-item").attr("data-attach-document-id", objNotarizationDocument.id);
        //    $(".step4-notarization-document-item").attr("data-submitted", true);
        //    $(".step4-notarization-document-item").attr("data-fileupload-id", objNotarizationDocument.notarizationRequestAttachmentFile.id);
        //    $(".step4-notarization-document-item .upload-success").removeClass("d-none");
        //    $(".step4-notarization-document-item .notarization-item-file .upload-file-link")
        //        .attr("href", objNotarizationDocument.notarizationRequestAttachmentFile.url)
        //        .text(objNotarizationDocument.notarizationRequestAttachmentFile.fileName);
        //    $(".step4-notarization-document-item .notarization-item-file .upload-file-size").text(formatToKB(objNotarizationDocument.notarizationRequestAttachmentFile.fileSize));
        //    await readFileNotarizationDocument(objNotarizationDocument.notarizationRequestAttachmentFile);
        //    $(".step4-notarization-document-item .notarization-item-file").removeClass("d-none");
        //}

        //render ảnh
        var notarizationRequestAttachments = dataAttachment.filter(x => x.attachmentType === AppSettings.AttachmentType.SIGNATURE);
        $(".step-component-content-img").html("");
        if (notarizationRequestAttachments.length > 0) {
            notarizationRequestAttachments.forEach(item => {
                //$(".step-component-content-img").append(`<img src="${item.notarizationRequestAttachmentFile.url}" class="w-200px" data-fileupload-id="${item.notarizationRequestAttachmentFile.id}" data-id="${item.id}" />`);
                $(".step-component-content-img").append(`<!--begin::Overlay-->
                <div class="d-block overlay card-rounded overflow-hidden">
                    <!--begin::Image-->
                    <img src="${item.notarizationRequestAttachmentFile.url}" class="overlay-wrapper bgi-no-repeat bgi-position-center bgi-size-cover h-150px" data-fileupload-id="${item.notarizationRequestAttachmentFile.id}" data-id="${item.id}" />
                    <!--end::Image-->

                    <!--begin::Action-->
                    <a class="overlay-layer bg-dark bg-opacity-25 shadow align-items-center justify-content-center " data-fslightbox="file_gallery" href="${item.notarizationRequestAttachmentFile.url}" data-type="image">
					    <i class="bi bi-eye-fill text-white fs-3x"></i>
					</a>
                    <!--end::Action-->
                </div>
                <!--end::Overlay-->`);
            });
            refreshFsLightbox();
        }
        //$("#global_loader").removeClass("show");
    }

    async function readFileNotarizationDocument(file, element) {
        try {
            let requestObj = {
                fileId: file.id,
                fileUrl: file.fileKey,
            }
            let response = await httpService.postAsync(ApiRoutes.NotarizationRequest.v1.ReadPdfFile, requestObj);
            if (response?.isSucceeded) {
                $(element).removeClass("d-none");
                let data = response.resources;
                var signatureHtml = '';
                data.forEach((item, index) => {
                    signatureHtml += `<div class="signature-item">
                                            <div class="signature-description mb-5">
                                                ${item.name}
                                            </div>
                                            <div class="signature-content d-flex flex-column">
                                                <p class="m-0">Người ký: ${item.subject}</p>
                                                <p class="m-0">Ngày ký: ${moment(item.signDate).format('DD/MM/YYYY HH:mm:ss')}</p>
                                                <p class="m-0">Trạng thái: ${item.isValid ? "Hợp lệ" : "Không hợp lệ"}</p>
                                                <p class="m-0">Sử dụng từ ngày: ${moment(item.notBefore).format('DD/MM/YYYY HH:mm:ss')}</p>
                                                <p class="m-0">Sử dụng đến ngày: ${moment(item.notAfter).format('DD/MM/YYYY HH:mm:ss')}</p>
                                                <p class="m-0">Đơn vị cấp: ${item.issuer}</p>
                                            </div>
                                        </div>`;
                });
                $(element).find(".signature-container").html(signatureHtml);
            }
            else {
                $(element).addClass("d-none");
            }
        } catch (e) {
            $(element).addClass("d-none");
        }
    }

    async function loadDataStaff() {
        try {
            let requestObj = {
                roleIds: [AppSettings.roles.NOTARY_STAFF]
            }
            const response = await httpService.postAsync(ApiRoutes.Office.v1.Staffs(NotarizationRequestDetailPage.variables.currentUserOfficeId), requestObj);
            const data = response.resources;
            data.forEach(function (item) {
                $("#step4_staffId").append(new Option(`${item.firstName} ${item.lastName} ${item.email ? `(${item.email})` : ``}`, item.id, false, false));
            });
        } catch (e) {
            console.error(e);
        }
    }

    //[step5]
    async function initStep5() {
        let isSuccess = true;
        $("#global_loader").addClass("show");
        //load data requestId
        try {
            //load data detail hồ sơ
            const responseDetail = await httpService.getAsync(ApiRoutes.NotarizationRequest.v1.Detail(NotarizationRequestDetailPage.variables.id));
            let dataDetail = responseDetail.resources;

            if (dataDetail.notarizationRequestType.id == AppSettings.notarizationRequestType.NORMAL) {
                $(".step5-certificate-document-item").hide();
                $(".step5-other-doc-index").text(2);
            }

            //$("#step5_bill_amount").text(AppUtils.numberWithCommas(dataDetail.totalFee));
            //$("#step5_bill_amountText").text(convertNumberToVietnameseWords(dataDetail.totalFee));
            //$("#step5_qr_image").attr("src", `https://img.vietqr.io/image/VCB-0031000274583-compact2.png?amount=${dataDetail.totalFee}`);
            ////load data paymentTransactions
            //let responsePaymentTransactions = await httpService.getAsync(ApiRoutes.NotarizationRequest.v1.ListPaymentTransactions(NotarizationRequestDetailPage.variables.id));
            //if (responsePaymentTransactions.resources.length > 0) {
            //    disableFormControls("#form_step5");
            //    NotarizationRequestDetailPage.variables.isCreatePaymentTransaction = true;
            //    let paymentTransactionsData = responsePaymentTransactions.resources[0];
            //    $(`.step5-paymentMethod input[name="step5_paymentMethod"][value="${paymentTransactionsData.paymentMethod.id}"]`).prop('checked', true).trigger("change");
            //    $("#step5_payment_note").val(paymentTransactionsData.note ?? "");
            //    $("#step5_bill_date").text(moment(paymentTransactionsData.paidAt).format('DD/MM/YYYY'));
            //}
            ////load động theo thời gian thực
            //else {
            //    $("#step5_bill_date").text(new Date().toLocaleDateString('vi-VN'));
            //}

            //////load data requesterId
            //let responseRequester = await httpService.getAsync(ApiRoutes.User.v1.Detail(NotarizationRequestDetailPage.variables.requesterId));
            //let requesterData = responseRequester.resources;
            //$("#step5_bill_requesterName").text(`${requesterData.firstName} ${requesterData.lastName}`);
            //$("#step5_bill_requesterAddress").text(requesterData.addressDetail);

            //render attachment document
            let responseNotarizationAttachment = await httpService.getAsync(ApiRoutes.NotarizationRequest.v1.ListAttachments(NotarizationRequestDetailPage.variables.id));
            if (responseNotarizationAttachment?.isSucceeded) {
                let dataAttachment = responseNotarizationAttachment.resources;
                //render hợp đồng công chứng
                let objNotarizationDocument = dataAttachment.find(x => x.attachmentType === AppSettings.AttachmentType.NOTARY_DOCUMENT);
                if (objNotarizationDocument != undefined && objNotarizationDocument != null) {
                    $(".step5-notarization-document-item").attr("data-attach-document-id", objNotarizationDocument.id);
                    $(".step5-notarization-document-item").attr("data-submitted", true);
                    $(".step5-notarization-document-item").attr("data-fileupload-id", objNotarizationDocument.notarizationRequestAttachmentFile.id);
                    $(".step5-notarization-document-item .upload-success").removeClass("d-none");
                    $(".step5-notarization-document-item .notarization-item-file .upload-file-link")
                        .attr("href", `/notarization-request/${NotarizationRequestDetailPage.variables.id}/file/${objNotarizationDocument.notarizationRequestAttachmentFile.id}/${AppUtils.getPathSegment(5, objNotarizationDocument.notarizationRequestAttachmentFile.fileKey)}`)
                        .text(objNotarizationDocument.notarizationRequestAttachmentFile.fileName);
                    $(".step5-notarization-document-item .notarization-item-file .upload-file-size").text(formatToKB(objNotarizationDocument.notarizationRequestAttachmentFile.fileSize));
                    await readFileNotarizationDocument(objNotarizationDocument.notarizationRequestAttachmentFile, $(".signature-notarization-document-form"));
                    $(".step5-notarization-document-item .notarization-item-file").removeClass("d-none");
                }

                //render tài liệu khác
                let objNotarizationOtherDocuments = dataAttachment.filter(x => x.attachmentType === AppSettings.AttachmentType.OTHER_DOCUMENT);
                $(".step5-other-document-item .notarization-item-file").remove();
                if (objNotarizationOtherDocuments.length > 0) {
                    objNotarizationOtherDocuments.forEach(item => {
                        $(".step5-other-document-item").append(`<div class="notarization-item-file d-flex justify-content-between align-items-center mgt-10px" data-file-id="${item.notarizationRequestAttachmentFile.id}">
                                <div class="d-flex gap-10px align-items-center">
                                    <div class="icon-file"><img src="/admin/assets/media/file-type-icons/pdf.png"></div>
                                    <a href="/notarization-request/${NotarizationRequestDetailPage.variables.id}/file/${item.notarizationRequestAttachmentFile.id}/${AppUtils.getPathSegment(5, item.notarizationRequestAttachmentFile.fileKey)}" class="upload-file-link" target="_blank">${item.notarizationRequestAttachmentFile.fileKey}</a>
                                </div>
                                <div class="d-flex align-items-center gap-10px">
                                    <p class="upload-file-size">${formatToKB(item.notarizationRequestAttachmentFile.fileSize)}</p>
                                </div>
                            </div>`)
                    });
                }
                //render lời chứng
                let objCertificateDocument = dataAttachment.find(x => x.attachmentType === AppSettings.AttachmentType.CERTIFICATE_DOCUMENT);
                if (objCertificateDocument != undefined && objCertificateDocument != null) {
                    $(".step5-certificate-document-item").attr("data-attach-document-id", objCertificateDocument.id);
                    $(".step5-certificate-document-item").attr("data-submitted", true);
                    $(".step5-certificate-document-item").attr("data-fileupload-id", objCertificateDocument.notarizationRequestAttachmentFile.id);
                    $(".step5-certificate-document-item .upload-success").removeClass("d-none");
                    $(".step5-certificate-document-item .notarization-item-file .upload-file-link")
                        .attr("href", `/notarization-request/${NotarizationRequestDetailPage.variables.id}/file/${objCertificateDocument.notarizationRequestAttachmentFile.id}/${AppUtils.getPathSegment(5, objCertificateDocument.notarizationRequestAttachmentFile.fileKey)}`)
                        .text(objCertificateDocument.notarizationRequestAttachmentFile.fileName);
                    $(".step5-certificate-document-item .notarization-item-file .upload-file-size").text(formatToKB(objCertificateDocument.notarizationRequestAttachmentFile.fileSize));
                    await readFileNotarizationDocument(objCertificateDocument.notarizationRequestAttachmentFile, $(".signature-certificate-document-form"));
                    $(".step5-certificate-document-item .notarization-item-file").removeClass("d-none");
                }
            }

        } catch (e) {
            console.log(e);
            isSuccess = false;
        }

        if (NotarizationRequestDetailPage.variables.currentStep > 1) {
            $(".reject-button").addClass("d-none");
        }

        $("#global_loader").removeClass("show");
        return isSuccess;

        //load data tài liệu

    }

    async function loadDataPaymentMethod() {
        try {
            const response = await httpService.getAsync(ApiRoutes.PaymentMethod.v1.List);
            const data = response.resources;
            let name = "step5_paymentMethod"; // Tên nhóm radio để liên kết
            $.each(data, function (index, item) {
                var isChecked = (item.id === AppSettings.paymentMethod.CASH) ? 'checked' : '';
                var radioHtml = `
                <label class="radio">
                    <input type="radio" name="${name}" value="${item.id}" ${isChecked}>
                    <span>${item.name}</span>
                </label>
             `;
                $('.step5-paymentMethod').append(radioHtml);
            });
        } catch (e) {
            console.error(e);
        }
    }

    async function saveDataStep5() {
        let isSuccess = true;
        if (NotarizationRequestDetailPage.variables.currentStep == 5) {
            try {
                // phân quyền văn thư, quản lý cấp vp
                if (!canSaveStep(NotarizationRequestDetailPage.variables.steps.step5, NotarizationRequestDetailPage.variables.currentUserRoles)) {
                    isSuccess = false;
                    return isSuccess;
                }
                const isValidNotarizationDocument = $('.step5-notarization-document-item').toArray().every(item => {
                    const $item = $(item);
                    const isSubmitted = $item.data('submitted') === true || $item.attr('data-submitted') === 'true';
                    return isSubmitted;
                });

                let isValidCertificateDocument = true;
                if (NotarizationRequestDetailPage.variables.requestTypeId != AppSettings.notarizationRequestType.NORMAL) {
                    isValidCertificateDocument = $('.step5-certificate-document-item').toArray().every(item => {
                        const $item = $(item);
                        const isSubmitted = $item.data('submitted') === true || $item.attr('data-submitted') === 'true';
                        return isSubmitted;
                    });
                }

                if (!isValidNotarizationDocument || !isValidCertificateDocument) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Thiếu tài liệu bắt buộc',
                        text: 'Vui lòng tải lên tất cả các tài liệu được yêu cầu trước khi tiếp tục.',
                        confirmButtonText: 'Đã hiểu',
                        ...AppSettings.sweetAlertOptions(false)
                    });
                    return false;
                }

                const { isConfirmed } = await Swal.fire({
                    icon: 'question',
                    title: NotarizationRequestDetailPage.message.confirmTittle,
                    html: NotarizationRequestDetailPage.message.confirmText,
                    ...AppSettings.sweetAlertOptions(true)
                });

                if (isConfirmed) {
                    $("#global_loader").addClass("show");
                    if (!NotarizationRequestDetailPage.variables.isCreatePaymentTransaction) {
                        //Lấy lại detail để ra số tiền
                        /*                        const responseDetail = await httpService.getAsync(ApiRoutes.NotarizationRequest.v1.Detail(NotarizationRequestDetailPage.variables.id));*/
                        //let requestObj = {
                        //    notarizationRequestId: NotarizationRequestDetailPage.variables.id,
                        //    paymentMethodId: $('input[name="step5_paymentMethod"]:checked').val(),
                        //    paymentStatusId: AppSettings.paymentStatus.NOT_PAY_YET,
                        //    amount: responseDetail.resources.totalFee,
                        //    paidAt: new Date().toISOString(),
                        //    note: $("#step5_payment_note").val() || "",
                        //}
                        //const response = await httpService.postAsync(ApiRoutes.NotarizationRequest.v1.AddPaymentTransaction, requestObj);
                        //if (response?.isSucceeded) {
                        //    const successText = NotarizationRequestDetailPage.message.submittedDocument;
                        //    toastr.success(NotarizationRequestDetailPage.message.successTitle, successText);
                        //    //Cập nhật step
                        //    NotarizationRequestDetailPage.variables.currentStep = 6;
                        //}
                        //else isSuccess = false;

                        let notarizationRequestAttachments = [];

                        //Lấy tài liệu lời chứng
                        if (NotarizationRequestDetailPage.variables.requestTypeId != AppSettings.notarizationRequestType.NORMAL) {
                            const attachmentCertificateDocument = {
                                id: $(".step5-certificate-document-item").data("attach-document-id") || 0,
                                fileId: $(".step5-certificate-document-item").data("fileupload-id"),
                                attachmentType: AppSettings.AttachmentType.CERTIFICATE_DOCUMENT,
                            };
                            notarizationRequestAttachments.push(attachmentCertificateDocument);
                        }
                        //Lấy tài liệu của hợp đồng
                        const attachmentNotarizationDocument = {
                            id: $(".step5-notarization-document-item").data("attach-document-id") || 0,
                            fileId: $(".step5-notarization-document-item").data("fileupload-id"),
                            attachmentType: AppSettings.AttachmentType.NOTARY_DOCUMENT,
                        };
                        notarizationRequestAttachments.push(attachmentNotarizationDocument);

                        //Lấy danh sách tài liệu khác
                        $(".step5-other-document-item .notarization-item-file").each(function () {
                            var fileId = $(this).data("file-id");
                            if (fileId) {
                                var attachmentObj = {
                                    id: $(this).data("attach-document-id") || 0,
                                    fileId: fileId,
                                    attachmentType: AppSettings.AttachmentType.OTHER_DOCUMENT,
                                };
                                notarizationRequestAttachments.push(attachmentObj);
                            }
                        });
                        var requestObj = {
                            id: NotarizationRequestDetailPage.variables.id,
                            notarizationRequestAttachments: notarizationRequestAttachments
                        }
                        console.log(requestObj)
                        const response = await httpService.putAsync(ApiRoutes.NotarizationRequest.v1.AttachDocuments, requestObj);
                        if (response?.isSucceeded) {
                            const successText = NotarizationRequestDetailPage.message.submittedDocument;
                            toastr.success(NotarizationRequestDetailPage.message.successTitle, successText);
                            //Cập nhật step
                            NotarizationRequestDetailPage.variables.currentStep = 6;
                        }
                    }

                }
                else isSuccess = false
            } catch (e) {
                isSuccess = false;
                console.log(e);
            }
        }

        if (isSuccess && (isSuccess = await initStep6())) {
            disableFormControls("#form_step5");
        }

        $("#global_loader").removeClass("show");
        return isSuccess;
    }

    //[step6]
    async function initStep6() {
        let isSuccess = true;
        //load data requestId
        try {
            //load data detail hồ sơ
            const responseDetail = await httpService.getAsync(ApiRoutes.NotarizationRequest.v1.Detail(NotarizationRequestDetailPage.variables.id));
            let dataDetail = responseDetail.resources;

            NotarizationRequestDetailPage.variables.requestCode = dataDetail.requestCode;

            //nếu ký tại ngoài
            if (dataDetail.isOutsideNotary) {
                $(".step6-sign-location").show();
                $("#step6_sign_location").text(dataDetail.location || "");
            }
            else {
                $(".step6-sign-location").hide();
                $("#step6_sign_location").text("");
            }

            //nếu là công chứng thường
            if (dataDetail.notarizationRequestType.id == AppSettings.notarizationRequestType.NORMAL) {
                $(".step6-certificate-content").hide();
            }

            $("#step6_notarizationNumber").val(dataDetail.notarizationNumber);
            $("#step6_documentTypeName").text(dataDetail.documentType.name);

            if (dataDetail.notarizationBook) {
                $("#step6_notarizationBookId").val(dataDetail.notarizationBook.id).trigger("change");
            }
            else {
                $("#step6_notarizationBookId").val("").trigger("change");
            }

            $("#step6_archiveLocation").val(dataDetail.archiveLocation);
            $("#step6_requestTypeName").text(dataDetail.notarizationRequestType.name);
            $("#step6_notaryPhoneNumber").text(dataDetail.notaryPhoneNumber || "---");
            $(".step6-notaryPhoneNumber").toggleClass("d-none", dataDetail.notarizationRequestType.id != AppSettings.notarizationRequestType.ONLINE);

            //disabled form nếu đã hoàn thành
            if (NotarizationRequestDetailPage.variables.statusId == AppSettings.NotarizationRequestStatus.COMPLETED) {
                disableFormControls("#form_step6");
                $("#btn_complete").hide();
            }

            //Nếu requesterId = creatorId thì ẩn
            if (dataDetail.requester.id == dataDetail.createdBy) {
                $(".step6-creator-content").removeClass("d-flex").hide();
            }
            else {
                //Lấy thông tin người tạo
                $("#step6_creator_name").text(dataDetail.createdUser.fullName),
                    $("#step6_creator_phoneNumber").text(dataDetail.createdUser.phoneNumber ?? "---");
                $("#step6_creator_identityNumber").text(dataDetail.createdUser.identityNumber ?? "---");
                const roleNames = dataDetail.createdUser.roles.map(r => r.name).join(", ");
                $("#step6_creator_position").text(roleNames || "---");
            }

            //lấy thông tin office
            $("#step6_creator_officeName").text(dataDetail.office.name);
            $("#step6_creator_officeAddress").text(dataDetail.office.address);
            $("#step6_creator_officePhoneNumber").text(dataDetail.office.phone ?? "---");

            //lấy thông tin staff (đã có trong detail)
            $("#step6_staff_name").text(dataDetail.staff.fullName);
            $("#step6_staff_phoneNumber").text(dataDetail.staff.phoneNumber ?? "---");
            $("#step6_staff_identityNumber").text(dataDetail.staff.identityNumber ?? "---");
            const roleStaffNames = dataDetail.staff.roles.map(r => r.name).join(", ");
            $("#step6_staff_position").text(roleStaffNames || "---");

            //Giá trị tài sản
            $("#step6_transactionValue").text(AppUtils.numberWithCommas(dataDetail.transactionValue));

            //Phí công chứng
            let feeRecordNotarizationFee = dataDetail.feeRecords.find(x => x.type === AppSettings.feeRecordType.FIXED_FEE).amount || 0;
            $("#step6_notarizationFee").text(AppUtils.numberWithCommas(feeRecordNotarizationFee));

            //Thù lao công chứng
            let feeRecordRemunerationFee = dataDetail.feeRecords.find(x => x.type === AppSettings.feeRecordType.SERVICE_FEE).amount || 0;
            $("#step6_remunerationFee").text(AppUtils.numberWithCommas(feeRecordRemunerationFee));

            //Phí khác
            $("#step6_otherFees").text(
                AppUtils.numberWithCommas(
                    dataDetail.feeRecords
                        .filter(x => x.type == AppSettings.feeRecordType.ADDITIONAL_SERVICE_FEE)
                        .reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
                )
            );
            //Tổng phí
            $("#step6_totalFee").text(AppUtils.numberWithCommas(dataDetail.totalFee));


            ////load data requesterId
            let responseRequester = await httpService.getAsync(ApiRoutes.User.v1.Detail(NotarizationRequestDetailPage.variables.requesterId));
            let requesterData = responseRequester.resources;
            Object.keys(requesterData).forEach(key => {
                const selector = `#step6_requester_${key}`;
                const value = requesterData[key] || "---";
                $(selector).text(value);
            });
            $("#step6_requester_identity_front").attr("src", requesterData.frontOfIdentityCardFile ? requesterData.frontOfIdentityCardFile.url : "/admin/assets/media/pages/notarization-request-detail/citizen-front.png");
            $("#step6_requester_identity_back").attr("src", requesterData.backOfIdentityCardFile ? requesterData.backOfIdentityCardFile.url : "/admin/assets/media/pages/notarization-request-detail/citizen-back.png");


            $("#step6_requester_name").text(`${requesterData.firstName} ${requesterData.lastName}`);


            //lấy thông tin tài liệu tải lên
            let responseSubmitedDocuments = await httpService.getAsync(ApiRoutes.NotarizationRequest.v1.ListSubmitedDocuments(NotarizationRequestDetailPage.variables.id));
            renderDocumentStep6(responseSubmitedDocuments.resources.requiredDocuments);
            renderOtherDocumentStep6(responseSubmitedDocuments.resources.otherDocuments);
            if (responseSubmitedDocuments.resources.blockingInformations.length == 0) {
                $(".step6-blockingInformation").removeClass("d-flex").hide();
            }
            else {
                renderBlockingInformation(responseSubmitedDocuments.resources.blockingInformations, $("#step6_blockingInformation"));
            }

            ////load data paymentTransactions
            //let responsePaymentTransactions = await httpService.getAsync(ApiRoutes.NotarizationRequest.v1.ListPaymentTransactions(NotarizationRequestDetailPage.variables.id));
            //if (responsePaymentTransactions.resources.length > 0) {
            //    let paymentTransactionsData = responsePaymentTransactions.resources[0];
            //    $("#step6_payment_methodName").text(paymentTransactionsData.paymentMethod.name);
            //    if (paymentTransactionsData.paymentMethod.id != AppSettings.paymentMethod.TRANSFER) {
            //        $("#step6_qr_transfer").hide();
            //    }
            //    $("#step6_qr_image").attr("src", `https://img.vietqr.io/image/VCB-0031000274583-compact2.png?amount=${paymentTransactionsData.amount}`);
            //}

            //lấy attach file văn bản công chứng và ảnh ký văn bản giao dịch
            let responseAttachments = await httpService.getAsync(ApiRoutes.NotarizationRequest.v1.ListAttachments(NotarizationRequestDetailPage.variables.id));
            if (responseAttachments.resources.length > 0) {
                $('#step6_list_video').html("");
                $('#step6_notary_document').html("");
                $("#step6_notary_notary_other_docs").html("");
                $("#step6_notary_notary_testimony").html("");

                responseAttachments.resources.forEach(async (item) => {
                    const file = item.notarizationRequestAttachmentFile;
                    const type = item.attachmentType;
                    if (type == AppSettings.AttachmentType.SIGNATURE) {
                        const imgElement = $(`<!--begin::Overlay-->
                            <div class="d-block overlay card-rounded overflow-hidden">
                                <!--begin::Image-->
                                <img src="${file.url}" alt="${file.fileName}" class="overlay-wrapper bgi-no-repeat bgi-position-center bgi-size-cover h-150px"/>
                                <!--end::Image-->

                                <!--begin::Action-->
                                <a class="overlay-layer bg-dark bg-opacity-25 shadow align-items-center justify-content-center " data-fslightbox="file_gallery" href="${file.url}" data-type="image">
					                <i class="bi bi-eye-fill text-white fs-3x"></i>
					            </a>
                                <!--end::Action-->
                            </div>
                            <!--end::Overlay-->`);
                        $('#step6_list_video').append(imgElement);
                    }
                    else if (type == AppSettings.AttachmentType.NOTARY_DOCUMENT) {
                        const docItem = $(`
                            <div class="notarization-item-file d-flex justify-content-between align-items-center">
                                <div class="d-flex gap-10px align-items-center">
                                    <div class="icon-file">
                                        <img src="/admin/assets/media/file-type-icons/pdf.png">
                                    </div>
                                    <a href="/notarization-request/${NotarizationRequestDetailPage.variables.id}/file/${file.id}/${AppUtils.getPathSegment(5, file.fileKey)}" target="_blank">${file.fileName}</a>
                                </div>
                                <p>${formatToKB(file.fileSize)}</p>
                            </div>
                        `);
                        $('#step6_notary_document').append(docItem);
                        await readFileNotarizationDocument(file, $(".step6-signature-notarization-document-form"));
                    }
                    else if (type == AppSettings.AttachmentType.OTHER_DOCUMENT) {
                        const docItem = $(`
                            <div class="notarization-item-file d-flex justify-content-between align-items-center">
                                <div class="d-flex gap-10px align-items-center">
                                    <div class="icon-file">
                                        <img src="/admin/assets/media/file-type-icons/pdf.png">
                                    </div>
                                    <a href="/notarization-request/${NotarizationRequestDetailPage.variables.id}/file/${file.id}/${AppUtils.getPathSegment(5, file.fileKey)}" target="_blank">${file.fileName}</a>
                                </div>
                                <p>${formatToKB(file.fileSize)}</p>
                            </div>
                        `);
                        $('#step6_notary_notary_other_docs').append(docItem);
                    }
                    else if (type == AppSettings.AttachmentType.CERTIFICATE_DOCUMENT) {
                        const docItem = $(`
                            <div class="notarization-item-file d-flex justify-content-between align-items-center">
                                <div class="d-flex gap-10px align-items-center">
                                    <div class="icon-file">
                                        <img src="/admin/assets/media/file-type-icons/pdf.png">
                                    </div>
                                    <a href="/notarization-request/${NotarizationRequestDetailPage.variables.id}/file/${file.id}/${AppUtils.getPathSegment(5, file.fileKey)}" target="_blank">${file.fileName}</a>
                                </div>
                                <p>${formatToKB(file.fileSize)}</p>
                            </div>
                        `);
                        $('#step6_notary_certificate_document').append(docItem);
                        await readFileNotarizationDocument(file, $(".step6-signature-certificate-document-form"));
                    }
                });

                refreshFsLightbox();
            }


        } catch (e) {
            console.log(e);
            isSuccess = false;
        }

        if (NotarizationRequestDetailPage.variables.currentStep > 1) {
            $(".reject-button").addClass("d-none");
        }

        return isSuccess;

        //load data tài liệu
    }
    function renderDocumentStep6(resources) {
        let html = ``;
        resources.forEach((group) => {
            if (!group.forParty) return;

            html += `<h3 class="item-category-title mt-5">${group.forParty}</h3>`;

            group.requiredDocuments.forEach((doc, index) => {
                const submittedDoc = doc;
                const selectedType = doc.submittedDocumentType || "ORIGINAL"; // fallback
                const fileUploads = doc.fileUploads;
                let imgFilesHtml = '';
                let pdfFilesHtml = '';

                html += `
            <div class="step6-document-item pb-12px border-bottom-custom"
                data-submitdoc-id="${submittedDoc.id}"
                data-required="${submittedDoc.isRequired}"
                data-submitted="${fileUploads.length > 0}"
                data-fileupload-id="${fileUploads.map(f => f.id).join(',')}"
                data-doc-type="${selectedType}">

                <div class="d-flex flex-row gap-10px ${doc.description ? 'align-items-start' : 'align-items-center'}"> 
                    <p class="index-item">${index + 1}</p>
                    <div class="d-flex gap-10px flex-column documentNecessary-item">
                        <h4 class="${submittedDoc.isRequired ? 'required' : ''}">${doc.name}</h4>
                        ${doc.description ? `<p>${doc.description}</p>` : ""}
                    </div>
                </div>`;

                fileUploads.forEach(file => {
                    const isPdf = file.fileType == NotarizationRequestDetailPage.constants.fileType.pdf;
                    let itemHtml = ``
                    if (!isPdf) {
                        itemHtml = `<div class="notarization-item-file d-flex justify-content-between align-items-center mgt-10px flex-column w-fit-content gap-10px bg-white"
                            data-doc-id="${submittedDoc.id}" data-file-id="${file.id}">
                            <div class="d-flex gap-10px align-items-center">
                                <!--begin::Overlay-->
                                <div class="d-block overlay card-rounded overflow-hidden">
                                    <!--begin::Image-->
                                    <img src="${file.url}" class="overlay-wrapper bgi-no-repeat bgi-position-center bgi-size-cover h-150px" />
                                    <!--end::Image-->
                                    <!--begin::Action-->
                                    <a class="overlay-layer bg-dark bg-opacity-25 shadow align-items-center justify-content-center " data-fslightbox="file_gallery" href="${file.url}" data-type="image">
                                        <i class="bi bi-eye-fill text-white fs-3x"></i>
                                    </a>
                                    <!--end::Action-->
                                </div>
                                <!--end::Overlay-->
                            </div>
                        </div>`
                    }
                    else {
                        itemHtml = `<div class="notarization-item-file d-flex justify-content-between align-items-center mgt-10px" 
                             data-doc-id="${submittedDoc.id}" data-file-id="${file.id}">
                            <div class="d-flex gap-10px align-items-center">
                                <div class="icon-file"><img src="/admin/assets/media/file-type-icons/pdf.png"></div>
                                <a href="/notarization-request/${NotarizationRequestDetailPage.variables.id}/file/${file.id}/${AppUtils.getPathSegment(5, file.fileKey)}" class="upload-file-link" target="_blank">${file.fileName}</a>
                            </div>
                            <div class="d-flex align-items-center gap-10px">
                                <p class="upload-file-size">${formatToKB(file.fileSize)}</p>
                            </div>
                        </div>`
                    }
                    if (!isPdf) imgFilesHtml += itemHtml;
                    else pdfFilesHtml += itemHtml;
                });
                // Thêm hai wrapper chứa danh sách file tương ứng
                html += `<div class="submitted-pdf d-flex flex-column">${pdfFilesHtml}</div>`;
                html += `<div class="submitted-img d-flex flex-row gap-10px flex-wrap">${imgFilesHtml}</div>`;
                html += `</div>`;
            });
        });
        $("#step6_list_document").html(html);
        refreshFsLightbox();
    }

    function renderOtherDocumentStep6(resources) {
        let html = ``;
        resources.forEach((group, index) => {
            if (!group.forParty) return;
            html += `<h3 class="item-category-title mt-5">${group.forParty}</h3>`;
            const submittedDoc = group;
            const selectedType = group.submittedDocumentType || "ORIGINAL"; // fallback
            const fileUploads = group.fileUploads;
            let imgFilesHtml = '';
            let pdfFilesHtml = '';

            html += `
            <div class="step6-document-item pb-12px border-bottom-custom"
                data-submitdoc-id="${submittedDoc.id}"
                data-required="${submittedDoc.isRequired}"
                data-submitted="${fileUploads.length > 0}"
                data-fileupload-id="${fileUploads.map(f => f.id).join(',')}"
                data-doc-type="${selectedType}">

                <div class="d-flex flex-row gap-10px align-items-center"> 
                    <p class="index-item">${index + 1}</p>
                    <div class="d-flex gap-10px flex-column documentNecessary-item">
                        <h4 class="${submittedDoc.isRequired ? 'required' : ''}">${group.name}</h4>
                    </div>
                </div>`;

            fileUploads.forEach(file => {
                const isPdf = file.fileType == NotarizationRequestDetailPage.constants.fileType.pdf;
                let itemHtml = ``
                if (!isPdf) {
                    itemHtml = `<div class="notarization-item-file d-flex justify-content-between align-items-center mgt-10px flex-column w-fit-content gap-10px bg-white"
                            data-doc-id="${submittedDoc.id}" data-file-id="${file.id}">
                            <div class="d-flex gap-10px align-items-center">
                                <!--begin::Overlay-->
                                <div class="d-block overlay card-rounded overflow-hidden">
                                    <!--begin::Image-->
                                    <img src="${file.url}" class="overlay-wrapper bgi-no-repeat bgi-position-center bgi-size-cover h-150px" />
                                    <!--end::Image-->
                                    <!--begin::Action-->
                                    <a class="overlay-layer bg-dark bg-opacity-25 shadow align-items-center justify-content-center " data-fslightbox="file_gallery" href="${file.url}" data-type="image">
                                        <i class="bi bi-eye-fill text-white fs-3x"></i>
                                    </a>
                                    <!--end::Action-->
                                </div>
                                <!--end::Overlay-->
                            </div>
                        </div>`
                }
                else {
                    itemHtml = `<div class="notarization-item-file d-flex justify-content-between align-items-center mgt-10px" 
                             data-doc-id="${submittedDoc.id}" data-file-id="${file.id}">
                            <div class="d-flex gap-10px align-items-center">
                                <div class="icon-file"><img src="/admin/assets/media/file-type-icons/pdf.png"></div>
                                <a href="/notarization-request/${NotarizationRequestDetailPage.variables.id}/file/${file.id}/${AppUtils.getPathSegment(5, file.fileKey)}" class="upload-file-link" target="_blank">${file.fileName}</a>
                            </div>
                            <div class="d-flex align-items-center gap-10px">
                                <p class="upload-file-size">${formatToKB(file.fileSize)}</p>
                            </div>
                        </div>`
                }
                if (!isPdf) imgFilesHtml += itemHtml;
                else pdfFilesHtml += itemHtml;
            });
            // Thêm hai wrapper chứa danh sách file tương ứng
            html += `<div class="submitted-pdf d-flex flex-column">${pdfFilesHtml}</div>`;
            html += `<div class="submitted-img d-flex flex-row gap-10px flex-wrap">${imgFilesHtml}</div>`;
            html += `</div>`;
        });

        $("#step6_list_document_other").html(html);
        refreshFsLightbox();

    }

    async function saveDataStep6() {
        let isSuccess = true;
        if (NotarizationRequestDetailPage.variables.currentStep == 6) {
            try {
                // phân quyền văn thư, quản lý cấp vp
                if (!canSaveStep(NotarizationRequestDetailPage.variables.steps.step6, NotarizationRequestDetailPage.variables.currentUserRoles)) {
                    isSuccess = false;
                    return isSuccess;
                }
                const { isConfirmed } = await Swal.fire({
                    icon: 'question',
                    title: NotarizationRequestDetailPage.message.confirmTittle,
                    html: NotarizationRequestDetailPage.message.confirmComplete,
                    ...AppSettings.sweetAlertOptions(true)
                });

                if (isConfirmed) {
                    $("#global_loader").addClass("show");
                    let requestObj = {
                        id: NotarizationRequestDetailPage.variables.id,
                        notarizationNumber: $("#step6_notarizationNumber").val(),
                        notarizationBookId: $("#step6_notarizationBookId").val(),
                        archiveLocation: $("#step6_archiveLocation").val()
                    }
                    $("#global_loader").removeClass("show");
                    const response = await httpService.putAsync(ApiRoutes.NotarizationRequest.v1.Complete, requestObj);
                    if (response?.isSucceeded) {
                        const successText = NotarizationRequestDetailPage.message.submittedDocument;
                        toastr.success(NotarizationRequestDetailPage.message.successTitle, successText);
                    }
                    else isSuccess = false;

                }
                else isSuccess = false;

            } catch (e) {
                isSuccess = false;
            }
        }

        if (isSuccess) {
            disableFormControls("#form_step6");
            $("#btn_complete").hide();
            Swal.fire({
                icon: 'success',
                title: 'Thành công',
                text: 'Bạn hoàn tất hồ sơ công chứng',
                confirmButtonText: 'Xem chi tiết hồ sơ',
                cancelButtonText: 'OK',
                showCancelButton: true,
                customClass: {
                    confirmButton: "btn btn-primary",
                    cancelButton: "btn btn-active-light"
                }
            })
                .then((result) => {
                    if (result.isConfirmed) {
                        let url = `/notarization-request/view/${NotarizationRequestDetailPage.variables.requestCode}`
                        window.open(url, '_blank');
                    }
                });
        }
        $("#global_loader").removeClass("show");
        return isSuccess;
    }

    //[Shared functions]
    function canSaveStep(stepKey, rolesOfUser, isShowAlert = true) {
        // Hàm kiểm tra quyền cho 1 step bất kỳ
        const allowedRoles = NotarizationRequestDetailPage.variables.roleValidator[stepKey] || [];
        var isEditable = allowedRoles.some(r => rolesOfUser.includes(r));

        //check quyền
        var listUpdatePermissions = [NotarizationRequestDetailPage.variables.steps.reject,
        NotarizationRequestDetailPage.variables.steps.step2,
        NotarizationRequestDetailPage.variables.steps.step3,
        NotarizationRequestDetailPage.variables.steps.step4,
        NotarizationRequestDetailPage.variables.steps.step5,
        NotarizationRequestDetailPage.variables.steps.step6]

        if (listUpdatePermissions.includes(stepKey)) {
            //Nếu không trong văn phòng đó thì cũng không được
            if (NotarizationRequestDetailPage.variables.notarizationRequestOfficeId != NotarizationRequestDetailPage.variables.currentUserOfficeId) {
                isEditable = false;
            }

            //const isOnlyNotary = NotarizationRequestDetailPage.variables.currentUserRoles.length === 1 && NotarizationRequestDetailPage.variables.currentUserRoles.includes(AppSettings.roles.NOTARY_STAFF);
            //const isNotCreator = NotarizationRequestDetailPage.variables.currentUserId !== NotarizationRequestDetailPage.variables.staffId;
            //if (isOnlyNotary && isNotCreator) {
            //    isEditable = false;
            //}
        }

        if (!isEditable && isShowAlert) {
            Swal.fire({
                icon: "warning",
                title: NotarizationRequestDetailPage.message.warningTitle,
                text: NotarizationRequestDetailPage.message.forbiddenText,
                ...AppSettings.sweetAlertOptions(false)
            });
        }
        return isEditable;
        return true;
    }

    function isValidFile(file, category) {
        const ext = "." + file.name.split(".").pop().toLowerCase();
        const allowedExts = AppSettings.fileManagerSettings.ALLOWED_EXTENSIONS_BY_CATEGORY[category];
        return allowedExts && allowedExts.includes(ext);
    }

    function formatToKB(bytes) {
        return AppUtils.byteConverter(bytes, 2, "MB");
    }

    async function uploadFile(files, category, isExtractText = false, isAddNew = false) {
        //check total file
        if (files.length > AppSettings.fileManagerSettings.MAXIMUM_TOTAL_FILES_UPLOAD) {
            Swal.fire({
                icon: "warning",
                title: NotarizationRequestDetailPage.messagesFileManager.warningTitle,
                html: NotarizationRequestDetailPage.messagesFileManager.uploadLimitTotal,
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
            if (!isValidFile(file, category)) {
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
                title: NotarizationRequestDetailPage.messagesFileManager.warningTitle,
                html: NotarizationRequestDetailPage.messagesFileManager.uploadLimitTotalSize,
                ...AppSettings.sweetAlertOptions(false)
            })

            return;
        }

        //check valid file
        if (fileInvalidExtension.length > 0) {
            Swal.fire({
                icon: "warning",
                title: NotarizationRequestDetailPage.messagesFileManager.warningTitle,
                html: NotarizationRequestDetailPage.messagesFileManager.uploadInvalidFile,
                ...AppSettings.sweetAlertOptions(false)
            })

            return;
        }

        //check image valid
        if (imageInvalid.length > 0) {
            Swal.fire({
                icon: "warning",
                title: NotarizationRequestDetailPage.messagesFileManager.warningTitle,
                html: NotarizationRequestDetailPage.messagesFileManager.uploadLimitImageSize,
                ...AppSettings.sweetAlertOptions(false)
            })

            return;
        }

        const formData = new FormData();
        formData.append("category", category);
        //formData.append("DirectionId", NotarizationRequestDetailPage.variables.requesterId);
        if (category !== AppSettings.fileCategoryUpload.IDENTITY_CARD) {
            formData.append("directionId", NotarizationRequestDetailPage.variables.id);
        }
        formData.append("isExtractText", isExtractText);
        formData.append("isAddNew", isAddNew);


        files.forEach(file => {
            formData.append("files", file)
        });
        try {
            $("#global_loader").addClass("show");
            const response = await httpService.postFormDataAsync(ApiRoutes.FileManager.v1.UploadByCategory, formData);
            if (response?.isSucceeded) {
                Swal.fire({
                    icon: "success",
                    title: NotarizationRequestDetailPage.messagesFileManager.successTitle,
                    html: NotarizationRequestDetailPage.messagesFileManager.uploadSucces,
                    ...AppSettings.sweetAlertOptions(false)
                })
                return response.resources;
            }

        } catch (e) {
            Swal.fire({
                icon: "error",
                title: NotarizationRequestDetailPage.messagesFileManager.failTitle,
                html: NotarizationRequestDetailPage.messagesFileManager.uploadError,
                ...AppSettings.sweetAlertOptions(false)
            })
        }
        finally {
            $("#global_loader").removeClass("show");
        }
    }
    function disableFormControls(formSelector) {
        const $form = $(formSelector);
        $form.find('input, textarea, select').prop('disabled', true);
        $form.find('button').hide();
        //$form.find('a[download]').hide();
    }

    function checkValidUsername() {
        const username = $("#addUser_username").val();
        const regex = /^[a-zA-Z0-9]{6,30}$/;
        return regex.test(username);
    }

    function checkValidIdentityNumber() {
        const input = $("#addUser_identityNumber").val();
        const identityNumberPattern = /^\d{12}$/;       // CCCD: 12 chữ số
        return identityNumberPattern.test(input);
    }

    function checkValidTaxCode() {
        var taxCode = $("#addUser_taxCode").val().trim();
        if (taxCode == "") {
            return true;
        }
        // Regex: 10 chữ số hoặc 10 chữ số + dấu gạch ngang + 3 chữ số
        const regex = /^\d{10}(-\d{3})?$/;
        return regex.test(taxCode);
    }

    function convertNumberToVietnameseWords(number) {
        const ChuSo = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
        const Tien = ["", "nghìn", "triệu", "tỷ", "nghìn tỷ", "triệu tỷ", "tỷ tỷ"];

        function DocSo3ChuSo(baso) {
            let tram, chuc, donvi, KetQua = "";
            tram = Math.floor(baso / 100);
            chuc = Math.floor((baso % 100) / 10);
            donvi = baso % 10;

            if (tram === 0 && chuc === 0 && donvi === 0) return "";

            if (tram !== 0) {
                KetQua += ChuSo[tram] + " trăm";
                if (chuc === 0 && donvi !== 0) KetQua += " linh";
            }

            if (chuc !== 0 && chuc !== 1) {
                KetQua += " " + ChuSo[chuc] + " mươi";
                if (chuc !== 0 && donvi === 1) KetQua += " mốt";
            } else if (chuc === 1) {
                KetQua += " mười";
            }

            if (donvi !== 0) {
                if (chuc !== 0 && chuc !== 1 && donvi === 5) {
                    KetQua += " lăm";
                } else if (chuc === 0 && donvi === 5) {
                    KetQua += " năm";
                } else {
                    KetQua += " " + ChuSo[donvi];
                }
            }

            return KetQua.trim();
        }

        function DocTienBangChu(SoTien) {
            if (SoTien === 0) return "Không đồng";

            let lan = 0, i = 0;
            let so = SoTien;
            let KetQua = "", tmp = [];

            while (so > 0) {
                tmp[lan] = so % 1000;
                so = Math.floor(so / 1000);
                lan++;
            }

            for (i = lan - 1; i >= 0; i--) {
                let tien = tmp[i];
                if (tien > 0) {
                    KetQua += DocSo3ChuSo(tien) + " " + Tien[i] + " ";
                }
            }

            KetQua = KetQua.trim();
            return KetQua.charAt(0).toUpperCase() + KetQua.slice(1) + " đồng";
        }

        return DocTienBangChu(Number(number));
    }

    function getValueByPath(obj, path) {
        return path.split('.').reduce((acc, key) => acc?.[key], obj);
    }

    async function initStep(step) {
        const initFunc = NotarizationRequestDetailPage.variables.initStepFunctions[step];
        if (initFunc) {
            const success = await initFunc(); // mỗi saveDataStepX cần return true/false
            if (success) {
                return true;
            }
        } else {
            return false;
        }
    }

    function generatePassword(length) {
        if (length < 4) {
            console.log("password cần 4 ký tự ít nhất")
        }

        const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const lower = "abcdefghijklmnopqrstuvwxyz";
        const numbers = "0123456789";
        const symbols = "!@#$%^&*()-_=+[]{}|;:,.<>?";

        const all = upper + lower + numbers + symbols;

        // Đảm bảo mỗi loại có ít nhất 1 ký tự
        let password = [
            upper[Math.floor(Math.random() * upper.length)],
            lower[Math.floor(Math.random() * lower.length)],
            numbers[Math.floor(Math.random() * numbers.length)],
            symbols[Math.floor(Math.random() * symbols.length)]
        ];

        // Bổ sung thêm ký tự ngẫu nhiên cho đủ độ dài
        for (let i = 4; i < length; i++) {
            password.push(all[Math.floor(Math.random() * all.length)]);
        }

        // Trộn ký tự ngẫu nhiên để không đoán được vị trí
        return password.sort(() => Math.random() - 0.5).join('');
    }

    //qrcode
    function generateQRCode(link, containerSelector, width = 100, height = 100) {
        // Xóa QR cũ (nếu có)
        $(containerSelector).empty();

        // Tạo 1 div chứa QR
        const $wrapper = $('<div class="qr-wrapper cursor-pointer"></div>');
        const $wrapperHidden = $('<div class="qr-wrapper-hidden d-none"></div>');

        $(containerSelector).append($wrapper);
        $(containerSelector).append($wrapperHidden);


        // Tạo QR mới
        new QRCode($wrapper[0], {
            text: link,
            width: width,
            height: height,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
        new QRCode($wrapperHidden[0], {
            text: link,
            width: 300,
            height: 300,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
    }
    function generateFileItem(item, isUpload = true) {
        const createdDate = moment(item.createdDate).format("DD/MM/YYYY HH:mm:ss");
        const thumbContent = generateThumbContent(item, isUpload);
        const ext = item.fileName.split(".").pop().toUpperCase();

        let html = "";
        if (!item.fileType.includes(`image`)) {
            html = `<div class="image-input w-150px file_gallery_item position-relative rounded border shadow-sm" data-file-upload-id="${item.id}" title="${item.fileName} Kích cỡ: ${AppUtils.byteConverter(item.fileSize)
                } Ngày tạo: ${createdDate} ">
							<div class="overlay overflow-hidden">
                            <a download href="${isUpload ? item.fileUrl : item.url}" target="_blank">${thumbContent}</a>
							</div>
							<div class="bg-dark fs-7 position-absolute start-0 top-0 text-white px-2">${ext}</div>
                            <div class="item_title p-2 fs-8">
                                <a download href="${item.fileUrl}" target="_blank">${item.fileName}</a>
                                <div class="text-muted">${AppUtils.byteConverter(item.fileSize)}</div>
                            </div>
                           <!-- nút xoá -->
                           ${isUpload ? `<span class="btn-delete-upload btn btn-icon btn-circle btn-color-muted btn-active-color-primary w-25px h-25px bg-body shadow"
                                    data-bs-toggle="tooltip" data-kt-image-input-action="remove" data-file-upload-id="${item.id} title="Xoá">
                                 <i class="ki-outline ki-cross fs-3"></i>
                           </span>` : ``}

					</div>`;
        }
        else {
            html = `<div class="image-input w-150px file_gallery_item position-relative rounded border shadow-sm" data-file-upload-id="${item.id}" title="${item.fileName} Kích cỡ: ${AppUtils.byteConverter(item.fileSize)
                } Ngày tạo: ${createdDate} ">
							<div class="overlay overflow-hidden">
                                ${thumbContent}
							</div>
							<div class="bg-dark fs-7 position-absolute start-0 top-0 text-white px-2">${ext}</div>
                            <div class="item_title p-2 fs-8">
                                ${item.fileName}
                                <div class="text-muted">${AppUtils.byteConverter(item.fileSize)}</div>
                            </div>
                           <!-- nút xoá -->
                           ${isUpload ? `<span class="btn-delete-upload btn btn-icon btn-circle btn-color-muted btn-active-color-primary w-25px h-25px bg-body shadow"
                                    data-bs-toggle="tooltip" data-kt-image-input-action="remove" data-file-upload-id="${item.id} title="Xoá">
                                 <i class="ki-outline ki-cross fs-3"></i>
                           </span>` : ``}
					</div>`;
        }
        return html;
    }

    function generateThumbContent(item, isUpload) {
        const ext = item.fileName.split('.').pop();
        let thumbContent = "";
        if (item.fileType.includes("image")) {
            thumbContent = `<img class="item_img h-150px" alt="${item.fileName}" src="${isUpload ? item.fileUrl : item.url}"/>
							<a class="overlay-layer bg-dark bg-opacity-25 shadow align-items-center justify-content-center " data-fslightbox="file_gallery" href="${isUpload ? item.fileUrl : item.url}" data-type="image">
								<i class="bi bi-eye-fill text-white fs-2x"></i>
							</a>`;
        }
        else if (item.fileType.includes("video")) {
            thumbContent = `<div class="d-flex thumb-icon d-block overlay">
                                <span><i class="fa-solid fa-video text-primary"></i></span>
                                <a data-fslightbox="gallery-file" href="${isUpload ? item.fileUrl : item.url}" class="overlay-layer card-rounded bg-dark bg-opacity-25" data-type="video">
                                    <i class="bi bi-eye-fill text-white fs-2x"></i>
                                </a>
                            </div>`;
        }
        else if (item.fileType.includes("audio")) {
            thumbContent = `<div class="d-flex thumb-icon d-block overlay">
                                <span><i class="fa-solid fa-headphones text-primary"></i></span>
                                <a data-fslightbox="gallery-file" href="${isUpload ? item.fileUrl : item.url}" class="overlay-layer card-rounded bg-dark bg-opacity-25" data-type="audio">
                                    <i class="bi bi-eye-fill text-white fs-2x"></i>
                                </a>
                            </div>`;
        }
        else if (item.fileType.includes("text")) {
            thumbContent = `<div class="d-flex thumb-icon h-150px bg-primary bg-opacity-25">
                                <span><i class="fa-solid fa-file-lines text-primary" > </i></span>
                            </div>`;
        }
        else if (ext === "doc" || ext === "docx") {
            thumbContent = `<div class="d-flex thumb-icon h-150px bg-primary bg-opacity-25">
                                <span><i class="fa-solid fa-file-word text-primary" > </i></span>
                            </div>`;
        }
        else if (ext === "xls" || ext === "xlsx" || ext === "xlsm" || ext === "xlsb") {
            thumbContent = `<div class="d-flex thumb-icon h-150px bg-success  bg-opacity-25">
                                <span><i class="fa-solid fa-file-excel text-success" > </i></span>
                            </div>`;
        }
        else if (item.fileType.includes("pdf")) {
            thumbContent = `<div class="d-flex thumb-icon bg-danger h-150px bg-opacity-25">
                                <span><i class="fa-solid fa-file-pdf text-danger" > </i></span>
                            </div>`;
        }
        else {
            thumbContent = `<div class="d-flex thumb-icon h-150px bg-primary bg-opacity-25">
                                <span><i class="fa-solid fa-file text-primary" > </i></span>
                            </div>`;
        }
        return thumbContent;
    }
    function makeDraggable(el) {
        let isDragging = false, offsetX = 0, offsetY = 0;
        let originalPage = null;

        const container = document.getElementById("pdfCanvasContainer");

        el.addEventListener("mousedown", (e) => {
            isDragging = true;
            const rect = el.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
            originalPage = el.closest(".pdf-page-wrapper");
            el.style.zIndex = 1000;
            e.preventDefault();
        });

        document.addEventListener("mousemove", (e) => {
            if (!isDragging) return;

            // Tọa độ con trỏ chuột so với toàn bộ container (scroll)
            const containerRect = container.getBoundingClientRect();
            const mouseX = e.clientX - containerRect.left + container.scrollLeft;
            const mouseY = e.clientY - containerRect.top + container.scrollTop;

            // Tìm trang mà con trỏ đang nằm trên
            let targetPage = null;
            $(".pdf-page-wrapper").each(function () {
                const pageRect = this.getBoundingClientRect();
                const pageTop = pageRect.top - containerRect.top + container.scrollTop;
                const pageBottom = pageTop + $(this).outerHeight();

                if (mouseY >= pageTop && mouseY < pageBottom) {
                    targetPage = this;
                    return false; // break
                }
            });

            if (targetPage) {
                const pageRect = targetPage.getBoundingClientRect();
                const pageOffsetY = mouseY - (pageRect.top - containerRect.top + container.scrollTop);
                const pageOffsetX = mouseX - (pageRect.left - containerRect.left + container.scrollLeft);

                // Chặn kéo vượt khỏi trang
                const maxTop = $(targetPage).height() - $(el).outerHeight();
                const maxLeft = $(targetPage).width() - $(el).outerWidth();

                el.style.top = Math.max(0, Math.min(pageOffsetY - offsetY, maxTop)) + "px";
                el.style.left = Math.max(0, Math.min(pageOffsetX - offsetX, maxLeft)) + "px";

                // Nếu sang trang khác thì chuyển phần tử
                if (!$.contains(targetPage, el)) {
                    targetPage.appendChild(el);
                }
            }
        });

        document.addEventListener("mouseup", () => {
            isDragging = false;
        });
    }


    function updateSignatureBoxData(certData) {
        if (certData == null) {
            $(".signature-box").each(function () {
                $(this).find(".signature-note").text(`(Ký số lúc hh:mm:ss vào ngày dd/MM/yyyy)`);
                $(this).find(".sig-name").text("Họ và tên: ............... ");
                $(this).find(".sig-cccd").text(`CCCD: ...............`);
                $(this).find(".sig-cert").text(`Chứng thư số: ..............`);
                $(this).find(".sig-issuer").html(`Tổ chức chứng thực: <strong>..............</strong>`);
            });
            return;
        }
        const {
            name,
            cert_tax_code,
            cert_serial,
            cert_valid_to,
            cert_provider
        } = certData;

        const now = new Date();
        const formattedTime = now.toLocaleTimeString("vi-VN");
        const formattedDate = now.toLocaleDateString("vi-VN");

        const issuer = extractCommonName(cert_provider); // CN=Intrust...

        $(".signature-box").each(function () {
            $(this).find(".signature-note").text(`(Ký số lúc ${formattedTime} vào ngày ${formattedDate})`);
            $(this).find(".sig-name").text(name || "............... ");
            $(this).find(".sig-cccd").text(`CCCD: ${cert_tax_code || "............... "}`);
            $(this).find(".sig-cert").text(`Chứng thư số: ${cert_serial || ".............."}`);
            $(this).find(".sig-issuer").html(`Tổ chức chứng thực: <strong>${issuer}</strong>`);
        });
    }

    // Tách lấy CN=... trong cert_provider
    function extractCommonName(certProvider) {
        const match = certProvider.match(/CN=([^,]+)/);
        return match ? match[1] : certProvider;
    }

    function openBase64PdfInNewTab(base64Data) {
        // Chuyển base64 → binary
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }

        // Tạo Uint8Array và Blob
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "application/pdf" });

        // Tạo object URL và mở tab mới
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, "_blank");
    }

    // On document ready
    KTUtil.onDOMContentLoaded(async function () {
        await AppEntry.init();
        if (!NotarizationRequestDetailPage.permissionFlags.canView) {
            AppSettings.mainElements.PAGE_CONTENT.addClass("d-none");
            AppSettings.mainElements.NOT_FOUND.removeClass("d-none");
        }
        else
            NotarizationRequestDetailPage.init();
    });
})();

