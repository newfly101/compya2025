import React from "react";
import { useSearchParams } from "react-router-dom";
import Tabs from "@/components/Tabs.jsx";

const Notice = () => {
  const [params] = useSearchParams();
  const tab = params.get("tab") ?? "";

  return (
    <div className="noticePage">
      <h1>공지사항</h1>
      <p>공식/컴투스프로야구 공지, 이벤트, 쿠폰을 한 곳에서 확인하세요.</p>

      <Tabs
        tabs={[
          { key: "", label: "컴프야펀 공지사항" },
          { key: "notice", label: "공식 공지사항" },
          { key: "event", label: "이벤트" },
          { key: "coupons", label: "쿠폰" },
        ]}
      />

      {tab === "notice" && <div>📢 공지사항 리스트</div>}
      {tab === "event" && <div>🎉 이벤트 리스트</div>}
      {tab === "coupons" && <div>🎁 쿠폰 리스트</div>}
    </div>
  );
};

export default Notice;
