import { useSelector } from "react-redux";
import "./community.tokens.scss";
import CategoryChip from "./components/categoryChip/CategoryChip.jsx";
import PostRow from "./components/postRow/PostRow.jsx";
import Section from "./components/section/Section.jsx";
import { useUserBoard } from "@/domains/community/feature/hooks/user/board/useUserBoards.js";
import { useUserPost } from "@/domains/community/feature/hooks/user/post/useUserPost.js";
import { useDomainTopBar } from "@/app/wrapper/mobile/hooks/useDomainTopBar";
import { formatCount, mapPostForRow } from "./utils.js";
import styles from "./CommunityScreen.module.scss";

// 읽기 전용 재오픈(2026-08-31) — v1 게시글 237건은 전부 본문 없는 외부 링크(북마크) 라
// 글쓰기/댓글/좋아요는 붙이지 않는다. noindex 처리는 infra/seo/routeSeo.js 참조.
const CommunityScreen = () => {
  useDomainTopBar("커뮤니티");

  const { boardLists, activeBoardId, selectBoard } = useUserBoard();
  const { postLists } = useUserPost(activeBoardId);
  const { loading, error } = useSelector((state) => state.community);

  const activeBoard = boardLists.find((b) => b.id === activeBoardId);

  const handlePostClick = (post) => {
    // v1 이관 게시글은 전부 linkType=EXTERNAL — 새 탭으로 원문 링크를 연다.
    // 그 외 타입은 아직 상세 화면 라우트가 없어 아무 동작도 하지 않는다.
    if (post.linkType === "EXTERNAL" && post.externalUrl) {
      window.open(post.externalUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.categoryRow}>
        {boardLists.map((board) => (
          <CategoryChip
            key={board.id}
            label={board.name}
            selected={activeBoardId === board.id}
            onClick={() => selectBoard(board.id)}
          />
        ))}
      </div>

      <Section
        title={activeBoard?.name ?? "게시글"}
        rightText={`총 ${formatCount(postLists.length)}개`}
      >
        {loading ? (
          <p className={styles.stateText}>불러오는 중입니다.</p>
        ) : error ? (
          <p className={styles.stateText}>게시글을 불러오지 못했습니다.</p>
        ) : postLists.length === 0 ? (
          <p className={styles.stateText}>등록된 게시글이 없습니다.</p>
        ) : (
          <div className={styles.list}>
            {postLists.map((post) => (
              <PostRow
                key={post.id}
                post={mapPostForRow(post)}
                onClick={() => handlePostClick(post)}
              />
            ))}
          </div>
        )}
      </Section>

      {/* 글쓰기 — 서버 인증 정비 전이라 비활성. 버튼이 아닌 안내 문구로만 노출 */}
      <p className={styles.writeNotice}>글쓰기는 준비 중입니다</p>
    </main>
  );
};

export default CommunityScreen;
