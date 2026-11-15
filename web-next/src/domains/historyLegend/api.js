import { API_INTERNAL_URL } from "@/config/env.js";
import { toHistoryRoundModel } from "@/domains/historyLegend/config/historyLegend.js";
import { fetchLegendStatsInitial } from "@/domains/legendStats/api.js";

// 서버 컴포넌트용 fetch. 실패는 throw (coupons 와 같은 방식). 브라우저용은 store/public/api.js.
// 레전드 메타(구단·타입·포지션)는 레전드 평점표 마스터에서 오므로 그쪽 서버 fetch 를 재사용한다.
export const fetchHistoryLegendInitial = async () => {
  const [res, legend] = await Promise.all([
    fetch(`${API_INTERNAL_URL}/history-rounds`, { next: { revalidate: 300 } }),
    fetchLegendStatsInitial(),
  ]);
  if (!res.ok) throw new Error(`GET /history-rounds → HTTP ${res.status}`);
  const rounds = ((await res.json()).data ?? []).map(toHistoryRoundModel);
  return { rounds, legend };
};
