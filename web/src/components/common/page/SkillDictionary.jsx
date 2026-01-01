import React, { useState } from "react";
import { PITCHER_SKILLS } from "@/data/skill/PITCKER_SKILLS.js";
import styles from "@/styles/pages/SkillDictionary.module.scss";
import RecommendSkillCard from "@/components/common/page/RecommendSkillCard.jsx";
import { PITCHER_RECOMMEND } from "@/data/skill/PITCHER_RECOMMEND.js";
import NoRecommendSkillCard from "@/components/common/page/NoRecommendSkillCard.jsx";
import { useNavigate } from "react-router-dom";

const SkillDictionary = ({ onSelect }) => {
  const navigate = useNavigate();

  const [standard, setStandard] = useState("레전드"); // LEGEND | PLATINUM
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);


  const handleMoveUrl = () => {
    navigate(`/`);
  }

  const handleClick = (skill) => {
    const skillName = skill.name;

    setSelectedSkill(skillName);
    setIsModalOpen(true);

    // 🔥 PLATINUM 기준은 전부 준비중
    if (standard === "플래티넘") {
      setModalType("PREPARE");
      return;
    }

    // 🔥 LEGEND 기준
    const hasCombo = filteredCombos.some(combo =>
      combo.skills.includes(skillName)
    );

    if (hasCombo) {
      setModalType("RECOMMEND");
      return;
    }

    // hero / normal → 변경 추천
    if (isLowTierSkill(skillName)) {
      setModalType("CHANGE");
      return;
    }

    // 안전망
    setModalType("PREPARE");
  };


  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSkill(null);
    setModalType(null);
  };


  const isLegendSkill = (skillName) =>
    PITCHER_SKILLS.legend.some(s => s.name === skillName);

  const isPlatinumSkill = (skillName) =>
    PITCHER_SKILLS.platinum.some(s => s.name === skillName);

  const isLowTierSkill = (skillName) =>
    PITCHER_SKILLS.hero.some(s => s.name === skillName) ||
    PITCHER_SKILLS.normal.some(s => s.name === skillName);





  const filteredCombos = PITCHER_RECOMMEND.filter(combo => {
    if (standard === "플래티넘") {
      return combo.skills.every(skill =>
        !PITCHER_SKILLS.legend.some(l => l.name === skill)
      );
    }
    return true;
  });


  const renderGroup = (title, grade, skills) => (
    <section className={styles.group}>
      <h3 className={styles.groupTitle}>{title}</h3>
      <div className={styles.buttonGrid}>
        {skills.map((skill) => (
          <button
            key={skill.id}
            className={`${styles.skillBtn} ${styles[grade]} ${
              selectedSkill === skill.name ? styles.active : ""
            }`}
            onClick={() => handleClick(skill)}
          >
            {skill.name}
          </button>
        ))}
      </div>
    </section>
  );

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <span className={styles.category} onClick={handleMoveUrl}>← 메인으로</span>
        <h1 className={styles.title}>🕮 투수 스킬 백과사전</h1>

        <div className={styles.meta}>
          <span>2026-01-02</span>
          <span>v0.1.3</span>
        </div>
      </header>
      <div className={styles.standardTabs}>
        <button
          className={`${standard === "레전드" ? styles.active : ""}`}
          onClick={() => setStandard("레전드")}
        >
          레전드 스킬 추천
        </button>

        <button
          className={`${standard === "플래티넘" ? styles.active : ""}`}
          onClick={() => setStandard("플래티넘")}
        >
          플래티넘 스킬 추천
        </button>
      </div>
      {isModalOpen && modalType === "RECOMMEND" && (
        <RecommendSkillCard
          isOpen
          selectedSkill={selectedSkill}
          combos={filteredCombos}
          onClose={handleCloseModal}
        />
      )}

      {isModalOpen && modalType === "CHANGE" && (
        <NoRecommendSkillCard
          skill={selectedSkill}
          onClose={handleCloseModal}
          mainText="잘 사용되지 않는 스킬입니다."
          subText="다른 스킬로 변경을 추천드립니다."
        />
      )}

      {isModalOpen && modalType === "PREPARE" && (
        <NoRecommendSkillCard
          skill={selectedSkill}
          onClose={handleCloseModal}
          mainText="현재 준비중인 기능입니다."
          subText="업데이트 이후에 시도 부탁드립니다."
        />
      )}

      <div className={styles.panel}>
        {standard === "레전드" && renderGroup("레전드", "legend", PITCHER_SKILLS.legend)}
        {renderGroup("플레티넘", "platinum", PITCHER_SKILLS.platinum)}
        {renderGroup("히어로", "hero", PITCHER_SKILLS.hero)}
        {renderGroup("노말", "normal", PITCHER_SKILLS.normal)}
      </div>


    </main>
  );
};

export default SkillDictionary;
