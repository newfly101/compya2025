import { createSlice } from "@reduxjs/toolkit";
import { applyAsyncHandlers } from "@/global/handler/applyAsyncHandlers.js";
import { requestAdminPlayerCardTeamLists } from "@/domains/playerCard/store/admin/thunks.js";

const initialState = {
  teamList: [],
  playerCard: [],
  loading: false,
  error: null,
};

const playerCardSlice = createSlice({
  name: "playerCard",
  initialState: initialState,
  reducers: {},
  extraReducers: (builder) => {
    /* ===============================
     * team 목록 조회
     * =============================== */
    applyAsyncHandlers(builder, requestAdminPlayerCardTeamLists, (state, action) => {
      state.teamList = action.payload;
    });
  },
});
export const {} = playerCardSlice.actions;
export default playerCardSlice.reducer;
