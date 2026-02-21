import React from "react";
import styles from "./AdminTableLayout.module.scss";

const AdminActionButton = ({ actionTitle, onClick }) => {
  return (
    <button
      type="button"
      className={styles.adminActionButton}
      onClick={onClick}
    >
      {actionTitle}
    </button>
  );
};

export default AdminActionButton;
