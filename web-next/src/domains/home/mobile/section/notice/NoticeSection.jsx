import Link from "next/link";
import styles from "./NoticeSection.module.scss";
import { noticeDetailPath } from "@/config/routePath.js";
import StateBox from "@/global/ui/mobile/stateBox/StateBox.jsx";

// 서버 컴포넌트 — 홈 통합 조회에서 받은 고정 공지 우선 3건. 로딩·오류는 페이지 단(throw)에서 처리된다.
const NoticeSection = ({ notices = [] }) => {
  if (notices.length === 0) return <StateBox status="empty" message="등록된 공지가 없습니다" compact />;

  return (
    <ul className={styles.noticeList}>
      {notices.map((notice) => (
        <li key={notice.id}>
          <Link href={noticeDetailPath(notice)} className={styles.item}>
            <span className={styles.dot} />
            <div className={styles.content}>
              <span className={styles.title}>{notice.title}</span>
              <span className={styles.sub}>{notice.summary}</span>
            </div>
            <span className={styles.date}>{notice?.publishedAt?.slice(0, 10)}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default NoticeSection;
