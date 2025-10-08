let isSigning = false;
let overlay = null;
let startX, startY;
let signaturePad, selectedRegion = null;
const viewerContainer = document.getElementById("viewerContainer");
const signBtn = document.getElementById("btn-sign");
const modal = document.getElementById("signatureModal");
const canvas = document.getElementById("signatureCanvas");
const clearBtn = document.getElementById("clearSignature");
const saveBtn = document.getElementById("saveSignature");

signaturePad = new SignaturePad(canvas);

signBtn.addEventListener("click", () => {
    isSigning = true;
    signBtn.classList.add("toggled");
    alert("Kéo để chọn vùng ký");
});

viewerContainer.addEventListener("mousedown", function (e) {
    if (!isSigning) return;

    const rect = viewerContainer.getBoundingClientRect();
    startX = e.clientX - rect.left + viewerContainer.scrollLeft;
    startY = e.clientY - rect.top + viewerContainer.scrollTop;

    overlay = document.createElement("div");
    overlay.style.position = "absolute";
    overlay.style.border = "2px dashed red";
    overlay.style.background = "rgba(255,0,0,0.1)";
    overlay.style.left = startX + "px";
    overlay.style.top = startY + "px";
    overlay.style.zIndex = 1000;
    viewerContainer.appendChild(overlay);

    function onMouseMove(ev) {
        const currentX = ev.clientX - rect.left + viewerContainer.scrollLeft;
        const currentY = ev.clientY - rect.top + viewerContainer.scrollTop;
        const width = Math.abs(currentX - startX);
        const height = Math.abs(currentY - startY);
        overlay.style.left = Math.min(currentX, startX) + "px";
        overlay.style.top = Math.min(currentY, startY) + "px";
        overlay.style.width = width + "px";
        overlay.style.height = height + "px";
    }

    function onMouseUp() {
        viewerContainer.removeEventListener("mousemove", onMouseMove);
        viewerContainer.removeEventListener("mouseup", onMouseUp);

        isSigning = false;
        signBtn.classList.remove("toggled");

        selectedRegion = overlay;
        openSignatureModal();
    }

    viewerContainer.addEventListener("mousemove", onMouseMove);
    viewerContainer.addEventListener("mouseup", onMouseUp);
});

function openSignatureModal() {
    signaturePad.clear();
    modal.style.display = "flex";
}

clearBtn.addEventListener("click", () => {
    signaturePad.clear();
});

