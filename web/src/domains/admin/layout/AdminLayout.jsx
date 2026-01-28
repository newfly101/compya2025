import React from "react";
import { Outlet, NavLink } from "react-router-dom";
import styles from "./AdminLayout.module.scss";
import { AdminNavigation } from "@/domains/admin/config/AdminNavigation.js";


const AdminLayout = () => {
  return (
    <section className={styles.container}>
      <header className={styles.adminBar}>
        <span className={styles.label}>빠른 이동</span>

        <nav className={styles.adminNav}>
          {AdminNavigation.map((item, index) => (
            <NavLink
              className={({ isActive }) => isActive ? styles.active : undefined}
              key={index}
              to={item.url}
              end={item.end}
            >
              {item.name}
            </NavLink>
          ))}
        </nav>
      </header>

      <section className={styles.content}>
        <Outlet />
      </section>

    </section>
  );
};

export default AdminLayout;
