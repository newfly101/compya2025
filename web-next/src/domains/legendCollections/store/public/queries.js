import { useMutation, useQueries, useQuery } from "@tanstack/react-query";
import {
  fetchGetLegendMaterials,
  fetchGetMyCollection,
  fetchGetSchedule,
  fetchPutAcquiredAt,
  fetchPutChanges,
  fetchPutPreferences,
} from "@/domains/legendCollections/store/public/api.js";
import { toMyCollection, toSchedule } from "@/domains/legendCollections/store/dto.js";

export const legendCollectionKeys = {
  me: ["legendCollections", "me"],
  schedule: ["legendCollections", "schedule"],
  materials: (legendId) => ["legendCollections", "materials", legendId],
};

// 실패는 Error(message) + { conflict, unauthorized } 로 통일 — 화면이 409(버전 충돌)·401 을 가른다
const toFailure = (error) =>
  Object.assign(new Error(error?.response?.data?.message ?? error?.message ?? "잠시 후 다시 시도해 주세요."), {
    conflict: error?.response?.status === 409,
    unauthorized: error?.response?.status === 401,
  });

const wrap = (fn) => async (...args) => {
  try {
    return await fn(...args);
  } catch (error) {
    throw toFailure(error);
  }
};

// 내 기록 — 비로그인이면 요청하지 않으므로(enabled=false) isSuccess=false 가 "열람 전용" 이다
export const useMyCollectionQuery = (enabled) =>
  useQuery({
    queryKey: legendCollectionKeys.me,
    queryFn: wrap(async () => toMyCollection(await fetchGetMyCollection())),
    enabled,
  });

export const useScheduleQuery = (enabled) =>
  useQuery({
    queryKey: legendCollectionKeys.schedule,
    queryFn: wrap(async () => toSchedule(await fetchGetSchedule())),
    enabled,
  });

// 재료 8칸(선수 6 + 코치 2) — 요청한 레전드만, 한 번 받은 레전드는 캐시에서 쓴다. byId: { [legendId]: 응답 }
const combineMaterials = (results) => ({
  byId: Object.fromEntries(results.filter((r) => r.data).map((r) => [r.data.legendId, r.data.detail])),
  loading: results.some((r) => r.isFetching),
});
export const useLegendMaterialsMap = (ids) =>
  useQueries({
    queries: ids.map((id) => ({
      queryKey: legendCollectionKeys.materials(id),
      queryFn: wrap(async () => ({ legendId: id, detail: await fetchGetLegendMaterials(id) })),
      staleTime: 30 * 60 * 1000,
    })),
    combine: combineMaterials,
  });

/** 편집 변경분 — 서버 응답을 그대로 돌려준다. 저장 뒤 화면은 내 상태를 다시 조회해 채운다. */
export const usePutChangesMutation = () => useMutation({ mutationFn: wrap(async (body) => (await fetchPutChanges(body)) ?? {}) });

export const usePutPreferencesMutation = () =>
  useMutation({ mutationFn: wrap(async (body) => (await fetchPutPreferences(body)) ?? {}) });

/** arg: { legendId, frameAcquiredAt?, acquiredAt? } — 성공하면 { legendId, ...보낸 필드 } */
export const usePutAcquiredAtMutation = () =>
  useMutation({
    mutationFn: wrap(async ({ legendId, ...dates }) => {
      await fetchPutAcquiredAt(legendId, dates);
      return { legendId, ...dates };
    }),
  });
