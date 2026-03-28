/**
 * 스킬 설명 텍스트를 main/subs 구조로 파싱합니다.
 * 콤마 기준 분리 (괄호 내부 + 숫자 뒤 콤마 제외), "및" 키워드로 서브 항목 분리
 */
export const parseDescription = (text = "") => {
  if (!text) return [];

  const baseChunks = text.split(/,(?![^()]*\))(?!\d)/g);

  return baseChunks.map((chunk) => {
    const parts = chunk.split(/\s+및\s+/g).map((s) => s.trim());
    return {
      main: parts[0],
      subs: parts.slice(1).map((sub) => `및 ${sub}`),
    };
  });
};
