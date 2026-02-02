import { useSearchParams, useNavigate } from "react-router-dom";
import { useBoards } from "@/domains/community/feature/hooks/useBoards.js";
import { usePosts } from "@/domains/community/feature/hooks/usePosts.js";
import CommunityHeader from "@/domains/community/feature/components/user/CommunityHeader.jsx";
import BoardTabs from "@/domains/community/feature/components/user/BoardTabs.jsx";
import PostTable from "@/domains/community/feature/components/user/PostTable.jsx";
import styles from "./CommunityList.module.scss";

const CommunityPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const boardCode = params.get("board") ?? "TIP";

  const { boards } = useBoards();
  const posts = usePosts(boardCode);

  const currentBoard = boards.find((b) => b.code === boardCode);

  // 🔹 임시 권한
  const isLogin = true;
  const isAdmin = false;

  const canWrite =
    currentBoard?.writeRole === "USER"
      ? isLogin
      : isAdmin;

  return (
    <div className={styles.communityPage}>
      <BoardTabs boards={boards} active={boardCode} />
      <CommunityHeader
        board={currentBoard}
        canWrite={canWrite}
        onWrite={() => navigate(`/community/write?board=${boardCode}`)}
      />

      <PostTable posts={posts} />
    </div>
  );
};

export default CommunityPage;
