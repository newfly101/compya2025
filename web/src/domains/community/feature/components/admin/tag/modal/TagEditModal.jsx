import React from "react";
import TagModal from "@/domains/community/feature/components/admin/tag/modal/TagModal.jsx";
import { useTagEdit } from "@/domains/community/feature/hooks/admin/tag/useTagEdit.js";

const TagEditModal = ({ editTag, onClose }) => {
  const hook = useTagEdit({
    tag: editTag,
    onSuccess: onClose
  });

  return (
    <TagModal
      title="태그 관리"
      submitLabel="수정"
      form={hook.form}
      onChange={hook.handleChange}
      onSubmit={hook.handleSubmit}
      onCancel={onClose}
      onDelete={false}
      />
  );
};

export default TagEditModal;
