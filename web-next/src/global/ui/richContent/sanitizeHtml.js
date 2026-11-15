import DOMPurify from "isomorphic-dompurify";

// web 의 DOMPurify 설정과 동일: 태그는 허용목록(ALLOWED_TAGS), 속성은 attrs 를 주면 ALLOWED_ATTR,
// 안 주면 DOMPurify 기본(class·style 포함). 링크는 새 탭 + noopener 강제.
// 훅은 모듈 로드 시 한 번만 등록한다.
DOMPurify.addHook("afterSanitizeAttributes", (node) => {
  if (node.tagName === "A") {
    node.setAttribute("target", "_blank");
    node.setAttribute("rel", "noopener noreferrer");
  }
});

export const sanitizeHtml = (html, { tags, attrs }) => {
  if (!html) return "";
  return DOMPurify.sanitize(String(html), { ALLOWED_TAGS: tags, ...(attrs && { ALLOWED_ATTR: attrs }) });
};

// 태그를 걷어 순수 텍스트만 — meta description 용.
export const stripHtml = (html) => (html ?? "").replace(/<[^>]*>/g, "").trim();
