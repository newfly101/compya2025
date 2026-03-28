import { useState } from "react";

/**
 * Admin 테이블의 생성/수정 모달 상태를 관리하는 공통 훅
 * @returns {{ createOpen, editTarget, openCreate, closeCreate, openEdit, closeEdit }}
 */
export const useTableModal = () => {
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  return {
    createOpen,
    editTarget,
    openCreate: () => setCreateOpen(true),
    closeCreate: () => setCreateOpen(false),
    openEdit: (item) => setEditTarget(item),
    closeEdit: () => setEditTarget(null),
  };
};
