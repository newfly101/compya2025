import { setPlayerType } from "@/domains/simulate/store/slices.js";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { SIMULATE } from "@/domains/simulate/store/endpoints.js";
import { fetchPlayerCardInfo, fetchSkillScoreConfig } from "@/domains/simulate/store/api.js";
import { decrypt, encrypt } from "@/global/utils/crypto/storageCrypto.js";

export const requestSkillScoreConfig = createAsyncThunk(
  SIMULATE.SCORE_CONFIG, async (_, { rejectWithValue }) => {
    try {
      const cached = sessionStorage.getItem("skill-score-config");

      if (cached) {
        return decrypt(cached);
      }

      const data = await fetchSkillScoreConfig();
      console.log("SKILL SCORE CONFIG : ", data);

      sessionStorage.setItem("skill-score-config", encrypt(data));

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const requestPlayerCardInfo = createAsyncThunk(
  SIMULATE.INFO, async (type, { dispatch, getState, rejectWithValue }) => {
    try {
      const cached = sessionStorage.getItem(`info-${type}`);

      if (cached) {
        return decrypt(cached);
      }

      dispatch(setPlayerType(type));

      const data = await fetchPlayerCardInfo(type);
      console.log(`${type} SKILL : ` , data);

      sessionStorage.setItem(
        `info-${type}`,
        encrypt(data)
      );

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
});
