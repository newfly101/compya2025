export const parseDate = (str) => {
  if (!str) return null;

  // 1) 모든 공백/특수문자 제거 (줄바꿈, NBSP, zero-width space 포함)
  const cleaned = str
    .replace(/[\u200B-\u200D\uFEFF]/g, "") // zero width space 제거
    .replace(/\s+/g, " ")                  // 공백 통일
    .trim();

  // 2) YYYY. MM. DD HH:MM 형태에서 숫자만 정규식으로 추출
  const match = cleaned.match(/(\d{4})\.\s*(\d{2})\.\s*(\d{2})\s+(\d{2}):(\d{2})/);

  if (!match) return null;

  const [, year, month, day, hour, minute] = match.map(Number);

  return new Date(year, month - 1, day, hour, minute);
};
