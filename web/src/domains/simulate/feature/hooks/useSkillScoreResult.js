import { useMemo } from "react";
import { useSelector } from "react-redux";
import { calcPitcherRecommendation, calcHitterScoreRow } from "@/global/utils/skill/skillScoreCalc.js";

export const useSkillScoreResult = (target, skills) => {
  const { scoreConfig } = useSelector((state) => state.simulate);

  return useMemo(() => {
    if (!scoreConfig || !skills?.length) return null;

    if (target === "PITCHER") {
      const data = calcPitcherRecommendation(skills, scoreConfig.pitcher);
      return data ? { type: "PITCHER", ...data } : null;
    }

    if (target === "HITTER") {
      const row = calcHitterScoreRow(skills, scoreConfig.hitter);
      return row ? { type: "HITTER", row } : null;
    }

    return null;
  }, [target, skills, scoreConfig]);
};
