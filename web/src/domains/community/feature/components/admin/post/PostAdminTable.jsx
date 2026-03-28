import styles from "./AdminTable.module.scss";
import { usePosts } from "@/domains/community/feature/hooks/admin/post/usePosts.js";
import { useTableModal } from "@/global/hooks/useTableModal.js";
import PostCreateModal from "@/domains/community/feature/components/admin/post/modal/PostCreateModal.jsx";
import PostEditModal from "@/domains/community/feature/components/admin/post/modal/PostEditModal.jsx";

const PostAdminTable = () => {
  const { postLists } = usePosts();
  const { createOpen, editTarget, openCreate, closeCreate, openEdit, closeEdit } = useTableModal();

  return (
    <>
      <div className={styles.actionBar}>
        <button className={styles.primary} onClick={openCreate}>
          게시글 추가
        </button>
      </div>

      <table className={styles.table}>
        <thead>
        <tr>
          <th>게시판ID</th>
          <th>유형</th>
          <th>작성자명</th>
          <th>제목</th>
          <th>글감</th>
          <th>링크</th>
          <th>고정</th>
          <th>노출</th>
          <th>조회수</th>
          <th>관리</th>
        </tr>
        </thead>
        <tbody>
        {postLists?.map(post => (
          <tr key={post.id}>
            <td>{post.boardId}</td>
            <td>{post.authorType}</td>
            <td>{post.authorName}</td>
            <td className={styles.titleWrapper}>
              <span className={styles.titleText}>{post.title}</span>
              <span className={styles.tooltip}>{post.title}</span>
            </td>
            <td>{post.linkType}</td>
            <td><a href={post.externalUrl} target="_blank" rel="noreferrer">링크</a></td>
            <td>{post.pinned ? "고정" : "해제"}</td>
            <td>{post.visible ? "노출" : "숨김"}</td>
            <td>{post.viewCount}</td>
            <td>
              <button onClick={() => openEdit(post)}>수정</button>
            </td>
          </tr>
        ))}
        </tbody>
      </table>

      {createOpen && <PostCreateModal onClose={closeCreate} />}
      {editTarget && <PostEditModal onClose={closeEdit} editPost={editTarget} />}
    </>
  );
};

export default PostAdminTable;
