import { createSlice } from "@reduxjs/toolkit";
import { applyAsyncHandlers } from "@/app/store/utils/applyAsyncHandlers.js";
import {
  requestAdminInsertNewCoupon,
  requestAdminUpdateCoupon, requestAdminUpdateCouponVisible,
  requestGetAdminCouponList,
  requestAdminDeleteCoupon,
  requestAdminBulkDeleteCoupons, requestAdminBulkUpdateCouponsVisible,
} from "@/domains/coupons/store/admin/thunks.js";
import { requestGetUserCouponList } from "@/domains/coupons/store/public/thunks.js";

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
    applyAsyncHandlers(builder, requestGetUserCouponList, (state, action) => {
      state.coupons = action.payload;
    });

    applyAsyncHandlers(builder, requestGetAdminCouponList, (state, action) => {
      state.coupons = action.payload;
    });
    /* ===============================
     * 쿠폰 신규 생성
     * =============================== */
    applyAsyncHandlers(builder, requestAdminInsertNewCoupon, (state, action) => {
      state.coupons.unshift(action.payload);
    });
    /* ===============================
     * 쿠폰 수정
     * =============================== */
    applyAsyncHandlers(builder, requestAdminUpdateCoupon, (state, action) => {
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
    applyAsyncHandlers(builder, requestAdminUpdateCouponVisible, (state, action) => {
      const updated = action.payload;

      state.coupons = state.coupons.map(c =>
        Number(c.id) === Number(updated.id)
          ? { ...c, visible: updated.visible }
          : c
      );
    });
    /* ===============================
     * 쿠폰 삭제
     * =============================== */
    applyAsyncHandlers(builder, requestAdminDeleteCoupon, (state, action) => {
      state.coupons = state.coupons.filter(c => Number(c.id) !== Number(action.payload));
    });
    /* ===============================
     * 쿠폰 일괄 삭제 (v2 — 서버 API 연결 전)
     * =============================== */
    applyAsyncHandlers(builder, requestAdminBulkDeleteCoupons, (state, action) => {
      const ids = new Set(action.payload.map(Number));
      state.coupons = state.coupons.filter(c => !ids.has(Number(c.id)));
    });
    /* ===============================
     * 쿠폰 일괄 노출 변경 (v2 — 서버 API 연결 전)
     * =============================== */
    applyAsyncHandlers(builder, requestAdminBulkUpdateCouponsVisible, (state, action) => {
      const { ids, visible } = action.payload;
      const idSet = new Set(ids.map(Number));
      state.coupons = state.coupons.map(c =>
        idSet.has(Number(c.id)) ? { ...c, visible } : c
      );
    });
  },
});

export const {} = couponSlice.actions;
export default couponSlice.reducer;
