"use client";
import { memo, useMemo } from "react";
import Link from "next/link";
import styles from "./Drawer.module.scss";
import { MENU_GROUPS, ADMIN_MENU_GROUPS } from "@/components/layout/menuGroups.js";
import PinnedBadge from "@/components/badge/PinnedBadge.jsx";
import { useLayoutStore } from "@/stores/layoutStore.js";

const tag = (item) =>
  item.tag && (
    <span className={styles.menuTag}>
      <PinnedBadge variant={item.tag.variant} label={item.tag.label} />
    </span>
  );

// 메뉴 트리 — 서랍 열림(isOpen)·프로필 변화로는 다시 그리지 않는다(props 는 모두 안정 값).
// onNavigate · onLoginRequired 는 Drawer 가 참조 고정해서 넘긴다.
const DrawerMenu = ({ isAdmin, isAuthenticated, pathname, collapsedIds, onNavigate, onLoginRequired }) => {
  const toggleGroup = useLayoutStore((s) => s.toggleGroup);
  const collapsed = useMemo(() => new Set(collapsedIds), [collapsedIds]);
  const groups = useMemo(() => [...MENU_GROUPS, ...(isAdmin ? ADMIN_MENU_GROUPS : [])], [isAdmin]);

  // 로그인 필요(loginRequired) 메뉴를 비로그인이 누르면 이동을 막고 안내 모달을 띄운다. 서랍도 함께 닫는다.
  const getClickHandler = (item) => {
    if (item.loginRequired && !isAuthenticated) {
      return (e) => {
        e.preventDefault();
        onNavigate();
        onLoginRequired(item.loginReason);
      };
    }
    return onNavigate;
  };

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
        <nav className={styles.nav} aria-label="메뉴">
          {groups.map((group) => (
            <div key={group.label} className={styles.group}>
              <span className={styles.groupLabel}>{group.label}</span>
              <ul className={styles.menuList}>
                {group.items.map((item) => (item.children ? renderGroupRow(item) : renderLink(item)))}
              </ul>
            </div>
          ))}
        </nav>
  );
};

export default memo(DrawerMenu);
