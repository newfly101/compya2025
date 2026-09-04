import styles from "./AdminSegmented.module.scss";

// 모달 폼 세그먼트 선택(옵션 버튼 나열). options: [{ value, label }]
// 예: 퀴즈 이미지 "URL 입력 | 파일 업로드", 유저 상태 "활성/비활성/탈퇴/영구정지".
const AdminSegmented = ({ options = [], value, onChange, name }) => {
  return (
    <div className={styles.segment} role="radiogroup" aria-label={name}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          role="radio"
          aria-checked={opt.value === value}
          aria-pressed={opt.value === value}
          className={styles.option}
          onClick={() => onChange?.(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};

export default AdminSegmented;
