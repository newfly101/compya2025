// 공지 날짜 표시 헬퍼 — publishedAt(발행일)이 없으면 createdAt(등록일)으로 대체한다.
// 어드민 글쓰기 화면에 발행일 입력이 없어 새 공지는 publishedAt 이 비어 있을 수 있다.
export const getNoticeDate = (notice) => notice?.publishedAt || notice?.createdAt || null;

// 화면 표시용 YYYY-MM-DD 문자열. 둘 다 없으면 null(호출부에서 렌더 자체를 생략해야 함).
export const formatNoticeDate = (notice) => {
  const raw = getNoticeDate(notice);
  return raw ? raw.slice(0, 10) : null;
};
