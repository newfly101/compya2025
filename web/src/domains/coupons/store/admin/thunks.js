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
      const data = await fetchAdminCouponList();
      // console.log("requestGetCouponList : ", data);
      if (data.length < 0) {
        return {
          coupons: [],
          totalCount: 0
        }
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const requestAdminInsertNewCoupon = createAsyncThunk(
  ADMIN_COUPON_ACTIONS.CREATE, async (newCoupon, { rejectWithValue }) => {
    try {
      const { couponId, ...options } = await fetchAdminInsertCoupon(newCoupon);
      // console.log("requestInsertNewCoupon : ", couponId);

      return {
        ...newCoupon,
        id: couponId,
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
      const {couponId, ...options } = await fetchAdminUpdateCoupon(id, coupon);
      // console.log("requestUpdateCoupon : ", couponId);

      return {
        ...coupon,
        id: couponId,
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
      const {couponId, ...options } = await fetchAdminUpdateVisible(id, visible);
      // console.log("requestGetCouponList : ", couponId);

      return {
        id: couponId,
        visible,
        options
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);
