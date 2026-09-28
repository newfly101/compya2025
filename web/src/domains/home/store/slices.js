import { createSlice } from "@reduxjs/toolkit";
import { applyAsyncHandlers } from "@/app/store/utils/applyAsyncHandlers.js";
import { requestGetHome } from "@/domains/home/store/public/thunks.js";

// 홈 전용 칸 — 도메인 슬라이스(coupon/events/notices/quiz)를 건드리지 않는다.
// 같은 칸을 쓰면 관리자 화면을 본 뒤 홈으로 이동할 때 숨김 데이터가 새고, 홈 실패가 다른 화면으로 번진다.
// loaded = "한 번이라도 받았다" — 없으면 "정상 0건" 과 "아직 안 받음" 을 구분할 수 없다.
const initialState = {
  coupons: [],
  events: [],
  notices: [],
  quiz: null,
  failedSections: [],
  loading: false,
  loaded: false,
  error: null,
};

const homeSlice = createSlice({
  name: "home",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    applyAsyncHandlers(builder, requestGetHome, (state, action) => {
      state.coupons = action.payload.coupons;
      state.events = action.payload.events;
      state.notices = action.payload.notices;
      state.quiz = action.payload.quiz;
      state.failedSections = action.payload.failedSections;
      state.loaded = true;
    });
  },
});

export default homeSlice.reducer;
