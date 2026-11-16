import { useCallback, useState } from "react";

// 목록 + 등록/수정 모달의 열림·닫힘·편집대상 상태를 한 곳에 묶는 훅.
// 설계 문서는 `web/src/global/hooks/useTableModal.js` 위치를 제안했지만,
// 이번 작업의 Edit 허용 범위(`web/src/global/ui/admin/**`) 안에 두기 위해
// `web/src/global/ui/admin/hooks/`로 옮겨 두었다.
export default function useTableModal() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  const openCreate = useCallback(() => {
    setEditTarget(null);
    setCreateOpen(true);
  }, []);

  const closeCreate = useCallback(() => setCreateOpen(false), []);

  const openEdit = useCallback((target) => {
    setCreateOpen(false);
    setEditTarget(target);
  }, []);

  const closeEdit = useCallback(() => setEditTarget(null), []);

  return {
    createOpen,
    editTarget,
    isOpen: createOpen || editTarget != null,
    openCreate,
    closeCreate,
    openEdit,
    closeEdit,
  };
}
