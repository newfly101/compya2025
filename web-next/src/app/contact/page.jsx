import PageShell from "@/layout/PageShell.jsx";
import ContactScreen from "@/domains/policy/mobile/ContactScreen.jsx";

export const metadata = {
  title: "문의하기",
  description: "컴프야펀에 문의할 수 있는 페이지입니다.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <PageShell title="문의하기">
      <ContactScreen />
    </PageShell>
  );
}
