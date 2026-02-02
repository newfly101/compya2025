import React from "react";
import BoardModal from "@/domains/community/feature/components/admin/board/modal/BoardModal.jsx";
import { useBoardEdit } from "@/domains/community/feature/hooks/useBoardEdit.js";

const BoardEditModal = ({ editBoard, onClose }) => {
  const hook = useBoardEdit({
    board: editBoard,
    onSuccess: onClose,
  });

  return (
    <BoardModal
      title="게시판 관리"
      submitLabel="수정"
      form={hook.form}
      onChange={hook.handleChange}
      onSubmit={hook.handleSubmit}
      onCancel={onClose}
      onDelete={false}
    />
  );
};

export default BoardEditModal;
