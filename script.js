// Element DOM
const uploadInput = document.getElementById('upload');
const userPhotoContainer = document.getElementById('user-photo-container');
const userPhoto = document.getElementById('user-photo');
const downloadBtn = document.getElementById('download');
const statusText = document.getElementById('status-text');
const previewContainer = document.getElementById('preview-container');
const btnZoomIn = document.getElementById('btn-zoom-in');
const btnZoomOut = document.getElementById('btn-zoom-out');

// Variabel untuk melacak posisi dan skala
let posX = 0, posY = 0, scale = 1;
let isDragging = false;
let startX, startY, lastPosX, lastPosY;

// --- 1. FUNGSI UPLOAD ---
uploadInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(event) {
        // Reset posisi dan skala saat upload foto baru
        posX = 0; posY = 0; scale = 1;
        updateTransform();
        
        userPhoto.src = event.target.result;
        // Tampilkan kontainer foto setelah gambar dimuat
        userPhoto.onload = () => {
             userPhotoContainer.style.opacity = '1';
             downloadBtn.disabled = false;
             statusText.innerText = "*Geser foto atau gunakan zoom untuk menyesuaikan";
        };
    }
    reader.readAsDataURL(file);
});


// --- 2. FUNGSI DRAG/GESER (Mouse & Touch) ---

function startDrag(e) {
    if (downloadBtn.disabled) return; // Cegah drag jika belum ada foto
    isDragging = true;
    // Ambil posisi awal kursor/jari
    startX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    startY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
    lastPosX = posX;
    lastPosY = posY;
    userPhoto.style.cursor = 'grabbing';
}

function doDrag(e) {
    if (!isDragging) return;
    e.preventDefault(); // Mencegah scrolling halaman di HP saat drag

    // Ambil posisi kursor/jari saat ini
    const currentX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    const currentY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;

    // Hitung perubahannya
    const deltaX = currentX - startX;
    const deltaY = currentY - startY;

    // Update posisi
    posX = lastPosX + deltaX;
    posY = lastPosY + deltaY;

    updateTransform();
}

function stopDrag() {
    isDragging = false;
    userPhoto.style.cursor = 'grab';
}

// Terapkan perubahan posisi dan skala ke CSS
function updateTransform() {
    userPhoto.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
}

// Event Listeners untuk Mouse (PC)
previewContainer.addEventListener('mousedown', startDrag);
window.addEventListener('mousemove', doDrag);
window.addEventListener('mouseup', stopDrag);

// Event Listeners untuk Touch (HP)
previewContainer.addEventListener('touchstart', startDrag, { passive: false });
window.addEventListener('touchmove', doDrag, { passive: false });
window.addEventListener('touchend', stopDrag);


// --- 3. FUNGSI ZOOM ---
btnZoomIn.addEventListener('click', () => {
    if(downloadBtn.disabled) return;
    scale += 0.1;
    updateTransform();
});

btnZoomOut.addEventListener('click', () => {
    if(downloadBtn.disabled || scale <= 0.2) return; // Batas minimum zoom
    scale -= 0.1;
    updateTransform();
});


// --- 4. FUNGSI DOWNLOAD (Menggunakan html2canvas) ---
downloadBtn.addEventListener('click', function() {
    statusText.innerText = "Sedang memproses gambar...";
    downloadBtn.disabled = true;

    // html2canvas akan "memotret" area #preview-container
    html2canvas(previewContainer, {
        scale: 2, // Meningkatkan resolusi hasil akhir (agar tidak buram)
        backgroundColor: null, // Agar background transparan jika ada
        logging: false,
        useCORS: true // Penting untuk memuat gambar dari sumber eksternal jika ada
    }).then(canvas => {
        // Convert canvas ke image dan download
        const link = document.createElement('a');
        link.download = 'twibbon-saya.png';
        link.href = canvas.toDataURL('image/png', 1.0);
        link.click();

        // Kembalikan status tombol
        statusText.innerText = "*Gambar berhasil disimpan!";
        downloadBtn.disabled = false;
    }).catch(err => {
        console.error("Gagal membuat gambar:", err);
        statusText.innerText = "Error saat memproses gambar.";
        downloadBtn.disabled = false;
    });
});
