// 「이용하기」를 눌러 entered 가 true 가 될 때만 최초 1회 요청한다.
// 진입(가이드 화면) 즉시 호출 금지 — README 핸드오프 규칙. 도움말로 다시 열어도(entered 유지) 재요청 없음.
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
