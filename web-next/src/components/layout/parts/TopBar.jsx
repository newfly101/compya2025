"use client";
import Link from "next/link";
import styles from "./TopBar.module.scss";
import BurgerButton from "./BurgerButton.jsx";
import { useAuthentication } from "@/features/authentication/hooks/useAuthentication.js";

// title 없음 = 홈형(로고), 있음 = section형(제목). 원본의 page형(뒤로가기)은 쓰는 화면이 없어 옮기지 않았다.
// 로그인/로그아웃은 상단바 소유 — 세션 확인 전(initialized=false)에는 버튼 자리를 비워 로그인 사용자에게 로그인 버튼이 깜빡이지 않게 한다.
const TopBar = ({ title }) => {
  const { initialized, isAuthenticated, login, logout } = useAuthentication();
  // 캐시된 세션(isAuthenticated)이 있으면 확인 전에도 바로 로그아웃 버튼을 보인다
  const authAction = !initialized && !isAuthenticated ? (
    <span className={styles.authSlot} aria-hidden="true" />
  ) : isAuthenticated ? (
    <button type="button" className={`${styles.logoutBtn} ${styles.authSlot}`} onClick={logout}>로그아웃</button>
  ) : (
    <button type="button" className={`${styles.loginBtn} ${styles.authSlot}`} onClick={login}>N 네이버 로그인</button>
  );

  return (
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
        {title ? <div className={styles.rightAction}>{authAction}</div> : authAction}
      </div>
    </header>
  );
};

export default TopBar;
