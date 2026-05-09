import React from "react";
import { createPortal } from "react-dom";
import styles from "./RenewalNoticeModal.module.scss";

const DEFAULT_MESSAGE = "리뉴얼 작업 중인 컨텐츠입니다.\n빠른 시일 내에 만나뵙겠습니다.";

const RenewalNoticeModal = ({ isOpen, onClose, message }) => {
  if (!isOpen) return null;

  const modalRoot = document.getElementById("modal") ?? document.body;

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        <p className={styles.message}>{message ?? DEFAULT_MESSAGE}</p>
        <button
          type="button"
          className={styles.confirmBtn}
          onClick={onClose}
        >
          확인
        </button>
      </div>
    </div>,
    modalRoot
  );
};

export default RenewalNoticeModal;
