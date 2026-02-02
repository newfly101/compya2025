import styles from "./AdminTable.module.scss";

const MOCK_POSTS = [
  { id: 1, board: "FREE", title: "테스트 글", author: "user01", visible: true },
];

const PostAdminTable = () => {
  return (
    <table className={styles.table}>
      <thead>
      <tr>
        <th>게시판</th>
        <th>제목</th>
        <th>작성자</th>
        <th>상태</th>
        <th>관리</th>
      </tr>
      </thead>
      <tbody>
      {MOCK_POSTS.map(post => (
        <tr key={post.id}>
          <td>{post.board}</td>
          <td>{post.title}</td>
          <td>{post.author}</td>
          <td>{post.visible ? "노출" : "숨김"}</td>
          <td>
            <button>숨김</button>
          </td>
        </tr>
      ))}
      </tbody>
    </table>
  );
};

export default PostAdminTable;
