import React from "react";
import styles from "./PostUserTable.module.scss";
import { POST_TABLE } from "@/domains/community/config/POST_TABLE.js";

const PostUserTableBody = ({ posts, handleAddCount }) => {

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
        <td>{post.boardId}</td>
        <td className={styles.titleWrapper}>
          <span className={styles.titleText}>{post.title}</span>
          <span className={styles.tooltip}>{post.title}</span>
        </td>
        <td><a href={post.externalUrl} target="_blank" rel="noreferrer" onClick={handleAddCount}>링크</a></td>
        <td>{post.viewCount}</td>
        <td>{post.authorName}</td>
        <td>{post.updatedAt}</td>
      </tr>
    ))
  );
};

export default PostUserTableBody;
