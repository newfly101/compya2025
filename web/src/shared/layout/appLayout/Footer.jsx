import styles from "@/shared/layout/appLayout/appLayout.module.scss";
import { Link } from "react-router-dom";

export default function Footer() {

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p className={styles.copy}>
          © 컴투스프로야구2026 — 컴투스프로야구 정보 사이트
        </p>

        <div className={styles.legal}>
          <Link to="/privacy">개인정보처리방침</Link>
          <span className={styles.disabled}>이용약관</span>
        </div>

        <div className={styles.actions}>
          <button className={styles.kakao}>
            <a href="https://open.kakao.com/o/sw9YuV8h" target="_blank" rel="noreferrer">
              카카오톡: 오픈채팅 열기
            </a>
          </button>
        </div>
      </div>
    </footer>
  );
}
