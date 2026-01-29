import styles from "./EventVisibilityToggle.module.scss";
import { useState } from "react";

const EventVisibilityToggle = ({ visible, onChange }) => {
  const [on, setOn] = useState(Boolean(visible));

  const handleToggle = () => {
    const next = !on;
    setOn(next);
    onChange?.(next); // ← PATCH 연결 포인트
  };

  return (
    <button
      type="button"
      className={`${styles.switch} ${on ? styles.on : styles.off}`}
      onClick={handleToggle}
    >
      <span className={styles.knob} />
    </button>
  );
};


export default EventVisibilityToggle;
