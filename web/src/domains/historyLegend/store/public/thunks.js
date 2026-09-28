import { createAsyncThunk } from "@reduxjs/toolkit";
import { HISTORY_ROUND_ACTIONS } from "@/domains/historyLegend/store/public/endpoints.js";
import { fetchGetHistoryRounds } from "@/domains/historyLegend/store/public/api.js";
import { toHistoryRoundModel } from "@/domains/historyLegend/config/historyLegend.js";

/** 응답을 화면 모델로 바꿔 저장한다 — 카드 표시 문자열 조립까지 여기서 끝낸다. */
export const requestGetHistoryRounds = createAsyncThunk(
  HISTORY_ROUND_ACTIONS.GET_ROUND_LIST,
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchGetHistoryRounds();
      return (data ?? []).map(toHistoryRoundModel);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
  // 중복 차단은 "이미 받았는지(loaded)" 가 아니라 "지금 날아가 있는지(loading)" 로만 한다.
  // loaded 로 막으면 SPA 세션 동안 재요청이 아예 없어서, 관리자가 캐시 동기화를 눌러도
  // 이미 열려 있는 탭은 새로고침 전까지 옛 값을 계속 보여준다(서버 캐시·HTTP 캐시 겹은
  // 이미 처리됐고 이 FE 겹이 마지막이었다). 화면은 loaded 를 유지한 채 다시 그리므로
  // 재요청 중에도 스켈레톤이 깜빡이지 않는다.
  { condition: (_, { getState }) => !getState().historyLegend.rounds.loading },
);
