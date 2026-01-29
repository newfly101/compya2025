import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchGetExternalEventList,
  fetchInsertNewEvent,
  fetchUpdateExternalEvent,
  fetchUpdateExternalEventVisible,
} from "@/domains/events/store/api.js";
import { EVENT_ACTIONS } from "@/domains/events/store";
import { createEventDTO, updateEventDTO } from "@/domains/events/store";

export const requestGetExternalEventList = createAsyncThunk(
  EVENT_ACTIONS.GET_EVENT_LISTS, async (_, { dispatch, getState, rejectWithValue }) => {
    try {
      const data = await fetchGetExternalEventList();
      console.log(`requestGetExternalEventList : `, data);

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  });


export const requestInsertNewEvent = createAsyncThunk(
  EVENT_ACTIONS.CREATE, async (newEvent, { dispatch, getState, rejectWithValue }) => {
    try {
      console.log(`new Event : `, newEvent);
      const { success, message, eventId } = await fetchInsertNewEvent(createEventDTO(newEvent));
      console.log(`requestInsertNewEvent : `, success, message, eventId);

      return {
        ...newEvent,
        id: eventId,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  });

export const requestUpdateExternalEvent = createAsyncThunk(
  EVENT_ACTIONS.UPDATE, async ({ id, ...event }, { dispatch, getState, rejectWithValue }) => {
    try {
      console.log("EVENT_ACTIONS.UPDATE : ", id, event);
      const { success, message, eventId } = await fetchUpdateExternalEvent(id, updateEventDTO(event));
      console.log(`requestUpdateExternalEvent : `, success, message, eventId);

      return {
        ...event,
        id: eventId,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  });

export const requestUpdateExternalEventVisible = createAsyncThunk(
  EVENT_ACTIONS.UPDATE_VISIBLE, async ({ id, visible }, { dispatch, getState, rejectWithValue }) => {
    try {
      const { success, message, eventId } = await fetchUpdateExternalEventVisible(id, visible);
      console.log(`requestUpdateExternalEventVisible : `, success, message, eventId);
      return {
        id: eventId,
        visible,
      };
    } catch (e) {
      return rejectWithValue(e.message);
    }
  });
