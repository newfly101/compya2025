import { createAsyncThunk } from "@reduxjs/toolkit";
import { AUTH } from "@/domains/authentication/store/endpoints.js";
import { fetchHealthCheck, fetchLogout } from "@/domains/authentication/store/api.js";
import { setUser, clearUser } from "@/domains/authentication/store/slices.js";
import { setAuthSessionMarker, clearAuthSessionMarker } from "@/infra/http/authSessionMarker.js";

// 로그인 상태 정리는 이 함수 하나로 모은다 — Redux 상태(clearUser)와 세션 마커를 함께 비운다.
// 마커가 남으면 다음 401 마다 쓸모없는 재발급을 계속 시도한다.
// 로그아웃 · 탈퇴 · 인증 최종 실패(http client) 가 모두 이걸 쓴다.
// 부수효과(localStorage)는 리듀서가 아니라 여기서 처리한다.
export const resetAuthSession = () => (dispatch) => {
  clearAuthSessionMarker();
  dispatch(clearUser());
};

export const requestUserHealthCheck = createAsyncThunk(
  AUTH.HEALTH, async (_, { dispatch, rejectWithValue }) => {
    try {
      const { data } = await fetchHealthCheck();

      const { userRole, ...userDetail } = data;

      await dispatch(setUser({ userDetail, userRole }));
      setAuthSessionMarker();

      return data;
    } catch (error) {
      dispatch(resetAuthSession());
      return rejectWithValue(error.message);
    }
  });

export const requestUserLogout = createAsyncThunk(
  AUTH.LOGOUT, async (_, { dispatch, rejectWithValue }) => {
    try {
      await fetchLogout();
    } catch (error) {
      return rejectWithValue(error.message);
    } finally {
      dispatch(resetAuthSession());
    }
  },
);
