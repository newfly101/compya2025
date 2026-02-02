import { useDispatch } from "react-redux";
import { usePostForm } from "@/domains/community/feature/hooks/post/internal/usePostForm.js";
import { requestInsertNewPost } from "@/domains/community/store/index.js";

export const usePostCreate = ({ onSuccess }) => {
  const dispatch = useDispatch();

  const formHook = usePostForm({
    boardId: "",
    authorType: "ADMIN",
    authorId: null,
    authorName: "",
    title: "",
    content: "",
    linkType: "INTERNAL",
    externalUrl: "",
    pinned: false,
    visible: true,
    viewCount: 0,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    await dispatch(requestInsertNewPost(formHook.form));
    onSuccess?.();
  };

  return {
    ...formHook,
    handleSubmit,
  };
};
