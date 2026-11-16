import { useEffect } from "react";
import styles from "./AdminModal.module.scss";

// main 콘텐츠 컬럼 안에서만 뜨는 등록/수정 모달.
//
// 포탈(#modal)을 쓰지 않고 호출한 화면의 DOM 트리 안에 그대로 렌더링한다.
// 화면 루트(`{Domain}Screen.module.scss` 의 `.page` 등)는 `page-layout` 믹스인으로
// 이미 `position: relative` 를 갖고 있으므로, 이 오버레이를 `position: absolute; inset: 0`
// 으로 두면 그 루트 영역(= TopBar/Drawer 를 제외한 본문) 폭 안에서만 덮인다.
// 뷰포트 전체를 덮는 `position: fixed` 오버레이(문제였던 기존 구현)를 쓰지 않는다.
const AdminModal = ({ open, title, onClose, children, footer }) => {
  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className={styles.overlay} role="presentation" onClick={onClose}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <h3 id="admin-modal-title" className={styles.title}>
            {title}
          </h3>
          <button type="button" className={styles.closeBtn} aria-label="닫기" onClick={onClose}>
            ×
          </button>
        </div>
        <div className={styles.body}>{children}</div>
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>
  );
};

export default AdminModal;
