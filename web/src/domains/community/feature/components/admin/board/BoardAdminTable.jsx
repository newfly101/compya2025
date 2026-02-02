import { useState } from "react";
import styles from "./AdminTable.module.scss";
import { useBoards } from "@/domains/community/feature/hooks/board/useBoards.js";
import BoardCreateModal from "@/domains/community/feature/components/admin/board/modal/BoardCreateModal.jsx";
import BoardEditModal from "@/domains/community/feature/components/admin/board/modal/BoardEditModal.jsx";


const BoardAdminTable = () => {
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState(null);
  const {boardLists} = useBoards();


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
          <th>설명</th>
          <th>작성권한</th>
          <th>읽기권한</th>
          <th>노출</th>
          <th>삭제</th>
          <th>관리</th>
        </tr>
        </thead>
        <tbody>
        {boardLists?.map((board) => (
          <tr key={board.id}>
            <td>{board.code}</td>
            <td>{board.name}</td>
            <td>{board.description}</td>
            <td>{board.writeRole}</td>
            <td>{board.readRole}</td>
            <td>{board.visible ? "ON" : "OFF"}</td>
            <td>{board.deleted ? "ON" : "OFF"}</td>
            <td>
              <button onClick={() => setEdit(board)}>수정</button>
            </td>
          </tr>
        ))}
        </tbody>
      </table>

      {open && <BoardCreateModal onClose={() => setOpen(false)}/>}
      {edit && <BoardEditModal onClose={() => setEdit(null)} editBoard={edit}/>}
    </>
  );
};

export default BoardAdminTable;
