import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchCacheSyncTargets,
  fetchCacheSyncOne,
  fetchCacheSyncAll,
  fetchAdminAnalyticsSummary,
  fetchAdminAnalyticsAggregate,
} from "@/domains/admin/store/admin/api.js";
import {
  ADMIN_CACHE_SYNC_ACTIONS,
  ADMIN_ANALYTICS_ACTIONS,
} from "@/domains/admin/store/admin/endpoints.js";

export const requestCacheSyncTargets = createAsyncThunk(
  ADMIN_CACHE_SYNC_ACTIONS.GET_TARGETS,
  async (_, { rejectWithValue }) => {
    try {
      return await fetchCacheSyncTargets();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
  // 이미 같은 요청이 날아가 있으면 건너뛴다 — 훅/화면이 같은 틱에 각자 dispatch 해도 1번만 나간다.
  { condition: (_, { getState }) => !getState().cacheSync.loading },
);

// 단건 동기화 — 실패해도 어떤 대상(id)이 실패했는지 알아야 그 줄에만 이유를 보여줄 수 있다.
export const requestCacheSyncOne = createAsyncThunk(
  ADMIN_CACHE_SYNC_ACTIONS.SYNC_ONE,
  async (id, { rejectWithValue }) => {
    try {
      return await fetchCacheSyncOne(id);
    } catch (error) {
      return rejectWithValue({ id, message: error.message });
    }
  }
);

// 전체 동기화 — 응답은 대상별 성공/실패가 섞인 배열. 요청 자체(네트워크/서버 오류)가
// 실패한 경우만 이 catch 로 들어온다.
export const requestCacheSyncAll = createAsyncThunk(
  ADMIN_CACHE_SYNC_ACTIONS.SYNC_ALL,
  async (_, { rejectWithValue }) => {
    try {
      return await fetchCacheSyncAll();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 관리자 통계 탭 — range(TODAY|WEEK|MONTH) 별 요약 조회. 캐시하지 않고 매번 새 요청.
export const requestAdminAnalyticsSummary = createAsyncThunk(
  ADMIN_ANALYTICS_ACTIONS.GET_SUMMARY,
  async (range, { rejectWithValue }) => {
    try {
      return await fetchAdminAnalyticsSummary(range);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 통계 수동 재집계 — date(yyyy-MM-dd) 하루치를 다시 계산. 화면이 성공 시 현재 range 를
// 이어서 재조회한다(여기서 하지 않음 — thunk 는 단일 책임).
export const requestAdminAnalyticsAggregate = createAsyncThunk(
  ADMIN_ANALYTICS_ACTIONS.AGGREGATE,
  async (date, { rejectWithValue, fulfillWithValue }) => {
    try {
      await fetchAdminAnalyticsAggregate(date);
      return fulfillWithValue(date, {
        notify: { kind: "success", message: `${date} 재집계했습니다.` },
      });
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
