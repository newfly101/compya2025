import styles from "./CategoryChip.module.scss";

const CategoryChip = ({ label, selected = false, onClick }) => {
  return (
    <button
      type="button"
      className={`${styles.chip} ${selected ? styles.selected : ""}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
};

export default CategoryChip;
