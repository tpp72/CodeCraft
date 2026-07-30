const navButtons = document.querySelectorAll(".nav-btn");
const panels = document.querySelectorAll(".panel");

navButtons.forEach((button) => {
  button.addEventListener("click", () => {
    navButtons.forEach((btn) => btn.classList.remove("active"));
    panels.forEach((panel) => panel.classList.remove("active"));

    button.classList.add("active");
    document.getElementById(button.dataset.target).classList.add("active");

    if (button.dataset.target !== "qrReaderSection") {
      stopQRCamera();
    }
  });
});

// Barcode
const barcodeInput = document.getElementById("barcodeInput");
const barcodeCanvas = document.getElementById("barcodeCanvas");
const generateBarcodeButton = document.getElementById("generateBarcodeButton");
const downloadBarcodeButton = document.getElementById("downloadBarcodeButton");

generateBarcodeButton.addEventListener("click", () => {
  const value = barcodeInput.value.trim();

  if (!value) {
    alert("กรุณากรอกข้อความสำหรับ Barcode");
    return;
  }

  JsBarcode(barcodeCanvas, value, {
    format: "CODE128",
    width: 2,
    height: 100,
    margin: 10,
    displayValue: false
  });
});

downloadBarcodeButton.addEventListener("click", () => {
  const value = barcodeInput.value.trim();

  if (!value) {
    alert("กรุณากรอกข้อความก่อนดาวน์โหลด");
    return;
  }

  const link = document.createElement("a");
  link.download = `${sanitizeFileName(value)}.png`;
  link.href = barcodeCanvas.toDataURL("image/png");
  link.click();
});

// QR Code
const qrInput = document.getElementById("qrInput");
const qrCanvas = document.getElementById("qrCanvas");
const generateQRButton = document.getElementById("generateQRButton");
const downloadQRButton = document.getElementById("downloadQRButton");

generateQRButton.addEventListener("click", async () => {
  const value = qrInput.value.trim();

  if (!value) {
    alert("กรุณากรอกข้อความสำหรับ QR Code");
    return;
  }

  try {
    await QRCode.toCanvas(qrCanvas, value, {
      width: 260,
      margin: 2
    });
  } catch (error) {
    console.error(error);
    alert(`ไม่สามารถสร้าง QR Code ได้: ${error.message || error}`);
  }
});

downloadQRButton.addEventListener("click", () => {
  const value = qrInput.value.trim();

  if (!value) {
    alert("กรุณากรอกข้อความก่อนดาวน์โหลด");
    return;
  }

  const link = document.createElement("a");
  link.download = `${sanitizeFileName(value)}.png`;
  link.href = qrCanvas.toDataURL("image/png");
  link.click();
});

// Scanner
const imageInput = document.getElementById("imageInput");
const previewImage = document.getElementById("previewImage");
const emptyPreviewText = document.getElementById("emptyPreviewText");
const scanImageButton = document.getElementById("scanImageButton");
const scanResult = document.getElementById("scanResult");
const hiddenCanvas = document.getElementById("hiddenCanvas");

imageInput.addEventListener("change", (event) => {
  const file = event.target.files[0];

  if (!file) {
    previewImage.src = "";
    previewImage.style.display = "none";
    emptyPreviewText.style.display = "block";
    scanResult.value = "";
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    previewImage.src = e.target.result;
    previewImage.style.display = "block";
    emptyPreviewText.style.display = "none";
    scanResult.value = "";
  };
  reader.readAsDataURL(file);
});

const barcodeHints = new Map();
barcodeHints.set(ZXing.DecodeHintType.POSSIBLE_FORMATS, [
  ZXing.BarcodeFormat.CODE_128,
  ZXing.BarcodeFormat.CODE_39,
  ZXing.BarcodeFormat.CODE_93,
  ZXing.BarcodeFormat.EAN_13,
  ZXing.BarcodeFormat.EAN_8,
  ZXing.BarcodeFormat.UPC_A,
  ZXing.BarcodeFormat.UPC_E,
  ZXing.BarcodeFormat.ITF,
  ZXing.BarcodeFormat.CODABAR
]);
const barcodeReader = new ZXing.MultiFormatReader();
barcodeReader.setHints(barcodeHints);

