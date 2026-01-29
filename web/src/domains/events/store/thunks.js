import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchGetExternalEventList,
  fetchInsertNewEvent,
  fetchUpdateExternalEvent,
  fetchUpdateExternalEventVisible,
} from "@/domains/events/store/api.js";
import { EVENT_ACTIONS } from "@/domains/events/store";
import { createEventDTO, updateEventDTO, updateEventVisibleDTO } from "@/domains/events/store";

export const requestGetExternalEventList = createAsyncThunk(
  EVENT_ACTIONS.GET_EVENT_LISTS, async (_ , { dispatch, getState, rejectWithValue }) => {
    try {
      const data = await fetchGetExternalEventList();
      console.log(`Event List : ` , data);

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
});


export const requestInsertNewEvent = createAsyncThunk(
  EVENT_ACTIONS.CREATE, async (event , { dispatch, getState, rejectWithValue }) => {
    try {
      console.log(`new Event : ` , event);
      const {success, message, eventId } = await fetchInsertNewEvent(createEventDTO(event));
      console.log(`Event List : ` , success, message, eventId);

      return {
        ...event,
        id: eventId
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  });

export const requestUpdateExternalEvent = createAsyncThunk(
  EVENT_ACTIONS.UPDATE, async ({ id, event } , { dispatch, getState, rejectWithValue }) => {
    try {
      const data = await fetchUpdateExternalEvent(id, updateEventDTO(event));
      console.log(`Event List : ` , data);

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  });

export const requestUpdateExternalEventVisible = createAsyncThunk(
  EVENT_ACTIONS.UPDATE_VISIBLE, async ({id, visible} , { dispatch, getState, rejectWithValue }) => {
    try {
      const data = await fetchUpdateExternalEventVisible(id, updateEventVisibleDTO(visible));
      console.log(`Event List : ` , data);

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  });
