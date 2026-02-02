import { createSlice } from "@reduxjs/toolkit";
import {
  requestGetCouponList,
  requestInsertNewCoupon,
  requestUpdateCoupon,
  requestUpdateCouponVisible,
} from "@/domains/coupons/store/thunks.js";
import { applyAsyncHandlers } from "@/global/handler/applyAsyncHandlers.js";

const initialState = {
  coupons: [],
  loading: false,
  error: null,
};

const couponSlice = createSlice({
  name: "coupon",
  initialState: initialState,
  reducers: {},
  extraReducers: (builder) => {
    /* ===============================
     * 쿠폰 목록 조회
     * =============================== */
    applyAsyncHandlers(builder, requestGetCouponList, (state, action) => {
      state.coupons = action.payload.coupons;
    });
    /* ===============================
     * 쿠폰 신규 생성
     * =============================== */
    applyAsyncHandlers(builder, requestInsertNewCoupon, (state, action) => {
      state.coupons.push(action.payload);
    });
    /* ===============================
     * 쿠폰 수정
     * =============================== */
    applyAsyncHandlers(builder, requestUpdateCoupon, (state, action) => {
      const updated = action.payload;
      const index = state.coupons.findIndex(e => e.id === updated.id);

      if (index !== -1) {
        state.coupons[index] = {
          ...state.coupons[index],
          ...updated,
        };
      }
    });
    /* ===============================
     * 쿠폰 visible 변경
     * =============================== */
    applyAsyncHandlers(builder, requestUpdateCouponVisible, (state, action) => {
      const updated = action.payload;
      const index = state.coupons.findIndex(e => e.id === updated.id);

      if (index !== -1) {
        state.coupons[index].visible = updated.visible;
      }
    });
  },
});

export const {} = couponSlice.actions;
export default couponSlice.reducer;
