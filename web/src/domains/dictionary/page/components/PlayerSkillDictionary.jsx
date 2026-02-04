import React from "react";
import { useContentPageHeader } from "@/global/ui/contentPageHeader/index.js";
import { usePlayerSkillChange } from "@/domains/dictionary/feature/hooks/usePlayerSkillChange.js";
import { useCardModal } from "@/domains/dictionary/feature/hooks/useCardModal.js";
import SkillPanels from "@/domains/dictionary/feature/components/skillPanels/SkillPanels.jsx";
import RecommendModal from "@/domains/dictionary/feature/components/RecommendModal.jsx";
import SkillGradeToggle from "@/domains/dictionary/feature/components/skillGradeToggle/SkillGradeToggle.jsx";
import { ContentPageLayout } from "@/global/layout/contentPageLayout/index.js";
import CommonNavigationTab from "@/global/ui/navigation/tabs/CommonNavigationTab.jsx";
import { DictionaryNavTab } from "@/domains/dictionary/feature/config/DictionaryNavTab.js";
import MetaHeader from "@/global/ui/metaHeader/MetaHeader.jsx";

const PlayerSkillDictionary = ({
                                 skillData,
                                 recommendData,
                                 skillExclusive, // 없으면 null
                                 tab,
                                 setTab,
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
      header={<MetaHeader
        backLabel="조합 홈으로"
        onBack={() => moveTo("/dictionary")}
      />
      }
    >
      <CommonNavigationTab tabs={DictionaryNavTab} onChange={setTab} activeKey={tab} />

      {/*{tab === DICTIONARY_TAB_KEY.DESCRIPTION && (<SkillDescriptionSection />)}*/}
      {/*{tab === DICTIONARY_TAB_KEY.COMBINATION && (<SkillDescriptionSection />)}*/}

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
