"use client";
import Link from "next/link";
import styles from "./QuickSection.module.scss";
import { QUICK_LABELS } from "@/domains/home/config/quickShortcuts.js";
import { useQuickShortcuts } from "@/domains/home/hooks/useQuickShortcuts.js";
import { ROUTE_PATHS } from "@/config/routePath.js";
import { useLoginRequiredModal } from "@/domains/authentication/hooks/useLoginRequiredModal.jsx";

// 서버 HTML 은 비로그인 기본 구성(세션 확인 전 = isAuthenticated false)과 같다 → hydration 일치.
// 로그인 사용자의 저장 구성·"편집" 줄은 세션 확인 뒤에 바뀐다.
const QuickSection = () => {
  const { initialized, isAuthenticated, items } = useQuickShortcuts();
  const { askLogin, loginModal } = useLoginRequiredModal();

  // TODO(next-migration): comingSoon 항목용 RenewalNoticeModal 미이전 (현재 서랍 메뉴에 comingSoon 항목 없음)
  const getClickHandler = (menu) => {
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
      {/* 세션 확인 전에는 "편집" 줄 자리를 비워 둬 로그인 사용자의 그리드가 밀리지 않게 한다 */}
      {!initialized && <div className={styles.head} aria-hidden="true" />}
      {isAuthenticated && (
        <div className={styles.head}>
          <span className={styles.headTitle}>{`바로가기 ${items.length}`}</span>
          <Link href={ROUTE_PATHS.home_shortcuts} className={styles.edit}>편집</Link>
        </div>
      )}
      <div className={styles.grid}>
        {items.map((menu) => (
          <Link key={menu.key} href={menu.to} className={styles.quickItem} onClick={getClickHandler(menu)}>
            <div className={styles.quickIcon}>{menu.icon}</div>
            <span className={styles.quickLabel}>{QUICK_LABELS[menu.key] ?? menu.label}</span>
          </Link>
        ))}
      </div>
      {loginModal}
    </section>
  );
};

export default QuickSection;
