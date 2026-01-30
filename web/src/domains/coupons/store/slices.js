import { createSlice } from "@reduxjs/toolkit";
import {
  requestGetCouponList,
  requestInsertNewCoupon,
  requestUpdateCoupon,
  requestUpdateCouponVisible,
} from "@/domains/coupons/store/thunks.js";

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
    builder
      /* ===============================
       * 쿠폰 목록 조회
       * =============================== */
      .addCase(requestGetCouponList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(requestGetCouponList.fulfilled, (state, action) => {
        state.loading = false;
        state.coupons = action.payload.coupons;
      })
      .addCase(requestGetCouponList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      /* ===============================
         * 쿠폰 신규 생성
         * =============================== */
      .addCase(requestInsertNewCoupon.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(requestInsertNewCoupon.fulfilled, (state, action) => {
        state.loading = false;
        state.coupons.push(action.payload);
      })
      .addCase(requestInsertNewCoupon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      /* ===============================
       * 쿠폰 수정
       * =============================== */
      .addCase(requestUpdateCoupon.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(requestUpdateCoupon.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;
        const index = state.coupons.findIndex(e => e.id === updated.id);

        if (index !== -1) {
          state.coupons[index] = {
            ...state.coupons[index],
            ...updated,
          };
        }
      })
      .addCase(requestUpdateCoupon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      /* ===============================
       * 쿠폰 visible 변경
       * =============================== */
      .addCase(requestUpdateCouponVisible.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(requestUpdateCouponVisible.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;
        const index = state.coupons.findIndex(e => e.id === updated.id);

        if (index !== -1) {
          state.coupons[index].visible = updated.visible;
        }
      })
      .addCase(requestUpdateCouponVisible.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

  },
});

export const {} = couponSlice.actions;
export default couponSlice.reducer;
