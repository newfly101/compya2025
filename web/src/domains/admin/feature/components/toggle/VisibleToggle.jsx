import React from "react";
import styles from "./VisibleToggle.module.scss";

const VisibleToggle = ({ value, onChange, disabled = false }) => {
  return (
    <button
      type="button"
      className={`${styles.switch} ${value ? styles.on : styles.off}`}
      onClick={() => onChange?.(!value)}
      disabled={disabled}
    >
      <span className={styles.knob} />
    </button>
  );
};

export default VisibleToggle;
