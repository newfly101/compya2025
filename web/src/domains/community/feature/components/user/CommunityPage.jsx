import React, { useEffect, useState } from "react";
import { ContentPageLayout } from "@/global/layout/contentPageLayout/index.js";
import { ContentPageHeader, useContentPageHeader } from "@/global/ui/contentPageHeader/index.js";
import PostUserTableHead from "@/domains/community/feature/components/user/post/PostUserTableHead.jsx";
import UserTableLayout from "@/global/layout/userLayout/UserTableLayout.jsx";
import UserFilterBar from "@/global/layout/userLayout/UserFilterBar.jsx";
import PostUserTableBody from "@/domains/community/feature/components/user/post/PostUserTableBody.jsx";
import { usePostUserFilter } from "@/domains/community/feature/hooks/user/post/usePostUserFilter.js";
import { useUserPost } from "@/domains/community/feature/hooks/user/post/useUserPost.js";
import { useUserBoard } from "@/domains/community/feature/hooks/user/board/useUserBoards.js";
import CommunityUserBoardTabs from "@/domains/community/feature/components/user/board/CommunityUserBoardTabs.jsx";
import PostUserMobileTableBody from "@/domains/community/feature/components/user/post/mobile/PostUserMobileTableBody.jsx";
import PostUserMobileTableHead
  from "@/domains/community/feature/components/user/post/mobile/PostUserMobileTableHead.jsx";

const CommunityPage = () => {
  const { moveHome } = useContentPageHeader();

  const { boardLists } = useUserBoard();
  const { postLists, handleAddViewCount, useMediaQuery } = useUserPost();
  const { filters, setFilters, filterUnits, filteredData: filteredPosts }
    = usePostUserFilter(postLists);
  const [activeBoard, setActiveBoard] = useState(null);

  useEffect(() => {
    if (boardLists.length > 0 && !activeBoard) {
      setActiveBoard(boardLists[0]);
    }
  }, [boardLists, activeBoard]);

  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <>
      <ContentPageLayout
        header={<ContentPageHeader title={"커뮤니티"}
                                   meta={["팁 모아보기 및 게시판 모아보기"]}
                                   backLabel={"메인으로"}
                                   onBack={moveHome}
        />}
        children={<>
          <CommunityUserBoardTabs boards={boardLists} active={activeBoard?.code} onChange={setActiveBoard} />
          {isMobile ? (
              <UserTableLayout
                filters={<UserFilterBar
                  title={"게시글"}
                  filters={filters}
                  setFilters={setFilters}
                  filterUnits={filterUnits}
                />}
                head={<PostUserMobileTableHead />}
                tbody={
                  <PostUserMobileTableBody
                    posts={filteredPosts}
                    handleClickPost={handleAddViewCount}
                  />
                }
              />
            )
            :
            <UserTableLayout
              filters={<UserFilterBar
                title={"게시글"}
                filters={filters}
                setFilters={setFilters}
                filterUnits={filterUnits}
              />}
              head={<PostUserTableHead />}
              tbody={
                <PostUserTableBody
                  posts={filteredPosts}
                  handleClickPost={handleAddViewCount}
                />
              }
            />}
        </>}
      />
    </>
  );
};

export default CommunityPage;
