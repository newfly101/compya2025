import styles from "./Chip.module.scss";

const Chip = ({
  label,
  count,
  selected = false,
  fixedWidth = false,
  onClick,
  type = "button",
}) => {
  const className = [
    styles.chip,
    selected ? styles.selected : "",
    fixedWidth ? styles.fixedWidth : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type={type} className={className} onClick={onClick}>
      <span className={styles.label}>{label}</span>
      {count != null && <span className={styles.count}>{count}</span>}
    </button>
  );
};

export default Chip;
