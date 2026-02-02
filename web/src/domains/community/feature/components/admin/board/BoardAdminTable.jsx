import BoardFormDrawer from "./modal/BoardFormDrawer.jsx";
import { useState } from "react";
import styles from "./AdminTable.module.scss";
import { useBoards } from "@/domains/community/feature/hooks/useBoards.js";

const BoardAdminTable = () => {
  const [open, setOpen] = useState(false);
  const {boardLists, onSubmit} = useBoards();

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
        {boardLists && boardLists.map(board => (
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

      {open && <BoardFormDrawer onClose={() => setOpen(false)} onSubmit={onSubmit} />}
    </>
  );
};

export default BoardAdminTable;
