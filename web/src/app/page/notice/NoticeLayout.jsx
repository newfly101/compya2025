import { ContentPageLayout } from "@/global/layout/contentPageLayout/index.js";
import ContentPageHeader from "@/global/ui/contentPageHeader/ContentPageHeader";
import React from "react";
import styles from "@/app/page/notice/Notice.module.scss";
import { Outlet, useNavigate } from "react-router-dom";
import TabNavigation from "@/global/ui/navigation/tabNav/TabNavigation.jsx";

const NoticeLayout = () => {
  const navigate = useNavigate();

  const NOTICE_TAB = [
    { key: "", label: "펀 공지", path: "/notice", exact: true },
    { key: "official", label: "공식 공지", path: "/notice/official" },
    { key: "events", label: "이벤트", path: "/notice/events" },
    { key: "coupons", label: "쿠폰", path: "/notice/coupons" },
  ];

  return (
    <ContentPageLayout
      header={
        <ContentPageHeader
          title="공지사항"
          backLabel="홈으로"
          onBack={() => navigate("/")}
        />
      }
    >
      <section className={styles.noticeContentSection}>

        <TabNavigation tabs={NOTICE_TAB} />

        <Outlet />
      </section>
    </ContentPageLayout>
  );
};

export default NoticeLayout;
