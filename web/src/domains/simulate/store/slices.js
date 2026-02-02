import { createSlice } from "@reduxjs/toolkit";
import { requestPlayerCardInfo } from "@/domains/simulate/store/thunks.js";
import { applyAsyncHandlers } from "@/global/handler/applyAsyncHandlers.js";

const initialState  = {
  playerType: null,
  cardInfo: null,
  loading: false,
  error: null,
}

const simulateSlice = createSlice({
  name: "simulate",
  initialState: initialState,
  reducers: {
    setPlayerType: (state, action) => {
      state.PlayerType = action.payload;
    }

  },
  extraReducers: (builder) => {
    /* ===============================
     * 시뮬레이션 카드 정보 불러오기
     * =============================== */
    applyAsyncHandlers(builder, requestPlayerCardInfo, (state, action) => {
      state.cardInfo = action.payload;
    });

  }
})

/**
 * export const {} = authSlice.actions;
 * {} 안에는 state를 저장하는 함수 reducer: {} 에 정의된 함수를 사용시 .jsx 에서 사용가능
 */
export const { setPlayerType } = simulateSlice.actions;
/**
 * extraReducers 에서 정의된 .addCase를 사용하기 위해서 주입용으로 내보내는 구문
 * /api/Store.jsx
 */
export default simulateSlice.reducer;
