import React, { useRef, useState } from "react";
import styles from "@/styles/pages/SkillDictionary.module.scss";
import RecommendSkillCard from "@/feature/dictionary/components/RecommendSkillCard.jsx";
import NoRecommendSkillCard from "@/feature/dictionary/components/NoRecommendSkillCard.jsx";
import { HITTER_SKILLS } from "@/data/skill/HITTER_SKILLS.js";
import { HITTER_RECOMMEND } from "@/data/skill/HITTER_RECOMMEND.js";
import { HITTER_SKILL_EXCLUSIVE } from "@/feature/dictionary/config/skillExclusive.js";
import { ContentPageHeader, useContentPageHeader } from "@/shared/ui/contentPageHeader/index.js";
import { ContentPageLayout } from "@/shared/layout/contentPageLayout/index.js";
import SkillGradeToggle from "@/feature/dictionary/components/SkillGradeToggle.jsx";
import SkillPanels from "@/feature/dictionary/components/SkillPanels.jsx";


const HitterSkillDictionary = () => {
  const { moveTo } = useContentPageHeader();

  const [standard, setStandard] = useState("레전드"); // 레전드 | 플래티넘
  const [selectedSkills, setSelectedSkills] = useState([]);
  const selectedSkillsRef = useRef([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasRecommend, setHasRecommend] = useState(true);
  const [recommendCombos, setRecommendCombos] = useState([]);

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
          (skill) => !HITTER_SKILLS.legend.some((l) => l.name === skill),
        ),
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
                !HITTER_SKILLS.legend.some((l) => l.name === skill),
            ),
        )
        : matchedCombos;

    // console.log("finalCombos",finalCombos);

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
    <ContentPageLayout
      header={<ContentPageHeader
        title={"📖 타자 스킬 백과사전"}
        meta={["2026-01-03", "v0.1.6"]}
        backLabel={"조합 홈으로"}
        onBack={() => moveTo("/dictionary")}
      />}
      children={
        <>
          <SkillGradeToggle standard={standard}
                            initSelected={initSelected}
                            handleOpenRecommend={handleOpenRecommend}
                            selectedSkills={selectedSkills}
          />

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

          <SkillPanels standard={standard} renderGroup={renderGroup} />


        </>}
    />);
};

export default HitterSkillDictionary;
