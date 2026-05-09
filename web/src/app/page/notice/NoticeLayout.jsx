// global/layout/contentPageLayout 폐기 (2026-05-09) — ContentPageLayout wrap 제거. children section 만 유지
import React from "react";
import styles from "@/app/page/notice/Notice.module.scss";
import { Outlet } from "react-router-dom";
import TabNavigation from "@/global/ui/navigation/tabNav/TabNavigation.jsx";

const NoticeLayout = () => {
  const NOTICE_TAB = [
    { key: "", label: "펀 공지", path: "/notice", exact: true },
    { key: "official", label: "공식 공지", path: "/notice/official" },
    { key: "events", label: "이벤트", path: "/notice/events" },
    { key: "coupons", label: "쿠폰", path: "/notice/coupons" },
  ];

  return (
    <section className={styles.noticeContentSection}>

      <TabNavigation tabs={NOTICE_TAB} />

      <Outlet />
    </section>
  );
};

export default NoticeLayout;
