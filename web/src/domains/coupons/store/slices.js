import { createSlice } from "@reduxjs/toolkit";
import { applyAsyncHandlers } from "@/app/store/utils/applyAsyncHandlers.js";
import {
  requestAdminInsertNewCoupon,
  requestAdminUpdateCoupon, requestAdminUpdateCouponVisible,
  requestGetAdminCouponList,
  requestAdminDeleteCoupon,
  requestAdminBulkDeleteCoupons, requestAdminBulkUpdateCouponsVisible,
  requestAdminRefreshCoupons,
} from "@/domains/coupons/store/admin/thunks.js";
import { requestGetUserCouponList } from "@/domains/coupons/store/public/thunks.js";

// coupons = 관리자 목록(숨김 포함) / publicCoupons = 공개 목록(BE 가 is_visible=true 로 필터한 것).
// 한 칸을 같이 쓰면 관리자 화면을 본 뒤 공개 화면으로 이동할 때 숨김 쿠폰이 노출되고,
// 공개 목록 조회가 실패하면 낡은 관리자 데이터가 그대로 남는다 — 그래서 칸을 나눈다.
//
// 로딩·오류 칸도 같은 이유로 셋으로 나눈다(규칙: app/store/utils/applyAsyncHandlers.js).
//   loading/error             → 관리자 목록 조회 전용
//   publicLoading/publicError → 공개 목록 조회 전용
//   mutateLoading/mutateError → 등록·수정·노출변경·삭제·일괄 (쓰기)
const initialState = {
  coupons: [],
  publicCoupons: [],
  loading: false,
  error: null,
  publicLoading: false,
  publicError: null,
  mutateLoading: false,
  mutateError: null,
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
      state.publicCoupons = action.payload;
    }, "public");

    applyAsyncHandlers(builder, requestGetAdminCouponList, (state, action) => {
      state.coupons = action.payload;
    });
    /* ===============================
     * 쿠폰 캐시 동기화 — 목록 조회와 동일하게 전체 교체
     * =============================== */
    applyAsyncHandlers(builder, requestAdminRefreshCoupons, (state, action) => {
      state.coupons = action.payload;
    });
    /* ===============================
     * 쿠폰 신규 생성
     * =============================== */
    applyAsyncHandlers(builder, requestAdminInsertNewCoupon, (state, action) => {
      state.coupons.unshift(action.payload);
    }, "mutate");
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
    }, "mutate");
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
    }, "mutate");
    /* ===============================
     * 쿠폰 삭제 — 서버는 is_visible=false 로 내린다(행은 남는다). 목록에서 지우면
     * 숨김 필터로도 못 찾아 같은 코드 재등록 시 409 원인을 알 수 없다.
     * =============================== */
    applyAsyncHandlers(builder, requestAdminDeleteCoupon, (state, action) => {
      state.coupons = state.coupons.map(c =>
        Number(c.id) === Number(action.payload) ? { ...c, visible: false } : c
      );
    }, "mutate");
    /* ===============================
     * 쿠폰 일괄 삭제 — 서버가 처리한 successIds 만 반영한다(failedIds 는 화면에 그대로 남긴다)
     * =============================== */
    applyAsyncHandlers(builder, requestAdminBulkDeleteCoupons, (state, action) => {
      const ids = new Set(action.payload.successIds);
      state.coupons = state.coupons.map(c =>
        ids.has(Number(c.id)) ? { ...c, visible: false } : c
      );
    }, "mutate");
    /* ===============================
     * 쿠폰 일괄 노출 변경 — 위와 동일하게 successIds 만 반영
     * =============================== */
    applyAsyncHandlers(builder, requestAdminBulkUpdateCouponsVisible, (state, action) => {
      const { successIds, visible } = action.payload;
      const idSet = new Set(successIds);
      state.coupons = state.coupons.map(c =>
        idSet.has(Number(c.id)) ? { ...c, visible } : c
      );
    }, "mutate");
  },
});

export default couponSlice.reducer;
