import { useQuery } from "@tanstack/react-query";
import { fetchGetHistoryRounds } from "@/domains/historyLegend/store/public/api.js";
import { toHistoryRoundModel } from "@/domains/historyLegend/config/historyLegend.js";

// 라운드 70개 + 25인 로스터 — 응답을 화면 모델로 바꿔 캐시한다(카드 표시 문자열 조립까지).
// TODO(next-migration): 히스토리 재료 화면 이전 시 이 파일을 확장한다 (지금은 레전드 평점표 배지용 조회만)
export const useHistoryRoundsQuery = () =>
  useQuery({
    queryKey: ["historyLegend", "rounds"],
    queryFn: async () => ((await fetchGetHistoryRounds()) ?? []).map(toHistoryRoundModel),
    staleTime: 30 * 60 * 1000,
  });
