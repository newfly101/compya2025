import PageShell from "@/layout/PageShell.jsx";
import NoticeScreen from "@/domains/notices/mobile/NoticeScreen.jsx";
import { fetchNotices } from "@/domains/notices/api.js";

export const metadata = {
  title: "공지사항",
  description: "컴투스 프로야구 공식 공지사항을 모아 확인할 수 있는 목록 페이지입니다.",
  alternates: { canonical: "/notices" },
};

// API 실패 시 fetchNotices 가 throw → 직전 정상 페이지 유지, 최초면 app/error.jsx.
export default function NoticesPage() {
  return (
    <PageShell title="공지사항">
      <NoticesBody />
    </PageShell>
  );
}

async function NoticesBody() {
  const { siteNotices, officialNotices } = await fetchNotices();
  return <NoticeScreen siteNotices={siteNotices} officialNotices={officialNotices} />;
}
