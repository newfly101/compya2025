"use client";
import { useState } from "react";
import LoadMoreButton from "@/domains/notices/mobile/components/loadMoreButton/LoadMoreButton.jsx";
import styles from "@/domains/notices/mobile/containers/public/NoticeList.module.scss";

const PAGE_SIZE = 3; // 「더보기」 한 번에 늘어나는 개수

// 서버에서 그린 카드(children)를 전부 HTML 에 싣고, 아직 안 보여줄 것만 hidden 으로 가린다(크롤러 노출용).
const LoadMoreList = ({ children }) => {
  const [visible, setVisible] = useState(PAGE_SIZE);
  const items = Array.isArray(children) ? children : [children];
  return (
    <>
      <div className={styles.noticeList}>
        {items.map((child, i) => (
          <div key={child.key ?? i} hidden={i >= visible}>{child}</div>
        ))}
      </div>
      <LoadMoreButton remaining={items.length - visible} onClick={() => setVisible((v) => v + PAGE_SIZE)} />
    </>
  );
};

export default LoadMoreList;
