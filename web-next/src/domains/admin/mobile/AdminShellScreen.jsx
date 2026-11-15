"use client";
// 어드민 단일 셸 — /admin, /admin/[tab] 모두 이 화면 하나를 렌더링하고 상단 탭으로 내부 전환한다.
// 탭 전환은 주소도 함께 바꾼다(새로고침·뒤로가기에서도 같은 탭 유지). home ↔ 다른 탭은 서로 다른 페이지라 리마운트되고,
// 그 리마운트가 검색어·칩·선택 상태를 자연히 초기화한다. 상단바는 페이지(PageShell)가 소유한다.
import { useParams, useRouter } from "next/navigation";
import { ADMIN_TABS } from "@/domains/admin/mobile/ADMIN_TABS.js";
import { ADMIN_PATHS } from "@/domains/admin/config/adminPaths.js";
import { useAdminCounts } from "@/domains/admin/mobile/hooks/useAdminCounts.js";
import AdminHomeTab from "@/domains/admin/mobile/components/adminHomeTab/AdminHomeTab.jsx";
import AdminCacheSyncTab from "@/domains/admin/mobile/components/adminCacheSyncTab/AdminCacheSyncTab.jsx";
import AdminAnalyticsTab from "@/domains/admin/mobile/components/adminAnalyticsTab/AdminAnalyticsTab.jsx";
import AdminCouponScreen from "@/domains/coupons/mobile/admin/AdminCouponScreen.jsx";
import AdminQuizScreen from "@/domains/quiz/mobile/admin/AdminQuizScreen.jsx";
import AdminEventScreen from "@/domains/events/mobile/admin/AdminEventScreen.jsx";
import AdminNoticeScreen from "@/domains/notices/mobile/admin/AdminNoticeScreen.jsx";
import AdminUserScreen from "@/domains/users/mobile/admin/AdminUserScreen.jsx";
import "@/global/ui/admin/admin.tokens.scss";
import styles from "./AdminShellScreen.module.scss";

const TAB_KEYS = ADMIN_TABS.map((t) => t.key);

export default function AdminShellScreen() {
  const router = useRouter();
  const { tab: tabParam } = useParams();
  // 셸이 살아 있는 동안 6개 목록을 한 번만 불러와 탭 배지 건수로 쓴다(각 탭 화면과 같은 query 키를 공유).
  const { counts, lists } = useAdminCounts();

  // 모르는 탭 키(오타·구주소)는 조용히 홈으로 흡수 — 빈 화면 대신 항상 뭔가는 보여준다.
  const activeTab = TAB_KEYS.includes(tabParam) ? tabParam : "home";

  const handleTabClick = (key) => {
    router.replace(key === "home" ? ADMIN_PATHS.admin : ADMIN_PATHS.admin_tab(key));
  };

  return (
    <div className={styles.page}>
      <nav className={styles.tabBar} aria-label="어드민 탭">
        {ADMIN_TABS.map((t) => {
          // 홈 탭은 배지가 없다. 건수를 아직 못 구했으면(null) 배지를 아예 숨긴다.
          const count = t.key === "home" ? null : counts[t.key];
          return (
            <button
              key={t.key}
              type="button"
              className={`${styles.tabItem} ${activeTab === t.key ? styles.active : ""}`}
              aria-current={activeTab === t.key ? "page" : undefined}
              onClick={() => handleTabClick(t.key)}
            >
              {t.label}
              {count != null && <span className={styles.tabBadge}>{count}</span>}
            </button>
          );
        })}
      </nav>

      <div className={styles.content}>
        {activeTab === "home" && <AdminHomeTab onNavigateTab={handleTabClick} counts={counts} lists={lists} />}
        {activeTab === "quiz" && <AdminQuizScreen />}
        {activeTab === "event" && <AdminEventScreen />}
        {activeTab === "coupon" && <AdminCouponScreen />}
        {activeTab === "notice" && <AdminNoticeScreen />}
        {activeTab === "user" && <AdminUserScreen />}
        {activeTab === "stats" && <AdminAnalyticsTab />}
        {activeTab === "sync" && <AdminCacheSyncTab />}
      </div>
    </div>
  );
}
