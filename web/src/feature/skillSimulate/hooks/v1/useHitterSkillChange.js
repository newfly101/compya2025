import { useEffect, useRef, useState } from "react";
import { pickByProbability, PROB_LEGEND } from "@/utils/skill/skillProbability.js";
import { pickSkillsByCombo } from "@/utils/skill/hitterSkillPicker.js";

export const useHitterSkillChange = (selectedHitter) => {
  const [skills, setSkills] = useState([]);
  const [changeCount, setChangeCount] = useState(-1);
  const [isInitialRoll, setIsInitialRoll] = useState(true);

  /** 3레전드 스킬인지 확인하는 코드 **/
  const isTripleLegend = (result) =>
    result.length === 3 &&
    result.every(skill => skill.grade === "LEGEND");

  /** 일반 사용자용 : 한번씩만 돌리기 **/
  const rollOnce = () => {
    if (!selectedHitter) return;

    const combo = pickByProbability(PROB_LEGEND, {
      pitcherId: selectedHitter.id,
      pitchTypes: selectedHitter.pitchTypes,
    });

    const result = pickSkillsByCombo(combo);

    setIsInitialRoll(false);     // 최초 실행 종료
    setChangeCount(prev => prev + 1);
    setSkills(result);

    return result;
  };

  useEffect(() => {
    if (!selectedHitter) return;

    setIsInitialRoll(true); // 🔥 타자 변경 → 최초 상태
    setChangeCount(-1);
    rollOnce();
  }, [selectedHitter]);

  /** 개발자용 : 3보라 띄우는 자동 rolling **/
  const [isRolling, setIsRolling] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  const stopRolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRolling(false);
  };

  const startRollingUntil3Legend = () => {
    if (intervalRef.current || !selectedHitter) return;

    setIsRolling(true);

    intervalRef.current = setInterval(() => {
      const result = rollOnce();
      if (!result) return;

      if (result.filter(skill => skill.grade === "LEGEND").length === 3) {
        stopRolling();
      }
    }, 100);
  };

  return {
    skills,
    changeCount,
    rollOnce,

    /** 개발자 모드 자동 돌리기 **/
    // isRolling,
    // startRollingUntil3Legend,
    // stopRolling,
  }
}
