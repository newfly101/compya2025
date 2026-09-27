import { createAsyncThunk } from "@reduxjs/toolkit";
import { HOME_ACTIONS } from "@/domains/home/store/public/endpoints.js";
import { fetchGetHome, fetchSupportClick } from "@/domains/home/store/public/api.js";

const byIdDesc = (a, b) => b.id - a.id;

// 홈 4섹션을 한 번에 받는다. 섹션별 가공 규칙은 기존 도메인 thunk 와 동일하게 유지한다
// (visible 필터 + id 내림차순). 실패한 섹션은 null 로 와서 failedSections 에 이름이 들어 있다.
export const requestGetHome = createAsyncThunk(
  HOME_ACTIONS.GET_HOME,
  async (_, { rejectWithValue }) => {
    try {
      // api.js 가 봉투를 벗겨 4섹션 묶음만 준다(전역 계약: api 함수는 내용물만 반환).
      const data = await fetchGetHome();

      return {
        coupons: (data.coupons ?? []).filter(coupon => coupon.visible).sort(byIdDesc),
        events: (data.events ?? []).filter(event => event.visible).sort(byIdDesc),
        // 홈은 사이트 공지(INTERNAL)만 미리보기로 쓴다 — 공식 공지는 공지 목록 화면 전용이다.
        notices: (data.notices ?? [])
          .filter(notice => notice.isVisible && notice.source === "INTERNAL")
          .sort(byIdDesc),
        quiz: data.quiz ?? null,
        failedSections: data.failedSections ?? [],
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
  // 이미 같은 요청이 날아가 있으면 건너뛴다 — 훅/화면이 같은 틱에 각자 dispatch 해도 1번만 나간다.
  { condition: (_, { getState }) => !getState().home.loading },
);

// 후원 버튼 클릭 기록. 화면에 담을 상태가 없어 슬라이스 리듀서를 두지 않는다 —
// fire-and-forget 통계라 실패해도 송금 흐름을 막지 않는다(실패는 rejectWithValue 로 삼킨다).
export const requestSupportClick = createAsyncThunk(
  HOME_ACTIONS.SUPPORT_CLICK,
  async (target, { rejectWithValue }) => {
    try {
      await fetchSupportClick(target);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);
