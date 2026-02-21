import { Link } from "react-router-dom";
import styles from "./Header.module.scss";
import { useHeaderAuth } from "@/app/wrapper/parts/hooks/useHeaderAuth.js";
import { useHeaderNav } from "@/app/wrapper/parts/hooks/useHeaderNav.js";
import { useHeaderUI } from "@/app/wrapper/parts/hooks/useHeaderUI.js";

export default function Header() {
  const { isAuthenticated, user, authority, login, logout } = useHeaderAuth();
  const headerNav = useHeaderNav(isAuthenticated, authority);
  const { isOpen, isClosing, toggleMenu, closeMenu, onAnimationEnd } = useHeaderUI();

  return (
    <header className={styles.appHeader}>
      <div className={styles.appHeaderBar}>
        <div className={styles.appHeaderInner}>

          <div className={styles.appHeaderLeft}>
            <button
              className={styles.appHeaderBurger}
              onClick={toggleMenu}
            >
              ☰
            </button>

            <div className={styles.appHeaderNavGroup}>
              <nav className={styles.appHeaderNav}>
                {headerNav.map((item, i) => (
                  <Link key={`app-nav-${i}`} to={item.to}>{item.label}</Link>
                ))}
              </nav>
            </div>
          </div>

          <div className={styles.appHeaderAuth}>
            {!isAuthenticated ? (
              <button className={styles.appHeaderLoginBtn} onClick={login}></button>
            ) : (
              <div className={styles.appHeaderUser}>
                <span className={styles.appHeaderUserName}>{user?.nickName}</span>
                <button className={styles.appHeaderLogoutBtn} onClick={logout}>로그아웃</button>
              </div>
            )}
          </div>

        </div>
      </div>

      {isOpen && (
        <div className={styles.appHeaderOverlay} onClick={closeMenu}>
          <div
            className={`${styles.appHeaderPanel} ${
              isClosing ? styles.closing : styles.open
            }`}
            onClick={(e) => e.stopPropagation()}
            onAnimationEnd={onAnimationEnd}
          >
            <nav className={styles.appHeaderOverlayNav}>
              {headerNav.map((item, i) => (
                <Link
                  key={`overlay-nav-${i}`}
                  to={item.to}
                  onClick={closeMenu}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
