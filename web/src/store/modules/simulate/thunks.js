import { setPlayerType } from "@/store/modules/simulate/slices.js";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { SIMULATE } from "@/store/modules/simulate/endpoints.js";
import { fetchPlayerCardInfo } from "@/store/modules/simulate/api.js";
import { decrypt, encrypt } from "@/utils/crypto/storageCrypto.js";

export const requestPlayerCardInfo = createAsyncThunk(
  SIMULATE.INFO, async (type, { dispatch, getState, rejectWithValue }) => {
    try {
      const cached = sessionStorage.getItem(`info-${type}`);

      if (cached) {
        return decrypt(cached);
      }

      dispatch(setPlayerType(type));

      const data = await fetchPlayerCardInfo(type);
      // console.log(`${type} SKILL : ` , data);

      sessionStorage.setItem(
        `info-${type}`,
        encrypt(data)
      );

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
});
