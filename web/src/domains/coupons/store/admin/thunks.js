import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchAdminCouponList,
  fetchAdminInsertCoupon,
  fetchAdminUpdateCoupon, fetchAdminUpdateVisible,
} from "@/domains/coupons/store/admin/api.js";
import { ADMIN_COUPON_ACTIONS } from "@/domains/coupons/store/admin/endpoints.js";

export const requestGetAdminCouponList = createAsyncThunk(
  ADMIN_COUPON_ACTIONS.GET_LIST, async (_, { rejectWithValue }) => {
    try {
      const {items} = await fetchAdminCouponList();

      return [...items].sort((a, b) => b.id - a.id);
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
      const {id:couponId, ...options } = await fetchAdminUpdateVisible(id, visible);

      return {
        id: Number(couponId),
        visible,
        options
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);
