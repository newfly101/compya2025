import PageShell from "@/components/layout/PageShell.jsx";
import EventScreen from "@/features/events/EventScreen.jsx";
import { fetchEvents } from "@/features/events/api.js";
import { buildMetadata } from "@/lib/seo.js";

export const metadata = buildMetadata({ title: "이벤트", description: "컴투스 프로야구 진행 중/종료된 이벤트 일정과 참여 방법을 안내합니다.", path: "/events" });

// API 실패 시 fetchEvents 가 throw → 직전 정상 페이지 유지, 최초면 app/error.jsx.
export default function EventsPage() {
  return (
    <PageShell title="이벤트">
      <EventsBody />
    </PageShell>
  );
}

async function EventsBody() {
  return <EventScreen events={await fetchEvents()} />;
}
