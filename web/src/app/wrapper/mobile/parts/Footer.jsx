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

      {/*
        [HITL: 운영자 표기값 필요 — 이름/이메일/(선택)사업자등록번호]
        확정되면 아래 구조로 링크 nav 와 copyright 사이에 렌더 추가 (styles.bizInfo 는
        Footer.module.scss 에 이미 정의돼 있음):

        <div className={styles.bizInfo}>
          <p className={styles.bizLine}>상호: {'{name}'}</p>
          <p className={styles.bizLine}>대표자: {'{representative}'}</p>
          <p className={styles.bizLine}>사업자등록번호: {'{registrationNumber}'}</p>
          <p className={styles.bizLine}>통신판매업신고번호: {'{mailOrderNumber}'}</p>
          <p className={styles.bizLine}>주소: {'{address}'}</p>
          <p className={styles.bizLine}>이메일: {'{email}'}</p>
        </div>

        값이 없는 항목(예: 사업자등록번호 미보유 개인)은 해당 <p> 줄만 생략한다.
        절대 임의 값으로 미리 채우지 않는다.
      */}

      <p className={styles.copyright}>
        © {currentYear} 컴프야펀. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;
