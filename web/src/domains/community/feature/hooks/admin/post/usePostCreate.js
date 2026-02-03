import { useDispatch } from "react-redux";
import { requestInsertNewPost } from "@/domains/community/store/index.js";
import { useForm } from "@/domains/community/feature/hooks/internal/useForm.js";

export const usePostCreate = ({ onSuccess }) => {
  const dispatch = useDispatch();

  const formHook = useForm({
    boardId: "",
    authorType: "ADMIN",
    authorId: null,
    authorName: "",
    title: "",
    content: "",
    linkType: "EXTERNAL",
    externalUrl: "",
    pinned: false,
    visible: true,
    viewCount: 0,
  });

  const handleSubmit = async () => {

    await dispatch(requestInsertNewPost(formHook.form));
    onSuccess?.();
  };

  const handleSubmitContinue = async ({keep}) => {
    const result = await dispatch(requestInsertNewPost(formHook.form));

    if (requestInsertNewPost.fulfilled.match(result)) {
      if (keep) {
        formHook.reset();          // 🔥 여기서 초기화
      } else {
        onSuccess?.();             // 모달 닫기 등
      }
    }
  };

  return {
    ...formHook,
    handleSubmit,
    handleSubmitContinue,
  };
};
