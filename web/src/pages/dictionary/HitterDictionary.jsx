import React, { useEffect } from "react";
import PlayerSkillDictionary from "@/pages/dictionary/components/PlayerSkillDictionary.jsx";
import { HITTER_SKILLS } from "@/data/skill/HITTER_SKILLS.js";
import { HITTER_RECOMMEND } from "@/data/skill/HITTER_RECOMMEND.js";
import { HITTER_SKILL_EXCLUSIVE } from "@/feature/dictionary/config/skillExclusive.js";
import { useDispatch, useSelector } from "react-redux";
import { requestPlayerSkillSet } from "@/store/modules/dictionary/index.js";

const HitterDictionary = () => {
  const dispatch = useDispatch();
  const { playerSkills } = useSelector((state) => state.dictionary);

  useEffect(() => {
    dispatch(requestPlayerSkillSet("HITTER"));
  }, [dispatch]);

  if (!playerSkills) return null;

  return (
    <PlayerSkillDictionary
      title="📖 타자 스킬 백과사전"
      meta={["2026-01-03", "v0.1.6"]}
      // skillData={HITTER_SKILLS}
      skillData={playerSkills}
      recommendData={HITTER_RECOMMEND}
      skillExclusive={HITTER_SKILL_EXCLUSIVE}
    />
  );
};

export default HitterDictionary;
