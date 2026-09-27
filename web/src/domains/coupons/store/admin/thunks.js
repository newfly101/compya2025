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
);

export const requestAdminInsertNewCoupon = createAsyncThunk(
  ADMIN_COUPON_ACTIONS.CREATE, async (newCoupon, { rejectWithValue }) => {
    try {
      // options 는 응답 엔티티 필드가 아니라 "화면에 띄울 알림" 이어야 한다.
      const { id: couponId } = await fetchAdminInsertCoupon(newCoupon);

      return {
        ...newCoupon,
        id: Number(couponId),
        options: { success: true, message: "쿠폰을 등록했습니다." },
      };
    } catch (error) {
      return rejectWithValue(toSaveErrorMessage(error));
    }
  },
);

export const requestAdminUpdateCoupon = createAsyncThunk(
  ADMIN_COUPON_ACTIONS.UPDATE, async ({ id, ...coupon }, { rejectWithValue }) => {
    try {
      const { id: couponId } = await fetchAdminUpdateCoupon(id, coupon);

      return {
        ...coupon,
        id: Number(couponId),
        options: { success: true, message: "쿠폰을 수정했습니다." },
      }
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
      return rejectWithValue(error.message);
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
);
