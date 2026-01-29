import { setPlayerType } from "@/domains/dictionary/store/slices.js";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { DICTIONARY } from "@/domains/dictionary/store/endpoints.js";
import { fetchPlayerSkillSet } from "@/domains/dictionary/store/api.js";
import { decrypt, encrypt } from "@/global/utils/crypto/storageCrypto.js";

export const requestPlayerSkillSet = createAsyncThunk(
  DICTIONARY.SKILLSET, async (type, { dispatch, getState, rejectWithValue }) => {
    try {
      const cached = sessionStorage.getItem(`skill-${type}`);

      if (cached) {
        return decrypt(cached);
      }

      dispatch(setPlayerType(type));

      const data = await fetchPlayerSkillSet(type);
      // console.log(`${type} SKILL : ` , data);

      sessionStorage.setItem(
        `skill-${type}`,
        encrypt(data)
      );

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
});
