import { ContentPageLayout } from "@/global/layout/contentPageLayout/index.js";
import MetaHeader from "@/global/ui/metaHeader/MetaHeader.jsx";
import Tabs from "@/domains/notices/feature/components/Tabs.jsx";
import React from "react";
import styles from "@/app/page/notice/Notice.module.scss";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import TabNavigation from "@/global/ui/navigation/tabNav/TabNavigation.jsx";

const NoticeLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const current = location.pathname.split("/")[2] ?? "";

  const NOTICE_TAB = [
    { key: "", label: "펀 공지", path: "/notice", exact: true },
    { key: "official", label: "공식 공지", path: "/notice/official" },
    { key: "events", label: "이벤트", path: "/notice/events" },
    { key: "coupons", label: "쿠폰", path: "/notice/coupons" },
  ];

  return (
    <ContentPageLayout
      header={
        <MetaHeader
          title="공지사항"
          description="공식/컴투스프로야구 공지, 이벤트, 쿠폰을 한 곳에서 확인하세요."
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
