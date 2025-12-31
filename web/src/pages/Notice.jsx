import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Tabs from "@/components/common/Tabs.jsx";
import FunNoticeList from "@/pages/notice/FunNoticeList.jsx";
import OfficialNoticeList from "@/pages/notice/OfficialNoticeList.jsx";
import EventList from "@/pages/notice/EventList.jsx";
import CouponList from "@/pages/notice/CouponList.jsx";
import coupons from "@/data/Coupon.js";
import events from "@/data/Events.js";
import { cafeNotice } from "@/data/CafeNotice.js";

const Notice = () => {
  const [params] = useSearchParams();
  const tab = params.get("tab") ?? "";

  const tabComponents = {
    "": <FunNoticeList />,
    notice: <OfficialNoticeList data={cafeNotice} />,
    event: <EventList data={events}/>,
    coupons: <CouponList data={coupons}/>,
  };

  useEffect(() => {
    switch (tab) {
      case "coupons":
        document.title = "컴프야펀 | 쿠폰 모아보기";
        break;
      case "event":
        document.title = "컴프야펀 | 이벤트 안내";
        break;
      case "notice":
        document.title = "컴프야펀 | 공식 공지사항";
        break;
      default:
        document.title = "컴프야펀 | 펀 공지사항";
    }
  }, [tab]);

  return (
    <div>
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
