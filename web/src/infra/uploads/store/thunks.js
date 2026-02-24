import { createAsyncThunk } from "@reduxjs/toolkit";
import { fetchAdminUploadImageFile } from "@/infra/uploads/store/api.js";
import { UPLOAD_FILE } from "@/infra/uploads/store/endpoints.js";

export const requestUploadImage = createAsyncThunk(
  UPLOAD_FILE.IMAGES, async ({ file, directory }, { rejectWithValue }) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const path = `/upload/${directory}`;
      const data = await fetchAdminUploadImageFile(formData, path);
      console.log("requestUploadImage : ", data);

      return data;
    } catch (e) {
      return rejectWithValue(e.message);
    }
  },
);
