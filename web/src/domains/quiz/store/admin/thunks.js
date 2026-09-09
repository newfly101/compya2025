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
  }
);

export const requestAdminQuizCreate = createAsyncThunk(
  ADMIN_QUIZ_ACTIONS.CREATE,
  async (newQuiz, { rejectWithValue }) => {
    try {
      // options 는 응답 엔티티 필드가 아니라 "화면에 띄울 알림" 이어야 한다.
      const { id } = await fetchAdminQuizCreate(baseQuizAnswerDTO(newQuiz));
      return { ...newQuiz, id, options: { success: true, message: "퀴즈를 등록했습니다." } };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const requestAdminQuizUpdate = createAsyncThunk(
  ADMIN_QUIZ_ACTIONS.UPDATE,
  async ({ id, ...quiz }, { rejectWithValue }) => {
    try {
      const { id: updatedId } = await fetchAdminQuizUpdate(id, baseQuizAnswerDTO(quiz));
      return { ...quiz, id: updatedId, options: { success: true, message: "퀴즈를 수정했습니다." } };
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
