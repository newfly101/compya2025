import PageShell from "@/layout/PageShell.jsx";
import GuidesScreen from "@/domains/guides/mobile/GuidesScreen.jsx";

export const metadata = {
  title: "가이드",
  description: "컴프야펀이 직접 정리한 공략·활용 가이드를 모아봅니다.",
  alternates: { canonical: "/guides" },
};

export default function GuidesPage() {
  return (
    <PageShell title="가이드">
      <GuidesScreen />
    </PageShell>
  );
}
