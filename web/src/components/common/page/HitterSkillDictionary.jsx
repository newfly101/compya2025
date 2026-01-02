import React, { useRef, useState } from "react";
import styles from "@/styles/pages/SkillDictionary.module.scss";
import RecommendSkillCard from "@/components/common/page/RecommendSkillCard.jsx";
import NoRecommendSkillCard from "@/components/common/page/NoRecommendSkillCard.jsx";
import { useNavigate } from "react-router-dom";
import { HITTER_SKILLS } from "@/data/skill/HITTER_SKILLS.js";
import { HITTER_RECOMMEND } from "@/data/skill/HITTER_RECOMMEND.js";

const HITTER_SKILL_EXCLUSIVE = {
  "리드오프": ["파워히터", "슈퍼스타", "클러치 히터"],
  "파워히터": ["리드오프", "슈퍼스타", "클러치 히터"],
  "클러치 히터": ["리드오프", "슈퍼스타", "파워히터"],
  "슈퍼스타": ["게스히터","레전드","리드오프","배팅머신","스프레이 히터","슬러거","에이스킬러","예지력","주루도사","카리스마","클러치 히터","파워히터","호타준족"]
};

const HitterSkillDictionary = () => {
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

      selectedSkillsRef.current = next;
      return next;
    });
  };

  const initSelected = (type) => {
    setStandard(type);

    if (type === "플래티넘") {
      setSelectedSkills((prev) =>
        prev.filter(
          (skill) => !HITTER_SKILLS.legend.some((l) => l.name === skill)
        )
      );
      selectedSkillsRef.current = [];
    } else {
      setSelectedSkills([]);
      selectedSkillsRef.current = [];
    }

    setRecommendCombos([]);
  };

  const handleOpenRecommend = () => {
    const skillsNow = selectedSkillsRef.current;

    if (skillsNow.length === 0) return;

    if (
      standard === "레전드" &&
      skillsNow.includes("슈퍼스타") &&
      skillsNow.some((skillName) => HITTER_SKILLS.platinum.some((s) => s.name === skillName))
    ) {
      setHasRecommend(false);
      setIsModalOpen(true);
      return;
    }


    const matchedCombos = HITTER_RECOMMEND.filter((combo) =>
      skillsNow.every((skill) => combo.skills.includes(skill)),
    );

    const finalCombos =
      standard === "플래티넘"
        ? matchedCombos.filter(
          (combo) =>
            combo.skills.every(
              (skill) =>
                !HITTER_SKILLS.legend.some((l) => l.name === skill)
            )
        )
        : matchedCombos;

    console.log("finalCombos",finalCombos);

    setRecommendCombos(finalCombos);
    setHasRecommend(finalCombos.length > 0);
    setIsModalOpen(true);
  };


  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSkills([]);
    selectedSkillsRef.current = [];
    setRecommendCombos([]);
    setHasRecommend(true);
  };

  const isSkillDisabled = (skillName, selectedSkills) => {
    if (selectedSkills.includes(skillName)) return false;
    if (selectedSkills.length === 0) return false;

    return selectedSkills.some(
      (selected) =>
        HITTER_SKILL_EXCLUSIVE[selected]?.includes(skillName),
    );
  };


  const renderGroup = (title, grade, skills) => (
    <section className={styles.group}>
      <h3 className={styles.groupTitle}>{title}</h3>
      <div className={styles.buttonGrid}>
        {skills.map((skill) => (
          <button
            key={skill.id}
            disabled={isSkillDisabled(skill.name, selectedSkills)}
            className={`
                      ${styles.skillBtn}
                      ${styles[grade]}
                      ${selectedSkills.includes(skill.name) ? styles.active : ""}
                      ${isSkillDisabled(skill.name, selectedSkills) ? styles.disabled : ""}
                    `}
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
        <h1 className={styles.title}>📖 타자 스킬 백과사전</h1>

        <div className={styles.meta}>
          <span>2026-01-03</span>
          <span>v0.1.6</span>
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
        {standard === "레전드" && renderGroup("레전드", "legend", HITTER_SKILLS.legend)}
        {renderGroup("플레티넘", "platinum", HITTER_SKILLS.platinum)}
        {renderGroup("히어로", "hero", HITTER_SKILLS.hero)}
        {renderGroup("노말", "normal", HITTER_SKILLS.normal)}
      </div>


    </main>
  );
};

export default HitterSkillDictionary;
