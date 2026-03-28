import React from "react";
import AdminTableLayout from "@/global/layout/adminPageLayout/table/AdminTableLayout.jsx";
import AdminFilterBar from "@/global/layout/adminPageLayout/table/AdminFilterBar.jsx";
import { useAdminQuizTable } from "@/domains/quiz/feature/admin/hooks/useAdminQuizTable.js";
import { useTableModal } from "@/global/hooks/useTableModal.js";
import QuizTableHead from "./table/QuizTableHead.jsx";
import QuizTableBody from "./table/QuizTableBody.jsx";
import QuizCreateModal from "./modal/QuizCreateModal.jsx";
import QuizEditModal from "./modal/QuizEditModal.jsx";

const AdminQuizTable = () => {
  const { quizAnswers, changeVisible } = useAdminQuizTable();
  const { createOpen, editTarget, openCreate, closeCreate, openEdit, closeEdit } = useTableModal();

  return (
    <>
      <AdminTableLayout
        filters={
          <AdminFilterBar title="퀴즈 정답" onCreate={openCreate} />
        }
        head={<QuizTableHead />}
        tbody={
          <QuizTableBody
            quizAnswers={quizAnswers}
            changeVisible={changeVisible}
            setEditQuiz={openEdit}
          />
        }
        tableClass="adminTableQuiz"
      />
      {createOpen && <QuizCreateModal onClose={closeCreate} />}
      {editTarget && <QuizEditModal quiz={editTarget} onClose={closeEdit} />}
    </>
  );
};

export default AdminQuizTable;
