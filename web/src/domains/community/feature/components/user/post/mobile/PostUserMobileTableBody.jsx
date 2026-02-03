import React from "react";
import styles from "./PostUserMobileTable.module.scss";
import { POST_MOBILE_TABLE } from "@/domains/community/config/POST_TABLE.js";

const PostUserMobileTableBody = ({ posts, handleClickPost }) => {

  if (posts.length === 0) {
    return (
      <tr>
        <td colSpan={POST_MOBILE_TABLE.length} className={styles.empty}>
          등록된 게시글이 없습니다.
        </td>
      </tr>
    );
  }

  return (
    posts?.map(post => (
      <tr key={post.id} className={styles.id}>
        <td className={styles.colId}>{post.id}</td>
        <td className={styles.titleWrapper} onClick={() => handleClickPost(post)}>
          <span className={styles.titleText}>{post.title}</span>
        </td>
        <td className={styles.colView}>{post.viewCount}</td>
      </tr>
    ))
  );
};

export default PostUserMobileTableBody;
