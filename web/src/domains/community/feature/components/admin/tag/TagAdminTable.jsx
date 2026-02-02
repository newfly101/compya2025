import React, { useState } from "react";
import styles from "@/domains/community/feature/components/admin/board/AdminTable.module.scss";
import TagCreateModal from "@/domains/community/feature/components/admin/tag/modal/TagCreateModal.jsx";
import TagEditModal from "@/domains/community/feature/components/admin/tag/modal/TagEditModal.jsx";
import { useTag } from "@/domains/community/feature/hooks/tag/useTag.js";

const TagAdminTable = () => {
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState(null);
  const { tagLists } = useTag();

  return (
    <>
      <div className={styles.actionBar}>
        <button className={styles.primary} onClick={() => setOpen(true)}>
          태그 추가
        </button>
      </div>

      <table className={styles.table}>
        <thead>
        <tr>
          <th>ID</th>
          <th>CODE</th>
          <th>이름</th>
          <th>설명</th>
          <th>사용</th>
          <th>삭제</th>
          <th>생성일</th>
          <th>수정일</th>
          <th>관리</th>
        </tr>
        </thead>
        <tbody>
        {tagLists?.map((tag) => (
          <tr key={tag.id}>
            <td>{tag.id}</td>
            <td>{tag.code}</td>
            <td>{tag.name}</td>
            <td>{tag.description}</td>
            <td>{tag.visible ? "공개" : "비공개"}</td>
            <td>{tag.deleted ? "비활성화" : "활성화"}</td>
            <td>{tag.createdAt}</td>
            <td>{tag.updatedAt}</td>
            <td>
              <button onClick={() => setEdit(tag)}>수정</button>
            </td>
          </tr>
        ))}
        </tbody>
      </table>

      {open && <TagCreateModal onClose={() => setOpen(false)} />}
      {edit && <TagEditModal onClose={() => setEdit(null)} editTag={edit} />}
    </>
  );
};

export default TagAdminTable;
