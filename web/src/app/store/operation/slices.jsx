import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  lastOperation: null,
};

const operationSlice = createSlice({
  name: "operation",
  initialState,
  reducers: {
    setLastOperation: (state, action) => {
      state.lastOperation = action.payload; // { success, message, kind, scope, ts }
    },
    clearLastOperation: (state) => {
      state.lastOperation = null;
    },
  },
});

export const { setLastOperation, clearLastOperation } = operationSlice.actions;
export default operationSlice.reducer;
