import { useState } from "react";
import { useNavigate } from "react-router-dom";
import StateBox from "@/global/ui/mobile/stateBox/StateBox.jsx";
import { ROUTE_PATHS } from "@/app/router/config/routePath.js";
import { useGamificationMe } from "@/domains/gamification/mobile/hooks/useGamificationMe.js";
import SummaryCard from "@/domains/gamification/mobile/components/summaryCard/SummaryCard.jsx";
import NavRow from "@/domains/gamification/mobile/components/navRow/NavRow.jsx";
import GradeModal from "@/domains/gamification/mobile/components/gradeModal/GradeModal.jsx";
import TitleModal from "@/domains/gamification/mobile/components/titleModal/TitleModal.jsx";
import styles from "./GamificationSection.module.scss";

// 마이페이지 — 티어 요약 카드(정보 전용) + 이동 행 3개(등급표 · 칭호 · 내역).
export default function GamificationSection() {
  const navigate = useNavigate();
  const { me, loading, error, reload } = useGamificationMe();
  const [modal, setModal] = useState(null); // "grade" | "title" | null

  if (!me) {
    if (error) return <StateBox status="error" message={error} onRetry={reload} compact />;
    return <StateBox status="loading" message="활동 정보를 불러오는 중..." compact />;
  }

  const { level, nextLevelXp, xp, titles = [], recent = [] } = me;
  const hasTitle = titles.length > 0;
  const last = recent[0];
  const lastText = last
    ? `최근 ${last.reason} ${last.xpDelta ? `${last.xpDelta > 0 ? "+" : ""}${last.xpDelta} XP` : `${last.pointDelta > 0 ? "+" : ""}${last.pointDelta} P`}`
    : "아직 활동 기록이 없어요";

  return (
    <section className={styles.section} aria-busy={loading}>
      <SummaryCard me={me} />
      <NavRow
        title="등급표 보기"
        sub={nextLevelXp ? `다음 등급까지 ${(nextLevelXp - xp).toLocaleString()} XP` : "최고 등급이에요"}
        onClick={() => setModal("grade")}
      />
      <NavRow
        title={hasTitle ? "대표 칭호 바꾸기" : "칭호 등록하기"}
        sub={hasTitle ? "보유 칭호 중에서 선택" : "받을 수 있는 칭호 보기"}
        onClick={() => setModal("title")}
      />
      <NavRow title="XP·포인트 내역" sub={lastText} onClick={() => navigate(ROUTE_PATHS.mypage_history)} />

      {modal === "grade" && <GradeModal myLevel={level} onClose={() => setModal(null)} />}
      {modal === "title" && <TitleModal onClose={() => setModal(null)} />}
    </section>
  );
}
