import React from "react";
import { POST_MOBILE_TABLE } from "@/domains/community/config/POST_TABLE.js";
import styles from "./PostUserMobileTable.module.scss";


const PostUserMobileTableHead = () => {
  return (
    <tr>
      {POST_MOBILE_TABLE.map((col) => (
        <th key={col.key} className={styles[col.className]}>{col.label}</th>
      ))}
    </tr>
  );
};

export default PostUserMobileTableHead;
