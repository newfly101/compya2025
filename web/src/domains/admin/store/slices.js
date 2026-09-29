import { createSlice } from "@reduxjs/toolkit";
import { applyAsyncHandlers } from "@/app/store/utils/applyAsyncHandlers.js";
import {
  requestCacheSyncTargets,
  requestCacheSyncOne,
  requestCacheSyncAll,
  requestAdminAnalyticsSummary,
  requestAdminAnalyticsTrend,
  requestAdminAnalyticsAggregate,
} from "@/domains/admin/store/admin/thunks.js";

const initialState = {
  targets: [],        // CacheSyncTargetResponse[] — 목록 조회 결과
  loading: false,      // 목록 조회 중
  error: null,         // 목록 조회 실패 메시지
  syncingIds: [],      // 지금 단건 동기화 중인 대상 id 목록
  syncingAll: false,   // 전체 동기화 진행 중 — true 인 동안은 모든 행을 동기화 중으로 취급
  results: {},         // { [id]: CacheSyncResultResponse } — 대상별 마지막 동기화 결과
  allSyncError: null,  // 전체 동기화 "요청 자체"가 실패했을 때만 씀(개별 결과가 하나도 없는 경우)
};

const cacheSyncSlice = createSlice({
  name: "cacheSync",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    /* ===============================
     * 동기화 대상 목록 조회
     * =============================== */
    applyAsyncHandlers(builder, requestCacheSyncTargets, (state, action) => {
      state.targets = action.payload;
    });

    /* ===============================
     * 단건 동기화 — 여러 줄이 각자 로딩 상태를 가져야 해서 공용 loading/error(목록 조회 전용)
     * 대신 대상 id 단위로 직접 관리한다.
     * =============================== */
    builder
      .addCase(requestCacheSyncOne.pending, (state, action) => {
        const id = action.meta.arg;
        if (!state.syncingIds.includes(id)) state.syncingIds.push(id);
      })
      .addCase(requestCacheSyncOne.fulfilled, (state, action) => {
        const result = action.payload;
        state.syncingIds = state.syncingIds.filter((id) => id !== result.id);
        state.results[result.id] = result;
        if (result.success) {
          const target = state.targets.find((t) => t.id === result.id);
          if (target) target.lastSyncedAt = result.syncedAt;
        }
      })
      .addCase(requestCacheSyncOne.rejected, (state, action) => {
        const id = action.meta.arg;
        state.syncingIds = state.syncingIds.filter((sid) => sid !== id);
        state.results[id] = {
          id,
          success: false,
          errorMessage:
            action.payload?.message ?? action.error?.message ?? "잠시 후 다시 시도해 주세요.",
        };
      });

    /* ===============================
     * 전체 동기화 — 응답 배열 안에 성공·실패가 섞여 온다. 대상별 results 에 그대로 반영해
     * 실패한 줄만 이유가 보이고 나머지는 정상 표시되게 한다.
     * =============================== */
    builder
      .addCase(requestCacheSyncAll.pending, (state) => {
        state.syncingAll = true;
        state.allSyncError = null;
      })
      .addCase(requestCacheSyncAll.fulfilled, (state, action) => {
        state.syncingAll = false;
        action.payload.forEach((result) => {
          state.results[result.id] = result;
          if (result.success) {
            const target = state.targets.find((t) => t.id === result.id);
            if (target) target.lastSyncedAt = result.syncedAt;
          }
        });
      })
      .addCase(requestCacheSyncAll.rejected, (state, action) => {
        state.syncingAll = false;
        state.allSyncError =
          (typeof action.payload === "string" ? action.payload : action.payload?.message) ??
          action.error?.message ??
          "잠시 후 다시 시도해 주세요.";
      });
  },
});

export default cacheSyncSlice.reducer;

// thunk 공용 에러 메시지 추출 — applyAsyncHandlers 내부와 같은 규칙(payload 문자열 → payload.message
// → action.error.message 순). 아래에서 addCase 를 직접 쓰는 두 thunk 가 같이 참조한다.
const errorMessageOf = (action) =>
  (typeof action.payload === "string" ? action.payload : action.payload?.message) ??
  action.error?.message ??
  "잠시 후 다시 시도해 주세요.";

