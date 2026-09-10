import React from "react";
import styles from "./QuizSection.module.scss";
import StateBox from "@/global/ui/mobile/stateBox/StateBox.jsx";
import Skeleton from "@/global/ui/mobile/stateBox/Skeleton.jsx";

const QuizSection = ({ quiz = null, loading = false, error = null, retry }) => {
  // 아직 아무 데이터도 없는 최초 로딩/실패만 별도 표시 — 이미 있던 "이미지 없음" 빈 상태는
  // 정상 0건이라 기존 그대로 둔다.
  if (loading && !quiz) return <Skeleton count={1} height={140} />;
  if (error && !quiz) return <StateBox status="error" onRetry={retry} compact />;

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
