import styles from "./AdminNoticeManagePage.module.scss";

const MOCK_NOTICES = [
  {
    id: 1,
    title: "서버 점검 안내",
    type: "SYSTEM",
    visible: true,
    pinned: true,
    createdAt: "2026-01-20",
    updatedAt: "2026-01-28",
  },
  {
    id: 2,
    title: "이벤트 시작 안내",
    type: "EVENT",
    visible: false,
    pinned: false,
    createdAt: "2026-01-18",
    updatedAt: "2026-01-18",
  },
];

const AdminNoticeManagePage = () => {
  return (
    <div className={styles.wrapper}>
      <button className={styles.create}>공지 작성</button>

      <table className={styles.table}>
        <thead>
        <tr>
          <th>ID</th>
          <th>제목</th>
          <th>유형</th>
          <th>노출</th>
          <th>고정</th>
          <th>작성일</th>
          <th>수정일</th>
          <th>액션</th>
        </tr>
        </thead>
        <tbody>
        {MOCK_NOTICES.map(n => (
          <tr key={n.id}>
            <td>{n.id}</td>
            <td>{n.title}</td>
            <td>{n.type}</td>
            <td>{n.visible ? "공개" : "비공개"}</td>
            <td>{n.pinned ? "고정" : "-"}</td>
            <td>{n.createdAt}</td>
            <td>{n.updatedAt}</td>
            <td>
              <button>수정</button>
              <button>비공개</button>
              <button className={styles.danger}>삭제</button>
            </td>
          </tr>
        ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminNoticeManagePage;
