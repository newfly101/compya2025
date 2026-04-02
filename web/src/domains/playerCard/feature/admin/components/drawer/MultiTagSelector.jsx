import React from "react";
import styles from "./AdminPlayerDrawer.module.scss";

const MultiTagSelector = ({ label, field, availableOptions, selectedItems, onAdd, onRemove }) => {
  return (
    <div className={styles.adminPlayerDrawerField}>
      <label>{label}</label>
      <select
        onChange={(e) => {
          onAdd(field, e.target.value);
          e.target.value = "";
        }}
      >
        <option value="">{label} 선택</option>
        {availableOptions.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>

      <div className={styles.adminPlayerDrawerTagSection}>
        {selectedItems.map((item) => (
          <div key={item} className={styles.adminPlayerDrawerTag}>
            <span>{item}</span>
            <button type="button" onClick={() => onRemove(field, item)}>
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MultiTagSelector;
