import PageShell from "@/components/layout/PageShell.jsx";
import AdminShellScreen from "@/features/admin/AdminShellScreen.jsx";

// /admin = 홈 탭
export default function AdminPage() {
  return (
    <PageShell title="컴프야펀 Admin">
      <AdminShellScreen />
    </PageShell>
  );
}
