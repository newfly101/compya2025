// global/layout/adminPageLayout 폐기 (2026-05-09) — AdminTableLayout / AdminFilterBar wrap 제거. children (head / body / 등록 액션) 만 인라인 유지
import React from "react";
import { useAdminQuizTable } from "@/domains/quiz/feature/admin/hooks/useAdminQuizTable.js";
import { useTableModal } from "@/global/hooks/useTableModal.js";
import QuizTableHead from "./table/QuizTableHead.jsx";
import QuizTableBody from "./table/QuizTableBody.jsx";
import QuizCreateModal from "./modal/QuizCreateModal.jsx";
import QuizEditModal from "./modal/QuizEditModal.jsx";

const AdminQuizTable = () => {
  const { quizAnswers } = useAdminQuizTable();
  const { createOpen, editTarget, openCreate, closeCreate, openEdit, closeEdit } = useTableModal();

  return (
    <>
      <h2>퀴즈 정답</h2>
      <button type="button" onClick={openCreate}>퀴즈 정답 등록</button>
      <table className="adminTableQuiz">
        <thead>
          <QuizTableHead />
        </thead>
        <tbody>
          <QuizTableBody
            quizAnswers={quizAnswers}
            setEditQuiz={openEdit}
          />
        </tbody>
      </table>
      {createOpen && <QuizCreateModal onClose={closeCreate} />}
      {editTarget && <QuizEditModal quiz={editTarget} onClose={closeEdit} />}
    </>
  );
};

export default AdminQuizTable;
