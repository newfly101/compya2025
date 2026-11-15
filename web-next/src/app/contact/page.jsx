import PageShell from "@/layout/PageShell.jsx";
import ContactScreen from "@/domains/policy/mobile/ContactScreen.jsx";
import { buildMetadata } from "@/config/seo.js";

export const metadata = buildMetadata({ title: "문의하기", description: "컴프야펀에 문의할 수 있는 페이지입니다.", path: "/contact" });

export default function ContactPage() {
  return (
    <PageShell title="문의하기">
      <ContactScreen />
    </PageShell>
  );
}
