import { createAsyncThunk } from "@reduxjs/toolkit";
import { COUPON_ACTIONS } from "@/domains/coupons/store/public/endpoints.js";
import { fetchGetUserCoupon } from "@/domains/coupons/store/public/api.js";

export const requestGetUserCouponList = createAsyncThunk(
  COUPON_ACTIONS.GET_COUPON_LIST, async (_, { rejectWithValue }) => {
    try {
      const data = await fetchGetUserCoupon();

      return [...data]
        .filter(coupon => coupon.visible)
        .sort((a, b) => b.id - a.id);

    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
  // 이미 같은 요청이 날아가 있으면 건너뛴다 — 훅/화면이 같은 틱에 각자 dispatch 해도 1번만 나간다.
  { condition: (_, { getState }) => !getState().coupon.publicLoading },
);
