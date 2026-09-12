import { createSlice } from "@reduxjs/toolkit";
import { applyAsyncHandlers } from "@/app/store/utils/applyAsyncHandlers.js";
import {
  requestCacheSyncTargets,
  requestCacheSyncOne,
  requestCacheSyncAll,
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
