import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchAdminGetNoticeList,
  fetchAdminGetNotice,
  fetchAdminInsertNotice,
  fetchAdminUpdateNotice,
  fetchAdminUpdateVisible,
  fetchAdminBulkDeleteNotices,
  fetchAdminBulkUpdateNoticesVisible,
  fetchAdminRefreshNotices,
} from "@/features/notices/store/api.js";
import { invalidatePublic } from "@/features/admin/config/adminQueryKeys.js";

export const adminNoticeKeys = { list: ["admin", "notices", "list"], detail: (id) => ["admin", "notices", "detail", String(id)] };

// BE 가 오래된 순으로 준다 — 화면은 최신이 위.
const newestFirst = (list) => [...list].reverse();

// BE 는 존재하지 않는 id 를 failedIds 로 분리해 돌려준다 — 요청 ids 를 성공으로 믿지 않는다.
const toBulkResult = (r) => ({ successIds: (r?.successIds ?? []).map(Number), failedIds: (r?.failedIds ?? []).map(Number) });

export const useAdminNoticeList = () =>
  useQuery({ queryKey: adminNoticeKeys.list, queryFn: async () => newestFirst(await fetchAdminGetNoticeList()), staleTime: 0 });

// 글쓰기 수정 모드 단건 — 폼이 한 번만 채워지므로 캐시를 남기지 않고 매번 새로 읽는다.
export const useAdminNoticeDetail = (id, enabled) =>
  useQuery({ queryKey: adminNoticeKeys.detail(id), queryFn: () => fetchAdminGetNotice(id), enabled, staleTime: 0, gcTime: 0 });

const useNoticeMutation = (mutationFn, { notifyFail, onSuccess } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn,
    meta: notifyFail ? { notify: { failure: notifyFail } } : undefined,
    onSuccess: (data, vars) => {
      if (onSuccess) onSuccess(qc, data, vars);
      else qc.invalidateQueries({ queryKey: adminNoticeKeys.list });
      invalidatePublic(qc, "notices");
    },
  });
};

export const useAdminNoticeCreate = () => useNoticeMutation(fetchAdminInsertNotice);
export const useAdminNoticeUpdate = () => useNoticeMutation(({ id, ...notice }) => fetchAdminUpdateNotice(id, notice));

// 행 토글은 화면에 오류 자리가 없다 — 실패만 전역 모달로 알린다. 응답은 Void 라 요청값으로 캐시를 바꾼다.
export const useAdminNoticeVisible = () =>
  useNoticeMutation(({ id, visible }) => fetchAdminUpdateVisible(id, visible), {
    notifyFail: "노출 설정을 바꾸지 못했습니다.",
    onSuccess: (qc, _d, { id, visible }) =>
      qc.setQueryData(adminNoticeKeys.list, (list) => list?.map((n) => (Number(n.id) === Number(id) ? { ...n, isVisible: visible } : n))),
  });

export const useAdminNoticeBulkDelete = () => useNoticeMutation(async (ids) => toBulkResult(await fetchAdminBulkDeleteNotices(ids)));
export const useAdminNoticeBulkVisible = () =>
  useNoticeMutation(async ({ ids, visible }) => ({ ...toBulkResult(await fetchAdminBulkUpdateNoticesVisible(ids, visible)), visible }));

// 캐시 동기화 — 서버 캐시를 비우고 DB 최신 목록을 돌려준다. 그대로 캐시에 넣는다.
export const useAdminNoticeRefresh = () =>
  useNoticeMutation(async () => newestFirst(await fetchAdminRefreshNotices()), {
    onSuccess: (qc, list) => qc.setQueryData(adminNoticeKeys.list, list),
  });
