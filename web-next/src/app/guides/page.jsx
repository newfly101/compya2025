import PageShell from "@/components/layout/PageShell.jsx";
import GuidesScreen from "@/features/guides/GuidesScreen.jsx";
import { buildMetadata } from "@/lib/seo.js";

export const metadata = buildMetadata({ title: "가이드", description: "컴프야펀이 직접 정리한 공략·활용 가이드를 모아봅니다.", path: "/guides" });

export default function GuidesPage() {
  return (
    <PageShell title="가이드">
      <GuidesScreen />
    </PageShell>
  );
}
