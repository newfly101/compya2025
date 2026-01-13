import { useRef, useState } from "react";

export const usePlayerSkillChange = () => {
  const [standard, setStandard] = useState("레전드"); // 레전드 | 플래티넘
  const [selectedSkills, setSelectedSkills] = useState([]);
  const selectedSkillsRef = useRef([]);
  const [hasRecommend, setHasRecommend] = useState(true);
  const [recommendCombos, setRecommendCombos] = useState([]);

  /** common function **/
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

  // 초기화
  const initSelected = (type, player) => {
    // ex) initSelected(type, HITTER_SKILLS);
    setStandard(type);

    if (type === "플래티넘") {
      setSelectedSkills((prev) =>
        prev.filter(
          (skill) => !player.legend.some((l) => l.name === skill),
        ),
      );
      selectedSkillsRef.current = [];
    } else {
      setSelectedSkills([]);
      selectedSkillsRef.current = [];
    }

    setRecommendCombos([]);
  }

  // 스킬 추천 조합
  const recommendSkills = (player, recommend) => {
    // recommendSkills(HITTER_SKILLS, HITTER_RECOMMEND)
    const skillsNow = selectedSkillsRef.current;

    if (skillsNow.length === 0) return;

    if (
      standard === "레전드" &&
      skillsNow.includes("슈퍼스타") &&
      skillsNow.some((skillName) => player.platinum.some((s) => s.name === skillName))
    ) {
      setHasRecommend(false);
      return;
    }

    const matchedCombos = recommend.filter((combo) =>
      skillsNow.every((skill) => combo.skills.includes(skill)),
    );

    const finalCombos =
      standard === "플래티넘"
        ? matchedCombos.filter(
          (combo) =>
            combo.skills.every(
              (skill) =>
                !player.legend.some((l) => l.name === skill),
            ),
        )
        : matchedCombos;

    setRecommendCombos(finalCombos);
    setHasRecommend(finalCombos.length > 0);

    // 결과 값 recommendCombos 에 저장
  }

  const isSkillDisabled = (skillName, selectedSkills, ex) => {
    // isSkillDisabled(skill.name, selectedSkills, HITTER_SKILL_EXCLUSIVE)
    if (selectedSkills.includes(skillName)) return false;
    if (selectedSkills.length === 0) return false;

    return selectedSkills.some(
      (selected) =>
        ex[selected]?.includes(skillName),
    );
  };

  const resetRecommendSkills = () => {
    setSelectedSkills([]);
    selectedSkillsRef.current = [];
    setRecommendCombos([]);
    setHasRecommend(true);
  };

  return {
    standard,
    selectedSkills,
    hasRecommend,
    recommendCombos,
    handleToggleSkill,
    initSelected,
    recommendSkills,
    isSkillDisabled,

    resetRecommendSkills,
  }
}
