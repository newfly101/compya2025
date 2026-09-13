// domains/guides/mobile/GuideModal.jsx
// 가이드 콘텐츠를 화면 가운데 모달로 띄우는 공용 껍데기 — 각 도메인 화면의 도움말 버튼이
// 이 컴포넌트에 slug를 넘겨 연다. 내용은 항상 GuideContent(공용 렌더러)로만 그린다
// (콘텐츠를 모달용으로 따로 베껴 쓰지 않는다 — /guides/:slug 와 동일 소스).
// 포커스·Esc·스크롤 잠금 패턴은 players/TableHelpModal.jsx 를 그대로 따른다(기존 모달 관례).
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import GuideContent from "./GuideContent.jsx";
import styles from "./GuideModal.module.scss";

const GuideModal = ({ open, guide, onClose }) => {
  const closeBtnRef = useRef(null);
  const lastFocusedRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    lastFocusedRef.current = document.activeElement;
    closeBtnRef.current?.focus();

    return () => {
      lastFocusedRef.current?.focus?.();
    };
  }, [open]);

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
  if (!open || !modalRoot || !guide) return null;

  return createPortal(
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label={guide.title} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <span className={styles.headerTitle}>{guide.title}</span>
          <button type="button" ref={closeBtnRef} className={styles.closeBtn} onClick={onClose} aria-label="닫기">
            ✕
          </button>
        </div>

        <div className={styles.body}>
          <GuideContent guide={guide} headingLevel="h3" />
        </div>

        <Link to={`/guides/${guide.slug}`} className={styles.fullLink} onClick={onClose}>
          가이드 전체 화면으로 보기 →
        </Link>
      </div>
    </div>,
    modalRoot
  );
};

export default GuideModal;
