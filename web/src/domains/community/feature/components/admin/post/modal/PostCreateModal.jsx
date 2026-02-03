import React from "react";
import PostModal from "@/domains/community/feature/components/admin/post/modal/PostModal.jsx";
import { usePostCreate } from "@/domains/community/feature/hooks/admin/post/usePostCreate.js";

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
      onSubmit={() => hook.handleSubmitContinue({keep: false})}
      onSubmitContinue={() => hook.handleSubmitContinue({keep: true})}
      onCancel={onClose}
      />
  );
};

export default PostCreateModal;
