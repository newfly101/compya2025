import React from "react";
import PostModal from "@/domains/community/feature/components/admin/post/modal/PostModal.jsx";
import { usePostCreate } from "@/domains/community/feature/hooks/post/usePostCreate.js";

const PostCreateModal = ({ onClose }) => {
  const hook = usePostCreate({
    onSuccess: onClose
  });

  return (
    <PostModal
      title="게시판 관리"
      submitLabel="추가"
      form={hook.form}
      onChange={hook.handleChange}
      onSubmit={hook.handleSubmit}
      onCancel={onClose}
      />
  );
};

export default PostCreateModal;
