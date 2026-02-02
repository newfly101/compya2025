import { createSlice } from "@reduxjs/toolkit";
import { requestPlayerSkillSet } from "@/domains/dictionary/store/thunks.js";
import { applyAsyncHandlers } from "@/global/handler/applyAsyncHandlers.js";

const initialState  = {
  playerType: null,
  playerSkills: null,
  loading: false,
  error: null,
}

const dictionarySlice = createSlice({
  name: "dictionary",
  initialState: initialState,
  reducers: {
    setPlayerType: (state, action) => {
      state.PlayerType = action.payload;
    }

  },
  extraReducers: (builder) => {
    /* ===============================
     * 스킬 관리 - 목록 조회
     * =============================== */
    applyAsyncHandlers(builder, requestPlayerSkillSet, (state, action) => {
      state.playerSkills = action.payload;
    });
  }
})

/**
 * export const {} = authSlice.actions;
 * {} 안에는 state를 저장하는 함수 reducer: {} 에 정의된 함수를 사용시 .jsx 에서 사용가능
 */
export const { setPlayerType } = dictionarySlice.actions;
/**
 * extraReducers 에서 정의된 .addCase를 사용하기 위해서 주입용으로 내보내는 구문
 * /api/Store.jsx
 */
export default dictionarySlice.reducer;
