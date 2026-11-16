import PageShell from "@/components/layout/PageShell.jsx";
import AuthGate from "@/features/authentication/AuthGate.jsx";
import GamificationHistoryScreen from "@/features/gamification/GamificationHistoryScreen.jsx";

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
