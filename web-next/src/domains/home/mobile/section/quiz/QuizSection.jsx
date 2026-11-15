import styles from "./QuizSection.module.scss";

// TODO(next-migration): 퀴즈 이미지는 외부 URL 이라 next/image 대신 <img> — 도메인 허용 설정 후 교체 검토
const QuizSection = ({ quiz = null }) => (
  <>
    <div className={styles.quizCard}>
      {quiz?.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
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

export default QuizSection;
