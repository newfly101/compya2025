import { Link } from "react-router-dom";
import styles from "./Header.module.scss";
import { useHeaderAuth } from "@/app/wrapper/parts/hooks/useHeaderAuth.js";
import { useHeaderNav } from "@/app/wrapper/parts/hooks/useHeaderNav.js";

export default function Header() {
  const {isAuthenticated, user, authority, login, logout} = useHeaderAuth();
  const headerNav = useHeaderNav(isAuthenticated, authority);

  return (
    <header className={styles.appHeader}>
      <div className={styles.appHeaderBar}>
        <div className={styles.appHeaderInner}>

          <div className={styles.appHeaderLeft}>
            <button
              className={styles.appHeaderBurger}
              // onClick={toggleMenu}
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

      {/*{menuOpen && (*/}
      {/*  <div className={styles.appHeaderOverlay}>*/}
      {/*    <nav className={styles.appHeaderOverlayNav}>*/}
      {/*      <Link to="/">홈</Link>*/}
      {/*      <Link to="/notice">공지</Link>*/}
      {/*      <Link to="/community">커뮤니티</Link>*/}
      {/*      <Link to="/dictionary">백과</Link>*/}
      {/*    </nav>*/}
      {/*  </div>*/}
      {/*)}*/}
    </header>
  );
}
