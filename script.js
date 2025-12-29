// --- 1. INISIALISASI ELEMEN ---
const mainUploadBtn = document.getElementById('main-upload-btn');
const uploadModal = document.getElementById('upload-modal');
const inputGallery = document.getElementById('input-gallery');
const inputCamera = document.getElementById('input-camera');

const userPhotoContainer = document.getElementById('user-photo-container');
const userPhoto = document.getElementById('user-photo');
const downloadBtn = document.getElementById('download');
const shareBtn = document.getElementById('share-btn'); // Pastikan ID ini ada di HTML
const statusText = document.getElementById('status-text');
const previewContainer = document.getElementById('preview-container');
const btnZoomIn = document.getElementById('btn-zoom-in');
const btnZoomOut = document.getElementById('btn-zoom-out');

let posX = 0, posY = 0, scale = 1;
let isDragging = false;
let startX, startY, lastPosX, lastPosY;

// --- 2. LOGIKA MODAL ---
if (mainUploadBtn) {
    mainUploadBtn.addEventListener('click', () => uploadModal.style.display = 'flex');
}

document.getElementById('close-modal')?.addEventListener('click', () => {
    uploadModal.style.display = 'none';
});

document.getElementById('pick-camera')?.addEventListener('click', () => {
    inputCamera.click();
    uploadModal.style.display = 'none';
});

document.getElementById('pick-gallery')?.addEventListener('click', () => {
    inputGallery.click();
    uploadModal.style.display = 'none';
});

// --- 3. FUNGSI HANDLE GAMBAR ---
function handleImage(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(event) {
        posX = 0; posY = 0; scale = 1;
        updateTransform();
        userPhoto.src = event.target.result;
        userPhoto.onload = () => {
            userPhotoContainer.style.opacity = '1';
            if (downloadBtn) downloadBtn.style.display = 'block';
            
            // CEK DUKUNGAN SHARE DISINI
            if (navigator.share && shareBtn) {
                shareBtn.style.display = 'block';
            }
            statusText.innerText = "*Geser foto atau gunakan zoom untuk menyesuaikan";
        };
    }
    reader.readAsDataURL(file);
}

inputGallery?.addEventListener('change', handleImage);
inputCamera?.addEventListener('change', handleImage);

// --- 4. LOGIKA DRAG & ZOOM ---
function updateTransform() {
    userPhoto.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
}

function startDrag(e) {
    if (!userPhoto.src) return;
    isDragging = true;
    startX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    startY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
    lastPosX = posX; lastPosY = posY;
}

function doDrag(e) {
    if (!isDragging) return;
    e.preventDefault();
    const currentX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    const currentY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
    posX = lastPosX + (currentX - startX);
    posY = lastPosY + (currentY - startY);
    updateTransform();
}

previewContainer.addEventListener('mousedown', startDrag);
window.addEventListener('mousemove', doDrag);
window.addEventListener('mouseup', () => isDragging = false);
previewContainer.addEventListener('touchstart', startDrag, { passive: false });
window.addEventListener('touchmove', doDrag, { passive: false });
window.addEventListener('touchend', () => isDragging = false);

btnZoomIn?.addEventListener('click', () => { scale += 0.1; updateTransform(); });
btnZoomOut?.addEventListener('click', () => { if(scale > 0.2) scale -= 0.1; updateTransform(); });

// --- 5. FUNGSI DOWNLOAD ---
downloadBtn?.addEventListener('click', async () => {
    statusText.innerText = "Memproses gambar...";
    const canvas = await html2canvas(previewContainer, { scale: 2, useCORS: true });
    const link = document.createElement('a');
    link.download = 'twibbon-astanaraya.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    statusText.innerText = "*Gambar berhasil disimpan!";
});

// --- 6. FUNGSI SHARE (REVISED) ---
shareBtn?.addEventListener('click', async () => {
    try {
        statusText.innerText = "Menyiapkan menu berbagi...";
        
        // Buat canvas dari preview
        const canvas = await html2canvas(previewContainer, {
            scale: 2,
            useCORS: true,
            logging: false
        });

        // Convert ke Blob
        canvas.toBlob(async (blob) => {
            if (!blob) return;
            const file = new File([blob], 'twibbon-astanaraya.png', { type: 'image/png' });

            // PENTING: Cek izin share file
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: 'Twibbon Astanaraya',
                    text: 'Yuk pakai Twibbon Astanaraya Suites Hotel!'
                });
                statusText.innerText = "*Berhasil dibagikan!";
            } else {
                alert("Browser tidak mendukung berbagi file. Gunakan tombol Simpan Gambar.");
            }
        }, 'image/png');
    } catch (err) {
        console.error("Error sharing:", err);
        statusText.innerText = "*Gagal memproses berbagi.";
    }
});
