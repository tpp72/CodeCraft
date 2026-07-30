const navButtons = document.querySelectorAll(".nav-btn");
const panels = document.querySelectorAll(".panel");

navButtons.forEach((button) => {
  button.addEventListener("click", () => {
    navButtons.forEach((btn) => btn.classList.remove("active"));
    panels.forEach((panel) => panel.classList.remove("active"));

    button.classList.add("active");
    document.getElementById(button.dataset.target).classList.add("active");
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
      const result = new ZXing.MultiFormatReader().decode(binaryBitmap);

      scanResult.value = result.text;

      if (result.text) {
        barcodeInput.value = result.text;
        qrInput.value = result.text;
      }
    } catch (error) {
      console.error(error);
      scanResult.value = "";
      alert("ไม่พบ Barcode หรือ QR Code ในรูปนี้");
    }
  };

  img.src = previewImage.src;
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