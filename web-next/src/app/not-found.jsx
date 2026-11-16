import PageShell from "@/components/layout/PageShell.jsx";
import NotFoundScreen from "@/features/error/NotFoundScreen.jsx";

export const metadata = {
  title: "페이지를 찾을 수 없음",
  description: "요청하신 페이지를 찾을 수 없습니다. 컴프야펀 홈에서 최신 공지·이벤트·쿠폰 정보를 확인해보세요.",
};

export default function NotFound() {
  return (
    <PageShell title="페이지를 찾을 수 없음">
      <NotFoundScreen />
    </PageShell>
  );
}
