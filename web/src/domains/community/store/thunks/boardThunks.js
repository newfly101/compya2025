import { createAsyncThunk } from "@reduxjs/toolkit";
import { ADMIN_COMMUNITY_ACTIONS } from "@/domains/community/store/endpoints.js";
import {
  fetchGetAllBoardLists,  fetchInsertNewBoard, fetchUpdateBoard} from "@/domains/community/store/api.js";
import { createBoardDTO } from "@/domains/community/store/dto.js";

export const requestGetAllBoardLists = createAsyncThunk(
  ADMIN_COMMUNITY_ACTIONS.BOARD_LIST, async (_, { rejectWithValue }) => {
    try {
      const {items: boards} = await fetchGetAllBoardLists();
      // console.log(`requestGetAllBoardLists : `, boards);

      return boards;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  });

export const requestInsertNewBoard = createAsyncThunk(
  ADMIN_COMMUNITY_ACTIONS.CREATE_BOARD, async (form, { rejectWithValue }) => {
    try {
      const { success, message, id } = await fetchInsertNewBoard(createBoardDTO(form));
      // console.log(`requestInsertNewBoard: `, boardId);

      return {
        boards: {
          id,
          ...form,
        },
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const requestUpdateNewBoard = createAsyncThunk(
  ADMIN_COMMUNITY_ACTIONS.UPDATE_BOARD, async ({ id, form }, { rejectWithValue }) => {
    try {
      const { success, message, id } = await fetchUpdateBoard({ id: id, board: createBoardDTO(form) });
      // console.log(`requestUpdateNewBoard: `, boardId);

      return {
        id,
        ...form,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);
