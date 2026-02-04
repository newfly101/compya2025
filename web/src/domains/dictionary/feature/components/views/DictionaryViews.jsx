import React, { useState } from "react";
import MetaHeader from "@/global/ui/metaHeader/MetaHeader.jsx";
import CommonNavigationTab from "@/global/ui/navigation/tabs/CommonNavigationTab.jsx";
import { DictionaryNavTab } from "@/domains/dictionary/feature/config/DictionaryNavTab.js";
import { ContentPageLayout } from "@/global/layout/contentPageLayout/index.js";
import { useContentPageHeader } from "@/global/ui/contentPageHeader/index.js";

const DictionaryViews = () => {
  const [tab, setTab] = useState(DictionaryNavTab[0].key);
  const { moveTo } = useContentPageHeader();
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

    </ContentPageLayout>
  );
};

export default DictionaryViews;
