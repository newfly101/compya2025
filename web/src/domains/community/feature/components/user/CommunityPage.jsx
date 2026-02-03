import React, { useEffect } from "react";
import { ContentPageLayout } from "@/global/layout/contentPageLayout/index.js";
import { ContentPageHeader, useContentPageHeader } from "@/global/ui/contentPageHeader/index.js";
import { useDispatch, useSelector } from "react-redux";
import { requestGetUserBoardLists } from "@/domains/community/store/index.js";
import PostUserTableHead from "@/domains/community/feature/components/user/post/PostUserTableHead.jsx";
import UserTableLayout from "@/global/layout/userLayout/UserTableLayout.jsx";
import UserFilterBar from "@/global/layout/userLayout/UserFilterBar.jsx";
import PostUserTableBody from "@/domains/community/feature/components/user/post/PostUserTableBody.jsx";
import { usePostUserFilter } from "@/domains/community/feature/hooks/user/post/usePostUserFilter.js";
import { useUserPost } from "@/domains/community/feature/hooks/user/post/useUserPost.js";
import { useUserBoard } from "@/domains/community/feature/hooks/user/board/useUserBoards.js";

const CommunityPage = () => {
  const dispatch = useDispatch();
  const { moveHome } = useContentPageHeader();

  // todo : board Tap 구현해서 UserTableLayout 에 삽입해야 함
  const {boardLists } = useUserBoard();
  const { postLists, handleAddViewCount } = useUserPost();
  const { filters, setFilters, filterUnits, filteredData: filteredPosts }
    = usePostUserFilter(postLists);

  useEffect(() => {
    dispatch(requestGetUserBoardLists());
  }, [dispatch]);

  return (
    <>
      <ContentPageLayout
        header={<ContentPageHeader title={"커뮤니티"}
                                   meta={["팁 모아보기 및 게시판 모아보기"]}
                                   backLabel={"메인으로"}
                                   onBack={moveHome}
        />}
        children={<>
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
                handleAddCount={handleAddViewCount}
              />
            }
          />
        </>}
        />
    </>
  );
};

export default CommunityPage;
