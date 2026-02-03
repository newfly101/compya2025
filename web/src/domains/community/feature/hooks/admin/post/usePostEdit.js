import { useDispatch } from "react-redux";
import { requestUpdateNewPost } from "@/domains/community/store/index.js";
import { useForm } from "@/domains/community/feature/hooks/internal/useForm.js";

export const usePostEdit = ({ post, onSuccess }) => {
  const dispatch = useDispatch();

  const formHook = useForm({
    boardId: post.boardId,
    authorType: post.authorType,
    authorId: post.authorId,
    authorName: post.authorName,
    title: post.title,
    content: post.content,
    linkType: post.linkType,
    externalUrl: post.externalUrl,
    pinned: post.pinned,
    visible: post.visible,
    viewCount: post.viewCount,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // console.log("id: ",post.id, "      form:", formHook.form);

    await dispatch(requestUpdateNewPost({
      id: post.id,
      form: formHook.form
    }));

    onSuccess?.();
  };

  return {
    ...formHook,
    handleSubmit,
  };
};
