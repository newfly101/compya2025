import { createAsyncThunk } from "@reduxjs/toolkit";
import { MILEAGE_SNIPER_ACTIONS } from "@/domains/mileage/store/public/endpoints.js";
import { fetchGetSniperTargets } from "@/domains/mileage/store/public/api.js";

/** 응답을 그대로 저장한다 — 레전드 평점표가 cardId 로 직접 대조해 쓴다. */
export const requestGetSniperTargets = createAsyncThunk(
  MILEAGE_SNIPER_ACTIONS.GET_TARGET_LIST,
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await fetchGetSniperTargets();
      return data ?? [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
  // 레전드 평점표(useMileageBadge)와 저격 선수 리스트 탭(useMileageTargetList)이 같은
  // 틱에 동시 마운트돼도 요청이 1번만 나가게 한다(store-sharing-design.md §5).
  { condition: (_, { getState }) => !getState().mileage.sniperTargets.loaded },
);
