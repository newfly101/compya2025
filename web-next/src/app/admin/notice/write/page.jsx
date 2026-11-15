import PageShell from "@/layout/PageShell.jsx";
import AdminNoticeWriteScreen from "@/domains/notices/mobile/admin/AdminNoticeWriteScreen.jsx";
import { adminMetadata } from "@/domains/admin/config/adminMetadata.js";
import { ROUTE_PATHS } from "@/config/routePath.js";

export const metadata = adminMetadata("공지 글쓰기", ROUTE_PATHS.admin_notice_write);

export default function AdminNoticeWritePage() {
  return (
    <PageShell title="글쓰기">
      <AdminNoticeWriteScreen />
    </PageShell>
  );
}
