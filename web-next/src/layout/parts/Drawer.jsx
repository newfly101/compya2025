"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Drawer.module.scss";
import { MENU_GROUPS } from "@/layout/menuGroups.js";
import { useDrawer } from "@/layout/DrawerContext.jsx";
import PinnedBadge from "@/global/ui/badge/PinnedBadge.jsx";

// 메뉴 링크는 닫힌 상태에서도 DOM 에 있다(SSR HTML → 크롤러 내부 링크). 숨김은 CSS translate, 포커스 차단은 inert.
// TODO(next-migration): 로그인 영역(프로필·로그인 모달)·loginRequired 클릭 차단·접힘 상태 sessionStorage 저장·admin 메뉴 — Redux/Auth 의존
const Drawer = () => {
  const { isOpen, close } = useDrawer();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(() => new Set());

  const toggleGroup = (id) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (!next.delete(id)) next.add(id);
      return next;
    });

  const tag = (item) =>
    item.tag && (
      <span className={styles.menuTag}>
        <PinnedBadge variant={item.tag.variant} label={item.tag.label} />
      </span>
    );

  const renderLink = (item, sub = false) => (
    <li key={item.to}>
      <Link
        href={item.to}
        className={`${styles.menuItem} ${sub ? styles.menuSub : ""} ${pathname === item.to ? styles.menuItemActive : ""}`}
        onClick={close}
      >
        <span className={styles.menuIcon}>{item.icon}</span>
        <span className={styles.menuLabel}>{item.label}</span>
        {item.loginRequired && <span className={styles.menuLock} aria-label="로그인 필요">🔒</span>}
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
        <div className={styles.profile}>
          <div className={styles.guestInfo}>
            <span className={styles.guestTitle}>로그인하고 더 많은 컨텐츠 이용하기!</span>
            <button type="button" className={styles.loginBtn}>N 네이버 로그인</button>
          </div>
        </div>

        <nav className={styles.nav} aria-label="메뉴">
          {MENU_GROUPS.map((group) => (
            <div key={group.label} className={styles.group}>
              <span className={styles.groupLabel}>{group.label}</span>
              <ul className={styles.menuList}>
                {group.items.map((item) => (item.children ? renderGroupRow(item) : renderLink(item)))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Drawer;
