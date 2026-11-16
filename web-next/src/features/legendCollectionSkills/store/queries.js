import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isRegistered } from "@/features/legendCollectionSkills/config/legendCollectionSkills.js";
import {
  fetchGetSkillItems,
  fetchPostBatch,
  fetchPostEvent,
  fetchPutSlots,
} from "@/features/legendCollectionSkills/store/api.js";

export const skillKeys = { items: ["legendCollectionSkills", "items"] };

// 실패는 Error(message) + { conflict, unauthorized } — 화면이 409·401 을 가른다
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

// 미등록(slots null 또는 칸 필드가 null)은 slots 를 null 로 통일 — 화면은 "slots 있음 = 등록" 하나로만 본다
// rev: 서버 응답을 받을 때마다 새 값 — 편집기가 key 로 써서 응답마다 로컬 상태(초안·선택)를 서버 기준으로 다시 만든다
let rev = 0;
const normalize = (item) => ({
  ...item,
  rev: ++rev,
  slots: isRegistered(item?.slots) ? item.slots : null,
  usage: item?.usage ?? { base: 0, gcg: 0, ggg: 0 },
  enhanceCount: item?.enhanceCount ?? 0,
});
const fetchItems = async () => ((await fetchGetSkillItems()) ?? []).map(normalize);

export const useSkillItemsQuery = (enabled = true) =>
  useQuery({ queryKey: skillKeys.items, queryFn: wrap(fetchItems), enabled });

/** 등록(PUT) 뒤 전체 목록을 다시 받는다 — PUT 응답 모양에 기대지 않고 서버 값으로 채운다 */
export const usePutSkillSlotsMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: wrap(async ({ legendId, slots }) => {
      await fetchPutSlots(legendId, { slots });
      return fetchItems();
    }),
    onSuccess: (items) => qc.setQueryData(skillKeys.items, items),
  });
};

// 한 항목만 갱신돼 돌아온다 — 목록에서 그 레전드 줄만 교체
const useReplaceItemMutation = (fn) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: wrap(async (arg) => normalize(await fn(arg))),
    onSuccess: (next) =>
      qc.setQueryData(skillKeys.items, (old) => old?.map((i) => (i.legendId === next.legendId ? next : i))),
  });
};

export const usePostSkillEventMutation = () =>
  useReplaceItemMutation(({ legendId, action, slot }) => fetchPostEvent(legendId, slot ? { action, slot } : { action }));

export const usePostSkillBatchMutation = () =>
  useReplaceItemMutation(({ legendId, actions }) => fetchPostBatch(legendId, { actions }));
