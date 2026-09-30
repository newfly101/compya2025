import styles from "./FilterChips.module.scss";

/**
 * 한 줄 선택 칩 — `pill`(둥근 칩, 가로 스크롤) · `seg`(같은 폭 3칸).
 * 선택 = brand 테두리 + tint 면 (Figma chip/전체 · seg/전체).
 * options: [{ value, label, dot? }]
 */
const FilterChips = ({ options, value, onChange, variant = "pill", label }) => (
  <div className={variant === "seg" ? styles.seg : styles.row} role="group" aria-label={label}>
    {options.map((o) => (
      <button
        key={o.value}
        type="button"
        className={styles.chip}
        aria-pressed={o.value === value}
        onClick={() => onChange(o.value)}
      >
        {o.dot && <span className={styles.dot} style={{ color: o.dot }} aria-hidden="true" />}
        {o.label ?? o.value}
      </button>
    ))}
  </div>
);

export default FilterChips;
