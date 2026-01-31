import React from "react";
import styles from "./AdminTableLayout.module.scss";

const AdminTableLayout = ({actions=null, filters, head, body }) => {
  return (
    <section className={styles.wrapper}>
      {actions}
      <div className={styles.filterBar}>
        {filters}
      </div>
      <table className={styles.table}>
        <thead>
          {head}
        </thead>
        <tbody>
          {body}
        </tbody>
      </table>

    </section>
  );
};

export default AdminTableLayout;
