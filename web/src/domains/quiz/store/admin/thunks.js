import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchAdminQuizAll,
  fetchAdminQuizCreate,
  fetchAdminQuizUpdate,
  fetchAdminQuizDelete,
  fetchAdminQuizBulkDelete,
} from "@/domains/quiz/store/admin/api.js";
import { ADMIN_QUIZ_ACTIONS } from "@/domains/quiz/store/admin/endpoints.js";
import { baseQuizAnswerDTO } from "@/domains/quiz/store/dto.js";
import { requestUploadImage } from "@/infra/api/uploads/index.js";

export const requestAdminQuizAll = createAsyncThunk(
  ADMIN_QUIZ_ACTIONS.GET_ALL,
  async (_, { rejectWithValue }) => {
    try {
      // BE 응답은 List<QuizResponse> 배열 그대로 온다. { items } 구조분해는 버그였음.
      const list = await fetchAdminQuizAll();
      return list;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
  // 이미 같은 요청이 날아가 있으면 건너뛴다 — 훅/화면이 같은 틱에 각자 dispatch 해도 1번만 나간다.
  { condition: (_, { getState }) => !getState().quiz.loading },
);

export const requestAdminQuizCreate = createAsyncThunk(
  ADMIN_QUIZ_ACTIONS.CREATE,
  async (newQuiz, { rejectWithValue, fulfillWithValue }) => {
    try {
      // 서버가 title·createdAt 을 합성해 돌려준다 — 입력값으로 대체하지 않고 응답을 그대로 쓴다.
      const created = await fetchAdminQuizCreate(baseQuizAnswerDTO(newQuiz));
      // 통지 문구는 payload 가 아니라 meta 에 싣는다 — payload 에 섞으면 응답 엔티티가 아닌
      // 필드가 리듀서를 거쳐 목록 행에 그대로 저장되고, 실패는 payload 가 오류 문구 문자열이라
      // 통지를 담을 자리 자체가 없다(operationListener.js).
      return fulfillWithValue(created, {
        notify: { success: true, message: "퀴즈를 등록했습니다." },
      });
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const requestAdminQuizUpdate = createAsyncThunk(
  ADMIN_QUIZ_ACTIONS.UPDATE,
  async ({ id, ...quiz }, { rejectWithValue, fulfillWithValue }) => {
    try {
      // 서버가 title·updatedAt 을 다시 합성해 돌려준다 — 입력값으로 대체하지 않고 응답을 그대로 쓴다.
      const updated = await fetchAdminQuizUpdate(id, baseQuizAnswerDTO(quiz));
      return fulfillWithValue(updated, {
        notify: { success: true, message: "퀴즈를 수정했습니다." },
      });
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const requestAdminQuizDelete = createAsyncThunk(
  ADMIN_QUIZ_ACTIONS.DELETE,
  async (id, { rejectWithValue }) => {
    try {
      await fetchAdminQuizDelete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// v2 일괄 삭제 — 서버가 { successIds, failedIds } 를 준다. 요청 id 전체를 성공으로
// 믿지 않고 실제 successIds 만 돌려줘서 slice 가 그것만 목록에서 제거하게 한다.
export const requestAdminQuizBulkDelete = createAsyncThunk(
  ADMIN_QUIZ_ACTIONS.BULK_DELETE,
  async (ids, { rejectWithValue }) => {
    try {
      const result = await fetchAdminQuizBulkDelete(ids);
      return result;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const requestAdminUploadQuizImage = (file) =>
  requestUploadImage({ file, directory: "events" });
