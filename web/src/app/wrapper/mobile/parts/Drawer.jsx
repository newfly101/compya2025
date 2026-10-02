// src/app/wrapper/mobile/parts/Drawer.jsx
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTopBar } from "@/app/provider/TopBarProvider";
import styles from "./Drawer.module.scss";
import { MENU_GROUPS, ADMIN_MENU_GROUPS } from "@/app/wrapper/mobile/config/MENU_GROUPS.js";
import { useAuthentication } from "@/domains/authentication/hooks/useAuthentication.js";
import { RenewalNoticeModal } from "@/global/ui/renewalNoticeModal";
import { useLoginRequiredModal } from "@/domains/authentication/hooks/useLoginRequiredModal.jsx";
import PinnedBadge from "@/global/ui/badge/PinnedBadge.jsx";
import { Avatar, pickProfileImageSrc } from "@/global/ui/avatar";
import { ROUTE_PATHS } from "@/app/router/config/routePath.js";


const COLLAPSED_KEY = "drawerCollapsed";

const Drawer = () => {
  const { isDrawerOpen, closeDrawer } = useTopBar();
  const location = useLocation();
  const { user, isAuthenticated, isAdmin, login } = useAuthentication();
  const { askLogin, loginModal } = useLoginRequiredModal();
  const [renewalOpen, setRenewalOpen] = useState(false);
  // 접이식 부모 행(id)별 접힘 상태 — 탭을 닫으면 다시 펼침 (sessionStorage, REQ-HM-15)
  const [collapsed, setCollapsed] = useState(() => new Set(JSON.parse(sessionStorage.getItem(COLLAPSED_KEY) ?? "[]")));


  // 폐기 도메인 (comingSoon) 클릭 시 navigate 차단 + 모달 표시. drawer 도 함께 닫음.
  const handleComingSoonClick = (e) => {
    e.preventDefault();
    closeDrawer();
    setRenewalOpen(true);
  };

  // 로그인 필요 (loginRequired) 메뉴, 비로그인 클릭 시 navigate 차단 + 안내 모달 표시. drawer 도 함께 닫음.
  const getClickHandler = (item) => {
    if (item.comingSoon) return handleComingSoonClick;
    if (item.loginRequired && !isAuthenticated) {
      return (e) => {
        e.preventDefault();
        closeDrawer();
        askLogin(item.loginReason);
      };
    }
    return closeDrawer;
  };

  const toggleGroup = (id) => {
    const next = new Set(collapsed);
    if (!next.delete(id)) next.add(id);
    sessionStorage.setItem(COLLAPSED_KEY, JSON.stringify([...next]));
    setCollapsed(next);
  };

  const renderLink = (item, sub = false) => (
    <li key={item.to}>
      <Link
        to={item.to}
        className={`${styles.menuItem} ${sub ? styles.menuSub : ""} ${location.pathname === item.to ? styles.menuItemActive : ""}`}
        onClick={getClickHandler(item)}
      >
        <span className={styles.menuIcon}>{item.icon}</span>
        <span className={styles.menuLabel}>{item.label}</span>
        {item.loginRequired && !isAuthenticated && <span className={styles.menuLock} aria-label="로그인 필요">🔒</span>}
        {item.tag && (
          <span className={styles.menuTag}>
            <PinnedBadge variant={item.tag.variant} label={item.tag.label} />
          </span>
        )}
      </Link>
    </li>
  );

  const renderGroupRow = (item) => {
    const open = !collapsed.has(item.id);
    return (
      <li key={item.id}>
        <button
          type="button"
          className={styles.menuItem}
          aria-expanded={open}
          aria-controls={`drawer-${item.id}`}
          onClick={() => toggleGroup(item.id)}
        >
          <span className={styles.menuIcon}>{item.icon}</span>
          <span className={styles.menuLabel}>{item.label}</span>
          {item.tag && (
            <span className={styles.menuTag}>
              <PinnedBadge variant={item.tag.variant} label={item.tag.label} />
            </span>
          )}
          <span className={styles.menuChevron} aria-hidden="true">{open ? "▾" : "▸"}</span>
        </button>
        {open && <ul id={`drawer-${item.id}`} className={styles.menuList}>{item.children.map((c) => renderLink(c, true))}</ul>}
      </li>
    );
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
                {group.items.map((item) => (item.children ? renderGroupRow(item) : renderLink(item)))}
              </ul>
            </div>
          ))}
        </nav>

      </aside>

      <RenewalNoticeModal
        isOpen={renewalOpen}
        onClose={() => setRenewalOpen(false)}
      />
      {loginModal}
    </>
  );
};

export default Drawer;
