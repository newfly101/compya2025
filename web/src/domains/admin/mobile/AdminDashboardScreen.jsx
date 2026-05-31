// AdminDashboardScreen.jsx — admin entry (대시보드)
// /admin — admin 권한 사용자가 모든 관리 페이지의 진입점으로 사용.
// 각 admin 관리 화면의 back 버튼(<)이 이 화면으로 돌아옴.

import { useNavigate } from "react-router-dom";
import { useDomainTopBar } from "@/app/wrapper/mobile/hooks/useDomainTopBar";
import styles from "./AdminDashboardScreen.module.scss";

const ADMIN_MENUS = [
  { id: "coupon", icon: "🎫", label: "쿠폰\n관리",     to: "/admin/coupon" },
  { id: "event",  icon: "🎪", label: "이벤트\n관리",    to: "/admin/event"  },
  { id: "notice", icon: "📢", label: "공지\n관리",     to: "/admin/notice" },
  { id: "user",   icon: "👥", label: "유저\n관리",     to: "/admin/user"   },
  { id: "wiki",   icon: "📖", label: "백과사전\n관리", to: "/admin/wiki"   },
];

export default function AdminDashboardScreen() {
  useDomainTopBar("어드민 사이트 관리");
  const navigate = useNavigate();

  return (
    <main className={styles.page}>
      <div className={styles.grid}>
        {ADMIN_MENUS.map((m) => (
          <button
            key={m.id}
            type="button"
            className={styles.card}
            onClick={() => navigate(m.to)}
            aria-label={m.label.replace("\n", " ")}
          >
            <span className={styles.cardIcon}>{m.icon}</span>
            <span className={styles.cardLabel}>{m.label}</span>
          </button>
        ))}
      </div>
    </main>
  );
}
