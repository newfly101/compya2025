import { buildMetadata } from "@/lib/seo.js";
import { ROUTE_PATHS } from "@/lib/routePath.js";

// 관리자 페이지 공통 metadata — 검색 노출 금지(noindex). 탭 이름이 있으면 제목에 붙인다.
export const adminMetadata = (label, path = ROUTE_PATHS.admin) => ({
  ...buildMetadata({ title: label ? `어드민 | ${label}` : "어드민", description: "컴프야펀 관리자 화면입니다.", path }),
  robots: { index: false, follow: false },
});
