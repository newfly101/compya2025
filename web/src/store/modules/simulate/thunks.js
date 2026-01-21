import { setPlayerType } from "@/store/modules/simulate/slices.js";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { SIMULATE } from "@/store/modules/simulate/endpoints.js";
import { fetchPlayerCardInfo } from "@/store/modules/simulate/api.js";

export const requestPlayerCardInfo = createAsyncThunk(
  SIMULATE.INFO, async (type, { dispatch, getState, rejectWithValue }) => {
    try {
      dispatch(setPlayerType(type));

      const data = await fetchPlayerCardInfo(type);
      // console.log(`${type} SKILL : ` , data);

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
});
