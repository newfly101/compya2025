import { createSlice } from "@reduxjs/toolkit";
import { applyAsyncHandlers } from "@/global/handler/applyAsyncHandlers.js";
import { requestUploadImage } from "@/infra/uploads/store/thunks.js";

const initialState  = {
  imageFile: null,
  imageUrl: null,
  cardInfo: null,
  loading: false,
  error: null,
}

const uploadSlice = createSlice({
  name: "upload",
  initialState: initialState,
  reducers: {

  },
  extraReducers: (builder) => {
    /* ===============================
     * 파일 업로드 하고 url return
     * =============================== */
    applyAsyncHandlers(builder, requestUploadImage, (state, action) => {
      state.imageFile = null;
      state.imageUrl = action.payload;
    });

  }
})

export const { } = uploadSlice.actions;
export default uploadSlice.reducer;
