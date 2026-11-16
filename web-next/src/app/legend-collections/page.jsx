import { Suspense } from "react";
import PageShell from "@/components/layout/PageShell.jsx";
import AuthGate from "@/features/authentication/AuthGate.jsx";
import LegendCollectionsScreen from "@/features/legendCollections/LegendCollectionsScreen.jsx";

export const metadata = { title: "레전드 재료 보유 현황", robots: { index: false, follow: false } };

// 비로그인은 같은 주소에서 안내 화면(라우트 가드 없음). useSearchParams 사용 → Suspense
export default function LegendCollectionsPage() {
  return (
    <PageShell title="레전드 재료">
      <AuthGate>
          <Suspense>
            <LegendCollectionsScreen />
          </Suspense>
      </AuthGate>
    </PageShell>
  );
}
