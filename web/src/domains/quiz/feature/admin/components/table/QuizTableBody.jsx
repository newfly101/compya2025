import React from "react";
import { QUIZ_TABLE } from "@/domains/quiz/config/quizTable.config.js";
import VisibleToggle from "@/domains/admin/feature/components/toggle/VisibleToggle.jsx";
import styles from "@/domains/events/feature/admin/components/table/EventTable.module.scss";

const QuizTableBody = ({ quizAnswers, changeVisible, setEditQuiz }) => {
  if (quizAnswers.length === 0) {
    return (
      <tr>
        <td colSpan={QUIZ_TABLE.length} className={styles.empty}>
          등록된 퀴즈 정답이 없습니다.
        </td>
      </tr>
    );
  }

  return quizAnswers.map((q) => (
    <tr key={q.id}>
      <td>{q.id}</td>
      <td>{q.round}회</td>
      <td>{q.title}</td>
      <td><img src={q.imageUrl} alt={`quiz-${q.round}`} className={styles.thumbnail} /></td>
      <td><VisibleToggle visible={q.visible} onChange={changeVisible(q.id)} /></td>
      <td>
        <div className={styles.actions}>
          <button onClick={() => setEditQuiz(q)}>수정</button>
        </div>
      </td>
    </tr>
  ));
};

export default QuizTableBody;
