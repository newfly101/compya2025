// 상위 경로 카드의 "경로 | 제목" 토글이 쓰는 유틸 — page_path 문자열을 화면 제목으로 추론한다.
// 원본은 routeMeta.js 를 재사용했지만 Next 에는 routeMeta 가 없어(페이지마다 metadata) 주소→제목 표를 여기 둔다.
// 동적 세그먼트(:slug 등)는 실제 글 제목을 모르니 기본 제목으로 대체한다 — 예: "/notice/123-공지" → "공지사항 상세".
// ponytail: 새 화면이 생기면 이 표에 한 줄 추가. 표에 없으면 경로 그대로 보인다.
const ROUTES = [
  ["/", "홈"],
  ["/coupons", "쿠폰 모아보기"],
  ["/events", "이벤트"],
  ["/events/:id", "이벤트 상세"],
  ["/notices", "공지사항"],
  ["/notice/:slug", "공지사항 상세"],
  ["/probability", "확률 공시"],
  ["/probability/:id", "확률 공시 상세"],
  ["/players", "선수 백과사전"],
  ["/skills", "스킬 백과사전"],
  ["/legend-stats", "레전드 재료"],
  ["/legend-collections", "레전드 재료"],
  ["/legend-collections/manage", "내 기록 관리"],
  ["/legend-collection-skills", "레전드 재료"],
  ["/legend-collection-skills/:id/edit", "스킬 기록 편집"],
  ["/simulators/gsb", "스킬 시뮬레이션"],
  ["/history-mode/legend", "히스토리 재료"],
  ["/mileage", "마일리지 저격 경로"],
  ["/community", "커뮤니티"],
  ["/privacy", "개인정보처리방침"],
  ["/terms", "이용약관"],
  ["/contact", "문의하기"],
  ["/about", "사이트 소개"],
  ["/mypage", "마이페이지"],
  ["/mypage/history", "활동 내역"],
  ["/home/shortcuts", "바로가기 편집"],
  ["/guides", "가이드"],
  ["/guides/:slug", "가이드 상세"],
  ["/admin", "어드민"],
  ["/admin/:tab", "어드민"],
  ["/admin/notice/write", "어드민 | 공지 글쓰기"],
  ["/admin/notice/write/:id", "어드민 | 공지 글쓰기"],
].map(([path, title]) => ({
  title,
  isDynamic: path.includes(":"),
  pattern: new RegExp(`^${path.replace(/:[^/]+/g, "[^/]+")}/?$`),
}));

// 정적 경로를 동적 경로보다 먼저 검사한다 — 그러지 않으면 "/admin/notice" 가 "/admin/:tab" 와 순서에 좌우된다.
const STATIC_ROUTES = ROUTES.filter((e) => !e.isDynamic);
const DYNAMIC_ROUTES = ROUTES.filter((e) => e.isDynamic);

/** page_path(쿼리스트링 포함 가능) → 화면 제목. 매칭되는 항목이 없으면 경로 그대로. */
export const pathToTitle = (pagePath) => {
  const path = (pagePath ?? "").split("?")[0];
  const found = STATIC_ROUTES.find((e) => e.pattern.test(path)) ?? DYNAMIC_ROUTES.find((e) => e.pattern.test(path));
  return found ? found.title : pagePath;
};
