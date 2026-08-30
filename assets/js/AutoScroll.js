/**
 * AutoScroll.js - Eye Tracking Auto Scroll System using MediaPipe Face Mesh
 * Pawitra Accessibility Feature (Section-by-Section Navigation)
 */

let cameraStream = null;
let faceMesh = null;
let cameraInstance = null;

// Timer & Lock state
let leftEyeClosedStartTime = null;
let isScrollLocked = false;

const SCROLL_COOLDOWN = 800; // Delay 0.8 detik untuk scroll per container
const HOLD_TOP_DURATION = 1500; // 1.5 detik tahan mata kiri untuk reset ke paling atas

/**
 * Mengukur EAR (Eye Aspect Ratio)
 */
function getEAR(landmarks, eyeIndices) {
  const p1 = landmarks[eyeIndices[0]];
  const p2 = landmarks[eyeIndices[1]];
  const p3 = landmarks[eyeIndices[2]];
  const p4 = landmarks[eyeIndices[3]];
  const p5 = landmarks[eyeIndices[4]];
  const p6 = landmarks[eyeIndices[5]];

  const vertical1 = Math.hypot(p2.x - p6.x, p2.y - p6.y);
  const vertical2 = Math.hypot(p3.x - p5.x, p3.y - p5.y);
  const horizontal = Math.hypot(p1.x - p4.x, p1.y - p4.y);

  return (vertical1 + vertical2) / (2.0 * horizontal);
}

/**
 * Mencari Container / Section Terdekat (Ke Atas atau Ke Bawah)
 */
function scrollToNextContainer(direction) {
  const containers = Array.from(
    document.querySelectorAll("header, section, footer, .card"),
  );

  if (direction === "down") {
    const nextContainer = containers.find((el) => {
      const rect = el.getBoundingClientRect();
      return rect.top > 50;
    });

    if (nextContainer) {
      nextContainer.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    }
  } else if (direction === "up") {
    const prevContainers = containers.filter((el) => {
      const rect = el.getBoundingClientRect();
      return rect.top < -50;
    });

    if (prevContainers.length > 0) {
      const lastPrevContainer = prevContainers[prevContainers.length - 1];
      lastPrevContainer.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }
}

/**
 * Handler Hasil Deteksi Landmark Wajah
 */
function onResults(results) {
  const progressBar = document.getElementById("progressBar");
  const statusBadge = document.getElementById("statusBadge");

  if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
    if (statusBadge) {
      statusBadge.textContent = "Wajah Tidak Terdeteksi";
      statusBadge.className =
        "absolute bottom-1 left-1 right-1 bg-black/80 text-[10px] text-center text-red-400 py-1 rounded font-mono";
    }
    return;
  }

  const landmarks = results.multiFaceLandmarks[0];

  const rightEyeIndices = [33, 160, 158, 133, 153, 144];
  const leftEyeIndices = [362, 385, 387, 263, 373, 380];

  const rightEAR = getEAR(landmarks, rightEyeIndices);
  const leftEAR = getEAR(landmarks, leftEyeIndices);

  const EAR_THRESHOLD = 0.21;

  const isRightClosed = rightEAR < EAR_THRESHOLD;
  const isLeftClosed = leftEAR < EAR_THRESHOLD;

  // 1. MATA KIRI TERPEJAM & MATA KANAN TERBUKA
  if (isLeftClosed && !isRightClosed) {
    if (!leftEyeClosedStartTime) {
      leftEyeClosedStartTime = Date.now();
    }

    const elapsedTime = Date.now() - leftEyeClosedStartTime;
    const progressPercent = Math.min(
      (elapsedTime / HOLD_TOP_DURATION) * 100,
      100,
    );

    if (progressBar) progressBar.style.width = `${progressPercent}%`;

    // A. JIKA DITAHAN LAMA (>= 1.5 detik) -> RESET KE PALING ATAS
    if (elapsedTime >= HOLD_TOP_DURATION) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      if (statusBadge) {
        statusBadge.textContent = "Reset Ke Paling Atas 🔝";
        statusBadge.className =
          "absolute bottom-1 left-1 right-1 bg-black/80 text-[10px] text-center text-amber-400 py-1 rounded font-mono";
      }
      return;
    }

    // B. JIKA HANYA DIPEJAMKAN SINGKAT -> SCROLL UP PER CONTAINER
    if (!isScrollLocked) {
      isScrollLocked = true;
      scrollToNextContainer("up");

      if (statusBadge) {
        statusBadge.textContent = "Prev Container 👆";
        statusBadge.className =
          "absolute bottom-1 left-1 right-1 bg-black/80 text-[10px] text-center text-blue-400 py-1 rounded font-mono";
      }

      setTimeout(() => {
        isScrollLocked = false;
      }, SCROLL_COOLDOWN);
    }
    return;
  } else {
    // Reset timer pejam mata kiri jika mata dibuka kembali
    leftEyeClosedStartTime = null;
    if (progressBar) progressBar.style.width = "0%";
  }

  // JIKA SEDANG COOLDOWN, HENTIKAN PEMROSESAN GESTUR SELEMBAR BROWSER
  if (isScrollLocked) return;

  // 2. MATA KANAN TERPEJAM (MATA KIRI TERBUKA) -> SCROLL DOWN PER CONTAINER
  if (isRightClosed && !isLeftClosed) {
    isScrollLocked = true;
    scrollToNextContainer("down");

    if (statusBadge) {
      statusBadge.textContent = "Next Container 👇";
      statusBadge.className =
        "absolute bottom-1 left-1 right-1 bg-black/80 text-[10px] text-center text-yellow-400 py-1 rounded font-mono";
    }

    setTimeout(() => {
      isScrollLocked = false;
    }, SCROLL_COOLDOWN);
  }
  // 3. KEDUA MATA TERBUKA ATAU NORMAL
  else {
    if (statusBadge) {
      statusBadge.textContent = "Mata Terbuka";
      statusBadge.className =
        "absolute bottom-1 left-1 right-1 bg-black/80 text-[10px] text-center text-green-400 py-1 rounded font-mono";
    }
  }
}

