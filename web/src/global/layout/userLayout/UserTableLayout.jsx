import React from "react";
import styles from "./UserTableLayout.module.scss";

const UserTableLayout = ({filters, head, tbody }) => {
  return (
    <section className={styles.wrapper}>
      {filters}
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

export default UserTableLayout;
