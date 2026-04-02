import { createAsyncThunk } from "@reduxjs/toolkit";
import { COUPON_ACTIONS } from "@/domains/coupons/store/public/endpoints.js";
import { fetchGetUserCoupon } from "@/domains/coupons/store/public/api.js";

export const requestGetUserCouponList = createAsyncThunk(
  COUPON_ACTIONS.GET_COUPON_LIST, async (_, { rejectWithValue }) => {
    try {
      const { items } = await fetchGetUserCoupon();

      return [...items].sort((a, b) => b.id - a.id);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);
