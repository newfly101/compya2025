import PageShell from "@/layout/PageShell.jsx";
import AboutScreen from "@/domains/policy/mobile/AboutScreen.jsx";

export const metadata = {
  title: "사이트 소개",
  description: "컴프야펀 서비스 소개 페이지입니다.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <PageShell title="사이트 소개">
      <AboutScreen />
    </PageShell>
  );
}
