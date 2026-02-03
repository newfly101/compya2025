import React from "react";
import styles from "./PostUserTable.module.scss";
import { POST_TABLE } from "@/domains/community/config/POST_TABLE.js";

const PostUserTableBody = ({ posts, handleClickPost }) => {

  if (posts.length === 0) {
    return (
      <tr>
        <td colSpan={POST_TABLE.length} className={styles.empty}>
          등록된 게시글이 없습니다.
        </td>
      </tr>
    );
  }

  return (
    posts?.map(post => (
      <tr key={post.id}>
        <td>{post.id}</td>
        <td className={styles.titleWrapper} onClick={() => handleClickPost(post)}>
          <span className={styles.titleText}>{post.title}</span>
          <span className={styles.tooltip}>{post.title}</span>
        </td>
        <td>{post.viewCount}</td>
        <td>{post.authorName}</td>
        <td>{post.updatedAt}</td>
      </tr>
    ))
  );
};

export default PostUserTableBody;
