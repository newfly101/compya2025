import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./ImageLightbox.module.scss";

// 공지 상세 히어로 이미지를 크게 보는 라이트박스.
// 배너는 대개 가로로 길어(3:1급) 세로 화면에 "맞추기"만 하면 이미 최대 폭이라 확대감이 없다 —
// 그래서 가로가 더 긴 이미지는 90도 눕혀 화면 높이를 꽉 채운다(표준 CSS 회전-맞춤 기법).
// 세로로 긴(또는 정사각) 이미지는 눕히지 않고 그대로 화면에 맞춘다.
const ImageLightbox = ({ open, imageUrl, alt, onClose }) => {
  const closeBtnRef = useRef(null);
  const lastFocusedRef = useRef(null);
  const [orientation, setOrientation] = useState(null); // null(판단 전) | "landscape" | "portrait"

  // 닫을 때마다 판단 결과도 초기화 — 다음에 열 때(다른 이미지일 수 있음) 새로 판단한다.
  const handleClose = () => {
    setOrientation(null);
    onClose();
  };

  // 열릴 때 포커스를 모달로 옮기고, 닫힐 때 원래 자리로 되돌린다.
  useEffect(() => {
    if (!open) return;
    lastFocusedRef.current = document.activeElement;
    closeBtnRef.current?.focus();

    return () => {
      lastFocusedRef.current?.focus?.();
    };
  }, [open]);

  // Esc 로 닫기 + 열려 있는 동안 뒤 배경 스크롤 잠금.
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- open 전환 시점에만 재구독하면 충분
  }, [open]);

  if (!open || !imageUrl) return null;

  const modalRoot = document.getElementById("modal") ?? document.body;

  const handleImgLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target;
    setOrientation(naturalWidth > naturalHeight ? "landscape" : "portrait");
  };

  const isRotated = orientation === "landscape";

  return createPortal(
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label={alt || "이미지 크게 보기"}
      onClick={handleClose}
    >
      {/* ✕ 버튼은 회전 박스 바깥의 형제 요소 — 화면 기준으로 항상 똑바로, 같은 자리에 있다 */}
      <button
        type="button"
        ref={closeBtnRef}
        className={styles.closeBtn}
        onClick={handleClose}
        aria-label="닫기"
      >
        ✕
      </button>

      {/* fitBox 는 display:contents 라 레이아웃에 관여하지 않음 — 세로/정사각 이미지는 기존과 동일하게 flex 중앙정렬로 맞춘다 */}
      <div
        className={isRotated ? styles.rotateBox : styles.fitBox}
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={imageUrl}
          alt={alt || ""}
          className={isRotated ? styles.rotatedImage : styles.image}
          style={{ opacity: orientation ? 1 : 0 }}
          onLoad={handleImgLoad}
        />
      </div>

      {isRotated && (
        <p className={styles.rotateHint}>화면을 옆으로 돌리면 더 편하게 볼 수 있어요</p>
      )}
    </div>,
    modalRoot
  );
};

export default ImageLightbox;
