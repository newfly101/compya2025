import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DICTIONARY_TAB_KEY, DictionaryNavTab } from "@/domains/dictionary/feature/config/DictionaryNavTab.js";
import { useContentPageHeader } from "@/global/ui/contentPageHeader/index.js";
import { requestPlayerSkillSet } from "@/domains/dictionary/store/index.js";
import { ContentPageLayout } from "@/global/layout/contentPageLayout/index.js";
import MetaHeader from "@/global/ui/metaHeader/MetaHeader.jsx";
import CommonNavigationTab from "@/global/ui/navigation/tabs/CommonNavigationTab.jsx";
import PlayerSkillCombination
  from "@/domains/dictionary/feature/components/player/combination/PlayerSkillCombination.jsx";
import PlayerSkillDescription
  from "@/domains/dictionary/feature/components/player/description/PlayerSkillDescription.jsx";
import {
  PLAYER_POSITION_CONFIG,
  PLAYER_SKILL_GRADE_CONFIG,
} from "@/domains/dictionary/feature/config/player/dictionaryPlayerConfig.js";

const PlayerDictionaryView = ({ config, type }) => {
  const dispatch = useDispatch();
  const { playerSkills } = useSelector((state) => state.dictionary);
  const [tab, setTab] = useState(DictionaryNavTab[0].key);
  const { moveTo } = useContentPageHeader();

  useEffect(() => {
    dispatch(requestPlayerSkillSet(config.requestType));
  }, [dispatch]);

  return (
    <ContentPageLayout
      header={
        <MetaHeader
          backLabel="백과사전 홈으로"
          onBack={() => moveTo("/dictionary")}
        />
      }
    >
      <CommonNavigationTab tabs={DictionaryNavTab} onChange={setTab} activeKey={tab} />

      {tab === DICTIONARY_TAB_KEY.DESCRIPTION && playerSkills &&
        (<PlayerSkillDescription
          skillData={playerSkills}
          gradeOptions={PLAYER_SKILL_GRADE_CONFIG}
          positionConfig={PLAYER_POSITION_CONFIG[type]}
        />)}
      {tab === DICTIONARY_TAB_KEY.COMBINATION && playerSkills &&
        (<PlayerSkillCombination skillData={playerSkills}
                                 recommendData={config.recommendData}
                                 skillExclusive={config.skillExclusive}
        />)}

    </ContentPageLayout>
  );
};

export default PlayerDictionaryView;
