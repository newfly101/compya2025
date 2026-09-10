import styles from "./StateBox.module.scss";

// 로딩 / 오류 / 빈 화면 3분기 공용 박스. 공개 화면(모바일 단일 모드) 전용.
// admin/stateBox/AdminStateBox 와 같은 구조 — 전역 토큰만 쓰도록 바꿔서 이쪽으로 가져옴.
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
