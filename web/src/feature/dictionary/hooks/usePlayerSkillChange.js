import { useRef, useState } from "react";
import { HITTER_SKILLS } from "@/data/skill/HITTER_SKILLS.js";
import { HITTER_RECOMMEND } from "@/data/skill/HITTER_RECOMMEND.js";
import { HITTER_SKILL_EXCLUSIVE } from "@/feature/dictionary/config/skillExclusive.js";

export const usePlayerSkillChange = () => {
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


  return {
    standard,
    selectedSkills,
    isModalOpen,
    hasRecommend,
    recommendCombos,
    handleToggleSkill,
    initSelected,
    handleOpenRecommend,
    handleCloseModal,
    isSkillDisabled
  }
}
