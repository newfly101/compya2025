import React from "react";
import { Outlet, NavLink } from "react-router-dom";
import styles from "./AdminLayout.module.scss";
import { AdminNavigation } from "@/domains/admin/config/AdminNavigation.js";

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
