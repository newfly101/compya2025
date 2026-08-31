// [미사용/삭제 대상] 2026-08-31 읽기 전용 재오픈 — mock 카테고리. 실제 게시판은 TIP/CLUB 뿐이라
// 매핑 불가. 샌드박스 권한으로 파일 삭제가 막혀 주석만 남김 — 수동 삭제 필요.
export const COMMUNITY_CATEGORIES = [
  { key: "all",        label: "전체" },
  { key: "trending",   label: "인기급상승" },
  { key: "free",       label: "자유게시판" },
  { key: "notice",     label: "전체공지" },
  { key: "update",     label: "업데이트" },
  // TODO: 구독 기능 구현 후 활성화
  // { key: "subscribe", label: "MY구독" },
];
