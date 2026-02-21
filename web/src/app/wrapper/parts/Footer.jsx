import React from "react";
import styles from "./Footer.module.scss";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className={styles.appFooter}>
      <div className={styles.appFooterInner}>

        <div className={styles.appFooterCopy}>
          © 컴투스프로야구2026 — 컴투스프로야구 정보 사이트
        </div>

        <div className={styles.appFooterBottom}>
          <div className={styles.appFooterLinks}>
            <Link to="/privacy">개인정보처리방침</Link>
            <span className={styles.divider}>|</span>
            <span className={styles.disabled}>이용약관</span>
          </div>

          <a
            href="https://open.kakao.com/o/sw9YuV8h"
            target="_blank"
            rel="noreferrer"
            className={styles.kakaoBtn}
          >
            카카오톡 문의
          </a>
        </div>

      </div>
    </footer>

  );
};

export default Footer;
