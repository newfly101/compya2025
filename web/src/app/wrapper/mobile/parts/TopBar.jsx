// src/app/wrapper/mobile/parts/TopBar.jsx
import { Link } from "react-router-dom";
import { useTopBar } from "@/app/provider/TopBarProvider";
import styles from "./TopBar.module.scss";
import { useAuthentication } from "@/domains/authentication/hooks/useAuthentication.js";

const TopBar = () => {
  const { config, openDrawer } = useTopBar();
  const { isAuthenticated, login, logout } = useAuthentication();
  const { variant, title, rightAction, onBack } = config;

  // page / section variant 는 이미 특정 화면 안이라 로그인 유도는 화면 본문이 담당.
  // 로그인 상태일 때만 로그아웃 진입점을 우측에 추가 노출한다 (rightAction 과 공존).
  const logoutAction = isAuthenticated && (
    <button
      type="button"
      className={styles.logoutIconBtn}
      onClick={logout}
      aria-label="로그아웃"
    >
      <span className={styles.logoutIcon}>⏻</span>
    </button>
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
          {(rightAction || logoutAction) && (
            <div className={styles.rightAction}>
              {rightAction}
              {logoutAction}
            </div>
          )}
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
          {(rightAction || logoutAction)
            ? <div className={styles.rightAction}>{rightAction}{logoutAction}</div>
            : <div className={styles.rightPlaceholder} aria-hidden="true" />
          }
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
