import { setPlayerType } from "@/store/modules/dictionary/slices.js";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { DICTIONARY } from "@/store/modules/dictionary/endpoints.js";
import { fetchPlayerSkillSet } from "@/store/modules/dictionary/api.js";

export const requestPlayerSkillSet = createAsyncThunk(
  DICTIONARY.SKILLSET, async (type, { dispatch, getState, rejectWithValue }) => {
    try {
      const cached = sessionStorage.getItem(`skill-${type}`);

      if (cached) {
        return JSON.parse(cached);
      }

      dispatch(setPlayerType(type));

      const data = await fetchPlayerSkillSet(type);
      console.log(`${type} SKILL : ` , data);

      sessionStorage.setItem(
        `skill-${type}`,
        JSON.stringify(data)
      );

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
});
