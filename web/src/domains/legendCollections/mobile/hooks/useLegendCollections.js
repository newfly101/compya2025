import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAuthentication } from "@/domains/authentication/hooks/useAuthentication.js";
import { useLegendStats } from "@/domains/legendStats/mobile/hooks/useLegendStats.js";
import {
  requestGetLegendMaterials,
  requestGetMyCollection,
  requestGetSchedule,
  requestPutAcquiredAt,
  requestPutChanges,
  requestPutPreferences,
} from "@/domains/legendCollections/store/public/thunks.js";
import {
  EMPTY_DRAFT,
  LEGEND,
  MATERIAL,
  buildChangesBody,
  buildPreferencesBody,
  canSetMaterial,
  changeCount,
  clearDraft,
  loadDraft,
  resetMaterials,
  saveDraft,
  setLegendDate,
  setLegendStatus,
  setMaterial,
  toSlots,
} from "@/domains/legendCollections/config/legendCollections.js";

const EMPTY_SLOTS = [];

/**
 * 재료 보유 현황 — 레전드 목록(legendStats 재사용) + 내 기록 + 편집 초안.
 * 서버 호출은 저장 버튼을 눌렀을 때만 일어난다. 초안은 sessionStorage 에 잠시 보관한다.
 */
export const useLegendCollections = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, login } = useAuthentication();
  const stats = useLegendStats();
  const me = useSelector((state) => state.legendCollections.me);
  const schedule = useSelector((state) => state.legendCollections.schedule);
  const { byId } = useSelector((state) => state.legendCollections.materials);

  const [draft, setDraft] = useState(() => loadDraft() ?? EMPTY_DRAFT);
  const [editing, setEditing] = useState(() => changeCount(loadDraft() ?? EMPTY_DRAFT) > 0);
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    if (isAuthenticated && !me.loaded && !me.loading && !me.error) dispatch(requestGetMyCollection());
  }, [dispatch, isAuthenticated, me.loaded, me.loading, me.error]);

  useEffect(() => {
    if (isAuthenticated && !schedule.loaded && !schedule.loading && !schedule.error) dispatch(requestGetSchedule());
  }, [dispatch, isAuthenticated, schedule.loaded, schedule.loading, schedule.error]);

  // 서버가 재료 상태에 레전드 id 를 주지 않아, 기록이 있으면 레전드별 재료를 받아 소속을 채운다.
  // 한 번 받은 레전드는 thunk 가 다시 요청하지 않는다.
  const hasRecords = Object.keys(me.materials).length > 0;
  const legendIds = useMemo(() => stats.legends.map((l) => l.id), [stats.legends]);
  useEffect(() => {
    if (!isAuthenticated || !hasRecords) return;
    legendIds.forEach((id) => dispatch(requestGetLegendMaterials(id)));
  }, [dispatch, isAuthenticated, hasRecords, legendIds]);

  // 비로그인이면 남아 있던 초안을 쓰지 않는다
  useEffect(() => {
    if (!isAuthenticated) return;
    saveDraft(draft);
  }, [draft, isAuthenticated]);

  // 펼쳐서 받은 재료의 레전드 소속도 합쳐 초안 칸의 레전드를 알 수 있게 한다
  const server = useMemo(() => {
    const materialLegend = { ...me.materialLegend };
    Object.entries(byId).forEach(([legendId, detail]) =>
      (detail?.materials ?? []).forEach((m) => {
        materialLegend[m.id] = legendId;
      }),
    );
    return {
      legends: me.legends,
      acquiredAt: me.acquiredAt,
      frameAcquiredAt: me.frameAcquiredAt,
      materials: me.materials,
      materialLegend,
      preferences: me.preferences,
    };
  }, [me.legends, me.acquiredAt, me.frameAcquiredAt, me.materials, me.materialLegend, me.preferences, byId]);

  const loadSlots = useCallback(
    (legendId) => {
      if (legendId) dispatch(requestGetLegendMaterials(legendId));
    },
    [dispatch],
  );

  const slotsOf = useCallback(
    (legendId) => (byId[legendId] ? toSlots(byId[legendId], stats.teamNameByCode) : EMPTY_SLOTS),
    [byId, stats.teamNameByCode],
  );

  const startEdit = useCallback(() => setEditing(true), []);

  const cancelEdit = useCallback(() => {
    setDraft(EMPTY_DRAFT);
    clearDraft();
    setEditing(false);
    setSaveError(null);
  }, []);

  const changeMaterial = useCallback(
    (legendId, materialId, next) =>
      setDraft((d) => (canSetMaterial(legendId, materialId, next, server, d) ? setMaterial(d, server, materialId, next) : d)),
    [server],
  );

  const changeLegend = useCallback(
    (legendId, next) => setDraft((d) => setLegendStatus(d, server, legendId, next)),
    [server],
  );

  const changeLegendDate = useCallback((legendId, date) => setDraft((d) => setLegendDate(d, legendId, date)), []);

  const resetLegend = useCallback(
    (legendId) =>
      setDraft((d) => resetMaterials(d, server, legendId, slotsOf(legendId).map((s) => s.id))),
    [server, slotsOf],
  );

  /** 저장 — 성공하면 null, 실패하면 오류 정보를 돌려준다. 성공하면 초안을 비우고 내 기록을 다시 받는다. 실패하면 초안을 그대로 둔다 */
  const save = useCallback(async () => {
    setSaveError(null);
    const result = await dispatch(requestPutChanges(buildChangesBody(draft, me.version)));
    if (requestPutChanges.rejected.match(result)) {
      const error = result.payload ?? { message: "저장하지 못했습니다." };
      setSaveError(error);
      return error;
    }
    await dispatch(requestGetMyCollection());
    dispatch(requestGetSchedule());
    setDraft(EMPTY_DRAFT);
    clearDraft();
    setEditing(false);
    return null;
  }, [dispatch, draft, me.version]);

  /** 충돌(409) — 서버 값을 다시 받는다. adopt 면 내 초안을 버린다 */
  const resolveConflict = useCallback(
    async (adopt) => {
      await dispatch(requestGetMyCollection());
      if (adopt) cancelEdit();
      setSaveError(null);
    },
    [dispatch, cancelEdit],
  );

  const savePreferences = useCallback(
    async (orderedIds, frameById) => {
      const result = await dispatch(requestPutPreferences(buildPreferencesBody(orderedIds, frameById, server, me.version)));
      if (requestPutPreferences.rejected.match(result)) return result.payload ?? { message: "저장하지 못했습니다." };
      await dispatch(requestGetMyCollection());
      dispatch(requestGetSchedule());
      return null;
    },
    [dispatch, server, me.version],
  );

  /** 획득일 저장 — patch: { frameAcquiredAt?, acquiredAt? } (null 이면 지우기). 성공하면 null, 실패하면 오류 정보 */
  const saveAcquiredAt = useCallback(
    async (legendId, patch) => {
      const result = await dispatch(requestPutAcquiredAt({ legendId, ...patch }));
      return requestPutAcquiredAt.rejected.match(result) ? (result.payload ?? { message: "저장하지 못했습니다." }) : null;
    },
    [dispatch],
  );

  const retryMe = useCallback(() => dispatch(requestGetMyCollection()), [dispatch]);

  return {
    isAuthenticated,
    login,
    stats,
    legends: stats.legends,
    me,
    server,
    meLoading: me.loading,
    meError: me.error,
    retryMe,
    schedule,
    draft,
    editing,
    dirty: changeCount(draft),
    saving: me.mutateLoading,
    saveError,
    startEdit,
    cancelEdit,
    changeMaterial,
    changeLegend,
    changeLegendDate,
    resetLegend,
    save,
    resolveConflict,
    savePreferences,
    saveAcquiredAt,
    loadSlots,
    slotsOf,
    slotsLoading: useSelector((state) => state.legendCollections.materials.loading),
    LEGEND,
    MATERIAL,
  };
};
