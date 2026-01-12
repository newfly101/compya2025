import React from "react";
import Tabs from "@/components/common/Tabs.jsx";
import { useNoticePage } from "@/feature/notice/index.js";

const Notice = () => {
  const { tab, tabList } = useNoticePage();

  return (
    <div>
      <h1>공지사항</h1>
      <p>공식/컴투스프로야구 공지, 이벤트, 쿠폰을 한 곳에서 확인하세요.</p>

      <Tabs tabs={tabList} />

      <div style={{ marginTop: "2rem" }}>
        {tab.element ?? null}
      </div>
    </div>
  );
};

export default Notice;
