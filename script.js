document.addEventListener("DOMContentLoaded", function() {
    const canvasEl = document.getElementById("twibbon-canvas");
    const uploadInput = document.getElementById("upload-foto");
    const downloadBtn = document.getElementById("download-btn");
    const uploadStatus = document.getElementById("upload-status");
    const zoomSlider = document.getElementById("zoom-slider");
    const zoomContainer = document.getElementById("zoom-container");

    const CANVAS_WIDTH = 500;
    const CANVAS_HEIGHT = 500;

    // Inisialisasi Canvas dengan fitur preserveObjectStacking
    const canvas = new fabric.Canvas('twibbon-canvas', {
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        backgroundColor: '#eee',
        preserveObjectStacking: true 
    });

    let frameImage; 
    let userImage; 

    // Fungsi muat bingkai
    function loadFrame() {
        fabric.Image.fromURL('bingkai.png?v=2026', function(img) {
            frameImage = img;
            frameImage.scaleToWidth(CANVAS_WIDTH);
            frameImage.scaleToHeight(CANVAS_HEIGHT);
            frameImage.set({
                top: 0,
                left: 0,
                selectable: false, 
                hoverCursor: 'default',
                evented: false // Sentuhan tembus ke belakang
            });
            canvas.add(frameImage);
            canvas.renderAll(); 
        });
    }

    loadFrame();

    // Fungsi unggah foto
    uploadInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(event) {
            const imgDataURL = event.target.result;

            if (userImage) {
                canvas.remove(userImage);
            }

            fabric.Image.fromURL(imgDataURL, function(img) {
                userImage = img;
                userImage.scaleToHeight(CANVAS_HEIGHT / 1.5); 

                userImage.set({
                    top: CANVAS_HEIGHT / 2 - userImage.getScaledHeight() / 2,
                    left: CANVAS_WIDTH / 2 - userImage.getScaledWidth() / 2,
                    selectable: true, 
                    cornerColor: 'rgba(102,153,255,0.8)',
                    cornerSize: 12,
                    transparentCorners: false
                });

                canvas.add(userImage);
                userImage.sendToBack(); 
                canvas.renderAll();

                // Munculkan slider dan set nilai awalnya
                zoomContainer.style.display = 'block';
                zoomSlider.value = userImage.scaleX;

                // Update UI tombol
                downloadBtn.disabled = false;
                uploadStatus.textContent = "Foto Dimuat";
                uploadInput.parentElement.style.borderColor = '#28a745';
                uploadStatus.style.color = '#28a745';
            });
        };
        reader.readAsDataURL(file);
    });

    // Fungsi untuk Slider Zoom
    zoomSlider.addEventListener('input', function() {
        if (userImage) {
            userImage.scale(parseFloat(this.value));
            canvas.renderAll();
        }
    });

    // Fungsi Download
    downloadBtn.addEventListener('click', function() {
        if (!userImage) return; 

        frameImage.bringToFront();
        canvas.renderAll();

        const dataURL = canvas.toDataURL({
            format: 'png',
            quality: 1
        });

        const link = document.createElement('a');
        link.href = dataURL;
        link.download = 'mpls-babakanasem2.png'; 
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link); 
    });

    // === FITUR CUBIT (PINCH TO ZOOM) UNTUK PONSEl ===
    const canvasPanel = document.querySelector('.canvas-panel');
    let initialDistance = null;
    let initialScale = 1;

    canvasPanel.addEventListener('touchstart', function(e) {
        // Jika ada 2 jari yang menyentuh layar
        if (e.touches.length === 2 && userImage) {
            e.preventDefault(); 
            // Hitung jarak awal antara jari pertama dan jari kedua
            initialDistance = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            initialScale = userImage.scaleX;
        }
    }, { passive: false });

    canvasPanel.addEventListener('touchmove', function(e) {
        if (e.touches.length === 2 && userImage && initialDistance) {
            e.preventDefault(); 
            // Hitung jarak jari yang baru saat digerakkan
            const currentDistance = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            
            // Kalkulasi perubahan skala
            const scaleFactor = currentDistance / initialDistance;
            let newScale = initialScale * scaleFactor;
            
            // Batasi ukuran (Jangan terlalu kecil atau terlalu raksasa)
            if (newScale < 0.1) newScale = 0.1;
            if (newScale > 3) newScale = 3;
            
            // Terapkan ke foto dan render ulang
            userImage.scale(newScale);
            canvas.renderAll();
            
            // Sinkronkan juga dengan posisi slider agar tidak error
            zoomSlider.value = newScale;
        }
    }, { passive: false });

    canvasPanel.addEventListener('touchend', function(e) {
        if (e.touches.length < 2) {
            initialDistance = null; // Reset perhitungan saat jari dilepas
        }
    });
});