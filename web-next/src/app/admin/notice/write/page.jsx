import PageShell from "@/components/layout/PageShell.jsx";
import AdminNoticeWriteScreen from "@/features/notices/components/AdminNoticeWriteScreen.jsx";
import { adminMetadata } from "@/features/admin/config/adminMetadata.js";
import { ROUTE_PATHS } from "@/lib/routePath.js";

export const metadata = adminMetadata("공지 글쓰기", ROUTE_PATHS.admin_notice_write);

export default function AdminNoticeWritePage() {
  return (
    <PageShell title="글쓰기">
      <AdminNoticeWriteScreen />
    </PageShell>
  );
}
