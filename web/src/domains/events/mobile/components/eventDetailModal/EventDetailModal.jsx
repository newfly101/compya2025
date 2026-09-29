// 관리자 화면 미리보기 전용 — 공개 화면은 EventDetailScreen(상세 페이지)을 쓴다.
import { useEffect } from "react";
import { createPortal } from "react-dom";
import EventBody from "@/domains/events/mobile/components/eventBody/EventBody.jsx";
import { remainLabel } from "@/domains/events/mobile/eventDate.js";
import styles from "./EventDetailModal.module.scss";

const EventDetailModal = ({ event, onClose }) => {
  useEffect(() => {
    // 편집 모달 위에 겹쳐 뜰 수 있다 — 캡처 단계에서 ESC 를 먼저 받아 이 미리보기만 닫고 아래 모달로 전파하지 않는다.
    const onKeyDown = (e) => {
      if (e.key !== "Escape") return;
      e.stopImmediatePropagation();
      onClose?.();
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [onClose]);

  if (!event) return null;

  const modalRoot = document.getElementById("modal") ?? document.body;
  const remain = remainLabel(event.expireAt);

  return createPortal(
    <div className={styles.overlay} role="presentation" onClick={onClose}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-label={event.title}
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className={styles.closeBtn} aria-label="닫기" onClick={onClose}>×</button>
        <div className={styles.scroll}>
          {event.imageUrl && <img className={styles.banner} src={event.imageUrl} alt="" />}
          <h2 className={styles.title}>{event.title}</h2>
          <p className={styles.period}>
            {event.startAt?.slice(0, 16)} ~ {event.expireAt?.slice(0, 16)}
            {remain && <span className={styles.remain}>{remain}</span>}
          </p>
          <div className={styles.bodyWrap}><EventBody html={event.contentHtml} /></div>
          <p className={styles.source}>출처: 컴투스프로야구 공식 카페</p>
          {event.externalLink && (
            <a className={styles.origin} href={event.externalLink} target="_blank" rel="noopener noreferrer">
              원문 보기
            </a>
          )}
        </div>
      </div>
    </div>,
    modalRoot,
  );
};

export default EventDetailModal;
