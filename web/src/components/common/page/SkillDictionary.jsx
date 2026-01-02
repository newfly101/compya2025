import React, { useRef, useState } from "react";
import { PITCHER_SKILLS } from "@/data/skill/PITCKER_SKILLS.js";
import styles from "@/styles/pages/SkillDictionary.module.scss";
import RecommendSkillCard from "@/components/common/page/RecommendSkillCard.jsx";
import { PITCHER_RECOMMEND } from "@/data/skill/PITCHER_RECOMMEND.js";
import NoRecommendSkillCard from "@/components/common/page/NoRecommendSkillCard.jsx";
import { useNavigate } from "react-router-dom";

const SkillDictionary = () => {
  const navigate = useNavigate();

  const [standard, setStandard] = useState("레전드"); // 레전드 | 플래티넘
  const [selectedSkills, setSelectedSkills] = useState([]);
  const selectedSkillsRef = useRef([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasRecommend, setHasRecommend] = useState(true);
  const [recommendCombos, setRecommendCombos] = useState([]);

  const handleMoveUrl = () => {
    navigate("/dictionary");
  };

  const handleToggleSkill = (skill) => {
    const skillName = skill.name;

    setSelectedSkills((prev) => {
      let next = prev;

      if (prev.includes(skillName)) {
        next = prev.filter((s) => s !== skillName);
      } else {
        if (prev.length >= 2) return prev;
        next = [...prev, skillName];
      }

      selectedSkillsRef.current = next; // ✅ 여기서 즉시 최신화
      return next;
    });
  };

  const initSelected = (type) => {
    setSelectedSkills([]);
    setStandard(type);
    setRecommendCombos([]);
  }

  const handleOpenRecommend = () => {
    const skillsNow = selectedSkillsRef.current; // ✅ 최신값

    if (skillsNow.length === 0) return;

    const matchedCombos = PITCHER_RECOMMEND.filter((combo) =>
      skillsNow.every((skill) => combo.skills.includes(skill))
    );

    const finalCombos =
      standard === "플래티넘"
        ? matchedCombos.filter(() =>
          skillsNow.every(
            (skill) => !PITCHER_SKILLS.legend.some((l) => l.name === skill)
          )
        )
        : matchedCombos;

    setRecommendCombos(finalCombos);
    setHasRecommend(finalCombos.length > 0);
    setIsModalOpen(true);
  };



  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSkills([]);
    selectedSkillsRef.current = []; // ✅ 동기화
    setRecommendCombos([]);
    setHasRecommend(true);
  };


  const renderGroup = (title, grade, skills) => (
    <section className={styles.group}>
      <h3 className={styles.groupTitle}>{title}</h3>
      <div className={styles.buttonGrid}>
        {skills.map((skill) => (
          <button
            key={skill.id}
            className={`${styles.skillBtn} ${styles[grade]} ${
              selectedSkills.includes(skill.name) ? styles.active : ""
            }`}
            onClick={() => handleToggleSkill(skill)}
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
        <span className={styles.category} onClick={handleMoveUrl}>← 조합 홈으로</span>
        <h1 className={styles.title}>📖 투수 스킬 백과사전 (공사중)</h1>

        <div className={styles.meta}>
          <span>2026-01-02</span>
          <span>v0.1.5</span>
        </div>
      </header>
      <div className={styles.skillToggleHeader}>
        <div className={styles.standardTabs}>
          <button
            className={`${standard === "레전드" ? styles.active : ""}`}
            onClick={() => initSelected("레전드")}
          >
            레전드 스킬 추천
          </button>

          <button
            className={`${standard === "플래티넘" ? styles.active : ""}`}
            onClick={() => initSelected("플래티넘")}
          >
            플래티넘 스킬 추천
          </button>
        </div>
        <div className={styles.standardTabs}>
          <button
            className={styles.recommendBtn}
            disabled={selectedSkills.length === 0}
            onClick={handleOpenRecommend}
          >
            추천 스킬 조합 보기
            {selectedSkills.length > 0 && (
              <span>({selectedSkills.length}/2)</span>
            )}
          </button>
        </div>
      </div>

      {isModalOpen && (
        hasRecommend ? (
          <RecommendSkillCard
            isOpen
            selectedSkills={selectedSkills}
            combos={recommendCombos}
            onClose={handleCloseModal}
          />
        ) : (
          <NoRecommendSkillCard
            skill={selectedSkills.join(" + ")}
            onClose={handleCloseModal}
            mainText="해당 스킬 조합은 잘 사용되지 않습니다."
            subText="다른 스킬 조합을 추천드립니다."
          />
        )
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
