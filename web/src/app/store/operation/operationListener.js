import { createListenerMiddleware } from "@reduxjs/toolkit";
import { setLastOperation } from "@/app/store/operation/slices.jsx";

export const operationListener = createListenerMiddleware();

// 작업 결과 모달을 띄우는 단일 경로.
// thunk 가 fulfillWithValue / rejectWithValue 의 **두 번째 인자**로 { notify: { success, message } }
// 를 실으면 여기서 모달을 띄운다.
//
// 왜 payload 가 아니라 meta 인가 —
//   ① 거부(payload)는 오류 문구 문자열이라 실패 통지를 담을 자리가 없었다. 옛 방식
//      (payload.options)은 성공만 통지되고 실패는 **구조적으로** 통지가 불가능했다.
//   ② 통지 문구가 payload 에 섞이면 응답 엔티티가 아닌 필드가 리듀서를 거쳐 목록 행에
//      그대로 저장된다(쿠폰·이벤트·퀴즈 행에 options 키가 남아 있었다).
//
// 왜 권한 조건이 없는가 — 문구는 thunk 가 정한다. 예전 `userRole === 'ADMIN'` 조건은
// 일반 사용자 작업(마이페이지 등)에 통지를 붙일 수 없게 만드는 함정이라 제거했다.
operationListener.startListening({
  predicate: (action) => Boolean(action?.meta?.notify?.message),
  effect: async (action, listenerApi) => {
    listenerApi.dispatch(setLastOperation(action.meta.notify));
  },
});
