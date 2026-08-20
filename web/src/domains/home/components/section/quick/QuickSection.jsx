import React, { useState } from "react";
import styles from "./QuickSection.module.scss";
import { Link } from "react-router-dom";
import { QUICK_MENUS } from "@/domains/home/config/QUICK_MENUS.js";
import { RenewalNoticeModal } from "@/global/ui/renewalNoticeModal";
import { LoginRequiredModal } from "@/global/ui/loginRequiredModal";
import { useAuthentication } from "@/domains/authentication/hooks/useAuthentication.js";

const QuickSection = () => {
  const { isAuthenticated, login } = useAuthentication();
  const [renewalOpen, setRenewalOpen] = useState(false);
  const [loginRequiredOpen, setLoginRequiredOpen] = useState(false);

  // 폐기 도메인 (comingSoon) 클릭 시 navigate 차단 + 모달 표시
  const handleComingSoonClick = (e) => {
    e.preventDefault();
    setRenewalOpen(true);
  };

  // 로그인 필요 (loginRequired) 메뉴, 비로그인 클릭 시 navigate 차단 + 안내 모달 표시
  const handleLoginRequiredClick = (e) => {
    e.preventDefault();
    setLoginRequiredOpen(true);
  };

  const getClickHandler = (menu) => {
    if (menu.comingSoon) return handleComingSoonClick;
    if (menu.loginRequired && !isAuthenticated) return handleLoginRequiredClick;
    return undefined;
  };

  return (
    <section className={styles.quickMenu}>
      {QUICK_MENUS.map((menu) => (
        <Link
          key={menu.id}
          to={menu.to}
          className={styles.quickItem}
          onClick={getClickHandler(menu)}
        >
          <div className={styles.quickIcon}>{menu.icon}</div>
          <span className={styles.quickLabel}>{menu.label}</span>
        </Link>
      ))}
      <RenewalNoticeModal
        isOpen={renewalOpen}
        onClose={() => setRenewalOpen(false)}
      />
      <LoginRequiredModal
        isOpen={loginRequiredOpen}
        onClose={() => setLoginRequiredOpen(false)}
        onLogin={login}
      />
    </section>
  );
};

export default QuickSection;
