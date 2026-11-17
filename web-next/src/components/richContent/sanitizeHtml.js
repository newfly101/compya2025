import DOMPurify from "isomorphic-dompurify";

// 태그는 호출부 허용목록(ALLOWED_TAGS), 속성도 허용목록(기본 DEFAULT_ATTRS — style·class 제외, Tiptap 이 만드는 것만).
// 링크는 새 탭 + noopener 강제, img src 는 http(s)/상대경로만(data:·javascript: 차단). 훅은 모듈 로드 시 한 번만 등록한다.
const DEFAULT_ATTRS = ["href", "src", "alt", "title"];
const SAFE_IMG_SRC = /^(https?:\/\/|\/)/i;

DOMPurify.addHook("afterSanitizeAttributes", (node) => {
  if (node.tagName === "A") {
    node.setAttribute("target", "_blank");
    node.setAttribute("rel", "noopener noreferrer");
  }
  if (node.tagName === "IMG" && !SAFE_IMG_SRC.test((node.getAttribute("src") ?? "").trim())) {
    node.removeAttribute("src");
  }
});

export const sanitizeHtml = (html, { tags, attrs = DEFAULT_ATTRS }) => {
  if (!html) return "";
  return DOMPurify.sanitize(String(html), { ALLOWED_TAGS: tags, ALLOWED_ATTR: attrs });
};

// 태그를 걷어 순수 텍스트만 — meta description 용.
export const stripHtml = (html) => (html ?? "").replace(/<[^>]*>/g, "").trim();
