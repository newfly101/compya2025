import { API } from "@/app/store/APIConfig.js";

export const fetchAdminUploadImageFile = async (file, path) => {
  const { data } = await API.post(path, file, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};
