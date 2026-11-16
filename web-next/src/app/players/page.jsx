import PageShell from "@/components/layout/PageShell.jsx";
import PlayerEncyclopediaScreen from "@/features/players/PlayerEncyclopediaScreen.jsx";
import { fetchPlayersInitial } from "@/features/players/api.js";
import { buildMetadata } from "@/lib/seo.js";

export const metadata = buildMetadata({
  title: "선수 백과사전",
  description: "컴투스 프로야구 소속 선수 정보를 구단·연도별로 찾아볼 수 있는 선수 백과사전입니다.",
  path: "/players",
});

// 설계: 기본 진입(첫 구단·최신 연도 로스터)만 서버가 렌더 → searchParams 를 안 써서 ISR(○) 유지.
// 구단·연도·검색·필터는 client 가 카드 전량을 TanStack Query 로 받아 처리(쿼리스트링 방식은 ƒ 가 되고 URL 조합이 폭발한다).
// TODO(next-migration): GuideAccordion 은 화면 안에 포함됨 / AdSlot(PLAYERS_LIST·PLAYERS_TABLE) 미이전
export default function PlayersPage() {
  return (
    <PageShell title="선수 백과사전">
      <PlayersBody />
    </PageShell>
  );
}

async function PlayersBody() {
  return <PlayerEncyclopediaScreen initial={await fetchPlayersInitial()} />;
}
