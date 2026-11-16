import PageShell from "@/components/layout/PageShell.jsx";
import AdminNoticeWriteScreen from "@/features/notices/components/AdminNoticeWriteScreen.jsx";
import { adminMetadata } from "@/features/admin/config/adminMetadata.js";
import { ROUTE_PATHS } from "@/lib/routePath.js";

export const metadata = adminMetadata("공지 글쓰기", ROUTE_PATHS.admin_notice_write);

// id 는 화면이 useParams 로 읽는다 — 수정 모드
export default function AdminNoticeEditPage() {
  return (
    <PageShell title="글 수정">
      <AdminNoticeWriteScreen />
    </PageShell>
  );
}
