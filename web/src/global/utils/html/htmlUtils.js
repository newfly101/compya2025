// Tiptap 이 만든 HTML 문자열에서 태그를 제거해 순수 텍스트만 남긴다.
// 목록/카드 미리보기, 글자수 카운트 등 "태그 없이 본문만" 필요한 곳에서 공용으로 사용.
export const stripHtml = (html) => (html ?? "").replace(/<[^>]*>/g, "").trim();
