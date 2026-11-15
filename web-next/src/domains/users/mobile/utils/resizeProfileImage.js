// 운영 nginx client_max_body_size 가 1MB 라 휴대폰 원본 사진(3~5MB)은 대부분 막힌다.
// 표시 크기가 58~60px 뿐이므로 고해상도 대비 4배인 240px 정사각이면 충분하다.
// 그래도 크면 품질 → 크기 순으로 낮춰가며 재시도해 300KB 상한을 확실히 지킨다.
const SIZE_STEPS = [240, 200, 160];
const QUALITY_STEPS = [0.85, 0.7, 0.55, 0.4];
const MAX_BYTES = 300 * 1024;
const MAX_SOURCE_BYTES = 20 * 1024 * 1024; // 원본 자체가 비정상적으로 큰 경우만 사전 차단

// 서버로 보내기 전 브라우저에서 먼저 막는다 — 이미지가 아니거나 너무 큰 파일.
export const validateProfileImageFile = (file) => {
  if (!file) return "파일을 선택해 주세요.";
  if (!file.type?.startsWith("image/")) return "이미지 파일만 올릴 수 있습니다.";
  if (file.size > MAX_SOURCE_BYTES) return "파일 용량이 너무 큽니다. 20MB 이하 이미지를 선택해 주세요.";
  return null;
};

const loadImage = (file) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve({ img, url });
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("이미지를 읽을 수 없습니다."));
    };
    img.src = url;
  });

// 가운데를 정사각으로 잘라 outSize 로 그린다 — 비율이 다른 원본이 찌그러지지 않게.
// 원본이 outSize 보다 작으면 확대하지 않는다(화질 저하 방지).
const cropToSquareCanvas = (img, outSize) => {
  const side = Math.min(img.naturalWidth, img.naturalHeight);
  const size = Math.min(outSize, side);
  const sx = (img.naturalWidth - side) / 2;
  const sy = (img.naturalHeight - side) / 2;

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  // JPEG 는 투명을 지원하지 않는다 — 흰 배경을 먼저 깔아 검게 뜨는 것을 막는다.
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, size, size);
  ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);
  return canvas;
};

const canvasToBlob = (canvas, quality) =>
  new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));

/**
 * 프로필 이미지 파일을 정사각 JPEG 로 줄인다.
 * 240px 정사각에서 품질을 낮춰가며 시도하고, 그래도 300KB 를 넘으면 크기까지 줄여 재시도한다.
 * 최저 크기·품질 조합도 넘는 극단적인 경우엔 그 결과라도 반환한다(무한정 재시도하지 않음).
 * @param {File} file
 * @returns {Promise<Blob>}
 */
export const resizeProfileImage = async (file) => {
  const { img, url } = await loadImage(file);
  try {
    let lastBlob = null;
    for (const size of SIZE_STEPS) {
      const canvas = cropToSquareCanvas(img, size);
      for (const quality of QUALITY_STEPS) {
        const blob = await canvasToBlob(canvas, quality);
        if (!blob) continue;
        lastBlob = blob;
        if (blob.size <= MAX_BYTES) return blob;
      }
    }
    if (!lastBlob) throw new Error("이미지 축소에 실패했습니다.");
    return lastBlob;
  } finally {
    URL.revokeObjectURL(url);
  }
};
