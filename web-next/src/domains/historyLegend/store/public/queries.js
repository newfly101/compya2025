import { useQuery } from "@tanstack/react-query";
import { fetchGetHistoryRounds } from "@/domains/historyLegend/store/public/api.js";
import { toHistoryRoundModel } from "@/domains/historyLegend/config/historyLegend.js";

// 라운드 70개 + 25인 로스터 — 응답을 화면 모델로 바꿔 캐시한다(카드 표시 문자열 조립까지).
// initialData: 서버 컴포넌트가 이미 모델로 바꿔 받은 값(선택) — 주면 SSR HTML 에 표가 들어간다.
export const useHistoryRoundsQuery = (initialData) =>
  useQuery({
    queryKey: ["historyLegend", "rounds"],
    queryFn: async () => ((await fetchGetHistoryRounds()) ?? []).map(toHistoryRoundModel),
    initialData,
    staleTime: 30 * 60 * 1000,
  });
