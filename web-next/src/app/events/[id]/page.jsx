import { notFound } from "next/navigation";
import PageShell from "@/layout/PageShell.jsx";
import EventDetailScreen from "@/domains/events/mobile/EventDetailScreen.jsx";
import { fetchEvents, fetchEventDetail } from "@/domains/events/api.js";
import { eventDetailPath } from "@/config/routePath.js";
import { stripHtml } from "@/global/ui/richContent/sanitizeHtml.js";
import { buildMetadata } from "@/config/seo.js";

export const revalidate = 300;
export const dynamicParams = true; // 목록에 없던 이벤트는 첫 요청 때 생성(없으면 404)

// 본문이 있는 이벤트만 상세 페이지가 의미 있다. 빌드 시 API 실패는 빈 배열 → 요청 시 생성.
export async function generateStaticParams() {
  try {
    return (await fetchEvents()).filter((e) => e.hasContent).map((e) => ({ id: String(e.id) }));
  } catch {
    return [];
  }
}

const loadEvent = async (id) => (/^\d+$/.test(id) ? fetchEventDetail(id) : null);

export async function generateMetadata({ params }) {
  const event = await loadEvent((await params).id);
  if (!event) return {};
  return {
    ...buildMetadata({
      title: `이벤트 | ${event.title}`,
      description: stripHtml(event.contentHtml).slice(0, 120) || undefined,
      path: eventDetailPath(event.id),
      images: event.imageUrl ? [{ url: event.imageUrl }] : undefined,
      type: "article",
    }),
  };
}

export default async function EventDetailPage({ params }) {
  const event = await loadEvent((await params).id);
  if (!event) notFound();
  return (
    <PageShell title="이벤트">
      <EventDetailScreen event={event} />
    </PageShell>
  );
}
