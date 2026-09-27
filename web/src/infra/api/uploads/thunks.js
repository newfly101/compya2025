import { createAsyncThunk } from "@reduxjs/toolkit";
import { fetchAdminUploadImageFile } from "@/infra/api/uploads/api.js";
import { UPLOAD_FILE } from "@/infra/api/uploads/endpoints.js";

// 업로드 응답에서 이미지 주소를 꺼낸다. BE 는 UploadResponse(url, fileName) 한 형태만
// 주고 api.js 가 봉투를 벗기므로 볼 곳은 url 하나다 — 화면마다 복붙돼 있던 raw string /
// 래핑된 { data: ... } 분기는 도달 불가라 지웠다. 업로드 화면들은 여기서 가져다 쓴다.
export const extractUploadedUrl = (result) =>
  typeof result?.url === "string" ? result.url : null;

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
