import React from "react";
import { useSearchParams } from "react-router-dom";
import Tabs from "@/components/common/Tabs.jsx";
import FunNoticeList from "@/pages/notice/FunNoticeList.jsx";
import OfficialNoticeList from "@/pages/notice/OfficialNoticeList.jsx";
import EventList from "@/pages/notice/EventList.jsx";
import CouponList from "@/pages/notice/CouponList.jsx";
import coupons from "@/data/Coupon.js";

const Notice = () => {
  const [params] = useSearchParams();
  const tab = params.get("tab") ?? "";

  const tabComponents = {
    "": <FunNoticeList />,
    notice: <OfficialNoticeList />,
    event: <EventList />,
    coupons: <CouponList data={coupons}/>,
  };

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

      <div style={{ marginTop: "2rem" }}>
        {tabComponents[tab] ?? null}
      </div>
    </div>
  );
};

export default Notice;
