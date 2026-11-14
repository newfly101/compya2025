import PageShell from "@/layout/PageShell.jsx";
import PrivacyPolicyScreen from "@/domains/policy/mobile/PrivacyPolicyScreen.jsx";

export const metadata = {
  title: "개인정보처리방침",
  description: "컴프야펀 개인정보처리방침 안내 페이지입니다.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPolicyPage() {
  return (
    <PageShell title="개인정보처리방침">
      <PrivacyPolicyScreen />
    </PageShell>
  );
}
