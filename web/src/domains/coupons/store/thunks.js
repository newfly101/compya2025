import { createAsyncThunk } from "@reduxjs/toolkit";
import { COUPON_ACTIONS } from "@/domains/coupons/store/endpoints.js";
import {
  fetchGetCouponList,
  fetchInsertCoupon,
  fetchUpdateCoupon,
  fetchUpdateCouponVisible,
} from "@/domains/coupons/store/api.js";


export const requestGetCouponList = createAsyncThunk(
  COUPON_ACTIONS.GET_COUPON_LIST, async (_, { rejectWithValue }) => {
    try {
      const data = await fetchGetCouponList();
      console.log("requestGetCouponList : ", data);

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const requestInsertNewCoupon = createAsyncThunk(
  COUPON_ACTIONS.CREATE, async (newCoupon, { rejectWithValue }) => {
    try {
      const { success, message, couponId } = await fetchInsertCoupon(newCoupon);
      console.log("requestInsertNewCoupon : ", couponId);

      return {
        ...newCoupon,
        id: couponId,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const requestUpdateCoupon = createAsyncThunk(
  COUPON_ACTIONS.UPDATE, async ({ id, ...coupon }, { rejectWithValue }) => {
    try {
      const { success, message, couponId } = await fetchUpdateCoupon(id, coupon);
      console.log("requestUpdateCoupon : ", couponId);

      return {
        ...coupon,
        id: couponId,
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const requestUpdateCouponVisible = createAsyncThunk(
  COUPON_ACTIONS.UPDATE_VISIBLE, async ({id, visible}, { rejectWithValue }) => {
    try {
      const { success, message, couponId } = await fetchUpdateCouponVisible(id, visible);
      console.log("requestGetCouponList : ", couponId);

      return {
        id: couponId,
        visible
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);
