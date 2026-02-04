import React from "react";
import { usePlayerSkillChange } from "@/domains/dictionary/feature/hooks/usePlayerSkillChange.js";
import { useCardModal } from "@/domains/dictionary/feature/hooks/useCardModal.js";
import SkillPanels from "@/domains/dictionary/feature/components/skillPanels/SkillPanels.jsx";
import RecommendModal from "@/domains/dictionary/feature/components/RecommendModal.jsx";
import SkillGradeToggle from "@/domains/dictionary/feature/components/skillGradeToggle/SkillGradeToggle.jsx";

const PlayerSkillDictionary = ({
                                 skillData,
                                 recommendData,
                                 skillExclusive, // 없으면 null
                               }) => {
  const {
    tier,
    selected,
    matched,
    matchedCombos,
    initSelected,
    skillCombo,
    skillToggle,
    clearCombo,
    isSkillDisabled,
  } = usePlayerSkillChange();

  const modal = useCardModal();

  const onInitSkills = (type) => {
    initSelected(type, skillData);
  };

  const onRecommend = () => {
    skillCombo(skillData, recommendData);
    modal.open();
  };

  const onSkillDisabled = skillExclusive
    ? (skillName) =>
      isSkillDisabled(skillName, selected, skillExclusive)
    : () => false;

  return (
    <>

      <SkillGradeToggle
        tier={tier}
        initSelected={onInitSkills}
        onRecommend={onRecommend}
        selected={selected}
      />

      <RecommendModal
        isOpen={modal.isOpen}
        matched={matched}
        selected={selected}
        combos={matchedCombos}
        onClose={() => {
          modal.close();
          clearCombo();
        }}
      />

      <SkillPanels
        tier={tier}
        selected={selected}
        onCheckDisabled={onSkillDisabled}
        onToggleSkill={skillToggle}
        skills={skillData}
      />
    </>
  );
};

export default PlayerSkillDictionary;
