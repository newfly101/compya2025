import React from "react";
import RecommendSkillCard from "@/feature/dictionary/components/cards/RecommendSkillCard.jsx";
import NoRecommendSkillCard from "@/feature/dictionary/components/cards/NoRecommendSkillCard.jsx";
import { ContentPageHeader, useContentPageHeader } from "@/shared/ui/contentPageHeader/index.js";
import { ContentPageLayout } from "@/shared/layout/contentPageLayout/index.js";
import SkillGradeToggle from "@/feature/dictionary/components/SkillGradeToggle.jsx";
import SkillPanels from "@/feature/dictionary/components/SkillPanels.jsx";
import { usePlayerSkillChange } from "@/feature/dictionary/hooks/usePlayerSkillChange.js";
import { HITTER_SKILLS } from "@/data/skill/HITTER_SKILLS.js";


const HitterSkillDictionary = () => {
  const { moveTo } = useContentPageHeader();
  const { standard,
    selectedSkills,
    isModalOpen,
    hasRecommend,
    recommendCombos,
    handleToggleSkill,
    initSelected,
    handleOpenRecommend,
    handleCloseModal,
    isSkillDisabled} = usePlayerSkillChange();

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
                            initSelected={initSelected}
                            handleOpenRecommend={handleOpenRecommend}
                            selectedSkills={selectedSkills}
          />

          {isModalOpen && (
            hasRecommend ? (
              <RecommendSkillCard
                isOpen
                selectedSkills={selectedSkills}
                combos={recommendCombos}
                onClose={handleCloseModal}
              />
            ) : (
              <NoRecommendSkillCard
                skill={selectedSkills.join(" + ")}
                onClose={handleCloseModal}
                mainText="해당 스킬 조합은 잘 사용되지 않습니다."
                subText="다른 스킬 조합을 추천드립니다."
              />
            )
          )}
          <SkillPanels standard={standard}
                       selectedSkills={selectedSkills}
                       isSkillDisabled={isSkillDisabled}
                       handleToggleSkill={handleToggleSkill}
                       data={HITTER_SKILLS}
          />

        </>}
    />);
};

export default HitterSkillDictionary;
