import { sanitizeHtml } from "./sanitizeHtml.js";
import styles from "./RichContent.module.scss";

// RichEditor(Tiptap)가 만들 수 있는 태그만 허용. 서버 컴포넌트로 렌더 — 본문이 SSR HTML 에 들어간다.
const TAGS = [
  "p", "br", "strong", "em", "u", "s",
  "h1", "h2", "h3", "h4",
  "ul", "ol", "li",
  "blockquote", "a", "img", "code", "pre", "hr", "span",
];

export default function RichContent({ html, className = "" }) {
  const safeHtml = sanitizeHtml(html, { tags: TAGS });
  if (!safeHtml) return null;
  return (
    <div
      className={`${styles.root} ${className}`.trim()}
      // sanitizeHtml 통과분만 주입한다.
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );
}
