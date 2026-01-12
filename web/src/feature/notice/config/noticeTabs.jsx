import { cafeNotice } from "@/data/CafeNotice.js";
import coupons from "@/data/Coupon.js";
import events from "@/data/Events.js";
import FunNoticeList from "@/feature/notice/components/FunNoticeList/FunNoticeList.jsx";
import OfficialNoticeList from "@/feature/notice/components/officialNoticeList/OfficialNoticeList.jsx";
import EventList from "@/feature/notice/components/eventList/EventList.jsx";
import CouponList from "@/feature/notice/components/couponList/CouponList.jsx";

export const NOTICE_TABS = {
  "": {
    key: "",
    label: "컴프야펀 공지사항",
    title: "컴프야펀 | 펀 공지사항",
    element: <FunNoticeList />,
  },
  notice: {
    key: "notice",
    label: "공식카페 공지사항",
    title: "컴프야펀 | 공식 공지사항",
    element: <OfficialNoticeList data={cafeNotice} />,
  },
  event: {
    key: "event",
    label: "이벤트",
    title: "컴프야펀 | 이벤트 안내",
    element: <EventList data={events} />,
  },
  coupons: {
    key: "coupons",
    label: "쿠폰",
    title: "컴프야펀 | 쿠폰 모아보기",
    element: <CouponList data={coupons} />,
  },
}
