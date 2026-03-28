import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchAdminQuizAll,
  fetchAdminQuizCreate,
  fetchAdminQuizUpdate,
  fetchAdminQuizUpdateVisible,
} from "@/domains/quiz/store/admin/api.js";
import { ADMIN_QUIZ_ACTIONS } from "@/domains/quiz/store/admin/endpoints.js";
import { baseQuizAnswerDTO } from "@/domains/quiz/store/dto.js";
import { requestUploadImage } from "@/infra/uploads/store/index.js";

export const requestAdminQuizAll = createAsyncThunk(
  ADMIN_QUIZ_ACTIONS.GET_ALL,
  async (_, { rejectWithValue }) => {
    try {
      const { items } = await fetchAdminQuizAll();
      return items;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const requestAdminQuizCreate = createAsyncThunk(
  ADMIN_QUIZ_ACTIONS.CREATE,
  async (newQuiz, { rejectWithValue }) => {
    try {
      const { id, ...options } = await fetchAdminQuizCreate(baseQuizAnswerDTO(newQuiz));
      return { ...newQuiz, id, options };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const requestAdminQuizUpdate = createAsyncThunk(
  ADMIN_QUIZ_ACTIONS.UPDATE,
  async ({ id, ...quiz }, { rejectWithValue }) => {
    try {
      const { id: updatedId, ...options } = await fetchAdminQuizUpdate(id, baseQuizAnswerDTO(quiz));
      return { ...quiz, id: updatedId, options };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const requestAdminQuizUpdateVisible = createAsyncThunk(
  ADMIN_QUIZ_ACTIONS.UPDATE_VISIBLE,
  async ({ id, visible }, { rejectWithValue }) => {
    try {
      const { id: updatedId, ...options } = await fetchAdminQuizUpdateVisible(id, visible);
      return { id: updatedId, visible, options };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const requestAdminUploadQuizImage = (file) =>
  requestUploadImage({ file, directory: "events" });
