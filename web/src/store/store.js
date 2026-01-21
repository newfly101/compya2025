import { configureStore } from "@reduxjs/toolkit";
import dictionaryReducer from "./modules/dictionary/slices.js";
import simulateReducer from "./modules/simulate/slices.js";

export const store = configureStore({
  reducer: {
    dictionary: dictionaryReducer,
    simulate: simulateReducer,
  },
});
