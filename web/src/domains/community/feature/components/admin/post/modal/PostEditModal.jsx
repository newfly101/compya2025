import React from "react";
import PostModal from "@/domains/community/feature/components/admin/post/modal/PostModal.jsx";
import { usePostEdit } from "@/domains/community/feature/hooks/post/usePostEdit.js";

const PostEditModal = ({ editPost, onClose }) => {
  const hook = usePostEdit({
    post: editPost,
    onSuccess: onClose,
  });

  return (
    <PostModal
      title="게시글 관리"
      submitLabel="수정"
      form={hook.form}
      onChange={hook.handleChange}
      onSubmit={hook.handleSubmit}
      onCancel={onClose}
    />
  );
};

export default PostEditModal;
