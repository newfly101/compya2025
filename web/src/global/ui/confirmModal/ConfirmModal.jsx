import { useEffect } from "react";
import { createPortal } from "react-dom";
import styles from "./ConfirmModal.module.scss";

/**
 * 가운데 확인 카드 (Figma 03 팝업 모음) — 제목 · 설명 · [보조(테두리)] [주(채움)].
 * tone: `brand`(로그인·저장하고 나가기) | `danger`(삽입 저장·초기화). onConfirm 이 없으면 닫기 하나.
 * 바깥(배경) 누름으로는 닫히지 않는다. Esc 만 onDismiss(없으면 onCancel) — 보조 버튼이 "나가기"처럼 동작인 창은 onDismiss 를 따로 준다.
 */
const ConfirmModal = ({
  open,
  title,
  message,
  confirmText,
  cancelText = "취소",
  tone = "brand",
  onConfirm,
  onCancel,
  onDismiss,
}) => {
  const dismiss = onDismiss ?? onCancel;
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && dismiss?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, dismiss]);

  if (!open) return null;
  return createPortal(
    <div className={styles.overlay}>
      <div
        className={styles.modal}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="lcol-confirm-title"
      >
        <h2 id="lcol-confirm-title" className={styles.title}>
          {title}
        </h2>
        {message && <p className={styles.message}>{message}</p>}
        <div className={styles.actions}>
          <button type="button" className={styles.secondary} onClick={onCancel} autoFocus>
            {cancelText}
          </button>
          {onConfirm && (
            <button type="button" className={tone === "danger" ? styles.danger : styles.primary} onClick={onConfirm}>
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </div>,
    document.getElementById("modal") ?? document.body,
  );
};

export default ConfirmModal;
