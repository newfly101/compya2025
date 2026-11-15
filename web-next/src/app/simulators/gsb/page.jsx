import PageShell from "@/layout/PageShell.jsx";
import AuthGate from "@/domains/authentication/mobile/AuthGate.jsx";
import SimulatorGsbScreen from "@/domains/simulators/mobile/SimulatorGsbScreen.jsx";

export const metadata = { title: "스킬 시뮬레이션", robots: { index: false, follow: false } };

export default function SimulatorGsbPage() {
  return (
    <PageShell title="스킬 시뮬레이션">
      <AuthGate>
        <SimulatorGsbScreen />
      </AuthGate>
    </PageShell>
  );
}
