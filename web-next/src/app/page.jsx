import PageShell from "@/layout/PageShell.jsx";
import HomeScreen from "@/domains/home/mobile/HomeScreen.jsx";
import { fetchHome } from "@/domains/home/api.js";

export const metadata = {
  // 루트 page 는 layout 과 같은 세그먼트라 title.template 이 안 붙는다
  title: { absolute: "컴프야펀 | 홈" },
  description: "컴프야펀 홈 — 컴투스 프로야구 최신 공지, 진행 중 이벤트, 쿠폰 코드를 한 곳에서 확인하세요.",
  alternates: { canonical: "https://compyafun.com/" },
};

// 공개 블록만 서버 렌더(쿠키 없이 fetch, revalidate 300). 개인 블록은 HomeScreen 안의 client 컴포넌트가 브라우저에서 처리.
// API 실패 시 fetchHome 이 throw → 직전 정상 페이지 유지, 최초면 app/error.jsx.
export default function HomePage() {
  return (
    <PageShell>
      <HomeBody />
    </PageShell>
  );
}

async function HomeBody() {
  return <HomeScreen {...(await fetchHome())} />;
}
