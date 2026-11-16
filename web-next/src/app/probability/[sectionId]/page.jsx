import { notFound } from "next/navigation";
import PageShell from "@/components/layout/PageShell.jsx";
import OddsSectionScreen from "@/features/odds/OddsSectionScreen.jsx";
import { DEFAULT_ODDS_DOC, findOddsSection } from "@/data/odds/index.js";
import { oddsSectionPath } from "@/lib/routePath.js";
import { buildMetadata } from "@/lib/seo.js";

export const dynamicParams = false; // 목록 밖 sectionId 는 404

export const generateStaticParams = () => DEFAULT_ODDS_DOC.sections.map((s) => ({ sectionId: s.id }));

export async function generateMetadata({ params }) {
  const section = findOddsSection((await params).sectionId);
  if (!section) return {};
  return {
    ...buildMetadata({
      title: `확률 공시 | ${section.title}`,
      description: "컴투스 프로야구 확률 공시 상세 항목별 확률 정보를 확인하세요.",
      path: oddsSectionPath(section.id),
    }),
    robots: { index: false }, // 원본 NOINDEX_PATHS
  };
}

export default async function ProbabilitySectionPage({ params }) {
  const { sectionId } = await params;
  if (!findOddsSection(sectionId)) notFound();
  return (
    <PageShell title="확률 공시">
      <OddsSectionScreen sectionId={sectionId} />
    </PageShell>
  );
}
