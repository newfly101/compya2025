import { useDispatch } from "react-redux";
import { usePostForm } from "@/domains/community/feature/hooks/post/internal/usePostForm.js";
import { requestUpdateNewPost } from "@/domains/community/store/index.js";

export const usePostEdit = ({ post, onSuccess }) => {
  const dispatch = useDispatch();

  const formHook = usePostForm({
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

    console.log("id: ",post.id, "      form:", formHook.form);

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
