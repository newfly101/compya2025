import PageShell from "@/layout/PageShell.jsx";
import AuthGate from "@/domains/authentication/mobile/AuthGate.jsx";
import LegendCollectionSkillsScreen from "@/domains/legendCollectionSkills/mobile/LegendCollectionSkillsScreen.jsx";

export const metadata = { title: "레전드 스킬 기록", robots: { index: false, follow: false } };

export default function LegendCollectionSkillsPage() {
  return (
    <PageShell title="레전드 재료">
      <AuthGate>
        <LegendCollectionSkillsScreen />
      </AuthGate>
    </PageShell>
  );
}
