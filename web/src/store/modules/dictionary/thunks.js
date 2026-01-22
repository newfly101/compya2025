import { setPlayerType } from "@/store/modules/dictionary/slices.js";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { DICTIONARY } from "@/store/modules/dictionary/endpoints.js";
import { fetchPlayerSkillSet } from "@/store/modules/dictionary/api.js";
import { decrypt, encrypt } from "@/utils/crypto/storageCrypto.js";

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
