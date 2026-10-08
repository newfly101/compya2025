import { useEffect } from "react";
import styles from "./ModalFrame.module.scss";

// 등급·칭호 모달 공용 틀 — 화면 가운데 카드, 제목 · 스크롤 본문 · 푸터. Esc·바깥 클릭으로 닫힌다.
export default function ModalFrame({ title, onClose, footer, children }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.card} role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.title}>{title}</h3>
        <div className={styles.body}>{children}</div>
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>
  );
}
