import { useDispatch } from "react-redux";
import { usePostForm } from "@/domains/community/feature/hooks/post/internal/usePostForm.js";

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
    planned: post.planned,
    visible: post.visible,
    viewCount: post.viewCount,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

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
