import { useDispatch, useSelector } from "react-redux";
import { useEffect, useMemo } from "react";
import { requestGetHistoryRounds } from "@/domains/historyLegend/store/public/thunks.js";

/**
 * 히스토리 모드 로스터에 등장하는 카드 집합 ("백인천'82" 형태).
 *
 * 재료 카드 하나하나가 히스토리에서 나오는지 표시하는 데 쓴다.
 * 카드 표기는 재료 쪽(toMaterialModel)과 같은 규칙으로 조립돼 그대로 맞물린다.
 *
 * 탐색기와 같은 store 라 그 화면을 먼저 봤다면 요청이 다시 나가지 않는다.
 * 응답이 늦거나 실패하면 빈 집합이라 배지만 안 붙고 평점표는 그대로 뜬다.
 */
export const useHistoryBadge = () => {
  const dispatch = useDispatch();
  const { items: rounds, loaded } = useSelector((state) => state.historyLegend.rounds);

  useEffect(() => {
    if (!loaded) dispatch(requestGetHistoryRounds());
  }, [dispatch, loaded]);

  return useMemo(() => {
    const cards = new Set();
    for (const round of rounds) {
      for (const entry of round.roster) cards.add(entry.card);
    }
    return cards;
  }, [rounds]);
};
