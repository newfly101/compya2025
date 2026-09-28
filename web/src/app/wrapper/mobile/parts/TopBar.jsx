// src/app/wrapper/mobile/parts/TopBar.jsx
import { Link } from "react-router-dom";
import { useTopBar } from "@/app/provider/TopBarProvider";
import styles from "./TopBar.module.scss";
import { useAuthentication } from "@/domains/authentication/hooks/useAuthentication.js";

const TopBar = () => {
  const { config, openDrawer } = useTopBar();
  const { isAuthenticated, login, logout } = useAuthentication();
  const { variant, title, rightAction, onBack } = config;

  // 상단바 우측 슬롯은 어느 갈래에서나 같은 것을 그린다 — 글자형 로그아웃 / 네이버 로그인.
  // 예전에는 page / section 갈래만 전원 기호 아이콘을 썼는데, 화면이 준 rightAction 옆에
  // 또 하나의 로그아웃 진입점이 생겨 버튼이 둘로 보였고 글리프도 깨졌다.
  const authAction = isAuthenticated ? (
    <button type="button" className={styles.logoutBtn} onClick={logout}>로그아웃</button>
  ) : (
    <button type="button" className={styles.loginBtn} onClick={login}>N 네이버 로그인</button>
  );

  if (variant === "page") {
    return (
      <header className={styles.topBar}>
        <div className={styles.left}>
          <button className={styles.backBtn} onClick={onBack} aria-label="뒤로가기">
            <span className={styles.backIcon}>‹</span>
          </button>
        </div>

        <span className={styles.pageTitle}>{title}</span>

        <div className={styles.right}>
          <div className={styles.rightAction}>
            {rightAction}
            {authAction}
          </div>
        </div>
      </header>
    );
  }

  if (variant === "section") {
    return (
      <header className={styles.topBar}>
        <div className={styles.left}>
          <button className={styles.burger} onClick={openDrawer} aria-label="메뉴">
            <span /><span /><span />
          </button>
        </div>

        <span className={styles.pageTitle}>{title}</span>

        <div className={styles.right}>
          <div className={styles.rightAction}>{rightAction}{authAction}</div>
        </div>
      </header>
    );
  }

  return (
    <header className={styles.topBar}>
      <div className={styles.left}>
        <button className={styles.burger} onClick={openDrawer} aria-label="메뉴">
          <span /><span /><span />
        </button>
      </div>

      <Link to="/" className={styles.logo}>
        ⚾&nbsp;&nbsp;컴프야펀
      </Link>

      <div className={styles.right}>{authAction}</div>
    </header>
  );
};

export default TopBar;
