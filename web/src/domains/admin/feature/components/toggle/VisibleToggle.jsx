import React from "react";
import styles from "./VisibleToggle.module.scss";

const VisibleToggle = ({ visible, onChange, disabled = false }) => {
  return (
    <button
      type="button"
      className={`${styles.switch} ${visible ? styles.on : styles.off}`}
      onClick={() => onChange?.(!visible)}
      disabled={disabled}
    >
      <span className={styles.knob} />
    </button>
  );
};

export default VisibleToggle;
