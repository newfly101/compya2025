import React from "react";
import styles from "./AdminTableLayout.module.scss";

const AdminTableLayout = ({actions=null, filters, head, tbody }) => {
  return (
    <section className={styles.wrapper}>
      {actions}
      {filters && (
        <div className={styles.filterBar}>
          {filters}
        </div>
      )}
      <table className={styles.table}>
        <thead>
        {head}
        </thead>
        <tbody>
          {tbody}
        </tbody>
      </table>
    </section>
  );
};

export default AdminTableLayout;
