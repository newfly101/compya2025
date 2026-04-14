// src/domains/mobile/components/TopBar/TopBar.jsx
import { Link } from "react-router-dom";
import styles from "./TopBar.module.scss";

/**
 * C/TopBar — 모바일 공통 상단바
 * variant: "home" | "page"
 *   home → 버거 + 로고 + 로그인 버튼
 *   page → 뒤로가기 + 타이틀 + 우측 액션(optional)
 */
const TopBar = ({
                  variant = "home",
                  title,
                  onBurger,
                  onBack,
                  rightAction,
                  isLoggedIn = false,
                  onLogin,
                }) => {
  if (variant === "page") {
    return (
      <header className={styles.topbar}>
        <button className={styles.backBtn} onClick={onBack} aria-label="뒤로가기">
          <span className={styles.backIcon}>‹</span>
        </button>
        {title && <span className={styles.pageTitle}>{title}</span>}
        {rightAction && <div className={styles.rightAction}>{rightAction}</div>}
      </header>
    );
  }

  return (
    <header className={styles.topbar}>
      {/* 버거 메뉴 */}
      <button className={styles.burger} onClick={onBurger} aria-label="메뉴">
        <span />
        <span />
        <span />
      </button>

      {/* 로고 */}
      <Link to="/" className={styles.logo}>
        ⚾&nbsp;&nbsp;컴프야펀
      </Link>

      {/* 로그인 버튼 */}
      {!isLoggedIn && (
        <button className={styles.loginBtn} onClick={onLogin}>
          N&nbsp;네이버 로그인
        </button>
      )}
    </header>
  );
};

export default TopBar;
