import styles from "@/styles/layout/appLayout.module.scss";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p>© 컴투스프로야구2025 — 컴투스프로야구 정보 사이트</p>
        <div className={styles.legal}>
          <p><Link to="/privacy">개인정보처리방침</Link></p>
        <p className={styles.disabled}>이용약관</p>
        </div>
      </div>
    </footer>
  );
}
