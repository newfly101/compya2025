import PageShell from "@/layout/PageShell.jsx";
import OddsIndexScreen from "@/domains/odds/mobile/OddsIndexScreen.jsx";
import { buildMetadata } from "@/config/seo.js";

export const metadata = buildMetadata({
  title: "확률 공시",
  description: "컴투스 프로야구 확률형 아이템 확률 공시 정보를 안내합니다.",
  path: "/probability",
});

// 정적 데이터 — 빌드 시 SSG(○)
export default function ProbabilityPage() {
  return (
    <PageShell title="확률 공시">
      <OddsIndexScreen />
    </PageShell>
  );
}
