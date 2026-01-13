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
    </ContentPageLayout>
  );
};

export default PlayerSkillDictionary;
