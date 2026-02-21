import React from "react";
import styles from "./AdminTableLayout.module.scss";

const AdminTableLayout = ({ filters, head, tbody, tableClass="" }) => {
  return (
    <section className={styles.adminTableSection}>
      {filters && (
        <div className={styles.adminTableFilter}>
          {filters}
        </div>
      )}

      <div className={`${styles.adminTableContainer} adminTableContainer`}>
        <table className={`${styles.adminTable} ${tableClass}`}>
          <thead className={`${styles.adminTableHead}`}>
          {head}
          </thead>
          <tbody className={`${styles.adminTableBody}`}>
          {tbody}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default AdminTableLayout;
