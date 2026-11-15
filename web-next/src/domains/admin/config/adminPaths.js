// 관리자 경로 상수 — config/routePath.js 로 이관 대상(다른 agent 작업 중이라 여기에 둔다).
// 원본 ROUTE_PATHS 의 admin / admin_tab / admin_notice_write* 와 같은 주소.
export const ADMIN_PATHS = {
  admin: "/admin",
  admin_tab: (tab) => `/admin/${tab}`,
  admin_notice_write: "/admin/notice/write",
  admin_notice_write_edit: (id) => `/admin/notice/write/${id}`,
};
