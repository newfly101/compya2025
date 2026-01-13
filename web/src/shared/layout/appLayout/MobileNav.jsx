import React from "react";
import { NavLink } from "react-router-dom";
import styles from "@/shared/layout/appLayout/MobileNav.module.scss";

const MobileNav = () => {
  const scrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <nav className={styles.mobileNav}>
      <NavLink to="/" end onClick={scrollTop}>
        홈
      </NavLink>

      <NavLink to="/tips" onClick={scrollTop}>
        팁
      </NavLink>

      <NavLink to="/notice" onClick={scrollTop}>
        공지사항
      </NavLink>

      <NavLink to="/notice?tab=coupons" onClick={scrollTop}>
        쿠폰
      </NavLink>

      <NavLink to="/dictionary" onClick={scrollTop}>
        스킬백과
      </NavLink>
    </nav>
  );
};

export default MobileNav;
