import { useMutation, useQuery } from "@tanstack/react-query";
import { fetchDeleteGsb, fetchGetGsb, fetchPostGsbSave, fetchPutGsb } from "@/domains/simulators/store/public/api.js";

// 실패는 Error(message) + { unauthorized } — 401 이면 화면이 로그인 안내를 띄운다
const wrap = (fn) => async (...args) => {
  try {
    return await fn(...args);
  } catch (error) {
    throw Object.assign(new Error(error?.response?.data?.message ?? error?.message ?? "잠시 후 다시 시도해 주세요."), {
      unauthorized: error?.response?.status === 401,
    });
  }
};

export const gsbKeys = { items: ["simulators", "gsb"] };

// 내 기록 — 화면이 로컬 편집본을 따로 들고 있어 서버값은 마운트 시 한 번만 읽는다(자동 재조회 끔).
export const useGsbQuery = () =>
  useQuery({
    queryKey: gsbKeys.items,
    queryFn: wrap(async () => (await fetchGetGsb())?.items ?? []),
    staleTime: Infinity,
    gcTime: 0,
  });

/** items: [{ legendId, gsbCount, selCount, skillIds[3], skillTiers[3] }] — 바뀐 선수만 */
export const usePutGsbMutation = () => useMutation({ mutationFn: wrap((items) => fetchPutGsb({ items })) });

export const useDeleteGsbMutation = () =>
  useMutation({
    mutationFn: wrap(async (legendId) => ({ legendId, ...(await fetchDeleteGsb(legendId)) })),
  });

export const usePostGsbSaveMutation = () => useMutation({ mutationFn: wrap(fetchPostGsbSave) });
