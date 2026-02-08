import React from "react";
import { createPortal } from "react-dom";
const modalRoot = document.getElementById("modal");
import styles from "./ResponseModal.module.scss";

const ResponseModal = ({ open, success, message, onClose }) => {
  if (!open) return null;

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={success ? styles.iconSuccess : styles.iconFail}>
          {success ? "✓" : "!"}
        </div>

        <p className={styles.message}>{message}</p>

        <button className={styles.confirmBtn} onClick={onClose}>
          확인
        </button>
      </div>
    </div>,
    modalRoot
  );
};

export default ResponseModal;
