import { useState } from "react";
import AdminModal from "@/global/ui/admin/modal/AdminModal.jsx";
import styles from "./AdminConfirmDialog.module.scss";

// 삭제 등 되돌릴 수 없는 조작 확인. AdminModal 위에 얹어 컨테이닝 규칙을 그대로 물려받는다.
const AdminConfirmDialog = ({
  open,
  title = "확인",
  message,
  dangerous = false,
  requireAgree = false,
  agreeLabel = "위 내용을 확인했습니다",
  confirmLabel = "확인",
  cancelLabel = "취소",
  onConfirm,
  onCancel,
}) => {
  const [agreed, setAgreed] = useState(false);
  // 렌더 중 prop 변화를 감지해 동의 체크를 리셋한다(useEffect 대신 — React 권장 패턴).
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setAgreed(false);
  }

  const disabled = requireAgree && !agreed;

  return (
    <AdminModal
      open={open}
      title={title}
      onClose={onCancel}
      footer={
        <>
          <button type="button" className={styles.cancelBtn} onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`${styles.confirmBtn} ${dangerous ? styles.dangerous : ""}`}
            disabled={disabled}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <p className={`${styles.message} ${dangerous ? styles.dangerMessage : ""}`}>{message}</p>
      {requireAgree && (
        <label className={styles.agreeLabel}>
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
          />
          {agreeLabel}
        </label>
      )}
    </AdminModal>
  );
};

export default AdminConfirmDialog;
