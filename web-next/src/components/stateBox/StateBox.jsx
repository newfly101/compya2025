import styles from "./StateBox.module.scss";

// 로딩 / 오류 / 빈 화면 3분기 공용 박스. 공개·관리자 화면이 같이 쓴다.
// 관리자 전용이던 AdminStateBox 는 이 파일과 스타일이 완전히 같았고 기본 문구만 달라서 지웠다 —
// 관리자 화면은 문구를 전부 직접 넘긴다(이 파일의 기본값은 공개 화면 문구다).
const DEFAULT_MESSAGE = {
  loading: "데이터를 불러오는 중입니다",
  error: "데이터를 받지 못했습니다. 잠시 후 다시 시도해 주세요.",
};

const StateBox = ({ status, message, onRetry, compact = false }) => {
  const text = message ?? DEFAULT_MESSAGE[status];
  const boxClass = compact ? `${styles.box} ${styles.compact}` : styles.box;

  if (status === "loading") {
    return (
      <div className={boxClass} role="status">
        <p className={styles.text}>{text}</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className={boxClass} role="alert">
        <p className={styles.error}>{text}</p>
        {onRetry && (
          <button type="button" className={styles.retryBtn} onClick={onRetry}>
            다시 시도
          </button>
        )}
      </div>
    );
  }

  if (status === "empty") {
    return (
      <div className={boxClass}>
        <p className={styles.text}>{text}</p>
      </div>
    );
  }

  return null;
};

export default StateBox;
