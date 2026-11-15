import PageShell from "@/layout/PageShell.jsx";
import AuthGate from "@/domains/authentication/mobile/AuthGate.jsx";
import ShortcutEditScreen from "@/domains/home/mobile/shortcutEdit/ShortcutEditScreen.jsx";

export const metadata = { title: "바로가기 편집", robots: { index: false, follow: false } };

// 저장값이 localStorage — AuthGate 가 세션 확인 뒤(브라우저)에만 그린다
export default function HomeShortcutsPage() {
  return (
    <PageShell title="바로가기 편집">
      <AuthGate guard allow={["ADMIN", "USER"]}>
          <ShortcutEditScreen />
      </AuthGate>
    </PageShell>
  );
}
