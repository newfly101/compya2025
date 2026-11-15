import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchAdminCouponList,
  fetchAdminInsertCoupon,
  fetchAdminUpdateCoupon,
  fetchAdminUpdateVisible,
  fetchAdminBulkDeleteCoupons,
  fetchAdminBulkUpdateVisible,
  fetchAdminRefreshCoupons,
} from "@/domains/coupons/store/admin/api.js";
import { invalidatePublic } from "@/domains/admin/config/adminQueryKeys.js";

export const adminCouponKeys = { list: ["admin", "coupons", "list"] };

const newestFirst = (list) => [...list].sort((a, b) => b.id - a.id);

// coupon_code 는 DB UNIQUE 이고 "삭제" 는 노출 끄기라 숨긴 쿠폰도 코드를 계속 점유한다 — 표에 안 보이는 쿠폰 때문에 409 가 나는 함정을 문구로 드러낸다.
const DUPLICATE_CODE_MESSAGE =
  "이미 사용 중인 쿠폰 코드입니다. 숨긴 쿠폰도 코드를 계속 점유하므로 노출 필터의 '숨김' 에서 기존 쿠폰을 확인해 주세요.";
const withDuplicateMessage = (fn) => async (arg) => {
  try {
    return await fn(arg);
  } catch (error) {
    if (error.response?.status === 409) error.message = DUPLICATE_CODE_MESSAGE;
    throw error;
  }
};

// BE 는 존재하지 않는 id 를 failedIds 로 분리해 돌려준다 — 요청 ids 를 성공으로 믿지 않는다.
const toBulkResult = (r) => ({ successIds: (r?.successIds ?? []).map(Number), failedIds: (r?.failedIds ?? []).map(Number) });

export const useAdminCouponList = () =>
  useQuery({ queryKey: adminCouponKeys.list, queryFn: async () => newestFirst(await fetchAdminCouponList()), staleTime: 0 });

const useCouponMutation = (mutationFn, { notify, notifyFail, onSuccess } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn,
    meta: notify || notifyFail ? { notify: { success: notify, failure: notifyFail } } : undefined,
    onSuccess: (data, vars) => {
      if (onSuccess) onSuccess(qc, data, vars);
      else qc.invalidateQueries({ queryKey: adminCouponKeys.list });
      invalidatePublic(qc, "coupons");
    },
  });
};

export const useAdminCouponCreate = () => useCouponMutation(withDuplicateMessage(fetchAdminInsertCoupon), { notify: "쿠폰을 등록했습니다." });
export const useAdminCouponUpdate = () =>
  useCouponMutation(withDuplicateMessage(({ id, ...coupon }) => fetchAdminUpdateCoupon(id, coupon)), { notify: "쿠폰을 수정했습니다." });

// 행 토글은 화면에 오류 자리가 없다 — 실패만 전역 모달로 알린다. 응답은 Void 라 요청값으로 캐시를 바꾼다.
export const useAdminCouponVisible = () =>
  useCouponMutation(({ id, visible }) => fetchAdminUpdateVisible(id, visible), {
    notifyFail: "노출 설정을 바꾸지 못했습니다.",
    onSuccess: (qc, _d, { id, visible }) =>
      qc.setQueryData(adminCouponKeys.list, (list) => list?.map((c) => (Number(c.id) === Number(id) ? { ...c, visible } : c))),
  });

export const useAdminCouponBulkDelete = () => useCouponMutation(async (ids) => toBulkResult(await fetchAdminBulkDeleteCoupons(ids)));
export const useAdminCouponBulkVisible = () =>
  useCouponMutation(async ({ ids, visible }) => ({ ...toBulkResult(await fetchAdminBulkUpdateVisible(ids, visible)), visible }));

// 캐시 동기화 — 서버 캐시를 비우고 DB 최신 목록을 돌려준다. 그대로 캐시에 넣는다.
export const useAdminCouponRefresh = () =>
  useCouponMutation(async () => newestFirst(await fetchAdminRefreshCoupons()), {
    onSuccess: (qc, list) => qc.setQueryData(adminCouponKeys.list, list),
  });
