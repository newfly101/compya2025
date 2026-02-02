import React from "react";
import BoardModal from "@/domains/community/feature/components/admin/board/modal/BoardModal.jsx";
import { useBoardCreate } from "@/domains/community/feature/hooks/board/useBoardCreate.js";

const BoardCreateModal = ({ onClose }) => {
  const hook = useBoardCreate({
    onSuccess: onClose
  });

  return (
    <BoardModal
      title="게시판 관리"
      submitLabel="추가"
      form={hook.form}
      onChange={hook.handleChange}
      onSubmit={hook.handleSubmit}
      onCancel={onClose}
      onDelete={true}
      />
  );
};

export default BoardCreateModal;
