import React, { useState } from "react";
import styles from "./QuickSection.module.scss";
import { Link } from "react-router-dom";
import { QUICK_LABELS } from "@/domains/home/config/quickShortcuts.js";
import { useQuickShortcuts } from "@/domains/home/hooks/useQuickShortcuts.js";
import { ROUTE_PATHS } from "@/app/router/config/routePath.js";
import { RenewalNoticeModal } from "@/global/ui/renewalNoticeModal";
import { useLoginRequiredModal } from "@/domains/authentication/hooks/useLoginRequiredModal.jsx";

const QuickSection = () => {
  const { isAuthenticated, items } = useQuickShortcuts();
  const { askLogin, loginModal } = useLoginRequiredModal();
  const [renewalOpen, setRenewalOpen] = useState(false);

  // 폐기 도메인 (comingSoon) 클릭 시 navigate 차단 + 모달 표시
  const handleComingSoonClick = (e) => {
    e.preventDefault();
    setRenewalOpen(true);
  };

  // 로그인 필요 (loginRequired) 메뉴, 비로그인 클릭 시 navigate 차단 + 공용 안내 모달 표시
  const getClickHandler = (menu) => {
    if (menu.comingSoon) return handleComingSoonClick;
    if (menu.loginRequired && !isAuthenticated) {
      return (e) => {
        e.preventDefault();
        askLogin(menu.loginReason);
      };
    }
    return undefined;
  };

  return (
    <section className={styles.quickMenu} aria-label="바로가기">
      {isAuthenticated && (
        <div className={styles.head}>
          <span className={styles.headTitle}>{`바로가기 ${items.length}`}</span>
          <Link to={ROUTE_PATHS.home_shortcuts} className={styles.edit}>편집</Link>
        </div>
      )}
      <div className={styles.grid}>
        {items.map((menu) => (
          <Link
            key={menu.key}
            to={menu.to}
            className={styles.quickItem}
            onClick={getClickHandler(menu)}
          >
            <div className={styles.quickIcon}>{menu.icon}</div>
            <span className={styles.quickLabel}>{QUICK_LABELS[menu.key] ?? menu.label}</span>
          </Link>
        ))}
      </div>
      <RenewalNoticeModal
        isOpen={renewalOpen}
        onClose={() => setRenewalOpen(false)}
      />
      {loginModal}
    </section>
  );
};

export default QuickSection;
