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
    initialState: { items: [], loaded: false, loading: false, error: null },
    reducers: {},
    extraReducers: (builder) => {
      applyAsyncHandlers(builder, thunk, (state, action) => {
        state.items = action.payload;
        // loaded = "한 번이라도 받았다" — items.length 로 대신하면 정상 0건과 미조회를
        // 구분할 수 없다(players·mileage·legendStats 와 같은 형태).
        state.loaded = true;
      });
    },
  });

const hittersSlice = makeSkillSlice("hitters", requestGetHitterSkills);
const pitchersSlice = makeSkillSlice("pitchers", requestGetPitcherSkills);

export default combineReducers({
  hitters: hittersSlice.reducer,
  pitchers: pitchersSlice.reducer,
});
