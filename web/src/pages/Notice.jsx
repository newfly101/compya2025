import React from "react";
import Tabs from "@/components/common/Tabs.jsx";
import { useNoticePage } from "@/feature/notice/index.js";
import { ContentPageLayout } from "@/shared/layout/contentPageLayout/index.js";
import { ContentPageHeader, useContentPageHeader } from "@/shared/ui/contentPageHeader/index.js";

const Notice = () => {
  const { tab, tabList } = useNoticePage();
  const { moveHome } = useContentPageHeader();

  return (
    <ContentPageLayout
      header={<ContentPageHeader title={"공지사항"}
                                 meta={["공식/컴투스프로야구 공지, 이벤트, 쿠폰을 한 곳에서 확인하세요."]}
                                 backLabel={"메인으로"}
                                 onBack={moveHome}
      />}
      children={<>
        <Tabs tabs={tabList} />
        {tab.element ?? null}
      </>}
    />);
};

export default Notice;
