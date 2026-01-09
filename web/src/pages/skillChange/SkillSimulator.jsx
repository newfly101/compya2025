import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "@/styles/pages/dictionary/Dictionary.module.scss";
import pitcherImg from "@/assets/dictionary/pitcherImg.png";
import DictionaryCard from "@/components/common/DictionaryCard.jsx";
import hitterImg from "@/assets/dictionary/hitterImg.png";

const SkillSimulator = () => {
  const navigate = useNavigate();

  const handleMoveUrl = () => {
    navigate("/");
  };

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <span className={styles.category} onClick={handleMoveUrl}>← 메인으로</span>
        <h1 className={styles.title}>📌 스킬 시뮬레이터</h1>

        <div className={styles.meta}>
          <span>2026-01-09</span>
          <span>v0.1.6</span>
        </div>
      </header>
      <div className={styles.cardGrid}>
        <DictionaryCard
          icon="🧤"
          title="투수 고스변 시뮬레이터"
          desc={["레전드 투수 스킬 시뮬레이터", "투수 선택 가능", ]}
          link="/simulate/pitcher"
          image={pitcherImg}
          disabled={false}
        />
        <DictionaryCard
          icon="⚾"
          title="타자 고스변 시뮬레이터"
          desc={["레전드 타자 스킬 시뮬레이터", "타자 선택 가능", ]}
          link="/simulate/hitter"
          image={hitterImg}
          disabled={false}
        />
      </div>


    </main>
);
};

export default SkillSimulator;
