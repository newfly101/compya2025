import { useDispatch } from "react-redux";
import { requestInsertNewEvent } from "@/domains/events/store/index.js";
import { useEventForm } from "./useEventForm.js";
import { requestUploadImage } from "@/infra/uploads/store/index.js";

export const useEventCreate = ({ onSuccess }) => {
  const dispatch = useDispatch();

  const formHook = useEventForm({
    title: "",
    eventSource: "OFFICIAL",
    imageUrl: "",
    imageFile: null,
    externalLink: "",
    startAt: "",
    expireAt: "",
    visible: true,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = formHook.validate();
    if (!result.valid) {
      alert(result.message);
      return;
    }

    let imageUrl = formHook.form.imageUrl;

    // 여기 file 먼저 호출
    if (formHook.form.imageFile) {
      const uploadResult = await dispatch(
        requestUploadImage(formHook.form.imageFile),
      );

      if (requestUploadImage.fulfilled.match(uploadResult)) {
        imageUrl = uploadResult.payload;   // ← 여기서 URL 받음
      } else {
        alert("이미지 업로드 실패");
        return;
      }
    }
    // 이후 그 결과를 가지고 이벤트 생성 하고 싶어

    const payload = {
      ...formHook.form,
      imageUrl,
    };

    delete payload.imageFile;

    await dispatch(requestInsertNewEvent(payload));
    onSuccess?.();
  };

  return {
    ...formHook,
    handleSubmit,
  };
};
