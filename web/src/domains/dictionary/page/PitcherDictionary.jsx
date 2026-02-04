import React, { useEffect, useState } from "react";
import PlayerSkillDictionary from "@/domains/dictionary/page/components/PlayerSkillDictionary.jsx";
import { PITCHER_RECOMMEND } from "@/data/skill/PITCHER_RECOMMEND.js";
import { useDispatch, useSelector } from "react-redux";
import { requestPlayerSkillSet } from "@/domains/dictionary/store/index.js";

const PitcherDictionary = () => {
  const dispatch = useDispatch();
  const { playerSkills } = useSelector((state) => state.dictionary);
  const [tab, setTab] = useState("Description");

  useEffect(() => {
    dispatch(requestPlayerSkillSet("PITCHER"));
  }, [dispatch]);

  if (!playerSkills) return null;

  return (
    <PlayerSkillDictionary
      skillData={playerSkills}
      recommendData={PITCHER_RECOMMEND}
      skillExclusive={null}
      tab={tab}
      setTab={setTab}
    />
  );
};

export default PitcherDictionary;
