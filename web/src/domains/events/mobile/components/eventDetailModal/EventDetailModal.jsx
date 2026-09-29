import { useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import DOMPurify from "dompurify";
import { formatNow } from "@/global/utils/datetime/dateUtils";
import styles from "./EventDetailModal.module.scss";

// 서버(jsoup)가 한 번 정제한 본문을 화면 표시 직전에 DOMPurify 로 한 번 더 정제한다(2중 방어).
const ALLOWED_TAGS = [
  "p", "br", "strong", "em", "u", "s", "b", "i",
  "h1", "h2", "h3", "h4",
  "ul", "ol", "li", "blockquote", "a", "img", "hr", "span", "div",
  "table", "thead", "tbody", "tr", "th", "td",
];
const ALLOWED_ATTR = ["href", "src", "alt", "colspan", "rowspan", "target", "rel"];

const sanitizeBody = (html) => {
  if (!html) return "";
  const clean = DOMPurify.sanitize(html, { ALLOWED_TAGS, ALLOWED_ATTR, RETURN_DOM_FRAGMENT: true });
  clean.querySelectorAll("a").forEach((a) => {
    a.setAttribute("target", "_blank");
    a.setAttribute("rel", "noopener noreferrer");
  });
  const box = document.createElement("div");
  box.appendChild(clean);
  return box.innerHTML;
};

// 남은 날 — 날짜(KST) 단위 차이. 마감일 당일은 D-DAY.
const remainLabel = (expireAt) => {
  if (!expireAt) return null;
  const toDay = (s) => Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10));
  const diff = Math.round((toDay(expireAt) - toDay(formatNow())) / 86400000);
  if (diff < 0) return "종료";
  return diff === 0 ? "D-DAY" : `${diff}일 남음`;
};

const EventDetailModal = ({ event, onClose }) => {
  useEffect(() => {
    const onKeyDown = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const safeHtml = useMemo(() => sanitizeBody(event?.contentHtml), [event?.contentHtml]);
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
          <div className="event-body" dangerouslySetInnerHTML={{ __html: safeHtml }} />
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
