import { cafeNotice } from "@/data/CafeNotice.js";
import coupons from "@/data/Coupon.js";
import FunNoticeList from "@/domains/notices/feature/components/user/lists/FunNoticeList/FunNoticeList.jsx";
import OfficialNoticeList from "@/domains/notices/feature/components/user/lists/officialNoticeList/OfficialNoticeList.jsx";
import CouponList from "@/domains/coupons/feature/components/user/couponList/CouponList.jsx";
import UserEventPage from "@/domains/events/page/user/UserEventPage.jsx";
import UserEventList from "@/domains/events/feature/components/user/lists/UserEventList.jsx";

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
  events: {
    key: "event",
    label: "이벤트",
    title: "컴프야펀 | 이벤트 안내",
    element: <UserEventList />,
  },
  coupons: {
    key: "coupons",
    label: "쿠폰",
    title: "컴프야펀 | 쿠폰 모아보기",
    element: <CouponList data={coupons} />,
  },
}
