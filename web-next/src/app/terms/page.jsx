import PageShell from "@/layout/PageShell.jsx";
import TermsScreen from "@/domains/policy/mobile/TermsScreen.jsx";
import { buildMetadata } from "@/config/seo.js";

export const metadata = buildMetadata({ title: "이용약관", description: "컴프야펀 이용약관 안내 페이지입니다.", path: "/terms" });

export default function TermsPage() {
  return (
    <PageShell title="이용약관">
      <TermsScreen />
    </PageShell>
  );
}
