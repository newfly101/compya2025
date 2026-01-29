import { configureStore } from "@reduxjs/toolkit";
import dictionaryReducer from "../../store/modules/dictionary/slices.js";
import simulateReducer from "../../store/modules/simulate/slices.js";
import authReducer from "../../store/modules/auth/slices.js";
import eventsReducer from "@/domains/events/store/slices.js";

export const store = configureStore({
  reducer: {
    dictionary: dictionaryReducer,
    simulate: simulateReducer,
    auth: authReducer,
    events: eventsReducer,
  },
});
