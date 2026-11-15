import PageShell from "@/layout/PageShell.jsx";
import PlayerSkillScreen from "@/domains/playerSkills/mobile/PlayerSkillScreen.jsx";
import { fetchPlayerSkills } from "@/domains/playerSkills/api.js";
import { buildMetadata } from "@/config/seo.js";

export const metadata = buildMetadata({
  title: "스킬 백과사전",
  description: "컴투스 프로야구 타자·투수 고유능력 92개의 설명과 E~S+ 등급별 수치를 한눈에 확인하세요.",
  path: "/skills",
});

// 기본 진입(쿼리 없음) → ISR(revalidate 300). 필터·검색·펼침은 전부 client state.
export default function SkillsPage() {
  return (
    <PageShell title="스킬 백과사전">
      <SkillsBody />
    </PageShell>
  );
}

async function SkillsBody() {
  return <PlayerSkillScreen skills={await fetchPlayerSkills()} />;
}
