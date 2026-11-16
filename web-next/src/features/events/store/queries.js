import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchAdminInsertExEvent,
  fetchAdminUpdateExEvent,
  fetchAdminUpdateExVisible,
  fetchAdminAllEventList,
  fetchAdminBulkDeleteEvents,
  fetchAdminBulkUpdateEventsVisible,
  fetchAdminSyncCafe,
  fetchAdminRefreshCollected,
} from "@/features/events/store/api.js";
import { invalidatePublic } from "@/features/admin/config/adminQueryKeys.js";

export const adminEventKeys = { list: ["admin", "events", "list"] };

// 목록은 BE 가 페이지로 자른다(기본 size 20). 클라이언트 검색·필터를 위해 한 번에 전량을 요청한다. 셸 탭 배지와 같은 키라 요청은 1번.
export const EVENTS_FETCH_ALL_SIZE = 1000;

// 원본 baseEventDTO 와 동일 — contentHtml 은 서버 수집 전용이라 저장 페이로드에 싣지 않는다.
const toBody = (s) => ({
  title: s.title,
  eventType: s.eventType,
  startAt: s.startAt,
  expireAt: s.expireAt,
  imageUrl: s.imageUrl,
  externalLink: s.externalLink,
  visible: s.visible,
});

// BE 는 존재하지 않는 id 를 failedIds 로 분리해 돌려준다 — 요청 ids 를 성공으로 믿지 않는다.
const toBulkResult = (r) => ({ successIds: (r?.successIds ?? []).map(Number), failedIds: (r?.failedIds ?? []).map(Number) });

export const useAdminEventList = () =>
  useQuery({ queryKey: adminEventKeys.list, queryFn: () => fetchAdminAllEventList({ page: 0, size: EVENTS_FETCH_ALL_SIZE }), staleTime: 0 });

const useEventMutation = (mutationFn, { notify, notifyFail, onSuccess } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn,
    meta: notify || notifyFail ? { notify: { success: notify, failure: notifyFail } } : undefined,
    onSuccess: (data, vars) => {
      onSuccess?.(qc, data, vars);
      qc.invalidateQueries({ queryKey: adminEventKeys.list });
      invalidatePublic(qc, "events");
    },
  });
};

export const useAdminEventCreate = () => useEventMutation((e) => fetchAdminInsertExEvent(toBody(e)), { notify: "이벤트를 등록했습니다." });
export const useAdminEventUpdate = () => useEventMutation(({ id, ...e }) => fetchAdminUpdateExEvent(id, toBody(e)), { notify: "이벤트를 수정했습니다." });

// 행 토글은 화면에 오류 자리가 없다 — 실패는 전역 모달로 알린다. 성공 응답은 Void 라 요청값으로 캐시를 바꾼다.
export const useAdminEventVisible = () =>
  useEventMutation(({ id, visible }) => fetchAdminUpdateExVisible(id, visible), {
    notifyFail: "노출 설정을 바꾸지 못했습니다.",
    onSuccess: (qc, _d, { id, visible }) =>
      qc.setQueryData(adminEventKeys.list, (list) => list?.map((e) => (Number(e.id) === Number(id) ? { ...e, visible } : e))),
  });

export const useAdminEventBulkDelete = () => useEventMutation(async (ids) => toBulkResult(await fetchAdminBulkDeleteEvents(ids)));
export const useAdminEventBulkVisible = () =>
  useEventMutation(async ({ ids, visible }) => ({ ...toBulkResult(await fetchAdminBulkUpdateEventsVisible(ids, visible)), visible }));
export const useAdminEventSyncCafe = () => useEventMutation(fetchAdminSyncCafe);
export const useAdminEventRefreshCollected = () => useEventMutation(fetchAdminRefreshCollected);
