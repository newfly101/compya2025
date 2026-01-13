import React from "react";
import { ContentPageHeader, useContentPageHeader } from "@/shared/ui/contentPageHeader/index.js";
import { usePlayerSkillChange } from "@/feature/dictionary/hooks/usePlayerSkillChange.js";
import { useCardModal } from "@/feature/dictionary/hooks/useCardModal.js";
import SkillPanels from "@/feature/dictionary/components/SkillPanels.jsx";
import RecommendModal from "@/feature/dictionary/components/RecommendModal.jsx";
import SkillGradeToggle from "@/feature/dictionary/components/SkillGradeToggle.jsx";
import { ContentPageLayout } from "@/shared/layout/contentPageLayout/index.js";

const PlayerSkillDictionary = ({
                                 title,
                                 meta,
                                 skillData,
                                 recommendData,
                                 skillExclusive, // 없으면 null
                               }) => {
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

  const onInitSkills = (type) => {
    initSelected(type, skillData);
  };

  const onRecommend = () => {
    recommendSkills(skillData, recommendData);
    modal.open();
  };

  const onSkillDisabled = skillExclusive
    ? (skillName) =>
      isSkillDisabled(skillName, selectedSkills, skillExclusive)
    : () => false;

  return (
    <ContentPageLayout
      header={
        <ContentPageHeader
          title={title}
          meta={meta}
          backLabel="조합 홈으로"
          onBack={() => moveTo("/dictionary")}
        />
      }
    >
      <SkillGradeToggle
        standard={standard}
        initSelected={onInitSkills}
        handleOpenRecommend={onRecommend}
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

      <SkillPanels
        standard={standard}
        selectedSkills={selectedSkills}
        isSkillDisabled={onSkillDisabled}
        handleToggleSkill={handleToggleSkill}
        data={skillData}
      />
    </ContentPageLayout>
  );
};

export default PlayerSkillDictionary;