/* =========================================================================
 * 관리자 통계 탭 — 방문·이벤트 요약(기간별) + 직전 같은 길이 구간 비교. cacheSync 와 같은
 * 파일에 두되 named export 로 분리한다(파일 분할 기준 미달, 두 슬라이스 모두 짧다).
 *
 * summary·trend 두 thunk 는 "이번 구간" 요청과 "직전 구간 비교" 요청을 같은 thunk 로 두 번
 * 부른다(action.meta.arg.isPrevious 로 구분, 새 API 를 만들지 않는다 — ponytail: 요청이
 * 2배가 되지만 어드민 전용 화면이라 허용). 비교 요청은 화면에 로딩/오류를 보여줄 자리가
 * 없어(실패하면 조용히 숨김) applyAsyncHandlers 의 공용 loading/error 칸을 못 쓴다 —
 * cacheSync 의 단건 동기화(위 §)와 같은 이유로 여기만 addCase 를 직접 쓴다.
 * ========================================================================= */
const adminAnalyticsSlice = createSlice({
  name: "adminAnalytics",
  initialState: {
    summary: null,          // AdminAnalyticsSummaryResponse — 조회 전엔 null
    previousSummary: null,  // 직전 같은 길이 구간 — 서비스 시작일 이전이면 요청 자체를 안 해 null 유지
    loading: false,
    error: null,
    trend: { day: [], hour: [] }, // AnalyticsTrendPointResponse[] — granularity 별로 따로 보관(토글 시 재요청 없이 전환)
    previousTrendDay: [],   // 직전 구간의 일별 추이(비교 그래프용, day 전용)
    trendLoading: false,
    trendError: null,
    mutateLoading: false, // 수동 재집계 진행 중
    mutateError: null,    // 수동 재집계 실패 메시지
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(requestAdminAnalyticsSummary.pending, (state, action) => {
        if (action.meta.arg?.isPrevious) return;
        state.loading = true;
        state.error = null;
      })
      .addCase(requestAdminAnalyticsSummary.fulfilled, (state, action) => {
        if (action.meta.arg?.isPrevious) {
          state.previousSummary = action.payload;
          return;
        }
        state.loading = false;
        state.summary = action.payload;
      })
      .addCase(requestAdminAnalyticsSummary.rejected, (state, action) => {
        if (action.meta.arg?.isPrevious) {
          state.previousSummary = null; // 조용히 숨김 — 배지는 "-" 로 표시된다
          return;
        }
        state.loading = false;
        state.error = errorMessageOf(action);
      });

    // granularity(day|hour) 는 응답에 없다 — 요청 인자(action.meta.arg)로 어느 칸에 넣을지 정한다.
    builder
      .addCase(requestAdminAnalyticsTrend.pending, (state, action) => {
        if (action.meta.arg?.isPrevious) return;
        state.trendLoading = true;
        state.trendError = null;
      })
      .addCase(requestAdminAnalyticsTrend.fulfilled, (state, action) => {
        if (action.meta.arg?.isPrevious) {
          state.previousTrendDay = action.payload;
          return;
        }
        state.trendLoading = false;
        state.trend[action.meta.arg.granularity] = action.payload;
      })
      .addCase(requestAdminAnalyticsTrend.rejected, (state, action) => {
        if (action.meta.arg?.isPrevious) {
          state.previousTrendDay = [];
          return;
        }
        state.trendLoading = false;
        state.trendError = errorMessageOf(action);
      });

    // 재집계 — 응답에 담을 상태 없음(성공 알림은 meta.notify), 로딩/에러 칸만 mutate 로 분리.
    applyAsyncHandlers(builder, requestAdminAnalyticsAggregate, () => {}, "mutate");
  },
});

export const adminAnalyticsReducer = adminAnalyticsSlice.reducer;
