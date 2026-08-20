import React from "react";
import { createPortal } from "react-dom";
import styles from "./LoginRequiredModal.module.scss";

const DEFAULT_MESSAGE = "로그인한 회원만 볼 수 있는 메뉴예요.\n로그인하고 확인해보세요.";

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
        <p className={styles.message}>{message ?? DEFAULT_MESSAGE}</p>
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
              N 로그인
            </button>
          )}
        </div>
      </div>
    </div>,
    modalRoot
  );
};

export default LoginRequiredModal;
