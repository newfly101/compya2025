// 화면 진입 즉시 최초 1회 요청한다 (AdSense 심사 대응 — 게이트 제거, 2026-09-13).
// entered 인자는 항상 true 로 호출되지만, 호출부 시그니처 호환을 위해 그대로 둔다.
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { requestGetPlayerCards } from "@/domains/players/store/thunks.js";

export const usePlayerCards = (entered) => {
  const dispatch = useDispatch();
  const { items, loading, error, loaded } = useSelector((state) => state.players.cards);

  // 의존성은 [dispatch, entered] 만 둔다 — loading/loaded 를 deps 에 넣으면
  // 실패 시 재요청이 반복되는 루프가 된다(playerSkills usePlayerSkills.js 와 같은 이유).
  useEffect(() => {
    if (!entered) return;
    if (!loaded && !loading) dispatch(requestGetPlayerCards());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, entered]);

  const retry = () => dispatch(requestGetPlayerCards());

  return { items, loading, error, loaded, retry };
};
