import { Link } from "react-router-dom";
import styles from "@/styles/layout/appLayout.module.scss";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <nav className={styles.nav}>
          <Link to="/" >컴프야펀</Link>
          {/*<Link to="/damage">데미지 계산기</Link>*/}
          {/*<Link to="/skill">스킬 계산기</Link>*/}
          <Link to="/events">이벤트</Link>
          <Link to="/coupon">쿠폰 코드</Link>
          <Link to="/notice">공지사항</Link>
          {/*<Link to="/community">커뮤니티</Link>*/}
        </nav>
      </div>
    </header>
  );
}
