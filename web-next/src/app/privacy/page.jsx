import PageShell from "@/layout/PageShell.jsx";
import PrivacyPolicyScreen from "@/domains/policy/mobile/PrivacyPolicyScreen.jsx";
import { buildMetadata } from "@/config/seo.js";

export const metadata = buildMetadata({ title: "개인정보처리방침", description: "컴프야펀 개인정보처리방침 안내 페이지입니다.", path: "/privacy" });

export default function PrivacyPolicyPage() {
  return (
    <PageShell title="개인정보처리방침">
      <PrivacyPolicyScreen />
    </PageShell>
  );
}