scanImageButton.addEventListener("click", () => {
  if (!previewImage.src) {
    alert("กรุณาอัปโหลดรูปก่อน");
    return;
  }

  const img = new Image();
  img.onload = () => {
    const ctx = hiddenCanvas.getContext("2d");
    hiddenCanvas.width = img.naturalWidth;
    hiddenCanvas.height = img.naturalHeight;
    ctx.drawImage(img, 0, 0);

    try {
      const luminanceSource = new ZXing.HTMLCanvasElementLuminanceSource(hiddenCanvas);
      const binaryBitmap = new ZXing.BinaryBitmap(
        new ZXing.HybridBinarizer(luminanceSource)
      );
      const result = barcodeReader.decode(binaryBitmap);

      scanResult.value = result.text;

      if (result.text) {
        barcodeInput.value = result.text;
      }
    } catch (error) {
      console.error(error);
      scanResult.value = "";
      alert("ไม่พบ Barcode ในรูปนี้");
    }
  };

  img.src = previewImage.src;
});

// QR Reader
const qrReaderResult = document.getElementById("qrReaderResult");
const qrVideo = document.getElementById("qrVideo");
const startCameraButton = document.getElementById("startCameraButton");
const stopCameraButton = document.getElementById("stopCameraButton");
const qrImageInput = document.getElementById("qrImageInput");
const qrPreviewImage = document.getElementById("qrPreviewImage");
const qrEmptyPreviewText = document.getElementById("qrEmptyPreviewText");
const scanQRImageButton = document.getElementById("scanQRImageButton");
const qrHiddenCanvas = document.getElementById("qrHiddenCanvas");

const qrCameraReader = new ZXing.BrowserQRCodeReader();
let qrCameraActive = false;

function stopQRCamera() {
  if (!qrCameraActive) return;
  qrCameraReader.reset();
  qrCameraActive = false;
  startCameraButton.disabled = false;
  stopCameraButton.disabled = true;
}

startCameraButton.addEventListener("click", () => {
  qrReaderResult.value = "";
  startCameraButton.disabled = true;
  stopCameraButton.disabled = false;
  qrCameraActive = true;

  qrCameraReader
    .decodeFromVideoDevice(undefined, qrVideo, (result) => {
      if (result) {
        qrReaderResult.value = result.text;
        qrInput.value = result.text;
      }
    })
    .catch((error) => {
      console.error(error);
      alert("ไม่สามารถเปิดกล้องได้ กรุณาอนุญาตการใช้งานกล้อง");
      stopQRCamera();
    });
});

stopCameraButton.addEventListener("click", stopQRCamera);

qrImageInput.addEventListener("change", (event) => {
  const file = event.target.files[0];

  if (!file) {
    qrPreviewImage.src = "";
    qrPreviewImage.style.display = "none";
    qrEmptyPreviewText.style.display = "block";
    qrReaderResult.value = "";
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    qrPreviewImage.src = e.target.result;
    qrPreviewImage.style.display = "block";
    qrEmptyPreviewText.style.display = "none";
    qrReaderResult.value = "";
  };
  reader.readAsDataURL(file);
});

scanQRImageButton.addEventListener("click", () => {
  if (!qrPreviewImage.src) {
    alert("กรุณาอัปโหลดรูปก่อน");
    return;
  }

  const img = new Image();
  img.onload = () => {
    const ctx = qrHiddenCanvas.getContext("2d");
    qrHiddenCanvas.width = img.naturalWidth;
    qrHiddenCanvas.height = img.naturalHeight;
    ctx.drawImage(img, 0, 0);

    try {
      const luminanceSource = new ZXing.HTMLCanvasElementLuminanceSource(qrHiddenCanvas);
      const binaryBitmap = new ZXing.BinaryBitmap(
        new ZXing.HybridBinarizer(luminanceSource)
      );
      const result = new ZXing.QRCodeReader().decode(binaryBitmap);

      qrReaderResult.value = result.text;

      if (result.text) {
        qrInput.value = result.text;
      }
    } catch (error) {
      console.error(error);
      qrReaderResult.value = "";
      alert("ไม่พบ QR Code ในรูปนี้");
    }
  };

  img.src = qrPreviewImage.src;
});

function sanitizeFileName(name) {
  return name.replace(/[\\/:*?"<>|]/g, "_");
}

// Theme Toggle
const themeBtn = document.getElementById("themeToggle");

themeBtn.addEventListener("click", () => {

  document.body.classList.toggle("dark");

  if(document.body.classList.contains("dark")){
    themeBtn.textContent = "☀️";
  }else{
    themeBtn.textContent = "🌙";
  }

});