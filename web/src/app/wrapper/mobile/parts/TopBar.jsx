// src/app/wrapper/mobile/parts/TopBar.jsx
import { Link } from "react-router-dom";
import { useTopBar } from "@/app/provider/TopBarProvider";
import styles from "./TopBar.module.scss";
import { useAuthentication } from "@/domains/authentication/hooks/useAuthentication.js";

const TopBar = () => {
  const { config, openDrawer } = useTopBar();
  const { isAuthenticated, login, logout } = useAuthentication();
  const { variant, title, rightAction, onBack } = config;

  // page / section variant 는 이미 특정 화면 안이라 로그인 유도는 화면 본문이 담당하는 게 기본이지만,
  // 상단바 우측 슬롯은 home variant 와 동일하게 로그인 상태를 항상 노출한다.
  // 로그인 상태 → 로그아웃 아이콘 버튼(좁은 공간용), 비로그인 → home 과 동일한 네이버 로그인 버튼.
  const authAction = isAuthenticated ? (
    <button
      type="button"
      className={styles.logoutIconBtn}
      onClick={logout}
      aria-label="로그아웃"
    >
      {/* 전원 기호 U+23FB 는 기본 폰트 대부분에 글리프가 없어 두부(네모) 로 깨진다 — 인라인 SVG 로 고정 */}
      <svg className={styles.logoutIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor"
           strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <path d="M12 3v9" />
        <path d="M6.3 7A8 8 0 1 0 17.7 7" />
      </svg>
    </button>
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

      <div className={styles.right}>
        {isAuthenticated
          ? <button className={styles.logoutBtn} onClick={logout}>로그아웃</button>
          : <button className={styles.loginBtn} onClick={login}>N 네이버 로그인</button>
        }
      </div>
    </header>
  );
};

export default TopBar;
