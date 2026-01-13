import React from "react";
import { ContentPageHeader, useContentPageHeader } from "@/shared/ui/contentPageHeader/index.js";
import { ContentPageLayout } from "@/shared/layout/contentPageLayout/index.js";
import { useCardModal } from "@/feature/dictionary/hooks/useCardModal.js";
import RecommendModal from "@/feature/dictionary/components/RecommendModal.jsx";
import SkillGradeToggle from "@/feature/dictionary/components/SkillGradeToggle.jsx";
import SkillPanels from "@/feature/dictionary/components/SkillPanels.jsx";
import { usePlayerSkillChange } from "@/feature/dictionary/hooks/usePlayerSkillChange.js";
import { PITCHER_SKILLS } from "@/data/skill/PITCHER_SKILLS.js";
import { PITCHER_RECOMMEND } from "@/data/skill/PITCHER_RECOMMEND.js";


const PitcherSkillDictionary = () => {
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
  } = usePlayerSkillChange();
  const modal = useCardModal();

  const initPitcherSkills = (type) => {
    initSelected(type, PITCHER_SKILLS);
  };

  const pitcherSkills = () => {
    recommendSkills(PITCHER_SKILLS ,PITCHER_RECOMMEND);
    modal.open();
  }
  const pitcherSkillDisabled = (skillName) => false;

  return (
    <ContentPageLayout
      header={<ContentPageHeader
        title={"📖 투수 스킬 백과사전"}
        meta={["2026-01-02", "v0.1.5"]}
        backLabel={"조합 홈으로"}
        onBack={() => moveTo("/dictionary")}
      />}
      children={
        <>
          <SkillGradeToggle standard={standard}
                            initSelected={initPitcherSkills}
                            handleOpenRecommend={pitcherSkills}
                            selectedSkills={selectedSkills}
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
                       isSkillDisabled={pitcherSkillDisabled}
                       handleToggleSkill={handleToggleSkill}
                       data={PITCHER_SKILLS}
          />
        </>}
    />);
};

export default PitcherSkillDictionary;