/**
 * Mengaktifkan Kamera & Tracking
 */
async function startCamera() {
  const videoElement = document.getElementById("webcam");
  const container = document.getElementById("cameraPreviewContainer");

  if (!videoElement) return;
  if (container) container.classList.remove("hidden");

  if (!faceMesh) {
    faceMesh = new FaceMesh({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    faceMesh.onResults(onResults);
  }

  if (!cameraInstance) {
    cameraInstance = new Camera(videoElement, {
      onFrame: async () => {
        await faceMesh.send({ image: videoElement });
      },
      width: 320,
      height: 240,
    });
  }

  await cameraInstance.start();
}

/**
 * Mematikan Kamera & Tracking
 */
function stopCamera() {
  const container = document.getElementById("cameraPreviewContainer");
  const videoElement = document.getElementById("webcam");

  if (container) container.classList.add("hidden");
  if (cameraInstance) {
    cameraInstance.stop();
    cameraInstance = null;
  }

  if (videoElement && videoElement.srcObject) {
    const stream = videoElement.srcObject;
    const tracks = stream.getTracks();

    tracks.forEach((track) => {
      track.stop(); // Mematikan hardware webcam
    });

    videoElement.srcObject = null;
  }
}

/**
 * Controller Fungsi Toggle Kamera
 */
function setCameraState(active) {
  if (active) {
    startCamera().catch((err) => {
      console.error("Gagal membuka kamera:", err);
      alert("Akses kamera ditolak atau tidak didukung di perangkat ini.");
      const cameraToggle = document.getElementById("cameraToggle");
      if (cameraToggle) cameraToggle.checked = false;
    });
  } else {
    stopCamera();
  }
}
