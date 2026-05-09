import { API } from "@/infra/http/client.js";

export const fetchAdminUploadImageFile = async (file, path) => {
  const { data } = await API.post(path, file, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};
