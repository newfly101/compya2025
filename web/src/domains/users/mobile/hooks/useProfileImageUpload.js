import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { requestUploadImage } from "@/infra/api/uploads/index.js";
import { requestUpdateMyProfileImage } from "@/domains/users/store/public/thunks.js";
import {
  resizeProfileImage,
  validateProfileImageFile,
} from "@/domains/users/mobile/utils/resizeProfileImage.js";

// 업로드 응답 형태가 raw string / { url, fileName } / 래핑된 { data: {...} } 중
// 무엇이 오든 URL 을 뽑아낸다 — 다른 도메인 업로드 화면(AdminEventScreen 등)과 동일 패턴.
const extractUploadedUrl = (result) => {
  if (typeof result === "string") return result;
  if (result && typeof result === "object") {
    if (typeof result.url === "string") return result.url;
    if (result.data) return extractUploadedUrl(result.data);
  }
  return null;
};

/**
 * 마이페이지 프로필 이미지 변경 훅.
 * 파일 선택 → 즉시 미리보기 → 클라이언트에서 축소 → 업로드 → 내 정보(profileImage) 반영.
 * BE 가 아직 안 올라온 경우 업로드가 404 로 실패하는데, 그 경우도 화면이 깨지지 않고
 * client.js 가 만든 한글 오류 문구만 뜬다.
 */
export const useProfileImageUpload = () => {
  const dispatch = useDispatch();
  const [previewUrl, setPreviewUrl] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const previewRef = useRef(null);

  // objectURL 은 브라우저 메모리를 차지한다 — 교체·언마운트 시 반드시 해제.
  useEffect(() => {
    return () => {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    };
  }, []);

  const setPreview = (url) => {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    previewRef.current = url;
    setPreviewUrl(url);
  };

  const selectFile = async (file) => {
    const invalidReason = validateProfileImageFile(file);
    if (invalidReason) {
      setError(invalidReason);
      return;
    }

    setError(null);
    setPreview(URL.createObjectURL(file)); // 업로드 완료 전에 실제 표시 크기로 먼저 보여준다
    setBusy(true);
    try {
      const resizedBlob = await resizeProfileImage(file);
      const resizedFile = new File([resizedBlob], "profile.jpg", { type: "image/jpeg" });
      const uploadResult = await dispatch(
        requestUploadImage({ file: resizedFile, directory: "profile" })
      ).unwrap();
      const url = extractUploadedUrl(uploadResult);
      if (!url) throw new Error("업로드 응답에서 이미지 주소를 찾을 수 없습니다.");
      await dispatch(requestUpdateMyProfileImage(url)).unwrap();
    } catch (e) {
      setError(typeof e === "string" ? e : e?.message ?? "프로필 이미지 변경에 실패했습니다.");
    } finally {
      // 성공하면 store 의 profileImage 가, 실패하면 이전 이미지가 대신 보이므로 미리보기는 정리한다.
      setPreview(null);
      setBusy(false);
    }
  };

  const resetToDefault = async () => {
    setError(null);
    setBusy(true);
    try {
      await dispatch(requestUpdateMyProfileImage("")).unwrap();
    } catch (e) {
      setError(typeof e === "string" ? e : e?.message ?? "기본 이미지로 되돌리는 데 실패했습니다.");
    } finally {
      setBusy(false);
    }
  };

  return { previewUrl, busy, error, selectFile, resetToDefault };
};
