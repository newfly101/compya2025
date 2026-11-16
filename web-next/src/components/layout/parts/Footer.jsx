import Link from "next/link";
import styles from "./Footer.module.scss";

const Footer = () => (
  <footer className={styles.footer}>
    <nav className={styles.links} aria-label="정책 링크">
      <Link href="/about" className={styles.link}>소개</Link>
      <Link href="/privacy" className={styles.link}>개인정보처리방침</Link>
      <Link href="/terms" className={styles.link}>이용약관</Link>
      <Link href="/contact" className={styles.link}>문의하기</Link>
    </nav>
    <p className={styles.copyright}>© {new Date().getFullYear()} 컴프야펀. All rights reserved.</p>
  </footer>
);

export default Footer;
