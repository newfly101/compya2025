import React from "react";
import styles from "./AdminTableLayout.module.scss";

const AdminActionButton = ({actionTitle, onClick}) => {
  return (
    <button className={styles.primary} onClick={onClick}>{actionTitle}</button>
  );
};

export default AdminActionButton;
