import PageShell from "@/components/layout/PageShell.jsx";
import HistoryLegendScreen from "@/features/historyLegend/HistoryLegendScreen.jsx";
import { fetchHistoryLegendInitial } from "@/features/historyLegend/api.js";
import { buildMetadata } from "@/lib/seo.js";

export const metadata = buildMetadata({
  title: "히스토리 재료",
  description: "히스토리 모드에서 레전드 재료를 어느 라운드에 얻는지 찾아보세요.",
  path: "/history-mode/legend",
});

// API 실패 시 fetchHistoryLegendInitial 이 throw → 직전 정상 페이지 유지, 최초면 app/error.jsx.
export default function HistoryLegendPage() {
  return (
    <PageShell title="히스토리 재료">
      <HistoryLegendBody />
    </PageShell>
  );
}

async function HistoryLegendBody() {
  return <HistoryLegendScreen initial={await fetchHistoryLegendInitial()} />;
}
