"use strict";
(function () {
    // Class definition
    const NotarizationRequestDetailPage = {
        variables: {
            id: 0, //id của bản ghi hồ sơ công chứng
            statusId: 0, // trạng thái của hợp đồng công chứng
            requestCode: AppUtils.getPathSegment(2), // trạng thái của hợp đồng công chứng
            documentTypeId: 0, //id loại hợp đồng
            requesterId: 0, //id khách hàng
            requestTypeId: 0,
            certificateDefaultFileId: AppSettings.CertificateSampleFileId, //id file chứng chỉ mẫu
            notaryPhoneNumber: "",
            //staffId: 0, //id công chứng viên
            cachedUserData: [], // lưu vào khi filter khách để có thể find không cần gọi lại detail
            isLoadingDetail: false,  //khi loading detail với các hợp đồng đã tạo            
            isLoadingUserData: false, //khi loading dữ liệu user
            stepValidators: [],  //danh sách validator của các form  
            isCreatePaymentTransaction: false, //Biến xác định đã tạo transaction hay chưa
            stepper: null,
            currentStep: 1,
            lastStepIndex: 6
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
            confirmComplete: I18n.t("notarization_request", "CONFIRM_COMPLETE")

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
        init: function () {
            this.initPlugins();
            this.loadRelatedData();
            this.bindEvents();
        },
        initPlugins: function () {

        },
        bindEvents: function () {
            this.bindClickQRCode();

        },
        loadRelatedData: async function () {
            await loadDataNotarizationBook();
            await loadRelatedDetail();
            await initStep6();
            disableFormControls("#kt_stepper_example_basic");
        },
        bindClickQRCode: function () {
            $("#kt_stepper_example_basic").on("click", '.qr-wrapper', function () {
                const dataUrl = $(this).closest(".step-component-qr").find(".qr-wrapper-hidden img").attr("src"); // base64
                Swal.fire({
                    title: 'Quét mã để xem chi tiết',
                    imageUrl: dataUrl,
                    imageWidth: 300,
                    imageHeight: 300,
                    confirmButtonText: 'Đóng',
                    ...AppSettings.sweetAlertOptions(false)
                });
            });
        }
    }


    async function loadRelatedDetail() {
        $("#global_loader").addClass("show");
        if (NotarizationRequestDetailPage.variables.requestCode) {
            try {
                const response = await httpService.getAsync(ApiRoutes.NotarizationRequest.v1.DetailByRequestCode(NotarizationRequestDetailPage.variables.requestCode));
                if (response?.isSucceeded) {
                    NotarizationRequestDetailPage.variables.isLoadingDetail = true;
                    let data = response.resources;

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


                    //NotarizationRequestDetailPage.variables.staffId = data.staff.id;


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
                    //Lấy phần thông tin các bên liên quan
                    $("#step1_staff_name").text(data.staff.fullName),
                        $("#step1_staff_phoneNumber").text(data.staff.phoneNumber ?? "---");
                    $("#step1_staff_identityNumber").text(data.staff.identityNumber ?? "---");
                    $("#step1_staff_position").text("---");
                    $("#step1_staff_officeName").text(data.office.name);
                    $("#step1_staff_officeAddress").text(data.office.address);
                    $("#step1_staff_officePhoneNumber").text(data.office.phone ?? "---");

                    //Giá trị tài sản
                    $("#footer_transactionValue").text(AppUtils.numberWithCommas(data.transactionValue));

                    //Phí công chứng
                    let feeRecordNotarizationFee = data.feeRecords.find(x => x.type === AppSettings.feeRecordType.FIXED_FEE).amount || 0;
                    $("#footer_notarizationFee").text(AppUtils.numberWithCommas(feeRecordNotarizationFee));
                    $("#step1_fee_notarizationFee").text(AppUtils.numberWithCommas(feeRecordNotarizationFee));

                    //Thù lao công chứng
                    let feeRecordRemunerationFee = data.feeRecords.find(x => x.type === AppSettings.feeRecordType.SERVICE_FEE).amount || 0;
                    $("#footer_remunerationFee").text(AppUtils.numberWithCommas(feeRecordRemunerationFee));
                    $("#step1_fee_remunerationFee").text(AppUtils.numberWithCommas(feeRecordRemunerationFee));

                    //Phí khác
                    $("#footer_otherFees").text(
                        AppUtils.numberWithCommas(
                            data.feeRecords
                                .filter(x => x.type == AppSettings.feeRecordType.ADDITIONAL_SERVICE_FEE)
                                .reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
                        )
                    );

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
            } catch (e) {

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
                    $("#step1_staff_name").text(data.fullName),
                        $("#step1_staff_phoneNumber").text(data.phoneNumber ?? "---");
                    $("#step1_staff_identityNumber").text(data.identityNumber ?? "---");
                    $("#step1_staff_position").text("---");
                    $("#step1_staff_officeName").text(data.office.name);
                    $("#step1_staff_officeAddress").text(data.office.address);
                    $("#step1_staff_officePhoneNumber").text(data.office.phone ?? "---");

                }
            } catch (e) {

            }
        }
        $("#global_loader").removeClass("show");


    }

    async function loadRelatedDetailByRequestCode() {

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


    //[step6]
    async function initStep6() {
        let isSuccess = true;
        //load data requestId
        try {
            //load data detail hồ sơ
            const responseDetail = await httpService.getAsync(ApiRoutes.NotarizationRequest.v1.Detail(NotarizationRequestDetailPage.variables.id));
            let dataDetail = responseDetail.resources;

            //nếu ký bên ngoài ngoài
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
                $(".step6-notary-certificate-document").hide();
            }

            $("#step6_notarizationNumber").text(dataDetail.notarizationNumber);
            $("#step6_documentTypeName").text(dataDetail.documentType.name);
            if (dataDetail.notarizationBook) {
                $("#step6_notarizationBookName").text(dataDetail.notarizationBook.name).trigger("change");
            }
            else {
                $("#step6_notarizationBookId").text("").trigger("change");
            }

            $("#step6_archiveLocation").text(dataDetail.archiveLocation);
            $("#step6_requestTypeName").text(dataDetail.notarizationRequestType.name);
            $("#step6_notaryPhoneNumber").text(dataDetail.notaryPhoneNumber || "---");
            $(".step6-notaryPhoneNumber").toggleClass("d-none", dataDetail.notarizationRequestType.id != AppSettings.notarizationRequestType.ONLINE);

            var link = `${window.location.href}`;
            generateQRCode(link, $(".step-component-qr.request-notarization"));

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
                    // Assuming 'type' and 'file' variables are available in this scope
                    else if (type == AppSettings.AttachmentType.NOTARY_DOCUMENT) {
                        let url = `${window.location.origin}/notarization-request/${NotarizationRequestDetailPage.variables.id}/file/${file.id}/${file.fileKey.split("/").pop()}`;
                        const qrId = `qr-notary-${file.id}`;
                        const docItem = $(`
                                <div class="notarization-item-file d-flex justify-content-between align-items-center">
                                    <div class="d-flex gap-10px align-items-center">
                                        <div class="icon-file">
                                            <img src="/admin/assets/media/file-type-icons/pdf.png">
                                        </div>
                                        <a href="${url}" target="_blank">${file.fileName}</a>
                                    </div>
                                    <div class="flex-row d-flex gap-10px align-items-center">
                                        <p>${formatToKB(file.fileSize)}</p>
                                        <div class="step-component-qr" id="${qrId}"></div>
                                    </div>
                                </div>
                            `);

                        $('#step6_notary_document').append(docItem);
                        generateQRCode(url, $(`#${qrId}`));
                        await readFileNotarizationDocument(file, $(".step6-signature-notarization-document-form"));
                    }
                    else if (type == AppSettings.AttachmentType.OTHER_DOCUMENT) {
                        let url = `${window.location.origin}/notarization-request/${NotarizationRequestDetailPage.variables.id}/file/${file.id}/${file.fileKey.split("/").pop()}`;
                        const qrId = `qr-other-doc-${file.id}`;
                        const docItem = $(`
                                <div class="notarization-item-file d-flex justify-content-between align-items-center">
                                    <div class="d-flex gap-10px align-items-center">
                                        <div class="icon-file">
                                            <img src="/admin/assets/media/file-type-icons/pdf.png">
                                        </div>
                                        <a href="${url}" target="_blank">${file.fileName}</a>
                                    </div>
                                     <div class="flex-row d-flex gap-10px align-items-center">
                                        <p>${formatToKB(file.fileSize)}</p>
                                        <div class="step-component-qr" id="${qrId}"></div>
                                    </div>
                                </div>
                            `);
                        $('#step6_notary_notary_other_docs').append(docItem);
                        generateQRCode(url, $(`#${qrId}`));
                    }
                    else if (type == AppSettings.AttachmentType.CERTIFICATE_DOCUMENT) {
                        let url = `${window.location.origin}/notarization-request/${NotarizationRequestDetailPage.variables.id}/file/${file.id}/${file.fileKey.split("/").pop()}`;
                        const qrId = `qr-certificate-doc-${file.id}`;
                        const docItem = $(`
                            <div class="notarization-item-file d-flex justify-content-between align-items-center">
                                <div class="d-flex gap-10px align-items-center">
                                    <div class="icon-file">
                                        <img src="/admin/assets/media/file-type-icons/pdf.png">
                                    </div>
                                    <a href="${url}" target="_blank">${file.fileName}</a>
                                </div>
                                     <div class="flex-row d-flex gap-10px align-items-center">
                                        <p>${formatToKB(file.fileSize)}</p>
                                        <div class="step-component-qr" id="${qrId}"></div>
                                    </div>
                            </div>
                        `);

                        $('#step6_notary_certificate_document').append(docItem);
                        generateQRCode(url, $(`#${qrId}`));
                        await readFileNotarizationDocument(file, $(".step6-signature-certificate-document-form"));
                    }
                });
                refreshFsLightbox();
            }
        } catch (e) {
            console.log(e);
            AppSettings.mainElements.PAGE_CONTENT.addClass("d-none");
            AppSettings.mainElements.NOT_FOUND.removeClass("d-none");
            isSuccess = false;
        }
        return isSuccess;

        //load data tài liệu
    }
    function renderDocumentStep6(resources) {
        let html = '';
        const qrCodePromises = []; // To store promises for QR code generation

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
                        let url = `${window.location.origin}/notarization-request/${NotarizationRequestDetailPage.variables.id}/file/${file.id}/${file.fileKey.split("/").pop()}`;
                        const qrId = `qr-${submittedDoc.id}-${file.id}`; // Unique ID for each QR container
                        itemHtml = `
                            <div class="notarization-item-file d-flex justify-content-between align-items-center mgt-10px"
                                 data-doc-id="${submittedDoc.id}" data-file-id="${file.id}">
                                <div class="d-flex gap-10px align-items-center">
                                    <div class="icon-file"><img src="/admin/assets/media/file-type-icons/pdf.png"></div>
                                    <a href="${url}" class="upload-file-link" target="_blank">${file.fileName}</a>
                                </div>
                                <div class="d-flex align-items-center gap-10px">
                                    <p class="upload-file-size">${formatToKB(file.fileSize)}</p>
                                    <div class="step-component-qr" id="${qrId}"></div>
                                </div>
                            </div>`
                        // Add QR code generation to the promises array
                        qrCodePromises.push({ link: url, elementId: qrId });
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
        // After the HTML is rendered, generate QR codes
        qrCodePromises.forEach(qr => {
            generateQRCode(qr.link, $(`#${qr.elementId}`));
        });
    }

    function renderOtherDocumentStep6(resources) {
        let html = '';
        const qrCodePromises = []; // To store promises for QR code generation

        resources.forEach((group, index) => {
            if (!group.forParty) return;

            html += `<h3 class="item-category-title mt-5">${group.forParty}</h3>`;

            const submittedDoc = group; // submittedDoc is the group itself here
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
                    let url = `${window.location.origin}/notarization-request/${NotarizationRequestDetailPage.variables.id}/file/${file.id}/${file.fileKey.split("/").pop()}`;
                    const qrId = `qr-other-${submittedDoc.id}-${file.id}`; // Unique ID for each QR container
                    itemHtml = `
                        <div class="notarization-item-file d-flex justify-content-between align-items-center mgt-10px"
                             data-doc-id="${submittedDoc.id}" data-file-id="${file.id}">
                            <div class="d-flex gap-10px align-items-center">
                                <div class="icon-file"><img src="/admin/assets/media/file-type-icons/pdf.png"></div>
                                <a href="${url}" class="upload-file-link" target="_blank">${file.fileName}</a>
                            </div>
                            <div class="d-flex align-items-center gap-10px">
                                <p class="upload-file-size">${formatToKB(file.fileSize)}</p>
                                <div class="step-component-qr" id="${qrId}"></div>
                            </div>
                        </div>`;
                    qrCodePromises.push({ link: url, elementId: qrId });
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

        // After the HTML is rendered, generate QR codes
        qrCodePromises.forEach(qr => {
            // Ensure generateQRCode function is available in this scope
            generateQRCode(qr.link, $(`#${qr.elementId}`));
        });
    }

    function renderBlockingInformation(resources, target) {
        target.html("");
        resources.forEach(result => {
            let card = generateFileItem(result, false);
            target.append(card);
        });
        refreshFsLightbox();
    }

    //[Shared functions]
    function formatToKB(bytes) {
        return AppUtils.byteConverter(bytes, 2, "MB");
    }

    function disableFormControls(formSelector) {
        const $form = $(formSelector);
        $form.find('input, textarea, select').prop('disabled', true);
        $form.find('button').hide();
        //$form.find('a[download]').hide();
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

    function generateQRCode(link, containerSelector) {
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
            width: 80,
            height: 80,
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

    // On document ready
    KTUtil.onDOMContentLoaded(async function () {
        AppEntry.init(); 
        NotarizationRequestDetailPage.init();
    });
})();

