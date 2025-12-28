const uploadInput = document.getElementById('upload');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const previewImg = document.getElementById('preview-img');
const downloadBtn = document.getElementById('download');

const twibbonImg = new Image();
twibbonImg.src = 'twibbon.png'; // Pastikan nama file sesuai

uploadInput.addEventListener('change', function(e) {
    const reader = new FileReader();
    reader.onload = function(event) {
        const userImg = new Image();
        userImg.onload = function() {
            // Bersihkan canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // 1. Gambar Foto User (di bawah)
            // Mengatur agar foto user memenuhi area (cover)
            let ratio = Math.max(canvas.width / userImg.width, canvas.height / userImg.height);
            let newWidth = userImg.width * ratio;
            let newHeight = userImg.height * ratio;
            let x = (canvas.width - newWidth) / 2;
            let y = (canvas.height - newHeight) / 2;
            
            ctx.drawImage(userImg, x, y, newWidth, newHeight);

            // 2. Gambar Twibbon (di atas)
            ctx.drawImage(twibbonImg, 0, 0, canvas.width, canvas.height);

            // Tampilkan hasil di elemen <img> agar bisa dilihat/disimpan
            previewImg.src = canvas.toDataURL('image/png');
            previewImg.style.display = 'block';
            downloadBtn.disabled = false;
        }
        userImg.src = event.target.result;
    }
    reader.readAsDataURL(e.target.files[0]);
});

downloadBtn.addEventListener('click', function() {
    const link = document.createElement('a');
    link.download = 'twibbon-hasil.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
});