// 서버 fetch 의 next.tags 와 /api/revalidate 화이트리스트가 같은 이름을 쓰도록 한 곳에 둔다.
export const REVALIDATE_TAGS = ["coupons", "events", "notices", "quiz", "home"];
// 홈 fetch 는 4개 섹션을 묶어 오므로 하위 도메인 태그를 모두 단다.
export const HOME_FETCH_TAGS = ["home", "coupons", "events", "notices", "quiz"];
