import PageShell from "@/layout/PageShell.jsx";
import AdminNoticeWriteScreen from "@/domains/notices/mobile/admin/AdminNoticeWriteScreen.jsx";
import { adminMetadata } from "@/domains/admin/config/adminMetadata.js";
import { ADMIN_PATHS } from "@/domains/admin/config/adminPaths.js";

export const metadata = adminMetadata("공지 글쓰기", ADMIN_PATHS.admin_notice_write);

export default function AdminNoticeWritePage() {
  return (
    <PageShell title="글쓰기">
      <AdminNoticeWriteScreen />
    </PageShell>
  );
}
