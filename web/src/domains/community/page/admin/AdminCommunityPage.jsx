import React from "react";
import CommunityManagePage from "@/domains/community/feature/components/admin/CommunityManagePage.jsx";
import ResponseListener from "@/app/store/operation/ResponseListener.jsx";

const AdminCommunityPage = () => {
  return (
    <>
      <CommunityManagePage />
      <ResponseListener />
    </>
  );
};

export default AdminCommunityPage;
