// src/app/wrapper/mobile/parts/TopBar.jsx
import { Link } from "react-router-dom";
import { useTopBar } from "@/app/provider/TopBarProvider";
import styles from "./TopBar.module.scss";

const TopBar = () => {
  const { config, openDrawer } = useTopBar();
  const { variant, title, rightAction, onBack } = config;

  // 로그인 상태 — 추후 zustand store로 교체
  const isLoggedIn = false;

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
          {rightAction && rightAction}
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

      <div className={styles.right}>
        {!isLoggedIn && (
          <button className={styles.loginBtn}>
            N&nbsp;네이버 로그인
          </button>
        )}
      </div>
    </header>
  );
};

export default TopBar;
