import PageShell from "@/layout/PageShell.jsx";
import AdminShellScreen from "@/domains/admin/mobile/AdminShellScreen.jsx";

// /admin = 홈 탭
export default function AdminPage() {
  return (
    <PageShell title="컴프야펀 Admin">
      <AdminShellScreen />
    </PageShell>
  );
}
