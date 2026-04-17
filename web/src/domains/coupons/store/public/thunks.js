import { createAsyncThunk } from "@reduxjs/toolkit";
import { COUPON_ACTIONS } from "@/domains/coupons/store/public/endpoints.js";
import { fetchGetUserCoupon } from "@/domains/coupons/store/public/api.js";

export const requestGetUserCouponList = createAsyncThunk(
  COUPON_ACTIONS.GET_COUPON_LIST, async (_, { rejectWithValue }) => {
    try {
      const { data } = await fetchGetUserCoupon();

      return [...data]
        .filter(coupon => coupon.visible)
        .sort((a, b) => b.id - a.id);

    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);
