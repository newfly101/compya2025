import { Link } from "react-router-dom";
import styles from "@/shared/layout/appLayout/appLayout.module.scss";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <nav className={styles.nav}>
          <Link to="/" >홈</Link>
          {/*<Link to="/damage">데미지 계산기</Link>*/}
          {/*<Link to="/skill">스킬 계산기</Link>*/}
          <Link to="/notice?tab=event">이벤트</Link>
          <Link to="/notice?tab=coupons">쿠폰 코드</Link>
          <Link to="/notice">공지사항</Link>
          <Link to="/tips">팁 모아보기</Link>
          <Link to="/dictionary">📌추천 백과사전</Link>
        </nav>
      </div>
    </header>
  );
}