saveBtn.addEventListener("click", () => {
    if (signaturePad.isEmpty()) {
        alert("Vui lòng ký trước khi chèn.");
        return;
    }

    const dataUrl = signaturePad.toDataURL();

    // Tạo ảnh chữ ký
    const img = new Image();
    img.src = dataUrl;
    img.style.width = "100%";
    img.style.height = "100%";
    img.style.pointerEvents = "none"; // Không cho ảnh bị ảnh hưởng khi resize

    // Tạo vùng resizable chứa ảnh
    const wrapper = document.createElement("div");
    wrapper.className = "resizable-signature";
    wrapper.style.position = "absolute";
    wrapper.style.left = selectedRegion.style.left;
    wrapper.style.top = selectedRegion.style.top;
    wrapper.style.width = selectedRegion.style.width;
    wrapper.style.height = selectedRegion.style.height;
    wrapper.style.zIndex = 999;

    // Cho phép kéo vùng chữ ký
    wrapper.style.cursor = "move";
    wrapper.setAttribute("draggable", "true");

    // Gán ảnh vào vùng
    wrapper.appendChild(img);
    viewerContainer.appendChild(wrapper);

    // Delete button
    const deleteBtn = document.createElement("div");
    deleteBtn.className = "delete-btn";
    deleteBtn.innerText = "Xóa";
    deleteBtn.addEventListener("click", () => {
        wrapper.remove();

        // ✅ Xóa khỏi insertedSignatures
        if (window.insertedSignatures) {
            const index = window.insertedSignatures.findIndex(sig =>
                sig.left === parseFloat(wrapper.style.left) &&
                sig.top === parseFloat(wrapper.style.top)
            );
            if (index !== -1) {
                window.insertedSignatures.splice(index, 1);
            }
        }
    });
    wrapper.appendChild(deleteBtn);

    // Kéo vùng chữ ký
    let offsetX, offsetY;
    let currentSignatureRef = null;

    wrapper.addEventListener("dragstart", function (e) {
        offsetX = e.offsetX;
        offsetY = e.offsetY;

        // Xác định chữ ký tương ứng để cập nhật sau khi drop
        currentSignatureRef = window.insertedSignatures.find(sig => {
            return sig.left === parseFloat(wrapper.style.left) &&
                sig.top === parseFloat(wrapper.style.top);
        });
    });


    viewerContainer.addEventListener("dragover", function (e) {
        e.preventDefault();
    });

    viewerContainer.addEventListener("drop", function (e) {
        e.preventDefault();
        const rect = viewerContainer.getBoundingClientRect();
        const x = e.clientX - rect.left + viewerContainer.scrollLeft - offsetX;
        const y = e.clientY - rect.top + viewerContainer.scrollTop - offsetY;
        wrapper.style.left = `${x}px`;
        wrapper.style.top = `${y}px`;

        // ✅ Cập nhật lại vị trí trong signatureInfo
        if (currentSignatureRef) {
            currentSignatureRef.left = x;
            currentSignatureRef.top = y;

            // 🔁 Nếu bạn muốn tính lại pageIndex vì đã kéo sang trang khác:
            const pageElements = document.querySelectorAll('.page');
            let newPageIndex = 0;
            let minDist = Infinity;
            const wrapperRect = wrapper.getBoundingClientRect();

            for (let i = 0; i < pageElements.length; i++) {
                const pageRect = pageElements[i].getBoundingClientRect();
                const dist = Math.abs(wrapperRect.top - pageRect.top);
                if (dist < minDist) {
                    minDist = dist;
                    newPageIndex = i;
                }
            }
            currentSignatureRef.pageIndex = newPageIndex;
        }
    });


    // Xóa vùng chọn tạm
    if (selectedRegion) viewerContainer.removeChild(selectedRegion);
    selectedRegion = null;
    modal.style.display = "none";
    // Lưu chữ ký để dùng khi in/save
    window.insertedSignatures = window.insertedSignatures || [];
    const pageElements = document.querySelectorAll('.page');
    let pageIndex = 0;
    let minDistance = Infinity;

    const wrapperRect = wrapper.getBoundingClientRect();

    for (let i = 0; i < pageElements.length; i++) {
        const pageRect = pageElements[i].getBoundingClientRect();
        const distance = Math.abs(wrapperRect.top - pageRect.top);
        if (distance < minDistance) {
            minDistance = distance;
            pageIndex = i;
        }
    }
    console.log("Chữ ký nằm ở page index:", pageIndex);

    const signatureInfo = {
        pageIndex: pageIndex,
        dataUrl: dataUrl,
        left: parseFloat(wrapper.style.left),
        top: parseFloat(wrapper.style.top),
        width: parseFloat(wrapper.style.width),
        height: parseFloat(wrapper.style.height)
    };
    window.insertedSignatures.push(signatureInfo);
});
document.getElementById("printButton").addEventListener("click", async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.insertedSignatures || window.insertedSignatures.length === 0) {
        alert("Chưa có chữ ký nào để chèn!");
        return;
    }

    const pdfDocObj = PDFViewerApplication.pdfDocument;
    const pdfBytes = await pdfDocObj.getData();
    const pdfDoc = await PDFLib.PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();

    const viewer = document.getElementById("viewerContainer");

    for (const sig of window.insertedSignatures) {
        const { pageIndex, dataUrl, left, top, width, height } = sig;

        const page = pages[pageIndex];
        const pageHeight = page.getHeight();
        const pageWidth = page.getWidth();

        const pageElement = document.querySelectorAll('.page')[pageIndex];
        const pageRect = pageElement.getBoundingClientRect();
        const scale = pageRect.width / pageWidth;

        // ✅ Chính xác hơn: lấy offset DOM của chính page hiện tại
        const offsetX = pageElement.offsetLeft;
        const offsetY = pageElement.offsetTop;

        const adjustedLeft = (left - offsetX) / scale;
        const adjustedBottom = pageHeight - (top - offsetY + height) / scale;
        const adjustedWidth = width / scale;
        const adjustedHeight = height / scale;

        const pngImage = await pdfDoc.embedPng(dataUrl);
        page.drawImage(pngImage, {
            x: adjustedLeft,
            y: adjustedBottom,
            width: adjustedWidth,
            height: adjustedHeight
        });
    }


    const signedPdfBytes = await pdfDoc.save();
    const blob = new Blob([signedPdfBytes], { type: "application/pdf" });
    const blobUrl = URL.createObjectURL(blob);

    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = blobUrl;
    document.body.appendChild(iframe);

    iframe.onload = function () {
        setTimeout(() => {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
        }, 500); // chờ render xong
    };

}, true);


const signDigitalBtn = document.getElementById("btn-digital-signature");
signDigitalBtn.addEventListener("click", () => {
    initPluginDigitalSignatureViettel();
});
