import React from "react";
import { ContentPageHeader, useContentPageHeader } from "@/shared/ui/contentPageHeader/index.js";
import { ContentPageLayout } from "@/shared/layout/contentPageLayout/index.js";
import { useCardModal } from "@/feature/dictionary/hooks/useCardModal.js";
import RecommendModal from "@/feature/dictionary/components/RecommendModal.jsx";
import SkillGradeToggle from "@/feature/dictionary/components/SkillGradeToggle.jsx";
import SkillPanels from "@/feature/dictionary/components/SkillPanels.jsx";
import { usePlayerSkillChange } from "@/feature/dictionary/hooks/usePlayerSkillChange.js";
import { HITTER_SKILLS } from "@/data/skill/HITTER_SKILLS.js";
import { HITTER_RECOMMEND } from "@/data/skill/HITTER_RECOMMEND.js";
import { HITTER_SKILL_EXCLUSIVE } from "@/feature/dictionary/config/skillExclusive.js";


const HitterSkillDictionary = () => {
  const { moveTo } = useContentPageHeader();
  const {
    standard,
    selectedSkills,
    hasRecommend,
    recommendCombos,
    initSelected,
    recommendSkills,
    handleToggleSkill,
    resetRecommendSkills,
    isSkillDisabled,
  } = usePlayerSkillChange();
  const modal = useCardModal();

  const skillData = HITTER_SKILLS;

  const initHitterSkills = (type) => {
    initSelected(type, skillData);
  };
  const hitterSkills = () => {
    recommendSkills(skillData, HITTER_RECOMMEND);
    modal.open();
  };
  const hitterSkillDisabled = (skillName) => {
    return isSkillDisabled(
      skillName,
      selectedSkills,
      HITTER_SKILL_EXCLUSIVE
    );
  };

  return (
    <ContentPageLayout
      header={<ContentPageHeader
        title={"📖 타자 스킬 백과사전"}
        meta={["2026-01-03", "v0.1.6"]}
        backLabel={"조합 홈으로"}
        onBack={() => moveTo("/dictionary")}
      />}
      children={
        <>
          <SkillGradeToggle standard={standard}
                            initSelected={initHitterSkills}
                            handleOpenRecommend={hitterSkills}
                            selectedSkills={selectedSkills}
                            modal={modal}
          />

          <RecommendModal
            isOpen={modal.isOpen}
            hasRecommend={hasRecommend}
            selectedSkills={selectedSkills}
            combos={recommendCombos}
            onClose={() => {
              modal.close();
              resetRecommendSkills();
            }}
          />

          <SkillPanels standard={standard}
                       selectedSkills={selectedSkills}
                       isSkillDisabled={hitterSkillDisabled}
                       handleToggleSkill={handleToggleSkill}
                       data={skillData}
          />
        </>}
    />);
};

export default HitterSkillDictionary;
