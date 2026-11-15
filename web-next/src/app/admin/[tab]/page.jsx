import PageShell from "@/layout/PageShell.jsx";
import AdminShellScreen from "@/domains/admin/mobile/AdminShellScreen.jsx";
import { ADMIN_TABS } from "@/domains/admin/mobile/ADMIN_TABS.js";
import { adminMetadata } from "@/domains/admin/config/adminMetadata.js";
import { ADMIN_PATHS } from "@/domains/admin/config/adminPaths.js";

const TABS = ADMIN_TABS.filter((t) => t.key !== "home");

export const generateStaticParams = () => TABS.map((t) => ({ tab: t.key }));

export async function generateMetadata({ params }) {
  const { tab } = await params;
  return adminMetadata(TABS.find((t) => t.key === tab)?.label, ADMIN_PATHS.admin_tab(tab));
}

// 모르는 탭 키는 셸이 홈으로 흡수한다
export default function AdminTabPage() {
  return (
    <PageShell title="컴프야펀 Admin">
      <AdminShellScreen />
    </PageShell>
  );
}
