import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchAdminCouponList,
  fetchAdminInsertCoupon,
  fetchAdminUpdateCoupon, fetchAdminUpdateVisible, fetchAdminDeleteCoupon,
  fetchAdminBulkDeleteCoupons, fetchAdminBulkUpdateVisible,
  fetchAdminRefreshCoupons,
} from "@/domains/coupons/store/admin/api.js";
import { ADMIN_COUPON_ACTIONS } from "@/domains/coupons/store/admin/endpoints.js";

// coupon_code 는 DB UNIQUE 이고 "삭제" 는 노출 끄기(is_visible=false)라 숨긴 쿠폰도 코드를 계속
// 점유한다 — 표에서 안 보이는 쿠폰 때문에 409 가 나는 함정을 문구로 드러낸다.
// client.js 의 공통 문구("데이터를 받지 못했습니다")는 409 를 구분하지 못해 여기서 덮어쓴다.
const DUPLICATE_CODE_MESSAGE =
  "이미 사용 중인 쿠폰 코드입니다. 숨긴 쿠폰도 코드를 계속 점유하므로 노출 필터의 '숨김' 에서 기존 쿠폰을 확인해 주세요.";

const toSaveErrorMessage = (error) =>
  error.response?.status === 409 ? DUPLICATE_CODE_MESSAGE : error.message;

// 서버는 존재하지 않는 id 를 failedIds 로 분리해 돌려준다(BulkOperationResponse).
// 요청한 ids 를 그대로 반환하면 실패분까지 성공 처리돼 관리자 화면에서 조용히 사라진다.
const toBulkResult = (response) => {
  const { successIds = [], failedIds = [] } = response ?? {};
  return { successIds: successIds.map(Number), failedIds: failedIds.map(Number) };
};

export const requestGetAdminCouponList = createAsyncThunk(
  ADMIN_COUPON_ACTIONS.GET_LIST, async (_, { rejectWithValue }) => {
    try {
      const list = await fetchAdminCouponList();

      return [...list].sort((a, b) => b.id - a.id);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
  // 이미 같은 요청이 날아가 있으면 건너뛴다 — 훅/화면이 같은 틱에 각자 dispatch 해도 1번만 나간다.
  { condition: (_, { getState }) => !getState().coupon.loading },
);

export const requestAdminInsertNewCoupon = createAsyncThunk(
  ADMIN_COUPON_ACTIONS.CREATE, async (newCoupon, { rejectWithValue, fulfillWithValue }) => {
    try {
      // 폼 값이 아니라 서버가 저장한 값을 그대로 목록에 넣는다 — 폼은 시각을 비우면 날짜
      // 10자만 보내므로 폼 값을 되돌리면 서버가 채운 만료 시각(23:59:59)을 못 받아 문자열
      // 비교(isExpired)가 저장 직후에만 어긋난다(events 와 동일 패턴).
      const saved = await fetchAdminInsertCoupon(newCoupon);

      // 통지 문구는 payload 가 아니라 meta 에 싣는다 — payload 에 섞으면 응답 엔티티가 아닌
      // 필드가 리듀서를 거쳐 목록 행에 그대로 저장되고, 실패는 payload 가 오류 문구 문자열이라
      // 통지를 담을 자리 자체가 없다(operationListener.js).
      // 실패 통지는 붙이지 않는다 — 등록 모달이 .unwrap() 으로 오류를 폼 안에 직접 보여준다.
      return fulfillWithValue(saved, { notify: { success: true, message: "쿠폰을 등록했습니다." } });
    } catch (error) {
      return rejectWithValue(toSaveErrorMessage(error));
    }
  },
);

export const requestAdminUpdateCoupon = createAsyncThunk(
  ADMIN_COUPON_ACTIONS.UPDATE, async ({ id, ...coupon }, { rejectWithValue, fulfillWithValue }) => {
    try {
      // 등록과 같은 이유로 서버 응답을 그대로 반영한다(서버가 채운 만료 시각 포함).
      const saved = await fetchAdminUpdateCoupon(id, coupon);

      return fulfillWithValue(saved, { notify: { success: true, message: "쿠폰을 수정했습니다." } });
    } catch (error) {
      return rejectWithValue(toSaveErrorMessage(error));
    }
  },
);

export const requestAdminUpdateCouponVisible = createAsyncThunk(
  ADMIN_COUPON_ACTIONS.UPDATE_VISIBLE, async ({id, visible}, { rejectWithValue }) => {
    try {
      // visible 토글 응답의 data 는 Void(null) — 응답에서 id 를 꺼내지 않고 요청 param 을 그대로 사용.
      await fetchAdminUpdateVisible(id, visible);

      return {
        id: Number(id),
        visible,
      }
    } catch (error) {
      // 행 토글은 화면에 오류 자리가 없다 — 실패하면 스위치가 조용히 제자리로 돌아가
      // 관리자는 눌렸는지조차 모른다. 그래서 실패만 전역 모달로 알린다.
      return rejectWithValue(error.message, {
        notify: { success: false, message: "노출 설정을 바꾸지 못했습니다." },
      });
    }
  },
);

export const requestAdminDeleteCoupon = createAsyncThunk(
  ADMIN_COUPON_ACTIONS.DELETE, async (id, { rejectWithValue }) => {
    try {
      await fetchAdminDeleteCoupon(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

// 일괄 삭제(= 노출 끄기). ids: number[] → { successIds, failedIds }
export const requestAdminBulkDeleteCoupons = createAsyncThunk(
  ADMIN_COUPON_ACTIONS.BULK_DELETE, async (ids, { rejectWithValue }) => {
    try {
      return toBulkResult(await fetchAdminBulkDeleteCoupons(ids));
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

// 일괄 노출 변경(주로 숨김). { ids, visible } → { successIds, failedIds, visible }
export const requestAdminBulkUpdateCouponsVisible = createAsyncThunk(
  ADMIN_COUPON_ACTIONS.BULK_UPDATE_VISIBLE, async ({ ids, visible }, { rejectWithValue }) => {
    try {
      return { ...toBulkResult(await fetchAdminBulkUpdateVisible(ids, visible)), visible };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

// 캐시 동기화 — 운영자가 DB 에 직접 넣은 row 를 재시작 없이 즉시 반영한다.
export const requestAdminRefreshCoupons = createAsyncThunk(
  ADMIN_COUPON_ACTIONS.REFRESH, async (_, { rejectWithValue }) => {
    try {
      const list = await fetchAdminRefreshCoupons();

      return [...list].sort((a, b) => b.id - a.id);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
  // 이미 같은 요청이 날아가 있으면 건너뛴다 — 훅/화면이 같은 틱에 각자 dispatch 해도 1번만 나간다.
  { condition: (_, { getState }) => !getState().coupon.loading },
);
