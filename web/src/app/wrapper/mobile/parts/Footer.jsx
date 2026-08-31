// src/app/wrapper/mobile/parts/Footer.jsx
// C/Footer — 전역 정책 링크 + 저작권 (구글 애드센스 재신청 대응)
// 실제 <a> 로 렌더되는 react-router Link 사용 — 크롤러가 정책 페이지를 발견해야 하므로
// onClick + navigate 방식은 쓰지 않는다.
import { Link } from "react-router-dom";
import styles from "./Footer.module.scss";

const currentYear = new Date().getFullYear();

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <nav className={styles.links} aria-label="정책 링크">
        <Link to="/about" className={styles.link}>소개</Link>
        <Link to="/privacy" className={styles.link}>개인정보처리방침</Link>
        <Link to="/terms" className={styles.link}>이용약관</Link>
        <Link to="/contact" className={styles.link}>문의하기</Link>
      </nav>

      {/* TODO: 사업자 정보 (상호명 / 대표자 / 사업자등록번호 / 통신판매업신고번호 / 주소) —
          확정 데이터 없어 지어내지 않고 비워둠. 확보되면 이 자리에 추가. */}

      <p className={styles.copyright}>
        © {currentYear} 컴프야펀. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;
