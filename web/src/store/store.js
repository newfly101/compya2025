import { configureStore } from "@reduxjs/toolkit";
import dictionaryReducer from "./modules/dictionary/slices.js";

export const store = configureStore({
  reducer: {
    dictionary: dictionaryReducer,
  },
});
