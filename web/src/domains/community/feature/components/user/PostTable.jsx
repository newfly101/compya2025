import EmptyState from "@/domains/community/feature/components/user/EmptyState.jsx";
import styles from "./CommunityList.module.scss";

const PostTable = ({ posts }) => {
  if (!posts || posts.length === 0) {
    return <EmptyState message="게시글이 없습니다." />;
  }

  return (
    <table className={styles.postTable}>
      <thead>
      <tr>
        <th>No</th>
        <th>제목</th>
        <th>글쓴이</th>
        <th>작성일</th>
        <th>조회</th>
      </tr>
      </thead>
      <tbody>
      {posts.map((post) => (
        <tr key={post.id}>
          <td>{post.id}</td>
          <td className={styles.title}>{post.title}</td>
          <td>{post.authorName}</td>
          <td>{post.createdAt}</td>
          <td>{post.viewCount}</td>
        </tr>
      ))}
      </tbody>
    </table>
  );
};

export default PostTable;
