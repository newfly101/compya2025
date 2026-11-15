import { sanitizeHtml } from "@/global/ui/richContent/sanitizeHtml.js";
import styles from "./EventBody.module.scss";

// 서버(jsoup)가 한 번 정제한 본문을 렌더 직전에 한 번 더 정제한다(2중 방어). 서버 컴포넌트.
const TAGS = [
  "p", "br", "strong", "em", "u", "s", "b", "i",
  "h1", "h2", "h3", "h4",
  "ul", "ol", "li", "blockquote", "a", "img", "hr", "span", "div",
  "table", "thead", "tbody", "tr", "th", "td",
];
const ATTRS = ["href", "src", "alt", "colspan", "rowspan", "target", "rel"];

const EventBody = ({ html }) => (
  <div className={styles.body} dangerouslySetInnerHTML={{ __html: sanitizeHtml(html, { tags: TAGS, attrs: ATTRS }) }} />
);

export default EventBody;
