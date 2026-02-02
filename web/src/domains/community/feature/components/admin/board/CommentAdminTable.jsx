import styles from "./AdminTable.module.scss";

const MOCK_COMMENTS = [
  { id: 1, content: "댓글입니다", author: "user02" },
];

const CommentAdminTable = () => {
  return (
    <table className={styles.table}>
      <thead>
      <tr>
        <th>내용</th>
        <th>작성자</th>
        <th>관리</th>
      </tr>
      </thead>
      <tbody>
      {MOCK_COMMENTS.map(c => (
        <tr key={c.id}>
          <td>{c.content}</td>
          <td>{c.author}</td>
          <td>
            <button>숨김</button>
          </td>
        </tr>
      ))}
      </tbody>
    </table>
  );
};

export default CommentAdminTable;
