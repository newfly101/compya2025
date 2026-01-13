import React, { useMemo } from "react";
import styles from "@/pages/tipCollection/TipPage.module.scss";
import { postData, posts } from "@/data/board/TipBoard.js";
import Tabs from "@/feature/notice/components/Tabs.jsx";
import { tip2025data } from "@/data/board/tips2025.js";
import { useSearchParams } from "react-router-dom";

const namedUser = [
  "리룬지우", "C2X", "환이박사", "dprian", "린드블럼MVP"
]

const TipPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = searchParams.get("tab");

  const currentData = useMemo(() => {
    switch (activeTab) {
      case "newbie":
        return postData;
      case "2025":
      default:
        return tip2025data;
    }
  }, [activeTab]);

  const sortedPosts = useMemo(() => {
    return posts(currentData);
  }, [currentData]);

  return (
    <main>
      <h1>팁 모아보기</h1>
      <p>공식/컴투스프로야구 카페의 팁(분석/공략)을 확인하세요.</p>

      <Tabs
        value={activeTab}
        onChange={(key) => setSearchParams({ tab: key })}
        tabs={[
          { key: "2025", label: "2025년 팁 모아보기" },
          { key: "newbie", label: "뉴비 팁 모아보기" },
        ]}
      />

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

        {sortedPosts.map(post => (
          <tbody
            key={post.id}
            className={styles.group}
            onClick={() => window.open(post.url, "_blank")}
          >
          <tr>
            {post.tags.length === 0 ?
              <td className={styles.titleCell}>
                {post.title} {namedUser.includes(post.author) && (<span className={styles.star}>추천</span>)}
              </td>
              :
              <td className={styles.titleCell}>
                <div className={styles.titleRow}>
                  {post.title} {namedUser.includes(post.author) && (<span className={styles.star}>추천</span>)}
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
