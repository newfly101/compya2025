import PageShell from "@/components/layout/PageShell.jsx";
import AboutScreen from "@/features/policy/AboutScreen.jsx";
import { buildMetadata } from "@/lib/seo.js";

export const metadata = buildMetadata({ title: "사이트 소개", description: "컴프야펀 서비스 소개 페이지입니다.", path: "/about" });

export default function AboutPage() {
  return (
    <PageShell title="사이트 소개">
      <AboutScreen />
    </PageShell>
  );
}
