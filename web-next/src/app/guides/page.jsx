import PageShell from "@/layout/PageShell.jsx";
import GuidesScreen from "@/domains/guides/mobile/GuidesScreen.jsx";
import { buildMetadata } from "@/config/seo.js";

export const metadata = buildMetadata({ title: "가이드", description: "컴프야펀이 직접 정리한 공략·활용 가이드를 모아봅니다.", path: "/guides" });

export default function GuidesPage() {
  return (
    <PageShell title="가이드">
      <GuidesScreen />
    </PageShell>
  );
}
