import React, { useState } from "react";
import styles from "./CommunityManagePage.module.scss";
import CommunityAdminTabs from "@/domains/community/feature/components/admin/tabs/CommunityAdminTabs.jsx";
import BoardAdminTable from "@/domains/community/feature/components/admin/board/BoardAdminTable.jsx";
import PostAdminTable from "@/domains/community/feature/components/admin/post/PostAdminTable.jsx";
import CommentAdminTable from "@/domains/community/feature/components/admin/board/CommentAdminTable.jsx";
import TagAdminTable from "@/domains/community/feature/components/admin/tag/TagAdminTable.jsx";

const CommunityManagePage = () => {
  const [tab, setTab] = useState("boards");


  return (
    <div className={styles.page}>
      <h1 className={styles.title}>커뮤니티 관리</h1>

      <CommunityAdminTabs active={tab} onChange={setTab} />

      {tab === "boards" && <BoardAdminTable />}
      {tab === "posts" && <PostAdminTable />}
      {tab === "comments" && <CommentAdminTable />}
      {tab === "tags" && <TagAdminTable />}
    </div>
  );
};

export default CommunityManagePage;
