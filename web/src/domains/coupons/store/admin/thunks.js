import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchAdminCouponList,
  fetchAdminInsertCoupon,
  fetchAdminUpdateCoupon, fetchAdminUpdateVisible, fetchAdminDeleteCoupon,
  fetchAdminBulkDeleteCoupons, fetchAdminBulkUpdateVisible,
} from "@/domains/coupons/store/admin/api.js";
import { ADMIN_COUPON_ACTIONS } from "@/domains/coupons/store/admin/endpoints.js";

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
      const { id:couponId, ...options } = await fetchAdminInsertCoupon(newCoupon);

      return {
        ...newCoupon,
        id: Number(couponId),
        options
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const requestAdminUpdateCoupon = createAsyncThunk(
  ADMIN_COUPON_ACTIONS.UPDATE, async ({ id, ...coupon }, { rejectWithValue }) => {
    try {
      const {id:couponId, ...options } = await fetchAdminUpdateCoupon(id, coupon);

      return {
        ...coupon,
        id: Number(couponId),
        options,
      }
    } catch (error) {
      return rejectWithValue(error.message);
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

// v2 일괄 삭제 — 서버 API 연결 전(호출 자리만 배선). ids: number[]
export const requestAdminBulkDeleteCoupons = createAsyncThunk(
  ADMIN_COUPON_ACTIONS.BULK_DELETE, async (ids, { rejectWithValue }) => {
    try {
      await fetchAdminBulkDeleteCoupons(ids);
      return ids;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

// v2 일괄 노출 변경(주로 숨김) — 서버 API 연결 전(호출 자리만 배선). { ids, visible }
export const requestAdminBulkUpdateCouponsVisible = createAsyncThunk(
  ADMIN_COUPON_ACTIONS.BULK_UPDATE_VISIBLE, async ({ ids, visible }, { rejectWithValue }) => {
    try {
      await fetchAdminBulkUpdateVisible(ids, visible);
      return { ids, visible };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);
