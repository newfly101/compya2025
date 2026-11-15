import PageShell from "@/layout/PageShell.jsx";
import EventScreen from "@/domains/events/mobile/EventScreen.jsx";
import { fetchEvents } from "@/domains/events/api.js";

export const metadata = {
  title: "이벤트",
  description: "컴투스 프로야구 진행 중/종료된 이벤트 일정과 참여 방법을 안내합니다.",
  alternates: { canonical: "/events" },
};

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
