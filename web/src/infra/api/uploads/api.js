import { API } from "@/infra/http/client.js";

// BE 는 모든 응답을 { success, code, data } 로 감싼다. 실제 payload 는 data.data.
export const fetchAdminUploadImageFile = async (file, path) => {
  const { data } = await API.post(path, file, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data;
};
