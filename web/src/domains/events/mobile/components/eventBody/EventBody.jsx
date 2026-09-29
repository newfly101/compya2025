import { useMemo } from "react";
import DOMPurify from "dompurify";
import styles from "./EventBody.module.scss";

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

// 이벤트 상세 페이지·관리자 미리보기가 같이 쓰는 본문 렌더러.
const EventBody = ({ html }) => {
  const safeHtml = useMemo(() => sanitizeBody(html), [html]);
  return <div className={styles.body} dangerouslySetInnerHTML={{ __html: safeHtml }} />;
};

export default EventBody;
