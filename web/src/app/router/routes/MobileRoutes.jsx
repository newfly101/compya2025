// src/app/router/routes/MobileRoutes.jsx
//
// 모바일 전용 페이지
// PublicRoutes에 이미 있는 경로를 모바일 컴포넌트로 override하거나
// 모바일 전용 신규 라우트 추가
//
// 사용법:
//   현재 PublicRoutes의 element를 모바일 컴포넌트로 교체하거나
//   이 파일을 router.js에 별도 children으로 추가

import { lazy } from "react";

// 모바일 전용 페이지 컴포넌트
// 아직 없으면 주석 처리 후 하나씩 추가
const MobileHome         = lazy(() => import("@/domains/mobile/Home/pages/MobileHomePage.jsx"));
// const MobileCouponPage   = lazy(() => import("@/domains/mobile/home/pages/coupon/MobileCouponPage.jsx"));
// const MobileEventPage    = lazy(() => import("@/domains/mobile/home/pages/event/MobileEventPage.jsx"));
// const MobileNoticePage   = lazy(() => import("@/domains/mobile/home/pages/notice/MobileNoticePage.jsx"));
// const MobileCommunityPage= lazy(() => import("@/domains/mobile/home/pages/community/MobileCommunityPage.jsx"));
// const MobileDictionary   = lazy(() => import("@/domains/mobile/home/pages/dictionary/MobileDictionaryPage.jsx"));

export const MobileRoutes = [
  { index: true,           element: <MobileHome />,          handle: { title: "컴프야펀 | 홈" } },
  // { path: "notice/coupons",element: <MobileCouponPage />,    handle: { title: "컴프야펀 | 쿠폰 코드" } },
  // { path: "notice/events", element: <MobileEventPage />,     handle: { title: "컴프야펀 | 이벤트" } },
  // { path: "notice",        element: <MobileNoticePage />,    handle: { title: "컴프야펀 | 공지사항" } },
  // { path: "community",     element: <MobileCommunityPage />, handle: { title: "컴프야펀 | 커뮤니티" } },
  // { path: "dictionary",    element: <MobileDictionary />,    handle: { title: "컴프야펀 | 도감" } },
];
