import { useCallback, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthentication } from "@/features/authentication/hooks/useAuthentication.js";
import { useLegendStats } from "@/features/legendStats/hooks/useLegendStats.js";
import {
  legendCollectionKeys,
  useLegendMaterialsMap,
  useMyCollectionQuery,
  usePutAcquiredAtMutation,
  usePutChangesMutation,
  usePutPreferencesMutation,
  useScheduleQuery,
} from "@/features/legendCollections/store/queries.js";
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
} from "@/features/legendCollections/config/legendCollections.js";

const EMPTY_SLOTS = [];
const EMPTY_IDS = [];
const EMPTY_ME = {
  version: null,
  legends: {},
  acquiredAt: {},
  frameAcquiredAt: {},
  materials: {},
  materialLegend: {},
  preferences: [],
};
const EMPTY_SCHEDULE = { todayDayNo: null, items: [] };

/**
 * 재료 보유 현황 — 레전드 목록(legendStats 재사용) + 내 기록 + 편집 초안.
 * edit=false(조회 화면)는 초안을 읽지도 쓰지도 않는다. edit=true(/manage)는 항상 편집 상태이고 초안을 sessionStorage 에 잠시 보관한다.
 * 서버 호출은 저장 버튼을 눌렀을 때만 일어난다.
 */
export const useLegendCollections = ({ edit = false } = {}) => {
  const qc = useQueryClient();
  const { isAuthenticated, login } = useAuthentication();
  const stats = useLegendStats();
  const meQuery = useMyCollectionQuery(isAuthenticated);
  const scheduleQuery = useScheduleQuery(isAuthenticated);
  const putChanges = usePutChangesMutation();
  const putPreferences = usePutPreferencesMutation();
  const putAcquiredAt = usePutAcquiredAtMutation();
  // 원본 slice 모양({ ...값, loaded, loading, error, mutateLoading })을 유지해 화면이 그대로 읽는다
  const me = {
    ...(meQuery.data ?? EMPTY_ME),
    loaded: meQuery.isSuccess,
    loading: meQuery.isFetching,
    error: meQuery.error ?? null,
    mutateLoading: putChanges.isPending || putPreferences.isPending || putAcquiredAt.isPending,
  };
  const schedule = {
    ...(scheduleQuery.data ?? EMPTY_SCHEDULE),
    loaded: scheduleQuery.isSuccess,
    loading: scheduleQuery.isFetching,
    error: scheduleQuery.error ?? null,
  };

  // 서버가 재료 상태에 레전드 id 를 주지 않아, 기록이 있으면 레전드별 재료를 받아 소속을 채운다(캐시된 레전드는 다시 받지 않는다).
  // 펼친 행(loadSlots)은 기록이 없어도 따로 받는다.
  const hasRecords = Object.keys(me.materials).length > 0;
  const legendIds = useMemo(() => stats.legends.map((l) => l.id), [stats.legends]);
  const [opened, setOpened] = useState(EMPTY_IDS);
  const wantedIds = useMemo(
    () => (isAuthenticated && hasRecords ? [...new Set([...legendIds, ...opened])] : opened),
    [isAuthenticated, hasRecords, legendIds, opened],
  );
  const { byId, loading: slotsLoading } = useLegendMaterialsMap(wantedIds);

  const [draft, setDraft] = useState(() => (edit ? loadDraft() : null) ?? EMPTY_DRAFT);
  const editing = edit;
  const [saveError, setSaveError] = useState(null);

  // 비로그인이면 남아 있던 초안을 쓰지 않는다
  useEffect(() => {
    if (!isAuthenticated || !edit) return;
    saveDraft(draft);
  }, [draft, isAuthenticated, edit]);

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

  const loadSlots = useCallback((legendId) => {
    if (legendId) setOpened((prev) => (prev.includes(legendId) ? prev : [...prev, legendId]));
  }, []);

  const slotsOf = useCallback(
    (legendId) => (byId[legendId] ? toSlots(byId[legendId], stats.teamNameByCode) : EMPTY_SLOTS),
    [byId, stats.teamNameByCode],
  );

  /** 초안 버리기 — 편집 화면은 그대로 열려 있다 */
  const cancelEdit = useCallback(() => {
    setDraft(EMPTY_DRAFT);
    clearDraft();
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

  const refreshMine = useCallback(async () => {
    await qc.refetchQueries({ queryKey: legendCollectionKeys.me });
  }, [qc]);

  /** 저장 — 성공하면 null, 실패하면 오류 정보를 돌려준다. 성공하면 초안을 비우고 내 기록을 다시 받는다. 실패하면 초안을 그대로 둔다 */
  const save = useCallback(async () => {
    setSaveError(null);
    try {
      await putChanges.mutateAsync(buildChangesBody(draft, me.version));
    } catch (e) {
      const error = e ?? { message: "저장하지 못했습니다." };
      setSaveError(error);
      return error;
    }
    await refreshMine();
    qc.invalidateQueries({ queryKey: legendCollectionKeys.schedule });
    setDraft(EMPTY_DRAFT);
    clearDraft();
    return null;
  }, [qc, putChanges, draft, me.version, refreshMine]);

  /** 충돌(409) — 서버 값을 다시 받는다. adopt 면 내 초안을 버린다 */
  const resolveConflict = useCallback(
    async (adopt) => {
      await refreshMine();
      if (adopt) cancelEdit();
      setSaveError(null);
    },
    [refreshMine, cancelEdit],
  );

  const savePreferences = useCallback(
    async (orderedIds, frameById) => {
      try {
        await putPreferences.mutateAsync(buildPreferencesBody(orderedIds, frameById, server, me.version));
      } catch (e) {
        return e ?? { message: "저장하지 못했습니다." };
      }
      await refreshMine();
      qc.invalidateQueries({ queryKey: legendCollectionKeys.schedule });
      return null;
    },
    [qc, putPreferences, server, me.version, refreshMine],
  );

  /** 획득일 저장 — patch: { frameAcquiredAt?, acquiredAt? } (null 이면 지우기). 성공하면 null, 실패하면 오류 정보 */
  const saveAcquiredAt = useCallback(
    async (legendId, patch) => {
      try {
        const saved = await putAcquiredAt.mutateAsync({ legendId, ...patch });
        // 성공하면 보낸 필드만 캐시에 반영한다
        qc.setQueryData(legendCollectionKeys.me, (old) => {
          if (!old) return old;
          const next = { ...old, acquiredAt: { ...old.acquiredAt }, frameAcquiredAt: { ...old.frameAcquiredAt } };
          if ("acquiredAt" in saved) next.acquiredAt[legendId] = saved.acquiredAt;
          if ("frameAcquiredAt" in saved) next.frameAcquiredAt[legendId] = saved.frameAcquiredAt;
          return next;
        });
        return null;
      } catch (e) {
        return e ?? { message: "저장하지 못했습니다." };
      }
    },
    [qc, putAcquiredAt],
  );

  const retryMe = useCallback(() => refreshMine(), [refreshMine]);

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
    slotsLoading,
    LEGEND,
    MATERIAL,
  };
};
