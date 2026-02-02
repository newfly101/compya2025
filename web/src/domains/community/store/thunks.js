import { createAsyncThunk } from "@reduxjs/toolkit";
import { ADMIN_COMMUNITY_ACTIONS } from "@/domains/community/store/endpoints.js";
import {
  fetchGetAllBoardLists,
  fetchInsertNewBoard,
  fetchUpdateBoard,
} from "@/domains/community/store/api.js";
import { createBoardDTO } from "@/domains/community/store/dto.js";

export const requestGetAllBoardLists = createAsyncThunk(
  ADMIN_COMMUNITY_ACTIONS.BOARD_LIST, async (_, { dispatch, getState, rejectWithValue }) => {
    try {
      const data = await fetchGetAllBoardLists();
      console.log(`requestGetAllBoardLists : `, data);

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  });

export const requestInsertNewBoard = createAsyncThunk(
  ADMIN_COMMUNITY_ACTIONS.CREATE_BOARD, async (form, { dispatch, getState, rejectWithValue }) => {
    try {
      const { success, message, boardId } = await fetchInsertNewBoard(createBoardDTO(form));
      console.log(`requestInsertNewBoard: `, boardId);

      return {
        boards: {
          id: boardId,
          ...form,
        },
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const requestUpdateNewBoard = createAsyncThunk(
  ADMIN_COMMUNITY_ACTIONS.UPDATE_BOARD, async ({ id, form }, { dispatch, getState, rejectWithValue }) => {
    try {
      const { success, message, boardId } = await fetchUpdateBoard({ id: id, board: createBoardDTO(form) });
      console.log(`requestInsertNewBoard: `, boardId);

      return {
          id: boardId,
          ...form,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);
