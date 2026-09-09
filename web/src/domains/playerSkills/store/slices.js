import { createSlice, combineReducers } from "@reduxjs/toolkit";
import { applyAsyncHandlers } from "@/app/store/utils/applyAsyncHandlers.js";
import {
  requestGetHitterSkills,
  requestGetPitcherSkills,
} from "@/domains/playerSkills/store/thunks.js";

// 타자/투수 각 46개 — 어댑터를 거친 화면 형태 그대로 저장한다.
const makeSkillSlice = (name, thunk) =>
  createSlice({
    name: `playerSkills/${name}`,
    initialState: { items: [], loading: false, error: null },
    reducers: {},
    extraReducers: (builder) => {
      applyAsyncHandlers(builder, thunk, (state, action) => {
        state.items = action.payload;
      });
    },
  });

const hittersSlice = makeSkillSlice("hitters", requestGetHitterSkills);
const pitchersSlice = makeSkillSlice("pitchers", requestGetPitcherSkills);

export default combineReducers({
  hitters: hittersSlice.reducer,
  pitchers: pitchersSlice.reducer,
});
