import React from "react";
import { ContentPageHeader, useContentPageHeader } from "@/shared/ui/contentPageHeader/index.js";
import { ContentPageLayout } from "@/shared/layout/contentPageLayout/index.js";
import SkillGradeToggle from "@/feature/dictionary/components/SkillGradeToggle.jsx";
import SkillPanels from "@/feature/dictionary/components/SkillPanels.jsx";
import { usePlayerSkillChange } from "@/feature/dictionary/hooks/usePlayerSkillChange.js";
import { HITTER_SKILLS } from "@/data/skill/HITTER_SKILLS.js";
import { HITTER_RECOMMEND } from "@/data/skill/HITTER_RECOMMEND.js";
import RecommendModal from "@/feature/dictionary/components/RecommendModal.jsx";
import { useCardModal } from "@/feature/dictionary/hooks/useCardModal.js";
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
    isSkillDisabled,
    resetRecommendSkills,
  } = usePlayerSkillChange();
  const modal = useCardModal();

  const initHitterSkills = (type) => {
    initSelected(type, HITTER_SKILLS);
  };
  const hitterSkills = () => {
    recommendSkills(HITTER_SKILLS, HITTER_RECOMMEND);
    modal.open();
  };
  const hitterSkillDisabled = () => {
    // isSkillDisabled(skill.name, selectedSkills, HITTER_SKILL_EXCLUSIVE);
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
                       isSkillDisabled={isSkillDisabled}
                       handleToggleSkill={handleToggleSkill}
                       data={HITTER_SKILLS}
                       ex={HITTER_SKILL_EXCLUSIVE}
          />
        </>}
    />);
};

export default HitterSkillDictionary;
