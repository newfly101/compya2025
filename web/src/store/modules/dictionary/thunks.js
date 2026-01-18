import { setPlayerType } from "@/store/modules/dictionary/slices.js";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { DICTIONARY } from "@/store/modules/dictionary/endpoints.js";
import { fetchPlayerSkillSet } from "@/store/modules/dictionary/api.js";

export const requestPlayerSkillSet = createAsyncThunk(
  DICTIONARY.SKILLSET, async (type, { dispatch, getState, rejectWithValue }) => {
    try {
      dispatch(setPlayerType(type));

      const data = await fetchPlayerSkillSet(type);
      // console.log(`${type} SKILL : ` , data);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
});
