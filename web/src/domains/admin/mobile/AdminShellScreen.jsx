// AdminShellScreen.jsx — 어드민 단일 셸.
// /admin, /admin/:tab 모두 이 화면 하나를 렌더링하고 상단 탭으로 내부 전환한다.
// (근거: docs/domain/admin/design/_redesign-spec.md § 라우팅 변경안)
//
// 탭 전환은 navigate() 로 주소도 함께 바꾼다 — 새로고침/뒤로가기에서도 같은 탭이 유지되고,
// home ↔ 다른 탭 전환은 서로 다른 라우트 엔트리라 화면이 리마운트되며,
// 그 리마운트 자체가 검색어/칩/선택 상태를 자연히 초기화한다.
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDomainTopBar } from "@/app/wrapper/mobile/hooks/useDomainTopBar.js";
import { useAuthentication } from "@/domains/authentication/hooks/useAuthentication.js";
import { ROUTE_META } from "@/app/router/config/routeMeta.js";
import { ADMIN_TABS } from "@/domains/admin/mobile/ADMIN_TABS.js";
import AdminHomeTab from "@/domains/admin/mobile/components/adminHomeTab/AdminHomeTab.jsx";
import AdminCouponScreen from "@/domains/coupons/mobile/admin/AdminCouponScreen.jsx";
import AdminQuizScreen from "@/domains/quiz/mobile/admin/AdminQuizScreen.jsx";
import AdminEventScreen from "@/domains/events/mobile/admin/AdminEventScreen.jsx";
import AdminNoticeScreen from "@/domains/notices/mobile/admin/AdminNoticeScreen.jsx";
import AdminUserScreen from "@/domains/users/mobile/admin/AdminUserScreen.jsx";
import "@/global/ui/admin/admin.tokens.scss";
import styles from "./AdminShellScreen.module.scss";

const TAB_KEYS = ADMIN_TABS.map((t) => t.key);

export default function AdminShellScreen() {
  const navigate = useNavigate();
  const { tab: tabParam } = useParams();
  const { logout } = useAuthentication();

  // 모르는 탭 키(오타/구주소)는 조용히 홈으로 흡수 — 빈 화면 대신 항상 뭔가는 보여준다.
  const activeTab = TAB_KEYS.includes(tabParam) ? tabParam : "home";

  useDomainTopBar({
    title: "컴프야펀 Admin",
    rightAction: (
      <button type="button" className={styles.logoutBtn} onClick={logout}>
        로그아웃
      </button>
    ),
  });

  // 브라우저 탭 제목만 활성 탭에 맞춰 갱신 — 상단바 제목("컴프야펀 Admin")은 고정.
  useEffect(() => {
    const label = ADMIN_TABS.find((t) => t.key === activeTab)?.label;
    document.title = ROUTE_META.ADMIN.title(activeTab === "home" ? null : label);
  }, [activeTab]);

  const handleTabClick = (key) => {
    navigate(key === "home" ? "/admin" : `/admin/${key}`, { replace: true });
  };

  return (
    <div className={styles.page}>
      <nav className={styles.tabBar} aria-label="어드민 탭">
        {ADMIN_TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            className={`${styles.tabItem} ${activeTab === t.key ? styles.active : ""}`}
            aria-current={activeTab === t.key ? "page" : undefined}
            onClick={() => handleTabClick(t.key)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className={styles.content}>
        {activeTab === "home" && <AdminHomeTab onNavigateTab={handleTabClick} />}
        {activeTab === "quiz" && <AdminQuizScreen />}
        {activeTab === "event" && <AdminEventScreen />}
        {activeTab === "coupon" && <AdminCouponScreen />}
        {activeTab === "notice" && <AdminNoticeScreen />}
        {activeTab === "user" && <AdminUserScreen />}
      </div>
    </div>
  );
}
