import { createAsyncThunk } from "@reduxjs/toolkit";
import { AUTH } from "@/domains/authentication/store/endpoints.js";
import { fetchHealthCheck, fetchLogout } from "@/domains/authentication/store/api.js";
import { setAuthSessionMarker, clearAuthSessionMarker } from "@/infra/http/authSessionMarker.js";

// 로그인 상태 정리는 이 함수 하나로 모은다 — Redux 상태(clearUser)와 세션 마커를 함께 비운다.
// 마커가 남으면 다음 401 마다 쓸모없는 재발급을 계속 시도한다.
// 로그아웃 · 탈퇴 · 인증 최종 실패(http client) 가 모두 이걸 쓴다.
// 부수효과(localStorage)는 리듀서가 아니라 여기서 처리한다.
//
// clearUser 를 import 하지 않고 타입 문자열로 디스패치하는 이유 — slices.js 가 이 파일의
// thunk 를 import 하므로(전 도메인 공통 방향) 반대 방향 import 는 순환 참조가 된다.
export const resetAuthSession = () => (dispatch) => {
  clearAuthSessionMarker();
  dispatch({ type: "auth/clearUser" });
};

export const requestUserHealthCheck = createAsyncThunk(
  AUTH.HEALTH, async (_, { dispatch, rejectWithValue }) => {
    try {
      // 응답을 그대로 반환한다 — user/userRole 분해와 상태 반영은 슬라이스가 한다.
      const data = await fetchHealthCheck();

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
