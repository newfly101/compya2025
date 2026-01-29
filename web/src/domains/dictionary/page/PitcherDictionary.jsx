import React, { useEffect } from "react";
import PlayerSkillDictionary from "@/domains/dictionary/page/components/PlayerSkillDictionary.jsx";
import { PITCHER_RECOMMEND } from "@/data/skill/PITCHER_RECOMMEND.js";
import { useDispatch, useSelector } from "react-redux";
import { requestPlayerSkillSet } from "@/domains/dictionary/store/index.js";

const PitcherDictionary = () => {
  const dispatch = useDispatch();
  const { playerSkills } = useSelector((state) => state.dictionary);

  useEffect(() => {
    dispatch(requestPlayerSkillSet("PITCHER"));
  }, [dispatch]);

  if (!playerSkills) return null;

  return (
    <PlayerSkillDictionary
      title="📖 투수 스킬 백과사전"
      meta={["2026-01-03", "v0.1.6"]}
      skillData={playerSkills}
      recommendData={PITCHER_RECOMMEND}
      skillExclusive={null}
    />
  );
};

export default PitcherDictionary;
