import { createAsyncThunk } from "@reduxjs/toolkit";
import { HOME_ACTIONS } from "@/domains/home/store/public/endpoints.js";
import { fetchGetHome } from "@/domains/home/store/public/api.js";

const byIdDesc = (a, b) => b.id - a.id;

// 홈 4섹션을 한 번에 받는다. 섹션별 가공 규칙은 기존 도메인 thunk 와 동일하게 유지한다
// (visible 필터 + id 내림차순). 실패한 섹션은 null 로 와서 failedSections 에 이름이 들어 있다.
export const requestGetHome = createAsyncThunk(
  HOME_ACTIONS.GET_HOME,
  async (_, { rejectWithValue }) => {
    try {
      // api.js 가 봉투 바디를 반환하고 여기서 data 를 한 번 더 꺼낸다 — 홈 기존 4경로와 같은 2단 언랩.
      const { data } = await fetchGetHome();

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
);
