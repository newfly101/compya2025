import styles from "./AdminToggleSwitch.module.scss";

// 36×20 pill 토글 — 리스트 노출 즉시 저장(optimistic) / 모달 폼 공용.
// 도메인 로직 없음: checked/onChange 만 받는다. 저장 요청은 호출부 책임.
const AdminToggleSwitch = ({ checked, onChange, disabled = false, label }) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={styles.toggle}
      data-on={checked}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        onChange?.(!checked);
      }}
    >
      <span className={styles.knob} />
    </button>
  );
};

export default AdminToggleSwitch;
