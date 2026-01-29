import { createSlice } from "@reduxjs/toolkit";

const initialState  = {
  events: [],
  loading: false,
  error: null,
}

const adminSlice = createSlice({
  name: "admin",
  initialState: initialState,
  reducers: {},
  // extraReducers: (builder) => {
  //   builder
  //     .addCase(requestGetExternalEventList.pending, (state) => {
  //       state.loading = true;
  //       state.error = null;
  //     })
  //     .addCase(requestGetExternalEventList.fulfilled, (state, action) => {
  //       state.loading = false;
  //       state.events = action.payload;
  //     })
  //     .addCase(requestGetExternalEventList.rejected, (state, action) => {
  //       state.loading = false;
  //       state.error = action.payload;
  //     });
  // }
})
export const {  } = adminSlice.actions;
export default adminSlice.reducer;
