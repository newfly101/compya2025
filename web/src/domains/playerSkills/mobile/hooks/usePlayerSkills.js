// 타자/투수 스킬을 store 에서 읽고, 현재 보고 있는 role 만 불러온다.
// 이미 채워진 role 은 다시 요청하지 않는다 — admin useAdminCounts.js 와 같은 가드 패턴
// (리스트가 비어있고 로딩중이 아닐 때만 dispatch).
import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  requestGetHitterSkills,
  requestGetPitcherSkills,
} from "@/domains/playerSkills/store/thunks.js";

export const usePlayerSkills = (type) => {
  const dispatch = useDispatch();
  const hitters = useSelector((state) => state.playerSkills.hitters);
  const pitchers = useSelector((state) => state.playerSkills.pitchers);

  // 의존성은 [dispatch, type] 만 둔다 — 요청 실패로 loading/items 이 바뀔 때마다
  // effect 가 다시 돌면 실패한 요청을 계속 재시도하는 무한 루프가 된다(admin
  // useAdminCounts.js 와 같은 이유로 상태값은 deps 에서 뺀다. 가드는 effect 안에서만 읽는다).
  useEffect(() => {
    if (type !== "hitter") return;
    if (hitters.items.length === 0 && !hitters.loading) dispatch(requestGetHitterSkills());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, type]);

  useEffect(() => {
    if (type !== "pitcher") return;
    if (pitchers.items.length === 0 && !pitchers.loading) dispatch(requestGetPitcherSkills());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, type]);

  // 화면 필터(filterAndSortSkills)가 type 으로 다시 걸러내므로 두 role 을 합쳐 넘긴다.
  const all = useMemo(() => [...hitters.items, ...pitchers.items], [hitters.items, pitchers.items]);

  const current = type === "hitter" ? hitters : pitchers;

  const retry = () => {
    dispatch(type === "hitter" ? requestGetHitterSkills() : requestGetPitcherSkills());
  };

  return {
    all,
    loading: current.loading,
    error: current.error,
    loaded: current.items.length > 0,
    retry,
  };
};
