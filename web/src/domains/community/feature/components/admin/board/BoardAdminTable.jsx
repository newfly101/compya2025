import BoardFormDrawer from "./BoardFormDrawer";
import { useState } from "react";
import styles from "./AdminTable.module.scss";

const MOCK_BOARDS = [
  { id: 1, code: "TIP", name: "팁", writeRole: "ADMIN", visible: true },
  { id: 2, code: "FREE", name: "자유", writeRole: "USER", visible: true },
];

const BoardAdminTable = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className={styles.actionBar}>
        <button className={styles.primary} onClick={() => setOpen(true)}>
          게시판 추가
        </button>
      </div>

      <table className={styles.table}>
        <thead>
        <tr>
          <th>코드</th>
          <th>게시판명</th>
          <th>작성권한</th>
          <th>노출</th>
          <th>관리</th>
        </tr>
        </thead>
        <tbody>
        {MOCK_BOARDS.map(board => (
          <tr key={board.id}>
            <td>{board.code}</td>
            <td>{board.name}</td>
            <td>{board.writeRole}</td>
            <td>{board.visible ? "ON" : "OFF"}</td>
            <td>
              <button>수정</button>
            </td>
          </tr>
        ))}
        </tbody>
      </table>

      {open && <BoardFormDrawer onClose={() => setOpen(false)} />}
    </>
  );
};

export default BoardAdminTable;
