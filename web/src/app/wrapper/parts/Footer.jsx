import React from "react";
import styles from "./Footer.module.scss";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className={styles.appFooter}>
      <div className={styles.appFooterFrame}>

        <p className={styles.appFooterCopy}>
          © 컴투스프로야구2026 — 컴투스프로야구 정보 사이트
        </p>

        <div className={styles.appFooterLegal}>
          <Link to="/privacy">개인정보처리방침</Link>
          <span className={styles.appFooterDisabled}>이용약관</span>
        </div>

        <div className={styles.appFooterActions}>
          <a
            href="https://open.kakao.com/o/sw9YuV8h"
            target="_blank"
            rel="noreferrer"
            className={styles.appFooterKakao}
          >
            카카오톡: 오픈채팅 열기
          </a>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
