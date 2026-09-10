import { useDispatch, useSelector } from "react-redux";
import { useEffect, useMemo } from "react";
import { requestGetSniperTargets } from "@/domains/mileage/store/public/thunks.js";

/**
 * 마일리지로 저격 가능한 재료 카드 — cardId → { legendName, teamCode, seasonYear } 맵.
 *
 * 히스토리(useHistoryBadge)와 달리 이름표를 맞출 필요가 없다 — 재료 응답에
 * playerCardId 가 그대로 있어 cardId 로 정확히 대조한다.
 * 값에 legendName 뿐 아니라 teamCode·seasonYear 도 같이 담는다 — 배지를 눌렀을 때
 * 마일리지 화면(?team=&year=)으로 바로 보내야 해서 링크 조립에 둘 다 필요하다.
 *
 * 마일리지 화면과 같은 store 라 그 화면을 먼저 봤다면 요청이 다시 나가지 않는다.
 * 응답이 늦거나 실패하면 빈 맵이라 배지만 안 붙고 평점표는 그대로 뜬다.
 */
export const useMileageBadge = () => {
  const dispatch = useDispatch();
  const { items, loaded } = useSelector((state) => state.mileage.sniperTargets);

  useEffect(() => {
    if (!loaded) dispatch(requestGetSniperTargets());
  }, [dispatch, loaded]);

  return useMemo(() => {
    const map = new Map();
    for (const t of items) {
      map.set(t.cardId, { legendName: t.legendName, teamCode: t.teamCode, seasonYear: t.seasonYear });
    }
    return map;
  }, [items]);
};
