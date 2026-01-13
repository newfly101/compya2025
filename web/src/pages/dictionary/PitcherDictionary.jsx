import React from "react";
import PlayerSkillDictionary from "@/pages/dictionary/components/PlayerSkillDictionary.jsx";
import { PITCHER_SKILLS } from "@/data/skill/PITCHER_SKILLS.js";
import { PITCHER_RECOMMEND } from "@/data/skill/PITCHER_RECOMMEND.js";

const PitcherDictionary = () => {
  return (
    <PlayerSkillDictionary
      title="📖 타자 스킬 백과사전"
      meta={["2026-01-03", "v0.1.6"]}
      skillData={PITCHER_SKILLS}
      recommendData={PITCHER_RECOMMEND}
      skillExclusive={null}
    />
  );
};

export default PitcherDictionary;
