import React from "react";
import { Outlet, NavLink } from "react-router-dom";
import styles from "./AdminPageLayout.module.scss";

// 글로벌 admin layout 네비게이션 menu 정의 (이전: web/src/domains/admin/config/AdminNavigation.js — 2026-05-09 폐기 후 본 layout 으로 흡수)
const AdminNavigation = [
  { url: "/admin", name: "대시보드@", end: true },
  { url: "/admin/content/notice", name: "공지 관리@" },
  { url: "/admin/content/event", name: "이벤트 관리" },
  { url: "/admin/content/coupon", name: "쿠폰 관리" },
  { url: "/admin/users", name: "유저 관리@" },
  // community 도메인 정리 보류 — 2026-05-09 (기획 IA 작업 후 재개. docs/prd/domains/community.md TODO 참조)
  // { url: "/admin/community", name: "게시판 관리@" },
  { url: "/admin/content/player", name: "선수 카드 관리@" },
  { url: "/admin/content/quiz", name: "퀴즈 관리" },
];

const AdminPageLayout = () => {
  return (
    <section className={styles.adminLayoutWrapper}>

      <header className={styles.adminLayoutBar}>
        <div className={styles.adminLayoutBarInner}>

          <span className={styles.adminLayoutLabel}>
            빠른 이동
          </span>

          <nav className={styles.adminLayoutNav}>
            {AdminNavigation.map((item, index) => (
              <NavLink
                key={index}
                to={item.url}
                end={item.end}
                className={({ isActive }) =>
                  isActive
                    ? `${styles.adminLayoutNavItem} ${styles.isActive}`
                    : styles.adminLayoutNavItem
                }
              >
                {item.name}
              </NavLink>
            ))}
          </nav>

        </div>
      </header>

      <section className={styles.adminLayoutContent}>
        <Outlet />
      </section>

    </section>
  );
};

export default AdminPageLayout;
