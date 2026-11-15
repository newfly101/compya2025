import PageShell from "@/layout/PageShell.jsx";
import AuthGate from "@/domains/authentication/mobile/AuthGate.jsx";
import LegendCollectionManageScreen from "@/domains/legendCollections/mobile/LegendCollectionManageScreen.jsx";

export const metadata = { title: "내 기록 관리", robots: { index: false, follow: false } };

// 초안을 sessionStorage 에서 읽음 — AuthGate 가 세션 확인 뒤(브라우저)에만 그린다
export default function LegendCollectionManagePage() {
  return (
    <PageShell title="레전드 재료">
      <AuthGate>
          <LegendCollectionManageScreen />
      </AuthGate>
    </PageShell>
  );
}
