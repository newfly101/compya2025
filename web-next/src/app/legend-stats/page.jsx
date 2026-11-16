import PageShell from "@/components/layout/PageShell.jsx";
import LegendStatsScreen from "@/features/legendStats/LegendStatsScreen.jsx";
import { fetchLegendStatsInitial } from "@/features/legendStats/api.js";
import { buildMetadata } from "@/lib/seo.js";

export const metadata = buildMetadata({
  title: "레전드 재료",
  description: "컴프야펀은 컴투스 프로야구 공식 공지, 이벤트, 쿠폰, 공략 정보를 한눈에 볼 수 있는 팬 사이트입니다.",
  // routeSeo.js 에 /legend-stats 항목이 없어 원본도 기본 description 을 썼다 — 그대로 유지
  path: "/legend-stats",
});

// API 실패 시 fetchLegendStatsInitial 이 throw → 직전 정상 페이지 유지, 최초면 app/error.jsx.
export default function LegendStatsPage() {
  return (
    <PageShell title="레전드 재료">
      <LegendStatsBody />
    </PageShell>
  );
}

async function LegendStatsBody() {
  return <LegendStatsScreen initial={await fetchLegendStatsInitial()} />;
}
