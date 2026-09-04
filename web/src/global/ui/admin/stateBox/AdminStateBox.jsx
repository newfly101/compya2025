import styles from "./AdminStateBox.module.scss";

// 로딩 / 오류 / 빈 목록 3분기 텍스트 박스.
// 5개 어드민 화면(퀴즈·이벤트·쿠폰·공지·유저관리) 공용.
const AdminStateBox = ({ status, message, onRetry }) => {
  if (status === "loading") {
    return (
      <div className={styles.box}>
        <p className={styles.text}>{message ?? "불러오는 중..."}</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className={styles.box}>
        <p className={styles.error}>{message ?? "목록을 불러오지 못했습니다."}</p>
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
      <div className={styles.box}>
        <p className={styles.text}>{message ?? "표시할 항목이 없습니다."}</p>
      </div>
    );
  }

  return null;
};

export default AdminStateBox;
