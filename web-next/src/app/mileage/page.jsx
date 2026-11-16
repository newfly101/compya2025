import PageShell from "@/components/layout/PageShell.jsx";
import MileageScreen from "@/features/mileage/MileageScreen.jsx";
import { fetchSniperTargets } from "@/features/mileage/api.js";
import { buildMetadata } from "@/lib/seo.js";

export const metadata = buildMetadata({
  title: "마일리지 저격 경로",
  description:
    "컴투스 프로야구 마일리지로 저격 가능한 카드를 구단·연도별 로스터에서 확인하고, 목표 마일리지까지 남은 수량을 계산해보세요.",
  path: "/mileage",
});

// ?team=&year=&tab= 쿼리로 화면(표·리스트 탭)이 정해지므로 요청마다 렌더한다 — searchParams 를 읽으면 동적 라우트가 된다.
// 계산은 정적 데이터라 가볍고, 저격 재료 API 는 fetch 캐시(revalidate 300)를 탄다.
// API 실패 시 fetchSniperTargets 가 throw → app/error.jsx.
export default async function MileagePage({ searchParams }) {
  await searchParams;
  return (
    <PageShell title="마일리지 저격 경로">
      <MileageScreen initialTargets={await fetchSniperTargets()} />
    </PageShell>
  );
}
