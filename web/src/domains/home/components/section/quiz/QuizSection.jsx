import React from "react";
import styles from "./QuizSection.module.scss";

const QuizSection = ({ quiz = null }) => {
  return (
    <>
      <div className={styles.quizCard}>
        {quiz?.imageUrl ? (
          <img src={quiz.imageUrl} alt="퀴즈 이미지" />
        ) : (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>🖼️</span>
            <span className={styles.emptyText}>이미지가 없습니다</span>
          </div>
        )}
      </div>
      <p className={styles.quizNotice}>
        ※ 매주 금요일 12:00에 신규 퀴즈가 등장합니다. 정답 : 100스타(★)
      </p>
    </>
  );
};

export default QuizSection;
