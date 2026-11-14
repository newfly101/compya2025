import { notFound } from "next/navigation";
import PageShell from "@/layout/PageShell.jsx";
import GuideDetailScreen from "@/domains/guides/mobile/GuideDetailScreen.jsx";
import { GUIDES, getGuideBySlug } from "@/domains/guides/content/index.js";

// 목록에 안 나오는 hidden 편(gamification)도 slug 직링크로 열려야 하므로 GUIDES 전체를 생성한다.
export const generateStaticParams = () => GUIDES.map((g) => ({ slug: g.slug }));
export const dynamicParams = false;

export async function generateMetadata({ params }) {
  const guide = getGuideBySlug((await params).slug);
  if (!guide) return {};
  return {
    title: `가이드 | ${guide.seo?.title ?? guide.title}`,
    description: guide.seo?.description,
    alternates: { canonical: `/guides/${guide.slug}` },
  };
}

export default async function GuideDetailPage({ params }) {
  const guide = getGuideBySlug((await params).slug);
  if (!guide) notFound();
  return (
    <PageShell title={guide.title}>
      <GuideDetailScreen guide={guide} />
    </PageShell>
  );
}
