// src/app/wrapper/mobile/parts/Drawer.jsx
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTopBar } from "@/app/provider/TopBarProvider";
import styles from "./Drawer.module.scss";
import { MENU_GROUPS, ADMIN_MENU_GROUPS } from "@/app/wrapper/mobile/config/MENU_GROUPS.js";
import { useAuthentication } from "@/domains/authentication/hooks/useAuthentication.js";
import { RenewalNoticeModal } from "@/global/ui/renewalNoticeModal";
import { LoginRequiredModal } from "@/global/ui/loginRequiredModal";
import PinnedBadge from "@/global/ui/badge/PinnedBadge.jsx";
import { Avatar, pickProfileImageSrc } from "@/global/ui/avatar";
import { ROUTE_PATHS } from "@/app/router/config/routePath.js";


const Drawer = () => {
  const { isDrawerOpen, closeDrawer } = useTopBar();
  const location = useLocation();
  const { user, isAuthenticated, isAdmin, login } = useAuthentication();
  const [renewalOpen, setRenewalOpen] = useState(false);
  const [loginRequiredOpen, setLoginRequiredOpen] = useState(false);


  // 폐기 도메인 (comingSoon) 클릭 시 navigate 차단 + 모달 표시. drawer 도 함께 닫음.
  const handleComingSoonClick = (e) => {
    e.preventDefault();
    closeDrawer();
    setRenewalOpen(true);
  };

  // 로그인 필요 (loginRequired) 메뉴, 비로그인 클릭 시 navigate 차단 + 안내 모달 표시. drawer 도 함께 닫음.
  const handleLoginRequiredClick = (e) => {
    e.preventDefault();
    closeDrawer();
    setLoginRequiredOpen(true);
  };

  const getClickHandler = (item) => {
    if (item.comingSoon) return handleComingSoonClick;
    if (item.loginRequired && !isAuthenticated) return handleLoginRequiredClick;
    return closeDrawer;
  };

  return (
    <>
      {/* 오버레이 */}
      <div
        className={`${styles.overlay} ${isDrawerOpen ? styles.overlayVisible : ""}`}
        onClick={closeDrawer}
      />

      {/* 패널 */}
      <aside className={`${styles.drawer} ${isDrawerOpen ? styles.drawerOpen : ""}`}>

        {/* 유저 프로필 — 로그인 상태일 때는 박스 자체가 마이페이지 진입점이다.
            로그아웃은 TopBar 쪽 진입점을 그대로 쓴다(여기서는 만들지 않는다). */}
        {user ?
          <Link
            to={ROUTE_PATHS.mypage}
            className={`${styles.profile} ${styles.profileLink}`}
            onClick={closeDrawer}
          >
            <Avatar src={pickProfileImageSrc(user)} nickname={user?.nickname} size={44} alt="" />
            <div className={styles.userInfo}>
              <span className={styles.userName}>{user?.nickname}</span>
              <span className={styles.userStatus}>{user?.email}</span>
            </div>
            <span className={styles.profileChevron}>›</span>
          </Link>
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

        {/* 메뉴 그룹 (admin 일 때 ADMIN_MENU_GROUPS append) */}
        <nav className={styles.nav}>
          {[...MENU_GROUPS, ...(isAdmin ? ADMIN_MENU_GROUPS : [])].map((group) => (
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
                        onClick={getClickHandler(item)}
                      >
                        <span className={styles.menuIcon}>{item.icon}</span>
                        <span className={styles.menuLabel}>{item.label}</span>
                        {item.tag && (
                          <span className={styles.menuTag}>
                            <PinnedBadge variant={item.tag.variant} label={item.tag.label} />
                          </span>
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

      <RenewalNoticeModal
        isOpen={renewalOpen}
        onClose={() => setRenewalOpen(false)}
      />
      <LoginRequiredModal
        isOpen={loginRequiredOpen}
        onClose={() => setLoginRequiredOpen(false)}
        onLogin={login}
      />
    </>
  );
};

export default Drawer;
