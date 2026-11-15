import PageShell from "@/layout/PageShell.jsx";
import AuthGate from "@/domains/authentication/mobile/AuthGate.jsx";
import GamificationHistoryScreen from "@/domains/gamification/mobile/GamificationHistoryScreen.jsx";

export const metadata = { title: "활동 내역", robots: { index: false, follow: false } };

export default function MyPageHistoryPage() {
  return (
    <PageShell title="활동 내역">
      <AuthGate guard allow={["ADMIN", "USER"]}>
        <GamificationHistoryScreen />
      </AuthGate>
    </PageShell>
  );
}
