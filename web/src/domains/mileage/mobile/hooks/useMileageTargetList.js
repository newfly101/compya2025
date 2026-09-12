// domains/mileage/mobile/hooks/useMileageTargetList.js
// 「저격 선수 리스트」 탭 데이터 훅 — store-sharing-design.md §5 설계 그대로.
// mileage.sniperTargets 를 useMileageBadge.js 와 동일 가드로 다시 구독한다(반환 형태가
// Map vs 화면모델 배열로 서로 달라 훅 자체는 분리 유지 — 과설계 방지, 같은 설계문서 §5 결론).

import { useCallback, useMemo, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { requestGetSniperTargets } from "@/domains/mileage/store/public/thunks.js";
import { filterRows, sortRows, toTargetListModel } from "@/domains/mileage/config/mileageTargetList.js";

export function useMileageTargetList() {
  const dispatch = useDispatch();
  const { items, loaded, loading, error } = useSelector((state) => state.mileage.sniperTargets);

  useEffect(() => {
    if (!loaded) dispatch(requestGetSniperTargets());
  }, [dispatch, loaded]);

  const [query, setQuery] = useState("");
  const [mode, setMode] = useState("pos"); // 'pos'(재료) | 'legend'
  const [pos, setPos] = useState(null); // null = 전체
  const [sortKey, setSortKey] = useState("pos");
  const [dir, setDir] = useState(1);

  const data = useMemo(() => items.map(toTargetListModel), [items]);

  // 부포지션만으로 존재하는 칸도 칩을 활성화해야 한다(예: 아무도 주포지션 DH 가 없어도
  // 겸업 부포지션 DH 카드가 있으면 DH 칩은 눌러져야 함).
  const availablePositions = useMemo(
    () => new Set(data.flatMap((d) => (d.subPos ? [d.pos, d.subPos] : [d.pos]))),
    [data],
  );

  const rows = useMemo(
    () => sortRows(filterRows(data, { pos, query, mode }), sortKey, dir),
    [data, pos, query, mode, sortKey, dir],
  );

  // 검색 모드 토글은 포지션 필터를 리셋하지 않는다(핸드오프 §"필터·검색·정렬" 4)
  const changeMode = useCallback((next) => setMode(next), []);
  const selectPos = useCallback((next) => setPos(next), []);

  // 같은 열 재클릭 시 dir 반전, 다른 열 클릭 시 그 열 + dir=1
  const toggleSort = useCallback(
    (key) => {
      if (key === sortKey) setDir((d) => -d);
      else {
        setSortKey(key);
        setDir(1);
      }
    },
    [sortKey],
  );
  // 카운터 행 정렬 라벨 클릭 — 열은 그대로 두고 dir만 반전
  const reverseDir = useCallback(() => setDir((d) => -d), []);

  const retry = useCallback(() => dispatch(requestGetSniperTargets()), [dispatch]);

  return {
    data,
    rows,
    total: data.length,
    loading,
    loaded,
    error,
    retry,
    query,
    setQuery,
    mode,
    changeMode,
    pos,
    selectPos,
    availablePositions,
    sortKey,
    dir,
    toggleSort,
    reverseDir,
  };
}
