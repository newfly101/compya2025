// Tiptap 이 만든 HTML 에서 태그를 제거해 순수 텍스트만 남긴다(글자수·빈 본문 검사용).
export const stripHtml = (html) => (html ?? "").replace(/<[^>]*>/g, "").trim();
