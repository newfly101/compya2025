import { useEffect, useState } from "react";
import { pickByProbability, PROB_LEGEND } from "@/utils/skill/skillProbability.js";
import { pickSkillsByCombo } from "@/utils/skill/pitcherSkillPicker.js";

export const usePitcherSkillChange = (selectedPitcher) => {
  const [skills, setSkills] = useState([]);
  const [skillChangeCount, setSkillChangeCount] = useState(-1);
  const [isInitialRoll, setIsInitialRoll] = useState(true);

  /** 3레전드 스킬인지 확인하는 코드 **/
  const isTripleLegend = (result) =>
    result.length === 3 &&
    result.every(skill => skill.grade === "LEGEND");

  const rollOnce = () => {
    if (!selectedPitcher) return;

    const combo = pickByProbability(PROB_LEGEND, {
      pitcherId: selectedPitcher.id,
      pitchTypes: selectedPitcher.pitchTypes,
    });

    const result = pickSkillsByCombo(combo);

    // ✅ 최초 자동 실행 + 3LEGEND일 때만 한 번 더
    if (isInitialRoll && isTripleLegend(result)) {
      setIsInitialRoll(false); // 최초 조건 소진
      return rollOnce();
    }

    setIsInitialRoll(false);     // 최초 실행 종료
    setSkillChangeCount(prev => prev + 1);
    setSkills(result);
  };

  useEffect(() => {
    if (!selectedPitcher) return;

    setIsInitialRoll(true); // 🔥 투수 변경 → 최초 상태
    setSkillChangeCount(-1);
    rollOnce();
  }, [selectedPitcher]);

  return {
    rollOnce,
    skillChangeCount,
    skills,
  };
};
