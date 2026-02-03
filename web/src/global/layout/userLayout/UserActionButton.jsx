import React from "react";
import styles from "./UserTableLayout.module.scss";

const UserActionButton = ({actionTitle, onClick}) => {
  return (
    <button className={styles.primary} onClick={onClick}>{actionTitle}</button>
  );
};

export default UserActionButton;
