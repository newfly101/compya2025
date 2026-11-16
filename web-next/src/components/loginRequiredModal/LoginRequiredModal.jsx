import React from "react";
import { createPortal } from "react-dom";
import styles from "./LoginRequiredModal.module.scss";
import { DEFAULT_LOGIN_REASON } from "./loginReasons.js";


const LoginRequiredModal = ({ isOpen, onClose, onLogin, message }) => {
  if (!isOpen) return null;

  const modalRoot = document.getElementById("modal") ?? document.body;

  // 로그인 트리거는 페이지 이동(네이버 인증 리다이렉트)을 동반하므로 모달을 먼저 닫는다.
  const handleLogin = () => {
    onClose();
    onLogin?.();
  };

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className={styles.title}>로그인이 필요해요</h2>
        <p className={styles.message}>{message ?? DEFAULT_LOGIN_REASON}</p>
        <p className={styles.sub}>로그인하면 지금 보던 화면으로 돌아와요.</p>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
          >
            닫기
          </button>
          {onLogin && (
            <button
              type="button"
              className={styles.loginBtn}
              onClick={handleLogin}
            >
              로그인
            </button>
          )}
        </div>
      </div>
    </div>,
    modalRoot
  );
};

export default LoginRequiredModal;
