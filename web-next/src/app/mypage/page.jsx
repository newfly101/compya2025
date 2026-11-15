import PageShell from "@/layout/PageShell.jsx";
import AuthGate from "@/domains/authentication/mobile/AuthGate.jsx";
import MyPageScreen from "@/domains/users/mobile/MyPageScreen.jsx";

export const metadata = { title: "마이페이지", robots: { index: false, follow: false } };

// 로그인 전용(CSR) — 비로그인은 홈으로 돌려보낸다(원본 AuthGuard 와 동일)
export default function MyPage() {
  return (
    <PageShell title="마이페이지">
      <AuthGate guard allow={["ADMIN", "USER"]}>
        <MyPageScreen />
      </AuthGate>
    </PageShell>
  );
}
