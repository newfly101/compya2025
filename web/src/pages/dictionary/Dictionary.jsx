import React from "react";
import styles from "@/styles/pages/dictionary/Dictionary.module.scss";
import DictionaryCard from "@/components/common/DictionaryCard.jsx";
import pitcherImg from "@/assets/dictionary/pitcherImg.png";
import hitterImg from "@/assets/dictionary/hitterImg.png";
import coachImg from "@/assets/dictionary/coachImg.png";
import logoImg from "@/assets/dictionary/logoImg.png";
import { useNavigate } from "react-router-dom";

const Dictionary = () => {
  const navigate = useNavigate();

  const handleMoveUrl = () => {
    navigate("/");
  };

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <span className={styles.category} onClick={handleMoveUrl}>← 메인으로</span>
        <h1 className={styles.title}>📌 조합 추천 백과사전</h1>

        <div className={styles.meta}>
          <span>2026-01-03</span>
          <span>v0.1.5</span>
        </div>
      </header>
      <div className={styles.cardGrid}>
        <DictionaryCard
          icon="🧤"
          title="투수 스킬 백과사전"
          desc={["레전드 투수 스킬 조합", "플래티넘 투수 스킬 조합", "선발/중계/마무리 조합"]}
          link="/dictionary/pitcher"
          image={pitcherImg}
          disabled={false}
        />
        <DictionaryCard
          icon="⚾"
          title="타자 스킬 백과사전"
          desc={["레전드 타자 스킬 조합", "플레티넘 타자 스킬 조합" ,"포지션 별 추천 조합"]}
          link="/dictionary/batter"
          image={hitterImg}
          disabled={true}
        />
        <DictionaryCard
          icon="🧠"
          title="코치 스킬 백과사전"
          desc={["코치 스킬 메타 추천", "코치 스킬별 설명", "마스터 코치 추천 스킬"]}
          link="/dictionary/coach"
          image={coachImg}
          disabled={true}
        />
        <DictionaryCard
          icon="🧠"
          title="구단 선수 백과사전"
          desc={["구단별 선수 백과사전", "추천 시그니처 백과사전"]}
          link="/dictionary/team"
          image={logoImg}
          disabled={true}
        />
      </div>
    </main>
  );
};

export default Dictionary;
