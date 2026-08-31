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
import { useMenuCounts } from "@/app/wrapper/mobile/hooks/useMenuCounts.js";


const Drawer = () => {
  const { isDrawerOpen, closeDrawer } = useTopBar();
  const location = useLocation();
  const { user, isAuthenticated, isAdmin, login, logout } = useAuthentication();
  const [renewalOpen, setRenewalOpen] = useState(false);
  const [loginRequiredOpen, setLoginRequiredOpen] = useState(false);
  const menuCounts = useMenuCounts();

  // to 경로 → 동적 카운트 매핑
  const getDynamicBadge = (to) => {
    if (to === "/notices") return menuCounts.notices;
    if (to === "/events")  return menuCounts.events;
    if (to === "/coupons") return menuCounts.coupons;
    return null;
  };

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

        {/* 유저 프로필
            로그인 상태일 때 로그아웃 버튼 노출 — TopBar 는 variant 가 page/section 일 때
            우측 액션이 다른 기능으로 바뀌어 로그아웃 진입점이 사라지므로, 그 공백을 Drawer 에서 메운다. */}
        {user ?
          <div className={styles.profile}>
            <div className={styles.avatar}>
              <img src={user?.profileImage} alt="" />
            </div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{user?.nickname}</span>
              <span className={styles.userStatus}>{user?.email}</span>
            </div>
            <button className={styles.logoutBtn} onClick={logout}>로그아웃</button>
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
                        {item.tag && <PinnedBadge variant={item.tag} />}
                        {(() => {
                          const badge = getDynamicBadge(item.to) ?? item.badge;
                          return badge ? <span className={styles.badge}>{badge}</span> : null;
                        })()}
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
