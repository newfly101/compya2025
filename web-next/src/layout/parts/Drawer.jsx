"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Drawer.module.scss";
import { MENU_GROUPS, ADMIN_MENU_GROUPS } from "@/layout/menuGroups.js";
import { useDrawer } from "@/layout/DrawerContext.jsx";
import PinnedBadge from "@/global/ui/badge/PinnedBadge.jsx";
import { Avatar, pickProfileImageSrc } from "@/global/ui/avatar";
import { ROUTE_PATHS } from "@/config/routePath.js";
import { useAuthentication } from "@/domains/authentication/hooks/useAuthentication.js";
import { useLoginRequiredModal } from "@/domains/authentication/hooks/useLoginRequiredModal.jsx";
import DrawerProfile from "@/domains/gamification/mobile/containers/public/DrawerProfile.jsx";
import { useLayoutStore } from "@/store/layoutStore.js";

// 메뉴 링크는 닫힌 상태에서도 DOM 에 있다(SSR HTML → 크롤러 내부 링크). 숨김은 CSS translate, 포커스 차단은 inert.
// 로그인 영역(프로필·로그인 모달) · loginRequired 비로그인 클릭 차단 · 접힘 상태 sessionStorage · admin 메뉴.
// TODO(next-migration): RenewalNoticeModal(comingSoon 메뉴) — 지금 메뉴에 comingSoon 항목이 없어 미이전
const Drawer = () => {
  const { isOpen, close } = useDrawer();
  const pathname = usePathname();
  const { user, isAuthenticated, isAdmin, initialized, login } = useAuthentication();
  const { askLogin, loginModal } = useLoginRequiredModal();
  const collapsedIds = useLayoutStore((s) => s.drawerCollapsed);
  const toggleGroup = useLayoutStore((s) => s.toggleGroup);
  const collapsed = new Set(collapsedIds);

  // 접힘 상태는 마운트 뒤에 복원한다 — 서버 HTML(모두 펼침)과 첫 렌더를 맞추기 위해
  useEffect(() => {
    useLayoutStore.persist.rehydrate();
  }, []);

  // 로그인 필요(loginRequired) 메뉴를 비로그인이 누르면 이동을 막고 안내 모달을 띄운다. 서랍도 함께 닫는다.
  const getClickHandler = (item) => {
    if (item.loginRequired && !isAuthenticated) {
      return (e) => {
        e.preventDefault();
        close();
        askLogin(item.loginReason);
      };
    }
    return close;
  };

  const tag = (item) =>
    item.tag && (
      <span className={styles.menuTag}>
        <PinnedBadge variant={item.tag.variant} label={item.tag.label} />
      </span>
    );

  const renderLink = (item, sub = false) => (
    <li key={item.id ?? item.to}>
      <Link
        href={item.to}
        className={`${styles.menuItem} ${sub ? styles.menuSub : ""} ${pathname === item.to ? styles.menuItemActive : ""}`}
        onClick={getClickHandler(item)}
      >
        <span className={styles.menuIcon}>{item.icon}</span>
        <span className={styles.menuLabel}>{item.label}</span>
        {item.loginRequired && !isAuthenticated && <span className={styles.menuLock} aria-label="로그인 필요">🔒</span>}
        {tag(item)}
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
          {tag(item)}
          <span className={styles.menuChevron} aria-hidden="true">{open ? "▾" : "▸"}</span>
        </button>
        {/* 접어도 DOM 에는 남긴다(hidden) */}
        <ul id={`drawer-${item.id}`} className={styles.menuList} hidden={!open}>
          {item.children.map((c) => renderLink(c, true))}
        </ul>
      </li>
    );
  };

  return (
    <>
      <div className={`${styles.overlay} ${isOpen ? styles.overlayVisible : ""}`} onClick={close} />
      <aside className={`${styles.drawer} ${isOpen ? styles.drawerOpen : ""}`} inert={!isOpen}>
        {/* 유저 프로필 — 로그인 상태일 때는 박스 자체가 마이페이지 진입점이다. 로그아웃은 상단바 소유. */}
        {user ? (
          <Link
            href={ROUTE_PATHS.mypage}
            className={`${styles.profile} ${styles.profileLink} ${styles.profileTier}`}
            onClick={close}
          >
            <DrawerProfile
              avatar={<Avatar src={pickProfileImageSrc(user)} nickname={user?.nickname} size={48} alt="" />}
              nickname={user?.nickname}
            />
          </Link>
        ) : !initialized ? (
          <div className={styles.profile} aria-hidden="true" />
        ) : (
          <div className={styles.profile}>
            <div className={styles.guestInfo}>
              <span className={styles.guestTitle}>로그인하고 더 많은 컨텐츠 이용하기!</span>
              <button type="button" className={styles.loginBtn} onClick={login}>N 네이버 로그인</button>
            </div>
          </div>
        )}

        <nav className={styles.nav} aria-label="메뉴">
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
      {loginModal}
    </>
  );
};

export default Drawer;
