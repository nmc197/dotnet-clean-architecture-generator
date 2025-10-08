"use strict";

(function () {
    const FilePage = {
        blockUI: null,
        init: function () {
            this.blockUI = new KTBlockUI(document.querySelector("#kt_app_content"));
            this.getFileUrlById();
        },

        getFileUrlById: function () {
            loadDataFile();
        }
    }

    async function loadDataFile() {
        FilePage.blockUI.block();
        try {
            const notarizationRequestId = AppUtils.getPathSegment(1);
            const fileId = AppUtils.getPathSegment(3);
            const fileName = AppUtils.getPathSegment(4);
            let response = await httpService.getAsync(ApiRoutes.NotarizationRequest.v1.ViewFile(notarizationRequestId, fileId, fileName));
            if (response?.isSucceeded) {
                let fileUrl = response.resources.url;
                $("#pdfFrame").attr("src", fileUrl);
            }
        } catch (e) {
            AppSettings.mainElements.PAGE_CONTENT.addClass("d-none");
            AppSettings.mainElements.NOT_FOUND.removeClass("d-none");
        }
        finally {
            FilePage.blockUI.release();
        }
    }
    KTUtil.onDOMContentLoaded(async function () {
        await AppEntry.init();
        FilePage.init();
    });
})();