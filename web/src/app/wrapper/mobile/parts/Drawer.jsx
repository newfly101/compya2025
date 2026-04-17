// src/app/wrapper/mobile/parts/Drawer.jsx
import { Link, useLocation } from "react-router-dom";
import { useTopBar } from "@/app/provider/TopBarProvider";
import styles from "./Drawer.module.scss";
import { MENU_GROUPS } from "@/app/wrapper/mobile/config/MENU_GROUPS.js";
import { useAuthentication } from "@/domains/authentication/hooks/useAuthentication.js";


const Drawer = () => {
  const { isDrawerOpen, closeDrawer } = useTopBar();
  const location = useLocation();
  const { user, login } = useAuthentication();

  return (
    <>
      {/* 오버레이 */}
      <div
        className={`${styles.overlay} ${isDrawerOpen ? styles.overlayVisible : ""}`}
        onClick={closeDrawer}
      />

      {/* 패널 */}
      <aside className={`${styles.drawer} ${isDrawerOpen ? styles.drawerOpen : ""}`}>

        {/* 유저 프로필 */}
        {user ?
          <div className={styles.profile}>
            <div className={styles.avatar}>
              <img src={user?.profileImage} alt="" />
            </div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{user?.nickname}</span>
              <span className={styles.userStatus}>{user?.email}</span>
            </div>
          </div>
          :
          <div className={styles.profile}>
            <div className={styles.guestInfo}>
              <span className={styles.guestTitle}>로그인하고 더 많은 컨텐츠 이용하기!</span>
              <button className={styles.loginBtn} onClick={login}>
                N 네이버 로그인
              </button>
            </div>

          </div>
        }

        {/* 메뉴 그룹 */}
        <nav className={styles.nav}>
          {MENU_GROUPS.map((group) => (
            <div key={group.label} className={styles.group}>
              <span className={styles.groupLabel}>{group.label}</span>
              <ul className={styles.menuList}>
                {group.items.map((item) => {
                  const isActive = location.pathname === item.to;
                  return (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        className={`${styles.menuItem} ${isActive ? styles.menuItemActive : ""}`}
                        onClick={closeDrawer}
                      >
                        <span className={styles.menuIcon}>{item.icon}</span>
                        <span className={styles.menuLabel}>{item.label}</span>
                        {item.badge && (
                          <span className={styles.badge}>{item.badge}</span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

      </aside>
    </>
  );
};

export default Drawer;
