import PageShell from "@/layout/PageShell.jsx";
import AuthGate from "@/domains/authentication/mobile/AuthGate.jsx";
import LegendCollectionSkillEditScreen from "@/domains/legendCollectionSkills/mobile/LegendCollectionSkillEditScreen.jsx";

export const metadata = { title: "스킬 기록 편집", robots: { index: false, follow: false } };

export default function LegendCollectionSkillEditPage() {
  return (
    <PageShell title="레전드 재료">
      <AuthGate>
        <LegendCollectionSkillEditScreen />
      </AuthGate>
    </PageShell>
  );
}
