import React from "react";
import TagModal from "@/domains/community/feature/components/admin/tag/modal/TagModal.jsx";
import { useTagCreate } from "@/domains/community/feature/hooks/admin/tag/useTagCreate.js";

const TagCreateModal = ({ onClose }) => {
  const hook = useTagCreate({
    onSuccess: onClose
  });

  return (
    <TagModal
      title="태그 관리"
      submitLabel="추가"
      form={hook.form}
      onChange={hook.handleChange}
      onSubmit={hook.handleSubmit}
      onCancel={onClose}
      onDelete={true}
      />
  );
};

export default TagCreateModal;
