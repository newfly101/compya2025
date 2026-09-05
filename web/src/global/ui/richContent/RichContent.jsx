import { useMemo } from "react";
import DOMPurify from "dompurify";
import styles from "./RichContent.module.scss";

// RichEditor(Tiptap)가 만들 수 있는 태그만 허용 — 그 외는 sanitize 로 제거.
const ALLOWED_TAGS = [
  "p", "br", "strong", "em", "u", "s",
  "h1", "h2", "h3", "h4",
  "ul", "ol", "li",
  "blockquote", "a", "img", "code", "pre", "hr", "span",
];

// 외부 링크는 새 탭 + noopener 강제. DOMPurify 인스턴스는 모듈 단위로 공유되므로
// 훅도 모듈 로드 시 한 번만 등록한다(렌더마다 재등록 방지).
DOMPurify.addHook("afterSanitizeAttributes", (node) => {
  if (node.tagName === "A") {
    node.setAttribute("target", "_blank");
    node.setAttribute("rel", "noopener noreferrer");
  }
});

// 도메인 비의존 공용 뷰어 — 운영자가 RichEditor 에서 작성한 HTML 을
// sanitize 후 그대로 렌더한다("쓴 대로 보인다" 보장). javascript: 스킴 등
// 위험 요소 차단은 DOMPurify 기본 동작에 맡긴다.
export default function RichContent({ html, className = "" }) {
  const safeHtml = useMemo(() => {
    if (!html) return "";
    return DOMPurify.sanitize(html, { ALLOWED_TAGS });
  }, [html]);

  if (!safeHtml) return null;

  return (
    <div
      className={`${styles.root} ${className}`.trim()}
      // DOMPurify sanitize 완료된 HTML 만 주입한다.
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );
}
