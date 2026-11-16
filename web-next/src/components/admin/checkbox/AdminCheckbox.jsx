import styles from "./AdminCheckbox.module.scss";

// 16×16 사각 체크박스 — 표 행 선택 / 헤더 전체선택 공용.
// 도메인 로직 없음: checked/onChange 만 받는다. 클릭 시 행 클릭(onRowClick)으로
// 전파되지 않도록 stopPropagation 을 컴포넌트 안에서 처리한다.
const AdminCheckbox = ({ checked, onChange, ariaLabel, disabled = false }) => {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={ariaLabel}
      className={styles.checkbox}
      data-checked={checked}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        onChange?.(!checked);
      }}
    >
      {checked && <span className={styles.check} />}
    </button>
  );
};

export default AdminCheckbox;
