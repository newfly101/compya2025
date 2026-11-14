import Link from "next/link";
import styles from "./TopBar.module.scss";
import BurgerButton from "./BurgerButton.jsx";

// title 없음 = 홈형(로고), 있음 = section형(제목). 원본의 page형(뒤로가기)은 쓰는 화면이 없어 옮기지 않았다.
// TODO(next-migration): 로그인/로그아웃은 Redux/Auth 의존 — 로그인 버튼 자리만 정적 렌더
const TopBar = ({ title }) => (
  <header className={styles.topBar}>
    <div className={styles.left}>
      <BurgerButton className={styles.burger} />
    </div>
    {title ? (
      <span className={styles.pageTitle}>{title}</span>
    ) : (
      <Link href="/" className={styles.logo}>
        ⚾&nbsp;&nbsp;컴프야펀
      </Link>
    )}
    <div className={styles.right}>
      <button type="button" className={styles.loginBtn}>N 네이버 로그인</button>
    </div>
  </header>
);

export default TopBar;
