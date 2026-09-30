// domains/admin/mobile/components/adminAnalyticsTab/pathTitle.js
// 상위 경로 카드의 "경로 | 제목" 토글이 쓰는 유틸 — routeMeta.js 를 그대로 재사용해
// page_path 문자열을 화면 제목으로 추론한다. routeMeta 를 복제하지 않고 import 만 한다.
// 동적 세그먼트(:slug 등)는 실제 글 제목을 모르니 routeMeta 의 기본(인자 없는) 제목으로 대체한다 —
// 예: "/notice/123-공지" → NOTICE_DETAILS.title() → "컴프야펀 | 공지사항 상세".
import { ROUTE_META } from "@/app/router/config/routeMeta.js";

const toEntry = (meta) => ({
  meta,
  isDynamic: meta.path.includes(":"),
  pattern: new RegExp(`^${meta.path.replace(/:[^/]+/g, "[^/]+")}/?$`),
});

const ENTRIES = Object.values(ROUTE_META).map(toEntry);
// 정적 경로를 동적 경로보다 먼저 검사한다 — 그러지 않으면 "/admin" 이 "/admin/:tab" 에도
// 걸려 어느 쪽이 먼저 매칭될지 순서에 좌우된다.
const STATIC_ENTRIES = ENTRIES.filter((e) => !e.isDynamic);
const DYNAMIC_ENTRIES = ENTRIES.filter((e) => e.isDynamic);

const titleOf = (meta) => (typeof meta.title === "function" ? meta.title() : meta.title);

// "컴프야펀 | " 접두는 카드 폭에서 너무 길어 뗀다.
const stripBrand = (title) => title?.replace(/^컴프야펀\s*\|\s*/, "");

/** page_path(쿼리스트링 포함 가능) → 화면 제목. 매칭되는 routeMeta 항목이 없으면 경로 그대로. */
export const pathToTitle = (pagePath) => {
  const path = (pagePath ?? "").split("?")[0];
  const found =
    STATIC_ENTRIES.find((e) => e.pattern.test(path)) ??
    DYNAMIC_ENTRIES.find((e) => e.pattern.test(path));
  if (!found) return pagePath;
  return stripBrand(titleOf(found.meta)) ?? pagePath;
};
