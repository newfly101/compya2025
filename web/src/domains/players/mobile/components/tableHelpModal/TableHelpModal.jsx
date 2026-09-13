// domains/players/mobile/components/tableHelpModal/TableHelpModal.jsx
// 리스트형 표 도움말 — 가운데 뜨는 모달(바텀시트 아님, 사용자 지시).
// 포커스·Esc·스크롤 잠금 패턴은 ImageLightbox.jsx 를 그대로 따른다(이 프로젝트의 기존 모달 관례).
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import styles from "./TableHelpModal.module.scss";

const TableHelpModal = ({ open, title, abbr, extra, onClose }) => {
  const closeBtnRef = useRef(null);
  const lastFocusedRef = useRef(null);

  // 열릴 때 포커스를 모달로, 닫힐 때 원래 자리로.
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
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- open 전환 시점에만 재구독하면 충분
  }, [open]);

  const modalRoot = document.getElementById("modal");
  if (!open || !modalRoot) return null;

  return createPortal(
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label={title} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <span className={styles.headerTitle}>{title}</span>
          <button type="button" ref={closeBtnRef} className={styles.closeBtn} onClick={onClose} aria-label="닫기">
            ✕
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.box}>
            <p className={styles.boxTitle}>열 약어</p>
            <div className={styles.abbrGrid}>
              {abbr.map((a) => (
                <div className={styles.abbrRow} key={a.k}>
                  <b className={styles.abbrKey}>{a.k}</b>
                  <span>{a.v}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.box}>
            <p className={styles.boxTitle}>사용법</p>
            <p className={styles.usageLine}>· 열 제목 탭 → ▲ 오름차순 / ▼ 내림차순</p>
            <p className={styles.usageLine}>· 아주 좁은 화면(400px 미만)에서는 왼쪽 열이 좌우로 스크롤됩니다</p>
            {extra.map((t) => (
              <p className={styles.usageLine} key={t}>
                · {t}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>,
    modalRoot
  );
};

export default TableHelpModal;
