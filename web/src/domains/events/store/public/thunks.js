import { createAsyncThunk } from "@reduxjs/toolkit";
import { EVENT_ACTIONS } from "@/domains/events/store/public/endpoints.js";
import { fetchGetUserExternalEvent } from "@/domains/events/store/public/api.js";

export const requestGetExternalEventList = createAsyncThunk(
  EVENT_ACTIONS.GET_EVENT_LISTS, async (_, { rejectWithValue }) => {
    try {
      const { items } = await fetchGetUserExternalEvent();

      return [...items].reverse();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  });
