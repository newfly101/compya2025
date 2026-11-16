import { useMutation } from "@tanstack/react-query";
import { fetchAdminUploadImageFile } from "@/lib/api/uploads/api.js";

// 업로드 응답에서 이미지 주소를 꺼낸다. BE 는 UploadResponse(url, fileName) 한 형태만 주고
// api.js 가 봉투를 벗기므로 볼 곳은 url 하나다.
export const extractUploadedUrl = (result) => (typeof result?.url === "string" ? result.url : null);

// variables: { file, directory } → { url, fileName }
export const useUploadImageMutation = () =>
  useMutation({
    mutationFn: ({ file, directory }) => {
      const formData = new FormData();
      formData.append("file", file);
      return fetchAdminUploadImageFile(formData, `/upload/${directory}`);
    },
  });
