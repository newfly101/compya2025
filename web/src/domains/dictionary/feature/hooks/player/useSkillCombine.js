import { useRef, useState } from "react";

export const useSkillCombine = () => {
  const [tier, setTier] = useState("레전드"); // 레전드 | 플래티넘
  const [selected, setSelected] = useState([]);
  const selectedRef = useRef([]);
  const [matched, setMatched] = useState(true);
  const [matchedCombos, setMatchedCombos] = useState([]);

  /** common function **/
  const skillToggle = (skill) => {
    const skillName = skill.name;

    setSelected((prev) => {
      let next = prev;

      if (prev.includes(skillName)) {
        next = prev.filter((s) => s !== skillName);
      } else {
        if (prev.length >= 2) return prev;
        next = [...prev, skillName];
      }

      selectedRef.current = next;
      return next;
    });
  };

  // 초기화
  const initSelected = (type, player) => {
    // ex) initSelected(type, HITTER_SKILLS);
    setTier(type);

    if (type === "플래티넘") {
      setSelected((prev) =>
        prev.filter(
          (skill) => !player.legend.some((l) => l.name === skill),
        ),
      );
      selectedRef.current = [];
    } else {
      setSelected([]);
      selectedRef.current = [];
    }

    setMatchedCombos([]);
  }

  // 스킬 추천 조합
  const skillCombo = (player, recommend) => {
    // skillCombo(HITTER_SKILLS, HITTER_RECOMMEND)
    const skillsNow = selectedRef.current;

    if (skillsNow.length === 0) return;

    if (
      tier === "레전드" &&
      skillsNow.includes("슈퍼스타") &&
      skillsNow.some((skillName) => player.platinum.some((s) => s.name === skillName))
    ) {
      setMatched(false);
      return;
    }

    const matchedCombos = recommend.filter((combo) =>
      skillsNow.every((skill) => combo.skills.includes(skill)),
    );

    const finalCombos =
      tier === "플래티넘"
        ? matchedCombos.filter(
          (combo) =>
            combo.skills.every(
              (skill) =>
                !player.legend.some((l) => l.name === skill),
            ),
        )
        : matchedCombos;

    setMatchedCombos(finalCombos);
    setMatched(finalCombos.length > 0);

    // 결과 값 matchedCombos 에 저장
  }

  const isSkillDisabled = (skillName, selected, ex) => {
    // isSkillDisabled(skill.name, selected, HITTER_SKILL_EXCLUSIVE)
    if (selected.includes(skillName)) return false;
    if (selected.length === 0) return false;

    return selected.some(
      (selected) =>
        ex[selected]?.includes(skillName),
    );
  };

  const clearCombo = () => {
    setSelected([]);
    selectedRef.current = [];
    setMatchedCombos([]);
    setMatched(true);
  };

  return {
    tier,
    selected,
    matched,
    matchedCombos,
    initSelected,
    skillToggle,
    skillCombo,
    isSkillDisabled,
    clearCombo,
  }
}
