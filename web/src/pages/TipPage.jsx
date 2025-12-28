import React from "react";
import styles from "@/styles/pages/TipPage.module.scss";

const posts = [
  {
    id: 1,
    title: "홈런더비 점수 계산 고찰2",
    author: "dprian",
    writtenAt: "2025-10-14",
    updatedAt: "2025-12-28",
    tags: ["홈런더비", "초보자"],
    url: "https://cafe.naver.com/xxxx"
  },
  {
    id: 2,
    title: "홈런더비 점수 계산 고찰1",
    author: "리룬지우",
    writtenAt: "2025-08-24",
    updatedAt: "2025-12-28",
    tags: [],
    url: "https://cafe.naver.com/yyyy"
  },
  {
    id: 3,
    title: "홈런더비 점수 공식 완전정리",
    author: "baseball",
    writtenAt: "2025-07-02",
    updatedAt: "2025-12-28",
    tags: ["공식", "계산법", "필독"],
    url: "https://cafe.naver.com/zzzz"
  }
];

const TipPage = () => {
  return (
    <main className={styles.container}>
      <h1 className={styles.title}>팁 게시판</h1>

      <table className={styles.table}>
        <colgroup>
          <col />
          <col className={styles.colAuthor} />
          <col className={styles.colDate} />
          <col className={styles.colDate} />
        </colgroup>

        <thead>
        <tr>
          <th>제목</th>
          <th className={styles.thRight}>작성자</th>
          <th className={styles.thRight}>글작성일</th>
          <th className={styles.thRight}>게시일</th>
        </tr>
        </thead>

        {posts.map(post => (
          <tbody
            key={post.id}
            className={styles.group}
            onClick={() => window.open(post.url, "_blank")}
          >
          <tr>
            {post.tags.length === 0 ?
              <td className={styles.titleCell}>
                {post.title}
              </td>
              :
              <td className={styles.titleCell}>
                <div className={styles.titleRow}>
                  {post.title}
                </div>
                <div className={styles.tagRow}>
                  {post.tags.map(tag => (
                    <span key={"tip-" + tag} className={styles.tag}>
                #{tag}
              </span>
                  ))}
                </div>
              </td>
            }


            <td className={styles.centerCell}>
              {post.author}
            </td>

            <td className={styles.centerCell}>
              {post.writtenAt}
            </td>
            <td className={styles.centerCell}>
              {post.updatedAt}
            </td>
          </tr>
          </tbody>
        ))}
      </table>
    </main>
  );
};

export default TipPage;
