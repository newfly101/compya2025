import React from "react";
import { POST_TABLE } from "@/domains/community/config/POST_TABLE.js";

const PostUserTableHead = () => {
  return (
    <tr>
      {POST_TABLE.map((col) => (
        <th key={col.key}>{col.label}</th>
      ))}
    </tr>
  );
};

export default PostUserTableHead;
