import { createSlice } from "@reduxjs/toolkit";
import { requestPlayerCardInfo } from "@/store/modules/simulate/thunks.js";

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
    builder
      .addCase(requestPlayerCardInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(requestPlayerCardInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.cardInfo = action.payload;
      })
      .addCase(requestPlayerCardInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
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
