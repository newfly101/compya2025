import { configureStore } from "@reduxjs/toolkit";
import dictionaryReducer from "./modules/dictionary/slices.js";
import simulateReducer from "./modules/simulate/slices.js";
import authReducer from "./modules/auth/slices.js";

export const store = configureStore({
  reducer: {
    dictionary: dictionaryReducer,
    simulate: simulateReducer,
    auth: authReducer
  },
});
